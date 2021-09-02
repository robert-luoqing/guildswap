export interface Token {
  tokenName: string;
  symbol: string;
  value: string;
  icon: string;
}
export interface ConfigModel {
  supportTokens: Token[],
  contractAddress: string;
  lpTokenAddress: string;
}
export const Config: ConfigModel = {
  supportTokens: [
    { tokenName: "token1", symbol: 'tk1', value: "0x71773093995c5136Ce45b607b0Befc89A7F81EE4", icon: 'https://github.com/Azim565/token-icons/blob/master/images/0x0353837b32aa01d335becedc57a329b8ce0619a7.png?raw=true' },
    { tokenName: "token2", symbol: 'tk2', value: "0x0aE186d92a82CFd73E4c48821a7A138c140c95B2", icon: 'https://github.com/Azim565/token-icons/blob/master/images/0x0353837b32aa01d335becedc57a329b8ce0619a7.png?raw=true' },
    { tokenName: "token3", symbol: 'tk3', value: "0xEe36fA921C8C376608Bc43F0dbb424e87D604354", icon: 'https://github.com/Azim565/token-icons/blob/master/images/0x0353837b32aa01d335becedc57a329b8ce0619a7.png?raw=true' },
    { tokenName: "token4", symbol: 'tk4', value: "0xDB47a163154E15beCA7BEF35520B42D2A4e3c0c5", icon: 'https://github.com/Azim565/token-icons/blob/master/images/0x0353837b32aa01d335becedc57a329b8ce0619a7.png?raw=true' },
  ],
  contractAddress: "0x0BC1FA59ee5384106962Eb9Da086A8027bC83197",
  lpTokenAddress:"0xce2ec3Fd3614B9e34F3f28428C349E359A632E1F"
}