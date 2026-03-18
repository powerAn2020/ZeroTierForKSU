<script lang="ts">
  import { onMount } from "svelte";
  import { pop } from "@/lib/router";
  import { t } from "svelte-i18n";
  import {
    ArrowLeft,
    Check,
    X,
    Trash2,
    Plus,
    RefreshCw,
    Box,
    Save,
  } from "lucide-svelte";
  import Button from "@/lib/components/ui/button/Button.svelte";
  import Input from "@/lib/components/ui/input/Input.svelte";
  import Label from "@/lib/components/ui/label/Label.svelte";
  import Switch from "@/lib/components/ui/switch/Switch.svelte";
  import { CentralApi } from "@/api/central";
  import { toast } from "@/stores/toast";
  import { confirm as confirmStore } from "@/stores/confirm";
  import { memberCache } from "@/stores/memberCache";
  import { cn } from "@/lib/utils";
  import type { CentralMember } from "@/types/zerotier";

  export let params: { id: string } = { id: "" };

  let members: CentralMember[] = [];
  let loading = true;
  let saving = false;
  let networkName = "";

  // Track modified members by ID
  let dirtyMembers = new Set<string>();

  async function loadMembers() {
    loading = true;
    try {
      members = await CentralApi.getMembers(params.id);
      // Fetch network details for name
      const networks = await CentralApi.getNetworks();
      const network = networks.find((n: any) => n.id === params.id);
      if (network) networkName = network.config.name;

      // Update cache
      memberCache.setNames(members);

      dirtyMembers.clear();
      dirtyMembers = dirtyMembers; // Trigger reactivity
    } catch (e: any) {
      toast.error("Failed to load members: " + e.message);
    } finally {
      loading = false;
    }
  }

  function markDirty(memberId: string) {
    dirtyMembers.add(memberId);
    dirtyMembers = dirtyMembers; // Trigger reactivity
  }

  async function saveChanges() {
    if (dirtyMembers.size === 0) return;
    saving = true;

    try {
      const updates = Array.from(dirtyMembers).map(async (memberId) => {
        const member = members.find((m) => m.nodeId === memberId);
        if (!member) return;

        const payload = {
          name: member.name,
          description: member.description,
          config: {
            authorized: member.config.authorized,
            activeBridge: member.config.activeBridge,
            ipAssignments: member.config.ipAssignments,
          },
        };
        await CentralApi.updateMember(params.id, memberId, payload);
      });

      await Promise.all(updates);
      // Cache saved names
      memberCache.setNames(members);

      toast.success($t("common.success"));
      await loadMembers();
    } catch (e: any) {
      toast.error("Failed to save changes: " + e.message);
    } finally {
      saving = false;
    }
  }

  function updateMemberInfo(
    member: CentralMember,
    updates: Partial<CentralMember>,
  ) {
    Object.assign(member, updates);
    members = [...members];
    markDirty(member.nodeId);
  }

  function toggleAuth(member: CentralMember) {
    member.config.authorized = !member.config.authorized;
    members = [...members];
    markDirty(member.nodeId);
  }

  function toggleBridge(member: CentralMember) {
    member.config.activeBridge = !member.config.activeBridge;
    members = [...members];
    markDirty(member.nodeId);
  }

  function updateIp(member: CentralMember, index: number, value: string) {
    const newIps = [...member.config.ipAssignments];
    newIps[index] = value;
    member.config.ipAssignments = newIps;
    members = [...members];
    markDirty(member.nodeId);
  }

  function addIp(member: CentralMember) {
    member.config.ipAssignments = [...member.config.ipAssignments, ""];
    members = [...members];
    markDirty(member.nodeId);
  }

  function removeIp(member: CentralMember, index: number) {
    member.config.ipAssignments = member.config.ipAssignments.filter(
      (_, idx) => idx !== index,
    );
    members = [...members];
    markDirty(member.nodeId);
  }

  async function deleteMember(memberId: string) {
    confirmStore.open({
      title: $t("centralMembers.delete.title"),
      message: $t("centralMembers.delete.message"),
      confirmText: $t("centralMembers.delete.confirm"),
      variant: "destructive",
      onConfirm: async () => {
        try {
          await CentralApi.deleteMember(params.id, memberId);
          members = members.filter((m) => m.nodeId !== memberId);
          dirtyMembers.delete(memberId);
          dirtyMembers = dirtyMembers;
          toast.success($t("common.success"));
        } catch (e: any) {
          toast.error("Failed to delete member: " + e.message);
        }
      },
    });
  }

  function formatTime(msgs: number) {
    if (!msgs) return "Never";
    const diff = Date.now() - msgs;
    if (diff < 1000) return $t("common.time.justNow");
    if (diff < 60000)
      return `${Math.floor(diff / 1000)}${$t("common.time.seconds")} ${$t("common.time.ago")}`;
    if (diff < 3600000)
      return `${Math.floor(diff / 60000)}${$t("common.time.minutes")} ${$t("common.time.ago")}`;
    if (diff < 86400000)
      return `${Math.floor(diff / 3600000)}${$t("common.time.hours")} ${$t("common.time.ago")}`;
    return `${Math.floor(diff / 86400000)}${$t("common.time.days")} ${$t("common.time.ago")}`;
  }

  onMount(() => {
    loadMembers();
  });
</script>

<div class="p-4 space-y-4 pb-24">
  <div
    class="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 -mt-4 -mx-4 px-4 border-b mb-4 flex items-center gap-4"
  >
    <Button variant="ghost" size="icon" on:click={() => pop()}>
      <ArrowLeft class="h-5 w-5" />
    </Button>
    <div class="flex-1">
      <h1 class="text-2xl font-bold tracking-tight">
        {$t("centralMembers.title")}
      </h1>
      <p class="text-sm text-muted-foreground font-mono">
        {params.id}
      </p>
    </div>
    <div class="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        on:click={loadMembers}
        disabled={loading || saving}
      >
        <RefreshCw class={cn("h-4 w-4", loading && "animate-spin")} />
      </Button>
      <Button
        disabled={saving || loading || dirtyMembers.size === 0}
        on:click={saveChanges}
      >
        {#if saving}
          {$t("common.saving")}
        {:else}
          <div class="relative">
            <Save class="h-4 w-4 mr-2" />
            {#if dirtyMembers.size > 0}
              <span class="absolute -top-1 -right-1 flex h-2 w-2">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
                ></span>
                <span
                  class="relative inline-flex rounded-full h-2 w-2 bg-red-500"
                ></span>
              </span>
            {/if}
          </div>
          {$t("common.save")}
        {/if}
      </Button>
    </div>
  </div>

  {#if loading && members.length === 0}
    <div class="space-y-4">
      <div class="h-20 bg-muted animate-pulse rounded"></div>
      <div class="h-20 bg-muted animate-pulse rounded"></div>
      <div class="h-20 bg-muted animate-pulse rounded"></div>
    </div>
  {:else if members.length === 0}
    <div class="text-center py-12 text-muted-foreground">
      {$t("centralMembers.none")}
    </div>
  {:else}
    <div class="grid gap-3">
      {#each members as member (member.nodeId)}
        <div
          class={cn(
            "bg-card text-card-foreground border rounded-lg p-4 space-y-3 relative overflow-hidden transition-colors",
            dirtyMembers.has(member.nodeId) && "border-primary/50 bg-primary/5",
          )}
        >
          <!-- Header & Basic Info -->
          <div class="space-y-4">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-2">
                <span
                  class={cn(
                    "w-2.5 h-2.5 rounded-full shrink-0",
                    member.lastOnline && Date.now() - member.lastOnline < 120000
                      ? "bg-green-500"
                      : "bg-muted-foreground/30",
                  )}
                ></span>
                <h3 class="font-bold font-mono text-lg">{member.nodeId}</h3>
              </div>
              <div class="flex gap-1">
                <Button
                  size="sm"
                  variant={member.config.authorized ? "default" : "outline"}
                  class={cn(
                    "h-8 gap-1 transition-all",
                    member.config.authorized &&
                      "bg-green-600 hover:bg-green-700 text-white",
                  )}
                  on:click={() => toggleAuth(member)}
                  disabled={loading || saving}
                >
                  {#if member.config.authorized}
                    <Check class="h-3 w-3" /> {$t("centralMembers.auth")}
                  {:else}
                    <X class="h-3 w-3" /> {$t("centralMembers.auth")}
                  {/if}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  class="h-8 w-8 text-destructive"
                  on:click={() => deleteMember(member.nodeId)}
                  disabled={loading || saving}
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </div>

            <!-- Editable Info -->
            <div class="grid gap-3">
              <div class="grid gap-1">
                <Label class="text-xs text-muted-foreground"
                  >{$t("centralMembers.fields.name")}</Label
                >
                <Input
                  class="h-8"
                  value={member.name || ""}
                  placeholder={$t("centralMembers.fields.name")}
                  on:input={(e) =>
                    updateMemberInfo(member, {
                      name: (e.target as HTMLInputElement).value,
                    })}
                />
              </div>
              <div class="grid gap-1">
                <Label class="text-xs text-muted-foreground"
                  >{$t("centralMembers.fields.desc")}</Label
                >
                <Input
                  class="h-8"
                  value={member.description || ""}
                  placeholder={$t("centralMembers.fields.desc")}
                  on:input={(e) =>
                    updateMemberInfo(member, {
                      description: (e.target as HTMLInputElement).value,
                    })}
                />
              </div>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-2 rounded">
              <div>
                <span class="text-muted-foreground block"
                  >{$t("centralMembers.fields.lastSeen")}</span
                >
                <span class="font-mono">{formatTime(member.lastOnline)}</span>
              </div>
              <div>
                <span class="text-muted-foreground block"
                  >{$t("centralMembers.fields.version")}</span
                >
                <span>{member.clientVersion || $t("common.unknown")}</span>
              </div>
              <div class="col-span-2">
                <span class="text-muted-foreground block"
                  >{$t("centralMembers.fields.physAddr")}</span
                >
                <span class="font-mono"
                  >{member.physicalAddress || $t("common.unknown")}</span
                >
              </div>
            </div>
          </div>

          <!-- Configuration -->
          <div class="bg-muted/30 p-3 rounded text-sm space-y-3">
            <!-- Managed IPs -->
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="font-medium text-muted-foreground"
                  >{$t("centralMembers.managedIps.title")}</span
                >
                <Button
                  size="sm"
                  variant="ghost"
                  class="h-6 text-xs"
                  on:click={() => addIp(member)}
                >
                  <Plus class="h-3 w-3 mr-1" />
                  {$t("centralMembers.managedIps.add")}
                </Button>
              </div>
              {#each member.config.ipAssignments as ip, i}
                <div class="flex gap-2">
                  <Input
                    class="h-8 font-mono"
                    value={ip}
                    on:input={(e) =>
                      updateIp(member, i, (e.target as HTMLInputElement).value)}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    class="h-8 w-8 text-muted-foreground hover:text-destructive"
                    on:click={() => removeIp(member, i)}
                  >
                    <X class="h-3 w-3" />
                  </Button>
                </div>
              {/each}
            </div>

            <!-- Bridge Mode -->
            <div class="flex items-center justify-between border-t pt-2 mt-2">
              <span class="text-muted-foreground flex items-center gap-1">
                <Box class="h-3 w-3" />
                {$t("centralMembers.bridge")}
              </span>
              <Switch
                checked={member.config.activeBridge}
                on:checkedChange={() => toggleBridge(member)}
                disabled={loading || saving}
              />
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
