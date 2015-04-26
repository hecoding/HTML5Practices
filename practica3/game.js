/*jshint strict: false, undef: false, unused: false, quotmark: false, sub: true */

var game = function () {

	// set development to false when finished
	var Q = window.Q = Quintus({ development:true })
								.include("Sprites, Scenes, Input, UI, Touch, TMX, Anim, 2D")
								.setup({ width: 320, height: 480 })
								.controls().touch();



	Q.loadTMX("level.tmx, mario_small.png, mario_small.json", function() {
		Q.compileSheets("mario_small.png","mario_small.json");
		Q.stageScene("level1");
	});

	Q.scene("level1", function(stage) {
		Q.stageTMX("level.tmx",stage);
		stage.add("viewport");//.follow(Q("Player").first());

		stage.centerOn(150, 380);
	});

};