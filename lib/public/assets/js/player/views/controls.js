Namespace('pitrax.views').ControlsView = Backbone.View.extend({
	el: '#controls',

	events: {
		'click #play-pause-button': 'clickHandler',
		'click #prev-track-button': 'clickHandler',
		'click #next-track-button': 'clickHandler'
	},

	initialize: function(options) {
		this.model.on('change:play', this.render, this);
		this.model.on('change:stop', this.render, this);
		this.model.on('change:resume', this.render, this);
	},

	clickHandler: function(event) {
		//console.log('ControlsView::clickHandler');
		//console.log(event);
		switch(event.target.id)
		{
			case 'play-pause-button':
				this.model.togglePlay();
				break;
			case 'prev-track-button':
				this.model.gotoPrevSong();
				break;
			case 'next-track-button':
				this.model.gotoNextSong();
				break;
		}
	},

	render: function() {
		console.log('we render');
		var $playButton = this.$el.find('.play-pause-button');
		$playButton.removeClass('playing').removeClass('paused');
		if(this.model.playing)
		{
			$playButton.addClass('playing');
		}
		else
		{
			$playButton.addClass('paused');
		}
	}

});