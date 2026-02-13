<script lang="ts">
  import { toast } from "@/stores/toast";
  import { fly } from "svelte/transition";
  import { X } from "lucide-svelte";

  const typeStyles = {
    info: "bg-blue-500 text-white",
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-white",
  };
</script>

<div
  class="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none"
>
  {#each $toast as t (t.id)}
    <div
      in:fly={{ y: 20, duration: 300 }}
      out:fly={{ y: 20, duration: 300 }}
      class="pointer-events-auto flex items-center justify-between p-4 rounded-lg shadow-lg {typeStyles[
        t.type
      ]}"
    >
      <span class="text-sm font-medium">{t.message}</span>
      <button
        class="ml-4 opacity-80 hover:opacity-100"
        on:click={() => toast.remove(t.id)}
      >
        <X class="h-4 w-4" />
      </button>
    </div>
  {/each}
</div>
