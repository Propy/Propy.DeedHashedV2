# Propy.DeedHashedV2

This repo implements DeedHashedV2.sol contracts used by the Propy Transaction Platform, these contracts represent stateful NFTs which can replicate and transition between the states that transactions on the Propy Transaction Platform go through.

## Deployments

Goerli: [`0x37f6091feF42eFD50d4F07a91c955606e8dE38c2`](https://goerli.etherscan.io/address/0x37f6091feF42eFD50d4F07a91c955606e8dE38c2) (admin address set to `0x657C0eCF07f6e2B2D01c13F328B230F07b824a57`)

## ABI

The ABI for interacting with DeedHashedV2 can be found [here](https://github.com/Propy/Propy.DeedHashedV2/blob/main/abi/DeedHashedV2ABI.json).

The functionality of this repo is dependent upon 2 core contracts:

## DeedHashedV2.sol

- [DeedHashedV2.sol](https://github.com/Propy/Propy.DeedHashedV2/blob/main/contracts/DeedHashedV2.sol) is an extended and enhanced implementation of the earlier V1 [DeedHashedClonable.sol](https://github.com/Propy/Propy.DeedHashed.CloneFactory/blob/main/contracts/DeedHashedClonable.sol) contract.

- The primary upgrade from the V1 is to create stateful NFTs to represent DeedHashed instances, also, instead of using a clonable implementation contract for each DeedHashed instance, we have moved towards using an ERC-721 contract so that each instance is a newly minted token instead of a cloned contract. In short, tokens instead of clones, and states attached to each token, Propy's admin account is responsible for transitioning tokens between their available states.

## DeedHashedStates.sol

- [DeedHashedStates.sol](https://github.com/Propy/Propy.DeedHashedV2/blob/main/contracts/DeedHashedStates.sol) is used to store the different states that a DeedHashedV2 token can transition between, this was only separated into a separate contract for the sake of making it easier to redeploy with additional/modified states in the future.

## Overview/interface of DeedHashedV2

Below we outline the interface of the contract to get an easy overview of the functionality included in it, the full interface can be found [here](https://github.com/Propy/Propy.DeedHashedV2/blob/main/contracts/interfaces/IDeedHashedV2.sol).

```solidity
interface IDeedHashedV2 is IERC721, IAccessControl {

  event TokenMinted(uint256 indexed tokenId, DeedHashedStates.TokenState indexed tokenState, string indexed tokenURI);
  event TokenStateUpdated(uint256 indexed tokenId, DeedHashedStates.TokenState indexed tokenState, string indexed tokenURI);
  event TokenURIUpdated(uint256 indexed tokenId, DeedHashedStates.TokenState indexed tokenState, string indexed tokenURI);

  function mint(address _to, string memory _tokenURI) external;
  function updateTokenState(uint256 _tokenId, DeedHashedStates.TokenState _state) external;
  function updateTokenURI(uint256 _tokenId, string memory _tokenURI) external;
  function updateTokenStateAndURI(uint256 _tokenId, DeedHashedStates.TokenState _state, string memory _tokenURI) external;
  function tokenInfo(uint256 _tokenId) external view returns (Token memory);
  function tokenURI(uint256 _tokenId) external view returns (string memory);

}
```

## Role References

We use OpenZeppelin's [AccessControl](https://docs.openzeppelin.com/contracts/4.x/access-control) library to manage roles and permissions of addresses.

We have the following roles:

### **MINTER_ROLE**:

Computation: `keccak256("MINTER_ROLE")`

Result: `0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6`

### **STATE_UPDATER_ROLE**:

Computation: `keccak256("STATE_UPDATER_ROLE")`

Result: `0x7f496d3b3a5b8d5d66b1301ac9407fb7ebb241c9fb60310446582db629b01709`

### **TOKEN_URI_UPDATER_ROLE**:

Computation: `keccak256("TOKEN_URI_UPDATER_ROLE")`

Result: `0xd610886bde7b9b3561f4ecdece11096467246c56f3a9958246e8d8b56500f923`

### **TRANSFERRER_ROLE**:

Computation: `keccak256("TRANSFERRER_ROLE")`

Result: `0x9c0b3a9882e11a6bfb8283b46d1e79513afb8024ee864cd3a5b3a9050c42a7d7`

### **METADATA_LOCKER_ROLE**:

Computation: `keccak256("METADATA_LOCKER_ROLE")`

Result: `0x0af1a227e20c738dadfc76971d0d110fd4b320a2b47db610f169242cda7cbd7e`

## Issuing a new DeedHashedV2 token

We make a call to the `mint` function of `DeedHashedV2.sol`, providing it with a `_to` address (receiver of the token) and a `_tokenURI`, the initial state of each token after minting will be `InitialSetup` (0). The `mint` function can only be called by an address which has the `MINTER_ROLE` assigned to it. This function emits a `TokenMinted` event upon any successful calls to the function. When a new token is minted, the new token will have an ID assigned to it (new token IDs can be tracked by parsing `TokenMinted` events), IDs are simply incremental. Other requirements: `_tokenURI` may not be empty.

## Updating the state of a DeedHashedV2 token

We make a call to the `updateTokenState` function of `DeedHashedV2.sol`, providing it with a `_tokenId` (the token we want to update the state of) and a `_state` (the index of the desired state from the `TokenState` enum of [DeedHashedStates.sol](https://github.com/Propy/Propy.DeedHashedV2/blob/main/contracts/DeedHashedStates.sol)). States can be freely transitioned between each other. Only addresses which have been assigned the `STATE_UPDATER_ROLE` are allowed to call the `updateTokenState` function. This function emits a `TokenStateUpdated` event upon any successful calls to the function. Other requirements: `_tokenId` must be a valid token ID (an existing token ID), `_state` must be a valid index of the `TokenState` enum of [DeedHashedStates.sol](https://github.com/Propy/Propy.DeedHashedV2/blob/main/contracts/DeedHashedStates.sol).

## Updating the tokenURI of a DeedHashedV2 token

We make a call to the `updateTokenURI` function of `DeedHashedV2.sol`, providing it with a `_tokenId` (the token we want to update the tokenURI of) and a `_tokenURI`. Only addresses which have been assigned the `TOKEN_URI_UPDATER_ROLE` are allowed to call the `updateTokenURI` function. This function emits a `TokenURIUpdated` event upon any successful calls to the function. Other requirements: `_tokenId` must be a valid token ID (an existing token ID), `_tokenURI` may not be empty.

## Updating the tokenURI and state of a DeedHashedV2 token in a single call

We make a call to the `updateTokenStateAndURI` function of `DeedHashedV2.sol`, providing it with a `_tokenId` (the token we want to update the tokenURI & state of), a `_state` (the index of the desired state from the `TokenState` enum of [DeedHashedStates.sol](https://github.com/Propy/Propy.DeedHashedV2/blob/main/contracts/DeedHashedStates.sol)), and a `_tokenURI`. Only addresses which have been assigned **BOTH** the `TOKEN_URI_UPDATER_ROLE` & `STATE_UPDATER_ROLE` are allowed to call the `updateTokenStateAndURI` function. This function emits a `TokenStateUpdated` & `TokenURIUpdated` event. Other requirements: `_tokenId` must be a valid token ID (an existing token ID), `_tokenURI` may not be empty, `_state` must be a valid index of the `TokenState` enum of [DeedHashedStates.sol](https://github.com/Propy/Propy.DeedHashedV2/blob/main/contracts/DeedHashedStates.sol).

## Security Considerations

- Whichever address is provided as the `_roleAdmin` during deployment will have the ability to manage roles (assigning & revoking).

## Commands

### Installation

`npm install`

### Testing

Tests can be run using `npx hardhat test`

### Coverage

Test coverage can be derived using `npx hardhat coverage`

### Deployment

Deployment can be run using `npx hardhat run scripts/deployment.js --network goerli` (adjust network name to change destination of deployment)

## Versions

This repo was produced using `node v16.14.2` & `npm v8.5.0`

## Gas Cost Comparisons (L1 vs Arbitrum)

### Avg USD Pricing (Ethereum L1 @ 29 gwei):

![Avg USD Pricing (Ethereum L1 @ 29 gwei)](https://vagabond-public-storage.s3.eu-west-2.amazonaws.com/Screenshot+2023-04-14+at+14.46.49.png)

### Avg USD Pricing (Arbitrum L2 @ 0.1 gwei):

![Avg USD Pricing (Arbitrum L2 @ 0.1 gwei)](https://vagabond-public-storage.s3.eu-west-2.amazonaws.com/Screenshot+2023-04-14+at+14.47.02.png)