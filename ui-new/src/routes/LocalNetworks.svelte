<script lang="ts">
  import { onMount } from "svelte";
  import { push } from "@/lib/router";
  import { t } from "svelte-i18n";
  import { Plus, Globe, Moon } from "lucide-svelte";
  import Button from "@/lib/components/ui/button/Button.svelte";
  import Input from "@/lib/components/ui/input/Input.svelte";
  import LocalNetworkCard from "@/lib/components/custom/LocalNetworkCard.svelte";
  import { zerotierStore } from "@/stores/zerotier";
  import { LocalApi } from "@/api/local";
  import { cn } from "@/lib/utils";

  import { toast } from "@/stores/toast";
  import { confirm as confirmStore } from "@/stores/confirm";

  let joinNetworkId = "";
  let joinMoonId = "";
  let isJoining = false;
  let showJoinInput = false;
  let showMoonInput = false;
  let showAddOptions = false;

  async function refresh() {
    await zerotierStore.loadLocalNetworks();
  }

  async function handleJoin() {
    if (!joinNetworkId || joinNetworkId.length !== 16) return;
    isJoining = true;
    try {
      await LocalApi.joinNetwork(joinNetworkId);
      await refresh();
      joinNetworkId = "";
      showJoinInput = false;
      toast.success("Network joined successfully");
    } catch (e: any) {
      console.error("Join failed", e);
      toast.error("Failed to join network: " + (e.message || e));
    } finally {
      isJoining = false;
    }
  }

  async function handleJoinMoon() {
    if (!joinMoonId || joinMoonId.length !== 10) return;
    isJoining = true;
    try {
      await LocalApi.joinMoon(joinMoonId);
      toast.success("Moon joined successfully");
      joinMoonId = "";
      showMoonInput = false;
    } catch (e: any) {
      console.error("Moon join failed", e);
      toast.error("Failed to join moon: " + (e.message || e));
    } finally {
      isJoining = false;
    }
  }

  async function handleLeave(event: CustomEvent<string>) {
    confirmStore.open({
      title: $t("local.leave.title"),
      message: $t("local.leave.message"),
      confirmText: $t("local.leave.confirm"),
      variant: "destructive",
      onConfirm: async () => {
        try {
          await LocalApi.leaveNetwork(event.detail);
          await refresh();
          toast.success("Left network successfully");
        } catch (e: any) {
          console.error("Leave failed", e);
          toast.error("Failed to leave network: " + (e.message || e));
        }
      },
    });
  }

  async function handleSettings(event: CustomEvent<string>) {
    // Implement settings dialog navigation
    push(`/local/settings/${event.detail}`);
  }

  function handleCardClick(networkId: string) {
    push(`/local/peers/${networkId}`);
  }

  onMount(() => {
    refresh();
  });
</script>

<div class="p-4 space-y-4 pb-24">
  <div
    class="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 -mt-4 -mx-4 px-4 border-b mb-4 flex items-center justify-between"
  >
    <h1 class="text-2xl font-bold tracking-tight">{$t("local.title")}</h1>
    <Button
      variant="outline"
      size="icon"
      on:click={() => refresh()}
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
        /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path
          d="M8 16H3v5"
        /></svg
      >
    </Button>
  </div>

  <!-- Add Options -->
  {#if showAddOptions}
    <div
      class="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-5 fade-in mb-4"
    >
      <Button
        variant="outline"
        class="h-24 flex flex-col gap-2"
        on:click={() => {
          showAddOptions = false;
          showJoinInput = true;
        }}
      >
        <Globe class="h-8 w-8" />
        <span>{$t("local.joinNetwork")}</span>
      </Button>
      <Button
        variant="outline"
        class="h-24 flex flex-col gap-2"
        on:click={() => {
          showAddOptions = false;
          showMoonInput = true;
        }}
      >
        <Moon class="h-8 w-8" />
        <span>{$t("local.joinMoon")}</span>
      </Button>
    </div>
  {/if}

  <!-- Join Input -->
  {#if showJoinInput}
    <div class="flex gap-2 animate-in slide-in-from-top-2 fade-in">
      <Input
        placeholder={$t("local.networkId")}
        maxlength={16}
        bind:value={joinNetworkId}
        class="font-mono uppercase transition-all"
      />
      <Button
        on:click={handleJoin}
        disabled={isJoining || joinNetworkId.length !== 16}
      >
        {$t("local.join")}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        on:click={() => (showJoinInput = false)}
      >
        <Plus class="h-4 w-4 rotate-45" />
      </Button>
    </div>
  {/if}

  <!-- Moon Input -->
  {#if showMoonInput}
    <div class="flex gap-2 animate-in slide-in-from-top-2 fade-in">
      <Input
        placeholder={$t("local.moonId")}
        maxlength={10}
        bind:value={joinMoonId}
        class="font-mono uppercase transition-all"
      />
      <Button
        on:click={handleJoinMoon}
        disabled={isJoining || joinMoonId.length !== 10}
      >
        {$t("local.orbit")}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        on:click={() => (showMoonInput = false)}
      >
        <Plus class="h-4 w-4 rotate-45" />
      </Button>
    </div>
  {/if}

  <!-- Network List -->
  <div class="grid gap-3 mb-24">
    {#if $zerotierStore.localNetworks.length === 0 && !$zerotierStore.loading}
      <div
        class="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl"
      >
        {$t("local.noNetworks")}
      </div>
    {/if}

    {#each $zerotierStore.localNetworks as network (network.id)}
      <LocalNetworkCard
        {network}
        on:leave={async (e) => await handleLeave(e)}
        on:settings={async (e) => await handleSettings(e)}
        on:click={() => handleCardClick(network.id)}
      />
    {/each}
  </div>

  <!-- FAB -->
  <Button
    class={cn(
      "fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-xl z-40 transition-transform active:scale-90",
      showAddOptions && "rotate-45",
    )}
    on:click={() => (showAddOptions = !showAddOptions)}
  >
    <Plus class="h-6 w-6" />
  </Button>
</div>
