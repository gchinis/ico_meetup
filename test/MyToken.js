'use strict';

const chai = require('chai');
const expect = chai.expect;

const MyToken = artifacts.require("./MyToken.sol");

contract('MyToken', function(accounts) {
    it('should have a name', async () => {
        const myToken = await MyToken.deployed();
        const name = await myToken.name.call();
        expect(name).to.equal('AmaliaToken');
    });

    it('should have a symbol', async () => {
        const myToken = await MyToken.deployed();
        const symbol = await myToken.symbol.call();
        expect(symbol).to.equal('Amal');
    });

    it('should put 10% of MyTokens in the first account', () => {
        return MyToken.deployed().then(function(instance) {
            return instance.balanceOf(accounts[0]);
        }).then(function(balance) {
            assert.equal(balance.valueOf(), 1000, "1000 wasn't in the first account");
        });
    });

    describe('#setPrices', () => {
        it('should set the buy and sell prices', async () => {

            const ownerAccount = accounts[0];
            const buyPrice  = 1;
            const sellPrice = 3;

            const myToken =  await MyToken.deployed();
            await myToken.setPrices(sellPrice, buyPrice, { from: ownerAccount });

            const newSellPrice = await myToken.sellPrice();
            const newBuyPrice  = await myToken.buyPrice();

            expect(newSellPrice.toNumber()).to.equal(sellPrice);
            expect(newBuyPrice.toNumber()).to.equal(buyPrice);

        });
    });


    describe('#transfer', () => {
        it('should transfer tokens', async () => {
            const fromAccount = accounts[0];
            const toAccount = accounts[1];
            const amount = 300;

            let fromStartingBalance;
            let toStartingBalance;
            let fromEndingBalance;
            let toEndingBalance;

            const myToken = await MyToken.deployed();

            return Promise.resolve(myToken).then(myToken => {
                return myToken.balanceOf(fromAccount);
            }).then(fromBalance => {
                fromStartingBalance = fromBalance.toNumber();
                return myToken.balanceOf(toAccount)
            }).then(toBalance => {
                toStartingBalance = toBalance.toNumber();
                return myToken.transfer(toAccount, amount, {from: fromAccount});
            }).then(() => {
                return myToken.balanceOf(fromAccount);
            }).then(balance => {
                fromEndingBalance = balance.toNumber();
                return myToken.balanceOf(toAccount);
            }).then(balance => {
                toEndingBalance = balance.toNumber();
            }).then(() => {
                expect(fromEndingBalance).to.equal(fromStartingBalance - amount);
                expect(toEndingBalance).to.equal(toStartingBalance + amount);
            })
        });

        it('should publish a Transfer event', async () => {
            const fromAccount = accounts[0];
            const toAccount = accounts[1];
            const amount = 500;

            const myToken = await MyToken.deployed();
            const transferWatcher = myToken.Transfer();

            return myToken.transfer(toAccount, amount, {from: fromAccount})
                .then(() => {
                    return transferWatcher.get()
                }).then(([event,]) => {
                    expect(event.args.from).to.equal(fromAccount);
                    expect(event.args.to).to.equal(toAccount);
                    expect(event.args.value.toNumber()).to.equal(amount);
                })
        });

        it('should fail if the from account does not have enough tokens',  (done) => {
            const fromAccount = accounts[0];
            const toAccount = accounts[1];
            const amount = 100000;

            MyToken.deployed()
                .then(myToken => myToken.transfer(toAccount, amount, {from: fromAccount}))
                .then(() => done('The transfer must fail because balance is not enought.'))
                .catch(e => done());
        });

        it('should fail if the from account is frozen', (done) => {
            const fromAccount = accounts[0];
            const toAccount = accounts[1];
            const amount = 1000;

            let myToken;
            MyToken.deployed()
                .then(instance => myToken = instance)
                .then(() => myToken.freezeAccount(fromAccount, true, {from: fromAccount}))
                .then(() => myToken.transfer(toAccount, amount, {from: fromAccount}))
                .then(() => done('The transfer must fail because the from account is frozen.'))
                .catch(e => done());
        })
    });



    // describe('#buy', () => {
    //     it('should give the user tokens', async () => {
    //         const ownerAccount = accounts[0];
    //         const newUser = accounts[2];
    //         const buyPrice = 2;
    //         const sellPrice = 2;
    //         const amountOfTokens = 1000;
    //         const myToken = await MyToken.deployed();
    //
    //         const startingTokenBalance = await myToken.balanceOf(newUser);
    //         await myToken.setPrices(buyPrice, sellPrice, { from: ownerAccount });
    //
    //         const startingEtherBalance = myToken.contract._eth.getBalance(myToken.address).toNumber();
    //
    //         // When a new user buys tokens
    //         await myToken.buy({ from: newUser, value: 2000 });
    //
    //         // Then the user gets new tokens
    //         const endingTokenBalance = await myToken.balanceOf(newUser);
    //         expect(endingTokenBalance.toNumber()).to.equal(startingTokenBalance.toNumber() + amountOfTokens);
    //
    //         // And the ether changes hands
    //         const endingEtherBalance = myToken.contract._eth.getBalance(myToken.address).toNumber();
    //         expect(endingEtherBalance).to.equal(startingEtherBalance + 2000);
    //     })
    // });
    // describe('#sell', () => {
    //     it('should sell tokens', async () => {
    //         const ownerAccount = accounts[0];
    //         const user = accounts[2];
    //         const buyPrice = 2;
    //         const sellPrice = 2;
    //         const amountOfTokens = 1000;
    //         const myToken = await MyToken.deployed();
    //
    //         await myToken.setPrices(buyPrice, sellPrice, { from: ownerAccount });
    //
    //         await myToken.buy({ from: user, value: 2000 });
    //
    //
    //         const startingTokenBalance = await myToken.balanceOf(user);
    //         const startingEtherBalance = myToken.contract._eth.getBalance(user).toNumber();
    //
    //         // When a new user buys tokens
    //         await myToken.sell(500, { from: user });
    //
    //         // Then the user gets new tokens
    //         const endingTokenBalance = await myToken.balanceOf(user);
    //         expect(endingTokenBalance.toNumber()).to.equal(startingTokenBalance.toNumber() - 500);
    //
    //         // And the ether changes hands
    //         const endingEtherBalance = myToken.contract._eth.getBalance(user).toNumber();
    //         expect(endingEtherBalance).to.equal(startingEtherBalance + 1000);
    //
    //     })
    // });
});
