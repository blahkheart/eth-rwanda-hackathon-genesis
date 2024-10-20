pragma solidity ^0.8.0;

library Utilities {
    function _hashEmail(string memory _email, bytes32 salt) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_email, salt));
    } 

    function _hashNumber(uint256 _number, bytes32 salt) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_number, salt));
    }

}
