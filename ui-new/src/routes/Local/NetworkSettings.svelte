<script lang="ts">
  import { onMount } from "svelte";
  import { pop } from "@/lib/router";
  import { t } from "svelte-i18n";
  import { ArrowLeft, Save } from "lucide-svelte";
  import Button from "@/lib/components/ui/button/Button.svelte";
  import { LocalApi } from "@/api/local";
  import { zerotierStore } from "@/stores/zerotier";
  import type { LocalNetwork } from "@/types/zerotier";
  import { toast } from "@/stores/toast";

  export let params: { id: string } = { id: "" };

  let network: LocalNetwork | undefined;
  let loading = true;
  let saving = false;

  // Settings
  let allowManaged = true;
  let allowGlobal = false;
  let allowDefault = false;
  let allowDNS = false;

  onMount(async () => {
    await zerotierStore.loadLocalNetworks();
    network = $zerotierStore.localNetworks.find((n) => n.id === params.id);
    if (network) {
      allowManaged = network.allowManaged;
      allowGlobal = network.allowGlobal;
      allowDefault = network.allowDefault;
      allowDNS = network.allowDNS;
    }
    loading = false;
  });

  async function saveSettings() {
    if (!network) return;
    saving = true;
    try {
      await LocalApi.updateNetwork(network.id, {
        allowManaged,
        allowGlobal,
        allowDefault,
        allowDNS,
      });
      await zerotierStore.loadLocalNetworks(); // Refresh store
      toast.success($t("common.success"));
      pop(); // Go back
    } catch (e: any) {
      console.error("Failed to update settings", e);
      toast.error("Failed to update network settings: " + e.message);
    } finally {
      saving = false;
    }
  }
</script>

<div class="space-y-6 pb-20">
  <!-- Header -->
  <div
    class="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between p-4 border-b"
  >
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" on:click={() => pop()}>
        <ArrowLeft class="h-6 w-6" />
      </Button>
      <div>
        <h1 class="text-xl font-bold tracking-tight">
          {$t("localSettings.title")}
        </h1>
        <p class="text-xs text-muted-foreground font-mono">{params.id}</p>
      </div>
    </div>
    <Button on:click={saveSettings} disabled={saving || !network}>
      {#if saving}
        {$t("common.saving")}
      {:else}
        <Save class="h-4 w-4 mr-2" /> {$t("common.save")}
      {/if}
    </Button>
  </div>

  <div class="p-4 space-y-6">
    {#if loading}
      <div class="text-center py-10 text-muted-foreground">
        {$t("common.loading")}
      </div>
    {:else if !network}
      <div class="text-center py-10 text-muted-foreground text-red-500">
        {$t("localSettings.notFound")}
      </div>
    {:else}
      <!-- Settings Form -->
      <div class="space-y-4">
        <label
          class="flex items-start gap-3 p-4 border rounded-xl bg-card hover:bg-accent/5 transition-colors cursor-pointer"
        >
          <input
            type="checkbox"
            bind:checked={allowManaged}
            class="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <div class="grid gap-1.5 leading-none">
            <span class="font-medium leading-none"
              >{$t("localSettings.managed.title")}</span
            >
            <span class="text-sm text-muted-foreground">
              {$t("localSettings.managed.desc")}
            </span>
          </div>
        </label>

        <label
          class="flex items-start gap-3 p-4 border rounded-xl bg-card hover:bg-accent/5 transition-colors cursor-pointer"
        >
          <input
            type="checkbox"
            bind:checked={allowGlobal}
            class="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <div class="grid gap-1.5 leading-none">
            <span class="font-medium leading-none"
              >{$t("localSettings.global.title")}</span
            >
            <span class="text-sm text-muted-foreground">
              {$t("localSettings.global.desc")}
            </span>
          </div>
        </label>

        <label
          class="flex items-start gap-3 p-4 border rounded-xl bg-card hover:bg-accent/5 transition-colors cursor-pointer"
        >
          <input
            type="checkbox"
            bind:checked={allowDefault}
            class="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <div class="grid gap-1.5 leading-none">
            <span class="font-medium leading-none"
              >{$t("localSettings.default.title")}</span
            >
            <span class="text-sm text-muted-foreground">
              {$t("localSettings.default.desc")}
            </span>
          </div>
        </label>

        <label
          class="flex items-start gap-3 p-4 border rounded-xl bg-card hover:bg-accent/5 transition-colors cursor-pointer"
        >
          <input
            type="checkbox"
            bind:checked={allowDNS}
            class="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <div class="grid gap-1.5 leading-none">
            <span class="font-medium leading-none"
              >{$t("localSettings.dns.title")}</span
            >
            <span class="text-sm text-muted-foreground">
              {$t("localSettings.dns.desc")}
            </span>
          </div>
        </label>
      </div>
    {/if}
  </div>
</div>
