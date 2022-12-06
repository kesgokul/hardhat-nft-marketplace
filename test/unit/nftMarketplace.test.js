const { developmentChains } = require("../../helper-hardhat-config");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { expect, assert } = require("chai");

const TOKEN_ID = 1;
const PRICE = ethers.utils.parseEther("0.1");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Nft Marketplace", function () {
      let deployer, basicNft, nftMarketplace;
      beforeEach(async function () {
        await deployments.fixture(["all"]);
        deployer = (await getNamedAccounts()).deployer;
        basicNft = await ethers.getContract("BasicNft", deployer);
        nftMarketplace = await ethers.getContract("NftMarketplace", deployer);

        //mint an NFT
        await basicNft.mintBasicNft();
        await basicNft.approve(nftMarketplace.address, TOKEN_ID);
      });
      describe("listing", function () {
        it("reverts when not owner is trying to list", async function () {
          // 1. connect to the marketplace using a different acccount
          const signers = await ethers.getSigners();
          const falseLister = await nftMarketplace.connect(signers[1]);
          await expect(
            falseLister.listItem(basicNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith("NftMarketplace__notOwner");
        });

        it("reverts when price is set as zero", async function () {
          await expect(
            nftMarketplace.listItem(
              basicNft.address,
              TOKEN_ID,
              ethers.utils.parseEther("0")
            )
          ).to.be.revertedWith("NftMarketplace__priceZero");
        });

        it("reverts if already listed", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          await expect(
            nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith("NftMarketplace__alreadyListed");
        });

        it("emits event after listing", async function () {
          const tx = await nftMarketplace.listItem(
            basicNft.address,
            TOKEN_ID,
            PRICE
          );
          const txReceipt = await tx.wait(1);
          const listing = await nftMarketplace.getListing(basicNft.address, 1);
          assert.equal(txReceipt.events[0].args[0], deployer);
          assert.equal(ethers.utils.formatEther(listing[0]), "0.1");
          assert.equal(listing[1], deployer);
        });
      });

      describe("buy item", function () {
        beforeEach(async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
        });
        it("reverts if item is not listed", async function () {
          await expect(
            nftMarketplace.buyItem(basicNft.address, 2, {
              value: PRICE,
            })
          ).to.be.revertedWith("NftMarketplace__notListed");
        });

        it("reverts if price is not met", async function () {
          const signers = await ethers.getSigners();
          const buyer = await nftMarketplace.connect(signers[1]);
          await expect(
            buyer.buyItem(basicNft.address, 1, {
              value: ethers.utils.parseEther("0.05"),
            })
          ).to.be.revertedWith("NftMarketplace__itemPriceNotMet");
        });

        it("bought item successfully", async function () {
          const signers = await ethers.getSigners();
          const buyerAccount = signers[1];
          const buyer = await nftMarketplace.connect(buyerAccount);
          const tx = await buyer.buyItem(basicNft.address, 1, {
            value: PRICE,
          });
          const txReceipt = await tx.wait(1);
          const listing = await nftMarketplace.getListing(basicNft.address, 1);
          const proceeds = await nftMarketplace.getProceeds(deployer);
          const newOwner = await basicNft.ownerOf(TOKEN_ID);

          assert.equal(txReceipt.events[1].args[0], buyerAccount.address);
          assert.equal(listing[0].toString(), "0");
          assert.equal(ethers.utils.formatEther(proceeds), "0.1");
          assert.equal(newOwner, buyerAccount.address);
        });
      });

      describe("cancel listing", function () {
        beforeEach(async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
        });
        it("reverts if not the owner of the item", async function () {
          const signers = await ethers.getSigners();
          const canceller = await nftMarketplace.connect(signers[1]);

          await expect(
            canceller.cancelListing(basicNft.address, TOKEN_ID)
          ).to.be.revertedWith("NftMarketplace__notOwner");
        });

        it("cancels listing successfully", async function () {
          const tx = await nftMarketplace.cancelListing(
            basicNft.address,
            TOKEN_ID
          );
          const txReceipt = await tx.wait(1);
          const listing = await nftMarketplace.getListing(
            basicNft.address,
            TOKEN_ID
          );

          assert.equal(txReceipt.events[0].args[0], deployer);
          assert.equal(listing[0].toString(), "0");
        });
      });

      describe("update listing", function () {
        it("reverts if not listed", async function () {
          await expect(
            nftMarketplace.updatePrice(
              basicNft.address,
              TOKEN_ID,
              ethers.utils.parseEther("0.11")
            )
          ).to.be.revertedWith("NftMarketplace__notListed");
        });

        it("updates the listing successfully", async function () {
          const newPrice = ethers.utils.parseEther("0.2");

          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);

          const tx = await nftMarketplace.updatePrice(
            basicNft.address,
            TOKEN_ID,
            newPrice
          );
          const txReceipt = await tx.wait(1);
          const listing = await nftMarketplace.getListing(
            basicNft.address,
            TOKEN_ID
          );

          assert.equal(
            txReceipt.events[0].args[3].toString(),
            newPrice.toString()
          );
          assert.equal(
            listing[0].toString(),
            ethers.utils.parseEther("0.2").toString()
          );
        });
      });

      describe("withdraw proceeds", function () {
        let buyer;
        beforeEach(async function () {
          const signers = await ethers.getSigners();
          buyer = await nftMarketplace.connect(signers[1]);
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          await buyer.buyItem(basicNft.address, TOKEN_ID, { value: PRICE });
        });
        it("reverts if no proceeds available", async function () {
          await expect(buyer.withdrawProceeds()).to.be.revertedWith(
            "NftMarketplace__noProceeds"
          );
        });
      });
    });
