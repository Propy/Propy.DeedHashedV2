const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DeedHashedCloneFactory", function () {

  let DEFAULT_ADMIN_ROLE = "0x00";
  let MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
  let STATUS_UPDATER_ROLE = "0x623dce6eebcb1ce2d181d8e0b50fbdbf007b027df90c2c87036f6ee3ee840474";
  let TOKEN_URI_UPDATER_ROLE = "0xd610886bde7b9b3561f4ecdece11096467246c56f3a9958246e8d8b56500f923";

  let adminSigner,
    minterSigner,
    statusUpdaterSigner,
    tokenURIUpdaterSigner,
    statusAndTokenURIUpdaterSigner,
    miscSigner,
    tokenReceiver;
  let deedHashedV2;
  let tokenName = "PropyDeedHashedV2"
  let tokenSymbol = "pDHV2"
  let zeroAddress = "0x0000000000000000000000000000000000000000";
  let mockUpdateHash = "0x1c34a3b27b8443eecb1d801754255cdae4c1378c46c3190120b94dfc4f26caa2";
  let mockUpdateMetaHash = "0xf7e753b1f4e3d1f16607fa273f1852ef182d129f17036987f41ab6311e1ec4be";
  let mockGetTypeResponse = "0x6c9d3246a82cebf50568960c7807f587f292ee84c530e338c23fad4116a14a13";
  let TokenStatus = {
    InitialSetup: 0,
    InitialDocuments: 1,
    TitleAndEscrow: 2,
    InspectionsAndDisclosures: 3,
    ClosingStatements: 4,
    Payment: 5,
    DeedAndFinalDocuments: 6,
    Complete: 7
  }
  beforeEach(async function () {
    [
      adminSigner,
      minterSigner,
      statusUpdaterSigner,
      tokenURIUpdaterSigner,
      statusAndTokenURIUpdaterSigner,
      miscSigner,
      tokenReceiver,
    ] = await hre.ethers.getSigners();

    const DeedHashedV2 = await ethers.getContractFactory("DeedHashedV2");
    deedHashedV2 = await DeedHashedV2.deploy(
      adminSigner.address,
      tokenName,
      tokenSymbol,
    );
    await deedHashedV2.deployed();

    // Grant roles
    await deedHashedV2.grantRole(MINTER_ROLE, minterSigner.address);
    await deedHashedV2.grantRole(STATUS_UPDATER_ROLE, statusUpdaterSigner.address);
    await deedHashedV2.grantRole(TOKEN_URI_UPDATER_ROLE, tokenURIUpdaterSigner.address);
    await deedHashedV2.grantRole(STATUS_UPDATER_ROLE, statusAndTokenURIUpdaterSigner.address);
    await deedHashedV2.grantRole(TOKEN_URI_UPDATER_ROLE, statusAndTokenURIUpdaterSigner.address);

  });
  context("function grantRole", async function () {
    it("Should only be callable from the adminSigner address (DEFAULT_ADMIN_ROLE)", async function () {
      await expect(
        deedHashedV2.connect(miscSigner).grantRole(MINTER_ROLE, minterSigner.address)
      ).to.be.reverted;
      await expect(
        deedHashedV2.connect(miscSigner).grantRole(STATUS_UPDATER_ROLE, statusUpdaterSigner.address)
      ).to.be.reverted;
      await expect(
        deedHashedV2.connect(miscSigner).grantRole(TOKEN_URI_UPDATER_ROLE, tokenURIUpdaterSigner.address)
      ).to.be.reverted;
    });
    it("Should enable the adminSigner to properly grant and revoke roles", async function () {
      await deedHashedV2.revokeRole(MINTER_ROLE, minterSigner.address);
      await deedHashedV2.revokeRole(STATUS_UPDATER_ROLE, statusUpdaterSigner.address);
      await deedHashedV2.revokeRole(TOKEN_URI_UPDATER_ROLE, tokenURIUpdaterSigner.address);
      await deedHashedV2.revokeRole(STATUS_UPDATER_ROLE, statusAndTokenURIUpdaterSigner.address);
      await deedHashedV2.revokeRole(TOKEN_URI_UPDATER_ROLE, statusAndTokenURIUpdaterSigner.address);
      expect(
        await deedHashedV2.hasRole(MINTER_ROLE, minterSigner.address)
      ).to.equal(false);
      expect(
        await deedHashedV2.hasRole(STATUS_UPDATER_ROLE, statusUpdaterSigner.address)
      ).to.equal(false);
      expect(
        await deedHashedV2.hasRole(TOKEN_URI_UPDATER_ROLE, tokenURIUpdaterSigner.address)
      ).to.equal(false);
      expect(
        await deedHashedV2.hasRole(STATUS_UPDATER_ROLE, statusAndTokenURIUpdaterSigner.address)
      ).to.equal(false);
      expect(
        await deedHashedV2.hasRole(TOKEN_URI_UPDATER_ROLE, statusAndTokenURIUpdaterSigner.address)
      ).to.equal(false);
      await deedHashedV2.grantRole(MINTER_ROLE, minterSigner.address);
      await deedHashedV2.grantRole(STATUS_UPDATER_ROLE, statusUpdaterSigner.address);
      await deedHashedV2.grantRole(TOKEN_URI_UPDATER_ROLE, tokenURIUpdaterSigner.address);
      await deedHashedV2.grantRole(STATUS_UPDATER_ROLE, statusAndTokenURIUpdaterSigner.address);
      await deedHashedV2.grantRole(TOKEN_URI_UPDATER_ROLE, statusAndTokenURIUpdaterSigner.address);
      expect(
        await deedHashedV2.hasRole(MINTER_ROLE, minterSigner.address)
      ).to.equal(true);
      expect(
        await deedHashedV2.hasRole(STATUS_UPDATER_ROLE, statusUpdaterSigner.address)
      ).to.equal(true);
      expect(
        await deedHashedV2.hasRole(TOKEN_URI_UPDATER_ROLE, tokenURIUpdaterSigner.address)
      ).to.equal(true);
      expect(
        await deedHashedV2.hasRole(STATUS_UPDATER_ROLE, statusAndTokenURIUpdaterSigner.address)
      ).to.equal(true);
      expect(
        await deedHashedV2.hasRole(TOKEN_URI_UPDATER_ROLE, statusAndTokenURIUpdaterSigner.address)
      ).to.equal(true);
    })
  });
  context("function mint", async function () {
    it("Should not be callable from a non-minter address", async function () {
      await expect(
        deedHashedV2.connect(miscSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx")
      ).to.be.revertedWith("NOT_MINTER")
    });
    it("Should not be able to mint to the zero address", async function () {
      await expect(
        deedHashedV2.connect(minterSigner).mint(zeroAddress, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx")
      ).to.be.revertedWith("ERC721: mint to the zero address")
    });
    it("Should not be able to mint with an empty tokenURI", async function () {
      await expect(
        deedHashedV2.connect(minterSigner).mint(zeroAddress, "")
      ).to.be.revertedWith("EMPTY_TOKEN_URI")
    });
    it("Should mint when called by a minter address", async function () {
      await expect(
        deedHashedV2.ownerOf(1)
      ).to.be.revertedWith("ERC721: invalid token ID");
      await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx")
      expect(
        await deedHashedV2.ownerOf(1)
      ).to.equal(tokenReceiver.address);
    });
  });
  context("function updateTokenStatus", async function () {
    it("Should not be callable from a non-statusUpdater address", async function () {
      await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
      await expect(
        deedHashedV2.connect(minterSigner).updateTokenStatus(1, TokenStatus.InitialDocuments)
      ).to.be.revertedWith("NOT_STATUS_UPDATER")
    });
  });
});
