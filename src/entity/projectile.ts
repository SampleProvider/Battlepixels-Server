import { Entity, EntityType } from "./entity.js";
import { SimulatedMap } from "../map/map.js";
import { Pixel, pixels, State, calculateNormal, explode } from "../map/pixels.js";
import { Player } from "./player.js";
import { Particle } from "./particle.js";
import projectileData from "../../assets/projectiles.json";

interface ProjectileData {
    image: string,
    imageX?: number,
    imageY?: number,
    imageWidth?: number,
    imageHeight?: number,
    imageOffsetX?: number,
    imageOffsetY?: number,
    width: number,
    height: number,
    phantomFrames: number,
    gravity: number,
    collisionEvents: CollisionEvent[],
}

interface CollisionEvent {
    type: string,
    data: any,
}

class Projectile extends Entity {
    type = EntityType.Projectile;

    projectileType: string;
    
    rotation = 0;

    despawnTime = 0;

    damage = 0;
    critDamage = 0;
    knockback = 0;

    piercing = 0;

    gravity = 0;

    collisionEvents: CollisionEvent[] = [];

    parent: Entity;

    static list = new Map<number, Projectile>();

    static data: {[key: string]: ProjectileData} = projectileData;

    constructor(projectileType: string, x: number, y: number, speedX: number, speedY: number, map: number, rotation: number, despawnTime: number, damage: number, critDamage: number, knockback: number, piercing: number, parent: Entity) {
        super();

        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.map = map;
        this.rotation = rotation;
        this.despawnTime = despawnTime;
        this.damage = damage;
        this.critDamage = critDamage;
        this.knockback = knockback;
        this.piercing = piercing;
        
        this.projectileType = projectileType;
        this.width = Projectile.data[this.projectileType].width;
        this.height = Projectile.data[this.projectileType].height;
        this.phantomFrames = Projectile.data[this.projectileType].phantomFrames;
        this.gravity = Projectile.data[this.projectileType].gravity;
        this.collisionEvents = Projectile.data[this.projectileType].collisionEvents;

        this.parent = parent;

        this.init();
    }

    init() {
        super.init();
        Projectile.list.set(this.id, this);
    }
    remove() {
        super.remove();
        Projectile.list.delete(this.id);
    }

    update() {
        this.despawnTime -= 1;
        if (this.despawnTime < 0) {
            this.remove();
            return;
        }
        this.speedY += this.gravity;
        let speedX = this.speedX;
        let speedY = this.speedY;
        this.speedX /= 50;
        this.speedY /= 50;
        for (let i = 0; i < 50; i++) {
            let lastX = this.x;
            let lastY = this.y;
            this.move();
            for (let [_, player] of Player.list) {
                if (player == this.parent) {
                    continue;
                }
                if (player.waitingForClient || player.respawning) {
                    continue;
                }
                if (player.isColliding(this.x, this.y)) {
                    this.onCollision(this.x, this.y);
                    if (player.isCollidingWithHead(this.x, this.y)) {
                        player.hp = Math.max(player.hp - this.damage * this.critDamage, 0);
                        player.speedX += (this.speedX * 50 - player.speedX) * this.knockback / player.weapons[player.controls.weapon].knockbackResistance;
                        player.speedY += (this.speedY * 50 - player.speedY) * this.knockback / player.weapons[player.controls.weapon].knockbackResistance;
                        Particle.addCritDamageParticle(this.x, this.y, this.damage * this.critDamage);
                        this.piercing -= 1;
                        if (this.piercing <= 0) {
                            this.remove();
                            return;
                        }
                    }
                    player.hp = Math.max(player.hp - this.damage, 0);
                    player.speedX += (this.speedX * 50 - player.speedX) * this.knockback / player.weapons[player.controls.weapon].knockbackResistance;
                    player.speedY += (this.speedY * 50 - player.speedY) * this.knockback / player.weapons[player.controls.weapon].knockbackResistance;
                    Particle.addDamageParticle(this.x, this.y, this.damage);
                    this.piercing -= 1;
                    if (this.piercing <= 0) {
                        this.remove();
                        return;
                    }
                }
            }
            // var range = 2;
            // for (let y = Math.floor(this.y) - range; y <= Math.floor(this.y) + range; y++) {
            //     for (let x = Math.floor(this.x) - range; x <= Math.floor(this.x) + range; x++) {
            //         SimulatedMap.list.get(this.map).addUpdate(x, y, 2, this.speedX * 50, this.speedY * 50);
            //     }
            // }
            // // SimulatedMap.list.get(this.map).addUpdate(Math.floor(this.x), Math.floor(this.y), 2, this.speedX * 50, this.speedY * 50);
            // this.remove();
            // return;
            if (this.isCollidingWithMap()) {
                let nextX = this.x;
                let nextY = this.y;
                this.x = lastX;
                this.y = lastY;
                let normal = calculateNormal(SimulatedMap.list.get(this.map), this.x, this.y, 5);
                // this.onCollision(nextX, nextY);
                let dot = this.speedX * normal[0] + this.speedY * normal[1];
                this.speedX -= dot * 2 * normal[0];
                this.speedY -= dot * 2 * normal[1];
                this.speedX *= 0.9;
                this.speedY *= 0.9;
                // this.remove();
                // return;
            }
        }
        // this.speedX = speedX;
        // this.speedY = speedY;
        this.speedX *= 50;
        this.speedY *= 50;
        this.rotation = Math.atan2(this.speedY, this.speedX);
        // if (this.x <= 0 || this.x >= SimulatedMap.list.get(this.map).width - 4 || this.y <= 0 || this.y >= SimulatedMap.list.get(this.map).height - 4) {
        //     return true;
        // }
        // SimulatedMap.list.get(this.map).addUpdate(1, Math.floor(this.x), Math.floor(this.y));
    }
    isCollidingWithMap() {
        if (this.x < 0 || this.x > SimulatedMap.list.get(this.map).width || this.y < 0 || this.y > SimulatedMap.list.get(this.map).height) {
            return true;
        }
        if (pixels[SimulatedMap.list.get(this.map).grid[(Math.floor(this.x) + Math.floor(this.y) * SimulatedMap.list.get(this.map).width) * SimulatedMap.list.get(this.map).stride + Pixel.Id]].state == State.Solid) {
            return true;
        }
        return false;
    }

    onCollision(nextX: number, nextY: number) {
        if (nextX < 0 || nextX > SimulatedMap.list.get(this.map).width || nextY < 0 || nextY > SimulatedMap.list.get(this.map).height) {
        }
        else {
            SimulatedMap.list.get(this.map).addUpdate(Math.floor(nextX), Math.floor(nextY), 0, 0, 0);
        }
        for (let i in this.collisionEvents) {
            if (this.collisionEvents[i].type == "explosion") {
                if (this.x < 0 || this.x > SimulatedMap.list.get(this.map).width || this.y < 0 || this.y > SimulatedMap.list.get(this.map).height) {
                }
                else {
                    let radius = this.collisionEvents[i].data.radius;
                    let normal = calculateNormal(SimulatedMap.list.get(this.map), this.x, this.y, radius);
                    explode(SimulatedMap.list.get(this.map), this.x, this.y, radius / 2, normal);
                    for (let [_, player] of Player.list) {
                        if (player.waitingForClient || player.respawning) {
                            continue;
                        }
                        let distance = Math.sqrt(Math.pow(player.x - this.x, 2) + Math.pow(player.y - this.y, 2));
                        if (distance > radius) {
                            continue;
                        }
                        let weight = Math.pow(Math.E, -Math.pow(distance, 2) / (2 * Math.pow(radius / 2, 2)));
                        player.hp = Math.max(player.hp - this.damage * weight, 0);
                        console.log(weight)
                        player.speedX += ((player.x - this.x) / distance * weight * radius + normal[0] * weight * radius) * this.knockback / player.weapons[player.controls.weapon].knockbackResistance * 10;
                        player.speedY += ((player.y - this.y) / distance * weight * radius + normal[1] * weight * radius) * this.knockback / player.weapons[player.controls.weapon].knockbackResistance * 10;
                        Particle.addDamageParticle(this.x, this.y, this.damage * weight);
                    }
                    Particle.addExplosionParticle(this.x, this.y, radius, normal[0], normal[1]);
                    // var range = 10;
                    // for (let y = Math.floor(this.y) - range; y <= Math.floor(this.y) + range; y++) {
                    //     for (let x = Math.floor(this.x) - range; x <= Math.floor(this.x) + range; x++) {
                    //         if (Math.random() < 0.5) {
                    //             SimulatedMap.list.get(this.map).addUpdate(x, y, 2, 0, 0);
                    //         }
                    //     }
                    // }
                    // SimulatedMap.list.get(this.map).addUpdate(Math.floor(this.x), Math.floor(this.y), 0, 0, 0);
                }
            }
        }
    }

    getPacket() {
        return {
            id: this.id,
            type: this.type,
            projectileType: this.projectileType,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            phantomFrames: this.phantomFrames,
            rotation: this.rotation,
        };
    }

    static updateAll() {
        for (let [_, projectile] of Projectile.list) {
            projectile.update();
        }
    }
}

export { Projectile };