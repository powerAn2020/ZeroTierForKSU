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

current_time=$(date +"%I:%M %P")

zpid=$( $busybox pgrep -f "zerotier-one")
if [ -z $zpid ]; then
  start_service
  echo "${current_time} start service"
  $MODDIR/zerotier.sh start
else
  echo "${current_time} stop service"
  $MODDIR/zerotier.sh stop
fi
sleep 3