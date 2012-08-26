Namespace('pitrax.views').HistoryView = Backbone.View.extend({
	el: '#queue',
	tagName: 'ul',

	//@TODO - ugly - we listen for every single change event!
	initialize: function(options) {
		this.model.on('change:history', this.render, this);
		this.model.on('change:play', this.render, this);
		//console.log('historyview', this.$el);
	},

	render: function() {
		//console.log('historyview render', this.$el);
		this.$el.empty();
		var songHistory = this.model.songHistory;
		var len = songHistory.length;
		var currentSongIndex = this.model.getCurrentSongIndex();
		for(var i = len - 1; i >= 0; i--)
		{
			var songView = new pitrax.views.QueueItemView({model: songHistory[i], position: i});
			songView.on('select:history', this.selectSongHandler, this);
			songView.render();
			this.$el.append(songView.$el);
			console.log(this.model.playing, currentSongIndex);
			if(this.model.playing && i === currentSongIndex)
			{
				songView.$el.addClass('playing');
			}
		}
	},

	selectSongHandler: function(historyIndex) {
		console.log('historyIndex', historyIndex);
		//this.model.gotoSongAtIndex(_.indexOf(this.model.songHistory, song));
		this.model.gotoSongAtIndex(historyIndex);
	}
});