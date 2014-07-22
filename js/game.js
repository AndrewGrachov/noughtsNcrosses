var app = app || {};

app.Game = (function () {
	var winningCombos = [ // TEMPORARY
		[1, 2, 3],
		[4, 5, 6],
		[7, 8, 9],
		[1, 5, 9],
		[3, 5, 7],
		[2, 5, 8],
		[3, 6, 9],
		[1, 4, 7]
	];
	var states = {
		END_GAME: 'END_GAME',
		INITIAL: 'INITIAL'
	};

	var errors = {
		NO_SPACE: 'NO_SPACE',
		FIELD_BUSY: 'FIELD_BUSY',
		GAME_ENDED: 'GAME_ENDED'
	}

	function checkWinningCombos(points) { //todo: also temp
		var nulls = points.filter(function(point) { return point.type === 'null'}).map(function (point) {
			return point.square;
		});

		var crosses = points.filter(function(point) { return point.type === 'cross'}).map(function (point) {
			return point.square;
		});
		var nullsWin, crossesWin, winCombo;
		var win = $(winningCombos).each(function (index, winningCombo) {
			crossesWin = winningCombo.every(function (winComboPlace) {
				return crosses.indexOf(winComboPlace) !== -1;
			});

			nullsWin = winningCombo.every(function (winComboPlace) {
				return nulls.indexOf(winComboPlace) !== -1;
			});

			if (nullsWin || crossesWin) {
				winCombo = winningCombo;
			}
			return !nullsWin && !crossesWin;
		});
		if (crossesWin) {
			return {win: 'crosses', combo: winCombo};
		}
		if (nullsWin) {
			return {win: 'nulls', combo: winCombo};
		}		
	}

	function oddOrEven(x) {
  		return ( x & 1 ) ? "odd" : "even";
	}

	function Game(options) {
		options = options || {};
		this.points = options.points || [];
		this._points = JSON.parse(JSON.stringify(this.points));
		this._handlers = {};		
	}

	Game.prototype.addElement = function(squareNumber) {
		if (this.state == states.END_GAME) {
			return;
		}
		if (this.points.length === 9) {
			this.state = states.END_GAME;
			return {error: errors.NO_SPACE};
		}
		var elementExists = this.points.filter(function (point) {
			return point.square == squareNumber;
		}).length;

		if (elementExists) {
			return {error: errors.FIELD_BUSY};			
		}
		var type = oddOrEven(this.points.length) === 'odd' ? 'null' : 'cross';
		var point = {type: type, square: squareNumber};
		this.points.push(point);
		this._points.push(point);

		var result = checkWinningCombos(this.points);
		if (result && result.win) {
			this._win(result);
		}
		return point;
	}

	Game.prototype.back = function () {
		this.points.pop();

		return this.points;		
	}

	Game.prototype.forward = function () {
		if (this.state !== states.END_GAME || this.points.length === this._points.length) {
			return;
		}
		var point = this._points[this.points.length];
		this.points.push(point);
		var result = checkWinningCombos(this.points);
		if (result && result.win) {
			this._win(result);
		}
		return point;
	}

	Game.prototype._win = function (result) {
		this.state = states.END_GAME;
		this._emit('win', result);
	}

	Game.prototype.on = function (eventName, handler) {
		this._handlers = this._handlers;
		if (typeof handler !== 'function') {
			throw 'please attach a valid event handler'
		}
		this._handlers[eventName] = this._handlers[eventName] || [];
		this._handlers[eventName].push(handler);
	}

	Game.prototype._emit = function (eventName, data) {
		this._handlers[eventName].forEach(function (handler) {
			handler(data);
		});
	}

	return Game;
})();