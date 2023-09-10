import React from 'react';
import { useEffect, useState, useRef } from "react";
import Web3Modal from "web3modal";


import './assets/css/main.css'
import main_left_image from "./assets/images/main_left_image.png"
import detail_icon1 from "./assets/images/detail_icon1.svg"
import detail_icon2 from "./assets/images/detail_icon2.svg"

import twitter from "./assets/images/twitter.png"
import discord from "./assets/images/discord.png"
import medium from "./assets/images/medium.png"


import pantheonContractAbi from './ethereum/jay.json'
import { Contract, providers, utils, Signer } from "ethers";


const App = () => {

  let pantheonContractAddress = "0x0106B688463c8ee0F3bc5b15b64Ce33FDE72362c"

  const [pantheonContract, setPantheonContract] = useState(null)
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [connBtnText, setConnBtnText] = useState("Connect")

  const [total_eth_value, setTotalEthValue] = useState("0")
  const [pantheonBalance, setPantheonBalance] = useState("0")


  const getBalance = async()=>{
    try {
      let balance = await pantheonContract.balanceOf(account);
      balance = utils.formatEther(balance).toString()
      setPantheonBalance(balance.slice(0, 8) + "...")("en-EN")

    } catch (error) {
      console.error('Error:', error);
      return 0
    }
  }
  const totalETH = async()=>{
    try {
      let total_eth = await pantheonContract.totalEth();
      total_eth = utils.formatEther(total_eth).toString()
      setTotalEthValue(total_eth.slice(0, 8) + "...")("en-EN")

    } catch (error) {
      console.error('Error:', error);
      return 0
    }
  }

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const connectedAddress = await signer.getAddress();
        const contract = new Contract(pantheonContractAddress, pantheonContractAbi, signer);

        setPantheonContract(contract)
        setAccount(connectedAddress);
        setConnected(true);
        setConnBtnText("Connected")
        console.log(account);
        console.log(connected);
      } else {
        console.error("No web3 provider found");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(()=>{

    connectWallet()
    if (connected){
      setConnBtnText('Connected')
    }
    totalETH()
    getBalance()
  })
  

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
                <div className="dashboard_detail">
                  <p className="dash_title active"><a href="/">Dashboard</a></p>
                  <p className="reedem_title">
                    <a href="/mint/">Mint - <br /> redeem</a>
                  </p>
                </div>
              </div>
              <div className="main_left_img">
                <img src={main_left_image} alt="" />
              </div>
            </div>
            <div className="main_right">
              <div className="hero_block">
                <div className="detail_block">
                  <div className="detail_item">
                    <h3 className="detail_title">
                      $pantheon <br />
                      <span className="small">owned:</span>
                    </h3>
                    <div className="item_bottom">
                      <div className="item_icon">
                        <img src={detail_icon1} alt="" />
                      </div>
                      <p className="item_number">{pantheonBalance}</p>
                    </div>
                  </div>
                  <div className="detail_item">
                    <h3 className="detail_title">
                      $eth <br />
                      <span className="small">Backing amount:</span>
                    </h3>
                    <div className="item_bottom">
                      <div className="item_icon">
                        <img src={detail_icon2} alt="" />
                      </div>
                      <p className="item_number">{total_eth_value}</p>
                    </div>
                  </div>
                  <div className="detail_item">
                    <h3 className="detail_title">
                      LP APR: <br />
                      <span className="small">(Base Swap)</span>
                    </h3>
                    <div className="item_bottom">
                      <p className="item_number">246.14%</p>
                    </div>
                  </div>
                  <div className="detail_item">
                    <h3 className="detail_title">
                      TOTAL LP <br />
                      <span className="small">Rewards:</span>
                    </h3>
                    <div className="item_bottom">
                      <div className="item_icon">
                        <img src={detail_icon1} alt="" />
                      </div>
                      <p className="item_number">12,340.332..</p>
                    </div>
                  </div>
                </div>
                <div className="black_block"></div>
              </div>
              <div className="left_footer">
                <div className="footer_text">
                  <p>docs</p>
                  <p>media kit</p>
                </div>
                <p className="footer_name">© Pantheon Ecosystem</p>
                <div className="footer_social">
                  <a href="#" className="social_item">
                    <img src={twitter} alt="" />
                  </a>
                  <a href="#" className="social_item">
                    <img src={discord} alt="" />
                  </a>
                  <a href="#" className="social_item">
                    <img src={medium} alt="" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;

