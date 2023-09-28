import React from 'react';
import { useEffect, useState } from "react";
import './assets/css/main.css'
import main_left_image from "./assets/images/main_left_image.png"
import eth_icon from "./assets/images/eth_icon.svg"
import bottom_arrow from "./assets/images/bottom_arrow.png"
import pan_icon from "./assets/images/pan_icon.svg"
import twitter from "./assets/images/twitter.png"
import discord from "./assets/images/discord.png"
import medium from "./assets/images/medium.png"
import detail_1 from "./assets/images/detail_icon1.svg"
import detail_2 from "./assets/images/detail_icon2.svg"


import pantheonContractAbi from './ethereum/pantheon.json'
import { Contract, providers, utils, Signer } from "ethers";


function App() {

  let pantheonContractAddress = "0x65a879bEF5E95a7514752B958b997Fc834b6b4e1"
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null);
  const [pantheonContract, setPantheonContract] = useState(null)
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [connBtnText, setConnBtnText] = useState("Connect")

  const [total_eth_value, setTotalEthValue] = useState("0")
  const [pantheonBalance, setPantheonBalance] = useState("0")

  const [youDepositETH, setYouDepositETH] = useState(0)
  const [youReceivePantheon, setYouReceivePantheon] = useState(0)
  const [youBurnPantheon, setYouBurnPantheon] = useState(0)
  const [youReceiveETH, setYouReceiveETH] = useState(0)

  const [mintPrice, setMintPrice] = useState("0")
  const [redeemPrice, setRedeemPrice] = useState("0")
  const [totalSupply, setTotalSupply] = useState("0")



  const getMintPrice = async()=>{
   // updateEthers()
   const newValue = 1;
   let total_eth = parseFloat(total_eth_value)
   let total_supply = parseFloat(totalSupply)
   
   let result = (newValue * total_eth) / total_supply;
   try {
    //  const valueInWei = utils.parseEther(newValue); // Convert to Wei
    //  const val = await pantheonContract.getMintPantheon(valueInWei);
     setMintPrice(result.toString().slice(0, 8) + "...");
     console.log(result)

   } catch (error) {
     console.error(error);
   }
    

  }
  const getRedeemPrice = async()=>{
    //updateEthers()
    const newValue = "1";
    
    
    try {
      const valueInWei = utils.parseEther(newValue); // Convert to Wei
      const val = await pantheonContract.getRedeemPantheon(valueInWei);
      console.log(val);
      setRedeemPrice(utils.formatEther(val).slice(0, 8) + "..."); // Format as Ether
    } catch (error) {
      console.error(error);
    }

  }

  const getTotalSupply = async()=>{
    //updateEthers()

    try {
      let total_supply = await pantheonContract.totalSupply();
      total_supply = utils.formatEther(total_supply).toString()
      setTotalSupply(total_supply.slice(0, 8) + "...")
    } catch (error) {
      console.error('Error:', error);
      return 0
    }
  }
  const getBalance = async()=>{
    //updateEthers()

    try {
      let balance = await pantheonContract.balanceOf(account);
      balance = utils.formatEther(balance).toString()
      setPantheonBalance(balance.slice(0, 8) + "...")

    } catch (error) {
      console.error('Error:', error);
      return 0
    }
  }
  const totalETH = async()=>{
    //updateEthers()
    try {
      let total_eth = await pantheonContract.totalEth();
      total_eth = utils.formatEther(total_eth).toString()
      setTotalEthValue(total_eth.slice(0, 8) + "...")

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
        setSigner(signer);
        setConnBtnText("Connected")
      } else {
        console.error("No web3 provider found");
      }
    } catch (error) {
      console.error(error);
    }
  };

	const accountChangedHandler = (newAccount) => {
		setAccount(newAccount);
		updateEthers();
	}
	const updateEthers = () => {
		let tempProvider = new providers.Web3Provider(window.ethereum);
		setProvider(tempProvider);

		let tempSigner = tempProvider.getSigner();
		setSigner(tempSigner);

		let tempContract = new Contract(pantheonContractAddress, pantheonContractAbi, tempSigner);
		setPantheonContract(tempContract);	
	}
	const chainChangedHandler = () => {
		// reload the page to avoid any errors with chain change mid use of application
		window.location.reload();
		updateEthers();
	}
  window.ethereum.on('accountsChanged', accountChangedHandler);

	window.ethereum.on('chainChanged', chainChangedHandler);

  useEffect(()=>{

    if (connected){
      setConnBtnText('Connected')
    }
    connectWallet()
    totalETH()
    getTotalSupply()
    getBalance()
    getMintPrice()
    getRedeemPrice()

  })


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
      console.log(val);
      setYouReceiveETH(utils.formatEther(val)); // Format as Ether
    } catch (error) {
      console.error(error);
    }
  };


const mint = async () => {
    try {
        // First, approve the contract to spend the desired amount of ETH
        //const amountInETH = youReceivePantheon; // Replace with the amount in ETH you want to deposit
        //const amountInWei = utils.parseEther(amountInETH.toString());
        // const approvalTx = await pantheonContract.approve(pantheonContractAddress, utils.parseEther(youReceivePantheon));
        // await approvalTx.wait();
    
        // Then, call the mint function on the contract
        const tx = await pantheonContract.mint(account, {
          value: utils.parseEther(youDepositETH),
        });
        await tx.wait();
    
        console.log("Mint transaction successful");
      } catch (error) {
        alert(error);
      }
}

const redeemFunc = async () => {
    try {
        // Call the redeem function on the contract
        const amountInETH = youBurnPantheon; // Replace with the amount in ETH you want to deposit
        const amountInWei = utils.parseEther(amountInETH.toString());
        const approvalTx = await pantheonContract.approve(pantheonContractAddress, utils.parseEther(youBurnPantheon));
        await approvalTx.wait();
        const tx = await pantheonContract.connect(signer).redeem(utils.parseEther(youBurnPantheon));
        await tx.wait();
    
        console.log("Redeem transaction successful");
      } catch (error) {
        alert(error);
      }
}

  return (
    <div class="wrapper">        
        <section class="dashboard">
            <div class="container">
                <div class="main_block">
                    <div class="main_left">
                        <div class="main_left_top">
                            <a onClick={connectWallet} className="connect_btn">
                              {connBtnText}
                            </a>
                            {/* <div class="dashboard_detail">
                                <p class="dash_title">Documents</p>
                            </div> */}
                        </div>
                        <div class="main_left_img">
                            <img src={main_left_image} alt=""/>
                        </div>
                    </div>
                    <div class="main_right" id="mint">
                        <div class="hero_block" id="">
                            <div class="detail_block">
                                <div class="detail_item">
                                    <h3 class="detail_title">
                                        $pantheon <br></br> <span class="small">owned:</span>
                                    </h3>
                                    <div class="item_bottom">
                                        <div class="item_icon">
                                            <img src={detail_1} alt=""/>
                                        </div>
                                        <p className="item_number">{pantheonBalance}</p>
                                    </div>
                                </div>

                                <div class="detail_item">
                                    <h3 class="detail_title">
                                        $eth <br></br> <span class="small">Backing amount:</span> 
                                    </h3>
                                    <div class="item_bottom">
                                        <div class="item_icon">
                                            <img src={detail_2} alt=""/>
                                        </div>
                                        <p className="item_number">{total_eth_value}</p>
                                    </div>
                                </div>

                                <div class="detail_item">
                                    <h3 class="detail_title">
                                        Mint Price <br></br> <span class="small">(ETH per PANTHEON)</span> 
                                    </h3>
                                    <div class="item_bottom">
                                        <div class="item_icon">
                                            <img src={detail_2} alt=""/>
                                        </div>
                                        <p class="item_number">{mintPrice}</p>
                                    </div>
                                </div>

                                <div class="detail_item">
                                    <h3 class="detail_title">
                                      Redeem Price <br></br> <span class="small">(ETH per PANTHEON)</span>
                                    </h3>
                                    <div class="item_bottom">
                                        <div class="item_icon">
                                            <img src={detail_2} alt=""/>
                                        </div>
                                        <p class="item_number">{redeemPrice}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="money_block">
                                <div class="money_item">
                                    <div class="money_top">
                                        <p class="money_name">MINT</p>
                                    </div>
                                    
                                    <div class="money_wrapper">
                                        <div class="money_body">
                                            <div class="money_body_top">
                                                <p class="top_deposit">you deposit</p>
                                                <div class="top_money_types top">
                                                    <div class="money_icon">
                                                        <img src={eth_icon} alt=""/>
                                                    </div>
                                                    <p class="money_icon_name">Eth</p>
                                                </div>
                                            </div>
                                            <input type='text' inputMode='numeric' value={youDepositETH} onChange={depositHandlerETH} className="money_count"/>
                                        </div>
                                        <div class="bottom_arrow">
                                            <img src={bottom_arrow} alt=""/>
                                        </div>
                                        <div class="money_body">
                                            <div class="money_body_top">
                                                <p class="top_deposit">you recive</p>
                                                <div class="top_money_types bottom">
                                                    <div class="money_icon">
                                                        <img src={pan_icon} alt=""/>
                                                    </div>
                                                    <p class="money_icon_name">pantheon</p>
                                                </div>
                                            </div>
                                            <input type='text' inputMode='numeric' value={youReceivePantheon} className="money_count"/>
                                        </div>
                                    </div>
                                    <div className="money_button">
                                        <a onClick={mint}>Mint</a>
                                    </div>
                                </div>
    
                                <div class="money_item">
                                    <div class="money_top">
                                        <p class="money_name">Redeem</p>
                                    </div>
                                    
                                    <div class="money_wrapper">
                                        <div class="money_body">
                                            <div class="money_body_top">
                                                <p class="top_deposit">you burn</p>
                                                <div class="top_money_types top">
                                                    <div class="money_icon">
                                                        <img src={pan_icon} alt=""/>
                                                    </div>
                                                    <p class="money_icon_name">pantheon</p>
                                                </div>
                                            </div>
                                            <input type='text' inputMode='numeric' value={youBurnPantheon} onChange={burnHandlerPantheon} className="money_count"/>

                                        </div>
                                        <div class="bottom_arrow">
                                            <img src={bottom_arrow} alt=""/>
                                        </div>
                                        <div class="money_body">
                                            <div class="money_body_top">
                                                <p class="top_deposit">you receive</p>
                                                <div class="top_money_types bottom">
                                                    <div class="money_icon">
                                                        <img src={eth_icon} alt=""/>
                                                    </div>
                                                    <p class="money_icon_name">Eth</p>
                                                </div>
                                            </div>
                                            <input type='text' inputMode='numeric' value={youReceiveETH} className="money_count"/>

                                        </div>
                                    </div>
                                    <div className="money_button">
                                        <a onClick={redeemFunc}>Redeem</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="left_footer">
                            <div class="footer_text">
                                <p>docs</p>
                                <p></p>
                            </div>
                            <p class="footer_name">© Pantheon Ecosystem</p>
                            <div class="footer_social">
                                <a href="#" class="social_item">
                                    <img src={twitter} alt=""/>
                                </a>
                                <a href="#" class="social_item">
                                    <img src={discord} alt=""/>
                                </a>
                                <a href="#" class="social_item">
                                    <img src={medium} alt=""/>
                                </a>
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
