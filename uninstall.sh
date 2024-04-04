#!/system/bin/sh

if [ ! -f "/data/adb/zerotier/KEEP_ON_UNINSTALL" ]; then
  rm -rf /data/adb/zerotier
fi
