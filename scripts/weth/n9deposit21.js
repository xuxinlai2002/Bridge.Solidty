const {
    stepN10
} = require('./runStep')

const { utils } = require('ethers')

const main = async () => {

    let sendValue = utils.parseEther("0.01");
    await stepN10(3000,sendValue,"0x41eA6aD88bbf4E22686386783e7817bB7E82c1ed");




}

main();
