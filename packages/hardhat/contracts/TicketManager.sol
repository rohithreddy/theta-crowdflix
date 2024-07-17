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

    // Event emitted when a new ticket collection is created
    event TicketCollectionCreated(uint256 indexed projectId, address indexed ticketContract, uint256 price);
    
    uint256 public completeCount;

    constructor(address _ticketImplementation, address initialAuthority) AccessManaged(initialAuthority) {
        ticketImplementation = _ticketImplementation;
    }

    // Function to create a new ERC721 ticket collection clone
    function createTicketCollection(uint256 _projectId, address initialAuthority, string memory _name, string memory _symbol, uint256 _price) public restricted whenNotPaused returns (address) {
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
        // MasterTicket(ticketContract).initialize(initialAuthority, _name, _symbol, _price); // Initialize with the authority and price

        // Emit an event to signal the creation of the ticket collection
        emit TicketCollectionCreated(_projectId, ticketContract, _price);
        completeCount++;
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

    // Function to update the price of an existing ticket collection
    function updateTicketCollectionPrice(uint256 _projectId, uint256 _newPrice) public restricted {
        require(_projectId < completeCount, "Invalid project ID");
        TicketCollection storage collection = ticketCollections[_projectId];
        collection.price = _newPrice;

        // Update the price on the MasterTicket contract
        MasterTicket(collection.ticketContract).setPrice(_newPrice);
    }

    // Function to pause the factory
    function pause() public restricted {
        _pause();
    }

    // Function to unpause the factory
    function unpause() public restricted {
        _unpause();
    }
}
