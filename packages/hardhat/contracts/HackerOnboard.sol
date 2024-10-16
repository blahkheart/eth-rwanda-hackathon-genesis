// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ETHRwanda Hackathon Genesis Registry
/// @notice This contract manages the registration and data of hackers participating in the ETH Rwanda Genesis Hackathon.
/// @author Danny Thomx
contract ETHRwandaHackathonGenesisRegistry is Ownable {
    /// @notice Structure to store hacker data.
    struct HackerData {
        address hackerAddress;
        string name;
        string email;
        uint256 number;
        address class;
    }

    uint256 public constant VERSION = 0;
    bool public registrationsOpen = false; // State variable to track registration status

    constructor() Ownable(msg.sender) {}

    mapping(uint256 => HackerData) private hackersByPhone;
    mapping(address => HackerData) private hackersByAddress;
    HackerData[] private users; // List to store all users

    /// @notice Event emitted when a new hacker is registered
    event HackerRegistered(address indexed hackerAddress, string name, string email, uint256 number, address class);

    /// @notice Event emitted when a hacker's data is edited
    event HackerDataEdited(address indexed hackerAddress, string name, string email, uint256 number, address class);

    /// @notice Event emitted when registration status is changed
    event RegistrationStatusChanged(bool isOpen);

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
    function openRegistrations() external onlyOwner {
        registrationsOpen = true;
        emit RegistrationStatusChanged(true);
    }

    /// @notice Closes registrations.
    /// @dev Only callable by the contract owner.
    function closeRegistrations() external onlyOwner {
        registrationsOpen = false;
        emit RegistrationStatusChanged(false);
    }

    /// @notice Checks if registrations are open.
    /// @return True if registrations are open, false otherwise.
    function areRegistrationsOpen() public view returns (bool) {
        return registrationsOpen;
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
        require(registrationsOpen, "Registrations are closed");
        require(bytes(hackersByPhone[_number].name).length == 0, "User already registered with this phone number");
        require(bytes(hackersByPhone[_number].email).length == 0, "User already registered with this email");

        HackerData memory newUser = HackerData({
            hackerAddress: _hackerAddress,
            name: _name,
            email: _email,
            number: _number,
            class: _lockAddress
        });

        hackersByPhone[_number] = newUser;
        hackersByAddress[_hackerAddress] = newUser;
        users.push(newUser); // Add user to the list

        emit HackerRegistered(_hackerAddress, _name, _email, _number, _lockAddress);
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

        emit HackerDataEdited(_hackerAddress, _name, _email, _number, _lockAddress);
    }

    /// @notice Checks if a hacker is registered by phone number.
    /// @param _number The phone number to check.
    /// @return True if the hacker is registered, false otherwise.
    function isHackerRegistered(uint256 _number) public view returns (bool) {
        return bytes(hackersByPhone[_number].email).length > 0;
    }
}
