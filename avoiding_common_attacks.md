# Avoiding Common Attacks
Smart contract security is not easy. Many attacks on smart contracts have caused millions of dollars of ether lost or stolen. However, there are best practices to follow and here are some that I have implemented in my smart contract design:

 - [Preventing Integer Overflow](#preventing-integer-overflow)
 - [Validating User Input](#validating-user-input)
 - [Limiting User Power](#limiting-user-power)

## Preventing Integer Overflow
Integer overflow can cause unexpected values when performing a simple arithmetic function like addition. In order to prevent the case of an integer overflow, I used the SafeMath library from OpenZeppelin. The SafeMath library is an easy way to perform math operations that will revert if an integer overflow were to occur.

## Validating User Input
User inputs can cause errors or unexpected things to happen if they are not validated. Whether a typo or someone trying to perform something malicious, like withdrawing extra ether from a contract, all user inputs need to be verified. In my smart contracts, I have used `require` functions to make sure that the user is trying to submit a valid value. If the value is not valid, then an error is thrown and the transaction cannot proceed.

## Limiting User Power
In the `Marketplace` contract, there are two special types of users. One being admins, the other being store owners. Shoppers are just regular users who have an address that is not specified in neither the `admins` nor the `storeOwners` mapping.

Admins are able to create other admins and store owners, but they are not able to delete other admins. Only the user who has deployed the `Marketplace` contract is able to delete other admins. In a truly decentralized application, perhaps there would be no admins, but users would apply with a fee, to become a store owner - though there will need to be some kind of interesting governance in place to make sure the marketplace stay ethical.

Store owners are have complete of their own store - especially when it comes to the funds of the stores. They do not have the abilities that the admins have because admins functions are protected by using modifiers.

The user who deploys the `Marketplace` contract is also an admin by default, but also has access to a couple of privileges that regular admins don't get. One is the ability to delete admins. The other is the ability to execute the emergency stop for the marketplace - and all store contracts that are created by the marketplace. The emergency stop function prevents any action from happening except for allowing store owner to withdraw funds from their stores.
