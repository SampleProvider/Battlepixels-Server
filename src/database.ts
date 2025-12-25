import fs from "fs";
import bcrypt from "bcrypt";
import { Player } from "./entity/player.ts";
import { logger } from "./log.ts";
import { Customizations } from "./entity/rig.ts";
import { config } from "../index.ts";

interface Account {
    password: string,
    data: {
        customizations: Customizations,
    },
};

class Database {
    data: { [key: string]: Account };

    static salt = 10;

    constructor() {
        if (!config.databaseEnabled) {
            return;
        }
        this.data = JSON.parse(fs.readFileSync("./database/database.json").toString()) as { [key: string]: Account };
        logger.info("[Database] Loaded database");
    }
    save() {
        if (!config.databaseEnabled) {
            return;
        }
        this.saveAllPlayers();
        return new Promise<void>(async (resolve) => {
            logger.info("[Database] Attempting to save database");
            fs.writeFile("./database/database.json", JSON.stringify(this.data), function() {
                resolve();
                logger.info("[Database] Saved database");
            });
        });
    }
    backup() {
        if (!config.databaseEnabled) {
            return;
        }
        this.saveAllPlayers();
        let date = new Date();
        let hour = date.getHours().toString();
        if (hour.length == 1) {
            hour = "0" + hour;
        }
        let minute = date.getMinutes().toString();
        if (minute.length == 1) {
            minute = "0" + minute;
        }
        let name = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + hour + "-" + minute + ".json";
        return new Promise<void>(async (resolve) => {
            logger.info("[Database] Attempting to write backup");
            fs.writeFile("./database/backups/" + name, JSON.stringify(this.data), function() {
                resolve();
                logger.info("[Database] Wrote backup \"" + name + "\"");
            });
        });
    }
    savePlayer(player: Player) {
        if (!config.databaseEnabled) {
            return;
        }
        database.data[player.name].data.customizations = player.customizations;
    }
    loadPlayer(player: Player) {
        if (!config.databaseEnabled) {
            return;
        }
        let data = database.data[player.name].data;
        player.customizations = data.customizations;
        // player.builds = data.builds;
        // player.currentBuild = data.currentBuild;
    }
    saveAllPlayers() {
        if (!config.databaseEnabled) {
            return;
        }
        for (let [_, player] of Player.list) {
            if (player.name != null) {
                this.savePlayer(player);
            }
        }
    }

    async signIn(username: string, password: string) {
        if (!config.databaseEnabled) {
            return "success";
        }
        let validUsername = this.checkValidUsername(username);
        if (validUsername != true) {
            return validUsername;
        }
        let validPassword = this.checkValidPassword(password);
        if (validPassword != true) {
            return validPassword;
        }
        let data = this.data[username];
        if (data == null) {
            return "usernameIncorrect";
        }
        if (!await this.compare(password, data.password)) {
            return "passwordIncorrect";
        }
        for (let [_, player] of Player.list) {
            if (player.name == username) {
                return "alreadyLoggedIn";
            }
        }
        return "success";
    }
    async createAccount(username: string, password: string) {
        if (!config.databaseEnabled) {
            return "success";
        }
        let validUsername = this.checkValidUsername(username);
        if (validUsername != true) {
            return validUsername;
        }
        let validPassword = this.checkValidPassword(password);
        if (validPassword != true) {
            return validPassword;
        }
        let data = this.data[username];
        if (data != null) {
            return "usernameExists";
        }
        for (let [_, player] of Player.list) {
            if (player.name == username) {
                return "alreadyLoggedIn";
            }
        }
        this.data[username] = {
            password: await this.hash(password),
            data: {
                customizations: {
                    shirt: [0, 255, 125, 0.3],
                    body: [0, 0, 0, 0],
                    pants: [0, 50, 150, 0.6],
                    pantsType: "shorts",
                    hair: [25, 15, 0, 0.9],
                    hairType: "short",
                },
            },
            // banned: false,
        };
        logger.info("[Database] Created account \"" + username + "\"");
        return "success";
    }
    async deleteAccount(username: string, password: string) {
        if (!config.databaseEnabled) {
            return "success";
        }
        let validUsername = this.checkValidUsername(username);
        if (validUsername != true) {
            return validUsername;
        }
        let validPassword = this.checkValidPassword(password);
        if (validPassword != true) {
            return validPassword;
        }
        let data = this.data[username];
        if (data == null) {
            return "usernameIncorrect";
        }
        if (!await this.compare(password, data.password)) {
            return "passwordIncorrect";
        }
        delete this.data[username];
        logger.info("[Database] Deleted account \"" + username + "\"");
        return "success";
    }
    async changeUsername(username: string, password: string, newUsername: string) {
        if (!config.databaseEnabled) {
            return "success";
        }
        let validUsername = this.checkValidUsername(username);
        if (validUsername != true) {
            return validUsername;
        }
        let validPassword = this.checkValidPassword(password);
        if (validPassword != true) {
            return validPassword;
        }
        let validNewUsername = this.checkValidUsername(newUsername);
        if (validNewUsername != true) {
            return "new" + validNewUsername.charAt(0).toUpperCase() + validNewUsername.substring(1);
        }
        let data = this.data[username];
        if (data == null) {
            return "usernameIncorrect";
        }
        if (!await this.compare(password, data.password)) {
            return "passwordIncorrect";
        }
        if (this.data[newUsername] != null) {
            return "usernameExists";
        }
        this.data[newUsername] = this.data[username];
        delete this.data[username];
        logger.info("[Database] Changed username of account \"" + username + "\" to \"" + newUsername + "\"");
        return "success";
    }
    async changePassword(username: string, password: string, newPassword: string) {
        if (!config.databaseEnabled) {
            return "success";
        }
        let validUsername = this.checkValidUsername(username);
        if (validUsername != true) {
            return validUsername;
        }
        let validPassword = this.checkValidPassword(password);
        if (validPassword != true) {
            return validPassword;
        }
        let validNewPassword = this.checkValidPassword(newPassword);
        if (validNewPassword != true) {
            return "new" + validNewPassword.charAt(0).toUpperCase() + validNewPassword.substring(1);
        }
        let data = this.data[username];
        if (data == null) {
            return "usernameIncorrect";
        }
        if (!await this.compare(password, data.password)) {
            return "passwordIncorrect";
        }
        this.data[username].password = await this.hash(newPassword);
        logger.info("[Database] Changed password of account \"" + username + "\"");
        return "success";
    }

    static validCharacters = "abcdefghijklmnopqrstuvwxyz1234567890-=`~!@#$%^&*()_+[]{}\\|;:'\",.<>/?";
    checkValidUsername(username: string) {
        if (username.length < 3) {
            return "usernameShort";
        }
        if (username.length > 32) {
            return "usernameLong";
        }
        let lowercaseUsername = username.toLowerCase();
        for (let i = 0; i < lowercaseUsername.length; i++) {
            if (!Database.validCharacters.includes(lowercaseUsername.charAt(i))) {
                return "usernameInvalid";
            }
        }
        return true;
    }
    checkValidPassword(password: string) {
        if (password.length > 128) {
            return "passwordLong";
        }
        return true;
    }

    async compare(password1: string, password2: string) {
        return await bcrypt.compare(password1, password2);
    }
    async hash(password: string) {
        return await bcrypt.hash(password, Database.salt);
    }
}

let database = new Database();

export { database };