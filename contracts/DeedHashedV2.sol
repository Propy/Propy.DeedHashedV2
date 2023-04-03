//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol"; 

import "./DeedHashedTypes.sol";

contract DeedHashedV2 is ERC721, AccessControl {

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIdCounter;

  event TokenMinted(uint256 indexed tokenId, DeedHashedTypes.TokenStatus indexed tokenStatus, string indexed tokenURI);
  event TokenStatusUpdated(uint256 indexed tokenId, DeedHashedTypes.TokenStatus indexed tokenStatus, string indexed tokenURI);
  event TokenURIUpdated(uint256 indexed tokenId, DeedHashedTypes.TokenStatus indexed tokenStatus, string indexed tokenURI);

  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE"); // can mint -> 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6
  bytes32 public constant STATUS_UPDATER_ROLE = keccak256("STATUS_UPDATER_ROLE"); // can manage status of tokens -> 0x623dce6eebcb1ce2d181d8e0b50fbdbf007b027df90c2c87036f6ee3ee840474
  bytes32 public constant TOKEN_URI_UPDATER_ROLE = keccak256("TOKEN_URI_UPDATER_ROLE"); // can update tokenURI -> 0xd610886bde7b9b3561f4ecdece11096467246c56f3a9958246e8d8b56500f923

  mapping (uint256 => DeedHashedTypes.Token) internal tokens;

  constructor(
    address _roleAdmin,
    string memory _tokenName,
    string memory _tokenSymbol
  ) ERC721(_tokenName, _tokenSymbol) {
    _setupRole(DEFAULT_ADMIN_ROLE, _roleAdmin);
    _setupRole(MINTER_ROLE, _roleAdmin);
    _setupRole(STATUS_UPDATER_ROLE, _roleAdmin);
    _setupRole(TOKEN_URI_UPDATER_ROLE, _roleAdmin);
  }

  // TODO: Test gas consumption comparison between current method and using `using Roles for Roles.Role;`

  modifier onlyRoleAdmin() {
    require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "NOT_ROLE_ADMIN");
    _;
  }

  modifier onlyMinter() {
    require(hasRole(MINTER_ROLE, msg.sender), "NOT_MINTER");
    _;
  }

  modifier onlyStatusUpdater() {
    require(hasRole(STATUS_UPDATER_ROLE, msg.sender), "NOT_STATUS_UPDATER");
    _;
  }

  modifier onlyTokenURIUpdater() {
    require(hasRole(TOKEN_URI_UPDATER_ROLE, msg.sender), "NOT_TOKEN_URI_UPDATER");
    _;
  }

  modifier onlyStatusAndTokenURIUpdater() {
    require(hasRole(STATUS_UPDATER_ROLE, msg.sender), "NOT_STATUS_UPDATER");
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
    tokens[_tokenIdCounter.current()] = DeedHashedTypes.Token(
      DeedHashedTypes.TokenStatus.InitialSetup,
      _tokenIdCounter.current(),
      _tokenURI
    );
    emit TokenMinted(_tokenIdCounter.current(), DeedHashedTypes.TokenStatus.InitialSetup, _tokenURI);
  }

  function updateTokenStatus(
    uint256 _tokenId,
    DeedHashedTypes.TokenStatus _status
  ) public onlyStatusUpdater {
    require(_exists(_tokenId), "INVALID_TOKEN_ID");
    tokens[_tokenId].status = _status;
    emit TokenStatusUpdated(_tokenId, _status, tokens[_tokenId].tokenURI);
  }

  function updateTokenURI(
    uint256 _tokenId,
    string memory _tokenURI
  ) public onlyTokenURIUpdater {
    require(bytes(_tokenURI).length > 0, "EMPTY_TOKEN_URI");
    require(_exists(_tokenId), "INVALID_TOKEN_ID");
    tokens[_tokenId].tokenURI = _tokenURI;
    emit TokenURIUpdated(_tokenId, tokens[_tokenId].status, _tokenURI);
  }

  function updateTokenStatusAndURI(
    uint256 _tokenId,
    DeedHashedTypes.TokenStatus _status,
    string memory _tokenURI
  ) public onlyStatusAndTokenURIUpdater {
    require(bytes(_tokenURI).length > 0, "EMPTY_TOKEN_URI");
    require(_exists(_tokenId), "INVALID_TOKEN_ID");
    tokens[_tokenId].status = _status;
    tokens[_tokenId].tokenURI = _tokenURI;
    emit TokenStatusUpdated(_tokenId, _status, _tokenURI);
    emit TokenURIUpdated(_tokenId, _status, _tokenURI);
  }

  function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
    require(_exists(_tokenId), "INVALID_TOKEN_ID");
    return tokens[_tokenId].tokenURI;
  }

}