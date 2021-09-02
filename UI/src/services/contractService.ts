import BigNumber from "bignumber.js";
import Web3 from "web3";
import { Config } from "../config";
import contract_abi from './contractAbi.json';
import erc20_abi from './erc20Abi.json';


class ContractServiceInner {
  async getTokenRatio(token0Address: string, token1Address: string): Promise<number> {
    const ethereumInstance = (window as any).ethereum;
    const web3 = new Web3(ethereumInstance);
    const accounts = await ethereumInstance.enable();
    const abi: any = (contract_abi as any).abi;
    const contractObj = new web3.eth.Contract(abi, Config.contractAddress);
    let result = await contractObj.methods.getTokenRatio(token0Address, token1Address).call({ from: accounts[0] });
    console.log("result1", result);
    if (result == 0) {
      await contractObj.methods.createPool(token0Address, token1Address, 100).send({ from: accounts[0] });
      result = await contractObj.methods.getTokenRatio(token0Address, token1Address).call({ from: accounts[0] });
    }

    console.log("result2", result);
    return result/100;
  }

  async approve(tokenAddress: string, tokenQty: number): Promise<boolean> {
    const ethereumInstance = (window as any).ethereum;
    const web3 = new Web3(ethereumInstance);
    const accounts = await ethereumInstance.enable();

    const erc20Instance = new web3.eth.Contract(erc20_abi as any, tokenAddress);
    return new Promise<boolean>((fulfill, reject) => {
      erc20Instance.methods.approve(Config.contractAddress,
        web3.utils.toWei(tokenQty.toString(),
          'ether')).send({ from: accounts[0] }, (err: any, transactionHash: any) => {
            if (err) {
              fulfill(false);
            } else {
              fulfill(true);
            }
          });
    });
  }

  async getUserAddress(): Promise<string> {
    const ethereumInstance = (window as any).ethereum;
    const web3 = new Web3(ethereumInstance);
    const accounts = await ethereumInstance.enable();
    if (accounts && accounts.length > 0) {
      return accounts[0];
    } else {
      return "";
    }
  }

  async addLiquidity(token0Address: string, token1Address: string, token0Qty: number, token1Qty: number) {
    const ethereumInstance = (window as any).ethereum;
    const web3 = new Web3(ethereumInstance);
    const accounts = await ethereumInstance.enable();
    const abi: any = (contract_abi as any).abi;
    const contractObj = new web3.eth.Contract(abi, Config.contractAddress);
    const result = await contractObj.methods.addLiquidity(token0Address,
      token1Address,
      web3.utils.toWei(token0Qty.toString(), "ether"),
      web3.utils.toWei(token1Qty.toString(), "ether")).send({ from: accounts[0] });

  }
  async swap(token0Address: string, token1Address: string, token0Qty: number) {
    const ethereumInstance = (window as any).ethereum;
    const web3 = new Web3(ethereumInstance);
    const accounts = await ethereumInstance.enable();
    const abi: any = (contract_abi as any).abi;
    const contractObj = new web3.eth.Contract(abi, Config.contractAddress);

    const result = await contractObj.methods.swape(token0Address,
      token1Address,
      web3.utils.toWei(token0Qty.toString(), "ether")).send({ from: accounts[0] });
  }
  async getSwipeEstimateQty(token0Address: string, token1Address: string, token0Qty: number): Promise<number> {
    const ethereumInstance = (window as any).ethereum;
    const web3 = new Web3(ethereumInstance);
    const accounts = await ethereumInstance.enable();
    const abi: any = (contract_abi as any).abi;
    const contractObj = new web3.eth.Contract(abi, Config.contractAddress);
    const result = await contractObj.methods.getSwipeEstimateQty(token0Address, token1Address, web3.utils.toWei(token0Qty.toString(),"ether")).call({ from: accounts[0] });

    console.log("result2", result);
    return Number(web3.utils.fromWei(result, 'ether'));
  }
  async getTokenBalance(tokenAddress: string, accountAddress: string): Promise<string> {
    let abi = require('./erc20Abi.json')
    const ethereumInstance = (window as any).ethereum;
    const web3 = new Web3(ethereumInstance);
    const MyContract = new web3.eth.Contract(abi, tokenAddress);
    const result = await MyContract.methods.balanceOf(accountAddress).call();
    return web3.utils.fromWei(result, 'ether');
  }

  async assignLPToken(lpTokenAddress: string) {
    const ethereumInstance = (window as any).ethereum;
    const web3 = new Web3(ethereumInstance);
    const accounts = await ethereumInstance.enable();
    const abi: any = (contract_abi as any).abi;
    const contractObj = new web3.eth.Contract(abi, Config.contractAddress);
    await contractObj.methods.setLPTokenContract(lpTokenAddress).send({ from: accounts[0] });
    await this.approve(lpTokenAddress, 10000000);
  }
}

export const ContractService = new ContractServiceInner();