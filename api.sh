#!/system/bin/sh
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
MANUAL=/data/adb/zerotier/MANUAL

PIDFILE=$ZTPATH/zerotier-one.pid
ZEROTIERD=$MODDIR/zerotier-one
SECRETFILE=$ZTPATH/authtoken.secret
TOKEN=$(cat ${SECRETFILE})
CurlBIN=${MODDIR}/bin/curl
#TODO 构建阶段需要下载二进制curl到bin目录
# local latest_version=$(busybox wget --no-check-certificate -qO- "https://api.github.com/repos/stunnel/static-curl/releases" | grep "tag_name" | busybox grep -oE "[0-9.]*" | head -1)
# local download_link="https://github.com/stunnel/static-curl/releases/download/${latest_version}/curl-linux-${arch}-${latest_version}.tar.xz"
# if ! busybox tar -xJf "${bin_dir}/curl.tar.xz" -C "${bin_dir}" >&2; then
#     log Error "Failed to extract ${bin_dir}/curl.tar.xz" >&2
#     cp "${bin_dir}/backup/curl.bak" "${bin_dir}/curl" >/dev/null 2>&1 && log Info "Restored curl" || return 1
#   fi
status(){
  $CurlBIN -H "X-ZT1-Auth: $TOKEN" http://localhost:9993/status
}

networks(){
  $CurlBIN -H "X-ZT1-Auth: $TOKEN" http://localhost:9993/network
}

leaveNetwork(){
  $CurlBIN -X DELETE -H "X-ZT1-Auth: $TOKEN" http://localhost:9993/network/$1
}

joinOrUpdateNetwork() {
  $CurlBIN -X POST -H "X-ZT1-Auth: $TOKEN" -d $2 http://localhost:9993/network/$1 
}
# $1 :A 和 D
firewall(){
  if [ "$1" != "A" || "$1" != "D" ];then
    echo "only [A,D]"
    exit 1
  fi
  iptables -$1 INPUT -p udp --dport 9993 -j ACCEPT
  ip6tables -$1 INPUT -p udp --dport 9993 -j ACCEPT
}
# join moon
orbit(){
  sh ${MODDIR}/zerotier-cli orbit $1 $1
}
router() {
  if [ "$1" = "0" ];then
    echo "Unrealized"
    #TODO android默认ip rule不走main表 除了提升main表优先级,是否还有其它解决方案？
    # Reference https://yotam.net/posts/network-management-in-android-routing/
    # Reference https://unix.stackexchange.com/questions/424314/changing-default-ip-rule-priority-for-main-table
    # Reference https://github.com/zerotier/ZeroTierOne/issues/1715#issuecomment-1780625754

    # ip route add table $your_selected_table_id $cide/$prefix dev $zt_iface_name proto kernel scope link
  else
    # Reference https://blog.csdn.net/G_Rookie/article/details/109679262
    if [ "$2" = "add" ];then
      ip rule add from all lookup main pref 9000
    else 
      ip rule del from all lookup main pref 9000
    fi
  fi
}
case $1 in
  status)
    status
    ;;
  networks)
    networks $2
    ;;
  leaveNetwork)
    leaveNetwork $2
    ;;
  joinOrUpdateNetwork)
    joinOrUpdateNetwork $2 ''$3''
    ;;
  firewall)
    firewall $2 
    ;;
  router)
    router $@
    ;;
  orbit)
    orbit $@
    ;;
  *)
    echo "Unsupported operation"
esac
