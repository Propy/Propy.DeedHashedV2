// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";
import "../DeedHashedStates.sol";

struct Token {
  DeedHashedStates.TokenState state;
  uint256 tokenId;
  string tokenURI;
}

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