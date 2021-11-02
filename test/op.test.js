/* External Imports */
const { ethers, network } = require('hardhat')
const chai = require('chai')
const { solidity } = require('ethereum-waffle')
const { expect } = chai

chai.use(solidity)

const {
  deployBridgeContract,
  deployWETHHandler
} = require("../scripts/utils/deploy")

const {
  registerResource
} = require("../scripts/utils/bridge")

const { utils } = require('ethers')

describe(`abiter list `, () => {

  let INITIAL_FEE = 100

  let deplyer,alice
  let chainID
  before(`load accounts and chainID`, async () => {
    ;[ deplyer,alice ] = await ethers.getSigners()
    chainID = await getChainId();
    console.log("chainID is :" + chainID + " deployer address " + deplyer.address);
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
        "gasLimit":0x7a1200,
        "recipient":alice.address,
        "dest":83,
        "resourceId":"0xe86ee9f56944ada89e333f06eb40065a86b50a19c5c19dc94fe2d9e15cf947c8"
    }

    //DST_BRIDGE
    bridgeContract =  await deployBridgeContract(deplyer,args);

  })

  // it(`TODO 1 set keccak256 or not`, async () => {


  //   let abiterList = getAbiterList();
  //   let signList = await getAbiterSign(abiterList);
    
  //   let tx = await bridgeContract.isDuplicated(signList);
  //   //console.log(tx);

  //   let hash = await tx.wait();
  //   console.log(hash.gasUsed.toString());

  // })

  it(`TODO 2 deposit run in layer1 with _depositRecords or not`, async () => {

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

})
