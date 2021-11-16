
const { ethers, upgrades } = require('hardhat');
import { formatEther } from "@ethersproject/units";
import {  buildSafeTransaction, executeTx, MetaTransaction, safeApproveHash } from "../src/utils/execution";
import { buildMultiSendSafeTx} from "../src/utils/multisend";

const getMultiSend = async () => {

    const MultiSend = await ethers.getContractFactory("MultiSend");
    //MultiSend
    //0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761
    return await MultiSend.attach("0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761");
}


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

    const multiSend  = await getMultiSend()
    const Safe = await ethers.getContractFactory("GnosisSafe");
    let safe  = Safe.attach("0x43E77Ba9F5E59CefB97D55CF58641EBb7bEB22c4");
    console.log("safe address is : " + safe.address);
    console.log("safe multiSend is : " + multiSend.address);

    let bridgeAddress = "0x944F5D5E96d831016Dc95ab7d65B2dE297F7c608"
    let bridgeV2Address = "0x0b51085C773735C9e2310f7F44Bd9A139213785d"

    console.log("\n-------------xxl step 5 construct proxy upgrade contract-------------");   
    let proxyAdminContract = await upgrades.admin.getInstance();
    console.log("xxl proxyAdmin contract address is : " + proxyAdminContract.address);
    const data = proxyAdminContract.interface.encodeFunctionData("upgrade", [bridgeAddress,bridgeV2Address])
    const txs: MetaTransaction[] = [
      buildSafeTransaction({to: proxyAdminContract.address,data, nonce: 0})
    ]
    const safeTx = buildMultiSendSafeTx(multiSend, txs, await safe.nonce())

    let args = {
        "gasPrice":0x02540be400,
        "gasLimit":0x7a1200
    }
    let re = await executeTx(safe, safeTx, [ 
        await safeApproveHash(user1, safe, safeTx, false),
        await safeApproveHash(user2, safe, safeTx, false),
        await safeApproveHash(user3, safe, safeTx, false)
    ],{gasPrice: args.gasPrice,gasLimit: args.gasLimit})

    console.log(re);

    let re2 = await re.wait();
    console.log(re2);


}

main();