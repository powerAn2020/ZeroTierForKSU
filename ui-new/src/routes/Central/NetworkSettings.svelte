<script lang="ts">
  import { onMount } from "svelte";
  import { pop } from "@/lib/router";
  import { t } from "svelte-i18n";
  import { ArrowLeft, Plus, Trash2, Save } from "lucide-svelte";
  import Button from "@/lib/components/ui/button/Button.svelte";
  import Input from "@/lib/components/ui/input/Input.svelte";
  import Label from "@/lib/components/ui/label/Label.svelte";
  import Switch from "@/lib/components/ui/switch/Switch.svelte";
  import { CentralApi } from "@/api/central";
  import { toast } from "@/stores/toast";
  import type { CentralNetwork } from "@/types/zerotier";
  import { cn } from "@/lib/utils";

  export let params: { id: string };

  let network: CentralNetwork | null = null;
  let loading = true;
  let saving = false;

  // Form state
  let config = {
    name: "",
    private: true,
    description: "",
    v4AssignMode: { zt: false },
    v6AssignMode: { zt: false, "6plane": false, rfc4193: false },
    mtu: 2800,
    multicastLimit: 32,
    dns: { domain: "", servers: [] as string[] },
    routes: [] as { target: string; via?: string }[],
    enableBroadcast: false,
    ipAssignmentPools: [] as { ipRangeStart: string; ipRangeEnd: string }[],
  };

  // Route input state
  let newRoute = { target: "", via: "" };
  let newCidr = "";

  onMount(async () => {
    await loadNetwork();
  });

  async function loadNetwork() {
    loading = true;
    try {
      network = await CentralApi.getNetwork(params.id);
      if (network) {
        config = {
          name: network.config.name || "",
          private: network.config.private,
          description: network.description || "",
          v4AssignMode: network.config.v4AssignMode || { zt: false },
          v6AssignMode: network.config.v6AssignMode || {
            zt: false,
            "6plane": false,
            rfc4193: false,
          },
          mtu: network.config.mtu || 2800,
          multicastLimit: network.config.multicastLimit || 32,
          dns: network.config.dns || { domain: "", servers: [] },
          routes: network.config.routes || [],
          enableBroadcast: network.config.enableBroadcast || false,
          ipAssignmentPools: network.config.ipAssignmentPools || [],
        };
      }
    } catch (e: any) {
      toast.error("Failed to load network: " + e.message);
    } finally {
      loading = false;
    }
  }

  async function saveSettings() {
    if (!network) return;
    saving = true;
    try {
      // Construct API payload structure
      const payload = {
        config: {
          name: config.name,
          private: config.private,
          v4AssignMode: config.v4AssignMode,
          v6AssignMode: config.v6AssignMode,
          mtu: parseInt(config.mtu as any),
          multicastLimit: parseInt(config.multicastLimit as any),
          dns: config.dns,
          routes: config.routes,
          enableBroadcast: config.enableBroadcast,
          ipAssignmentPools: config.ipAssignmentPools,
        },
        description: config.description,
      };

      await CentralApi.updateNetwork(network.id, payload);
      toast.success($t("common.success"));
      await loadNetwork(); // Reload to confirm
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to save settings: " + e.message);
    } finally {
      saving = false;
    }
  }

  function addRoute() {
    if (!newRoute.target) {
      toast.error("Target is required");
      return;
    }
    config.routes = [...config.routes, { ...newRoute }];
    newRoute = { target: "", via: "" };
  }

  function removeRoute(index: number) {
    config.routes = config.routes.filter((_, i) => i !== index);
  }

  function addDnsServer() {
    config.dns.servers = [...config.dns.servers, ""];
  }

  function updateDnsServer(index: number, value: string) {
    const servers = [...config.dns.servers];
    servers[index] = value;
    config.dns.servers = servers;
  }

  function removeDnsServer(index: number) {
    config.dns.servers = config.dns.servers.filter((_, i) => i !== index);
  }

  function ipToLong(ip: string) {
    return (
      ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>>
      0
    );
  }

  function longToIp(long: number) {
    return [
      (long >>> 24) & 0xff,
      (long >>> 16) & 0xff,
      (long >>> 8) & 0xff,
      long & 0xff,
    ].join(".");
  }

  function cidrToRange(cidr: string) {
    const [ip, maskStr] = cidr.split("/");
    const maskBits = parseInt(maskStr);

    if (!ip || isNaN(maskBits) || maskBits < 0 || maskBits > 32) {
      throw new Error("Invalid CIDR format");
    }

    const ipLong = ipToLong(ip);
    const mask = ~((1 << (32 - maskBits)) - 1);
    const network = ipLong & mask;
    const broadcast = network | ~mask;

    // Usually pool involves avoiding network and broadcast addresses
    // Start at .1, End at .254 for a /24
    // General rule: Network + 1 to Broadcast - 1
    const start = network + 1;
    const end = broadcast - 1;

    if (start > end) throw new Error("Invalid pool range");

    return {
      ipRangeStart: longToIp(start),
      ipRangeEnd: longToIp(end),
    };
  }

  function addPool() {
    try {
      const range = cidrToRange(newCidr);
      config.ipAssignmentPools = [...config.ipAssignmentPools, range];
      newCidr = "";
    } catch (e: any) {
      toast.error("Invalid CIDR: " + e.message);
    }
  }

  function removePool(index: number) {
    config.ipAssignmentPools = config.ipAssignmentPools.filter(
      (_, i) => i !== index,
    );
  }
</script>

<div class="p-4 space-y-6 pb-24">
  <div
    class="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 -mt-4 -mx-4 px-4 border-b mb-6 flex items-center gap-4"
  >
    <Button variant="ghost" size="icon" on:click={() => pop()}>
      <ArrowLeft class="h-5 w-5" />
    </Button>
    <div class="flex-1">
      <h1 class="text-2xl font-bold tracking-tight">
        {$t("centralSettings.title")}
      </h1>
      <p class="text-sm text-muted-foreground font-mono">
        {params.id}
      </p>
    </div>
    <Button disabled={saving || loading} on:click={saveSettings}>
      {#if saving}
        {$t("common.saving")}
      {:else}
        <Save class="h-4 w-4 mr-2" />
        {$t("common.save")}
      {/if}
    </Button>
  </div>

  {#if loading}
    <div class="space-y-4">
      <div
        class="h-10 class-skeleton w-full bg-muted animate-pulse rounded"
      ></div>
      <div
        class="h-64 class-skeleton w-full bg-muted animate-pulse rounded"
      ></div>
    </div>
  {:else if network}
    <div class="grid gap-6">
      <!-- General -->
      <div class="bg-card border rounded-lg p-4 space-y-4">
        <h2 class="text-lg font-semibold border-b pb-2">
          {$t("centralSettings.general.title")}
        </h2>
        <div class="grid gap-2">
          <Label for="name">{$t("centralSettings.general.name")}</Label>
          <Input id="name" bind:value={config.name} />
        </div>
        <div class="grid gap-2">
          <Label for="description">{$t("centralSettings.general.desc")}</Label>
          <Input id="description" bind:value={config.description} />
        </div>
        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <Label>{$t("centralSettings.general.private")}</Label>
            <p class="text-xs text-muted-foreground">
              {$t("centralSettings.general.privateDesc")}
            </p>
          </div>
          <Switch bind:checked={config.private} />
        </div>
      </div>

      <!-- IPv4 Assignment -->
      <div class="bg-card border rounded-lg p-4 space-y-4">
        <h2 class="text-lg font-semibold border-b pb-2">
          {$t("centralSettings.ipv4.title")}
        </h2>
        <div class="flex items-center justify-between">
          <Label>{$t("centralSettings.ipv4.ztManaged")}</Label>
          <Switch bind:checked={config.v4AssignMode.zt} />
        </div>

        {#if config.v4AssignMode.zt}
          <div class="space-y-3 pt-2">
            <Label>{$t("centralSettings.ipv4.pools")}</Label>
            {#each config.ipAssignmentPools as pool, i}
              <div
                class="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded"
              >
                <div class="flex-1 font-mono">
                  {pool.ipRangeStart} - {pool.ipRangeEnd}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-6 w-6 text-destructive"
                  on:click={() => removePool(i)}
                >
                  <Trash2 class="h-3 w-3" />
                </Button>
              </div>
            {/each}

            <div class="flex gap-2 items-end">
              <div class="grid gap-1 flex-1">
                <Label class="text-xs"
                  >{$t("centralSettings.ipv4.addCidr")}</Label
                >
                <Input
                  placeholder="10.0.0.0/24"
                  bind:value={newCidr}
                  class="h-8 font-mono"
                />
              </div>
              <Button size="sm" class="h-8" on:click={addPool}>
                <Plus class="h-4 w-4" />
              </Button>
            </div>
          </div>
        {/if}
      </div>

      <!-- IPv6 Assignment -->
      <div class="bg-card border rounded-lg p-4 space-y-4">
        <h2 class="text-lg font-semibold border-b pb-2">
          {$t("centralSettings.ipv6.title")}
        </h2>
        <div class="flex items-center justify-between">
          <Label>{$t("centralSettings.ipv4.ztManaged")}</Label>
          <Switch bind:checked={config.v6AssignMode.zt} />
        </div>
        <div class="flex items-center justify-between">
          <Label>{$t("centralSettings.ipv6.6plane")}</Label>
          <Switch bind:checked={config.v6AssignMode["6plane"]} />
        </div>
        <div class="flex items-center justify-between">
          <Label>{$t("centralSettings.ipv6.rfc4193")}</Label>
          <Switch bind:checked={config.v6AssignMode.rfc4193} />
        </div>
      </div>

      <!-- Routes -->
      <div class="bg-card border rounded-lg p-4 space-y-4">
        <h2 class="text-lg font-semibold border-b pb-2">
          {$t("centralSettings.routes.title")}
        </h2>
        <div class="space-y-2">
          {#each config.routes as route, i}
            <div
              class="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded cursor-pointer hover:bg-muted transition-colors w-full text-left"
              role="button"
              tabindex="0"
              on:click={() => {
                newRoute = { target: route.target, via: route.via || "" };
              }}
              on:keydown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  newRoute = { target: route.target, via: route.via || "" };
                }
              }}
            >
              <div class="flex-1 font-mono">
                {route.target}
                {#if route.via}
                  <span class="text-muted-foreground"> via </span>
                  {route.via}
                {/if}
              </div>
              <Button
                variant="ghost"
                size="icon"
                class="h-6 w-6 text-destructive"
                on:click={(e) => {
                  e.stopPropagation();
                  removeRoute(i);
                }}
              >
                <Trash2 class="h-3 w-3" />
              </Button>
            </div>
          {/each}
        </div>
        <div class="flex gap-2 items-end">
          <div class="grid gap-1 flex-1">
            <Label class="text-xs">{$t("centralSettings.routes.target")}</Label>
            <Input
              placeholder="10.0.0.0/24"
              bind:value={newRoute.target}
              class="h-8"
            />
          </div>
          <div class="grid gap-1 flex-1">
            <Label class="text-xs">{$t("centralSettings.routes.via")}</Label>
            <Input
              placeholder="1.2.3.4"
              bind:value={newRoute.via}
              class="h-8"
            />
          </div>
          <Button size="sm" class="h-8" on:click={addRoute}>
            <Plus class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <!-- DNS -->
      <div class="bg-card border rounded-lg p-4 space-y-4">
        <h2 class="text-lg font-semibold border-b pb-2">
          {$t("centralSettings.dns.title")}
        </h2>
        <div class="grid gap-2">
          <Label>{$t("centralSettings.dns.domain")}</Label>
          <Input placeholder="example.com" bind:value={config.dns.domain} />
        </div>
        <div class="space-y-2">
          <Label>{$t("centralSettings.dns.servers")}</Label>
          {#each config.dns.servers as server, i}
            <div class="flex gap-2">
              <Input
                value={server}
                on:input={(e) =>
                  updateDnsServer(i, (e.target as HTMLInputElement).value)}
              />
              <Button
                variant="ghost"
                size="icon"
                on:click={() => removeDnsServer(i)}
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          {/each}
          <Button
            variant="outline"
            size="sm"
            class="w-full"
            on:click={addDnsServer}
          >
            <Plus class="h-4 w-4 mr-2" />
            {$t("centralSettings.dns.add")}
          </Button>
        </div>
      </div>

      <!-- Advanced -->
      <div class="bg-card border rounded-lg p-4 space-y-4">
        <h2 class="text-lg font-semibold border-b pb-2">
          {$t("centralSettings.advanced.title")}
        </h2>
        <div class="grid gap-2">
          <Label>{$t("centralSettings.advanced.mtu")}</Label>
          <Input type="number" bind:value={config.mtu} />
        </div>
        <div class="grid gap-2">
          <Label>{$t("centralSettings.advanced.multicast")}</Label>
          <Input type="number" bind:value={config.multicastLimit} />
        </div>
        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <Label>{$t("centralSettings.advanced.broadcast")}</Label>
            <p class="text-xs text-muted-foreground">
              {$t("centralSettings.advanced.broadcastDesc")}
            </p>
          </div>
          <Switch bind:checked={config.enableBroadcast} />
        </div>
      </div>
    </div>
  {/if}
</div>
