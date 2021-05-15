<template>
  <div class="justify-items-center py-10 w-full" :class="`level-${getLevel < 10 ? getLevel : '9'}`">
    <div class="flex justify-center w-full h-full items-start">
      <Queue />
      <Board />
      <Stats />
    </div>
  </div>
</template>

<script>
import Queue from './components/Queue.vue'
import Board from './components/Board.vue'
import Stats from './components/Stats.vue'
import {mapGetters} from 'vuex';

export default {
  name: 'App',
  components: {
    Board, Queue, Stats
  },
  computed:{
    ...mapGetters([
      "getLevel",
    ])
  },
  methods:{}
}
</script>

<style lang="scss">

html{
  height:100%;


}
body{
  height:100%;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #fff;
  height: 100%;
  display:flex;
  justify-content: center;

  div.level{
    &-1{
      background-color:cyan;
      background-image: url("/img/patterns/diagmonds.png");
    }
    &-2{
      background-color:olivedrab;
      background-image: url("/img/patterns/black-felt.png");
    }
    &-3{
      background-color:black;
      background-image: url("/img/patterns/escheresque-dark.png");
    }
    &-4{
      background-color:#cc0085;
      background-image: url("/img/patterns/black-linen.png");
    }
    &-5{
      background-color:#004f8c;
      background-image: url("/img/patterns/washi.png");
    }
    &-6{
      background-color:#690400;
      background-image: url("/img/patterns/axiom-pattern.png");
    }
    &-7{
      background-color: #a5370c;
      background-image: url("/img/patterns/bright-squares.png");
    }
    &-8{
      background-color:#1f0061;
      background-image: url("/img/patterns/clean-gray-paper.png");
    }
    &-9{
      background-color:black;
      background-image: url("/img/patterns/grid-me.png");
    }
  }
  //background-image: url("https://www.transparenttextures.com/patterns/black-felt.png");
  //background-image: url("/img/patterns/escheresque-dark.png");


}
</style>
