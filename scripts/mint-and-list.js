const { ethers, deployments, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

const PRICE = ethers.utils.parseEther("0.01");

const mintAndList = async () => {
  if (developmentChains.includes(network.name)) {
    await deployments.fixture(["all"]);
  }

  const { deployer } = await getNamedAccounts();

  const basicNft = await ethers.getContract("BasicNft", deployer);
  const nftMarketplace = await ethers.getContract("NftMarketplace", deployer);

  // Mint a basic Nft
  console.log("Minting Basic NFT......");
  const tx = await basicNft.mintBasicNft();
  const txReceipt = await tx.wait(1);
  const tokenId = txReceipt.events[0].args.tokenId;
  console.log(
    `Minted NFT Token ID:${tokenId.toString()} from ${basicNft.address}`
  );

  // Arrove the nftMarketplace for listing(to be able to transfer the nft to the buyer)
  console.log("Approving for listing...");
  const txApprove = await basicNft.approve(nftMarketplace.address, tokenId);
  await txApprove.wait(1);

  //List the nft on the marketplace
  console.log("Listing the nft...");
  const txList = await nftMarketplace.listItem(
    basicNft.address,
    tokenId,
    PRICE
  );
};

mintAndList()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
