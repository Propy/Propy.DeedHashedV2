// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

const etherscanChainIds = [
    1, // Mainnet
    3, // Ropsten
    4, // Rinkeby
    5, // Goerli
    11155111, // Sepolia
    'goerli',
    'homestead',
    'mainnet',
]

async function main() {

  let [deployerSigner] = await hre.ethers.getSigners();

  console.log(`Deploying from: ${deployerSigner.address}, hre.network: ${hre.network.name}`);

  let adminAddress;
  if(hre.network.name === "mainnet") {
    // mainnet config
    // adminAddress = "";
  } else if (["goerli", "hardhat"].indexOf(hre.network.name) > -1) {
    // testnet config
    // adminAddress = deployerSigner.address;
    adminAddress = "0x657C0eCF07f6e2B2D01c13F328B230F07b824a57";
  }

  if(adminAddress) {

    const DeedHashedV2 = await ethers.getContractFactory("DeedHashedV2");
    const deedHashedV2 = await DeedHashedV2.deploy(adminAddress, "PropyDeedHashedV2", "pDHV2");
    await deedHashedV2.deployed();

    console.log("DeedHashedV2 contract deployed to:", deedHashedV2.address);

    // let transferOwnershipTx = await deedHashedV2.transferOwnership(adminAddress);
    // await transferOwnershipTx.wait();

    // console.log(`Transferred DeedHashedV2 ownership from ${deployerSigner.address} to ${adminAddress}`);

    // We run verification on Etherscan
    // If there is an official Etherscan instance of this network we are deploying to
    if(etherscanChainIds.indexOf(hre.network.name) > -1) {
      console.log('Deploying to a network supported by Etherscan, running Etherscan contract verification')
      
      // First we pause for a minute to give Etherscan a chance to update with our newly deployed contracts
      console.log('First waiting a minute to give Etherscan a chance to update...')
      await new Promise((resolve) => setTimeout(resolve, 60000));

      // We can now run Etherscan verification of our contracts

      try {
        await hre.run('verify:verify', {
          address: deedHashedV2.address,
          constructorArguments: [adminAddress, "PropyDeedHashedV2", "pDHV2"]
        });
      } catch (err) {
        console.log(`Verification error for reference contract: ${err}`);
      }
    } else {
      console.log('Not deploying to a network supported by Etherscan, skipping Etherscan contract verification');
    }

  } else {
    console.error("ERROR: adminAddress required");
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
