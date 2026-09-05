<script lang="ts">
  import { onMount } from "svelte";
  import {
    Moon,
    Sun,
    Smartphone,
    Github,
    Info,
    Globe,
    HardDrive,
    Bug,
  } from "lucide-svelte";
  import Button from "@/lib/components/ui/button/Button.svelte";
  import Switch from "@/lib/components/ui/switch/Switch.svelte";
  import Label from "@/lib/components/ui/label/Label.svelte";
  import Input from "@/lib/components/ui/input/Input.svelte";
  import { appStore } from "@/stores/app";
  import { cn, STORAGE_KEYS, getStorageItem } from "@/lib/utils";
  import { KsuApi } from "@/api/ksu";
  import { toast } from "@/stores/toast";
  import { t, locale } from "svelte-i18n";

  const MODDIR = "/data/adb/modules/ZeroTierForKSU";

  let loading = false;
  let settings = {
    autoStart: false,
    firewall: false,
    uninstallKeep: false,
    branch: "main",
    apiToken: "",
    dns: "",
    routerRuleNew: false, // 0 = true (file exists), 1 = false (file missing)
  };

  function setLanguage(lang: string) {
    locale.set(lang);
    localStorage.setItem(STORAGE_KEYS.LOCALE, lang);
  }

  function setTheme(theme: "light" | "dark" | "system") {
    appStore.setTheme(theme);
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
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }

  let debugMode = KsuApi.getDebug();

  async function toggleDebug(v: boolean) {
    debugMode = v;
    KsuApi.setDebug(v);
    localStorage.setItem(STORAGE_KEYS.DEBUG_MODE, String(v));
    toast.success(
      $t(v ? "settings.toasts.debugEnabled" : "settings.toasts.debugDisabled"),
    );
  }

  async function loadSettings() {
    loading = true;
    try {
      // Load debug mode
      // Debug mode is now initialized globally in App.svelte, but we sync local state here
      const savedDebug = getStorageItem(STORAGE_KEYS.DEBUG_MODE, "debugMode") === "true";
      if (savedDebug) {
        debugMode = true;
      }

      const status = await KsuApi.getSystemStatus();
      if (debugMode) console.log("[Settings] Loaded status:", status);

      // status = { enable, branch, firewall, autoStart, apiToken, uninstallKeep, ... }
      // Use loose equality or explicit Boolean conversion for safety against shell JSON variations
      settings.autoStart = !!status.autoStart;
      settings.firewall = !!status.firewall;
      settings.uninstallKeep = !!status.uninstallKeep;
      settings.branch = status.branch || "main";
      settings.apiToken = status.apiToken || "";
      settings.dns = status.dns || "";

      // zerotier.sh: if file exists -> 0, else 1.
      // Loose equality (== 0) handles both number 0 and string "0"
      settings.routerRuleNew = status.routerRuleNew == 0;
    } catch (e: any) {
      toast.error(
        $t("settings.toasts.loadFailed", { values: { error: e.message } }),
      );
    } finally {
      loading = false;
    }
  }

  async function toggleAutoStart(v: boolean) {
    settings.autoStart = v; // Optimistic
    try {
      await KsuApi.toggleAutoStart(v);
      toast.success(
        $t(
          v
            ? "settings.toasts.autoStartEnabled"
            : "settings.toasts.autoStartDisabled",
        ),
      );
    } catch (e: any) {
      settings.autoStart = !v;
      toast.error(
        $t("settings.toasts.autoStartFailed", { values: { error: e.message } }),
      );
    }
  }

  async function toggleFirewall(v: boolean) {
    settings.firewall = v;
    try {
      await KsuApi.toggleFirewall(v);
      toast.success(
        $t(v ? "settings.toasts.portAllowed" : "settings.toasts.portBlocked"),
      );
    } catch (e: any) {
      settings.firewall = !v;
      toast.error(
        $t("settings.toasts.firewallFailed", { values: { error: e.message } }),
      );
    }
  }

  async function toggleKeepData(v: boolean) {
    settings.uninstallKeep = v;
    try {
      await KsuApi.toggleKeepData(v);
      toast.success(
        $t(
          v
            ? "settings.toasts.keepDataEnabled"
            : "settings.toasts.keepDataDisabled",
        ),
      );
    } catch (e: any) {
      settings.uninstallKeep = !v;
      toast.error(
        $t("settings.toasts.keepDataFailed", { values: { error: e.message } }),
      );
    }
  }

  async function toggleCustomRouting(v: boolean) {
    settings.routerRuleNew = v;
    try {
      await KsuApi.toggleCustomRouting(v);
      toast.success(
        $t(
          v
            ? "settings.toasts.routingEnabled"
            : "settings.toasts.routingDisabled",
        ),
      );
    } catch (e: any) {
      settings.routerRuleNew = !v;
      toast.error(
        $t("settings.toasts.routingFailed", { values: { error: e.message } }),
      );
    }
  }

  async function switchChannel(c: "main" | "dev") {
    if (settings.branch === c) return;
    const old = settings.branch;
    settings.branch = c;
    try {
      await KsuApi.switchChannel(c);
      toast.success(
        $t("settings.toasts.channelSwitched", { values: { channel: c } }),
      );
    } catch (e: any) {
      settings.branch = old;
      toast.error(
        $t("settings.toasts.channelFailed", { values: { error: e.message } }),
      );
    }
  }

  async function updateApiToken(v: string) {
    settings.apiToken = v;
    try {
      await KsuApi.updateApiToken(v);
      toast.success($t("settings.toasts.tokenUpdated"));
    } catch (e: any) {
      toast.error(
        $t("settings.toasts.tokenFailed", { values: { error: e.message } }),
      );
    }
  }

  async function updateDns(v: string) {
    settings.dns = v;
    try {
      await KsuApi.updateDns(v);
      toast.success($t("settings.toasts.dnsUpdated"));
    } catch (e: any) {
      toast.error(
        $t("settings.toasts.dnsFailed", { values: { error: e.message } }),
      );
    }
  }

  function setPresetDns(preset: string) {
    settings.dns = preset;
  }

  onMount(() => {
    loadSettings();
  });
</script>

<div class="p-4 space-y-6 pb-24">
  <div
    class="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 -mt-4 -mx-4 px-4 border-b mb-6"
  >
    <h1 class="text-2xl font-bold tracking-tight">{$t("settings.title")}</h1>
  </div>

  <!-- Appearance -->
  <div class="space-y-3">
    <h2
      class="text-sm font-medium text-muted-foreground uppercase tracking-wider"
    >
      {$t("settings.appearance")}
    </h2>
    <div class="grid grid-cols-3 gap-2 bg-muted/40 p-1 rounded-lg">
      <button
        class={cn(
          "flex flex-col items-center gap-2 p-3 rounded-md transition-all",
          $appStore.theme === "light"
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:bg-background/50",
        )}
        on:click={() => setTheme("light")}
      >
        <Sun class="h-5 w-5" />
        <span class="text-xs font-medium">{$t("settings.theme.light")}</span>
      </button>
      <button
        class={cn(
          "flex flex-col items-center gap-2 p-3 rounded-md transition-all",
          $appStore.theme === "dark"
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:bg-background/50",
        )}
        on:click={() => setTheme("dark")}
      >
        <Moon class="h-5 w-5" />
        <span class="text-xs font-medium">{$t("settings.theme.dark")}</span>
      </button>
      <button
        class={cn(
          "flex flex-col items-center gap-2 p-3 rounded-md transition-all",
          $appStore.theme === "system"
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:bg-background/50",
        )}
        on:click={() => setTheme("system")}
      >
        <Smartphone class="h-5 w-5" />
        <span class="text-xs font-medium">{$t("settings.theme.system")}</span>
      </button>
    </div>
  </div>

  <div class="space-y-3">
    <h2
      class="text-sm font-medium text-muted-foreground uppercase tracking-wider"
    >
      {$t("settings.language")}
    </h2>
    <div class="grid grid-cols-2 gap-2 bg-muted/40 p-1 rounded-lg">
      <button
        class={cn(
          "flex flex-col items-center gap-2 p-3 rounded-md transition-all",
          $locale === "zh"
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:bg-background/50",
        )}
        on:click={() => setLanguage("zh")}
      >
        <span class="text-xs font-medium">中文</span>
      </button>
      <button
        class={cn(
          "flex flex-col items-center gap-2 p-3 rounded-md transition-all",
          $locale === "en"
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:bg-background/50",
        )}
        on:click={() => setLanguage("en")}
      >
        <span class="text-xs font-medium">English</span>
      </button>
    </div>
  </div>

  <div class="space-y-3">
    <h2
      class="text-sm font-medium text-muted-foreground uppercase tracking-wider"
    >
      {$t("settings.general.title")}
    </h2>
    <div
      class="rounded-xl border bg-card text-card-foreground shadow-sm divide-y"
    >
      <!-- Start on Boot -->
      <div class="p-4 flex items-center justify-between">
        <Label class="flex flex-col gap-1">
          <span>{$t("settings.general.startOnBoot")}</span>
          <span class="text-xs font-normal text-muted-foreground"
            >{$t("settings.general.startOnBootDesc")}</span
          >
        </Label>
        <Switch
          checked={settings.autoStart}
          on:checkedChange={(e) => toggleAutoStart(e.detail)}
          disabled={loading}
        />
      </div>

      <!-- Allow Port 9993 -->
      <div class="p-4 flex items-center justify-between">
        <Label class="flex flex-col gap-1">
          <span>{$t("settings.general.allowPort")}</span>
          <span class="text-xs font-normal text-muted-foreground"
            >{$t("settings.general.allowPortDesc")}</span
          >
        </Label>
        <Switch
          checked={settings.firewall}
          on:checkedChange={(e) => toggleFirewall(e.detail)}
          disabled={loading}
        />
      </div>

      <!-- Keep Data on Uninstall -->
      <div class="p-4 flex items-center justify-between">
        <Label class="flex flex-col gap-1">
          <span>{$t("settings.general.keepData")}</span>
          <span class="text-xs font-normal text-muted-foreground"
            >{$t("settings.general.keepDataDesc")}</span
          >
        </Label>
        <Switch
          checked={settings.uninstallKeep}
          on:checkedChange={(e) => toggleKeepData(e.detail)}
          disabled={loading}
        />
      </div>

      <!-- Custom Routing -->
      <div class="p-4 flex items-center justify-between">
        <Label class="flex flex-col gap-1">
          <span>{$t("settings.general.customRouting")}</span>
          <span class="text-xs font-normal text-muted-foreground"
            >{$t("settings.general.customRoutingDesc")}</span
          >
        </Label>
        <Switch
          checked={settings.routerRuleNew}
          on:checkedChange={(e) => toggleCustomRouting(e.detail)}
          disabled={loading}
        />
      </div>

      <!-- Update Channel -->
      <div class="p-4 flex items-center justify-between">
        <Label class="flex flex-col gap-1">
          <span>{$t("settings.general.updateChannel")}</span>
          <span class="text-xs font-normal text-muted-foreground"
            >{$t("settings.general.updateChannelDesc")}</span
          >
        </Label>
        <div class="flex items-center gap-2">
          <Button
            variant={settings.branch === "main" ? "secondary" : "ghost"}
            size="sm"
            class="h-7 text-xs"
            on:click={() => switchChannel("main")}
            disabled={loading}
          >
            {$t("settings.general.stable")}
          </Button>
          <Button
            variant={settings.branch === "dev" ? "secondary" : "ghost"}
            size="sm"
            class="h-7 text-xs"
            on:click={() => switchChannel("dev")}
            disabled={loading}
          >
            {$t("settings.general.dev")}
          </Button>
        </div>
      </div>
    </div>
  </div>

  <!-- API Token -->
  <div class="space-y-3">
    <h2
      class="text-sm font-medium text-muted-foreground uppercase tracking-wider"
    >
      {$t("settings.api.title")}
    </h2>
    <div
      class="rounded-xl border bg-card text-card-foreground shadow-sm p-4 space-y-4"
    >
      <div class="grid gap-2">
        <Label>{$t("settings.api.token")}</Label>
        <div class="flex gap-2">
          <Input
            type="password"
            placeholder={$t("settings.api.placeholder")}
            value={settings.apiToken}
            class="font-mono flex-1"
            on:change={(e) =>
              updateApiToken((e.target as HTMLInputElement).value)}
          />
          <Button
            on:click={() => updateApiToken(settings.apiToken)}
            disabled={loading}
          >
            {$t("common.save")}
          </Button>
        </div>
        <p class="text-xs text-muted-foreground">
          {$t("settings.api.desc")}👉
          <button
            class="text-primary hover:underline"
            on:click={() =>
              KsuApi.openUrl("https://docs.zerotier.com/tokens/#legacy-central-api-token")}
          >
            docs.zerotier.com
          </button>
        </p>
      </div>
    </div>
  </div>

  <!-- Custom DNS -->
  <div class="space-y-3">
    <h2
      class="text-sm font-medium text-muted-foreground uppercase tracking-wider"
    >
      {$t("settings.dns.title")}
    </h2>
    <div
      class="rounded-xl border bg-card text-card-foreground shadow-sm p-4 space-y-4"
    >
      <div class="grid gap-2">
        <Label>{$t("settings.dns.label")}</Label>
        <div class="flex gap-2">
          <Input
            type="text"
            placeholder={$t("settings.dns.placeholder")}
            value={settings.dns}
            class="font-mono flex-1"
            on:input={(e) =>
              (settings.dns = (e.target as HTMLInputElement).value)}
            on:change={(e) =>
              updateDns((e.target as HTMLInputElement).value)}
          />
          <Button
            on:click={() => updateDns(settings.dns)}
            disabled={loading}
          >
            {$t("common.save")}
          </Button>
        </div>
        <div class="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            type="button"
            class="text-xs px-2 py-0.5 rounded border border-muted-foreground/30 hover:bg-muted text-muted-foreground transition-colors"
            on:click={() => setPresetDns("1.1.1.1,1.0.0.1")}
          >
            Cloudflare
          </button>
          <button
            type="button"
            class="text-xs px-2 py-0.5 rounded border border-muted-foreground/30 hover:bg-muted text-muted-foreground transition-colors"
            on:click={() => setPresetDns("8.8.8.8,8.8.4.4")}
          >
            Google
          </button>
          <button
            type="button"
            class="text-xs px-2 py-0.5 rounded border border-muted-foreground/30 hover:bg-muted text-muted-foreground transition-colors"
            on:click={() => setPresetDns("223.5.5.5,223.6.6.6")}
          >
            AliDNS
          </button>
          <button
            type="button"
            class="text-xs px-2 py-0.5 rounded border border-muted-foreground/30 hover:bg-muted text-muted-foreground transition-colors"
            on:click={() => setPresetDns("119.29.29.29")}
          >
            DNSPod
          </button>
          {#if settings.dns}
            <button
              type="button"
              class="text-xs px-2 py-0.5 rounded border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors ml-auto"
              on:click={() => updateDns("")}
            >
              {$t("settings.dns.clear")}
            </button>
          {/if}
        </div>
        <p class="text-xs text-muted-foreground">
          {$t("settings.dns.desc")}
        </p>
      </div>
    </div>
  </div>

  <!-- About -->
  <div class="space-y-3">
    <h2
      class="text-sm font-medium text-muted-foreground uppercase tracking-wider"
    >
      {$t("settings.about.title")}
    </h2>
    <div
      class="rounded-xl border bg-card text-card-foreground shadow-sm divide-y"
    >
      <div class="p-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="bg-primary/10 p-2 rounded-full text-primary">
            <Info class="h-5 w-5" />
          </div>
          <div>
            <div class="font-medium">{$t("settings.about.coreVersion")}</div>
            <div class="text-xs text-muted-foreground">
              {$appStore.moduleVersion
                ? $appStore.moduleVersion.split("(")[0].trim()
                : $appStore.version || $t("common.unknown")}
            </div>
          </div>
        </div>
      </div>
      <div class="p-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="bg-primary/10 p-2 rounded-full text-primary">
            <HardDrive class="h-5 w-5" />
          </div>
          <div>
            <div class="font-medium">{$t("settings.about.moduleVersion")}</div>
            <div class="text-xs text-muted-foreground">
              {$appStore.moduleVersionCode
                ? `${$appStore.moduleVersionCode}`
                : $appStore.moduleVersion || $t("common.unknown")}
            </div>
          </div>
        </div>
      </div>
      <button
        class="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
        on:click={() =>
          KsuApi.openUrl("https://github.com/powerAn2020/ZeroTierForKSU")}
      >
        <div class="flex items-center gap-3">
          <div class="bg-primary/10 p-2 rounded-full text-primary">
            <Github class="h-5 w-5" />
          </div>
          <div>
            <div class="font-medium">{$t("settings.about.github")}</div>
            <div class="text-xs text-muted-foreground">
              {$t("settings.about.sourceCode")}
            </div>
          </div>
        </div>
      </button>
    </div>
  </div>

  <!-- Developer -->
  <div class="space-y-3">
    <h2
      class="text-sm font-medium text-muted-foreground uppercase tracking-wider"
    >
      {$t("settings.developer.title")}
    </h2>
    <div class="bg-card rounded-lg border shadow-sm overflow-hidden">
      <!-- Debug Mode -->
      <div class="p-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="bg-primary/10 p-2 rounded-full text-primary">
            <Bug class="h-5 w-5" />
          </div>
          <div>
            <div class="font-medium">{$t("settings.developer.debugMode")}</div>
            <div class="text-xs text-muted-foreground">
              {$t("settings.developer.debugModeDesc")}
            </div>
          </div>
        </div>
        <Switch
          checked={debugMode}
          on:checkedChange={(e) => toggleDebug(e.detail)}
        />
      </div>
    </div>
  </div>

  <div class="text-center text-xs text-muted-foreground pt-8">
    <p>{$t("settings.footer")}</p>
    <p class="font-mono mt-1">{MODDIR}</p>
  </div>
</div>
