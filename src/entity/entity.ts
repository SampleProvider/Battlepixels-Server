import { mulberry32 } from "../random.ts";
import { SimulatedMap } from "../map/map.ts";
import { Pixel, pixels, State } from "../map/pixels.ts";

enum EntityType {
    Entity,
    Player,
    Projectile,
}

class Entity {
    id = Math.random();
    type = EntityType.Entity;

    random = mulberry32(this.id);

    x = 0;
    y = 0;
    speedX = 0;
    speedY = 0;

    width = 0;
    height = 0;

    map: number = null;

    phantomFrames = 1;

    static list = new Map<number, Entity>();

    init() {
        Entity.list.set(this.id, this);
    }
    remove() {
        Entity.list.delete(this.id);
    }
    
    update() {
        
    }
    
    move() {
        // let collided = false;
        // // let max = Math.ceil(Math.max(Math.abs(this.speedX), Math.abs(this.speedY)) / this.physicsInaccuracy / ENV.physicsInaccuracy);
        // let max = Math.ceil(Math.max(Math.abs(this.speedX) / this.width, Math.abs(this.speedY) / this.height));
        // if (max != 0) {
        //     let speedX = this.speedX / max;
        //     let speedY = this.speedY / max;
        //     for (let i = 0; i < max; i++) {
        //         this.lastX = this.x;
        //         this.lastY = this.y;
        //         if (slide) {
        //             this.x += speedX;
        //             this.gridX = Math.floor(this.x / TILE_SIZE);
        //             // if (Entity.collideWithMap(this, this.speedX, 0, slide)) {
        //             //     collided = true;
        //             // }
        //             this.y += speedY;
        //             this.gridY = Math.floor(this.y / TILE_SIZE);
        //             // if (Entity.collideWithMap(this, 0, this.speedY, slide)) {
        //             //     collided = true;
        //             // }
        //         }
        //         else {
        //             this.x += speedX;
        //             this.y += speedY;
        //             this.gridX = Math.floor(this.x / TILE_SIZE);
        //             this.gridY = Math.floor(this.y / TILE_SIZE);
        //             // if (Entity.collideWithMap(this, this.speedX, this.speedY, slide)) {
        //             //     collided = true;
        //             //     break;
        //             // }
        //         }
        //         // if (Entity.collideWithMap(this, this.speedX, this.speedY, slide)) {
        //         //     collided = true;
        //         //     if (slide) {
        //         //         if (this.x != this.lastX + speedX) {
        //         //             Entity.collideWithMap(this, 0, this.speedY, slide);
        //         //         }
        //         //         else {
        //         //             Entity.collideWithMap(this, this.speedX, 0, slide);
        //         //         }
        //         //     }
        //         //     if (!slide) {
        //         //         break;
        //         //     }
        //         // }
        //         // if (Entity.collideWithMapEffects(this, speedX, speedY)) {
        //         //     break;
        //         // }
        //         if (this.x == this.lastX && this.y == this.lastY) {
        //             break;
        //         }
        //     }
        // }
        // this.chunkX = Math.floor(this.x / CHUNK_SIZE);
        // this.chunkY = Math.floor(this.y / CHUNK_SIZE);
        // this.updateChunks();
        // return collided;
        // let lastX = this.x;
        // let lastY = this.y;
        // let lastSpeedX = this.speedX;
        // let lastSpeedY = this.speedY;
        // this.x += this.speedX;
        // this.y += this.speedY;
        // if (this.x - this.width / 2 <= 0) {
        //     this.x = this.width / 2;
        //     this.speedX = 0;
        // }
        // if (this.x + this.width / 2 >= SimulatedMap.list.get(this.map).width) {
        //     this.x = SimulatedMap.list.get(this.map).width - this.width / 2;
        //     this.speedX = 0;
        // }
        // if (this.y - this.height / 2 <= 0) {
        //     this.y = this.height / 2;
        //     this.speedY = 0;
        // }
        // if (this.y + this.height / 2 >= SimulatedMap.list.get(this.map).height) {
        //     this.y = SimulatedMap.list.get(this.map).height - this.height / 2;
        //     this.speedY = 0;
        // }
        // if (!this.isCollidingWithNewMap(lastX, lastY)) {
        //     // if (this instanceof Rig && this.speedY <= this.gravity) {
        //     if ("gravity" in this && typeof this.gravity == "number" && this.speedY <= this.gravity) {
        //         let stepLastY = this.y;
        //         this.y = Math.floor(stepLastY / 4 + 3);
        //         if (this.y + this.height / 2 >= SimulatedMap.list.get(this.map).height) {
        //             this.y = SimulatedMap.list.get(this.map).height - this.height / 2;
        //             // this.speedY = 0;
        //         }
        //         if (this.isCollidingWithNewMap(lastX, stepLastY)) {
        //             this.y = Math.floor(stepLastY / 4 + 2);
        //             if (this.y + this.height / 2 >= SimulatedMap.list.get(this.map).height) {
        //                 this.y = SimulatedMap.list.get(this.map).height - this.height / 2;
        //             }
        //             this.speedY = 0;
        //             if (this.isCollidingWithNewMap(lastX, stepLastY)) {
        //                 this.y = Math.floor(stepLastY / 4 + 1);
        //                 if (this.y + this.height / 2 >= SimulatedMap.list.get(this.map).height) {
        //                     this.y = SimulatedMap.list.get(this.map).height - this.height / 2;
        //                 }
        //             }
        //             return;
        //         }
        //         else {
        //             this.y = stepLastY;
        //         }
        //     }
        //     return;
        // }
        // // if (this instanceof Rig) {
        // if (this.type == EntityType.Player) {
        //     let stepLastY = this.y;
        //     this.y = Math.ceil(this.y / 4 - 1);
        //     if (this.y - this.height / 2 <= 0) {
        //         this.y = this.height / 2;
        //     }
        //     if (!this.isCollidingWithNewMap(lastX, stepLastY)) {
        //         this.speedY = 0;
        //         return;
        //     }
        //     this.y = Math.ceil(this.y / 4 - 1);
        //     if (this.y - this.height / 2 <= 0) {
        //         this.y = this.height / 2;
        //     }
        //     if (!this.isCollidingWithNewMap(lastX, stepLastY)) {
        //         this.speedY = 0;
        //         return;
        //     }
        // }
        // this.x = lastX;
        // this.y = lastY;
        // this.speedX = lastSpeedX;
        // this.speedY = lastSpeedY;
        // let distanceRemaining = Math.sqrt(Math.pow(this.speedX, 2) + Math.pow(this.speedY, 2));
        // let speedX = this.speedX / distanceRemaining;
        // let speedY = this.speedY / distanceRemaining;
        // let times = 0;
        // while (distanceRemaining > 0) {
        //     let planeX = Math.max(Math.sign(speedX), -1e-10);
        //     let planeY = Math.max(Math.sign(speedY), -1e-10);
        //     let inverseSpeedX = 1 / speedX;
        //     let inverseSpeedY = 1 / speedY;
        //     let xDistance = (planeX - (this.x + this.width / 2 - Math.floor(this.x + this.width / 2))) * inverseSpeedX;
        //     let yDistance = (planeY - (this.y + this.width / 2 - Math.floor(this.y + this.width / 2))) * inverseSpeedY;

        //     // let xAligned = Math.abs(this.x + this.width / 2 - Math.floor(this.x + this.width / 2)) < 1e-5;
        //     // let yAligned = Math.abs(this.y + this.width / 2 - Math.floor(this.y + this.width / 2)) < 1e-5;

        //     if (!isFinite(xDistance)) {
        //         xDistance = Infinity;
        //     }
        //     if (!isFinite(yDistance)) {
        //         yDistance = Infinity;
        //     }
            
        //     let lastX = this.x;
        //     let lastY = this.y;
            
        //     let distance = Math.min(Math.min(xDistance, yDistance), distanceRemaining);

        //     this.x += speedX * distance;
        //     this.y += speedY * distance;
        //     distanceRemaining -= distance;
        //     times += 1;
        //     if (times > 100) {
        //         logger.warn("moved >100 times!")
        //         break;
        //     }

        //     if (this.x - this.width / 2 <= 0) {
        //         this.x = this.width / 2;
        //         speedX = 0;
        //         this.speedX = 0;
        //     }
        //     if (this.x + this.width / 2 >= SimulatedMap.list.get(this.map).width) {
        //         this.x = SimulatedMap.list.get(this.map).width - this.width / 2;
        //         speedX = 0;
        //         this.speedX = 0;
        //     }
        //     if (this.y - this.height / 2 <= 0) {
        //         this.y = this.height / 2;
        //         speedY = 0;
        //         this.speedY = 0;
        //     }
        //     if (this.y + this.height / 2 >= SimulatedMap.list.get(this.map).height) {
        //         this.y = SimulatedMap.list.get(this.map).height - this.height / 2;
        //         speedY = 0;
        //         this.speedY = 0;
        //     }

        //     // console.log(this.x, this.y, distance)
        //     collide: if (this.isCollidingWithNewMap(lastX, lastY)) {
        //         // if (this instanceof Rig) {
        //         if (this.type == EntityType.Player) {
        //             let stepLastY = this.y;
        //             this.y = Math.ceil(this.y / 4 - 1);
        //             if (this.y - this.height / 2 <= 0) {
        //                 this.y = this.height / 2;
        //             }
        //             if (!this.isCollidingWithNewMap(lastX, stepLastY)) {
        //                 this.speedY = 0;
        //                 speedY = 0;
        //                 break collide;
        //             }
        //             this.y = Math.ceil(this.y / 4 - 1);
        //             if (this.y - this.height / 2 <= 0) {
        //                 this.y = this.height / 2;
        //             }
        //             if (!this.isCollidingWithNewMap(lastX, stepLastY)) {
        //                 this.speedY = 0;
        //                 speedY = 0;
        //                 break collide;
        //             }
        //             this.y = stepLastY;
        //         }
        //     // if (this.isCollidingWithMap()) {
        //         // if (Math.abs(planeX - (this.x - Math.floor(this.x))) < 1e-5) {
        //         // if (distance == xDistance) {
        //         let nextX = this.x;
        //         this.x = lastX;
        //         if (this.isCollidingWithNewMap(lastX, lastY)) {
        //             this.x = nextX;
        //             this.y = lastY;
        //             speedY = 0;
        //             this.speedY = 0;
        //             if (this.isCollidingWithNewMap(lastX, lastY)) {
        //                 this.x = lastX;
        //                 speedX = 0;
        //                 this.speedX = 0;
        //             }
        //         }
        //         else {
        //             speedX = 0;
        //             this.speedX = 0;
        //         }
        //         // if (xAligned) {
        //         //     speedX = 0;
        //         //     this.speedX = 0;
        //         //     this.x = lastX;
        //         // }
        //         // // if (Math.abs(planeY - (this.y - Math.floor(this.y))) < 1e-5) {
        //         // // if (distance == yDistance) {
        //         // if (yAligned) {
        //         //     speedY = 0;
        //         //     this.speedY = 0;
        //         //     this.y = lastY;
        //         // }
        //     }

        //     if (this.speedX == 0 && this.speedY == 0) {
        //         break;
        //     }
        // }
        this.x += this.speedX;
        this.y += this.speedY;
    }

    isColliding(x: number, y: number) {
        if (this.x - this.width / 2 <= x && this.x + this.width / 2 >= x && this.y - this.height / 2 <= y && this.y + this.height / 2 >= y) {
            return true;
        }
        return false;
    }
    isCollidingWithMap() {
        if (this.x - this.width / 2 < 0 || this.x + this.width / 2 > SimulatedMap.list.get(this.map).width || this.y - this.height / 2 < 0 || this.y + this.height / 2 > SimulatedMap.list.get(this.map).height) {
            return true;
        }
        for (let y = Math.floor((this.y - this.height / 2) / 4); y < Math.ceil((this.y + this.height / 2) / 4); y++) {
            for (let x = Math.floor((this.x - this.width / 2) / 4); x < Math.ceil((this.x + this.width / 2) / 4); x++) {
                if (pixels[SimulatedMap.list.get(this.map).grid[(x + y * SimulatedMap.list.get(this.map).width) * SimulatedMap.list.get(this.map).stride + Pixel.Id]].state == State.Solid) {
                    return true;
                }
            }
        }
        return false;
    }
    isCollidingWithNewMap(lastX: number, lastY: number) {
        if (this.x - this.width / 2 < 0 || this.x + this.width / 2 > SimulatedMap.list.get(this.map).width || this.y - this.height / 2 < 0 || this.y + this.height / 2 > SimulatedMap.list.get(this.map).height) {
            return true;
        }
        for (let y = Math.floor((this.y - this.height / 2) / 4); y < Math.ceil((this.y + this.height / 2) / 4); y++) {
            for (let x = Math.floor((this.x - this.width / 2) / 4); x < Math.ceil((this.x + this.width / 2) / 4); x++) {
                if (x >= Math.floor((lastX - this.width / 2) / 4) && x < Math.ceil((lastX + this.width / 2) / 4) && y >= Math.floor((lastY - this.height / 2) / 4) && y < Math.ceil((lastY + this.height / 2) / 4)) {
                    continue;
                }
                if (pixels[SimulatedMap.list.get(this.map).grid[(x + y * SimulatedMap.list.get(this.map).width) * SimulatedMap.list.get(this.map).stride + Pixel.Id]].state == State.Solid) {
                    return true;
                }
            }
        }
        return false;
    }

    getPacket() {
        return {
            id: this.id,
            type: this.type,
            x: this.x,
            y: this.y,
        };
    }
}

export { Entity, EntityType };