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
    nextLevelAt: 1500,
    rows: {
      eliminated: 0
    },
    shapes:['I','L','J','T','O','S','Z'],
    shapesPlaced: 0,
    queue:[],
    completedRowQueue:[],
    scoreRowQueue:[],
    spaces:[]
  },
  getters: {
    getDevMenu: state => {
      return state.dev.menu;
    },
    getDevPointers: state => {
      return state.dev.showPointers;
    },
    getShapesPlaced: state => {
      return state.shapesPlaced;
    },
    getScore: state => {
      return state.score;
    },
    getLevel: state => {
      return state.level;
    },
    getNextLevelAt: state => {
      return state.nextLevelAt;
    },
    getSpeed: state => {
      return state.speed;
    },
    getEliminatedRows: state => {
      return state.rows.eliminated;
    },
    completedRowQueue: state => {
      return state.completedRowQueue;
    },
    scoreRowQueue: state => {
      return state.scoreRowQueue;
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
      state.completedRowQueue = [];
      state.scoreRowQueue = [];
      state.speed = 1000;
      state.nextLevelAt = 1500;
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
      //todo this needs to change between 1500 and 2000. review original game behavior
      state.nextLevelAt += 2000;
    },
    increaseShapesPlaced(state){
      ++state.shapesPlaced;
    },
    increaseSpeed(state){
      if (state.speed > 200){
        state.speed = state.speed - 100;
      }
    },
    addToScoreQueue(state, payload){
      state.scoreRowQueue.push(payload);
    },
    shiftScoreQueue(state){
      state.scoreRowQueue.shift();
    },
    addToCompletedRowQueue(state, payload){
      state.completedRowQueue.push(payload);
    },
    clearCompletedRowQueue(state){
      state.completedRowQueue = [];
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
    addToScoreQueue({commit}, payload){
      commit('addToScoreQueue', payload)
      setTimeout(() => {
        commit('shiftScoreQueue')
      },1000);
    },
    addToCompletedRowQueue({commit}, payload){
      commit('addToCompletedRowQueue', payload)
    },
    clearCompletedRowQueue({commit}){
      commit('clearCompletedRowQueue')
    },

    //devmode
    toggleDevMenu({commit}){
      commit('toggleDevMenu')
    },
    toggleDevPointers({commit}){
      commit('toggleDevPointers')
    }
  },
  modules: {}
})
