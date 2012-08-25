require_relative "pitraxdb"
require_relative "song"


module SongManager

	@@songs = []
	@@songs_loaded = false

	def self.load_songs(limit, start_from)
		# grab songs from the db
		@@songs = []
		@@songs_map = {}
		puts "load songs limit #{limit} start_from #{start_from}"
		PitraxDB::db.execute("SELECT * FROM songs ORDER BY artist, album LIMIT #{limit} OFFSET #{start_from}") do |row|
			song = Song::create(row)
			@@songs_map[row[0]] = song
			@@songs.push(song)
		end

		@@songs_loaded = true
	end

	def self.songs(limit, start_from)
		load_songs(limit, start_from)
		@@songs
	end

	def self.total()
		PitraxDB::db.get_first_value("SELECT COUNT(*) FROM songs")
	end

	# def self.add_songs(songs)
	# 	songs.each do |song|
			
	# 	end
	# end

	# def self.delete_songs(songs)
	# 	ids_to_delete = []
	# 	songs.each do |song|
	# 		ids_to_delete.push(song.id)
	# 	end

	# 	#@TODO
	# end

	def self.get_song(song_id)
		song = @@songs_map[song_id]
		if song.nil?
			song = Song::get(song_id)
			@@songs_map[song_id] = song
			@@songs.push(song)
		end

		song
	end


end