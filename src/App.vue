<template>
  <div class="fixed top-0 w-full p-2" v-if="getDevMenu">
    <button class="px-3 py-2 bg-black" @click="toggleDevPointers">Toggle ActiveShape Pointers</button>
  </div>
  <div class="flex justify-center w-full items-start">
    <Queue />
    <Board />
    <Stats />
  </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex';

import Queue from './components/Queue.vue'
import Board from './components/Board.vue'
import Stats from './components/Stats.vue'

export default {
  name: 'App',
  components: {
    Board, Queue, Stats
  },
  computed:{
    ...mapGetters([
      "getDevMenu",
    ]),
  },
  methods:{
    ...mapActions([
        "toggleDevPointers"
    ])
  }
}
</script>

<style lang="scss">
html{
  background:#333;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #fff;
  margin-top: 60px;
}
</style>
