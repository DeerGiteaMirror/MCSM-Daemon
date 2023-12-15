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
                    // wait unitl process is started
                    while (!this.instance.process.pid) {
                        await new Promise<void>((ok) => {
                            setTimeout(ok, 2000);
                        });
                    }
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
                    do {
                        // if stop faild and instance returning to running status try to kill it
                        await new Promise<void>((ok) => {
                            setTimeout(ok, 2000);
                        });
                        if (this.instance.instanceStatus === Instance.STATUS_RUNNING) {
                            await this.instance.execPreset("kill", "OnDemandRunner");
                        }
                    } while (this.instance.instanceStatus !== Instance.STATUS_STOP);
                    this.instance.instanceStatus = Instance.STATUS_SLEEPING;
                    this.instance.println("INFO", $t("on_demand.instanceSleeping"));
                    // create socket server on every port
                    // if any one socket server has a connection, 
                    // close all socket servers and start instance
                    await new Promise<void>((ok) => {
                        const net = require('net');
                        for (const port of this.ports) {
                            const server = net.createServer();
                            server.listen(port.port);
                            logger.info(`${this.instance.instanceUuid} socket listing on `, port.port);
                            server.on('connection', (socket: any) => {
                                socket.destroy();
                                ok();
                            });
                            this.socketServers.push(server);
                        }
                    });
                    // clear socket servers
                    this.socketServers.forEach((server: any) => {
                        server.close();
                    });
                    this.socketServers = new Array();
                    // start instance
                    logger.info(`${this.instance.instanceUuid} `, $t("on_demand.playerConnected"));
                    this.instance.println("INFO", $t("on_demand.playerConnected"));
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

    public isRunning() {
        return this.running;
    }

}