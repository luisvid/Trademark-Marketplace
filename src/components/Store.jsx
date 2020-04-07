import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Divider, Header, Input } from 'semantic-ui-react';
import * as _ from 'lodash';

import StoreContract from '../contracts/Store.json';

class Store extends Component {
  defaultState = {
    address: '',
    instance: null,
    itemIterator: 0,
    items: [],
    itemsInput: {},
    name: '',
    owner: '',
  }

  constructor(props) {
    super(props);

    this.state = this.defaultState;

    this.buyItem = this.buyItem.bind(this);
    this.handleItemInputChange = this.handleItemInputChange.bind(this);
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

  async instantiateContract() {
    try {
      const contract = require('truffle-contract');
      const store = contract(StoreContract);
      store.setProvider(this.props.web3.currentProvider);

      const instance = await store.at(this.props.match.params.address);

      this.setState({ instance })
      this.getDetails();
    } catch (e) {
      console.error(e);
    }
  }

  async getDetails() {
    try {
      const address = this.state.instance.address;
      const values = await this.state.instance.getValues.call();

      this.setState({
        address,
        itemIterator: values[3].toNumber(),
        name: values[2],
        owner: values[0],
      });

      this.getItems();
    } catch (e) {
      console.error(e);
    }
  }

  async getItems() {
    try {
      for (let i = 0; i < this.state.itemIterator; i++) {
        const values = await this.state.instance.items(i);

        if (!values[4]) {
          continue;
        }

        const item = {
          id: values[0],
          name: values[1],
          price: values[2].toNumber(),
          quantity: values[3].toNumber(),
        };

        this.setState(prevState => ({
          items: [...prevState.items, item],
          itemsInput: {...prevState.itemsInput, [values[0].toString()]: ''},
        }));
      }
    } catch (e) {
      console.error(e);
    }
  }

  async buyItem(price, id) {
    try {
      const quantity = this.state.itemsInput[id];
      const value = price * quantity;
      await this.state.instance.buyItem(id, this.state.itemsInput[id], { from: this.props.accounts[0], value });
    } catch (e) {
      console.error(e);
    }
  }

  handleItemInputChange(event) {
    const name = event.target.name;
    const value = event.target.value;

    this.setState(prevState => ({
      itemsInput: {...prevState.itemsInput, [name]: value },
    }));
  }

  displayItems(items) {
    return items.map(item => {
      const price = this.props.web3.fromWei(item.price, 'ether');
      return (
        <Card key={item.id.toString()}>
          <Card.Content>
            <Card.Header>{item.name}</Card.Header>
            <Card.Meta>{price} ETH</Card.Meta>
            <Card.Description>Quantity: {item.quantity}</Card.Description>
          </Card.Content>
          <Card.Content extra>
            <Input
              name={item.id.toString()}
              onChange={this.handleItemInputChange}
              placeholder='Quantity'
            />
            <Button basic color='green' onClick={() => this.buyItem(item.price, item.id.toString())}>
              Buy
            </Button>
          </Card.Content>
        </Card>
      );
    })
  }

  render() {
    return (
      <div>
        <div>
          <Header as='h1'>{this.state.name}</Header>
          {
            this.state.owner === this.props.accounts[0]
              ? <Link to={`/manage/${this.state.address}`}><Button basic>Manage Trademark Store</Button></Link>
              : ''
          }
        </div>
        <Divider section />
        <h3>Available Services:</h3>
        <Card.Group>
          {this.displayItems(this.state.items)}
        </Card.Group>
      </div>
    )
  }
}

export default Store;
