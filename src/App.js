import React, { useEffect, useState } from 'react';
import main_left_image from './assets/images/main_left_image.png';
import eth_icon from './assets/images/eth_icon.svg';
import bottom_arrow from './assets/images/bottom_arrow.png';
import pan_icon from './assets/images/pan_icon.svg';
import twitter from './assets/images/twitter.png';
import discord from './assets/images/discord.png';
import medium from './assets/images/medium.png';
import detail_1 from './assets/images/detail_icon1.svg';
import detail_2 from './assets/images/detail_icon2.svg';
import detail_3 from './assets/images/detail_icon3.png';
import axios from 'axios';

import pantheonContractAbi from './ethereum/pantheon.json';
import './assets/css/main.css';

import { Contract, providers, utils } from 'ethers';

function App() {
  const pantheonContractAddress = '0x993cd9c0512cfe335bc7eF0534236Ba760ea7526';
  const [ethPrice, setEthPrice] = useState('0');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [pantheonContract, setPantheonContract] = useState(null);
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [connBtnText, setConnBtnText] = useState('Connect');
  const [total_eth_value, setTotalEthValue] = useState('0'); // Initialize as a string
  const [pantheonBalance, setPantheonBalance] = useState('0'); // Initialize as a string
  const [youDepositETH, setYouDepositETH] = useState('0'); // Initialize as a string
  const [youReceivePantheon, setYouReceivePantheon] = useState('0'); // Initialize as a string
  const [youBurnPantheon, setYouBurnPantheon] = useState('0'); // Initialize as a string
  const [youReceiveETH, setYouReceiveETH] = useState('0'); // Initialize as a string
  const [mintPrice, setMintPrice] = useState('0'); // Initialize as a string
  const [redeemPrice, setRedeemPrice] = useState('0'); // Initialize as a string
  const [totalSupply, setTotalSupply] = useState('0'); // Initialize as a string

  const calculateMintPrice = async () => {
    const newValue = '1';
    const total_eth = parseFloat(total_eth_value);
    const total_supply = parseFloat(totalSupply);
  
    const result = (newValue * total_eth) / total_supply * 1.10; // Adding 10%
    try {
      setMintPrice(result.toString().slice(0, 8) + '...'); // Limit to 8 decimal places
    } catch (error) {
      console.error(error);
    }
  };
  

  const calculateRedeemPrice = async () => {
    const newValue = '1';

    try {
      const valueInWei = utils.parseEther(newValue); // Convert to Wei
      const val = await pantheonContract.getRedeemPantheon(valueInWei);
      setRedeemPrice(utils.formatEther(val).slice(0, 8) + '...'); // Format as Ether
    } catch (error) {
      console.error(error);
    }
  };

  const getTotalSupply = async () => {
    try {
      let total_supply = await pantheonContract.totalSupply();
      total_supply = utils.formatEther(total_supply).toString();
      setTotalSupply(total_supply.slice(0, 8) + '...');
    } catch (error) {
      console.error('Error:', error);
      return 0;
    }
  };

  async function getBalance() {
    try {
      let balance = await pantheonContract.balanceOf(account);
      balance = utils.formatEther(balance).toString();
      setPantheonBalance(balance.slice(0, 8) + '...');
    } catch (error) {
      console.error('Error:', error);
      return 0;
    }
  }

  const totalETH = async () => {
    try {
      let total_eth = await pantheonContract.totalEth();
      total_eth = utils.formatEther(total_eth).toString();
      setTotalEthValue(total_eth.slice(0, 8) + '...');
    } catch (error) {
      console.error('Error:', error);
      return 0;
    }
  };

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const connectedAddress = await signer.getAddress();
        const contract = new Contract(
          pantheonContractAddress,
          pantheonContractAbi,
          signer
        );

        setPantheonContract(contract);
        setAccount(connectedAddress);
        setConnected(true);
        setSigner(signer);
        setConnBtnText('Connected');
        // Call totalETH and calculateMintPrice after connecting
        totalETH();
        getTotalSupply();
        getBalance();
        calculateMintPrice();
        calculateRedeemPrice(); // Calculate redeem price when connecting
      } else {
        console.error('No web3 provider found');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const accountChangedHandler = (newAccount) => {
    setAccount(newAccount);
    updateEthers();
  };

  const updateEthers = () => {
    if (window.ethereum) {
      let tempProvider = new providers.Web3Provider(window.ethereum);
      setProvider(tempProvider);

      let tempSigner = tempProvider.getSigner();
      setSigner(tempSigner);

      let tempContract = new Contract(
        pantheonContractAddress,
        pantheonContractAbi,
        tempSigner
      );
      setPantheonContract(tempContract);
    } else {
      console.error('No web3 provider found');
    }
  };

  const chainChangedHandler = () => {
    // Reload the page to avoid any errors with chain change mid-use of the application
    window.location.reload();
    updateEthers();
  };

  useEffect(() => {
    const fetchEthereumPrice = async () => {
      try {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
        );

        // Extract the Ethereum price from the response data
        const price = response.data.ethereum.usd;

        // Update the state with the Ethereum price
        setEthPrice(price);
      } catch (error) {
        console.error('Error fetching Ethereum price:', error);
      }
    };
    fetchEthereumPrice();
    if (connected) {
      setConnBtnText('Connected');
    }
    connectWallet();
    getTotalSupply();
    getBalance();
  }, [connected]);

  const depositHandlerETH = async (event) => {
    const newValue = event.target.value;
    setYouDepositETH(newValue);

    try {
      const valueInWei = utils.parseEther(newValue); // Convert to Wei
      const val = await pantheonContract.getMintPantheon(valueInWei);
      setYouReceivePantheon(utils.formatEther(val));
    } catch (error) {
      console.error(error);
    }
  };

  const burnHandlerPantheon = async (event) => {
    const newValue = event.target.value;
    setYouBurnPantheon(newValue);

    try {
      const valueInWei = utils.parseEther(newValue); // Convert to Wei
      const val = await pantheonContract.getRedeemPantheon(valueInWei);
      setYouReceiveETH(utils.formatEther(val)); // Format as Ether
    } catch (error) {
      console.error(error);
    }
  };

  const mint = async () => {
    try {
      // First, approve the contract to spend the desired amount of ETH
      const tx = await pantheonContract.mint(account, {
        value: utils.parseEther(youDepositETH),
      });
      await tx.wait();

      console.log('Mint transaction successful');
    } catch (error) {
      alert(error);
    }
  };

  const redeemFunc = async () => {
    try {
      // Call the redeem function on the contract
      const amountInETH = youBurnPantheon; // Replace with the amount in ETH you want to deposit
      const amountInWei = utils.parseEther(amountInETH.toString());
      const approvalTx = await pantheonContract.approve(
        pantheonContractAddress,
        utils.parseEther(youBurnPantheon)
      );
      await approvalTx.wait();
      const tx = await pantheonContract
        .connect(signer)
        .redeem(utils.parseEther(youBurnPantheon));
      await tx.wait();

      console.log('Redeem transaction successful');
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div className="wrapper">
      <section className="dashboard">
        <div className="container">
          <div className="main_block">
            <div className="main_left">
              <div className="main_left_top">
                <a onClick={connectWallet} className="connect_btn">
                  {connBtnText}
                </a>
              </div>
              <div className="main_left_img">
                <img src={main_left_image} alt="" />
              </div>
            </div>
            <div className="main_right" id="mint">
              <div className="hero_block" id="">
                <div className="detail_block">
                  <div className="detail_item">
                    <h3 className="detail_title">
                      $PANTHEON <br></br> <span className="small">owned:</span>
                    </h3>
                    <div className="item_bottom">
                      <div className="item_icon">
                        <img src={detail_1} alt="" />
                      </div>
                      <p className="item_number">{pantheonBalance}</p>
                    </div>
                  </div>

                  <div className="detail_item">
                    <h3 className="detail_title">
                      $ETH <br></br> <span className="small">Backing amount:</span>
                    </h3>
                    <div className="item_bottom">
                      <div className="item_icon">
                        <img src={detail_2} alt="" />
                      </div>
                      <p className="item_number">{total_eth_value}</p>
                    </div>
                  </div>

                  <div className="detail_item">
                    <h3 className="detail_title">
                      MINT PRICE <br></br> <span className="small">(ETH per PANTHEON)</span>
                    </h3>
                    <div className="item_bottom">
                      <div className="item_icon">
                        <img src={detail_2} alt="" />
                      </div>
                      <p className="item_number">{mintPrice}</p>
                      
                    </div>
                    <div className="item_bottom">
                      <p className="item_number">$ {(parseFloat(ethPrice) * parseFloat(mintPrice)).toString().slice(0, 8)}</p>
                          
                    </div>


                  </div>

                  <div className="detail_item">
                    <h3 className="detail_title">
                      REDEEM PRICE <br></br> <span className="small">(ETH per PANTHEON)</span>
                    </h3>
                    <div className="item_bottom">
                      <div className="item_icon">
                        <img src={detail_2} alt="" />
                      </div>
                      <p className="item_number">{redeemPrice}</p>
                    </div>
                    <div className="item_bottom">
                     
                      <p className="item_number">$ {(parseFloat(ethPrice) * parseFloat(redeemPrice)).toString().slice(0, 8)}</p>
                          
                    </div>
                  </div>
                </div>

                <div className="money_block">
                  <div className="money_item">
                    <div className="money_wrapper">
                      <div className="money_body">
                        <div className="money_body_top">
                          <p className="top_deposit">You Deposit</p>
                          <div className="top_money_types top">
                            <div className="money_icon">
                              <img src={eth_icon} alt="" />
                            </div>
                            <p className="money_icon_name">ETH</p>
                          </div>
                        </div>
                        <input
                          type="text"
                          inputMode="decimal" // Specify inputMode as decimal
                          value={youDepositETH}
                          onChange={depositHandlerETH}
                          className="money_count"
                        />
                      </div>
                      <div className="bottom_arrow">
                        <img src={bottom_arrow} alt="" />
                      </div>
                      <div className="money_body">
                        <div className="money_body_top">
                          <p className="top_deposit">You Receive</p>
                          <div className="top_money_types bottom">
                            <div className="money_icon">
                              <img src={pan_icon} alt="" />
                            </div>
                            <p className="money_icon_name">PANTHEON</p>
                          </div>
                        </div>
                        <input
                          type="text"
                          inputMode="decimal" // Specify inputMode as decimal
                          value={youReceivePantheon}
                          className="money_count"
                        />
                      </div>
                    </div>
                    <div className="money_button">
                      <a onClick={mint}>MINT</a>
                    </div>
                  </div>

                  <div className="money_item">
                    <div className="money_wrapper">
                      <div className="money_body">
                        <div className="money_body_top">
                          <p className="top_deposit">You Burn</p>
                          <div className="top_money_types top">
                            <div className="money_icon">
                              <img src={pan_icon} alt="" />
                            </div>
                            <p className="money_icon_name">PANTHEON</p>
                          </div>
                        </div>
                        <input
                          type="text"
                          inputMode="decimal" // Specify inputMode as decimal
                          value={youBurnPantheon}
                          onChange={burnHandlerPantheon}
                          className="money_count"
                        />
                      </div>
                      <div className="bottom_arrow">
                        <img src={bottom_arrow} alt="" />
                      </div>
                      <div className="money_body">
                        <div className="money_body_top">
                          <p className="top_deposit">You Receive</p>
                          <div className="top_money_types bottom">
                            <div className="money_icon">
                              <img src={eth_icon} alt="" />
                            </div>
                            <p className="money_icon_name">ETH</p>
                          </div>
                        </div>
                        <input
                          type="text"
                          inputMode="decimal" // Specify inputMode as decimal
                          value={youReceiveETH}
                          className="money_count"
                        />
                      </div>
                    </div>
                    <div className="money_button">
                      <a onClick={redeemFunc}>REDEEM</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="left_footer">
                <div className="footer_text">
                  <a href="https://docs.pantheon.gold" target="_blank">
                    DOCS
                  </a>
                </div>
                <p className="footer_name">©Pantheon Ecosystem</p>
                <div className="footer_social">
                  <a href="https://twitter.com/PantheonEco" target="_blank" rel="noopener noreferrer" className="social_item">
                    <img src={twitter} alt="" />
                  </a>
                  <a href="https://discord.gg/pantheoneco" target="_blank" rel="noopener noreferrer" className="social_item">
                    <img src={discord} alt="" />
                  </a>
                  {/* <a href="#" className="social_item">
                    <img src={medium} alt="" />
                  </a> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
