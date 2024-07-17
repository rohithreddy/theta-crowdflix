// SPDX-License-Identifier: MIT

// Compatible with OpenZeppelin Contracts ^5.0.0

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/manager/AccessManaged.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./MasterTicket.sol"; // Import MasterTicket from the same directory

contract TicketManager is Pausable, AccessManaged, ReentrancyGuard {
    // Struct to store ticket collection information
    struct TicketCollection {
        address ticketContract;
        uint256 projectId;
        uint256 price; // Add price for the ticket collection
    }

    // Mapping to store ticket collections and their associated project IDs
    mapping(uint256 => TicketCollection) public ticketCollections;

    // Address of the ERC721 ticket implementation contract
    address public immutable ticketImplementation;

    // Keep track of the total number of collections deployed
    uint256 public collectionCount;

    // Array to store collection addresses
    address[] public collectionAddresses;

    // Event emitted when a new ticket collection is created
    event TicketCollectionCreated(uint256 indexed projectId, address indexed ticketContract, uint256 price);

    constructor(address _ticketImplementation, address initialAuthority) AccessManaged(initialAuthority) {
        ticketImplementation = _ticketImplementation;
    }

    // Function to create a new ERC721 ticket collection clone
    function createTicketCollection(uint256 _projectId, address initialOwner, string memory _name, string memory _symbol, uint256 _price) public restricted whenNotPaused returns (address) {
        // Create a new clone of the ERC721 ticket implementation
        address payable ticketContract = payable(Clones.clone(ticketImplementation));

        // Store the ticket collection information
        ticketCollections[_projectId] = TicketCollection({
            ticketContract: ticketContract,
            projectId: _projectId,
            price: _price // Store the price
        });

        // Initialize the cloned contract
        // Cast to MasterTicket and call initialize
        MasterTicket(ticketContract).initialize(initialOwner, _name, _symbol, _price); // Initialize with the authority and price

        // Increment the collection count
        collectionCount++;

        // Add the collection address to the array
        collectionAddresses.push(ticketContract);

        // Emit an event to signal the creation of the ticket collection
        emit TicketCollectionCreated(_projectId, ticketContract, _price);

        return ticketContract;
    }

    // Function to get the ticket contract address for a given project ID
    function getTicketContractAddress(uint256 _projectId) public view returns (address) {
        return ticketCollections[_projectId].ticketContract;
    }

    // Function to get the price of a ticket collection
    function getTicketCollectionPrice(uint256 _projectId) public view returns (uint256) {
        return ticketCollections[_projectId].price;
    }

    // Function to pause the factory
    function pause() public restricted {
        _pause();
    }

    // Function to unpause the factory
    function unpause() public restricted {
        _unpause();
    }

    // Function to check if the factory is paused
    function isPaused() public view returns (bool) {
        return Pausable.paused();
    }

    //function to buy ticket from a collection based on project id
    function buyTicket(uint256 _projectId) public payable {
        // Get the ticket collection
        TicketCollection storage collection = ticketCollections[_projectId];

        // Check if the payment is sufficient
        require(msg.value >= collection.price, "Insufficient payment");

        // Cast the ticket contract address to MasterTicket (make it payable)
        MasterTicket ticketContract = MasterTicket(payable(collection.ticketContract)); 

        // Mint the ticket
        ticketContract.safeMint(msg.sender);
    }

    // Function to get existing collection addresses and details
    function getCollections() public view returns (TicketCollection[] memory) {
        TicketCollection[] memory collections = new TicketCollection[](collectionCount);
        for (uint256 i = 0; i < collectionCount; i++) {
            collections[i] = ticketCollections[i];
        }
        return collections;
    }
    receive() external payable {}
    //function to set BaseURI for a collection 
}
