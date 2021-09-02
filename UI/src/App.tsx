import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { AddLiquidity } from './components/addLiquidity';
import { SwapComponent } from './components/swap';
import { ContractService } from './services/contractService';
import { GlobalVeriable } from './utils/globalVeriable';
import { Config } from './config';

function App() {
  const [userAddress, setUserAddress] = useState("");
  const [showSwap, setShowSwap] = useState(false);
  const [lpTokenQty, setLpTokenQty] = useState("");
  const getLPToken = async () => {
    if(GlobalVeriable.accountAddress) {
      const qty = await ContractService.getTokenBalance(Config.lpTokenAddress,GlobalVeriable.accountAddress );
      setLpTokenQty(qty);
    }
  }
  useEffect(() => {
    (async () => {
      const address = await ContractService.getUserAddress();
      GlobalVeriable.accountAddress = address;
      if (address && address.length > 16) {
        const showAddress = address.substr(0, 8) + "..." + address.substr(address.length - 8);
        setUserAddress(showAddress);
      } else {
        setUserAddress(address);
      }
      getLPToken();
    })()
  }, []);
  const didSwap = () => {
    setShowSwap(true);
  }
  const didAddLiquidity = () => {
    setShowSwap(false);
  }

  const didSetting = async () => {
    await ContractService.assignLPToken(Config.lpTokenAddress);
    const tokens = Config.supportTokens;
    for (const item of tokens) {
      await ContractService.approve(item.value, 1000000);
    }
  }

  return (
    <div className="App">
      <div className="app_top">
        <div>
          Account: {userAddress}
        </div>
        <div>
          LPToken: {lpTokenQty}
        </div>
        {/* <div>
          <button type="button" onClick={didSetting}>setting</button>
        </div> */}
      </div>
      <div className="text-center">
        <div className="app-menu">
          <button className="button-style2" style={{ width: "150px" }} type="button" onClick={didAddLiquidity}>Add Liquidity</button>
          <button className="button-style3" style={{ width: "100px", marginLeft: "20px" }} type="button" onClick={didSwap}>Swap</button>
        </div>
      </div>
      <div className="app_content">
        <div>
          {showSwap ? <SwapComponent></SwapComponent> : <AddLiquidity onDealCallback={getLPToken}></AddLiquidity>}
        </div>
      </div>
    </div>
  );
}

export default App;
