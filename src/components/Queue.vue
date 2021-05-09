<template>
  <div class="queue-wrapper flex justify-center relative mr-10">
    <div class="absolute left-0 p-2 text-xl text-yellow-200">Next:</div>
    <div class="shape m-auto">
      {{getNextShape}}
    </div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex';

export default {
  name: 'Queue',
  computed:{
    ...mapGetters([
      "getNextShape",
    ])
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .queue-wrapper{
    border:solid 2px blue;
    height:175px;
    width:175px;
    background: black;
    .shape{
      padding:10px;
    }
  }
</style>
