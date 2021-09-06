// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./utils/Pausable.sol";
import "./interfaces/IDepositExecute.sol";
import "./interfaces/IBridge.sol";
import "./interfaces/IERCHandler.sol";
import "./interfaces/IGenericHandler.sol";
import "./handlers/HandlerHelpers.sol";

//import "hardhat/console.sol";

/**
    @title Facilitates deposits, creation and votiing of deposit proposals, and deposit executions.
    @author ChainSafe Systems.
 */
contract Bridge is Pausable, AccessControl, HandlerHelpers {
    
    uint8 public _chainID;
    uint256 public _fee;
    uint256 public _expiry;
    bool private _isFirstSet;
    address private _owner;

    enum ProposalStatus {
        Inactive,
        Active,
        Passed,
        Executed,
        Cancelled
    }

    struct Proposal {
        bytes32 _resourceID;
        bytes32 _dataHash;
        ProposalStatus _status;
        uint256 _proposedBlock;
    }

    // destinationChainID => number of deposits
    mapping(uint8 => uint64) public _depositCounts;
    // resourceID => handler address
    mapping(bytes32 => address) public _resourceIDToHandlerAddress;
    // depositNonce => destinationChainID => bytes
    mapping(uint64 => mapping(uint8 => bytes)) public _depositRecords;
    // destinationChainID + depositNonce => dataHash => Proposal
    mapping(uint72 => mapping(bytes32 => Proposal)) public _proposals;

    event Deposit(
        uint8 indexed destinationChainID,
        bytes32 indexed resourceID,
        uint64 indexed depositNonce
    );
    event ProposalEvent(
        uint8 indexed originChainID,
        uint64 indexed depositNonce,
        ProposalStatus indexed status,
        bytes32 resourceID,
        bytes32 dataHash
    );

    event ProposalEventBatch(
        uint8 indexed originChainID,
        uint64[] indexed depositNonce,
        ProposalStatus[] indexed status,
        bytes32[] resourceID,
        bytes32[] dataHash
    );

    bytes32 public constant WETH_RESOURCEID = keccak256("WETH_RESOURCEID");

    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    function _onlyOwner() private view {
        require(
             _owner == msg.sender,
            "sender doesn't have admin role"
        );
    }

    /**
        @notice Initializes Bridge, creates and grants {msg.sender} the admin role,
        creates and grants {initialRelayers} the relayer role.
        @param chainID ID of chain the Bridge contract exists on.
        @param fee cross chain fee
        @param expiry cross chain expiry time setting.
     */
    constructor(
        uint8 chainID,
        uint256 fee,
        uint256 expiry
    ) public payable {
        _chainID = chainID;
        _fee = fee;
        _expiry = expiry;
        // _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _owner = msg.sender;
        _isFirstSet = false;
    }

    function changeAdmin(address newOwner) external onlyOwner{
        _owner = newOwner;
    }

    /**
        @notice Removes admin role from {msg.sender} and grants it to {newAdmin}.
        @notice Only callable by an address that currently has the admin role.
        @param newAdmin Address that admin role will be granted to.
     */
    function renounceAdmin(address newAdmin) external onlyOwner {
        grantRole(DEFAULT_ADMIN_ROLE, newAdmin);
        renounceRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
        @notice Pauses deposits, proposal creation and voting, and deposit executions.
        @notice Only callable by an address that currently has the admin role.
     */
    function adminPauseTransfers() external onlyOwner {
        _pause();
    }

    /**
        @notice Unpauses deposits, proposal creation and voting, and deposit executions.
        @notice Only callable by an address that currently has the admin role.
     */
    function adminUnpauseTransfers() external onlyOwner {
        _unpause();
    }

    /**
        @notice Sets a new resource for handler contracts that use the IERCHandler interface,
        and maps the {handlerAddress} to {resourceID} in {_resourceIDToHandlerAddress}.
        @notice Only callable by an address that currently has the admin role.
        @param handlerAddress Address of handler resource will be set for.
        @param resourceID ResourceID to be used when making deposits.
        @param tokenAddress Address of contract to be called when a deposit is made and a deposited is executed.
     */
    function adminSetResource(
        address handlerAddress,
        bytes32 resourceID,
        address tokenAddress
    ) external onlyOwner {
        _resourceIDToHandlerAddress[resourceID] = handlerAddress;
        IERCHandler handler = IERCHandler(handlerAddress);
        handler.setResource(resourceID, tokenAddress);
    }

    /**
        @notice Sets a new resource for handler contracts that use the IGenericHandler interface,
        and maps the {handlerAddress} to {resourceID} in {_resourceIDToHandlerAddress}.
        @notice Only callable by an address that currently has the admin role.
        @param handlerAddress Address of handler resource will be set for.
        @param resourceID ResourceID to be used when making deposits.
        @param contractAddress Address of contract to be called when a deposit is made and a deposited is executed.
     */
    function adminSetGenericResource(
        address handlerAddress,
        bytes32 resourceID,
        address contractAddress,
        bytes4 depositFunctionSig,
        bytes4 executeFunctionSig
    ) external onlyOwner {
        _resourceIDToHandlerAddress[resourceID] = handlerAddress;
        IGenericHandler handler = IGenericHandler(handlerAddress);
        handler.setResource(
            resourceID,
            contractAddress,
            depositFunctionSig,
            executeFunctionSig
        );
    }

    /**
        @notice Sets a resource as burnable for handler contracts that use the IERCHandler interface.
        @notice Only callable by an address that currently has the admin role.
        @param handlerAddress Address of handler resource will be set for.
        @param tokenAddress Address of contract to be called when a deposit is made and a deposited is executed.
     */
    function adminSetBurnable(address handlerAddress, address tokenAddress)
        external
        onlyOwner
    {
        IERCHandler handler = IERCHandler(handlerAddress);
        handler.setBurnable(tokenAddress);
    }

    /**
        @notice Returns a proposal.
        @param originChainID Chain ID deposit originated from.
        @param depositNonce ID of proposal generated by proposal's origin Bridge contract.
        @param dataHash Hash of data to be provided when deposit proposal is executed.
        @return Proposal which consists of:
        - _dataHash Hash of data to be provided when deposit proposal is executed.
        - _yesVotes Number of votes in favor of proposal.
        - _noVotes Number of votes against proposal.
        - _status Current status of proposal.
     */
    function getProposal(
        uint8 originChainID,
        uint64 depositNonce,
        bytes32 dataHash
    ) external view returns (Proposal memory) {
        uint72 nonceAndID = (uint72(depositNonce) << 8) | uint72(originChainID);
        return _proposals[nonceAndID][dataHash];
    }

    /**
        @notice Changes deposit fee.
        @notice Only callable by admin.
        @param newFee Value {_fee} will be updated to.
     */
    function adminChangeFee(uint256 newFee) external onlyOwner {
        require(_fee != newFee, "Current fee is equal to new fee");
        _fee = newFee;
    }

    function getFee() external view returns (uint256) {
        return _fee;
    }

    /**
        @notice Used to manually withdraw funds from ERC safes.
        @param handlerAddress Address of handler to withdraw from.
        @param tokenAddress Address of token to withdraw.
        @param recipient Address to withdraw tokens to.
        @param amountOrTokenID Either the amount of ERC20 tokens or the ERC721 token ID to withdraw.
     */
    function adminWithdraw(
        address handlerAddress,
        address tokenAddress,
        address recipient,
        uint256 amountOrTokenID
    ) external onlyOwner {
        IERCHandler handler = IERCHandler(handlerAddress);
        handler.withdraw(tokenAddress, recipient, amountOrTokenID);
    }

    /**
        @notice Initiates a transfer using a specified handler contract.
        @notice Only callable when Bridge is not paused.
        @param destinationChainID ID of chain deposit will be bridged to.
        @param resourceID ResourceID used to find address of handler to be used for deposit.
        @param data Additional data to be passed to specified handler.
        @notice Emits {Deposit} event.
     */
    function deposit(
        uint8 destinationChainID,
        bytes32 resourceID,
        bytes calldata data
    ) external payable whenNotPaused {
        uint256 amount;
        address handler = _resourceIDToHandlerAddress[resourceID];
        require(handler != address(0), "resourceID not mapped to handler");

        uint64 depositNonce = ++_depositCounts[destinationChainID];
        _depositRecords[depositNonce][destinationChainID] = data;

        IDepositExecute depositHandler = IDepositExecute(handler);
        if (depositHandler.getType() == IDepositExecute.HandleTypes.WETH) {
            (amount, ) = abi.decode(data, (uint256, uint256));
            require(msg.value >= _fee + amount, "fee is not enought");
        } else {
            require(msg.value >= _fee, "fee is not enought");
        }
        depositHandler.deposit(
            resourceID,
            destinationChainID,
            depositNonce,
            msg.sender,
            data
        );

        emit Deposit(destinationChainID, resourceID, depositNonce);
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
        bytes[] memory sig
    ) public {
        bool isAbiterVerifierd = false;
        isAbiterVerifierd = _verifyAbter(
            chainID,
            depositNonce,
            data,
            resourceID,
            sig
        );

        require(isAbiterVerifierd, "Verify abiter do not pass");

        address handler = _resourceIDToHandlerAddress[resourceID];
        uint72 nonceAndID = (uint72(depositNonce) << 8) | uint72(chainID);
        bytes32 dataHash = keccak256(abi.encodePacked(handler, data));

        Proposal storage proposal = _proposals[nonceAndID][dataHash];
        require(
            proposal._status != ProposalStatus.Executed,
            "Proposal must have Passed status"
        );
        proposal._status = ProposalStatus.Executed;

        IDepositExecute depositHandler = IDepositExecute(handler);
        depositHandler.executeProposal(resourceID, data);

        emit ProposalEvent(
            chainID,
            depositNonce,
            ProposalStatus.Executed,
            resourceID,
            dataHash
        );

        //console.log("xxl executeProposal end ");
    }

    /**
        @notice Executes a deposit proposal that is considered passed using a specified handler contract.
        @notice Only callable by relayers when Bridge is not paused.
        @param chainID ID of chain deposit originated from.
        @param resourceID ResourceID to be used when making deposits.
        @param depositNonce ID of deposited generated by origin Bridge contract.
        @param data Data originally provided when deposit was made.
        @param sig signature for abiter.
        @notice Proposal must have Passed status.
        @notice Hash of {data} must equal proposal's {dataHash}.
        @notice Emits {ProposalEvent} event with status {Executed}.
     */
    function executeProposalBatch(
        uint8 chainID,
        uint64[] memory depositNonce,
        bytes[] calldata data,
        bytes32[] memory resourceID,
        bytes[] memory sig
    ) public {
        _verifyBatch(chainID, depositNonce, data, resourceID, sig);
        _excuteBatch(chainID, depositNonce, data, resourceID);
    }

    function _verifyBatch(
        uint8 chainID,
        uint64[] memory depositNonce,
        bytes[] calldata data,
        bytes32[] memory resourceID,
        bytes[] memory sig
    ) internal view {
        //function _verifyBatch(uint8 chainID, uint64[] memory depositNonce, bytes[] calldata data, bytes32[] memory resourceID,bytes[] memory sig) public{

        //console.log("xxl come to executeProposalBatch ");
        bool isAbiterVerifierd = false;
        isAbiterVerifierd = _verifyAbterBatch(
            chainID,
            depositNonce,
            data,
            resourceID,
            sig
        );

        //console.log("abiter verify result : ");
        //console.log(isAbiterVerifierd);
        require(isAbiterVerifierd, "Verify abiter do not pass");

        //console.log("batch verify OK ...");
    }

    //xxl TODO 5 为了防止攻击，在执行成功时候再退钱
    function _excuteBatch(
        uint8 chainID,
        uint64[] memory depositNonce,
        bytes[] calldata data,
        bytes32[] memory resourceID
    ) internal {
        //console.log("come to executeProposalBatch");
        uint256 lenBatch = depositNonce.length;
        ProposalStatus[] memory arrProposalStatus;
        bytes32[] memory arrDataHash;
        arrProposalStatus = new ProposalStatus[](lenBatch);
        arrDataHash = new bytes32[](lenBatch);

        //xxl TODO 4 修改比较大 再议
        for (uint256 i = 0; i < lenBatch; i++) {
            //console.log("run number %d",(i + 1));
            address handler = _resourceIDToHandlerAddress[resourceID[i]];
            uint72 nonceAndID = (uint72(depositNonce[i]) << 8) |
                uint72(chainID);
            bytes32 dataHash = keccak256(abi.encodePacked(handler, data[i]));
            Proposal storage proposal = _proposals[nonceAndID][dataHash];

            if (proposal._status != ProposalStatus.Executed) {
                proposal._status = ProposalStatus.Executed;

                arrProposalStatus[i] = proposal._status;
                arrDataHash[i] = dataHash;

                if (resourceID[i] == WETH_RESOURCEID) {
                    _executeWeth(data[i]);
                } else {
                    IDepositExecute depositHandler = IDepositExecute(handler);
                    depositHandler.executeProposal(resourceID[i], data[i]);
                }
            }
        }

        emit ProposalEventBatch(
            chainID,
            depositNonce,
            arrProposalStatus,
            resourceID,
            arrDataHash
        );
        delete arrProposalStatus;
        delete arrDataHash;
    }

    function _executeWeth(bytes calldata data) public {
        uint256 amount;
        uint256 lenDestinationRecipientAddress;
        bytes memory destinationRecipientAddress;

        (amount, lenDestinationRecipientAddress) = abi.decode(
            data,
            (uint256, uint256)
        );
        destinationRecipientAddress = bytes(
            data[64:64 + lenDestinationRecipientAddress]
        );

        bytes20 recipientAddress;
        assembly {
            recipientAddress := mload(add(destinationRecipientAddress, 0x20))
        }

        //console.log(address(recipientAddress));
        //console.log(amount);

        _safeTransferETH(address(recipientAddress), amount);
    }

    /**
        @notice Transfers eth in the contract to the specified addresses. The parameters addrs and amounts are mapped 1-1.
        This means that the address at index 0 for addrs will receive the amount (in WEI) from amounts at index 0.
        @param addrs Array of addresses to transfer {amounts} to.
        @param amounts Array of amonuts to transfer to {addrs}.
     */
    function transferFunds(
        address payable[] calldata addrs,
        uint256[] calldata amounts
    ) external onlyOwner {
        for (uint256 i = 0; i < addrs.length; i++) {
            addrs[i].transfer(amounts[i]);
        }
    }

    /**
     * @dev Internal accounting function for moving around L1 ETH.
     *
     * @param _to L1 address to transfer ETH to
     * @param _value Amount of ETH to send to
     */
    function _safeTransferETH(address _to, uint256 _value) public {
        (bool success, ) = _to.call{value: _value}(new bytes(0));

        // console.log("transfer is start ");
        // console.log(success);
        // console.log("transfer is end ");

        require(
            success,
            "TransferHelper::safeTransferETH: ETH transfer failed"
        );
    }

    //xxl TODO 3 solidity 省gas的多签方式
    /**
     * @dev set abiter list
     * @param _addressList abiter public list
     */
    function setAbiterList(
        address[] memory _addressList,
        uint256 _addressCount,
        bytes[] memory _sig
    ) external {

        if (_isFirstSet == false) {
            _onlyOwner();
            _isFirstSet = true;
        }else{
            require(_verifyAbiterSwift(_sig),"abiter verify error");
        }

        _signers = _addressList;
        _totalCount = _addressCount;
    }

    /**
     * @dev get abiter list
     */
    function getAbiterList() external view returns (address[] memory) {
        return _signers;
    }

    // get eth balance of contract
    function getBalanceOfContract() public view returns (uint256) {
        return address(this).balance;
    }

    // send value to address
    function sendValue(address payable addr, uint256 amount)
        public
        payable
        onlyOwner
    {
        addr.transfer(amount);
    }

    fallback() external payable {}

    receive() external payable {}
}
