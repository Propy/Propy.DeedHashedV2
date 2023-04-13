# Propy.DeedHashedV2

This repo implements DeedHashedV2.sol contracts used by the Propy Transaction Platform, these contracts represent stateful NFTs which can replicate and transition between the states that transactions on the Propy Transaction Platform go through.

The functionality of this repo is dependent upon 2 core contracts:

## DeedHashedV2.sol

- [DeedHashedV2.sol](https://github.com/Propy/Propy.DeedHashedV2/blob/main/contracts/DeedHashedV2.sol) is an extended and enhanced implementation of the earlier V1 [DeedHashedClonable.sol](https://github.com/Propy/Propy.DeedHashed.CloneFactory/blob/main/contracts/DeedHashedClonable.sol) contract.

- The primary upgrade from the V1 is to create stateful NFTs to represent DeedHashed instances, also, instead of using a clonable implementation contract for each DeedHashed instance, we have moved towards using an ERC-721 contract so that each instance is a newly minted token instead of a cloned contract. In short, tokens instead of clones, and states attached to each token, Propy's admin account is responsible for transitioning tokens between their available states.

## DeedHashedStates.sol

- [DeedHashedStates.sol](https://github.com/Propy/Propy.DeedHashedV2/blob/main/contracts/DeedHashedStates.sol) is used to store the different states that a DeedHashedV2 token can transition between, this was only separated into a separate contract for the sake of making it easier to redeploy with additional/modified states in the future.

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