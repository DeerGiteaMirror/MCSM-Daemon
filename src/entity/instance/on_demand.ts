import Instance from "./instance";
import logger from "../../service/log";
import { $t } from "../../i18n";
import { getProcessListeningTcpPort } from "../../common/net_tools"
import { NetworkPort } from "../../common/net_tools"
import EventEmitter from "events";
import { log } from "console";

export class OnDemandRunner {
    public readonly STATUS_STOP = -1;
    public readonly STATUS_RUNNING = 0;
    public readonly STATUS_PROXY_LISTENING = 1

    private instance: Instance;
    private status: number = this.STATUS_STOP;
    private socketServers: any[] = new Array();
    private count: number = 0;
    private ports: NetworkPort[];
    private eventEmitter = new EventEmitter();
    private interval: any;

    constructor(instance: Instance) {
        this.instance = instance;
        this.eventEmitter.on("noConnection", () => {
            this.onNoConnection();
        });
        this.eventEmitter.on("connectionIncoming", () => {
            this.onConnectionIncoming();
        });
        this.interval = this.intervalCheckConnectionStatus();
    }

    public async run() {
        logger.info(`${this.instance.instanceUuid} `, $t("on_demand.start"));
        this.instance.println("INFO", $t("on_demand.start"));
        this.instance.execPreset("start", "OnDemandRunner");
        this.status = this.STATUS_RUNNING;
    }

    public stop() {
        logger.info(`${this.instance.instanceUuid} `, $t("on_demand.stop"));
        this.instance.println("INFO", $t("on_demand.stop"));
        if (this.instance.instanceStatus === Instance.STATUS_RUNNING) {
            this.instance.execPreset("stop", "OnDemandRunner");
        }
        this.status = this.STATUS_STOP;
        for (const server of this.socketServers) {
            server.close();
        }
        this.socketServers = new Array();
        clearInterval(this.interval);
        this.instance.instanceStatus = Instance.STATUS_STOP;
    }

    public isRunning() {
        return this.status !== this.STATUS_STOP;
    }

    private anyConnectionEstablished(): boolean {
        // check if network is actived
        this.ports = getProcessListeningTcpPort(this.instance.process.pid);
        var established = false;
        // if no tcp port is established, guess the instance is udp or other process
        // consider it is established so that the instance will not be stopped
        if (this.ports.length === 0) return true;
        for (const port of this.ports) {
            if (port.established) {
                established = true;
                break;
            }
        }
        return established;
    }

    private intervalCheckConnectionStatus() {
        return setInterval(() => {
            if (this.status !== this.STATUS_RUNNING ||
                !this.instance.process ||
                this.instance.instanceStatus !== Instance.STATUS_RUNNING) return;
            if (!this.anyConnectionEstablished()) {
                this.count++;
            } else {
                this.count = 0;
            }
            if (this.count > 1) {
                this.eventEmitter.emit("noConnection");
                this.count = 0;
            }
        }, 1000 * 60);
    }

    private async onNoConnection() {
        logger.info(`${this.instance.instanceUuid} `, $t("on_demand.over30minClose"));
        this.instance.println("INFO", $t("on_demand.over30minClose"));
        this.instance.execPreset("stop", "OnDemandRunner");
        let max_try = 3;
        while (true) {
            if (max_try <= 0) break;
            await new Promise(resolve => setTimeout(resolve, 1000 * 10));
            if (this.instance.instanceStatus != Instance.STATUS_STOP) {
                this.instance.execPreset("kill", "OnDemandRunner");
            } else {
                break;
            }
            max_try--;
        }
        if (max_try <= 0) {
            logger.error(`${this.instance.instanceUuid} cant kill instance`);
            this.stop();
            return;
        }
        this.instance.instanceStatus = Instance.STATUS_SLEEPING;
        this.status = this.STATUS_PROXY_LISTENING;
        const net = require("net");
        for (const port of this.ports) {
            const server = net.createServer();
            server.listen(port.port, () => {
                logger.info(`${this.instance.instanceUuid} socket server listening on port ${port.port}`);
            });
            server.on("connection", (socket: any) => {
                this.eventEmitter.emit("connectionIncoming");
            });
            this.socketServers.push(server);
        }
        logger.info(`${this.instance.instanceUuid} `, $t("on_demand.instanceSleeping"));
        this.instance.println("INFO", $t("on_demand.instanceSleeping"));
    }

    private onConnectionIncoming() {
        logger.info(`${this.instance.instanceUuid} `, $t("on_demand.playerConnected"));
        this.instance.println("INFO", $t("on_demand.playerConnected"));
        this.status = this.STATUS_RUNNING;
        for (const server of this.socketServers) {
            server.close();
        }
        this.socketServers = new Array();
        this.instance.execPreset("start", "OnDemandRunner");
    }
}