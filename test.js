let amqp = require("amqp");
let SMTP = require("./smtp.js");
let Mail = new SMTP(25, {
    host: "localhost",
    exchange: "emails"
});
Mail.on("test@steam.jfagerberg.me", mail=>{
    console.log("Got mail from EventEmitter:",mail);
});

let conn = amqp.createConnection({host: "localhost"});
conn.on("ready", ()=>{
    var q = conn.queue("test", ()=>{
        q.subscribe((message,headers,deliverInfo,messageObj)=>{
            console.log("Got mail from RabbitMQ:",message);
            messageObj.acknowledge(false);
        });
        q.bind("emails", "test@steam.jfagerberg.me");
    });
});