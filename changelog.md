## Module Changelog
update config
 ===================
## Zerotier Changelog
## 2026-05-20 -- Version 1.16.2
 
  * Fixed line endings for the zttap300.inf for the Windows ARM x64 install.
  * Internal updates to the central controller (CV1) including schema changes and a multi-architecture Docker build pipeline.
  * Increased `ZT_MAX_NETWORK_SPECIALISTS` from 256 to 512 to accommodate users with large networks that exceeded the previous limit. The network config dictionary capacity was raised correspondingly.
  * Resolved intermittent multi-minute delays when leaving one network and joining another under Windows.
  * Compiler warning cleanup across the codebase, covering GCC 14, Clang 18, and Clang 21.

