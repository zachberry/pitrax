Namespace('pitrax.collections').Songs = Backbone.Collection.extend({
	model: pitrax.models.Song,
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

	// we add an additional range option. if set, file these models
	// away using the range to define the indicies. if not set,
	// assume the index is equal to the actual index.
	add: function(models, options) {
		console.log('add1', models, options);

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