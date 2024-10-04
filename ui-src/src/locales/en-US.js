export const common = {
    'dash': 'Home',
    'back': 'Back',
    'peers': 'Peers',
    'network': 'Network Manage',
    'setting': 'Setting',
    'service_no_run':'Service not started',
    'service_start':'Startup service',
    'ask_service_start':'The ZerotierOne is not started, do you want to confirm that it is turned on?',
    'edit':'edit',
    'delete':'delete',
    'deleteConfirm':'Confirm deletion?',
    'loading':'loading',
    'loading_fail':'loading fail',
    'check_network_tips':'Loading failed. Please check the network condition.',
}
export const home = {
    'enable': 'Enable',
    'disable': 'Disable',
    'disabled': 'Disabled',
    'enabled': 'Enabled',
    'requesting_configuration': 'Requesting Configuration',
    'not_found': 'Not Found',
    'access_denied': 'Access Denied',
    'port_error': 'Port Error',
    'client_too_old': 'Client Too Old',
    'ok': 'OK',
    'authentication_required': 'Authentication Required',
    'nodeId_input_tips': 'Please enter the networking id',
    'nodeId': 'Node ID',
    'allowManaged': 'Allow managed addresses',
    'allowGlobal': 'Allow global IP management',
    'allowDefault': 'Allow default routing',
    'allowDNS': 'Allow to configure DNS',
    'edit_node_title': 'Configure Node',
    'leave_confirm': 'Are you sure to delete the record? This will leave the current network? And briefly disconnect the network.',
    'noNetwork_tips': "Haven't joined any nodes yet? Go and join one first.",
}
export const network = {
    'api-not-found': 'Not configured API Token',
    'operation_success': 'Operation complete',
    'operation_fail': 'Operation failed',
    'ask_new_network': 'Adding a new network?',
    'networkCount': 'Network Count',
    'maxMembers': 'Max Members',
    'authorizedMemberCount': 'Authorized Member Count',
    'routeCount': 'Route Count',
}
export const networkDetail={
    'overview':'Overview',
    'addMember':'Add Member',
    'delMember':'Delete Member',
    'deleteNetwork':'Delete Network',
    'member':'Member',
    'allowAuth':'Allow Auth',
    'allowBridge':'Allow Bridge',
    'name':'Name',
    'description':'Description',
    'address':'Address',
    'physicalAddress':'Physical Address',
    'clientVersion':'Client Version',
    'lastOnline':'Last Online',
    'accessControl':'Access Control',
    'accessControl_private':'Private',
    'accessControl_public':'Public',
    'accessControl_tips':"Private:Nodes must be authorized to become members;\nPublic:Any node that knows the Network ID can become a member. Members cannot be de-authorized or deleted. Members that haven\'t been online in 30 days will be removed, but can rejoin.",
    'enableBroadcast':'Enable Broadcast',
    'multicastLimit':'Multicast Limit',
    'routeManage':'Route Manage',
    'addRouteRule':'Add RouteRule',
    'noRouteWarn':'No managed routes defined.Devices will not get an IP address without a matching route.',
    'ipManage':'IP Manage',
    'zt_v4':'Auto-Assign from Range (IPv4)', // Auto-Assign from Range (IPv4)
    'zt_v6':'Auto-Assign from Range (IPv6)', //
    'v6AssignModeRfc4193':'ZeroTier RFC4193(IPv6)', // ZeroTier RFC4193 (IPv6)
    'v6AssignMode6plane':'ZeroTier 6PLANE(IPv4)',// ZeroTier 6PLANE (IPv6)
    'ipPoolManage':'IPv4/IPv6 Address Pool Config',// IPv4/IPv6 Address Pool
    'DNSManage':'DNS configuration',// 
    'DNSDomain':'DNS domain name',// 
    'DNSServers':'DNS IPs',// 
    'ztIP':'Virtual IP',// 
    'IPTips':'Please enter the correct IP address.',// 
    'nodeId': 'Node ID',
    'nodeIdtIPS': 'Please enter a member ID',
    'ipRangeStart': 'IP Range Start',
    'ipRangeEnd': 'IP Range End',
    'updateNetworkSuccessTips': 'Update network information completed',
    'updateNetworkErrorTips': 'Failed to update network information',
    'deleteNetworkSuccessTips': 'Delete network information complete',
    'deleteNetworkErrorTips': 'Failed to delete network information',
    'updateMemberSuccessTips': 'Update member information complete',
    'updateMemberErrorTips': 'Failed to update member information',
    'deleteMemberSuccessTips': 'Delete member information complete',
    'deleteMemberErrorTips': 'Failed to delete member information',
    'addMemberSuccessTips': 'Add member information complete',
    'addMemberErrorTips': 'Failed to add member information',
}
export const peers = {
    'expand': 'Expand',
    'collapse': 'Collapse',
    'moonOrPlant':'Join the orbit server'
}
export const setting = {
    'allow9993': 'iptable Allow 9993 UDP',
    'autoStart': 'Service Auto Start',
    'uninstallKeep': 'Uninstall Keep Data',
    'routeMode': 'Route Mode',
    'sourceCode': 'source Code',
    'apiDocument': 'Where can I get API Tokens?',
    'routeMode_main': 'main table',
    'routeMode_rule': 'rule table',
    'cliStatusText': 'Start the service to view node information',
}