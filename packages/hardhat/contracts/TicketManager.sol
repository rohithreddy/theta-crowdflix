// SPDX-License-Identifier: MIT

// Compatible with OpenZeppelin Contracts ^5.0.0

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/AccessControl.sol"; // Import AccessControl
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./MasterTicket.sol"; // Import MasterTicket from the same directory

contract TicketManager is Pausable, AccessControl, ReentrancyGuard {
    bytes32 public constant DAO_CONTROLLER_ROLE = keccak256("DAO_CONTROLLER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Struct to store ticket collection information
    struct TicketCollection {
        address ticketContract;
        uint256 projectId;
        uint256 price;  // Add price for the ticket collection
        string category;
        string title;
        uint256 ticketsSold; // Track tickets sold for this collection
        address paymentContract; // Address of the payment contract
    }

    // Mapping to store ticket collections and their associated project IDs
    mapping(uint256 => TicketCollection) private ticketCollections;

    // Address of the ERC721 ticket implementation contract
    address public immutable ticketImplementation;

    // Keep track of the total number of collections deployed
    uint256 public collectionCount;

    // Array to store collection addresses
    address[] public collectionAddresses;

    // Track total tickets sold across all collections
    uint256 public totalTicketsSold;

    // Event emitted when a new ticket collection is created
    event TicketCollectionCreated(uint256 indexed projectId, address indexed ticketContract, uint256 price, address paymentContract);

    constructor(address _ticketImplementation, address initialAuthority) {
        ticketImplementation = _ticketImplementation;
        _grantRole(DEFAULT_ADMIN_ROLE, initialAuthority);
        _grantRole(DAO_CONTROLLER_ROLE, initialAuthority);
        _grantRole(PAUSER_ROLE, initialAuthority);
    }

    // Function to create a new ERC721 ticket collection clone
    function createTicketCollection(uint256 _projectId, string memory _name, string memory _symbol, uint256 _price, string memory _category, string memory _title, address _paymentContract) public onlyRole(DAO_CONTROLLER_ROLE) whenNotPaused returns (address) {
        // Create a new clone of the ERC721 ticket implementation
        address ticketContract = Clones.clone(ticketImplementation);

        // Store the ticket collection information
        ticketCollections[_projectId] = TicketCollection({
            ticketContract: ticketContract,
            projectId: _projectId,
            price: _price, // Store the price
            category: _category,
            title: _title,
            ticketsSold: 0, // Initialize ticketsSold to 0
            paymentContract: _paymentContract // Store the payment contract address
        });

        // Initialize the cloned contract
        // Cast to MasterTicket and call initialize
        MasterTicket(ticketContract).initialize(address(this), _name, _symbol, _price); // Initialize with TicketManager address and price

        // Increment the collection count
        collectionCount++;

        // Add the collection address to the array
        collectionAddresses.push(ticketContract);

        // Emit an event to signal the creation of the ticket collection
        emit TicketCollectionCreated(_projectId, ticketContract, _price, _paymentContract);

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
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    // Function to unpause the factory
    function unpause() public onlyRole(PAUSER_ROLE) {
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
        MasterTicket ticketContract = MasterTicket(collection.ticketContract); 

        // Mint the ticket
        ticketContract.safeMint(msg.sender);

        // Update tickets sold for the collection
        collection.ticketsSold++;

        // Update total tickets sold
        totalTicketsSold++;

        // Forward the payment to the payment contract
        payable(collection.paymentContract).transfer(msg.value);
    }

    // Function to get existing collection addresses and details
    function getCollections() public view returns (TicketCollection[] memory) {
        TicketCollection[] memory collections = new TicketCollection[](collectionCount);
        for (uint256 i = 0; i < collectionCount; i++) {
            collections[i] = ticketCollections[i];
        }
        return collections;
    }
    // Function to get ticket collections by category 
    function getCollectionsByCategory(string memory _category) public view returns (TicketCollection[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < collectionCount; i++) {
            if (keccak256(bytes(ticketCollections[i].category)) == keccak256(bytes(_category))) {
                count++;
            }
        }

        TicketCollection[] memory collections = new TicketCollection[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < collectionCount; i++) {
            if (keccak256(bytes(ticketCollections[i].category)) == keccak256(bytes(_category))) {
                collections[index] = ticketCollections[i];
                index++;
            }
        }

        return collections;
    }

    receive() external payable {}
    //function to set BaseURI for a collection 
}
