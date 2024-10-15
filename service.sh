#!/system/bin/sh
MODDIR=${0%/*}
ZTPATH=/data/adb/zerotier
TOKENAUTH=$ZTPATH/TOKENAUTH

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
(
    until [ $(getprop init.svc.bootanim) = "stopped" ]; do
        sleep 10
    done
    if [ ! -f "${TOKENAUTH}" ]; then
      touch $TOKENAUTH
    fi
    ${MODDIR}/zerotier.sh inotifyd
    # inotifyd "${MODDIR}/build.inotify" "/sdcard/Download/dist" &
    if [ ! -f "${MANUAL}" ]; then
      sh ${MODDIR}/zerotier.sh start
    else
      touch ${ZTPATH}/state/disable
    fi
  
)&