
const { ethers} = require('hardhat')

const {log} = require("./helper")

async function registerResource(account,args) {


    //stop here
    const Factory__Bridge = await ethers.getContractFactory('Bridge',account)
    let bridgeInstance = await Factory__Bridge.connect(account).attach(args.bridge);

    log(`Registering contract ${args.targetContract} with resource ID ${args.resourceId} on handler ${args.handler}`);
    console.log("-----------------registerResource------------------");
    console.log("args.handler          : " + args.handler);
    console.log("args.resourceId       : " + args.resourceId);
    console.log("args.token            : " + args.targetContract);
    console.log("---------------------------------------------------");
    const tx = await bridgeInstance.adminSetResource(
        args.handler, 
        args.resourceId,
        args.targetContract, 
        { gasPrice: args.gasPrice, gasLimit: args.gasLimit}
    );

    return tx.hash;

}

async function setBurn(account,args) {

    //stop here
    const Factory__Bridge = await ethers.getContractFactory('Bridge',account)
    let bridgeInstance = await Factory__Bridge.connect(account).attach(args.bridge);

    log(`Setting contract ${args.targetContract} as burnable on handler ${args.handler}`);
    console.log("---------------------setBurn--------------------");
    console.log("args.handler    : " + args.handler);
    console.log("args.token      : " + args.targetContract);
     console.log("args.gasLimit      : " + args.gasLimit);
    console.log("---------------------------------------------------\n");

    const tx = await bridgeInstance.adminSetBurnable(
        args.handler, 
        args.targetContract, 
        { gasPrice: args.gasPrice, gasLimit: args.gasLimit}
    );

    return tx.hash;

}

module.exports = {
    registerResource,
    setBurn
}