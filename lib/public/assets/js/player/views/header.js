Namespace('pitrax.views').HeaderView = Backbone.View.extend({
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