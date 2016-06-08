Namespace('pitrax.views').HeaderView = Backbone.View.extend({
	COLOR_TRANSITION_DELAY_MS: 2000,
	el: 'header',

	initialize: function(options)
	{
		this.albumColors = {};

		options.model.on('change:play', this.render, this);
	},

	render: function()
	{
		var curSong = this.model.getCurrentSong();
		this.$el.find('#song-title').html(curSong.get('title'));
		this.$el.find('#artist').html(curSong.get('artist'));

		// hack to get the h2 to not break words
		this.$el.find('#artist').width('100%');
		this.$el.find('#artist').outerWidth(this.$el.find('#artist').outerWidth());

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
			var r, g, b;
			var posterizeVal = 8;
			for(var i = 0; i < len; i += 16)
			{
				// we group pixels into rough categories (Journey Inwards problem)
				// we don't want a small amount of black overtake a large gradient of yellow
				r = parseInt(pixels[i + 0] / posterizeVal, 10) * posterizeVal;
				g = parseInt(pixels[i + 1] / posterizeVal, 10) * posterizeVal;
				b = parseInt(pixels[i + 2] / posterizeVal, 10) * posterizeVal;
				rgb = "rgb(" + r + "," + g + "," + b + ")";
				if(rgb !== 'rgb(0,0,0)') // skip pure black
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
		}, this.COLOR_TRANSITION_DELAY_MS);
	}
});