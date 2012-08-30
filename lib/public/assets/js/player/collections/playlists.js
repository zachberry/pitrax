Namespace('pitrax.collections').Playlists = Backbone.Collection.extend({
	model: pitrax.models.Playlist,

	selectPlaylist: function(models, options) {
		this.curPlaylist = models; //@TODO - is this right?!
		this.trigger('select:playlist', this.curPlaylist);
	},

	getCurrentPlaylist: function() {
		return this.curPlaylist;
	}
});