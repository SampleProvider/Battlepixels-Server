import { Socket } from "socket.io";
import config from "../../config.json";
import { tick } from "../../index.js";
import { logger } from "../log.js";
import { SimulatedMap } from "../map/map.js";
import { Entity, EntityType } from "./entity.js";
import { Rig, Customizations } from "./rig.js";
import { Particle } from "./particle.js";
import { database } from "../database.js";

class Player extends Rig {
    type = EntityType.Player;

    socket: Socket;

    ping = 0;
    tick: number = 0;

    waitingForClient = true;

    initMap = true;
    overrideClient = true;
    overrideTick = 0;

    clientPhysicsBuffer = config.clientPhysicsBuffer;

    respawning = false;
    respawnTick = 0;

    savedWeapons: {
        id: string,
        customizations: {
            [key: string]: string,
        },
    }[];
    builds: number[][];
    currentBuild = 0;

    static list = new Map<number, Player>();

    constructor(socket: Socket) {
        super();
        this.socket = socket;

        this.socket.on("signIn", async (data: any) => {
            if (!(data instanceof Object)) {
                return;
            }
            if (typeof data.username != "string" || typeof data.password != "string") {
                return;
            }
            logger.info("[Game] Sign in attempted by \"" + data.username + "\"");
            let result = await database.signIn(data.username, data.password);
            if (result != "success") {
                this.socket.emit("signIn", {
                    result: result,
                    username: data.username,
                });
                return;
            }
            this.name = data.username;
            database.loadPlayer(this);
            this.socket.emit("signIn", {
                result: result,
                username: data.username,
                customizations: this.customizations,
            });
        });
        this.socket.on("createAccount", async (data: any) => {
            if (!(data instanceof Object)) {
                return;
            }
            if (typeof data.username != "string" || typeof data.password != "string") {
                return;
            }
            logger.info("[Game] Account creation attempted by \"" + data.username + "\"");
            let result = await database.createAccount(data.username, data.password);
            this.socket.emit("createAccount", {
                result: result,
                username: data.username,
            });
        });
        this.socket.on("play", () => {
            this.map = [...SimulatedMap.list.keys()][0];
            this.initMap = true;
            this.tick = tick;
            this.overrideTick = this.tick;
            this.socket.emit("initData", {
                id: this.id,
                tick: this.tick,
            });
        
            Player.chatAll(this.name + " joined", "lime");
        });

        this.x = 100;
        this.y = 100;

        this.width = 8;
        this.height = 24;

        this.moveSpeed = 0.25;
        this.jumpHeight = 20;
        // this.jumpHeight = 32;
        this.stepHeight = 2;
        this.gravity = 0.25;

        this.headOffsetX = 0;
        this.headOffsetY = -8;
        this.headWidth = 8;
        this.headHeight = 8;

        // this.damage = 3;
        // this.critDamage = 2;
        // this.knockback = 0.1;
        // this.piercing = 1;
        // this.attackSpeed = 30;
        // this.projectileSpeed = 50;
        // this.projectileCount = 4;
        // this.projectileSpread = 2 / 180 * Math.PI;
        // this.recoil = 0.05;
        // this.ammo = 10;
        // this.ammoMax = 10;
        // this.reloadSpeed = 240;

        this.hp = 100;
        this.hpMax = 100;
        this.hpRegen = 0.02;

        this.updateStats();
        
        this.socket.on("disconnect", () => {
            this.remove();
            if (this.map != null) {
                Player.chatAll(this.name + " left", "red");
                database.savePlayer(this);
            }
        });
        this.socket.on("updateTick", (data: any) => {
            if (this.respawning) {
                return;
            }
            // if (this.loading) {
            //     this.remove();
            //     return;
            // }
            if (!(data instanceof Object)) {
                // this.remove();
                return;
            }
            if (!(data.controls instanceof Object)) {
                // this.remove();
                return;
            }
            if (this.waitingForClient) {
                this.waitingForClient = false;
            }
            // controls
            if (typeof data.controls.left == "boolean") {
                this.controls.left = data.controls.left;
            }
            if (typeof data.controls.right == "boolean") {
                this.controls.right = data.controls.right;
            }
            if (typeof data.controls.up == "boolean") {
                this.controls.up = data.controls.up;
            }
            if (typeof data.controls.down == "boolean") {
                this.controls.down = data.controls.down;
            }
            if (typeof data.controls.attack == "boolean") {
                this.controls.attack = data.controls.attack;
            }
            if (typeof data.controls.reload == "boolean") {
                this.controls.reload = data.controls.reload;
            }
            if (typeof data.controls.angle == "number") {
                this.controls.angle = data.controls.angle;
            }
            if (typeof data.controls.weapon == "number" && data.controls.weapon >= 0 && data.controls.weapon < this.weapons.length) {
                this.controls.weapon = data.controls.weapon;
            }
            // for (let i in this.controls) {
            //     if (typeof data.controls[i] == typeof this.controls[i as keyof Controls]) {
            //         // @ts-ignore
            //         this.controls[i as keyof Controls] = data.controls[i];
            //     }
            // }
            // if (this.tick == null) {
            //     this.tick = Math.max(data.tick, tick - config.desyncTickBuffer);
            // }
            // else if (data.tick > this.tick) {
            //     this.tick = data.tick;
            // }
            // else {
            //     return;
            // }
            this.update();
            this.tick += 1;
            if (!config.clientPhysicsEnabled) {
                return;
            }
            this.clientPhysicsBuffer -= Math.abs(this.x - data.x);
            this.clientPhysicsBuffer -= Math.abs(this.y - data.y);
            this.clientPhysicsBuffer -= Math.abs(this.speedX - data.speedX);
            this.clientPhysicsBuffer -= Math.abs(this.speedY - data.speedY);
            if (this.clientPhysicsBuffer < 0) {
                this.overrideClient = true;
                this.clientPhysicsBuffer = 0;
            }
            else {
                this.x = data.x;
                this.y = data.y;
                this.speedX = data.speedX;
                this.speedY = data.speedY;
                this.clientPhysicsBuffer = Math.min(this.clientPhysicsBuffer + config.clientPhysicsBufferAccumulationRate, config.clientPhysicsBuffer);
            }
            // for (let i in data) {
            //     if (typeof data[i] != "number") {
            //         continue;
            //     }
            //     if (this[i as keyof Player] != data[i]) {
            //         console.log("this " + i + " different. server: " + this[i as keyof Player] + ", client: " + data[i])
            //         this.overrideClient = true;
            //         break;
            //     }
            // }
            this.overrideTick = this.tick;
            // // console.log("attacking: " + this.controls[ATTACK])
            // console.log("chargeTime: " + data.chargeTime + " " + this.chargeTime)
            // for (let i = 0; i < this.inventory.maxItems; i++) {
            //     if (data.inventory[i].cooldown != this.inventory.items[i].cooldown) {
            //         // overrideClient = true;
            //         this.inventory.modifiedItems[i] = true;
            //         console.log(data.inventory[i].cooldown + " " + this.inventory.items[i].cooldown)
            //     }
            // }
            // let d = Player.getClientData(this, overrideClient);
            // let e = Inventory.getClientData(this.inventory);
            // console.log(e)
            // if (TEST_PING == 0) {
            //     this.socket.emit("clientData", d);
            //     this.socket.emit("updateInventory", e);
            // }
            // else {
            //     setTimeout(function() {
            //         this.socket.emit("clientData", d);
            //         this.socket.emit("updateInventory", e);
            //     }, TEST_PING);
            // }
        });
        this.socket.on("customizations", (data: Customizations) => {
            if (!(data instanceof Object)) {
                return;
            }
            if (!Array.isArray(data.body) || !Array.isArray(data.shirt) || !Array.isArray(data.pants) || !Array.isArray(data.hair)) {
                return;
            }
            for (let i = 0; i < 3; i++) {
                if (typeof data.body[i] != "number" || data.body[i] < 0 || data.body[i] > 255) {
                    return;
                }
            }
            if (typeof data.body[3] != "number" || data.body[3] < 0 || data.body[3] > 1) {
                return;
            }
            for (let i = 0; i < 3; i++) {
                if (typeof data.shirt[i] != "number" || data.shirt[i] < 0 || data.shirt[i] > 255) {
                    return;
                }
            }
            if (typeof data.shirt[3] != "number" || data.shirt[3] < 0 || data.shirt[3] > 1) {
                return;
            }
            for (let i = 0; i < 3; i++) {
                if (typeof data.pants[i] != "number" || data.pants[i] < 0 || data.pants[i] > 255) {
                    return;
                }
            }
            if (typeof data.pants[3] != "number" || data.pants[3] < 0 || data.pants[3] > 1) {
                return;
            }
            for (let i = 0; i < 3; i++) {
                if (typeof data.hair[i] != "number" || data.hair[i] < 0 || data.hair[i] > 255) {
                    return;
                }
            }
            if (typeof data.hair[3] != "number" || data.hair[3] < 0 || data.hair[3] > 1) {
                return;
            }
            if (data.pantsType != "shorts" && data.pantsType != "skirt") {
                return;
            }
            if (data.hairType != "short" && data.hairType != "long") {
                return;
            }
            this.customizations = data;
        });
        this.socket.on("respawn", () => {
            if (!this.respawning || tick < this.respawnTick) {
                return;
            }
            this.waitingForClient = true;
            this.respawning = false;

            this.x = Math.random() * SimulatedMap.list.get(this.map).width;
            this.y = 100;
            this.speedX = 0;
            this.speedY = 0;
            for (let i in this.weapons) {
                this.weapons[i].ammo = this.weapons[i].ammoMax;
            }
            this.attackCooldown = 0;
            this.reloadCooldown = 0;
            this.hp = this.hpMax;
            this.overrideClient = true;
            this.tick = tick;
            this.overrideTick = this.tick;
        });
        this.socket.on("chat", (data: string) => {
            if (typeof data != "string") {
                return;
            }
            let message = this.name + ": " + data;
            Player.chatAll(message, "black");
        });

        this.socket.emit("configData", {
            tps: config.tps,
            databaseEnabled: config.databaseEnabled,
            clientPhysicsEnabled: config.clientPhysicsEnabled,
        });

        this.init();
    }

    init() {
        super.init();
        Player.list.set(this.id, this);
    }
    remove() {
        super.remove();
        Player.list.delete(this.id);
        // this.socket.remove();
    }

    update() {
        super.update();
    }

    getPacket() {
        if (this.map == null) {
            return;
        }
        if (this.respawning) {
            return;
        }
        // if (this.waitingForClient || this.respawning) {
        //     return;
        // }
        return {
            id: this.id,
            type: this.type,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            phantomFrames: this.phantomFrames,
            controls: this.controls,
            customizations: this.customizations,
            animation: this.animation,
            animationFrame: this.animationFrame,
            weapon: this.weapons[this.controls.weapon],
            // weapon: {
            //     id: this.weapons[this.controls.weapon].id,
            //     animation: this.weapons[this.controls.weapon].animation,
            //     animationFrame: this.weapons[this.controls.weapon].animationFrame,
            // },
            hp: this.hp,
            hpMax: this.hpMax,
            name: this.name,
        };
    }
    getClientPacket() {
        return {
            overrideClient: this.overrideClient,
            overrideTick: this.overrideTick,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            speedX: this.speedX,
            speedY: this.speedY,
            moveSpeed: this.moveSpeed,
            jumpHeight: this.jumpHeight,
            stepHeight: this.stepHeight,
            gravity: this.gravity,
            customizations: this.customizations,
            animationSpeed: this.animationSpeed,
            weapons: this.weapons,
            // attackSpeed: this.attackSpeed,
            // projectileSpeed: this.projectileSpeed,
            // projectileCount: this.projectileCount,
            // projectileSpread: this.projectileSpread,
            // recoil: this.recoil,
            // ammo: this.ammo,
            // ammoMax: this.ammoMax,
            // reloadSpeed: this.reloadSpeed,
            attackCooldown: this.attackCooldown,
            reloadCooldown: this.reloadCooldown,
            hp: this.hp,
            hpMax: this.hpMax,
            respawning: this.respawning,
            respawnTick: this.respawnTick,
            name: this.name,
        };
    }

    sendPacket() {
        if (this.hp == 0 && !this.respawning) {
            this.respawning = true;
            this.respawnTick = tick + config.respawnTime;
            Player.chatAll(this.name + " died", "red");
        }
        let entityData = [];
        for (let [_, entity] of Entity.list) {
            let packet = entity.getPacket();
            if (packet != null) {
                entityData.push(packet);
            }
        }
        let mapData = this.initMap ? SimulatedMap.list.get(this.map).getClientInitData() : SimulatedMap.list.get(this.map).getClientUpdateData();
        this.initMap = false;
        let clientPlayerData = this.getClientPacket();
        this.overrideClient = false;
        this.socket.emit("updateData", {
            tick: tick,
            entity: entityData,
            particle: Particle.list,
            // map: mapData,
            clientPlayer: clientPlayerData,
        });
    }
    static sendAllPackets() {
        for (let [_, player] of Player.list) {
            if (player.map == null) {
                continue;
            }
            player.sendPacket();
        }
        Particle.removeAll();
    }

    static chatAll(message: string, color: string) {
        logger.chat(message);
        for (let [_, player] of Player.list) {
            player.socket.emit("chat", {
                message: message,
                color: color,
            });
        }
    }
}

export { Player };