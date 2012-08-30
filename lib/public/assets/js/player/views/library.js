Namespace('pitrax.views').LibraryView = Backbone.View.extend(_.extend({}, Backbone.Events, {
	TABLE_MAX_SONGS: 150,
	LIVE_UPDATE_DELAY_MS: 100,
	el: '.library',

	events: {
		'click tr': '_songClickHandler',
		'click .submit-search': '_searchHandler'
	},

	initialize: function(options) {
		this.tableHeight = 0;

		this.model.bind('change', this.render, this);

		this.model.on("change:play", this._playingHandler, this);
		this.model.on("change:resume", this._resumingHandler, this);
		this.model.on("change:stop", this._stoppingHandler, this);

		this.st = 0; //scroll top
		this.libraryContent = this.$el.find('.library-content').get(0);
		// backbone doesn't want to fire scroll events that aren't specifically this
		// element's tag (.library), so we have to do it the ugly way.
		$(this.libraryContent).scroll({view:this}, function(event) {
			event.data.view._scrollHandler.apply(event.data.view, [event]);
		});

		// set up live updating
		pitrax.utils.LiveUpdateText.on(
			this.$el.find('.search'),
			this.LIVE_UPDATE_DELAY_MS,
			this._searchHandler,
			this);

		$('header').click({view:this}, function(event) {
			var view = event.data.view;
			$('.library-content').scrollTop(49000);
			setTimeout(function() {
				view._scrollHandler();
			}, 2000);
			
		});
	},

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

	render: function() {
		var $tableContainer = this.$el.find('.library-content');
		$tableContainer.empty();

		this.tableViews = []; //@TODO - clear out old table views memory?
		var numTables = parseInt(this.model.get('playlist').songs.total / this.TABLE_MAX_SONGS, 10) + 1;
		var r;

		if(numTables > 0)
		{
			for(var i = 0; i < numTables; i++)
			{
				r = i * this.TABLE_MAX_SONGS;
				console.log('create tableview ', r, r + this.TABLE_MAX_SONGS - 1);
				this.tableViews.push(new pitrax.views.LibraryTableView({
					range:[r, Math.min(this.model.get('playlist').songs.total - 1, r + this.TABLE_MAX_SONGS - 1)],
					model:this.model
				}));
			}

			var len = this.tableViews.length;
			for(var i = 0; i < len; i++)
			{
				$tableContainer.append(this.tableViews[i].render().el);
			}
			
			this.tableViews[0].show();

			var height = this.tableViews[0].$el.find('table').height();
			this.tableHeight = height;
			$('.table-wrapper').height(height);

			this.elHeight = this.$el.height();
		}

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

	_scrollHandler: function() {
		//var st = $(event.target).scrollTop();
		this.st = this.libraryContent.scrollTop;
		this.st = this.st + (this.elHeight / 2);
		
		var v = this.st / this.tableHeight;
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
	},

	_songClickHandler: function(event)
	{
		var $songRow = $(event.currentTarget);
		var songId = $songRow.attr('data-song-id');
		var song = this.model.get('playlist').songs.get(songId);
		
		if(event.shiftKey)
		{
			this.model.addSongToHistory(song, event.altKey || event.ctrlKey);
		}
		else
		{
			this.model.play(song);
		}
	},

	_searchHandler: function() {
		var searchString = this.$el.find('.search').val();
		this.trigger('search', searchString);
		
	}
}));