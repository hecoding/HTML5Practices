/*jshint strict: false, undef: false, unused: false, quotmark: false, sub: true */

var game = function () {

	// set development to false when finished
	var Q = window.Q = Quintus({ development:true })
								.include("Sprites, Scenes, Input, UI, Touch, TMX, Anim, 2D")
								.setup({ width: 320, height: 480 })
								.controls().touch();



	Q.loadTMX("level.tmx, mario_small.png, mario_small.json, goomba.png, goomba.json, bloopa.png, bloopa.json, coin.png, coin.json", function() {
		Q.compileSheets("mario_small.png","mario_small.json");
		Q.compileSheets("goomba.png", "goomba.json");
		Q.compileSheets("bloopa.png", "bloopa.json");
		Q.compileSheets("coin.png", "coin.json");
		Q.load("mainTitle.png, princess.png", function() {
			Q.animations("mario", {
				run_right: {frames: [1, 2, 3], rate: 1/7},
				run_left: {frames: [15, 16, 17], rate: 1/7},
				stand_right: {frames: [0]},
				stand_left: {frames: [14]},
				jump_right: {frames: [4], rate: 1/15},
				jump_left: {frames: [18], rate: 1/15},
				die_right: {frames: [12]},
				die_left: {frames: [26]}
			});

			Q.animations("goomba", {
				run: {frames: [0, 1], rate: 1/4},
				die: {frames: [2]}
			});

			Q.animations("bloopa", {
				run: {frames: [0, 1], rate: 1/4},
				die: {frames: [2]}
			});

			Q.animations("coin", {
				shine: {frames: [0, 1, 2], rate: 1/4}
			});

			Q.stageScene("mainTitle", 0);
		});
	});

	Q.Sprite.extend("Mario", {
		init: function(p) {
			this._super(p, {
				sprite: "mario",
				sheet: "marioR",
				x: 150,
				y: 380
			});

			this.add("2d, platformerControls, animation");
		},

		step: function(dt) {
			if(this.p.vy == 0) {
				if (this.p.vx > 0)
					this.play("run_right");
				else if (this.p.vx < 0)
					this.play("run_left");
				else
					this.play("stand_" + this.p.direction);
			}
			else this.play("jump_" + this.p.direction);

			// check bounds
			if (this.p.y > 600)
				this.die();
		},

		die: function() {
			this.destroy();
			Q.stageScene("loseGame",1);
		}
	});

	Q.Sprite.extend("Goomba", {
		init: function(p) {
			this._super({
				sprite: "goomba",
				sheet: "goomba",
				x: 350,
				y: 500,
				vx: 100
			});

			this.add("2d, aiBounce, animation");
			this.play("run");

			this.on("bump.left,bump.right,bump.bottom", function (collision) {
				if(collision.obj.isA("Mario")) { 
					Q.stageScene("loseGame", 1); 
					collision.obj.die();
				}
			});

			this.on("bump.top", function (collision) {
				if(collision.obj.isA("Mario")) { 
					this.destroy();
					collision.obj.p.vy = -300;
				}
			});
		}
	});

	Q.Sprite.extend("Bloopa", {
		init: function(p) {
			this._super({
				sprite: "bloopa",
				sheet: "bloopa",
				x: 550,
				y: 500
			});
		
			this.add('2d, animation');
			this.play("run");

			this.on("bump.left,bump.right,bump.bottom, bump.bottom", function (collision) {
				if(collision.obj.isA("Mario")) { 
					Q.stageScene("loseGame", 1); 
					collision.obj.die();
				}
			});

			this.on("bump.top", function (collision) {
				if(collision.obj.isA("Mario")) { 
					this.destroy();
					collision.obj.p.vy = -300;
				}
			});
		},

		step: function(dt) {
			if (this.p.vy === 0) this.p.vy = -300;
		}
	});

	Q.Sprite.extend("Princess", {
		init: function(p) {
			this._super({
				asset: "princess.png",
				x: 2000,
				y: 450,
				sensor: true,
				sensorActivated: false
			});
    
			this.on("sensor");
		},

		sensor: function() {
			if (!this.sensorActivated) {
				this.sensorActivated = true;
				Q.stageScene("winGame", 1);
			}
		}
	});

	Q.Sprite.extend("Coin", {
		init: function(p) {
			this._super({
				sprite: "coin",
				sheet: "coin",
				x: 100,
				y: 460,
				gravityY: 0
			});
		
			this.add('2d, animation');
			this.play("shine");

			this.on("bump.left,bump.right,bump.bottom, bump.bottom, bump.top", function (collision) {
				if(collision.obj.isA("Mario")) { 
					this.destroy();
					// +1 mario. Guardar monedas en Q.state
				}
			});
		}
	});

	Q.scene("mainTitle", function(stage) {
		stage.insert(new Q.UI.Button({
			asset: 'mainTitle.png',
			x: Q.width/2,
			y: Q.height/2
		}, function() {
			Q.clearStages();
			Q.stageScene("level1", 0);
		}));
	});

	Q.scene("level1", function(stage) {
		Q.stageTMX("level.tmx",stage);
		stage.insert( new Q.Mario() );
		stage.add("viewport").follow(Q("Mario").first());

		stage.insert( new Q.Goomba() );
		stage.insert( new Q.Bloopa() );
		stage.insert( new Q.Princess() );
		stage.insert( new Q.Coin() );

		// set the camera
		stage.viewport.offsetY = 155;
		stage.centerOn(150, 380);
	});

	Q.scene("loseGame", function (stage) {
		var container = stage.insert(new Q.UI.Container({
			x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
		}));

		var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                                  label: "Play Again" }));
		var label = container.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
                                                   label: "Game over" }));
		button.on("click",function() {
			Q.clearStages();
			Q.stageScene('level1');
		});

		container.fit(20);
	});

	Q.scene("winGame", function (stage) {
		var container = stage.insert(new Q.UI.Container({
			x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
		}));

		var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                                  label: "Play Again?" }));
		var label = container.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
                                                   label: "You won!" }));
		button.on("click",function() {
			Q.clearStages();
			Q.stageScene('level1');
		});

		container.fit(20);
	});

};