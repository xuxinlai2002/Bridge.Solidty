const { deployments } = require("hardhat")
const { Wallet, Contract } = require("ethers")
const { AddressZero } = require("@ethersproject/constants");
const {solc} = require("solc")
const { logGas } from "../../src/utils/execution";
const { safeContractUnderTest } = require("./config");

const defaultCallbackHandlerDeployment = async () => {
    return await deployments.get("DefaultCallbackHandler");
}

const defaultCallbackHandlerContract = async () => {
    return await ethers.getContractFactory("DefaultCallbackHandler");
}

const compatFallbackHandlerDeployment = async () => {
    return await deployments.get("CompatibilityFallbackHandler");
}

const compatFallbackHandlerContract = async () => {
    return await ethers.getContractFactory("CompatibilityFallbackHandler");
}

const getSafeSingleton = async () => {
    const SafeDeployment = await deployments.get(safeContractUnderTest());
    const Safe = await ethers.getContractFactory(safeContractUnderTest());
    return Safe.attach(SafeDeployment.address);
}

const getFactory = async () => {
    const FactoryDeployment = await deployments.get("GnosisSafeProxyFactory");
    const Factory = await ethers.getContractFactory("GnosisSafeProxyFactory");
    return Factory.attach(FactoryDeployment.address);
}

const getSimulateTxAccessor = async () => {
    const SimulateTxAccessorDeployment = await deployments.get("SimulateTxAccessor");
    const SimulateTxAccessor = await ethers.getContractFactory("SimulateTxAccessor");
    return SimulateTxAccessor.attach(SimulateTxAccessorDeployment.address);
}

const getMultiSend = async () => {
    const MultiSendDeployment = await deployments.get("MultiSend");
    const MultiSend = await ethers.getContractFactory("MultiSend");
    return MultiSend.attach(MultiSendDeployment.address);
}

const getMultiSendCallOnly = async () => {
    const MultiSendDeployment = await deployments.get("MultiSendCallOnly");
    const MultiSend = await ethers.getContractFactory("MultiSendCallOnly");
    return MultiSend.attach(MultiSendDeployment.address);
}

const getCreateCall = async () => {
    const CreateCallDeployment = await deployments.get("CreateCall");
    const CreateCall = await ethers.getContractFactory("CreateCall");
    return CreateCall.attach(CreateCallDeployment.address);
}

const migrationContract = async () => {
    return await ethers.getContractFactory("Migration");
}


const getMock = async () => {
    const Mock = await ethers.getContractFactory("MockContract");
    return await Mock.deploy();
}

const getSafeTemplate = async () => {
    const singleton = await getSafeSingleton()
    const factory = await getFactory()
    const template = await factory.callStatic.createProxy(singleton.address, "0x")
    await factory.createProxy(singleton.address, "0x").then((tx) => tx.wait())
    const Safe = await ethers.getContractFactory(safeContractUnderTest());
    return Safe.attach(template);
}

const getSafeWithOwners = async (owners, threshold, fallbackHandler, logGasUsage) => {
    const template = await getSafeTemplate()
    await logGas(
        `Setup Safe with ${owners.length} owner(s)${fallbackHandler && fallbackHandler !== AddressZero ? " and fallback handler" : ""}`, 
        template.setup(owners, threshold || owners.length, AddressZero, "0x", fallbackHandler || AddressZero, AddressZero, 0, AddressZero),
        !logGasUsage
    )
    return template
}

const getDefaultCallbackHandler = async () => {
    return (await defaultCallbackHandlerContract()).attach((await defaultCallbackHandlerDeployment()).address);
}

const getCompatFallbackHandler = async () => {
    return (await compatFallbackHandlerContract()).attach((await compatFallbackHandlerDeployment()).address);
}

const compile = async (source) => {
    const input = JSON.stringify({
        'language': 'Solidity',
        'settings': {
            'outputSelection': {
            '*': {
                '*': [ 'abi', 'evm.bytecode' ]
            }
            }
        },
        'sources': {
            'tmp.sol': {
                'content': source
            }
        }
    });
    const solcData = await solc.compile(input)
    const output = JSON.parse(solcData);
    if (!output['contracts']) {
        console.log(output)
        throw Error("Could not compile contract")
    }
    const fileOutput = output['contracts']['tmp.sol']
    const contractOutput = fileOutput[Object.keys(fileOutput)[0]]
    const abi = contractOutput['abi']
    const data = '0x' + contractOutput['evm']['bytecode']['object']
    return {
        "data": data,
        "interface": abi
    }
}

const deployContract = async (deployer, source) => {
    const output = await compile(source)
    const transaction = await deployer.sendTransaction({ data: output.data, gasLimit: 6000000 })
    const receipt = await transaction.wait()
    return new Contract(receipt.contractAddress, output.interface, deployer)
}

module.exports = {
    defaultCallbackHandlerDeployment,
    defaultCallbackHandlerContract,
    compatFallbackHandlerDeployment,
    compatFallbackHandlerContract,
    getSafeSingleton,
    getFactory,
    getSimulateTxAccessor,
    getMultiSend,
    getMultiSendCallOnly,
    getCreateCall,
    migrationContract,
    getMock,
    getSafeWithOwners,
    getDefaultCallbackHandler,
    getCompatFallbackHandler,
    deployContract
}