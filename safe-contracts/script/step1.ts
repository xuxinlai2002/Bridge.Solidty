
const { ethers, upgrades } = require('hardhat'); 
import { formatEther, parseEther } from "@ethersproject/units";

function sleep(ms:any) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const main = async () => {

    let user1:any, user2:any,user3:any,user4:any;
    [user1, user2,user3,user4] = await ethers.getSigners();

    //step 0
    console.log("-------------xxl step 0 accounts -------------");
    let user1Balance  = await ethers.provider.getBalance(user1.address)
    console.log("******xxl user1 balance is : " + formatEther(user1Balance));
    let user2Balance  = await ethers.provider.getBalance(user2.address)
    console.log("******xxl user2 balance is : " + formatEther(user2Balance));
    let user3Balance  = await ethers.provider.getBalance(user3.address)
    console.log("******xxl user3 balance is : " + formatEther(user3Balance));
    let user4Balance  = await ethers.provider.getBalance(user4.address)
    console.log("******xxl user4 balance is : " + formatEther(user4Balance));

    //step 1
    console.log("-------------xxl step 1 deployProx Bridge-------------");
    let args = {
        "chainId": 83,
        "relayers":[user1.address],
        "relayerThreshold":1,
        "fee":0,
        "expiry":100,
        "gasPrice":0x02540be400,
        "gasLimit":0x7a1200,
        "resourceId":"0xe86ee9f56944ada89e333f06eb40065a86b50a19c5c19dc94fe2d9e15cf947c8"
    }

    const Factory__Bridge = await ethers.getContractFactory('Bridge')    
    const Bridge = await upgrades.deployProxy(
        Factory__Bridge, 
        [args.chainId,args.fee,args.expiry,user1.address], 
        { initializer: '__Bridge_init' },
        { gasPrice: args.gasPrice, gasLimit: args.gasLimit}
    );

    console.log("Bridge proxy address " + Bridge.address);



    
}

main();