// SPDX-License-Identifier: MIT

// Compatible with OpenZeppelin Contracts ^5.0.0

pragma solidity ^0.8.20;


/// @custom:security-contact crash@web108.xyz

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/manager/AccessManaged.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LaunchPad is Pausable, AccessManaged, ReentrancyGuard {
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
    }

    mapping(uint256 => Project) public projects;
    uint256 public projectCount;

    IERC20 public fundingToken;

    // Track investments
    mapping(uint256 => mapping(address => uint256)) public projectInvestments;

    event ProjectCreated(uint256 indexed projectId, string name, uint256 fundingGoal, uint256 startTime, uint256 endTime, address teamWallet, address creator, uint256 profitSharePercentage);
    event Contributed(uint256 indexed projectId, address indexed contributor, uint256 amount);
    event Withdrawn(uint256 indexed projectId, address indexed recipient, uint256 amount);
    event ProjectFinalized(uint256 indexed projectId, bool success);
    event ProfitSharePercentageUpdated(uint256 indexed projectId, uint256 newPercentage);
    event TicketsSoldUpdated(uint256 indexed projectId, uint256 newTicketsSold);

    constructor(IERC20 _fundingToken, address initialAuthority) AccessManaged(initialAuthority) {
        fundingToken = _fundingToken;
    }

    function createProject(
        string memory _name,
        string memory _description,
        uint256 _fundingGoal,
        uint256 _startTime,
        uint256 _endTime,
        address _teamWallet, // Added teamWallet parameter
        uint256 _profitSharePercentage // Added profitSharePercentage parameter
    ) public restricted {
        require(_startTime >= block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");
        require(_teamWallet != address(0), "Team wallet cannot be zero address"); // Check teamWallet is not zero address
        require(_profitSharePercentage <= 90, "Profit share percentage cannot exceed 90%");

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
            creator: msg.sender, // Store the creator address
            profitSharePercentage: _profitSharePercentage // Assign profitSharePercentage
        });

        projectCount++;

        emit ProjectCreated(projectId, _name, _fundingGoal, _startTime, _endTime, _teamWallet, msg.sender, _profitSharePercentage);
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

        // Add contributor address to the array if not already present
        if (project.contributors.length == 0 || project.contributors[project.contributors.length - 1] != msg.sender) {
            project.contributors.push(msg.sender);
        }

        emit Contributed(_projectId, msg.sender, _amount);
    }

    function withdraw(uint256 _projectId) public restricted {
        Project storage project = projects[_projectId];
        require(!project.isActive, "Project is still active");
        require(project.totalFunded >= project.fundingGoal, "Funding goal not reached");

        uint256 amount = project.totalFunded;
        project.totalFunded = 0;

        // Transfer remaining funds to team wallet
        payable(project.teamWallet).transfer(amount);

        emit Withdrawn(_projectId, project.teamWallet, amount);
    }

    function finalizeProject(uint256 _projectId) public restricted {
        Project storage project = projects[_projectId];
        require(project.isActive, "Project is not active");
        require(block.timestamp > project.endTime, "Project has not ended yet");

        project.isActive = false;
        bool success = project.totalFunded >= project.fundingGoal;

        if (success) {
            uint256 amount = project.totalFunded;
            project.totalFunded = 0;

            // Transfer remaining funds to team wallet
            payable(project.teamWallet).transfer(amount);

            emit Withdrawn(_projectId, project.teamWallet, amount);
        } else {
            // Iterate through contributors using the array
            for (uint256 i = 0; i < project.contributors.length; i++) {
                address contributorAddress = project.contributors[i];
                if (projectInvestments[_projectId][contributorAddress] > 0) {
                    uint256 refundAmount = projectInvestments[_projectId][contributorAddress];
                    projectInvestments[_projectId][contributorAddress] = 0;
                    payable(contributorAddress).transfer(refundAmount);
                }
            }
        }

        emit ProjectFinalized(_projectId, success);
    }

    function pause() public restricted {
        _pause();
    }

    function unpause() public restricted {
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
        address _newTeamWallet
    ) public restricted {
        require(_projectId < projectCount, "Invalid project ID");
        Project storage project = projects[_projectId];

        // Update project details
        project.name = _newName;
        project.description = _newDescription;
        project.fundingGoal = _newFundingGoal;
        project.startTime = _newStartTime;
        project.endTime = _newEndTime;
        project.teamWallet = _newTeamWallet;

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
}
