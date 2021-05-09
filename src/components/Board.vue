<template>
  <div class="self-center justify-self-center">
    <div class="flex justify-center align-middle relative">
      <div v-show="!started" class="align-middle flex absolute justify-center self-center">
        <button @click="startGame()" class="start-button text-2xl p-4 font-bold uppercase">Start Game</button>
      </div>
      <div v-if="spacesInitialized" class="board-wrapper">
        <div class="flex flex-col">
          <div v-for="(row, rIndex) in config.rows" class="flex" :key="`col${rIndex}`">
            <template v-if="rIndex > 1">
              <div v-for="(col, cIndex) in config.columns" class="space" :class="spaces[rIndex][cIndex].type"
                   :key="`space${cIndex},${rIndex}`">
                <span>{{ spaces[rIndex][cIndex].occupied ? 'y' : '' }}</span>
                <template v-if="isActiveShape(rIndex,cIndex)">
                  <div class="space" :class="activeShape.type"></div>
                </template>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div class="mb-4" v-else>
        <h1 class="text-5xl mt-10">Game Over</h1>
        <div class="mt-4 mb-10">Refresh the page to restart</div>

        <div class="text-xl mb-3 uppercase">{{newHighScore ? 'New' : ''}} High Score: <span>{{highScore}}</span></div>

        <div v-if="!newHighScore" class="my-2 uppercase">
          This score: {{getScore}}
        </div>


      </div>
    </div>
  </div>

</template>

<script>
import {mapGetters, mapActions} from 'vuex';

export default {
  name: 'Board',
  props: {},
  data() {
    return {
      config:{
        rows: 22,
        columns: 10,
      },
      queue: null,
      started: false,
      active: true,
      score: 0,
      //spaces will be moved to store
      spaces:[],
      spacesInitialized: false,
      activeShape: {
        pointers: [], // use this instead of coords
        type: null,
        rotation: 0,
        coordinates: []
      },
      shapes: {},
    }
  },

  computed:{
    ...mapGetters([
      "getShape",
      "getNextShape",
      "getQueue",
    ]),

    getScore(){
      return this.score;
    },
    highScore(){
      return localStorage.getItem('highscore');
    },
    newHighScore(){
      return this.getScore >= this.highScore;
    },
    colCenter(){
      return Math.floor(this.config.columns / 2);
    }
  },

  methods:{
    ...mapActions([
      "processQueue",
      "loadQueue",
    ]),

    startGame(){
      this.started = true;
      //this.startMusic();
      this.loadQueue();
      this.loadQueue();
      this.spawnShape();

      window.addEventListener('keydown', this.handleKeydown, null);
    },
    startMusic(){
      const music = new Audio(require('@/assets/sounds/t-maxx.mp3'));
      music.play();
      music.loop = true;
    },
    move(direction){
      const length = this.activeShape.pointers.length;
      const validation = this.activeShape.pointers.filter((item) => {
        return item[direction] !== null
      }).length;
      if (length === validation){
        this.activeShape.pointers = this.activeShape.pointers.map((x) => {
          return x[direction];
        })
      }
    },
    rotateClockwise(){},
    rotateCounterClockwise(){},
    spawnShape(){
      this.activeShape = this.buildActiveShape();
    },
    buildActiveShape(){
      this.processQueue();
      const type = this.getShape;
      const pointers = [...this.shapes[type]];
      return {type,pointers}
    },
    addPoints(points){
      this.score += points;
    },
    gameOver() {
      this.updateHighScore();
      this.active = false;
    },
    levelUp(){
      const audio = new Audio(require('@/assets/sounds/levelup.mp3'));
      audio.play();
    },
    updateHighScore(){
      if (localStorage.getItem('highscore') < this.score){
        localStorage.setItem('highscore', this.score);
      }
    },
    isWithinBounds(x,y){
      if (x < 1 || x > this.config.columns){
        return false;
      } else if (y < 1 || y > this.config.rows){
        return false;
      }
      return true;
    },
    isActiveShape(x,y){
      return this.activeShape.pointers.includes(this.spaces[x][y]);
    },
    buildShapes(){
      const I = [
        this.spaces[0][this.colCenter],
        this.spaces[1][this.colCenter],
        this.spaces[2][this.colCenter],
        this.spaces[3][this.colCenter]
      ];
      const L = [
        this.spaces[0][this.colCenter],
        this.spaces[1][this.colCenter],
        this.spaces[2][this.colCenter],
        this.spaces[2][this.colCenter+1]
      ];
      const J = [
        this.spaces[0][this.colCenter],
        this.spaces[1][this.colCenter],
        this.spaces[2][this.colCenter],
        this.spaces[2][this.colCenter-1]
      ];
      const T = [
        this.spaces[0][this.colCenter-1],
        this.spaces[0][this.colCenter+1],
        this.spaces[0][this.colCenter],
        this.spaces[1][this.colCenter]
      ];
      const O = [
        this.spaces[0][this.colCenter],
        this.spaces[0][this.colCenter+1],
        this.spaces[1][this.colCenter],
        this.spaces[1][this.colCenter+1]
      ];
      const S = [
        this.spaces[0][this.colCenter],
        this.spaces[1][this.colCenter],
        this.spaces[1][this.colCenter+1],
        this.spaces[2][this.colCenter+1]
      ];
      const Z = [
        this.spaces[0][this.colCenter+1],
        this.spaces[1][this.colCenter+1],
        this.spaces[1][this.colCenter],
        this.spaces[2][this.colCenter]
      ];
      this.shapes = {I,L,J,T,O,S,Z}
    },
    buildSpaces(){
      let spacesArray = [];
      for (let i = 0; i < this.config.rows; ++i){
        let row = [];
        let prevSpace = null;
        for (let j = 0; j < this.config.columns; ++j){
          let spaceNode = this.createSpaceNode();
          spaceNode.left = prevSpace;
          row.push(spaceNode);
          prevSpace = spaceNode;
        }
        spacesArray.push(row);
      }

      // pass 2: set up, right and down if applicable
      // probably a much faster way of doing this, but for now...
      for (let i = 0; i < this.config.rows; ++i){
        for (let j = 0; j < this.config.columns; ++j){
          //set right
          if (j < this.config.columns - 1){
            spacesArray[i][j].right = spacesArray[i][j+1];
          }
          //set up
          if (i > 0){
            spacesArray[i][j].up = spacesArray[i-1][j];
          }
          //set down
          if (i < this.config.rows - 1){
            spacesArray[i][j].down = spacesArray[i+1][j];
          }
        }
      }
      this.spaces = spacesArray;
      this.spacesInitialized = true;
    },
    createRow(){

    },
    createSpaceNode(left = null, right = null, up = null, down = null){
      const space = {
        type: null,
        occupied: false,
        // adjacent spaces
        up,left,down,right
      };
      return Object.create(space);
    },
    setSpaceType(x,y,type = null){
      this.spaces[x][y].type = type;
    },
    handleKeydown(e) {
      switch (e.keyCode) {
        case 32:
          this.spawnShape();
          break;
        case 37:
          this.move('left');
          break;
        case 38:
          this.move('up'); // dev only
          break;
        case 39:
          this.move('right');
          break;
        case 40:
          this.move('down');
          break;
        case 82:
          this.loadQueue();
          break;
      }
    }
  },
  created() {
    this.buildSpaces();
    this.buildShapes();
  }
}
</script>

<style scoped lang="scss">
.board-wrapper{
  border: 2px solid blue;
  background: black;
}
.space{
  position:relative;
  width: 35px;
  height: 35px;
  border:1px solid #111;
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  &.I,&.T,&.Z,&.S,&.L,&.J,&.O{
    border:{
      top: 2px solid #ffffff75;
      left: 2px solid #ffffff75;
      bottom: 2px solid #000000;
      right: 2px solid #00000020;
    }
  }
  &.I{
    background-color: blue;
  }
  &.T{
    background-color: limegreen;
  }
  &.J{
    background-color: red;
  }
  &.L{
    background-color: cyan;
  }
  &.S{
    background-color: yellow;
  }
  &.Z{
    background-color: white;
  }
  &.O{
    background-color: purple;
  }
}
.start-button{
  z-index: 100;
  padding:.5rem 1rem;
  margin: 1rem;
  border:1px solid blue;
  transition: 100ms all;
  &:hover,&:focus{
    background-color: blue;
    color:black;
  }
}
</style>
