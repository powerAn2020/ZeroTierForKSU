<script lang="ts">
  import { onMount } from "svelte";
  import { pop } from "@/lib/router";
  import { t } from "svelte-i18n";
  import { ArrowLeft, Moon, Trash2 } from "lucide-svelte";
  import Button from "@/lib/components/ui/button/Button.svelte";
  import { zerotierStore } from "@/stores/zerotier";
  import { LocalApi } from "@/api/local";
  import { toast } from "@/stores/toast";
  import { confirm as confirmStore } from "@/stores/confirm";
  import { cn } from "@/lib/utils";

  $: moons = $zerotierStore.peers.filter((p) => p.role === "MOON");

  onMount(() => {
    zerotierStore.loadPeers();
  });

  async function handleUnorbit(moonId: string) {
    confirmStore.open({
      title: $t("moons.unorbit.title"),
      message: $t("moons.unorbit.message", { values: { id: moonId } }),
      confirmText: $t("moons.unorbit.confirm"),
      variant: "destructive",
      onConfirm: async () => {
        try {
          await LocalApi.leaveMoon(moonId);
          toast.success($t("moons.unorbitSuccess", { values: { id: moonId } }));
          await zerotierStore.loadPeers();
        } catch (e: any) {
          toast.error(
            $t("moons.unorbitFailed", { values: { error: e.message || e } }),
          );
        }
      },
    });
  }
</script>

<div class="p-4 space-y-4 pb-24">
  <div
    class="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 -mt-4 -mx-4 px-4 border-b mb-6 flex items-center gap-2"
  >
    <Button variant="ghost" size="icon" on:click={() => pop()}>
      <ArrowLeft class="h-6 w-6" />
    </Button>
    <h1 class="text-2xl font-bold tracking-tight">{$t("moons.title")}</h1>
  </div>

  {#if moons.length === 0}
    <div
      class="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl flex flex-col items-center gap-2"
    >
      <Moon class="h-10 w-10 opacity-20" />
      <span>{$t("moons.noMoons")}</span>
    </div>
  {:else}
    <div class="grid gap-3">
      {#each moons as moon}
        <div
          class="flex flex-col gap-2 p-4 rounded-xl border bg-card text-card-foreground shadow-sm"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Moon class="h-5 w-5 text-primary" />
              <span class="font-mono font-bold text-lg">{moon.id}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              class="text-destructive hover:bg-destructive/10"
              on:click={() => handleUnorbit(moon.id)}
            >
              <Trash2 class="h-4 w-4" />
            </Button>
          </div>

          <div
            class="grid grid-cols-2 gap-2 text-sm text-muted-foreground mt-2"
          >
            <div class="flex flex-col">
              <span class="text-xs uppercase opacity-70"
                >{$t("moons.version")}</span
              >
              <span class="text-foreground">{moon.version}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs uppercase opacity-70"
                >{$t("moons.latency")}</span
              >
              <span class="text-foreground">{moon.latency}ms</span>
            </div>
          </div>

          {#if moon.paths.length > 0}
            <div class="mt-2 text-xs">
              <span class="opacity-70 uppercase">{$t("moons.paths")}</span>
              <div class="flex flex-col gap-1 mt-1">
                {#each moon.paths as path}
                  <div
                    class="flex items-center justify-between bg-muted/50 p-1.5 rounded"
                  >
                    <span class="font-mono">{path.address}</span>
                    <div class="flex items-center gap-2">
                      {#if path.active}
                        <span
                          class="bg-green-500/20 text-green-600 px-1 rounded text-[10px]"
                          >{$t("moons.active")}</span
                        >
                      {/if}
                      {#if path.preferred}
                        <span
                          class="bg-blue-500/20 text-blue-600 px-1 rounded text-[10px]"
                          >{$t("moons.pref")}</span
                        >
                      {/if}
                      <span class="text-muted-foreground"
                        >{path.lastReceive}ms {$t("common.time.ago")}</span
                      >
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
