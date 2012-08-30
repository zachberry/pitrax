//@TODO - A queue and a playlist should contain a songs collection
	//@TODO - A queue shouldn't contain a playlist
Namespace('pitrax.models').Playlist = Backbone.Model.extend({
	

	initialize: function(attribs) {
		this.title = attribs.title;
		/*this.total = attribs.total;*/
		this.songs = attribs.songs;
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
	},

	//@TODO
	getRandomSong: function() {
		var n = Math.floor(Math.random() * this.songs.total);

	}
});