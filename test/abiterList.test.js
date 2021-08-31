/* External Imports */
const { ethers, network } = require('hardhat')
const chai = require('chai')
const { solidity } = require('ethereum-waffle')
const { expect } = chai

chai.use(solidity)

const {
  deployBridgeContract,
} = require("../scripts/utils/deploy")

const {
  getAbiterList,
  getAbiterSign
} = require('../scripts/utils/helper')



const { utils } = require('ethers')

describe(`abiter list `, () => {

  let INITIAL_FEE = 100

  let deplyer,admin,alice
  let chainID
  before(`load accounts and chainID`, async () => {
    ;[ deplyer, admin,alice ] = await ethers.getSigners()
    chainID = await getChainId();
    console.log("chainID is :" + chainID + " deployer address " + deplyer.address);
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

  // it(`set single Abiter`, async () => {

  //   let abiterAddress = "0x41eA6aD88bbf4E22686386783e7817bB7E82c1ed";
  //   let abiterList = [];
  //   abiterList.push(abiterAddress);
  //   let tx = await bridgeContract.setAbiterList(abiterList,1);
  //   let result = await tx.wait();
  //   console.log("single Abiter gas used : " + result.gasUsed);

  //   let resultAbiter = await bridgeContract.getAbiterList();
  //   //console.log(resultAbiter);
  //   expect(resultAbiter.length).to.equal(1)
  //   expect(resultAbiter[0]).to.equal(abiterAddress)
    
  // })

  // it(`set first time multiple Abiter`, async () => {

  //   let abiterAddress = "0x41eA6aD88bbf4E22686386783e7817bB7E82c1ed";
  //   let abiterList = [];
  //   for(var i = 0 ;i < 36 ;i ++){
  //     abiterList.push(abiterAddress);
  //   }
    
  //   let tx = await bridgeContract.setAbiterList(abiterList,36);
  //   let result = await tx.wait();
  //   console.log("multiple Abiter gas used : " + result.gasUsed);

  //   let resultAbiter = await bridgeContract.getAbiterList();
  //   expect(resultAbiter.length).to.equal(36)
    
  // })


  it(`set swift multiple Abiter`, async () => {

  
    let abiterList = getAbiterList();  
    let signList = await getAbiterSign(abiterList);
   
    let tx = await bridgeContract.setAbiterList(abiterList,32,signList);
    let result = await tx.wait();
    console.log("first time  Abiter gas used : " + result.gasUsed);

    tx = await bridgeContract.setAbiterList(abiterList,32,signList);
    result = await tx.wait();
    console.log("second time  Abiter gas used : " + result.gasUsed);





    
  })




})
