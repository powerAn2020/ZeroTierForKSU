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

start_inotifyd() {
  PIDs=($(pgrep -f inotifyd))
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
  # set firewall
  sh ${MODDIR}/api.sh firewall D
  if [ "$1" = "1" ];then
    sh ${MODDIR}/api.sh router del
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
  data='{ "enable": "'${zpid}'", "checked": true, "autoStart": '${autoStart}', "uninstallKeep": '${uninstallKeep}' }'
  echo $data
}
start_service() {
  zpid=$(pgrep -f "zerotier-one")
  if [ -z $zpid ];then
    # set firewall
    sh ${MODDIR}/api.sh firewall A
    # Start ZEROTIERD
    echo "starting $ZEROTIERD... \c"
    nohup $ZEROTIERD -d $ZTPATH > /dev/null 2> $ZTPATH/error.log &
    sshd_rc=$?
    if [ $sshd_rc -ne 0 ]; then
      echo "$0: Error ${sshd_rc} starting ${ZEROTIERD}... bailing."
      exit $sshd_rc
    fi
    if [ "$1" = "1" ];then
      sh ${MODDIR}/api.sh router add
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
    start_service $2
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
  *)
    echo "Unsupported operation [start,stop,restart,status,token]"
esac