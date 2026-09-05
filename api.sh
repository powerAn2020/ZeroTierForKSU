#!/system/bin/sh

###
### ZeroTier for KSU - api.sh
###
### Usage:
###   api.sh <api_type> [options]
###
### Options:
###   -h                                            -- Show this message.
###   <api_type>   local/central
###     local
###       status                                    -- Show Node Status
###       service                                    -- Manage Zerotier-One Service Status
###         action     value:[ start | stop ]
###       network                                   -- When the action is "list", "networkid" and "bodydata" are optional. When the action is "leave", "bodydata" is optional. When the action is "join", "networkid" and "bodydata" are required.
###         action     value:[ list | leave | join ]
###         networkid  value:[ networkid ](optional)
###         bodydata   value:[ JSON object ](optional)
###       peer                                      -- All the nodes your node knows about
###       firewall                                  -- Control the firewall to allow traffic into port 9993
###         action     value:[ A | D ]
###       router                                    -- Set the Zerotier traffic routing method
###         router     value:[ routing | main ]
###         action     value:[ A | D ]
###       moon                                      -- Join Private Root Servers
###         action     value:[ orbit | deorbit ]
###         moonid     value:[ moonid ]
###     central
###       status                                    -- Show Center Status
###       network                                   -- When the action is "list", "networkid" and "bodydata" are optional. When the action is "remove", "bodydata" is optional. When the action is "add", No parameters are required. When the action is "modify", "networkid" and "bodydata" are required.
###         action     value:[ list | remove | add | modify ]
###         networkid  value:[ networkid ](optional)
###         bodydata   value:[ JSON object ](optional)
###       member                                     -- When the action is "list", "bodydata" and "memberID" are optional. When the action is "remove", "bodydata" is optional. When the action is "modify", "networkid", "memberID" and "bodydata" are required.
###         action     value:[ list | remove | modify ]
###         networkid  value:[ networkid ] (optional)
###         memberID   value:[ memberID ] (optional)
###         bodydata   value:[ JSON object ] (optional)
###     apiToken                                    -- Manage the tokenAuth for accessing the central API
###       action       value:[ show | update ]
###       key          value:[ apiToken ]
###     dns                                         -- Manage the custom DNS servers for curl
###       action       value:[ show | update ]
###       servers      value:[ dns_servers ]
###
### Example:
###   help
###     sh api.sh -h
###
###   local
###     sh api.sh local status
###     sh api.sh local service start
###     sh api.sh local service stop
###     sh api.sh local peer
###     sh api.sh local firewall A
###     sh api.sh local firewall D
###     sh api.sh local router routing A
###     sh api.sh local router routing D
###     sh api.sh local router main A
###     sh api.sh local router main D
###     sh api.sh local moon orbit yourMoonid
###     sh api.sh local moon deorbit yourMoonid
###     sh api.sh local network list
###     sh api.sh local network leave yourNetworkid (suggest: use command `zerotier-cli leave yourNetworkid`)
###     sh api.sh local network join  yourNetworkid {} (suggest: use command `zerotier-cli join yourNetworkid`)
###
###   central
###     sh api.sh central status
###     sh api.sh central network list
###     sh api.sh central network remove yourNetworkid
###     sh api.sh central network add
###     sh api.sh central network modify yourNetworkid {}
###     sh api.sh central member list yourNetworkid
###     sh api.sh central member remove yourNetworkid memberID
###     sh api.sh central member modify yourNetworkid memberID '{"hidden":false,"config":{"authorized":true}}'
###
###   apiToken
###     sh api.sh apiToken show
###     sh api.sh apiToken update xxxxxxxxx
###
###   dns
###     sh api.sh dns show
###     sh api.sh dns update 1.1.1.1,8.8.8.8
###

MODDIR=${0%/*}

if [ -f "/data/adb/ksu/bin/busybox" ]; then
  # busybox KSU
  busybox="/data/adb/ksu/bin/busybox"
elif [ -f "/data/adb/ap/bin/busybox" ]; then
  # busybox APatch
  busybox="/data/adb/ap/bin/busybox"
else
  # busybox Magisk
  busybox="/data/adb/magisk/busybox"
fi

ZTPATH=/data/adb/zerotier
MANUAL=${ZTPATH}/MANUAL

PIDFILE=$ZTPATH/zerotier-one.pid
ZEROTIERD=$MODDIR/zerotier-one
SECRETFILE=$ZTPATH/authtoken.secret
TOKENAUTH=$ZTPATH/TOKENAUTH
TOKEN=$(cat ${SECRETFILE})
apiToken=$(grep -v '^[[:space:]]*$' $TOKENAUTH)
DNSFILE=$ZTPATH/DNS
if [ -f "$DNSFILE" ]; then
  DNS=$(grep -v '^[[:space:]]*$' "$DNSFILE" | tr -d '\r\n')
fi
if [ -n "$DNS" ]; then
  CurlBIN="${MODDIR}/bin/curl -s -A 'ZerotierForKSU' --connect-timeout 5 --dns-servers ${DNS}"
else
  CurlBIN="${MODDIR}/bin/curl -s -A 'ZerotierForKSU' --connect-timeout 5"
fi
localAPIBase='http://localhost:9993'
remoteAPIBase='https://api.zerotier.com/api/v1'
export CURL_CA_BUNDLE=${MODDIR}/bin/cacert.pem
# =========================== local service ===========================
local_status() {
  $CurlBIN -H "X-ZT1-Auth: $TOKEN" ${localAPIBase}/status
}

local_networks() {
  # $1 operation GET/POST/DELETE
  # $2 jsondata {}
  # $3 /networkid
  if [ "$1" = "GET" -o "$1" = "DELETE" ]; then
    $CurlBIN -X $1 -H "X-ZT1-Auth: $TOKEN" ${localAPIBase}/network${3}
  else
    $CurlBIN -X $1 -H "X-ZT1-Auth: $TOKEN" -H "Content-Type:application/json" -d "$2" ${localAPIBase}/network$3
  fi
}

local_peer() {
  $CurlBIN -H "X-ZT1-Auth: $TOKEN" ${localAPIBase}/peer
}
# $1 :A 和 D
local_firewall() {
  if [ "$1" = "A" ]; then
    touch ${ZTPATH}/ALLOW_9993
  elif [ "$1" = "D" ]; then
    rm ${ZTPATH}/ALLOW_9993
  else
    echo "only [A,D]"
    exit 1
  fi
  iptables -$1 INPUT -p udp --dport 9993 -j ACCEPT
  ip6tables -$1 INPUT -p udp --dport 9993 -j ACCEPT
}
# moon action
local_moon() {
  action=$1
  moonid=$2
  if [ "$action" = "orbit" ]; then
    sh ${MODDIR}/zerotier-cli orbit $moonid $moonid
  elif [ "$action" = "deorbit" ]; then
    sh ${MODDIR}/zerotier-cli deorbit $moonid
  else
    echo "Usage: api.sh local moon [orbit|deorbit] <moonid>"
    exit 1
  fi
}

local_router() {
  # Custom routing table ID for ZeroTier routes
  ZT_TABLE_ID=7993
  ZT_RULE_PREF=8000

  if [ "$1" = "routing" ]; then
    # Reference https://yotam.net/posts/network-management-in-android-routing/
    # Reference https://unix.stackexchange.com/questions/424314/changing-default-ip-rule-priority-for-main-table
    # Reference https://github.com/zerotier/ZeroTierOne/issues/1715#issuecomment-1780625754
    #
    # Instead of elevating the main table priority, use a dedicated routing table
    # with only ZeroTier managed routes. This avoids side effects on other apps.
    #
    # Steps:
    #   1. Query joined networks from local API to get interface and managed routes
    #   2. Add/remove routes in custom table (7993)
    #   3. Add/remove ip rule to direct matching traffic to that table

    if [ "$2" = "A" ]; then
      # Fetch joined networks
      networks_json=$($CurlBIN -H "X-ZT1-Auth: $TOKEN" ${localAPIBase}/network)
      if [ -z "$networks_json" ]; then
        echo "Error: failed to query local networks"
        exit 1
      fi
      # Add ip rule to lookup custom ZeroTier routing table
      ip rule add from all lookup ${ZT_TABLE_ID} pref ${ZT_RULE_PREF} 2>/dev/null

      # Extract network IDs using tr to split JSON, then simple awk
      nwids=$(echo "$networks_json" | tr '{}[],' '\n' | $busybox awk -F: '/"nwid"/ { gsub(/"/,"",$2); print $2 }')

      for nwid in $nwids; do
        # Query individual network for clean per-network JSON
        net_json=$($CurlBIN -H "X-ZT1-Auth: $TOKEN" ${localAPIBase}/network/${nwid})

        # Extract portDeviceName
        zt_dev=$(echo "$net_json" | tr '{}[],' '\n' | $busybox awk -F: '/"portDeviceName"/ { gsub(/"/,"",$2); print $2 }')
        if [ -z "$zt_dev" ]; then
          continue
        fi

        # Extract route target and via (gateway) pairs, then add to custom table
        # Extract assigned IP (take the first one)
        zt_ip=$(echo "$net_json" | tr '{}[],' '\n' | $busybox awk -F: '/"assignedAddresses"/ { getline; gsub(/[ \t"]/,"",$1); split($1,a,"/"); print a[1]; exit }')

        # Extract route target and via (gateway) pairs, then add to custom table
        # awk pairs "target" and "via" lines (they are adjacent in the JSON)
        echo "$net_json" | tr '{}[],' '\n' | $busybox awk -F: '
          /"target"/ { gsub(/"/,"",$2); target=$2 }
          /"via"/ { gsub(/"/,"",$2); via=$2; if (target != "") { print target, via; target="" } }
        ' | while read route_target route_via; do
          if [ -n "$route_target" ]; then
            CMD="ip route add table ${ZT_TABLE_ID} ${route_target}"
            if [ -n "$route_via" ] && [ "$route_via" != "null" ]; then
              CMD="$CMD via ${route_via}"
            fi
            CMD="$CMD dev ${zt_dev}"
            if [ -n "$zt_ip" ]; then
              CMD="$CMD src ${zt_ip}"
            fi
            if [ -z "$route_via" ] || [ "$route_via" = "null" ]; then
               CMD="$CMD proto kernel scope link"
            fi
            $CMD 2>/dev/null
            echo "Added route: $CMD"
          fi
        done
      done
    elif [ "$2" = "D" ]; then
      # Flush all routes in the custom ZeroTier routing table
      ip route flush table ${ZT_TABLE_ID} 2>/dev/null
      # Remove the ip rule
      ip rule del from all lookup ${ZT_TABLE_ID} pref ${ZT_RULE_PREF} 2>/dev/null
      echo "Removed ZeroTier routing table and rule"
    else
      echo "only [A,D]"
      exit 1
    fi
  else
    
    # "main" mode: elevate main table priority
    # Reference https://blog.csdn.net/G_Rookie/article/details/109679262
    if [ "$2" = "A" ]; then
      ip rule add from all lookup main pref 9000
    else
      ip rule del from all lookup main pref 9000
    fi
  fi
}
local_service() {
  if [ "$1" = "start" ]; then
    if [ ! -f "${ZTPATH}/state/disable" ];then
      touch ${ZTPATH}/state/disable
    fi
    rm ${ZTPATH}/state/disable
  else
    touch ${ZTPATH}/state/disable
  fi
}
# =========================== Central API ===========================
api_networks() {
  # $1 operation GET/POST/DELETE
  # $2 jsondata {}
  # $3 /networkid
  if [ "$1" = "GET" -o "$1" = "DELETE" ]; then
    $CurlBIN -X $1 -H "Authorization: token $apiToken" ${remoteAPIBase}/network${3}
  else
    $CurlBIN -X $1 -H "Content-Type:application/json" -H "Authorization: token $apiToken" -d "$2" ${remoteAPIBase}/network${3}
  fi
}

api_members() {
  # $1 operation GET/POST/DELETE
  # $2 networkid
  # $3 /memberID
  # $4 jsondata {}
  if [ "$1" = "GET" -o "$1" = "DELETE" ]; then
    $CurlBIN -X ${1} -H "Authorization: token $apiToken" ${remoteAPIBase}/network/${2}/member${3}
  else
    $CurlBIN -X $1 -H "Content-Type:application/json" -H "Authorization: token $apiToken" -d "$4" ${remoteAPIBase}/network/${2}/member${3}
  fi
}
remote_status() {
  $CurlBIN -X GET -H "Authorization: token $apiToken" ${remoteAPIBase}/status
}
check_apiToken() {
  if [ ! -f ${TOKENAUTH} -o -z "$apiToken" ]; then
    # 重定向提示内容给webui
    {
      echo "The api token was not found. Use 'api.sh update xxxx' to add it." 1>&2
      exit 1
    }
  fi
}
help() {
  sed -rn 's/^### ?//;T;p;' "$0"
}
check_local_pid() {
  zpid=$(pgrep -f "zerotier-one")
    if [ -z $zpid ]; then
      {
        echo "{}" 1>&2
        exit 1
      }
    fi
}
# =========================== main ===========================
case $1 in
local)
  shift
  case $1 in
  status)
    check_local_pid
    local_status
    ;;
  service)
    shift
    local_service $1
    ;;
  network)
    check_local_pid
    shift
    action=$1
    networkid=$2
    bodydata=$3
    if [ -z "${bodydata}" ]; then
      bodydata="{}"
    fi
    if [ ! -z "${networkid}" ]; then
      networkid='/'"${networkid}"
    fi
    case $action in
    list)
      local_networks "GET" "${bodydata}" ${networkid}
      ;;
    leave)
      local_networks "DELETE" "${bodydata}" ${networkid}
      ;;
    join)
      local_networks "POST" "${bodydata}" ${networkid}
      ;;
    esac
    ;;
  peer)
    check_local_pid
    local_peer
    ;;
  firewall)
    shift
    local_firewall $1
    ;;
  router)
    shift
    local_router $@
    ;;
  moon)
    check_local_pid
    shift
    local_moon $@
    ;;
  esac
  ;;
central)
  check_apiToken
  shift
  case $1 in
  status)
    remote_status
    ;;
  network)
    shift
    action=$1
    networkid=$2
    bodydata=$3
    if [ -z "${bodydata}" ]; then
      bodydata="{}"
    fi
    if [ ! -z "${networkid}" ]; then
      networkid='/'"${networkid}"
    fi
    case $action in
    list)
      api_networks "GET" "${bodydata}" ${networkid}
      ;;
    remove)
      api_networks "DELETE" "${bodydata}" ${networkid}
      ;;
    add)
      api_networks "POST" "${bodydata}" ""
      ;;
    modify)
      api_networks "POST" "${bodydata}" ${networkid}
      ;;
    esac
    ;;
  member)
    shift
    action=$1
    networkid=$2
    memberID=$3
    bodydata=$4
    if [ -z "${bodydata}" ]; then
      bodydata="{}"
    fi
    if [ ! -z "${memberID}" ]; then
      memberID='/'"${memberID}"
    fi
    case $action in
    list)
      api_members "GET" ${networkid} ${memberID}
      ;;
    remove)
      api_members "DELETE" ${networkid} ${memberID}
      ;;
    modify)
      api_members "POST" ${networkid} ${memberID} "${bodydata}"
      ;;
    esac
    ;;
  esac
  ;;
apiToken)
  shift
  action=$1
  key=$2
  case $action in
  show)
    check_apiToken
    echo "${apiToken}"
    ;;
  update)
    echo "${key}" >${TOKENAUTH}
    echo "done"
    ;;
  esac
  ;;
dns)
  shift
  action=$1
  servers=$2
  case $action in
  show)
    if [ -f "$DNSFILE" ]; then
      cat "$DNSFILE"
    fi
    ;;
  update)
    if [ -z "$servers" ]; then
      rm -f "$DNSFILE"
    else
      echo "$servers" >"$DNSFILE"
    fi
    echo "done"
    ;;
  esac
  ;;
*)
  help
  ;;
esac
