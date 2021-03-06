app = app || {};
app.gameManager = (function () {

	function generateUUID() {
	    var d = new Date().getTime();
	    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	        var r = (d + Math.random()*16)%16 | 0;
	        d = Math.floor(d/16);
	        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
	    });
	    return uuid;
	};

	var gameManager = {
		newGame: function () {
			app.areaManager.init();
		},
		save: function (game) {
			game.uuid = game.uuid || generateUUID();
			localStorage.setItem(game.uuid, game.toJSON());
		},
		load: function (uuid) {
			var options = JSON.parse(localStorage.getItem(uuid));
			app.areaManager.init({game: new app.Game(options)});
		},
		getSavedGames: function () {
			return Object.keys(localStorage);
		}
	}
	return gameManager;
})();