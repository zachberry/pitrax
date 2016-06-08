Namespace('pitrax.views').LibraryView = Backbone.View.extend(_.extend({}, Backbone.Events, {
	TABLE_MAX_SONGS: 500,
	LIVE_UPDATE_DELAY_MS: 200,
	FLEX_COL_TOTAL_WIDTH: 1000,
	RESIZE_RENDER_DELAY: 100,

	el: '.library',

	events: {
		'click .submit-search': '_searchHandler',
		'click .library-content': '_clickHandler',
		'mousemove .scroll-faker': '_moveHandler',
		'mouseout .scroll-faker': '_mouseoutHandler'
	},

	initialize: function(options) {
		this.tableHeight = 0;
		this.lastHoverIndex = -1;
		this.firstSongIndex = 0;

		this.model.bind('change', this.render, this);

		this.model.on("change:play", this._playingHandler, this);
		this.model.on("change:resume", this._resumingHandler, this);
		this.model.on("change:stop", this._stoppingHandler, this);

		this.model.get('playlist').songs.on('fetching', this._showThrobber, this);
		this.model.get('playlist').songs.on('add', function() {
			this.populate(this.firstSongIndex);
		}, this);

		this.st = 0; //scroll top
		this.libraryContent = this.$el.find('.library-content').get(0);
		// backbone doesn't want to fire scroll events that aren't specifically this
		// element's tag (.library), so we have to do it the ugly way.
		$(this.libraryContent).scroll({view:this}, function(event) {
			event.data.view._scrollHandler.apply(event.data.view, [event]);
		});

		// hacky
		$(window).resize({view:this}, function(event) {
			//event.data.view.render.apply(event.data.view, [event]);
			console.log('resize');
			var view = event.data.view;
			pitrax.utils.Delayer.run(view.RESIZE_RENDER_DELAY, view.render, [event], view);
		});

		// set up live updating
		pitrax.utils.LiveUpdateText.on(
			this.$el.find('.search'),
			this.LIVE_UPDATE_DELAY_MS,
			this._searchHandler,
			this);
/*
		$('header').click({view:this}, function(event) {
			var view = event.data.view;
			$('.library-content').scrollTop(49000);
			setTimeout(function() {
				view._scrollHandler();
			}, 2000);

		});*/

	},

	_songIsShown: function(song)
	{
		var index = song.get('index');
		return index >= this.firstSongIndex && index <= this.firstSongIndex + this.numRows;
	},

	_scrollToSong: function(song)
	{
		var index = song.get('index');
		this.firstSongIndex = index;
		this.populate(this.firstSongIndex);

		this.libraryContent.scrollTop = this.firstSongIndex * this.itemHeight;
	},

	_getRowIndexOfSong: function(song)
	{
		return typeof song !== 'undefined' ? song.get('index') - this.firstSongIndex : -1;
	},

	_clearHighlights: function(classToRemove)
	{
		if(typeof classToRemove === 'undefined')
		{
			$(this.trs)
				.removeClass('selected')
				.removeClass('playing');
		}
		else
		{
			$(this.trs).removeClass(classToRemove);
		}
	},

	_highlight: function(rowIndex, classToAdd)
	{
		if(typeof this.trs[rowIndex] !== 'undefined')
		{
			if(typeof classToAdd === 'undefined')
			{
				$(this.trs[rowIndex])
					.addClass('selected')
					.addClass('playing');
			}
			else
			{
				$(this.trs[rowIndex]).addClass(classToAdd);
			}
		}
	},

	// we shouldn't be rendering on the fly like this, but we do it to avoid
	// expensive re-rendering.  @TODO: figure out how to move this to the
	// render step.
	_playingHandler: function(song)
	{
		this._clearHighlights();
		this._highlight(this._getRowIndexOfSong(song));

		if(!this._songIsShown(song))
		{
			this._scrollToSong(song);
		}
	},

	_resumingHandler: function(song)
	{
		this._highlight(this._getRowIndexOfSong(song));
	},

	_stoppingHandler: function(song)
	{
		this._clearHighlights('playing');
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

	populate: function(firstIndex, amount) {
		console.log('populate!');
		if(typeof amount === 'undefined')
		{
			amount = this.numRows;
		}

		this._clearHighlights();

		var curSong = this.model.getCurrentSong();
		var playingIndex = typeof curSong !== 'undefined' ? curSong.get('index') : -1;

		for(var i = 0; i < amount; i++)
		{
			this.trs[i].innerHTML = this.getSongHtml(this.model.get('playlist').songs.getByIndex(i + firstIndex));
			if(i + firstIndex === playingIndex)
			{
				this._highlight(i, this.model.playing ? undefined : 'selected');
			}
		}

		this._hideThrobber();
	},

	_showThrobber: function() {
		console.log('SHOW!');
		this.$el.find('.throbber').show();
	},

	_hideThrobber: function() {
		this.$el.find('.throbber').hide();
	},

	_resizeCols: function() {
		var $libraryDataGrid = this.$el.find('.library-data-grid');

		$libraryDataGrid.width('100%');

		var fixedColWidth = this.$el.find('.library-data-grid td:nth-child(4)').outerWidth() + this.$el.find('.library-data-grid td:nth-child(5)').outerWidth();
		var availWidth = Math.min(this.FLEX_COL_TOTAL_WIDTH, $libraryDataGrid.outerWidth() - fixedColWidth - 1);
		console.log('resize rows', availWidth);

		this.$el.find('.library-data-grid td:nth-child(1)').outerWidth(Math.floor(availWidth * 0.25));
		this.$el.find('.library-data-grid td:nth-child(2)').outerWidth(Math.floor(availWidth * 0.25));
		this.$el.find('.library-data-grid td:nth-child(3)').outerWidth(Math.floor(availWidth * 0.3));
		this.$el.find('.library-data-grid td:nth-child(6)').outerWidth(Math.floor(availWidth * 0.2));

		$libraryDataGrid.outerWidth($libraryDataGrid.outerWidth());

		// alert('setting inner html wipes out the set pixel widths of the trs')
	},

	_renderRows: function(n) {
		var curEl;
		var els = [];
		for(var i = 0; i < n; i++)
		{
			curEl = document.createElement('tr');
			this.trs.push(curEl);
			els.push(curEl);
		}
		this.$el.find('.library-data-grid').append(els);
	},

	render: function() {
		this._clearHighlights();

		console.log('RENDER!');
		this.$el.find('.library-data-grid').empty();

		this.trs = [];

		// create a single row so we can calculate its height
		this._renderRows(1);
		this.populate(this.firstSongIndex, 1);
		this._resizeCols();
		this.itemHeight = $(this.trs[0]).height();
		var dgHeight = this.$el.find('.library-data-grid').height();
		this.numRows = Math.ceil(dgHeight / this.itemHeight);

		// create the rest of the rows
		//@TODO: What about resizing the window?
		this._renderRows(this.numRows - 1);
		this.populate(this.firstSongIndex, this.numRows);
		this._resizeCols();

		var numSongs = this.model.get('playlist').songs.total;
		console.log(this.model.get('playlist').songs);
		$('#scroll-faker').height(this.itemHeight * numSongs);

		return this;
	},

	// Ideally a song should have it's own view, but generating lots of songViews really bogs down
	// performance.
	getSongHtml: function(song) {
		//var tr = document.createElement('tr');
		if(typeof song !== 'undefined')
		{
			return '<tr data-song-id="' + song.id + '"><td>' + song.attributes.artist + '</td><td>' + song.attributes.album + '</td><td>' + song.attributes.title + '</td><td>' + '1' + '</td><td>' + '2:12' + '</td><td>' + 'teknoz' + '</td></tr>';
		}
		else
		{
			return '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>';
		}

		return tr;
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

	_scrollHandler: function() {
		//var st = $(event.target).scrollTop();
		this.st = this.libraryContent.scrollTop;
		console.log(this.st);

		var perc = this.st / $('.scroll-faker').height();
		this.firstSongIndex = Math.floor(perc * this.model.get('playlist').songs.total);

		this.populate(this.firstSongIndex);

		var pastSongIndex = this.firstSongIndex - (this.numRows * 2);
		var futureSongIndex = this.firstSongIndex + this.numRows * 3;
		if(pastSongIndex >= 0)
		{
			this.model.get('playlist').songs.fetch({index:pastSongIndex});
		}
		if(futureSongIndex < this.model.get('playlist').songs.total)
		{
			this.model.get('playlist').songs.fetch({index:futureSongIndex});
		}
	},

	_clickHandler: function(event) {
		//console.log('_clickHandler', event);
		event.preventDefault();
/*
		var index = Math.floor(event.offsetY / this.itemHeight);
		console.log('click ' + index);
		var song = this.model.get('playlist').songs.getByIndex(index);
		console.log('song ', song);*/

		var song = this.model.get('playlist').songs.getByIndex(this.lastHoverIndex + this.firstSongIndex);

		if(event.shiftKey)
		{
			this.model.addSongToHistory(song, event.altKey || event.ctrlKey);
		}
		else
		{
			this.model.play(song);
		}
	},

	_moveHandler: function(event) {
		var fakeTableY = this.$el.find('.library-data-grid').offset().top;
		var index = Math.floor((event.clientY - fakeTableY) / this.itemHeight);
		//console.log('Math.floor((',event.clientY,'-',fakeTableY,') /', this.itemHeight,');');
		if(index !== this.lastHoverIndex)
		{
			if(this.lastHoverIndex >= 0)
			{
				$(this.trs[this.lastHoverIndex]).removeClass('hover');
			}
			//console.log(index);
			$(this.trs[index]).addClass('hover');

			this.lastHoverIndex = index;
		}
	},

	_mouseoutHandler: function(event) {
		$(this.trs[this.lastHoverIndex]).removeClass('hover');
		this.lastHoverIndex = -1;
	},

	_searchHandler: function() {
		var searchString = this.$el.find('.search').val();
		this.trigger('search', searchString);

	}
}));