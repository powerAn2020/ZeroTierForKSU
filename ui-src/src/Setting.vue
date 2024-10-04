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
    <!-- <van-cell center title="路由模式">
      <template #right-icon>
        <van-popover v-model:show="showPopover" :actions="actions" @select="onSelect">
          <template #reference>
            <van-button plain hairline type="primary">{{ defaultRoterMode }}</van-button>
          </template>
        </van-popover>
      </template>
    </van-cell> -->
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
    <van-cell title="API Token" :value="apiToken" clickable @click="tokenEditor = true" />
    <van-cell title="查看源码" is-link url="https://github.com/powerAn2020/ZeroTierOneForKSU" />
    <van-cell title="从哪里获取API Token?" is-link url="https://docs.zerotier.com/api/tokens/#zerotier-central-token" />
  </div>
  <van-popup v-model:show="tokenEditor" round :style="{ width: '90%', maxHeight: '85%' }" @close="saveToken()">
    <van-field v-model="apiToken" label="API Token" placeholder="ZeroTier Central Token" />
  </van-popup>
</template>

<script setup>
import { ref } from 'vue';
import { MODDIR, ZTPATH, execCmd } from './tools'
const enable = ref(true);
const firewall = ref(true);
const autoStart = ref(true);
const uninstallKeep = ref(false);
const enableLoading = ref(false);
const tokenEditor = ref(false);
const firewallLoading = ref(false);
const autoStartLoading = ref(false);
const uninstallKeepLoading = ref(false);
const showPopover = ref(false);
const cliStatusText = ref();
const apiToken = ref('');

// 通过 actions 属性来定义菜单选项
const actions = [
  { text: '自建路由模式', value: '0', disabled: true },
  { text: 'main表优先模式', value: '1' },
];
const defaultRoterMode = ref(actions[1].text);
// 绑定路由选择事件
// const onSelect = (action) => {
//   defaultRoterMode.value = action.text;
//   showToast(action.text)
//   console.info(action)
//   if (action.value == '1') {
//     console.info('main表优先模式')
//     execCmd(`rm ${ZTPATH}/ROUTER_RULE_NEW`).then(v => {
//       console.info(v)
//     })
//   } else {
//     console.info('自建路由模式')
//     execCmd(`touch ${ZTPATH}/ROUTER_RULE_NEW`).then(v => {
//       console.info(v)
//     })
//   }
//   localStorage.setItem('defaultRoterMode', action.value)
// }

const init = () => {
  cliStatusText.value = "启动服务查看节点信息";
  const lApiToken = localStorage.getItem('ZerotierForKSU.apiToken');
  if (lApiToken) {
    apiToken.value = lApiToken;
  }
  execCmd(`sh ${MODDIR}/zerotier.sh status`).then(v => {
    const statusObj = JSON.parse(v);
    enable.value = statusObj.enable == "" ? false : true;
    firewall.value = statusObj.firewall;
    autoStart.value = statusObj.autoStart;
    uninstallKeep.value = statusObj.uninstallKeep;
    localStorage.setItem('ZerotierForKSU.defaultRoterMode', statusObj.routerRuleNew)
    defaultRoterMode.value = actions[parseInt(statusObj.routerRuleNew)].text;
    const cliStatus = statusObj.cliStatus;
    if (typeof (cliStatus) != 'undefined' && cliStatus != '') {
      const cliStatusArr = cliStatus.split(' ');
      const nodeId = cliStatusArr[2];
      const zerotierVersion = cliStatusArr[3];
      const serviceStatus = cliStatusArr[4];
      cliStatusText.value = `本机节点:${nodeId} 服务状态:${serviceStatus} 版本：${zerotierVersion}`
    }
  });
}
const saveToken = () => {
  console.info(saveToken)
  apiToken.value=apiToken.value.trim()
  if (apiToken.value.length == 0) {
    showToast('移除API Token')
    localStorage.removeItem('ZerotierForKSU.apiToken')
  } else {
    localStorage.setItem('ZerotierForKSU.apiToken', apiToken.value)
    showToast('更新API Token')
  }
  execCmd(`sh ${MODDIR}/api.sh apiToken update ${apiToken.value}`)
}
const autoStartSwitch = (newValue) => {
  autoStartLoading.value = true;
  if (newValue === true) {
    console.info('开启开机自启服务')
    execCmd(`rm ${ZTPATH}/MANUAL`).then(v => {
      autoStartLoading.value = false;
    })
  } else {
    console.info('关闭开机自启服务')
    execCmd(`touch ${ZTPATH}/MANUAL`).then(v => {
      autoStartLoading.value = false;
    })
  }
};
const uninstallKeepSwitch = (newValue) => {
  uninstallKeepLoading.value = true;
  if (newValue === true) {
    console.info('开启卸载保留数据')
    execCmd(`touch ${ZTPATH}/KEEP_ON_UNINSTALL`).then(v => {
      uninstallKeepLoading.value = false;
    })
  } else {
    console.info('关闭卸载保留数据')
    execCmd(`rm ${ZTPATH}/KEEP_ON_UNINSTALL`).then(v => {
      uninstallKeepLoading.value = false;
    })
  }
};
const firewallSwitch = (newValue) => {
  firewallLoading.value = true;
  if (newValue === true) {
    console.info('允许防火墙放行9993')
    execCmd(`sh ${MODDIR}/api.sh local firewall A`).then(v2 => {
      if (typeof (v2) != 'undefined' && v2 != '') {
        showDialog({
          title: v2,
        })
      }
      firewallLoading.value = false;
    })
  } else {
    console.info('禁止防火墙放行9993')
    execCmd(`sh ${MODDIR}/api.sh local firewall D`).then(v2 => {
      if (typeof (v2) != 'undefined' && v2 != '') {
        showDialog({
          title: v2,
        })
      }
      firewallLoading.value = false;
    })
  }
};
const enableSwitch = (newValue) => {
  enableLoading.value = true;
  if (newValue === true) {
    console.info('启动zerotier')
    // const cacheRoterMode = localStorage.getItem('ZerotierForKSU.defaultRoterMode');
    execCmd(`sh ${MODDIR}/zerotier.sh start`).then(v => {
      setTimeout(() => {
        enableLoading.value = false;
      }, 50);
    })
  } else {
    console.info('关闭zerotier')
    execCmd(`sh ${MODDIR}/zerotier.sh stop`).then(v => {
      setTimeout(() => {
        enableLoading.value = false;
        cliStatusText.value = "启动服务查看节点信息";
      }, 50);
    })
  }
};
init()
</script>