import { ChangeEvent, PureComponent } from "react";
import styles from './addLiquidity.module.css'
import Select, { components } from 'react-select'
import { ContractService } from "../services/contractService";
import BigNumber from "bignumber.js";
import { Config, Token } from "../config";

export interface AddLiqidityProps {
  onDealCallback?: () => void;
}

export interface AddLiqidityState {
  token0Selected: Token | null;
  token1Selected: Token | null;
  ratio: number | null;
  token0Qty: number | null;
  token1Qty: number | null;
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

export class AddLiquidity extends PureComponent<AddLiqidityProps, AddLiqidityState>  {
  constructor(props: AddLiqidityProps) {
    super(props);
    const tokens = Config.supportTokens;
    this.state = {
      token0Selected: null,
      token1Selected: null,
      ratio: null,
      token0Qty: null,
      token1Qty: null
    }
  }

  didChange0 = (value: any) => {
    this.setState({
      token0Selected: value
    });

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
    if (this.state.ratio) {
      this.setState({
        token1Qty: new BigNumber(inputValue).multipliedBy(new BigNumber(this.state.ratio)).toNumber()
      })
    }
  }

  didToken1QtyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = Number(event.target.value);
    this.setState({
      token1Qty: inputValue
    });
    if (this.state.ratio) {
      this.setState({
        token0Qty: new BigNumber(inputValue).dividedBy(new BigNumber(this.state.ratio)).toNumber()
      })
    }
  }

  async didFillFullToken(token0: Token | null, token1: Token | null) {
    if (token0 && token1) {
      const ratio = await ContractService.getTokenRatio(token0!.value, token1!.value);
      this.setState({ ratio });
      if (this.state.token0Qty) {
        this.setState({
          token1Qty: new BigNumber(this.state.token0Qty).multipliedBy(new BigNumber(ratio)).toNumber()
        })
      } else if (this.state.token1Qty) {
        this.setState({
          token0Qty: new BigNumber(this.state.token1Qty).dividedBy(new BigNumber(ratio)).toNumber()
        })
      }
    } else {
      this.setState({ ratio: null });
    }
  }

  addLiqidity = async () => {
    let result = await ContractService.approve(this.state.token0Selected!.value, this.state.token0Qty!);
    if (result) {
      result = await ContractService.approve(this.state.token1Selected!.value, this.state.token1Qty!);
      if (result) {
        await ContractService.addLiquidity(this.state.token0Selected!.value, this.state.token1Selected!.value, this.state.token0Qty!, this.state.token1Qty!);
        this.setState({
          token0Qty: null,
          token1Qty: null,
        });
        alert("Add liquidity successful");
        if (this.props.onDealCallback) {
          this.props.onDealCallback();
        }
      }
    }
  }

  render() {
    return <div className={styles.outerContainer}>
      <div className={styles.container}>
        <div className={styles.innerContainer}>
          <div className={styles.contentContainer}>
            <div className={styles.title}>Add Liquidity</div>
            <div>
              <table>
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Qty</th>
                    <th>Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <Select
                        value={this.state.token0Selected}
                        options={Config.supportTokens}
                        onChange={this.didChange0}
                        components={{ Option: IconOption, SingleValue: ValueOption }} />
                    </td>
                    <td>
                      <input type="number" value={this.state.token0Qty === null ? "" : this.state.token0Qty} onChange={this.didToken0QtyChange}></input>
                    </td>
                    <td>
                      1
                  </td>
                  </tr>
                  <tr>
                    <td>
                      <Select
                        value={this.state.token1Selected}
                        options={Config.supportTokens}
                        onChange={this.didChange1}
                        components={{ Option: IconOption, SingleValue: ValueOption }} />
                    </td>
                    <td>
                      <input type="number" value={this.state.token1Qty === null ? "" : this.state.token1Qty} onChange={this.didToken1QtyChange}></input>
                    </td>
                    <td>
                      {this.state.ratio}
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={3}>
                      <button className='button-style1' type="button" disabled={!(this.state.token0Selected && this.state.token1Selected && this.state.token0Qty && this.state.token1Qty)} onClick={this.addLiqidity}>Add</button>
                    </td>
                  </tr>
                </tbody>
              </table>

            </div>
          </div>
        </div>
      </div>

    </div>;
  }
}