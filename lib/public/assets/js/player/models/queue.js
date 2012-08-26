//@TODO - A queue and a playlist should contain a songs collection
	//@TODO - A queue shouldn't contain a playlist
Namespace('pitrax.models').Queue = Backbone.Model.extend({
	playing: false,
	curIndex: -1,
	autoPlay: true,
	songHistory: [],
	rangesLoading: {},
	selected: [],

	play: function(song) {
		//console.log('play');
		if(typeof song !== 'undefined')
		{
			// do nothing if we are already playing the requested song
			if(song === this.getCurrentSong())
			{
				return;
			}

			// stop the current song
			this.stopCurrentSong();
			this.deselectCurrentSong();

			// trim any songs in our future
			this.songHistory.splice(this.curIndex + 1, this.songHistory.length - this.curIndex - 1);

			// point to the head of our history list and play
			this.addSongToHistory(song);
			this.curIndex = this.songHistory.length - 1;
			this.playCurrentSong();
		}
		else
		{
			// if we haven't played any songs yet...
			if(typeof this.getCurrentSong() === 'undefined')
			{
				// ... play the first one.
				this.gotoNextSong();
			}
			else
			{
				// otherwise resume the currently paused song.
				this.resumeCurrentSong();
			}
		}
	},

	stop: function() {
		this.stopCurrentSong();
	},

	stopCurrentSong: function() {
		var song = this.getCurrentSong();
		if(typeof song !== 'undefined')
		{
			song.set({playing: false});

			this.playing = false;
			this.trigger('change:stop', song);
		}
	},

	deselectCurrentSong: function() {
		var song = this.getCurrentSong();
		if(typeof song !== 'undefined')
		{
			song.set({selected: false});
		}
	},

	playCurrentSong: function() {
		//console.log('playCurrentSong');

		var song = this.getCurrentSong();
		//console.log(song);
		if(typeof song !== 'undefined')
		{
			song.set({
				playing: true,
				selected: true
			});

			this.playing = true;
			this.trigger('change:play', song);
		}
	},

	resumeCurrentSong: function() {
		var song = this.getCurrentSong();
		if(typeof song !== 'undefined')
		{
			song.set({playing: true});

			this.playing = true;
			this.trigger('change:resume', song);
		}
	},

	togglePlay: function() {
		//console.log('Queue::togglePlay');
		if(this.playing)
		{
			this.stop();
		}
		else
		{
			this.play();
		}
	},

	getCurrentSong: function() {
		return this.songHistory[this.curIndex];
	},

	getCurrentSongIndex: function() {
		return this.curIndex;
	},

	gotoPrevSong: function() {
		//this.curIndex = Math.max(0, this.curIndex - 1);
		//return this.getCurrentSong();
		if(this.curIndex > 0)
		{
			this.stopCurrentSong();
			this.deselectCurrentSong();
			this.curIndex--;
			this.playCurrentSong();
		}
	},

	gotoNextSong: function() {
		// if we have run out of songs to play then grab the next one from the playlist:
		// (also works if no songs have been played yet since songHistory = [] and curIndex = -1)
		if(this.curIndex === this.songHistory.length - 1)
		{
			var nextSong = this.get('playlist').getNextSong(this.getCurrentSong());
			//console.log(nextSong);
			if(typeof nextSong !== 'undefined')
			{
				this.play(nextSong);
			}
		}
		else
		{
			this.stopCurrentSong();
			this.deselectCurrentSong();
			this.curIndex++;
			this.playCurrentSong();
		}
	},

	gotoSongAtIndex: function(index) {
		if(index >= 0 && index < this.songHistory.length)
		{
			this.stopCurrentSong();
			this.deselectCurrentSong();
			this.curIndex = index;
			this.playCurrentSong();
		}
	},

	addSongToHistory: function(song, insertAtNext) {
		insertAtNext = insertAtNext || false;
		if(insertAtNext)
		{
			this.songHistory.splice(this.curIndex + 1, 0, song);
		}
		else
		{
			this.songHistory.push(song);
		}

		this.trigger('change:history');
	}
});