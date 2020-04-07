import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import { Button, Divider, Input } from 'semantic-ui-react';

import BasicModal from './BasicModal';

class AdminPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      adminAddress: '',
      header: '',
      message: '',
      open: false,
      storeOwnerAddress: '',
    }

    this.addAdmin = this.addAdmin.bind(this);
    this.addStoreOwner = this.addStoreOwner.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleAdminAddress = this.handleAdminAddress.bind(this);
    this.handleStoreOwnerAddress = this.handleStoreOwnerAddress.bind(this);
    this.pause = this.pause.bind(this);
    this.removeAdmin = this.removeAdmin.bind(this);
    this.removeStoreOwner = this.removeStoreOwner.bind(this);
    this.unpause = this.unpause.bind(this);
  }

  handleAdminAddress(event) {
    this.setState({ adminAddress: event.target.value });
  }

  handleStoreOwnerAddress(event) {
    this.setState({ storeOwnerAddress: event.target.value });
  }

  closeModal() {
    this.setState({
      open: false,
      header: '',
      message: '',
    });
  }

  async addAdmin() {
    try {
      await this.props.instance.addAdmin(this.state.adminAddress, { from: this.props.accounts[0] });
      this.setState({ adminAddress: '' });
    } catch (e) {
      console.error(e);
    }
  }

  async removeAdmin() {
    try {
      await this.props.instance.removeAdmin(this.state.adminAddress, { from: this.props.accounts[0] });
      this.setState({ adminAddress: '' });
    } catch (e) {
      console.error(e);
      if (
        String(e).includes('base fee exceeds gas limit')
        || String(e).includes('out of gas')
      ) {
        this.setState({
          open: true,
          header: 'Not enough gas',
          message: 'Please increase the gas limit. There might be an issue with the estimateGas function in ganache-cli'
        })
      }
    }
  }

  async addStoreOwner() {
    try {
      await this.props.instance.addStoreOwner(this.state.storeOwnerAddress, { from: this.props.accounts[0] });
      this.setState({ storeOwnerAddress: '' });
    } catch (e) {
      console.error(e);
    }
  }

  async removeStoreOwner() {
    try {
      await this.props.instance.removeStoreOwner(this.state.storeOwnerAddress, { from: this.props.accounts[0] });
      this.setState({ storeOwnerAddress: '' });
    } catch (e) {
      console.error(e);
      if (
        String(e).includes('base fee exceeds gas limit')
        || String(e).includes('out of gas')
      ) {
        this.setState({
          open: true,
          header: 'Not enough gas',
          message: 'Please increase the gas limit. There might be an issue with the estimateGas function in ganache-cli'
        })
      }
    }
  }

  async pause() {
    try {
      await this.props.instance.pause({ from: this.props.accounts[0] });
    } catch (e) {
      console.error(e);
    }
  }

  async unpause() {
    try {
      await this.props.instance.unpause({ from: this.props.accounts[0] });
    } catch (e) {
      console.error(e);
    }
  }

  displayEmergencyStop() {
    if (this.props.accounts[0] === this.props.contractOwner) {
      return this.props.paused
        ? (
            <div>
              <h2>Emergency Stop (active)</h2>
              <p>Contract is paused. Unpause to allow users to resume transactions</p>
              <Button color='green' onClick={this.unpause}>UNPAUSE</Button>
            </div>
          )
        : (
            <div>
              <h2>Emergency Stop</h2>
              <p>Pauses contract. Stops all users from all actions except for Trademark Agents to withdraw funds</p>
              <Button color='red' onClick={this.pause}>PAUSE</Button>
            </div>
          );
    }

    return;
  }

  render() {
    return (
      <div>
        <BasicModal open={this.state.open} header={this.state.header} message={this.state.message} close={() => this.closeModal()}  />
        <h1>Admin Panel</h1>
        <Divider section />
        <h2>Manage Admins</h2>
        <div>
          <Input placeholder='Address' value={this.state.adminAddress} onChange={this.handleAdminAddress} />
        </div>
        <div>
          <Button basic color='green' onClick={this.addAdmin}>Add Admin</Button>
          {
            this.props.contractOwner === this.props.accounts[0]
              ? <Button basic color='red' onClick={this.removeAdmin}>Remove Admin</Button>
              : ''
          }
        </div>
        <div>
          <Link to='/admins'>View Admins</Link>
        </div>
        <Divider section />
        <h2>Manage Trademark Agents</h2>
        <div>
          <Input placeholder='Address' value={this.state.storeOwnerAddress} onChange={this.handleStoreOwnerAddress} />
        </div>
        <div>
          <Button basic color='green' onClick={this.addStoreOwner}>Add Trademark Agent</Button>
          <Button basic color='red' onClick={this.removeStoreOwner}>Remove Trademark Agent</Button>
        </div>
        <div>
          <Link to='/store-owners'>View Trademark Agents</Link>
        </div>
        <Divider section />
        {this.displayEmergencyStop()}
      </div>
    )
  }
}

export default AdminPanel;
