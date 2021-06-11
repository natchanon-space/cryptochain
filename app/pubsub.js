const redis = require("redis");

const CHANNELS = {
    TEST: "TEST",
    BLOCKCHAIN: "BLOCKCHAIN"
};

class PubSub {
    constructor({ blockchain }) {
        this.blockchain = blockchain;

        this.publisher = redis.createClient();
        this.subscriber = redis.createClient();

        // subscribe to all channels
        this.subscribeToChannels();

        // subscriber receives event
        this.subscriber.on("message", (channel, message) => {
            this.handleMessage(channel, message);
        });
    }

    handleMessage(channel, message) {
        console.log(`Message received. Channel: ${channel}. Message: ${message}`);

        const parsedMessage = JSON.parse(message);

        // the blockchain can be replace with valid chain
        if (channel == CHANNELS.BLOCKCHAIN) {
            this.blockchain.replaceChain(parsedMessage);
        }
    }

    subscribeToChannels() {
        Object.values(CHANNELS).forEach((channel) => {
            this.subscriber.subscribe(channel);
        })
    }

    publish({ channel, message }) {
        // avoid redundent
        this.subscriber.unsubscribe(channel, () => {
            this.publisher.publish(channel, message, () => {
                this.subscriber.subscribe(channel);
            })
        })
    }

    // the blockchain able to broadcast its chain
    broadcastChain() {
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        })
    }
}

module.exports = PubSub;