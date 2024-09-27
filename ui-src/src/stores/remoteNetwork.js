import { defineStore } from 'pinia'

export const useRemoteNetworkStore  = defineStore('remoteNetwork', {
  state: () => ({
    networks: []
  }),
  getters: {
    getNetworks(state){
      return state.networks;
    },
    getNetworkById(state) {
      return (id) =>state.networks.find((network) => network.id===id)
    }
  },
  actions: {
    // 接受任何数量的参数，返回一个 Promise 或不返回
    updateNetwork(networks){
      this.networks=[...networks];
    }
  },
})