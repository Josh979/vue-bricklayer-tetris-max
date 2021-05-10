import { createStore } from 'vuex'

export default createStore({
  state: {
    dev:{
      menu: false,
      showPointers: false,
    },
    score: 0,
    level: 1,
    rows: {
      eliminated: 0
    },
    shapes:['I','L','J','T','O','S','Z'],
    queue:[],
    spaces:[]
  },
  getters: {
    getDevMenu: state => {
      return  state.dev.menu;
    },
    getDevPointers: state => {
      return  state.dev.showPointers;
    },
    getScore: state => {
      return  state.score;
    },
    getLevel: state => {
      return  state.level;
    },
    getEliminatedRows: state => {
      return  state.rows.eliminated;
    },
    getNextShape: state => {
      return state.queue[1];
    },
    getShape: state => {
      return state.queue[0];
    },
    getQueue: state => {
      return state.queue;
    }
  },
  mutations: {
    processQueue(state){
      state.activeShape = state.queue.shift();
    },
    loadQueue(state){
      const min = 0;
      const max = state.shapes.length;
      const randomIndex = Math.floor(Math.random() * (max - min) + min);
      const newShape = state.shapes[randomIndex];
      state.queue.push(newShape);
    },
    increaseEliminatedRows(state, rowsToAdd){
      state.rows.eliminated += rowsToAdd;
    },
    addPoints(state, points){
      state.score += points;
    },

    //devmode
    toggleDevMenu(state){
      state.dev.menu = !state.dev.menu;
    },
    toggleDevPointers(state){
      state.dev.showPointers = !state.dev.showPointers;
    },

  },
  actions: {
    processQueue({commit}){
      commit('loadQueue')
      commit('processQueue')
    },
    loadQueue({commit}){
      commit('loadQueue')
    },
    increaseEliminatedRows({commit}, payload){
      commit('increaseEliminatedRows', payload)
    },
    addPoints({commit}, payload){
      commit('addPoints', payload)
    },

    //devmode
    toggleDevMenu({commit}){
      commit('toggleDevMenu')
    },
    toggleDevPointers({commit}){
      commit('toggleDevPointers')
    }
  },
  modules: {
  }
})
