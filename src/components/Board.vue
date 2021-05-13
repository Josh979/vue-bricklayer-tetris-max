<template>
  <div class="self-center justify-self-center">
    <div class="flex justify-center align-middle relative">
      <div v-show="!started" class="align-middle flex absolute justify-center self-center">
        <button @click="startGame()" class="start-button text-2xl p-4 font-bold uppercase">Start Game</button>
      </div>
      <div v-if="spacesInitialized" class="board-wrapper">
        <div class="absolute top-1/2 text-4xl z-30  py-4 game-over-banner w-full text-center" v-if="!active">
          Game Over
          <div class="flex justify-center">
            <button class="text-sm py-1 rounded-md px-3 border mt-2" @click="restartGame()">Play again?</button>
          </div>
        </div>
        <div class="absolute top-1/2 text-4xl z-10  py-4 game-over-banner w-full text-center" v-if="paused">Paused</div>

        <div class="flex flex-col">
          <div v-for="(row, rIndex) in config.rows" class="relative flex" :key="`col${rIndex}`">
            <template v-if="rowIsBeingCleared(rIndex) || true">
              <div class="absolute transition-all bg-transparent w-full z-10 h-full" :class="rowIsBeingCleared(rIndex) ? 'bg-yellow-400': ''"></div>
            </template>
            <template v-if="rIndex > 1">
              <div v-for="(col, cIndex) in config.columns" class="space" :class="spaces[rIndex][cIndex].type"
                   :key="`space${cIndex},${rIndex}`">
                <template v-if="isOccupiedSpace(rIndex,cIndex)">
                  <div class="space" :class="spaces[rIndex][cIndex].occupied"></div>
                </template>
                <template v-if="isActiveShape(rIndex,cIndex)">
                  <div class="space" :class="activeShape.type"><span v-if="getDevPointers">{{activeShape.pointers.indexOf(spaces[rIndex][cIndex])}}</span></div>
                </template>
              </div>
            </template>
          </div>
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
      dev:{
        showPointers: true,
      },
      queue: null,
      started: false,
      active: true,
      paused: false,
      music: null,
      //spaces will be moved to store
      spaces:[],
      activeInterval: null,
      completedRowQueue: [],
      spacesInitialized: false,
      nextLevel: 2000,
      activeShape: {
        pointers: [], // use this instead of coords
        type: null,
        rotation: 0,
        coordinates: []
      },
      occupiedArea:[],
      shapes: {},
    }
  },

  computed:{
    ...mapGetters([
      "getShape",
      "getDevPointers",
      "getNextShape",
      "getScore",
      "getSpeed",
      "getQueue",
    ]),
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
      "increaseEliminatedRows",
      "addPoints",
      "increaseLevel",
      "increaseSpeed",
      "increaseShapesPlaced",
      "resetGame"
    ]),

    startGame(){
      this.started = true;
      //this.startMusic();
      this.loadQueue();
      this.loadQueue();
      this.spawnShape();
      this.startMusic();
      window.addEventListener('keydown', this.handleKeydown, null);
    },
    startMusic(){
      this.music = new Audio(require('@/assets/music/intro.aac'));
      this.music.play();
      this.music.loop = true;
    },
    move(direction){
      if (!this.paused){
        const length = this.activeShape.pointers.length;
        const validation = this.activeShape.pointers.filter((item) => {
          return item[direction] !== null && !item[direction].occupied;
        }).length;
        if (length === validation){
          this.activeShape.pointers = this.activeShape.pointers.map((x) => {
            return x[direction];
          })
          return true;
        } else {
          return false;
        }
      }
    },
    //rotateClockwise(){},
    //rotateCounterClockwise(){},
    setActiveInterval(){
      clearInterval(this.activeInterval);
      this.activeInterval = null;
      this.activeInterval = setInterval(() => {
        if (!this.move('down')){
          this.releaseShape();
        }
      },this.getSpeed)
    },
    spawnShape(){
      this.activeShape = this.buildActiveShape();
      this.setActiveInterval();
      },
    buildActiveShape(){
      this.processQueue();
      const type = this.getShape;
      const pointers = [...this.shapes[type]];
      const rotation = 0;
      return {type,pointers, rotation}
    },
    rotateShape(){
      if (!this.paused){
        switch (this.activeShape.type) {
          case 'I':
            this.rotateI();
            break;
          case 'O':
            /** Free dude! **/
            break;
          case 'S':
            this.rotateS();
            break;
          case 'Z':
            this.rotateZ();
            break;
          case 'L':
            this.rotateL();
            break;
          case 'J':
            this.rotateJ();
            break;
          case 'T':
            this.rotateT();
            break;
        }
      }
    },
    // have to walk the path since we could likely encounter a null
    // and only check for occupied at the final destination
    checkAvailableSpaceExists(node, nodePathArr){
      let pointer = node;
      let index = 0;
      while (pointer !== null){
        if (pointer[nodePathArr[index]] !== null){
          pointer = pointer[nodePathArr[index]];
          if (index === nodePathArr.length - 1){
            return !pointer['occupied'];
          } else {
            ++index;
          }
        } else {
          return false;
        }
      }
      return true;
    },
    // This is gonna be tedious...
    rotateI(){
      let shapePointers = this.activeShape.pointers;
      switch (this.activeShape.rotation) {
        case 0:
        case 2:
          if (this.checkAvailableSpaceExists(shapePointers[3],['left']) &&
              this.checkAvailableSpaceExists(shapePointers[2],['down','right','right']) &&
              this.checkAvailableSpaceExists(shapePointers[1],['down','down','right']) &&
              this.checkAvailableSpaceExists(shapePointers[0],['down','down','down'])){
            shapePointers[3] = shapePointers[3].left;
            shapePointers[2] = shapePointers[2].down.right.right;
            shapePointers[1] = shapePointers[1].down.down.right;
            shapePointers[0] = shapePointers[0].down.down.down
            ++this.activeShape.rotation;
          }
          break;
        case 1:
        case 3:
          if (this.checkAvailableSpaceExists(shapePointers[0],['up','up','up']) &&
              this.checkAvailableSpaceExists(shapePointers[1],['up','up','left']) &&
              this.checkAvailableSpaceExists(shapePointers[2],['up','left','left']) &&
              this.checkAvailableSpaceExists(shapePointers[3],['right'])){
            shapePointers[0] = shapePointers[0].up.up.up;
            shapePointers[1] = shapePointers[1].up.up.left;
            shapePointers[2] = shapePointers[2].up.left.left;
            shapePointers[3] = shapePointers[3].right;
            if (this.activeShape.rotation === 3){
              this.activeShape.rotation = 0;
            } else {
              ++this.activeShape.rotation;
            }
          }
          break;
      }
    },
    rotateS(){
      let shapePointers = this.activeShape.pointers;
      switch (this.activeShape.rotation) {
        case 0:
        case 2:
          if (this.checkAvailableSpaceExists(shapePointers[2],['right']) &&
              this.checkAvailableSpaceExists(shapePointers[1],['right']) &&
              this.checkAvailableSpaceExists(shapePointers[0],['down','down'])){
            shapePointers[2] = shapePointers[2].right;
            shapePointers[1] = shapePointers[1].right;
            shapePointers[0] = shapePointers[0].down.down
            ++this.activeShape.rotation;
          }
          break;
        case 1:
        case 3:
          if (this.checkAvailableSpaceExists(shapePointers[0],['up', 'up']) &&
              this.checkAvailableSpaceExists(shapePointers[1],['left']) &&
              this.checkAvailableSpaceExists(shapePointers[2],['left'])){
            shapePointers[0] = shapePointers[0].up.up;
            shapePointers[1] = shapePointers[1].left;
            shapePointers[2] = shapePointers[2].left;
            if (this.activeShape.rotation === 3){
              this.activeShape.rotation = 0;
            } else {
              ++this.activeShape.rotation;
            }
          }
          break;
      }
    },
    rotateZ(){
      let shapePointers = this.activeShape.pointers;
      switch (this.activeShape.rotation) {
        case 0:
        case 2:
          if (this.checkAvailableSpaceExists(shapePointers[2],['left']) &&
              this.checkAvailableSpaceExists(shapePointers[1],['left']) &&
              this.checkAvailableSpaceExists(shapePointers[0],['down','down'])){
            shapePointers[2] = shapePointers[2].left;
            shapePointers[1] = shapePointers[1].left;
            shapePointers[0] = shapePointers[0].down.down
            ++this.activeShape.rotation;
          }
          break;
        case 1:
        case 3:
          if (this.checkAvailableSpaceExists(shapePointers[0],['up', 'up']) &&
              this.checkAvailableSpaceExists(shapePointers[1],['right']) &&
              this.checkAvailableSpaceExists(shapePointers[2],['right'])){
            shapePointers[0] = shapePointers[0].up.up;
            shapePointers[1] = shapePointers[1].right;
            shapePointers[2] = shapePointers[2].right;
            if (this.activeShape.rotation === 3){
              this.activeShape.rotation = 0;
            } else {
              ++this.activeShape.rotation;
            }
          }
          break;
      }
    },
    rotateL(){
      let shapePointers = this.activeShape.pointers;
      switch (this.activeShape.rotation) {
        case 0:
          if (this.checkAvailableSpaceExists(shapePointers[1],['left']) &&
              this.checkAvailableSpaceExists(shapePointers[2],['left']) &&
              this.checkAvailableSpaceExists(shapePointers[3],['up']) &&
              this.checkAvailableSpaceExists(shapePointers[0],['down'])
          ){
            shapePointers[1] = shapePointers[1].left;
            shapePointers[2] = shapePointers[2].left;
            shapePointers[3] = shapePointers[3].up;
            shapePointers[0] = shapePointers[0].down;
            ++this.activeShape.rotation;
          }
          break;
        case 1:
          if (this.checkAvailableSpaceExists(shapePointers[2],['right']) &&
              this.checkAvailableSpaceExists(shapePointers[1],['up']) &&
              this.checkAvailableSpaceExists(shapePointers[0],['up']) &&
              this.checkAvailableSpaceExists(shapePointers[3],['left'])
          ){
            shapePointers[2] = shapePointers[2].right;
            shapePointers[1] = shapePointers[1].up;
            shapePointers[0] = shapePointers[0].up;
            shapePointers[3] = shapePointers[3].left;
            ++this.activeShape.rotation;
          }
          break;
        case 2:
          if (this.checkAvailableSpaceExists(shapePointers[1],['down','down']) &&
              this.checkAvailableSpaceExists(shapePointers[2],['right']) &&
              this.checkAvailableSpaceExists(shapePointers[3],['right']) &&
              this.checkAvailableSpaceExists(shapePointers[0],['down','down'])
          ){
            shapePointers[1] = shapePointers[1].down.down;
            shapePointers[2] = shapePointers[2].right;
            shapePointers[3] = shapePointers[3].right;
            shapePointers[0] = shapePointers[0].down.down;
            ++this.activeShape.rotation;
          }
          break;

        case 3:
          // reset pointer positions back to rotation 0
          if (this.checkAvailableSpaceExists(shapePointers[1],['up','up']) &&
              this.checkAvailableSpaceExists(shapePointers[1],['right']) &&
              this.checkAvailableSpaceExists(shapePointers[0],['left'])
          ){
            shapePointers[0] = shapePointers[0].up.up;
            shapePointers[1] = shapePointers[0].down;
            shapePointers[2] = shapePointers[1].down;
            shapePointers[3] = shapePointers[2].right;
            this.activeShape.rotation = 0;
          }
          break;
      }
    },
    rotateJ(){
      let shapePointers = this.activeShape.pointers;
      switch (this.activeShape.rotation) {
        case 0:
          if (this.checkAvailableSpaceExists(shapePointers[2],['right']) &&
              this.checkAvailableSpaceExists(shapePointers[1],['left'])
          ){
            shapePointers[1] = shapePointers[1].left;
            shapePointers[0] = shapePointers[2].right;
            ++this.activeShape.rotation;
          }
          break;
        case 1:
          if (this.checkAvailableSpaceExists(shapePointers[0],['up', 'up']) &&
              this.checkAvailableSpaceExists(shapePointers[2],['up']) &&
              this.checkAvailableSpaceExists(shapePointers[2],['up','up'])
          ){
            shapePointers[0] = shapePointers[0].up.up;
            shapePointers[2] = shapePointers[0].left;
            shapePointers[1] = shapePointers[1].right;
            shapePointers[3] = shapePointers[3].right;
            ++this.activeShape.rotation;
          }
          break;
        case 2:
          if (this.checkAvailableSpaceExists(shapePointers[1],['left']) &&
              this.checkAvailableSpaceExists(shapePointers[3],['right']) &&
              this.checkAvailableSpaceExists(shapePointers[0],['down'])
          ){
            shapePointers[1] = shapePointers[1].left;
            shapePointers[3] = shapePointers[3].right;
            shapePointers[2] = shapePointers[2].down;
            shapePointers[0] = shapePointers[0].down;
            ++this.activeShape.rotation;
          }
          break;

        case 3:
          // reset pointer positions back to rotation 0
          if (this.checkAvailableSpaceExists(shapePointers[1],['down']) &&
              this.checkAvailableSpaceExists(shapePointers[2],['down']) &&
              this.checkAvailableSpaceExists(shapePointers[2],['up'])
          ){
            shapePointers[2] = shapePointers[2].down;
            shapePointers[3] = shapePointers[2].left;
            shapePointers[1] = shapePointers[2].up;
            shapePointers[0] = shapePointers[1].up;
            this.activeShape.rotation = 0;
          }
          break;
      }
    },
    rotateT(){
      let shapePointers = this.activeShape.pointers;
      switch (this.activeShape.rotation) {
        case 0:
          if (this.checkAvailableSpaceExists(shapePointers[2],['up'])){
            shapePointers[1] = shapePointers[2].up;
            ++this.activeShape.rotation;
          }
          break;
        case 1:
          if (this.checkAvailableSpaceExists(shapePointers[2],['right'])){
            shapePointers[3] = shapePointers[2].right;
            ++this.activeShape.rotation;
          }
          break;
        case 2:
          if (this.checkAvailableSpaceExists(shapePointers[2],['down'])){
            shapePointers[0] = shapePointers[2].down;
            ++this.activeShape.rotation;
          }
          break;

        case 3:
          // reset pointer positions back to rotation 0
          if (this.checkAvailableSpaceExists(shapePointers[2],['left'])){
            shapePointers[0] = shapePointers[2].left;
            shapePointers[3] = shapePointers[2].down;
            shapePointers[1] = shapePointers[2].right;
            this.activeShape.rotation = 0;
          }
          break;
      }
    },
    releaseShape(){
      if (!this.paused && this.active){
        if (this.activeInterval){
          clearInterval(this.activeInterval);
        }
        //hard drop score appears to be 1 point for every row passed between the lowest space of the shape and where it's lowest space comes to rest.
        let i = 0;
        while(i < 20){
          if(this.move('down') === false){
            break;
          }
          ++i;
        }
        this.addPoints(i);
        this.increaseShapesPlaced();

        this.activeShape.pointers.forEach((pointer) => {
          pointer.occupied = this.activeShape.type;
        })
        this.rowEliminationCheck();
        this.checkLevel();

        // check if threshold passed
        if (this.spaces[1].find(item => item.occupied !== false)){
          this.gameOver();
        }
        if (this.active){
          this.spawnShape();
        }
      }
    },
    gameOver() {
      if (this.music !== null){
        this.music.pause();
      }
      clearInterval(this.activeInterval);
      this.updateHighScore();
      this.activeShape.pointers = [];
      this.active = false;
    },
    restartGame(){
      this.resetGame();
      this.spaces.forEach((row) => {
        row.forEach((space) => {
          space.occupied = false;
        })
      });
      this.active = true;
      this.startGame();
    },
    togglePause(){
      if (this.activeInterval !== null){
        clearInterval(this.activeInterval);
        this.music.pause();
        this.activeInterval = null;
      } else {
        this.music.play();
        this.setActiveInterval();
      }
      this.paused = !this.paused;
    },
    levelUp(){
      // level 2 at score 2000?
      // level 3 at score 4500?
      // level 4 at score 6000?
      // level 5 between 7000-7900?
      // level 6 at 9500?
      this.increaseSpeed();
      this.increaseLevel();
      // const audio = new Audio(require('@/assets/sounds/levelup.mp3'));
      // audio.play();
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
    isOccupiedSpace(x,y){
      return this.spaces[x][y].occupied;
    },
    isActiveShape(x,y){
      return this.activeShape.pointers.includes(this.spaces[x][y]);
    },
    rowIsBeingCleared(rowIndex){
        return (this.completedRowQueue.indexOf(rowIndex) !== -1)
    },
    checkLevel(){
      if (this.getScore >= this.nextLevel){
        this.levelUp();
        this.nextLevel += 2000;
      }
    },
    rowEliminationCheck(){
      //this can probably be optimized by storing a pointer to each row for lookups
      this.completedRowQueue = [];
      for (let i = 0; i < this.spaces.length; ++i){
        if (!this.spaces[i].find((space) => space.occupied === false)){
          this.completedRowQueue.push(i);
        }
      }
      if (this.completedRowQueue.length){
        return this.eliminateRows(this.completedRowQueue);
      }
      return false;
    },
    // pass array of indexes of rows to clear
    eliminateRows(arr){

      // clear rows
      arr.forEach((row) => {
        this.spaces[row].forEach((space) => {
          space.occupied = false;
        })
      })

      //for each cleared row, starting at the cleared row with the lowest index, move all pointer values with a lower index down 1.
      arr.forEach((row) => {
        for (let i = row; i > 0; --i){
          // eslint-disable-next-line no-unused-vars
          this.spaces[i].forEach((space) => {
            space.occupied = space.up.occupied;
          })
        }
      })

      // updated rows stat
      this.increaseEliminatedRows(arr.length)
      if (arr.length){
        // score is 1000 for a 4 row clear
        // score is 600 for a 3 row clear
        // score is 300 for a 2 row clear
        // score is 100 for a single row clear
        let rowEliminationPoints = 0;
        switch(arr.length){
          case 1:
            rowEliminationPoints = 100;
            break;
          case 2:
            rowEliminationPoints = 300;
            break;
          case 3:
            rowEliminationPoints = 600;
            break;
          case 4:
            rowEliminationPoints = 1000;
            break;
          default:
            rowEliminationPoints = 0;
            break;
        }
        this.addPoints(rowEliminationPoints);
        setTimeout(() => {
          this.completedRowQueue = [];
        },100)
      }

      return true;
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
          this.releaseShape();
          break;
        case 37:
          this.move('left');
          break;
          // case 38:
          //   this.move('up'); // dev only
          //   break;
        case 39:
          this.move('right');
          break;
        case 40:
          this.move('down');
          break;
        case 80:
          this.togglePause();
          break;
        case 82:
          this.rotateShape();
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
  .game-over-banner{
    background: blue;
  }
}
.space{
  position:relative;
  width: 32px;
  height: 32px;
  border:1px solid #111;
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  &.sphere{
    &.I,&.T,&.Z,&.S,&.L,&.J,&.O {
      border-radius: 50px;
    }
  }
  &.I,&.T,&.Z,&.S,&.L,&.J,&.O{
    border-radius: 4px;
    border:{
      top: 2px solid #ffffff75;
      left: 2px solid #ffffff75;
      bottom: 2px solid #00000090;
      right: 2px solid #00000020;
    }
  }
  &.I{
    background: linear-gradient(to top left, darkblue 0%, blue 75%);
    //border:{
    //  top: 2px solid transparentize(lighten(blue,25),0.1);
    //  left: 2px solid transparentize(lighten(blue,25),0.1);
    //  bottom: 2px solid transparentize(darken(blue,15),0.1);
    //  right: 2px solid transparentize(darken(blue,25),0.1);
    //}
    //background-color: blue;
  }
  &.T{
    background: linear-gradient(to top left, darkgreen 0%, lime 75%);
    //background-color: lime;
  }
  &.J{
    //background-color: red;
    background: linear-gradient(to top left, darkred 0%, red 75%);
  }
  &.L{
    //background-color: cyan;
    background: linear-gradient(to top left, darkcyan 0%, cyan 75%);

  }
  &.S{
    //background-color: yellow;
    background: linear-gradient(to top left, darken(yellow, 15) 0%, yellow 75%);
  }
  &.Z{
    background: linear-gradient(to top left, grey 0%, white 75%);
    //background-color: white;
    //background-image: url("/img/patterns/shapes/z.png");
  }
  &.O{
    //background-color: darkmagenta;
    background: linear-gradient(to top left, indigo 0%, darkmagenta 75%);
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
