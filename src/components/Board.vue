<template>
  <div class="justify-self-start">
    <div class="flex justify-center align-middle relative overflow-hidden">
     <div v-show="!started" class="align-middle flex absolute justify-center self-center z-30 text-xl">
       <div class="flex flex-col justify-items-end">
           <div>
             <div class="text-sm"> Remade vith Vue.js </div>
             <div class="text-4xl uppercase font-bold">Bricklayer</div>
             <div class="text-4xl uppercase font-bold mb-10">Tetris Max</div>
             <div class="startText">Press Enter To Start</div>
           </div>

<!--           <div class="mt-10">-->
<!--             <div class="text-xs"> Music By Peter Wagner </div>-->
<!--             <div class="text-xs"> Original Game By Steve Chamberlin </div>-->
<!--           </div>-->

        <!--         <div class="text-sm bg-white text-black py-2 my-3 rounded">Settings</div>-->
        <!--         <div class="text-sm bg-white text-black py-2 my-3 rounded">Controls</div>-->
       </div>
      </div>
      <div class="board-border p-3">
        <div v-if="spacesInitialized" class="board-wrapper" :class="started && !paused && active ? 'cursor-none' : ''">
          <div class="absolute top-1/2 text-4xl z-30  py-4 game-over-banner w-full text-center" v-if="!active">
            Game Over
            <div class="flex justify-center">
              <button class="text-sm py-1 rounded-md px-3 border mt-2" @click="restartGame()">Play again</button>
            </div>
          </div>
          <div class="absolute top-1/2 text-4xl z-30  py-4 game-over-banner w-full text-center" v-if="paused">Paused</div>

          <div class="flex flex-col">
            <div v-for="(row, rIndex) in config.rows" class="relative flex" :key="`col${rIndex}`">
              <div v-if="hasScoreDisplay(rIndex)" class="w-full absolute scoreText z-30"> {{hasScoreDisplay(rIndex) ? hasScoreDisplay(rIndex)[1] : '1000'}}</div>

              <template v-if="rowIsBeingCleared(rIndex)">
                <div class="absolute transition-all bg-transparent w-full z-10 h-full overflow-hidden" :class="rowIsBeingCleared(rIndex) ? 'zapwoosh': ''">
                  <div v-if="rowIsBeingCleared(rIndex) || true">
                    <svg class="w-full mt-2">
                      <use href="#zapper"></use>
                    </svg>
                  </div>
                </div>
              </template>
              <template v-if="rIndex > 1">
                <div v-for="(col, cIndex) in config.columns" class="space" :class="`${spaces[rIndex][cIndex].type ?? '' }`"
                     :key="`space${cIndex},${rIndex}`">
                  <template v-if="isOccupiedSpace(rIndex,cIndex)">
                    <div class="space" :class="`${spaces[rIndex][cIndex].occupied} ${altTheme ? 'alt-theme' : ''} ${paused ? 'paused' : ''}`"></div>
                  </template>
                  <template v-if="isActiveShape(rIndex,cIndex)">
                    <div class="space" :class="`${activeShape.type} ${altTheme ? 'alt-theme' : ''} ${paused ? 'paused' : ''}`"><span v-if="getDevPointers">{{activeShape.pointers.indexOf(spaces[rIndex][cIndex])}}</span></div>
                  </template>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import {Howl} from 'howler';

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
      audio:{
        music: null,
        gameOver: null,
        soundFX:{
          softPlacement:null,
          hardDrop: null,
          levelUp: null,
        }
      },
      //spaces will be moved to store
      spaces:[],
      activeInterval: null,
      spacesInitialized: false,
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
      "getNextLevelAt",
      "getSpeed",
      "getQueue",
      "scoreRowQueue",
      "completedRowQueue",
      "altTheme"
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
  created() {
    this.buildSpaces();
    this.buildShapes();
    this.loadAudio();
    window.addEventListener('keydown', this.startGameListener,null);
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
      "resetGame",
      "addToScoreQueue",
      "addToCompletedRowQueue",
      "clearCompletedRowQueue"

    ]),

    startGame(){
        this.startMusic();
        this.started = true;
        this.loadQueue();
        this.loadQueue();
        this.spawnShape();
        //remove startgame listener
        window.removeEventListener('keydown',this.startGameListener);

        window.addEventListener('keydown', this.handleKeydown, null);
    },
    gameOver() {
      this.audio.music.stop();
      this.audio.gameOver.play();

      clearInterval(this.activeInterval);
      this.updateHighScore();
      this.activeShape.pointers = [];
      this.active = false;
      window.addEventListener('keydown', this.restartGameListener, null);

    },
    restartGame(){
      this.resetGame();
      this.spaces.forEach((row) => {
        row.forEach((space) => {
          space.occupied = false;
        })
      });
      this.active = true;
      window.removeEventListener('keydown',this.restartGameListener);
      this.startGame();
    },
    togglePause(){
      if (this.active){
        if (this.activeInterval !== null){
          clearInterval(this.activeInterval);
          this.audio.music.pause();
          this.activeInterval = null;
        } else {
          this.audio.music.play();
          this.setActiveInterval();
        }
        this.paused = !this.paused;
      }
    },
    loadAudio(){
      // Music
      this.audio.music = new Howl({
        src: [require('@/assets/music/dist/loop-low.mp3')],
        //autoplay: true,
        loop: true,
        //volume: 0.5,
      });
      // this.audio.music = new Audio(require('@/assets/music/loop.aac'));
      // this.audio.music.loop = true;
      this.audio.gameOver = new Howl({
        src: [require('@/assets/sounds/game-over.wav')],
      });
      // Sound FXs
      this.audio.soundFX.softPlacement = new Howl({
        src: [require('@/assets/sounds/dist/clink.mp3')],
      });
      this.audio.soundFX.maxClear = new Howl({
        src: [require('@/assets/sounds/max-clear.wav')],
      });
      this.audio.soundFX.lineClear = new Howl({
        src: [require('@/assets/sounds/blast-hit-echo.wav')],
        volume: 0.9,
      });
      this.audio.soundFX.hardDrop = new Howl({
        src: [require('@/assets/sounds/wood-hit-hard-trimmed.wav')],
      });
      this.audio.soundFX.levelUp = new Howl({
        src: [require('@/assets/sounds/dist/levelup.mp3')],
        volume: 0.8,
      });
    },
    startMusic(){
      if (this.audio.gameOver !== null){
        this.audio.gameOver.stop();
      }
      this.audio.music.play();
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
    rotateShapeCC(){
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
            this.rotateLCC();
            break;
          case 'J':
            this.rotateJCC();
            break;
          case 'T':
            this.rotateTCC();
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
    rotateLCC(){
      let shapePointers = this.activeShape.pointers;
      switch (this.activeShape.rotation) {
        case 0:
          if (this.checkAvailableSpaceExists(shapePointers[3],['up']) &&
              this.checkAvailableSpaceExists(shapePointers[2],['right']) &&
              this.checkAvailableSpaceExists(shapePointers[1],['down','left']) &&
              this.checkAvailableSpaceExists(shapePointers[0],['down','down'])
          ){
            shapePointers[3] = shapePointers[3].up;
            shapePointers[2] = shapePointers[2].right;
            shapePointers[1] = shapePointers[1].down.left;
            shapePointers[0] = shapePointers[0].down.down;
            this.activeShape.rotation = 3;
          }
          break;
        case 1:
          if (this.checkAvailableSpaceExists(shapePointers[0],['up']) &&
              this.checkAvailableSpaceExists(shapePointers[2],['right']) &&
              this.checkAvailableSpaceExists(shapePointers[3],['left']) &&
              this.checkAvailableSpaceExists(shapePointers[3],['down'])
          ){
            shapePointers[0] = shapePointers[0].up;
            shapePointers[1] = shapePointers[1].right;
            shapePointers[2] = shapePointers[2].right;
            shapePointers[3] = shapePointers[3].down;
            --this.activeShape.rotation;
          }
          break;
        case 2:
          if (this.checkAvailableSpaceExists(shapePointers[1],['down']) &&
              this.checkAvailableSpaceExists(shapePointers[0],['down']) &&
              this.checkAvailableSpaceExists(shapePointers[2],['left']) &&
              this.checkAvailableSpaceExists(shapePointers[3],['right'])
          ){
            shapePointers[3] = shapePointers[3].right;
            shapePointers[2] = shapePointers[2].left;
            shapePointers[0] = shapePointers[0].down;
            shapePointers[1] = shapePointers[1].down;
            --this.activeShape.rotation;
          }
          break;

        case 3:
          // reset pointer positions back to rotation 0
          if (this.checkAvailableSpaceExists(shapePointers[1],['up','up']) &&
              this.checkAvailableSpaceExists(shapePointers[0],['up','up']) &&
              this.checkAvailableSpaceExists(shapePointers[2],['left']) &&
              this.checkAvailableSpaceExists(shapePointers[3],['left'])
          ){
            shapePointers[0] = shapePointers[0].up.up;
            shapePointers[1] = shapePointers[1].up.up;
            shapePointers[2] = shapePointers[2].left;
            shapePointers[3] = shapePointers[3].left;
            --this.activeShape.rotation;
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
    rotateJCC(){
      let shapePointers = this.activeShape.pointers;
      switch (this.activeShape.rotation) {
        case 0:
          if (this.checkAvailableSpaceExists(shapePointers[3],['right','right']) &&
              this.checkAvailableSpaceExists(shapePointers[0],['down','right']) &&
              this.checkAvailableSpaceExists(shapePointers[2],['up']) &&
              this.checkAvailableSpaceExists(shapePointers[1],['left'])
          ){
            shapePointers[3] = shapePointers[3].right.right;
            shapePointers[0] = shapePointers[0].down.right;
            shapePointers[2] = shapePointers[2].up;
            shapePointers[1] = shapePointers[1].left;
            this.activeShape.rotation = 3;
          }
          break;
        case 1:
          if (
              this.checkAvailableSpaceExists(shapePointers[2],['up','up']) &&
              this.checkAvailableSpaceExists(shapePointers[1],['right'])
          ){
            shapePointers[0] = shapePointers[2].up.up;
            shapePointers[1] = shapePointers[1].right;
            --this.activeShape.rotation;
          }
          break;
        case 2:
          if (this.checkAvailableSpaceExists(shapePointers[3],['left']) &&
              this.checkAvailableSpaceExists(shapePointers[1],['left']) &&
              this.checkAvailableSpaceExists(shapePointers[2],['down','down']) &&
              this.checkAvailableSpaceExists(shapePointers[0],['down','down'])
          ){
            shapePointers[3] = shapePointers[3].left;
            shapePointers[1] = shapePointers[1].left;
            shapePointers[2] = shapePointers[2].down.down;
            shapePointers[0] = shapePointers[0].down.down;
            --this.activeShape.rotation;
          }
          break;
        case 3:
          // reset pointer positions back to rotation 0
          if (this.checkAvailableSpaceExists(shapePointers[2],['up']) &&
              this.checkAvailableSpaceExists(shapePointers[0],['up']) &&
              this.checkAvailableSpaceExists(shapePointers[1],['right']) &&
              this.checkAvailableSpaceExists(shapePointers[3],['left'])
          ){
            shapePointers[2] = shapePointers[2].up;
            shapePointers[0] = shapePointers[0].up;
            shapePointers[1] = shapePointers[1].right;
            shapePointers[3] = shapePointers[3].left;
            --this.activeShape.rotation;
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
    rotateTCC(){
      let shapePointers = this.activeShape.pointers;
      switch (this.activeShape.rotation) {
        case 0:
          if (this.checkAvailableSpaceExists(shapePointers[2],['up'])){
            shapePointers[1] = shapePointers[2].up;
            shapePointers[3] = shapePointers[2].right;
            shapePointers[0] = shapePointers[2].down;
            this.activeShape.rotation = 3;
          }
          break;
        case 1:
          if (this.checkAvailableSpaceExists(shapePointers[2],['right'])){
            shapePointers[1] = shapePointers[2].right;
            --this.activeShape.rotation;
          }
          break;
        case 2:
          if (this.checkAvailableSpaceExists(shapePointers[2],['down'])){
            shapePointers[3] = shapePointers[2].down;
            --this.activeShape.rotation;
          }
          break;

        case 3:
          // reset pointer positions back to rotation 0
          if (this.checkAvailableSpaceExists(shapePointers[2],['left'])){
            shapePointers[0] = shapePointers[2].left;
            --this.activeShape.rotation;
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

        if (i > 0){
          this.audio.soundFX.hardDrop.play();
        } else {
          this.audio.soundFX.softPlacement.play();
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
    levelUp(){
      // level 2 at score 2000?
      // level 3 at score 4500?
      // level 4 at score 6000?
      // level 5 between 7000-7900?
      // level 6 at 9500?
      this.increaseSpeed();
      this.increaseLevel();
      this.audio.soundFX.levelUp.play();
    },
    updateHighScore(){
      if (localStorage.getItem('highscore') < this.score){
        localStorage.setItem('highscore', this.score);
      }
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
    hasScoreDisplay(rowIndex){
      return (this.scoreRowQueue.find(item => item[0] === rowIndex))
    },
    checkLevel(){
      if (this.getScore >= this.getNextLevelAt){
        this.levelUp();
      }
    },
    rowEliminationCheck(){
      //this can probably be optimized by storing a pointer to each row for lookups
      this.clearCompletedRowQueue();
      for (let i = 0; i < this.spaces.length; ++i){
        if (!this.spaces[i].find((space) => space.occupied === false)){
          this.addToCompletedRowQueue(i);
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
            this.audio.soundFX.lineClear.play();
            break;
          case 2:
            rowEliminationPoints = 300;
            this.audio.soundFX.lineClear.play();
            setTimeout(() => {
              this.audio.soundFX.lineClear.play();
            },25)
            break;
          case 3:
            rowEliminationPoints = 600;
            this.audio.soundFX.lineClear.play();
            setTimeout(() => {
              this.audio.soundFX.lineClear.play();
            },25)
            setTimeout(() => {
              this.audio.soundFX.lineClear.play();
            },50)
            break;
          case 4:
            rowEliminationPoints = 1000;
            this.audio.soundFX.lineClear.play();
            this.audio.soundFX.maxClear.play();
            setTimeout(() => {
              this.audio.soundFX.lineClear.play();
            },25)
            setTimeout(() => {
              this.audio.soundFX.lineClear.play();
            },50)
            setTimeout(() => {
              this.audio.soundFX.lineClear.play();
            },75)
            break;
          default:
            rowEliminationPoints = 0;
            break;
        }
        this.addToScoreQueue([Math.min(...arr),rowEliminationPoints]);

        this.addPoints(rowEliminationPoints);
        setTimeout(() => {
          this.clearCompletedRowQueue();
        },200)

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
    startGameListener(e){
      if (!this.started){
        if (e.code === 'Enter') {
          this.startGame();
        }
      }
    },
    restartGameListener(e){
      if (e.code === 'Enter') {
        this.restartGame();
      }
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
        case 69:
          this.rotateShapeCC();
          break;
      }
    }
  },
}
</script>

<style scoped lang="scss">
.cursor-none{
  cursor:none;
}
.board-border{
  border-radius: 3px;
  border:{
    top: 2px solid #999;
    left: 2px solid #999;
  }
  background: #777;
}
.board-wrapper{
  border: 1px solid #555;
  background: black;
  position:relative;
  border:{
    right: 2px solid #999;
    bottom: 2px solid #999;
  }

  .game-over-banner{
    @apply mx-auto;
    max-width:100%;
    overflow: hidden;
    button{
      &:hover{
        background:white;
        color:blue;
      }
    }
    background: linear-gradient(300deg, blue 20%,lime 100%);
    //background: blue;
  }
}
.space{
  &.paused{
    opacity:0.25;
    filter: grayscale(1);
    transition: 1500ms all;
  }
  position:relative;
  width: 32px;
  height: 32px;
  border:1px solid #111;
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  &.alt-theme{
    &.L{
      background: linear-gradient(to top left, #a12600 0%, #ff6b1a 75%);
    }
    &.S{
      background: linear-gradient(to top left, darken(hotpink, 25) 0%, hotpink 75%);
    }
  }
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
    background: linear-gradient(to top left, #030395 0%, #063aff 75%);
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
    //background: linear-gradient(to top left, #a12600 0%, #ff6b1a 75%);

  }
  &.S{
    //background-color: yellow;
    background: linear-gradient(to top left, darken(yellow, 15) 0%, yellow 75%);
    //background: linear-gradient(to top left, darken(hotpink, 25) 0%, hotpink 75%);

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
.zapwoosh{
 background: linear-gradient(to top, transparent 25%, #ffffff75 50%, transparent 75%), linear-gradient(to top, transparent 25%, #ffffff75 50%, transparent 75%);
  transform: scaleX(0);
  animation: zapTransition 50ms linear forwards;
}
.scoreText{
  transform: translateY(0%);
  @apply text-xl text-right pr-3;
  animation: scoreTextAnimation 1s linear forwards;
}

.startText{
  animation: startTextScroll 2s alternate infinite;
}

@keyframes startTextScroll {
  0%{
    opacity:0
  }
  100%{
    opacity:1
  }

}

@keyframes scoreTextAnimation {
  0%{
    transform: translateY(0%);
    opacity:0;
  }
  20%{
    opacity:1;
  }
  100%{
    transform: translateY(-500%);
    opacity:0;
  }

}
@keyframes zapTransition {
  0%{
    transform: scaleX(0);
  }
  100%{
    transform: scaleX(1);
  }

}
</style>
