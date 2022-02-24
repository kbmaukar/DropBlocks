## ``` Decentralized File Storage ```
A decentralized clone of Dropbox built on Ethereum and React

## Overview:
- `npm run start`, app will start on localhost:3000.
- Requires a browser connection to the Blockchain via a Web3.0 agent, such as [MetaMask](https://metamask.io/) and an active account.
- Uploaded files will be hosted on [Infura's IPFS](https://infura.io/)
- [Ganache](https://trufflesuite.com/ganache/index.html) provides free accounts with mock balances for development and testing purposes. These can then be connected to MetaMask to execute the transactions.

### Design:
- Smart contracts are managed and deployed using [Truffle](https://trufflesuite.com/)
- They are then migrated to the Ganache blockchain which executes the network transaction
- File will be uploaded and stored on the IPFS and can be retrieved using its hash through the following URL `https://ipfs.infura.io/ipfs/{hash}`

Reference & starter template: [dstorage](https://github.com/dappuniversity/dstorage) 