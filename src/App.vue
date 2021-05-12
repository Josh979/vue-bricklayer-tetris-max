<template>
  <div class="flex justify-center w-full items-start">
    <Queue />
    <Board />
    <Stats />
  </div>
</template>

<script>

import Queue from './components/Queue.vue'
import Board from './components/Board.vue'
import Stats from './components/Stats.vue'

export default {
  name: 'App',
  components: {
    Board, Queue, Stats
  },
  computed:{},
  methods:{}
}
</script>

<style lang="scss">

html{
  background-color:black;
  //background-image: url("https://www.transparenttextures.com/patterns/diagmonds.png");
  //background-image: url("https://www.transparenttextures.com/patterns/black-felt.png");
   background-image: url("/img/patterns/escheresque-dark.png");

}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #fff;
  margin-top: 30px;
}
</style>
