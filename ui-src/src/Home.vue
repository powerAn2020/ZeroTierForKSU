<template>
  <!-- 主体列表 -->
  <van-pull-refresh v-model="loading" @refresh="onRefresh" >
    <van-collapse v-model="activeNames" accordion style="min-height: 90vh;">
      <van-collapse-item v-for="(item, index) in items" :key="index" :name="index">
        <template #title>
          <van-swipe-cell :name="index">
            <template #left>
              <van-button square :type="item.enable === 'false' ? 'primary' : 'danger'" size="small"
                :text="item.enable === 'false' ? '启用' : '禁用'" @click="changeStatus(index)" />
            </template>
            <van-cell >
              <template #title>
                id:{{item.id}}
              </template>
              <template #label>
                name:{{item.name}}
              </template>
              <!-- 使用 title 插槽来自定义标题 -->
              <template #value>
                <van-tag v-if="item.enable === 'false'" type="danger">已禁用</van-tag>
                <van-tag v-else type="success">已启用</van-tag>
                <van-tag v-if="item.status === 'REQUESTING_CONFIGURATION'" type="primary">正在获取配置</van-tag>
                <van-tag v-else-if="item.status === 'NOT_FOUND'" type="warning">无效组网ID</van-tag>
                <van-tag v-else-if="item.status === 'ACCESS_DENIED'" type="danger">授权认证失败</van-tag>
                <van-tag v-else-if="item.status === 'PORT_ERROR'" type="danger">本地端口错误</van-tag>
                <van-tag v-else-if="item.status === 'CLIENT_TOO_OLD'" type="warning">低版本客户端</van-tag>
                <van-tag v-else-if="item.status === 'AUTHENTICATION_REQUIRED'" type="primary">请求授权认证</van-tag>
                <van-tag v-else-if="item.status === 'OK'" type="primary">组网成功</van-tag>
              </template>
            </van-cell>
            <template #right>
              <van-button size="small" square type="primary" text="编辑" @click="newAdd(index)" />
              <van-button size="small" square type="danger" text="删除" @click="delNode(index)" />
            </template>
          </van-swipe-cell>
        </template>
        <JsonViewer :expand-depth="1" :value="item" copyable sort :theme="theme?'light':'dark'"/>
      </van-collapse-item>
    </van-collapse>
  </van-pull-refresh>
  <!-- <van-floating-bubble icon="replay" axis="xy" @click="loadRouter" /> -->
  <van-dialog v-model:show="show" title="配置节点" show-cancel-button :before-close="addOrUpdateBtn">
    <van-row :gutter="[20, 20]">
      <van-col span="24">
        <van-field v-model="addOrUpdate.id" label="组网ID" required placeholder="请输入组网id" :readonly="readonly" />
      </van-col>
      <van-col span="12"> <van-checkbox shape="square" name="allowManaged"
          v-model="addOrUpdate.allowManaged">允许管理地址</van-checkbox>
      </van-col>
      <van-col span="12"> <van-checkbox shape="square" name="allowGlobal"
          v-model="addOrUpdate.allowGlobal">允许管理全局IP</van-checkbox>
      </van-col>
      <van-col span="12"> <van-checkbox shape="square" name="allowDefault"
          v-model="addOrUpdate.allowDefault">允许默认路由</van-checkbox>
      </van-col>
      <van-col span="12"> <van-checkbox shape="square" name="allowDNS"
          v-model="addOrUpdate.allowDNS">允许配置DNS</van-checkbox>
      </van-col>
      <van-col span="12"> </van-col>
    </van-row>
  </van-dialog>

</template>

<script setup>
defineProps(["theme"]);//接收父组件传来的值
import { ref, reactive } from 'vue';
import { JsonViewer } from "vue3-json-viewer"
import { exec } from 'kernelsu';

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

let leaveNetwork = localStorage.getItem("leaveNetwork");
if (typeof leaveNetwork == "undefined" && leaveNetwork == null) {
  leaveNetwork = [];
  localStorage.setItem("leaveNetwork", JSON.stringify(leaveNetwork));
} else {
  leaveNetwork = JSON.parse(leaveNetwork);
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
    showToast('刷新成功');
    loading.value = false;
  }, 1000);
};
//新增或修改
const newAdd = (index) => {
  if (ready.value != true) {
    showDialog({
      title: 'zerotier服务尚未启动，是否确认开启？',
    })
      .then(() => {
        execCmd(`rm /data/adb/zerotier/state/disable`).then(v => {
          setTimeout(() => {
            showToast('启动完成');
            return true;
          }, 2000);          
        })
      })
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
  debugger
  let status = items[index];
  //点击禁用
  if (typeof (status.enable) == 'undefined' || status.enable === 'true') {
    status.enable = 'false';
    leaveApi(status)
    leaveNetwork.push(status)
    localStorage.setItem("leaveNetwork", JSON.stringify(leaveNetwork));
  } else {
    status.enable = 'true';
    //点击启用
    joinApi(status)
    const nleaveNetwork = leaveNetwork.filter(item => item.id !== status.id)
    localStorage.setItem("leaveNetwork", JSON.stringify(nleaveNetwork));
  }
}
const delNode = (index) => {
  showConfirmDialog({
    title: '确定删除记录吗？这将离开当前网络，并短暂断网。',
  })
    .then(() => {
      let leaveNetwork = JSON.parse(localStorage.getItem('leaveNetwork'));
      let status = items[index];
      items.splice(index, 1)
      if (leaveNetwork.length > 0) {
        leaveApi(status)
        const nleaveNetwork = leaveNetwork.filter(item => item.id !== status.id);
        localStorage.setItem("leaveNetwork", JSON.stringify(nleaveNetwork));
      }
      return true;
    })
    .catch(() => resolve(true));
}
const joinApi = (info) => {
  const postData = JSON.stringify(info)
  execCmd(`sh /data/adb/modules/ZeroTierForKSU/api.sh joinOrUpdateNetwork ${info.id} '${postData}'`).then(v => {
    try {
      const statusObj = JSON.parse(v);
      console.info(statusObj);
      showToast('完成,即将重载列表');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      showDialog({
        title: '操作失败',
        message: v
      }).
      console.info(v);
    }

  });
}
const leaveApi = (info) => {
  execCmd(`sh /data/adb/modules/ZeroTierForKSU/api.sh leaveNetwork ${info.id}`).then(v => {
    try {
      const statusObj = JSON.parse(v);
      console.info(statusObj);
      showToast('完成,即将重载列表');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error(v);
      showDialog({
        title: '操作失败',
        message: v
      }).then(() => {
        // on close
      });
    }
  });
}
const getList=()=>{
  execCmd('sh /data/adb/modules/ZeroTierForKSU/api.sh networks').then(v => {
      items.length = 0;
      let leaveNetwork = JSON.parse(localStorage.getItem('leaveNetwork'));
      items.push(...leaveNetwork)
      if (v !== "") {
        const statusObj = JSON.parse(v);
        if (statusObj.length > 0) {
          items.push(...statusObj)
        } else if(items.length==0){
          showDialog({ message: '暂未加入任何节点，先去加入一个吧' });
        }
      }
    });
}
const addOrUpdateBtn = (action) =>
  new Promise((resolve) => {
    if (action === 'confirm') {
      items.push(info);
      joinApi(info)
      setTimeout(() => {
        resolve(true)
      }, 2000);
    } else if (action === 'cancel') {
      resolve(true);
      // reset();
    }
  });
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
execCmd('sh /data/adb/modules/ZeroTierForKSU/zerotier.sh status').then(v => {
  const statusObj = JSON.parse(v);
  if (statusObj.enable == "") {
    showDialog({
      title: 'zerotier服务尚未启动，是否确认开启？',
    })
      .then(() => {
    execCmd(`rm /data/adb/zerotier/state/disable`).then(v => {
          showToast('启动完成');
          setTimeout(() => {
            ready.value = true;
            window.location.reload();
            return true;
          }, 2000);
        })
      })
  } else {
    ready.value = true;
    getList();
  }
});
  //加载路由并配置防火墙
  // const loadRouter=()=>{
  //   const defaultRoterMode=localStorage.getItem('defaultRoterMode')
  //   execCmd(`sh /data/adb/modules/ZeroTierForKSU/api.sh router ${defaultRoterMode} `).then(v => {
  //   })
  // }
defineExpose({ newAdd });

</script>

<style lang="less"></style>