Namespace('pitrax.views').LibraryTableView = Backbone.View.extend({
	tagName: 'div',
	className: 'table-wrapper',
	$table: false,
	range: [0,0],
	loading: false,
	songsLoaded: false,
	isHidden: false,
	temp_render: false,
	rendered: false,
	model: pitrax.models.Queue,

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