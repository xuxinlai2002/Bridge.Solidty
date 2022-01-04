const { ethers,upgrades} = require('hardhat');
var _ = require('underscore');

async function deployBridgeL1Contract(account,args) {

    const Factory__Bridge = await ethers.getContractFactory('BridgeL1',account)
    
    const Bridge = await upgrades.deployProxy(
        Factory__Bridge, 
        [args.chainId,args.fee,args.expiry,args.superAddress,args.nodePublickey,"v1.0.0"], 
        { initializer: '__Bridge_init' },
        { gasPrice: args.gasPrice, gasLimit: args.gasLimit}
    );
    
    return Bridge;

}

async function attachBridgeL1Contract(account,tokenAddress) {

    const Factory__Bridge = await ethers.getContractFactory('BridgeL1',account)    
    let Bridge  = await Factory__Bridge.connect(account).attach(tokenAddress); 
    return Bridge;

}

async function attachBridgeL2Contract(account,tokenAddress) {

    const Factory__Bridge = await ethers.getContractFactory('BridgeL2',account)    
    let Bridge  = await Factory__Bridge.connect(account).attach(tokenAddress); 
    return Bridge;

}


async function deployBridgeL2Contract(account,args) {

    const Factory__Bridge = await ethers.getContractFactory('BridgeL2',account)
    
    const Bridge = await upgrades.deployProxy(
        Factory__Bridge, 
        [args.chainId,args.fee,args.expiry,args.superAddress,args.nodePublickey,"v1.0.0"], 
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

async function attachERC20(account,tokenAddress){

    const Factory__ERC20Mintable = await ethers.getContractFactory('ERC20PresetMinterPauser',account)
    let tokenContract  = await Factory__ERC20Mintable.connect(account).attach(tokenAddress); 
    return tokenContract;
}

async function attachERC721(account,tokenAddress){
    
    const Factory__ERC721Mintable = await ethers.getContractFactory('ERC721MinterBurnerPauser',account)
    let tokenContract  = await Factory__ERC721Mintable.connect(account).attach(tokenAddress); 
    return tokenContract;
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
    console.log("args.name     : " + args.name);
    console.log("args.symbol   : " + args.symbol);
    console.log("---------------------------------------------------");
    const Factory__Erc721Mintable = await ethers.getContractFactory('ERC721MinterBurnerPauser',account)
    let Erc721Mintable = await Factory__Erc721Mintable.connect(account).deploy(
        args.name,
        args.symbol,
        args.uri,
        { gasPrice: args.gasPrice, gasLimit: args.gasLimit}
    );
    
    console.log("✓ ERC721 contract deployed")

    return Erc721Mintable;


}

module.exports = {
    deployBridgeL1Contract,
    deployBridgeL2Contract,
    attachBridgeL1Contract,
    attachBridgeL2Contract,
    deployERC20Handler,
    deployWETHHandler,
    deployERC721Handler,
    deployERC20,
    deployWETH,
    deployERC721,

    attachERC20,
    attachERC721
}