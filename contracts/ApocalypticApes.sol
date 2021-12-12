// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;


import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
//import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
//import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract ApocalypseApes is ERC721, ERC721Enumerable, Ownable {
    using MerkleProof for bytes32[];
    
    struct SaleDetails {
        bytes1 phase;
        uint8 maxBatch;
        uint8 maxBuy;
        uint16 totalCount;
        uint256 totalMinted;
    }
    
    address payable public treasury;
    address payable public faucetWallet;

    uint256 public price = 0.07 * 10**18; // 1 eth
    bytes32 public rootHash;
    string public baseURI;
    

    string name_ = 'Apocalypse Apes';
    string symbol_ = 'APOCALYPSE';
    string baseURI_ = 'ipfs://000000000000000000000000000000000000000000/';

    SaleDetails public saleDetails = SaleDetails({
        phase: 0,    // 0 = not started, 1 = whitelist sale, 2 = public sale
        maxBatch: 10,
        maxBuy: 50,
        totalCount: 8_888,
        totalMinted: 0
    });
    
    mapping(uint16 => address) public ownerByToken;
    mapping(address => bytes1) public manualWhitelist;

    event MintApe (address indexed buyer, uint256 startWith, uint256 batch);

    constructor() ERC721(name_, symbol_) {
        baseURI = baseURI_;
        treasury = payable(msg.sender);
        faucetWallet = payable(msg.sender);
      
    }

    function totalSupply() public view virtual override returns (uint256) {
        return saleDetails.totalMinted;
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

    function setPhase(bytes1 _phase) public onlyOwner {
        saleDetails.phase = _phase;
    }

    function whitelist(address _user, bytes1 _status) public onlyOwner {
        manualWhitelist[_user] = _status;
    }



    function mintApe(uint8 _batchCount, uint8 authAmnt, bytes32[] memory proof, bytes32 leaf) payable public {
        require(saleDetails.phase != 0, "Sale has not started");
        require(_batchCount > 0 && _batchCount <= saleDetails.maxBatch, "Batch purchase limit exceeded");
        require(saleDetails.totalMinted + _batchCount <= saleDetails.totalCount, "Not enough inventory");
        require(msg.value == _batchCount * price, "Invalid value sent");

        // TODO: Untested verification; need to generate merkle tree with whitelist data
        if (saleDetails.phase != 0x02 && !verify(proof, rootHash, leaf, msg.sender, authAmnt))
            require(manualWhitelist[msg.sender] > 0,"Not whitelisted!");
 
        emit MintApe(_msgSender(), saleDetails.totalMinted+1, _batchCount);
        for(uint8 i=0; i< _batchCount; i++){
            _mint(_msgSender(), 1 + saleDetails.totalMinted++);
        }
    }

    function verify(
        bytes32[] memory proof,
        bytes32 root,
        bytes32 leaf,
        address user,
        uint8 authAmnt
    ) public pure returns (bool) {
        bytes32 trueLeaf = keccak256(abi.encodePacked(user,authAmnt));
        return MerkleProof.verify(proof, root, trueLeaf) && trueLeaf == leaf;
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
        saleDetails.totalMinted++;
        _safeMint(to, tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {

        super._beforeTokenTransfer(from, to, tokenId);
    }
    
    /*
    function burn(uint256 tokenId) public {
        //solhint-disable-next-line max-line-length
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721Burnable: caller is not owner nor approved");
        _burn(tokenId);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
        burnCount++;
    }

    function setTokenURI(uint256 _tokenId, string memory _tokenURI) public onlyOwner {
        _setTokenURI(_tokenId, _tokenURI);
    }
*/
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721)
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