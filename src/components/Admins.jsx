import React, { Component } from 'react'
import { List } from 'semantic-ui-react';
import * as _ from 'lodash';

class Admins extends Component {
  constructor(props) {
    super(props);

    this.state = {
      admins: [],
    }
  }

  componentDidMount() {
    if (_.has(this.props.instance, 'allEvents')) {
      this.getAdmins();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.instance !== prevProps.instance) {
      this.getAdmins();
    }
  }

  getAdmins() {
    const events = this.props.instance.allEvents({ fromBlock: 0, toBlock: 'latest' });

    events.get((error, logs) => {
      if (error) {
        console.error(error);
        return;
      }

      let admins = [];
      const adminEvents = logs.filter(log => log.event === 'AddedAdmin' || log.event === 'RemovedAdmin');

      adminEvents.forEach(event => {
        if (event.event === 'AddedAdmin') {
          admins.push(event.args.addr);
        } else if (event.event === 'RemovedAdmin') {
          admins = admins.filter(admin => admin !== event.args.addr);
        }
      });

      this.setState({ admins });
    })
  }

  render() {
    return (
      <div>
        <h2>Admin List</h2>
        <p>The following addresses are Admins (does not include the Trademark Marketplace owner):</p>
        <List>
        {
          this.state.admins.map(admin => (
            <List.Item key={admin}>{admin}</List.Item>
          ))
        }
        </List>
      </div>
    )
  }
}

export default Admins;
