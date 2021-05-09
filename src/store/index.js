import { createStore } from 'vuex'

export default createStore({
  state: {
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
  },
  actions: {
    processQueue({commit}){
      commit('loadQueue')
      commit('processQueue')
    },
    loadQueue({commit}){
      commit('loadQueue')
    }
  },
  modules: {
  }
})
