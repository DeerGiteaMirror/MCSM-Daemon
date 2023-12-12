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
        logger.info(`${this.instance.instanceUuid} OnDemandRunner started.`);
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
                        // 等待 1 分钟
                        await new Promise<void>((ok) => {
                            setTimeout(ok, 1000 * 60);
                        });
                        // todo 检查玩家数量
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
                    // 关闭服务器 over30minClose
                    logger.info(`${this.instance.instanceUuid} `, $t("on_demand.over30minClose"));
                    this.instance.println("INFO", $t("on_demand.over30minClose"));
                    await this.instance.execPreset("stop", "OnDemandRunner");

                    // 等待服务器状态变为停止
                    while (this.instance.instanceStatus !== Instance.STATUS_STOP) {
                        await new Promise<void>((ok) => {
                            setTimeout(ok, 1000);
                        });
                    }

                    this.instance.instanceStatus = Instance.STATUS_SLEEPING;
                    this.instance.println("INFO", $t("on_demand.instanceSleeping"));
                    // 启动 socket 服务器
                    this.socketServer = this.startSocketServer(port);
                    // 等待 socket 服务器关闭
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
    }

    private startSocketServer(port: number) {
        // 启动一个 socket 服务器，用于接收请求
        const net = require('net');
        const server = net.createServer();
        server.on('connection', (socket: any) => {
            // 关闭 socket 服务器
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