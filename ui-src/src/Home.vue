<template>
  <!-- 表头 -->
  <van-notice-bar
  left-icon="volume-o"
  text="暂时没有好办法，所以组网成功完成后需要点击悬浮按钮加载路由"
/>
  <!-- 主体列表 -->
  <van-pull-refresh v-model="loading" @refresh="onRefresh" style="min-height: 100vh;">
    <van-collapse v-model="activeNames" accordion>
      <van-collapse-item v-for="(item, index) in items" :key="index" :name="index">
        <template #title>
          <van-swipe-cell :name="index">
            <template #left>
              <van-button square :type="item.enable === 'false' ? 'primary' : 'danger'" size="small"
                :text="item.enable === 'false' ? '启用' : '禁用'" @click="changeStatus(index)" />
              <!-- <van-button square v-else type="primary" text="禁用" size="small" @click="leaveNode(index)"/> -->
            </template>
            <van-cell :title="item.id">
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
        <JsonViewer :expand-depth="1" :value="item" copyable sort />
      </van-collapse-item>
    </van-collapse>
  </van-pull-refresh>
  <van-floating-bubble icon="chat" @click="loadRouter" />
  <van-dialog v-model:show="show" title="标题" show-cancel-button :before-close="addOrUpdateBtn">
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
import { ref, reactive, defineExpose } from 'vue';
import { JsonViewer } from "vue3-json-viewer"
import { exec } from 'kernelsu';
const chosenAddressId = ref('1');
const text = ref('禁用')
const loading = ref(false);
const readonly = ref(false);
const show = ref(false);
const activeNames = ref(null);
const ready = ref(false);
// const items = reactive([
//   {
//     "allowDNS": false,
//     "allowDefault": true,
//     "allowManaged": true,
//     "allowGlobal": false,
//     "assignedAddresses": [
//       "string"
//     ],
//     "bridge": true,
//     "broadcastEnabled": true,
//     "dns": {
//       "domain": "example.com",
//       "servers": [
//         "192.168.0.1"
//       ]
//     },
//     "id": "networkid",
//     "mac": "string",
//     "mtu": 1280,
//     "multicastSubscriptions": [
//       {
//         "adi": 0,
//         "mac": "string"
//       }
//     ],
//     "authenticationURL": "http://example.com",
//     "authenticationExpiryTime": 0,
//     "name": "string",
//     "netconfRevision": 0,
//     "portDeviceName": "string",
//     "portError": 0,
//     "routes": [
//       {
//         "flags": 0,
//         "metric": 0,
//         "target": "string",
//         "via": "192.168.0.1"
//       }
//     ],
//     "status": "REQUESTING_CONFIGURATION",
//     "type": "PUBLIC",
//     "property1": null,
//     "property2": null
//   }, {
//     "allowDNS": true,
//     "allowDefault": true,
//     "allowManaged": true,
//     "allowGlobal": true,
//     "assignedAddresses": [
//       "string"
//     ],
//     "bridge": true,
//     "broadcastEnabled": true,
//     "dns": {
//       "domain": "example.com",
//       "servers": [
//         "192.168.0.1"
//       ]
//     },
//     "id": "-------------",
//     "mac": "string",
//     "mtu": 1280,
//     "multicastSubscriptions": [
//       {
//         "adi": 0,
//         "mac": "string"
//       }
//     ],
//     "authenticationURL": "http://example.com",
//     "authenticationExpiryTime": 0,
//     "name": "string",
//     "netconfRevision": 0,
//     "portDeviceName": "string",
//     "portError": 0,
//     "routes": [
//       {
//         "flags": 0,
//         "metric": 0,
//         "target": "string",
//         "via": "192.168.0.1"
//       }
//     ],
//     "status": "OK",
//     "type": "PUBLIC",
//     "property1": null,
//     "property2": null
//   }])
const items = reactive([]);
const addOrUpdate = ref(source());
function source() {
  return {
    "allowDNS": false,
    "allowDefault": false,
    "allowManaged": true,
    "allowGlobal": false,
    "id": ''
  };
}
let leaveNetwork = localStorage.getItem("leaveNetwork");
if (typeof leaveNetwork == "undefined" || leaveNetwork == null) {
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
  setTimeout(() => {
    showToast('刷新成功');
    loading.value = false;
  }, 1000);
};
//新增或修改
const newAdd = (index) => {
  if (ready.value != true) {
    showConfirmDialog({
      title: 'zerotier服务尚未启动，是否需要开启？',
    })
      .then(() => {
        execCmd('sh /data/adb/modules/ZeroTierForKSU/zerotier.sh start').then(v => {
          showToast('启动完成');
          setTimeout(() => {
            ready.value = true;
            return true;
          }, 2000);
        })
      })
      .catch(() => {
        return true;
      });
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
  execCmd(`sh /data/adb/modules/ZeroTierForKSU/api.sh joinOrUpdateNetwork ${info.id} ${postData}`).then(v => {
    try {
      const statusObj = JSON.parse(v);
      console.info(statusObj);
      showToast('完成,即将重载列表');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      showDialog({
        title: '操作失败',
        message: v
      }).then(() => {
        // on close
      });
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
    showConfirmDialog({
      title: 'zerotier服务尚未启动，是否需要开启？',
    })
      .then(() => {
        execCmd('sh /data/adb/modules/ZeroTierForKSU/zerotier.sh start').then(v => {
          showToast('启动完成');
          setTimeout(() => {
            ready.value = true;
            window.location.reload();
            return true;
          }, 2000);
        })
      })
      .catch(() => {
        window.close();
        return true;
      });
  } else {
    ready.value = true;
    execCmd('sh /data/adb/modules/ZeroTierForKSU/api.sh networks').then(v => {
      items.length == 0;
      items.push(...leaveNetwork)
      if (v !== "") {
        const statusObj = JSON.parse(v);
        if (statusObj.length > 0) {
          items.push(...statusObj)
        } else if(items.length==0){
          showDialog({ message: '暂未加入任何节点，先去加入一个吧' });
        }
      }
      let leaveNetwork = JSON.parse(localStorage.getItem('leaveNetwork'));
    });
  }
});
  //加载路由并配置防火墙
  const loadRouter=()=>{
    const defaultRoterMode=localStorage.getItem('defaultRoterMode')
    execCmd('sh /data/adb/modules/ZeroTierForKSU/api.sh router defaultRoterMode ').then(v => {

    })

  }
defineExpose({ newAdd });

</script>

<style lang="less"></style>