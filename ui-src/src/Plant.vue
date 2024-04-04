<template>
  <div>
    <van-empty image-size="80" description="咕咕咕" />
  </div>
</template>

<script setup>
import { ref, defineExpose } from 'vue';
import { exec } from 'kernelsu';


const execCmd = async (cmd) => {
  const { errno, stdout, stderr } = await exec(cmd, { cwd: '/tmp' });
  if (errno === 0) {
    // success
    console.log(stdout);
    return stdout;
  } else {
    console.info(stderr)
  }
}
const newAdd = (index) => { showToast('用到在做'); }

defineExpose({ newAdd });

</script>