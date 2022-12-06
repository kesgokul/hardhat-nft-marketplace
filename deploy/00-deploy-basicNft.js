const { networkConfig } = require("../helper-hardhat-config");
const { network } = require("hardhat");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;
  const chainId = network.config.chainId;

  await deploy("BasicNft", {
    contract: "BasicNft",
    from: deployer,
    log: true,
    waitConfirmations: networkConfig[chainId].waitConfirmations || 1,
  });

  log("---------------------------------------------");
};

module.exports.tags = ["all", "basicNft"];
