const Block = require("./block");
const { cryptoHash } = require("../utils");
const { REWARD_INPUT, MINING_REWARD } = require("../config");
const Transaction = require("../wallet/transaction");
const Wallet = require("../wallet");

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock({ data }) {
        const newBlock = Block.minedBlock({
            lastBlock: this.chain[this.chain.length - 1],
            data
        });

        this.chain.push(newBlock);
    }

    replaceChain(chain, validateTransactions, onSuccess) {
        if (chain.length <= this.chain.length) {
            console.error("The incoming chain must be longer than the original");
            return;
        }

        if (!Blockchain.isValidChain(chain)) {
            console.error("The incoming chain must be valid");
            return;
        }

        if (validateTransactions && !this.validTransactionData({ chain })) {
            console.error("The incoming chain has invalid data");
            return;
        }

        if (onSuccess) {
            onSuccess();
        }

        console.log("Replacing chain with", chain);
        this.chain = chain;
    }

    validTransactionData({ chain }) {
        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            const transactionSet = new Set();

            let rewardTransactionCount = 0;

            for (let transaction of block.data) {
                if (transaction.input.address === REWARD_INPUT.address) {
                    rewardTransactionCount += 1;

                    if (rewardTransactionCount > 1) {
                        console.error("Miner rewards exceed limit");
                        return false;
                    }

                    if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
                        console.error("Miner reward amount is invalid");
                        return false;
                    }
                }
                else {
                    if (!Transaction.isValidTransaction(transaction)) {
                        console.error("Invalid transaction");
                        return false;
                    }

                    const trueBalance = Wallet.calculateBalance({
                        chain: this.chain,
                        address: transaction.input.address
                    });

                    if (transaction.input.amount !== trueBalance) {
                        console.error("Invalid input amount");
                        return false;
                    }

                    if(transactionSet.has(transaction)) {
                        console.error("An identical transaction appears more than once in the block");
                        return false;
                    }
                    else {
                        transactionSet.add(transaction);
                    }
                }
            }
        }

        return true;
    }

    static isValidChain(chain) {
        // must start with genesis block;
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false;
        }

        // validated hash
        for (let i = 1; i < chain.length; i++) {
            const { timestamp, lastHash, hash, nonce, difficulty, data } = chain[i];
            const actualLastHash = chain[i - 1].hash;
            const lastDifficulty = chain[i - 1].difficulty;

            // i'th block `lastHash` is equal to `hash` of the previos block
            if (lastHash !== actualLastHash) {
                return false;
            }

            // jumped difficulty
            if (Math.abs(lastDifficulty - difficulty) > 1) {
                return false;
            }

            // re-created hash is equal to `hash` of current block
            const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
            if (hash !== validatedHash) {
                return false;
            }
        }

        // everything is alright
        return true;
    }
}

module.exports = Blockchain;