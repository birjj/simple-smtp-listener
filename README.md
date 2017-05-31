# simple-smtp-listen

A NodeJS script that acts as a simple SMTP listen server. Accepts all emails, and emits them both as an EventEmitter and through a socket.

## Usage (single access)

If only 1 script needs to receive mails:

```javascript
let SMTPServer = require("simple-smtp-listener").Server;
let server = new SMTPServer(25 /* port */);
server.on("test@example.com", (mail)=>{
    ...
});
```

## Usage (multi access)

If multiple scripts need to receive mails, create a symlink at `/var/dev/simple-smtp-listener/` pointing to the working directory, then create a symlink at `/etc/systemd/system/simple-smtp-listener.service` pointing to `./service/simple-smtp-listener.service`. Finally run `sudo systemctl start simple-smtp-listener`. This starts the server and keeps it running should it crash.

If you aren't running systemd, do the equivalent on your system.

Then in your scripts do

```javascript
let SMTPClient = require("simple-smtp-listener");
let client = new SMTPClient();
client.on("test@example.com", ()=>{
    ...
});
```

## Mail object

All listeners receive a single response, a `Mail` object. This is simply the email parsed by [Nodemailer's Mailparser](https://nodemailer.com/extras/mailparser/). See their documentation for details.

## Socket

If you need access to mails from non-JS code (or you don't want to use `SMTPClient`), you can instead listen to the UNIX/Windows socket (default UNIX location: `/tmp/app.simple-smtp-listener`).

The server emits emails as UTF8-encoded JSON to all clients, using [`node-ipc`](https://github.com/RIAEvangelist/node-ipc).