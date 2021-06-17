const { ethers} = require('hardhat')
const {log} = require("./helper")

async function approve(account,args) {

    const Factory__WETH = await ethers.getContractFactory('WETH10',account)
    let wethInstance = await Factory__WETH.connect(account).attach(args.wethAddress);

    log(`Approving ${args.recipient} to spend token ${args.id} from ${account.address} on contract ${args.wethAddress}!`);

    console.log("----------------------approve---------------------");
    console.log("args.recipient    : "   + args.recipient);
    console.log("args.amount       : "   + args.amount);
    console.log("--------------------------------------------------");
    const tx = await wethInstance.approve(args.recipient, args.amount, {
        gasPrice: args.gasPrice,
        gasLimit: args.gasLimit
    });
   
    return tx.hash;

}

async function deposit(account,args) {

    const Factory__Bridge = await ethers.getContractFactory('Bridge',account)
    let bridgeInstance = await Factory__Bridge.connect(account).attach(args.bridge);
   
    const data = '0x' +
    ethers.utils.hexZeroPad(ethers.BigNumber.from(args.amount).toHexString(), 32).substr(2) +    // Deposit Amount        (32 bytes)
    ethers.utils.hexZeroPad(ethers.utils.hexlify((args.recipient.length - 2)/2), 32).substr(2) +     // len(recipientAddress) (32 bytes)
    args.recipient.substr(2);                                                                        // recipientAddress      (?? bytes)

    console.log(`Constructed deposit:`)
    console.log(`Resource Id: ${args.resourceId}`)
    console.log(`Amount: ${ethers.BigNumber.from(args.amount).toHexString()}`)
    console.log(`len(recipient): ${(args.recipient.length - 2)/ 2}`)
    console.log(`Recipient: ${args.recipient}`)
    console.log(`Raw: ${data}`)
    console.log(`Creating deposit to initiate transfer!`);

    let tx;
    try{
        // Perform deposit
        tx = await bridgeInstance.deposit(
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
   
    return tx.hash;

}

module.exports = {
    approve,
    deposit
}

