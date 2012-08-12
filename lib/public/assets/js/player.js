/*
The general idea is to organize your interface into logical views, backed by models, each of which can be updated independently when the model changes, without having to redraw the page. Instead of digging into a JSON object, looking up an element in the DOM, and updating the HTML by hand, you can bind your view's render function to the model's "change" event — and now everywhere that model data is displayed in the UI, it is always immediately up to date.
*/
$(function() {
	var appView;

	// models //
	var Song = Backbone.Model.extend({
		editID3Tag: function() {
			//...do stuff...

			this.save();
		}
	});
	var Playlist = Backbone.Model.extend({
		model: Song,
		songs: [],
		url: '/songs',
		title: 'Untitled playlist',

		reset: function(songObjectArray) {
			this.songs = [];

			//@TODO: Can this be optimized?
			var len = songObjectArray.length;
			for(var i = 0; i < len; i++)
			{
				this.songs.push(new this.model(songObjectArray[i]));
			}
		},

		add: function(songObject) {
			this.songs.push(new this.model(songObject));
		},

		filterSongsBySearch: function(searchString) {

		},

		swap: function(song1, song2) {

		}
	});

	// collections //
	var Playlists = Backbone.Collection.extend({
		model: Playlist
	});
	var Queue = Playlist.extend({
		curIndex: 0,

		getCurrentSong: function() {
			return songs[curIndex];
		},

		gotoPrevSong: function() {
			curIndex = Math.max(0, curIndex - 1);
			return getCurrentSong();
		},

		gotoNextSong: function() {
			curIndex = Math.min(songs.length - 1, curIndex + 1);
			return getCurrentSong();
		}
	});

	//@TODO
	//var library = new Playlist

	// views //
	var AudioView = Backbone.Model.extend({
		el: document.getElementById('audio'),
		currentSong: undefined,
		playing: false,

		play: function(song) {
			console.log('Audio::play', song);
			console.log(this.el);
			if(typeof song !== 'undefined')
			{
				this.currentSong = song;
				this.el.src = '/play?file=' + encodeURI(song.get('path'));
			}
			this.el.play();
		},

		stop: function(song) {
			this.el.stop();
			this.playing = false;
		},

		seekTo: function(pos) {
			//@TODO
		},

		togglePlay: function() {
			if(this.playing)
			{
				this.stop();
			}
			else
			{
				this.play();
			}
		}
	});
	var SongView = Backbone.View.extend(_.extend({}, Backbone.Events, {
		events: {
			'click': "clickHandler"
		},
		tagName: 'tr',
		template: _.template(
			"<td><%= artist %></td>" +
			"<td><%= album %></td>" +
			"<td><%= title %></td>" +
			"<td>1</td>" +
			"<td>2:12</td>" +
			"<td>teknoz</td>"
		),

		render: function() {
			//console.log('SongView::render', this.model);
			this.$el.html(this.template(this.model.attributes));

			return this;
		},

		clickHandler: function(event) {
			console.log('click handler');
			console.log(event);
			this.trigger('selectSong', this);
		}
	}));
	var PlaylistView = Backbone.View.extend({
		tagName: 'li',
		template: _.template("<%= title %>"),

		render: function() {
			this.$el.html(this.template(this.model));

			return this;
		}
	});
	var LibraryView = Backbone.View.extend(_.extend({}, Backbone.Events, {
		el: 'table',

		initialize: function(options) {
			////////_(this).bindAll('add');
			//this.collection.bind('add', this.add);
		},

		/*reset: function() {

		},*/
		selectSongHandler: function(songView) {
			this.$el.find('tr')
				.removeClass('selected')
				.removeClass('playing');

			this.trigger('selectSong', songView);

			songView.$el
				.addClass('selected')
				.addClass('playing');
		},

		render: function() {
			/*
			for(var i in this.collection.models)
			{
				var songView = new SongView({model: this.collection.models[i]});
				this.$el.append(songView.render().el);
			}*/
			console.log('LibraryView model', this.model);
			for(var i in this.model.songs)
			{
				var songView = new SongView({model: this.model.songs[i]});
				songView.on('selectSong', this.selectSongHandler, this);
				this.$el.append(songView.render().el);
			}

			return this;
		}

		/*add: function(m)
		{
			var songView = new SongView({model: m});
			songView.render();
		}*/
	}));
	var SidebarView = Backbone.View.extend({
		el: $('aside')
	});
	var PlaylistsView = Backbone.View.extend({
		tagName: 'ul',

		initialize: function() {
			_(this).bindAll('add');
			this.collection.bind('add', this.add);
		},

		add: function(m)
		{
			var playlistView = new PlaylistView({model: m});
			playlistView.render();
		},

		render: function() {
			for(var i in this.collection.models)
			{
				var playlistView = new PlaylistView({model: this.collection.models[i]});
				this.$el.append(playlistView.render().el);
			}

			return this;
		}
	});
	var ControlsView = Backbone.View.extend({
		el: $('header')

	});
	var AppView = Backbone.View.extend({
		songs: undefined,
		audioView: undefined,
		libraryView: undefined,
		playlistsView: undefined,

		initialize: function(options) {
			// create the audio view
			this.audioView = new AudioView();

			// create the master playlist
			this.songs = new Playlist();
			this.songs.reset(options.songs);
			
			// render the master playlist
			this.libraryView = new LibraryView({model:this.songs});
			
			// hook-up events
			this.libraryView.on('selectSong', function(songView) {
				this.audioView.play(songView.model);
			}, this);
		},

		render: function() {
			this.libraryView.render();

			return this;
		}
	});

	appView = new AppView({songs:_songs});
	appView.render();

/*
	// create the playlists
	var p1 = new Playlist();
	var s = new Song(_songs[0]);
	p1.add(s);
	console.log('s', s);
	console.log('p1', p1);
	var p2 = new Playlist();
	p2.add(_songs[1]);
	var playlists = new Playlists();
	console.log('playlists', playlists);
	playlists.add(p1);
	playlists.add(p2);
	var playlistsView = new PlaylistsView({collection: playlists});
	$('aside').append(playlistsView.render().el);
*/
	
	//audioView.play(new Song(_songs[0]));


	
});