<script lang="ts">
  import { cn } from "@/lib/utils";

  export let title: string;
  export let value: string | number;
  export let icon: any = undefined; // Lucide icon component
  export let status: "success" | "warning" | "error" | "default" = "default";

  let className: string | undefined | null = undefined;
  export { className as class }; // Allow styling injection

  const statusColors = {
    success: "text-green-500",
    warning: "text-yellow-500",
    error: "text-red-500",
    default: "text-foreground",
  };
</script>

<div
  class={cn(
    "rounded-xl border bg-card text-card-foreground shadow p-4 flex flex-col justify-between space-y-2",
    className,
  )}
>
  <div class="flex flex-row items-center justify-between space-y-0 pb-2">
    <div class="text-sm font-medium text-muted-foreground">{title}</div>
    {#if icon}
      <svelte:component this={icon} class="h-4 w-4 text-muted-foreground" />
    {/if}
  </div>
  <div class={cn("text-2xl font-bold", statusColors[status])}>{value}</div>
</div>
