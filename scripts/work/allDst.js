const {
    step3,
    step4,
    step5,
    step6
} = require('./runStep')

const main = async () => {

    await step3(2000);
    await step4(2000);
    await step5(2000);
    await step6(2000);
 
}

main();

