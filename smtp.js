let EventEmitter = require("events").EventEmitter;
let SMTPServer = require("smtp-server").SMTPServer;
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
        let data = "";
        stream.on("readable", buff=>{
            data+=buff.read().toString()
        });
        stream.on("end", ()=>{
            this.handleEmail(data);
        });
    }
    handleEmail(body) {
        logger.info("Got e-mail:");
        logger.info(body);
    }
};