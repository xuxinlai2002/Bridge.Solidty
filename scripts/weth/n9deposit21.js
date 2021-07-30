const {
    stepN10
} = require('./runStep')

const { utils } = require('ethers')

const main = async () => {

    let sendValue = utils.parseEther("0.01");
    await stepN10(15000,sendValue,"0x8F723ec92F28a87c0A1d28d83210487B1af86e19");




}

main();
