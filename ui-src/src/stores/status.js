import { defineStore } from 'pinia';

export const useModuleInfoStore = defineStore('moduleInfo', {
  state: () => ({
    serviceState: false
  }),
  getters: {
    getServiceState(state) {
      return state.serviceState;
    }
  },
  actions: {
    // 接受任何数量的参数，返回一个Promise或不返回
    changeServiceState(state) {
      this.serviceState = state;
    }
  }
});