import React, { Component } from 'react';
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3';
import './App.css';
import DBlocks from '../abis/DBlocks.json'

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'})

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    //Setting up Web3 using MetaMask
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    
    const web3 = window.web3

    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    
    // Get network data
    const networkId = await web3.eth.net.getId()
    const networkData = DBlocks.networks[networkId]
    if(networkData) {
      // Create and assign contract instance
      const dblocks = new web3.eth.Contract(DBlocks.abi, networkData.address)
      this.setState({ dblocks })
      
      const fileCount = await dblocks.methods.fileCount().call()
      this.setState({ fileCount })

      // Load files and sort by newest
      for (var i = fileCount; i >= 1; i--) {
        const file = await dblocks.methods.files(i).call()
        this.setState({ 
          files: [...this.state.files, file] 
        })
      }
    } else {
      window.alert('DBlocks contract not deployed on current network')
    }
      this.setState({ loading: false })
  }

  // Get file to upload
  captureFile = event => {
    event.preventDefault()

    const file = event.target.files[0]
    const reader = new window.FileReader()

    // Convert file to buffer
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ 
        buffer: Buffer(reader.result),
        type: file.type,
        name: file.name
       })
       console.log('buffer', this.state.buffer)
    }
  }


  //Upload File
  uploadFile = description => {
    console.log("Submitting file to IPFS...")

    //Add file to the IPFS
    ipfs.add(this.state.buffer, (err, res) => {
      console.log('IPFS result', res)
      if (err) {
        console.error(err)
        return
      }

      this.setState({ loading: true })
      if(this.state.type === ''){
        this.setState({ type: 'none' })
      }

      //Upload to blockchain
      this.state.dblocks.methods
        .uploadFile(res[0].hash, res[0].size, this.state.type, this.state.name, description)
        .send({ from: this.state.account })
        .on('transactionHash', (hash) => {
          this.setState({
            loading: false,
            type: null,
            name: null
          })
          window.location.reload()
        }).on('error', (e) => {
          window.alert('Error: ' + e.message)
          this.setState({ loading: false })
        })
    })

      

      //Call smart contract uploadFile function 

  }

  //Set initial states
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      dblocks: null,
      files: [],
      loading: false,
      type: null,
      name: null
    }

    //Bind functions
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
              files={this.state.files}
              captureFile={this.captureFile}
              uploadFile={this.uploadFile}
            />
        }
      </div>
    );
  }
}

export default App;