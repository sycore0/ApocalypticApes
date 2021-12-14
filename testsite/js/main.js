/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable prettier/prettier */

let leaf;
let proof;

let address
let balance
let amount
let totalContributed
let contract
let web3
let chainid

  console.log('leaves: ',leaves);
  const options = {
    hashLeaves: true,
    sortLeaves: true,
    sortPairs: true,
    duplicateOdd: true,
    isBitcoinTree: false
  }
  //const tree = new MerkleTree(leaves.map(x => keccak256(x)), 'keccak256',options)
  const tree = new MerkleTree(JSON.parse(leaves.), 'keccak256',options)


function getProof(){
  leaf = window.keccak256(address)

  proof = tree.getProof(leaf)
  //console.log(data);
  return proof;
}


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
async function connect() {
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
  //document.getElementById('userDisconnected').style.display = 'none'
  //document.getElementById('userConnected').style.display = 'inherit'
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

//mintApe(uint8 _batchCount, uint8 authAmnt, bytes32[] memory proof, bytes32 leaf)
async function mint() {
    const contract = new web3.eth.Contract(ABI.nftContract, Contracts.nftContract)
    let batchAmount = Number(document.getElementById('batchAmount').value)
    const price = 0.07 * 10 ** 18

    console.log(balance, batchAmount)
    
    if (balance < batchAmount * price) {
        document.getElementById('wallet').innerText = 'Not enough funds!'
        return
    }
    
    getProof();

    const mint = await new Promise((resolve, reject) => {
        contract.methods
            .mintApe(batchAmount, authAmnt, proof, leaf)
            .send(
                { from: address, value: (batchAmount * price).toString() },
                function (error, transactionHash) {
                    if (transactionHash) resolve(transactionHash)
                    else reject()
                })
    })
    if (!mint) return
    document.getElementById('status').innerText = 'Minting...'
    let checkTx = setInterval(async function () {
        const tx = await web3.eth.getTransactionReceipt(mint)
        if (tx) {
            clearInterval(checkTx)
            document.getElementById('status').innerText = 'Mint complete!'
        }
    }, 10 * 1000)
    
}
async function checkBalance() {
  const contract = new web3.eth.Contract(ABI.nftContract, Contracts.nftContract)
  let balCheck = await contract.methods.balanceOf(address).call()
  console.log('balcheck: ', balCheck)
  return balCheck
}
