<template>
  <div style="height: 0.1rem;"></div>
  <router-view />
  <van-empty :description="$t('network.api-not-found')" v-if="show"/>
  <div style="height: 2.8rem;"></div>
</template>

<script setup>
// import { ref } from 'vue';
// import { useRoute, useRouter } from 'vue-router'
import { MODDIR, execCmdWithCallback, execCmdWithErrno } from './tools'

const router = useRouter()
const route = useRoute()
const show=ref(false);
const init = () => {
  execCmdWithErrno(`sh ${MODDIR}/api.sh apiToken show`).then(v => {
    console.info(`v:${v}`)
    if (v == 0) {
      router.push('/center/network')
    } else {
      show.value=true;
      // showDialog({ message: '未配置apiToken,先去设置页添加一个吧' });
    }
  })

}
init()
const beforeClose = (action) => {
  new Promise((resolve) => {
    setTimeout(() => {
      execCmdWithCallback({
        cmd: `sh ${MODDIR}/api.sh central network add`, onSuccess: (data) => {
          showToast($t('network.operation_success'));
        }, onError: (data) => {
          showToast($t('network.operation_fail') + data);
        }
      })
      resolve(true);
    }, 50);
  });
}
const newAdd = (index) => {
  showConfirmDialog({
    message:
      $t('network.ask_new_network'),
    beforeClose
  })
}
defineExpose({ newAdd });
</script>