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


async function approve(account,args) {

    console.log("xxl ......approve ......");
    const Factory__ERC20 = await ethers.getContractFactory('ERC20',account)

    console.log(args.erc20);
    let erc20Instance = await Factory__ERC20.connect(account).attach(args.erc20);

    log(`Approving ${args.recipient} to spend token ${args.id} from ${account.address} on contract ${args.erc20}!`);

    console.log("----------------------approve---------------------");
    console.log("args.recipient    : "     + args.recipient);
    console.log("args.amount11       : "   + args.amount);
    console.log("--------------------------------------------------");
    const tx = await erc20Instance.approve(args.recipient, args.amount, {
        gasPrice: args.gasPrice,
        gasLimit: args.gasLimit
    });
   
    return tx.hash;

}


module.exports = {
    approve,
    addMinter
}

