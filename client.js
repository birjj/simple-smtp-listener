let amqp = require("amqp");
let EventEmitter = require("events").EventEmitter;

// @ts-ignore
module.exports = class SMTPClient extends EventEmitter {
    /**
     * @param {String} exchange The exchange to bind queues to
     */
    constructor(exchange="emails") {
        super();
        this.conn = amqp.createConnection({host: "localhost"});
        this.exchange = exchange;
        this.conn.on("ready", ()=>{
            this.emit("ready");
        });
        this.queues = {};
    }

    /**
     * @param {String} address The address to listen for
     * @returns {Promise} => (queue)
     */
    listenForMails(address) {
        if (this.queues[address]) { return Promise.resolve(); }
        return new Promise(res=>{
            let queue = this.conn.queue(address, ()=>{
                queue.bind(this.exchange, address);
                queue.subscribe((message,headers,deliverInfo,messageObj)=>{
                    this.emit(address, message);
                    messageObj.acknowledge(false);
                });
                res(queue);
            });
            this.queues[address] = queue;
        });
    }

    /**
     * Proxy for on
     * Creates email queue if none exists
     * @param {String} event        The event to listen to
     * @param {Function} listener   The function to call
     * @returns {this}
     */
    on(event, listener) {
        super.on(event, listener);
        this.listenForMails(event);
    }
};