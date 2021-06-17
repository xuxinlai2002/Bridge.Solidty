const {
    step0,
    step1,
    step2,
    step8,
    step9
} = require('./runStep')

const main = async () => {

    await step0(0,"5");
    await step1(2000);
    await step2(2000)

    await step8(2000,"10000000000000000");
    await step9(2000,"10000000000000000");

}

main();

