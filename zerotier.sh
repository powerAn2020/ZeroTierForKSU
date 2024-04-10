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
current_time=$(date +"%I:%M %P")

start_inotifyd() {
  PIDs=$(pgrep -f inotifyd)
  for PID in "${PIDs[@]}"; do
    if grep -q "zerotier.inotify" "/proc/$PID/cmdline"; then
      kill -9 "$PID"
    fi
  done
  echo "inotifyd ${MODDIR}"
  inotifyd "${MODDIR}/zerotier.inotify" "${MODDIR}" >> "/dev/null" 2>&1 &
}

stop_service() {
  zpid=$(pgrep -f "zerotier-one")
  if [ -z $zpid ];then
    echo "service is stop"
  else
    kill $zpid
  fi
  if [ ! -f "/data/adb/zerotier/ALLOW_9993" ]; then
    # set firewall
    sh ${MODDIR}/api.sh firewall D
  fi
  sed -Ei "s/^description=(\[.*][[:space:]]*)?/description=[ $current_time | ☹ service is stop ] /g" $MODDIR/module.prop

  if [ "$1" = "1" ];then
    sh ${MODDIR}/api.sh router 1 del
  fi
  echo done.
}
status_service() {
  zpid=$(pgrep -f "zerotier-one")
  uninstallKeep=true
  if [ ! -f "/data/adb/zerotier/KEEP_ON_UNINSTALL" ]; then
    uninstallKeep=false
  fi
  autoStart=false
  if [ ! -f "/data/adb/zerotier/MANUAL" ]; then
    autoStart=true
  fi
  firewall=true
  if [ ! -f "/data/adb/zerotier/ALLOW_9993" ]; then
    firewall=false
  fi
  cliStatus=$(sh ${MODDIR}/zerotier-cli status);
  data='{ "enable": "'${zpid}'", "firewall": '${firewall}', "autoStart": '${autoStart}', "uninstallKeep": '${uninstallKeep}', "cliStatus": "'${cliStatus}'" }'
  echo $data
}
start_service() {
  zpid=$(pgrep -f "zerotier-one")
  if [ -z $zpid ];then
    if [ -f "/data/adb/zerotier/ALLOW_9993" ]; then
      # set firewall
      sh ${MODDIR}/api.sh firewall A
    fi
    # Start ZEROTIERD
    echo "starting $ZEROTIERD... \c"
    # ASH_STANDALONE=1 /data/adb/ksu/bin/busybox sh 
    $ZEROTIERD -d $ZTPATH > $ZTPATH/error.log
    sshd_rc=$?
    if [ $sshd_rc -ne 0 ]; then
      echo "$0: Error ${sshd_rc} starting ${ZEROTIERD}... bailing."
      exit $sshd_rc
    fi
    sed -Ei "s/^description=(\[.*][[:space:]]*)?/description=[ $current_time | 😊 service is running ] /g" $MODDIR/module.prop
    if [ "$1" = "1" ];then
      sh ${MODDIR}/api.sh router 1 add
    fi
  else
    echo "service is running,pid:$zpid"
  fi
  echo done.
}
get_token() {
  echo "$(cat ${SECRETFILE})"
}

case $1 in
  start)
    shift
    start_service $@
    ;;
  stop)
    shift
    stop_service $@
    ;;
  restart)
    shift
    stop_service $@
    start_service $@
    ;;
  status)
    status_service
    ;;
  token)
    get_token
    ;;
  inotifyd)
    start_inotifyd
    ;;
  *)
    echo "Unsupported operation [start,stop,restart,status,token,inotifyd]"
esac