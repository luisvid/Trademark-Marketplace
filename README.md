
# Online Trademark Marketplace DApp

An Online Trademark Marketplace that operates on the blockchain.
Project for the Celo Camp

The Trademak Marketplace is managed by a group of administrators. Admins allow Trademark Agents to add stores to the marketplace. Trademark Agents can manage their store’s inventory and funds. Clients can visit Trademark Stores and purchase products and services that are in stock using cryptocurrency.

The address that deploys the Trademak Marketplace contract will be the owner of the marketplace. The owner has the same abilities as admins, but are able to delete admins and execute the emergency stop function. 
The Owner can add addresses to the list of approved admins and users

## User Stories:

An administrator opens the web app. The web app reads the address and identifies that the user is an admin, showing them admin only functions. Can create and delete users, adding addresses to the list of approved Users. Can create and mange a Trademark Store, they can add/remove products and services to the storefront or change any of the products’ prices. 
They can also withdraw any funds that the Trademark Store has collected from sales.

An approved Trademark Agent logs into the app. The web app recognizes their address and identifies them as a Trademark Agent (store owner). They are shown the Trademark Agents functions. They can create a new storefront that will be displayed on the Trademark Marketplace. They can also see the storefronts that they have already created. They can click on a storefront to manage it. They can add/remove products and services from the storefront or change any of the items’ prices. They can also withdraw any funds that the store has collected from sales.

A Client logs into the app. The web app recognizes their address and identifies them as a Client. From the main page they can browse all of the storefronts that have been created in the Trademark Marketplace. Clicking on a storefront will take them to a product page. They can see a list of products and services offered by the store, including their price and quantity. 
Client can purchase a product, which will debit their account and send it to the store. If it is a product, the quantity of the item in the store inventory will be reduced by the appropriate quantity. Does not apply to services.
Items: 
1 - Credit (Cello Dollars vía Celo Wallet) The Credit is necessary to buy products and services in the  Trademark Store. After purchasing Credit, the user is added to the list of approved users.
2 - INPI registration. Start of process at INPI. After paying (with Celo currency) continue to the page to upload the document to IPFS and store the hash in the Trademark Contract. The counter is initialized to trigger "time" event (see block counter)


## Documentation 

Refer to:
[Avoiding Common Attacks](https://github.com/luisvid/Trademark-Marketplace/blob/master/avoiding_common_attacks.md) 
and
[Design Pattern Decisions](https://github.com/luisvid/Trademark-Marketplace/blob/master/design_pattern_desicions.md)

## Getting Started


### Prerequisites

What things you need to install the software and how to install them

    npm install -g ganache-cli
    npm install -g truffle
    
    **Note**: Ganache GUI can also be used
    **Note**: An .env file. must be created with MNEMONIC and INFURA_API_KEY

### Installing

Clone the repo:

    git clone https://github.com/luisvid/Trademark-Marketplace.git

Install dependencies:

    npm install

Run the server:

    npm start

It will open http://localhost:3000/

### Deploying the smart contract
Run Ganache to emulate an ethereum node:

    npm ganache-cli

Compile the contracts with Truffle

    truffle compile

Migrate the contracts

    truffle migrate

### Configuring MetaMask
To configure MetaMask please import the mnemonic that was generated from ganache-cli.

You will also need to change the network so that it is pointing to `localhost:8545` instead of pointing to the test or main nets.
**Note**: the port can vary depending on whether Ganache GUI or ganache-cli is used

### Testing
The tests that cover the solidity smart contracts are located at `./test`. To run the tests, simply run `truffle test`.

There are 5 tests each for the `Marketplace.sol` and `Store.sol` contracts.

**Note**: ganache-cli will need to be running in order for the tests to run

### TODO
Read the [TODO.txt](https://github.com/luisvid/Trademark-Marketplace/blob/master/TODO.txt) file
