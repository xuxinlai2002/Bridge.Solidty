/* External Imports */
const { ethers, network } = require('hardhat')
const chai = require('chai')
const { solidity } = require('ethereum-waffle')
const { expect } = chai

var Web3 = require('web3')

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
  getAbiterList,
  getAbiterSign
} = require('../scripts/utils/helper')


const {
  registerResource,
  setBurn
} = require("../scripts/utils/bridge")

const {
  addMinter
} = require("../scripts/utils/erc20")
const { isEqual } = require('underscore')



describe(`supper signer test case`, () => {

  let INITIAL_FEE = 100

  let deplyer,admin,alice
  let chainID
  before(`load accounts and chainID`, async () => {
    ;[ deplyer, admin,alice ] = await ethers.getSigners()
    chainID = await getChainId();
    //console.log("chainID is :" + chainID);
  })

  let bridgeContract
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

  it(`get current supper signer`, async () => {

    let sigerAddress = await bridgeContract.getCurrentSuperSigner();
    expect(sigerAddress).to.equal(deplyer.address)

  })

  it(`change super signer`, async () => {

    let oldPrivateKey = "0xc03b0a988e2e18794f2f0e881d7ffcd340d583f63c1be078426ae09ddbdec9f5";  
    let oldSuperSigner = deplyer.address;
    let newSuperSigner = admin.address;

    //1. message Hash
    let msgData =  "0x" + 
    ethers.utils.hexZeroPad(oldSuperSigner, 32).substr(2) +                               
    ethers.utils.hexZeroPad(newSuperSigner, 32).substr(2);      
    console.log(msgData);

    var web3 = new Web3();
    let msgHash = web3.utils.sha3(msgData);

    //2. sig
    let sigObj = await web3.eth.accounts.sign(msgHash,oldPrivateKey)
    await bridgeContract.changeSuperSigner(oldSuperSigner,newSuperSigner,sigObj.signature);
   


  })



})
