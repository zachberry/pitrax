Namespace('pitrax.views').PlaylistsView = Backbone.View.extend({
	el: '#playlists',
	tagName: 'ul',

	initialize: function() {
		this.collection.on('select:playlist', this.render, this);
	},

	render: function() {
		this.$el.empty();

		console.log('__render!');
		//console.log(this.collection.models);
		var curPlaylist = this.collection.getCurrentPlaylist();
		console.log('compare', curPlaylist);

		for(var i in this.collection.models)
		{
			var playlistView = new PlaylistView({model: this.collection.models[i]});
			playlistView.on('select:playlist', this.selectPlaylistHandler, this);
			var $playlist = playlistView.render().$el;
			console.log('to', this.collection.models[i]);
			if(this.collection.models[i] === curPlaylist)
			{
				$playlist.css('font-weight', 'bold');
			}
			this.$el.append($playlist);
		}
		this.$el.append('<li>+</li>');

		return this;
	},

	selectPlaylistHandler: function(playlist) {
		console.log('PlaylistsView::selectPlaylistHandler', playlist, this);
		//this.trigger('select:playlist', playlist, this);
		this.collection.selectPlaylist(this.collection.getCurrentPlaylist() === playlist ? undefined : playlist);
	}
});