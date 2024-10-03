# ZeroTier for KSU

用了各位大佬的模块，但是吧，老用命令行，不是很方便。正好赶上想学学vue，所有就做了这个给自己用。

感谢以下连接提供的帮助，顺序不分先后

- [是否有可能 Zerotier-One 直接在 Android 设备上运行? - V2EX](https://v2ex.com/t/863131)
- [Android以太网和WIFI完美共存](https://blog.csdn.net/G_Rookie/article/details/109679262)
- [Network Management in Android: Routing](https://yotam.net/posts/network-management-in-android-routing/)
- [vant-ui/vant-demo](https://github.com/vant-ui/vant-demo/tree/master/vant/vite)
- [zfdx123/build-k40-ksu](https://github.com/zfdx123/build-k40-ksu)
- [eventlOwOp/zerotier-magisk](https://github.com/eventlOwOp/zerotier-magisk/tree/master/zerotier)
- [linuxscreen/ZeroTierOneForMagisk](https://github.com/linuxscreen/ZeroTierOneForMagisk)
- [taamarin/box_for_magisk](https://github.com/taamarin/box_for_magisk/blob/master/box/scripts/box.inotify)
- [stunnel/static-curl](https://github.com/stunnel/static-curl)
- [tiann/KernelSU](https://github.com/tiann/KernelSU)
- [shell脚本如何优雅的打印帮助信息](https://blog.csdn.net/lhl_blog/article/details/107409694)

## BUG

- [x] ~~通过UI启动的zerotier进程会随着KSU Manager的结束而退出~~
- [ ] 在模块禁用的情况下依然可以操作服务启用和停用(实际上不应该能操作，毕竟都禁用了)，这将导致下次启用模块的时候要启停服务两次才能使用zerotier进程正确启动。**ps:模块禁用功能是特地保留的，我不想在停用模块的情况下还占用系统资源。**
- [ ] 服务停止的情况下，有概率会在首页显示已经禁用的节点。这是不一样的，我都强制弹框让开启服务再操作了，有空再找
- ~~[zt切换网络导致全局断网的问题](https://github.com/eventlOwOp/zerotier-magisk/issues/7#issuecomment-2069526989)~~ ZerotierOne 1.14.0版本已修复
- [ ] 管理页在处理Member的时候需要等待处理完才能展开下一个Member的信息，否则后一个会覆盖前一个的配置，导致第一个Member修改的配置不生效。可以提前缓存下要修改的信息，一次发送请求，下次再改。

## TODO

1. [x] 流水线增加自定义zerotier版本编译。[~~据说1.8.9版本没有zt切换网络导致全局断网的问题~~](https://github.com/eventlOwOp/zerotier-magisk/issues/7#issuecomment-2069526989)，经过测试，依然复现，而且还有漏洞，官方推荐1.12.x版本以上有安全补丁，别降级了。
2. [ ] 新建zerotier路由规则表（没学会。先放着吧）
3. [X] 增加管理页面，需要自行准备[API Token](https://docs.zerotier.com/api/tokens/#zerotier-central-token)
4. [ ] 国际化
5. [ ] 等待新版KSU发布后，重新发版，现在是以补丁的形式提前用上了KSU的某些未修复的API

## 免责声明

本项目不对以下情况负责：设备变砖、SD 卡损坏或 SoC 烧毁。

## 使用方法

用UI界面

![List](https://github.com/powerAn2020/ZeroTierOneForKSU/assets/25736019/a20e0eeb-2813-40dd-892c-c3f44fff77c2)
![Peers](https://github.com/powerAn2020/ZeroTierOneForKSU/assets/25736019/61040bcb-8b51-4521-a35a-a2e793df3bb1)
![Setting](https://github.com/powerAn2020/ZeroTierOneForKSU/assets/25736019/05f3e070-6fd7-48a3-9afb-22fb4cfff56a)

## 一些可选操作说明

### 文件说明

#### Zerotier数据目录:`/data/adb/zerotier`；在该目录下创建以下文件可以做到

  创建文件`/data/adb/zerotier/KEEP_ON_UNINSTALL`，卸载模块可保留数据目录
  创建文件`/data/adb/zerotier/MANMANUAL`，关闭开机自启
  创建文件`/data/adb/zerotier/ALLOW_9993`，iptables放行UDP 9993入端口
  创建文件`/data/adb/zerotier/ROUTER_RULE_NEW`，zerotier流量路由模式改为新建路由规则表，删除该文件则是提升main表优先级模式

### 执行脚本说明

### **执行所有脚本都需要带全路径/Executing all scripts requires a full path**

```Shell
  sh /data/adb/modules/ZeroTierForKSU/zerotier-cli # 同官方
  sh /data/adb/modules/ZeroTierForKSU/zerotier-idtool # 同官方
  sh /data/adb/modules/ZeroTierForKSU/zerotier.inotify # 监听/data/adb/zerotier/state目录，用于启动服务。
```

#### ZeroTier for KSU - zerotier.sh
```Shell
Usage:
  zerotier.sh options

Options:
  -h                                         -- Show this message.
  start                                      -- Start Zerotier Service
  restart                                    -- Retart Zerotier Service
  stop                                       -- Stop Zerotier Service
  status                                     -- Show Node Status
  token                                      -- Show Local Service Token
  apiToken                                   -- Show Remote Service apiToken
  inotifyd                                   -- Start inotifyd Service

Example:
  sh zerotier.sh -h
  sh zerotier.sh start
  sh zerotier.sh restart
  sh zerotier.sh stop
  sh zerotier.sh status
  sh zerotier.sh token
  sh zerotier.sh apiToken
  sh zerotier.sh inotifyd

```
#### ZeroTier for KSU - api.sh
```shell 

Usage:
  api.sh <api_type> [options]

Options:
  -h                                            -- Show this message.
  <api_type>   local/central
    local
      status                                    -- Show Node Status
      network                                   -- When the action is "list", "networkid" and "bodydata" are optional. When the action is "leave", "bodydata" is optional. When the action is "join", "networkid" and "bodydata" are required.
        action     value:[ list | leave | join ]
        networkid  value:[ networkid ](optional)
        bodydata   value:[ JSON object ](optional)
      peer                                      -- All the nodes your node knows about
      firewall                                  -- Control the firewall to allow traffic into port 9993
        action     value:[ A | D ]
      router                                    -- Set the Zerotier traffic routing method
        router     value:[ routing (unrealized) | main ]
        action     value:[ A | D ]
      orbit                                     -- Join Private Root Servers
        moonid     value:[ moonid ]
    central
      status                                    -- Show Center Status
      network                                   -- When the action is "list", "networkid" and "bodydata" are optional. When the action is "remove", "bodydata" is optional. When the action is "add", No parameters are required. When the action is "modify", "networkid" and "bodydata" are required.
        action     value:[ list | remove | add | modify ]
        networkid  value:[ networkid ](optional)
        bodydata   value:[ JSON object ](optional)
      member                                    -- When the action is "list", "bodydata" and "memberID" are optional. When the action is "remove", "bodydata" is optional. When the action is "modify", "networkid", "memberID" and "bodydata" are required.
        action     value:[ list | remove | modify ]
        networkid  value:[ networkid ] (optional)
        memberID   value:[ memberID ] (optional)
        bodydata   value:[ JSON object ] (optional)
    apiToken                                    -- Manage the tokenAuth for accessing the central API
      action       value:[ show | update ]
      key          value:[ apiToken ]

Example:
  help
    sh api.sh -h

  local
    sh api.sh local status
    sh api.sh local peer
    sh api.sh local firewall A
    sh api.sh local firewall D
    sh api.sh local router routing A (unrealized)
    sh api.sh local router routing D (unrealized)
    sh api.sh local router main A
    sh api.sh local router main D
    sh api.sh local orbit yourMoonid
    sh api.sh local network list
    sh api.sh local network leave yourNetworkid (suggest: use command `zerotier-cli leave yourNetworkid`)
    sh api.sh local network join  yourNetworkid {} (suggest: use command `zerotier-cli join yourNetworkid`)

  central
    sh api.sh central status
    sh api.sh central network list
    sh api.sh central network remove yourNetworkid
    sh api.sh central network add
    sh api.sh central network modify yourNetworkid {}
    sh api.sh central member list yourNetworkid
    sh api.sh central member remove yourNetworkid memberID
    sh api.sh central member modify yourNetworkid memberID '{"hidden":false,"config":{"authorized":true}}'

  apiToken
    sh api.sh apiToken show
    sh api.sh apiToken update xxxxxxxxx
```
