fix(ui): standardize storage keys and improve nodeId caching

- unify localStorage keys with ZeroTierForKSU.* prefix across ui-new and ui-src

- add getStorageItem helper for seamless migration from legacy keys

- persist and restore nodeId in appStore to prevent status flickering

- localize fallback nodeId display in Dashboard
