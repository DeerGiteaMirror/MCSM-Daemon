import Instance from "./instance";
import logger from "../../service/log";
import { $t } from "../../i18n";

export class OnDemandRunner {

    private instance: Instance;
    private running = false;
    private socketServer: any = null;
    private count: number;

    constructor(instance: Instance) {
        this.instance = instance;
    }

    public async run(port: number) {
        logger.info(`${this.instance.instanceUuid} `, $t("on_demand.start"));
        this.instance.println("INFO", $t("on_demand.start"));
        this.running = true;
        return new Promise<void>(async (resolve, reject) => {
            try {
                while (this.running) {
                    this.instance.execPreset("start", "OnDemandRunner");
                    if (port <= 0 || this.instance.config.pingConfig.ip === "") {
                        logger.warn(`${this.instance.instanceUuid} `, $t("on_demand.startInstance"));
                        this.running = false;
                        break;
                    }
                    this.count = 0;
                    while (this.running) {
                        // waiting for 1 min
                        await new Promise<void>((ok) => {
                            setTimeout(ok, 1000 * 60);
                        });
                        // check if player online
                        const playerCount = this.instance.info.currentPlayers;
                        if (playerCount > 0) {
                            this.count = 0;
                            continue;
                        }
                        this.count++;
                        if (this.count >= 30) {
                            break;
                        }
                    }
                    if (!this.running) {
                        break;
                    }
                    // stop instance after 30 min no player
                    logger.info(`${this.instance.instanceUuid} `, $t("on_demand.over30minClose"));
                    this.instance.println("INFO", $t("on_demand.over30minClose"));
                    await this.instance.execPreset("stop", "OnDemandRunner");

                    // waiting for instance stop
                    while (this.instance.instanceStatus !== Instance.STATUS_STOP) {
                        // if stop faild and instance returning to running status try to kill it
                        if (this.instance.instanceStatus === Instance.STATUS_RUNNING) {
                            await this.instance.execPreset("kill", "OnDemandRunner");
                        }
                        await new Promise<void>((ok) => {
                            setTimeout(ok, 2000);
                        });
                    }

                    this.instance.instanceStatus = Instance.STATUS_SLEEPING;
                    this.instance.println("INFO", $t("on_demand.instanceSleeping"));
                    // create socket server
                    this.socketServer = this.startSocketServer(port);
                    // waiting for player connect then close socket server
                    await new Promise<void>((ok, reject) => {
                        this.socketServer.on('close', () => {
                            ok();
                        });
                        this.socketServer.on('error', (error: any) => {
                            reject(error);
                        });
                    });
                    this.socketServer = null;
                }
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    public stop() {
        this.running = false;
        if (this.socketServer) {
            this.socketServer.close();
        }
        if (this.instance.instanceStatus === Instance.STATUS_RUNNING) {
            this.instance.execPreset("stop", "OnDemandRunner");
        }
        this.instance.stopped();
        this.instance.println("INFO", $t("on_demand.stop"));
        logger.info(`${this.instance.instanceUuid} `, $t("on_demand.stop"));
    }

    private startSocketServer(port: number) {
        // start a socket server to listen on port
        const net = require('net');
        const server = net.createServer();
        server.on('connection', (socket: any) => {
            // close socket after connect
            socket.end();
            this.socketServer.close();
        });
        server.listen(port, () => {
            logger.info(`${this.instance.instanceUuid} Socket server is listening on port ${port}`);
        });
        return server;
    }

    public isRunning() {
        return this.running;
    }

}