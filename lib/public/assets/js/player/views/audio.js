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
		var perc = this.currentTime / this.duration * 100;
		$('#scrub-head').css('left', perc + '%');
		$('#scrub-bar-progress').css('width', perc + '%');
	}
});