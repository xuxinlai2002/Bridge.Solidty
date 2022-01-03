// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;


import "./Bridge.sol";
import "hardhat/console.sol";

/**
    @title Facilitates deposits, creation and votiing of deposit proposals, and deposit executions.
    @author ChainSafe Systems.
 */
contract BridgeL2 is Bridge {
    
    /**
        @notice Initiates a transfer using a specified handler contract.
        @notice Only callable when Bridge is not paused.
        @param destinationChainID ID of chain deposit will be bridged to.
        @param resourceID ResourceID used to find address of handler to be used for deposit.
        @param data Additional data to be passed to specified handler.
     */
    function deposit(
        uint8 destinationChainID,
        bytes32 resourceID,
        bytes calldata data
    ) external payable {

        address handler = _resourceIDToHandlerAddress[resourceID];
        require(handler != address(0), "resourceID not mapped to handler");
     
        uint64 depositNonce = ++_depositCounts[destinationChainID];
        _depositRecords[depositNonce][destinationChainID] = data;
        IDepositExecute depositHandler = IDepositExecute(handler);

        //weth layer1 -> layer2
        if(depositHandler.getType() == IDepositExecute.HandleTypes.WETH) {
            console.log("xxl deposit weth ...");
            _depoistWeth(destinationChainID,resourceID,data,handler,depositNonce);
        //erc20 layer1 -> layer2 
        } else if(depositHandler.getType() == IDepositExecute.HandleTypes.ERC20){
            console.log("xxl deposit erc ...");
            _depoistERC20(destinationChainID,resourceID,data,handler,depositNonce,false);
        }else if(depositHandler.getType() == IDepositExecute.HandleTypes.ERC721){
            console.log("sol xxl deposit erc721 ...");
            _depoistERC721(destinationChainID,resourceID,data,handler,depositNonce,false);
        }else { 
            //TODO and 721 and other
        } 
    }

    /**
        @notice Executes a deposit proposal that is considered passed using a specified handler contract.
        @notice Only callable by relayers when Bridge is not paused.
        @param chainID ID of chain deposit originated from.
        @param resourceID ResourceID to be used when making deposits.
        @param depositNonce ID of deposited generated by origin Bridge contract.
        @param data Data originally provided when deposit was made.
        @notice Proposal must have Passed status.
        @notice Hash of {data} must equal proposal's {dataHash}.
        @notice Emits {ProposalEvent} event with status {Executed}.
     */
    function executeProposal(
        uint8 chainID,
        uint64 depositNonce,
        bytes calldata data,
        bytes32 resourceID,
        bytes[] memory sig,
        bytes memory superSig
    ) public {
  
        _verfiyExecuteProposal(chainID,depositNonce,data,resourceID,sig,superSig);

        address handler = _resourceIDToHandlerAddress[resourceID];
        uint72 nonceAndID = (uint72(depositNonce) << 8) | uint72(chainID);
        bytes32 dataHash = keccak256(abi.encodePacked(handler, data));

        Proposal storage proposal = _proposals[nonceAndID][dataHash];
        require(
            proposal._status != ProposalStatus.Executed,
            "Proposal must have Passed status"
        );
        proposal._status = ProposalStatus.Executed;
        
        console.log("handler address %s",handler);
        IDepositExecute depositHandler = IDepositExecute(handler);
        uint256 fee = depositHandler.executeProposal(resourceID, data);

        console.log("sol 1");
        emit ProposalEvent(
            chainID,
            depositNonce,
            ProposalStatus.Executed,
            resourceID,
            dataHash
        );

        console.log("sol 2");
        //from layer1 -> layer2 just send Weth to coinbase 
        _rewardWethFee(fee);
    }

}
