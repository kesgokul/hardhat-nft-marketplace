# Decentralized NFT Marketplace

<sub>On going project</sub>

<sub>Disclaimer: This project is being built as a part of the Blockchain, Solidity and Hardhat course by FreeCodeCamp for learning purposes</sub>

## Overview

A NFT Marketplace that will be deployed on the Ethereum network that will allow users,

1. to list NFTs that they own for sale.
2. Update the price of the listing.
3. cancel listings.
4. purchase a listed NFTs.
5. Withdraw the proceeds from the NFT sales

## Tech used and Learnings:

### Backend - Smart contracts

1. Used the `hardhat` dev environment to write the Smart contract for the NFT marketplace.
2. Wrote the deploy scripts to deploy them to the test/local network and programmatically verify the contract on etherscan.
3. Wrote tests to make sure the contract is 100% covered.

### Front-end - Nextjs

1. Using `Nextjs` to setup the project and create different pages for viewing listed NFTs and listing NFTs for sale.
2. used `web3uikit` to create the connect wallet button and display notificaions.
3. Used `react-moralis` in combination with `ethers` and to connect to the smart contract and call contract functions to enter the raffle, fetch and display the numbers of players who have entered the raffle and the most recent winner.

### The Graph protocol - for Indexing
