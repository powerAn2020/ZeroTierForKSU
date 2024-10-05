<template>
  <!-- 主体列表 -->
  <van-empty v-show="!ready" image="network" :description="t('common.service_no_run')">
    <van-button round type="primary" class="bottom-button" @click="startService">{{
      t('common.service_start') }}</van-button>
  </van-empty>
  <van-pull-refresh v-model="loading" @refresh="onRefresh">
    <van-collapse v-show="items.length != 0" v-model="activeNames" accordion style="min-height: 90vh;">
      <van-collapse-item v-for="(item, index) in items" :key="index" :name="index">
        <template #title>
          <van-swipe-cell :name="index">
            <template #left>
              <van-button square :type="item.enable === 'false' ? 'primary' : 'danger'" size="small"
                :text="item.enable === 'false' ? t('home.enable') : t('home.disable')" @click="changeStatus(index)"
                class="full-button" />
            </template>
            <van-cell center>
              <template #title>
                networkid:{{ item.id }}
              </template>
              <template #label>
                name:{{ item.name }}
              </template>
              <!-- 使用 title 插槽来自定义标题 -->
              <template #value>
                <van-tag v-if="item.enable === 'false'" type="danger">{{ t('home.disabled') }}</van-tag>
                <van-tag v-else type="success">{{ t('home.enabled') }}</van-tag>
                <van-tag v-if="item.status === 'REQUESTING_CONFIGURATION'" type="primary">{{
                  t('home.requesting_configuration') }}</van-tag>
                <van-tag v-else-if="item.status === 'NOT_FOUND'" type="warning">{{ t('home.not_found') }}</van-tag>
                <van-tag v-else-if="item.status === 'ACCESS_DENIED'" type="danger">{{ t('home.access_denied')
                  }}</van-tag>
                <van-tag v-else-if="item.status === 'PORT_ERROR'" type="danger">{{ t('home.port_error') }}</van-tag>
                <van-tag v-else-if="item.status === 'CLIENT_TOO_OLD'" type="warning">{{ t('home.client_too_old')
                  }}</van-tag>
                <van-tag v-else-if="item.status === 'AUTHENTICATION_REQUIRED'" type="primary">{{
                  t('home.authentication_required') }}</van-tag>
                <van-tag v-else-if="item.status === 'OK'" type="primary">{{ t('home.ok') }}</van-tag>
              </template>
            </van-cell>
            <template #right>
              <van-button size="small" square type="primary" :text="t('common.edit')" @click="newAdd(index)"
                class="full-button" />
              <van-button size="small" square type="danger" :text="t('common.delete')" @click="delNode(index)"
                class="full-button" />
            </template>
          </van-swipe-cell>
        </template>
        <JsonViewer :expand-depth="1" :value="item" copyable sort :theme="theme ? 'light' : 'dark'" />
      </van-collapse-item>
    </van-collapse>
  </van-pull-refresh>
  <!-- <van-floating-bubble icon="replay" axis="xy" @click="loadRouter" /> -->
  <van-dialog v-model:show="show" :title="t('home.edit_node_title')" show-cancel-button :before-close="addOrUpdateBtn">
    <van-space direction="vertical" fill>
      <van-row :gutter="[20, 20]">
        <van-col span="24">
          <van-field v-model="addOrUpdate.id" :label="t('home.nodeId')" required
            :placeholder="t('home.nodeId_input_tips')" :readonly="readonly" />
        </van-col>
      </van-row>
      <van-row :gutter="[20, 20]">
        <van-col span="12"> <van-checkbox shape="square" name="allowManaged" v-model="addOrUpdate.allowManaged">{{
          t('home.allowManaged') }}</van-checkbox>
        </van-col>
        <van-col span="12"> <van-checkbox shape="square" name="allowGlobal" v-model="addOrUpdate.allowGlobal">{{
          t('home.allowGlobal') }}</van-checkbox>
        </van-col>
      </van-row>
      <van-row :gutter="[20, 20]">
        <van-col span="12"> <van-checkbox shape="square" name="allowDefault" v-model="addOrUpdate.allowDefault">{{
          t('home.allowDefault') }}</van-checkbox>
        </van-col>
        <van-col span="12"> <van-checkbox shape="square" name="allowDNS" v-model="addOrUpdate.allowDNS">{{
          t('home.allowDNS') }}</van-checkbox>
        </van-col>
      </van-row>
      <van-row :gutter="[20, 20]">
        <van-col span="24"> </van-col>
      </van-row>
    </van-space>
  </van-dialog>

</template>

<script setup>
defineProps(["theme"]);//接收父组件传来的值
// import { ref, reactive } from 'vue';
import { JsonViewer } from "vue3-json-viewer"
import { MODDIR, ZTPATH, execCmd } from './tools'
import { useModuleInfoStore } from './stores/status'
import {  useI18n } from './locales'; // 导入所有翻译信息
const { t } = useI18n();
const moduleInfo = useModuleInfoStore();

const chosenAddressId = ref('1');
// const text = ref('禁用')
const loading = ref(false);
const readonly = ref(false);
const show = ref(false);
const activeNames = ref(null);
const ready = ref(false);
const items = reactive([]);
const addOrUpdate = ref(source());
function source() {
  return {
    "allowDNS": false,
    "allowDefault": false,
    "allowManaged": true,
    "allowGlobal": false,
    "name": '',
    "id": ''
  };
}

// ======== method=========

const reset = () => {
  addOrUpdate.value = source()
  info = addOrUpdate.value;
}
let info = addOrUpdate.value // Js里操作只操作 info 就可以不用 infoRef.value 了
const onRefresh = () => {
  getList();
  setTimeout(() => {
    loading.value = false;
  }, 50);
};
const startService = () => {
  execCmd(`rm ${ZTPATH}/state/disable`).then(v => {
    setTimeout(() => {
      showToast(t('common.operation_success'));
      ready.value = true;
      window.location.reload();
    }, 50);
  })
}
const startServiceConfirm = () => {
  showConfirmDialog({
    title: t('common.ask_service_start'),
  })
    .then(() => {
      startService()
    })
    .catch(() => resolve(true));

}
//新增或修改
const newAdd = (index) => {
  if (!moduleInfo.getServiceState) {
    startServiceConfirm()
    return;
  }
  show.value = true;
  if (typeof (index) !== 'undefined') {
    //修改回显
    readonly.value = true;
    const editObj = JSON.parse(JSON.stringify(items[index]));
    info.allowDNS = editObj.allowDNS,
      info.allowDefault = editObj.allowDefault,
      info.allowManaged = editObj.allowManaged,
      info.allowGlobal = editObj.allowGlobal,
      info.name = editObj.name,
      info.id = editObj.id
  } else {
    readonly.value = false;
    reset()
  }
  chosenAddressId.value = index;
}
const changeStatus = (index) => {
  if (!moduleInfo.getServiceState) {
    startServiceConfirm()
    return;
  }
  let status = items[index];
  //点击禁用
  if (typeof (status.enable) == 'undefined' || status.enable === 'true') {
    status.enable = 'false';
    leaveApi(status)
  } else {
    status.enable = 'true';
    //点击启用
    joinApi(status)
    let leaveNetwork = JSON.parse(localStorage.getItem('ZerotierForKSU.leaveNetwork'));
    const nleaveNetwork = leaveNetwork.filter(item => item.id !== status.id)
    localStorage.setItem("ZerotierForKSU.leaveNetwork", JSON.stringify(nleaveNetwork));
  }
}
const delNode = (index) => {
  if (!moduleInfo.getServiceState) {
    startServiceConfirm()
    return;
  }
  showConfirmDialog({
    title: t('home.leave_confirm'),
  })
    .then(() => {
      let leaveNetwork = JSON.parse(localStorage.getItem('ZerotierForKSU.leaveNetwork'));
      let status = items[index];
      items.splice(index, 1)
      leaveApi(status)
      if (leaveNetwork.length > 0) {
        const nleaveNetwork = leaveNetwork.filter(item => item.id !== status.id);
        localStorage.setItem("ZerotierForKSU.leaveNetwork", JSON.stringify(nleaveNetwork));
      }
      return true;
    })
    .catch(() => resolve(true));
}
const joinApi = (info) => {
  if (!moduleInfo.getServiceState) {
    startServiceConfirm()
    return;
  }
  const postData = JSON.stringify(info)
  execCmd(`sh ${MODDIR}/api.sh local network join ${info.id} '${postData}'`).then(v => {
    try {
      const statusObj = JSON.parse(v);
      console.info(statusObj);
      showToast(t('network.operation_success'));
      setTimeout(() => {
        window.location.reload();
      }, 50);
    } catch (error) {
      showDialog({
        title: t('network.operation_fail'),
        message: v
      }).then(() => {
        // on close
      });
    }

  });
}
const leaveApi = (info) => {
  if (!moduleInfo.getServiceState) {
    startServiceConfirm()
    return;
  }
  execCmd(`sh ${MODDIR}/api.sh local network leave ${info.id}`).then(v => {
    try {
      let leaveNetwork = JSON.parse(localStorage.getItem('ZerotierForKSU.leaveNetwork'));
      const statusObj = JSON.parse(v);
      console.info(statusObj);
      leaveNetwork.push(info)
      localStorage.setItem("ZerotierForKSU.leaveNetwork", JSON.stringify(leaveNetwork));
      // showToast('完成,即将重载列表');
      // setTimeout(() => {
      //   window.location.reload();
      // }, 50);
    } catch (error) {
      console.error(v);
      showDialog({
        title: t('network.operation_fail'),
        message: v
      }).then(() => {
        // on close
      });
    }
  });
}
const getList = () => {
  if (!moduleInfo.getServiceState) {
    startServiceConfirm()
    return;
  }
  execCmd(`sh ${MODDIR}/api.sh local network list`).then(v => {
    items.length = 0;
    if (v !== "") {
      const statusObj = JSON.parse(v);
      if (statusObj.length > 0) {
        let leaveNetwork = JSON.parse(localStorage.getItem('ZerotierForKSU.leaveNetwork'));
        if (leaveNetwork) {
          items.push(...leaveNetwork)
        }
        items.push(...statusObj)
      } else if (items.length == 0) {
        console.info(t('home.noNetwork_tips'))
      }
    }
  });
}
const addOrUpdateBtn = (action) =>
  new Promise((resolve) => {
    if (action === 'confirm') {
      // items.push(info);
      joinApi(info)
      setTimeout(() => {
        resolve(true)
      }, 50);
    } else if (action === 'cancel') {
      resolve(true);
      // reset();
    }
  });

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
  }, 1000)
}
init()

//加载路由并配置防火墙
// const loadRouter=()=>{
//   const defaultRoterMode=localStorage.getItem('ZerotierForKSU.defaultRoterMode')
//   execCmd(`sh ${MODDIR}/api.sh local router ${defaultRoterMode} `).then(v => {
//   })
// }
defineExpose({ newAdd });

</script>

<style>
.full-button {
  height: 100%;
}
</style>