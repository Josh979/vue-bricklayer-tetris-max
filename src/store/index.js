import { createStore } from 'vuex'

export default createStore({
  state: {
    score: 0,
    level: 1,
    rows: {
      eliminated: 0
    },
    shapes:{
      T:{
        color: 'green'
      },
      I:{
        color: 'blue'
      }
    },
    queue:['I'],
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
      return state.queue[0];
    }
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
