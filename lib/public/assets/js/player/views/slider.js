Namespace('pitrax.views').AudioView = Backbone.Model.extend({
	initialize: function(options) {
		// define our element here when the DOM should be ready
		// doesn't seem to work otherwise
		this.el = document.getElementById('audio');

		options.model.on("change:play", this._playCurSong, this);
		options.model.on("change:resume", this._resumeCurSong, this);
		options.model.on("change:stop", this._stop, this);

		//this.el.addEventListener('ended', this._audioEndedHandler, this);
		// backbone doesn't seem to want to delegate this event
		// so I have to do it the ugly way:
		$(this.el)
			.on('ended', {view:this}, this._audioEndedHandler)
			.on('timeupdate', {view:this}, this._audioProgressHandler);

		// should i be doing this here?

		$.data(document.getElementById('track-scrubber'), 'view', this);
		$( ".scrub-head" ).draggable({
			containment: "parent",
			start: function(event, ui) {
				$('.scrubber').addClass('hover');
			},
			stop: function(event, ui) {
				$('.scrubber').removeClass('hover');
			},
			drag: function(event, ui) {
				console.log($('.scrub-head').offset().left, '/',  $('.scrubber').width())
				var perc = $('.scrub-head').position().left / $('.scrubber').width();
				console.log(perc);

				$('.scrub-bar-progress').width((perc * 100) + '%');

				var view = $.data(document.getElementById('track-scrubber'), 'view');
				view.el.currentTime = Math.min(perc * view.el.duration, view.el.duration - 1);
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

		var curSong = this.get('model').getCurrentSong();
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
		//console.log('audio ended');
		//console.log(event);
		//console.log(this);

		var thisView = event.data.view;
		if(thisView.get('model').autoPlay)
		{
			thisView.get('model').gotoNextSong();
		}
	},

	_audioProgressHandler: function(event)
	{
		var perc = this.currentTime / this.duration;
		var perc2 = perc * 100;
		$('#scrub-head').css('left', perc2 + '%');
		$('#scrub-bar-progress').css('width', perc2 + '%');


		console.log(perc, perc / this.duration);
		var secsLeft = this.duration - perc * this.duration;
		var minsLeft = Math.floor(secsLeft / 60);
		secsLeft = Math.floor(secsLeft - minsLeft * 60);
		$('#time-remaining').html(("0" + minsLeft).slice(-2) + ':' + ("0" + secsLeft).slice(-2));

		$('#slider').slider({value: perc});
	}
});