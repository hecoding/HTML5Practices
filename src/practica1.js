var MemoryGame = function (gs) {
	this.gs = gs;
	this.cards = new Array (); // poner las cartas
	this.finished = false;
	this.messageState = "Welcome"; // mirar el mensaje que se muestra

	this.Card = function (sprite) {
		this.nombre = sprite;
		this.estado = this.states.boca_abajo;
	};

	// este objeto con prototype porque, al contrario que MemoryGame, se van a crear varias cartas y así comparten código
	Card.prototype = {
		var states = new enum {"boca_abajo", "boca_arriba", "encontrada"};

		flip : function() {
			if (this.estado === this.states.boca_abajo)
				this.estado = this.states.boca_arriba;

			else if (this.estado === this.states.boca_arriba)
				this.estado = this.states.boca_abajo;
		},

		found : function() {
			this.estado = this.states.encontrada;
		},

		compareTo : function (otherCard) {
			return this.nombre == otherCard.nombre;
		},

		draw : function (gs, pos) {
			gs.draw (this.nombre , pos); // no estoy seguro de esto
		}
	};

	this.initGame = function() {
		this.gs.load ()

		this.loop();
	};

	this.draw = function() {
		this.gs.drawMessage (this.messageState);

		for (card in this.cards)
			card.draw(this.gs, pos) // que cojones se pone en pos
	};

	this.loop = function() {
		//that = this; si no va hacer el that
		setInterval (this.draw, 16)
	};

	this.onClick = function (cardId) {
		var companera_levantada = false;
		var i;

		if (this.cards[cardId].estado == Card.states.boca_abajo) { // está bien acceder a esto?
			this.cards[cardId].estado = Card.states.boca_arriba;

			for (i = 0; i < this.cards.length; i++) {
				if (i != cardId) {
					if (this.cards[i].estado == Card.states.boca_arriba && this.cards[i].nombre == this.cards[cardId].nombre) {
						this.cards[i].estado = this.cards[cardId].estado = Card.states.encontrada;

						companera_levantada = true;
						// mensaje: encontrado
					}
				}
			}

			//if (companera_levantada === false) mensaje: try again
		}
	};
};