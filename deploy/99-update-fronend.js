const {
  contractAddressesLocation,
  abiLocation,
} = require("../helper-hardhat-config");
const { network, ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

module.exports = async function () {
  if (process.env.UPDATE_FRONT_END) {
    console.log("Updating front end....");
    const nftMarketplace = await ethers.getContract("NftMarketplace");
    const basicNft = await ethers.getContract("BasicNft");

    await updateAbi(nftMarketplace, basicNft);
    await updateContractAddresses(nftMarketplace, basicNft);
  }
};

const updateAbi = async function (nftMarketplace, basicNft) {
  const marketplaceABI = nftMarketplace.interface.format(
    ethers.utils.FormatTypes.json
  );
  const basicNftABI = basicNft.interface.format(ethers.utils.FormatTypes.json);

  fs.writeFileSync(`${abiLocation}Nftmarketplace.json`, marketplaceABI);
  fs.writeFileSync(`${abiLocation}BasicNft.json`, basicNftABI);
};

const updateContractAddresses = async function (nftMarketplace, basicNft) {
  const chainId = network.config.chainId.toString();
  const contractAddresses = JSON.parse(
    fs.readFileSync(contractAddressesLocation, "utf-8")
  );

  if (chainId in contractAddresses) {
    if (
      contractAddresses[chainId]["nftMarketplace"] &&
      !contractAddresses[chainId]["nftMarketplace"].includes(
        nftMarketplace.address
      )
    ) {
      contractAddresses[chainId]["nftMarketplace"].push(nftMarketplace.address);
    } else {
      contractAddresses[chainId] = { nftMarketplace: [nftMarketplace.address] };
    }

    fs.writeFileSync(
      contractAddressesLocation,
      JSON.stringify(contractAddresses)
    );
  }
};

module.exports.tags = ["all", "frontend"];
