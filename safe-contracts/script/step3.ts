
const { ethers, upgrades } = require('hardhat');
import { formatEther } from "@ethersproject/units";

let user1:any, user2:any,user3:any,user4:any;
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

    //console.log("chainID is :" + chainID);
    let args = {
        "gasPrice":0x02540be400,
        "gasLimit":0x7a1200
    }
    let safeAddress = "0x43E77Ba9F5E59CefB97D55CF58641EBb7bEB22c4"

    console.log("\n-------------xxl step 3 transfer ProxyAdminOwnership-------------"); 
    console.log([safeAddress,{gasPrice: args.gasPrice,gasLimit: args.gasLimit}]);
   
    await upgrades.admin.transferProxyAdminOwnership(
        safeAddress,{gasPrice: args.gasPrice,gasLimit: args.gasLimit});
    console.log("transferred ownership of ProxyAdmin to:", safeAddress);


}

main();