<template>
  <van-notice-bar wrapable :scrollable="false" :text="cliStatusText" />
  <div>
    <van-cell center title="启用服务">
      <template #right-icon>
        <van-switch v-model="enable" @update:model-value="enableSwitch" :loading="enableLoading" />
      </template>
    </van-cell>
    <van-cell center title="放行9993端口">
      <template #right-icon>
        <van-switch v-model="firewall" @update:model-value="firewallSwitch" :loading="autoStartLoading" />
      </template>
    </van-cell>
    <van-cell center title="路由模式">
      <template #right-icon>
        <van-popover v-model:show="showPopover" :actions="actions" @select="onSelect">
          <template #reference>
            <van-button plain hairline type="primary">{{ defaultRoterMode }}</van-button>
          </template>
        </van-popover>
      </template>
    </van-cell>
    <van-cell center title="开机自启">
      <template #right-icon>
        <van-switch v-model="autoStart" @update:model-value="autoStartSwitch" :loading="autoStartLoading" />
      </template>
    </van-cell>
    <van-cell center title="卸载保留数据">
      <template #right-icon>
        <van-switch v-model="uninstallKeep" @update:model-value="uninstallKeepSwitch" :loading="uninstallKeepLoading" />
      </template>
    </van-cell>
  </div>

</template>

<script setup>
import { ref } from 'vue';
import { exec } from 'kernelsu';
const enable = ref(true);
const firewall = ref(true);
const autoStart = ref(true);
const uninstallKeep = ref(false);
const enableLoading = ref(false);
const firewallLoading = ref(false);
const autoStartLoading = ref(false);
const uninstallKeepLoading = ref(false);
const showPopover = ref(false);
const cliStatusText = ref();

// 通过 actions 属性来定义菜单选项
const actions = [
  { text: '自建路由模式', value: '0', disabled: true },
  { text: 'main表优先模式', value: '1' },
];
const defaultRoterMode = ref(actions[1].text);
const onSelect = (action) => {
  defaultRoterMode.value = action.text;
  showToast(action.text)
  console.info(action)
  if (action.text === '1') {
    console.info('开启开机自启服务')
    execCmd('rm /data/adb/zerotier/ROUTER_RULE_NEW').then(v => {
      console.info(v)
    })
  } else {
    console.info('关闭开机自启服务')
    execCmd('touch /data/adb/zerotier/ROUTER_RULE_NEW').then(v => {
      console.info(v)
    })
  }
  localStorage.setItem('defaultRoterMode', action.value)
}

const execCmd = async (cmd) => {
  console.info(cmd)
  const { errno, stdout, stderr } = await exec(cmd, { cwd: '/' });
  if (errno === 0) {
    // success
    console.log(stdout);
    return stdout;
  } else {
    console.info(stderr)
  }
}
cliStatusText.value = "启动服务查看节点信息";
execCmd('sh /data/adb/modules/ZeroTierForKSU/zerotier.sh status').then(v => {
  const statusObj = JSON.parse(v);
  enable.value = statusObj.enable == "" ? false : true;
  firewall.value = statusObj.firewall;
  autoStart.value = statusObj.autoStart;
  uninstallKeep.value = statusObj.uninstallKeep;
  const cliStatus = statusObj.cliStatus;
  if (typeof (cliStatus) != 'undefined') {
    const cliStatusArr = cliStatus.split(' ');
    const nodeId = cliStatusArr[2];
    const zerotierVersion = cliStatusArr[3];
    const serviceStatus = cliStatusArr[4];
    cliStatusText.value = `本机节点:${nodeId} 服务状态:${serviceStatus} 版本：${zerotierVersion}`
  }

});

const autoStartSwitch = (newValue) => {
  autoStartLoading.value = true;
  if (newValue === true) {
    console.info('开启开机自启服务')
    execCmd('rm /data/adb/zerotier/MANUAL').then(v => {
      autoStartLoading.value = false;
    })
  } else {
    console.info('关闭开机自启服务')
    execCmd('touch /data/adb/zerotier/MANUAL').then(v => {
      autoStartLoading.value = false;
    })
  }
};
const uninstallKeepSwitch = (newValue) => {
  uninstallKeepLoading.value = true;
  if (newValue === true) {
    console.info('开启卸载保留数据')
    execCmd('touch /data/adb/zerotier/KEEP_ON_UNINSTALL').then(v => {
      uninstallKeepLoading.value = false;
    })
  } else {
    console.info('关闭卸载保留数据')
    execCmd('rm /data/adb/zerotier/KEEP_ON_UNINSTALL').then(v => {
      uninstallKeepLoading.value = false;
    })
  }
};
const firewallSwitch = (newValue) => {
  firewallLoading.value = true;
  if (newValue === true) {
    console.info('允许防火墙放行9993')
    execCmd('touch /data/adb/zerotier/ALLOW_9993').then(v => {
      execCmd(`sh /data/adb/zerotier/api.sh firewall A`).then(v2 => {
        if (typeof (v2) != 'undefined' && v2 != '') {
          showDialog({
            title: v2,
          })
        }
        firewallLoading.value = false;
      })
    })
  } else {
    console.info('禁止防火墙放行9993')
    execCmd('rm /data/adb/zerotier/ALLOW_9993').then(v => {
      execCmd(`sh /data/adb/zerotier/api.sh firewall D`).then(v2 => {
        if (typeof (v2) != 'undefined' && v2 != '') {
          showDialog({
            title: v2,
          })
        }
        firewallLoading.value = false;
      })
    })
  }
};
const enableSwitch = (newValue) => {
  enableLoading.value = true;
  if (newValue === true) {
    console.info('启动zerotier')
    const cacheRoterMode = localStorage.getItem('defaultRoterMode');
    execCmd(`ASH_STANDALONE=1 /data/adb/ksu/bin/busybox sh /data/adb/modules/ZeroTierForKSU/zerotier.sh start ${cacheRoterMode}`).then(v => {
      enableLoading.value = false;
    })
  } else {
    console.info('关闭zerotier')
    execCmd('sh /data/adb/modules/ZeroTierForKSU/zerotier.sh stop').then(v => {
      enableLoading.value = false;
    })
  }
};

</script>