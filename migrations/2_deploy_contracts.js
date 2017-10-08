'use strict';

const MyToken = artifacts.require("./MyToken.sol");

module.exports = function(deployer, network, accounts) {
    deployer.deploy(MyToken, 10000, 'AmaliaToken', 'Amal', 0);
};
