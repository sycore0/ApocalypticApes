// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;


import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract ApocalypseApes is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using MerkleProof for bytes32[];
    
    event MintApe (address indexed buyer, uint256 startWith, uint256 batch);

    address payable public treasury;
    address payable public faucetWallet;

    bytes32 public rootHash;

    uint256 public totalMinted;
    uint256 public burnCount;
    uint256 public totalCount = 8_888;
    uint256 public maxBatch = 10;
    uint256 public price = 0.07 * 10**18; // 1 eth
    string public baseURI;
    bool private started;

    string name_ = 'Apocalypse Apes';
    string symbol_ = 'APOCALYPSE';
    string baseURI_ = 'ipfs://000000000000000000000000000000000000000000/';

    mapping(address => bool) public manualWhitelist;

    constructor() ERC721(name_, symbol_) {
        baseURI = baseURI_;
        treasury = payable(msg.sender);
        faucetWallet = payable(msg.sender);
      
    }

    function _baseURI() internal view virtual override returns (string memory){
        return baseURI;
    }

    function setBaseURI(string memory _newURI) public onlyOwner {
        baseURI = _newURI;
    }

    function changePrice(uint256 _newPrice) public onlyOwner {
        price = _newPrice;
    }

    function setTokenURI(uint256 _tokenId, string memory _tokenURI) public onlyOwner {
        _setTokenURI(_tokenId, _tokenURI);
    }

    function setStart(bool _start) public onlyOwner {
        started = _start;
    }

    function mintApe(uint256 _batchCount, bytes32[] memory proof, bytes32 leaf) payable public {
        require(started, "Sale has not started");
        require(_batchCount > 0 && _batchCount <= maxBatch, "Batch purchase limit exceeded");
        require(totalMinted + _batchCount <= totalCount, "Not enough inventory");
        require(msg.value == _batchCount * price, "Invalid value sent");

        // TODO: Untested verification; need to generate merkle tree with whitelist data
        if (!verify(proof, rootHash, leaf))
            require(manualWhitelist[msg.sender],"Not whitelisted!");
 
        emit MintApe(_msgSender(), totalMinted+1, _batchCount);
        for(uint256 i=0; i< _batchCount; i++){
            _mint(_msgSender(), 1 + totalMinted++);
        }
    }

    function verify(
        bytes32[] memory proof,
        bytes32 root,
        bytes32 leaf
    ) public pure returns (bool) {
        return MerkleProof.verify(proof, root, leaf);
    }

    function changeRootHash(bytes32 _rootHash) external onlyOwner {
        rootHash = _rootHash;
    }

    function changeTreasury(address payable _newWallet) external onlyOwner {
        treasury = _newWallet;
    }

    function walletInventory(address _owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(_owner);
        uint256[] memory tokensId = new uint256[](tokenCount);

        for (uint256 i = 0; i < tokenCount; i++) {
            tokensId[i] = tokenOfOwnerByIndex(_owner, i);
        }

        return tokensId;
    }

    /**
   * Override isApprovedForAll to auto-approve opensea proxy contract
   */
    function isApprovedForAll(
        address _owner,
        address _operator
    ) public override view returns (bool isOperator) {
      // if OpenSea's ERC721 Proxy Address is detected, auto-return true
        if (_operator == address(0xa5409ec958C83C3f309868babACA7c86DCB077c1  )) {     // OpenSea approval
            return true;
        }
        
        // otherwise, use the default ERC721.isApprovedForAll()
        return ERC721.isApprovedForAll(_owner, _operator);
    }

    function safeMint(address to, uint256 tokenId) public onlyOwner {
        totalMinted++;
        _safeMint(to, tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }
    
    function burn(uint256 tokenId) public {
        //solhint-disable-next-line max-line-length
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721Burnable: caller is not owner nor approved");
        _burn(tokenId);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
        burnCount++;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function distributeFunds() public payable {
        require(payable(treasury).send(address(this).balance), "Distribution reverted");     
    }

}