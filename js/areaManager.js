var app = app || {};
app.areaManager = (function () {

	var game;
	var $element;
	var $saveButton;
	var $loadButton;
	var $backButton;
	var $forwardButton;
	var context;
	var RADIUS = 50;

	function resolveSquare(xOffset, yOffset) {
		return Math.ceil(xOffset / 200) + (Math.floor(yOffset / 200) * 3);	
	}

	function addElement(event) {
		var squareNumber = resolveSquare(event.offsetX, event.offsetY);
		var point = game.addElement(squareNumber);
		if (point && !point.error) {
			paintMan[point.type](resolvePointFor(point.square));
		}
	}

	function win(result) {	
		var startPoint = resolvePointFor(result.combo[0]);
		var endPoint = resolvePointFor(result.combo[2])
		context.moveTo(startPoint.x, startPoint.y);
		context.lineTo(endPoint.x, endPoint.y);
		context.stroke();

		$forwardButton.toggleClass('hidden', false);
		toastr.success(result.win + ' win');
	}

	function resolvePointFor(number) {

		var ceil = Math.ceil(number/3);
		var xLineNumber = number - 3 * (ceil - 1);
		var x = 100 + (xLineNumber-1) * 200;

		var yLineNumber = 1 * ceil;
		var y = 100 + (yLineNumber - 1) * 200;

		return { x : x, y: y };
	}

	function drawGrid() {
		context.beginPath();
		context.moveTo(200, 0);
		context.lineTo(200, 600);
		context.moveTo(400, 0);
		context.lineTo(400, 600);
		context.moveTo(0, 200);
		context.lineTo(600, 200);
		context.moveTo(0, 400);
		context.lineTo(600, 400);

		context.stroke();
	}
	var paintMan = {
		null: function (point) {
			context.beginPath();
      		context.arc(point.x, point.y, RADIUS, 0, 2 * Math.PI, false);
      		context.stroke();
		},
		cross: function (point) {
			context.beginPath();
			context.moveTo(point.x - RADIUS, point.y - RADIUS);
			context.lineTo(point.x + RADIUS, point.y + RADIUS);
			context.moveTo(point.x + RADIUS, point.y - RADIUS);
			context.lineTo(point.x - RADIUS, point.y + RADIUS);
			context.stroke();
		}
	}

	function declareElements() {
		$element = $('#game-field');
		$backButton = $('#back-button');
		$newButton = $('#new-button');
		$forwardButton = $('#forward-button');
		$saveButton = $('#save-btn');
		$loadButton = $('#load-btn');
		$element.attr('width', 600);
		$element.attr('height', 600);
		context = $element[0].getContext('2d');
	}

	function bindEvents() {
		$element.off('click').on('click', addElement);
		$backButton.on('click', back);
		$forwardButton.on('click', forward);
		$saveButton.off('click').on('click', save);
		$loadButton.off('click').on('click', showLoadModal);
		$newButton.click(newGame);
	}

	function back() {
		var points = game.back();
		areaManager.render(points);
	}

	function save() {
		app.gameManager.save(game);
		toastr.success('Saved');
	}
	function newGame() {
		app.gameManager.newGame();
		toastr.success('New game started!');
	}

	function showLoadModal() {		
		var games = app.gameManager.getSavedGames();
		var $games = $('<ul></ul>');
		games.forEach(function (game) {
			$games.append($('<li class="pointer">' + game + '</li>'));
		});
		$('.modal-body').html($games);
		$games.find('li').click(load);
		$('#modal').modal();
	}

	function load() {
		$('#modal').modal('hide');
		var id = $(this).text();
		app.gameManager.load(id);
		toastr.warning('loaded');
	}

	function forward() {
		var element = game.forward();		
		if (element) {
			var point = resolvePointFor(element.square);
			paintMan[element.type](point);
		}
	}

	var areaManager = {
		init: function (options) {
			options = options || {};
			game = options.game || new app.Game();
			declareElements();
			bindEvents();
			areaManager.render(game.points);
			game.on('win', win);
			game.checkWinningCombos();
			var ended = game.state === 'END_GAME';
			$forwardButton.toggleClass('hidden', !ended);

		},
		render: function (elements) {
			//iterate over config here
			$element[0].width = $element[0].width;
			drawGrid();
			elements = elements || [];
			elements.forEach(function (element) {
				var point = resolvePointFor(element.square);
				paintMan[element.type](point);
			});
		}
	}
	return areaManager;		
})();