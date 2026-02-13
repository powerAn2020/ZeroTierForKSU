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
        if (import.meta.env.DEV) {
          const { KsuApiMock } = await import('./ksu.mock');
          return KsuApiMock.getModuleInfo();
        }
        return {};
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
        if (import.meta.env.DEV) {
          if (this.debug) console.log(`[Mock] >>> Executing: ${cmd}`);
          const { KsuApiMock } = await import('./ksu.mock');
          const res = await KsuApiMock.exec(cmd);
          if (this.debug) console.log(`[Mock] <<< Output (${cmd}):`, res);
          return res;
        }
        return "";
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
        if (import.meta.env.DEV) {
          if (this.debug) console.log(`[Mock] >>> Spawning: ${cmd} ${args.join(' ')}`);
          const { KsuApiMock } = await import('./ksu.mock');
          return KsuApiMock.spawn(cmd, args);
        }
        return null;
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
      ? `touch ${this.ztPath}/state/rule_new`
      : `rm ${this.ztPath}/state/rule_new`;
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


}
