/* External Imports */
const { ethers, network } = require('hardhat')
const chai = require('chai')
const { solidity } = require('ethereum-waffle')
const { expect } = chai

chai.use(solidity)

const {
  deployBridgeContract,
  deployWETHHandler,
  deployERC20Handler,
  deployERC20
} = require("../scripts/utils/deploy")

const { utils } = require('ethers')

const {
  sleep,
  getSignBatch,
  getAbiterList,
  getAbiterSign
} = require('../scripts/utils/helper')


const {
  registerResource,
  setBurn
} = require("../scripts/utils/bridge")

const {
  addMinter,
  approve,
} = require("../scripts/utils/erc20")



describe(`layer2 => layer1 `, () => {

  let INITIAL_FEE = 100

  let deplyer,admin,alice
  let chainID
  before(`load accounts and chainID`, async () => {
    ;[ deplyer, admin,alice ] = await ethers.getSigners()

    console.log(deplyer.address);
    console.log(admin.address);
    console.log(alice.address);

  
    chainID = await getChainId();
    //console.log("chainID is :" + chainID);
  })

  let bridgeContract,wethHandlerContract
  beforeEach(`deploy Bridge contract`, async () => {

    //console.log("chainID is :" + chainID);
    args = {
        "chainId": chainID,
        "relayers":[deplyer.address],
        "relayerThreshold":1,
        "fee":INITIAL_FEE,
        "expiry":100,
        "gasPrice":0x02540be400,
        "gasLimit":12500000,
        "dest":80,
        "recipient":alice.address,
        "resourceId":"0xe86ee9f56944ada89e333f06eb40065a86b50a19c5c19dc94fe2d9e15cf947c8"
    }

    //DST_BRIDGE
    bridgeContract =  await deployBridgeContract(deplyer,alice.address,args);

  })

  const Bridge = require('../artifacts/contracts/Bridge.sol/Bridge.json');
  const privKey = "0xc03b0a988e2e18794f2f0e881d7ffcd340d583f63c1be078426ae09ddbdec9f5";

  it(`deposit run in layer2`, async () => {

    //
    let fee = utils.parseEther("0.1");
    let transferAmount = utils.parseEther("10");
    args.amount = transferAmount;

    //1.change fee
    await bridgeContract.adminChangeFee(fee)

    //2.deployer contract
    args.bridge  = bridgeContract.address;
    args.bridgeAddress  = bridgeContract.address;
    args.erc20Name = "Test"
    args.erc20Symbol = "Test"
    let ERC20Handler = await deployERC20Handler(deplyer,args);

    args.handler = ERC20Handler.address;
    args.minter = ERC20Handler.address;
    let ERC20 = await deployERC20(deplyer,args);
    args.targetContract = ERC20.address;
    args.erc20Address = ERC20.address;
    args.erc20 = ERC20.address;

    await registerResource(deplyer,args);
    await setBurn(deplyer,args);
    await addMinter(deplyer,args);

    transferAmount = utils.parseEther("20");
    await ERC20.mint(args.recipient,transferAmount);

    let beforeTokenBalance = await utils.formatEther(await ERC20.balanceOf(args.recipient));
    expect(beforeTokenBalance).to.equal("20.0")

    let data = '0x' +
    ethers.utils.hexZeroPad(args.amount.toHexString(), 32).substr(2) +                               // Deposit Amount        (32 bytes)
    ethers.utils.hexZeroPad(fee.toHexString(), 32).substr(2) +                                        // Deposit Amount        (32 bytes)
    ethers.utils.hexZeroPad(ethers.utils.hexlify((args.recipient.length - 2)/2), 32).substr(2) +     // len(recipientAddress) (32 bytes)
    args.recipient.substr(2);                                                                        // recipientAddress      (?? bytes)
    
    //3.mint 10
    args.recipient =  ERC20Handler.address
    args.amount =  utils.parseEther("20");
    await approve(alice,args);
    
    try{
      await bridgeContract.connect(alice).deposit(
        args.dest,args.resourceId,data,{
          value:fee
        }
      );

      let afterTokenBalance = await utils.formatEther(await ERC20.balanceOf(args.recipient));
      expect(afterTokenBalance).to.equal("0.0")

    } catch (e) {
      console.log("error ");
      console.log(e);
    }

  })


  // it(`executeProposalBatch 1 tx run in layer1`, async () => {

  //   try{
  //     args.recipient = "0x534369554D1F1B36e5527793d67A7774A45BD8D1";
       
  //     //SRC_BRIDGE
  //     contractAmount = utils.parseEther("100");
  //     await deplyer.sendTransaction({
  //         to: bridgeContract.address, 
  //         value: contractAmount
  //     })

  //     //2.deployer contract
  //     args.bridgeAddress = bridgeContract.address;
  //     wethHandlerContract = await deployWETHHandler(deplyer,args);

  //     let amount = utils.parseEther("0.3");
  //     args.amount = amount

  //     args.bridge = bridgeContract.address;
  //     args.handler = wethHandlerContract.address;
  //     args.targetContract = "0x977e762f384a5909140e91523929A9E188B6bB65";
  //     await registerResource(deplyer,args);


  //     await sleep(2000);
    
  //     let abiterList = getAbiterList();
  //     let signList = await getAbiterSign(abiterList);
  //     await bridgeContract.setAbiterList(abiterList,12,signList);

  //     const data = '0x' +
  //     ethers.utils.hexZeroPad(args.amount.toHexString(), 32).substr(2) +                               // Deposit Amount        (32 bytes)
  //     ethers.utils.hexZeroPad(ethers.utils.hexlify((args.recipient.length - 2)/2), 32).substr(2) +     // len(recipientAddress) (32 bytes)
  //     args.recipient.substr(2);                                                                        // recipientAddress      (?? bytes)
      
  //     let tokenLen = 1;
  //     let dataArray = []
  //     let depositNonce = []
  //     let resourceID = [];
  //     for(var i = 1 ;i < (tokenLen + 1);i ++){

  //         depositNonce.push(i);
  //         dataArray.push(data);
  //         resourceID.push(args.resourceId);

  //     }
  //     let sign = await getSignBatch(args.dest,depositNonce,resourceID,dataArray); 

  //     let tx = await bridgeContract.executeProposalBatch(
  //         args.dest,
  //         depositNonce,
  //         dataArray,
  //         resourceID,
  //         sign,
  //         {
  //           gasPrice: args.gasPrice,
  //           gasLimit: args.gasLimit
  //       }
  //     )
  //     let result = await tx.wait();
  //     console.log("layer1 deposit gas used : " + result.gasUsed);

  //     //let afterTokenBalance = await utils.formatEther(await ERC20.balanceOf(args.recipient));
  //     let afterEthBalace = await utils.formatEther(await ethers.provider.getBalance(args.recipient));
  //     expect(afterEthBalace).to.equal("0.3")
      

  //   }catch(e){
  //     console.log(e);
  //   }
    

  // })

  // it(`executeProposalBatch 100 tx run in layer1`, async () => {

  //   try{
  //     args.recipient = "0x534369554D1F1B36e5527793d67A7774A45BD8D1";
       
  //     //SRC_BRIDGE
  //     contractAmount = utils.parseEther("0.1");
  //     await deplyer.sendTransaction({
  //         to: bridgeContract.address, 
  //         value: contractAmount
  //     })

  //     //2.deployer contract
  //     args.bridgeAddress = bridgeContract.address;
  //     wethHandlerContract = await deployWETHHandler(deplyer,args);

  //     let amount = utils.parseEther("0.00003");
  //     args.amount = amount

  //     args.bridge = bridgeContract.address;
  //     args.handler = wethHandlerContract.address;
  //     args.targetContract = "0x977e762f384a5909140e91523929A9E188B6bB65";
  //     await registerResource(deplyer,args);


  //     await sleep(2000);
    
  //     let abiterList = getAbiterList();
  //     let signList = await getAbiterSign(abiterList);
  //     await bridgeContract.setAbiterList(abiterList,12,signList);

  //     const data = '0x' +
  //     ethers.utils.hexZeroPad(args.amount.toHexString(), 32).substr(2) +                               // Deposit Amount        (32 bytes)
  //     ethers.utils.hexZeroPad(ethers.utils.hexlify((args.recipient.length - 2)/2), 32).substr(2) +     // len(recipientAddress) (32 bytes)
  //     args.recipient.substr(2);                                                                        // recipientAddress      (?? bytes)
      
  //     let tokenLen = 100;
  //     let dataArray = []
  //     let depositNonce = []
  //     let resourceID = [];
  //     for(var i = 1 ;i < (tokenLen + 1);i ++){

  //         depositNonce.push(i);
  //         dataArray.push(data);
  //         resourceID.push(args.resourceId);

  //     }
  //     let sign = await getSignBatch(args.dest,depositNonce,resourceID,dataArray); 

  //     let tx = await bridgeContract.executeProposalBatch(
  //         args.dest,
  //         depositNonce,
  //         dataArray,
  //         resourceID,
  //         sign,
  //         {
  //           gasPrice: args.gasPrice,
  //           gasLimit: args.gasLimit
  //         }
  //     )
  //     let result = await tx.wait();
  //     console.log("layer1 deposit gas used : " + result.gasUsed);

  //     //let afterTokenBalance = await utils.formatEther(await ERC20.balanceOf(args.recipient));
  //     let afterEthBalace = await utils.formatEther(await ethers.provider.getBalance(args.recipient));
  //     expect(afterEthBalace).to.equal("15.3")
      

  //   }catch(e){
  //     console.log(e);
  //   }
    

  // }).timeout(2000000);



})
