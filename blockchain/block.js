const { GENESIS_DATA, MINE_RATE } = require("../config");
const cryptoHash = require("../utils/cryptoHash");

class Block {
    constructor ({ timestamp, data, lastHash, hash, nonce, difficulty }) {
        this.timestamp = timestamp;
        this.data = data;
        this.lastHash = lastHash;
        this.hash = hash;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }

    static genesis() {
        return new this(GENESIS_DATA);
    }

    static minedBlock({ data, lastBlock }) {
        const lastHash = lastBlock.hash;
        let { difficulty } = lastBlock; // get lastBlock difficulty
        let hash, timestamp;
        let nonce = 0;

        // now there is no adjustDifficulty
        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({ lastBlock, timestamp });
            hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
        } while (hash.substring(0, difficulty) !== "0".repeat(difficulty));

        return new this({ timestamp, data, lastHash, hash, nonce, difficulty })        
    }

    static adjustDifficulty({ lastBlock, timestamp }) {
        // increse/decrease difficulty for next mined block 
        // base on lastBlock and time different
        const { difficulty } = lastBlock;

        if (difficulty <= 0) return 1;

        const timeDifferent = timestamp - lastBlock.timestamp;

        if (timeDifferent > MINE_RATE) return difficulty-1;
        else return difficulty+1;
    }
}

module.exports = Block;