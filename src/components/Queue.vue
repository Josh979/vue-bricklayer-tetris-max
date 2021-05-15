<template>
  <div class="mr-10">
    <div class="queue-border">
      <div class="queue-wrapper flex self-start justify-center relative ">
        <div class="absolute left-0 p-2 next-text font-bold uppercase" @dblclick="toggleDevMenu">Next</div>
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
.next-text{
  color:whitesmoke;
}
.queue-border{
  @apply p-3;
  background: #777;
  border-radius:3px;
  border:{
    top: 2px solid #999;
    left: 2px solid #999;
  }
}
.queue-wrapper {
  //border: solid 1px whitesmoke;
  height: 175px;
  width: 175px;
  background: black;
  border:{
    radius:3px;
    right: 2px solid #999;
    bottom: 2px solid #999;
  }


  .shape {
    padding: 10px;
    font-size: 50px;
    font-weight: bold;

    .grid.I {
      .row > .space.I {
        //background-color: blue;
        background: linear-gradient(to top left, darkblue 0%, blue 75%);
      }
    }

    .grid.T {
      .row .space.T {
        //background-color: lime;
        background: linear-gradient(to top left, darkgreen 0%, lime 75%);
      }
    }

    .grid.O {
      margin: {
        top: 0px;
        left: 20px;
      }

      .row .space.O {
        //background-color: purple;
        background: linear-gradient(to top left, indigo 0%, darkmagenta 75%);
      }
    }

    .grid.J {
      margin: {
        top: 20px;
        left: 20px;
      }

      .row .space.J {
        //background-color: red;
        background: linear-gradient(to top left, darkred 0%, red 75%);

      }
    }

    .grid.L {
      margin: {
        top: 20px;
        right: 20px;
      }
      .row .space.L {
        //background-color: cyan;
        background: linear-gradient(to top left, darkcyan 0%, cyan 75%);
      }
    }

    .grid.S {
      margin: {
        top: 20px;
        left: 20px;
      }

      .row .space.S {
        //background-color: yellow;
        background: linear-gradient(to top left, darken(yellow, 15) 0%, yellow 75%);
      }
    }

    .grid.Z {
      margin: {
        top: 20px;
        left: 20px;
      }

      .row .space.Z {
        //background-color: white;
        //background-image: url("/img/patterns/shapes/z.png");
        background: linear-gradient(to top left, grey 0%, white 75%);
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
    border-radius: 4px;
    outline: 1px solid black;
    border:{
      top: 2px solid #ffffff75;
      left: 2px solid #ffffff75;
      bottom: 2px solid #00000090;
      right: 2px solid #00000020;
    }
  }

}
</style>
