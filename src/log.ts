import * as fs from "fs";
import * as readline from "readline";

enum LogColor {
    Black = "\x1b[30m",
    Red = "\x1b[31m",
    Green = "\x1b[32m",
    Yellow = "\x1b[33m",
    Blue = "\x1b[34m",
    Purple = "\x1b[35m",
    Cyan = "\x1b[36m",
    White = "\x1b[37m",
}
enum LogType {
    Info,
    Warn,
    Error,
    Fatal,
    Debug,
    Chat,
    None,
}

let logger = {
    awaitingLogs: 0,
    writeLog: function(text: string) {
        let date = new Date();
        let name = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + ".log";
        this.awaitingLogs += 1;
        fs.appendFile("./logs/" + name, text + "\n", { encoding: "utf-8" }, () => {
            this.awaitingLogs -= 1;
        });
    },
    awaitLogs: async function() {
        await new Promise<void>((resolve, reject) => {
            let interval = setInterval(() => {
                if (this.awaitingLogs == 0) {
                    clearInterval(interval);
                    resolve();
                }
            }, 10);
        });
    },
    log: function(text: string, color: LogColor, type: LogType) {
        let prefix = this.getTimeStamp() + "| ";
        switch (type) {
            case LogType.Info:
                prefix += " INFO";
                break;
            case LogType.Warn:
                prefix += " WARN";
                break;
            case LogType.Error:
                prefix += "ERROR";
                break;
            case LogType.Fatal:
                prefix += "FATAL";
                break;
            case LogType.Debug:
                prefix += "DEBUG";
                break;
            case LogType.Chat:
                prefix += " CHAT";
                break;
            default:
                prefix += "-----";
                break;
        }
        prefix += " | ";

        process.stdout.write("\x1b[2K\r " + prefix + color + text + "\x1b[0m\n\r> ");
        // prompt._refreshLine();

        this.writeLog(prefix + text);
    },
    info: function(text: string) {
        this.log(text, LogColor.White, LogType.Info);
    },
    chat: function(text: string) {
        this.log(text, LogColor.Cyan, LogType.Chat);
    },
    debug: function(text: string) {
        this.log(text, LogColor.Green, LogType.Debug);
    },
    warn: function(text: string) {
        this.log(text, LogColor.Yellow, LogType.Warn);
    },
    error: function(text: string | Error) {
        this.log(text.toString(), LogColor.Red, LogType.Error);
        if (text instanceof Error && text.stack != null) {
            this.log(text.stack.toString(), LogColor.Red, LogType.Error);
        }
    },
    fatal: function(text: string | Error) {
        this.log(text.toString(), LogColor.Red, LogType.Fatal);
        if (text instanceof Error && text.stack != null) {
            this.log(text.stack.toString(), LogColor.Red, LogType.Fatal);
        }
    },
    getTimeStamp: function() {
        let date = new Date();
        let hour = date.getHours().toString();
        if (hour.length == 1) {
            hour = "0" + hour;
        }
        let minute = date.getMinutes().toString();
        if (minute.length == 1) {
            minute = "0" + minute;
        }
        let second = date.getSeconds().toString();
        if (second.length == 1) {
            second = "0" + second;
        }
        return "[" + hour + ":" + minute + ":" + second + "] ";
    },
}

const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });
prompt.on("line", async function(input) {
    if (input != "") {
        if (input.toLowerCase() == "help") {
            logger.log("-------- Console help --------", LogColor.Green, LogType.Debug);
            logger.log("help               shows this screen", LogColor.Green, LogType.Debug);
            logger.log("copyright-details  shows copyright details", LogColor.Green, LogType.Debug);
            logger.log("stop               stops the server", LogColor.Green, LogType.Debug);
            logger.log("", LogColor.Green, LogType.Debug);
            logger.log("Use \"/\" to run commands. For more information, run \"/help\"", LogColor.Green, LogType.Debug);
            return;
        }
        else if (input.toLowerCase() == "stop") {
            // if (start) {
            //     logger.log("[!] Warning: Server has not started. [!]", LogColor.Green, LogType.Debug);
            // }
            // else if (stop) {
            //     stop();
            // }
            // else {
            //     logger.log("[!] Warning: Server is already stopping. [!]", LogColor.Green, LogType.Debug);
            // }
            process.exit(0);
            return;
        }
        else if (input.toLowerCase() == "copyright-details") {
            logger.debug("┌───────────────────────────────────────────────────────────────────────┐");
            logger.debug("│   \x1b[1m\x1b[35mMeadow Guarder\x1b[0m                                                      │");
            logger.debug("│   \x1b[1m\x1b[34mCopyright (C) 2025 Maitian Sha       \x1b[0m                               │");
            logger.debug("├───────────────────────────────────────────────────────────────────────┤");
            logger.debug("│ You are free to:                                                      │");
            logger.debug("│                                                                       │");
            logger.debug("│ Share — copy and redistribute the material in any medium or format    │");
            logger.debug("│                                                                       │");
            logger.debug("│ Adapt — remix, transform, and build upon the material                 │");
            logger.debug("│                                                                       │");
            logger.debug("│ The licensor cannot revoke these freedoms as long as you follow the   │");
            logger.debug("│ license terms.                                                        │");
            logger.debug("│                                                                       │");
            logger.debug("│ Attribution — You must give appropriate credit, provide a link to the │");
            logger.debug("│ license, and indicate if changes were made. You may do so in any      │");
            logger.debug("│ reasonable manner, but not in any way that suggests the licensor      │");
            logger.debug("│ endorses you or your use.                                             │");
            logger.debug("│                                                                       │");
            logger.debug("│ NonCommercial — You may not use the material for commercial purposes. │");
            logger.debug("│                                                                       │");
            logger.debug("│ No additional restrictions — You may not apply legal terms or         │");
            logger.debug("│ technological measures that legally restrict others from doing        │");
            logger.debug("│ anything the license permits.                                         │");
            logger.debug("│                                                                       │");
            logger.debug("│ Notices:                                                              │");
            logger.debug("│ You do not have to comply with the license for elements of the        │");
            logger.debug("│ material in the public domain or where your use is permitted by an    │");
            logger.debug("│ applicable exception or limitation. No warranties are given. The      │");
            logger.debug("│ license may not give you all of the permissions necessary for your    │");
            logger.debug("│ intended use. For example, other rights such as publicity, privacy,   │");
            logger.debug("│ or moral rights may limit how you use the material.                   │");
            logger.debug("└───────────────────────────────────────────────────────────────────────┘");
            return;
        }
        else if (input == "colortest") {
            logger.debug("\x1b[0m█ \x1b[0m\x1b[1m█ \x1b[0m");
            logger.debug("\x1b[30m\x1b[40m█ \x1b[0m\x1b[90m\x1b[100m█ \x1b[0m");
            logger.debug("\x1b[31m\x1b[41m█ \x1b[0m\x1b[91m\x1b[101m█ \x1b[0m");
            logger.debug("\x1b[32m\x1b[42m█ \x1b[0m\x1b[92m\x1b[102m█ \x1b[0m");
            logger.debug("\x1b[33m\x1b[43m█ \x1b[0m\x1b[93m\x1b[103m█ \x1b[0m");
            logger.debug("\x1b[34m\x1b[44m█ \x1b[0m\x1b[94m\x1b[104m█ \x1b[0m");
            logger.debug("\x1b[35m\x1b[45m█ \x1b[0m\x1b[95m\x1b[105m█ \x1b[0m");
            logger.debug("\x1b[36m\x1b[46m█ \x1b[0m\x1b[96m\x1b[106m█ \x1b[0m");
            logger.debug("\x1b[37m\x1b[47m█ \x1b[0m\x1b[97m\x1b[107m█ \x1b[0m");
            return;
        }
        // if (input.indexOf("/") == 0) {
        //     try {
        //         let command = input.substring(1).split(" ").shift();
        //         logger.writeLog(logger.getTimeStamp() + "SERVER: " + input, "debug");
        //         if (commands[command]) {
        //             try {
        //                 let result = commands[command](input.substring(command.length + 2));
        //                 if (result != null) {
        //                     result = result.toString();
        //                 }
        //                 log(result, LogColor.Green, LogType.Debug);
        //             }
        //             catch (err) {
        //                 error(err);
        //             }
        //         }
        //         else {
        //             error("/" + command + " is not an existing command. Try /help for a list of commands.");
        //         }
        //     }
        //     catch (err: any) {
        //         logger.error(err);
        //     }
        // }
        // else {
        try {
            logger.writeLog(logger.getTimeStamp() + "[Console]: " + input);
            let result = eval(input);
            if (result == null) {
                result = "Successfully executed command";
            }
            else {
                result = result.toString();
            }
            logger.log(result, LogColor.Green, LogType.Debug);
        }
        catch (err: any) {
            logger.error(err);
        }
        // }
    }
    else if (input == "") {
        process.stdout.write("\r \x1b[1A\x1b[1C");
    }
});
prompt.on("close", async function() {
    if (process.env.PORT == null) {
        logger.info("[Server] Process exited with exit code 0");
        // database.save();
        await logger.awaitLogs();
        process.exit(0);
    }
});
// process.stdout.write("\r \x1b[1A\x1b[1C");

export { logger };