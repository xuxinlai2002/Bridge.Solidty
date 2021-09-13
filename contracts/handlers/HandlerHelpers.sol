// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../interfaces/IERCHandler.sol";
import "../utils/Seriality.sol";

import "hardhat/console.sol";

/**
    @title Function used across handler contracts.
    @author ChainSafe Systems.
    @notice This contract is intended to be used with the Bridge contract.
 */
contract HandlerHelpers is IERCHandler, Seriality {
    address public _bridgeAddress;

    // resourceID => token contract address
    mapping(bytes32 => address) public _resourceIDToTokenContractAddress;

    // token contract address => resourceID
    mapping(address => bytes32) public _tokenContractAddressToResourceID;

    // token contract address => is whitelisted
    mapping(address => bool) public _contractWhitelist;

    // token contract address => is burnable
    mapping(address => bool) public _burnList;

    modifier onlyBridge() {
        _onlyBridge();
        _;
    }

    function _onlyBridge() private view {
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
    function setResource(bytes32 resourceID, address contractAddress)
        external
        override
        onlyBridge
    {
        _setResource(resourceID, contractAddress);
    }

    /**
        @notice First verifies {contractAddress} is whitelisted, then sets {_burnList}[{contractAddress}]
        to true.
        @param contractAddress Address of contract to be used when making or executing deposits.
     */
    function setBurnable(address contractAddress) external override onlyBridge {
        _setBurnable(contractAddress);
    }

    /**
        @notice Used to manually release funds from ERC safes.
        @param tokenAddress Address of token contract to release.
        @param recipient Address to release tokens to.
        @param amountOrTokenID Either the amount of ERC20 tokens or the ERC721 token ID to release.
     */
    function withdraw(
        address tokenAddress,
        address recipient,
        uint256 amountOrTokenID
    ) external virtual override {}

    function _setResource(bytes32 resourceID, address contractAddress)
        internal
    {
        _resourceIDToTokenContractAddress[resourceID] = contractAddress;
        _tokenContractAddressToResourceID[contractAddress] = resourceID;

        _contractWhitelist[contractAddress] = true;
    }

    function _setBurnable(address contractAddress) internal {
        require(
            _contractWhitelist[contractAddress],
            "provided contract is not whitelisted"
        );
        _burnList[contractAddress] = true;
    }

    uint256 constant MAX_PACK_NUM = 100;
    address[] public _signers;
    uint256 _totalCount;


    function _verifyAbiterSwift(
        bytes[] memory sig) internal view returns (bool){

        uint8 i = 0;
        uint8 verifiedNum = 0;
        uint256 sigLen = sig.length;
        bytes32 msgHash;
        address signer;

        require(_isDuplicated(sig) == false, "duplicate signature exception");

        msgHash = _getAbiterHash();
        for (i = 0; i < sigLen; i++) {
            
            signer = _recoverSigner(msgHash, sig[i]);

            if (_isInAbterList(signer) == false) {
                continue;
            } else {
                //console.log("_isInAbterList OK");
                verifiedNum++;
            }

            if (verifiedNum >= (_totalCount / 3) * 2 + 1) {
                //console.log("4");
                //console.log("verify is OK ...");
                return true;
            }
        }

        return false;
    }

    function _getAbiterHash() internal view returns (bytes32){

        uint256 abiterLen = _signers.length;
        bytes memory allSerialData;

        for (uint256 i = 0; i < abiterLen; i++) {

            bytes memory addressBytes = _address2Bytes(_signers[i]);
            allSerialData = _mergeBytes(allSerialData,addressBytes);
        }

        // console.log("address buffer is : ");
        // console.logBytes(allSerialData);
        
        bytes32 msgHash = keccak256(allSerialData);
        // console.logBytes32(msgHash);
        return msgHash;


    }


    function _verifyAbterBatch(
        uint8 chainID,
        uint64[] memory depositNonce,
        bytes[] calldata data,
        bytes32[] memory resourceID,
        bytes[] memory sig
    ) internal view returns (bool) {
        uint8 i = 0;
        uint8 verifiedNum = 0;
        address signer;
        bytes32 msgHash;
        uint256 sigLen = sig.length;

        require(_isDuplicated(sig) == false, "duplicate signature exception");

        for (i = 0; i < sigLen; i++) {

            //console.log("verify %d",( i + 1 ));
            msgHash = _getMsgHashBatch(chainID, depositNonce, data, resourceID);
            //msgHash = 0xbe4824f27f749c96ceffb6736cff8fc5a01bf58c6eb2ec041c139b26f0aa5707;
            //console.logBytes32(msgHash);
            
            signer = _recoverSigner(msgHash, sig[i]);

            if (_isInAbterList(signer) == false) {
                continue;
            } else {
                //console.log("_isInAbterList OK");
                verifiedNum++;
            }

            if (verifiedNum >= (_totalCount / 3) * 2 + 1) {
                //console.log("4");
                //console.log("verify is OK ...");
                return true;
            }
        }

        //console.log("verify is failed ...");
        return false;
    }

    /**
        @notice Returns a proposal.
        @param chainID Chain ID deposit originated from.
        @param depositNonce ID of proposal generated by proposal's origin Bridge contract.
        @param data Hash of data to be provided when deposit proposal is executed.
        @param resourceID Hash of data to be provided when deposit proposal is executed.
        @return message hash of the serial bytes:
        -  serialize bytes
        -  32 chainID + [ 32 depositNonce + 32 resourceID  + data(different from token type :weth erc20 erc721....) ] * n
    */
    function _getMsgHashBatch(
        uint8 chainID,
        uint64[] memory depositNonce,
        bytes[] calldata data,
        bytes32[] memory resourceID
    ) internal pure returns (bytes32) {
        uint256 txLen = depositNonce.length;
        bytes memory allSerialData;

        bytes memory chainIDbuffer = new bytes(32);
        uintToBytes(32, chainID, chainIDbuffer);
        allSerialData = _mergeBytes(allSerialData, chainIDbuffer);

        for (uint256 i = 0; i < txLen; i++) {
            uint256 offset = 64;
            bytes memory buffer = new bytes(offset);

            bytes32ToBytes(offset, resourceID[i], buffer);
            //console.logBytes(buffer);

            offset -= 32;
            uintToBytes(offset, depositNonce[i], buffer);
            //console.logBytes(buffer);

            bytes memory serialData = _mergeBytes(buffer, data[i]);
            allSerialData = _mergeBytes(allSerialData, serialData);
        }

        bytes32 msgHash = keccak256(allSerialData);
        //console.logBytes32(msgHash);
        return msgHash;
    }

    function _verifyAbter(
        uint8 chainID,
        uint64 depositNonce,
        bytes calldata data,
        bytes32 resourceID,
        bytes[] memory sig
    ) internal view returns (bool) {
        uint8 i = 0;
        uint8 verifiedNum = 0;
        address signer;
        bytes32 msgHash;
        uint256 sigLen = sig.length;

        require(_isDuplicated(sig) == false, "duplicate signature exception");

        for (i = 0; i < sigLen; i++) {
            msgHash = _getMsgHash(chainID, depositNonce, data, resourceID);
            //console.logBytes32(msgHash);

            signer = _recoverSigner(msgHash, sig[i]);

            if (_isInAbterList(signer) == false) {
                continue;
            } else {
                //console.log("_isInAbterList OK");
                verifiedNum++;
            }
            if (verifiedNum >= (_totalCount / 3) * 2 + 1) {
                //console.log("verify is OK ...");
                return true;
            }
        }

        //console.log("verify is failed ...");
        return false;
    }

    function _isDuplicated(bytes[] memory _sig) internal pure returns (bool) {
        uint256 sigLen = _sig.length;

        //xxl TODO 1
        for (uint8 i = 0; i < sigLen; i++) {
            for (uint8 j = i + 1; j < sigLen; j++) {
                if (keccak256(_sig[i]) == keccak256(_sig[j])) {
                //if( _sig[i].equals((_sig[j])) ) {    
                    return true;
                }
            }
        }

        return false;
    }

    /**
        @notice Returns a proposal.
        @param chainID Chain ID deposit originated from.
        @param depositNonce ID of proposal generated by proposal's origin Bridge contract.
        @param data Hash of data to be provided when deposit proposal is executed.
        @param resourceID Hash of data to be provided when deposit proposal is executed.
        @return message hash of the serial bytes:
        -  serialize bytes
        -  32 chainID + 32 depositNonce + 32 resourceID  + data(different from token type :weth erc20 erc721....)
    */
    function _getMsgHash(
        uint8 chainID,
        uint64 depositNonce,
        bytes calldata data,
        bytes32 resourceID
    ) internal pure returns (bytes32) {
        uint256 offset = 96;
        bytes memory buffer = new bytes(offset);

        bytes32ToBytes(offset, resourceID, buffer);
        //console.logBytes(buffer);

        offset -= 32;
        uintToBytes(offset, depositNonce, buffer);
        //console.logBytes(buffer);

        offset -= 32;
        uintToBytes(offset, chainID, buffer);
        //console.logBytes(buffer);

        bytes memory serialData = _mergeBytes(buffer, data);
        //console.logBytes(serialData);

        bytes32 msgHash = keccak256(serialData);
        //console.logBytes32(msgHash);

        return msgHash;
    }

    function _mergeBytes(bytes memory a, bytes memory b)
        internal
        pure
        returns (bytes memory c)
    {
        // Store the length of the first array
        uint256 alen = a.length;
        // Store the length of BOTH arrays
        uint256 totallen = alen + b.length;
        // Count the loops required for array a (sets of 32 bytes)
        uint256 loopsa = (a.length + 31) / 32;
        // Count the loops required for array b (sets of 32 bytes)
        uint256 loopsb = (b.length + 31) / 32;
        assembly {
            let m := mload(0x40)
            // Load the length of both arrays to the head of the new bytes array
            mstore(m, totallen)
            // Add the contents of a to the array
            for {
                let i := 0
            } lt(i, loopsa) {
                i := add(1, i)
            } {
                mstore(
                    add(m, mul(32, add(1, i))),
                    mload(add(a, mul(32, add(1, i))))
                )
            }
            // Add the contents of b to the array
            for {
                let i := 0
            } lt(i, loopsb) {
                i := add(1, i)
            } {
                mstore(
                    add(m, add(mul(32, add(1, i)), alen)),
                    mload(add(b, mul(32, add(1, i))))
                )
            }
            mstore(0x40, add(m, add(32, totallen)))
            c := m
        }
    }

    function _address2Bytes(address a) internal pure returns (bytes memory b){
        assembly {
            let m := mload(0x40)
            a := and(a, 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF)
            mstore(add(m, 20), xor(0x140000000000000000000000000000000000000000, a))
            mstore(0x40, add(m, 52))
            b := m
        }
    }
    // function _calculateAddress(bytes memory pub) internal pure returns (address addr) {
    //     bytes32 hash = keccak256(pub);
    //     assembly {
    //         mstore(0, hash)
    //         addr := mload(0)
    //     }
    // }

    function _isInAbterList(address signer) internal view returns (bool) {
        bool ret = false;

        for (uint8 i = 0; i < _signers.length; i++) {
            if (_signers[i] == signer) {
                return true;
            }
        }
        return ret;
    }

    // /**
    // * @dev Recover signer address from a message by using their signature
    // * @param hash bytes32 message, the hash is the signed message. What is recovered is the signer address.
    // * @param sig bytes signature, the signature is generated using web3.eth.sign(). Inclusive "0x..."
    // */
    function _recoverSigner(bytes32 hash, bytes memory sig)
        internal
        pure
        returns (address)
    {
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

    function _recoverSigner2(
        bytes32 h,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public pure returns (address) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, h));
        address addr = ecrecover(prefixedHash, v, r, s);

        //address addr = ecrecover(h, v, r, s);

        return addr;
    }

}
