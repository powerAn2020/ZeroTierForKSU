<script lang="ts">
  import { onMount } from "svelte";
  import { pop } from "@/lib/router";
  import { t } from "svelte-i18n";
  import { ArrowLeft, Globe, Zap, Cpu } from "lucide-svelte";
  import Button from "@/lib/components/ui/button/Button.svelte";
  import { LocalApi } from "@/api/local";
  import type { LocalPeer } from "@/types/zerotier";
  import { cn } from "@/lib/utils";

  export let params: { id: string } = { id: "" };

  let peers: LocalPeer[] = [];
  let loading = true;

  onMount(async () => {
    try {
      peers = await LocalApi.getPeers();
    } catch (e) {
      console.error("Failed to load peers", e);
    } finally {
      loading = false;
    }
  });

  function formatLatency(ms: number) {
    if (ms < 0) return "-";
    if (ms === 0) return "-";
    return `${ms}ms`;
  }

  function formatLastSeen(timestamp: number) {
    if (!timestamp || timestamp <= 0) return "Never";
    const diff = Date.now() - timestamp;
    if (diff < 1000) return $t("common.time.justNow");
    if (diff < 60000)
      return `${Math.floor(diff / 1000)}${$t("common.time.seconds")} ${$t("common.time.ago")}`;
    if (diff < 3600000)
      return `${Math.floor(diff / 60000)}${$t("common.time.minutes")} ${$t("common.time.ago")}`;
    if (diff < 86400000)
      return `${Math.floor(diff / 3600000)}${$t("common.time.hours")} ${$t("common.time.ago")}`;
    return `${Math.floor(diff / 86400000)}${$t("common.time.days")} ${$t("common.time.ago")}`;
  }
  $: groupedPeers = {
    PLANET: peers.filter((p) => p.role === "PLANET"),
    MOON: peers.filter((p) => p.role === "MOON"),
    LEAF: peers.filter((p) => p.role === "LEAF"),
  };

  type PeerRole = "PLANET" | "MOON" | "LEAF";

  // We need to reactively update sections when language changes
  $: sections = [
    {
      key: "PLANET" as PeerRole,
      label: $t("peers.sections.planet"),
      color: "text-blue-500",
    },
    {
      key: "MOON" as PeerRole,
      label: $t("peers.sections.moon"),
      color: "text-purple-500",
    },
    {
      key: "LEAF" as PeerRole,
      label: $t("peers.sections.leaf"),
      color: "text-green-500",
    },
  ];

  function formatAddress(address: string) {
    // Check if IPv6 (contains colon and looks long)
    if (address.includes(":") && address.length > 25) {
      // Extract IP and Port
      const parts = address.split("/");
      const ip = parts[0];
      const port = parts.length > 1 ? `/${parts[1]}` : "";

      if (ip.length > 15) {
        return `${ip.substring(0, 8)}...${ip.substring(ip.length - 8)}${port}`;
      }
    }
    return address;
  }
</script>

<div class="space-y-6 pb-20">
  <!-- Header -->
  <div
    class="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center gap-4 p-4 border-b"
  >
    <Button variant="ghost" size="icon" on:click={() => pop()}>
      <ArrowLeft class="h-6 w-6" />
    </Button>
    <div>
      <h1 class="text-xl font-bold tracking-tight">{$t("peers.title")}</h1>
      <p class="text-xs text-muted-foreground font-mono">{params.id}</p>
    </div>
  </div>

  <div class="px-4 pb-4">
    {#if loading}
      <div class="text-center py-10 text-muted-foreground">
        {$t("peers.loading")}
      </div>
    {:else if peers.length === 0}
      <div class="text-center py-10 text-muted-foreground">
        {$t("peers.none")}
      </div>
    {:else}
      <div class="space-y-6">
        {#each sections as section}
          {#if groupedPeers[section.key] && groupedPeers[section.key].length > 0}
            <div class="space-y-3">
              <h3
                class={cn(
                  "text-sm font-bold uppercase tracking-wider px-1 flex items-center gap-2",
                  section.color,
                )}
              >
                {section.label}
                <span
                  class="bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5 rounded-full"
                >
                  {groupedPeers[section.key].length}
                </span>
              </h3>
              <div class="grid gap-3">
                {#each groupedPeers[section.key] as peer (peer.id)}
                  <div
                    class="bg-card text-card-foreground border rounded-xl p-4 shadow-sm flex flex-col gap-2"
                  >
                    <div class="flex justify-between items-start">
                      <div class="flex items-center gap-2">
                        <span class="font-mono font-bold text-lg"
                          >{peer.id}</span
                        >
                        <span
                          class={cn(
                            "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                            peer.role === "PLANET"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              : peer.role === "MOON"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                          )}
                        >
                          {peer.role}
                        </span>
                      </div>
                      <div class="text-xs text-muted-foreground">
                        {peer.version}
                      </div>
                    </div>

                    <!-- Paths -->
                    <div class="text-sm space-y-1 mt-2">
                      {#each peer.paths as path}
                        <div class="flex justify-between items-center text-xs">
                          <span
                            class="font-mono text-muted-foreground truncate"
                            title={path.address}
                          >
                            {formatAddress(path.address)}
                          </span>
                          <div class="flex items-center gap-2 shrink-0 ml-2">
                            {#if path.active}
                              <span class="text-green-500 font-bold"
                                >{$t("peers.active")}</span
                              >
                            {/if}
                            <span
                              class="font-mono text-[10px] opacity-70 whitespace-nowrap"
                            >
                              {formatLastSeen(path.lastReceive)}
                            </span>
                          </div>
                        </div>
                      {/each}
                      {#if peer.paths.length === 0}
                        <div class="text-xs text-muted-foreground italic">
                          {$t("peers.noPaths")}
                        </div>
                      {/if}
                    </div>

                    <div
                      class="flex justify-end mt-2 pt-2 border-t border-dashed"
                    >
                      <span class="text-xs font-mono text-muted-foreground"
                        >{$t("peers.latency")}: {formatLatency(
                          peer.latency,
                        )}</span
                      >
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</div>
