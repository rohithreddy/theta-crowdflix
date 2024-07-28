// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ITicketManager.sol";
import "./CrowdFlixVault.sol";

contract LaunchPad is Pausable, AccessControl, ReentrancyGuard {
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant TEAM_OPS_ROLE = keccak256("TEAM_OPS_ROLE"); // New role for KYC checks

    struct Project {
        string name;
        string description;
        uint256 fundingGoal;
        uint256 startTime;
        uint256 endTime;
        address teamWallet;
        uint256 totalFunded;
        bool isActive; // Added isActive flag
        address[] contributors;
        address creator;
        uint256 profitSharePercentage;
        string category;
        address ticketCollection;
        uint256 projectId;
        uint256 daoProposalId;
        string teaserURI;
        bool isFinalized; // Added to track if the project has been finalized
        bool teamKycVerified; // New field for KYC status
    }

    mapping(uint256 => Project) public projects;
    uint256 public projectCount;
    IERC20 public fundingToken;
    mapping(uint256 => mapping(address => uint256)) public projectInvestments;

    ITicketManager public ticketManager;
    CrowdFlixVault public crowdFlixVault;

    event ProjectCreated(
        uint256 indexed projectId,
        string name,
        uint256 fundingGoal,
        uint256 startTime,
        uint256 endTime,
        address teamWallet,
        address creator,
        uint256 profitSharePercentage,
        string category
    );

    event Contributed(uint256 indexed projectId, address indexed contributor, uint256 amount);
    event Withdrawn(uint256 indexed projectId, address indexed recipient, uint256 amount);
    event ProjectFinalized(uint256 indexed projectId, bool success);
    event TicketManagerInitialized(address ticketManagerAddress);
    event CrowdFlixVaultInitialized(address crowdFlixVaultAddress);
    event DaoProposalIdSet(uint256 indexed projectId, uint256 daoProposalId);
    event ProjectPaused(uint256 indexed projectId);
    event ProjectUnpaused(uint256 indexed projectId);
    event TeamKYCChecked(uint256 indexed projectId, bool status); // New event for KYC status change

    constructor(IERC20 _fundingToken, address _initialAdmin, address _initialProposer, address _initialPauser, address _initialTeamOps) {
        fundingToken = _fundingToken;
        _grantRole(DEFAULT_ADMIN_ROLE, _initialAdmin);
        _grantRole(PROPOSER_ROLE, _initialProposer);
        _grantRole(PAUSER_ROLE, _initialPauser);
        _grantRole(TEAM_OPS_ROLE, _initialTeamOps); // Grant TEAM_OPS role to the initial address
    }

    function initializeTicketManager(address _ticketManagerAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(ticketManager) == address(0), "TicketManager already initialized");
        ticketManager = ITicketManager(_ticketManagerAddress);
        emit TicketManagerInitialized(_ticketManagerAddress);
    }

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
        address _teamWallet,
        address _creator,
        uint256 _profitSharePercentage,
        string memory _category,
        string memory _teaserURI
    ) public onlyRole(PROPOSER_ROLE) {
        require(_startTime >= block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");
        require(_teamWallet != address(0), "Team wallet cannot be zero address");
        require(_profitSharePercentage <= 90, "Profit share percentage cannot exceed 90%");
        require(address(ticketManager) != address(0), "TicketManager not initialized");
        require(address(crowdFlixVault) != address(0), "CrowdFlixVault not initialized");

        uint256 projectId = projectCount;
        projects[projectId] = Project({
            name: _name,
            description: _description,
            fundingGoal: _fundingGoal,
            startTime: _startTime,
            endTime: _endTime,
            totalFunded: 0,
            isActive: true, // Initialize isActive as true
            teamWallet: _teamWallet,
            contributors: new address[](0),
            creator: _creator,
            profitSharePercentage: _profitSharePercentage,
            category: _category,
            ticketCollection: address(0),
            projectId: projectId,
            daoProposalId: 0,
            teaserURI: _teaserURI,
            isFinalized: false, // Initialize as not finalized
            teamKycVerified: false // Initialize KYC status as not checked
        });

        projectCount++;

        emit ProjectCreated(projectId, _name, _fundingGoal, _startTime, _endTime, _teamWallet, msg.sender, _profitSharePercentage, _category);
    }

    function contribute(uint256 _projectId, uint256 _amount) public whenNotPaused {
        Project storage project = projects[_projectId];
        require(project.isActive, "Project is not active"); // Added isActive check
        require(block.timestamp >= project.startTime, "Project has not started yet");
        require(block.timestamp <= project.endTime, "Project has ended");
        require(_amount > 0, "Amount must be greater than 0");

        fundingToken.transferFrom(msg.sender, address(this), _amount);
        project.totalFunded += _amount;
        projectInvestments[_projectId][msg.sender] += _amount;
        crowdFlixVault.contributeAndUpdateShares(_projectId, msg.sender, _amount, project.profitSharePercentage);

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
        require(!project.isFinalized, "Project is already finalized");

        
        bool success = project.totalFunded >= project.fundingGoal;

        if (success) {
            project.ticketCollection = ticketManager.createTicketCollection(
                _projectId,
                string(abi.encodePacked(project.name, " Tickets")),
                "FLIXTKT",
                _ticketPrice,
                project.category,
                project.name
            );
            fundingToken.transfer(project.teamWallet, project.totalFunded);
        }
        project.isActive = false; 
        project.isFinalized = true; 

        emit ProjectFinalized(_projectId, success);
    }

    function refundInvestors(uint256 _projectId) public {
        Project storage project = projects[_projectId];
        require(project.isActive, "Project is not active"); 
        require(block.timestamp > project.endTime, "Project has not ended yet");
        require(msg.sender == project.creator, "Only the project creator can finalize");
        require(!project.isFinalized, "Project is already finalized");
        require(project.totalFunded < project.fundingGoal, "The project has reached the funding Goal something is wrong");

        for (uint256 i = 0; i < project.contributors.length; i++) {
            address contributorAddress = project.contributors[i];
            if (projectInvestments[_projectId][contributorAddress] > 0) {
                uint256 refundAmount = projectInvestments[_projectId][contributorAddress];
                projectInvestments[_projectId][contributorAddress] = 0;
                fundingToken.transfer(contributorAddress, refundAmount);
                emit Withdrawn(_projectId, contributorAddress, refundAmount);
            }
        }
    }

    function withdrawFunds(uint256 _projectId) public {
        Project storage project = projects[_projectId];
        // Removed the requirement for project.isFinalized
        require(projectInvestments[_projectId][msg.sender] > 0, "No funds to withdraw");
        // Check if the project is active based on start and end dates
        require(block.timestamp < project.startTime || block.timestamp > project.endTime, "Project is still active");

        uint256 amount = projectInvestments[_projectId][msg.sender];
        projectInvestments[_projectId][msg.sender] = 0; // Reset the contributor's investment
        fundingToken.transfer(msg.sender, amount); // Transfer the funds back to the contributor

        emit Withdrawn(_projectId, msg.sender, amount);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function editProject(
        uint256 _projectId,
        string memory _newName,
        string memory _newDescription,
        uint256 _newFundingGoal,
        uint256 _newStartTime,
        uint256 _newEndTime,
        address _newTeamWallet,
        string memory _newCategory,
        string memory _newTeaserURI
    ) public {
        require(_projectId < projectCount, "Invalid project ID");
        Project storage project = projects[_projectId];
        require(msg.sender == project.creator, "Only the project creator can edit");

        project.name = _newName;
        project.description = _newDescription;
        project.fundingGoal = _newFundingGoal;
        project.startTime = _newStartTime;
        project.endTime = _newEndTime;
        project.teamWallet = _newTeamWallet;
        project.category = _newCategory;
        project.teaserURI = _newTeaserURI;

        require(project.startTime >= block.timestamp, "Start time must be in the future");
        require(project.endTime > project.startTime, "End time must be after start time");
        require(project.teamWallet != address(0), "Team wallet cannot be zero address");
    }

    function setDaoProposalId(uint256 _projectId, uint256 _daoProposalId) public onlyRole(PROPOSER_ROLE) {
        require(_projectId < projectCount, "Invalid project ID");
        projects[_projectId].daoProposalId = _daoProposalId;
        emit DaoProposalIdSet(_projectId, _daoProposalId);
    }

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

    function getProjectsInProgress() public view returns (Project[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < projectCount; i++) {
            if (block.timestamp >= projects[i].startTime && block.timestamp <= projects[i].endTime && projects[i].isActive) {
                count++;
            }
        }

        Project[] memory inProgressProjects = new Project[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < projectCount; i++) {
            if (block.timestamp >= projects[i].startTime && block.timestamp <= projects[i].endTime && projects[i].isActive) {
                inProgressProjects[index] = projects[i];
                index++;
            }
        }

        return inProgressProjects;
    }

    function getSuccessfulProjects() public view returns (Project[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < projectCount; i++) {
            // Check if the project has ended and was successful
            if (block.timestamp > projects[i].endTime && projects[i].totalFunded >= projects[i].fundingGoal) {
                count++;
            }
        }

        Project[] memory successfulProjects = new Project[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < projectCount; i++) {
            // Check if the project has ended and was successful
            if (block.timestamp > projects[i].endTime && projects[i].totalFunded >= projects[i].fundingGoal) {
                successfulProjects[index] = projects[i];
                index++;
            }
        }

        return successfulProjects;
    }

    function getUpcomingProjects() public view returns (Project[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < projectCount; i++) {
            if (block.timestamp < projects[i].startTime && projects[i].isActive) {
                count++;
            }
        }

        Project[] memory upcomingProjects = new Project[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < projectCount; i++) {
            if (block.timestamp < projects[i].startTime && projects[i].isActive) {
                upcomingProjects[index] = projects[i];
                index++;
            }
        }

        return upcomingProjects;
    }

    function getFailedProjects() public view returns (Project[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < projectCount; i++) {
            if (block.timestamp > projects[i].endTime && projects[i].totalFunded < projects[i].fundingGoal) {
                count++;
            }
        }

        Project[] memory failedProjects = new Project[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < projectCount; i++) {
            if (block.timestamp > projects[i].endTime && projects[i].totalFunded < projects[i].fundingGoal) {
                failedProjects[index] = projects[i];
                index++;
            }
        }

        return failedProjects;
    }

    function getFinalizedProjects() public view returns (Project[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < projectCount; i++) {
            if (projects[i].isFinalized) {
                count++;
            }
        }

        Project[] memory finalizedProjects = new Project[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < projectCount; i++) {
            if (projects[i].isFinalized) {
                finalizedProjects[index] = projects[i];
                index++;
            }
        }

        return finalizedProjects;
    }

    function totalFunded(uint256 _projectId) public view returns (uint256) {
        return projects[_projectId].totalFunded;
    }

    function getTicketCollectionAddress(uint256 _projectId) public view returns (address) {
        return projects[_projectId].ticketCollection;
    }

    function getContributors(uint256 _projectId) public view returns (address[] memory) {
        return projects[_projectId].contributors;
    }

    function userContribution(uint256 _projectId, address _user) public view returns (bool, uint256) {
        uint256 amount = projectInvestments[_projectId][_user];
        return (amount > 0, amount);
    }

    function setTeamKycVerified(uint256 _projectId, bool _status) public onlyRole(TEAM_OPS_ROLE) {
        require(_projectId < projectCount, "Invalid project ID");
        projects[_projectId].teamKycVerified = _status;
        emit TeamKYCChecked(_projectId, _status);
    }

  function pauseProject(uint256 _projectId) public onlyRole(PAUSER_ROLE) {
        require(_projectId < projectCount, "Invalid project ID");
        Project storage project = projects[_projectId];
        require(project.isActive, "Project is already paused");

        project.isActive = false;
        emit ProjectPaused(_projectId);
    }

    function unpauseProject(uint256 _projectId) public onlyRole(PAUSER_ROLE) {
        require(_projectId < projectCount, "Invalid project ID");
        Project storage project = projects[_projectId];
        require(!project.isActive, "Project is already active");

        project.isActive = true;
        emit ProjectUnpaused(_projectId);
    }

    receive() external payable {
        revert("ETH transfers not accepted");
    }
}
