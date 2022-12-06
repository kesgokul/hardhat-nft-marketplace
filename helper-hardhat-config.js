const { ethers } = require("hardhat");

const networkConfig = {
  31337: {
    name: "localhost",
    chainId: 31337,
    wethToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    busdToken: "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
    daiToken: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    lendingPoolAddressesProvider: "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
    wethAmount: ethers.utils.parseEther("0.5"),
    borrowAmount: ethers.utils.parseEther("20"),
  },
  5: {
    name: "goerli",
    chainId: 5,
    wethToken: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    busdToken: "0xb809b9B2dc5e93CB863176Ea2D565425B03c0540",
    daiToken: "0x73967c6a0904aA032C103b4104747E88c566B1A2",
    lendingPoolAddressesProvider: "0x5E52dEc931FFb32f609681B8438A51c675cc232d",
    wethAmount: ethers.utils.parseEther("0.05"),
    borrowAmount: ethers.utils.parseEther("10"),
  },
};

const developmentChains = ["hardhat", "localhost"];

const contractAddressesLocation =
  "../nextjs-hardhat-nft-marketplace/constants/contractAddresses.json";
const abiLocation = "../nextjs-hardhat-nft-marketplace/constants/";

module.exports = {
  networkConfig,
  developmentChains,
  contractAddressesLocation,
  abiLocation,
};
