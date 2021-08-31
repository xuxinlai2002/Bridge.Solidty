/* External Imports */
const { ethers, network } = require('hardhat')
const chai = require('chai')
const { solidity } = require('ethereum-waffle')
const { expect } = chai

chai.use(solidity)

const {
  deployBridgeContract,
} = require("../scripts/utils/deploy")


const { utils } = require('ethers')

describe(`bridge `, () => {

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

        "resourceId":"0xe86ee9f56944ada89e333f06eb40065a86b50a19c5c19dc94fe2d9e15cf947c8"
    }

    //DST_BRIDGE
    bridgeContract =  await deployBridgeContract(deplyer,args);

  })

  it(`bridge get balance`, async () => {

    try{
      let beforeBalance = await utils.formatEther(await bridgeContract.getBalanceOfContract());
      expect(beforeBalance).to.equal("0.0")

        let sendValue = utils.parseEther("1");
        await deplyer.sendTransaction({
            to: bridgeContract.address, 
            value: sendValue,
          })


      let afterBalance = await utils.formatEther(await bridgeContract.getBalanceOfContract());
      expect(afterBalance).to.equal("1.0") 

    }catch(e){
      console.log(e);
    }


    
  })

  it(`get value from bridge`, async () => {

    try{
        let beforeBalance = await utils.formatEther(await bridgeContract.getBalanceOfContract());
        expect(beforeBalance).to.equal("0.0")

        let sendValue = utils.parseEther("1");
        await deplyer.sendTransaction({
            to: bridgeContract.address, 
            value: sendValue,
          })

        let withDrawValue = utils.parseEther("0.5");
        await bridgeContract.sendValue(
          alice.address,
          withDrawValue
        );

        let afterBalance = await utils.formatEther(await bridgeContract.getBalanceOfContract());
        expect(afterBalance).to.equal("0.5") 

    }catch(e){
      console.log(e);
    }


    
  })




})
