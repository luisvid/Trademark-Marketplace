import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Card, Container, Divider, Form, Grid, Input } from 'semantic-ui-react';
import * as _ from 'lodash';

import StoreContract from '../contracts/Store.json';

class StoreManager extends Component {
  defaultState = {
    address: '',
    balance: 0,
    instance: null,
    inputItem: '',
    inputPrice: '',
    inputQuantity: '',
    itemIterator: 0,
    items: [],
    itemsPrice: {},
    marketplaceAddress: '',
    name: '',
    owner: '',
    triggerDelete: false,
    watchers: [],
    withdrawalInput: '',
  }

  constructor(props) {
    super(props);

    this.state = this.defaultState;

    this.addItem = this.addItem.bind(this);
    this.changeItemPrice = this.changeItemPrice.bind(this);
    this.deleteStore = this.deleteStore.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handlePriceChange = this.handlePriceChange.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.withdrawFunds = this.withdrawFunds.bind(this);
  }

  componentDidMount() {
    if (_.has(this.props.web3, 'currentProvider')) {
      this.instantiateContract();
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.web3 !== prevProps.web3
      || this.props.match.params.address !== prevProps.match.params.address
    ) {
      this.setState(this.defaultState);
      this.instantiateContract();
    }
  }

  componentWillUnmount() {
    this.state.watchers.forEach(watcher => watcher.stopWatching());
  }

  async instantiateContract() {
    try {
      const contract = require('truffle-contract');
      const store = contract(StoreContract);
      store.setProvider(this.props.web3.currentProvider);

      const instance = await store.at(this.props.match.params.address);

      this.setState({ instance });
      this.setWatchers();
      this.getDetails();
    } catch (e) {
      console.error(e);
    }
  }

  setWatchers() {
    const addItemEvents = this.state.instance.AddedItem({}, { fromBlock: 0, toBlock: 'latest' });
    const removeItemEvents = this.state.instance.RemovedItem({}, { fromBlock: 0, toBlock: 'latest' });
    this.setState({ watchers: [addItemEvents, removeItemEvents] });

    addItemEvents.watch((error, result) => {
      if (error) {
        console.error(error);
        return;
      }

      this.getDetails();
    });

    removeItemEvents.watch((error, result) => {
      if (error) {
        console.error(error);
        return;
      }

      this.getDetails();
    });
  }

  async getDetails() {
    try {
      if (this.props.accounts[0] !== await this.state.instance.owner()) {
        this.props.history.push('/');
        return;
      }

      const address = this.state.instance.address;
      const values = await this.state.instance.getValues.call();
      this.setState({
        address,
        itemIterator: values[3].toNumber(),
        marketplaceAddress: values[1],
        name: values[2],
        owner: values[0],
      })

      this.props.web3.eth.getBalance(this.state.address, (error, result) => {
        if (error) {
          console.error(error);
          return;
        }

        const balance = this.props.web3.fromWei(result.toString(), 'ether');

        this.setState({ balance })
      });

      this.getItems();
    } catch (e) {
      console.error(e);
    }
  }

  handleInputChange(event) {
    const name = event.target.name;
    this.setState({ [name]: event.target.value });
  }

  handlePriceChange(event) {
    const name = event.target.name;
    const value = event.target.value;
    this.setState(prevState => ({
      itemsPrice: { ...prevState.itemsPrice, [name]: value },
    }));
  }

  amountSold(id) {
    return new Promise((resolve, reject) => {
      this.state.instance.BoughtItem({ id }, { fromBlock: 0, toBlock: 'latest' })
        .get((error, logs) => {
          if (error) {
            console.error(error);
            return reject();
          }

          return resolve(logs);
        })
    })
  }

  async getItems() {
    try {
      let items = [];
      for (let i = 0; i < this.state.itemIterator; i++) {
        const values = await this.state.instance.items(i);

        if (!values[4]) {
          continue;
        }

        const purchases = await this.amountSold(values[0]);
        const sold = purchases
          .map(purchase => purchase.args.quantity.toNumber())
          .reduce((a, b) => a + b, 0);

        items.push({
          sold,
          id: values[0].toNumber(),
          name: values[1],
          price: values[2].toNumber(),
          quantity: values[3].toNumber(),
        });
      }

      this.setState({ items });
    } catch (e) {
      console.error(e);
    }
  }

  async addItem() {
    try {
      const wei = this.props.web3.toWei(this.state.inputPrice, 'ether');
      await this.state.instance.addItem(
        this.state.inputItem,
        wei,
        this.state.inputQuantity,
        { from: this.props.accounts[0] }
      );
    } catch (e) {
      console.error(e);
    } finally {
      this.setState({
        inputItem: '',
        inputPrice: '',
        inputQuantity: '',
      });
    }
  }

  async changeItemPrice(id) {
    try {
      const wei = this.props.web3.toWei(this.state.itemsPrice[id], 'ether');
      await this.state.instance.changePrice(id, wei, { from: this.props.accounts[0] });
    } catch (e) {
      console.error(e);
    }
  }

  async removeItem(id) {
    try {
      await this.state.instance.removeItem(id, { from: this.props.accounts[0] });
    } catch (e) {
      console.error(e);
    }
  }

  async withdrawFunds(amount) {
    try {
      const wei = this.props.web3.toWei(amount, 'ether');
      await this.state.instance.withdrawFunds(wei, { from: this.props.accounts[0] });
    } catch (e) {
      console.error(e);
    }
  }

  async deleteStore() {
    try {
      await this.props.marketplaceInstance.deleteStore(this.state.address, { from: this.props.accounts[0]});
    } catch (e) {
      console.error(e);
    } finally {
      this.props.history.push('/');
    }
  }

  displayItems(items) {
    return items.map(item => {
      const price = this.props.web3.fromWei(item.price, 'ether');
      return (
        <Card key={item.id}>
          <Card.Content>
            <Card.Header>{item.name}</Card.Header>
            <Card.Meta>{price} ETH</Card.Meta>
            <Card.Description>Quantity: {item.quantity} | Sold: {item.sold}</Card.Description>
          </Card.Content>
          <Card.Content extra>
            <Input fluid
              label={{ basic: true, content: 'ETH' }}
              labelPosition='right'
              name={item.id}
              onChange={this.handlePriceChange}
              placeholder='New Price'
              style={{ marginBottom: '10px' }}
            />
            <div className='ui two buttons'>
              <Button basic color='blue' onClick={() => this.changeItemPrice(item.id)}>
                Change Price
              </Button>
              <Button basic color='red' onClick={() => this.removeItem(item.id)}>
                Remove Item
              </Button>
            </div>
          </Card.Content>
        </Card>
      );
    })
  }

  render() {
    return (
      <Container>
        <div>
          <h1>Trademark Store Administration</h1>
          <Divider section />
          <div style={{ marginBottom: '10px' }}>
            <h3>Store Info</h3>
            <p><strong>Store Name:</strong> {this.state.name}</p>
            <p><strong>Store Address:</strong> <span className='monospace'>{this.state.address}</span></p>
            <p><strong>Owner:</strong> <span className='monospace'>{this.state.owner}</span></p>
            <p><strong>Balance:</strong> {this.state.balance} ETH</p>
          </div>

          <Grid columns={2}>
            <Grid.Column>
              <Form>
                <Form.Field>
                  <Button basic color='blue'
                    style={{ marginRight: '10px' }}
                    onClick={() => this.props.history.push(`/store/${this.state.address}`)}>
                    View Store
                  </Button>
                  <Button basic color='red' onClick={this.deleteStore}>Delete Store</Button>
                </Form.Field>
                {
                  this.state.balance > 0
                    ? <Form.Field>
                        <Input
                          label={{ basic: true, content: 'ETH' }}
                          labelPosition='right'
                          name='withdrawalInput'
                          onChange={this.handleInputChange}
                          placeholder='Withdrawal Amount'
                        />
                        <Button basic
                          disabled={this.state.balance <= 0}
                          onClick={() => this.withdrawFunds(this.state.withdrawalInput)}>
                          Withdraw Funds
                        </Button>
                      </Form.Field>
                    : ''
                }

              </Form>
            </Grid.Column>
          </Grid>
        </div>
        <Divider section />
        <Grid columns={2}>
          <Grid.Column>
            <h3>Add Item</h3>
            <Form>
              <Form.Field>
                <Input placeholder='Item name' name='inputItem' value={this.state.inputItem} onChange={this.handleInputChange} />
              </Form.Field>
              <Form.Field>
                <Input
                  label={{ basic: true, content: 'ETH' }}
                  labelPosition='right'
                  name='inputPrice'
                  onChange={this.handleInputChange}
                  placeholder='Price'
                  value={this.state.inputPrice}
                />
              </Form.Field>
              <Form.Field>
                <Input placeholder='Quantity' name='inputQuantity' value={this.state.inputQuantity} onChange={this.handleInputChange} />
              </Form.Field>
              <Button basic color='blue' onClick={this.addItem}>Add Item</Button>
            </Form>
          </Grid.Column>
        </Grid>
        <Divider section />
        <div>
          <h3>Inventory</h3>
          <Card.Group>
            {this.displayItems(this.state.items)}
          </Card.Group>
        </div>
      </Container>
    )
  }
}

export default withRouter(StoreManager);
