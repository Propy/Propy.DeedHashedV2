//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./DeedHashedTypes.sol";

contract DeedHashedV2 is ERC721, Ownable {

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIdCounter;

  event TokenMinted(uint256 indexed tokenId, DeedHashedTypes.TokenStatus indexed tokenStatus, string indexed tokenURI);
  event TokenStatusUpdated(uint256 indexed tokenId, DeedHashedTypes.TokenStatus indexed tokenStatus, string indexed tokenURI);
  event TokenURIUpdated(uint256 indexed tokenId, DeedHashedTypes.TokenStatus indexed tokenStatus, string indexed tokenURI);


  mapping (uint256 => DeedHashedTypes.Token) internal tokens;

  constructor(
    address _admin,
    string memory _tokenName,
    string memory _tokenSymbol
  ) ERC721(_tokenName, _tokenSymbol) {
    _transferOwnership(_admin);
  }

  function mint(
    address _to,
    string memory _tokenURI
  ) public onlyOwner {
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
  ) public onlyOwner {
    require(_exists(_tokenId), "INVALID_TOKEN_ID");
    tokens[_tokenId].status = _status;
    emit TokenStatusUpdated(_tokenId, _status, tokens[_tokenId].tokenURI);
  }

  function updateTokenURI(
    uint256 _tokenId,
    string memory _tokenURI
  ) public onlyOwner {
    require(_exists(_tokenId), "INVALID_TOKEN_ID");
    tokens[_tokenId].tokenURI = _tokenURI;
    emit TokenURIUpdated(_tokenId, tokens[_tokenId].status, _tokenURI);
  }

  function updateTokenStatusAndURI(
    uint256 _tokenId,
    DeedHashedTypes.TokenStatus _status,
    string memory _tokenURI
  ) public onlyOwner {
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