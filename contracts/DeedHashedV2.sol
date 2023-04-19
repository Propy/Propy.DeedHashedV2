//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol"; 

import "./DeedHashedStates.sol";

contract DeedHashedV2 is ERC721, AccessControl {

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIdCounter;

  event TokenMinted(uint256 indexed tokenId, DeedHashedStates.TokenState indexed tokenState, string indexed tokenURI);
  event TokenStateUpdated(uint256 indexed tokenId, DeedHashedStates.TokenState indexed tokenState, string indexed tokenURI);
  event TokenURIUpdated(uint256 indexed tokenId, DeedHashedStates.TokenState indexed tokenState, string indexed tokenURI);

  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE"); // can mint -> 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6
  bytes32 public constant TRANSFERRER_ROLE = keccak256("TRANSFERRER_ROLE"); // can transfer tokens -> 0x9c0b3a9882e11a6bfb8283b46d1e79513afb8024ee864cd3a5b3a9050c42a7d7
  bytes32 public constant STATE_UPDATER_ROLE = keccak256("STATE_UPDATER_ROLE"); // can manage state of tokens -> 0x7f496d3b3a5b8d5d66b1301ac9407fb7ebb241c9fb60310446582db629b01709
  bytes32 public constant TOKEN_URI_UPDATER_ROLE = keccak256("TOKEN_URI_UPDATER_ROLE"); // can update tokenURI -> 0xd610886bde7b9b3561f4ecdece11096467246c56f3a9958246e8d8b56500f923

  struct Token {
    DeedHashedStates.TokenState state;
    uint256 tokenId;
    string tokenURI;
  }

  mapping (uint256 => Token) internal tokens;

  constructor(
    address _roleAdmin,
    string memory _tokenName,
    string memory _tokenSymbol
  ) ERC721(_tokenName, _tokenSymbol) {
    _setupRole(DEFAULT_ADMIN_ROLE, _roleAdmin);
    _setupRole(MINTER_ROLE, _roleAdmin);
    _setupRole(TRANSFERRER_ROLE, _roleAdmin);
    _setupRole(STATE_UPDATER_ROLE, _roleAdmin);
    _setupRole(TOKEN_URI_UPDATER_ROLE, _roleAdmin);
  }

  // TODO: Test gas consumption comparison between current method and using `using Roles for Roles.Role;`

  modifier onlyTransferrer() {
    require(hasRole(TRANSFERRER_ROLE, msg.sender), "CONTACT_PROPY_FOR_TRANSFER");
    _;
  }

  modifier onlyMinter() {
    require(hasRole(MINTER_ROLE, msg.sender), "NOT_MINTER");
    _;
  }

  modifier onlyStateUpdater() {
    require(hasRole(STATE_UPDATER_ROLE, msg.sender), "NOT_STATUS_UPDATER");
    _;
  }

  modifier onlyTokenURIUpdater() {
    require(hasRole(TOKEN_URI_UPDATER_ROLE, msg.sender), "NOT_TOKEN_URI_UPDATER");
    _;
  }

  modifier onlyStateAndTokenURIUpdater() {
    require(hasRole(STATE_UPDATER_ROLE, msg.sender), "NOT_STATUS_UPDATER");
    require(hasRole(TOKEN_URI_UPDATER_ROLE, msg.sender), "NOT_TOKEN_URI_UPDATER");
    _;
  }

  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

  function mint(
    address _to,
    string memory _tokenURI
  ) public onlyMinter {
    require(bytes(_tokenURI).length > 0, "EMPTY_TOKEN_URI");
    _tokenIdCounter.increment();
    _mint(_to, _tokenIdCounter.current());
    tokens[_tokenIdCounter.current()] = Token(
      DeedHashedStates.TokenState.InitialSetup,
      _tokenIdCounter.current(),
      _tokenURI
    );
    emit TokenMinted(_tokenIdCounter.current(), DeedHashedStates.TokenState.InitialSetup, _tokenURI);
  }

  function updateTokenState(
    uint256 _tokenId,
    DeedHashedStates.TokenState _state
  ) public onlyStateUpdater {
    require(_exists(_tokenId), "INVALID_TOKEN_ID");
    tokens[_tokenId].state = _state;
    emit TokenStateUpdated(_tokenId, _state, tokens[_tokenId].tokenURI);
  }

  function updateTokenURI(
    uint256 _tokenId,
    string memory _tokenURI
  ) public onlyTokenURIUpdater {
    require(bytes(_tokenURI).length > 0, "EMPTY_TOKEN_URI");
    require(_exists(_tokenId), "INVALID_TOKEN_ID");
    tokens[_tokenId].tokenURI = _tokenURI;
    emit TokenURIUpdated(_tokenId, tokens[_tokenId].state, _tokenURI);
  }

  function updateTokenStateAndURI(
    uint256 _tokenId,
    DeedHashedStates.TokenState _state,
    string memory _tokenURI
  ) public onlyStateAndTokenURIUpdater {
    require(bytes(_tokenURI).length > 0, "EMPTY_TOKEN_URI");
    require(_exists(_tokenId), "INVALID_TOKEN_ID");
    tokens[_tokenId].state = _state;
    tokens[_tokenId].tokenURI = _tokenURI;
    emit TokenStateUpdated(_tokenId, _state, _tokenURI);
    emit TokenURIUpdated(_tokenId, _state, _tokenURI);
  }

  function tokenInfo(
    uint256 _tokenId
  ) public view returns (Token memory) {
    require(_exists(_tokenId), "INVALID_TOKEN_ID");
    return tokens[_tokenId];
  }

  function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
    require(_exists(_tokenId), "INVALID_TOKEN_ID");
    return tokens[_tokenId].tokenURI;
  }

  // SOULBOUND(ESQUE) LOGIC (CAN BE OVERRIDDEN BY PROPY ADMIN)

  function transferFrom(
    address from,
    address to,
    uint256 tokenId
  ) public override onlyTransferrer {
    _transfer(from, to, tokenId);
  }

  function safeTransferFrom(
    address from,
    address to,
    uint256 tokenId
  ) public override onlyTransferrer {
    safeTransferFrom(from, to, tokenId, "");
  }

  function safeTransferFrom(
    address from,
    address to,
    uint256 tokenId,
    bytes memory data
  ) public override onlyTransferrer {
    _safeTransfer(from, to, tokenId, data);
  }

}