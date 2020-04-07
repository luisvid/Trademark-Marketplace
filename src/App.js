import React, { Component } from 'react'
import { BrowserRouter , Link, Route } from 'react-router-dom';
import { Container, Grid, Menu, Message } from 'semantic-ui-react'

import MarketplaceContract from './contracts/Marketplace.json'
import getWeb3 from './utils/getWeb3'
import './App.css';

import AdminPanel from './components/AdminPanel';
import Admins from'./components/Admins';
import Store from './components/Store';
import StoreManager from './components/StoreManager';
import ShopperPanel from './components/ShopperPanel';
import StoreList from './components/StoreList';
import StoreOwnerPanel from './components/StoreOwnerPanel';
import StoreOwners from './components/StoreOwners';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      accounts: [],
      activeAccount: '',
      currentAccount: '',
      contractOwner: '',
      instance: null, // if multiple contracts, then this can be object of instances
      logs: [],
      paused: false,
      storeOwners: [],
      userType: '',
      watchers: [],
      web3: null,
    };
  }

  async componentWillMount() {
    // Get the web3 instance.
    try {
      
      const web3 = await getWeb3();
      
      console.log(web3);

      //only to test web3 its working retrieving an hardcoded account address
      // results.web3.eth.getBalance("0x7ee6f3951d5c21c7a5672d0e866c6cb19f7e7e86", (error, result) => {
      //   console.log("balance account(0x7ee6f3951d5c21c7a5672d0e866c6cb19f7e7e86) = " + result)});

      this.setState({ web3: web3 });
      this.instantiateContract();
    } catch (e) {
      console.error(`Error finding web3: ${e}`);
    }
  }

  componentWillUnmount() {
    this.state.watchers.forEach(watcher => watcher.stopWatching());
  }

  async instantiateContract() {
    
    const contract = require('truffle-contract');
    const marketplace = contract(MarketplaceContract);
    marketplace.setProvider(this.state.web3.currentProvider);

    const accounts = this.state.web3.eth.accounts;

    console.log("instantiateContract.accounts" + accounts);

    const instance = await marketplace.deployed();
    const contractOwner = await instance.owner.call();
    this.setState({
      accounts,
      blockNumber: 0,
      contractOwner,
      instance,
      currentAccount: accounts[0],
    });

    this.determineUserType();
    this.checkPausedContract();
    this.accountWatcher();
    // this.eventWatchers();
  }

  accountWatcher() {
    setInterval(() => {
      if (this.state.web3.eth.accounts[0] !== this.state.currentAccount) {
        window.location.reload();
      }
    }, 1000)
  }

  eventWatchers() {
    this.state.web3.eth.getBlockNumber((error, result) => {
      if (error) {
        console.error(error);
        return;
      }

      this.setState({ blockNumber: result })
    })

    const pauseEvents = this.state.instance.Pause({}, { fromBlock: 0, toBlock: 'latest' });
    const unpauseEvents = this.state.instance.Unpause({}, { fromBlock: 0, toBlock: 'latest' });

    pauseEvents.watch((error, log) => {
      if (error) {
        console.error(error);
        return;
      }

      if (this.state.blockNumber < log.blockNumber) {
        window.location.reload();
      }
    })

    unpauseEvents.watch((error, log) => {
      if (error) {
        console.error(error);
        return;
      }

      if (this.state.blockNumber < log.blockNumber) {
        window.location.reload();
      }
    })

    this.setState({ watchers: [pauseEvents, unpauseEvents] });
  }

  async determineUserType() {
    try {
      const admin = await this.state.instance.admins.call(this.state.accounts[0]);
      const storeOwner = await this.state.instance.storeOwners.call(this.state.accounts[0]);

      if (admin) {
        this.setState({ userType: 'admin' });
      } else if (storeOwner) {
        this.setState({ userType: 'storeOwner' });
      } else {
        this.setState({ userType: 'shopper' });
      }
    } catch (e) {
      this.setState({ userType: 'shopper' });
      console.error(e);
    }
  }

  async checkPausedContract() {
    try {
      const paused = await this.state.instance.paused.call();
      this.setState({ paused });
    } catch (e) {
      console.error(e);
    }
  }

  displayPausedBanner() {
    if (this.state.paused) {
      return (
        <Message negative>
          <Message.Header>Contract is paused</Message.Header>
          <p>Please ask the Marketplace owner to unpause. Store owners are still able to withdraw funds from their store contracts.</p>
        </Message>
      )
    }

    return;
  }

  displayPanel() {
    if (this.state.userType === 'admin') {
      return <AdminPanel
        accounts={this.state.accounts}
        contractOwner={this.state.contractOwner}
        instance={this.state.instance}
        paused={this.state.paused}
      />;
    } else if (this.state.userType === 'storeOwner') {
      return <StoreOwnerPanel
        accounts={this.state.accounts}
        instance={this.state.instance}
      />
    } else if (this.state.userType === 'shopper') {
      return <ShopperPanel
        accounts={this.state.accounts}
        instance={this.state.instance}
        web3={this.state.web3}
      />
    }

    return;
  }

  render() {
    return (
      <BrowserRouter>
        <div>
          <Menu pointing secondary>
            <Link to='/'>
              <Menu.Item name='Home' />
            </Link>
            <Link to='/admins'>
              <Menu.Item name='Admins' />
            </Link>
            <Link to='/store-owners'>
              <Menu.Item name='Trademark Agents' />
            </Link>
          </Menu>

          <Container>
            {this.displayPausedBanner()}
            <Grid columns={2}>
              <Grid.Column width={6}>
                {this.displayPanel()}
              </Grid.Column>
              <Grid.Column width={10}>
                <Route exact path='/'
                  render={() => <StoreList
                    accounts={this.state.accounts}
                    instance={this.state.instance}
                    web3={this.state.web3}
                  />}
                />
                <Route path='/admins'
                  render={() => <Admins
                    instance={this.state.instance}
                  />}
                />
                <Route path='/manage/:address'
                  render={(props) => <StoreManager
                    {...props}
                    accounts={this.state.accounts}
                    marketplaceInstance={this.state.instance}
                    web3={this.state.web3}
                  />}
                />
                <Route path='/store/:address'
                  render={(props) => <Store
                    {...props}
                    accounts={this.state.accounts}
                    web3={this.state.web3}
                  />}
                />
                <Route path='/store-owners'
                  render={() => <StoreOwners
                    instance={this.state.instance}
                  />}
                />
              </Grid.Column>
            </Grid>
          </Container>
        </div>
      </BrowserRouter>
    );
  }
}
