const hexToBinary = require("hex-to-binary");
const Block = require("../blockchain/block");
const { GENESIS_DATA, MINE_RATE } = require("../config");
const { cryptoHash } = require("../utils");

describe("Block", () => {
    // set up basic block
    const timestamp = Date.now();
    const data = "foo-data";
    const lastHash = "foo-lastHash";
    const hash = "foo-hash";
    const nonce = 1;
    const difficulty = 3;
    const block = new Block({ timestamp, data, lastHash, hash, nonce, difficulty });

    // properties
    it("has all these properties", () => {
        expect(block).toHaveProperty("timestamp");
        expect(block).toHaveProperty("data");
        expect(block).toHaveProperty("lastHash");
        expect(block).toHaveProperty("timestamp");
        expect(block).toHaveProperty("hash");
        expect(block).toHaveProperty("nonce");
        expect(block).toHaveProperty("difficulty");
    });

    // method
    describe("genesis()", () => {
        const genesisBlock = Block.genesis();

        it("returns a Block instance", () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });

        it("returns the genesis data", () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe("minedBlock()", () => {
        const lastBlock = Block.genesis();
        const data = "mined-data";
        const minedBlock = Block.minedBlock({ data, lastBlock });

        it("returns a Block instance", () => {
            expect(minedBlock instanceof Block).toBe(true);
        })

        it("sets the `lastHash` to be the `hash` of the lastBlock`", () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        });

        it("sets the `data`", () => {
            expect(minedBlock.data).toEqual(data);
        });

        it("sets the `timestamp`", () => {
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });

        it("creates a SHA-256 `hash` based on proper inputs", () => {
            expect(minedBlock.hash)
                .toEqual(cryptoHash(
                    minedBlock.timestamp,
                    minedBlock.nonce,
                    minedBlock.difficulty,
                    lastBlock.hash,
                    data
                ))
        });

        it("sets a `hash` that matches the difficulty criteria", () => {
            // converts the hash from hex to binary
            expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty))
                .toEqual("0".repeat(minedBlock.difficulty));
        });

        it("adjusts the difficulty", () => {
            // increase/decrease difficiculty from lastBlock
            const possibleDifficulty = [lastBlock.difficulty + 1, lastBlock.difficulty - 1];

            expect(possibleDifficulty.includes(minedBlock.difficulty)).toBe(true);
        });
    });

    describe("adjustDifficulty()", () => {
        it("increases the difficulty for a quickly mined block", () => {
            expect(Block.adjustDifficulty({
                lastBlock: block,
                timestamp: block.timestamp + MINE_RATE - 100
            })).toEqual(block.difficulty + 1);
        });

        it("decreases the difficulty for a slowly mined block", () => {
            expect(Block.adjustDifficulty({
                lastBlock: block,
                timestamp: block.timestamp + MINE_RATE + 100
            })).toEqual(block.difficulty - 1);
        });

        it("has minimum difficulty at 1", () => {
            block.difficulty = -1;

            expect(Block.adjustDifficulty({ lastBlock: block })).toEqual(1);
        });
    });
});