const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DeedHashedV2", function () {

  let DEFAULT_ADMIN_ROLE = "0x00";
  let MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
  let STATE_UPDATER_ROLE = "0x7f496d3b3a5b8d5d66b1301ac9407fb7ebb241c9fb60310446582db629b01709";
  let TOKEN_URI_UPDATER_ROLE = "0xd610886bde7b9b3561f4ecdece11096467246c56f3a9958246e8d8b56500f923";
  let TRANSFERRER_ROLE = "0x9c0b3a9882e11a6bfb8283b46d1e79513afb8024ee864cd3a5b3a9050c42a7d7";
  let METADATA_LOCKER_ROLE = "0x0af1a227e20c738dadfc76971d0d110fd4b320a2b47db610f169242cda7cbd7e";

  let adminSigner,
    minterSigner,
    transferrerSigner,
    statusUpdaterSigner,
    tokenURIUpdaterSigner,
    statusAndTokenURIUpdaterSigner,
    miscSigner,
    tokenReceiver;
  let deedHashedV2;
  let tokenName = "PropyDeedHashedV2"
  let tokenSymbol = "pDHV2"
  let zeroAddress = "0x0000000000000000000000000000000000000000";
  let ERC721InterfaceSignature = "0x80ac58cd";
  let ERC1155InterfaceSignature = "0xd9b67a26";
  let mockUpdateHash = "0x1c34a3b27b8443eecb1d801754255cdae4c1378c46c3190120b94dfc4f26caa2";
  let mockUpdateMetaHash = "0xf7e753b1f4e3d1f16607fa273f1852ef182d129f17036987f41ab6311e1ec4be";
  let mockGetTypeResponse = "0x6c9d3246a82cebf50568960c7807f587f292ee84c530e338c23fad4116a14a13";
  let TokenState = {
    InitialSetup: 0,
    InitialDocuments: 1,
    TitleAndEscrow: 2,
    InspectionsAndDisclosures: 3,
    ClosingStatements: 4,
    Payment: 5,
    DeedAndFinalDocuments: 6,
    Complete: 7,
    Cancelled: 8
  }
  let InvalidTokenState = 9;
  beforeEach(async function () {
    [
      adminSigner,
      minterSigner,
      transferrerSigner,
      statusUpdaterSigner,
      metadataLockerSigner,
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
    await deedHashedV2.grantRole(TRANSFERRER_ROLE, transferrerSigner.address);
    await deedHashedV2.grantRole(STATE_UPDATER_ROLE, statusUpdaterSigner.address);
    await deedHashedV2.grantRole(METADATA_LOCKER_ROLE, metadataLockerSigner.address);
    await deedHashedV2.grantRole(TOKEN_URI_UPDATER_ROLE, tokenURIUpdaterSigner.address);
    await deedHashedV2.grantRole(STATE_UPDATER_ROLE, statusAndTokenURIUpdaterSigner.address);
    await deedHashedV2.grantRole(TOKEN_URI_UPDATER_ROLE, statusAndTokenURIUpdaterSigner.address);

  });
  context("state-modifying functions", async function () {
    context("function grantRole", async function () {
      it("Should only be callable from the adminSigner address (DEFAULT_ADMIN_ROLE)", async function () {
        await expect(
          deedHashedV2.connect(miscSigner).grantRole(MINTER_ROLE, minterSigner.address)
        ).to.be.reverted;
        await expect(
          deedHashedV2.connect(miscSigner).grantRole(STATE_UPDATER_ROLE, statusUpdaterSigner.address)
        ).to.be.reverted;
        await expect(
          deedHashedV2.connect(miscSigner).grantRole(TOKEN_URI_UPDATER_ROLE, tokenURIUpdaterSigner.address)
        ).to.be.reverted;
      });
      it("Should enable the adminSigner to properly grant and revoke roles", async function () {
        await deedHashedV2.revokeRole(MINTER_ROLE, minterSigner.address);
        await deedHashedV2.revokeRole(STATE_UPDATER_ROLE, statusUpdaterSigner.address);
        await deedHashedV2.revokeRole(TOKEN_URI_UPDATER_ROLE, tokenURIUpdaterSigner.address);
        await deedHashedV2.revokeRole(STATE_UPDATER_ROLE, statusAndTokenURIUpdaterSigner.address);
        await deedHashedV2.revokeRole(TOKEN_URI_UPDATER_ROLE, statusAndTokenURIUpdaterSigner.address);
        expect(
          await deedHashedV2.hasRole(MINTER_ROLE, minterSigner.address)
        ).to.equal(false);
        expect(
          await deedHashedV2.hasRole(STATE_UPDATER_ROLE, statusUpdaterSigner.address)
        ).to.equal(false);
        expect(
          await deedHashedV2.hasRole(TOKEN_URI_UPDATER_ROLE, tokenURIUpdaterSigner.address)
        ).to.equal(false);
        expect(
          await deedHashedV2.hasRole(STATE_UPDATER_ROLE, statusAndTokenURIUpdaterSigner.address)
        ).to.equal(false);
        expect(
          await deedHashedV2.hasRole(TOKEN_URI_UPDATER_ROLE, statusAndTokenURIUpdaterSigner.address)
        ).to.equal(false);
        await deedHashedV2.grantRole(MINTER_ROLE, minterSigner.address);
        await deedHashedV2.grantRole(STATE_UPDATER_ROLE, statusUpdaterSigner.address);
        await deedHashedV2.grantRole(TOKEN_URI_UPDATER_ROLE, tokenURIUpdaterSigner.address);
        await deedHashedV2.grantRole(STATE_UPDATER_ROLE, statusAndTokenURIUpdaterSigner.address);
        await deedHashedV2.grantRole(TOKEN_URI_UPDATER_ROLE, statusAndTokenURIUpdaterSigner.address);
        expect(
          await deedHashedV2.hasRole(MINTER_ROLE, minterSigner.address)
        ).to.equal(true);
        expect(
          await deedHashedV2.hasRole(STATE_UPDATER_ROLE, statusUpdaterSigner.address)
        ).to.equal(true);
        expect(
          await deedHashedV2.hasRole(TOKEN_URI_UPDATER_ROLE, tokenURIUpdaterSigner.address)
        ).to.equal(true);
        expect(
          await deedHashedV2.hasRole(STATE_UPDATER_ROLE, statusAndTokenURIUpdaterSigner.address)
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
    context("function transferFrom", async function () {
      it("Should not be possible to transfer without transfer role", async function () {
        await expect(
          deedHashedV2.ownerOf(1)
        ).to.be.revertedWith("ERC721: invalid token ID");
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx")
        expect(
          await deedHashedV2.ownerOf(1)
        ).to.equal(tokenReceiver.address);
        await expect(
          deedHashedV2.connect(tokenReceiver).transferFrom(tokenReceiver.address, minterSigner.address, 1)
        ).to.be.revertedWith("CONTACT_PROPY_FOR_TRANSFER");
        expect(
          await deedHashedV2.ownerOf(1)
        ).to.equal(tokenReceiver.address);
      });
      it("Should be possible to transfer with transfer role", async function () {
        await expect(
          deedHashedV2.ownerOf(1)
        ).to.be.revertedWith("ERC721: invalid token ID");
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx")
        expect(
          await deedHashedV2.ownerOf(1)
        ).to.equal(tokenReceiver.address);
        await deedHashedV2.connect(transferrerSigner).transferFrom(tokenReceiver.address, minterSigner.address, 1)
      });
    });
    context("function safeTransferFrom(address,address,uint256)", async function () {
      it("Should not be possible to transfer without transfer role", async function () {
        await expect(
          deedHashedV2.ownerOf(1)
        ).to.be.revertedWith("ERC721: invalid token ID");
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx")
        expect(
          await deedHashedV2.ownerOf(1)
        ).to.equal(tokenReceiver.address);
        await expect(
          deedHashedV2.connect(tokenReceiver)['safeTransferFrom(address,address,uint256)'](tokenReceiver.address, minterSigner.address, 1)
        ).to.be.revertedWith("CONTACT_PROPY_FOR_TRANSFER");
        expect(
          await deedHashedV2.ownerOf(1)
        ).to.equal(tokenReceiver.address);
      });
      it("Should be possible to transfer with transfer role", async function () {
        await expect(
          deedHashedV2.ownerOf(1)
        ).to.be.revertedWith("ERC721: invalid token ID");
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx")
        expect(
          await deedHashedV2.ownerOf(1)
        ).to.equal(tokenReceiver.address);
        await deedHashedV2.connect(transferrerSigner)['safeTransferFrom(address,address,uint256)'](tokenReceiver.address, minterSigner.address, 1)
        expect(
          await deedHashedV2.ownerOf(1)
        ).to.equal(minterSigner.address);
      });
    });
    context("function safeTransferFrom(address,address,uint256,bytes)", async function () {
      it("Should not be possible to transfer without transfer role", async function () {
        await expect(
          deedHashedV2.ownerOf(1)
        ).to.be.revertedWith("ERC721: invalid token ID");
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx")
        expect(
          await deedHashedV2.ownerOf(1)
        ).to.equal(tokenReceiver.address);
        await expect(
          deedHashedV2.connect(tokenReceiver)['safeTransferFrom(address,address,uint256,bytes)'](tokenReceiver.address, minterSigner.address, 1, "0x00")
        ).to.be.revertedWith("CONTACT_PROPY_FOR_TRANSFER");
        expect(
          await deedHashedV2.ownerOf(1)
        ).to.equal(tokenReceiver.address);
      });
      it("Should not be possible to transfer with transfer role", async function () {
        await expect(
          deedHashedV2.ownerOf(1)
        ).to.be.revertedWith("ERC721: invalid token ID");
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx")
        expect(
          await deedHashedV2.ownerOf(1)
        ).to.equal(tokenReceiver.address);
        await deedHashedV2.connect(transferrerSigner)['safeTransferFrom(address,address,uint256,bytes)'](tokenReceiver.address, minterSigner.address, 1, "0x00")
        expect(
          await deedHashedV2.ownerOf(1)
        ).to.equal(minterSigner.address);
      });
    });
    context("function updateTokenState", async function () {
      it("Should not be callable from a non-tokenURIUpdater address", async function () {
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        await expect(
          deedHashedV2.connect(minterSigner).updateTokenState(1, TokenState.InitialDocuments)
        ).to.be.revertedWith("NOT_STATUS_UPDATER")
      });
      it("Should not allow an invalid tokenStatus", async function () {
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        await expect(
          deedHashedV2.connect(statusUpdaterSigner).updateTokenState(1, InvalidTokenState)
        ).to.be.reverted
      });
      it("Should not allow an invalid token ID", async function () {
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        await expect(
          deedHashedV2.connect(statusUpdaterSigner).updateTokenState(2, TokenState.InitialDocuments)
        ).to.be.revertedWith("INVALID_TOKEN_ID")
      });
      it("Should allow tokenURIUpdaterSigner to update tokenStatus", async function () {
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        let currentTokenInfo = await deedHashedV2.tokenInfo(1);
        expect(currentTokenInfo.state).to.equal(TokenState.InitialSetup);
        await deedHashedV2.connect(statusUpdaterSigner).updateTokenState(1, TokenState.InitialDocuments);
        let postUpdateTokenInfo = await deedHashedV2.tokenInfo(1);
        expect(postUpdateTokenInfo.state).to.equal(TokenState.InitialDocuments);
      });
    });
    context("function updateTokenURI", async function () {
      it("Should not be callable from a non-tokenURIUpdater address", async function () {
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        await expect(
          deedHashedV2.connect(minterSigner).updateTokenURI(1, "ipfs://test")
        ).to.be.revertedWith("NOT_TOKEN_URI_UPDATER")
      });
      it("Should not allow an empty tokenURI", async function () {
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        await expect(
          deedHashedV2.connect(tokenURIUpdaterSigner).updateTokenURI(1, "")
        ).to.be.revertedWith("EMPTY_TOKEN_URI")
      });
      it("Should not allow an invalid token ID", async function () {
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        await expect(
          deedHashedV2.connect(tokenURIUpdaterSigner).updateTokenURI(2, "ipfs://test")
        ).to.be.revertedWith("INVALID_TOKEN_ID")
      });
      it("Should allow tokenURIUpdaterSigner to update tokenURI", async function () {
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        let currentTokenInfo = await deedHashedV2.tokenInfo(1);
        expect(currentTokenInfo.tokenURI).to.equal("ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        await deedHashedV2.connect(tokenURIUpdaterSigner).updateTokenURI(1, "ipfs://test");
        let postUpdateTokenInfo = await deedHashedV2.tokenInfo(1);
        expect(postUpdateTokenInfo.tokenURI).to.equal("ipfs://test");
      });
    });
    context("function updateTokenStateAndURI", async function () {
      it("Should not be callable from a non-statusAndTokenURIUpdater address", async function () {
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        await expect(
          deedHashedV2.connect(tokenURIUpdaterSigner).updateTokenStateAndURI(1, TokenState.InitialDocuments, "ipfs://test")
        ).to.be.revertedWith("NOT_STATUS_UPDATER")
        await expect(
          deedHashedV2.connect(statusUpdaterSigner).updateTokenStateAndURI(1, TokenState.InitialDocuments, "ipfs://test")
        ).to.be.revertedWith("NOT_TOKEN_URI_UPDATER")
      });
      it("Should not allow an empty tokenURI", async function () {
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        await expect(
          deedHashedV2.connect(statusAndTokenURIUpdaterSigner).updateTokenStateAndURI(1, TokenState.InitialDocuments, "")
        ).to.be.revertedWith("EMPTY_TOKEN_URI")
      });
      it("Should not allow an invalid tokenStatus", async function () {
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        await expect(
          deedHashedV2.connect(statusAndTokenURIUpdaterSigner).updateTokenStateAndURI(1, InvalidTokenState, "")
        ).to.be.reverted
      });
      it("Should not allow an invalid token ID", async function () {
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        await expect(
          deedHashedV2.connect(statusAndTokenURIUpdaterSigner).updateTokenStateAndURI(2, TokenState.InitialDocuments, "ipfs://test")
        ).to.be.revertedWith("INVALID_TOKEN_ID")
      });
      it("Should allow statusAndTokenURIUpdaterSigner to update tokenURI & tokenStatus", async function () {
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        let currentTokenInfo = await deedHashedV2.tokenInfo(1);
        expect(currentTokenInfo.tokenURI).to.equal("ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        expect(currentTokenInfo.state).to.equal(TokenState.InitialSetup);
        await deedHashedV2.connect(statusAndTokenURIUpdaterSigner).updateTokenStateAndURI(1, TokenState.InitialDocuments, "ipfs://test")
        let postUpdateTokenInfo = await deedHashedV2.tokenInfo(1);
        expect(postUpdateTokenInfo.tokenURI).to.equal("ipfs://test");
        expect(postUpdateTokenInfo.state).to.equal(TokenState.InitialDocuments);
      });
    });
    context("function lockMetadata", async function () {
      it("Should not be callable from a non-metadataLocker address", async function () {
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        await expect(
          deedHashedV2.connect(minterSigner).lockMetadata(1)
        ).to.be.revertedWith("NOT_METADATA_LOCKER")
      });
      it("Should revert if the tokenId is invalid", async function () {
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        await expect(
          deedHashedV2.connect(metadataLockerSigner).lockMetadata(2)
        ).to.be.revertedWith("INVALID_TOKEN_ID")
      });
      it("Should revert if metadata is already locked", async function () {
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        let currentTokenInfo = await deedHashedV2.tokenInfo(1);
        expect(currentTokenInfo.state).to.equal(TokenState.InitialSetup);
        await deedHashedV2.connect(statusUpdaterSigner).updateTokenState(1, TokenState.Complete);
        let postUpdateTokenInfo = await deedHashedV2.tokenInfo(1);
        expect(postUpdateTokenInfo.state).to.equal(TokenState.Complete);
        await deedHashedV2.connect(metadataLockerSigner).lockMetadata(1);
        await expect(
          deedHashedV2.connect(metadataLockerSigner).lockMetadata(1)
        ).to.be.revertedWith("ALREADY_LOCKED");
      });
      it("Should allow metadataLockerSigner to lock metadata", async function () {
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        let currentTokenInfo = await deedHashedV2.tokenInfo(1);
        expect(currentTokenInfo.state).to.equal(TokenState.InitialSetup);
        await deedHashedV2.connect(statusUpdaterSigner).updateTokenState(1, TokenState.Complete);
        let postUpdateTokenInfo = await deedHashedV2.tokenInfo(1);
        expect(postUpdateTokenInfo.state).to.equal(TokenState.Complete);
        await deedHashedV2.connect(metadataLockerSigner).lockMetadata(1);
        await expect(
          deedHashedV2.connect(statusUpdaterSigner).updateTokenState(1, TokenState.Cancelled)
        ).to.be.revertedWith("METADATA_LOCKED");
        await expect(
          deedHashedV2.connect(tokenURIUpdaterSigner).updateTokenURI(1, "ipfs://")
        ).to.be.revertedWith("METADATA_LOCKED");
        await expect(
          deedHashedV2.connect(statusAndTokenURIUpdaterSigner).updateTokenStateAndURI(1, TokenState.Cancelled, "test")
        ).to.be.revertedWith("METADATA_LOCKED");
      });
    });
    context("function unlockMetadata", async function () {
      it("Should revert if the metadata is already unlocked", async function () {
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        let currentTokenInfo = await deedHashedV2.tokenInfo(1);
        expect(currentTokenInfo.state).to.equal(TokenState.InitialSetup);
        await deedHashedV2.connect(statusUpdaterSigner).updateTokenState(1, TokenState.Complete);
        let postUpdateTokenInfo = await deedHashedV2.tokenInfo(1);
        expect(postUpdateTokenInfo.state).to.equal(TokenState.Complete);
        await deedHashedV2.connect(metadataLockerSigner).lockMetadata(1);
        await expect(
          deedHashedV2.connect(statusUpdaterSigner).updateTokenState(1, TokenState.Cancelled)
        ).to.be.revertedWith("METADATA_LOCKED");
        await expect(
          deedHashedV2.connect(tokenURIUpdaterSigner).updateTokenURI(1, "ipfs://")
        ).to.be.revertedWith("METADATA_LOCKED");
        await expect(
          deedHashedV2.connect(statusAndTokenURIUpdaterSigner).updateTokenStateAndURI(1, TokenState.Cancelled, "test")
        ).to.be.revertedWith("METADATA_LOCKED");
        await deedHashedV2.connect(tokenReceiver).unlockMetadata(1);
        await deedHashedV2.connect(statusUpdaterSigner).updateTokenState(1, TokenState.Cancelled);
        let postUnlockUpdateTokenInfo = await deedHashedV2.tokenInfo(1);
        expect(postUnlockUpdateTokenInfo.state).to.equal(TokenState.Cancelled);
        await expect(
          deedHashedV2.connect(tokenReceiver).unlockMetadata(1)
        ).to.be.revertedWith("ALREADY_UNLOCKED")
      });
      it("Should not be callable from a non-token-owner address", async function () {
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        let currentTokenInfo = await deedHashedV2.tokenInfo(1);
        expect(currentTokenInfo.state).to.equal(TokenState.InitialSetup);
        await deedHashedV2.connect(statusUpdaterSigner).updateTokenState(1, TokenState.Complete);
        let postUpdateTokenInfo = await deedHashedV2.tokenInfo(1);
        expect(postUpdateTokenInfo.state).to.equal(TokenState.Complete);
        await deedHashedV2.connect(metadataLockerSigner).lockMetadata(1);
        await expect(
          deedHashedV2.connect(statusUpdaterSigner).updateTokenState(1, TokenState.Cancelled)
        ).to.be.revertedWith("METADATA_LOCKED");
        await expect(
          deedHashedV2.connect(tokenURIUpdaterSigner).updateTokenURI(1, "ipfs://")
        ).to.be.revertedWith("METADATA_LOCKED");
        await expect(
          deedHashedV2.connect(statusAndTokenURIUpdaterSigner).updateTokenStateAndURI(1, TokenState.Payment, "test")
        ).to.be.revertedWith("METADATA_LOCKED");
        await expect(
          deedHashedV2.connect(metadataLockerSigner).unlockMetadata(1)
        ).to.be.revertedWith("NOT_TOKEN_OWNER")
      });
      it("Should allow token owner to unlock metadata", async function () {
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        let currentTokenInfo = await deedHashedV2.tokenInfo(1);
        expect(currentTokenInfo.state).to.equal(TokenState.InitialSetup);
        await deedHashedV2.connect(statusUpdaterSigner).updateTokenState(1, TokenState.Complete);
        let postUpdateTokenInfo = await deedHashedV2.tokenInfo(1);
        expect(postUpdateTokenInfo.state).to.equal(TokenState.Complete);
        await deedHashedV2.connect(metadataLockerSigner).lockMetadata(1);
        await expect(
          deedHashedV2.connect(statusUpdaterSigner).updateTokenState(1, TokenState.Cancelled)
        ).to.be.revertedWith("METADATA_LOCKED");
        await expect(
          deedHashedV2.connect(tokenURIUpdaterSigner).updateTokenURI(1, "ipfs://")
        ).to.be.revertedWith("METADATA_LOCKED");
        await expect(
          deedHashedV2.connect(statusAndTokenURIUpdaterSigner).updateTokenStateAndURI(1, TokenState.Cancelled, "test")
        ).to.be.revertedWith("METADATA_LOCKED");
        await deedHashedV2.connect(tokenReceiver).unlockMetadata(1);
        await deedHashedV2.connect(statusUpdaterSigner).updateTokenState(1, TokenState.Cancelled);
        await deedHashedV2.connect(tokenURIUpdaterSigner).updateTokenURI(1, "ipfs://");
        let postUnlockUpdateTokenInfoFirst = await deedHashedV2.tokenInfo(1);
        expect(postUnlockUpdateTokenInfoFirst.state).to.equal(TokenState.Cancelled);
        expect(postUnlockUpdateTokenInfoFirst.tokenURI).to.equal("ipfs://");
        await deedHashedV2.connect(statusAndTokenURIUpdaterSigner).updateTokenStateAndURI(1, TokenState.Payment, "test")
        let postUnlockUpdateTokenInfoSecond = await deedHashedV2.tokenInfo(1);
        expect(postUnlockUpdateTokenInfoSecond.state).to.equal(TokenState.Payment);
        expect(postUnlockUpdateTokenInfoSecond.tokenURI).to.equal("test");
      });
    });
  });
  context("read-only functions", async function () {
    context("function tokenInfo", async function () {
      it("Should not allow an invalid token ID to be queried", async function () {
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        await expect(
          deedHashedV2.tokenInfo(2)
        ).to.be.revertedWith("INVALID_TOKEN_ID")
      });
      it("Should allow a valid token ID to be queried", async function () {
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        let tokenInfo = await deedHashedV2.tokenInfo(1);
        expect(tokenInfo.tokenURI).to.equal("ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        expect(tokenInfo.state).to.equal(TokenState.InitialSetup);
      });
    });
    context("function tokenURI", async function () {
      it("Should not allow an invalid token ID to be queried", async function () {
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        await expect(
          deedHashedV2.tokenURI(2)
        ).to.be.revertedWith("INVALID_TOKEN_ID")
      });
      it("Should allow a valid token ID to be queried", async function () {
        await deedHashedV2.connect(minterSigner).mint(tokenReceiver.address, "ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
        expect(
          await deedHashedV2.tokenURI(1)
        ).to.equal("ipfs://QmdiULknC3Zh2FMWw1DjFGnEBBLFp2qQbbyChjwuUkZVJx");
      });
    });
    context("function supportsInterface", async function () {
      it("Should not claim to support an unsupported interface ID", async function () {
        expect(
          await deedHashedV2.supportsInterface(ERC1155InterfaceSignature)
        ).to.equal(false);
      });
      it("Should claim to support a supported interface ID", async function () {
        expect(
          await deedHashedV2.supportsInterface(ERC721InterfaceSignature)
        ).to.equal(true);
      });
    });
  });
});
