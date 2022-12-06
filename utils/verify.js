const { run } = require("hardhat");

async function verify(contractAddress, args) {
  console.log("Verifying contract......");
  try {
    await run("verify:verify", {
      contractAddress: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase.includes("already verified")) {
      console.log("Already verified");
    } else {
      console.error(e);
    }
  }
}

module.exports = { verify };
