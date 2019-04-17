// create a new scene
let gameScene = new Phaser.Scene('Game');

// some parameters for our scene
gameScene.init = function() {
  // game stats
  this.stats = {
    health: 100,
    fun: 100
  };
};

// load asset files for our game
gameScene.preload = function() {

  // load assets
  this.load.image('backyard', 'assets/images/backyard.png');
  this.load.image('apple', 'assets/images/apple.png');
  this.load.image('candy', 'assets/images/candy.png');
  this.load.image('rotate', 'assets/images/rotate.png');
  this.load.image('toy', 'assets/images/rubber_duck.png');

  // load spritesheet
  this.load.spritesheet('pet', 'assets/images/pet.png', {
    frameWidth: 97,
    frameHeight: 83,
    margin: 1,
    spacing: 1
  });
};

// executed once, after assets were loaded
gameScene.create = function() {

  // game background
  let bg = this.add.sprite(0, 0, 'backyard').setInteractive();
  bg.setOrigin(0,0);

  // event listener for the background
  bg.on('pointerdown', this.placeItem, this);

  this.pet = this.add.sprite(100, 200, 'pet', 0).setInteractive();

  // make pet draggable
  this.input.setDraggable(this.pet);

  // follow pointer (mouse/finger) when dragging
  this.input.on('drag', function(pointer, gameObject, dragX, dragY){
    // make sprite be located at the coordinates of the dragging
    gameObject.x = dragX;
    gameObject.y = dragY;
  });

  // create ui
  this.createUi();

};

// create ui
gameScene.createUi = function() {
  // buttons
  this.appleBtn = this.add.sprite(72, 570, 'apple').setInteractive();
  this.appleBtn.customStats = {health: 20, fun: 0};
  this.appleBtn.on('pointerdown', this.pickItem);

  this.candyBtn = this.add.sprite(144, 570, 'candy').setInteractive();
  this.candyBtn.customStats = {health: -10, fun: 10};
  this.candyBtn.on('pointerdown', this.pickItem);

  this.toyBtn = this.add.sprite(216, 570, 'toy').setInteractive();
  this.toyBtn.customStats = {health: 0, fun: 15};
  this.toyBtn.on('pointerdown', this.pickItem);

  this.rotateBtn = this.add.sprite(288, 570, 'rotate').setInteractive();
  this.rotateBtn.customStats = {fun: 20};
  this.rotateBtn.on('pointerdown', this.rotatePet);

  // array with all buttons
  this.buttons = [this.appleBtn, this.candyBtn, this.toyBtn, this.rotateBtn];

  // ui is not blocked
  this.uiBlocked = false;

  // refresh ui
  this.uiReady();
};

// rotate pet
gameScene.rotatePet = function() {

  // the ui can't be blocked in order to rotate
  if(this.scene.uiBlocked) return;

  // make sure the ui is ready
  this.scene.uiReady();

  // block the ui
  this.scene.uiBlocked = true;

  // dim the rotate icon
  this.alpha = 0.5;

  let scene = this.scene;

  // rotation tween
  let rotateTween = this.scene.tweens.add({
    targets: this.scene.pet,
    duration: 600,
    angle: 720,
    pause: false,
    callbackScope: this,
    onComplete: function(tween, sprites) {
      // increase fun
      this.scene.stats.fun += this.customStats.fun;

      // set UI to ready
      this.scene.uiReady();

      console.log(this.scene.stats);
    }
  });

  console.log('we are rotating the pet!');
};

// pick item
gameScene.pickItem = function() {

  // the ui can't be blocked in order to select an item
  if(this.scene.uiBlocked) return;

  // make sure the ui is ready
  this.scene.uiReady();

  // select item
  this.scene.selectedItem = this;

  // change transparency
  this.alpha = 0.5;

  console.log('we are picking ' + this.texture.key);
};

// set ui to "ready"
gameScene.uiReady = function() {
  // nothing is being selected
  this.selectedItem = null;

  // set all buttons to alpha 1 (no transparency)
  for(let i = 0; i < this.buttons.length; i++) {
    this.buttons[i].alpha = 1;
  }

  // scene must be unblocked
  this.uiBlocked = false;
};

// place new item on the game
gameScene.placeItem = function(pointer, localX, localY) {
  // check that an item was selected
  if(!this.selectedItem) return;

  // create a new item in the position the player clicked/tapped
  let newItem = this.add.sprite(localX, localY, this.selectedItem.texture.key);

  // pet stats
  // this.stats.health += this.selectedItem.customStats.health;
  // this.stats.fun += this.selectedItem.customStats.fun;

  for(stat in this.selectedItem.customStats) {
    if(this.selectedItem.customStats.hasOwnProperty(stat)) {
        this.stats[stat] += this.selectedItem.customStats[stat];
    }
  }

  console.log(this.stats);

  // clear UI
  this.uiReady();
};

// our game's configuration
let config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  scene: gameScene,
  title: 'Virtual Pet',
  pixelArt: false,
  backgroundColor: 'ffffff'
};

// create the game, and pass it the configuration
let game = new Phaser.Game(config);
