<template>

  <van-nav-bar :left-text="t('common.back')" title="Zerotier For KSU" left-arrow @click-left="onClickLeft"
    safe-area-inset-top fixed />
  <van-collapse v-model="activeNames">
    <van-collapse-item :title="t('networkDetail.overview')" name="dash">
      <van-card :desc="'description:' + networkObj.description"
        :title="networkObj.config.name ? networkObj.config.name : 'Undefined'">
        <template #price>
          <!-- 在线用户：{{ networkObj.onlineMemberCount }} -->
          {{ t('network.authorizedMemberCount') }} :{{ networkObj.authorizedMemberCount }}
          {{ t('network.maxMembers') }} :{{ networkObj.totalMemberCount }}
        </template>
        <template #tags>
          <van-space direction="vertical" fill>
            <van-row>
              <van-col>Network ID:{{ networkObj.id }}</van-col>
            </van-row>
            <van-row>
              <van-col span="24">routes: <van-tag plain type="primary" v-for="item in networkObj.config.routes"
                  :key="item" :title="item">{{ item.target }}</van-tag></van-col>
            </van-row>
          </van-space>
        </template>
        <template #footer>
          <van-button type="success" size="small" @click="addNetworkMemberShow = true">{{ t('networkDetail.addMember')
            }}</van-button>
          <van-button type="danger" size="small" @click="deleteNetwork(networkObj.id)">{{
            t('networkDetail.deleteNetwork') }}</van-button>
        </template>
      </van-card>
    </van-collapse-item>
    <van-collapse-item :title="t('networkDetail.member')" name="member">
      <van-collapse v-model="nodeId" @change="changeMember" accordion>
        <van-collapse-item v-for="(item, index) in memberList" :title="(item.name==''?item.nodeId:item.name)" :key="index" :name="item.nodeId">
          <van-field name="checkbox" :label="t('networkDetail.allowAuth')" input-align="right">
            <template #input>
              <van-checkbox v-model="item.config.authorized" shape="square"
                @change="updateMember(item.nodeId, false, '1')" />
            </template>
          </van-field>
          <van-field name="checkbox" :label="t('networkDetail.allowBridge')" input-align="right">
            <template #input>
              <van-checkbox v-model="item.config.activeBridge" shape="square"
                @change="updateMember(item.nodeId, false, '2')" />
            </template>
          </van-field>
          <van-field v-model.trim="item.name" :label="t('networkDetail.name')" placeholder="请输入名称" is-link
            input-align="right" @update:model-value="updateMember(item.nodeId, false, '3')" />
          <van-field v-model.trim="item.description" :label="t('networkDetail.description')" placeholder="请输入备注" is-link
            input-align="right" @update:model-value="updateMember(item.nodeId, false, '4')" />
          <van-cell :title="t('networkDetail.ztIP')" clickable is-link center @click="ipAssignmentsEditor = true">
            <template #value>
              <van-space direction="vertical" fill>
                <van-tag type="primary" v-for="(ip, idx) in item.config.ipAssignments" :key="idx" :name="idx">
                  {{ ip }}
                </van-tag>
              </van-space>
            </template>
          </van-cell>
          <van-cell :title="t('networkDetail.address')" :value="item.config.address" center />
          <van-cell :title="t('networkDetail.physicalAddress')" :value="item.physicalAddress" center />
          <van-cell :title="t('networkDetail.clientVersion')" :value="item.clientVersion" center />
          <van-cell :title="t('networkDetail.lastOnline')" :value="formatDate(item.lastOnline)" center />
          <van-cell title="" center>
            <template #value>
              <van-button type="danger" size="small" @click="deleteNetworkMember(index, item.networkId, item.nodeId)">{{
                t('networkDetail.delMember') }}</van-button>
            </template>
          </van-cell>
        </van-collapse-item>
      </van-collapse>
      <van-cell>
        <template #value>
          <van-button type="success" size="small" @click="addNetworkMemberShow = true">{{ t('networkDetail.addMember')
            }}</van-button>
        </template>
      </van-cell>
    </van-collapse-item>
    <van-collapse-item :title="t('common.setting')" name="setting">
      <!-- <van-collapse >
        <van-collapse-item title="Basics"> -->
      <van-cell-group title="Basics">
        <van-cell title="Network ID" :value="networkObj.id" center />
        <van-field v-model.trim="networkObj.config.name" :label="t('networkDetail.name')" placeholder="请输入名称" is-link
          input-align="right" @update:model-value="updateNetwork(1)" />
        <van-field v-model.trim="networkObj.description" :label="t('networkDetail.description')" placeholder="请输入备注"
          is-link input-align="right" @update:model-value="updateNetwork(2)" />
        <van-field name="radio" :label="t('networkDetail.accessControl')" input-align="right">
          <template #right-icon>
            <van-icon name="info-o" @click="showTips('1')" />
          </template>
          <template #input>
            <van-radio-group v-model="networkObj.config.private" direction="horizontal" @change="updateNetwork">
              <van-radio :name="true">{{ t('networkDetail.accessControl_private') }}</van-radio>
              <van-radio :name="false">{{ t('networkDetail.accessControl_public') }}</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-cell :title="t('networkDetail.enableBroadcast')" center>
          <template #value>
            <van-switch v-model="networkObj.config.enableBroadcast" size="22px" @change="updateNetwork(4)" />
          </template>
        </van-cell>
        <van-field :disabled="!networkObj.config.enableBroadcast" v-model.trim="networkObj.config.multicastLimit"
          input-align="right" :label="t('networkDetail.multicastLimit')" placeholder="32" type="digit" is-link
          @blur="updateNetwork(5)" />
      </van-cell-group>

      <van-cell-group :title="t('networkDetail.routeManage')">
        <van-cell title="" center>
          <template #value>
            <van-button type="success" size="small" @click="routeEditor = true">{{ t('networkDetail.addRouteRule')
              }}</van-button>
          </template>
        </van-cell>
        <van-cell center v-for="(route, ridx) in networkObj.config.routes" :key="route">
          <template #title>
            <van-tag plain type="primary">{{ route.target }}</van-tag>
          </template>
          <template #value>
            {{ route.via ? route.via : '(LAN)' }}
          </template>
          <template #right-icon>
            <van-icon name="delete-o" color="#1989fa" size="1.2rem" @click="deleteRoute(ridx)" />
          </template>
        </van-cell>
        <van-empty v-show="networkObj.config.routes.length == 0" image="network"
          :description="t('networkDetail.noRouteWarn')" />
      </van-cell-group>

      <van-cell-group :title="t('networkDetail.ipManage')">
        <van-cell :title="t('networkDetail.zt_v4')" center>
          <template #value>
            <van-switch v-model="networkObj.config.v4AssignMode.zt" size="22px" @change="updateNetwork(6)" />
          </template>
        </van-cell>
        <van-cell :title="t('networkDetail.v6AssignModeRfc4193')" center>
          <template #value>
            <van-switch v-model="networkObj.config.v6AssignMode.rfc4193" size="22px" @change="updateNetwork(7)" />
          </template>
          <template #label>
            (/128 for each device)
          </template>
        </van-cell>
        <van-cell :title="t('networkDetail.v6AssignMode6plane')" center>
          <template #value>
            <van-switch v-model="networkObj.config.v6AssignMode['6plane']" size="22px" @change="updateNetwork(8)" />
          </template>
          <template #label>
            (/80 routable for each device)
          </template>
        </van-cell>
        <van-cell :title="t('networkDetail.zt_v6')" center>
          <template #value>
            <van-switch v-model="networkObj.config.v6AssignMode.zt" size="22px" @change="updateNetwork(9)" />
          </template>
        </van-cell>
        <van-cell :title="t('networkDetail.ipPoolManage')" clickable is-link center
          @click="ipAssignmentPoolsEditor = true">
          <template #right-icon>
            <!-- v-show="networkObj.config.enableBroadcast"  -->
            <van-space direction="vertical" fill>
              <van-tag type="primary" v-for="(ipObj, pidx) in networkObj.config.ipAssignmentPools" :key="pidx"
                :name="pidx">
                {{ ipObj.ipRangeStart }}-{{ ipObj.ipRangeEnd }}
              </van-tag>
            </van-space>
          </template>
          <template #extra>
            <van-icon name="arrow" />
          </template>
        </van-cell>
      </van-cell-group>

      <van-cell-group :title="t('networkDetail.DNSManage')">
        <van-field v-model.trim="networkObj.config.dns.domain" :label="t('networkDetail.DNSDomain')"
          placeholder="Domain" is-link input-align="right" @update:model-value="updateNetwork(10)" />
        <van-cell clickable is-link center @click="dnsEditor = true">
          <template #title>
            {{ t('networkDetail.DNSServers') }}
            <!-- <van-icon name="info-o" @click="showTips('2')" /> -->
          </template>
          <template #right-icon>
            <!-- v-show="networkObj.config.enableBroadcast"  -->
            <van-space direction="vertical" fill>
              <van-tag type="primary" v-for="(dns, dxidx) in networkObj.config.dns.servers" :key="dxidx" :name="dxidx">
                {{ dns }}
              </van-tag>
            </van-space>
          </template>
          <template #extra>
            <van-icon name="arrow" />
          </template>
        </van-cell>
        <!-- <van-field v-model="networkObj.config.dns.servers" label="Servers" placeholder="Servers" is-link
          input-align="right" @blur="updateNetwork(11)" /> -->
        <!--  -->
      </van-cell-group>
    </van-collapse-item>
  </van-collapse>
  <!-- 虚拟IP管理 -->
  <van-popup v-model:show="ipAssignmentsEditor" round :style="{ width: '90%', maxHeight: '85%' }"
    :before-close="checkMemberIP">
    <van-cell :title="t('networkDetail.ztIP')" title-style="max-width:100%;" center>
      <template #right-icon>
        <van-icon size="1.2rem" name="plus" @click="addPkgList" />
      </template>
    </van-cell>
    <van-form>
      <van-list>
        <van-field placeholder="IPv4 Address" maxlength="15"
          :rules="[{ validator: asyncIPv4Validator, message: t('networkDetail.IPTips') }]" show-error
          v-for="(item, idx) in modifiedMember.config.ipAssignments" :label="idx + ':'" :model-value="item"
          @update:model-value="v => editPkgList(v, idx)">
          <template #right-icon>
            <van-icon size="1rem" name="cross" @click="deletePkgList(idx)" />
          </template>
        </van-field>
      </van-list>
    </van-form>
  </van-popup>
  <!-- 新增成员 -->
  <van-dialog v-model:show="addNetworkMemberShow" :title="t('networkDetail.addMember')" show-cancel-button
    :before-close="checkMemberID">
    <van-form>
      <van-field :rules="[{ required: true, message: t('networkDetail.nodeIdtIPS') }]" v-model.trim="memberId"
        :label="t('networkDetail.nodeId')" required :placeholder="t('networkDetail.nodeIdtIPS')" maxlength="10" />
    </van-form>
  </van-dialog>
  <!-- IPv4/IPv6 地址池管理 -->
  <van-popup v-model:show="ipAssignmentPoolsEditor" round :style="{ width: '90%', maxHeight: '85%' }"
    :before-close="checkIPRange">
    <van-cell :title="t('networkDetail.ipPoolManage')" title-style="max-width:100%;" center>
      <template #right-icon>
        <van-icon size="1.2rem" name="plus"
          @click='networkObj.config.ipAssignmentPools.push({ "ipRangeStart": "", "ipRangeEnd": "" })' />
      </template>
    </van-cell>
    <van-form>
      <van-list>
        <van-cell center>
          <template #title>
            <van-field :placeholder="t('networkDetail.ipRangeStart')" readonly required />
          </template>
          <template #value>
            <van-field :placeholder="t('networkDetail.ipRangeEnd')" readonly required />
          </template>
        </van-cell>
        <van-cell center v-for="(iipv4, iidx) in networkObj.config.ipAssignmentPools" :key="iipv4">
          <template #title>
            <van-field placeholder="IPv4/IPv6" v-model.trim="iipv4.ipRangeStart">
            </van-field>
          </template>
          <template #value>
            <van-field placeholder="IPv4/IPv6" v-model.trim="iipv4.ipRangeEnd">
            </van-field>
          </template>
          <template #right-icon>
            <van-icon size="1rem" name="cross" @click="networkObj.config.ipAssignmentPools.splice(iidx, 1)" />
          </template>
        </van-cell>
      </van-list>
    </van-form>
  </van-popup>
  <!--路由管理管理 -->
  <van-popup v-model:show="routeEditor" round :style="{ width: '90%', maxHeight: '85%' }" :before-close="checkRoute">
    <van-cell :title="t('networkDetail.routeManage')" title-style="max-width:100%;" center>
      <template #right-icon>
        <van-icon size="1.2rem" name="plus" @click='networkObj.config.routes.push({ "target": "", "via": "" })' />
      </template>
    </van-cell>
    <van-form>
      <van-list>
        <van-cell center>
          <template #title>
            <van-field placeholder="Destination" readonly required />
          </template>
          <template #value>
            <van-field placeholder="Via" readonly required />
          </template>
        </van-cell>
        <van-cell center v-for="(iroute, rridx) in networkObj.config.routes" :key="iroute">
          <template #title>
            <van-field placeholder="IPV4/CIDR" v-model.trim="iroute.target" />
          </template>
          <template #value>
            <van-field placeholder="IPv4/IPv6" v-model.trim="iroute.via" />
          </template>
          <template #right-icon>
            <van-icon size="1rem" name="cross" @click="networkObj.config.routes.splice(rridx, 1)" />
          </template>
        </van-cell>
      </van-list>
    </van-form>
  </van-popup>
  <!-- DNS 地址管理 -->
  <van-popup v-model:show="dnsEditor" round :style="{ width: '90%', maxHeight: '85%' }" :before-close="checkDNS">
    <van-cell title="DNS Servers" title-style="max-width:100%;" center>
      <template #right-icon>
        <van-icon size="1.2rem" name="plus" @click="networkObj.value.config.dns.servers.push('')" />
      </template>
    </van-cell>
    <van-form>
      <van-list>
        <van-field show-error v-for="(dns, diidx) in networkObj.config.dns.servers" :label="diidx + ':'"
          placeholder="IPv4" :model-value="dns" @update:model-value="v => updateDNS(v, diidx)">
          <template #right-icon>
            <van-icon size="1rem" name="cross" @click="networkObj.config.dns.servers.splice(diidx, 1)" />
          </template>
        </van-field>
      </van-list>
    </van-form>
  </van-popup>
</template>

<script setup>
// import { ref, watch } from 'vue';
// import { useRoute, useRouter } from 'vue-router'
import { MODDIR, execCmdWithCallback, execCmdWithErrno, spawnCmdWithCallback } from './tools'
// import { useRemoteNetworkStore } from './stores/remoteNetwork'
import { useI18n } from './locales'; // 导入所有翻译信息
const { t } = useI18n();

// const remoteNetwork = useRemoteNetworkStore();

const router = useRouter()
const route = useRoute()
const networkObj = ref({
  "id": "",
  "config": {
    "enableBroadcast": true,
    "id": "",
    "ipAssignmentPools": null,
    "multicastLimit": 32,
    "name": "",
    "private": false,
    "routes": [],
    "v4AssignMode": {
      "zt": false
    },
    "v6AssignMode": {
      "6plane": false,
      "rfc4193": false,
      "zt": false
    },
    "dns": {
      "domain": "",
      "servers": null
    }
  },
  "description": "",
  "onlineMemberCount": 0,
  "authorizedMemberCount": 0,
  "totalMemberCount": 0
})
const ipAssignmentsEditor = ref(false)
const ipAssignmentPoolsEditor = ref(false)
const routeEditor = ref(false)
const dnsEditor = ref(false)
const addNetworkMemberShow = ref(false)
const memberList = ref([])
const modifiedMember = ref({})
const memberId = ref('')
const memberIndex = ref()
const IPV4Pattern = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
const IPV6Pattern = /^([\da-fA-F]{1,4}:){6}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^::([\da-fA-F]{1,4}:){0,4}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:):([\da-fA-F]{1,4}:){0,3}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){2}:([\da-fA-F]{1,4}:){0,2}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){3}:([\da-fA-F]{1,4}:){0,1}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){4}:((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$|^:((:[\da-fA-F]{1,4}){1,6}|:)$|^[\da-fA-F]{1,4}:((:[\da-fA-F]{1,4}){1,5}|:)$|^([\da-fA-F]{1,4}:){2}((:[\da-fA-F]{1,4}){1,4}|:)$|^([\da-fA-F]{1,4}:){3}((:[\da-fA-F]{1,4}){1,3}|:)$|^([\da-fA-F]{1,4}:){4}((:[\da-fA-F]{1,4}){1,2}|:)$|^([\da-fA-F]{1,4}:){5}:([\da-fA-F]{1,4})?$|^([\da-fA-F]{1,4}:){6}:$/;
const cidrRegex = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;

const activeNames = ref(['dash']);
const nodeId = ref(['']);

const asyncIPv4Validator = (val) =>
  new Promise((resolve) => {
    resolve(IPV4Pattern.test(val));
  });

const asyncIPPoolValidator = (val) =>
  new Promise((resolve) => {
    const ipArr = val.split('-');
    if ((IPV4Pattern.test(ipArr[0]) && IPV4Pattern.test(ipArr[1])) || (IPV6Pattern.test(ipArr[0]) && IPV6Pattern.test(ipArr[1]))) {
      resolve(true)
    } else {
      resolve(false)
    }
  });

const deleteRoute = (didx) => {
  networkObj.value.config.routes.splice(didx, 1)
  updateNetwork()
}
const updateDNS = (data, didx) => {
  networkObj.value.config.dns.servers[didx] = data;
  console.info('updateDNS')
}


const updateNetwork = (i) => {
  debounce(() => {
    networkObj.value.config.multicastLimit = parseInt(networkObj.value.config.multicastLimit);
    console.info(networkObj)
    showLoadingToast({
      duration: 0,
      message: t('common.loading'),
      forbidClick: true,
      loadingType: 'spinner',
    });
    spawnCmdWithCallback({
      cmd: `sh ${MODDIR}/api.sh central network modify ${networkObj.value.id} '${JSON.stringify(networkObj.value)}'`, onSuccess: (data) => {
        closeToast()
        showToast(t('networkDetail.updateNetworkSuccessTips'));
      }, onError: (data) => {
        closeToast()
        showToast(t('networkDetail.updateNetworkErrorTips') + data);
      }
    })
  }, 1000, false)();
  console.info('updateNetwork' + i)
}
const showTips = (i) => {
  let message;
  let duration = 2000;
  if (i == 1) {
    message = t('networkDetail.accessControl_tips')
    duration = 5000;
  } else if (i == 2) {
    message = t('networkDetail.accessControl_tips')
  }
  showToast({ message: message, duration: duration });
}
const updateMember = (memberID, immediate, id) => {

  console.info(`id-->:${id}`)
  if (!memberID) {
    return;
  }
  if (!immediate) {
    immediate = false;
  }

  debounce(() => {
    showLoadingToast({
      duration: 0,
      message: t('common.loading'),
      forbidClick: true,
      loadingType: 'spinner',
    });
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
        closeToast()
        showToast(t('networkDetail.updateMemberSuccessTips'));
      }, onError: (data) => {
        closeToast()
        showToast(t('networkDetail.updateMemberErrorTips') + data);
      }
    })
  }, 1500, immediate)();
}
const checkMemberIP = () => {
  for (const ip of modifiedMember.value.config.ipAssignments) {
    if (!IPV4Pattern.test(ip)) {
      showToast(t('networkDetail.IPTips'));
      return false
    }
  }
  updateMember(modifiedMember.value.nodeId, false, '5');
  return true
}
const checkIPRange = () => {
  for (const ipObj of networkObj.value.config.ipAssignmentPools) {
    if ((IPV4Pattern.test(ipObj['ipRangeStart']) && IPV4Pattern.test(ipObj['ipRangeEnd'])) || (IPV6Pattern.test(ipObj['ipRangeStart']) && IPV6Pattern.test(ipObj['ipRangeEnd']))) {
      continue
    } else {
      showToast(t('networkDetail.IPTips'));
      return false
    }
  }
  updateNetwork()
  return true;
}
const checkDNS = () => {
  for (const ipObj of networkObj.value.config.dns.servers) {
    if (IPV4Pattern.test(ipObj) || IPV6Pattern.test(ipObj)) {
      continue
    } else {
      showToast(t('networkDetail.IPTips'));
      return false
    }
  }
  updateNetwork()
  return true;
}

const checkRoute = () => {

  for (const ipObj of networkObj.value.config.routes) {
    if (cidrRegex.test(ipObj['target'])) {
      if (!ipObj['via'] || (IPV4Pattern.test(ipObj['via']) || IPV6Pattern.test(ipObj['via']))) {
        continue
      } else {
        showToast(t('networkDetail.IPTips'));
        return false
      }
    } else {
      showToast(t('networkDetail.IPTips'));
      return false
    }
  }
  updateNetwork()
  return true;
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
/**
 * 判断对象是否相同
 * @param obj1 
 * @param obj2 
  const nestedObjA = { a: { b: 1 } };
  const nestedObjB = { a: { b: 1 } };
  const nestedObjC = { a: { b: 2 } };
  console.log(isDeepEqual(nestedObjA, nestedObjB)); // true
  console.log(isDeepEqual(nestedObjA, nestedObjC)); // false
 */
const isDeepEqual = (obj1, obj2) => {
  if (typeof obj1 !== typeof obj2) {
    return false;
  }
  if (typeof obj1 === 'object' && obj1 !== null && typeof obj2 === 'object' && obj2 !== null) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    for (let key of keys1) {
      if (!isDeepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }
    return true;
  } else {
    return obj1 === obj2;
  }
}

/** 格式化IP段，返回 ip-ip的形式 */
const formatIpRange = (ipRange) => {
  return `${ipRange.ipRangeStart}-${ipRange.ipRangeEnd}`;
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
  //不能直接history-1返回，以防页面有缓存导致的信息不一致。
  router.push('/center/network');
}

// 删除网络回调
const beforeCloseForNetwork = (action) => {
  new Promise((resolve) => {
    
    if (action == 'confirm') {

    } else {
      resolve(true);
    }
  });
}
// 删除网络成员回调
const beforeCloseForMember = () => {
  new Promise((resolve) => {
    setTimeout(() => {
      execCmdWithCallback({
        cmd: `sh ${MODDIR}/api.sh central member remove ${networkObj.value.id} ${memberId.value} `, onSuccess: (data) => {
          memberList.value.splice(memberIndex.value, 1);
          showToast(t('networkDetail.deleteMemberSuccessTips'));
        }, onError: (data) => {
          showToast(t('networkDetail.deleteMemberErrorTips') + data);
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
      showToast(t('networkDetail.addMemberSuccessTips'));
    }, onError: (data) => {
      showToast(t('networkDetail.addMemberErrorTips') + data);
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
    message: `NodeID:${mbId},${t('common.deleteConfirm')}`,
    beforeCloseForMember,
  });
}

// 删除网络
const deleteNetwork = (nwid) => {
  showConfirmDialog({
    message: `networkid:${nwid},${t('common.deleteConfirm')}`,
  }).then(() => {

    setTimeout(() => {
      execCmdWithCallback({
        cmd: `sh ${MODDIR}/api.sh central network remove ${networkObj.value.id}`, onSuccess: (data) => {
          showToast(t('networkDetail.deleteNetworkSuccessTips'));
          router.push('/center/network')
        }, onError: (data) => {
          showToast(t('networkDetail.deleteNetworkErrorTips') + data);
        }
      })
    }, 50);
  }).catch(() => {
    resolve(true);
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
      showToast(t('common.loading_fail') + data);
    }
  })
}

//初始化
const init = () => {
  //TODO 将成员信息缓存下来，然后修改缓存，解决现有情况下，防抖导致跨成员ID覆盖修改的问题
  showLoadingToast({
    duration: 0,
    message: t('common.loading'),
    forbidClick: true,
    loadingType: 'spinner',
  });
  console.info(`networkid:${route.params.id}`);
  execCmdWithCallback({
    cmd: `sh ${MODDIR}/api.sh central network list ${route.params.id}`, onSuccess: (data) => {
      networkObj.value = JSON.parse(data);
      if(networkObj.value.config.dns.servers==null){
        networkObj.value.config.dns.servers=[]
      }
      debugger
      if (!networkObj.value) {
        closeToast();
        router.push('/center/network')
      }
      getMembers(route.params.id)
      closeToast();
      console.info('加载完成.');
    }, onError: (data) => {
      showToast(t('common.loading_fail') + data);
    }
  })
  // networkObj.value = remoteNetwork.getNetworkById(route.params.id)
}

init()
</script>