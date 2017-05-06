let EventEmitter = require("eventemitter2").EventEmitter2;
let SMTPServer = require("smtp-server").SMTPServer;
let parseMail = require("mailparser").simpleParser;
let logger = require("winston");
logger.cli();

/**
 * Acts as a basic listener SMTP server, listening for all emails.
 * Emits events when a mail is received.
 * Events:
 *   email@domain => (mail)
 *   err => (Error)
 */
module.exports = class SMTP extends EventEmitter {
    constructor(port=25) {
        super();
        this.server = new SMTPServer({
            authOptional: true,
            onData: this.handleData.bind(this)
        });
        this.server.listen(port);
        this.server.on("error", this.logErr);
    }
    destroy(cb) {
        this.server.close(cb);
    }
    logErr(err) {
        logger.error(`[SMTP] Error: ${err}`);
    }

    handleData(stream, session, cb) {
        parseMail(stream, this.handleEmail.bind(this));
    }
    handleEmail(err, email) {
        if (err) {
            this.emit("err",err);
            return logger.error(`[SMTP] Got malformed email: ${err}`);
        }

        let targets = email.to.value;
        for (var i = 0; i < targets.length; ++i) {
            this.emit(targets[i].address, email);
        }
    }
};