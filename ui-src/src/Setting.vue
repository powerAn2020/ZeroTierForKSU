<template>
  <div>
    <van-cell center title="启用服务">
      <template #right-icon>
        <van-switch v-model="enable"  @update:model-value="enableSwitch" :loading="enableLoading" />
      </template>
    </van-cell>
    <van-cell center title="清理iptables">
      <template #right-icon>
        <van-tag size="large" type="warning">未实现</van-tag>
        <van-button icon="replay" type="primary" disabled>重载</van-button>
      </template>
    </van-cell>
    <van-cell center title="路由模式">
      <template #right-icon>
        <van-popover v-model:show="showPopover" :actions="actions" @select="onSelect">
          <template #reference>
            <van-button plain hairline type="primary">{{defaultRoterMode}}</van-button>
          </template>
        </van-popover>
      </template>
    </van-cell>
    <van-cell center title="开机自启">
      <template #right-icon>
        <van-switch v-model="autoStart" @update:model-value="autoStartSwitch" :loading="autoStartLoading"/>
      </template>
    </van-cell>
    <van-cell center title="卸载保留数据">
      <template #right-icon>
        <van-switch v-model="uninstallKeep" @update:model-value="uninstallKeepSwitch" :loading="uninstallKeepLoading"/>
      </template>
    </van-cell>
  </div>
</template>

<script>
import { ref } from 'vue';
import { exec  } from 'kernelsu';

export default {
  setup() {
    const enable = ref(true);
    const checked = ref(true);
    const autoStart = ref(true);
    const uninstallKeep = ref(false);
    const enableLoading = ref(false);
    const checkedLoading = ref(false);
    const autoStartLoading = ref(false);
    const uninstallKeepLoading = ref(false);
    const showPopover = ref(false);

    // 通过 actions 属性来定义菜单选项
    const actions = [
      { text: '自建路由模式',value:'0',disabled:true },
      { text: 'main表优先模式',value:'1'},
    ];
    const defaultRoterMode = ref(actions[1].text);
    const onSelect = (action) => {
      defaultRoterMode.value=action.text;
      showToast(action.text)
      console.info(action)
      localStorage.setItem('defaultRoterMode',action.value)
    };

    const execCmd = async (cmd) => {
      const { errno, stdout, stderr } = await exec(cmd, { cwd: '/' });
      if (errno === 0) {
        // success
        console.log(stdout);
        return stdout;
      } else {
        console.info(stderr)
      }
    }
    
    execCmd('sh /data/adb/modules/ZeroTierForKSU/zerotier.sh status').then(v=>{
       const statusObj=JSON.parse(v);
       enable.value=statusObj.enable==""?false:true;
       checked.value=statusObj.checked;
       autoStart.value=statusObj.autoStart;
       uninstallKeep.value=statusObj.uninstallKeep;
    });
   
    const autoStartSwitch = (newValue) => {
      autoStartLoading.value=true;
      if(newValue===true){
        console.info('开启开机自启服务')
        execCmd('rm /data/adb/zerotier/MANUAL').then(v=>{
          autoStartLoading.value=false;
        })
      }else{
        console.info('关闭开机自启服务')
        execCmd('touch /data/adb/zerotier/MANUAL').then(v=>{
          autoStartLoading.value=false;
        })
      }
    };
    const uninstallKeepSwitch = (newValue) => {
      uninstallKeepLoading.value=true;
      if(newValue===true){
        console.info('开启卸载保留数据')
        execCmd('touch /data/adb/zerotier/KEEP_ON_UNINSTALL').then(v=>{
          uninstallKeepLoading.value=false;
        })
      }else{
        console.info('关闭卸载保留数据')
        execCmd('rm /data/adb/zerotier/KEEP_ON_UNINSTALL').then(v=>{
          uninstallKeepLoading.value=false;
        })
      }
    };
    const enableSwitch = (newValue) => {
      enableLoading.value=true;
      if(newValue===true){
        console.info('启动zerotier')
        execCmd('sh /data/adb/modules/ZeroTierForKSU/zerotier.sh start').then(v=>{
          enableLoading.value=false;
        })
      }else{
        console.info('关闭zerotier')
        execCmd('sh /data/adb/modules/ZeroTierForKSU/zerotier.sh stop').then(v=>{
          enableLoading.value=false;
        })
      }
     };
    return {
      checked,
      enable,
      autoStart,
      uninstallKeep,
      checkedLoading,
      enableLoading,
      autoStartLoading,
      uninstallKeepLoading,
      actions,
      showPopover,
      defaultRoterMode,
      onSelect,
      uninstallKeepSwitch,
      enableSwitch,
      autoStartSwitch,
      execCmd
    };
  },
};
</script>