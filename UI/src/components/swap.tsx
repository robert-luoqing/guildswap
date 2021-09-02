import { ChangeEvent, PureComponent } from "react";
import styles from './swap.module.css'
import Select, { components } from 'react-select'
import { ContractService } from "../services/contractService";
import BigNumber from "bignumber.js";
import { GlobalVeriable } from "../utils/globalVeriable";
import { Config, Token } from "../config";

export interface SwapComponentProps {
  onDealCallback?: () => void;
}

export interface SwapComponentState {
  token0Selected: Token | null;
  token1Selected: Token | null;
  ratio: number | null;
  token0Qty: number | null;
  token1Qty: number | null;
  token0Balance: string | null;
  token1Balance: string | null;
}

const IconOption = (props: any) => {
  const { Option } = components;
  return <Option {...props}>
    <div className={styles.optionItem}>
      <img
        src={props.data.icon}
        alt={props.data.label}
      />
      <div>
        {props.data.tokenName}({props.data.symbol})
      </div>
    </div>
  </Option>;
}

const ValueOption = (props: any) => {
  const { SingleValue } = components;
  return <SingleValue {...props}>
    <div className={styles.optionItem}>
      <img
        src={props.data.icon}
        alt={props.data.label}
      />
      <div>
        {props.data.tokenName}({props.data.symbol})
      </div>
    </div>

  </SingleValue>;
};

export class SwapComponent extends PureComponent<SwapComponentProps, SwapComponentState>  {
  constructor(props: SwapComponentProps) {
    super(props);
    const tokens = Config.supportTokens;
    this.state = {
      token0Selected: null,
      token1Selected: null,
      ratio: null,
      token0Qty: null,
      token1Qty: null,
      token0Balance: null,
      token1Balance: null,
    }
  }

  fetchTokenBalance = async (tokenAddress: string, isToken0: boolean) => {
    let tokenBalance: string | null = null;
    if (tokenAddress && GlobalVeriable.accountAddress) {
      tokenBalance = await ContractService.getTokenBalance(tokenAddress, GlobalVeriable.accountAddress)
    }
    if (isToken0) {
      this.setState({ token0Balance: tokenBalance });
    } else {
      this.setState({ token1Balance: tokenBalance });
    }

  }

  didChange0 = (value: any) => {
    this.setState({
      token0Selected: value
    });

    this.fetchTokenBalance(value.value, true);

    if (this.state.token1Selected === value) {
      this.setState({ token1Selected: null });
      this.didFillFullToken(value, null);
    } else {
      this.didFillFullToken(value, this.state.token1Selected);
    }
  }

  didChange1 = (value: any) => {
    this.setState({
      token1Selected: value
    });

    this.fetchTokenBalance(value.value, false);

    if (this.state.token0Selected === value) {
      this.setState({ token0Selected: null });
      this.didFillFullToken(null, value);
    } else {
      this.didFillFullToken(this.state.token0Selected, value);
    }
  }

  didToken0QtyChange = (event: ChangeEvent<HTMLInputElement>) => {

    const inputValue = Number(event.target.value);
    this.setState({
      token0Qty: inputValue
    });
  }

  didLoseFocus0 = () => {
    this.didFillFullToken(this.state.token0Selected, this.state.token1Selected);
  }

  didFillFullToken = async (token0: Token | null, token1: Token | null) => {
    if (token0 && token1) {
      const qty = await ContractService.getSwipeEstimateQty(token0!.value, token1!.value, this.state.token0Qty || 0);
      this.setState({
        token1Qty: qty
      });
    } else {
      this.setState({ ratio: null });
    }
  }

  didSwap = async () => {
    let result = await ContractService.approve(this.state.token0Selected!.value, this.state.token0Qty!);
    // await ContractService.approve(this.state.token1Selected!.value, this.state.token0Qty!);
    if (result) {
      await ContractService.swap(this.state.token0Selected!.value, this.state.token1Selected!.value, this.state.token0Qty!);
      this.setState({ token0Qty: null, token1Qty: null });
      alert("Swap successful");

      if(this.props.onDealCallback) {
        this.props.onDealCallback();
      }

      setTimeout(() => {
        if (this.state.token0Selected) {
          this.fetchTokenBalance(this.state.token0Selected.value, true);
        }
        if (this.state.token1Selected) {
          this.fetchTokenBalance(this.state.token1Selected.value, false);
        }
      }, 500);
    }
  }

  render() {
    return <div className={styles.outerContainer}>
      <div className={styles.container}>
        <div className={styles.innerContainer}>
          <div className={styles.contentContainer}>
            <div className={styles.title}>Swap</div>
            <div>
              <div className={styles.titleArea}>
                <span className={styles.contentTitle}>From</span>
                <span className={styles.titleTip}> {this.state.token0Selected && <span>(Balance: {this.state.token0Balance})</span>}</span>
              </div>
              <div>
                <div>
                  <Select
                    value={this.state.token0Selected}
                    options={Config.supportTokens}
                    onChange={this.didChange0}
                    components={{ Option: IconOption, SingleValue: ValueOption }} />
                </div>
              </div>
              <div className={styles.titleArea}>
                <span className={styles.contentTitle}>To</span>
                <span className={styles.titleTip}> {this.state.token1Selected && <span>(Balance: {this.state.token1Balance})</span>}</span>
              </div>
              <div>
                <div>
                  <Select
                    value={this.state.token1Selected}
                    options={Config.supportTokens}
                    onChange={this.didChange1}
                    components={{ Option: IconOption, SingleValue: ValueOption }} />
                </div>
              </div>

              <div className={styles.titleArea}>
                <span className={styles.contentTitle}>Swap Qty</span>
              </div>
              <div>
                <div>
                  <input type="number" value={this.state.token0Qty === null ? "" : this.state.token0Qty}
                    onBlur={this.didLoseFocus0}
                    onChange={this.didToken0QtyChange}></input>
                </div>
              </div>

              <div className={styles.titleArea}>
                <span className={styles.contentTitle}>Target Token Qty</span>
              </div>
              <div>
                <div>
                  <input type="text" disabled={true} value={this.state.token1Qty === null ? "" : this.state.token1Qty} ></input>
                </div>
              </div>

              <div className={styles.actionArea}>
                <button className="button-style1" type="button" disabled={!(this.state.token0Selected && this.state.token1Selected && this.state.token0Qty)} onClick={this.didSwap}>Swap</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
  }
}