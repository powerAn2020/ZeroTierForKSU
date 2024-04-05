<template>
  <div>
    <van-empty image-size="80" description="有空再做成员列表" />
  </div>
  <van-dialog v-model:show="show" title="加入自建moon" show-cancel-button :before-close="addBtn">
    <van-col span="24">
      <van-field v-model="moonId" label="world ID" required placeholder="请输入world ID" />
    </van-col>
  </van-dialog>
</template>

<script setup>
import { ref, defineExpose } from 'vue';
import { exec } from 'kernelsu';
const show = ref(false);
const moonId = ref('');

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
const addBtn = (action) =>
  new Promise((resolve) => {
    if (action === 'confirm') {
      execCmd(`sh /data/adb/modules/ZeroTierForKSU/api.sh orbit ${moonId.value}`).then(v => {
        showToast('完成');
        resolve(true);
      })

    } else if (action === 'cancel') {
      resolve(true);
      // reset();
    }
  });

defineExpose({ newAdd });

</script>