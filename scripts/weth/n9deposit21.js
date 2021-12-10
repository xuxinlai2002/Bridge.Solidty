const {
    stepN10
} = require('./runStep')

const { utils } = require('ethers')

const main = async () => {

    let sendValue = utils.parseEther("0.01");
    let fee = utils.parseEther("0.001");
    await stepN10(15000,sendValue,fee);




}

main();
