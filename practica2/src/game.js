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
          v: 120, dir: -1 },
  car2: { x: 0 - sprites['car2'].w, y: 480 - 48 * 2 - sprites['car2'].h, sprite: 'car2',
          v: 85 },
  car3: { x: 320, y: 480 - 48 * 3 - sprites['car3'].h, sprite: 'car3',
          v: 130, dir: -1 },
  car4: { x: 320, y: 480 - 48 * 4 - sprites['car4'].h, sprite: 'car4',
          v: 80, dir: -1 },
  car5: { x: 0 - sprites['car5'].w, y: 480 - 48 * 5 - sprites['car5'].h, sprite: 'car5',
          v: 50 }
};

var trunks = {
  trunk: { x: 0 - sprites['trunk'].w, y: 480 - 48 * 6 - sprites['trunk'].h, sprite: 'trunk',
            v: 100 },
  trunkBackwards: { x: 320, y: 480 - 48 * 6 - sprites['trunk'].h, sprite: 'trunk',
            v: 100, dir: -1 }
};

var OBJECT_FROG = 1,
    OBJECT_CAR = 2,
    OBJECT_TRUNK = 4,
    OBJECT_WATER = 8,
    OBJECT_HOME = 16;

var startGame = function() {
  Game.setBoard(0,new Background());
  
  Game.setBoard(1,new TitleScreen("Frogger", 
                                  "Press space to start playing",
                                  playGame));
};

var playGame = function() {
  Game.disableBoard(2); // clear titles

  var board = new GameBoard();
  board.add( new Frog() );
  board.add( new Spawner( new Car(cars.car1), 230 ) );
  board.add( new Spawner( new Car(cars.car2), 180 ) );
  board.add( new Spawner( new Car(cars.car3), 320 ) );
  board.add( new Spawner( new Car(cars.car4), 200 ) );
  board.add( new Spawner( new Car(cars.car5), 250 ) );
  board.add( new Spawner( new Trunk(trunks.trunk, { v: 100 }), 200 ) );
  board.add( new Spawner( new Trunk(trunks.trunkBackwards,
                                    { y: 480 - 48 * 7 - sprites['trunk'].h }),
                          340 ) );
  board.add( new Spawner( new Trunk(trunks.trunk,
                                    { y: 480 - 48 * 8 - sprites['trunk'].h, v: 170 }),
                          250 ) );
  board.add( new Water() );
  board.add( new Home() );

  Game.setBoard(1, board);
};

var winGame = function() {
  Game.setBoard(2,new TitleScreen("You win!", 
                                  "Press space to play again",
                                  playGame));
};

var loseGame = function() {
  Game.setBoard(2,new TitleScreen("You lose!", 
                                  "Press space to play again",
                                  playGame));
};

var Background = function() {
  this.setup('bg');

  this.x = 0;
  this.y = 0;

  this.step = function(dt) {};
};

Background.prototype = new Sprite(0);

var Frog = function() {
  this.setup('frog', { vx: 0, reloadTime: 0.15 });

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

Frog.prototype = new Sprite(2);
Frog.prototype.type = OBJECT_FROG;

Frog.prototype.onTrunk = function (v) {
  this.vx = v;
};

Frog.prototype.onWater = function() {
  var collision = this.board.collide(this,OBJECT_TRUNK);
  if(!collision)
    this.hit();
};

Frog.prototype.hit = function(damage) {
  if (this.board.remove(this)) {
    this.board.add (new Death(this.x + this.w/2, 
                              this.y + this.h/2));
    loseGame();
  }
};

var Car = function (blueprint,override) {
  this.merge(this.baseParameters);
  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
};

Car.prototype = new Sprite(2);
Car.prototype.type = OBJECT_CAR;
Car.prototype.baseParameters = { dir: 1, v: 20 };

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

Trunk.prototype = new Sprite(1);
Trunk.prototype.type = OBJECT_TRUNK;
Trunk.prototype.baseParameters = { dir: 1, v: 60 };

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
    var collision = this.board.collide(this,OBJECT_FROG);
    if(collision)
      collision.onWater();
  };
  this.draw = function(ctx) {};
};

Water.prototype = new Sprite(1);
Water.prototype.type = OBJECT_WATER;

var Home = function() {
  this.x = 0;
  this.y = 0;
  this.w = Game.width;
  this.h = Game.squareLength;
  this.reached = false;

  this.step = function(dt) {
    var collision = this.board.collide(this,OBJECT_FROG);
    if(collision && !this.reached) {
      this.reached = true;
      winGame();
    }
  };
  this.draw = function(ctx) {};
};

Home.prototype = new Sprite(1);
Home.prototype.type = OBJECT_HOME;

var Death = function(centerX,centerY) {
  this.setup('death', { frame: 0 });
  this.x = centerX - this.w/2;
  this.y = centerY - this.h/2;
  this.subframe = 0;

  this.step = function(dt) {
    this.frame = Math.floor(this.subframe++ / 10);
    if(this.subframe >= 40)
      this.board.remove(this);
  };
};

Death.prototype = new Sprite(2);

var Spawner = function(obj, freq, objProps) {
  this.protoObj = obj;
  this.objProps = [];
  this.f = freq;
  this.subframe = 0;
};

Spawner.prototype.step = function(dt) {
  this.t += dt;

  if (this.subframe++ % this.f === 0)
    this.board.add(Object.create(this.protoObj, this.objProps));
};

Spawner.prototype.draw = function(ctx) {};


window.addEventListener("load", function() {
  Game.initialize("game",sprites,startGame);
});

// por qué no funciona el space al ganar, y hay que moverse
// por qué no funcionan las colisiones de los coches si se ponen en la rana | sí funsiona
// si está bien usar una PQueue para el zIndex | hacer un sort al meter y punto
// por qué hay una franja de 1px en la derecha que no pinta bien | bug