import {BrowserRouter, Route, Routes} from "react-router-dom";
import logo from './logo.png';
import './App.css';
import MarketplaceABI from "../contractsData/Marketplace.json";
import MarketplaceAddress from "../contractsData/Marketplace-address.json";
import NFTABI from "../contractsData/NFT.json";
import NFTAddress from "../contractsData/NFT-address.json";
import {ethers} from 'ethers';
import {useEffect, useState} from "react";
import {address} from "hardhat/internal/core/config/config-validation";
import Navigation from "./Navbar";
import {Spinner} from "react-bootstrap";
import Home from "./Home";

function App() {
    const [loading, setLoading] = useState(true);
    const [account, setAccount] = useState(null);
    const [nft, setNFT] = useState({});
    const [marketplace, setMarketplace] = useState({});

    const web3Functions = async () => {
        const accounts = await window.ethereum.request({method: "eth_requestAccounts"});
        setAccount(accounts[0]);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        loadContracts(signer);
    }

    const loadContracts = async (signer) => {
        const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceABI.abi, signer);
        const nft = new ethers.Contract(NFTAddress.address, NFTABI.abi, signer);
        setMarketplace(marketplace);
        setNFT(nft);
        setLoading(false);
    }
    useEffect(() => {
        web3Functions();
    }, []);
    return (
        <BrowserRouter>
            <div>
                <Navigation web3Handler={web3Functions} account={account}/>
                {loading ? (
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh'}}>
                        <Spinner animation="border" style={{display: 'flex'}}/>
                        <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
                    </div>
                ) : (
                    <Routes>
                        <Route path="/" element={<Home />}/>

                    </Routes>
                )}
            </div>
        </BrowserRouter>
    );
}

export default App;
