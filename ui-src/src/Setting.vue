<template>
  <van-notice-bar wrapable :scrollable="false" :text="cliStatusText" />
  <van-cell center :title="t('common.service_start')">
    <template #right-icon>
      <van-switch v-model="enable" @update:model-value="enableSwitch" :loading="enableLoading" />
    </template>
  </van-cell>
  <van-cell center :title="t('setting.autoStart')">
    <template #right-icon>
      <van-switch v-model="autoStart" @update:model-value="autoStartSwitch" :loading="autoStartLoading" />
    </template>
  </van-cell>
  <van-cell center :title="t('setting.allow9993')">
    <template #right-icon>
      <van-switch v-model="firewall" @update:model-value="firewallSwitch" :loading="firewallLoading" />
    </template>
  </van-cell>
  <!-- <van-cell center :title="t('setting.routeMode')">
      <template #right-icon>
        <van-popover v-model:show="showPopover" :actions="actions" @select="onSelect">
          <template #reference>
            <van-button plain hairline type="primary">{{ defaultRoterMode }}</van-button>
          </template>
        </van-popover>
      </template>
    </van-cell> -->
  <van-cell center :title="t('setting.uninstallKeep')">
    <template #right-icon>
      <van-switch v-model="uninstallKeep" @update:model-value="uninstallKeepSwitch" :loading="uninstallKeepLoading" />
    </template>
  </van-cell>
  <van-field v-model="defaultUpdateChannel" input-align="right" is-link readonly :label="t('setting.branch')" :placeholder="defaultUpdateChannel" @click="showPicker = true" />

  <van-cell title="API Token" :value="hideKey(apiToken)" clickable @click="tokenEditor = true" />
  <van-cell :title="t('setting.sourceCode')" is-link @click="openUrl('https://github.com/powerAn2020/ZeroTierOneForKSU')"/>
  <van-cell :title="t('setting.apiDocument')" is-link @click="openUrl('https://docs.zerotier.com/api/tokens/#zerotier-central-token')" />

  <van-popup v-model:show="showPicker" round position="bottom">
    <van-picker :columns="updateChannelActions" @cancel="showPicker = false" @confirm="onChannelSelect" />
  </van-popup>

  <van-popup v-model:show="tokenEditor" round :style="{ width: '90%', maxHeight: '85%' }" @close="saveToken()">
    <van-field v-model="apiToken" label="API Token" placeholder="ZeroTier Central API Token" />
  </van-popup>
</template>

<script setup>
// import { ref } from 'vue';
import { MODDIR, ZTPATH, execCmd,spawnCmdWithCallback } from './tools'
import { useI18n } from './locales'; // 导入所有翻译信息
const { t } = useI18n();

const enable = ref(true);
const firewall = ref(true);
const autoStart = ref(true);
const uninstallKeep = ref(false);
const branch = ref(false);
const showPicker = ref(false);
const enableLoading = ref(false);
const tokenEditor = ref(false);
const firewallLoading = ref(false);
const autoStartLoading = ref(false);
const branchLoading = ref(false);
const uninstallKeepLoading = ref(false);
const showPopover = ref(false);
const showUpdateChannelPopover = ref(false);
const cliStatusText = ref();
const apiToken = ref('');

// 通过 actions 属性来定义菜单选项
const actions = [
  { text: t('setting.routeMode_rule'), value: '0', disabled: true },
  { text: t('setting.routeMode_main'), value: '1' },
];
const updateChannelActions = [
  { text: 'dev', value: 'dev' },
  { text: 'main', value: 'main' },
];
const onChannelSelect = ({ selectedOptions  }) => {
  showPicker.value = false;
  defaultUpdateChannel.value = selectedOptions[0].value;
  console.info(selectedOptions)
  if (selectedOptions[0].value == 'dev') {

    console.info('DEV分支')
    execCmd(`sh ${MODDIR}/zerotier.sh switch dev`).then(v => {
      console.info(v)
    })
  } else {
    console.info('MAIN分支')
    execCmd(`sh ${MODDIR}/zerotier.sh switch main`).then(v => {
      console.info(v)
    })
  }
}
const defaultRoterMode = ref(actions[1].text);
const defaultUpdateChannel = ref('');
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
const hideKey = (key) => {
  if (key.length == 0) {
    return key;
  }
  return key.substring(0, 4) + "***********" + key.substring(key.length - 2)
}
const init = () => {
  showLoadingToast({
    duration: 0,
    message: '',
    forbidClick: true,
    loadingType: 'spinner',
  });
  cliStatusText.value = t('setting.cliStatusText');
  setTimeout(() => {
    execCmd(`sh ${MODDIR}/zerotier.sh status`).then(v => {
      const statusObj = JSON.parse(v);
      enable.value = statusObj.enable == "" ? false : true;
      defaultUpdateChannel.value = statusObj.branch
      branch.value = statusObj.branch == "dev" ? true : false;
      firewall.value = statusObj.firewall;
      autoStart.value = statusObj.autoStart;
      apiToken.value = statusObj.apiToken;
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
    closeToast()
  }, 500)
}
const saveToken = () => {
  console.info(saveToken)
  apiToken.value = apiToken.value.trim()
  if (apiToken.value.length == 0) {
    showToast('移除API Token')
  } else {
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
    execCmd(`sh ${MODDIR}/api.sh local service start`).then(v => {
      setTimeout(() => {
        enableLoading.value = false;
      }, 1000);
    })
  } else {
    console.info('关闭zerotier')
    execCmd(`sh ${MODDIR}/api.sh local service stop`).then(v => {
      setTimeout(() => {
        enableLoading.value = false;
        cliStatusText.value = t('setting.cliStatusText');;
      }, 1000);
    })
  }
};
const openUrl=(url)=>{
  spawnCmdWithCallback({cmd: `am start -a android.intent.action.VIEW -d "${url}"`})
}
init()
</script>