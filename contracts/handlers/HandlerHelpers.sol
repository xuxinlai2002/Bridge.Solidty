// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../interfaces/IERCHandler.sol";
import "hardhat/console.sol";

import "solidity-bytes-utils/contracts/BytesLib.sol";

/**
    @title Function used across handler contracts.
    @author ChainSafe Systems.
    @notice This contract is intended to be used with the Bridge contract.
 */
contract HandlerHelpers is IERCHandler {
    using BytesLib for bytes;

    address public _bridgeAddress;

    // resourceID => token contract address
    mapping (bytes32 => address) public _resourceIDToTokenContractAddress;

    // token contract address => resourceID
    mapping (address => bytes32) public _tokenContractAddressToResourceID;

    // token contract address => is whitelisted
    mapping (address => bool) public _contractWhitelist;

    // token contract address => is burnable
    mapping (address => bool) public _burnList;

    modifier onlyBridge() {
        _onlyBridge();
        _;
    }

    function _onlyBridge() private view{
        require(msg.sender == _bridgeAddress, "sender must be bridge contract");
    }

    /**
        @notice First verifies {_resourceIDToContractAddress}[{resourceID}] and
        {_contractAddressToResourceID}[{contractAddress}] are not already set,
        then sets {_resourceIDToContractAddress} with {contractAddress},
        {_contractAddressToResourceID} with {resourceID},
        and {_contractWhitelist} to true for {contractAddress}.
        @param resourceID ResourceID to be used when making deposits.
        @param contractAddress Address of contract to be called when a deposit is made and a deposited is executed.
     */
    function setResource(bytes32 resourceID, address contractAddress) external override onlyBridge {

        _setResource(resourceID, contractAddress);
    }

    /**
        @notice First verifies {contractAddress} is whitelisted, then sets {_burnList}[{contractAddress}]
        to true.
        @param contractAddress Address of contract to be used when making or executing deposits.
     */
    function setBurnable(address contractAddress) external override onlyBridge{
        _setBurnable(contractAddress);
    }

    /**
        @notice Used to manually release funds from ERC safes.
        @param tokenAddress Address of token contract to release.
        @param recipient Address to release tokens to.
        @param amountOrTokenID Either the amount of ERC20 tokens or the ERC721 token ID to release.
     */
    function withdraw(address tokenAddress, address recipient, uint256 amountOrTokenID) external virtual override {}

    function _setResource(bytes32 resourceID, address contractAddress) internal {
        _resourceIDToTokenContractAddress[resourceID] = contractAddress;
        _tokenContractAddressToResourceID[contractAddress] = resourceID;

        _contractWhitelist[contractAddress] = true;
    }

    function _setBurnable(address contractAddress) internal {
        require(_contractWhitelist[contractAddress], "provided contract is not whitelisted");
        _burnList[contractAddress] = true;
    }

    uint8  constant INIT_START_POS = 52;
    uint16 constant TOTAL_SIZE = 4676;
    
    uint8  constant SIGN_SIZE = 147;
    uint8  constant DPOS_NUM = 36 ;
    uint8  constant SIGN_LENGTH = 65 ;
    uint8  constant PUBLIC_KEY_LENGTH = 64 ;


    function _calculateAddress(bytes memory pub) internal pure returns (address addr) {
        bytes32 hash = keccak256(pub);
        assembly {
            mstore(0, hash)
            addr := mload(0)
        }
    }

    function _verifyAbtFromCallData(address[DPOS_NUM] memory signers,bytes calldata data)
        internal view returns(bool){

        bytes memory allSignData;
        bytes32 signMsg;
        signMsg = _bytesToBytes32(data.slice(INIT_START_POS, 32),0);
        //console.log("solc msg is : ");
        //console.logBytes32(signMsg);

        // console.log("sign msg is : ");
        // console.logBytes32(signMsg);
        allSignData = data.slice(INIT_START_POS + 32, TOTAL_SIZE - 32);
        //console.logBytes(allSignData);
        bytes[DPOS_NUM] memory publicKeyList;
        bytes[DPOS_NUM] memory signatureList;
        (publicKeyList,signatureList) = _getSignatureData(allSignData);
        return _verifyAbt(signMsg,signatureList,publicKeyList,signers);
    }

    function _verifyAbt(
        bytes32 hash, 
        bytes[DPOS_NUM] memory sig,
        bytes[DPOS_NUM] memory publicKey,
        address[DPOS_NUM] memory abiterAddress
    ) view internal returns (bool){

        uint8 i = 0;
        uint8 verifiedNum = 0;
        bool isVerified = false;
        address signer;

        for(i = 0; i < DPOS_NUM; i++) {

            //console.logBytes(publicKey[i]);
            signer = _calculateAddress(publicKey[i]);
            // console.log("xxl signer 1.....");
            // console.log(signer);
            // console.log("xxl signer 2.....");
            if(_isInAbterList(signer,abiterAddress) == false){
                //console.log("_isInAbterList is false");
                continue;

            }
           
            isVerified = _verifySignature(hash,sig[i],signer);
            if(isVerified){
                verifiedNum ++ ;
            }
            if(verifiedNum >= 25){
                console.log("verify is OK ...");
                return true;
            }
        }

        console.log("verify is failed ...");        
        return false;
    }

    function _isInAbterList(address checkAddress,address[DPOS_NUM] memory signers) internal view returns(bool){

        bool ret = false;
        //console.log(checkAddress);

        for(uint8 i = 0 ;i < DPOS_NUM ;i ++){

            //console.log(signers[i]);
            if(signers[i] == checkAddress){
                return true;
            }
        }
        return ret;

    }

    /**
    * @dev verify Signature
    * @param hash bytes32 message, the hash is the signed message. What is recovered is the signer address.
    * @param signature bytes signature, the signature is generated using web3.eth.sign(). Inclusive "0x..."
    * @param signer signer address
    */
    function _verifySignature(bytes32 hash, bytes memory signature, address signer) internal pure returns (bool) {
        address addressFromSig = _recoverSigner(hash, signature);
        return addressFromSig == signer;
    }

    // /**
    // * @dev Recover signer address from a message by using their signature
    // * @param hash bytes32 message, the hash is the signed message. What is recovered is the signer address.
    // * @param sig bytes signature, the signature is generated using web3.eth.sign(). Inclusive "0x..."
    // */
    function _recoverSigner(bytes32 hash, bytes memory sig) internal pure returns (address) {
        require(sig.length == 65, "Require correct length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        // Divide the signature in r, s and v variables
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        // Version of signature should be 27 or 28, but 0 and 1 are also possible versions
        if (v < 27) {
            v += 27;
        }

        require(v == 27 || v == 28, "Signature version not match");
        return _recoverSigner2(hash, v, r, s);
    }

    function _recoverSigner2(bytes32 h, uint8 v, bytes32 r, bytes32 s) public pure returns (address) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, h));
        address addr = ecrecover(prefixedHash, v, r, s);

        return addr;
    }

    function _getSignMsg(bytes calldata data) internal pure returns(bytes32){
        return _getEachByte32(INIT_START_POS,data);
    }

    function _getSignatureData(bytes memory allsignData) internal pure returns (bytes[DPOS_NUM] memory,bytes[DPOS_NUM] memory) {

        bytes[DPOS_NUM] memory publicKeyList ;
        bytes[DPOS_NUM] memory signatureList ;
        uint64 unitLen = SIGN_LENGTH + PUBLIC_KEY_LENGTH ;

        for(uint8 i = 0 ; i < DPOS_NUM ;i ++){

            //console.log(i * unitLen);
            publicKeyList[i] = allsignData.slice(i * unitLen, PUBLIC_KEY_LENGTH);
            //console.log(i * unitLen + PUBLIC_KEY_LENGTH);
            signatureList[i] = allsignData.slice(i * unitLen + PUBLIC_KEY_LENGTH, SIGN_LENGTH);
            
        }

        return (publicKeyList,signatureList);

    }

    function _getAllBytes(bytes calldata data) internal pure returns (bytes memory) {

        uint8 startPos = INIT_START_POS + 32;
        bytes memory allSignData;
        bytes memory tempBytes;

        bytes32 tempByte32;
        for(uint8 i = 0 ;i < SIGN_SIZE ; i++){
             tempByte32 = _getEachByte32(startPos,data);
             tempBytes = _toBytes(tempByte32);
             allSignData = allSignData.concat(tempBytes);
             startPos += 32;
        }

        return allSignData;
        
    }

    function _getEachByte32(uint8 startPos,bytes calldata data) internal pure returns (bytes32) {

        bytes32 ret;
        assembly {
            ret := calldataload(startPos)
        }
        return ret;

    }

    function _toBytes(bytes32 _data) internal pure returns (bytes memory) {
        return abi.encodePacked(_data);
    }

    function _bytesToBytes32(bytes memory b, uint offset) private pure returns (bytes32) {
        bytes32 out;

        for (uint i = 0; i < 32; i++) {
            out |= bytes32(b[offset + i] & 0xFF) >> (i * 8);
        }
        return out;
    }

    function _bytesToUint(bytes memory bs, uint start) internal pure returns (uint){

        require(bs.length >= start + 32, "slicing out of range");
        uint x;
        assembly {
            x := mload(add(bs, add(0x20, start)))
        }
        return x;
    }



}
