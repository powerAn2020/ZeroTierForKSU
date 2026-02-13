<script lang="ts">
  import { Shield, Settings, Trash2, LogOut } from "lucide-svelte";
  import Button from "@/lib/components/ui/button/Button.svelte";
  import { cn } from "@/lib/utils";
  import type { LocalNetwork } from "@/types/zerotier";
  import { createEventDispatcher } from "svelte";

  export let network: LocalNetwork;

  const dispatch = createEventDispatcher();

  const statusColors: Record<string, string> = {
    OK: "bg-green-500",
    ACCESS_DENIED: "bg-red-500",
    REQUESTING_CONFIGURATION: "bg-blue-500 animate-pulse",
    NOT_FOUND: "bg-yellow-500",
    PORT_ERROR: "bg-red-700",
    CLIENT_TOO_OLD: "bg-orange-500",
    AUTHENTICATION_REQUIRED: "bg-purple-500",
  };
</script>

<div
  class="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
  on:click={() => dispatch("click", network.id)}
  role="button"
  tabindex="0"
  on:keydown={(e) => {
    if (e.key === "Enter" || e.key === " ") dispatch("click", network.id);
  }}
>
  <div class="p-4 flex flex-row items-center gap-4">
    <!-- Status Indicator -->
    <div
      class={cn(
        "w-1.5 self-stretch rounded-full",
        statusColors[network.status] || "bg-gray-400",
      )}
      title={network.status}
    ></div>

    <div class="flex-1 min-w-0 grid gap-1">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold truncate text-base">
          {network.name || network.id}
        </h3>
        <span class="text-xs text-muted-foreground font-mono"
          >{network.type}</span
        >
      </div>
      <div class="text-xs text-muted-foreground flex flex-col gap-0.5">
        <span class="font-mono">{network.id}</span>
        <span>{network.assignedAddresses.join(", ") || "No IP"}</span>
        <span>{network.status}</span>
      </div>
    </div>
  </div>

  <div
    class="bg-muted/30 px-4 py-2 flex justify-end gap-2 border-t"
    on:click|stopPropagation={() => {}}
    role="presentation"
  >
    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8 text-muted-foreground hover:text-foreground"
      on:click={(e) => {
        e.stopPropagation();
        dispatch("settings", network.id);
      }}
    >
      <Settings class="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8 text-destructive hover:bg-destructive/10"
      on:click={(e) => {
        e.stopPropagation();
        dispatch("leave", network.id);
      }}
    >
      <LogOut class="h-4 w-4" />
    </Button>
  </div>
</div>
