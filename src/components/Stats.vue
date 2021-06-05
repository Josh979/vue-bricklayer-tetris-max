<template>
  <div class="stats-wrapper flex justify-self-start flex-col relative ml-10">
    <div class="stats-item shadow-lg">
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
    <div class="dev-menu" v-if="getDevMenu">
      <div class="font-bold mb-1">Dev Menu</div>
      <div class="flex justify-around">
        <button class="px-3 mb-2 py-2 bg-black text-xs rounded" @click="toggleDevPointers">Pointers</button>
        <button class="px-3 mb-2 py-2 bg-black text-xs rounded" @click="toggleAltTheme">Theme</button>
      </div>
      <div class="my-2 flex justify-around">
        <div class="flex flex-col">
          <div>Speed</div>
          <div>{{getSpeed}}ms</div>
        </div>
        <div class="flex flex-col">
          <div>Blocks</div>
          <div>{{getShapesPlaced}}</div>
        </div>
      </div>
      <div class="my-2">
        <div class="mb-1">Distribution %</div>
        <div class="flex justify-center w-full">
          <div class="flex flex-col w-full" v-for="(shapeCount, shapeName) in getShapesReceived" :key="`${shapeName}-received`">
            <div :class="`${altTheme ? 'alt-theme' : ''} letter letter-${shapeName}`">{{shapeName}}</div>
            <div class="value">{{percentOfAllShapeDistribution(shapeCount)}}</div>
          </div>
        </div>
      </div>
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
        "getShapesReceived",
        "getSpeed",
        "getEliminatedRows",
        "getDevMenu",
        "altTheme"
    ]),
    shapesLoaded(){
      return Object.values(this.getShapesReceived).reduce((curr,acc) => curr+acc);
    }
  },
  methods:{
    ...mapActions([
      "toggleDevPointers",
      "toggleAltTheme"
    ]),
    percentOfAllShapeDistribution(value){
      if (this.shapesLoaded){
        return Math.floor(value / this.shapesLoaded * 100);
      }
      return 0;
    }
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
        @apply text-2xl p-1 capitalize italic;
        background: black;
        border:{
          right: 2px solid #999;
          bottom: 2px solid #999;
        }
      }
      .value{
        @apply mt-3 py-1 text-2xl font-bold text-right px-2;
        background: black;
        border:{
          right: 2px solid #999;
          bottom: 2px solid #999;
        }
        border-radius: 3px;
        color:limegreen;
      }
    }
  }
  .dev-menu{
    background:#00000040;
    border-radius: 10px;
    @apply p-2 text-xs;
    .letter{
      font-weight: bold;
      font-size: 11px;
      &-I{
        color:blue;
      }
      &-J{
        color:red;
      }
      &-L{
        color:cyan;
        &.alt-theme{
          color:orange;
        }
      }
      &-O{
        color:darkmagenta;
      }
      &-S{
        color:yellow;
        &.alt-theme{
          color:hotpink;
        }
      }
      &-T{
        color:limegreen;
      }
      &-Z{
        color:white;
      }
    }
    .value{
      font-size: 11px;
    }
  }
</style>
