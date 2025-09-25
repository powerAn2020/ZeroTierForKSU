## Module Changelog
更新zerotier到1.16.0 1. 添加action.sh ，用于切换服务状态 2. 修复流水线 3. 更新zerotier到1.16.0
 ===================
## Zerotier Changelog
## 2025-08-21 -- Version 1.16.0

  * License Changes
    * The core (`node/` and `include/`) and the service (`service/` and `osdep/`) are now under the Mozilla Public License (MPL).
    * The network controller (`controller/`) is now under a commercial source-available license.
    * Use `make ZT_NONFREE=1` to build non-MPL components.
    * Building with `ZT_NONFREE=1` changes the license of the resulting executable to a proprietary commercial license vs. MPL.
  * Default binary builds no longer contain the controller.
  * Network-Specific Relays (preview / beta)
    * It is now possible to designate one or more nodes as network-specific relays to be used in preference to roots for relayed traffic between members of a network. These nodes need not necessarily be members of the network.
    * "Moons" are now considered even more extra *deprecated* and should not be used in new deployments.
    * We will announce support for network-specific relays once we have worked with some users to test and performed more internal validation.
  * HELLO packet encryption is now available by enabling the `encryptedHelloEnabled` settting in `local.conf`.
    * HELLO packets contain no data, only public keys and very basic meta-data like protocol version information.
    * Most users won't care about this, but if you require this for e.g. compliance reasons you can enable. This adds a small amount of CPU and bandwidth overhead to the HELLO sign-on process.
  * Small Fixes
    * Code has been reformatted using `clang-format` with a `.clang-format` definition in the repo. Typing `make clang-format` executes this against all main core and service C++ files.
    * Bridges are no longer counted toward multicast limits.
    * A flow designation issue in bridged traffic under multipath scenarios has been fixed.
    * Library version updates for OIDC and other features.
    * Antiquated and unused software update code removed for precautionary reasons.
    * Compiler warnings removed through removing use of deprecated functions on some platforms.
    * Other minor bug fixes.

  * Merged PRs:
    * PR #2495: Hosted controller changes for cv1 os/arch reporting
    * PR #2493: Add a warning about missing DNS functionality on Linux
    * PR #2491: Fix: standardize bond link selection method JSON field naming
    * PR #2489: Fix link select field in bond CLI
    * PR #2487: Windows installer fixes
    * PR #2486: Add 'apt update' to validation action
    * PR #2482: Add OpenTelemetry support in Central Controllers
    * PR #2481: Rust warning removal, clippy allows, update library versions
    * PR #2477: Don't count bridges towards multicast limit. Send to all bridges
    * PR #2475: clang-format
    * PR #2474: Hello encryption
    * PR #2452: CV2 db schema support
    * PR #2451: Bump crossbeam-channel from 0.5.13 to 0.5.15 in /rustybits
    * PR #2450: Bump tokio from 1.42.0 to 1.43.1 in /rustybits
    * PR #2449: Bump openssl from 0.10.70 to 0.10.72 in /rustybits
    * PR #2445: Allow setting local.conf content from Docker environment variable
    * PR #2444: Temporal sdk fix
    * PR #2443: Fix AuthInfo Provider not being set
    * PR #2442: Bump ring from 0.17.8 to 0.17.13 in /rustybits
    * PR #2441: Run CI on pull requests
    * PR #2438: Add custom control plane for third-party device vendors
    * PR #2432: Update upload-artifact action to use v4
    * PR #2430: Bump openssl from 0.10.68 to 0.10.70 in /rustybits
    * PR #2427: Fix active backup link selection
    * PR #2417: Update rust dependencies
    * PR #2409: Bump rustls from 0.23.15 to 0.23.18 in /rustybits
    * PR #2405: Build fix for OpenBSD - See ticket #2397

----

# 1.14

