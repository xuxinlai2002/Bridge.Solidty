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

    //
    args = {
        "chainId": chainID,
        "relayers":[accounts[0].address],
        "relayerThreshold":1,
        "fee":0,
        "expiry":100,
        "gasPrice":0x02540be400,
        "gasLimit":0x7a1200,
        "resourceId":"0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00",
        "dest":82,
        "amount":1000,
    }

    //SRC_BRIDGE
    let bridge = await deployBridgeContract(accounts[0],args);
    args["recipient"] = bridge.address
    console.log(bridge.address);
    sleep(3000);

    console.log("\n*************************check balance before****************************");
    let beforeEthBalace = await utils.formatEther(await accounts[0].getBalance());
    console.log("acount[0] eth  : " + beforeEthBalace);
   
    prov = ethers.getDefaultProvider();
    beforeEthBalace = await utils.formatEther(await prov.getBalance(bridge.address));
    console.log("srcHandler eth : " + beforeEthBalace);

    console.log("**************************************************************************\n");
    
    //console.log(await prov.sendTransaction);
    let sendValue = utils.parseEther("0.01");
    // console.log("xxl ---------");
    // console.log(sendValue);
    await accounts[0].sendTransaction({
        to: bridge.address, 
        value: utils.parseEther("0.01"),
    })

    const data = '0x' +
    ethers.utils.hexZeroPad(sendValue.toHexString(), 32).substr(2) +    // Deposit Amount        (32 bytes)
    ethers.utils.hexZeroPad(ethers.utils.hexlify((args.recipient.length - 2)/2), 32).substr(2) +     // len(recipientAddress) (32 bytes)
    args.recipient.substr(2);                                                                        // recipientAddress      (?? bytes)

    console.log(`Constructed deposit:`)
    console.log(`Resource Id: ${args.resourceId}`)
    console.log(`Amount: ${ethers.BigNumber.from(args.amount).toHexString()}`)
    console.log(`len(recipient): ${(args.recipient.length - 2)/ 2}`)
    console.log(`Recipient: ${args.recipient}`)
    console.log(`Raw: ${data}`)
    console.log(`Creating deposit to initiate transfer!`);

    sleep(3000);

    // let tx;
    try{
        // Perform deposit
        tx = await bridge.deposit(
            args.dest, // destination chain id
            args.resourceId,
            data,
            { gasPrice: args.gasPrice, gasLimit: args.gasLimit}
        );
    } catch (e) {
        console.log("error ");
        console.log(e);
        //process.exit(0)
    }

    sleep(3000);

    console.log("\n*************************check balance after****************************");
    let afterEthBalace = await utils.formatEther(await accounts[0].getBalance());
    console.log("acount[0] eth  : " + afterEthBalace);
   
    afterEthBalace = await utils.formatEther(await ethers.provider.getBalance(bridge.address));
    console.log("srcHandler eth : " + afterEthBalace);
    console.log("**************************************************************************\n");


    process.exit(0);

}

main();
