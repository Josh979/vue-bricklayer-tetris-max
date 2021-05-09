<template>
  <div class="self-center justify-self-center">
    <div class="flex justify-center align-middle relative">
      <div v-show="!started" class="align-middle flex absolute justify-center self-center">
        <button @click="startGame()" class="start-button text-2xl p-4 font-bold uppercase">Start Game</button>
      </div>
      <div v-if="spacesInitialized" class="board-wrapper">
        <div class="flex flex-col">
          <div v-for="(row, rIndex) in config.rows" class="flex" :key="`col${rIndex}`" >
            <template v-if="rIndex > 1">
              <div v-for="(col, cIndex) in config.columns" class="space" :class="spaces[rIndex][cIndex].type" :key="`space${cIndex},${rIndex}`">
                <span>{{spaces[rIndex][cIndex].occupied ? 'y' : ''}}</span>
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
import {mapGetters} from 'vuex';

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
      shapes: {
        I: [],
        L: []
      },
    }
  },

  computed:{
    ...mapGetters([
      "getNextShape",
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
      return Math.ceil(this.config.columns / 2);
    }
  },

  methods:{
    startGame(){
      this.started = true;
      window.addEventListener('keydown', this.handleKeydown, null);
    },
    moveLeft(){
      this.move(-1,0);
    },
    moveRight(){
      this.move(1,0);
    },
    moveUp(){
      this.move(0,-1);
    },
    moveDown(){
      this.move(0,1);
    },
    rotateClockwise(){},
    rotateCounterClockwise(){},
    spawnShape(){
      this.activeShape = this.buildActiveShape();
    },
    buildActiveShape(){
      const type = this.getNextShape;
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
        this.spaces[this.colCenter][0],
        this.spaces[this.colCenter][1],
        this.spaces[this.colCenter][2],
        this.spaces[this.colCenter][3]
      ];
      const L = [
        this.spaces[this.colCenter][0],
        this.spaces[this.colCenter][1],
        this.spaces[this.colCenter][2],
        this.spaces[this.colCenter][3]
      ];
      this.shapes = {I,L}
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
        case 37:
          this.moveLeft();
          break;
        case 38:
          this.moveUp('up'); // for dev only
          break;
        case 39:
          this.moveRight();
          break;
        case 40:
          this.moveDown();
          break;
      }
    }
  },
  created() {
    this.buildSpaces();
    this.buildShapes();
    this.spawnShape();
    this.activeShape.pointers = this.activeShape.pointers.map((x) => {
      return x.right;
    })
  }
}
</script>

<style lang="scss">
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
      right: 2px solid #000000;
    }
  }
  &.I{
    background-color: blue;
  }
  &.T{
    background-color: green;
  }
  &.S{
    background-color: white;
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
