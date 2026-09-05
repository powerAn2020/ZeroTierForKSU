<script lang="ts">
  import { onMount } from "svelte";
  import { push } from "@/lib/router";
  import { t } from "svelte-i18n";
  import {
    Activity,
    Power,
    Globe,
    ShieldCheck,
    Users,
    Moon,
    Loader2,
    Info,
  } from "lucide-svelte";
  import Button from "@/lib/components/ui/button/Button.svelte";
  import NetworkStatusCard from "@/lib/components/custom/NetworkStatusCard.svelte";
  import { appStore } from "@/stores/app";
  import { zerotierStore } from "@/stores/zerotier";
  import { LocalApi } from "@/api/local";
  import { KsuApi } from "@/api/ksu";
  import { cn } from "@/lib/utils";
  import { toast } from "@/stores/toast";

  let loadingService = false;
  let serviceAction: "starting" | "stopping" | null = null;

  async function toggleService() {
    const targetRunning = !$appStore.serviceRunning;
    serviceAction = targetRunning ? "starting" : "stopping";
    loadingService = true;

    try {
      if (targetRunning) {
        await LocalApi.startService();
      } else {
        await LocalApi.stopService();
      }

      // Poll and refresh status every 500ms until desired state is reached or timeout (max 10 tries, 5s)
      const maxRetries = 10;
      for (let i = 0; i < maxRetries; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await refreshStatus();
        if ($appStore.serviceRunning === targetRunning) {
          break;
        }
      }
    } catch (e) {
      console.error("Service toggle failed", e);
      appStore.setError("Failed to toggle service");
    } finally {
      loadingService = false;
      serviceAction = null;
    }
  }

  async function copyNodeId() {
    if ($appStore.nodeId) {
      try {
        await navigator.clipboard.writeText($appStore.nodeId);
        toast.success($t("dashboard.copied"));
      } catch (e) {
        toast.error("Failed to copy Node ID");
      }
    }
  }

  async function refreshStatus() {
    try {
      // Parallelize module info and service status
      const [moduleInfoResult] = await Promise.all([
        KsuApi.getModuleInfo(),
        zerotierStore.loadStatus(),
      ]);

      if (moduleInfoResult) {
        appStore.setModuleInfo(
          moduleInfoResult.version ||
            moduleInfoResult.versionOfModule ||
            "",
          moduleInfoResult.versionCode || 0,
        );
      }

      // Only load networks if service is running to avoid errors
      if ($appStore.serviceRunning) {
        // Parallelize remaining data fetches
        await Promise.all([
          zerotierStore.loadLocalNetworks(),
          zerotierStore.loadCentralNetworks(),
          zerotierStore.loadPeers(),
        ]);
      }
    } catch (e) {
      console.error("Failed to refresh status", e);
    }
  }

  onMount(() => {
    refreshStatus();
  });
</script>

<div class="p-4 space-y-6 pb-20">
  <!-- Header -->
  <!-- Header -->
  <div
    class="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 -mt-4 -mx-4 px-4 border-b mb-6 flex items-center justify-between"
  >
    <h1 class="text-2xl font-bold tracking-tight">{$t("dashboard.title")}</h1>
    <!-- <div class="text-sm text-muted-foreground">
      {$appStore.version ? `v${$appStore.version}` : "Loading..."}
    </div> -->
  </div>

  <!-- Service Control -->
  <div class="flex justify-center py-6">
    <Button
      variant="outline"
      size="lg"
      class={cn(
        "h-32 w-32 rounded-full flex flex-col items-center justify-center gap-2 shadow-lg transition-all active:scale-95 border-2",
        $appStore.serviceRunning
          ? "bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
          : "hover:bg-muted",
      )}
      on:click={toggleService}
      disabled={loadingService}
    >
      {#if loadingService}
        <Loader2 class="h-8 w-8 animate-spin" />
        <span>
          {serviceAction === "stopping"
            ? $t("dashboard.service.stopping")
            : $t("dashboard.service.starting")}
        </span>
      {:else}
        <Power class="h-8 w-8" />
        <span>
          {$appStore.serviceRunning
            ? $t("dashboard.service.running")
            : $t("dashboard.service.stopped")}
        </span>
      {/if}
    </Button>
  </div>

  <!-- Status Cards -->
  <div class="grid gap-4 grid-cols-2">
    <div
      class="cursor-pointer transition-opacity hover:opacity-80 active:scale-95 transition-transform"
      role="button"
      tabindex="0"
      on:click={copyNodeId}
      on:keydown={(e) => {
        if (e.key === "Enter" || e.key === " ") copyNodeId();
      }}
    >
      <NetworkStatusCard
        title={$t("dashboard.cards.nodeId")}
        value={$appStore.nodeId || $t("common.unknown")}
        icon={ShieldCheck}
      />
    </div>

    <NetworkStatusCard
      title={$t("settings.about.moduleVersion")}
      value={$appStore.moduleVersionCode
        ? `${$appStore.moduleVersion} `
        : $appStore.moduleVersion || $t("common.unknown")}
      icon={Info}
    />

    <div
      class="cursor-pointer transition-opacity hover:opacity-80 active:scale-95 transition-transform"
      role="button"
      tabindex="0"
      on:click={() => push("/local")}
      on:keydown={(e) => {
        if (e.key === "Enter" || e.key === " ") push("/local");
      }}
    >
      <NetworkStatusCard
        title={$t("dashboard.cards.peersLeaf")}
        value={$zerotierStore.peers.filter((p) => p.role === "LEAF").length}
        icon={Users}
      />
    </div>

    <div
      class="cursor-pointer transition-opacity hover:opacity-80 active:scale-95 transition-transform"
      role="button"
      tabindex="0"
      on:click={() => push("/moons")}
      on:keydown={(e) => {
        if (e.key === "Enter" || e.key === " ") push("/moons");
      }}
    >
      <NetworkStatusCard
        title={$t("dashboard.cards.moonNodes")}
        value={$zerotierStore.peers.filter((p) => p.role === "MOON").length}
        icon={Moon}
      />
    </div>

    <div
      class="cursor-pointer transition-opacity hover:opacity-80"
      role="button"
      tabindex="0"
      on:click={() => push("/local")}
      on:keydown={(e) => {
        if (e.key === "Enter" || e.key === " ") push("/local");
      }}
    >
      <NetworkStatusCard
        title={$t("dashboard.cards.networks")}
        value={$zerotierStore.localNetworks.length}
        icon={Activity}
      />
    </div>

    <div
      class="cursor-pointer transition-opacity hover:opacity-80"
      role="button"
      tabindex="0"
      on:click={() => push("/central")}
      on:keydown={(e) => {
        if (e.key === "Enter" || e.key === " ") push("/central");
      }}
    >
      <NetworkStatusCard
        title={$t("dashboard.cards.central")}
        value={$zerotierStore.apiToken
          ? $zerotierStore.centralNetworks.length
          : "-"}
        icon={Globe}
      />
    </div>
  </div>
</div>
