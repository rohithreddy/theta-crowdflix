// SPDX-License-Identifier: MIT

// Compatible with OpenZeppelin Contracts ^5.0.0

pragma solidity ^0.8.20;


/// @custom:security-contact crash@web108.xyz
import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ITicketManager.sol"; // Import ITicketManager
import "./CrowdFlixVault.sol"; // Import CrowdFlixVault

contract LaunchPad is Pausable, AccessControl, ReentrancyGuard {
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE"); // Renamed DAO_GOVERNER_ROLE to PROPOSER_ROLE
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    enum ProjectStatus {
        InProgress,
        Success,
        Fail
    }

    struct Project {
        string name;
        string description;
        uint256 fundingGoal;
        uint256 startTime;
        uint256 endTime;
        address teamWallet; // Added teamWallet variable
        uint256 totalFunded;
        bool isActive;
        address[] contributors; // Array to store contributor addresses
        address creator; // Added project creator address
        uint256 profitSharePercentage; // Percentage of profits to distribute to contributors
        string category; // Added category
        ProjectStatus status; // Added project status
        address ticketCollection; // Add ticket collection address
    }

    mapping(uint256 => Project) public projects;
    uint256 public projectCount;

    IERC20 public fundingToken;

    // Track investments
    mapping(uint256 => mapping(address => uint256)) public projectInvestments;


    // Address of the TicketManager contract
    ITicketManager public ticketManager; // Use the interface
    CrowdFlixVault public crowdFlixVault; // Add CrowdFlixVault instance

    event ProjectCreated(uint256 indexed projectId, string name, uint256 fundingGoal, uint256 startTime, uint256 endTime, address teamWallet, address creator, uint256 profitSharePercentage, string category);
    event Contributed(uint256 indexed projectId, address indexed contributor, uint256 amount);
    event Withdrawn(uint256 indexed projectId, address indexed recipient, uint256 amount);
    event ProjectFinalized(uint256 indexed projectId, bool success);
    event ProfitSharePercentageUpdated(uint256 indexed projectId, uint256 newPercentage);
    event TicketsSoldUpdated(uint256 indexed projectId, uint256 newTicketsSold);
    event TicketManagerInitialized(address ticketManagerAddress); // Event for TicketManager initialization
    event CrowdFlixVaultInitialized(address crowdFlixVaultAddress); // Event for CrowdFlixVault initialization

    constructor(IERC20 _fundingToken, address _initialAdmin, address _initialProposer, address _initialPauser) {
        fundingToken = _fundingToken;
        _grantRole(DEFAULT_ADMIN_ROLE, _initialAdmin);
        _grantRole(PROPOSER_ROLE, _initialProposer); // Changed DAO_GOVERNER_ROLE to PROPOSER_ROLE
        _grantRole(PAUSER_ROLE, _initialPauser);
    }

    // Function to initialize the TicketManager contract
    function initializeTicketManager(address _ticketManagerAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(ticketManager) == address(0), "TicketManager already initialized");
        ticketManager = ITicketManager(_ticketManagerAddress);
        emit TicketManagerInitialized(_ticketManagerAddress);
    }

    // Function to initialize the CrowdFlixVault contract
    function initializeCrowdFlixVault(address _crowdFlixVaultAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(crowdFlixVault) == address(0), "CrowdFlixVault already initialized");
        crowdFlixVault = CrowdFlixVault(_crowdFlixVaultAddress);
        emit CrowdFlixVaultInitialized(_crowdFlixVaultAddress);
    }

    function createProject(
        string memory _name,
        string memory _description,
        uint256 _fundingGoal,
        uint256 _startTime,
        uint256 _endTime,
        address _teamWallet, // Added teamWallet parameter
        address _creator,
        uint256 _profitSharePercentage, // Added profitSharePercentage parameter
        string memory _category // Added category parameter
    ) public onlyRole(PROPOSER_ROLE) { // Changed DAO_GOVERNER_ROLE to PROPOSER_ROLE
        require(_startTime >= block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");
        require(_teamWallet != address(0), "Team wallet cannot be zero address"); // Check teamWallet is not zero address
        require(_profitSharePercentage <= 90, "Profit share percentage cannot exceed 90%");
        require(address(ticketManager) != address(0), "TicketManager not initialized"); // Check if TicketManager is initialized
        require(address(crowdFlixVault) != address(0), "CrowdFlixVault not initialized"); // Check if CrowdFlixVault is initialized

        uint256 projectId = projectCount;
        projects[projectId] = Project({
            name: _name,
            description: _description,
            fundingGoal: _fundingGoal,
            startTime: _startTime,
            endTime: _endTime,
            totalFunded: 0,
            isActive: true,
            teamWallet: _teamWallet, // Assign teamWallet
            contributors: new address[](0), // Initialize contributors array
            creator: _creator, // Store the creator address
            profitSharePercentage: _profitSharePercentage, // Assign profitSharePercentage
            category: _category, // Assign category
            status: ProjectStatus.InProgress, // Set initial status to InProgress
            ticketCollection: address(0) // Initialize ticketCollection to 0
        });

        projectCount++;

        emit ProjectCreated(projectId, _name, _fundingGoal, _startTime, _endTime, _teamWallet, msg.sender, _profitSharePercentage, _category);
    }

    function contribute(uint256 _projectId, uint256 _amount) public whenNotPaused {
        Project storage project = projects[_projectId];
        require(project.isActive, "Project is not active");
        require(block.timestamp >= project.startTime, "Project has not started yet");
        require(block.timestamp <= project.endTime, "Project has ended");
        require(_amount > 0, "Amount must be greater than 0");

        fundingToken.transferFrom(msg.sender, address(this), _amount);
        project.totalFunded += _amount;

        // Update project investments
        projectInvestments[_projectId][msg.sender] += _amount;

        // Update shares
        crowdFlixVault.contributeAndUpdateShares(_projectId, msg.sender, _amount, project.profitSharePercentage);


        // Add contributor address to the array if not already present
        if (project.contributors.length == 0 || project.contributors[project.contributors.length - 1] != msg.sender) {
            project.contributors.push(msg.sender);
        }

        emit Contributed(_projectId, msg.sender, _amount);
    }

   function finalizeProject(uint256 _projectId, uint256 _ticketPrice) public { 
    Project storage project = projects[_projectId];
    require(project.isActive, "Project is not active");
    require(block.timestamp > project.endTime, "Project has not ended yet");
    require(msg.sender == project.creator, "Only the project creator can finalize");
    require(address(ticketManager) != address(0), "TicketManager not initialized"); 
    require(project.status == ProjectStatus.InProgress, "Project is already finalized"); 

    project.isActive = false;

    bool success = project.totalFunded >= project.fundingGoal;
    console.log(success);
    if (success) {
        console.log("Inside the success block");
        project.status = ProjectStatus.Success;
        // Transfer remaining funds to team wallet using the ERC20 contract
        fundingToken.transfer(project.teamWallet, project.totalFunded); 

        emit Withdrawn(_projectId, project.teamWallet, project.totalFunded);

        console.log("Tokens WIthdrawn");

        // Create ticket collection for the successful project using the interface
        projects[_projectId].ticketCollection = ticketManager.createTicketCollection(
            _projectId, 
            string(abi.encodePacked(project.name, " Tickets")), 
            "FLIXTKT", 
            _ticketPrice, // Pass the ticket price as a parameter
            project.category, 
            project.name 
        );
    } else {
        project.status = ProjectStatus.Fail;
        // Iterate through contributors using the array
        for (uint256 i = 0; i < project.contributors.length; i++) {
            address contributorAddress = project.contributors[i];
            if (projectInvestments[_projectId][contributorAddress] > 0) {
                uint256 refundAmount = projectInvestments[_projectId][contributorAddress];
                projectInvestments[_projectId][contributorAddress] = 0;
                fundingToken.transfer(contributorAddress, refundAmount); // Use fundingToken.transfer for refunds
            }
        }
    }

    emit ProjectFinalized(_projectId, success);
}



    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // Function to edit an existing project
    function editProject(
        uint256 _projectId,
        string memory _newName,
        string memory _newDescription,
        uint256 _newFundingGoal,
        uint256 _newStartTime,
        uint256 _newEndTime,
        address _newTeamWallet,
        string memory _newCategory
    ) public {
        require(_projectId < projectCount, "Invalid project ID");
        Project storage project = projects[_projectId];
        require(msg.sender == project.creator, "Only the project creator can edit");

        // Update project details
        project.name = _newName;
        project.description = _newDescription;
        project.fundingGoal = _newFundingGoal;
        project.startTime = _newStartTime;
        project.endTime = _newEndTime;
        project.teamWallet = _newTeamWallet;
        project.category = _newCategory;

        // Ensure new start and end times are valid
        require(project.startTime >= block.timestamp, "Start time must be in the future");
        require(project.endTime > project.startTime, "End time must be after start time");
        require(project.teamWallet != address(0), "Team wallet cannot be zero address");
    }

    // Function to get projects by address
    function getProjectsByAddress(address _address) public view returns (Project[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < projectCount; i++) {
            if (projects[i].creator == _address) {
                count++;
            }
        }

        Project[] memory projectsByAddress = new Project[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < projectCount; i++) {
            if (projects[i].creator == _address) {
                projectsByAddress[index] = projects[i];
                index++;
            }
        }

        return projectsByAddress;
    }

    // Function to get projects by category
    function getProjectsByCategory(string memory _category) public view returns (Project[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < projectCount; i++) {
            if (keccak256(bytes(projects[i].category)) == keccak256(bytes(_category))) {
                count++;
            }
        }

        Project[] memory projectsByCategory = new Project[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < projectCount; i++) {
            if (keccak256(bytes(projects[i].category)) == keccak256(bytes(_category))) {
                projectsByCategory[index] = projects[i];
                index++;
            }
        }

        return projectsByCategory;
    }

    // Function to get projects in progress
    function getProjectsInProgress() public view returns (Project[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < projectCount; i++) {
            if (projects[i].status == ProjectStatus.InProgress) {
                count++;
            }
        }

        Project[] memory inProgressProjects = new Project[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < projectCount; i++) {
            if (projects[i].status == ProjectStatus.InProgress) {
                inProgressProjects[index] = projects[i];
                index++;
            }
        }

        return inProgressProjects;
    }

    // Function to get successful projects
    function getSuccessfulProjects() public view returns (Project[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < projectCount; i++) {
            if (projects[i].status == ProjectStatus.Success) {
                count++;
            }
        }

        Project[] memory successfulProjects = new Project[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < projectCount; i++) {
            if (projects[i].status == ProjectStatus.Success) {
                successfulProjects[index] = projects[i];
                index++;
            }
        }

        return successfulProjects;
    }

    // Function to get failed projects
    function getFailedProjects() public view returns (Project[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < projectCount; i++) {
            if (projects[i].status == ProjectStatus.Fail) {
                count++;
            }
        }

        Project[] memory failedProjects = new Project[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < projectCount; i++) {
            if (projects[i].status == ProjectStatus.Fail) {
                failedProjects[index] = projects[i];
                index++;
            }
        }

        return failedProjects;
    }

    // Function to get the total funds raised for a project
    function totalFunded(uint256 _projectId) public view returns (uint256) {
        return projects[_projectId].totalFunded;
    }

    // Function to get the ticket collection address for a project
    function getTicketCollectionAddress(uint256 _projectId) public view returns (address) {
        return projects[_projectId].ticketCollection;
    }
    
    // Receive function to handle direct ETH transfers
    receive() external payable {
        // You can add logic here to handle direct ETH transfers,
        // such as rejecting them or storing them for a specific purpose.
        // For example, you could revert the transaction if ETH transfers are not expected.
    }
}
