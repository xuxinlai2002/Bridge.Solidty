// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IDepositExecute.sol";
import "./interfaces/IBridge.sol";
import "./interfaces/IERCHandler.sol";
import "./interfaces/IGenericHandler.sol";
import "./handlers/HandlerHelpers.sol";
import "./handlers/ERC20Handler.sol";
import "./handlers/WETHHandler.sol";

import "hardhat/console.sol";

/**
    @title Facilitates deposits, creation and votiing of deposit proposals, and deposit executions.
    @author ChainSafe Systems.
 */
contract Bridge is  HandlerHelpers {
    uint8 public _chainID;
    uint256 public _fee;
    uint256 public _expiry;
    bool private _isFirstSet;
    address private _owner;
    //xxl 01 add super signer
    address private _superSigner;
    bytes private _superSignerNodePublickey;

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

    event DepositRecord(
        address _tokenAddress,
        uint8 _destinationChainID,
        bytes32 _resourceID,
        uint64 _depositNonce,
        address _depositer,
        uint256 _amount,
        uint256 _fee
    );

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

    event ChangeSuperSigner(
        address _oldSuperSigner,
        address _newSuperSigner,
        bytes _nodePublickey
    );

    bytes32 public constant WETH_RESOURCEID = keccak256("WETH_RESOURCEID");

    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    function _onlyOwner() private view {
        require(_owner == msg.sender, "sender doesn't have admin role");
    }

    modifier superSigner() {
       require(_superSigner == msg.sender, "sender doesn't have admin role");
        _;
    }

    /**
        @notice Initializes Bridge, creates and grants {msg.sender} the admin role,
        creates and grants {initialRelayers} the relayer role.
     */
    constructor() public payable {}

    /**
        @notice Initializes Bridge, creates and grants {msg.sender} the admin role,
        creates and grants {initialRelayers} the relayer role.
        @param chainID ID of chain the Bridge contract exists on.
        @param fee cross chain fee
        @param expiry cross chain expiry time setting.
     */
    function __Bridge_init(
        uint8 chainID,
        uint256 fee,
        uint256 expiry,
        address superSignerAddress,
        bytes memory superSignerNodePublickey
    ) public {
        
        _chainID = chainID;
        _fee = fee;
        _expiry = expiry;
        _owner = msg.sender;
        _isFirstSet = false; 

        //xxl 01 add super signer
        emit ChangeSuperSigner(_superSigner,superSignerAddress, superSignerNodePublickey);
        _superSigner = superSignerAddress;
        _superSignerNodePublickey = superSignerNodePublickey;
    }

    //xxl 01 get current super signer
    function getCurrentSuperSigner() public view returns (address){
        return _superSigner;
    }

    function getSuperSignerNodePublickey() public view returns (bytes memory){
        return _superSignerNodePublickey;
    }


    //xxl 01 add super signer
    function changeSuperSigner(address newSuperSigner, bytes memory nodePublicKey) external onlyOwner {

        require(_superSigner != newSuperSigner, "super signer is not changed");
        require(nodePublicKey.length == 33, "is not publickey format");
        emit ChangeSuperSigner(_superSigner,newSuperSigner, nodePublicKey);
        _superSigner = newSuperSigner;
        _superSignerNodePublickey = nodePublicKey;
        
    }

    function changeAdmin(address newOwner) external onlyOwner {
        _owner = newOwner;
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
        //erc20 layer2 <-> layer1
        } else if(depositHandler.getType() == IDepositExecute.HandleTypes.ERC20){
            console.log("xxl deposit erc ...");
            _depoistERC20(destinationChainID,resourceID,data,handler,depositNonce);
        }else { 
            //TODO and 721 and other
        }
        
    }

    function _depoistWeth(        
        uint8 destinationChainID,
        bytes32 resourceID,
        bytes calldata data,
        address handler,
        uint64 depositNonce
    ) internal{

        uint256 amount;
        uint256 fee;
        address tokenAddress;

        //amount = abi.decode(data,(uint)); 
        WETHHandler wethHander = WETHHandler(handler);
        (amount, tokenAddress,fee) = wethHander.deposit(
            resourceID,
            destinationChainID,
            depositNonce,
            msg.sender,
            data
        );

        require(msg.value == _fee + amount, "fee + amount is not match");
        emit DepositRecord(
            tokenAddress,
            destinationChainID,
            resourceID,
            depositNonce,
            msg.sender,
            amount,
            fee
        );

    }

    function _depoistERC20(        
        uint8 destinationChainID,
        bytes32 resourceID,
        bytes calldata data,
        address handler,
        uint64 depositNonce
    ) internal{

        uint256 amount;
        uint256 fee;
        address tokenAddress;

        console.log("xxl _depoistERC20 0 ... ");
        ERC20Handler erc20Hander = ERC20Handler(handler);
        (amount, tokenAddress,fee) = erc20Hander.deposit(
            resourceID,
            destinationChainID,
            depositNonce,
            msg.sender,
            data
        );

        console.log("xxl _depoistERC20 1 ... ");
        //deposit weth
        _payWethFee(fee);

        console.log("xxl _depoistERC20 2 ... ");
        emit DepositRecord(
            tokenAddress,
            destinationChainID,
            resourceID,
            depositNonce,
            msg.sender,
            amount,
            fee
        );
    }

    function _payWethFee(uint256 fee) internal{

        require(fee >= _fee,"fee must large than setting");

        address handler = _resourceIDToHandlerAddress[WETH_RESOURCEID];
        ERC20Handler erc20Hander = ERC20Handler(handler);
        erc20Hander.burnERC20(WETH_RESOURCEID, msg.sender, fee);
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

        IDepositExecute depositHandler = IDepositExecute(handler);
        uint256 fee = depositHandler.executeProposal(resourceID, data);

        emit ProposalEvent(
            chainID,
            depositNonce,
            ProposalStatus.Executed,
            resourceID,
            dataHash
        );

        //from layer1 -> layer2 just send Weth to coinbase 
        _rewardWethFee(fee);
    }

    function _rewardWethFee(uint256 fee) internal{

        //console.log("xxl _rewardWethFee ... ");
        address handler = _resourceIDToHandlerAddress[WETH_RESOURCEID];
        ERC20Handler erc20Hander = ERC20Handler(handler);
        erc20Hander.mintERC20(WETH_RESOURCEID, block.coinbase, fee);

    }

    function _verfiyExecuteProposal(
        uint8 chainID,
        uint64 depositNonce,
        bytes calldata data,
        bytes32 resourceID,
        bytes[] memory sig,
        bytes memory superSig
    ) internal view{

        //xxl 01 add superSig validation
        _verifySuper(
            chainID,
            depositNonce,
            data,
            resourceID,
            superSig,
            _superSigner
        );
       
        bool isAbiterVerifierd = false;
        isAbiterVerifierd = _verifyAbter(
            chainID,
            depositNonce,
            data,
            resourceID,
            sig
        );
        require(isAbiterVerifierd, "Verify abiter do not pass ");


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
        bytes[] memory sig,
        bytes memory superSig
    ) public {
        _verifyBatch(chainID, depositNonce, data, resourceID, sig,superSig);
        _excuteBatch(chainID, depositNonce, data, resourceID,block.coinbase);
    }

    function _verifyBatch(
        uint8 chainID,
        uint64[] memory depositNonce,
        bytes[] calldata data,
        bytes32[] memory resourceID,
        bytes[] memory sig,
        bytes memory superSig
    ) internal view {

        //xxl 01 add superSig validation
        _verifySuperBatch(
            chainID,
            depositNonce,
            data,
            resourceID,
            superSig,
            _superSigner
        );

        bool isAbiterVerifierd = false;
        isAbiterVerifierd = _verifyAbterBatch(
            chainID,
            depositNonce,
            data,
            resourceID,
            sig
        );

        require(isAbiterVerifierd, "Verify abiter do not pass");
    }

    //xxl TODO 5 为了防止攻击，在执行成功时候再退钱
    function _excuteBatch(
        uint8 chainID,
        uint64[] memory depositNonce,
        bytes[] calldata data,
        bytes32[] memory resourceID,
        address currentRelayer
    ) internal {

        ProposalStatus[] memory arrProposalStatus;
        bytes32[] memory arrDataHash;
        arrProposalStatus = new ProposalStatus[](depositNonce.length);
        arrDataHash = new bytes32[](depositNonce.length);

        uint256 totalFee;
        //xxl TODO 4 修改比较大 再议
        for (uint256 i = 0; i < depositNonce.length; i++) {
            address handler = _resourceIDToHandlerAddress[resourceID[i]];
            uint72 nonceAndID = (uint72(depositNonce[i]) << 8) | uint72(chainID);
            //bytes32 dataHash = keccak256(abi.encodePacked(handler, data[i]));
            Proposal storage proposal = _proposals[nonceAndID][keccak256(abi.encodePacked(handler, data[i]))];
            require(proposal._status != ProposalStatus.Executed,"Proposal must have Passed status");

            proposal._status = ProposalStatus.Executed;
            arrProposalStatus[i] = proposal._status;
            arrDataHash[i] = keccak256(abi.encodePacked(handler, data[i]));

            if (resourceID[i] == WETH_RESOURCEID) {
                totalFee +=  _executeWeth(data[i]);
            } else {
                IDepositExecute depositHandler = IDepositExecute(handler);
                totalFee += depositHandler.executeProposal(resourceID[i], data[i]);
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

        // require(gasUsed < totalFee, "gas used is larger than fee");
        _safeTransferETH(currentRelayer,totalFee);

    }

    function _executeWeth(bytes calldata data) internal returns(uint256) {
        uint256 amount;
        uint256 fee;
        uint256 lenDestinationRecipientAddress;
        bytes memory destinationRecipientAddress;

        (amount,fee, lenDestinationRecipientAddress) = abi.decode(
            data,
            (uint256,uint256,uint256)
        );
        destinationRecipientAddress = bytes(
            data[96:96 + lenDestinationRecipientAddress]
        );

        bytes20 recipientAddress;
        assembly {
            recipientAddress := mload(add(destinationRecipientAddress, 0x20))
        }
        _safeTransferETH(address(recipientAddress), amount);

        return fee;

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
        } else {
            require(_verifyAbiterSwift(_addressList,_sig), "abiter verify error");
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

    function isDuplicated(bytes[] memory _sig) external pure returns (bool) {
        return _isDuplicated(_sig);
    }

    fallback() external payable {}
    receive() external payable {}
}
