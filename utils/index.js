const EC = require("elliptic").ec // elliptic cryptography
const cryptoHash = require("./cryptoHash")

const ec = new EC("secp256k1");

const verifySignature = ({ publicKey, data, signature }) => {
    const keyPair = ec.keyFromPublic(publicKey, "hex");

    return keyPair.verify(cryptoHash(data), signature);
}

module.exports = { ec, verifySignature, cryptoHash };