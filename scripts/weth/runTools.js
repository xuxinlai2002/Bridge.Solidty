const {
    deployBridgeContract
} = require("../utils/deploy");

const {
    sleep,
    getSign,
    getAbiterList,
    readConfig,
} = require('../utils/helper')

const {
    approve,
    addMinter
} = require("../utils/erc20")

const { utils } = require('ethers')
const { ethers } = require("hardhat");


const main = async () => {

    let chainID = await getChainId();
    console.log("chainID is :" + chainID);
    let accounts = await ethers.getSigners()
    let deployer = accounts[0];


    try{

        let dstERC20 = await readConfig("3weth_config","DST_ERC20");
        console.log("---------------deployERC20---------------------");
        const Factory__ERC20Mintable = await ethers.getContractFactory('ERC20PresetMinterPauser',accounts[1])
        let ERC20Mintable = await Factory__ERC20Mintable.connect(accounts[1]).attach(dstERC20);  


        let sendValue = utils.parseEther("5");
        await ERC20Mintable.mint("0x41eA6aD88bbf4E22686386783e7817bB7E82c1ed",sendValue);
     

    } catch (e) {
        console.log("error ");
        console.log(e);
        //process.exit(0)
    }

    // try{
    //     let srcBridge = await readConfig("3weth_config","SRC_BRIDGE");
    //     const Factory__Bridge = await ethers.getContractFactory('Bridge',deployer)
    //     let bridge = await Factory__Bridge.connect(deployer).attach(srcBridge);  

    //     contractAmount = utils.parseEther("100");
    //     await accounts[0].sendTransaction({
    //         to: bridge.address, 
    //         value: contractAmount
    //     })
    // } catch (e) {
    //     console.log("error ");
    //     console.log(e);
        
    // }


}

main();
