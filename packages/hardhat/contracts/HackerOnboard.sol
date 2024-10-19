// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


error UserNotInitialized();
error UserNotRegistered();
error RegistrationsClosed();
error UserAlreadyRegistered();
error UserAlreadyRegisteredWithPhone();
error UserAlreadyRegisteredWithEmail();
error InsufficientBalance();
error TransferFailed();
error UnauthorizedAccess();
error AlreadyInitialized();
error NotAddressOwner();
error InvalidNonce();

struct HackerData {
    address hackerAddress;
    string name;
    bytes32 email;
    bytes32 number; // Phone number
    address class;
    bool initialized;
}

/// @title ETHRwanda Hackathon Registry
/// @notice Manages the registration and data of hackers participating in the ETH Rwanda Hackathon.
contract ETHRwandaHackathonOnboard is Ownable, ReentrancyGuard, EIP712 {
    using ECDSA for bytes32;


    uint256 private nonce;
    bytes32 private salt;
    bool public areRegistrationsOpen = false; // State variable to track registration status
    string private constant SIGNING_DOMAIN = "ETHRwandaHackathon"; // Define the EIP-712 domain separator
    string private constant SIGNATURE_VERSION = "1";
    uint256 public constant MAX_LOCKS = 6;

    mapping(address => uint256) private hackerNonceByAddress;
    mapping(bytes32 => HackerData) private hackersByPhone;
    mapping(address => HackerData) private hackersByAddress;
    mapping(bytes32 => address) hackerEmailHashes;
    mapping(bytes32 => address) hackerNumberHashes;

    HackerData[] private users; // List to store all users
    address[] private locks; // Array to store lock addresses


    /// @notice Event emitted when a new hacker is registered
    event HackerRegistered(address indexed hackerAddress, address class);

    /// @notice Event emitted when a hacker's data is edited
    event HackerDataEdited(address indexed hackerAddress);

    /// @notice Event emitted when registration status is changed
    event RegistrationStatusChanged(bool isOpen);

    /// @notice Event emitted when a hacker's profile is initialized
    event HackerInitialized(address indexed hackerAddress);

    constructor(bytes32 _salt) Ownable(msg.sender) EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {
        salt = _salt;
    }

    receive() external payable {}

    /// @notice Modifier to check if the caller is a registered hacker.
    modifier onlyHacker() {
        if (hackersByAddress[msg.sender].hackerAddress != msg.sender) revert UnauthorizedAccess();
        _;
    }

    
    /// @notice Retrieves all registered hackers.
    /// @return An array of HackerData containing all registered hackers.
    function getAllHackers() external view returns (HackerData[] memory) {
        // Access control can be added here if needed
        return users;
    }

    /// @notice Retrieves hacker data by address.
    /// @param userAddress The address of the hacker.
    /// @return user The HackerData associated with the address.
    function getHackerDataByAddress(address userAddress) external view returns (HackerData memory user) {
        return hackersByAddress[userAddress];
    }

    /// @notice Retrieves the nonce for a specific hacker.
    /// @param _hackerAddress The address of the hacker.
    /// @return The nonce associated with the hacker.
    function getHackerNonce(address _hackerAddress) external view returns (uint256) {
        return hackerNonceByAddress[_hackerAddress];
    }

    /// @notice Checks if registrations are open.
    /// @return True if registrations are open, false otherwise.
    function getAreRegistrationsOpen() external view returns (bool) {
        return areRegistrationsOpen;
    }
    function getHackerByPhone(uint256 _number) external view returns (HackerData memory) {
        bytes32 numberHash = _hashNumber(_number);
        return hackersByAddress[hackerNumberHashes[numberHash]];
    }
    function getHackerByEmail(string memory _email) external view returns (HackerData memory) {
        bytes32 emailHash = _hashEmail(_email); 
        return hackersByAddress[hackerEmailHashes[emailHash]];
    }
    function getSalt(address _ownerAddress) external view returns (bytes32) {
        if(_ownerAddress != owner()) revert UnauthorizedAccess();
        return salt;
    }
   
    
    /// @notice Opens or closes registrations.
    /// @dev Only callable by the contract owner.
    function setRegistrationsStatus(bool _areRegistrationsOpen) external onlyOwner {
        areRegistrationsOpen = _areRegistrationsOpen;
        emit RegistrationStatusChanged(_areRegistrationsOpen);
    }

    function setSalt(bytes32 _salt) external onlyOwner {
        salt = _salt;
    }
    /// @notice Registers a new hacker.
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
    ) external {
        if (!areRegistrationsOpen) revert RegistrationsClosed();
        if (hackersByAddress[_hackerAddress].hackerAddress != address(0)) revert UserAlreadyRegistered();

        bytes32 numberHash = _hashNumber(_number);
        bytes32 emailHash = _hashEmail(_email);
        // Check if phone number is already registered
        if (hackerNumberHashes[numberHash] != address(0)) revert UserAlreadyRegisteredWithPhone();

        // Check if email is already registered
        if (_isEmailRegistered(_hackerAddress, _email) || _isEmailRegistered(msg.sender, _email)) revert UserAlreadyRegisteredWithEmail(); 

        HackerData memory newUser = HackerData({
            hackerAddress: msg.sender,
            name: _name,
            email: emailHash, 
            number: numberHash,
            class: _lockAddress,
            initialized: false
        });

        hackersByPhone[numberHash] = newUser; 
        hackersByAddress[msg.sender] = newUser;
        users.push(newUser);

        emit HackerRegistered(msg.sender, _lockAddress);
    }

    /// @notice Initializes a hacker's profile using EIP-712 typed data.
    /// @dev Can only be called once by each hacker.
    /// @param _signature The signature of the message.    c
    function initializeHackerProfile( bytes memory _signature) external {
        HackerData storage hackerData = hackersByAddress[msg.sender];
        if (hackerData.initialized) revert AlreadyInitialized();
        if (hackerNonceByAddress[msg.sender] != 0) revert InvalidNonce();

        // Create the struct hash
        bytes32 structHash = keccak256(abi.encode(
            keccak256("Hacker(address hackerAddress,uint256 nonce)"),
            msg.sender,
            nonce
        ));

        // Create the digest
        bytes32 digest = _hashTypedDataV4(structHash);

        // Recover the signer address from the signature
        address signer = digest.recover(_signature);

        // Check if the recovered address matches the provided hacker address
        if (signer != msg.sender) revert NotAddressOwner();

        hackerNonceByAddress[msg.sender] = nonce;
        nonce++; // Increment nonce to prevent replay
        hackerData.hackerAddress = msg.sender;
        hackerData.initialized = true;
        bytes32 emailHash = hackerData.email;
        bytes32 numberHash = hackerData.number; 
    
        // Store email and phone hashes
        hackerEmailHashes[emailHash] = msg.sender;
        hackerNumberHashes[numberHash] = msg.sender;
        emit HackerInitialized(msg.sender); 
    }

    /// @notice Edits existing hacker data.
    /// @param _name The new name of the hacker.
    /// @param _email The new email of the hacker.
    /// @param _number The new phone number of the hacker.
      function editHackerData(
        string memory _name,
        string memory _email,
        uint256 _number
    ) external {
        HackerData storage hackerData = hackersByAddress[msg.sender]; 
        if (!hackerData.initialized) revert UserNotInitialized();

        // Check for duplicate phone number
        bytes32 numberHash = _hashNumber(_number);
        if (hackerNumberHashes[numberHash] != address(0) && hackerNumberHashes[numberHash] != msg.sender) {
            revert UserAlreadyRegisteredWithPhone();
        }

        // Check for duplicate email
        bytes32 emailHash = _hashEmail(_email);
        bool isEmailRegistered = _isEmailRegistered(msg.sender, _email);
        if (isEmailRegistered && hackerEmailHashes[emailHash] != msg.sender) revert UserAlreadyRegisteredWithEmail();

        // Update phone mapping if the number has changed
        if (hackerData.number != numberHash) {
            hackerNumberHashes[numberHash] = msg.sender; 
            hackerData.number = numberHash; 
        }

        // Update user data
        hackerData.name = _name;
        hackerData.email = emailHash;
        hackerEmailHashes[emailHash] = msg.sender; // Update email hash

        emit HackerDataEdited(msg.sender);
    }

    /// @notice Checks if a hacker is registered by phone number.
    /// @param _number The phone number to check.
    /// @return True if the hacker is registered, false otherwise.
    function isHackerRegistered(uint256 _number) external view returns (bool) {
        bytes32 numberHash = _hashNumber(_number);
        return bytes(hackersByPhone[numberHash].name).length != 0; 
    }

    /// @notice Checks if a hacker's profile is initialized.
    /// @param _hackerAddress The address of the hacker.
    /// @return True if the hacker's profile is initialized, false otherwise.
    function isHackerInitialized(address _hackerAddress) external view returns (bool) {
        return hackersByAddress[_hackerAddress].initialized;
    }


    /// @notice Private helper function to check if an email is already registered.
    /// @param _hackerAddress The address of the hacker.
    /// @param _email The email to check.
    /// @return True if the email is registered, false otherwise.
    function _isEmailRegistered(address _hackerAddress, string memory _email) private view returns (bool) {
        bytes32 hashedEmail = _hashEmail(_email);
        return hackerEmailHashes[hashedEmail] == _hackerAddress;
    }
    function _hashEmail(string memory _email) private view returns (bytes32) {
        return keccak256(abi.encode(_email, salt));
    }

    function _hashNumber(uint256 _number) private view returns (bytes32) {
        return keccak256(abi.encode(_number, salt));
    }

    
}
