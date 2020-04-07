pragma solidity ^0.5.0;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/lifecycle/Pausable.sol";

import "./Store.sol";

// Marketplace 	- TrademarkMarketplace
// Admins 	    - Admins
// Store Owner 	- Trademark Agents
// Store 		- Trademark Store

/**
 * @title Trademark Marketplace
 * @dev The Trademark Marketplace contract determines which addresses are the Admins and the Trademark Agent (store owners).
 * It is also allows Trademark Agents to open a Trademark Store using an external function from the Store contract.
 * Using a Trademark Agents address it can determine the stores that the Trademark Agents is in charge of
 * @author Luis Videla
 */
contract Marketplace is Ownable, Pausable {
    mapping(address => bool) public admins;
    mapping(address => bool) public storeOwners;
    mapping(address => Store[]) public stores;

    //
    //TODO: read the TODO.txt file
    //

    /**
     * Events
     */
    event AddedAdmin(address indexed addr);
    event RemovedAdmin(address indexed addr);
    event AddedStoreOwner(address indexed addr);
    event RemovedStoreOwner(address indexed addr);
    event AddedStore(address indexed owner, string name);
    event DeletedStore(address indexed addr, address indexed owner);

    /// @dev Throws if called by any account that isn't an Admin
    modifier onlyAdmin() {
        require(admins[msg.sender] == true, "You do not have permission to perform this action.");
        _;
    }

    /// @dev Throws if called by any account that isn't a Trademark Agent (store owner)
    modifier onlyStoreOwner() {
        require(storeOwners[msg.sender] == true, "You are not the owner of this store.");
        _;
    }

    /// @dev Throws if called by an account that isn't a Trademark Agents (store owner) of a particular Trademark Store
    modifier validStoreOwner() {
        bool exists = false;
        Store[] memory storeList = stores[msg.sender];
        for (uint i = 0; i < storeList.length; i++) {
            if (storeList[i].owner() == msg.sender) {
                exists = true;
            }
        }
        require(exists, "You are not the owner of this store.");
        _;
    }

    /// @dev The Marketplace constructor sets the sender as the owner of the contract
    /// and is added to the list of admins
    constructor() public {
        transferOwnership(msg.sender);
        admins[msg.sender] = true;
    }

    /**
     * @dev Adds an address to the admin mapping
     * @param _addr An address
     */
    function addAdmin(address _addr) public onlyAdmin whenNotPaused {
        emit AddedAdmin(_addr);
        admins[_addr] = true;
    }

    /**
     * @dev Sets admin status in the mapping to false
     * @param _addr An address
     */
    function removeAdmin(address _addr) public onlyOwner whenNotPaused {
        require(_addr != owner(), "You do not have permissions to remove an owner.");
        emit RemovedAdmin(_addr);
        admins[_addr] = false;
    }

    /**
     * @dev Adds an address to the store owner mapping
     * @param _addr An address
     */
    function addStoreOwner(address _addr) public onlyAdmin whenNotPaused {
        emit AddedStoreOwner(_addr);
        storeOwners[_addr] = true;
    }

    /**
     * @dev Sets admin status in the mapping to false
     * @param _addr An address
     */
    function removeStoreOwner(address _addr) public onlyAdmin whenNotPaused {
        emit RemovedStoreOwner(_addr);
        storeOwners[_addr] = false;
    }

    /**
     * @dev Gets the list of stores from the store mapping
     * @param _addr An address
     */
    function getStores(address _addr) public view returns (Store[] memory) {
        return stores[_addr];
    }

    /**
     * @dev Gets the store values
     * @param _store The contract address of a store
     */
    function getStoreValues(Store _store) public view returns (address, address, string memory, uint) {
        return _store.getValues();
    }

    /**
     * @dev Add a store
     * @param _name The store's name
     */
    function addStore(string memory _name) public onlyStoreOwner whenNotPaused returns (Store storeAddress) {
        emit AddedStore(msg.sender, _name);
        Store store = new Store(msg.sender, address(this), _name);
        Store[] memory existingStores = stores[msg.sender];
        Store[] memory storeList = new Store[](existingStores.length + 1);

        for (uint i = 0; i < existingStores.length; i++) {
            storeList[i] = existingStores[i];
        }

        storeList[storeList.length - 1] = store;

        stores[msg.sender] = storeList;
        return store;
    }

    /**
     * @dev Deletes a store
     * @notice The actual deletion happens using an external call in the Store contract
     * @param _addr The store's address
     */
    function deleteStore(address _addr) public validStoreOwner whenNotPaused {
        emit DeletedStore(_addr, msg.sender);
        Store[] memory existingStores = stores[msg.sender];
        Store[] memory storeList = new Store[](existingStores.length - 1);
        uint counter = 0;

        for (uint i = 0; i < existingStores.length; i++) {
            if (address(existingStores[i]) != _addr) {
                storeList[counter] = existingStores[i];
                counter++;
            }
        }

        stores[msg.sender] = storeList;
        Store(_addr).deleteStore();
    }

}
