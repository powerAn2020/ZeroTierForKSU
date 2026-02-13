<script lang="ts">
  import { cn } from "@/lib/utils";
  import { createEventDispatcher } from "svelte";

  export let checked = false;
  export let disabled = false;
  export let id: string = "";

  const dispatch = createEventDispatcher();

  function toggle() {
    if (disabled) return;
    checked = !checked;
    dispatch("checkedChange", checked);
  }
</script>

<button
  type="button"
  role="switch"
  aria-checked={checked}
  {id}
  {disabled}
  on:click={toggle}
  aria-label="Toggle Switch"
  class={cn(
    "peer inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
    checked ? "bg-primary" : "bg-input",
    $$props.class,
  )}
>
  <span
    class={cn(
      "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
      checked ? "translate-x-4" : "translate-x-0",
    )}
  ></span>
</button>
