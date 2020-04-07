
require('dotenv').config();
var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = process.env["MNEMONIC"];
var infuraKey = process.env["INFURA_API_KEY"];
// Important:
// If you're using an HDWalletProvider, it must be Web3 1.0 enabled or your migration will hang.
// Create a .env file with MNEMONIC and INFURA_API_KEY, without quotes

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: `${__dirname}/src/contracts`,
  // If contract is 'too big' turning on the optimizer in your Truffle config will help; 
  // here's an example: https://truffleframework.com/docs/truffle/reference/configuration#solc
  solc: {
    optimizer: {
        enabled: true,
        runs: 1000
    },
  }, 
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*"
    },
    
    rinkeby: {
      //wrap provider in function to avoid crashing
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/" + infuraKey);
      },
      network_id: 4, //rinkeby test network
      gas: 4712388, // Gas limit used for deploys
      gasPrice: 1000000000
    }
  }
};
