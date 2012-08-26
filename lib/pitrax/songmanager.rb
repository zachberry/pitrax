require_relative "pitraxdb"
require_relative "song"


module SongManager

	@@songs_map = {}
	@@songs = []
	@@songs_loaded = false

	# def self.load_songs(limit, start_from)
	# 	# @@songs = []
	# 	# #puts "LOAD SONGS #{limit}, #{start_from}!"

	# 	# # grab songs from the db
	# 	# PitraxDB::db.execute("SELECT * FROM songs ORDER BY artist, album LIMIT #{limit} OFFSET #{start_from}") do |row|
	# 	# 	song = Song::create(row)
	# 	# 	@@songs_map[row[0]] = song
	# 	# 	@@songs.push(song)
	# 	# end

	# 	# @@songs_loaded = true
	# end

	def self.songs(limit, start_from, search_string)
		puts "self.songs #{limit}, #{start_from}, #{search_string}"
		if search_string.nil? || search_string == ''
			sql_where = '1'
		else
			# split string up into terms
			search_string = search_string.gsub(/ /, ',')
			terms = search_string.split(',')
			sql_likes = []
			terms.each do |term|
				sql_likes.push("(title LIKE '%#{term}%' OR artist LIKE '%#{term}%' OR album LIKE '%#{term}%')")
			end
			sql_where = sql_likes.join(' AND ')
		end

		# get the songs
		matched_songs = [];
		PitraxDB::db.execute("SELECT * FROM songs WHERE #{sql_where} ORDER BY artist, album LIMIT #{limit} OFFSET #{start_from}") do |row|
			song = Song::create(row)
			#@@songs_map[row[0]] = song
			matched_songs.push(song)
		end

		# get the total
		total = PitraxDB::db.get_first_value("SELECT COUNT(*) FROM songs WHERE #{sql_where}")

		{:total => total, :songs => matched_songs}
	end

	# def self.songs(limit, start_from)
	# 	load_songs(limit, start_from)
	# 	last = start_from + limit
	# 	#puts "return song range #{start_from}-#{last}"
	# 	#@@songs[start_from..last]

	# 	@@songs
	# end

	#def self.total()
	#	PitraxDB::db.get_first_value("SELECT COUNT(*) FROM songs")
	#end

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
		#song = @@songs_map[song_id]
		#puts song
		#if song.nil?
			song = Song::get(song_id)
			##@@songs_map[song_id] = song
			##@@songs.push(song)
		#end

		song
	end


end