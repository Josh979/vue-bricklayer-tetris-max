import { createStore } from 'vuex'

export default createStore({
  state: {
    dev:{
      menu: false,
      showPointers: false,
    },
    score: 0,
    speed: 1000,
    level: 1,
    rows: {
      eliminated: 0
    },
    shapes:['I','L','J','T','O','S','Z'],
    shapesPlaced: 0,
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
    getShapesPlaced: state => {
      return  state.shapesPlaced;
    },
    getScore: state => {
      return  state.score;
    },
    getLevel: state => {
      return  state.level;
    },
    getSpeed: state => {
      return  state.speed;
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
    resetGame(state){
      state.queue = [];
      state.speed = 1000;
      state.level = 1;
      state.score = 0;
      state.shapesPlaced = 0;
      state.rows.eliminated = 0;
    },
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
    increaseLevel(state){
      ++state.level;
    },
    increaseShapesPlaced(state){
      ++state.shapesPlaced;
    },
    increaseSpeed(state){
      if (state.speed > 200){
        state.speed = state.speed - 100;
      }
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
    resetGame({commit}){
      commit('resetGame')
    },
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
    increaseShapesPlaced({commit}){
      commit('increaseShapesPlaced')
    },
    increaseLevel({commit}){
      commit('increaseLevel')
    },
    increaseSpeed({commit}){
      commit('increaseSpeed')
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
