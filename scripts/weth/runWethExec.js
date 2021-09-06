const {
    deployBridgeContract
} = require("../utils/deploy");

const {
    sleep,
    getSign,
    getAbiterList
} = require('../utils/helper')

const { utils } = require('ethers')
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
        "resourceId":"0xe86ee9f56944ada89e333f06eb40065a86b50a19c5c19dc94fe2d9e15cf947c8",
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
        sleep(3000);
        
        // //prov = ethers.getDefaultProvider();
        // let beforeEthBalace = await utils.formatEther(await accounts[0].getBalance());
        // //let beforeEthBalace = await utils.formatEther(await prov.getBalance(bridge.address));
        // console.log("bridge eth : " + beforeEthBalace);

        //xxl TODO 2
        //1.0 console.log(bridge.address);
        let abiterList = getAbiterList();
        console.log(abiterList);

        await bridge.setAbiterList(abiterList,32);



        

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

        console.log("executeProposal call before");
        let depositNonce = 0;
        let sign = await getSign(args.dest,depositNonce,args.resourceId,data); 
        

        //console.log(sign);

        await bridge.executeProposal(
            args.dest,
            depositNonce,
            data,
            args.resourceId,
            sign
        )

        process.exit(0);

    }catch(e){
        console.log(e);
    }

}

main();
