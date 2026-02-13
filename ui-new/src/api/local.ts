import { KsuApi } from './ksu';
import type { LocalNetwork, ZeroTierStatus } from '@/types/zerotier';

const MODDIR = '/data/adb/modules/ZeroTierForKSU';

export class LocalApi {

  static async getStatus(): Promise<ZeroTierStatus> {
    const res = await KsuApi.exec(`sh ${MODDIR}/api.sh local status`);
    return JSON.parse(res);
  }

  static async getPeers(): Promise<any[]> {
    const res = await KsuApi.exec(`sh ${MODDIR}/api.sh local peer list`);
    if (!res) return [];
    try {
      const peers = JSON.parse(res);
      if (!Array.isArray(peers)) return [];

      // Map address to id and dedup
      const seen = new Set();
      const mappedPeers: any[] = [];

      for (const p of peers) {
        // API returns 'address' but UI expects 'id'
        const id = p.address || p.id;
        if (id && !seen.has(id)) {
          seen.add(id);

          // Deduplicate paths
          const uniquePaths: any[] = [];
          const seenPaths = new Set();
          if (Array.isArray(p.paths)) {
            for (const path of p.paths) {
              if (!seenPaths.has(path.address)) {
                seenPaths.add(path.address);
                uniquePaths.push(path);
              }
            }
          }

          mappedPeers.push({
            ...p,
            id: id,
            paths: uniquePaths
          });
        }
      }
      return mappedPeers;
    } catch (e) {
      console.error("Failed to parse local peers", e);
      return [];
    }
  }

  static async getNetworks(): Promise<LocalNetwork[]> {
    const res = await KsuApi.exec(`sh ${MODDIR}/api.sh local network list`);
    if (!res) return [];
    try {
      const networks = JSON.parse(res);
      // Ensure array
      return Array.isArray(networks) ? networks : [];
    } catch (e) {
      console.error("Failed to parse local networks", e);
      return [];
    }
  }

  static async joinNetwork(networkId: string, config?: Partial<LocalNetwork>): Promise<any> {
    const defaultConfig = { allowManaged: true, allowGlobal: false, allowDefault: false, allowDNS: false };
    const finalConfig = { ...defaultConfig, ...config };
    const body = JSON.stringify(finalConfig);
    return KsuApi.exec(`sh ${MODDIR}/api.sh local network join ${networkId} '${body}'`);
  }

  static async leaveNetwork(networkId: string): Promise<any> {
    return KsuApi.exec(`sh ${MODDIR}/api.sh local network leave ${networkId}`);
  }

  static async joinMoon(moonId: string): Promise<any> {
    return KsuApi.orbit(moonId);
  }

  static async leaveMoon(moonId: string): Promise<any> {
    return this.leaveNetwork(moonId);
  }

  static async updateNetwork(networkId: string, config: Partial<LocalNetwork>): Promise<any> {
    const body = JSON.stringify(config);
    // Re-joining with new config updates it
    return KsuApi.exec(`sh ${MODDIR}/api.sh local network join ${networkId} '${body}'`);
  }

  static async startService(): Promise<any> {
    return KsuApi.exec(`sh ${MODDIR}/api.sh local service start`);
  }

  static async stopService(): Promise<any> {
    return KsuApi.exec(`sh ${MODDIR}/api.sh local service stop`);
  }


}
