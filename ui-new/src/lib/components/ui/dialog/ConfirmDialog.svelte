<script lang="ts">
  import { confirm } from "@/stores/confirm";
  import Button from "@/lib/components/ui/button/Button.svelte";
  import { fade, scale } from "svelte/transition";
  import { cn } from "@/lib/utils";

  function handleConfirm() {
    $confirm.options.onConfirm();
    confirm.close();
  }

  function handleCancel() {
    if ($confirm.options.onCancel) {
      $confirm.options.onCancel();
    }
    confirm.close();
  }
</script>

{#if $confirm.isOpen}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
    transition:fade={{ duration: 150 }}
    on:click={handleCancel}
    role="presentation"
  >
    <!-- Dialog Content -->
    <div
      class="fixed left-[50%] top-[50%] z-[101] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-card p-6 shadow-lg duration-200 sm:rounded-lg"
      transition:scale={{ start: 0.95, duration: 150 }}
      on:click|stopPropagation
      on:keydown|stopPropagation
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <div class="flex flex-col space-y-1.5 text-center sm:text-left">
        {#if $confirm.options.title}
          <h2 class="text-lg font-semibold leading-none tracking-tight">
            {$confirm.options.title}
          </h2>
        {/if}
        <p class="text-sm text-muted-foreground">
          {$confirm.options.message}
        </p>
      </div>

      <div
        class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2"
      >
        <Button variant="outline" on:click={handleCancel}>
          {$confirm.options.cancelText || "Cancel"}
        </Button>
        <Button
          variant={$confirm.options.variant || "default"}
          on:click={handleConfirm}
        >
          {$confirm.options.confirmText || "Confirm"}
        </Button>
      </div>
    </div>
  </div>
{/if}
