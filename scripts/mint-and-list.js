const { ethers, deployments } = require("hardhat");

const mintAndList = async () => {
  await deployments.fixture(["all"]);
  const basicNft = await ethers.getContract("BasicNft");
  console.log("Minting Basic NFT......");
  const tx = await basicNft.mintBasicNft();
  const txReceipt = await tx.wait(1);
  const tokenId = txReceipt.events[0].args.tokenId;
  console.log(
    `Minted NFT Token ID:${tokenId.toString()} from ${basicNft.address}`
  );
};

mintAndList()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
