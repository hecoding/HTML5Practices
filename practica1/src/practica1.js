/*jshint strict:false */

var Card = function (sprite) {
		this.nombre = sprite;
		this.estado = this.states.BOCA_ABAJO;
	};

// este objeto con prototype porque, al contrario que MemoryGame, se van a crear varias cartas y así comparten código
Card.prototype = {
	states : {
		BOCA_ABAJO : 0,
		BOCA_ARRIBA : 1,
		ENCONTRADA : 2
	},

	flip : function() {
		if (this.estado === this.BOCA_ABAJO)
			this.estado = this.BOCA_ARRIBA;

		else if (this.estado === this.BOCA_ARRIBA)
			this.estado = this.BOCA_ABAJO;
	},

	found : function() {
		this.estado = this.ENCONTRADA;
	},

	compareTo : function (otherCard) {
		return this.nombre == otherCard.nombre;
	},

	draw : function (gs, pos) {
		if (this.estado === this.states.BOCA_ABAJO)
			gs.draw ("back", pos);
		else
			gs.draw (this.nombre , pos);
	}
};

var MemoryGame = function (gs) {
	this.gs = gs;
	this.cards = [];
	this.finished = false;
	this.messageState = "Memory Game";
	this.card_lock = false;

	this.initGame = function() {
		
		this.cards = [ new Card ("8-ball"), new Card ("potato"), new Card ("dinosaur"),
						new Card ("kronos"), new Card ("rocket"), new Card ("unicorn"),
						new Card ("guy"), new Card ("zeppelin") ];

		for (var i = 0, len = this.cards.length; i < len; i++) {
			this.cards[len + i] = new Card (this.cards[i].nombre);
		}

		this.cards = shuffle (this.cards);

		this.loop();
	};

	this.draw = function() {
		this.gs.drawMessage (this.messageState);

		for (var i = 0; i < this.cards.length; i++)
			this.cards[i].draw(this.gs, i);
	};

	this.loop = function() {
		var self = this;
		setInterval (function() {self.draw();}, 16);
	};

	this.onClick = function (cardId) {
		if (this.card_lock === false) {
			var i;

			this.cards[cardId].estado = Card.prototype.states.BOCA_ARRIBA;

			for (i = 0; i < this.cards.length; i++) {
				if (i != cardId && this.cards[i].estado == Card.prototype.states.BOCA_ARRIBA) {
					if (this.cards[i].nombre == this.cards[cardId].nombre) {
						this.cards[i].estado.found();
						this.cards[cardId].found();

						this.messageState = "Match found!";
					}
					else {
						this.card_lock = true;
						var self = this;
						var index = i;
						var id = cardId;
						setTimeout (function() {
							self.cards[index].estado = self.cards[id].estado = Card.prototype.states.BOCA_ABAJO;
							self.card_lock = false;
						}, 1000);
						
						this.messageState = "Try again";
					}
				}
			}

			var end = true;
			for (i = 0; i < this.cards.length; i++) {
				if (this.cards[i].estado != Card.prototype.states.ENCONTRADA)
					end = false;
			}

			if (end) {
				this.messageState = "You win!";
				this.card_lock = true;
			}
		}
	};
};

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

// preguntar si el Card.prototype.states del onClick() está bien