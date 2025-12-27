import { createServer } from "http";
import { Server } from "socket.io";
import * as fs from "fs";

import config from "./config.json";

import { logger } from "./src/log.js";
import { database } from "./src/database.js";
import { Player } from "./src/entity/player.js";
import { Projectile } from "./src/entity/projectile.js";
import { SimulatedMap } from "./src/map/map.js";

const server = createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Max-Age", 2592000);
    if (req.method === "GET") {
        fs.readFile("./" + req.url, function(err, data) {
            if (err){
                throw err;
            }
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end(data);
        });
        return;
    }
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("test");
});

const io = new Server(server, {
    cors: {
        origin: "*",
    },
    // maxHttpBufferSize: 1e8,
});



let map = new SimulatedMap(2048, 2048);
// let map = new SimulatedMap(1024, 1024);
// let map = new SimulatedMap(128, 128);
// let map = new SimulatedMap(512, 512);

io.on("connection", function(socket) {
    logger.info("[Game] Connection from client, ip=" + socket.handshake.address);
    const emitFn = socket.emit;
    // @ts-ignore
    // socket.emit = (...args) => setTimeout(() => {
    //     emitFn.apply(socket, args);
    // }, 1000);
    // socket.leave = function() {
    //     socket.emit("disconnected");
    //     socket.removeAllListeners();
    //     socket.onevent = function() { };
    //     socket.disconnect();
    // };
    // player.joinGame(globalGame);
    // socket.once("publicKey", async function() {
    //     if (publicKey == null) {
    //         publicKey = await subtle.exportKey("jwk", (await keys).publicKey);
    //     }
    //     socket.emit("publicKey", publicKey);
    // });
    let player = new Player(socket);
});

const port = process.env.PORT || config.port;
server.listen(port);
logger.info("[Server] Server started on port " + port);

setInterval(function() {
    database.save();
}, config.autoSaveInterval * 60 * 1000);
setInterval(function() {
    database.backup();
}, config.autoBackupInterval * 60 * 1000);

// process.on("uncaughtException", async function(err) {
//     logger.fatal(err);
//     logger.info("[Server] Process exited with exit code 1");
//     database.save();
//     await logger.awaitLogs();
//     process.exit(1);
// });

let tick = 0;
let tickTime = performance.now();
let tps: number[] = [];
function update() {
    if (tickTime + (tick + 1) * 1000 / config.tps - performance.now() < 0) {
        tickTime = performance.now() - (tick + 1) * 1000 / config.tps;
    }
    setTimeout(update, tickTime + (tick + 1) * 1000 / config.tps - performance.now());
    // let start = performance.now();
    SimulatedMap.removeAllUpdates();
    Projectile.updateAll();
    SimulatedMap.simulateAll();
    Player.sendAllPackets();
    tick += 1;
    // let end = performance.now();
    tps.push(performance.now());
    while (performance.now() - tps[0] > 1000) {
        tps.shift();
    }
    if (tick % 600 == 0) {
        logger.info("TPS: " + tps.length);
    }
};
update();
// setInterval(function() {
//     // logger.info("Tick took " + (end - start).toFixed(2) + "ms");
// // }, 1000 / config.tps);
// }, 1000 / 80);

export { config, tick };