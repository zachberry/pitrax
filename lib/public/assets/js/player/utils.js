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



Namespace('pitrax.utils').Delayer = function()  {

	var data = {};

	var run = function(delay, callback, args, context) {
		console.log('run-->', delay, callback, args, context);
		if(typeof data[callback] === 'undefined')
		{
			data[callback] = {
				intervalId:-1,
				delay:delay,
				callback:callback,
				args: args,
				context:context || this
			};
		}

		var d = data[callback];
		console.log('run?', data);
		clearInterval(d.intervalId);

		d.intervalId = setInterval(function() {
			console.log('RUN!', d);
			clearInterval(d.intervalId);
			d.callback.apply(d.context, d.args);
			////delete data[d.callback];
		}, d.delay);
	};

	return {
		run: run
	};
}();

pitrax.utils.Delayer.run(2000, this.stuff, this);