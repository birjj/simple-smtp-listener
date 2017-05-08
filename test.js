let amqp = require("amqp");
let SMTP = require("./smtp.js");
let Mail = new SMTP(25, {
    host: "localhost",
    exchange: "emails"
});
Mail.on("test@steam.jfagerberg.me", mail=>{
    console.log("Got mail from EventEmitter:",mail);
});

let Client = require("./client.js");
Client.on("test@steam.jfagerberg.me", mail=>{
    console.log("Got mail from client:",mail);
});