const Blockchain = require("../blockchain");
const Block = require("../blockchain/block");
const { cryptoHash } = require("../utils");
const Wallet = require("../wallet");
const Transaction = require("../wallet/transaction");

describe("Blockchain", () => {
    // setup
    let blockchain, newChain, originalChain, errorMock;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();

        originalChain = blockchain.chain;

        errorMock = jest.fn();
        global.console.error = errorMock;
    });

    // properties
    it("contains a `chain` Array instance", () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it("starts with genesis block", () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it("adds a new block to the chain", () => {
        const newData = "foo-new-data";
        blockchain.addBlock({ data: newData });

        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
    });

    // methods
    describe("isValidBlockchain()", () => {
        // setup
        beforeEach(() => {
            blockchain.addBlock({ data: "foo-one" });
            blockchain.addBlock({ data: "foo-two" });
            blockchain.addBlock({ data: "foo-three" });
        });
        // cases
        describe("when chain does not start with genesis block", () => {
            it("returns false", () => {
                blockchain.chain[0] = { data: "fake-genesis" };

                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe("when chain start with genesis block and contains multiple blocks", () => {
            describe("and a lastHash has been changed", () => {
                it("returns false", () => {
                    blockchain.chain[2].lastHash = "broken-lastHash";

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe("and the chain contains a block with invailid field", () => {
                it("returns false", () => {
                    blockchain.chain[2].data = "broken-data";

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe("and the chain contains a block with jumped difficulty", () => {
                it("returns false", () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length - 1];

                    const lastHash = lastBlock.hash;
                    const timestamp = Date.now();
                    const nonce = 0;
                    const data = "bad-data";
                    const difficiculty = lastBlock.difficiculty - 3;
                    const hash = cryptoHash(lastHash, timestamp, nonce, data, difficiculty);

                    const badBlock = new Block({ timestamp, data, lastHash, hash, nonce, difficiculty });

                    blockchain.chain.push(badBlock);

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe("and the chain does not contain any invalid block", () => {
                it("returns ture", () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            })
        });
    });

    describe("replaceChain()", () => {
        let logMock;

        beforeEach(() => {
            logMock = jest.fn();

            global.console.log = logMock;
        });

        describe("when the new chain is not longer", () => {
            it("does not replace the chain and logs an error", () => {
                newChain.chain = [];

                blockchain.replaceChain(newChain.chain);

                expect(blockchain.chain).toEqual(originalChain);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe("when the new chain is longer", () => {
            beforeEach(() => {
                newChain.addBlock({ data: "foo-one" });
                newChain.addBlock({ data: "foo-two" });
                newChain.addBlock({ data: "foo-three" });
            });

            describe("and new the chain is invalid", () => {
                it("does not replace the chain and logs an error", () => {
                    newChain.chain[2].data = "broken-data";
                    blockchain.replaceChain(newChain.chain);

                    expect(blockchain.chain).toEqual(originalChain);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe("and the new chain is valid", () => {
                it("replaces the chain and logs about the chain replacement", () => {
                    blockchain.replaceChain(newChain.chain);

                    expect(blockchain.chain).toEqual(newChain.chain);
                    expect(logMock).toHaveBeenCalled();
                });
            });
        });

        describe("and the `validateTransactions` flag is ture", () => {
            it("calls validTransactionData()", () => {
                const validTransactionDataMock = jest.fn();
                
                blockchain.validTransactionData = validTransactionDataMock;

                newChain.addBlock({ data: "foo" });
                blockchain.replaceChain(newChain.chain, true);

                expect(validTransactionDataMock).toHaveBeenCalled();
            });
        });
    });

    describe("validTransactionData()", () => {
        let transaction, rewardTransaction, wallet;

        beforeEach(() => {
            wallet = new Wallet();
            transaction = wallet.createTransaction({ recipient: "foo-address", amount: 65 });
            rewardTransaction = Transaction.rewardTransaction({ minerWallet: wallet });
        });

        describe("and the transaction data is valid", () => {
            it("returns ture", () => {
                newChain.addBlock({ data: [transaction, rewardTransaction] });

                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(true);
            });
        });

        describe("and the transaction data has multiple rewards", () => {
            it("returns false and logs an error", () => {
                newChain.addBlock({ data: [transaction, rewardTransaction, rewardTransaction] });

                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe("and the transaction data has at least one malformed outputMap", () => {
            describe("and the transaction is not a reward transaction", () => {
                it("returns false and logs an error", () => {
                    transaction.outputMap[wallet.publicKey] = 999999;

                    newChain.addBlock({ data: [transaction, rewardTransaction] });

                    expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe("and the transaction is a reward transaction", () => {
                it("returns false and logs an error", () => {
                    rewardTransaction.outputMap[wallet.publicKey] = 999999;

                    newChain.addBlock({ data: [transaction, rewardTransaction] });

                    expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
        });

        describe("and the transaction data has at least malformed input", () => {
            it("returns false and logs an error", () => {
                wallet.balance = 9000;

                const evilOutputMap = {
                    [wallet.publicKey]: 8900,
                    fooRecipient: 100
                };

                const evilTransaction = {
                    input: {
                        timestamp: Date.now(),
                        amount: wallet.balance,
                        address: wallet.publicKey,
                        signature: wallet.sign(evilOutputMap)
                    },
                    outputMap: evilOutputMap
                };

                newChain.addBlock({ data: [evilTransaction, rewardTransaction] });

                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe("and a block contains nultiple identical transactions", () => {
            it("returns false and logs an error", () => {
                newChain.addBlock({
                    data: [transaction, transaction, transaction, rewardTransaction]
                });

                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });
    });
});
