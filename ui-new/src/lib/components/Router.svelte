<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { location, matchRoute } from "../router";
  import type { SvelteComponent } from "svelte";

  export let routes: Record<string, any> = {};

  let Component: any = null;
  let params: any = {};

  // Subscribe to location changes
  const unsubscribe = location.subscribe(($location) => {
    const match = matchRoute($location.path, routes);
    if (match) {
      Component = match.component;
      params = match.params;
    } else {
      // Handle 404 or redirect to home?
      // For now, if no match, maybe stay or clear
      // Optional: implement a wildcard route '*' in routes
      if (routes["*"]) {
        Component = routes["*"];
        params = {};
      }
    }
  });

  onDestroy(() => {
    unsubscribe();
  });
</script>

{#if Component}
  <svelte:component this={Component} {params} />
{/if}
