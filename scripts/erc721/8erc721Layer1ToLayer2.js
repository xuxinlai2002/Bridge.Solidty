const {
    erc721Layer1ToLayer2
} = require('../utils/runStep')

const { utils } = require('ethers')

const main = async () => {

    let nftId = 18;
    let fee = utils.parseEther("0.002");
    await erc721Layer1ToLayer2(10000,"0x12",fee,"ERC721");

}

main();
