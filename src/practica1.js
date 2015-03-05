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
		gs.draw (this.nombre , pos); // no estoy seguro de esto
	}
};

var MemoryGame = function (gs) {
	this.gs = gs;
	this.cards = new Array( new Card ("8-ball"), new Card ("8-ball"),
							new Card ("back"), new Card ("back"),
							new Card ("potato"), new Card ("potato"),
							new Card ("dinosaur"), new Card ("dinosaur"),
							new Card ("kronos"), new Card ("kronos"),
							new Card ("rocket"), new Card ("rocket"),
							new Card ("unicorn"), new Card ("unicorn"),
							new Card ("guy"), new Card ("guy"),
							new Card ("zeppelin"), new Card ("zeppelin") );
	// this.cards.shuffle();
	this.finished = false;
	this.messageState = "Memory Game";

	this.initGame = function() {
		this.gs.load ()

		this.loop();
	};

	this.draw = function() {
		this.gs.drawMessage (this.messageState);

		for (card in this.cards)
			card.draw(this.gs, pos) // qué se pone en pos?
	};

	this.loop = function() {
		//that = this; si no va hacer el that
		setInterval (this.draw, 16)
	};

	this.onClick = function (cardId) {
		var companera_levantada = false;
		var i;

		if (this.cards[cardId].estado == Card.BOCA_ABAJO) {
			this.cards[cardId].estado = Card.BOCA_ARRIBA;

			for (i = 0; i < this.cards.length; i++) {
				if (i != cardId) {
					if (this.cards[i].estado == Card.BOCA_ARRIBA && this.cards[i].nombre == this.cards[cardId].nombre) {
						this.cards[i].estado = this.cards[cardId].estado = Card.ENCONTRADA;

						companera_levantada = true;
						// mensaje: encontrado
					}
				}
			}

			//if (companera_levantada === false) mensaje: try again
		}
	};
};



// cómo hacer el enum de Card (no se puede declarar en prototype?)
// cómo poner el array de cartas
// draw de MemoryGame y de Card