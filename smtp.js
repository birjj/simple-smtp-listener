let EventEmitter = require("events").EventEmitter;
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
 * Example:
 *   let Mail = new SMTP();
 *   Mail.on("test@example.com", mail=>{ ... });
 */
module.exports = class SMTP extends EventEmitter {
    constructor(port=25) {
        logger.debug(`[SMTP] Starting on :${port}`);
        super();
        this.server = new SMTPServer({
            authOptional: true,
            onData: this.handleData.bind(this)
        });
        this.server.listen(port);
        this.server.on("error", this.handleErr);
    }
    destroy(cb) {
        logged.debug(`[SMTP] Destroying`);
        this.server.close(cb);
    }
    handleErr(err) {
        this.emit(err);
        logger.error(`[SMTP] Error: ${err}`);
    }

    handleData(stream, session, cb) {
        parseMail(stream, this.handleEmail.bind(this));
        cb();
    }
    handleEmail(err, email) {
        if (err) {
            this.emit("err",err);
            return logger.error(`[SMTP] Got malformed email: ${err}`);
        }

        logger.debug(`[SMTP] Got email to:`,JSON.stringify(email.to.value));
        for (let target of email.to.value) {
            this.emit(target.address, email);
        }
    }
};