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

	

	var appView;

	// models //
	var Song = Backbone.Model.extend({
		//@TODO:
		editID3Tag: function() {
			//...do stuff...

			this.save();
		}
	});
	//@TODO - A queue and a playlist should contain a songs collection
	//@TODO - A queue shouldn't contain a playlist
	var Playlist = Backbone.Model.extend({
		songs: false,
		total: 0,

		url: '/songs', //@TODO - this is wrong!

		initialize: function(options) {
			this.title = options.title;

			this.total = options.total;

			this.songs = options.songs;

			// a playlist comes back from the server with a list of song ids.
			// we grab the models from the global songs collection
			//var songIds = options.songs;
			//var len = songIds.length;
			//var songModels = [];

			//this.songs = new Songs();
			/*
			for(var i = 0; i < len; i++)
			{
				//this.songs.add(songs.get(songIds[i]));
				songModels.push(songs.get(songIds[i]));
			}*/
			//this.songs = new Songs(songModels, {total:this.total}); //@TODO!
			//console.log('playlist init done');
			//console.log(this.songs);
		},

		add: function(models, options) {
			this.songs.add(models, options);
		},

		filterSongsBySearch: function(searchString) {

		},

		swap: function(song1, song2) {

		},
/*
		indexOfSong: function(song) {
			return _.indexOf(this.songs.models, song);
		},*/

		// gets the song after the song given.
		// if undefined then gets the first song.
		getNextSong: function(song) {
			//var index = (typeof song === 'undefined' ? 0 : this.indexOfSong(song) + 1);
			var index = (typeof song === 'undefined' ? 0 : this.songs.getIndexOf(song) + 1);
			return (index === this.songs.length ? undefined : this.songs.at(index));
		}
	});
	var Queue = Backbone.Model.extend({
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

	// collections //

	// songs is a collection of songs, assuming that not all songs have been loaded.
	// functionality has been added to grab songs based on their eventual index
	var Songs = Backbone.Collection.extend({
		model: Song,
		total: 0,
		_byIndex: {},
		_indexById: {},
		rangesLoading: {},

		initialize: function(models, options) {
			console.log('SONGS COLLECTION INIT', models);
			this._byIndex = {};
			this._indexById = {};
			this.total = options.total;
			this.search = options.search || '';
			this.rangesLoading = {};
		},

		printt: function() {
			/*
			console.log('PRINT!');
			var len = this._byIndex.length;
			for(var i in this._byIndex)
			{
				var song = this.get(this._byIndex[i]);
				if(typeof song === 'undefined')
				{
					song = {attributes: {id:-1, title:'undef', artist:''}};
				}
				console.log(i, song.attributes.id, song.attributes.title, song.attributes.artist);
			}*/
		},

		// we add an additional range option. if set, file these models
		// away using the range to define the indicies. if not set,
		// assume the index is equal to the actual index.
		add: function(models, options) {
			console.log('add1', models, options);
			this.printt();

			var	len,
				len2,
				i,
				index;

			// we don't support the at property, instead we keep track of
			// virtual indicies
			if(typeof options.at !== 'undefined')
			{
				delete options.at;
			}

			//super:
			Backbone.Collection.prototype.add.call(this, models, options);

			if(typeof options.range === 'undefined')
			{
				len = models.length;
				len2 = this.length;
				console.log('add2', models, len, len2);
				for(i = Math.max(0, this.length - len); i < len2; i++)
				{
					//console.log(i);
					//console.log(models[i]);
					this._byIndex[i] = this.get(models[i].id);
					this._indexById[models[i].id] = i;
				}
			}
			else
			{
				len = Math.min(models.length, options.range[1] - options.range[0] + 1);
				console.log('add3', models, len);
				for(i = 0; i < len; i++)
				{
					index = options.range[0] + i;
					this._byIndex[index] = this.get(models[i].id);
					this._indexById[models[i].id] = index;
				}
			}

			console.log('byIndex', this._byIndex);
			console.log('indexById', this._indexById);

			this.printt();
		},

		loadSongs: function(range) {
			console.log('loadSongs', range[0], range[1], this.search);
			if(typeof this.rangesLoading[range[0] + '-' + range[1]] === 'undefined')
			{
				$.ajax({
					url: '/songs/' + range[0] + '-' + range[1] + '?s=' + this.search,
					context: this,
					success: this._loadSongsHandler
				});
				this.rangesLoading[range[0] + '-' + range[1]] = true;
			}
		},

		getByIndex: function(index) {
			if(typeof this._byIndex[index] === 'undefined')
			{
				return undefined;
			}
			return this.get(this._byIndex[index].id);
		},

		getIndexOf: function(song) {
			return this._indexById[song.id];
		},

		//@TODO: more robust
		// simple function that checks if the songs at startIndex and endIndex
		// have been loaded - if so, we assume that whole range has been loaded.
		areLoaded: function(range) {
			/*
			console.log('areLoaded', range);
			console.log(this.getByIndex(range[0]));
			console.log(this.getByIndex(range[1]));
			console.log(this);
			console.log(this._byIndex);*/
			return typeof this.getByIndex(range[0]) !== 'undefined' && typeof this.getByIndex(range[1]) !== 'undefined';
		},

		_loadSongsHandler: function(result)
		{
			console.log('songs loaded');
			result = $.parseJSON(result);
			console.log(result);
			///this.get('playlist').addSongs(result.songs, result.range[0]);
			this.add(result.songs, {range:result.range});
			this.trigger('songsLoaded');
		}
	});

	var Playlists = Backbone.Collection.extend({
		model: Playlist,
		curPlaylist: false,

		selectPlaylist: function(playlist) {
			this.curPlaylist = playlist;
			this.trigger('select:playlist', this.curPlaylist);
		},

		getCurrentPlaylist: function() {
			return this.curPlaylist;
		}
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

			//this.el.addEventListener('ended', this._audioEndedHandler, this);
			// backbone doesn't seem to want to delegate this event
			// so I have to do it the ugly way:
			$(this.el)
				.on('ended', {view:this}, this._audioEndedHandler)
				.on('timeupdate', {view:this}, this._audioProgressHandler);
		},

		_playCurSong: function(event)
		{
			var curSong = this.get('model').getCurrentSong();
			this.el.src = '/play/' + curSong.get('id');
			this.el.play();

			//@HACK to skip ahead
			/*
			setTimeout(function() {
				var a = document.getElementById('audio');
				a.currentTime = a.duration - 1;
			}, 1000);*/
		},

		_resumeCurSong: function(event)
		{
			this.el.play();
		},

		_stop: function(event)
		{
			//console.log('STOP!!!');
			this.el.pause();
		},

		_audioEndedHandler: function(event)
		{
			//console.log('audio ended');
			//console.log(event);
			//console.log(this);

			var thisView = event.data.view;
			if(thisView.get('model').autoPlay)
			{
				thisView.get('model').gotoNextSong();
			}
		},

		_audioProgressHandler: function(event)
		{
			var perc = this.currentTime / this.duration * 100;
			$('#scrub-head').css('left', perc + '%');
			$('#scrub-bar-progress').css('width', perc + '%');
		}
	});
/*
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
			// we may not have a model being set (if this is a placeholder)
			if(typeof options.model !== 'undefined')
			{
				options.model.on('change:selected', this.render, this);
				options.model.on('change:playing', this.render, this);
			}
		},

		render: function() {
			// model might not be defined (if this is a placeholder)
			if(typeof this.model !== 'undefined' && typeof this.model.attributes !== 'undefined' && typeof this.model.attributes.album !== 'undefined')
			{
				//console.log(this.model);
				this.$el.html(this.template(this.model.attributes));

				if(this.model.get('selected'))
				{
					this.$el.addClass('selected');
				}
				else
				{
					this.$el.removeClass('selected');
				}
				if(this.model.get('playing'))
				{
					this.$el.addClass('playing');
				}
				else
				{
					this.$el.removeClass('playing');
				}
			}
			else
			{
				//@TODO - get rid of me!!!!
				this.$el.html('<td colspan="6">&nbsp;</td>');
			}

			return this;
		},

		clickHandler: function(event) {
			var keys = {
				shift: event.shiftKey,
				alt: event.altKey,
				ctrl: event.ctrlKey
			};
			this.trigger('selectSong', {view:this, keys:keys});
		}
	}));*/
	var PlaylistView = Backbone.View.extend({
		tagName: 'li',
		template: _.template("<%= title %>"),

		events: {
			'click': 'clickHandler'
		},

		clickHandler: function(event) {
			//console.log('clickHandler', this);
			this.trigger('select:playlist', this.model);
		},

		render: function() {
			//console.log('look');
			//console.log(this.model);
			this.$el.html(this.template(this.model.attributes));

			return this;
		}
	});
	var QueueItemView = Backbone.View.extend({
		tagName: 'li',
		model: Song,
		template: _.template("<%= title %> - <%= artist %>"),

		events: {
			'click': function(event) {
				console.log('click', event, this);
				this.trigger('select:history', this.options.position);
			}
		},

		initialize: function() {
			this.model.on('change', this.songChangedHandler, this);
		},

		render: function() {
			this.$el.html(this.template(this.model.attributes));
			console.log(this.model.playing);
			if(this.model.getCurrentSong)
			/*if(this.model.get('playing'))
			{
				this.$el.css('font-weight', 'bold');
			}*/
			return this;
		},

		songChangedHandler: function(song) {
			console.log(song);

			//this.$el.css('font-weight', song.get('playing') ? 'bold' : 'normal');
		}
	});
	
	var LibraryTableView = Backbone.View.extend({
		tagName: 'div',
		className: 'table-wrapper',
		$table: false,
		range: [0,0],
		loading: false,
		songsLoaded: false,
		isHidden: false,
		temp_render: false,
		rendered: false,
		model: queue,

		initialize: function(options) {
			console.log('create table view with range', options.range[0], options.range[1], this);
			this.range = options.range;
			this.$table = false;
			this.loading = false;
			this.songsLoaded = false;
			this.isHidden = false;
			this.rendered = false;
		},

		// fetches more songs (if not already loaded) and then displays the table
		show: function() {
			console.log('LTV:::show');
			if(this.loading)
			{
				console.log('ABORT BECAUSE LOADING');
				return;
			}

			////console.log('SHOW');
			this.isHidden = false;

			if(this.model.get('playlist').songs.areLoaded(this.range))
			{
				this.render();
				this.$table.show();
			}
			else
			{
				this.loading = true;

				this.model.get('playlist').songs.on('songsLoaded', function() {
					console.log('_______songs loaded ' + this.range[0] + ',' + this.range[1]);
					this.model.get('playlist').songs.off('songsLoaded');
					this.loading = false;
					console.log('___set loading to ', this.loading);
					this.show();
				}, this);

				this.model.get('playlist').songs.loadSongs(this.range);
			}
		},

		hide: function() {
			this.isHidden = true;
			if(this.$table)
			{
				this.$table.hide();
			}
		},

		render: function() {
			if(!this.model.get('playlist').songs.areLoaded(this.range))
			{
				console.log('ABORT BECAUSE SONGS NOT LOADED');
				return this;
			}

			if(this.isHidden)
			{
				console.log('ABORT BECAUSE HIDDEN');
				return this;
			}

			if(this.rendered)
			{
				console.log('ABORT BECAUSE RENDERED ALREADY');
				return this;
			}

			console.log('!!!songs render ', this.range[0], this.range[1]);
			var t1 = (new Date()).getTime();
			this.$el.empty();
			this.$table = $('<table><tr></tr></table>');
			var els = [];
			var songs = this.model.get('playlist').songs;
			//console.log(this.model.get('playlist').songs.models);
			var len = this.range[1];

			for(var i = this.range[0]; i <= len; i++)
			{
				els.push(this.renderSong(songs.getByIndex(i)));
			}
			this.$table.append($(els));
			this.$el.append(this.$table);
			this.rendered = true;

			return this;
		},

		// Ideally a song should have it's own view, but generating lots of songViews really bogs down
		// performance.
		renderSong: function(song) {
			if(typeof song !== 'undefined')
			{
				return $('<tr data-song-id="' + song.id + '"><td>' + song.attributes.artist + '</td><td>' + song.attributes.album + '</td><td>' + song.attributes.title + '</td><td>' + '1' + '</td><td>' + '2:12' + '</td><td>' + 'teknoz' + '</td></tr>').get(0);
			}
			else
			{
				return $('<tr><td colspan="6">&nbsp;</td></tr>').get(0);
			}
		}
	});
	var LibraryView = Backbone.View.extend(_.extend({}, Backbone.Events, {
		TABLE_MAX_SONGS: 150,
		//TABLE_MAX_SONGS: 2000,
		tableViews: [],
		tables: [],
		tablePositionMap: {},
		activeTableIndex: 0,
		topTableIndex: 0,
		bottomTableIndex: 0,
		lastScrollPosition: 0,
		tableThreshold: {prev:-9999, next:0},
		tableHeight: 0,
		unrendered: true,
		el: '.library',

		events: {
			'click tr': '_songClickHandler',
			//'scroll #library-content': '_scrollHandler',
			'click .submit-search': '_searchHandler'
		},

		initialize: function(options) {
			this.model.bind('change', this.render, this);

			this.model.on("change:play", this._playingHandler, this);
			this.model.on("change:resume", this._resumingHandler, this);
			this.model.on("change:stop", this._stoppingHandler, this);

			// backbone doesn't want to fire scroll events that aren't specifically this
			// element's tag (.library), so we have to do it the ugly way.
			this.$el.find('.library-content').scroll({view:this}, function(event) {
				event.data.view._scrollHandler.apply(event.data.view, [event]);
			});
			
		},

		// _rerender: function()
		// {
		// 	this.unrendered = true;
		// 	this.render();
		// },

		_findSongElementById: function(id)
		{
			return this.$el.find('tr[data-song-id="' + id +'"]');
		},

		// we shouldn't be rendering on the fly like this, but we do it to avoid
		// expensive re-rendering.  @TODO: figure out how to move this to the
		// render step.
		_playingHandler: function(song)
		{
			//@TODO - I don't like doing this since I'm not asking
			//the model it's state, I trust the event params instead.
			this.$el.find('tr')
				.removeClass('selected')
				.removeClass('playing');

			var $songRow = this._findSongElementById(song.id);
			$songRow
				.addClass('selected')
				.addClass('playing');
		},

		_resumingHandler: function(song)
		{
			var $songRow = this._findSongElementById(song.id);
			$songRow
				.addClass('playing');
		},

		_stoppingHandler: function(song)
		{
			var $songRow = this._findSongElementById(song.id);
			$songRow
				.removeClass('playing');
		},

		/*reset: function() {

		},*/
		selectSongHandler: function(data) {
			if(data.keys.shift)
			{
				this.model.addSongToHistory(data.view.model, data.keys.alt || data.keys.ctrl);
			}
			else
			{
				this.model.play(data.view.model);
			}
		},

		_postrender: function() {
			this.tableViews[0].show();

			var height = this.tableViews[0].$el.find('table').height();
			this.tableHeight = height;
			$('.table-wrapper').height(height);
		},

		render: function() {

			console.log('lib view render', this.tableViews);

			var $tableContainer = this.$el.find('.library-content');
			$tableContainer.empty();

			this.tableViews = []; //@TODO - clear out old table views memory?
			console.log('calculating num tables');
			console.log(this.model.get('playlist').songs.total, '/', this.TABLE_MAX_SONGS);
			var numTables = parseInt(this.model.get('playlist').songs.total / this.TABLE_MAX_SONGS, 10) + 1;
			console.log(numTables);

			//console.log('numTables', _songs);
			var r;
			for(var i = 0; i < numTables; i++)
			{
				r = i * this.TABLE_MAX_SONGS;
				console.log('create tableview ', r, r + this.TABLE_MAX_SONGS - 1);
				this.tableViews.push(new LibraryTableView({
					range:[r, Math.min(this.model.get('playlist').songs.total - 1, r + this.TABLE_MAX_SONGS - 1)],
					model:this.model
				}));
			}

			console.log('table veiws');
			console.log(this.tableViews);

			var len = this.tableViews.length;
			for(var i = 0; i < len; i++)
			{
				$tableContainer.append(this.tableViews[i].render().el);
				//this.tableViews[i].show();
			}
			
			//if(this.unrendered)
			//{
		//	//	this.unrendered = false;
		//@TODO: unnecessary function
				this._postrender();
			//}

			return this;
		},

		_deactivateTable: function(index) {
			if(typeof this.tableViews[index] !== 'undefined')
			{
				this.tableViews[index].hide();
			}
		},

		_activateTable: function(index) {
			console.log('activate', index);
			if(typeof this.tableViews[index] !== 'undefined')
			{
				this.tableViews[index].show();
			}
		},

		_scrollHandler: function(event) {
			var st = $(event.target).scrollTop();
			st = st + (this.$el.height() / 2);

			
			var v = st / this.tableHeight;
			var tableIndex = parseInt(v, 10);
			var perc = parseInt((v - tableIndex) * 100, 10);

			if(perc < 40)
			{
				this._activateTable(tableIndex - 1);
				this._deactivateTable(tableIndex + 1);
			}
			else if(perc > 60)
			{
				this._activateTable(tableIndex + 1);
				this._deactivateTable(tableIndex - 1);
			}

			this.lastScrollPosition = st;
		},

		_songClickHandler: function(event)
		{
			var $songRow = $(event.currentTarget);
			var songId = $songRow.attr('data-song-id');
			var song = this.model.get('playlist').songs.get(songId);
			console.log(song);
			this.model.play(song);
			
		},

		_searchHandler: function() {
			var searchString = this.$el.find('.search').val();
			this.trigger('search', searchString);
			
		}
	}));
	var SidebarView = Backbone.View.extend({
		el: $('aside')
	});
	var PlaylistsView = Backbone.View.extend({
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
	var ControlsView = Backbone.View.extend({
		el: '#controls',

		events: {
			'click #play-pause-button': 'clickHandler',
			'click #prev-track-button': 'clickHandler',
			'click #next-track-button': 'clickHandler'
		},

		initialize: function(options) {
			this.model.on('change:play', this.render, this);
			this.model.on('change:stop', this.render, this);
			this.model.on('change:resume', this.render, this);
		},

		clickHandler: function(event) {
			//console.log('ControlsView::clickHandler');
			//console.log(event);
			switch(event.target.id)
			{
				case 'play-pause-button':
					this.model.togglePlay();
					break;
				case 'prev-track-button':
					this.model.gotoPrevSong();
					break;
				case 'next-track-button':
					this.model.gotoNextSong();
					break;
			}
		},

		render: function() {
			console.log('we render');
			var $playButton = this.$el.find('.play-pause-button');
			$playButton.removeClass('playing').removeClass('paused');
			if(this.model.playing)
			{
				$playButton.addClass('playing');
			}
			else
			{
				$playButton.addClass('paused');
			}
		}

	});
	var HeaderView = Backbone.View.extend({
		el: 'header',
		albumColors: {},

		initialize: function(options)
		{
			options.model.on('change:play', this.render, this);
		},

		render: function()
		{
			var curSong = this.model.getCurrentSong();
			this.$el.find('#song-title').html(curSong.get('title'));
			this.$el.find('#artist').html(curSong.get('artist'));

			$('#album-art')
				.attr('src', 'art/' + curSong.get('id') + '/large')
				.load({view:this}, this.drawAlbumColor);
		},

		drawAlbumColor: function(event) {
			$(this).unbind('load');

			console.log('DRAW ALBUM ART');
			var thisView = event.data.view;
			var curSong = event.data.view.model.getCurrentSong();
			var albumStr = curSong.get('artist') + ':' + curSong.get('album');
			if(typeof thisView.albumColors[albumStr] === 'undefined')
			{
				var context = thisView.$el.find('.album-canvas').get(0).getContext('2d');
				var img = thisView.$el.find('.album-art').get(0);
				context.drawImage(img, 0, 0, img.width, img.height);
				var pixels = context.getImageData(0, 0, img.width, img.height).data;
				var len = pixels.length;
				var colorMap = {};
				var highestColor = '';
				var curHighest = -1;
				var rgb;
				for(var i = 0; i < len; i += 16)
				{
					rgb = "rgb(" + pixels[i] + "," + pixels[i + 1] + "," + pixels[i + 2] + ")";
					if(rgb !== 'rgb(0,0,0)')
					{
						if(typeof colorMap[rgb] === 'undefined')
						{
							colorMap[rgb] = 0;
						}
						colorMap[rgb]++;
						if(colorMap[rgb] > curHighest)
						{
							curHighest = colorMap[rgb];
							highestColor = rgb;
						}
					}
				}

				thisView.albumColors[albumStr] = highestColor;
			}
			
			thisView.$el.find('.album-color').animate({
				backgroundColor: thisView.albumColors[albumStr]
			}, 2000);
		}
	});
	var HistoryView = Backbone.View.extend({
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
				var songView = new QueueItemView({model: songHistory[i], position: i});
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
	
	var AppView = Backbone.View.extend({
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
			var songs = new Songs(options.songs, {total:options.total});

			this.libraryPlaylist = new Playlist({total:options.total, songs:songs});

			// create the playlists collection
			this.playlists = new Playlists(options.playlists);

			// create the queue
			//this.queue = new Queue({playlist:this.playlists.get(1)});
			this.queue = new Queue({playlist:this.libraryPlaylist});

			// create the audio view
			this.audioView = new AudioView({model:this.queue});

			// create the master playlist view
			this.libraryView = new LibraryView({model:this.queue});
			
			// controls
			this.controlsView = new ControlsView({model:this.queue});

			// header
			this.headerView = new HeaderView({model:this.queue});

			this.playlistsView = new PlaylistsView({collection:this.playlists});

			this.historyView = new HistoryView({model:this.queue});

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
							var songsCollection = new Songs(json.songs, {total:json.total, search:json.search});
							var searchPlaylist = new Playlist({total:songs.length, songs:songsCollection});
							this.queue.set({playlist:searchPlaylist});
						}
					});
				}
				
			}, this);
			/*

			this.playlistsView.on('select:playlist', function(playlist) {
				/*if(this.queue.get('playlist') === playlist)
				{}*//*
				this.queue.set('playlist', playlist);
			}, this);*/
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

	// let the songs collection be global

	//var songs = new Songs(_songs.songs, {total:_total});
	//songs.set(_songs.songs);
	//console.log('songs');
	//console.log(songs);

	appView = new AppView({songs:_songSet.songs, total:_songSet.total, playlists:_playlists});
	appView.render();

	// api methods
	if(typeof window.pitrax === 'undefined')
	{
		pitrax = {};
		pitrax.queue = appView.queue;
		pitrax.playlists = appView.playlists;
	}

});