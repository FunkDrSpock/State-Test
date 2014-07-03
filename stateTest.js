window.onload = function(){

	// Pause flag
	var paused = true;
    var counter=0;


    
//menu state
var Menu = function(game){};  
  Menu.prototype = {
    preload: function() {
        this.load.image('button', 'assets/firstaid.png');
        this.load.spritesheet('background', 'assets/sky.png',800,400);

    },
    create: function() {
			this.scale.minWidth = 320;
			this.scale.minHeight = 200;
			this.scale.maxWidth = 720;
			this.scale.maxHeight = 480;

			this.scale.pageAlignHorizontally = true;
			this.scale.pageAlignVertically = true;

			this.scale.setScreenSize(true);
        console.log('Menu has started');
        
      //creates ground and starts scrolling it
      this.background = this.game.add.image(-5, -15,'background');

      // adds the start button
      this.startButton = this.game.add.button(this.game.width/2, 20, 'button', this.startClick, this);
      this.startButton.anchor.setTo(0.5,0.5);
    },
    startClick: function() {
      // start the 'gameplay' state
      this.game.state.start('gameplay');
    }
  };
  

    
    
//winner state
var Winner = function(game){};  
  Winner.prototype = {
    preload: function() {
         this.load.image('win', 'assets/sky.png');

    },
    create: function() {
        console.log('Win Game has started');
        console.log(counter);
      this.win = this.game.add.image(-5, -15,'win');      
    }
  };

    
    
    
    
//Gameplay state
var gameplay = function(game){};
	gameplay.prototype = {
		preload: function(){
			// Load assets
			this.load.image('ground', 'assets/ground.png');
			this.load.image('btnPause', 'assets/btn-pause.png');
			this.load.image('btnPlay', 'assets/btn-play.png');
			this.load.image('panel', 'assets/panel.png');
            this.load.spritesheet('hero', 'assets/dude.png', 32, 48);
		},

		create: function(){
			// Reponsive and centered canvas
			this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            
        console.log('Game has started');
                cursors = game.input.keyboard.createCursorKeys();
         // add our start button with a callback
            this.startButton = this.game.add.button(this.game.width/2, 30, 'button', this.startClick, this);
      this.startButton.anchor.setTo(0.5,0.5);


			this.scale.minWidth = 320;
			this.scale.minHeight = 200;
			this.scale.maxWidth = 720;
			this.scale.maxHeight = 480;

			this.scale.pageAlignHorizontally = true;
			this.scale.pageAlignVertically = true;

			this.scale.setScreenSize(true);

			// Change stage background color
			this.game.stage.backgroundColor = '#d0f4f7';

			// Enable arcade physics
			this.game.physics.startSystem(Phaser.Physics.ARCADE);
			this.game.physics.arcade.gravity.y = 1200;

			// Add a scrolling ground
			this.ground = this.game.add.tileSprite(0, 250, 480, 70, 'ground');
			this.game.physics.arcade.enableBody(this.ground);
			this.ground.body.immovable = true;
			this.ground.body.allowGravity = false;

			// Add hero
			this.hero = this.game.add.sprite(80, 0, 'hero');
			this.hero.anchor.setTo(0.5, 0.5);
            this.hero.animations.add('left',[0,1,2,3],15,false);
            this.hero.animations.add('right',[5,6,7,8],15,false);		
            this.hero.frame=4;
			this.heroVelocityY = 0;

            //start timer
            this.currentTimer = this.game.time.create(false);
            this.currentTimer.loop(Phaser.Timer.SECOND, this.updateTimer, this);
            this.currentTimer.start();

			//Jump button
			this.jumpKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
			this.jumpKey.onDown.add(this.correctAnswer, this.hero);
        	this.leftKey = this.input.keyboard.addKey(Phaser.Keyboard.ENTER);
            this.leftKey.onDown.add(this.incorrectAnswer, this.hero);

			// Add a pause button
			this.btnPause = this.game.add.button(20, 20, 'btnPause', this.pauseGame, this);

			// Let's build a pause panel
			this.pausePanel = new PausePanel(this.game);
			this.game.add.existing(this.pausePanel);

			// Enter play mode
			this.playGame();
		},

		update: function(){
        if(!paused && this.hero.body.blocked.down && this.leftKey.isUp)
    {
        this.hero.body.velocity.x=0;    
        this.hero.frame=4;
        this.hero.animations.stop;
        console.log('animationstop')
    }

			// Collisions between hero and ground
			this.game.physics.arcade.collide(this.hero, this.ground);
		},
    
        updateTimer: function() {
            counter++;
            console.log(counter);

    },

		correctAnswer: function(){
			if(!paused){
				// Change hero velocity if touching the ground
				if(this.body.touching.down){
				    this.body.velocity.y -= 500;
                    this.body.velocity.x = 20;
                    this.animations.play('right');
                    }
			}
		},
        
        incorrectAnswer: function(){
			if(!paused){
				if(this.body.touching.down){
                    this.animations.play('left');
                    this.body.velocity.x=0;
                }
			}
		},
        
    startClick: function() {
      this.game.state.start('winner');
    },
    
		pauseGame: function(){
			if(!paused){
				// Enter pause
				paused = true;
				this.pausePanel.show();

				// Stop auto scrolling
				this.ground.autoScroll(0, 0);

				// Stop the hero
				this.hero.animations.currentAnim.paused = true;

				// Save the velocity of the hero before killing the body
				this.heroVelocityY = this.hero.body.velocity.y;

				// Kill the body
				this.hero.body = null;
                
                //pause the timer
                this.currentTimer.pause();
			}
		},
        
		playGame: function(){
			if(paused){
				// Leaving pause
				paused = false;
				this.pausePanel.hide();

				// Animate ground
				this.ground.autoScroll(-100, 0);

				// Activate hero gravity				
                this.game.physics.arcade.enableBody(this.hero);
				this.hero.body.allowGravity = true;
				this.hero.body.velocity.y = this.heroVelocityY;
                
                //continue the timer
                if (this.currentTimer.paused == true){
                this.currentTimer.resume();
                }
			}
		}
	};

	// Create our pause panel extending Phaser.Group
	var PausePanel = function(game, parent){
		// Super call to Phaser.Group
		Phaser.Group.call(this, game, parent);

		// Add the panel
		this.panel = this.create(this.game.width/2, 10, 'panel');
		this.panel.anchor.setTo(0.5, 0);

		// Add play button
		this.btnPlay = this.game.add.button(20, 20, 'btnPlay', function(){
        this.game.state.getCurrentState().playGame()}
		, this);
		this.add(this.btnPlay);

		// Place it out of bounds
		this.x = 0;
		this.y = -100;
	};

	PausePanel.prototype = Object.create(Phaser.Group.prototype);
	PausePanel.constructor = PausePanel;

	PausePanel.prototype.show = function(){
		this.game.add.tween(this).to({y:0}, 500, Phaser.Easing.Bounce.Out, true);
	};
	PausePanel.prototype.hide = function(){
		this.game.add.tween(this).to({y:-100}, 200, Phaser.Easing.Linear.NONE, true);
	};

	// Create game state and start phaser
	var game = new Phaser.Game(605, 385, Phaser.AUTO, 'game');
    game.state.add('menu', Menu);
	game.state.add('gameplay', gameplay);
    game.state.add('winner', Winner);
	game.state.start('menu');
}