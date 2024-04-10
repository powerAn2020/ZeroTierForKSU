<template>
  <van-pull-refresh v-model="loading" @refresh="onRefresh">
    <van-collapse v-model="activeNames" accordion style="min-height: 90vh;">
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
import { exec } from 'kernelsu';
const show = ref(false);
const moonId = ref('');
const loading = ref(false);
const activeNames = ref(null);

const items = reactive([{"address":"244218abdf","isBonded":false,"latency":11,"paths":[{"active":true,"address":"120.244.204.53/4786","expired":false,"lastReceive":1712401359537,"lastSend":1712401359537,"localSocket":548641621552,"preferred":true,"trustedPathId":0},{"active":true,"address":"2409:8a00:8550:7f91:f81d:4cff:fe96:dc21/9993","expired":false,"lastReceive":1712401359536,"lastSend":1712401359333,"localSocket":548641620976,"preferred":false,"trustedPathId":0},{"active":true,"address":"2409:8a00:8550:7f91:f81d:4cff:fe96:dc21/52963","expired":false,"lastReceive":1712401359537,"lastSend":1712401359537,"localSocket":548641623664,"preferred":false,"trustedPathId":0},{"active":true,"address":"2409:8a00:8550:7f91:f81d:4cff:fe96:dc21/9993","expired":false,"lastReceive":1712401359537,"lastSend":1712401359333,"localSocket":548620496928,"preferred":false,"trustedPathId":0}],"role":"LEAF","tunneled":false,"version":"1.12.2","versionMajor":1,"versionMinor":12,"versionRev":2},{"address":"62f865ae71","isBonded":false,"latency":428,"paths":[{"active":true,"address":"50.7.252.138/9993","expired":false,"lastReceive":1712401184525,"lastSend":1712401319283,"localSocket":548641621936,"preferred":true,"trustedPathId":0}],"role":"PLANET","tunneled":false,"version":"-1.-1.-1","versionMajor":-1,"versionMinor":-1,"versionRev":-1},{"address":"778cde7190","isBonded":false,"latency":293,"paths":[{"active":true,"address":"103.195.103.66/9993","expired":false,"lastReceive":1712401184399,"lastSend":1712401319283,"localSocket":548641621552,"preferred":true,"trustedPathId":0}],"role":"PLANET","tunneled":false,"version":"-1.-1.-1","versionMajor":-1,"versionMinor":-1,"versionRev":-1},{"address":"cafe04eba9","isBonded":false,"latency":211,"paths":[{"active":true,"address":"2a02:6ea0:d405::9993/9993","expired":false,"lastReceive":1712401184318,"lastSend":1712401319283,"localSocket":548641620976,"preferred":true,"trustedPathId":0}],"role":"PLANET","tunneled":false,"version":"-1.-1.-1","versionMajor":-1,"versionMinor":-1,"versionRev":-1},{"address":"cafe9efeb9","isBonded":false,"latency":194,"paths":[{"active":true,"address":"2605:9880:200:1200:30:571:e34:51/9993","expired":false,"lastReceive":1712401184301,"lastSend":1712401359333,"localSocket":548641620976,"preferred":true,"trustedPathId":0}],"role":"PLANET","tunneled":false,"version":"-1.-1.-1","versionMajor":-1,"versionMinor":-1,"versionRev":-1},{"address":"d3ecf5726d","isBonded":false,"latency":257,"paths":[{"active":true,"address":"35.209.48.234/21022","expired":false,"lastReceive":1712222892885,"lastSend":1712222892885,"localSocket":548641622320,"preferred":false,"trustedPathId":0},{"active":true,"address":"35.209.48.234/28629","expired":false,"lastReceive":1712401337101,"lastSend":1712401337101,"localSocket":548641621552,"preferred":true,"trustedPathId":0},{"active":true,"address":"35.209.48.234/20937","expired":false,"lastReceive":1712223292971,"lastSend":1712223292971,"localSocket":548641621936,"preferred":false,"trustedPathId":0}],"role":"LEAF","tunneled":false,"version":"1.12.2","versionMajor":1,"versionMinor":12,"versionRev":2}]);
const onRefresh = () => {
  getList();
  setTimeout(() => {
    showToast('刷新成功');
    loading.value = false;
  }, 1000);
};
const execCmd = async (cmd) => {
  console.info(cmd)
  const { errno, stdout, stderr } = await exec(cmd, { cwd: '/tmp' });
  if (errno === 0) {
    // success
    console.log(stdout);
    return stdout;
  } else {
    console.info(stderr)
  }
}
const newAdd = (index) => {
  show.value = true;
}
const getContent = (arr) => {
  let showText = '';
  if ( typeof arr !='undefined' && arr!=null ){
    for (const path of Array.from(new Set(arr))) {
      if (path.active) {
        showText += path.address;
        showText += '\n';
      }
    }
  }
  return showText;
}
const addBtn = (action) =>
  new Promise((resolve) => {
    if (action === 'confirm') {
      execCmd(`sh /data/adb/modules/ZeroTierForKSU/api.sh orbit ${moonId.value}`).then(v => {
        showToast('完成');
        resolve(true);
      })

    } else if (action === 'cancel') {
      resolve(true);
    }
  });
const getList = () => {
  execCmd(`sh /data/adb/modules/ZeroTierForKSU/api.sh peer`).then(v => {
    items.length = 0;
    items.push(...JSON.parse(v));
  })
}
getList();
defineExpose({ newAdd });

</script>