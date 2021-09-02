const Uniswap = artifacts.require("Uniswap");

module.exports = function (deployer) {
  deployer.deploy(Uniswap);
};