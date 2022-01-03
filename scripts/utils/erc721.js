const { ethers} = require('hardhat')
const {log} = require("./helper")

async function add721Minter(account,args) {

    const Factory__ERC721MinterBurnerPauser = await ethers.getContractFactory('ERC721MinterBurnerPauser',account)
    let erc721Instance = await Factory__ERC721MinterBurnerPauser.connect(account).attach(args.erc721Address);

    const MINTER_ROLE = await erc721Instance.MINTER_ROLE()
    log(`Adding ${args.minter} as a minter of ${args.erc721Address}`)
    console.log("---------------------addMinter--------------------");
    console.log("MINTER_ROLE       : "   + MINTER_ROLE);
    console.log("args.minter       : "   + args.minter);
    console.log("args.erc721       : "    + args.erc721Address);
    console.log("--------------------------------------------------\n");
    const tx = await erc721Instance.grantRole(MINTER_ROLE, args.minter);

    return tx.hash;

}

async function approve721(account,args) {

    const Factory__ERC721 = await ethers.getContractFactory('ERC721',account)
    //console.log(args.erc721);
    let erc721Instance = await Factory__ERC721.connect(account).attach(args.erc721);
    log(`Approving ${args.recipient} to spend token ${args.erc721} from ${account.address} on contract ${args.erc721}!`);
    console.log("----------------------approve---------------------");
    console.log("args.recipient    : "     + args.recipient);
    console.log("args.nftId       : "      + args.nftId);
    console.log("args.fee          : "     + args.fee);
    console.log("--------------------------------------------------");

    const tx = await erc721Instance.approve(args.recipient, args.nftId , {
        gasPrice: args.gasPrice,
        gasLimit: args.gasLimit
    });
   
    return tx.hash;

}
module.exports = {
    add721Minter,
    approve721
}

