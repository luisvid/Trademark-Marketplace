import React, { Component } from 'react'
import { List } from 'semantic-ui-react';
import * as _ from 'lodash';

class StoreOwners extends Component {
  constructor(props) {
    super(props);

    this.state = {
      storeOwners: [],
    }
  }

  componentDidMount() {
    if (_.has(this.props.instance, 'allEvents')) {
      this.getStoreOwners();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.instance !== prevProps.instance) {
      this.getStoreOwners();
    }
  }

  getStoreOwners() {
    const events = this.props.instance.allEvents({ fromBlock: 0, toBlock: 'latest' });

    events.get((error, logs) => {
      if (error) {
        console.error(error);
        return;
      }

      let storeOwners = [];
      const storeOwnerEvents = logs.filter(log => log.event === 'AddedStoreOwner' || log.event === 'RemovedStoreOwner');

      storeOwnerEvents.forEach(event => {
        if (event.event === 'AddedStoreOwner') {
          storeOwners.push(event.args.addr);
        } else if (event.event === 'RemovedStoreOwner') {
          storeOwners = storeOwners.filter(storeOwner => storeOwner !== event.args.addr);
        }
      });

      this.setState({ storeOwners });
    })
  }

  render() {
    return (
      <div>
        <h2>Trademark Agents List</h2>
        <p>The following addresses are Trademark Agents:</p>
        <List>
        {
          this.state.storeOwners.map(storeOwner => (
            <List.Item key={storeOwner}>{storeOwner}</List.Item>
          ))
        }
        </List>
      </div>
    )
  }
}

export default StoreOwners;
