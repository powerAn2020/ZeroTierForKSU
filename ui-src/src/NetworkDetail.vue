<template>

  <van-nav-bar left-text="返回" title="Zerotier For KSU" left-arrow @click-left="onClickLeft" safe-area-inset-top fixed />
  <van-collapse v-model="activeNames" accordion>
    <van-collapse-item title="概览" name="dash">
      <van-card :desc="'description:' + networkObj.description"
        :title="networkObj.config.name ? networkObj.config.name : 'Undefined'">
        <template #price>
          <!-- 在线用户：{{ networkObj.onlineMemberCount }} -->
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
          <van-button type="success" size="small" @click="addNetworkMemberShow = true">新增成员</van-button>
          <van-button type="danger" size="small" @click="deleteNetwork(networkObj.id)">删除网络</van-button>
        </template>
      </van-card>
    </van-collapse-item>
    <van-collapse-item title="成员" name="member">
      <van-collapse v-model="nodeId" @change="changeMember" accordion>
        <van-collapse-item v-for="(item, index) in memberList" :title="item.nodeId" :key="index" :name="item.nodeId">
          <van-field name="checkbox" label="授权情况">
            <template #input>
              <van-checkbox v-model="item.config.authorized" shape="square"
                @click="updateMember(item.nodeId, false, '1')" />
            </template>
          </van-field>
          <van-field name="checkbox" label="允许桥接">
            <template #input>
              <van-checkbox v-model="item.config.activeBridge" shape="square"
                @click="updateMember(item.nodeId, false, '2')" />
            </template>
          </van-field>
          <van-field v-model="item.name" label="名称" placeholder="请输入名称" is-link
            @update:model-value="updateMember(item.nodeId, false, '3')" />
          <van-field v-model="item.description" label="备注" placeholder="请输入备注" is-link
            @update:model-value="updateMember(item.nodeId, false, '4')" />
          <van-cell title="虚拟IP" clickable is-link center @click="ipAssignmentsEditor = true">
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
        </van-collapse-item>
      </van-collapse>
      <van-cell>
        <template #value>
          <van-button type="success" size="small" @click="addNetworkMemberShow = true">新增成员</van-button>
        </template>
      </van-cell>
    </van-collapse-item>
    <van-collapse-item title="设置" name="setting">
      <!-- <van-collapse >
        <van-collapse-item title="Basics"> -->
      <van-cell-group title="Basics">
        <van-cell title="Network ID" :value="networkObj.id" />
        <van-field v-model="networkObj.config.name" label="名称" placeholder="请输入名称" is-link
          @update:model-value="updateNetwork" />
        <van-field v-model="networkObj.config.description" label="备注" placeholder="请输入备注" is-link
          @update:model-value="updateNetwork" />
        <van-field name="radio" label="网络类型">
          <template #input>
            <van-radio-group v-model="networkObj.config.private" direction="horizontal">
              <van-radio :name="true">私有</van-radio>
              <van-radio :name="false">公开</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field label="启用组播">
          <template #input>
            <van-switch :model-value="networkObj.config.enableBroadcast"
              @update:model-value="onUpdateEnableBroadcastValue" />
          </template>
        </van-field>
        <van-field v-model:show="networkObj.config.enableBroadcast" v-model="networkObj.config.multicastLimit"
          label="组播限制" placeholder="32" is-link @update:model-value="updateNetwork" />
      </van-cell-group>

      <van-cell-group title="IPv6配置">
        <van-cell title="ZeroTier RFC4193">
          <template #value>
            <van-switch v-model="networkObj.config.v6AssignMode.rfc4193" />
          </template>
          <template #label>
            (/128 for each device)
          </template>
        </van-cell>
        <van-cell title="ZeroTier 6PLANE">
          <template #value>
            <van-switch v-model="networkObj.config.v6AssignMode['6plane']" />
          </template>
          <template #label>
            (/80 routable for each device)
          </template>
        </van-cell>
        <van-cell title="Auto-Assign from Range">
          <template #value>
            <van-switch v-model="networkObj.config.v6AssignMode.zt" />
          </template>
        </van-cell>
      </van-cell-group>

      <van-cell-group title="IPv6配置">
        <van-cell title="ZeroTier RFC4193">
          <template #value>
            <van-switch v-model="networkObj.config.v6AssignMode.rfc4193" />
          </template>
          <template #label>
            (/128 for each device)
          </template>
        </van-cell>
        <van-cell title="ZeroTier 6PLANE">
          <template #value>
            <van-switch v-model="networkObj.config.v6AssignMode['6plane']" />
          </template>
          <template #label>
            (/80 routable for each device)
          </template>
        </van-cell>
        <van-cell title="Auto-Assign from Range">
          <template #value>
            <van-switch v-model="networkObj.config.v6AssignMode.zt" />
          </template>
        </van-cell>
      </van-cell-group>

      <van-cell-group title="IPv6配置">
        <van-cell title="ZeroTier RFC4193">
          <template #value>
            <van-switch v-model="networkObj.config.v6AssignMode.rfc4193" />
          </template>
          <template #label>
            (/128 for each device)
          </template>
        </van-cell>
        <van-cell title="ZeroTier 6PLANE">
          <template #value>
            <van-switch v-model="networkObj.config.v6AssignMode['6plane']" />
          </template>
          <template #label>
            (/80 routable for each device)
          </template>
        </van-cell>
        <van-cell title="Auto-Assign from Range">
          <template #value>
            <van-switch v-model="networkObj.config.v6AssignMode.zt" />
          </template>
        </van-cell>
      </van-cell-group>

      <van-cell-group title="IPv6配置">
        <van-cell title="ZeroTier RFC4193">
          <template #value>
            <van-switch v-model="networkObj.config.v6AssignMode.rfc4193" />
          </template>
          <template #label>
            (/128 for each device)
          </template>
        </van-cell>
        <van-cell title="ZeroTier 6PLANE">
          <template #value>
            <van-switch v-model="networkObj.config.v6AssignMode['6plane']" />
          </template>
          <template #label>
            (/80 routable for each device)
          </template>
        </van-cell>
        <van-cell title="Auto-Assign from Range">
          <template #value>
            <van-switch v-model="networkObj.config.v6AssignMode.zt" />
          </template>
        </van-cell>
      </van-cell-group>
      <!-- </van-collapse-item> -->
      <!-- </van-collapse> -->
    </van-collapse-item>
  </van-collapse>
  <!-- <van-back-top /> -->
  <!-- 虚拟IP管理 -->
  <van-popup v-model:show="ipAssignmentsEditor" round :style="{ width: '90%', maxHeight: '85%' }"
    :before-close="checkMemberIP">
    <van-cell title="虚拟IP" title-style="max-width:100%;">
      <template #right-icon>
        <van-icon size="1.2rem" name="plus" @click="addPkgList" />
      </template>
    </van-cell>
    <van-form>
      <van-list>
        <van-field maxlength="15" :rules="[{ validator: asyncValidator, message: '请输入正确IP' }]" show-error
          v-for="(item, idx) in modifiedMember.config.ipAssignments" :label="idx + ':'" :model-value="item"
          @update:model-value="v => editPkgList(v, idx)">
          <template #right-icon>
            <van-icon size="1rem" name="cross" @click="deletePkgList(idx)" />
          </template>
        </van-field>
      </van-list>
    </van-form>
  </van-popup>
  <van-dialog v-model:show="addNetworkMemberShow" title="添加成员" show-cancel-button :before-close="checkMemberID">
    <van-form>
      <van-field :rules="[{ required: true, message: '请输入成员ID' }]" v-model="memberId" label="成员ID" required
        placeholder="请输入成员ID" maxlength="10" />
    </van-form>
  </van-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
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
const memberId = ref('')
const memberIndex = ref()
const ipPattern = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
const onUpdateEnableBroadcastValue = (newValue) => {
  networkObj.value.config.enableBroadcast = newValue;
}
const activeNames = ref(['dash']);
const nodeId = ref(['']);

const asyncValidator = (val) =>
  new Promise((resolve) => {
    resolve(ipPattern.test(val));
  });

const updateMember = (memberID, immediate, id) => {
  debugger
  console.info(`id-->:${id}`)
  if (!memberID) {
    return;
  }
  if (!immediate) {
    immediate = false;
  }

  debounce(() => {
    console.info(`updateMember->${memberID}`)
    const params = {
      "name": modifiedMember.value.name,
      "description": modifiedMember.value.description,
      "config": {
        "activeBridge": modifiedMember.value.config.activeBridge, "authorized": modifiedMember.value.config.authorized, "ipAssignments": modifiedMember.value.config.ipAssignments
      }
    }

    const postData = JSON.stringify(params)

    // console.info(`sh ${MODDIR}/api.sh central member modify ${networkObj.value.id} ${memberID} '${JSON.stringify(params)}'`)
    execCmdWithCallback({
      cmd: `sh ${MODDIR}/api.sh central member modify ${networkObj.value.id} ${memberID} '${postData}'`, onSuccess: (data) => {
        const successData = JSON.parse(data);
        const s = memberList.value.find((v) => v.nodeId == successData.nodeId);
        if (!s) {
          memberList.value.push(JSON.parse(data))
        }
        showToast('更新成员信息完成');
      }, onError: (data) => {
        showToast('新增失败.' + data);
      }
    })
  }, 1500, immediate)();
}
const checkMemberIP = () => {
  console.info('111')
  for (const ip of modifiedMember.value.config.ipAssignments) {
    if (!ipPattern.test(ip)) {
      showToast('IP无效，请检查');
      return false
    }
  }
  updateMember(modifiedMember.value.nodeId, false, '5');
  return true

}

const editPkgList = (value, index) => {
  modifiedMember.value.config.ipAssignments[index] = value;
}
const deletePkgList = (index) => {
  modifiedMember.value.config.ipAssignments.splice(index, 1)
}
const addPkgList = () => {
  modifiedMember.value.config.ipAssignments.push('')
}

/**
 * 防抖函数
 * debounce(() => { console.info(123456) }, 1500, false)();
 */
// 
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

const ipToLong = (ip) => {
  return ip.split('.').reduce((acc, val) => (acc << 8) + parseInt(val, 10), 0);
}

const longToIp = (long) => {
  return [(long >>> 24) & 255, (long >>> 16) & 255, (long >>> 8) & 255, long & 255].join('.');
}

const maxPrefixLength = (start, end) => {
  let xor = start ^ end;
  let n = 0;
  while (xor > 0) {
    n++;
    xor = xor >> 1;
  }
  return 32 - n;
}
/**ip范围获取CIDR 
  let startIp = '192.168.1.0';<br/>
  let endIp = '192.168.1.255';
  let cidrList = ipRangeToCIDR(startIp, endIp);
  console.log(cidrList); // ['192.168.1.0/24']
*/
const ipRangeToCIDR = (startIp, endIp) => {
  let start = ipToLong(startIp);
  let end = ipToLong(endIp);
  let cidrList = [];

  while (start <= end) {
    let maxDiff = maxPrefixLength(start, end);
    cidrList.push(longToIp(start) + '/' + maxDiff);
    start += Math.pow(2, 32 - maxDiff);
  }

  return cidrList;
}

/** 根据cidr获取ip范围
 *  const cidr = '192.168.1.0/24';
    const ipRange = cidrToIpRange(cidr);
    console.log(ipRange);// ['192.168.1.0', '192.168.1.255']
*/
const cidrToIpRange = (cidr) => {
  const parts = cidr.split('/');
  const ipParts = parts[0].split('.');
  const prefixLength = parseInt(parts[1]);

  let networkAddress = [];
  let binaryIp = [];
  for (let i = 0; i < ipParts.length; i++) {
    let num = parseInt(ipParts[i]);
    let binary = num.toString(2).padStart(8, '0');
    binaryIp.push(binary);
  }
  let binaryNetwork = binaryIp.join('').substring(0, prefixLength).padEnd(32, '0');

  for (let i = 0; i < 4; i++) {
    let octet = parseInt(binaryNetwork.substring(i * 8, (i + 1) * 8), 2);
    networkAddress.push(octet);
  }

  const minIp = networkAddress.join('.');
  const maxIp = networkAddress.slice(0).fill(255).join('.');

  if (prefixLength < 32) {
    const hostBits = 32 - prefixLength;
    const maxHostValue = Math.pow(2, hostBits) - 1;
    const lastOctetMax = networkAddress[3] + maxHostValue;
    const maxIpParts = networkAddress.slice(0);
    maxIpParts[3] = lastOctetMax;
    const newMaxIp = maxIpParts.join('.');
    return [minIp, newMaxIp];
  } else {
    return [minIp, minIp];
  }
}
/** 格式化时间 */
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

const changeMember = (activeName) => {
  console.info(`成员:${activeName}`)
  if (activeName) {
    // updateMember(modifiedMember.nodeId, true);
    let x = memberList.value.find((v) => v.nodeId === activeName);
    console.info(x)
    modifiedMember.value = x;
  } else {
    modifiedMember.value = {};
  }
}
// 返回网络列表
const onClickLeft = () => {
  router.push('/center/network');
}

// 删除网络回调
const beforeCloseForNetwork = () => {
  new Promise((resolve) => {
    setTimeout(() => {
      execCmdWithCallback({
        cmd: `sh ${MODDIR}/api.sh central network remove ${networkObj.id}`, onSuccess: (data) => {
          showToast('已删除网络.');
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
const beforeCloseForMember = () => {
  new Promise((resolve) => {
    setTimeout(() => {
      execCmdWithCallback({
        cmd: `sh ${MODDIR}/api.sh central member remove ${networkObj.id} ${memberId.value} `, onSuccess: (data) => {
          memberList.value.splice(memberIndex.value, 1);
          showToast('已删除成员');
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
    cmd: `sh ${MODDIR}/api.sh central member modify ${networkObj.value.id} ${memberId.value} '{"hidden":false,"config":{"authorized":true}}'`, onSuccess: (data) => {
      const successData = JSON.parse(data);
      const s = memberList.value.find((v) => v.nodeId == successData.nodeId);
      if (!s) {
        memberList.value.push(JSON.parse(data))
      }
      showToast('新增完成.');
    }, onError: (data) => {
      showToast('新增失败.' + data);
    }
  })
  // addNetworkMemberShow.value=false;
}
const checkMemberID = (action) => {
  console.info(111)
  if (action == 'cancel') {
    return true;
  }
  if (!memberId.value || memberId.value.length != 10 || !networkObj.value.id) {
    return false;
  }
  addNetworkMember()
  return true;
}
const deleteNetworkMember = (index, nwid, mbId) => {
  memberId.value = mbId;
  memberIndex.value = index;
  showConfirmDialog({
    message: `成员ID:${mbId},确认删除吗?`,
    beforeCloseForMember,
  });
}

// 删除网络
const deleteNetwork = (nwid) => {
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
      memberList.value = [...members];
      console.info('memberList:' + members.length)
    }, onError: (data) => {
      showToast('加载失败.' + data);
    }
  })
}

//初始化
const init = () => {
  //TODO 将成员信息缓存下来，然后修改缓存，解决现有情况下，修改多个成员导致的请求不一致问题
  showLoadingToast({
    duration: 0,
    message: '加载中...',
    forbidClick: true,
    loadingType: 'spinner',
  });
  console.info(`networkid:${route.params.id}`);
  networkObj.value = remoteNetwork.getNetworkById(route.params.id)
  if (!networkObj.value) {
    closeToast();
    router.push('/center/network')
  }
  getMembers(route.params.id)
  closeToast();
}

init()
// watch(modifiedMember, (value, prev) => {
//   console.info(value)
//   console.info(prev)

//   // debounce(() => {
//   //   execCmdWithCallback({
//   //     cmd: `sh ${MODDIR}/api.sh central member modify ${networkObj.value.id} ${memberId.value} '{"hidden":false,"config":{"authorized":true}}'`, onSuccess: (data) => {
//   //       const successData = JSON.parse(data);
//   //       const s = memberList.value.find((v) =>  v.nodeId == successData.nodeId );
//   //       if (!s) {
//   //         memberList.value.push(JSON.parse(data))
//   //       }
//   //       showToast('完成。');
//   //     }, onError: (data) => {
//   //       showToast('新增失败.' + data);
//   //     }
//   //   })
//   // }, 2000, false)();
// }, {
//   immediate: false,
//   deep: true
// })
</script>