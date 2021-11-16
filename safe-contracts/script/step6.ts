
const { ethers } = require('hardhat');
import { formatEther } from "@ethersproject/units";

let user1:any, user2:any,user3:any,user4:any;

function sleep(ms:any) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const main = async () => {
    
    [user1, user2,user3,user4] = await ethers.getSigners();
    //step 0
    console.log("\n-------------xxl step 0 accounts -------------");
    let user1Balance  = await ethers.provider.getBalance(user1.address)
    console.log("******xxl user1 balance is : " + formatEther(user1Balance));
    let user2Balance  = await ethers.provider.getBalance(user2.address)
    console.log("******xxl user2 balance is : " + formatEther(user2Balance));
    let user3Balance  = await ethers.provider.getBalance(user3.address)
    console.log("******xxl user3 balance is : " + formatEther(user3Balance));
    let user4Balance  = await ethers.provider.getBalance(user4.address)
    console.log("******xxl user4 balance is : " + formatEther(user4Balance));

    let bridgeAddress = "0x944F5D5E96d831016Dc95ab7d65B2dE297F7c608"
    console.log("\n-------------xxl step 6 upgrade bridgeV2 contract-------------");   
    const BridgeV2 = await ethers.getContractFactory('BridgeV2');
    //console.log(BridgeV2);

    const bridgeV2 = await BridgeV2.connect(user1).attach(bridgeAddress);
    await sleep(5000);
    let data1 = await bridgeV2.connect(user1).getV2Data();
    console.log(data1);

    let data2 = await bridgeV2.getBalanceOfContract();
    console.log(data2);

}

main();