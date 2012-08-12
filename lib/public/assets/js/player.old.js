$(function() {
	$prevTrackButton = $('#prev-track-button');
	$nextTrackButton = $('#next-track-button');
	$playPauseButton = $('#play-pause-button');
	$albumArt = $('#album-art');
	$songTitle = $('#song-title');
	$artist = $('#artist');
	$table = $('table');
	audio = document.getElementById('audio');
	setupUI();

	songs = {};

	queue = [];
	queuePos = 0;

	getSongs();

	console.log('yeah');

	function setupUI()
	{
		$playPauseButton.click(function(event) {
			event.preventDefault();

			if(audio.paused)
			{
				audio.play();
			}
			else
			{
				audio.pause();
			}
		});

		$prevTrackButton.click(function(event) {
			event.preventDefault();

			if(queuePos > 0)
			{
				queuePos--;
			}
			playSongInQueue();
		});

		$nextTrackButton.click(function(event) {
			event.preventDefault();

			if(queuePos < queue.length - 1)
			{
				queuePos++;
			}
			playSongInQueue();
		})
	}

	function getSongs()
	{
		$.ajax({
			url: "/get/songs",
			success: function(data) {
				console.log('rtn data');
				console.log(data);

				populateTable(data);
			}
		});
	}

	function populateTable(data)
	{
		var len = data.length;
		for(var i = 0; i < len; i++)
		{
			songs[data[i].id] = data[i];
			$table.append(makeTableRow(data[i]));
		}
	}

	function makeTableRow(song)
	{
		$tr = $('<tr><td>' + song.artist + '</td><td>' + song.album + '</td><td>' + song.title + '</td><td>' + '1' + '</td><td>' + 'time' + '</td><td>' + 'genre' + '</td></tr>');
		$tr.click(function() {
			console.log('play song ' + song.id);
			playSong(song.id);
		});

		return $tr;
	}

	function playSong(songId)
	{
		var song = songs[songId];
		queue.splice(queuePos, songs.length - queuePos - 1);
		queue.push(song);
		queuePos = queue.length - 1;

		playSongInQueue();
	}

	function playSongInQueue()
	{
		console.log(queue);
		console.log(queuePos);

		var song = queue[queuePos];

		console.log(song);
		audio.src = '/play?file=' + encodeURI(song.path);
		console.log('/play?file=' + encodeURI(song.path));
		audio.play();
		$songTitle.html(song.title);
		$artist.html(song.artist);
	}
});