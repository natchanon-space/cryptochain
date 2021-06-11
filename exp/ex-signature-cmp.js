const Transaction = require("../wallet/transaction")
const Wallet = require("../wallet");

const senderWallet = new Wallet();

const transaction = new Transaction({ senderWallet, recipient: "foo-recipient", amount: 50 });

const originalSignature = transaction.input.signature;
console.log("=== BEFORE UPDATE ===");
console.log("OG signature", originalSignature);

transaction.update({ senderWallet, recipient: "new-recipient", amount: 50});
console.log("=== AFTER UPDATE ===");
console.log("OG signature", originalSignature);
console.log("NEW signature", transaction.input.signature);
console.log("RESULT OG == NEW:", JSON.stringify(originalSignature) === JSON.stringify(transaction.input.signature));