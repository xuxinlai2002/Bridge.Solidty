const { ethers,upgrades} = require('hardhat');
var _ = require('underscore');

async function deployBridgeContract(account,superAddress, nodePublickey, args) {

    const Factory__Bridge = await ethers.getContractFactory('Bridge',account)
    
    const Bridge = await upgrades.deployProxy(
        Factory__Bridge, 
        [args.chainId,args.fee,args.expiry,superAddress,nodePublickey], 
        { initializer: '__Bridge_init' },
        { gasPrice: args.gasPrice, gasLimit: args.gasLimit}
    );
    
    return Bridge;

}

async function deployERC20Handler(account,args) {

    // console.log("----------------deployERC20Handler-----------------");
    // console.log("args.bridgeAddress    : " + args.bridgeAddress);
    // console.log("---------------------------------------------------");
    const Factory__Erc20Handler = await ethers.getContractFactory('ERC20Handler',account)
    Erc20Handler = await Factory__Erc20Handler.connect(account).deploy(
        args.bridgeAddress,
        [], 
        [], 
        [],
        { gasPrice: args.gasPrice, gasLimit: args.gasLimit}
    );

    console.log("✓ ERC20Handler contract deployed")
    return Erc20Handler;
}

async function deployWETHHandler(account,args) {

    // console.log("----------------deployWETHHandler-----------------");
    // console.log("args.bridgeAddress    : " + args.bridgeAddress);
    // console.log("---------------------------------------------------");

    const Factory__WETHHandler = await ethers.getContractFactory('WETHHandler',account)
    WETHHandler = await Factory__WETHHandler.connect(account).deploy(
        args.bridgeAddress,
        [], 
        [], 
        [],
        { gasPrice: args.gasPrice, gasLimit: args.gasLimit}
    );

    console.log("✓ WETHHandler contract deployed")
    return WETHHandler;
}

async function deployERC721Handler(account,args) {

    console.log("----------------deployERC721Handler----------------");
    console.log("args.bridgeAddress    : " + args.bridgeAddress);
    console.log("---------------------------------------------------");

    const Factory__Erc721Handler = await ethers.getContractFactory('ERC721Handler',account)
    Erc721Handler = await Factory__Erc721Handler.connect(account).deploy(
        args.bridgeAddress,
        [], 
        [], 
        [],
        { gasPrice: args.gasPrice, gasLimit: args.gasLimit}
    );

    console.log("✓ ERC721Handler contract deployed")
    return Erc721Handler;
}

async function deployERC20(account,args) {
    
    //console.log("---------------deployERC20---------------------");
    const Factory__ERC20Mintable = await ethers.getContractFactory('ERC20PresetMinterPauser',account)
    WETH = await Factory__ERC20Mintable.connect(account).deploy(
        args.name, 
        args.symbol,
        { gasPrice: args.gasPrice, gasLimit: args.gasLimit}
    );
    
    console.log("✓ ERC20 contract deployed")

    return WETH;


}

async function deployWETH(account,args) {
    

    console.log("----------------deployWETH------------------------");
    const Factory__WETH = await ethers.getContractFactory('WETH10',account)

    try{
        WETH = await Factory__WETH.connect(account).deploy(
            { gasPrice: args.gasPrice, gasLimit: args.gasLimit}
        );
    }catch (e) {
        console.log("error ");
        console.log(e);
        process.exit(-1)
    }

    console.log("✓ WETH contract deployed")

    return WETH;


}

async function deployERC721(account,args) {
    

    console.log("----------------deployERC721-----------------------");
    console.log("args.nameToken721     : " + args.nameToken721);
    console.log("args.symbolToken721   : " + args.symbolToken721);
    console.log("---------------------------------------------------");
    const Factory__Erc721Mintable = await ethers.getContractFactory('ERC721MinterBurnerPauser',account)
    Erc721Mintable = await Factory__Erc721Mintable.connect(account).deploy(
        args.nameToken721,
        args.symbolToken721,
        "",
        { gasPrice: args.gasPrice, gasLimit: args.gasLimit}
    );
    
    console.log("✓ ERC721 contract deployed")

    return Erc721Mintable;


}

module.exports = {
    deployBridgeContract,
    deployERC20Handler,
    deployWETHHandler,
    deployERC721Handler,
    deployERC20,
    deployWETH,
    deployERC721
}