let EventEmitter = require("events").EventEmitter;
let SMTPServer = require("smtp-server").SMTPServer;
// @ts-ignore
let parseMail = require("mailparser").simpleParser;
let ipc = require("node-ipc");

/**
 * Acts as a basic listener SMTP server, listening for all emails.
 * Emits events when a mail is received.
 * Events:
 *   ready => ()
 *   mail => (mail)
 *   err => (Error)
 * Example:
 *   let Mail = new SMTP();
 *   Mail.on("test@example.com", mail=>{ ... });
 *   Mail.on("*", mail=>{ ... });
 */
module.exports = class SMTP extends EventEmitter {
    /**
     * @param {Number} port             The port to listen on
     * @param {Object} [opts]           Options for the server
     * @param {Boolean} [opts.debug]    Whether to log debug information
     * @param {String} [opts.socketID]  The socket to emit to
     */
    constructor(port=2525, opts={}) {
        super();
        this.opts = opts;

        this.debug(`Starting on :${port}`);
        this.server = new SMTPServer({
            authOptional: true,
            onData: this.handleData.bind(this)
        });
        this.server.listen(port);
        this.server.on("error", this.handleErr.bind(this));

        ipc.config.id = opts.socketID || "simple-smtp-listener";
        ipc.serve(
            ()=>{
                this.debug("Ready");
                super.emit("ready");
                this.ipc = ipc.server;
            }
        );
        ipc.server.start();
    }
    destroy(cb) {
        this.debug("Destroying");
        this.emit("destroyed");
        this.server.close(cb);
    }
    handleErr(err) {
        this.debug(`Error: ${err}`);
        super.emit("err", err);
    }

    /**
     * @param {String} key  Key to emit
     * @param {...any} [data]    Data to emit
     * @return {Boolean}
     */
    emit(key, data) {
        super.emit.apply(this,arguments);
        // @ts-ignore
        this.ipc.broadcast(
            key,
            data            
        );
    }

    handleData(stream, session, cb) {
        parseMail(stream, this.handleEmail.bind(this));
        cb();
    }
    handleEmail(err, email) {
        if (err) {
            this.emit("err",err);
            this.debug(`Got malformed email: ${err}`);
            return;
        }

        this.debug(`Got email to:`,JSON.stringify(email.to.value));
        this.emit("email", email);

        for (let receipient of email.to.value) {
            this.debug("Emitting",receipient);
            super.emit(receipient.address, email);
        }
    }
    /**
     * Logs if debug is enabled
     * @param {...any} data
     */
    debug(data) {
        console.log.apply(console, ["[SMTP/server]", ...arguments]);
    }
};