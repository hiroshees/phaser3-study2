// create a new scene
let gameScene = new Phaser.Scene('Game');

// some parameters for our scene
gameScene.init = function() {
  this.stats = {
    health: 100,
    fun: 100
  };

  this.decayRates = {
    health: -5,
    fun: -2
  };
};

// load asset files for our game
gameScene.preload = function() {
  // load assets
};

// executed once, after assets were loaded
gameScene.create = function() {
  
  let bg = this.add.sprite(0,0, 'backyard').setInteractive();
  bg.setOrigin(0,0);
  bg.on('pointerdown', this.placeItem, this);

  this.pet = this.add.sprite(100,200, 'pet', 0).setInteractive();
  this.pet.depth = 1;

  // make pet drag
  this.input.setDraggable(this.pet);
  //this.input.setDraggable(bg);

  // follow pointer
  this.input.on('drag',function(pointer, gameObject, dragX, dragY){
    gameObject.x = dragX;
    gameObject.y = dragY;

  });

  this.createUI();

  this.createHud();
  this.refreshHud();

  this.timedEventStats = this.time.addEvent({
    delay: 1000,
    repeat: -1, // it will repeat forever
    callback: function(){
      // update stats
      this.updateStats(this.decayRates);
    },
    callbackScope: this
  });

};

gameScene.createUI = function () {
  // buttons
  this.appleBtn = this.add.sprite(72, 570, 'apple').setInteractive();
  this.appleBtn.customStats = {
    health: 20,
    fun: 9
  };
  this.appleBtn.on('pointerdown',this.pickItem);

  this.candyBtn = this.add.sprite(144, 570, 'candy').setInteractive();
  this.candyBtn.customStats = {
    health: -10,
    fun: 10
  };
  this.candyBtn.on('pointerdown',this.pickItem);

  this.toyBtn = this.add.sprite(216, 570, 'toy').setInteractive();
  this.toyBtn.customStats = {
    health: 0,
    fun: 15
  };
  this.toyBtn.on('pointerdown',this.pickItem);

  this.rotateBtn = this.add.sprite(288, 570, 'rotate').setInteractive();
  this.rotateBtn.customStats = {fun: 20};
  this.rotateBtn.on('pointerdown', this.rotatePet);

  
  // array with all buttons
  this.buttons = [this.appleBtn, this.candyBtn, this.toyBtn, this.rotateBtn];
 
  this.uiBlocked = false;
  this.uiReady();
};

// rotate pet
gameScene.rotatePet = function() {
  if(this.scene.uiBlocked) return;
 
  // make sure the ui is ready
  this.scene.uiReady();
 
  // block the ui
  this.scene.uiBlocked = true;
 
  // dim the rotate icon
  this.alpha = 0.5;
 
  let scene = this.scene;
  /*
  setTimeout(function(){
    // set the scene back to ready
    scene.uiReady();
  }, 2000);
  */
  // rotation tween
  let rotateTween = this.scene.tweens.add({
    targets: this.scene.pet,
    duration: 800,
    angle: 720,
    pause: false,
    callbackScope: this,
    onComplete: function(tween, sprites) {
      // increase fun
      this.scene.stats.fun += this.customStats.fun;

      this.scene.updateStats(this.customStats);

      // set UI to ready
      this.scene.uiReady();

      this.scene.refreshHud();

      console.log(this.scene.stats);
    }
  });
  console.log('we are rotating the pet!');
};

gameScene.pickItem = function() {
  console.log(this.customStats);
  if(this.scene.uiBlocked) { 
    return;
  }

  this.scene.uiReady();

  this.scene.selectedItem = this;

  this.alpha = 0.5;

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

gameScene.placeItem = function(pointer, localX, localY) {
  console.log(pointer);
  console.log(localX, localY);
  if(!this.selectedItem) return;

  // ui must be unblocked
  if(this.uiBlocked) return;

  let newItem = this.add.sprite(localX, localY, this.selectedItem.texture.key);

  this.uiBlocked = true;

  let petTween = this.tweens.add({
    targets: this.pet,
    duration: 500,
    x: newItem.x,
    y: newItem.y,
    paused: false,
    callbackScope: this,
    onComplete: function(tween, sprites) {

      for(stat in this.selectedItem.customStats) {
        if(this.selectedItem.customStats.hasOwnProperty(stat)) {
            this.stats[stat] += this.selectedItem.customStats[stat];
        }
      }
      console.log(this.stats);

      this.pet.on('animationcomplete', function(){
        newItem.destroy();    
        // set pet back to neutral face
        this.pet.setFrame(0);
        // clear UI
        this.uiReady();
        this.refreshHud();
      }, this);
      // play spritesheet animation
      this.pet.play('funnyfaces');
    }
  });
};

gameScene.createHud = function() {
  // health stat
  this.healthText = this.add.text(20, 20, 'Health: ', {
    font: '24px Arial',
    fill: '#ffffff'
  });
 
  // fun stat
  this.funText = this.add.text(170, 20, 'Fun: ', {
    font: '24px Arial',
    fill: '#ffffff'
  });
};

gameScene.refreshHud = function(){
  this.healthText.setText('Health: ' + this.stats.health);
  this.funText.setText('Fun: ' + this.stats.fun);
};

// stat updater
gameScene.updateStats = function(statDiff) {
  // manually update each stat
  // this.stats.health += statDiff.health;
  // this.stats.fun += statDiff.fun;
 
  // flag to see if it's game over
  let isGameOver = false;
 
  // more flexible
  for (stat in statDiff) {
    if (statDiff.hasOwnProperty(stat)) {
      this.stats[stat] += statDiff[stat];
 
      // stats can't be less than zero
      if(this.stats[stat] < 0) {
        isGameOver = true;
        this.stats[stat] = 0;
      }
    }
  }
 
  // refresh HUD
  this.refreshHud();
 
  // check to see if the game ended
  if(isGameOver) this.gameOver();
};
 
gameScene.gameOver = function() {
  // block ui
  this.uiBlocked = true;
 
  // change frame of the pet
  this.pet.setFrame(4);
 
  // keep the game on for a some time, the move on
  this.time.addEvent({
    delay: 2000,
    repeat: 0,
    callback: function(){
        this.scene.start('Home');
    },
    callbackScope: this
  });
};
