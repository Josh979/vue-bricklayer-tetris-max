<template>
  <div class="mr-10 mt-10">
    <div class="scores-border">
      <div class="scores-wrapper flex self-start justify-center relative ">
        <div class="absolute left-0 p-2 next-text font-bold uppercase">High Score</div>
      </div>
    </div>
  </div>

</template>

<script>
import {mapGetters, mapActions} from 'vuex';

export default {
  name: 'Queue',
  data() {
    return {}
  },

  computed: {
    ...mapGetters([
      "getNextShape",
      "altTheme"
    ])
  },
  methods:{
    ...mapActions([
        "toggleDevMenu"
    ])
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.scores-border{
  @apply p-3;
  background: #777;
  border-radius:3px;
  border:{
    top: 2px solid #999;
    left: 2px solid #999;
  }
}
.scores-wrapper {
  //border: solid 1px whitesmoke;
  height: 175px;
  width: 175px;
  background: black;
  border:{
    radius:3px;
    right: 2px solid #999;
    bottom: 2px solid #999;
  }
}
</style>
