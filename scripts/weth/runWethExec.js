const {
    deployBridgeContract
} = require("../utils/deploy");

const { utils } = require('ethers')
const { sleep } = require("../utils/helper");
const { ethers } = require("hardhat");


const main = async () => {


    let chainID = await getChainId();
    console.log("chainID is :" + chainID);
    let accounts = await ethers.getSigners()
    let deployer = accounts[0]
    let to =  accounts[1]

    let sendValue = utils.parseEther("0.001");
    args = {
        "chainId": chainID,
        "relayers":[deployer.address],
        "relayerThreshold":1,
        "fee":0,
        "expiry":100,
        "gasPrice":0x02540be400,
        "gasLimit":0x7a1200,
        "resourceId":"0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00",
        "dest":82,
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
        let tokenLen = 100;

        sleep(3000);


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
        let strID = "0xe86ee9f56944ada89e333f06eb40065a86b50a19c5c19dc94fe2d9e15cf947c8"
        for(var i = 1 ;i < (tokenLen + 1);i ++){

            depositNonce.push(i);
            dataArray.push(data);

            console.log(strID);
            resourceID.push(strID);

        }


        console.log("executeProposalBatch call before");
        console.log(dataArray);
        console.log(resourceID);

        //////
        await bridge.executeProposalBatch(
            args.dest,
            depositNonce,
            dataArray,
            resourceID
        )

        process.exit(0);

    }catch(e){
        console.log(e);
    }

    

}


// const main = async () => {


//     let chainID = await getChainId();
//     console.log("chainID is :" + chainID);
//     let accounts = await ethers.getSigners()
//     let deployer = accounts[0]
//     let to =  accounts[1]

//     let sendValue = utils.parseEther("0.001");
//     args = {
//         "chainId": chainID,
//         "relayers":[deployer.address],
//         "relayerThreshold":1,
//         "fee":0,
//         "expiry":100,
//         "gasPrice":0x02540be400,
//         "gasLimit":0x7a1200,
//         "resourceId":"0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00",
//         "dest":82,
//         "amount":sendValue,
//         "recipient":to.address
//     }

//     console.log("main start ...");

//     try{

//         //SRC_BRIDGE
//         let bridge = await deployBridgeContract(deployer,args);
//         console.log(bridge.address);

//         contractAmount = utils.parseEther("1");
//         await accounts[0].sendTransaction({
//             to: bridge.address, 
//             value: contractAmount
//         })

//         let dataArray = []
//         let tokenLen = 100;

//         sleep(3000);


//         const data = '0x' +
//         ethers.utils.hexZeroPad(args.amount.toHexString(), 32).substr(2) +                               // Deposit Amount        (32 bytes)
//         ethers.utils.hexZeroPad(ethers.utils.hexlify((args.recipient.length - 2)/2), 32).substr(2) +     // len(recipientAddress) (32 bytes)
//         args.recipient.substr(2);                                                                        // recipientAddress      (?? bytes)
        
//         for(var i = 0 ;i < tokenLen ;i ++ ){
//             dataArray.push(data);
//         }

//         console.log(`Constructed deposit:`)
//         console.log(`Resource Id: ${args.resourceId}`)
//         console.log(`Amount: ${args.amount.toHexString()}`)
//         console.log(`len(recipient): ${(args.recipient.length - 2)/ 2}`)
//         console.log(`Recipient: ${args.recipient}`)
//         //console.log(dataArray)
//         console.log(`Creating deposit to initiate transfer!`);

//         await bridge.executeWethBatch(
//             data
//         )

//         process.exit(0);

//     }catch(e){
//         console.log(e);
//     }

    

// }


main();
