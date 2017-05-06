let EventEmitter = require("eventemitter2").EventEmitter2;
let SMTPServer = require("smtp-server").SMTPServer;
let parseMail = require("mailparser").simpleParser;
let logger = require("winston");
logger.cli();

module.exports = class SMTP extends EventEmitter {
    constructor() {
        super();
        this.server = new SMTPServer({
            authOptional: true,
            onData: this.handleData.bind(this)
        });
        this.server.listen(587);
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
            return logger.error(`[SMTP] Got malformed email: ${err}`);
        }

        logger.info("Got e-mail:");
        logger.info(email);
    }
};