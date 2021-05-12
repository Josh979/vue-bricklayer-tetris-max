<template>
  <div class="queue-wrapper flex justify-center relative mr-10">
    <div class="absolute left-0 p-2 text-xl text-yellow-200" @dblclick="toggleDevMenu">Next:</div>
    <div class="shape m-auto">
      <div class="grid" :class="getNextShape">
        <div class="row flex">
          <div class="space S"></div>
          <div class="space I J L Z"></div>
          <div class="space"></div>
        </div>
        <div class="row flex">
          <div class="space T O Z S"></div>
          <div class="space I T O L J Z S "></div>
          <div class="space T"></div>
        </div>
        <div class="row flex">
          <div class="space O J Z"></div>
          <div class="space I T O L J S"></div>
          <div class="space L"></div>
        </div>
        <div class="row flex">
          <div class="space"></div>
          <div class="space I"></div>
          <div class="space"></div>
        </div>
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
.queue-wrapper {
  border: solid 2px blue;
  height: 175px;
  width: 175px;
  background: black;

  .shape {
    padding: 10px;
    font-size: 50px;
    font-weight: bold;

    .grid.I {
      .row > .space.I {
        background-color: blue;
      }
    }

    .grid.T {
      .row .space.T {
        background-color: lime;
      }
    }

    .grid.O {
      margin: {
        top: 0px;
        left: 20px;
      }

      .row .space.O {
        background-color: purple;
      }
    }

    .grid.J {
      margin: {
        top: 20px;
        left: 20px;
      }

      .row .space.J {
        background-color: red;
      }
    }

    .grid.L {
      margin: {
        top: 20px;
        right: 20px;
      }
      .row .space.L {
        background-color: cyan;
      }
    }

    .grid.S {
      margin: {
        top: 20px;
        left: 20px;
      }

      .row .space.S {
        background-color: yellow;
      }
    }

    .grid.Z {
      margin: {
        top: 20px;
        left: 20px;
      }

      .row .space.Z {
        background-color: white;
      }
    }

  }

  .space {
    position: relative;
    width: 25px;
    height: 25px;
    display: flex;
    justify-content: center;
    align-content: center;
    align-items: center;
  }

  .grid.I .space.I, .grid.T .space.T, .grid.Z .space.Z,
  .grid.S .space.S, .grid.L .space.L, .grid.J .space.J,
  .grid.O .space.O {
    border-radius: 3px;
    border: {
      top: 2px solid #ffffff75;
      left: 2px solid #ffffff75;
      bottom: 2px solid #000000;
      right: 2px solid #00000020;
    }
  }

}
</style>
