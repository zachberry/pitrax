Namespace('pitrax.views').AudioView = Backbone.View.extend({
	el: 'audio',

	events: {
		'ended': '_audioEndedHandler',
		'timeupdate': '_audioProgressHandler'
	},

	initialize: function(options) {
		this.model.on("change:play", this._playCurSong, this);
		this.model.on("change:resume", this._resumeCurSong, this);
		this.model.on("change:stop", this._stop, this);

		// should i be doing this here?

		$.data(document.getElementById('track-scrubber'), 'view', this);
		$( ".scrub-head" ).draggable({
			containment: "parent",
			axis: "x",
			start: function(event, ui) {
				$('.scrubber').addClass('hover');
			},
			stop: function(event, ui) {
				$('.scrubber').removeClass('hover');

				var view = $.data(document.getElementById('track-scrubber'), 'view');
				view.scrubbing = false;
			},
			drag: function(event, ui) {
				var perc = $('.scrub-head').position().left / $('.scrubber').width();

				$('.scrub-bar-progress').width((perc * 100) + '%');

				var view = $.data(document.getElementById('track-scrubber'), 'view');
				view.el.currentTime = Math.min(perc * view.el.duration, view.el.duration - 1);
				view.scrubbing = true;
			}
		});

		$.data(document.getElementById('slider'), 'view', this);
		$('#slider').slider({
			slide: function(event, ui) {
				var view = $.data(document.getElementById('slider'), 'view');
				view.el.currentTime = Math.min(ui.value / 100 * view.el.duration, view.el.duration - 1);
			}
		});
	},

	_playCurSong: function(event)
	{
		console.log(this);

		var curSong = this.model.getCurrentSong();
		this.el.src = '/play/' + curSong.get('id');
		this.el.play();

		//@HACK to skip ahead
		/*
		setTimeout(function() {
			var a = document.getElementById('audio');
			a.currentTime = a.duration - 1;
		}, 1000);*/
	},

	_resumeCurSong: function(event)
	{
		this.el.play();
	},

	_stop: function(event)
	{
		//console.log('STOP!!!');
		this.el.pause();
	},

	_audioEndedHandler: function(event)
	{
		if(this.model.autoPlay)
		{
			this.model.gotoNextSong();
		}
	},

	_audioProgressHandler: function(event)
	{
		console.log('audio progress', this.scrubbing);
		if(!this.scrubbing)
		{
			console.log('MOVE');
			var perc = this.el.currentTime / this.el.duration;
			var perc2 = perc * 100;
			$('#scrub-head').css('left', perc2 + '%');
			$('#scrub-bar-progress').css('width', perc2 + '%');


			////console.log(perc, perc / this.el.duration);
			var secsLeft = this.el.duration - perc * this.el.duration;
			var minsLeft = Math.floor(secsLeft / 60);
			secsLeft = Math.floor(secsLeft - minsLeft * 60);
			$('#time-remaining').html(("0" + minsLeft).slice(-2) + ':' + ("0" + secsLeft).slice(-2));

			$('#slider').slider({value: perc});
		}
	}
});