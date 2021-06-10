const MINE_RATE = 1000;
const INITIAL_DIFFICULTY = 3;

const GENESIS_DATA = {
    timestamp: 1,
    data: [],
    lastHash: "genesis-lastHash",
    hash: "genesis-hash",
    nonce: 0,
    difficulty: INITIAL_DIFFICULTY
};

module.exports = { GENESIS_DATA, MINE_RATE };