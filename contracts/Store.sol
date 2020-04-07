pragma solidity ^0.5.0;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./Marketplace.sol";

/**
 * @title Trademark Store
 * @dev The Trademark Store contract contains the information and functions to manage the trademark store.
 * @author Luis Videla
 */
contract Store is Ownable {

    address marketplaceAddress;

    string public name;

    // item handling. The trademark product or service.
    mapping(uint => Item) public items;
    uint public itemIterator;

    /// @dev Item struct that contains the properties of an item
    struct Item {
        uint id;
        string name;
        uint price;
        uint quantity;
        bool exists;
    }

    /**
     * Events
     */
    event AddedItem(uint indexed id, string name, uint price, uint quantity);
    event RemovedItem(uint indexed id);
    event ChangedPrice(uint indexed id, uint prevPrice, uint price);
    event BoughtItem(uint indexed id, address indexed buyer, uint quantity);
    event DeletedStore(address indexed addr, address indexed owner);
    event WithdrewFunds(address indexed addr, uint amount);

    /// @dev Throws is item does not exist
    modifier itemExists(uint _id) {
        require(items[_id].exists == true, "Nonexistent item.");
        _;
    }

    /// @dev Throws if Marketplace contract is paused
    modifier isNotPaused() {
        Marketplace m = Marketplace(marketplaceAddress);
        bool paused = m.paused();
        require(paused == false, "The Marketplace is paused");
        _;
    }

    /// @dev The Store contructor that sets up the properties for the opening of this trademark store
    constructor(address _owner, address _marketplaceAddr, string memory _name) public {
        // owner = _owner;
        transferOwnership (_owner);

        marketplaceAddress = _marketplaceAddr;
        name = _name;
        itemIterator = 0;
    }

    /**
     * @dev Gets the properties of the store
     * @return owner the Trademark Agent owner's address
     * @return marketplaceAddress The trademark marketplace address (which was used to deploy this Store)
     * @return name the Trademark Store's name
     * @return itemIterator The store's item count
     */
    function getValues() public view returns (address, address, string memory, uint) {
        return (owner(), marketplaceAddress, name, itemIterator);
    }

    /**
     * @dev Add an item to the store
     * @param _name Name of the item
     * @param _price Price of the item
     * @param _quantity Quantity of the item
     */
    function addItem(string memory _name, uint _price, uint _quantity) public onlyOwner isNotPaused {
        emit AddedItem(itemIterator, _name, _price, _quantity);
        items[itemIterator] = Item(itemIterator, _name, _price, _quantity, true);
        itemIterator = SafeMath.add(itemIterator, 1);
    }

    /**
     * @dev Remove an item from the store
     * @param _id The item's id
      */
    function removeItem(uint _id) public itemExists(_id) onlyOwner isNotPaused {
        emit RemovedItem(_id);
        delete items[_id];
    }

    /**
     * @dev Change the price of an item from the store
     * @param _id The item's id
     * @param _price The item's new price in wei
     */
    function changePrice(uint _id, uint _price) public itemExists(_id) onlyOwner isNotPaused {
        emit ChangedPrice(_id, items[_id].price, _price);
        items[_id].price = _price;
    }

    /**
     * @dev Buying an item from the store
     * @param _id The item's id
     * @param _quantity The quantity that the user wants to buy
     */
    function buyItem(uint _id, uint _quantity) public payable itemExists(_id) isNotPaused {
        require(items[_id].price <= msg.value, "Not enough ether.");
        require(items[_id].quantity >= _quantity, "We don't have that amount.");
        emit BoughtItem(_id, msg.sender, _quantity);
        items[_id].quantity = items[_id].quantity - _quantity;
    }

    /**
     * @dev Delete the store
     * @notice This is an external call, but will only accept calls made from the marketplace contract that created this
     * store. The marketplace contract has checks in place to make sure no malicious store owners will delete a store
     * that does not belong to them.
     */
    function deleteStore() external isNotPaused {
        // Verify that call is made from the marketplace contract
        require(msg.sender == marketplaceAddress, "You do not have permission to perform this action.");
        emit DeletedStore(address(this), owner());
        // cast to address(uint160) to make address payable
        selfdestruct(address(uint160(owner())));
    }

    /**
     * @dev Withdraw funds from the Store contract into the owner's address
     * @param _amount The amount of funds to withdraw in wei
     */
    function withdrawFunds(uint _amount) public onlyOwner {
        require(_amount <= address(this).balance, "You don't have you have enough ether.");
        emit WithdrewFunds(owner(), _amount);
        // cast to address(uint160) to make address payable
        address(uint160(owner())).transfer(_amount);
    }
}
