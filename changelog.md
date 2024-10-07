Module Changelog
更新 README.md
 ===================
 Zerotier Changelog
# 2024-09-12 -- Version 1.14.1

  * Multithreaded packet I/O support! Currently this is just for Linux and must
    be enabled in local.conf. It will likely make the largest difference on small
    multi-core devices where CPU is a bottleneck and high throughput is desired.
    It may be enabled by default in the future but we want it to be thoroughly
    tested. It's a little harder than it seems at first glance due to the need
    to keep packets in sequence and balance load.
  * Several multipath bug fixes.
  * Updated the versions on a number of libraries related to OIDC support and HTTP.
  * MacOS .app now shows the correct version in its Info.plist manifest.
  * Sanitize MAC addresses in JSON format rules parser.
  * Some basic information about the platform (OS, CPU architecture) is now reported
    to network controllers when networks are joined so it can be displayed to
    network admins and in the future used in policy checking and inventory operations.

