const { ethers} = require('hardhat')
const {log} = require("./helper")

async function addMinter(account,args) {

    const Factory__ERC20PresetMinterPauser = await ethers.getContractFactory('ERC20PresetMinterPauser',account)
    let erc20Instance = await Factory__ERC20PresetMinterPauser.connect(account).attach(args.erc20Address);

    const MINTER_ROLE = await erc20Instance.MINTER_ROLE()
    log(`Adding ${args.minter} as a minter of ${args.erc20Address}`)
    console.log("---------------------addMinter--------------------");
    console.log("MINTER_ROLE       : "   + MINTER_ROLE);
    console.log("args.minter       : "   + args.minter);
    console.log("--------------------------------------------------\n");
    const tx = await erc20Instance.grantRole(MINTER_ROLE, args.minter);

    return tx.hash;

}


module.exports = {
    addMinter
}

