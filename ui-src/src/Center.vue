<template>
  <div style="height: 0.1rem;"></div>
  <router-view />
  <div style="height: 2.8rem;"></div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { MODDIR, execCmdWithCallback, execCmdWithErrno } from './tools'

const router = useRouter()
const route = useRoute()
const init = () => {
  execCmdWithErrno(`sh ${MODDIR}/api.sh apiToken show`).then(v => {
    console.info(`v:${v}`)
    if (v == 0) {
      router.push('/center/network')
    } else {
      showDialog({ message: '未配置apiToken,先去设置页添加一个吧' });
    }
  })

}
init()
const beforeClose = (action) => {
  new Promise((resolve) => {
    setTimeout(() => {
      execCmdWithCallback({
        cmd: `sh ${MODDIR}/api.sh central network add`, onSuccess: (data) => {
          showToast('添加成功');
        }, onError: (data) => {
          showToast('添加失败.' + data);
        }
      })
      resolve(true);
    }, 50);
  });
}
const newAdd = (index) => {
  showConfirmDialog({
    message:
      '添加一个新网络?',
    beforeClose
  })
}
defineExpose({ newAdd });
</script>