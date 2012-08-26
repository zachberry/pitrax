Namespace('pitrax.views').LibraryView = Backbone.View.extend(_.extend({}, Backbone.Events, {
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
			this.tableViews.push(new pitrax.views.LibraryTableView({
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