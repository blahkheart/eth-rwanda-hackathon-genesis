// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @title ETHRwanda Hackathon Genesis Registry
/// @notice This contract manages the registration and data of hackers participating in the ETH Rwanda Genesis Hackathon.
/// @author Danny Thomx
contract ETHRwandaHackathonGenesisRegistry is Ownable {
    // Custom error definitions
    error UserNotRegistered();
    error RegistrationsClosed();
    error UserAlreadyRegisteredWithPhone();
    error UserAlreadyRegisteredWithEmail();
    error InsufficientBalance();
    error TransferFailed();

    /// @notice Structure to store hacker data.
    struct HackerData {
        address hackerAddress;
        string name;
        string email;
        uint256 number;
        address class;
    }

    uint256 public constant VERSION = 0;
    bool areRegistrationsOpen = false; // State variable to track registration status

    constructor() Ownable(msg.sender) {}

    mapping(uint256 => HackerData) private hackersByPhone;
    mapping(address => HackerData) private hackersByAddress;
    HackerData[] private users; // List to store all users

    /// @notice Event emitted when a new hacker is registered
    event HackerRegistered(address indexed hackerAddress, address class);

    /// @notice Event emitted when a hacker's data is edited
    event HackerDataEdited(address indexed hackerAddress);

    /// @notice Event emitted when registration status is changed
    event RegistrationStatusChanged(bool isOpen);

    event RwETHTransfer(address indexed from, address indexed to, uint256 amount);
    event RwTokenTransfer(address indexed from, address indexed to, address token, uint256 amount);
    event RwCollectibleTransfer(address indexed from, address indexed to, address token, uint256 tokenId);

    /// @notice Fallback function to receive Ether.
    receive() external payable {}

    /// @notice Withdraws all Ether from the contract to the owner's address.
    /// @dev Only callable by the contract owner.
    function withdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }

    /// @notice Opens registrations.
    /// @dev Only callable by the contract owner.
    function setRegistrationsStatus(bool _areRegistrationsOpen) external onlyOwner {
        areRegistrationsOpen = _areRegistrationsOpen;
        emit RegistrationStatusChanged(_areRegistrationsOpen);
    }

    /// @notice Checks if registrations are open.
    /// @return True if registrations are open, false otherwise.
    function getAreRegistrationsOpen() public view returns (bool) {
        return areRegistrationsOpen;
    }

    modifier onlyRegistered() {
        if (hackersByAddress[msg.sender].hackerAddress == address(0)) revert UserNotRegistered();
        _;
    }

    /// @notice Registers a new hacker.
    /// @param _hackerAddress The address of the hacker.
    /// @param _name The name of the hacker.
    /// @param _email The email of the hacker.
    /// @param _number The phone number of the hacker.
    /// @param _lockAddress The class address associated with the hacker.
    function registerHacker(
        address _hackerAddress,
        string memory _name,
        string memory _email,
        uint256 _number,
        address _lockAddress
    ) public {
        if (!areRegistrationsOpen) revert RegistrationsClosed();
        if (bytes(hackersByPhone[_number].name).length != 0) revert UserAlreadyRegisteredWithPhone();
        if (bytes(hackersByPhone[_number].email).length != 0) revert UserAlreadyRegisteredWithEmail();

        HackerData memory newUser = HackerData({
            hackerAddress: _hackerAddress,
            name: _name,
            email: _email,
            number: _number,
            class: _lockAddress
        });

        hackersByPhone[_number] = newUser;
        hackersByAddress[_hackerAddress] = newUser;
        users.push(newUser);

        emit HackerRegistered(_hackerAddress, _lockAddress);
    }

    /// @notice Retrieves all registered hackers.
    /// @return An array of HackerData containing all registered hackers.
    function getAllHackers() public onlyOwner view returns (HackerData[] memory) {
        return users;
    }

    /// @notice Retrieves hacker data by phone number.
    /// @param _phone The phone number of the hacker.
    /// @return user The HackerData associated with the phone number.
    function getHackerDataByPhone(uint256 _phone) public view returns (HackerData memory user) {
        return hackersByPhone[_phone];
    }

    /// @notice Retrieves hacker data by address.
    /// @param userAddress The address of the hacker.
    /// @return user The HackerData associated with the address.
    function getHackerDataByAddress(address userAddress) public view returns (HackerData memory user) {
        return hackersByAddress[userAddress];
    }

    /// @notice Edits existing hacker data.
    /// @param _hackerAddress The address of the hacker.
    /// @param _name The new name of the hacker.
    /// @param _email The new email of the hacker.
    /// @param _number The new phone number of the hacker.
    /// @param _lockAddress The new class address associated with the hacker.
    function editHackerData(
        address _hackerAddress,
        string memory _name,
        string memory _email,
        uint256 _number,
        address _lockAddress
    ) public {
        require(hackersByAddress[_hackerAddress].hackerAddress != address(0), "User not found");

        HackerData storage hackerData = hackersByAddress[_hackerAddress];

        // Update user data
        hackerData.name = _name;
        hackerData.email = _email;
        hackerData.number = _number;
        hackerData.class = _lockAddress;

        // Update phone mapping if the number has changed
        if (hackerData.number != _number) {
            delete hackersByPhone[hackerData.number];
            hackersByPhone[_number] = hackerData;
        }

        emit HackerDataEdited(_hackerAddress);
    }

    /// @notice Checks if a hacker is registered by phone number.
    /// @param _number The phone number to check.
    /// @return True if the hacker is registered, false otherwise.
    function isHackerRegistered(uint256 _number) public view returns (bool) {
        return bytes(hackersByPhone[_number].email).length > 0;
    }

    /// @notice Batch registers hackers.
    /// @param _hackers An array of HackerData structs to register.
    function batchRegisterHackers(HackerData[] memory _hackers) external onlyOwner {
        require(areRegistrationsOpen, "Registrations are closed");
        for (uint256 i = 0; i < _hackers.length; i++) {
            registerHacker(
                _hackers[i].hackerAddress,
                _hackers[i].name,
                _hackers[i].email,
                _hackers[i].number,
                _hackers[i].class
            );
            emit HackerRegistered(_hackers[i].hackerAddress, _hackers[i].class);
        }
    }

    /// @notice Sends Ether to a specified address.
    /// @param _to The address to send Ether to.
    /// @param _amount The amount of Ether to send.
    function sendEther(address payable _to, uint256 _amount) external onlyRegistered {
        if (address(this).balance < _amount) revert InsufficientBalance();
        (bool success, ) = _to.call{value: _amount}("");
        if (!success) revert TransferFailed();
        emit RwETHTransfer(msg.sender, _to, _amount);
    }

    /// @notice Transfers ERC20 tokens to a specified address.
    /// @param _token The ERC20 token contract.
    /// @param _to The address to transfer tokens to.
    /// @param _amount The amount of tokens to transfer.
    function transferERC20(IERC20 _token, address _to, uint256 _amount) external onlyRegistered {
        if (!_token.transferFrom(msg.sender, _to, _amount)) revert TransferFailed();
        emit RwTokenTransfer(msg.sender, _to, address(_token), _amount);
    }

    /// @notice Transfers ERC721 tokens to a specified address.
    /// @param _token The ERC721 token contract.
    /// @param _to The address to transfer tokens to.
    /// @param _tokenId The ID of the token to transfer.
    function transferERC721(IERC721 _token, address _to, uint256 _tokenId) external onlyRegistered {
        _token.safeTransferFrom(msg.sender, _to, _tokenId);
        emit RwCollectibleTransfer(msg.sender, _to, address(_token), _tokenId);
    }
}
