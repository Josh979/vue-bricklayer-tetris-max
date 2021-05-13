<template>
  <div class="stats-wrapper h-full flex justify-self-start flex-col relative ml-10">
    <div class="stats-item">
      <div class="title">score</div>
      <div class="value">{{getScore}}</div>
    </div>
    <div class="stats-item">
      <div class="title">level</div>
      <div class="value">{{getLevel}}</div>
    </div>
    <div class="stats-item">
      <div class="title">rows</div>
      <div class="value">{{getEliminatedRows}}</div>
    </div>
    <div class=" p-2" v-if="getDevMenu">
      <button class="px-3 py-2 bg-black text-sm" @click="toggleDevPointers">Toggle Pointers</button>
      <div class="my-2">Speed: {{getSpeed}}ms</div>
      <div class="my-2">Shapes Placed: {{getShapesPlaced}}</div>
    </div>

  </div>

</template>

<script>
import {mapActions, mapGetters} from 'vuex';

export default {
  name: 'Stats',
  computed:{
    ...mapGetters([
        "getScore",
        "getLevel",
        "getShapesPlaced",
        "getSpeed",
        "getEliminatedRows",
        "getDevMenu"
    ])
  },
  methods:{
    ...mapActions([
      "toggleDevPointers"
    ])
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .stats-wrapper{
    border:solid 2px transparent;
    width:175px;
    background: transparent;
    .stats-item{
      border-radius: 3px;

      border:{
        top: 2px solid #999;
        left: 2px solid #999;
      }
      @apply p-2 mb-10;
      background: #777;
      //background: linear-gradient(to top, black 10%, silver 70%);

      .title{
        @apply text-2xl p-1 italic;
        font-family: cursive;
        background: black;
        border:{
          right: 2px solid #999;
          bottom: 2px solid #999;
        }
      }
      .value{
        @apply mt-3 py-2 text-xl font-bold;
        background: #aeaeae;
        color:black;
      }
    }
  }
</style>
