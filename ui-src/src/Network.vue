<template>
  <van-notice-bar wrapable :scrollable="false">
    {{ networkStatus }}
  </van-notice-bar>
  <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
    <van-list v-model:loading="loading" :finished="finished" style="min-height: 80vh;">
      <van-cell center v-for="item in list" :key="item" :title="item" :to="'/center/networkDetail/' + item.config.id"
        is-link>
        <template #title>
          networkid: {{ item.config.id }}
        </template>
        <template #label>
          <van-space direction="vertical" fill>
            name: {{ item.config.name ? item.config.name : 'Undefined' }}
            <van-tag plain type="primary">{{ item.config.private ? 'Private' : 'Public' }}</van-tag>
          </van-space>
        </template>
        <template #value>
          {{ item.config.routes[0] ? item.config.routes[0].target : '' }}
        </template>
      </van-cell>
    </van-list>
  </van-pull-refresh>
</template>

<script setup>
import { ref } from 'vue';
import { MODDIR, execCmdWithCallback, execCmdWithErrno, spawnCmdWithCallback } from './tools'
import { useRemoteNetworkStore } from './stores/remoteNetwork'

const remoteNetwork = useRemoteNetworkStore();
const list = ref([]);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const networkStatus = ref('');
const onlineMemberCount = ref(0);
const authorizedMemberCount = ref(0);
const totalMemberCount = ref(0);
const networkCount = ref(0);
const routeCount = ref(0);
const maxMembers = ref('');
const maxNetworks = ref('');
const maxRoutes = ref('');

const onRefresh = () => {
  networkStatus.value = '';
  totalMemberCount.value = 0;
  networkCount.value = 0;
  routeCount.value = 0;
  authorizedMemberCount.value = 0;
  showLoadingToast({
    duration: 0,
    message: '加载中...',
    forbidClick: true,
    loadingType: 'spinner',
  });
  setTimeout(() => {
    try {
      networkList();
    } catch (error) {
      console.error(error);
    }
    closeToast();
  }, 50)
};
const networkList = () => {
  loading.value = true;
  execCmdWithCallback({
    cmd: `sh ${MODDIR}/api.sh central status`
    , onSuccess: (data) => {
      console.info(`status:${data}`)
      const rst = JSON.parse(data);
      maxMembers.value = rst.defaultLimits.maxMembers
      maxNetworks.value = rst.defaultLimits.maxNetworks
      maxRoutes.value = rst.defaultLimits.maxRoutes
      if (rst.defaultLimits.maxMembers > 10000) {
        maxMembers.value = '∞'
      }
      if (rst.defaultLimits.maxNetworks > 10000) {
        maxNetworks.value = '∞'
      }
      if (rst.defaultLimits.maxRoutes > 10000) {
        maxRoutes.value = '∞'
      }
    }, onError: (data) => {
      showToast('加载失败.' + data);
    }
  })
  execCmdWithCallback({
    cmd: `sh ${MODDIR}/api.sh central network list`, onSuccess: (data) => {
      list.value = JSON.parse(data);
      remoteNetwork.updateNetwork(list.value)

      list.value.map((network) => {
        onlineMemberCount.value += network.onlineMemberCount
        authorizedMemberCount.value += network.authorizedMemberCount
        totalMemberCount.value += network.totalMemberCount
        routeCount.value += network.config.routes ? network.config.routes.length : 0;
        networkCount.value++;
      })
      networkStatus.value += `网络数:${networkCount.value}/${maxNetworks.value} 用户数:${totalMemberCount.value}/${maxMembers.value} 授权用户数:${authorizedMemberCount.value} 路由数:${routeCount.value}/${maxRoutes.value}`
    }, onError: (data) => {
      showToast('加载失败.' + data);
    }
  })
  loading.value = false;
  finished.value = true;
  refreshing.value = false;
}
onRefresh();
</script>