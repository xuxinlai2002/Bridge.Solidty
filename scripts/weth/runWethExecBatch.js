const {
    deployBridgeContract
} = require("../utils/deploy");

const { utils } = require('ethers')
const { ethers } = require("hardhat");

const {
    sleep,
    getAbiterList,
    getSignBatch
} = require('../utils/helper')


const main = async () => {

    let chainID = await getChainId();
    console.log("chainID is :" + chainID);
    let accounts = await ethers.getSigners()
    let deployer = accounts[0]
    let to =  accounts[1]

    let sendValue = utils.parseEther("0.01");

    args = {
        "chainId": chainID,
        "relayers":[deployer.address],
        "relayerThreshold":1,
        "fee":0,
        "expiry":100,
        "gasPrice":0x02540be400,
        "gasLimit":0x7a1200,
        "resourceId":"0xe86ee9f56944ada89e333f06eb40065a86b50a19c5c19dc94fe2d9e15cf947c8",
        "dest":chainID,
        "amount":sendValue,
        "recipient":to.address
    }

    console.log("main start ...");

    try{

        //SRC_BRIDGE
        let bridge = await deployBridgeContract(deployer,args);
        console.log(bridge.address);

        contractAmount = utils.parseEther("1");
        await accounts[0].sendTransaction({
            to: bridge.address, 
            value: contractAmount
        })

        let dataArray = []
        let tokenLen = 2;

        await sleep(3000);

        let abiterList = getAbiterList();
        console.log(abiterList);
        await bridge.setAbiterList(abiterList,1);



        const data = '0x' +
        ethers.utils.hexZeroPad(args.amount.toHexString(), 32).substr(2) +                               // Deposit Amount        (32 bytes)
        ethers.utils.hexZeroPad(ethers.utils.hexlify((args.recipient.length - 2)/2), 32).substr(2) +     // len(recipientAddress) (32 bytes)
        args.recipient.substr(2);                                                                        // recipientAddress      (?? bytes)
        
        console.log(`Constructed deposit:`)
        console.log(`Resource Id: ${args.resourceId}`)
        console.log(`Amount: ${args.amount.toHexString()}`)
        console.log(`len(recipient): ${(args.recipient.length - 2)/ 2}`)
        console.log(`Recipient: ${args.recipient}`)
        console.log(`Creating deposit to initiate transfer!`);


        let depositNonce = []
        let resourceID = [];
        for(var i = 1 ;i < (tokenLen + 1);i ++){

            depositNonce.push(i);
            dataArray.push(data);
            resourceID.push(args.resourceId);

        }

        console.log("executeProposalBatch call before");
        console.log(dataArray);
        console.log(resourceID);

        //////
        //const getSignBatch = async(chainId,depositNonce,resourceId,data) => {
        console.log("----------");
        console.log(chainID);
        console.log(depositNonce);
        console.log(resourceID);
        console.log(dataArray);
        console.log("----------");

        let sign = await getSignBatch(chainID,depositNonce,resourceID,dataArray); 
        
        await bridge.executeProposalBatch(
            args.dest,
            depositNonce,
            dataArray,
            resourceID,
            sign
        )
        
        process.exit(0);

    }catch(e){
        console.log(e);
    }

}

main();
