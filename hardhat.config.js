require('@nomiclabs/hardhat-ethers')
require('@nomiclabs/hardhat-waffle')
require('hardhat-deploy')

module.exports = {
  networks: {

    // ropsten: {
    //     url: `https://ropsten.infura.io/v3/7e31d49d7c8a48f4a4539aff9da768e7`,
    //     accounts: [
    //       "0xc03b0a988e2e18794f2f0e881d7ffcd340d583f63c1be078426ae09ddbdec9f5",
    //       "0x54e6e01600b66af71b9827429ff32599383d7694684bc09e26c3b13d95980650"
    //     ]
    // },
    
    kovan: {
        url: `https://kovan.infura.io/v3/7e31d49d7c8a48f4a4539aff9da768e7`,
        accounts: [
          "0xc03b0a988e2e18794f2f0e881d7ffcd340d583f63c1be078426ae09ddbdec9f5",
          "0x54e6e01600b66af71b9827429ff32599383d7694684bc09e26c3b13d95980650",
          "0xcb93f47f4ae6e2ee722517f3a2d3e7f55a5074f430c9860bcfe1d6d172492ed0"
        ]
    },

    // 01
    // 0xc03b0a988e2e18794f2f0e881d7ffcd340d583f63c1be078426ae09ddbdec9f5 
    // -> 0x41eA6aD88bbf4E22686386783e7817bB7E82c1ed

    // 02
    // 0x54e6e01600b66af71b9827429ff32599383d7694684bc09e26c3b13d95980650
    // -> 0x4f2C793DB2163A7A081b984E6E8e2c504825668b

    // 03
    // 0xcb93f47f4ae6e2ee722517f3a2d3e7f55a5074f430c9860bcfe1d6d172492ed0
    // -> 0x46A26B330c0988a58aFF56e2a106F8256Ca89872

    my1: {
      url: `http://localhost:1111`,
      accounts: [
        "0xc03b0a988e2e18794f2f0e881d7ffcd340d583f63c1be078426ae09ddbdec9f5",
        "0x54e6e01600b66af71b9827429ff32599383d7694684bc09e26c3b13d95980650",
        "0xcb93f47f4ae6e2ee722517f3a2d3e7f55a5074f430c9860bcfe1d6d172492ed0"
      ]
    },


    my2: {
      url: `http://localhost:6111`,
      accounts: [
        "0xc03b0a988e2e18794f2f0e881d7ffcd340d583f63c1be078426ae09ddbdec9f5",
        "0x54e6e01600b66af71b9827429ff32599383d7694684bc09e26c3b13d95980650",
        "0xcb93f47f4ae6e2ee722517f3a2d3e7f55a5074f430c9860bcfe1d6d172492ed0"
      ]
    },

    hardhat: {
      chainId:100,
      gas:202450000,
      blockGasLimit:300_000_000,
      accounts: [
        {privateKey:"0xc03b0a988e2e18794f2f0e881d7ffcd340d583f63c1be078426ae09ddbdec9f5",balance:"10000000000000000000000"},
        {privateKey:"0x54e6e01600b66af71b9827429ff32599383d7694684bc09e26c3b13d95980650",balance:"10000000000000000000000"},
        {privateKey:"0xcb93f47f4ae6e2ee722517f3a2d3e7f55a5074f430c9860bcfe1d6d172492ed0",balance:"10000000000000000000000"},
      ]
    }

  },
  //solidity: '0.7.6',
  solidity: '0.6.12',
  namedAccounts: {
    deployer: 0
  },
}
