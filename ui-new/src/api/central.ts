import { KsuApi } from './ksu';
import type { CentralNetwork, CentralMember } from '@/types/zerotier';

const MODDIR = '/data/adb/modules/ZeroTierForKSU';

export class CentralApi {
  static async getApiToken(): Promise<string> {
    try {
      const token = await KsuApi.exec(`sh ${MODDIR}/api.sh apiToken show`);
      return token.trim();
    } catch (e) {
      return "";
    }
  }

  static async setApiToken(token: string): Promise<void> {
    await KsuApi.exec(`sh ${MODDIR}/api.sh apiToken update ${token}`);
  }

  static async getNetworks(): Promise<CentralNetwork[]> {
    const res = await KsuApi.exec(`sh ${MODDIR}/api.sh central network list`);
    if (!res) return [];
    try {
      const networks = JSON.parse(res);
      return Array.isArray(networks) ? networks : [];
    } catch (e) {
      console.error("Failed to parse central networks", e);
      return [];
    }
  }

  static async getNetwork(networkId: string): Promise<CentralNetwork> {
    const res = await KsuApi.exec(`sh ${MODDIR}/api.sh central network list ${networkId}`);
    const data = JSON.parse(res);
    return Array.isArray(data) ? data[0] : data;
  }

  static async deleteNetwork(networkId: string): Promise<void> {
    await KsuApi.exec(`sh ${MODDIR}/api.sh central network remove ${networkId}`);
  }

  static async createNetwork(name: string): Promise<any> {
    // name is not directly supported by add command in api.sh based on analysis, 
    // it sends empty POST to create, then we might need to modify.
    // api.sh: api_networks "POST" "${bodydata}" ""
    const res = await KsuApi.exec(`sh ${MODDIR}/api.sh central network add`);
    const network = JSON.parse(res);
    if (name && network.id) {
      const body = JSON.stringify({ config: { name } }).replace(/'/g, "'\\''");
      await KsuApi.exec(`sh ${MODDIR}/api.sh central network modify ${network.id} '${body}'`);
    }
    return network;
  }

  static async updateNetwork(networkId: string, config: any): Promise<void> {
    const body = JSON.stringify(config).replace(/'/g, "'\\''");
    // api.sh: central network modify <id> <body>
    await KsuApi.exec(`sh ${MODDIR}/api.sh central network modify ${networkId} '${body}'`);
  }



  static async getMembers(networkId: string): Promise<CentralMember[]> {
    const res = await KsuApi.exec(`sh ${MODDIR}/api.sh central member list ${networkId}`);
    if (!res) return [];
    try {
      const members = JSON.parse(res);
      return Array.isArray(members) ? members : [];
    } catch (e) {
      console.error("Failed to parse members", e);
      return [];
    }
  }

  static async updateMember(networkId: string, memberId: string, config: any): Promise<void> {
    const body = JSON.stringify(config).replace(/'/g, "'\\''");
    await KsuApi.exec(`sh ${MODDIR}/api.sh central member modify ${networkId} ${memberId} '${body}'`);
  }

  static async deleteMember(networkId: string, memberId: string): Promise<void> {
    await KsuApi.exec(`sh ${MODDIR}/api.sh central member remove ${networkId} ${memberId}`);
  }
}
