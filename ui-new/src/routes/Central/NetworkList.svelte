<script lang="ts">
  import { onMount } from "svelte";
  import { push } from "@/lib/router";
  import { t } from "svelte-i18n";
  import {
    Plus,
    Trash2,
    ExternalLink,
    Loader2,
    Key,
    Lock,
    Unlock,
    Users,
    Settings,
  } from "lucide-svelte";
  import Button from "@/lib/components/ui/button/Button.svelte";
  import Input from "@/lib/components/ui/input/Input.svelte";
  import { zerotierStore } from "@/stores/zerotier";
  import { CentralApi } from "@/api/central";
  import { cn } from "@/lib/utils";
  import { toast } from "@/stores/toast";
  import { confirm as confirmStore } from "@/stores/confirm";

  let apiTokenInput = "";
  let isSavingToken = false;
  let checkingToken = true;
  let showAddInput = false;
  let newNetworkName = "";

  async function saveToken() {
    if (!apiTokenInput) return;
    isSavingToken = true;
    try {
      await CentralApi.setApiToken(apiTokenInput);
      zerotierStore.setApiToken(apiTokenInput);
      await zerotierStore.loadCentralNetworks();
    } catch (e) {
      console.error(e);
    } finally {
      isSavingToken = false;
    }
  }

  async function createNetwork() {
    if (!newNetworkName) return;
    try {
      await CentralApi.createNetwork(newNetworkName);
      await zerotierStore.loadCentralNetworks();
      showAddInput = false;
      newNetworkName = "";
      toast.success($t("common.success"));
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to create network: " + e.message);
    }
  }

  async function deleteNetwork(id: string) {
    confirmStore.open({
      title: $t("centralList.delete.title"),
      message: $t("centralList.delete.message"),
      confirmText: $t("centralList.delete.confirm"),
      variant: "destructive",
      onConfirm: async () => {
        try {
          await CentralApi.deleteNetwork(id);
          await zerotierStore.loadCentralNetworks();
          toast.success($t("common.success"));
        } catch (e: any) {
          console.error(e);
          toast.error("Failed to delete network");
        }
      },
    });
  }

  async function checkToken() {
    checkingToken = true;
    try {
      const token = await CentralApi.getApiToken();
      if (token) {
        zerotierStore.setApiToken(token);
        await zerotierStore.loadCentralNetworks();
      }
    } finally {
      checkingToken = false;
    }
  }

  onMount(() => {
    checkToken();
  });
</script>

<div class="p-4 space-y-4 pb-24">
  <div
    class="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 -mt-4 -mx-4 px-4 border-b mb-4 flex items-center justify-between"
  >
    <h1 class="text-2xl font-bold tracking-tight">{$t("centralList.title")}</h1>
    {#if $zerotierStore.apiToken}
      <Button
        variant="outline"
        size="icon"
        on:click={() => zerotierStore.loadCentralNetworks()}
        disabled={$zerotierStore.loading}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class={cn(
            "lucide lucide-refresh-cw",
            $zerotierStore.loading && "animate-spin",
          )}
          ><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path
            d="M21 3v5h-5"
          /><path
            d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
          /><path d="M8 16H3v5" /></svg
        >
      </Button>
    {/if}
  </div>

  <!-- Token Input -->
  {#if checkingToken}
    <div
      class="flex flex-col items-center justify-center p-12 text-muted-foreground"
    >
      <Loader2 class="h-8 w-8 animate-spin mb-4" />
      <p>{$t("common.loading")}</p>
    </div>
  {:else if !$zerotierStore.apiToken}
    <div class="border rounded-xl p-6 space-y-4 text-center">
      <div class="flex justify-center mb-2">
        <div class="bg-primary/10 p-3 rounded-full text-primary">
          <Key class="h-6 w-6" />
        </div>
      </div>
      <h2 class="text-lg font-semibold">{$t("centralList.auth.required")}</h2>
      <p class="text-sm text-muted-foreground">
        {$t("centralList.auth.desc")}
      </p>
      <Input
        type="password"
        placeholder={$t("centralList.auth.placeholder")}
        bind:value={apiTokenInput}
      />
      <Button class="w-full" on:click={saveToken} disabled={isSavingToken}>
        {#if isSavingToken}
          {$t("common.saving")}
        {:else}
          {$t("centralList.auth.save")}
        {/if}
      </Button>
      <p class="text-xs text-muted-foreground mt-2">
        {$t("centralList.auth.stored")}
      </p>
    </div>
  {:else}
    <!-- Add Network -->
    {#if showAddInput}
      <div class="flex gap-2 animate-in slide-in-from-top-2 fade-in">
        <Input
          placeholder={$t("centralList.create.placeholder")}
          bind:value={newNetworkName}
        />
        <Button on:click={createNetwork} disabled={!newNetworkName}>
          {$t("centralList.create.button")}
        </Button>
      </div>
    {/if}

    <!-- Network List -->
    <div class="grid gap-3 mb-24">
      {#each $zerotierStore.centralNetworks as network (network.id)}
        <button
          class="group w-full text-left rounded-xl border bg-card text-card-foreground shadow-sm p-4 flex flex-col gap-2 relative transition-all hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          on:click={() => push(`/central/${network.id}`)}
        >
          <div class="flex justify-between items-start w-full">
            <div>
              <h3 class="font-semibold">
                {network.config.name || network.config.id}
              </h3>
              <div class="text-xs font-mono text-muted-foreground">
                {network.id}
              </div>
            </div>
            <div class="flex items-center gap-1">
              <div
                class={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1",
                  network.config.private
                    ? "bg-primary/10 text-primary"
                    : "bg-green-500/10 text-green-600",
                )}
              >
                {#if network.config.private}
                  <Lock class="h-3 w-3" /> {$t("centralList.type.private")}
                {:else}
                  <Unlock class="h-3 w-3" /> {$t("centralList.type.public")}
                {/if}
              </div>
            </div>
          </div>

          <!-- Routes Display -->
          {#if network.config.routes && network.config.routes.length > 0}
            <div class="flex flex-wrap gap-1 mt-2 w-full">
              {#each network.config.routes as route}
                <div
                  class="text-[10px] bg-secondary/50 px-1.5 py-0.5 rounded-md text-secondary-foreground font-mono truncate max-w-full"
                  title={route.via
                    ? `${route.target} via ${route.via}`
                    : route.target}
                >
                  {route.target}
                </div>
              {/each}
            </div>
          {/if}

          <div class="flex justify-between items-end mt-2 w-full">
            <div class="text-xs text-muted-foreground flex gap-3">
              <div>
                <span class="font-bold text-foreground"
                  >{network.onlineMemberCount}</span
                >
                {$t("centralList.stats.online")}
              </div>
              <div>
                <span class="font-bold text-foreground"
                  >{network.authorizedMemberCount}</span
                >
                {$t("centralList.stats.authorized")}
              </div>
              <div>
                <span class="font-bold text-foreground"
                  >{network.totalMemberCount}</span
                >
                {$t("centralList.stats.total")}
              </div>
            </div>

            <div class="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 text-muted-foreground hover:text-foreground"
                on:click={(e) => {
                  e.stopPropagation();
                  push(`/central/${network.id}/settings`);
                }}
              >
                <span class="sr-only">Settings</span>
                <!-- Gear Icon -->
                <Settings class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 text-destructive hover:bg-destructive/10"
                on:click={(e) => {
                  e.stopPropagation();
                  deleteNetwork(network.id);
                }}
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </button>
      {/each}
    </div>

    <!-- FAB -->
    <Button
      class="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-xl z-40 transition-transform active:scale-90"
      on:click={() => (showAddInput = !showAddInput)}
    >
      <Plus class="h-6 w-6" />
    </Button>
  {/if}
</div>
