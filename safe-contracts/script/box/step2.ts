
const { ethers, upgrades } = require('hardhat');
import { formatEther } from "@ethersproject/units";
import {  buildSafeTransaction, executeTx, MetaTransaction, safeApproveHash } from "../src/utils/execution";
import { buildMultiSendSafeTx} from "../src/utils/multisend";

const AddressZero = "0x0000000000000000000000000000000000000000";
const getSafeSingleton = async () => {

    const Saft = await ethers.getContractFactory("GnosisSafe");
    //GnosisSafe
    //0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552
    return await Saft.attach("0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552");

}


const getFactory = async () => {

    const Factory = await ethers.getContractFactory("GnosisSafeProxyFactory");
    //GnosisSafeProxyFactory
    //0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2
    return Factory.attach("0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2");
}

const getSafeTemplate = async () => {

    const singleton = await getSafeSingleton()
    console.log(singleton.address);
    const factory = await getFactory()
    const template = await factory.callStatic.createProxy(singleton.address, "0x")
    await factory.createProxy(singleton.address, "0x").then((tx: any) => tx.wait())
    const Safe = await ethers.getContractFactory("GnosisSafe");
    return Safe.attach(template);

}

const getSafeWithOwners = async (owners: string[], threshold?: number, fallbackHandler?: string) => {

    const template = await getSafeTemplate()
    await template.setup(owners, threshold || owners.length, AddressZero, "0x", fallbackHandler || AddressZero, AddressZero, 0, AddressZero)
    return template
}

const getMultiSend = async () => {

    const MultiSend = await ethers.getContractFactory("MultiSend");
    //MultiSend
    //0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761
    return await MultiSend.attach("0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761");
}

const setup = async() => {

    return {
        //xxl step1 
        safe: await getSafeWithOwners([user1.address,user2.address,user3.address,user4.address],3),
        multiSend: await getMultiSend()
    }
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

    //console.log("chainID is :" + chainID);
    let args = {
        "gasPrice":0x02540be400,
        "gasLimit":0x7a1200
    }

    //step 2
    console.log("\n-------------xxl step 2 create safe address-------------");
    //await setup()   
    const { safe, multiSend } = await setup()
    console.log("safe address is : " + safe.address);
    console.log("safe multiSend is : " + multiSend.address);


}

main();