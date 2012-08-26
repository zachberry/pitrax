Namespace('pitrax.collections').Playlists = Backbone.Collection.extend({
	model: pitrax.models.Playlist,
	curPlaylist: false,

	selectPlaylist: function(playlist) {
		this.curPlaylist = playlist;
		this.trigger('select:playlist', this.curPlaylist);
	},

	getCurrentPlaylist: function() {
		return this.curPlaylist;
	}
});