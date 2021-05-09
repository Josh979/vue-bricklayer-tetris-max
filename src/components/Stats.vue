<template>
  <div class="stats-wrapper h-full flex justify-center align-middle flex-col relative ml-10">
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
  </div>
</template>

<script>
import {mapGetters} from 'vuex';

export default {
  name: 'Stats',
  computed:{
    ...mapGetters([
        "getScore",
        "getLevel",
        "getEliminatedRows"
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
      border:{
        top: 2px solid #999;
        left: 2px solid #999;
      }
      @apply p-2 mb-10;
      background: #777;
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
