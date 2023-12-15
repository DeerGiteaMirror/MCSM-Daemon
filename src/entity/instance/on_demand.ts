import Instance from "./instance";
import logger from "../../service/log";
import { $t } from "../../i18n";
import { getProcessListeningTcpPort } from "../../common/net_tools"
import { NetworkPort } from "../../common/net_tools"

export class OnDemandRunner {

    private instance: Instance;
    private running = false;
    private socketServers: any[] = new Array();
    private count: number;
    private ports: NetworkPort[];

    constructor(instance: Instance) {
        this.instance = instance;
    }

    public async run() {
        logger.info(`${this.instance.instanceUuid} `, $t("on_demand.start"));
        this.instance.println("INFO", $t("on_demand.start"));
        this.running = true;
        return new Promise<void>(async (resolve, reject) => {
            try {
                while (this.running) {
                    this.instance.execPreset("start", "OnDemandRunner");
                    this.count = 0;
                    while (this.running) {
                        // waiting for 1 min
                        await new Promise<void>((ok) => {
                            setTimeout(ok, 1000 * 60);
                        });
                        // check if network is actived
                        this.ports = getProcessListeningTcpPort(this.instance.process.pid);
                        var established = false;
                        // if no tcp port is established, guess the instance is udp or other process
                        // consider it is established so that the instance will not be stopped
                        if (this.ports.length === 0) established = true;
                        for (const port of this.ports) {
                            if (port.established) {
                                established = true;
                                break;
                            }
                        }
                        if (established) {
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
                        await new Promise<void>((ok) => {
                            setTimeout(ok, 2000);
                        });
                        if (this.instance.instanceStatus === Instance.STATUS_RUNNING) {
                            await this.instance.execPreset("kill", "OnDemandRunner");
                        }
                    }
                    this.instance.instanceStatus = Instance.STATUS_SLEEPING;
                    this.instance.println("INFO", $t("on_demand.instanceSleeping"));
                    // create socket server
                    for (const port of this.ports) {
                        const socketServer = this.startSocketServer(port.port);
                        this.socketServers.push(socketServer);
                    }
                    // if any one socket server has a connection, close all socket servers and start instance
                    await new Promise<void>((ok) => {
                        for (const socketServer of this.socketServers) {
                            socketServer.on("connection", (socket: any) => {
                                for (const socketServer of this.socketServers) {
                                    socketServer.close();
                                }
                                ok();
                            });
                        }
                    });
                    logger.info(`${this.instance.instanceUuid} `, $t("on_demand.playerConnected"));
                    this.instance.println("INFO", $t("on_demand.playerConnected"));
                    // clear socket servers
                    this.socketServers = new Array();
                }
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    public stop() {
        this.running = false;
        if (this.socketServers.length > 0) {
            for (const socketServer of this.socketServers) {
                socketServer.close();
            }
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
        server.listen(port, () => {
            logger.info(`${this.instance.instanceUuid} Socket server is listening on port ${port}`);
        });
        return server;
    }

    public isRunning() {
        return this.running;
    }

}