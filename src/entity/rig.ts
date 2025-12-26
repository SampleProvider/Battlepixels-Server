import { logger } from "../log.js";
import { SimulatedMap } from "../map/map.js";
import { Pixel, pixels, State } from "../map/pixels.js";
import { Entity, EntityType } from "./entity.js";
import { Projectile } from "./projectile.js";
import weaponData from "../../assets/weapons.json";

interface WeaponCustomization {
    [key: string]: {
        images?: {
            conditions?: {
                [key: string]: string,
            },
            x: number,
            y: number,
            width: number,
            height: number,
            offsetX: number,
            offsetY: number,
        }[],
        imageX?: number,
        imageY?: number,
        imageWidth?: number,
        imageHeight?: number,
        imageOffsetX?: number,
        imageOffsetY?: number,
        damage?: number,
        critDamage?: number,
        knockback?: number,
        piercing?: number,
        attackSpeed?: number,
        projectileSpeed?: number,
        projectileCount?: number,
        projectileSpread?: number,
        recoil?: number,
        knockbackResistance?: number,
        ammoMax?: number,
        reloadSpeed?: number,
    },
}
interface WeaponProjectile {
    weight: number,
    damage?: number,
    critDamage?: number,
    knockback?: number,
    piercing?: number,
    attackSpeed?: number,
    projectileSpeed?: number,
    projectileCount?: number,
    projectileSpread?: number,
    recoil?: number,
    knockbackResistance?: number,
    ammoMax?: number,
    reloadSpeed?: number,
}
interface WeaponData {
    image: string,
    imageOffsetX: number,
    imageOffsetY: number,
    type: string,
    offsetX: number,
    offsetY: number,
    damage: number,
    critDamage: number,
    knockback: number,
    piercing: number,
    attackSpeed: number,
    projectile?: string,
    projectiles?: {
        [key: string]: WeaponProjectile
    },
    projectileSpeed: number,
    projectileCount: number,
    projectileSpread: number,
    recoil: number,
    knockbackResistance: number,
    ammoMax: number,
    reloadSpeed: number,
    customizations: {
        [key: string]: WeaponCustomization,
    },
}

interface Controls {
    left: boolean,
    right: boolean,
    up: boolean,
    down: boolean,
    attack: boolean,
    reload: boolean,
    angle: number,
    weapon: number,
    lastWeapon: number,
}
enum MoveType {
    Controls,
}
interface Customizations {
    shirt: number[],
    body: number[],
    pants: number[],
    pantsType: string,
    hair: number[],
    hairType: string,
}
enum AnimationType {
    Idle,
    AimUp,
    AimMiddle,
    AimDown,
    Walk,
    Run,
    Jump,
    Climb,
}
enum WeaponAnimationType {
    Attack,
    Reload,
}
interface Weapon {
    id: string,
    offsetX: number,
    offsetY: number,
    animation: WeaponAnimationType,
    animationFrame: number,
    damage: number,
    critDamage: number,
    knockback: number,
    piercing: number,
    attackSpeed: number,
    projectileSpeed: number,
    projectileCount: number,
    projectileSpread: number,
    recoil: number,
    knockbackResistance: number,
    ammo: number,
    ammoMax: number,
    reloadSpeed: number,
    customizations: {
        [key: string]: string,
    },
}

class Rig extends Entity {
    moveSpeed = 0;
    jumpHeight = 0;
    stepHeight = 0;
    gravity = 0;
    moveType = MoveType.Controls;

    controls: Controls = {
        left: false,
        right: false,
        up: false,
        down: false,
        attack: false,
        reload: false,
        angle: 0,
        weapon: 0,
        lastWeapon: 0,
    };

    customizations: Customizations = {
        shirt: [0, 255, 125, 0.3],
        body: [0, 0, 0, 0],
        pants: [0, 50, 150, 0.6],
        pantsType: "shorts",
        hair: [25, 15, 0, 0.9],
        hairType: "short",
    };

    animation = AnimationType.Idle;
    animationFrame = 0;
    animationSpeed = 0.2;

    headOffsetX = 0;
    headOffsetY = 0;
    headWidth = 0;
    headHeight = 0;
    
    weapons: Weapon[] = [
        // {
        //     id: "machine_gun",
        //     offsetX: 0,
        //     offsetY: 0,
        //     animation: WeaponAnimationType.Attack,
        //     animationFrame: 0,
        //     damage: 0,
        //     critDamage: 0,
        //     knockback: 0,
        //     piercing: 0,
        //     attackSpeed: 0,
        //     projectileSpeed: 0,
        //     projectileCount: 0,
        //     projectileSpread: 0,
        //     recoil: 0,
        //     ammo: 100,
        //     ammoMax: 0,
        //     reloadSpeed: 0,
        // },
        {
            id: "assault_rifle",
            offsetX: 0,
            offsetY: 0,
            animation: WeaponAnimationType.Attack,
            animationFrame: 0,
            damage: 0,
            critDamage: 0,
            knockback: 0,
            piercing: 0,
            attackSpeed: 0,
            projectileSpeed: 0,
            projectileCount: 0,
            projectileSpread: 0,
            recoil: 0,
            knockbackResistance: 0,
            ammo: 40,
            ammoMax: 0,
            reloadSpeed: 0,
            customizations: {
                body: "steel",
                stock: "steel",
                stock_size: "medium",
                scope_size: "medium",
                barrel_size: "medium",
                magazine_size: "medium",
            },
        },
        // {
        //     id: "assault_rifle",
        //     offsetX: 0,
        //     offsetY: 0,
        //     animation: WeaponAnimationType.Attack,
        //     animationFrame: 0,
        //     damage: 0,
        //     critDamage: 0,
        //     knockback: 0,
        //     piercing: 0,
        //     attackSpeed: 0,
        //     projectileSpeed: 0,
        //     projectileCount: 0,
        //     projectileSpread: 0,
        //     recoil: 0,
        //     knockbackResistance: 0,
        //     ammo: 40,
        //     ammoMax: 0,
        //     reloadSpeed: 0,
        //     customizations: {
        //         body: "titanium",
        //         stock: "wood",
        //         stock_size: "large",
        //         scope_size: "small",
        //         barrel_size: "medium",
        //         magazine_size: "large",
        //     },
        // },
        // {
        //     id: "assault_rifle",
        //     offsetX: 0,
        //     offsetY: 0,
        //     animation: WeaponAnimationType.Attack,
        //     animationFrame: 0,
        //     damage: 0,
        //     critDamage: 0,
        //     knockback: 0,
        //     piercing: 0,
        //     attackSpeed: 0,
        //     projectileSpeed: 0,
        //     projectileCount: 0,
        //     projectileSpread: 0,
        //     recoil: 0,
        //     knockbackResistance: 0,
        //     ammo: 40,
        //     ammoMax: 0,
        //     reloadSpeed: 0,
        //     customizations: {
        //         body: "titanium",
        //         stock: "titanium",
        //         stock_size: "large",
        //         scope_size: "large",
        //         barrel_size: "large",
        //         magazine_size: "large",
        //     },
        // },
        // {
        //     id: "assault_rifle",
        //     offsetX: 0,
        //     offsetY: 0,
        //     animation: WeaponAnimationType.Attack,
        //     animationFrame: 0,
        //     damage: 0,
        //     critDamage: 0,
        //     knockback: 0,
        //     piercing: 0,
        //     attackSpeed: 0,
        //     projectileSpeed: 0,
        //     projectileCount: 0,
        //     projectileSpread: 0,
        //     recoil: 0,
        //     knockbackResistance: 0,
        //     ammo: 40,
        //     ammoMax: 0,
        //     reloadSpeed: 0,
        //     customizations: {
        //         body: "wood",
        //         stock: "wood",
        //         stock_size: "small",
        //         scope_size: "small",
        //         barrel_size: "small",
        //         magazine_size: "small",
        //     },
        // },
        {
            id: "shotgun",
            offsetX: 0,
            offsetY: 0,
            animation: WeaponAnimationType.Attack,
            animationFrame: 0,
            damage: 0,
            critDamage: 0,
            knockback: 0,
            piercing: 0,
            attackSpeed: 0,
            projectileSpeed: 0,
            projectileCount: 0,
            projectileSpread: 0,
            recoil: 0,
            knockbackResistance: 0,
            ammo: 4,
            ammoMax: 0,
            reloadSpeed: 0,
            customizations: {},
        },
        {
            id: "sniper_rifle",
            offsetX: 0,
            offsetY: 0,
            animation: WeaponAnimationType.Attack,
            animationFrame: 0,
            damage: 0,
            critDamage: 0,
            knockback: 0,
            piercing: 0,
            attackSpeed: 0,
            projectileSpeed: 0,
            projectileCount: 0,
            projectileSpread: 0,
            recoil: 0,
            knockbackResistance: 0,
            ammo: 1,
            ammoMax: 0,
            reloadSpeed: 0,
            customizations: {},
        },
        // {
        //     id: "railgun",
        //     offsetX: 0,
        //     offsetY: 0,
        //     animation: WeaponAnimationType.Attack,
        //     animationFrame: 0,
        //     damage: 0,
        //     critDamage: 0,
        //     knockback: 0,
        //     piercing: 0,
        //     attackSpeed: 0,
        //     projectileSpeed: 0,
        //     projectileCount: 0,
        //     projectileSpread: 0,
        //     recoil: 0,
        //     knockbackResistance: 0,
        //     ammo: 6,
        //     ammoMax: 0,
        //     reloadSpeed: 0,
        //     customizations: {},
        // },
        {
            id: "rocket_launcher",
            offsetX: 0,
            offsetY: 0,
            animation: WeaponAnimationType.Attack,
            animationFrame: 0,
            damage: 0,
            critDamage: 0,
            knockback: 0,
            piercing: 0,
            attackSpeed: 0,
            projectileSpeed: 0,
            projectileCount: 0,
            projectileSpread: 0,
            recoil: 0,
            knockbackResistance: 0,
            ammo: 3,
            ammoMax: 0,
            reloadSpeed: 0,
            customizations: {},
        },
        {
            id: "pastry_machine_gun",
            offsetX: 0,
            offsetY: 0,
            animation: WeaponAnimationType.Attack,
            animationFrame: 0,
            damage: 0,
            critDamage: 0,
            knockback: 0,
            piercing: 0,
            attackSpeed: 0,
            projectileSpeed: 0,
            projectileCount: 0,
            projectileSpread: 0,
            recoil: 0,
            knockbackResistance: 0,
            ammo: 100,
            ammoMax: 0,
            reloadSpeed: 0,
            customizations: {},
        },
        {
            id: "firework_launcher",
            offsetX: 0,
            offsetY: 0,
            animation: WeaponAnimationType.Attack,
            animationFrame: 0,
            damage: 0,
            critDamage: 0,
            knockback: 0,
            piercing: 0,
            attackSpeed: 0,
            projectileSpeed: 0,
            projectileCount: 0,
            projectileSpread: 0,
            recoil: 0,
            knockbackResistance: 0,
            ammo: 3,
            ammoMax: 0,
            reloadSpeed: 0,
            customizations: {},
        },
    ];
    static weaponData: {[key: string]: WeaponData} = weaponData;

    attackCooldown = 0;
    reloadCooldown = 0;

    hp = 0;
    hpMax = 0;
    hpRegen = 0;

    name: string = null;

    update() {
        if (this.controls.weapon != this.controls.lastWeapon) {
            this.updateWeapon();
            this.controls.lastWeapon = this.controls.weapon;
        }
        this.updateMovement();
        this.updateAnimation();
        this.updateAttack();
        this.updateRegen();
    }
    updateMovement() {
        let liquid = this.isCollidingWithMapLiquid() / this.width / this.height;
        this.speedX *= 0.9;
        this.speedY += this.gravity;
        this.speedY -= this.gravity * liquid * 2;
        this.speedY *= 1 - liquid * 0.05;
        let grounded = false;
        let wallJumpDirection = 0;
        let lastY = this.y;
        this.y += 1;
        if (this.isCollidingWithNewMap(this.x, lastY)) {
            grounded = true;
        }
        this.y = lastY;
        if (!grounded && this.speedY > 0) {
            if (this.controls.left) {
                let lastX = this.x;
                this.x -= 1;
                if (this.isCollidingWithNewMap(lastX, this.y)) {
                    grounded = true;
                    wallJumpDirection -= 1;
                }
                this.x = lastX;
            }
            if (this.controls.right) {
                let lastX = this.x;
                this.x += 1;
                if (this.isCollidingWithNewMap(lastX, this.y)) {
                    grounded = true;
                    wallJumpDirection += 1;
                }
                this.x = lastX;
            }
        }
        if (this.moveType == MoveType.Controls) {
            // this.speedX = 0;
            if (this.controls.left) {
                this.speedX -= this.moveSpeed;
            }
            if (this.controls.right) {
                this.speedX += this.moveSpeed;
            }
            if (this.controls.up && grounded) {
                this.speedX -= wallJumpDirection * Math.sqrt(2 * this.jumpHeight * this.gravity);
                this.speedY = -Math.sqrt(2 * this.jumpHeight * this.gravity);
                this.animationFrame = 0;
                grounded = false;
            }
            // if (this.controls.down) {
            //     this.speedY += this.moveSpeed;
            // }
        }
        if (!this.controls.left && !this.controls.right) {
            this.speedX *= 0.8;
        }
        this.move();
    }
    updateAnimation() {
        let grounded = false;
        let wallJumpDirection = 0;
        let lastY = this.y;
        this.y += 1;
        if (this.isCollidingWithNewMap(this.x, lastY)) {
            grounded = true;
        }
        this.y = lastY;
        if (!grounded && this.speedY > 0) {
            if (this.controls.left) {
                let lastX = this.x;
                this.x -= 1;
                if (this.isCollidingWithNewMap(lastX, this.y)) {
                    grounded = true;
                    wallJumpDirection -= 1;
                }
                this.x = lastX;
            }
            if (this.controls.right) {
                let lastX = this.x;
                this.x += 1;
                if (this.isCollidingWithNewMap(lastX, this.y)) {
                    grounded = true;
                    wallJumpDirection += 1;
                }
                this.x = lastX;
            }
        }
        if (!grounded) {
            this.animation = AnimationType.Jump;
        }
        else if (wallJumpDirection != 0) {
            this.animation = AnimationType.Climb;
        }
        else if (Math.abs(this.speedX) >= 1 / 4) {
            this.animation = AnimationType.Run;
        }
        else {
            this.animation = AnimationType.Idle;
            this.animationFrame = 0;
            // this.animation = AnimationType.AimMiddle;
        }
        switch (this.animation) {
            case AnimationType.Idle:
                this.animationFrame += this.animationSpeed / 10;
                break;
            case AnimationType.Run:
                if ((Math.abs(this.controls.angle) > Math.PI / 2) == (this.speedX < 0)) {
                    if (this.animationFrame < 0) {
                        this.animationFrame = this.animationFrame % 6 + 6;
                    }
                    this.animationFrame += this.animationSpeed * Math.abs(this.speedX) * 2 / 3;
                }
                else {
                    if (this.animationFrame > 0) {
                        this.animationFrame = this.animationFrame % 6 - 6;
                    }
                    this.animationFrame -= this.animationSpeed * Math.abs(this.speedX) * 2 / 3;
                }
                break;
            case AnimationType.Jump:
                if (this.animationFrame < 0) {
                    this.animationFrame *= -1;
                }
                this.animationFrame += this.animationSpeed;
                break;
        }
    }
    updateAttack() {
        let weapon = this.weapons[this.controls.weapon];
        weapon.animationFrame -= 1;
        if (this.controls.reload && this.reloadCooldown <= 0) {
            weapon.ammo = 0;
            this.attackCooldown = 0;
            this.reloadCooldown = weapon.reloadSpeed;
        }
        if (this.reloadCooldown > 0) {
            this.reloadCooldown -= 1;
            if (this.reloadCooldown <= 0) {
                weapon.ammo = weapon.ammoMax;
            }
            else {
                return;
            }
        }
        this.attackCooldown -= 1;
        if (this.controls.attack && this.attackCooldown <= 0) {
            for (let i = 0; i < weapon.projectileCount; i++) {
                if (Rig.weaponData[weapon.id].projectile != null) {
                    let angle = this.controls.angle + (this.random() * 2 - 1) * weapon.projectileSpread;
                    new Projectile(Rig.weaponData[weapon.id].projectile, this.x + weapon.offsetX, this.y + weapon.offsetY, this.speedX + weapon.projectileSpeed * Math.cos(angle), this.speedY + weapon.projectileSpeed * Math.sin(angle), this.map, angle, weapon.damage, weapon.critDamage, weapon.knockback, weapon.piercing, this);
                    this.speedX += -weapon.projectileSpeed * weapon.recoil * Math.cos(angle);
                    this.speedY += -weapon.projectileSpeed * weapon.recoil * Math.sin(angle);
                }
                else if (Rig.weaponData[weapon.id].projectiles != null) {
                    let totalWeight = 0;
                    for (let j in Rig.weaponData[weapon.id].projectiles) {
                        totalWeight += Rig.weaponData[weapon.id].projectiles[j].weight;
                    }
                    let random = this.random() * totalWeight;
                    for (let j in Rig.weaponData[weapon.id].projectiles) {
                        let projectileData = Rig.weaponData[weapon.id].projectiles[j];
                        random -= projectileData.weight;
                        if (random <= 0) {
                            for (let k = 0; k < projectileData.projectileCount; k++) {
                                let angle = this.controls.angle + (this.random() * 2 - 1) * weapon.projectileSpread * projectileData.projectileSpread;
                                new Projectile(j, this.x + weapon.offsetX, this.y + weapon.offsetY, this.speedX + weapon.projectileSpeed * projectileData.projectileSpeed * Math.cos(angle), this.speedY + weapon.projectileSpeed * projectileData.projectileSpeed * Math.sin(angle), this.map, angle, weapon.damage * projectileData.damage, weapon.critDamage * projectileData.critDamage, weapon.knockback * projectileData.knockback, weapon.piercing * projectileData.piercing, this);
                                this.speedX += -weapon.projectileSpeed * projectileData.projectileSpeed * weapon.recoil * projectileData.recoil * Math.cos(angle);
                                this.speedY += -weapon.projectileSpeed * projectileData.projectileSpeed * weapon.recoil * projectileData.recoil * Math.sin(angle);
                            }
                            break;
                        }
                    }
                }
            }
            weapon.animationFrame = weapon.attackSpeed;
            weapon.ammo -= 1;
            if (weapon.ammo == 0) {
                this.reloadCooldown = weapon.reloadSpeed;
                return;
            }
            this.attackCooldown = weapon.attackSpeed;
        }
    }
    updateRegen() {
        this.hp = Math.min(this.hp + this.hpRegen, this.hpMax);
    }

    updateStats() {
        for (let i in this.weapons) {
            let weapon = this.weapons[i];
            weapon.offsetX = Rig.weaponData[weapon.id].offsetX;
            weapon.offsetY = Rig.weaponData[weapon.id].offsetY;
            weapon.damage = Rig.weaponData[weapon.id].damage;
            weapon.critDamage = Rig.weaponData[weapon.id].critDamage;
            weapon.knockback = Rig.weaponData[weapon.id].knockback;
            weapon.piercing = Rig.weaponData[weapon.id].piercing;
            weapon.attackSpeed = Rig.weaponData[weapon.id].attackSpeed;
            weapon.projectileSpeed = Rig.weaponData[weapon.id].projectileSpeed;
            weapon.projectileCount = Rig.weaponData[weapon.id].projectileCount;
            weapon.projectileSpread = Rig.weaponData[weapon.id].projectileSpread / 180 * Math.PI;
            weapon.recoil = Rig.weaponData[weapon.id].recoil;
            weapon.knockbackResistance = Rig.weaponData[weapon.id].knockbackResistance;
            weapon.ammoMax = Rig.weaponData[weapon.id].ammoMax;
            weapon.reloadSpeed = Rig.weaponData[weapon.id].reloadSpeed;
            for (let j in this.weapons[i].customizations) {
                let customization = Rig.weaponData[weapon.id].customizations[j][this.weapons[i].customizations[j]];
                if (customization.damage != null) {
                    weapon.damage *= customization.damage;
                }
                if (customization.critDamage != null) {
                    weapon.critDamage *= customization.critDamage;
                }
                if (customization.knockback != null) {
                    weapon.knockback *= customization.knockback;
                }
                if (customization.piercing != null) {
                    weapon.piercing *= customization.piercing;
                }
                if (customization.attackSpeed != null) {
                    weapon.attackSpeed *= customization.attackSpeed;
                }
                if (customization.projectileSpeed != null) {
                    weapon.projectileSpeed *= customization.projectileSpeed;
                }
                if (customization.projectileCount != null) {
                    weapon.projectileCount *= customization.projectileCount;
                }
                if (customization.projectileSpread != null) {
                    weapon.projectileSpread *= customization.projectileSpread;
                }
                if (customization.recoil != null) {
                    weapon.recoil *= customization.recoil;
                }
                if (customization.knockbackResistance != null) {
                    weapon.knockbackResistance *= customization.knockbackResistance;
                }
                if (customization.ammoMax != null) {
                    weapon.ammoMax *= customization.ammoMax;
                }
                if (customization.reloadSpeed != null) {
                    weapon.reloadSpeed *= customization.reloadSpeed;
                }
            }
        }
    }
    updateWeapon() {
        this.updateStats();
        let weapon = this.weapons[this.controls.weapon];
        if (weapon.ammo == 0) {
            this.attackCooldown = 0;
            this.reloadCooldown = weapon.reloadSpeed;
        }
        else {
            this.attackCooldown = weapon.attackSpeed;
            this.reloadCooldown = 0;
        }
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
        //     if (this.speedY <= this.gravity) {
        //         let stepLastY = this.y;
        //         this.y = Math.floor(stepLastY + 3);
        //         if (this.y + this.height / 2 >= SimulatedMap.list.get(this.map).height) {
        //             this.y = SimulatedMap.list.get(this.map).height - this.height / 2;
        //             // this.speedY = 0;
        //         }
        //         if (this.isCollidingWithNewMap(lastX, stepLastY)) {
        //             this.y = Math.floor(stepLastY + 2);
        //             if (this.y + this.height / 2 >= SimulatedMap.list.get(this.map).height) {
        //                 this.y = SimulatedMap.list.get(this.map).height - this.height / 2;
        //             }
        //             this.speedY = 0;
        //             if (this.isCollidingWithNewMap(lastX, stepLastY)) {
        //                 this.y = Math.floor(stepLastY + 1);
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
        //     let stepLastY = this.y;
        //     this.y = Math.ceil(this.y - 1);
        //     if (this.y - this.height / 2 <= 0) {
        //         this.y = this.height / 2;
        //     }
        //     if (!this.isCollidingWithNewMap(lastX, stepLastY)) {
        //         this.speedY = 0;
        //         return;
        //     }
        //     this.y = Math.ceil(this.y - 1);
        //     if (this.y - this.height / 2 <= 0) {
        //         this.y = this.height / 2;
        //     }
        //     if (!this.isCollidingWithNewMap(lastX, stepLastY)) {
        //         this.speedY = 0;
        //         return;
        //     }
        // this.x = lastX;
        // this.y = lastY;
        // this.speedX = lastSpeedX;
        // this.speedY = lastSpeedY;
        let distanceRemaining = Math.sqrt(Math.pow(this.speedX, 2) + Math.pow(this.speedY, 2));
        let speedX = this.speedX / distanceRemaining;
        let speedY = this.speedY / distanceRemaining;
        let times = 0;
        let liquid = this.isCollidingWithMapLiquid() / this.width / this.height;
        while (distanceRemaining > 0) {
            let planeX = Math.max(Math.sign(speedX), -1e-10);
            let planeY = Math.max(Math.sign(speedY), -1e-10);
            let inverseSpeedX = 1 / speedX;
            let inverseSpeedY = 1 / speedY;
            let frontX = this.x + this.width / 2 * Math.sign(speedX);
            let frontY = this.y + this.width / 2 * Math.sign(speedY);
            let xDistance = (planeX - (frontX - Math.floor(frontX))) * inverseSpeedX;
            let yDistance = (planeY - (frontY - Math.floor(frontY))) * inverseSpeedY;

            // let xAligned = Math.abs(this.x + this.width / 2 - Math.floor(this.x + this.width / 2)) < 1e-5;
            // let yAligned = Math.abs(this.y + this.width / 2 - Math.floor(this.y + this.width / 2)) < 1e-5;

            if (!isFinite(xDistance)) {
                xDistance = Infinity;
            }
            if (!isFinite(yDistance)) {
                yDistance = Infinity;
            }
            
            let lastX = this.x;
            let lastY = this.y;
            
            let distance = Math.min(Math.min(xDistance, yDistance), distanceRemaining);

            this.x += speedX * distance;
            this.y += speedY * distance;
            distanceRemaining -= distance;
            times += 1;
            if (times > 100) {
                logger.warn("moved >100 times!")
                break;
            }

            // if (this.x - this.width / 2 <= 0) {
            //     this.x = this.width / 2;
            //     speedX = 0;
            //     this.speedX = 0;
            // }
            // if (this.x + this.width / 2 >= SimulatedMap.list.get(this.map).width) {
            //     this.x = SimulatedMap.list.get(this.map).width - this.width / 2;
            //     speedX = 0;
            //     this.speedX = 0;
            // }
            // if (this.y - this.height / 2 <= 0) {
            //     this.y = this.height / 2;
            //     speedY = 0;
            //     this.speedY = 0;
            // }
            // if (this.y + this.height / 2 >= SimulatedMap.list.get(this.map).height) {
            //     this.y = SimulatedMap.list.get(this.map).height - this.height / 2;
            //     speedY = 0;
            //     this.speedY = 0;
            // }

            // console.log(this.x, this.y, distance)
            collide: if (this.isCollidingWithNewMap(lastX, lastY)) {
                // if (this instanceof Rig) {
                let stepLastY = this.y;
                for (let i = 1; i <= this.stepHeight; i++) {
                    this.y = Math.ceil(lastY + this.height / 2 - i) - this.height / 2;
                    // this.y = lastY - i;
                    // if (this.y - this.height / 2 <= 0) {
                    //     this.y = this.height / 2;
                    // }
                    if (!this.isCollidingWithNewMap(lastX, lastY)) {
                        // this.y = Math.ceil(this.y + this.height / 2) - this.height / 2;
                        speedY = 0;
                        this.speedY = 0;
                        break collide;
                    }
                }
                this.y = stepLastY;
            // if (this.isCollidingWithMap()) {
                // if (Math.abs(planeX - (this.x - Math.floor(this.x))) < 1e-5) {
                // if (distance == xDistance) {
                let nextX = this.x;
                this.x = lastX;
                if (this.isCollidingWithNewMap(lastX, lastY)) {
                    this.x = nextX;
                    this.y = lastY;
                    speedY = 0;
                    this.speedY = 0;
                    if (this.isCollidingWithNewMap(lastX, lastY)) {
                        this.x = lastX;
                        speedX = 0;
                        this.speedX = 0;
                    }
                }
                else {
                    if (this.speedY > 0 && ((this.speedX < 0 && this.controls.left) || (this.speedX > 0 && this.controls.right))) {
                        this.speedY /= 2;
                        distanceRemaining /= 2;
                    }
                    speedX = 0;
                    this.speedX = 0;
                }
                // if (xAligned) {
                //     speedX = 0;
                //     this.speedX = 0;
                //     this.x = lastX;
                // }
                // // if (Math.abs(planeY - (this.y - Math.floor(this.y))) < 1e-5) {
                // // if (distance == yDistance) {
                // if (yAligned) {
                //     speedY = 0;
                //     this.speedY = 0;
                //     this.y = lastY;
                // }
            }
            else {
                if (liquid < 0.25 && this.speedY >= 0 && this.speedY <= this.gravity) {
                    let stepLastY = this.y;
                    this.y = Math.floor(lastY + this.height / 2 + this.stepHeight + 1) - this.height / 2;
                    if (this.isCollidingWithNewMap(lastX, stepLastY)) {
                        speedY = 0;
                        this.speedY = 0;
                        for (let i = this.stepHeight; i >= 0; i--) {
                            this.y = Math.floor(lastY + this.height / 2 + i) - this.height / 2;
                            if (!this.isCollidingWithNewMap(lastX, stepLastY)) {
                                break;
                            }
                        }
                    }
                    else {
                        this.y = stepLastY;
                    }
                }
            }

            if (this.speedX == 0 && this.speedY == 0) {
                break;
            }
        }
    }
    isCollidingWithHead(x: number, y: number) {
        if (this.x + this.headOffsetX - this.headWidth / 2 <= x && this.x + this.headOffsetX + this.headWidth / 2 >= x && this.y + this.headOffsetY - this.headHeight / 2 <= y && this.y + this.headOffsetY + this.headHeight / 2 >= y) {
            return true;
        }
        return false;
    }
    isCollidingWithNewMap(lastX: number, lastY: number) {
        if (this.x - this.width / 2 < 0 || this.x + this.width / 2 > SimulatedMap.list.get(this.map).width || this.y - this.height / 2 < 0 || this.y + this.height / 2 > SimulatedMap.list.get(this.map).height) {
            return true;
        }
        for (let y = Math.floor(this.y - this.height / 2); y < Math.ceil(this.y + this.height / 2); y++) {
            for (let x = Math.floor(this.x - this.width / 2); x < Math.ceil(this.x + this.width / 2); x++) {
                if (x >= Math.floor(lastX - this.width / 2) && x < Math.ceil(lastX + this.width / 2) && y >= Math.floor(lastY - this.height / 2) && y < Math.ceil(lastY + this.height / 2)) {
                    continue;
                }
                if (pixels[SimulatedMap.list.get(this.map).grid[(x + y * SimulatedMap.list.get(this.map).width) * SimulatedMap.list.get(this.map).stride + Pixel.Id]].state == State.Solid) {
                    return true;
                }
                // if (this.controls.down && this.speedY <= this.gravity) {
                //     continue;
                // }
                // if (this.speedY >= 0 && !this.controls.down && pixels[SimulatedMap.list.get(this.map).grid[(x + y * SimulatedMap.list.get(this.map).width) * SimulatedMap.list.get(this.map).stride + Pixel.Id]].state == State.SolidPlatform && y == Math.ceil(this.y + this.height / 2) - 1) {
                //     return true;
                // }
                // if (this.speedY >= 0 && !this.controls.down && pixels[SimulatedMap.list.get(this.map).grid[(x + y * SimulatedMap.list.get(this.map).width) * SimulatedMap.list.get(this.map).stride + Pixel.Id]].state == State.SolidPlatform && y >= Math.ceil(lastY + this.height / 2)) {
                if (this.speedY >= 0 && !this.controls.down && pixels[SimulatedMap.list.get(this.map).grid[(x + y * SimulatedMap.list.get(this.map).width) * SimulatedMap.list.get(this.map).stride + Pixel.Id]].state == State.SolidPlatform && y >= Math.ceil(lastY + this.height / 2) - 1) {
                    return true;
                }
            }
        }
        return false;
    }
    isCollidingWithMapLiquid() {
        if (this.x - this.width / 2 < 0 || this.x + this.width / 2 > SimulatedMap.list.get(this.map).width || this.y - this.height / 2 < 0 || this.y + this.height / 2 > SimulatedMap.list.get(this.map).height) {
            return 0;
        }
        let liquid = 0;
        for (let y = Math.floor(this.y - this.height / 2); y < Math.ceil(this.y + this.height / 2); y++) {
            for (let x = Math.floor(this.x - this.width / 2); x < Math.ceil(this.x + this.width / 2); x++) {
                if (pixels[SimulatedMap.list.get(this.map).grid[(x + y * SimulatedMap.list.get(this.map).width) * SimulatedMap.list.get(this.map).stride + Pixel.Id]].state == State.Liquid) {
                    let width = Math.min(Math.min(1, x - this.x + this.width / 2), this.x + this.width / 2 - x);
                    let height = Math.min(Math.min(1, y - this.y + this.height / 2), this.y + this.height / 2 - y);
                    liquid += width * height;
                }
            }
        }
        return liquid;
    }
}

export { Rig, Customizations };