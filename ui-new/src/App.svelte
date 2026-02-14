<script context="module">
  // Theme initialization logic
  function initTheme() {
    const savedTheme = localStorage.getItem("theme") as
      | "light"
      | "dark"
      | "system";

    // Default to system if no theme saved, or apply saved
    const theme = savedTheme || "system";

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { isLoading } from "svelte-i18n";
  import Router from "@/lib/components/Router.svelte";
  import { routes } from "./routes";
  import BottomNav from "@/lib/components/Layout/BottomNav.svelte";
  import { appStore } from "@/stores/app";
  import ToastContainer from "@/lib/components/ui/toast/ToastContainer.svelte";
  import ConfirmDialog from "@/lib/components/ui/dialog/ConfirmDialog.svelte";
  import { KsuApi } from "@/api/ksu";
  import "@/lib/i18n"; // Initialize i18n

  onMount(() => {
    initTheme();
    // Initialize store with saved value if needed
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      appStore.setTheme(savedTheme as any);
    }

    // Initialize Debug Mode
    const savedDebug = localStorage.getItem("debugMode") === "true";
    if (savedDebug) {
      KsuApi.setDebug(true);
    }
  });
</script>

{#if $isLoading}
  <div class="flex items-center justify-center min-h-screen bg-background">
    <div class="flex flex-col items-center gap-4">
      <div
        class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
      ></div>
      <p class="text-muted-foreground text-sm">Loading...</p>
    </div>
  </div>
{:else}
  <main
    class="min-h-screen bg-background text-foreground font-sans antialiased pb-16"
  >
    {#if $appStore.loading}
      <div class="fixed top-0 left-0 right-0 h-1 bg-primary/20 z-[100]">
        <div class="h-full bg-primary animate-progress origin-left"></div>
      </div>
    {/if}
    <Router {routes} />
    <ToastContainer />
    <ConfirmDialog />
    <BottomNav />
  </main>
{/if}

<style>
  @keyframes progress {
    0% {
      transform: scaleX(0);
    }
    50% {
      transform: scaleX(0.5);
    }
    100% {
      transform: scaleX(1);
    }
  }
  .animate-progress {
    animation: progress 2s infinite ease-in-out;
  }
</style>
