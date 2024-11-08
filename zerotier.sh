#!/system/bin/sh

###
### ZeroTier for KSU - zerotier.sh
###
### Usage:
###   zerotier.sh options
###
### Options:
###   -h                                         -- Show this message.
###   start                                      -- Start Zerotier Service
###   restart                                    -- Retart Zerotier Service
###   stop                                       -- Stop Zerotier Service
###   status                                     -- Show Node Status
###   token                                      -- Show Local Service Token
###   apiToken                                   -- Show Remote Service apiToken
###   inotifyd                                   -- Start inotifyd Service
###   switch   [ main,dev ]                      -- Switch module version
###
### Example:
###   help
###     sh zerotier.sh -h
###     sh zerotier.sh start
###     sh zerotier.sh restart
###     sh zerotier.sh stop
###     sh zerotier.sh status
###     sh zerotier.sh token
###     sh zerotier.sh apiToken
###     sh zerotier.sh inotifyd
###     sh zerotier.sh switch dev
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
ALLOW_9993=${ZTPATH}/ALLOW_9993
KEEP_ON_UNINSTALL=${ZTPATH}/KEEP_ON_UNINSTALL
ROUTER_RULE_NEW=${ZTPATH}/ROUTER_RULE_NEW
PIDFILE=$ZTPATH/zerotier-one.pid
ZEROTIERD=$MODDIR/zerotier-one
SECRETFILE=$ZTPATH/authtoken.secret
current_time=$(date +"%I:%M %P")

start_inotifyd() {
  PIDs=$(pgrep -f inotifyd)
  for PID in "${PIDs[@]}"; do
    if grep -q "zerotier.inotify" "/proc/$PID/cmdline"; then
      kill -9 "$PID"
    fi
  done
  echo "inotifyd ${ZTPATH}/state"
  sed -Ei "s/^description=(\[.*][[:space:]]*)?/description=[ $current_time | inotifyd is running ] /g" $MODDIR/module.prop
  inotifyd "${MODDIR}/zerotier.inotify" "${ZTPATH}/state" >>/dev/null 2>&1 &
}

stop_service() {
  zpid=$(pgrep -f "zerotier-one")
  if [ -z $zpid ]; then
    echo "service is stop"
  else
    kill $zpid
  fi
  if [ ! -f "${ALLOW_9993}" ]; then
    # set firewall
    sh ${MODDIR}/api.sh local firewall D
  fi
  sed -Ei "s/^description=(\[.*][[:space:]]*)?/description=[ $current_time | ❌ service is stop ] /g" $MODDIR/module.prop

  if [ ! -f ${ROUTER_RULE_NEW} ]; then
    sh ${MODDIR}/api.sh local router main del
  fi
  # /data/adb/ksu/bin/ksud module disable ZeroTierForKSU
  echo done.
}
status_service() {
  zpid=$(pgrep -f "zerotier-one")
  uninstallKeep=true
  if [ ! -f "${KEEP_ON_UNINSTALL}" ]; then
    uninstallKeep=false
  fi
  autoStart=false
  if [ ! -f "${MANUAL}" ]; then
    autoStart=true
  fi

  routerRuleNew=1
  if [ -f ${ROUTER_RULE_NEW} ]; then
    routerRuleNew=0
  fi
  firewall=true
  if [ ! -f "${ALLOW_9993}" ]; then
    firewall=false
  fi
  cliStatus=$(sh ${MODDIR}/zerotier-cli status)
  if [ $? != 0 ]; then
    cliStatus=''
  fi
  apiToken=$(get_apiToken)
  if [ $? != 0 ]; then
    apiToken=''
  fi
  branch=$(get_branch)
  if [ $? != 0 ]; then
    branch=''
  fi
  data='{ "enable": "'${zpid}'","branch": "'${branch}'", "firewall": '${firewall}', "autoStart": '${autoStart}', "apiToken": "'${apiToken}'", "uninstallKeep": '${uninstallKeep}',"routerRuleNew": '${routerRuleNew}', "cliStatus": "'${cliStatus}'" }'
  echo $data
}
start_service() {
  zpid=$(pgrep -f "zerotier-one")
  if [ -z $zpid ]; then
    if [ -f "${ALLOW_9993}" ]; then
      # set firewall
      sh ${MODDIR}/api.sh local firewall A
    fi
    # Start ZEROTIERD
    echo "starting $ZEROTIERD... \c"
    if [ -f ${ZTPATH}/state/disable ]; then
      rm ${ZTPATH}/state/disable
    fi
    $ZEROTIERD -d $ZTPATH 2>&1 >$ZTPATH/error.log
    zt_rc=$?
    if [ $zt_rc -ne 0 ]; then
      echo "$0: Error ${zt_rc} starting ${ZEROTIERD}... bailing."
      exit $zt_rc
    fi
    sed -Ei "s/^description=(\[.*][[:space:]]*)?/description=[ $current_time | ✔︎ service is running ] /g" $MODDIR/module.prop
    if [ ! -f ${ROUTER_RULE_NEW} ]; then
      sh ${MODDIR}/api.sh local router main add
    fi
  else
    echo "service is running,pid:$zpid"
  fi
  # /data/adb/ksu/bin/ksud module enable ZeroTierForKSU
  echo done.
}
get_token() {
  echo "$(cat ${SECRETFILE})"
}
get_apiToken() {
  apiToken=$(grep -v '^[[:space:]]*$' $ZTPATH/TOKENAUTH)
  if [ -f $ZTPATH/TOKENAUTH -a -n "$apiToken" ]; then
    echo $apiToken
  else
    {
      echo "The api token was not found. Use 'api.sh update xxxx' to add it." 1>&2
      exit 1
    }
  fi
}
switch_brach(){
  version=$1
  arch=$(sed -n '/arch=/s/arch=\(.*\)/\1/p' ${MODDIR}/module.prop)
  if [ "$version" = "main" ];then
    sed -i -E "s/dev\/update_${arch}_dev/main\/update_${arch}/g" ${MODDIR}/module.prop
  else
    sed -i -E "s/main\/update_${arch}/dev\/update_${arch}_dev/g" ${MODDIR}/module.prop
  fi
  ;;
}
get_branch(){
  sed -E 's/.*ZeroTierOneForKSU\/([^/]+).*/\1/g' $MODDIR/module.prop
}

help() {
  sed -rn 's/^### ?//;T;p;' "$0"
}

case $1 in
start)
  start_service
  ;;
stop)
  stop_service
  ;;
restart)
  stop_service
  start_service
  ;;
status)
  status_service
  ;;
token)
  get_token
  ;;
apiToken)
  get_apiToken
  ;;
inotifyd)
  start_inotifyd
  ;;
switch)
  shift
  switch_brach $1
  ;;
*)
  help
  ;;
esac
