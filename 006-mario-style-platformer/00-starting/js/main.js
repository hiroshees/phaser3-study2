// create a new scene
let gameScene = new Phaser.Scene('Game');

// some parameters for our scene
gameScene.init = function() {
  this.playerSpeed = 150;
  this.jumpSpeed = -600;
};

// load asset files for our game
gameScene.preload = function() {

  // load images
  this.load.image('ground', 'assets/images/ground.png');
  this.load.image('platform', 'assets/images/platform.png');
  this.load.image('block', 'assets/images/block.png');
  this.load.image('goal', 'assets/images/gorilla3.png');
  this.load.image('barrel', 'assets/images/barrel.png');

  // load spritesheets
  this.load.spritesheet('player', 'assets/images/player_spritesheet.png', {
    frameWidth: 28,
    frameHeight: 30,
    margin: 1,
    spacing: 1
  });

  this.load.spritesheet('fire', 'assets/images/fire_spritesheet.png', {
    frameWidth: 20,
    frameHeight: 21,
    margin: 1,
    spacing: 1
  });

  this.load.json('levelData', 'assets/json/data.json');
};

// executed once, after assets were loaded
gameScene.create = function() {
  // player animation
  if(!this.anims.get('walking')) {
    this.anims.create({
      key : 'walking',
      frames: this.anims.generateFrameNames('player',{
        frames: [0,1,2],
      }),
      frameRate: 10,
      yoyo: true,
      repeat : -1,
    });
  }

  if(!this.anims.get('burning')) {
    this.anims.create(
      {
        key : 'burning',
        frames: this.anims.generateFrameNames('fire',{
          frames: [0,1],
        }),
        frameRate: 4,
        repeat : -1,
      }
    );
  }

  this.setupLevels();

  this.setupSpawner();

  // this.physics.world.bounds.width = 360;
  // this.physics.world.bounds.height = 700;

  //this.cameras.main.setBounds(0, 0, 360, 640);
  //this.cameras.main.setBounds(0, 0, 400, 800);
  // this.cameras.main.setBounds(0, 0, 360, 800);
  // this.cameras.main.startFollow(this.player);


  // this.platforms = this.add.group();

  /*
  // (1) adding existing sprite to physics
  // create sprite
  var ground = this.add.sprite(180, 604, 'ground');

  // adding to physics
  //  dynamic sprite
  //this.physics.add.existing(ground, false);
  // disable gravity
  //ground.body.allowGravity = false;
  // stop moving
  //ground.body.immovable = true;

  // static sprite
  this.physics.add.existing(ground, true);

  // add group
  this.platforms.add(ground);

  var platform = this.add.tileSprite(180, 500, 4 * 36 , 1 * 30,  'block');
  this.physics.add.existing(platform, true);
  this.platforms.add(platform);
  */

 //this.setupLevels();

  // 2) creating sprite and add to physics
  //let ground2 = this.physics.add.sprite(180, 100, 'ground');
  //this.physics.add.collider(ground, ground2);

  // collision => stop object moving
  //this.physics.add.collider(this.player, ground);
  //this.physics.add.collider(this.player, platform);
  // this.physics.add.collider(this.player, this.platforms);
  // this.physics.add.collider(this.goal, this.platforms);
  this.physics.add.collider([this.player, this.goal, this.barrels], this.platforms);

  // overlap check
  this.physics.add.overlap(this.player, [this.fires, this.goal, this.barrels], this.restartGame, null, this);

  this.cursors = this.input.keyboard.createCursorKeys();

  this.input.on('pointerdown',function(pointer) {
    console.log(pointer.x);
    console.log(pointer.y);
  });
};

gameScene.update = function() {
  var onGround = this.player.body.blocked.down || this.player.body.touching.down;

  if(this.cursors.left.isDown) {
    this.player.body.setVelocityX(-this.playerSpeed);
    this.player.flipX = false;
    if(!this.player.anims.isPlaying) {
      this.player.anims.play('walking');
    }
  } else if(this.cursors.right.isDown) {
    this.player.body.setVelocityX(this.playerSpeed);
    this.player.flipX = true;
    if(!this.player.anims.isPlaying) {
      this.player.anims.play('walking');
    }
  } else {
    this.player.body.setVelocityX(0);
    this.player.anims.stop('walking');
    if(onGround) {
      this.player.setFrame(3);
    }
  }

  if(onGround && (this.cursors.space.isDown || this.cursors.up.isDown)) {
    this.player.body.setVelocityY(this.jumpSpeed);
    this.player.anims.stop('walking');
    this.player.setFrame(2);
  }
};

gameScene.setupLevels = function() {
  this.levelData = this.cache.json.get('levelData');

  this.physics.world.bounds.width = this.levelData.world.width;
  this.physics.world.bounds.height = this.levelData.world.height;

  //this.platforms = this.add.group();
  this.platforms = this.physics.add.staticGroup();
  for(var i = 0; i < this.levelData.platforms.length; i++) {
    var cur = this.levelData.platforms[i];
    
    if(cur.numTiles == 1) {
      newObj = this.add.sprite(cur.x, cur.y, cur.key).setOrigin(0);
    } else {
      var width = this.textures.get(cur.key).get(0).width;
      var height = this.textures.get(cur.key).get(0).height;
      newObj = this.add.tileSprite(cur.x, cur.y, cur.numTiles * width ,height, cur.key).setOrigin(0);
    }
    this.physics.add.existing(newObj, true);
    this.platforms.add(newObj);
  }

  // this.fires = this.add.group();
  this.fires = this.physics.add.group({
    allowGravity: false,
    immovable : true,
  });
  for(var i = 0; i < this.levelData.fires.length; i++) {
    var cur = this.levelData.fires[i];
    //newObj = this.add.sprite(cur.x, cur.y, "fire").setOrigin(0);
    //newObj = this.fires.create(cur.x, cur.y, "fire");
    newObj = this.fires.create(cur.x, cur.y, "fire").setOrigin(0).setOffset(-10, -10);
    this.physics.add.existing(newObj);
    //newObj.body.allowGravity = false;
    //newObj.body.immovable = true;
    newObj.anims.play("burning");
    //this.fires.add(newObj);

    newObj.setInteractive();

    this.input.setDraggable(newObj);
  }
  this.input.on('drag',function(pointer, gameObject, dragX, dragY){
    gameObject.x = dragX;
    gameObject.y = dragY;

  });

  this.player = this.add.sprite(this.levelData.player.x, this.levelData.player.y, 'player', 3);
  this.physics.add.existing(this.player,false);
  // set player within screen
  this.player.body.setCollideWorldBounds(true);

  this.cameras.main.setBounds(0, 0, this.levelData.world.width, this.levelData.world.height);
  this.cameras.main.startFollow(this.player);

  this.goal = this.add.sprite(this.levelData.goal.x, this.levelData.goal.y, "goal").setOrigin(0);
  this.physics.add.existing(this.goal);

};

gameScene.restartGame = function(sourceSprite, targetSprite) {
  // fade out
  this.cameras.main.fade(500);
  // restart scene
  this.cameras.main.on('camerafadeoutcomplete', function(camera, effect){
    // restart scene
    this.scene.restart();
  }, this);
};

gameScene.setupSpawner = function() {
  this.barrels = this.physics.add.group({
    bouncyY : 0.1,
    bounceX : 1,
    collideWorldBounds : true,
  });
  var spawingEvent = this.time.addEvent({
    delay: this.levelData.spawner.interval,
    loop: true,
    callbackScope : this,
    callback : function() {
      // var barrel = this.barrels.create(this.goal.x, this.goal.y, 'barrel');

      // create if not exit otherwise reuse
      var barrel = this.barrels.get(this.goal.x, this.goal.y, 'barrel');
      barrel.setActive(true);
      barrel.setVisible(true);
      barrel.body.enable = true;

      barrel.setVelocityX(this.levelData.spawner.speed);

      this.time.addEvent({
        delay: this.levelData.spawner.lifespan,
        repeat : 0,
        callbackScope : this,
        callback : function() {
          //barrel.destroy();
          // just hide
          this.barrels.killAndHide(barrel);
          // just disable
          barrel.body.enable = false;
        }
      });
    }
  });

};

// our game's configuration
let config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  scene: gameScene,
  title: 'Monster Kong',
  pixelArt: false,
  physics : {
    default: 'arcade',
    arcade : {
      gravity : { 
        y : 1000,
      },
      debug : true,
    }

  }
};

// create the game, and pass it the configuration
let game = new Phaser.Game(config);
