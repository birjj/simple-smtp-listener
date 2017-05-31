let ipc = require("node-ipc");
let EventEmitter = require("events").EventEmitter;
let Server = require("./Server.js");

/**
 * Listens to events emitted by Server.js over its socket
 * Emits events when a mail is received.
 * Events:
 *   ready => ()
 *   kill => ()
 *   mail => (mail)
 *   err => (Error)
 * Example:
 *   let Mail = new SMTP();
 *   Mail.on("test@example.com", mail=>{ ... });
 *   Mail.on("*", mail=>{ ... });
 */
class SMTPClient extends EventEmitter {
    /**
     * @param {Object} [opts]           Options for the client
     * @param {Boolean} [opts.debug]    Whether to log debug info
     * @param {String} [opts.socketID]  The socket to connect to
     */
    constructor(opts={}) {
        super();
        this.opts = opts;
        opts.socketID = opts.socketID || "simple-smtp-listener";
        this.ready = new Promise(res=>{
            ipc.config.silent = !opts.debug;
            ipc.connectTo(
                opts.socketID,
                ()=>{
                    this.ipc = ipc.of[opts.socketID];
                    this.ipc.on(
                        "connect",
                        ()=>{
                            this.debug("Connected");
                            this.emit("ready"); // bypass wildcard emit
                        }
                    );
                    this.ipc.on(
                        "disconnect",
                        ()=>{
                            this.debug("Disconnected");
                            this.emit("kill"); // bypass wildcard emit
                        }
                    );
                    this.ipc.on(
                        "destroyed",
                        ()=>{
                            this.debug("Server destroyed");
                            this.emit("kill");
                        }
                    );
                    this.ipc.on("email", this.handleEmail.bind(this));
                    res();
                }
            );
        });
    }

    /**
     * Handles emails received from the server
     */
    handleEmail(mail) {
        this.debug("Received email:",mail);
        this.emit("*", mail);
        for (let receipient of mail.to.value) {
            this.debug("Emitting",receipient);
            this.emit(receipient.address, mail);
        }
    }

    /**
     * Logs to console if debug is enabled
     * @param {...any} [data] The data to emit
     */
    debug(data) {
        if (this.opts.debug) {
            console.log.apply(console, ["[SMTP/client]",...arguments]);
        }
    }
}

SMTPClient.Server = Server;
module.exports = SMTPClient;