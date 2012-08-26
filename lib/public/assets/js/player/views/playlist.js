Namespace('pitrax.views').PlaylistView = Backbone.View.extend({
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