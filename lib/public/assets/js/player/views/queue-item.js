Namespace('pitrax.views').QueueItemView = Backbone.View.extend({
	tagName: 'li',
	model: pitrax.models.Song,
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