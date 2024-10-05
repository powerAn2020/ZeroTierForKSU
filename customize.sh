#!/sbin/sh

# ASH_STANDALONE=1

### INSTALLATION ###

if [ "$BOOTMODE" != true ]; then
  ui_print "-----------------------------------------------------------"
  ui_print "! Please install in Magisk Manager or KernelSU Manager"
  ui_print "! Install from recovery is NOT supported"
  abort "-----------------------------------------------------------"
elif [ "$KSU" = true ] && [ "$KSU_VER_CODE" -lt 11551 ]; then
  abort "ERROR: Please update your KernelSU and KernelSU Manager"
fi

# check android
if [ "$API" -lt 28 ]; then
  ui_print "! Unsupported sdk: $API"
  abort "! Minimal supported sdk is 28 (Android 9)"
else
  ui_print "- Device sdk: $API"
fi

# check version
if [ "$KSU" = true ]; then
  ui_print "- kernelSU version: $KSU_VER ($KSU_VER_CODE)"
else
  ui_print "- Magisk version: $MAGISK_VER ($MAGISK_VER_CODE)"
fi



ui_print "- Installing Zerotier for KSU"

if [ ! -d "/data/adb/zerotier" ]; then
  mkdir -p /data/adb/zerotier/state
  touch /data/adb/zerotier/TOKENAUTH
  set_perm /data/adb/zerotier 0 0 0755
  set_perm /data/adb/zerotier/state 0 0 0755
fi



ui_print "- Setting permissions"
set_perm_recursive $MODPATH 0 0 0755 0644
set_perm $MODPATH/zerotier 0  0  0755
set_perm $MODPATH/zerotier-one 0  0  0755
set_perm $MODPATH/zerotier-idtool 0  0  0755
set_perm $MODPATH/zerotier-cli 0  0  0755
set_perm $MODPATH/zerotier.sh 0  0  0755
set_perm $MODPATH/zerotier.inotify 0  0  0755
set_perm $MODPATH/build.inotify 0  0  0755
set_perm $MODPATH/api.sh 0  0  0755
set_perm $MODPATH/uninstall.sh 0  0  0755
set_perm $MODPATH/bin/curl 0  0  0755
set_perm $MODPATH/service.sh 0  0  0755

ui_print "- Installation is complete, reboot your device"