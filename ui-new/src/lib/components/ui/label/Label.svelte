<script lang="ts">
  import { cn } from "@/lib/utils";

  export let id: string = "";
</script>

<label
  {id}
  class={cn(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    $$props.class,
  )}
>
  <slot />
</label>
