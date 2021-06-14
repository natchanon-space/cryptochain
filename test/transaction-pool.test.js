const TransactionPool = require("../wallet/transaction-pool");
const Transaction = require("../wallet/transaction");
const Wallet = require("../wallet");
const { isValidTransaction } = require("../wallet/transaction");

describe("TransactionPool", () => {
    // setup
    let transactionPool, transaction, senderWallet;

    beforeEach(() => {
        transactionPool = new TransactionPool();
        senderWallet = new Wallet();
        transaction = new Transaction({
            senderWallet,
            recipient: "fake-recipient",
            amount: 50
        });
    });

    // properties

    // medthods
    describe("setTransaction()", () => {
        it("adds a transaction", () => {
            transactionPool.setTransaction(transaction);

            // expect the same reference
            expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
        });
    });

    describe("existingTransction()", () => {
        it("returns an existing transction given an input address", () => {
            transactionPool.setTransaction(transaction);

            expect(transactionPool.existingTransaction({ inputAddress: senderWallet.publicKey }))
                .toBe(transaction);
            
        });
    })
});