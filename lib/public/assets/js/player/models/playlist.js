//@TODO - A queue and a playlist should contain a songs collection
	//@TODO - A queue shouldn't contain a playlist
Namespace('pitrax.models').Playlist = Backbone.Model.extend({
	songs: false,
	total: 0,

	url: '/songs', //@TODO - this is wrong!

	initialize: function(options) {
		this.title = options.title;
		this.total = options.total;
		this.songs = options.songs;
	},

	add: function(models, options) {
		this.songs.add(models, options);
	},

	filterSongsBySearch: function(searchString) {

	},

	swap: function(song1, song2) {

	},

	// gets the song after the song given.
	// if undefined then gets the first song.
	getNextSong: function(song) {
		//var index = (typeof song === 'undefined' ? 0 : this.indexOfSong(song) + 1);
		var index = (typeof song === 'undefined' ? 0 : this.songs.getIndexOf(song) + 1);
		return (index === this.songs.length ? undefined : this.songs.at(index));
	}
});