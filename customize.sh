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

ui_print "OS ARCH is $ARCH"
# # check ARCH
# if [ "$ARCH" != "arm" -a "$ARCH" != "arm64" -a "$ARCH" != "aarch64" ]; then
#   abort "Installed failed,Current ARCH is $ARCH,only support arm/arm64"
# fi

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
set_perm_recursive $MODPATH 0 0 0755 0755

ui_print "- Installation is complete, reboot your device"
