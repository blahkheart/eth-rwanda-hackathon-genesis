// // SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./Utilities.sol"; // Adjust the path as necessary

interface IPublicLockV14 {
 /**
   * Checks if the user has a non-expired key.
   * @param _user The address of the key owner
   */
  function getHasValidKey(address _user) external view returns (bool);
}

struct HackerData {
    address hackerAddress;
    string name;
    bytes32 email;
    bytes32 number; // Phone number
    address class;
    bool initialized;
}


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


/// @title ETHRwanda Hackathon Registry
/// @notice Manages the registration and data of hackers participating in the ETH Rwanda Hackathon.
/// @author Danny Thomx 
contract ETHRwandaHackathonOnboard is Ownable, ReentrancyGuard, EIP712 {
    using ECDSA for bytes32;

    uint256 private nonce;
    bytes32 private salt;
    bool public areRegistrationsOpen = false;
    string private constant SIGNING_DOMAIN = "ETHRwandaHackathon";
    string private constant SIGNATURE_VERSION = "1";
    uint256 public constant MAX_LOCKS = 6;

    mapping(address => uint256) private hackerNonceByAddress;
    mapping(bytes32 => HackerData) private hackersByPhone;
    mapping(address => HackerData) private hackersByAddress;
    mapping(bytes32 => address) private hackerEmailHashes;
    mapping(bytes32 => address) private hackerNumberHashes;
    mapping(address => bool) private whitelistedAddresses;

    HackerData[] private users;
    address[] private locks;

    event HackerRegistered(address indexed hackerAddress, address class);
    event HackerDataEdited(address indexed hackerAddress);
    event RegistrationStatusChanged(bool isOpen);
    event HackerInitialized(address indexed hackerAddress);
    event RwETHTransfer(address indexed from, address indexed to, uint256 amount);
    event RwTokenTransfer(address indexed from, address indexed to, address indexed token, uint256 amount);
    event RwCollectibleTransfer(address indexed from, address indexed to, address indexed token, uint256 tokenId);  

    constructor(bytes32 _salt) Ownable(msg.sender) EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {
        salt = _salt;
        nonce = 1; // Start the global nonce at 1
    }

    receive() external payable {}

     modifier onlyInitialized() {
        if (!hackersByAddress[msg.sender].initialized) revert UserNotInitialized();
        _;
    }

    function getHackerDataByAddress(address userAddress) external view returns (HackerData memory user) {
        return hackersByAddress[userAddress];
    }
    function getHackerNonce(address _hackerAddress) external view returns (uint256) {
        return hackerNonceByAddress[_hackerAddress];
    }
    function getAreRegistrationsOpen() external view returns (bool) {
        return areRegistrationsOpen;
    }
    function getIsWhitelisted(address _address) external view returns (bool) {
        return whitelistedAddresses[_address];
    }
    function getAllHackers() external view returns (HackerData[] memory) {
        bool hasAccess = false;

        if (areRegistrationsOpen) {
            for (uint256 i = 0; i < locks.length; i++) {
                if (IPublicLockV14(locks[i]).getHasValidKey(msg.sender)) {
                    hasAccess = true;
                    break;
                }
            }
        } else {
            hasAccess = whitelistedAddresses[msg.sender];
        }

        if (!hasAccess) revert UnauthorizedAccess();
        return users;
    }
    function getSalt() external onlyOwner view returns (bytes32) {
        return salt;
    }

    /// @notice Checks if a hacker is registered by phone number.
    /// @param _number The phone number to check.
    /// @return True if the hacker is registered, false otherwise.
    function getIsHackerRegistered(uint256 _number) external view returns (bool) {
        bytes32 numberHash = Utilities._hashNumber(_number, salt);
        return bytes(hackersByPhone[numberHash].name).length != 0; 
    }
    
    /// @notice Checks if a hacker's profile is initialized.
    /// @param _hackerAddress The address of the hacker.
    /// @return True if the hacker's profile is initialized, false otherwise.
    function getIsHackerInitialized(address _hackerAddress) external view returns (bool) {
        return hackersByAddress[_hackerAddress].initialized;
    }

    function setIsWhitelisted(address _address, bool _isWhitelisted) external onlyOwner {
        whitelistedAddresses[_address] = _isWhitelisted;
    }
    function setRegistrationsStatus(bool _areRegistrationsOpen) external onlyOwner {
        areRegistrationsOpen = _areRegistrationsOpen;
        emit RegistrationStatusChanged(_areRegistrationsOpen);
    }
    function setSalt(bytes32 _salt) external onlyOwner {
        salt = _salt;
    }

    function editHackerData(string memory _name, string memory _email, uint256 _number) external {
        HackerData storage hackerData = hackersByAddress[msg.sender];
        require(hackerData.initialized, "UserNotInitialized");

        bytes32 oldNumberHash = hackerData.number;
        bytes32 newNumberHash = Utilities._hashNumber(_number, salt);
        if (oldNumberHash != newNumberHash) {
            require(hackerNumberHashes[newNumberHash] == address(0), "UserAlreadyRegisteredWithPhone");
            hackerNumberHashes[newNumberHash] = msg.sender;
            delete hackerNumberHashes[oldNumberHash];
        }

        bytes32 oldEmailHash = hackerData.email;
        bytes32 newEmailHash = Utilities._hashEmail(_email, salt); 
        if (oldEmailHash != newEmailHash) {
            require(hackerEmailHashes[newEmailHash] == address(0), "UserAlreadyRegisteredWithEmail");
            hackerEmailHashes[newEmailHash] = msg.sender;
            delete hackerEmailHashes[oldEmailHash];
        }

        hackerData.name = _name;
        hackerData.email = newEmailHash;
        hackerData.number = newNumberHash;

        emit HackerDataEdited(msg.sender);
    }

    function registerHacker(
        address _hackerAddress,
        string memory _name,
        string memory _email,
        uint256 _number,
        address _lockAddress
    ) public {
        require(areRegistrationsOpen, "RegistrationsClosed");
        require(hackersByAddress[_hackerAddress].hackerAddress == address(0), "UserAlreadyRegistered");
        bytes32 numberHash = Utilities._hashNumber(_number, salt); 
        require(hackerNumberHashes[numberHash] == address(0), "UserAlreadyRegisteredWithPhone");
        bytes32 emailHash = Utilities._hashEmail(_email, salt);
        require(hackerEmailHashes[emailHash] == address(0), "UserAlreadyRegisteredWithEmail");

        HackerData memory newUser = HackerData({
            hackerAddress: _hackerAddress,
            name: _name,
            email: emailHash,
            number: numberHash,
            class: _lockAddress,
            initialized: false
        });

        hackersByPhone[numberHash] = newUser; 
        hackersByAddress[_hackerAddress] = newUser;
        hackerEmailHashes[emailHash] = _hackerAddress; 
        hackerNumberHashes[numberHash] = _hackerAddress; 
        users.push(newUser);

        // Initialize the user's nonce with the global nonce
        hackerNonceByAddress[_hackerAddress] = nonce;
        nonce++; // Increment the global nonce

        emit HackerRegistered(_hackerAddress, _lockAddress);
    }

    function initializeHackerProfile(bytes memory _signature) external {
        HackerData storage hackerData = hackersByAddress[msg.sender];
        require(!hackerData.initialized, "AlreadyInitialized");
        uint256 currentNonce = hackerNonceByAddress[msg.sender];

        bytes32 structHash = keccak256(abi.encode(
            keccak256("Hacker(address hackerAddress,uint256 nonce)"),
            msg.sender,
            currentNonce
        ));

        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = digest.recover(_signature);
        require(signer == msg.sender, "NotAddressOwner");

        // Update hacker's address in storage
        hackerData.hackerAddress = msg.sender;

        // Update hacker's address in mappings
        hackerEmailHashes[hackerData.email] = msg.sender;
        hackerNumberHashes[hackerData.number] = msg.sender;

        hackerNonceByAddress[msg.sender] = currentNonce + 1; // Increment nonce after successful initialization
        hackerData.initialized = true;

        emit HackerInitialized(msg.sender);
    }

    function batchRegisterHackers(
        address[] memory hackerAddresses,
        string[] memory names,
        string[] memory emails,
        uint256[] memory numbers,
        address[] memory lockAddresses
    ) external onlyOwner {
        require(areRegistrationsOpen, "Registrations are closed");
        require(
            hackerAddresses.length == names.length &&
            names.length == emails.length &&
            emails.length == numbers.length &&
            numbers.length == lockAddresses.length,
            "Array lengths must match"
        );

        for (uint256 i = 0; i < hackerAddresses.length; i++) {
            registerHacker(
                hackerAddresses[i],
                names[i],
                emails[i],
                numbers[i],
                lockAddresses[i]
            );
            emit HackerRegistered(hackerAddresses[i], lockAddresses[i]);
        }
    }

    /// @notice Sends Ether to a specified address.
    /// @param _to The address to send Ether to.
    /// @param _amount The amount of Ether to send.
    function sendEther(address payable _to, uint256 _amount) external onlyInitialized {
        if (address(this).balance < _amount) revert InsufficientBalance();
        (bool success, ) = _to.call{value: _amount}("");
        if (!success) revert TransferFailed();
        emit RwETHTransfer(msg.sender, _to, _amount);
    }

    /// @notice Transfers ERC20 tokens to a specified address.
    /// @param _token The ERC20 token contract.
    /// @param _to The address to transfer tokens to.
    /// @param _amount The amount of tokens to transfer.
    function transferERC20(IERC20 _token, address _to, uint256 _amount) external onlyInitialized {
        if (!_token.transferFrom(msg.sender, _to, _amount)) revert TransferFailed();
        emit RwTokenTransfer(msg.sender, _to, address(_token), _amount);
    }

    /// @notice Transfers ERC721 tokens to a specified address.
    /// @param _token The ERC721 token contract.
    /// @param _to The address to transfer tokens to.
    /// @param _tokenId The ID of the token to transfer.
    function transferERC721(IERC721 _token, address _to, uint256 _tokenId) external onlyInitialized {
        _token.safeTransferFrom(msg.sender, _to, _tokenId);
        emit RwCollectibleTransfer(msg.sender, _to, address(_token), _tokenId);
    }

}

