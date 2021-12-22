const {
    changeSuperSigner
} = require('./runStep')

const main = async () => {
    //node0 superaddress 0xdD9E99B47A0FA72A7E2E41d92986c2d23afc4b1e nodepublickey 03bfd8bd2b10e887ec785360f9b329c2ae567975c784daca2f223cb19840b51914
    //node6 superaddress 0x390b9f27a82CE28048EC5FAD1Ebf77D9826fc201 nodepublickey 0295d91be003c7cbaa04bd5adc6977711c405670fa6361d3d21c64ff0a0c236aa8
    //node7 superaddress 0xfee7a6096962eb330db3f8740cf2e904a3d3a97b nodepublickey 020345e1ea4afda4350e195217ae02434b79cf6aca79cfa3d13e2b6df7f1f33ef7
    await changeSuperSigner("0xdD9E99B47A0FA72A7E2E41d92986c2d23afc4b1e", "03bfd8bd2b10e887ec785360f9b329c2ae567975c784daca2f223cb19840b51914", "ERC20");

}

main();
