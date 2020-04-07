# Design Patterns

Here are the design patterns that I have implemented in my smart contracts:

 - [Fail Early and Fail Loud](#fail-early-and-fail-loud)
 - [Restricting Access](#restricting-access)
 - [Mortal](#mortal)
 - [Pull Over Push Payments](#pull-over-push-payments)
 - [Circuit Breaker](#circuit-breaker)

For the implementation of some of these design patterns I have used OpenZepplin's [OpenZeppelin Solidity](https://github.com/OpenZeppelin/openzeppelin-solidity) library, which contains secure, community-audited smart contract security patterns.

## Smart Contracts
My dapp consists of two smart contracts:

 1. [Marketplace.sol](https://github.com/luisvid/ConsenSys-Academy-bootcamp-2019-Final-Project/blob/master/contracts/Marketplace.sol)
 2. [Store.sol](https://github.com/luisvid/ConsenSys-Academy-bootcamp-2019-Final-Project/blob/master/contracts/Store.sol)

The Marketplace smart contract contains the state of admins, store owners, and how many stores a store owner has. The Store smart contract contains the store's properties and manages the store's items. When a user wants to open a store, she can do it by making a call to the `addStore` function in the Marketplace contract. If successful, then the Marketplace contract will deploy a Store contract address.

## Fail Early and Fail Loud
I have used modifiers and the `require` function to make sure that certain conditions are valid before the logic in the rest of the function starts. Using the `require` function to catch errors, instead of failing silently, is pretty handy because MetaMask is able to detect when a transaction would fail. Also gas won't be wasted running unnecessary computations.

## Restricting Access
Because the Marketplace contract contains two special types of users (admins and store owners), there are mappings and modifiers in place to verify that certain functions can only be executed by these users.

I have also used OpenZepplin's [Ownable](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/ownership/Ownable.sol) smart contract in order to manage the owner of the marketplace contract, which is the address that deploys the Marketplace contract, and the owner of a store, which is the address of the user who opens a store.

## Mortal
The Store contract implements the mortal design pattern. When a store is deleted, the Store contract will execute the `selfdestruct(owner)` function with the owner as the parameter. It is important that only the store owner (and not just any store owner!) who is the `owner` of the store is able to delete the store.

## Pull Over Push Payments
Because store has its own contract addresses, they hold the funds from any purchases that are made from a buyer. The store's owner is able to use the `withdrawFunds` function in order to withdraw the funds from the store contract.

## Circuit Breaker
In the case that the contract functionality needs to be stopped, there is a circuit breaker that has been implemented. OpenZepplin has a [Pausable](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/lifecycle/Pausable.sol) smart contract that makes the circuit breaker implementation easy.

