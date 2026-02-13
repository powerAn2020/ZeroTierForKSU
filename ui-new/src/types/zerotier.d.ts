export interface ZeroTierStatus {
  address: string;
  clock: number;
  config: {
    settings: {
      primaryPort: number;
      [key: string]: any;
    };
  };
  online: boolean;
  planetWorldId: number;
  planetWorldTimestamp: number;
  publicIdentity: string;
  tcpFallbackActive: boolean;
  version: string;
  versionBuild: number;
  versionMajor: number;
  versionMinor: number;
  versionRev: number;
}

export interface LocalNetwork {
  id: string;
  name: string;
  mac: string;
  status: "OK" | "ACCESS_DENIED" | "NOT_FOUND" | "PORT_ERROR" | "CLIENT_TOO_OLD" | "REQUESTING_CONFIGURATION" | "AUTHENTICATION_REQUIRED";
  type: string;
  allowManaged: boolean;
  allowGlobal: boolean;
  allowDefault: boolean;
  allowDNS: boolean;
  portDeviceName: string;
  assignedAddresses: string[];
  // Add enable for UI logic (toggle)
  enable?: string;
}

export interface LocalPeer {
  id: string;
  version: string;
  role: "LEAF" | "PLANET" | "MOON";
  latency: number;
  paths: {
    address: string;
    lastSend: number;
    lastReceive: number;
    active: boolean;
    preferred: boolean;
  }[];
}


export interface CentralNetwork {
  id: string;
  clock: number;
  config: {
    id: string;
    creationTime: number;
    capabilities: any[];
    enableBroadcast: boolean;
    ipAssignmentPools: { ipRangeStart: string; ipRangeEnd: string }[];
    mtu: number;
    multicastLimit: number;
    name: string;
    private: boolean;
    remoteTraceLevel: number;
    remoteTraceTarget: any;
    routes: { target: string; via?: string }[];
    rules: any[];
    tags: any[];
    v4AssignMode: { zt: boolean };
    v6AssignMode: { zt: boolean; "6plane": boolean; rfc4193: boolean };
    dns: { domain: string; servers: string[] };
    ssoConfig: any;
  };
  description: string;
  rulesSource: string;
  permissions: { [key: string]: any };
  ownerId: string;
  onlineMemberCount: number;
  authorizedMemberCount: number;
  totalMemberCount: number;
  capabilitiesByName: { [key: string]: any };
  tagsByName: { [key: string]: any };
}

export interface CentralMember {
  networkId: string;
  nodeId: string;
  controllerId: string;
  hidden: boolean;
  name: string;
  description: string;
  config: {
    activeBridge: boolean;
    address: string;
    authorized: boolean;
    capabilities: any[];
    creationTime: number;
    id: string;
    identity: string;
    ipAssignments: string[];
    lastAuthorizedTime: number;
    lastDeauthorizedTime: number;
    noAutoAssignIps: boolean;
    remoteTraceLevel: number;
    remoteTraceTarget: any;
    revision: number;
    tags: any[];
    vMajor: number;
    vMinor: number;
    vRev: number;
    vProto: number;
  };
  lastOnline: number;
  physicalAddress: string;
  clientVersion: string;
  protocolVersion: number;
  supportsRulesEngine: boolean;
}
