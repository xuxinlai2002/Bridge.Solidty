const {
    stepN10
} = require('./runStep')

const { utils } = require('ethers')

const main = async () => {

    let sendValue = utils.parseEther("0.01");
    await stepN10(15000,sendValue);




}

main();
