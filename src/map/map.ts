import { createNoise2D } from "simplex-noise";
import alea from "alea";
import { Jimp } from "jimp";
import { Pixel, addUpdatedChunk, pixelData, pixels } from "./pixels.js";

interface GridUpdate {
    x: number,
    y: number,
    id: number,
    speedX: number,
    speedY: number,
}

class SimulatedMap {
    id = Math.random();
    seed = Math.random();
    
    tick = 0;

    width = 0;
    height = 0;

    chunkWidth = 64;
    chunkHeight = 64;

    chunkXAmount = 0;
    chunkYAmount = 0;

    grid: Float32Array;
    nextGrid: Float32Array;
    stride = 4;
    chunks: Int32Array;
    nextChunks: Int32Array;
    gridUpdatedChunks: Int32Array;
    chunkStride = 4;

    updates: GridUpdate[] = [];

    static list = new Map<number, SimulatedMap>();

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.chunkXAmount = Math.ceil(this.width / this.chunkWidth);
        this.chunkYAmount = Math.ceil(this.height / this.chunkHeight);

        let gridArray = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                gridArray.push(...[0, 0, 0, 0]);
            }
        }
        this.grid = new Float32Array(gridArray);
        let nextGridArray = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                nextGridArray.push(...[-1, 0, 0, 0]);
            }
        }
        this.nextGrid = new Float32Array(nextGridArray);
        
        let chunksArray = [];
        for (let y = 0; y < this.chunkYAmount; y++) {
            for (let x = 0; x < this.chunkXAmount; x++) {
                chunksArray.push(...[x * this.chunkWidth, Math.min(x * this.chunkWidth + this.chunkWidth - 1, this.width - 1), y * this.chunkHeight, Math.min(y * this.chunkHeight + this.chunkHeight - 1, this.height - 1)]);
            }
        }
        this.chunks = new Int32Array(chunksArray);
        this.nextChunks = new Int32Array(chunksArray);
        this.gridUpdatedChunks = new Int32Array(chunksArray);

        this.generate();

        SimulatedMap.list.set(this.id, this);
    }
    async generate() {
        // let image = await Jimp.read("./assets/map.png");
        // this.width = image.bitmap.width;
        // this.height = image.bitmap.height;
        // for (let y = 0; y < this.height; y++) {
        //     for (let x = 0; x < this.width; x++) {
        //         let color = image.getPixelColor(x, y);
        //         if (color == 0xfef3c0ff) {
        //             this.grid[y][x] = pixelData.sand.index;
        //         }
        //         if (color == 0x060608ff) {
        //             this.grid[y][x] = pixelData.concrete.index;
        //         }
        //         if (color == 0x141013ff) {
        //             this.grid[y][x] = pixelData.concrete_platform.index;
        //         }
        //         if (color == 0x285cc4ff) {
        //             this.grid[y][x] = pixelData.water.index;
        //         }
        //     }
        // }
        let noise2D = createNoise2D(alea(this.seed));
        let position = 0;
        let heightMap = [];
        let heightScale = 256;
        interface Structure {
            type: string;
            x: number,
            y: number,
            width: number,
            height: number,
        }
        let structures: Structure[] = [];
        for (let x = 0; x < this.width; x++) {
            let lastStructure = null;
            if (structures.length > 0) {
                lastStructure = structures[structures.length - 1];
            }
            if (Math.random() < 0.005 && x <= this.width - 128 && (lastStructure == null || x > lastStructure.x + lastStructure.width + 100)) {
                structures.push({
                    type: "building",
                    x: x,
                    y: 0,
                    width: 128,
                    height: 384,
                });
            }
        }
        let structureIndex = 0;
        for (let x = 0; x < this.width; x++) {
            let height = this.height * 0.8 + heightScale * noise2D(position, 0);
            heightMap[x] = height;
            let water = false;
            for (let y = 0; y < this.height; y++) {
                if (y > height) {
                    this.grid[(x + y * this.width) * this.stride + Pixel.Id] = pixelData.sand.index;
                }
                // else if (y > this.height * 0.8 + heightScale * 0.2) {
                //     this.grid[y][x] = pixelData.water.index;
                //     water = true;
                // }
            }
            if (structureIndex < structures.length) {
                if (x >= structures[structureIndex].x && x < structures[structureIndex].x + structures[structureIndex].width) {
                    continue;
                }
                else if (x >= structures[structureIndex].x + structures[structureIndex].width) {
                    structures[structureIndex].y = Math.ceil(height);
                    structureIndex += 1;
                }
            }
            let lastStructure = null;
            let nextStructure = null;
            if (structureIndex > 0) {
                lastStructure = structures[structureIndex - 1];
            }
            if (structureIndex < structures.length) {
                nextStructure = structures[structureIndex];
            }
            let speed = 0.2;
            if (water) {
                speed *= 2;
            }
            if (lastStructure != null) {
                speed *= 1 - 1 / (1 + (x - (lastStructure.x + lastStructure.width)) / 50);
            }
            if (nextStructure != null) {
                speed *= 1 - 1 / (1 + (nextStructure.x - x - 1) / 50);
            }
            position += speed / heightScale;
        }
        let image = await Jimp.read("./assets/building.png");
        // this.width = image.bitmap.width;
        // this.height = image.bitmap.height;
        for (let i in structures) {
            for (let y = 0; y < image.bitmap.height; y++) {
                for (let x = 0; x < image.bitmap.width; x++) {
                    let color = image.getPixelColor(x, y);
                    if (color == 0xfef3c0ff) {
                        this.grid[(x + structures[i].x + (y + structures[i].y - structures[i].height + 16) * this.width) * this.stride + Pixel.Id] = pixelData.sand.index;
                    }
                    if (color == 0x060608ff) {
                        this.grid[(x + structures[i].x + (y + structures[i].y - structures[i].height + 16) * this.width) * this.stride + Pixel.Id] = pixelData.concrete.index;
                    }
                    if (color == 0x141013ff) {
                        this.grid[(x + structures[i].x + (y + structures[i].y - structures[i].height + 16) * this.width) * this.stride + Pixel.Id] = pixelData.concrete_platform.index;
                    }
                    if (color == 0x6d758dff) {
                        this.grid[(x + structures[i].x + (y + structures[i].y - structures[i].height + 16) * this.width) * this.stride + Pixel.Id] = pixelData.concrete_background_light.index;
                    }
                    if (color == 0x4a5462ff) {
                        this.grid[(x + structures[i].x + (y + structures[i].y - structures[i].height + 16) * this.width) * this.stride + Pixel.Id] = pixelData.concrete_background_medium.index;
                    }
                    if (color == 0x333941ff) {
                        this.grid[(x + structures[i].x + (y + structures[i].y - structures[i].height + 16) * this.width) * this.stride + Pixel.Id] = pixelData.concrete_background_dark.index;
                    }
                    if (color == 0xdae0eaff) {
                        this.grid[(x + structures[i].x + (y + structures[i].y - structures[i].height + 16) * this.width) * this.stride + Pixel.Id] = pixelData.concrete_wall_light.index;
                    }
                    if (color == 0xb3b9d1ff) {
                        this.grid[(x + structures[i].x + (y + structures[i].y - structures[i].height + 16) * this.width) * this.stride + Pixel.Id] = pixelData.concrete_wall_dark.index;
                    }
                }
            }
            // for (let y = structures[i].y; y < structures[i].y + structures[i].height; y++) {
            //     for (let x = structures[i].x; x < structures[i].x + structures[i].width; x++) {
            //         this.grid[y][x] = pixelData.concrete.index;
            //     }
            // }
        }
        // for (let x = 0; x < this.width - 100; x++) {
        //     if (x % 300 == 150) {
        //         let height = Math.floor(this.height * (0.3 + 0.4 * Math.random()));
        //         for (let x1 = x; x1 < x + 100; x1++) {
        //             for (let y = height; y < this.height; y++) {
        //                 if (this.grid[y][x1] != 0) {
        //                     continue;
        //                 }
        //                 if (x1 <= x + 5 || x1 >= x + 95) {
        //                     if (y >= this.height - 40 || this.grid[y + 40][x1] != 0) {
        //                         continue;
        //                     }
        //                     if (y % 360 < 360 - 40) {
        //                         this.grid[y][x1] = pixelData.concrete.index;
        //                     }
        //                 }
        //                 else if (y % 18 == 0) {
        //                     this.grid[y][x1] = pixelData.concrete_platform.index;
        //                 }
        //             }
        //         }
        //     }
        // }
    }

    simulate() {
        let lastChunks = this.chunks;
        this.chunks = this.nextChunks;
        this.nextChunks = lastChunks;
        for (let y = 0; y < this.chunkYAmount; y++) {
            for (let x = 0; x < this.chunkXAmount; x++) {
                this.nextChunks[(x + y * this.chunkXAmount) * this.chunkStride] = x * this.chunkWidth + this.chunkWidth;
                this.nextChunks[(x + y * this.chunkXAmount) * this.chunkStride + 1] = x * this.chunkWidth - 1;
                this.nextChunks[(x + y * this.chunkXAmount) * this.chunkStride + 2] = y * this.chunkHeight + this.chunkHeight;
                this.nextChunks[(x + y * this.chunkXAmount) * this.chunkStride + 3] = y * this.chunkHeight - 1;
                // this.nextChunks[(x + y * this.chunkXAmount) * this.chunkStride] = x * this.chunkWidth;
                // this.nextChunks[(x + y * this.chunkXAmount) * this.chunkStride + 1] = x * this.chunkWidth + this.chunkWidth - 1;
                // this.nextChunks[(x + y * this.chunkXAmount) * this.chunkStride + 2] = y * this.chunkHeight;
                // this.nextChunks[(x + y * this.chunkXAmount) * this.chunkStride + 3] = y * this.chunkHeight + this.chunkHeight - 1;
            }
        }
        if (this.tick % 2 == 0) {
            for (let chunkY = 0; chunkY < this.chunkYAmount; chunkY++) {
                let updatingChunks = [];
                for (let chunkX = 0; chunkX < this.chunkXAmount; chunkX++) {
                    if (this.chunks[(chunkX + chunkY * this.chunkXAmount) * this.chunkStride] != chunkX * this.chunkWidth + this.chunkWidth || this.nextChunks[(chunkX + chunkY * this.chunkXAmount) * this.chunkStride] != chunkX * this.chunkWidth + this.chunkWidth) {
                        updatingChunks.push(chunkX);
                    }
                }
                if (updatingChunks.length == 0) {
                    continue;
                }
                for (let y = chunkY * this.chunkHeight; y < chunkY * this.chunkHeight + this.chunkHeight; y++) {
                    for (let chunkX of updatingChunks) {
                        let minY = Math.min(this.chunks[(chunkX + chunkY * this.chunkXAmount) * this.chunkStride + 2], this.nextChunks[(chunkX + chunkY * this.chunkXAmount) * this.chunkStride + 2]);
                        let maxY = Math.max(this.chunks[(chunkX + chunkY * this.chunkXAmount) * this.chunkStride + 3], this.nextChunks[(chunkX + chunkY * this.chunkXAmount) * this.chunkStride + 3]);
                        if (y >= minY && y <= maxY) {
                            let minX = Math.min(this.chunks[(chunkX + chunkY * this.chunkXAmount) * this.chunkStride], this.nextChunks[(chunkX + chunkY * this.chunkXAmount) * this.chunkStride]);
                            let maxX = Math.max(this.chunks[(chunkX + chunkY * this.chunkXAmount) * this.chunkStride + 1], this.nextChunks[(chunkX + chunkY * this.chunkXAmount) * this.chunkStride + 1]);
                            for (let x = minX; x <= maxX; x++) {
                                if (pixels[this.grid[(x + y * this.width) * this.stride + Pixel.Id]].update == null) {
                                    continue;
                                }
                                // randomSeed(x, y);
                                pixels[this.grid[(x + y * this.width) * this.stride + Pixel.Id]].update(this, x, y);
                            }
                        }
                    }
                }
            }
        }
        else {
            for (let chunkY = 0; chunkY < this.chunkYAmount; chunkY++) {
                let updatingChunks = [];
                for (let chunkX = this.chunkXAmount - 1; chunkX >= 0; chunkX--) {
                    if (this.chunks[(chunkX + chunkY * this.chunkXAmount) * this.chunkStride] != chunkX * this.chunkWidth + this.chunkWidth || this.nextChunks[(chunkX + chunkY * this.chunkXAmount) * this.chunkStride] != chunkX * this.chunkWidth + this.chunkWidth) {
                        updatingChunks.push(chunkX);
                    }
                }
                if (updatingChunks.length == 0) {
                    continue;
                }
                for (let y = chunkY * this.chunkHeight; y < chunkY * this.chunkHeight + this.chunkHeight; y++) {
                    for (let chunkX of updatingChunks) {
                        let minY = Math.min(this.chunks[(chunkX + chunkY * this.chunkXAmount) * this.chunkStride + 2], this.nextChunks[(chunkX + chunkY * this.chunkXAmount) * this.chunkStride + 2]);
                        let maxY = Math.max(this.chunks[(chunkX + chunkY * this.chunkXAmount) * this.chunkStride + 3], this.nextChunks[(chunkX + chunkY * this.chunkXAmount) * this.chunkStride + 3]);
                        if (y >= minY && y <= maxY) {
                            let minX = Math.min(this.chunks[(chunkX + chunkY * this.chunkXAmount) * this.chunkStride], this.nextChunks[(chunkX + chunkY * this.chunkXAmount) * this.chunkStride]);
                            let maxX = Math.max(this.chunks[(chunkX + chunkY * this.chunkXAmount) * this.chunkStride + 1], this.nextChunks[(chunkX + chunkY * this.chunkXAmount) * this.chunkStride + 1]);
                            for (let x = maxX; x >= minX; x--) {
                                if (pixels[this.grid[(x + y * this.width) * this.stride + Pixel.Id]].update == null) {
                                    continue;
                                }
                                // randomSeed(x, y);
                                pixels[this.grid[(x + y * this.width) * this.stride + Pixel.Id]].update(this, x, y);
                            }
                        }
                    }
                }
            }
        }
        for (let chunkY = 0; chunkY < this.chunkYAmount; chunkY++) {
            let updatingChunks = [];
            for (let chunkX = 0; chunkX < this.chunkXAmount; chunkX++) {
                if (this.nextChunks[(chunkX + chunkY * this.chunkXAmount) * this.chunkStride] != chunkX * this.chunkWidth + this.chunkWidth) {
                    updatingChunks.push(chunkX);
                }
            }
            if (updatingChunks.length == 0) {
                continue;
            }
            for (let y = chunkY * this.chunkHeight; y < chunkY * this.chunkHeight + this.chunkHeight; y++) {
                for (let chunkX of updatingChunks) {
                    let minY = this.nextChunks[(chunkX + chunkY * this.chunkXAmount) * this.chunkStride + 2];
                    let maxY = this.nextChunks[(chunkX + chunkY * this.chunkXAmount) * this.chunkStride + 3];
                    if (y >= minY && y <= maxY) {
                        let minX = this.nextChunks[(chunkX + chunkY * this.chunkXAmount) * this.chunkStride];
                        let maxX = this.nextChunks[(chunkX + chunkY * this.chunkXAmount) * this.chunkStride + 1];
                        for (let x = minX; x <= maxX; x++) {
                            if (this.nextGrid[(x + y * this.width) * this.stride + Pixel.Id] != -1) {
                                this.grid[(x + y * this.width) * this.stride + Pixel.Id] = this.nextGrid[(x + y * this.width) * this.stride + Pixel.Id];
                                this.grid[(x + y * this.width) * this.stride + Pixel.SpeedX] = this.nextGrid[(x + y * this.width) * this.stride + Pixel.SpeedX];
                                this.grid[(x + y * this.width) * this.stride + Pixel.SpeedY] = this.nextGrid[(x + y * this.width) * this.stride + Pixel.SpeedY];
                                this.nextGrid[(x + y * this.width) * this.stride + Pixel.Id] = -1;
                            }
                        }
                    }
                }
            }
        }
        // for (let y = 0; y < this.height; y++) {
        //     for (let x = 0; x < this.width; x++) {
        //         if (this.nextGrid[(x + y * this.width) * this.stride + Pixel.Id] != -1) {
        //             this.grid[(x + y * this.width) * this.stride + Pixel.Id] = this.nextGrid[(x + y * this.width) * this.stride + Pixel.Id];
        //             this.grid[(x + y * this.width) * this.stride + Pixel.SpeedX] = this.nextGrid[(x + y * this.width) * this.stride + Pixel.SpeedX];
        //             this.grid[(x + y * this.width) * this.stride + Pixel.SpeedY] = this.nextGrid[(x + y * this.width) * this.stride + Pixel.SpeedY];
        //             this.nextGrid[(x + y * this.width) * this.stride + Pixel.Id] = -1;
        //         }
        //     }
        // }
    }
    static simulateAll() {
        for (let [_, map] of SimulatedMap.list) {
            map.simulate();
        }
    }
    static removeAllUpdates() {
        for (let [_, map] of SimulatedMap.list) {
            map.updates = [];
        }
    }

    addUpdate(x: number, y: number, id: number, speedX: number, speedY: number) {
        this.grid[(x + y * this.width) * this.stride + Pixel.Id] = id;
        this.grid[(x + y * this.width) * this.stride + Pixel.SpeedX] = speedX;
        this.grid[(x + y * this.width) * this.stride + Pixel.SpeedY] = speedY;
        addUpdatedChunk(this, x, y);
        this.updates.push({
            x: x,
            y: y,
            id: id,
            speedX: speedX,
            speedY: speedY,
        });
    }

    getClientInitData() {
        return {
            id: this.id,
            tick: this.tick,
            width: this.width,
            height: this.height,
            grid: this.grid,
            chunks: this.nextChunks,
        };
    }
    getClientUpdateData() {
        return {
            updates: this.updates,
        };
    }
}

export { SimulatedMap };