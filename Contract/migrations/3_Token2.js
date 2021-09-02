
const token = artifacts.require("Token2");

module.exports = function (deployer) {
  const BigNumber = require('bignumber.js');
  const tokenQty = new BigNumber("10000000000").multipliedBy(new BigNumber("1000000000000000000"))
  deployer.deploy(token, tokenQty);
};
