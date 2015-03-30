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

var BG_BOARD = 0,
    GAME_BOARD = 1,
    STATS_BOARD = 2,
    TITLE_BOARD = 3,
    LOSER_BOARD = 4,
    WINNER_BOARD = 5;

var startGame = function() {
  Game.setBoard(BG_BOARD,new Background());

  var gameBoard = new GameBoard();
  gameBoard.add( new Spawner( new Car(cars.car1), 230 ) );
  gameBoard.add( new Spawner( new Car(cars.car2), 180 ) );
  gameBoard.add( new Spawner( new Car(cars.car3), 320 ) );
  gameBoard.add( new Spawner( new Car(cars.car4), 200 ) );
  gameBoard.add( new Spawner( new Car(cars.car5), 250 ) );
  gameBoard.add( new Spawner( new Trunk(trunks.trunk, { v: 100 }), 200 ) );
  gameBoard.add( new Spawner( new Trunk(trunks.trunkBackwards,
                                        { y: 480 - 48 * 7 - sprites['trunk'].h }),
                              340 ) );
  gameBoard.add( new Spawner( new Trunk(trunks.trunk,
                                        { y: 480 - 48 * 8 - sprites['trunk'].h, v: 170 }),
                              250 ) );
  gameBoard.add( new Water() );
  gameBoard.add( new Home() );
  Game.setBoard(GAME_BOARD, gameBoard);

  var stats = new GameBoard();
  stats.add( new Info() );
  Game.setBoard(STATS_BOARD, stats);
  Game.disableBoard(STATS_BOARD);
  
  Game.setBoard(TITLE_BOARD,new TitleScreen("Frogger", 
                                            "Press space to start playing",
                                            playGame));

  Game.setBoard(LOSER_BOARD,new TitleScreen("You lose!", 
                                            "Press space to play again",
                                            playGame));
  Game.disableBoard(LOSER_BOARD);

  Game.setBoard(WINNER_BOARD,new TitleScreen("You win!", 
                                            "Press space to play again",
                                            playGame));
  Game.disableBoard(WINNER_BOARD);
};

var playGame = function() {
  Game.disableBoard(TITLE_BOARD);
  Game.disableBoard(LOSER_BOARD);
  Game.disableBoard(WINNER_BOARD);
  Game.enableBoard(BG_BOARD);
  Game.enableBoard(GAME_BOARD);
  Game.enableBoard(STATS_BOARD);

  Game.removeObjFromBoard('frog', GAME_BOARD);
  Game.getBoard(GAME_BOARD).add( new Frog() );
  Game.setLives(3);
  Game.beginTime();
};

var winGame = function() {
  Game.enableBoard(WINNER_BOARD);
  Game.stopTime();
  
};

var loseGame = function() {
  Game.enableBoard(LOSER_BOARD);
  Game.stopTime();
};

var Background = function() {
  this.setup('bg');

  this.x = 0;
  this.y = 0;

  this.step = function(dt) {};
};

Background.prototype = new Sprite(0);

var Frog = function() {
  this.setup('frog', { vx: 0, jumpSpeed: 260, frame: 2 });

  this.x = Game.width/2 - this.w / 2;
  this.y = Game.height - this.h;
  // it's ok to set more reload time but never less than this formula or will turn glitchy
  this.reloadTime = Game.squareLength / this.jumpSpeed;
  this.reload = this.reloadTime;
  this.angle = 0;
  this.isMovingUp = false;
  this.isMovingDown = false;
  this.isMovingLeft = false;
  this.isMovingRight = false;

  this.step = function(dt) {
    this.reload -= dt;
    this.x += this.vx * dt;

    if (this.isMovingUp || (Game.keys['up'] && this.reload < 0)) {
      if (!this.isMovingUp) {
        this.isMovingUp = true;
        this.prevPosition = this.y;
        this.angle = 0;
        this.reload = this.reloadTime;
      }

      this.y -= this.jumpSpeed * dt;
      // if it's on the first half of the jump
      if (Game.squareLength / Math.abs(this.prevPosition - this.y) >= 2)
        this.frame = 1;
      else
        this.frame = 0;

      // if ends moving
      if (this.y <= this.prevPosition - this.h) {
        // stand on right position for the collision to work
        this.y = this.prevPosition - this.h;

        this.isMovingUp = false;
        this.frame = 2;
      }
    }
    else if (this.isMovingDown || (Game.keys['down'] && this.reload < 0)) {
      if (!this.isMovingDown) {
        this.isMovingDown = true;
        this.prevPosition = this.y;
        this.angle = 180;
        this.reload = this.reloadTime;
      }

      this.y += this.jumpSpeed * dt;
      // if it's on the first half of the jump
      if (Game.squareLength / Math.abs(this.prevPosition - this.y) >= 2)
        this.frame = 1;
      else
        this.frame = 0;

      // if ends moving
      if (this.y >= this.prevPosition + this.h) {
        // stand on right position for the collision to work
        this.y = this.prevPosition + this.h;

        this.isMovingDown = false;
        this.frame = 2;
      }
    }
    else if (this.isMovingLeft || (Game.keys['left'] && this.reload < 0)) {
      this.angle = 270;
      if (!this.isMovingLeft) {
        this.isMovingLeft = true;
        this.prevPosition = this.x;
        this.angle = 0;
        this.reload = this.reloadTime;
      }

      this.x -= this.jumpSpeed * dt;
      // if it's on the first half of the jump
      if (Game.squareLength / Math.abs(this.prevPosition - this.x) >= 2)
        this.frame = 1;
      else
        this.frame = 0;

      // if ends moving
      if (this.x <= this.prevPosition - this.w) {
        // stand on right position for the collision to work
        this.x = this.prevPosition - this.w;

        this.isMovingLeft = false;
        this.frame = 2;
      }
    }
    else if (this.isMovingRight || (Game.keys['right'] && this.reload < 0)) {
      this.angle = 90;
      if (!this.isMovingRight) {
        this.isMovingRight = true;
        this.prevPosition = this.x;
        this.angle = 180;
        this.reload = this.reloadTime;
      }

      this.x += this.jumpSpeed * dt;
      // if it's on the first half of the jump
      if (Game.squareLength / Math.abs(this.prevPosition - this.x) >= 2)
        this.frame = 1;
      else
        this.frame = 0;

      // if ends moving
      if (this.x >= this.prevPosition + this.w) {
        // stand on right position for the collision to work
        this.x = this.prevPosition + this.w;

        this.isMovingRight = false;
        this.frame = 2;
      }
    }

    // check bounds
    if (this.y < 0) {
      this.y = 0;
      this.frame = 2;
      if (this.isMovingUp) {
        this.angle = 0;
        this.isMovingUp = false;
      }
    }
    else if(this.y > Game.height - this.w) { 
      this.y = Game.height - this.w;
      this.frame = 2;
      if (this.isMovingDown) {
        this.angle = 180;
        this.isMovingDown = false;
      }
    }

    if(this.x < 0) {
      this.x = 0;
      this.frame = 2;
      if (this.isMovingLeft) {
        this.angle = 270;
        this.isMovingLeft = false;
      }
    }
    else if(this.x > Game.width - this.w) { 
      this.x = Game.width - this.w;
      this.frame = 2;
      if (this.isMovingRight) {
        this.angle = 90;
        this.isMovingRight = false;
      }
    }

    this.vx = 0;
  };

  this.toInitPos = function() {
    this.reload = this.reloadTime;
    this.frame = 2;
    this.angle = 0;
    this.isMovingUp = false;
    this.isMovingDown = false;
    this.isMovingLeft = false;
    this.isMovingRight = false;
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
  Game.subLive();
  Game.restartTime();
  this.board.add (new Death(this.x + this.w/2, 
                            this.y + this.h/2));
  this.toInitPos();

  if (Game.lives === 0) {
    if (this.board.remove(this))
      loseGame();
  }
  else {
    this.x = Game.width/2 - this.w / 2;
    this.y = Game.height - this.h;
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

  this.step = function(dt) {
    var collision = this.board.collide(this,OBJECT_FROG);
    if(collision)
      winGame();
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

var Info = function() {
  this.infoBoard = document.createElement("canvas");
  this.infoBoard.width = Game.canvasWidth; 
  this.infoBoard.height = Game.canvasHeight;
  var infoCtx = this.infoBoard.getContext("2d");
  this.originalLifeTime = this.lifeTime = 30;
  this.timeIsRunning = false;

  this.step = function(dt) {
    if (this.timeIsRunning)
      this.lifeTime -= dt;
    
    if (this.lifeTime < 0) {
      Game.hitTheFrog(GAME_BOARD);
      this.lifeTime = this.originalLifeTime;
    }
  };

  this.draw = function(ctx) {
    var percentage = this.lifeTime / this.originalLifeTime;
    infoCtx.clearRect(0,0,this.infoBoard.width, this.infoBoard.height);
    infoCtx.fillStyle="black";
    infoCtx.fillRect(0,Game.height,Game.canvasWidth,48);
    
    for (var i = 0; i < Game.lives; i++)
    infoCtx.drawImage(SpriteSheet.image,
                      sprites['frog'].sx,sprites['frog'].sy,
                      sprites['frog'].w, sprites['frog'].h,
                      Game.squareLength / 2 * i, Game.height,
                      Game.squareLength / 2, Game.squareLength / 2);

    infoCtx.fillStyle="green";
    infoCtx.fillRect(0, Game.height + Game.squareLength / 2,
                    Game.canvasWidth * percentage, Game.canvasHeight - Game.height - Game.squareLength / 2);

    // if (percentage < 0.2) {
    //   infoCtx.font = '12px bangers';
    //   infoCtx.fillStyle="red";
    //   infoCtx.fillText("YOU'RE RUNNING OUT OF TIME",5,Game.height + 35);
    // }

    ctx.drawImage(this.infoBoard,0,0);
  };

  this.beginTime = function() {
    this.lifeTime = this.originalLifeTime;
    this.timeIsRunning = true;
  };

  this.stopTime = function() {
    this.timeIsRunning = false;
  };
};

Info.prototype = new Sprite(1);


window.addEventListener("load", function() {
  Game.initialize("game",sprites,startGame);
});

// por qué no funciona el space al ganar, y hay que moverse
// por qué no funcionan las colisiones de los coches si se ponen en la rana | sí funsiona
// si está bien usar una PQueue para el zIndex | hacer un sort al meter y punto
// por qué hay una franja de 1px en la derecha que no pinta bien | bug
// cambiar zIndex a inicialización en vez de argumento (y ponerlo por defecto en la constr a un 1) | no lo veo necesario
// no sé si la cuenta del tiempo la tiene que llevar Game, y si lo tienen que decrementar de fuera (de Info?)

// para documentación;
// al usar velocidad en el salto de la rana reloadTime ya no es necesario y se espera a que termine el salto
// zIndex implementado con un pordiosero sort en el GameBoard.add
// añadida rotación para cuando salta la rana hacia los lados (objeto Frog) y método para dibujar rotando el canvax
// añadidas vidas. modificado tamaño de canvas, clase Info añadida, modificada clase Frog, modificada clase Game (1 atrib, 3 métodos añadidos)
// añadido tiempo y muerte por tiempo. métodos en Game añadidos (una chapa) y el contador en la clase Info
// TODO refactorizar la cosa horrenda del step de Frog