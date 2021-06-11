const Block = require("./block");
const { cryptoHash } = require("../utils");

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

    replaceChain(chain) {
        if (chain.length <= this.chain.length) {
            console.error("The incoming chain must be longer than the original");
            return;
        }

        if (!Blockchain.isValidChain(chain)) {
            console.error("The incoming chain must be valid");
            return;
        }

        console.log("Replacing chain with", chain);
        this.chain = chain;
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