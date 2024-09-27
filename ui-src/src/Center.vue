<template>
  <van-notice-bar wrapable :scrollable="false" :text="networkStatus" />
  <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
    <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了">
      <van-cell v-for="item in list" :key="item" :title="item" to="" is-link>
        <template #title>
          
        </template>

      </van-cell>
    </van-list>
  </van-pull-refresh>

  <router-view />
</template>

<script setup>
const list = ref([]);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const networkStatus = ref('');

const onRefresh = () => {
  setTimeout(() => {
    networkList();
    // showToast('刷新成功');
    loading.value = false;
    finished.value = true;
  }, 50);
};
const networkList = () => {
  loading.value = true;

  execCmd(`sh /data/adb/modules/ZeroTierForKSU/api.sh remote network list`).then(v => {
    list.value = JSON.parse(v);
  })
}
const newAdd = (index) => {

}
const init = () => {
  networkList();
}
defineExpose({ newAdd });
</script>