/*jshint strict: false, undef: false, unused: false, quotmark: false, sub: true */

// mejor leyer el json pero por no modificar el html del profesor...
var sprites = {
  frog: { sx: 0, sy: 0, w: 48, h: 48, frames: 1 },
  bg: { sx: 433, sy: 0, w: 320, h: 480, frames: 1 },
  car1: { sx: 143, sy: 0, w: 48, h: 48, frames: 1 },
  car2: { sx: 191, sy: 0, w: 48, h: 48, frames: 1 },  
  car3: { sx: 239, sy: 0, w: 96, h: 48, frames: 1 },
  car4: { sx: 335, sy: 0, w: 48, h: 48, frames: 1 },
  car5: { sx: 383, sy: 0, w: 48, h: 48, frames: 1 },
  trunk: { sx: 288, sy: 383, w: 142, h: 48, frames: 1 },
  death: { sx: 0, sy: 143, w: 48, h: 48, frames: 4 }
};

var cars = {
  car1: { x: 320, y: 480 - 48 - sprites['car1'].h, sprite: 'car1',
          v: 50, dir: -1 },
  car2: { x: 0 - sprites['car2'].w, y: 480 - 48 * 2 - sprites['car2'].h, sprite: 'car2',
          v: 50 },
  car3: { x: 320, y: 480 - 48 * 3 - sprites['car3'].h, sprite: 'car3',
          v: 60, dir: -1 },
  car4: { x: 320, y: 480 - 48 * 4 - sprites['car4'].h, sprite: 'car4',
          v: 60, dir: -1 },
  car5: { x: 0 - sprites['car5'].w, y: 480 - 48 * 5 - sprites['car5'].h, sprite: 'car5',
          v: 50 }
};

var enemies = {
  straight: { x: 0,   y: -50, sprite: 'enemy_ship', health: 10, 
              E: 100 },
  ltr:      { x: 0,   y: -100, sprite: 'enemy_purple', health: 10, 
              B: 75, C: 1, E: 100, missiles: 2  },
  circle:   { x: 250,   y: -50, sprite: 'enemy_circle', health: 10, 
              A: 0,  B: -100, C: 1, E: 20, F: 100, G: 1, H: Math.PI/2 },
  wiggle:   { x: 100, y: -50, sprite: 'enemy_bee', health: 20, 
              B: 50, C: 4, E: 100, firePercentage: 0.001, missiles: 2 },
  step:     { x: 0,   y: -50, sprite: 'enemy_circle', health: 10,
              B: 150, C: 1.2, E: 75 }
};

var OBJECT_FROG = 1,
    OBJECT_CAR = 2,
    OBJECT_TRUNK = 4,
    OBJECT_WATER = 8,
    OBJECT_POWERUP = 16;

var startGame = function() { // borrar?
  var ua = navigator.userAgent.toLowerCase();

  // Only 1 row of stars
  if(ua.match(/android/)) {
    Game.setBoard(0,new Starfield(50,0.6,100,true));
  } else {
    Game.setBoard(0,new Starfield(20,0.4,100,true));
    Game.setBoard(1,new Starfield(50,0.6,100));
    Game.setBoard(2,new Starfield(100,1.0,50));
  }  
  Game.setBoard(3,new TitleScreen("Alien Invasion", 
                                  "Press fire to start playing",
                                  playGame));
};

var level1 = [
 // Start,   End, Gap,  Type,   Override
  [ 0,      4000,  500, 'step' ],
  [ 6000,   13000, 800, 'ltr' ],
  [ 10000,  16000, 400, 'circle' ],
  [ 17800,  20000, 500, 'straight', { x: 50 } ],
  [ 18200,  20000, 500, 'straight', { x: 90 } ],
  [ 18200,  20000, 500, 'straight', { x: 10 } ],
  [ 22000,  25000, 400, 'wiggle', { x: 150 }],
  [ 22000,  25000, 400, 'wiggle', { x: 100 }]
];



var playGame = function() {
  var back = new GameBoard();
  back.add(new Background());

  var gameActions = new GameBoard();
  gameActions.add(new Frog());
  gameActions.add(new Car(cars.car1));
  gameActions.add(new Car(cars.car2));
  gameActions.add(new Car(cars.car3));
  gameActions.add(new Car(cars.car4));
  gameActions.add(new Car(cars.car5));
  gameActions.add(new Trunk({ x: 0 - sprites['trunk'].w, y: 480 - 48 * 6 - sprites['trunk'].h, sprite: 'trunk' }));
  gameActions.add(new Trunk({ x: Game.width, y: 480 - 48 * 7 - sprites['trunk'].h, sprite: 'trunk', dir: -1 }));
  gameActions.add(new Trunk({ x: 0 - sprites['trunk'].w, y: 480 - 48 * 8 - sprites['trunk'].h, sprite: 'trunk' }));

  Game.setBoard(1, back);
  Game.setBoard(2, gameActions);
};

var winGame = function() {
  Game.setBoard(3,new TitleScreen("You win!", 
                                  "Press fire to play again",
                                  playGame));
};

var loseGame = function() {
  Game.setBoard(3,new TitleScreen("You lose!", 
                                  "Press fire to play again",
                                  playGame));
};

var Background = function() {
  this.setup('bg');

  this.x = 0;
  this.y = 0;

  this.step = function(dt) {};
};

Background.prototype = new Sprite();

var Frog = function() {
  this.setup('frog', { vx: 0, reloadTime: 0.10 });

  this.reload = this.reloadTime;
  this.x = Game.width/2 - this.w / 2;
  this.y = Game.height - this.h;

  this.step = function(dt) { //TODO hacer que salte fluido
    this.reload -= dt;
    this.x += this.vx * dt;

    // when player moves the froglet
    if (Game.keys['up'] && this.reload < 0) {
      this.y -= Game.squareLength;
      this.reload = this.reloadTime;
    }
    else if (Game.keys['down'] && this.reload < 0) {
      this.y += Game.squareLength;
      this.reload = this.reloadTime;
    }
    else if (Game.keys['left'] && this.reload < 0) {
      this.x -= Game.squareLength;
      this.reload = this.reloadTime;
    }
    else if (Game.keys['right'] && this.reload < 0) {
      this.x += Game.squareLength;
      this.reload = this.reloadTime;
    }

    var collision = this.board.collide(this,OBJECT_WATER); // TODO la colisión con el agua no funciona
    if(collision)
      this.board.remove(this);

    // check bounds
    if (this.y < 0) { this.y = 0; }
    else if(this.y > Game.height - this.w) { 
      this.y = Game.height - this.w;
    }

    if(this.x < 0) { this.x = 0; }
    else if(this.x > Game.width - this.w) { 
      this.x = Game.width - this.w;
    }

    this.vx = 0;
  };
};

Frog.prototype = new Sprite();
Frog.prototype.type = OBJECT_FROG;

Frog.prototype.onTrunk = function (v) { // TODO hacer que la rana no muera si está sobre tronco. Apartado agua.
  this.vx = v;
};

Frog.prototype.hit = function(damage) {
  this.board.remove(this);
  this.board.add (new Death(this.x + this.w/2, 
                            this.y + this.h/2));
};

var Car = function (blueprint,override) {
  this.merge(this.baseParameters);
  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
};

Car.prototype = new Sprite();
Car.prototype.type = OBJECT_CAR;
Car.prototype.baseParameters = { type: 1, dir: 1, row: 1, v: 20 }; // row no se usa

Car.prototype.step = function(dt) {
  this.x += this.v * this.dir * dt;

  var collision = this.board.collide(this,OBJECT_FROG);
  if(collision)
    collision.hit();
  else if(this.x < -this.w ||
     this.x > Game.width) {
       this.board.remove(this);
  }
};

var Trunk = function (blueprint,override) {
  this.merge(this.baseParameters);
  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
};

Trunk.prototype = new Sprite();
Trunk.prototype.type = OBJECT_TRUNK;
Trunk.prototype.baseParameters = { dir: 1, v: 20 };

Trunk.prototype.step = function(dt) {
  this.x += this.v * this.dir * dt;

  var collision = this.board.collide(this,OBJECT_FROG);
  if(collision)
    collision.onTrunk (this.v * this.dir);
  else if(this.x < -this.w ||
     this.x > Game.width) {
       this.board.remove(this);
  }
};

var Water = function() {
  this.x = 0;
  this.y = Game.squareLength;
  this.w = Game.width;
  this.h = Game.squareLength * 3;

  this.step = function(dt) {
    var collision = this.board.collide(this,OBJECT_FROG); // TODO la colisión con el agua no funciona
    if(collision)
      collision.hit();
  };
  this.draw = function(ctx) {};
};

Water.prototype = new Sprite();
Water.prototype.type = OBJECT_WATER;

var Death = function(centerX,centerY) {
  this.setup('death', { frame: 0 });
  this.x = centerX - this.w/2;
  this.y = centerY - this.h/2;
  this.subframe = 0;

  this.step = function(dt) {
    this.frame = Math.floor(this.subframe++ / 10);
    if(this.subframe >= 40) {
      this.board.remove(this);
    }
  };
};

Death.prototype = new Sprite();

var PlayerShip = function() { 
  this.setup('ship', { vx: 0, reloadTime: 0.25, maxVel: 200 });

  this.reload = this.reloadTime;
  this.x = Game.width/2 - this.w / 2;
  this.y = Game.height - Game.playerOffset - this.h;

  this.step = function(dt) {
    if(Game.keys['left']) { this.vx = -this.maxVel; }
    else if(Game.keys['right']) { this.vx = this.maxVel; }
    else { this.vx = 0; }

    this.x += this.vx * dt;

    if(this.x < 0) { this.x = 0; }
    else if(this.x > Game.width - this.w) { 
      this.x = Game.width - this.w;
    }

    this.reload-=dt;
    if(Game.keys['fire'] && this.reload < 0) {
      Game.keys['fire'] = false;
      this.reload = this.reloadTime;

      this.board.add(new PlayerMissile(this.x,this.y+this.h/2));
      this.board.add(new PlayerMissile(this.x+this.w,this.y+this.h/2));
    }
  };
};

PlayerShip.prototype = new Sprite();
PlayerShip.prototype.type = OBJECT_CAR;

PlayerShip.prototype.hit = function(damage) {
  if(this.board.remove(this)) {
    loseGame();
  }
};

var PlayerMissile = function(x,y) {
  this.setup('missile',{ vy: -700, damage: 10 });
  this.x = x - this.w/2;
  this.y = y - this.h; 
};

PlayerMissile.prototype = new Sprite();
PlayerMissile.prototype.type = OBJECT_CAR;

PlayerMissile.prototype.step = function(dt)  {
  this.y += this.vy * dt;
  var collision = this.board.collide(this,OBJECT_TRUNK);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  } else if(this.y < -this.h) { 
      this.board.remove(this); 
  }
};


var Enemy = function(blueprint,override) {
  this.merge(this.baseParameters);
  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
};

Enemy.prototype = new Sprite();
Enemy.prototype.type = OBJECT_TRUNK;

Enemy.prototype.baseParameters = { A: 0, B: 0, C: 0, D: 0, 
                                   E: 0, F: 0, G: 0, H: 0,
                                   t: 0, reloadTime: 0.75, 
                                   reload: 0 };

Enemy.prototype.step = function(dt) {
  this.t += dt;

  this.vx = this.A + this.B * Math.sin(this.C * this.t + this.D);
  this.vy = this.E + this.F * Math.sin(this.G * this.t + this.H);

  this.x += this.vx * dt;
  this.y += this.vy * dt;

  var collision = this.board.collide(this,OBJECT_CAR);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  }

  if(Math.random() < 0.01 && this.reload <= 0) {
    this.reload = this.reloadTime;
    if(this.missiles == 2) {
      this.board.add(new EnemyMissile(this.x+this.w-2,this.y+this.h));
      this.board.add(new EnemyMissile(this.x+2,this.y+this.h));
    } else {
      this.board.add(new EnemyMissile(this.x+this.w/2,this.y+this.h));
    }

  }
  this.reload-=dt;

  if(this.y > Game.height ||
     this.x < -this.w ||
     this.x > Game.width) {
       this.board.remove(this);
  }
};

Enemy.prototype.hit = function(damage) {
  this.health -= damage;
  if(this.health <=0) {
    if(this.board.remove(this)) {
      Game.points += this.points || 100;
      this.board.add(new Explosion(this.x + this.w/2, 
                                   this.y + this.h/2));
    }
  }
};

var EnemyMissile = function(x,y) {
  this.setup('enemy_missile',{ vy: 200, damage: 10 });
  this.x = x - this.w/2;
  this.y = y;
};

EnemyMissile.prototype = new Sprite();
EnemyMissile.prototype.type = OBJECT_WATER;

EnemyMissile.prototype.step = function(dt)  {
  this.y += this.vy * dt;
  var collision = this.board.collide(this,OBJECT_PLAYER);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  } else if(this.y > Game.height) {
      this.board.remove(this); 
  }
};



var Explosion = function(centerX,centerY) {
  this.setup('explosion', { frame: 0 });
  this.x = centerX - this.w/2;
  this.y = centerY - this.h/2;
};

Explosion.prototype = new Sprite();

Explosion.prototype.step = function(dt) {
  this.frame++;
  if(this.frame >= 12) {
    this.board.remove(this);
  }
};

window.addEventListener("load", function() {
  Game.initialize("game",sprites,playGame);
});