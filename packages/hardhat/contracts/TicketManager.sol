// SPDX-License-Identifier: MIT

// Compatible with OpenZeppelin Contracts ^5.0.0

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/AccessControl.sol"; // Import AccessControl
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./MasterTicket.sol"; // Import MasterTicket from the same directory
import "./CrowdFlixVault.sol";

contract TicketManager is Pausable, AccessControl, ReentrancyGuard {
    bytes32 public constant LAUNCHPAD_ROLE = keccak256("LAUNCHPAD_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Struct to store ticket collection information
    struct TicketCollection {
        address ticketContract;
        uint256 projectId;
        uint256 price;  // Add price for the ticket collection
        string category;
        string title;
        uint256 ticketsSold; // Track tickets sold for this collection
    }

    // Mapping to store ticket collections and their associated project IDs
    mapping(uint256 => TicketCollection) private ticketCollections;

    // Address of the ERC721 ticket implementation contract
    address public immutable ticketImplementation;
    CrowdFlixVault public crowdFlixVault; 

    // Keep track of the total number of collections deployed
    uint256 public collectionCount;

    // Array to store collection addresses
    address[] public collectionAddresses;

    // Track total tickets sold across all collections
    uint256 public totalTicketsSold;

    // Event emitted when a new ticket collection is created
    event TicketCollectionCreated(uint256 indexed projectId, address indexed ticketContract, uint256 price);

    constructor(address _ticketImplementation, address launchPadAddress, address _crowdFlixVaultAddress) {
        ticketImplementation = _ticketImplementation;
        crowdFlixVault = CrowdFlixVault(_crowdFlixVaultAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(LAUNCHPAD_ROLE, launchPadAddress);
        _grantRole(PAUSER_ROLE, msg.sender);
    }

    // Function to create a new ERC721 ticket collection clone
    function createTicketCollection(uint256 _projectId, string memory _name, string memory _symbol, uint256 _price, string memory _category, string memory _title) public onlyRole(LAUNCHPAD_ROLE) whenNotPaused returns (address) {
        // Create a new clone of the ERC721 ticket implementation
        address ticketContract = Clones.clone(ticketImplementation);
        // console.log("Ticket Contract", ticketContract);
        // console.log("Reached ticketCollection ");
        // Store the ticket collection information
        ticketCollections[_projectId] = TicketCollection({
            ticketContract: ticketContract,
            projectId: _projectId,
            price: _price, // Store the price
            category: _category,
            title: _title,
            ticketsSold: 0 // Initialize ticketsSold to 0
        });
        // console.log("After ticket collections");

        // Initialize the cloned contract
        // Cast to MasterTicket and call initialize
        MasterTicket(ticketContract).initialize(address(this), _name, _symbol, _price); // Initialize with TicketManager address and price
        // console.log("After ticker collectoon Initializable");
        // Increment the collection count
        collectionCount++;

        // Add the collection address to the array
        collectionAddresses.push(ticketContract);

        // console.log("Pusged to to collectionAddresses");

        CrowdFlixVault(crowdFlixVault).createProjectVault(_projectId);

        // console.log("INIT Project vault");

        // Emit an event to signal the creation of the ticket collection
        emit TicketCollectionCreated(_projectId, ticketContract, _price);

        return address(ticketContract);
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
        require(msg.value == collection.price, "Insufficient payment");

        // Cast the ticket contract address to MasterTicket (make it payable)
        MasterTicket ticketContract = MasterTicket(collection.ticketContract); 

        // Mint the ticket
        ticketContract.safeMint(msg.sender);

        // Update tickets sold for the collection
        collection.ticketsSold++;

        // Update total tickets sold
        totalTicketsSold++;

        // Send the funds to the CrowdFlixVault
        crowdFlixVault.depositSaleFunds{value: msg.value}(_projectId);

        // Forward the payment to the payment contract
        // payable(collection.paymentContract).transfer(msg.value);
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

    // Function to get the number of tickets sold for a given project ID
    function getTicketsSold(uint256 _projectId) public view returns (uint256) {
        return ticketCollections[_projectId].ticketsSold;
    }

    receive() external payable {}
    //function to set BaseURI for a collection 
}
