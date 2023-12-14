
import { ChildProcess, exec, execSync, SpawnOptionsWithoutStdio } from "child_process";
import os from "os";
import logger from "../service/log";

export class NetworkPort {
    static readonly PROTO_TCP = "tcp";
    static readonly PROTO_UDP = "udp";
    static readonly STATE_LISTEN = "LISTEN";
    static readonly STATE_ESTABLISHED = "ESTABLISHED";

    public pid: number | string;
    public port: number;
    public protocol: string;
    public established: boolean = false;
    public state: string = "";
};

export function getProcessListeningTcpPort(pid: number | string): NetworkPort[] {
    var result: NetworkPort[] = [];
    try {
        if (typeof pid === "string") {
            // get docker port
            result = getLinstenTcpPortDocker(pid);
            if (os.platform() === "win32") {
                return portEstablishedWin32(result);
            }
            if (os.platform() === "linux") {
                return portEstablishedLinux(result);
            }
            if (os.platform() === "darwin") {
                return portEstablishedDarwin(result);
            }
        } else {
            if (os.platform() === "win32") {
                result = getListenTcpPortWin32(pid);
                return portEstablishedWin32(result);
            }
            if (os.platform() === "linux") {
                result = getLinstenTcpPortLinux(pid);
                return portEstablishedLinux(result);
            }
            if (os.platform() === "darwin") {
                result = getLinstenTcpPortDarwin(pid);
                return portEstablishedDarwin(result);
            }
        }
    } catch (err) {
        return result;
    }
}

function portEstablishedWin32(ports: NetworkPort[]): NetworkPort[] {
    for (const port of ports) {
        const out = execSync(`netstat -ano | findstr ${port.port}`).toString();
        const lines = out.split("\n");
        for (const line of lines) {
            const line_arr = line.split(/\s+/);
            if (line_arr[0].startsWith("TCP") && line_arr[3] === NetworkPort.STATE_ESTABLISHED) {
                port.established = true;
                break;
            }
        }
    }
    return ports;
}

function portEstablishedLinux(ports: NetworkPort[]): NetworkPort[] {
    for (const port of ports) {
        const out = execSync(`netstat -tunap | grep ${port.port}`).toString();
        const lines = out.split("\n");
        for (const line of lines) {
            const line_arr = line.split(/\s+/);
            if (line_arr[0].startsWith("tcp") && line_arr[5] === NetworkPort.STATE_ESTABLISHED) {
                port.established = true;
                break;
            }
        }
    }
    return ports;
}

function portEstablishedDarwin(ports: NetworkPort[]): NetworkPort[] {
    for (const port of ports) {
        const out = execSync(`netstat -anvp tcp | grep ${port.port}`).toString();
        const lines = out.split("\n");
        for (const line of lines) {
            const line_arr = line.split(/\s+/);
            if (line_arr[0].startsWith("tcp") && line_arr[5] === NetworkPort.STATE_ESTABLISHED) {
                port.established = true;
                break;
            }
        }
    }
    return ports;
}

function getListenTcpPortWin32(pid: number): NetworkPort[] {
    const result: NetworkPort[] = [];
    const output = execSync(`netstat -ano | findstr ${pid}`).toString();
    const lines = output.split("\n");
    // TCP
    //   Proto  Local Address          Foreign Address        State           PID
    for (const line of lines) {
        const line_arr = line.split(/\s+/);
        const port = new NetworkPort();
        if (line_arr[0].startsWith("TCP")) {
            port.protocol = NetworkPort.PROTO_TCP;
            port.pid = pid;
            port.port = parseInt(line_arr[2].split(":")[1]);
            port.state = line_arr[3];
            result.push(port);
        }
    }
    return result;
}

function getLinstenTcpPortLinux(pid: number): NetworkPort[] {
    const result: NetworkPort[] = [];
    const output = execSync(`netstat -tunap | grep ${pid}`).toString();
    const lines = output.split("\n");
    // tcp6       0      0 :::25566                :::*                    LISTEN      356801/java17       
    // tcp6       0      0 :::8100                 :::*                    LISTEN      356801/java17       
    // tcp6       0      0 172.17.0.1:59380        172.17.0.1:3306         ESTABLISHED 356801/java17 
    // udp6       0      0 :::24454                :::*                                356801/java17
    for (const line of lines) {
        const line_arr = line.split(/\s+/);
        const port = new NetworkPort();
        //      todo cant be sure if udp is established or not
        //      ignore udp for now
        // if (line_arr[0].startsWith("udp")) {
        //     port.protocol = NetworkPort.PROTO_UDP;
        //     port.pid = pid;
        //     port.port = parseInt(line_arr[3].split(":")[1]);
        //     port.established = true;
        //     result.push(port);
        // }
        if (line_arr[0].startsWith("tcp") && line_arr[5] === NetworkPort.STATE_LISTEN) {
            port.protocol = NetworkPort.PROTO_TCP;
            port.pid = pid;
            port.port = parseInt(line_arr[3].split(":")[1]);
            port.state = NetworkPort.STATE_LISTEN
            result.push(port);
        }
    }
    return result;
}

function getLinstenTcpPortDarwin(pid: number): NetworkPort[] {
    const result: NetworkPort[] = [];
    const output_tcp = execSync(`netstat -anvp tcp | grep ${pid}`).toString();
    // const output_udp = execSync(`netstat -anvp udp | grep ${pid}`).toString();
    const lines_tcp = output_tcp.split("\n");
    // const lines_udp = output_udp.split("\n");
    var lines = lines_tcp;
    // lines = lines.concat(lines_udp);
    // tcp4  0  0  192.168.164.249.58226  117.89.177.97.80       ESTABLISHED  262144  132432   2030      0 00102 00000000 0000000000c688a7 00000080 00000900    1    0 000001
    for (const line of lines) {
        const line_arr = line.split(/\s+/);
        const port = new NetworkPort();
        if (line_arr[0].startsWith("tcp") && line_arr[5] === NetworkPort.STATE_LISTEN) {
            port.protocol = NetworkPort.PROTO_TCP;
            port.pid = pid;
            port.port = parseInt(line_arr[3].split(".").pop());
            port.state = NetworkPort.STATE_LISTEN
            result.push(port);
        }
    }
    return result;
}

function getLinstenTcpPortDocker(pid: string): NetworkPort[] {
    const result: NetworkPort[] = [];
    const output = execSync(`docker port ${pid}`).toString();
    const lines = output.split("\n");
    // 8012/tcp -> 0.0.0.0:8012
    for (const line of lines) {
        const line_arr = line.split(/\s+/);
        if (line_arr[0].split("/")[1] === "tcp") continue;
        const port = new NetworkPort();
        port.protocol = NetworkPort.PROTO_TCP;
        port.pid = pid;
        port.port = parseInt(line_arr[0].split("/")[0]);
        port.state = NetworkPort.STATE_LISTEN
        result.push(port);
    }
    return result;
}