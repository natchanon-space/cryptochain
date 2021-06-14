const { v1: uuidv1 } = require("uuid");
const { verifySignature } = require("../utils");
const { REWARD_INPUT, MINING_REWARD } = require("../config");

class Transaction {
    constructor({ senderWallet, recipient, amount, outputMap, input }) {
        this.id = uuidv1();

        this.outputMap = outputMap || this.createOutputMap({ senderWallet, recipient, amount });

        this.input = input || this.createInput({ senderWallet, outputMap: this.outputMap });
    }

    createOutputMap({ senderWallet, recipient, amount }) {
        // return output map of transaction
        const outputMap = {};

        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

        return outputMap;
    }

    createInput({ senderWallet, outputMap }) {
        // return input properties (information and signature)
        return {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(outputMap)
        }
    }

    update({ senderWallet, recipient, amount }) {
        if (amount > this.outputMap[senderWallet.publicKey]) {
            throw new Error("Amount exceeds balance")
        }

        // update recipient in outputMap
        if (!this.outputMap[recipient]) {
            this.outputMap[recipient] = amount;
        }
        else {
            this.outputMap[recipient] += amount;
        }

        // update sender output amount
        this.outputMap[senderWallet.publicKey] -= amount;

        // re-signs signature
        this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
    }

    static isValidTransaction(transaction) {
        const { input: { address, amount, signature }, outputMap } = transaction;

        const outputTotal = Object.values(outputMap)
            .reduce((total, outputAmount) => total + outputAmount);

        // invalid outputMap
        if (amount !== outputTotal) {
            console.error(`Invalid transaction from ${address}`);
            return false;
        }

        // invalid input signature
        if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
            console.error(`Invalid signature from ${address}`);
            return false;
        }

        return true;
    }

    static rewardTransaction({ minerWallet }) {
        // returns overided constuctor of this class
        return new this({
            input: REWARD_INPUT,
            outputMap: { [minerWallet.publicKey]: MINING_REWARD }
        });
    }
}

module.exports = Transaction;