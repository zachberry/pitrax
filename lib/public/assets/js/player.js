/*
The general idea is to organize your interface into logical views, backed by models, each of which can be updated independently when the model changes, without having to redraw the page. Instead of digging into a JSON object, looking up an element in the DOM, and updating the HTML by hand, you can bind your view's render function to the model's "change" event — and now everywhere that model data is displayed in the UI, it is always immediately up to date.
*/

// so right now a Song has a selected and playing flag.
// not sure if this is right.


$(function() {
	var appView;

	// models //
	var Song = Backbone.Model.extend({
		selected: false,
		playing: false,

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
	var Queue = Playlist.extend({
		curSong: false,
		playing: false,
		curIndex: 0,

		play: function(song) {
			console.log('Queue::play', song);

			// if we are resuming play...
			if((typeof song === 'undefined' && typeof this.curSong !== 'undefined') || this.curSong === song)
			{
				// ... give song the playing state and trigger a resume
				this.curSong.set({playing: true});
				this.playing = true;
				this.trigger('change:resume');
			}
			else
			{
				console.log(this);
				// stop previous song
				if(this.curSong)
				{
					this.curSong.set({
						playing: false,
						selected: false
					});
				}

				// set the new curSong
				this.curSong = song;

				// start playing the new song
				this.curSong.set({
					playing: true,
					selected: true
				});

				// set our playing state and trigger a play
				this.playing = true;
				this.trigger('change:play');
			}
		},

		stop: function() {
			if(typeof this.curSong !== 'undefined')
			{
				this.curSong.set({playing: false});
			}

			this.playing = false;
			this.trigger('change:stop');
		},

		togglePlay: function() {
			console.log('Queue::togglePlay');
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

	// collections //
	var Playlists = Backbone.Collection.extend({
		model: Playlist
	});
	

	//@TODO
	//var library = new Playlist

	// views //
	var AudioView = Backbone.Model.extend({
		el: document.getElementById('audio'),

		initialize: function(options) {
			options.model.on("change:play", this._playCurSong, this);
			options.model.on("change:resume", this._resumeCurSong, this);
			options.model.on("change:stop", this._stop, this);
		},

		_playCurSong: function(event)
		{
			var curSong = this.get('model').curSong;
			this.el.src = '/play?file=' + encodeURI(curSong.get('path'));
			this.el.play();
		},

		_resumeCurSong: function(event)
		{
			this.el.play();
		},

		_stop: function(event)
		{
			console.log('STOP!!!');
			this.el.pause();
		}
/*

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
		}*/
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

		initialize: function(options) {
			options.model.on('change:selected', this._changeSelectedHandler, this);
			options.model.on('change:playing', this._changePlayingHandler, this);
		},

		render: function() {
			//console.log('SongView::render', this.model);
			this.$el.html(this.template(this.model.attributes));

			return this;
		},

		clickHandler: function(event) {
			this.trigger('selectSong', this);
		},

		_changeSelectedHandler: function(event) {
			console.log('SongView::_changeSelectedHandler', this.$el, this.model);
			if(this.model.get('selected'))
			{
				this.$el.addClass('selected');
			}
			else
			{
				this.$el.removeClass('selected');
			}
		},

		_changePlayingHandler: function(event) {
			console.log('SongView::_changePlayingHandler', this.$el, this.model);
			if(this.model.get('playing'))
			{
				this.$el.addClass('playing');
			}
			else
			{
				this.$el.removeClass('playing');
			}
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
			//options.model.on('change:play', this._changeHandler, this);
			//options.model.on('change:stop', this._changeHandler, this);
		},

		/*reset: function() {

		},*/
		selectSongHandler: function(songView) {
			/*
			this.$el.find('tr')
				.removeClass('selected')
				.removeClass('playing');*/


			//this.trigger('selectSong', songView);
			console.log(songView);
			//songView.model.play(songView.model);
			this.model.play(songView.model);
/*
			songView.$el
				.addClass('selected')
				.addClass('playing');*/
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
		},

		_changeHandler: function(event) {
			switch(event.target.id)
			{
				case 'change:play':

			}
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
		el: '#controls',

		events: {
			'click #play-pause-button': 'clickHandler',
			'click #prev-track-button': 'clickHandler',
			'click #next-track-button': 'clickHandler'
		},

		clickHandler: function(event) {
			console.log('ControlsView::clickHandler');
			console.log(event);
			switch(event.target.id)
			{
				case 'play-pause-button':
					this.model.togglePlay();
					break;
				case 'prev-track-button':
					break;
				case 'next-track-button':
					break;
			}
		}

	});
	var HeaderView = Backbone.View.extend({
		el: 'header',

		initialize: function(options)
		{
			options.model.on('change:play', this.render, this);

			// don't show a no-image graphic:
			/*
			document.getElementById('album-art').onerror = function() {
				console.log(this.src);
			console.log(this);
			this.onerror = false;
			setTimeout(function() {
				document.getElementById('album-art').src = "https://ssl.gstatic.com/ui/v1/icons/mail/logo_default.png";
				}, 1);
				return true;
			};*/
		},

		render: function()
		{
			console.log('header view render');
			console.log(this.$el.find('#song-title'));
			var curSong = this.model.curSong;
			console.log(curSong);
			this.$el.find('#song-title').html(curSong.get('title'));
			this.$el.find('#artist').html(curSong.get('artist'));

			//@TODO - move this code somewhere else
			/*$.ajax({
				url: "/art/" + curSong.get('id') + "/large",
				success: function(data) {
					console.log('rtn data');
					console.log(data);
					$('#album-art').attr('src', )
				}
			});*/
	/*
			$('#album-art').one('error', function(event) {
				setTimeout(function() {
					$('#album-art').attr('src', "https://ssl.gstatic.com/ui/v1/icons/mail/logo_default.png");
				}, 1);
			});*/
			$('#album-art').attr('src', 'art/' + curSong.get('id') + '/large');
		}
	});
	var AppView = Backbone.View.extend({
		masterQueue: false,
		audioView: false,
		libraryView: false,
		playlistsView: false,
		controlsView: false,
		headerView: false,

		initialize: function(options) {
			// create the master playlist
			this.masterQueue = new Queue();
			this.masterQueue.reset(options.songs);

			// create the audio view
			this.audioView = new AudioView({model:this.masterQueue});

			// create the master playlist
			this.libraryView = new LibraryView({model:this.masterQueue});
			
			// controls
			this.controlsView = new ControlsView({model:this.masterQueue});

			// header
			this.headerView = new HeaderView({model:this.masterQueue});

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