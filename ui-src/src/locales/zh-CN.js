export const common = {
    'dash': '首页',
    'back': '返回',
    'peers': '成员',
    'network': '管理',
    'setting': '设置',
    'service_no_run':'服务未启动',
    'service_start':'启动服务',
    'ask_service_start':'核心未启动，是否确认开启?',
    'edit':'编辑',
    'delete':'删除',
    'deleteConfirm':'确认删除吗?',
    'loading':'加载中',
    'loading_fail':'加载失败',
    'check_network_tips':'加载失败，请检查网络情况。',
}
export const home = {
    'enable': '启用',
    'disable': '禁用',
    'disabled': '已禁用',
    'enabled': '已启用',
    'requesting_configuration': '正在获取配置',
    'not_found': '无效组网ID',
    'access_denied': '授权认证失败',
    'port_error': '本地端口错误',
    'client_too_old': '低版本客户端',
    'ok': '组网成功',
    'authentication_required': '请求授权认证',
    'nodeId_input_tips': '请输入组网id',
    'nodeId': '组网ID',
    'allowManaged': '允许管理地址',
    'allowGlobal': '允许管理全局IP',
    'allowDefault': '允许默认路由',
    'allowDNS': '允许配置DNS',
    'edit_node_title': '配置节点',
    'leave_confirm': '确定删除记录吗?这将离开当前网络?并短暂断网.',
    'noNetwork_tips': '暂未加入任何节点?先去加入一个吧.',
}
export const network = {
    'api-not-found': '未配置API Token',
    'operation_success': '操作完成',
    'operation_fail': '操作失败',
    'ask_new_network': '添加一个新网络?',
    'networkCount': '网络数',
    'maxMembers': '用户数',
    'authorizedMemberCount': '授权用户数',
    'authorizedMemberCount': '授权用户数',
    'routeCount': '路由数',
}
export const networkDetail={
    'overview':'概览',
    'addMember':'添加成员',
    'delMember':'删除成员',
    'deleteNetwork':'删除网络',
    'member':'成员',
    'allowAuth':'允许接入',
    'allowBridge':'允许桥接',
    'name':'名称',
    'description':'备注',
    'address':'地址',
    'physicalAddress':'物理IP',
    'clientVersion':'客户端版本',
    'lastOnline':'上次在线时间',
    'accessControl':'网络类型',
    'accessControl_private':'私有',
    'accessControl_public':'公开',
    'accessControl_tips':'私有：节点必须被授权才能成为成员；\n公共：任何知道网络ID的节点都可以成为成员。成员不能被取消授权或删除。30天内未在线的成员将被删除，但可以重新加入。',
    //Private:Nodes must be authorized to become members;\nPublic:Any node that knows the Network ID can become a member. Members cannot be de-authorized or deleted. Members that haven\'t been online in 30 days will be removed, but can rejoin.
    'enableBroadcast':'启用组播',
    'multicastLimit':'组播限制',
    'routeManage':'路由管理',
    'addRouteRule':'增加路由',
    // 'noRouteWarn':'No managed routes defined.Devices will not get an IP address without a matching route.',
    'noRouteWarn':'未定义托管路由。如果没有匹配的路由，设备将无法获得IP地址。',
    'ipManage':'IP配置',
    'zt_v4':'DHCPv4', // Auto-Assign from Range (IPv4)
    'zt_v6':'DHCPv6', //
    'v6AssignModeRfc4193':'ZeroTier RFC4193(IPv6)', // ZeroTier RFC4193 (IPv6)
    'v6AssignMode6plane':'ZeroTier 6PLANE(IPv4)',// ZeroTier 6PLANE (IPv6)
    'ipPoolManage':'IPv4/IPv6地址池配置',// IPv4/IPv6 Address Pool
    'DNSManage':'DNS配置',
    'DNSDomain':'DNS域名',
    'DNSServers':'DNSIP',
    'ztIP':'虚拟IP',
    'IPTips':'请输入正确IP',
    'nodeId': '成员ID',
    'nodeIdtIPS': '请输入成员ID',
    'ipRangeStart': '起始IP',
    'ipRangeEnd': '结束IP',
    'updateNetworkSuccessTips': '更新网络信息完成',
    'updateNetworkErrorTips': '更新网络信息失败',
    'deleteNetworkSuccessTips': '删除网络信息完成',
    'deleteNetworkErrorTips': '删除网络信息失败',
    'updateMemberSuccessTips': '更新成员信息完成',
    'updateMemberErrorTips': '更新成员信息失败',
    'deleteMemberSuccessTips': '删除成员信息完成',
    'deleteMemberErrorTips': '删除成员信息失败',
    'addMemberSuccessTips': '添加成员信息完成',
    'addMemberErrorTips': '添加成员信息失败',
}
export const peers = {
    'expand': '展开',
    'collapse': '收起',
    'moonOrPlant':'加入中转服务器'
}
export const setting = {
    'allow9993': '放行9993端口',
    'autoStart': '开机自启',
    'uninstallKeep': '卸载保留数据',
    'routeMode': '路由模式',
    'sourceCode': '查看源码',
    'apiDocument': '从哪里获取API Token?',
    'routeMode_main': 'main表优先模式',
    'routeMode_rule': '自建路由模式',
    'cliStatusText': '启动服务查看节点信息',
}