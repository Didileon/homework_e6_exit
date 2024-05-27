const http = require("http");
const ws = require("ws");
const wss = new ws.Server({ noServer: true });
const fs = require("fs");
const path = require("path");
const PORT = 8050;

let clients = new Map();

function accept(req, res) {
    if (req.headers.upgrade) {
        wss.handleUpgrade(req, req.socket, Buffer.alloc(0),
    onSocketConnect);

    }
    else if (req.url == "/") {
        fs.createReadStream("./chat.html").pipe(res);

    } else if (path.extname(req.url) == ".js") {
        let js = path.join(__dirname + req.url);
        fs.createReadStream(js).pipe(res);
    } else if (path.extname(req.url) == ".css") {
        let css = path.join(__dirname + req.url);
        fs.createReadStream(css).pipe(res);
    }
}

function onSocketConnect(ws) {
    ws.on("message", function(message, isBinary) {
        console.log("New connection");
        console.log("isBinary: " + isBinary);
        console.log("Message received: " + message);

        let object = JSON.parse(message);
        console.log(object);
        ws.send(JSON.stringify(object));

        let nick = object.nickName;
        if (object.nickName == null && object.body != null) {
            return;
        }
        if (clients.has(nick)) {
            console.log(`User "${nick} already used"`);
        } else {
            clients.set(nick, ws);
            console.log(`User "${nick} registered succecfully"`);
        }

        clients.forEach((value) => {
            value.send(JSON.stringify(object));
        });

    });
    ws.on("close", function () {
        console.log("Connection closed");

    });
}

http.createServer(accept).listen(PORT);