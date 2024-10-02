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
import {MODDIR,execCmd} from './tools'

const show = ref(false);
const moonId = ref('');
const loading = ref(false);
const activeNames = ref(null);

const items = reactive([])
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
  if ( typeof arr !='undefined' && arr!=null ){
    let peerList=new Set();
    for (const path of arr) {
      let address=path.address;
      if (path.active && !peerList.has(address)) {
        peerList.add(address);
        showText += address;
        showText += '\n';
      }
    }
  }else{
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
getList();
defineExpose({ newAdd });

</script>