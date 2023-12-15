import Instance from "./instance";
import logger from "../../service/log";
import { $t } from "../../i18n";
import { getProcessListeningTcpPort } from "../../common/net_tools"
import { NetworkPort } from "../../common/net_tools"
import EventEmitter from "events";

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
        this.status = this.STATUS_RUNNING;
        // this.instance.execPreset("start", "OnDemandRunner");
        
    }

    public stop() {
        this.eventEmitter.emit("stop");
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
        if (this.ports.length === 0) established = true;
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
            if (this.status !== this.STATUS_RUNNING) return;
            if (!this.anyConnectionEstablished()) {
                this.count++;
            } else {
                this.count = 0;
            }
            if (this.count > 30) {
                this.eventEmitter.emit("noConnection");
                this.count = 0;
            }
        }, 1000 * 60);
    }

    private onNoConnection() {
        this.status = this.STATUS_PROXY_LISTENING;
    }

    private onConnectionIncoming() {
        this.status = this.STATUS_RUNNING;
    }
}