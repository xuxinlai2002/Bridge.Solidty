// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
//import "hardhat/console.sol";
/**
 * @title AdminUpgradeable
 *
 * @dev This is an upgradeable version of `Admin` by replacing the constructor with
 * an initializer and reserving storage slots.
 */
contract AdminUpgradeable is Initializable {
    event CandidateChanged(address oldCandidate, address newCandidate);
    event AdminChanged(address oldAdmin, address newAdmin);

    address public admin;
    address public candidate;

    function __AdminUpgradeable_init(address _admin) public initializer {

        // console.log("xxl __AdminUpgradeable_init");
        // console.log(_admin);
        
        require(_admin != address(0), "AdminUpgradeable: zero address");
        admin = _admin;

        emit AdminChanged(address(0), _admin);
    }

    function setCandidate(address _candidate) external _onlyAdmin {
        address old = candidate;
        candidate = _candidate;
        emit CandidateChanged(old, candidate);
    }

    function becomeAdmin() external {
        require(msg.sender == candidate, "AdminUpgradeable: only candidate can become admin");
        address old = admin;
        admin = candidate;
        emit AdminChanged(old, admin);
    }

    modifier _onlyAdmin {

        //console.log(admin);
        //console.log(msg.sender);
        require((msg.sender == admin), "AdminUpgradeable: only the contract admin can perform this action");
        _;
    }

    function _isAdmin(address fromAddress) internal returns(bool){
        return (fromAddress == admin);
       
    }

    // Reserved storage space to allow for layout changes in the future.
    uint256[48] private __gap;
}
