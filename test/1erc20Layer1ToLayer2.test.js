/* External Imports */
const { ethers, network } = require('hardhat')
const chai = require('chai')
const { solidity } = require('ethereum-waffle')
const { expect } = chai

chai.use(solidity)

const {
  deployBridgeL1Contract,
  deployWETHHandler,
  deployERC20Handler,
  deployERC20
} = require("../scripts/utils/deploy")

const { utils } = require('ethers')

const {
  sleep,
  getSign,
  getAbiterList,
  getAbiterSign,
  getSuperAbiterSign,
  getSuperAbiterErc20Sign,
  getErc20Sign
} = require('../scripts/utils/helper')


const {
  registerResource,
  setBurn
} = require("../scripts/utils/bridge")

const {
  addMinter,
  approve
} = require("../scripts/utils/erc20")
const { compose } = require('underscore')


describe(`layer1 => layer2 `, () => {

  let INITIAL_FEE = 100

  let deplyer,admin,alice
  let chainID
  let WETH
  before(`load accounts and chainID`, async () => {

    ;[ deplyer, admin,alice ] = await ethers.getSigners()
    chainID = await getChainId();
    console.log("chainID is :" + chainID);
  
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
        "resourceId":"0x0000000000000000000000000000000000000000000000000000000000000001",
        "superAddress":alice.address,
        "nodePublickey":"0x03bfd8bd2b10e887ec785360f9b329c2ae567975c784daca2f223cb19840b51914"
    }

    //DST_BRIDGE
    bridgeContract =  await deployBridgeL1Contract(deplyer,args);
    args.bridgeAddress  = bridgeContract.address;
      
  })
  
  it(`deposit run in layer1 :::`, async () => {

    ///weth
    //1.handler
    console.log("\n-----------------------------step1 deploy handler-----------------------------"); 
    let ERC20Handler = await deployERC20Handler(deplyer,args);

    //2.weth
    args.name = "TEST20"
    args.symbol = "TEST20"

    console.log("\n-----------------------------step2 deploy erc20-----------------------------");    
    WETH = await deployERC20(deplyer,args);

    //3.mint    
    console.log("\n-----------------------------step3 mint erc20-----------------------------");   
    let feeAmount = utils.parseEther("100");
    await WETH.mint(deplyer.address,feeAmount);
  
    console.log("\n-----------------------------step4 registerResource erc20-----------------------------");   
    //4.registerResource
    args.bridge = bridgeContract.address;
    args.handler = ERC20Handler.address;
    args.targetContract = WETH.address;
    args.resourceId = "0x0000000000000000000000000000000000000000000000000000000000000001";
    await registerResource(deplyer,args) ;

    //5.approve
    console.log("\n-----------------------------step5 approve erc20-----------------------------");  
    args.erc20 = WETH.address;
    args.recipient = ERC20Handler.address;
    args.amount =utils.parseEther("20");
    args.fee =utils.parseEther("1");
    await approve(deplyer,args);

    console.log("\n-----------------------------step6 approve erc20-----------------------------");  
    let fee = utils.parseEther("0.1");
    let transferAmount = utils.parseEther("10");
    let totalAmount = utils.parseEther("10.1");
    await bridgeContract.adminChangeFee(fee)

    //2.deployer contract
    args.bridgeAddress = bridgeContract.address;
    erc20HandlerContract = await deployERC20Handler(deplyer,args);

    args.bridge = bridgeContract.address;
    args.handler = erc20HandlerContract.address;
    args.targetContract = "0x977e762f384a5909140e91523929A9E188B6bB65";
    await registerResource(deplyer,args);

    args.amount = transferAmount;
   
    let data = '0x' +
    ethers.utils.hexZeroPad(args.amount.toHexString(), 32).substr(2) +
    ethers.utils.hexZeroPad(fee.toHexString(), 32).substr(2) 
    
    try{
      
      console.log("xxl 0000 1");
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

    ///weth
    //1.handler
    let WETHHandler = await deployERC20Handler(deplyer,args);

    //2.weth
    args.name = "WETH"
    args.symbol = "WETH"
    WETH = await deployERC20(deplyer,args);

    //3.mint    
    let feeAmount = utils.parseEther("100");
    await WETH.mint(deplyer.address,feeAmount);
  
    //4.registerResource
    args.bridge = bridgeContract.address;
    args.handler = WETHHandler.address;
    args.targetContract = WETH.address;
    args.resourceId = "0xe86ee9f56944ada89e333f06eb40065a86b50a19c5c19dc94fe2d9e15cf947c8";
    await registerResource(deplyer,args) ;

    //5.approve
    args.erc20 = WETH.address;
    args.recipient = WETHHandler.address;
    args.amount =utils.parseEther("20");
    args.fee =utils.parseEther("1");
    await approve(deplyer,args);

    args.minter = WETHHandler.address;
    args.erc20Address = WETH.address;
    await addMinter(deplyer,args);

    args.resourceId = "0x0000000000000000000000000000000000000000000000000000000000000001";


      //SRC_BRIDGE
      contractAmount = utils.parseEther("1");
      await deplyer.sendTransaction({
          to: bridgeContract.address, 
          value: contractAmount
      })

      let amount = utils.parseEther("0.3");
      args.amount = amount

      let fee = utils.parseEther("0.1");

      args.bridge  = bridgeContract.address;
      args.bridgeAddress  = bridgeContract.address;
      args.name = "Test"
      args.symbol = "Test"
      let ERC20Handler = await deployERC20Handler(deplyer,args);

      args.handler = ERC20Handler.address;
      args.minter = ERC20Handler.address;
      let ERC20 = await deployERC20(deplyer,args);
      args.targetContract = ERC20.address;
      args.erc20Address = ERC20.address;

      await registerResource(deplyer,args);
      await setBurn(deplyer,args);
      await addMinter(deplyer,args);

      await bridgeContract.adminChangeFee(fee)
      await sleep(2000);
    
      let abiterList = getAbiterList();
      let signList = await getAbiterSign(abiterList);
      await bridgeContract.setAbiterList(abiterList,12,signList);

      const data = '0x' +
      ethers.utils.hexZeroPad(args.amount.toHexString(), 32).substr(2) +                               // Deposit Amount        (32 bytes)
      ethers.utils.hexZeroPad(fee.toHexString(), 32).substr(2) +                                       // Deposit Fee           (32 bytes)
      ethers.utils.hexZeroPad(ethers.utils.hexlify((args.recipient.length - 2)/2), 32).substr(2) +     // len(recipientAddress) (32 bytes)
      args.recipient.substr(2);                                                                        // recipientAddress      (?? bytes)
      
      let depositNonce = 0;
      let sign = await getErc20Sign(args.dest,depositNonce,args.resourceId,data); 
      
      console.log(data);

      let superSign = await getSuperAbiterErc20Sign()

      console.log("xxl ----");
      console.log(args);

      let re = await bridgeContract.executeProposal(
          args.dest,
          depositNonce,
          data,
          args.resourceId,
          sign,
          superSign          
      )

      let re2 = await re.wait();
      console.log(re2);

      //
      let afterTokenBalance = await utils.formatEther(await ERC20.balanceOf(args.recipient));
      expect(afterTokenBalance).to.equal("0.3")
      
    }catch(e){
      console.log(e);
    }

  })




})
