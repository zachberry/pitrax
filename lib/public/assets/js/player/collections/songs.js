Namespace('pitrax.collections').Songs = Backbone.Collection.extend({
	model: pitrax.models.Song,
	url: "/songs",

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
		// we quiet the add event (we want to fire our own)
		options.silent = true;
		Backbone.Collection.prototype.add.call(this, models, options);

		/*if(typeof options.range === 'undefined')
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
		{*/

		if(models.length > 0)
		{
			var firstIndex = models[0].index;
			var lastIndex = models[models.length - 1].index;
			len = Math.min(models.length, lastIndex - firstIndex + 1);
			console.log('add3', models, len);
			for(i = 0; i < len; i++)
			{
				index = firstIndex + i;
				this._byIndex[index] = this.get(models[i].id);
				this._indexById[models[i].id] = index;
			}
			//}

			console.log('byIndex', this._byIndex);
			console.log('indexById', this._indexById);

			//fire our own add event
			this.trigger('add', [firstIndex, lastIndex]);
		}
	},

	fetch: function(options) {
		Backbone.Collection.prototype.fetch.call(this, {
			add:true,
			data:{
				from:options.range[0],
				to:options.range[1],
				q:this.search
			}
		});
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

	isLoaded: function(index) {
		return typeof this.getByIndex(index) !== 'undefined';
	},

	//@TODO: more robust
	// simple function that checks if the songs at startIndex and endIndex
	// have been loaded - if so, we assume that whole range has been loaded.
	areLoaded: function(range) {
		return typeof this.getByIndex(range[0]) !== 'undefined' && typeof this.getByIndex(range[1]) !== 'undefined';
	},

	// we override parse since we don't simply get back a list of songs,
	// and we need to more carefully parse the data.
	parse: function(response) {
		//@TODO - I don't like doing this here, but where else?
		// we listen for the response and update our total (in case we didn't have a correct one at first).
		this.total = response.total;
		return response.songs;
	}
});