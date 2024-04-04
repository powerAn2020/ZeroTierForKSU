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
# A 和 D
firewall(){
  iptables -$1 INPUT -p udp --dport 9993 -j ACCEPT
  # iptables6 -$1 INPUT -p udp --dport 9993 -j ACCEPT
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
  *)
    echo "Unsupported operation"
esac
