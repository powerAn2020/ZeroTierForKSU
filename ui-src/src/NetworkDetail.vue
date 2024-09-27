<template>
  <van-nav-bar left-text="返回" left-arrow @click-left="onClickLeft" />

  <van-collapse v-model="activeNames">
    <van-collapse-item title="概览" name="dash">
      <van-card :desc="'description:' + networkObj.description"
        :title="networkObj.config.name ? networkObj.config.name : 'Undefined'">
        <template #price>
          在线用户：{{ networkObj.onlineMemberCount }}
          授权用户：{{ networkObj.authorizedMemberCount }}
          总用户数：{{ networkObj.totalMemberCount }}
        </template>
        <template #tags>
          <van-space direction="vertical" fill>
            <van-row>
              <van-col>id:{{ networkObj.id }}</van-col>
            </van-row>
            <van-row>
              <van-col span="24">routes: <van-tag plain type="primary" v-for="item in networkObj.config.routes"
                  :key="item" :title="item">{{ item.target }}</van-tag></van-col>
            </van-row>
          </van-space>
        </template>
        <template #footer>
          <van-button type="danger" size="small" @click="deleteNetwork(networkObj.id)">删除网络</van-button>
        </template>
      </van-card>
    </van-collapse-item>
    <van-collapse-item title="成员" name="member">
      <van-collapse v-model="activeNames">
        <van-collapse-item v-for="(item, index) in memberList" :title="item.nodeId" :key="index" :name="index">
          <van-cell-group inset>
            <van-field name="checkbox" label="授权情况">
              <template #input>
                <van-checkbox v-model="item.config.authorized" shape="square" />
              </template>
            </van-field>
            <van-field name="checkbox" label="允许桥接">
              <template #input>
                <van-checkbox v-model="item.config.activeBridge" shape="square" />
              </template>
            </van-field>
            <van-field v-model="item.name" label="名称" placeholder="请输入名称" is-link />
            <van-field v-model="item.description" label="备注" placeholder="请输入备注" is-link />
            <van-cell title="虚拟IP" clickable is-link center @click="editIP(index, item)">
              <template #value>
                <van-space direction="vertical" fill>
                  <van-tag type="primary" v-for="(ip, idx) in item.config.ipAssignments" :key="idx" :name="idx">
                    {{ ip }}
                  </van-tag>
                </van-space>
              </template>
            </van-cell>
            <van-cell title="Address" :value="item.config.address" />
            <van-cell title="真实IP" :value="item.physicalAddress" />
            <van-cell title="客户端版本" :value="item.clientVersion" />
            <van-cell title="上次在线时间" :value="formatDate(item.lastOnline)" />
            <van-cell title="">
              <template #value>
                <van-button type="danger" size="small"
                  @click="deleteNetworkMember(index, item.networkId, item.nodeId)">删除成员</van-button>
              </template>
            </van-cell>
          </van-cell-group>
        </van-collapse-item>
      </van-collapse>
      <van-cell-group inset>
        <van-cell title="">
          <template #value>
            <van-button type="success" size="small" @click="addNetworkMemberShow = true">新增成员</van-button>
          </template>
        </van-cell>
      </van-cell-group>
    </van-collapse-item>
    <van-collapse-item title="设置" name="setting">
      技术无非就是那些开发它的人的共同灵魂。
    </van-collapse-item>
  </van-collapse>
  <van-back-top />
  <!-- 虚拟IP管理 -->
  <van-popup v-model:show="ipAssignmentsEditor" round :style="{ width: '90%', maxHeight: '85%' }"
    @close="updateMember()">
    <van-cell title="虚拟IP" title-style="max-width:100%;">
      <template #right-icon>
        <van-icon size="1.2rem" name="plus" @click="addPkgList" />
      </template>
    </van-cell>
    <van-list>
      <van-field :rules="[{ ipPattern, message: '请输入IP' }]" v-for="(item, idx) in modifiedMember.config.ipAssignments" :label="idx + ':'" labelWidth="1.5em"
        :model-value="item" @update:model-value="v => editPkgList(v, idx)">
        <template #right-icon>
          <van-icon size="1rem" name="cross" @click="deletePkgList(idx)" />
        </template>
      </van-field>
    </van-list>
  </van-popup>
  <van-dialog v-model:show="addNetworkMemberShow" title="新增用户" show-cancel-button :before-close="addNetworkMember">
    <van-field v-model="memberId" label="成员ID" required placeholder="请输入成员id" />
  </van-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { MODDIR, execCmdWithCallback, execCmdWithErrno, spawnCmdWithCallback } from './tools'
import { useRemoteNetworkStore } from './stores/remoteNetwork'

const remoteNetwork = useRemoteNetworkStore();

const router = useRouter()
const route = useRoute()
const networkObj = ref()
const ipAssignmentsEditor = ref(false)
const addNetworkMemberShow = ref(false)
const memberList = ref([])
const modifiedMember = ref({})
const networkid = ref('')
const memberId = ref('')
const memberIndex = ref()
const ipPattern = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;


const activeNames = ref(['dash']);

const updateMember = () => {
  showToast(`updateMember->${modifiedMember.value.name}`)
}
const editIP = (index, item) => {
  ipAssignmentsEditor.value = true;
  modifiedMember.value = item;
}

const editPkgList = (value, index) => {
  modifiedMember.value.config.ipAssignments[index] = value;
}
const deletePkgList = (index) => {
  modifiedMember.value.config.ipAssignments(index, 1)
}
const addPkgList = () => {
  modifiedMember.value.config.ipAssignments.push('')
}
// 增加一个用户
// https://my.zerotier.com/api/v1/network/d3ecf5726d7c3072/member/62eea67525
// {"hidden":false,"config":{"authorized":true}}

// 防抖函数
let timer = null
const debounce = (func, delay = 1000, immediate = false) => {
  //不能用箭头函数
  return function () {
    if (timer) {
      console.info('清除定时器')
      clearTimeout(timer)
    }
    if (immediate && !timer) {
      func.apply(this, arguments)
    }
    timer = setTimeout(() => {
      func.apply(this, arguments)
    }, delay)
  }
}
// debounce(() => { console.info(123456) }, 1500, false)();

// 返回网络列表
const onClickLeft = () => {
  router.push('/center/network');
}
// 格式化时间
const formatDate = (milliseconds) => {
  const date = new Date(milliseconds);
  const Y = date.getFullYear() + '-';
  const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  const D = date.getDate() + ' ';
  const h = date.getHours() + ':';
  const m = date.getMinutes() + ':';
  const s = date.getSeconds();
  return (Y + M + D + h + m + s)
}
// 删除网络回调
const beforeCloseForNetwork = (action) => {
  new Promise((resolve) => {
    setTimeout(() => {
      execCmdWithCallback({
        cmd: `sh ${MODDIR}/api.sh central network remove ${networkid.value}`, onSuccess: (data) => {
          showToast('完成。');
          router.push('/center/network');
        }, onError: (data) => {
          showToast('删除失败.' + data);
        }
      })
      resolve(true);
    }, 50);
  });
}
// 删除网络成员回调
const beforeCloseForMember = (action) => {
  new Promise((resolve) => {
    setTimeout(() => {
      execCmdWithCallback({
        cmd: `sh ${MODDIR}/api.sh central member remove ${networkid.value} ${memberId.value} `, onSuccess: (data) => {
          memberList.value.splice(memberIndex.value, 1);
          showToast('完成。');
        }, onError: (data) => {
          showToast('删除失败.' + data);
        }
      })
      resolve(true);
    }, 50);
  });
}
// 新增成员
const addNetworkMember = () => {
  execCmdWithCallback({
    cmd: `sh ${MODDIR}/api.sh central member modify ${networkid.value} ${memberId.value} '{"hidden":false,"config":{"authorized":true}}'`, onSuccess: (data) => {
      const successData = JSON.parse(data);
      const s=memberList.value.find((v) => { v.nodeId == successData.nodeId });
      if(!s){
        memberList.value.push(JSON.parse(data))
      }
      showToast('完成。');
    }, onError: (data) => {
      showToast('新增失败.' + data);
    }
  })
}
const deleteNetworkMember = (index, nwid, mbId) => {
  networkid.value = nwid;
  memberId.value = mbId;
  memberIndex.value = index;
  showConfirmDialog({
    message: `成员ID:${mbId},确认删除吗?`,
    beforeCloseForMember,
  });
}

// 删除网络
const deleteNetwork = (nwid) => {
  networkid.value = nwid;
  showConfirmDialog({
    message: `networkid:${nwid},确认删除吗?`,
    beforeCloseForNetwork,
  });

}
// 获取成员
const getMembers = (nwid) => {
  execCmdWithCallback({
    cmd: `sh ${MODDIR}/api.sh central member list ${nwid}`, onSuccess: (data) => {
      const members = JSON.parse(data);
      memberList.value = members;
    }, onError: (data) => {
      showToast('加载失败.' + data);
    }
  })
}

//初始化
const init = () => {
  showLoadingToast({
    duration: 0,
    message: '加载中...',
    forbidClick: true,
    loadingType: 'spinner',
  });
  console.info(`networkid:${route.params.id}`);
  networkObj.value = remoteNetwork.getNetworkById(route.params.id)
  getMembers(route.params.id)
  closeToast();
}

init()
</script>