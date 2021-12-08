/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable prettier/prettier */
let address
let balance
let amount
let totalContributed
let contract
let web3
let chainid
const ABI = {
  nftContract: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'approved',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
      ],
      name: 'Approval',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'operator',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'bool',
          name: 'approved',
          type: 'bool',
        },
      ],
      name: 'ApprovalForAll',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'buyer',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'startWith',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'batch',
          type: 'uint256',
        },
      ],
      name: 'MintApe',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'previousOwner',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'newOwner',
          type: 'address',
        },
      ],
      name: 'OwnershipTransferred',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'from',
          type: 'address',
        },
        { indexed: true, internalType: 'address', name: 'to', type: 'address' },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
      ],
      name: 'Transfer',
      type: 'event',
    },
    {
      inputs: [
        { internalType: 'address', name: 'to', type: 'address' },
        { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      ],
      name: 'approve',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
      name: 'burn',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: '_newPrice', type: 'uint256' }],
      name: 'changePrice',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address payable',
          name: '_newWallet',
          type: 'address',
        },
      ],
      name: 'changeWallet',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'distroDust',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'uint256', name: '_batchCount', type: 'uint256' },
      ],
      name: 'mintApe',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'renounceOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'address', name: 'to', type: 'address' },
        { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      ],
      name: 'safeMint',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'address', name: 'from', type: 'address' },
        { internalType: 'address', name: 'to', type: 'address' },
        { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      ],
      name: 'safeTransferFrom',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'address', name: 'from', type: 'address' },
        { internalType: 'address', name: 'to', type: 'address' },
        { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
        { internalType: 'bytes', name: '_data', type: 'bytes' },
      ],
      name: 'safeTransferFrom',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'address', name: 'operator', type: 'address' },
        { internalType: 'bool', name: 'approved', type: 'bool' },
      ],
      name: 'setApprovalForAll',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'string', name: '_newURI', type: 'string' }],
      name: 'setBaseURI',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'bool', name: '_start', type: 'bool' }],
      name: 'setStart',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'uint256', name: '_tokenId', type: 'uint256' },
        { internalType: 'string', name: '_tokenURI', type: 'string' },
      ],
      name: 'setTokenURI',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'address', name: 'from', type: 'address' },
        { internalType: 'address', name: 'to', type: 'address' },
        { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      ],
      name: 'transferFrom',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
      name: 'transferOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
    {
      inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'baseURI',
      outputs: [{ internalType: 'string', name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'burnCount',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
      name: 'getApproved',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'address', name: '_owner', type: 'address' },
        { internalType: 'address', name: '_operator', type: 'address' },
      ],
      name: 'isApprovedForAll',
      outputs: [{ internalType: 'bool', name: 'isOperator', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'maxBatch',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'name',
      outputs: [{ internalType: 'string', name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'owner',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
      name: 'ownerOf',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'price',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
      name: 'supportsInterface',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'symbol',
      outputs: [{ internalType: 'string', name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: 'index', type: 'uint256' }],
      name: 'tokenByIndex',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'address', name: 'owner', type: 'address' },
        { internalType: 'uint256', name: 'index', type: 'uint256' },
      ],
      name: 'tokenOfOwnerByIndex',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
      name: 'tokenURI',
      outputs: [{ internalType: 'string', name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'totalCount',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'totalMinted',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'totalSupply',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'wallet',
      outputs: [{ internalType: 'address payable', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
      name: 'walletInventory',
      outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
      stateMutability: 'view',
      type: 'function',
    },
  ],
}
const Contracts = { nftContract: '0x0000000000000000000000000000000000000000' }
async function handleEthereum() {
  web3 = new Web3(Web3.givenProvider)
  console.log(web3)
  web3.eth.getChainId().then(function (cid) {
    chainid = cid
  })
  const { ethereum } = window
  if (ethereum && ethereum.isMetaMask) {
    console.log('Ethereum successfully detected!')
    await accountInfo()
  } else {
    console.log('Please install MetaMask!')
  }
}
async function claimConnect() {
  web3 = new Web3(
    Web3.givenProvider
  )
  console.log(web3)
  web3.eth.getChainId().then(function (cid) {
    chainid = cid
  })
  const { ethereum } = window
  if (ethereum && ethereum.isMetaMask) {
    console.log('Ethereum successfully detected!')
    address = await addressLookup()
    let bal = await checkBalance()
    if (bal > 1) {
      document.getElementById('userDisconnected').style.display = 'none'
      document.getElementById('userConnected').style.display = 'inherit'
    } else {
      document.getElementById('wallet').innerText = 'No NFTs Found!'
    }
  } else {
    console.log('Please install MetaMask!')
  }
}
async function accountInfo() {
  address = await addressLookup()
  document.getElementById('wallet').innerText =
    address.slice(0, 6) + '..' + address.slice(36)
  document.getElementById('userDisconnected').style.display = 'none'
  document.getElementById('userConnected').style.display = 'inherit'
  web3.eth.getBalance(address, function (err, ret) {
    console.log(ret / Math.pow(10, 18))
    balance = (ret / Math.pow(10, 18)).toFixed(4)
  })
}
async function addressLookup() {
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
  const account = accounts[0]
  return account
}
async function mintClaim() {
    const contract = new web3.eth.Contract(ABI.nftContract, Contracts.nftContract)
    let batchAmount = Number(document.getElementById('batchAmount').value)
    const price = 1 * 10 ** 18

    console.log(balance, batchAmount + 0.2)
    
    if (balance < batchAmount + 0.02) {
        document.getElementById('wallet').innerText = 'YOU ARE TOO POOR'
        return
    }
    
    const mintClaim = await new Promise((resolve, reject) => {
        contract.methods
            .mintApe(batchAmount)
            .send(
                { from: address, value: (batchAmount * price).toString() },
                function (error, transactionHash) {
                    if (transactionHash) resolve(transactionHash)
                    else reject()
                })
    })
    if (!mintClaim) return
    document.getElementById('status').innerText = 'Claiming...'
    let checkTx = setInterval(async function () {
        const tx = await web3.eth.getTransactionReceipt(mintClaim)
        if (tx) {
            clearInterval(checkTx)
            document.getElementById('status').innerText = 'Claim complete!'
        }
    }, 10 * 1000)
    
}
async function checkBalance() {
  const contract = new web3.eth.Contract(ABI.nftContract, Contracts.nftContract)
  let balCheck = await contract.methods.balanceOf(address).call()
  console.log('balcheck: ', balCheck)
  return balCheck
}
