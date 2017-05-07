let amqp = require("node-amqp");
let SMTP = require("./smtp.js");
let Mail = new SMTP(2525, {
    host: "amqp://localhost",
    exchange: "emails"
});
Mail.on("test@steam.jfagerberg.me", mail=>{
    console.log("Got mail from EventEmitter:",mail);
});

let conn = amqp.createConnection({host: "amqp://localhost"});
conn.on("ready", ()=>{
    var q = conn.queue("test@steam.jfagerberg.me", ()=>{
        q.subscribe((message,headers,deliverInfo,messageObj)=>{
            console.log("Got mail from RabbitMQ:",message);
            messageObj.acknowledge(false);
        });
    });
});