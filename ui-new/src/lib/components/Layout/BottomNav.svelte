<script lang="ts">
  import { location, push } from "@/lib/router";
  import { Home, HardDrive, Globe, Settings } from "lucide-svelte";
  import { cn } from "@/lib/utils";

  const navItems = [
    { href: "/", icon: Home, label: "Dash" },
    { href: "/local", icon: HardDrive, label: "Local" },
    { href: "/central", icon: Globe, label: "Central" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  function isActive(path: string, currentPath: string) {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  }
</script>

<nav
  class="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
  <div class="grid grid-cols-4 h-16">
    {#each navItems as item}
      <button
        class={cn(
          "inline-flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isActive(item.href, $location.path) && "text-primary font-medium",
        )}
        on:click={() => push(item.href)}
      >
        <svelte:component this={item.icon} class="h-5 w-5" />
        <span class="text-xs">{item.label}</span>
      </button>
    {/each}
  </div>
</nav>
