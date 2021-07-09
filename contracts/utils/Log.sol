// SPDX-License-Identifier: MIT
//import "solidity-stringutils/strings.sol";
import "solidity-string-utils/StringUtils.sol";

pragma solidity 0.6.12;
import "hardhat/console.sol";

contract Log {


    using StringUtils for *;

    //xxl just for log
    event OutputString(
        string data
    );

    function logString(string memory title,string memory value) public{
        
        // string memory logData = "aaa" + value;
        // emit OutputString(logData);

        //return string(abi.encodePacked(title, value));
        //string memory logData = append(title,":",value,"","");

        string memory logData1 = "a";
        string memory logData2 = "b";
        uint256 test = 123456;
        //test.toString();
        //logData1.concat(":", logData1);


       // string memory s = string(abi.encodePacked("a", "b"));

       string memory aa = uintToString(123456);
       emit OutputString(aa);
       console.log(aa);

    }

    // function append(
    //     string memory a, 
    //     string memory b, 
    //     string memory c, 
    //     string memory d, 
    //     string memory e) internal pure returns (string memory) {
    //     return string(abi.encodePacked(a, b, c, d, e));
    // }



    function addressToString(address account) public pure returns(string memory) {
        return toStringBase(abi.encodePacked(account));
    }

    function uintToString(uint256 value) public pure returns(string memory) {
        return toStringBase(abi.encodePacked(value));
    }

    function bytesToString(bytes memory value) public pure returns(string memory) {
        return toStringBase(abi.encodePacked(value));
    }

    function bytes32ToString(bytes32 value) public pure returns(string memory) {
        return toStringBase(abi.encodePacked(value));
    }

    function toStringBase(bytes memory data) public pure returns(string memory) {
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(2 + data.length * 2);
        str[0] = "0";
        str[1] = "x";
        for (uint i = 0; i < data.length; i++) {
            str[2+i*2] = alphabet[uint(uint8(data[i] >> 4))];
            str[3+i*2] = alphabet[uint(uint8(data[i] & 0x0f))];
        }
        return string(str);
    }




}