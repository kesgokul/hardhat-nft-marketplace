const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const { network } = require("hardhat");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;
  const chainId = network.config.chainId;

  const nftMarketplace = await deploy("NftMarketplace", {
    contract: "NftMarketplace",
    from: deployer,
    log: true,
    waitConfirmations: networkConfig[chainId].waitConfirmations || 1,
  });

  log("--------------------------------------------");
  if (!developmentChains.includes(network.name)) {
    verify(nftMarketplace.address, []);
  }
};

module.exports.tags = ["all", "marketplace"];
