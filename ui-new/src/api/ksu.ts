import { exec, spawn, moduleInfo } from 'kernelsu';

export class KsuApi {
  private static debug = false;

  private static ztPath = "/data/adb/zerotier";
  static setDebug(enabled: boolean) {
    this.debug = enabled;
    if (enabled) {
      console.log("[KSU] Debug mode enabled");
    }
  }

  static getDebug(): boolean {
    return this.debug;
  }

  static async getModuleInfo(): Promise<any> {
    try {
      // @ts-ignore
      if (typeof ksu !== 'undefined') {
        let info = await moduleInfo();
        if (typeof info === 'string') {
          try {
            info = JSON.parse(info);
          } catch (e) {
            console.error("[KSU] Failed to parse module info JSON", e);
          }
        }
        if (this.debug) console.log("[KSU] Module Info:", info);
        return info;
      } else {
        return {
          versionOfModule: "1.0.0 (Mock)",
          versionCode: 100,
          author: "Mock Author",
          description: "Mock Description"
        };
      }
    } catch (e) {
      console.error("[KSU] Failed to get module info", e);
      return {};
    }
  }

  static async exec(cmd: string): Promise<string> {
    try {
      // @ts-ignore
      if (typeof ksu !== 'undefined') {
        if (this.debug) console.log(`[KSU] >>> Executing: ${cmd}`);
        const { errno, stdout, stderr } = await exec(cmd);
        if (errno === 0) {
          if (this.debug) console.log(`[KSU] <<< Output (${cmd}):`, stdout);
          return stdout;
        } else {
          // Handle specific case where service is stopped and api.sh returns "{}" on stderr
          if (stderr && stderr.trim() === "{}") {
            if (this.debug) console.log(`[KSU] <<< Service Stopped ({})`);
            return "{}";
          }
          console.error(`[KSU] Command failed: ${cmd}`, stderr);
          throw new Error(stderr || `Command failed with errno ${errno}`);
        }
      } else {
        if (this.debug) console.log(`[Mock] >>> Executing: ${cmd}`);
        const res = await KsuApi.mockExec(cmd);
        if (this.debug) console.log(`[Mock] <<< Output (${cmd}):`, res);
        return res;
      }
    } catch (error) {
      console.error(`[KSU] Error executing ${cmd}:`, error);
      throw error;
    }
  }

  static async spawn(cmd: string, args: string[]): Promise<any> {
    try {
      // @ts-ignore
      if (typeof ksu !== 'undefined') {
        if (this.debug) console.log(`[KSU] >>> Spawning: ${cmd} ${args.join(' ')}`);
        // @ts-ignore
        const child = spawn(cmd, args);
        return child;
      } else {
        if (this.debug) console.log(`[Mock] >>> Spawning: ${cmd} ${args.join(' ')}`);
        return {
          on: (event: string, callback: (data: any) => void) => {
            if (event === 'exit') setTimeout(() => callback(0), 100);
          },
          stdin: { write: () => { } },
          stdout: { on: () => { } },
          stderr: { on: () => { } },
          kill: () => { }
        };
      }
    } catch (error) {
      console.error(`[KSU] Error spawning ${cmd}:`, error);
      throw error;
    }
  }

  static async getSystemStatus(): Promise<any> {
    const res = await this.exec(`sh /data/adb/modules/ZeroTierForKSU/zerotier.sh status`);
    try {
      const status = JSON.parse(res);
      if (this.debug) console.log("[KSU] Parsed Status:", status);

      // Handle empty object response
      if (Object.keys(status).length === 0) {
        console.warn("[KSU] Status returned empty object, returning default stopped state");
        return {
          enable: "",
          branch: "main",
          firewall: false,
          autoStart: false,
          apiToken: "",
          uninstallKeep: false,
          routerRuleNew: 1,
          cliStatus: ""
        };
      }
      return status;
    } catch (e) {
      console.error("Failed to parse status JSON", e);
      return {};
    }
  }

  static async toggleAutoStart(enabled: boolean): Promise<void> {
    const cmd = enabled
      ? `rm ${this.ztPath}/MANUAL`
      : `touch ${this.ztPath}/MANUAL`;
    await this.exec(cmd);
  }

  static async toggleKeepData(enabled: boolean): Promise<void> {
    const cmd = enabled
      ? `touch ${this.ztPath}/KEEP_ON_UNINSTALL`
      : `rm ${this.ztPath}/KEEP_ON_UNINSTALL`;
    await this.exec(cmd);
  }

  static async toggleFirewall(enabled: boolean): Promise<void> {
    const action = enabled ? "A" : "D";
    await this.exec(`sh /data/adb/modules/ZeroTierForKSU/api.sh local firewall ${action}`);
  }

  static async switchChannel(channel: 'main' | 'dev'): Promise<void> {
    await this.exec(`sh /data/adb/modules/ZeroTierForKSU/zerotier.sh switch ${channel}`);
  }

  static async toggleCustomRouting(enabled: boolean): Promise<void> {
    const cmd = enabled
      ? `touch ${this.ztPath}/rule_new`
      : `rm ${this.ztPath}/rule_new`;
    await this.exec(cmd);
  }

  static async orbit(moonId: string): Promise<void> {
    await this.exec(`sh /data/adb/modules/ZeroTierForKSU/api.sh local orbit ${moonId}`);
  }

  static async updateApiToken(token: string): Promise<void> {
    await this.exec(`sh /data/adb/modules/ZeroTierForKSU/api.sh apiToken update "${token}"`);
  }

  static async openUrl(url: string): Promise<void> {
    await this.exec(`am start -a android.intent.action.VIEW -d "${url}"`);
  }

  private static mockRunning = true;

  private static mockExec(cmd: string): Promise<string> {
    // Mock responses for development without KSU
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (cmd.includes('zerotier.sh status')) {
          resolve(JSON.stringify({
            enable: KsuApi.mockRunning ? "1234" : "",
            branch: "main",
            firewall: true,
            autoStart: true,
            apiToken: "mock_api_token_12345",
            uninstallKeep: false,
            routerRuleNew: 1,
            cliStatus: KsuApi.mockRunning ? "200 info a1b2c3d4e5 1.10.6 ONLINE" : ""
          }));
        } else if (cmd.includes('zerotier.sh switch')) {
          resolve("Switched channel");
        } else if (cmd.includes('api.sh local firewall')) {
          resolve("Firewall updated");
        } else if (cmd.includes('api.sh apiToken update')) {
          resolve("Token updated");
        } else if (cmd.includes('rm /data/adb/zerotier/MANUAL') || cmd.includes('touch /data/adb/zerotier/MANUAL')) {
          resolve("Auto start updated");
        } else if (cmd.includes('rm /data/adb/zerotier/KEEP_ON_UNINSTALL') || cmd.includes('touch /data/adb/zerotier/KEEP_ON_UNINSTALL')) {
          resolve("Keep data updated");
        } else if (cmd.includes('api.sh local orbit')) {
          resolve("Orbit/Moon joined");
        } else if (cmd.includes('zerotier-one -d')) {
          // Start service
          KsuApi.mockRunning = true;
          resolve("Service started");
        } else if (cmd.includes('api.sh local service stop') || cmd.includes('kill')) {
          // Stop service
          KsuApi.mockRunning = false;
          resolve("Service stopped");
        } else if (cmd.includes('status')) {
          // api.sh status / local status
          if (!KsuApi.mockRunning) {
            // Return empty or offline if service is stopped
            resolve(JSON.stringify({ online: false }));
          } else {
            resolve(JSON.stringify({
              "address": "a1b2c3d4e5",
              "clock": 1690000000000,
              "config": {
                "settings": {
                  "primaryPort": 9993
                }
              },
              "online": true,
              "planetWorldId": 1234567890,
              "planetWorldTimestamp": 1690000000000,
              "publicIdentity": "a1b2c3d4e5:0:mock_public_key",
              "tcpFallbackActive": false,
              "version": "1.10.6",
              "versionBuild": 0,
              "versionMajor": 1,
              "versionMinor": 10,
              "versionRev": 6
            }));
          }
        } else if (cmd.includes('network list')) {
          if (!KsuApi.mockRunning) {
            resolve("[]");
            return;
          }
          if (cmd.includes('central')) {

            // central network list mock
            resolve(JSON.stringify([
              {
                id: "8056c2e21c000001",
                config: { name: "Mock Central Network 1", private: true, routes: [{ target: "10.0.0.0/24" }] },
                status: "OK",
                type: "PRIVATE",
                allowManaged: true,
                allowGlobal: false,
                allowDefault: false,
                allowDNS: false,
                onlineMemberCount: 5,
                authorizedMemberCount: 10,
                totalMemberCount: 12
              }
            ]));
          } else {
            // local network list mock
            resolve(JSON.stringify([
              {
                id: "8056c2e21c000001",
                name: "Mock Network 1",
                mac: "00:11:22:33:44:55",
                status: "OK",
                type: "PRIVATE",
                allowManaged: true,
                allowGlobal: false,
                allowDefault: false,
                allowDNS: false,
                portDeviceName: "zt0",
                assignedAddresses: ["10.147.17.1/24"]
              },
              {
                id: "8056c2e21c000002",
                name: "Mock Network 2",
                mac: "00:11:22:33:44:66",
                status: "ACCESS_DENIED",
                type: "SCALABLE",
                allowManaged: true,
                allowGlobal: false,
                allowDefault: false,
                allowDNS: false,
                portDeviceName: "zt1",
                assignedAddresses: []
              }
            ]));
          }
        } else if (cmd.includes('member list')) {
          resolve(JSON.stringify([
            {
              nodeId: "a1b2c3d4e5",
              networkId: "8056c2e21c000001",
              online: true,
              lastOnline: 1690000000000,
              physicalAddress: "1.2.3.4",
              clientVersion: "1.10.6",
              name: "My Phone",
              description: "Pixel 7 Pro",
              config: {
                authorized: true,
                ipAssignments: ["10.0.0.1"]
              }
            },
            {
              nodeId: "deadbeef00",
              networkId: "8056c2e21c000001",
              online: false,
              lastOnline: 1680000000000,
              physicalAddress: "5.6.7.8",
              clientVersion: "1.10.5",
              name: "Laptop",
              description: "MacBook Pro",
              config: {
                authorized: true,
                ipAssignments: ["10.0.0.2"]
              }
            },
            {
              nodeId: "cafebabe11",
              networkId: "8056c2e21c000001",
              online: true,
              lastOnline: 1690010000000,
              physicalAddress: "9.10.11.12",
              clientVersion: "1.10.6",
              name: "Unauthorized Node",
              description: "Pending approval",
              config: {
                authorized: false,
                ipAssignments: []
              }
            }
          ]));
        } else if (cmd.includes('peer list')) {
          resolve(JSON.stringify([
            {
              "address": "cafe000001",
              "version": "1.10.6",
              "role": "PLANET",
              "latency": 25,
              "paths": [
                { "address": "1.2.3.4/9993", "lastSend": 1000, "lastReceive": Date.now() - 5000, "active": true, "preferred": true },
                { "address": "1.2.3.4/9993", "lastSend": 1000, "lastReceive": Date.now() - 6000, "active": true, "preferred": true }
              ]
            },
            {
              "address": "babe000002",
              "version": "1.10.5",
              "role": "LEAF",
              "latency": 150,
              "paths": [
                { "address": "5.6.7.8/9993", "lastSend": 5000, "lastReceive": 4500, "active": true, "preferred": false }
              ]
            },
            {
              "address": "moon000003",
              "version": "1.10.6",
              "role": "MOON",
              "latency": 10,
              "paths": [
                { "address": "9.9.9.9/9993", "lastSend": 200, "lastReceive": 100, "active": true, "preferred": true },
                { "address": "2400:2400:2400:2400:2400:2400:2400:2400/9993", "lastSend": 200, "lastReceive": 100, "active": true, "preferred": false }
              ]
            }
          ]));
        } else if (cmd.includes('apiToken show')) {
          resolve('mock_api_token_12345');
        }
        else {
          resolve('');
        }
      }, 500);
    });
  }
}
