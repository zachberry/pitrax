/*
The general idea is to organize your interface into logical views, backed by models, each of which can be updated independently when the model changes, without having to redraw the page. Instead of digging into a JSON object, looking up an element in the DOM, and updating the HTML by hand, you can bind your view's render function to the model's "change" event — and now everywhere that model data is displayed in the UI, it is always immediately up to date.
*/

//@TODO
// so right now a Song has a selected and playing flag.
// not sure if this is right.
// Need to cache views!


// songs collection contains all the songs
// playlists collection contain the playlists
// we make a playlist that holds all the songs
// a queue contains a playlist
// most of our views use a queue to render
// we change the playlist of the queue to change the selected playlist


$(function() {
	var player;
	var Player = Backbone.View.extend({
		el: document,

		libraryPlaylist: false,
		queue: false,
		playlists: false,
		audioView: false,
		libraryView: false,
		playlistsView: false,
		controlsView: false,
		headerView: false,
		historyView: false,

		events: {
			'keyup': 'keyHandler'
		},

		initialize: function(options) {
			// create the main library playlist
			/*
			var len = songs.length;
			var songIds = [];
			for(var i = 0; i < len; i++)
			{
				songIds.push(songs.models[i].id);
			}*/
			var songs = new pitrax.collections.Songs(options.songs, {total:options.total});

			this.libraryPlaylist = new pitrax.models.Playlist({total:options.total, songs:songs});

			// create the playlists collection
			this.playlists = new pitrax.collections.Playlists(options.playlists);

			// create the queue
			//this.queue = new Queue({playlist:this.playlists.get(1)});
			this.queue = new pitrax.models.Queue({playlist:this.libraryPlaylist});

			// create the audio view
			this.audioView = new pitrax.views.AudioView({model:this.queue});

			// create the master playlist view
			this.libraryView = new pitrax.views.LibraryView({model:this.queue});
			
			// controls
			this.controlsView = new pitrax.views.ControlsView({model:this.queue});

			// header
			this.headerView = new pitrax.views.HeaderView({model:this.queue});

			this.playlistsView = new pitrax.views.PlaylistsView({collection:this.playlists});

			this.historyView = new pitrax.views.HistoryView({model:this.queue});

			//var libraryTableView = new LibraryTableView({model:this.queue, range:[6, 66]});
			//libraryTableView.show();

			// hookup events
			this.playlists.on('select:playlist', function(playlist) {
				console.log('playlist', playlist);
				console.log('libraryPlaylist', this.libraryPlaylist);

				console.log(playlist || this.libraryPlaylist);
				this.queue.set('playlist', playlist || this.libraryPlaylist);
			}, this);

			this.libraryView.on('search', function(searchString) {
				if(searchString.length === 0)
				{
					alert('goin back');
					this.queue.set({playlist:this.libraryPlaylist});
				}
				else
				{
					//@TODO: shouldnt have to prime the pump here!
					$.ajax({
						url: '/songs/0-149?s=' + searchString,
						context: this,
						success: function(result) {
							console.log('success');
							var json = $.parseJSON(result);
							var songsCollection = new pitrax.collections.Songs(json.songs, {total:json.total, search:json.search});
							var searchPlaylist = new pitrax.models.Playlist({total:songs.length, songs:songsCollection});
							this.queue.set({playlist:searchPlaylist});
						}
					});
				}
				
			}, this);
		},

		render: function() {
			this.libraryView.render();
			this.playlistsView.render();

			return this;
		},

		keyHandler: function(event) {
			//console.log('KEY HANLDER', event.keyCode);
			if(event.keyCode === 32 && !event.shiftKey && !event.altKey && !event.ctrlKey)
			{
				this.queue.togglePlay();
			}
			else if(event.keyCode === 37 && event.shiftKey && !event.altKey && !event.ctrlKey)
			{
				this.queue.gotoPrevSong();
			}
			else if(event.keyCode === 39 && event.shiftKey && !event.altKey && !event.ctrlKey)
			{
				this.queue.gotoNextSong();
			}
		}
	});

	player = new Player({songs:_songSet.songs, total:_songSet.total, playlists:_playlists});
	player.render();

	// api methods //@TODO
	/*
	if(typeof window.pitrax === 'undefined')
	{
		pitrax = {};
		pitrax.queue = appView.queue;
		pitrax.playlists = appView.playlists;
	}*/

});