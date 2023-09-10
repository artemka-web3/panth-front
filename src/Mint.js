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



import pantheonContractAbi from './ethereum/jay.json'
import { Contract, providers, utils, Signer } from "ethers";

const Mint = () => {
    let pantheonContractAddress = "0x0106B688463c8ee0F3bc5b15b64Ce33FDE72362c"

    const [pantheonContract, setPantheonContract] = useState(null)
    const [provider, setProvider] = useState(null)
    const [signer, setSigner] = useState(null);

    const [connected, setConnected] = useState(false);
    const [account, setAccount] = useState("");
    const [connBtnText, setConnBtnText] = useState("Connect")

    const [youDepositETH, setYouDepositETH] = useState(0)
    const [youReceivePantheon, setYouReceivePantheon] = useState(0)
    const [youBurnPantheon, setYouBurnPantheon] = useState(0)
    const [youReceiveETH, setYouReceiveETH] = useState(0)

	const accountChangedHandler = (newAccount) => {
		setAccount(newAccount);
		updateEthers();
	}

	const chainChangedHandler = () => {
		// reload the page to avoid any errors with chain change mid use of application
		window.location.reload();
	}


	// listen for account changes
	window.ethereum.on('accountsChanged', accountChangedHandler);

	window.ethereum.on('chainChanged', chainChangedHandler);

	const updateEthers = () => {
		let tempProvider = new providers.Web3Provider(window.ethereum);
		setProvider(tempProvider);

		let tempSigner = tempProvider.getSigner();
		setSigner(tempSigner);
        console.log(tempSigner)

		let tempContract = new Contract(pantheonContractAddress, pantheonContractAbi, tempSigner);
		setPantheonContract(tempContract);	
	}


    // onChangeHandlers
    // 2 штуки (YouBurnPathon -> считать эфиры)   |
    //                                            | все через контракт
    //         (YouDepositETH -> считать pantheon) |
    const depositHandlerETH = async (event) => {
        const newValue = event.target.value;
        setYouDepositETH(newValue);
        
        try {
          const valueInWei = utils.parseEther(newValue); // Convert to Wei
          const val = await pantheonContract.getMintPantheon(valueInWei);
          console.log(val);
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
            const approvalTx = await pantheonContract.approve(pantheonContractAddress, utils.parseEther(youReceivePantheon));
            await approvalTx.wait();
        
            // Then, call the mint function on the contract
            const tx = await pantheonContract.mint(account, {
              value: utils.parseEther(youReceivePantheon),
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

  
    const connectWallet = async () => {
      try {
        if (window.ethereum) {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const provider = new providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const connectedAddress = await signer.getAddress();
          const contract = new Contract(pantheonContractAddress, pantheonContractAbi, signer);
          setAccount(connectedAddress);
          setConnected(true);
          setConnBtnText("Connected")
          setPantheonContract(contract)
          updateEthers()
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

    })
    return (
        <div className="wrapper">
            <section className="dashboard" id="mint_section">
                <div className="container">
                    <div className="main_block">
                        <div className="main_left">
                            <div className="main_left_top">
                                <a onClick={connectWallet} className="connect_btn">
                                    {connBtnText}
                                </a>
                                <div className="dashboard_detail">
                                    <p className="dash_title no_active">
                                        <a href="/">Dashboard</a>
                                    </p>
                                    <p className="reedem_title active">
                                        <a href="/mint/">Mint - <br /> redeem</a>
                                    </p>
                                </div>
                            </div>
                            <div className="main_left_img">
                                <img src={main_left_image} alt="" />
                            </div>
                        </div>
                        <div className="main_right" id="mint">
                            <div className="money_block">
                                <div className="money_item">
                                    <div className="money_top">
                                        <p className="money_name">MINT</p>
                                    </div>
                                    <div className="money_wrapper">
                                        <div className="money_body">
                                            <div className="money_body_top">
                                                <p className="top_deposit">you deposit</p>
                                                <div className="top_money_types top">
                                                    <div className="money_icon">
                                                        <img src={eth_icon} alt="" />
                                                    </div>
                                                    <p className="money_icon_name">Eth</p>
                                                </div>
                                            </div>
                                            <input type='text' inputMode='numeric' value={youDepositETH} onChange={depositHandlerETH} className="money_count"/>
                                        </div>
                                        <div className="bottom_arrow">
                                            <img src={bottom_arrow} alt="" />
                                        </div>
                                        <div className="money_body">
                                            <div className="money_body_top">
                                                <p className="top_deposit">you receive</p>
                                                <div className="top_money_types bottom">
                                                    <div className="money_icon">
                                                        <img src={pan_icon} alt="" />
                                                    </div>
                                                    <p className="money_icon_name">pantheon</p>
                                                </div>
                                            </div>
                                            <input type='text' inputMode='numeric' value={youReceivePantheon} className="money_count"/>
                                            {/* <p className="money_count">{youReceivepantheon}</p> */}
                                        </div>
                                    </div>
                                    <div className="money_button">
                                        <a onClick={mint}>Mint</a>
                                    </div>
                                </div>
                                <div className="money_item">
                                    <div className="money_top">
                                        <p className="money_name">Redeem</p>
                                    </div>
                                    <div className="money_wrapper">
                                        <div className="money_body">
                                            <div className="money_body_top">
                                                <p className="top_deposit">you burn</p>
                                                <div className="top_money_types top">
                                                    <div className="money_icon">
                                                        <img src={pan_icon} alt="" />
                                                    </div>
                                                    <p className="money_icon_name">pantheon</p>
                                                </div>
                                            </div>
                                            <input type='text' inputMode='numeric' value={youBurnPantheon} onChange={burnHandlerPantheon} className="money_count"/>
                                        </div>
                                        <div className="bottom_arrow">
                                            <img src={bottom_arrow} alt="" />
                                        </div>
                                        <div className="money_body">
                                            <div className="money_body_top">
                                                <p className="top_deposit">you receive</p>
                                                <div className="top_money_types bottom">
                                                    <div className="money_icon">
                                                        <img src={eth_icon} alt="" />
                                                    </div>
                                                    <p className="money_icon_name">Eth</p>
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

export default Mint;