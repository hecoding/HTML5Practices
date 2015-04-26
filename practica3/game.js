/*jshint strict: false, undef: false, unused: false, quotmark: false, sub: true */

var game = function () {

	// set development to false when finished
	var Q = window.Q = Quintus({ development:true })
								.include("Sprites, Scenes, Input, UI, Touch, TMX, Anim, 2D")
								.setup({ width: 320, height: 480 })
								.controls().touch();



	Q.loadTMX("level.tmx, mario_small.png, mario_small.json, goomba.png, goomba.json, bloopa.png, bloopa.json", function() {
		Q.compileSheets("mario_small.png","mario_small.json");
		Q.compileSheets("goomba.png", "goomba.json");
		Q.compileSheets("bloopa.png", "bloopa.json");
		Q.stageScene("level1", 0);
	});

	// asynchronous load, it's a bad practice to code it like that
	Q.load("princess.png");

	Q.Sprite.extend("Mario", {
		init: function(p) {
			this._super(p, {
				sheet: "marioR",
				x: 150,
				y: 380
			});

			this.add("2d, platformerControls");
		},

		step: function(dt) {
			if(Q.inputs['left'] && this.p.direction == 'right')
				this.p.flip = 'x';
			
			if(Q.inputs['right']  && this.p.direction == 'left')
				this.p.flip = false;

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
				sheet: "goomba",
				x: 350,
				y: 500,
				vx: 100
			});

			this.add("2d, aiBounce");

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
		},

		step: function(dt) { }
	});

	Q.Sprite.extend("Bloopa", {
		init: function(p) {
			this._super({
				sheet: "bloopa",
				x: 550,
				y: 500
			});
		
			this.add('2d');

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
		},

		step: function(dt) { }
	});

	Q.scene("level1", function(stage) {
		Q.stageTMX("level.tmx",stage);
		stage.insert( new Q.Mario() );
		stage.add("viewport").follow(Q("Mario").first());

		stage.insert( new Q.Goomba() );
		stage.insert( new Q.Bloopa() );
		stage.insert( new Q.Princess() );

		// set the camera
		stage.viewport.offsetY = 155;
		stage.centerOn(150, 380);
	});

	Q.scene("loseGame", function (stage) {
		var container = stage.insert(new Q.UI.Container({
			x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
		}));

		var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                                  label: "Play Again" }))         
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
                                                  label: "Play Again?" }))         
		var label = container.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
                                                   label: "You won!" }));
		button.on("click",function() {
			Q.clearStages();
			Q.stageScene('level1');
		});

		container.fit(20);
	});

};