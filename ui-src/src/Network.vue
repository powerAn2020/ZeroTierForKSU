<template>
  <van-collapse v-model="activeNames">
  <van-collapse-item title="标题1" name="1">
    <template #value>
      
    </template>
  </van-collapse-item>
  <van-collapse-item title="标题2" name="2">
    技术无非就是那些开发它的人的共同灵魂。
  </van-collapse-item>
  <van-collapse-item title="标题3" name="3">
    在代码阅读过程中人们说脏话的频率是衡量代码质量的唯一标准。
  </van-collapse-item>
</van-collapse>

  <!-- <van-pull-refresh v-model="loading" @refresh="onRefresh">
    <van-cell-group>
      <van-collapse v-model="activeNames" accordion style="min-height: 90vh;">
        <van-collapse-item v-for="(item, index) in items" :key="index" :name="index">
          <template #title>
            <van-cell :title="item.address" :value="item.role" />
          </template>
          <van-text-ellipsis rows="2" :content="getContent(item.paths)" expand-text="展开" collapse-text="收起" />
        </van-collapse-item>
      </van-collapse>
    </van-cell-group>

  </van-pull-refresh> -->

  <!-- <van-dialog v-model:show="show" title="加入自建moon" show-cancel-button :before-close="addBtn">
    <van-col span="24">
      <van-field v-model="moonId" label="world ID" required placeholder="请输入world ID" />
    </van-col>
  </van-dialog> -->
</template>

<script setup>
import { ref } from 'vue';
const activeNames = ref(['1']);

</script>