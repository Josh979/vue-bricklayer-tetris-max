# vue-bricklayer

This is my take on remaking Bricklayer/Tetris Maxx which was released in 1994.  This was one of my favorite Mac OS games to play as a kid, and I decided it would be a fun project to remake using Vue 3. It's still in the initial stages, but stay tuned for the playable version.

### Main Task List:
- [x] Create game dimensions and grid system (10x20)
- [ ] Create Responsive UI/Layout
- [x] Create game shapes 
- [x] Create next shape queue system
- [ ] Create game clock system
  - [ ] Shape taken from queue and spawned
  - [ ] New Shape added to queue
  - [ ] Shape movement
  - [ ] Shape released
  - [ ] Score update check
  - [ ] Row elimination check
  - [ ] Score update check
  - [ ] Grid overflow check
  - [ ] Repeat
- [ ] Create controls logic
  - [x] Move Left
  - [x] Move Right
  - [x] Move Down 
  - [ ] Hard Drop (space)
- [x] Create shape rotation logic
- [ ] Create row elimination logic
- [ ] Create leveling logic
- [ ] Soundtrack & permissions

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run test:unit
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
