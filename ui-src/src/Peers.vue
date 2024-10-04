<template>
  <van-empty v-show="!ready" image="network" description="服务未启动">
    <van-button round type="primary" class="bottom-button" @click="startService">启动服务</van-button>
  </van-empty>
  <van-pull-refresh v-model="loading" @refresh="onRefresh">
    <van-collapse v-show="items.length != 0" v-model="activeNames" accordion style="min-height: 90vh;">
      <van-collapse-item v-for="(item, index) in items" :key="index" :name="index">
        <template #title>
          <van-cell :title="item.address" :value="item.role" />
          <!-- <template #value>
            </template> -->
        </template>
        <van-text-ellipsis rows="2" :content="getContent(item.paths)" expand-text="展开" collapse-text="收起" />
      </van-collapse-item>
    </van-collapse>
  </van-pull-refresh>

  <van-dialog v-model:show="show" title="加入自建moon" show-cancel-button :before-close="addBtn">
    <van-col span="24">
      <van-field v-model="moonId" label="world ID" required placeholder="请输入world ID" />
    </van-col>
  </van-dialog>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { ZTPATH, MODDIR, execCmd } from './tools'
import { useModuleInfoStore } from './stores/status'

const moduleInfo = useModuleInfoStore();
const ready = ref(false);

const show = ref(false);
const moonId = ref('');
const loading = ref(false);
const activeNames = ref(null);

const items = reactive([])

const startService = () => {
  execCmd(`rm ${ZTPATH}/state/disable`).then(v => {
    showToast('启动完成');
    setTimeout(() => {
      ready.value = true;
      window.location.reload();
      return true;
    }, 50);
  })
}

const onRefresh = () => {
  getList();
  setTimeout(() => {
    showToast('刷新成功');
    loading.value = false;
  }, 50);
};
const newAdd = (index) => {
  show.value = true;
}
const getContent = (arr) => {
  let showText = '';
  if (typeof arr != 'undefined' && arr != null) {
    let peerList = new Set();
    for (const path of arr) {
      let address = path.address;
      if (path.active && !peerList.has(address)) {
        peerList.add(address);
        showText += address;
        showText += '\n';
      }
    }
  } else {
    showText = '-'
  }
  return showText;
}
const addBtn = (action) =>
  new Promise((resolve) => {
    if (action === 'confirm') {
      execCmd(`sh ${MODDIR}/api.sh local orbit ${moonId.value}`).then(v => {
        showToast('完成');
        resolve(true);
      })

    } else if (action === 'cancel') {
      resolve(true);
    }
  });
const getList = () => {
  execCmd(`sh ${MODDIR}/api.sh local peer`).then(v => {
    items.length = 0;
    items.push(...JSON.parse(v));
  })
}
const init = () => {
  console.info('init')
  showLoadingToast({
    duration: 0,
    message: '',
    forbidClick: true,
    loadingType: 'spinner',
  });
  let leaveNetwork = localStorage.getItem("ZerotierForKSU.leaveNetwork");
  if (typeof leaveNetwork == "undefined" || leaveNetwork == null) {
    leaveNetwork = [];
    localStorage.setItem("ZerotierForKSU.leaveNetwork", JSON.stringify(leaveNetwork));
  } else {
    leaveNetwork = JSON.parse(leaveNetwork);
  }
  setTimeout(() => {
    execCmd(`sh ${MODDIR}/zerotier.sh status`).then(v => {
      const statusObj = JSON.parse(v);
      if (statusObj.enable == "") {
        ready.value = false;
        moduleInfo.changeServiceState(false);
        // startServiceConfirm()
      } else {
        ready.value = true;
        moduleInfo.changeServiceState(true);
        getList();
      }
    });
    closeToast()
  }, 500)
}
init()
defineExpose({ newAdd });

</script>