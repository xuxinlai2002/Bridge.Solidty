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


describe(`Cross Fee Setting`, () => {

  let INITIAL_FEE = 100

  let deplyer,admin,alice
  let chainID
  before(`load accounts and chainID`, async () => {
    
    ;[ deplyer, admin,alice ] = await ethers.getSigners()
    chainID = await getChainId();

  })

  let bridgeContract
  beforeEach(`deploy Bridge contract`, async () => {

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
    bridgeContract =  await deployBridgeContract(deplyer,admin.address,args);

    //

  })


//  it(`executeProposal run in layer2 fee cross`, async () => {

//     try{

//       await bridgeContract.adminChangeFee(utils.parseEther("0.3"))

//       //SRC_BRIDGE
//       let amount = utils.parseEther("1");
//       args.amount = amount
//       args.bridge  = bridgeContract.address;
//       args.bridgeAddress  = bridgeContract.address;
//       args.erc20Name = "Test"
//       args.erc20Symbol = "Test"
//       let ERC20Handler = await deployERC20Handler(deplyer,args);

//       args.handler = ERC20Handler.address;
//       args.minter = ERC20Handler.address;
//       let ERC20 = await deployERC20(deplyer,args);
//       args.targetContract = ERC20.address;
//       args.erc20Address = ERC20.address;

//       await registerResource(deplyer,args);
//       await setBurn(deplyer,args);
//       await addMinter(deplyer,args);

//       await sleep(2000);
    
//       // let abiterList = getAbiterList();
//       // await bridgeContract.setAbiterList(abiterList,12);

//       let abiterList = getAbiterList();
//       let signList = await getAbiterSign(abiterList);
//       await bridgeContract.setAbiterList(abiterList,12,signList);

//       const data = '0x' +
//       ethers.utils.hexZeroPad(args.amount.toHexString(), 32).substr(2) +                               // Deposit Amount        (32 bytes)
//       ethers.utils.hexZeroPad(ethers.utils.hexlify((args.recipient.length - 2)/2), 32).substr(2) +     // len(recipientAddress) (32 bytes)
//       args.recipient.substr(2);                                                                        // recipientAddress      (?? bytes)
      
//       let depositNonce = 0;
//       // console.log(1);
//       // console.log([
//       //   args.dest,
//       //   depositNonce,
//       //   data,
//       //   args.resourceId,
//       //   abiterList[0]
//       // ])

//       let sign = await getSign(args.dest,depositNonce,args.resourceId,data); 
//       //need to comment out birdige logic ,only left fee logic
//       let superSig = "0x1234";
//         await bridgeContract.executeProposal(
//             args.dest,
//             depositNonce,
//             data,
//             args.resourceId,
//             sign,
//             superSig,
//             abiterList[0]
//         )
        
//         //
//         let afterTokenBalance = await utils.formatEther(await ERC20.balanceOf(abiterList[0]));
//         expect(afterTokenBalance).to.equal("0.3")
      

//     }catch(e){
//       console.log(e);
//     }
//   })


  it(`executeProposalBatch 1 tx run in layer1`, async () => {

    try{

      await bridgeContract.adminChangeFee(utils.parseEther("0.01"))
      args.recipient = "0x534369554D1F1B36e5527793d67A7774A45BD8D1";
       
      //SRC_BRIDGE
      contractAmount = utils.parseEther("100");
      await deplyer.sendTransaction({
          to: bridgeContract.address, 
          value: contractAmount
      })

      //2.deployer contract
      args.bridgeAddress = bridgeContract.address;
      wethHandlerContract = await deployWETHHandler(deplyer,args);

      let amount = utils.parseEther("0.3");
      args.amount = amount

      args.bridge = bridgeContract.address;
      args.handler = wethHandlerContract.address;
      args.targetContract = "0x977e762f384a5909140e91523929A9E188B6bB65";
      await registerResource(deplyer,args);


      await sleep(2000);
    
      let abiterList = getAbiterList();
      let signList = await getAbiterSign(abiterList);
      await bridgeContract.setAbiterList(abiterList,12,signList);

      const data = '0x' +
      ethers.utils.hexZeroPad(args.amount.toHexString(), 32).substr(2) +                               // Deposit Amount        (32 bytes)
      ethers.utils.hexZeroPad(ethers.utils.hexlify((args.recipient.length - 2)/2), 32).substr(2) +     // len(recipientAddress) (32 bytes)
      args.recipient.substr(2);                                                                        // recipientAddress      (?? bytes)
      
      let tokenLen = 1;
      let dataArray = []
      let depositNonce = []
      let resourceID = [];
      for(var i = 1 ;i < (tokenLen + 1);i ++){

          depositNonce.push(i);
          dataArray.push(data);
          resourceID.push(args.resourceId);

      }
      let sign = await getSignBatch(args.dest,depositNonce,resourceID,dataArray); 

      //
    //   function executeProposalBatch(
    //     uint8 chainID,
    //     uint64[] memory depositNonce,
    //     bytes[] calldata data,
    //     bytes32[] memory resourceID,
    //     bytes[] memory sig,
    //     bytes memory superSig,
    //     address currentRelayer
    // ) public {
    //     uint256 gasUsed = gasleft();
    //     _verifyBatch(chainID, depositNonce, data, resourceID, sig,superSig);
    //     _excuteBatch(chainID, depositNonce, data, resourceID,currentRelayer,gasUsed);
    //   }
      
      //
      let superSig = "0x1234";
      let tx = await bridgeContract.executeProposalBatch(
          args.dest,
          depositNonce,
          dataArray,
          resourceID,
          sign,
          superSig,
          args.recipient,
          {
            gasPrice: args.gasPrice,
            gasLimit: args.gasLimit
        }
      )
      let result = await tx.wait();
      console.log("layer1 deposit gas used : " + result.gasUsed);

      //let afterTokenBalance = await utils.formatEther(await ERC20.balanceOf(args.recipient));
      let afterEthBalace = await utils.formatEther(await ethers.provider.getBalance(args.recipient));
      expect(afterEthBalace).to.equal("0.3")
      

    }catch(e){
      console.log(e);
    }
    

  })




})
