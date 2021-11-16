
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
    console.log("-------------xxl step 1 deployProx Box-------------");
    const Box = await ethers.getContractFactory('Box');
    const box = await upgrades.deployProxy(Box, [42], { initializer: 'store' });   
    console.log("upgrades deployProxy address is : " + box.address); 
    let result = (await box.retrieve()).toString();
    console.log("box retrieve :" + result);

    
}

main();