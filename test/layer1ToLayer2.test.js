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
  getSign,
  getAbiterList
} = require('../scripts/utils/helper')


const {
  registerResource,
  setBurn
} = require("../scripts/utils/bridge")

const {
  addMinter
} = require("../scripts/utils/erc20")



describe(`layer1 => layer2 `, () => {

  let INITIAL_FEE = 100

  let deplyer,admin,alice
  let chainID
  before(`load accounts and chainID`, async () => {
    ;[ deplyer, admin,alice ] = await ethers.getSigners()
    chainID = await getChainId();
    //console.log("chainID is :" + chainID);
  })

  let bridgeContract,wethHandlerContract
  beforeEach(`deploy Bridge contract`, async () => {

    //console.log("chainID is :" + chainID);
    args = {
        "chainId": chainID,
        "relayers":[admin.address],
        "relayerThreshold":1,
        "fee":INITIAL_FEE,
        "expiry":100,
        "gasPrice":0x02540be400,
        "gasLimit":0x7a1200,
        "dest":83,
        "recipient":alice.address,
        "resourceId":"0xe86ee9f56944ada89e333f06eb40065a86b50a19c5c19dc94fe2d9e15cf947c8"
    }

    //DST_BRIDGE
    bridgeContract =  await deployBridgeContract(deplyer,args);

  })

  const Bridge = require('../artifacts/contracts/Bridge.sol/Bridge.json');
  const privKey = "0xc03b0a988e2e18794f2f0e881d7ffcd340d583f63c1be078426ae09ddbdec9f5";
  it(`deposit run in layer1`, async () => {

    //
    let fee = utils.parseEther("0.1");
    let transferAmount = utils.parseEther("10");
    let totalAmount = utils.parseEther("10.1");

    //1.change fee
    await bridgeContract.adminChangeFee(fee)

    //2.deployer contract
    args.bridgeAddress = bridgeContract.address;
    wethHandlerContract = await deployWETHHandler(deplyer,args);

    args.bridge = bridgeContract.address;
    args.handler = wethHandlerContract.address;
    args.targetContract = "0x977e762f384a5909140e91523929A9E188B6bB65";
    await registerResource(deplyer,args);

    args.amount = transferAmount;
   
    let data = '0x' +
    ethers.utils.hexZeroPad(args.amount.toHexString(), 32).substr(2) +                               // Deposit Amount        (32 bytes)
    ethers.utils.hexZeroPad(ethers.utils.hexlify((args.recipient.length - 2)/2), 32).substr(2) +     // len(recipientAddress) (32 bytes)
    args.recipient.substr(2);                                                                        // recipientAddress      (?? bytes)
    
    try{
      let tx = await bridgeContract.deposit(
        args.dest,args.resourceId,data,{
          value:totalAmount
        }
      );
      
      let result = await tx.wait();
      console.log("layer1 deposit gas used : " + result.gasUsed);


      afterEthBalace = await utils.formatEther(await ethers.provider.getBalance(args.bridge));
      //console.log("srcHandler eth : " + afterEthBalace);
      //afterEthBalace.expect.toHexString.before
      expect(afterEthBalace).to.equal("10.1")
      
    } catch (e) {
      console.log("error ");
      console.log(e);
    }

  })


  it(`executeProposal run in layer2`, async () => {

    try{

      //SRC_BRIDGE
      contractAmount = utils.parseEther("1");
      await deplyer.sendTransaction({
          to: bridgeContract.address, 
          value: contractAmount
      })

      let amount = utils.parseEther("0.3");
      args.amount = amount

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

      await registerResource(deplyer,args);
      await setBurn(deplyer,args);
      await addMinter(deplyer,args);

      await sleep(2000);
    
      let abiterList = getAbiterList();
      await bridgeContract.setAbiterList(abiterList,32);

      const data = '0x' +
      ethers.utils.hexZeroPad(args.amount.toHexString(), 32).substr(2) +                               // Deposit Amount        (32 bytes)
      ethers.utils.hexZeroPad(ethers.utils.hexlify((args.recipient.length - 2)/2), 32).substr(2) +     // len(recipientAddress) (32 bytes)
      args.recipient.substr(2);                                                                        // recipientAddress      (?? bytes)
      
      let depositNonce = 0;
      let sign = await getSign(args.dest,depositNonce,args.resourceId,data); 
      
      await bridgeContract.executeProposal(
          args.dest,
          depositNonce,
          data,
          args.resourceId,
          sign
      )
      
      //
      let afterTokenBalance = await utils.formatEther(await ERC20.balanceOf(args.recipient));
      expect(afterTokenBalance).to.equal("0.3")
      

    }catch(e){
      console.log(e);
    }




  })





})
