Namespace('pitrax.utils').LiveUpdateText = function() {

	var data = {};

	var on = function($input, delay, callback, context) {
		data[$input] = {
			interval: -1,
			callback: callback,
			context: context || this,
			lastText: '',
			handler:  function(event) {
				var $this = $(this);
				var d = data[$this];

				clearInterval(d.interval);

				if($this.val().length === 0)
				{
					d.callback.apply(d.context);
				}
				else
				{
					d.interval = setInterval(function() {
						clearInterval(d.interval);
						var text = $this.val();
						if(text !== d.lastText)
						{
							d.callback.apply(d.context);
						}

						d.lastText = text;
					}, delay);
				}
			}
		};

		$input.on('keydown', data[$input].handler);
	};

	var off = function($input) {
		clearInterval(data[$input].interval);
		$input.off('keydown', data[$input].handler);
		delete data[$input];
	};
	
	return {
		on: on,
		off: off
	};
}();