require "sqlite3"
require_relative "tagger"
require_relative "album" #@TODO delete?
require_relative "song"


class PitraxDBManager

	attr_reader :song_manager

	



	def insert_song_if_new(mp3_file_path)
		song_id = 0
		@db_get_song_id_by_path.execute([mp3_file_path]) do |row|
			row.each do |fields|
				song_id = fields
				break
			end
		end

		if song_id == 0
			@db_song_insert.execute([mp3_file_path, tag.title, tag.artist, tag.album])
		end
	end

	#@todo - use this or delete it
	def upsert_song(mp3_file_path)
		puts "upsert #{mp3_file_path}"
		tag = Tagger.generate_tag(mp3_file_path)
		song_id = 0
		@db_get_song_id_by_path.execute([mp3_file_path]) do |row|
			row.each do |fields|
				song_id = fields
				break
			end
		end
		puts song_id
		#song_id = @db.get_first_value("SELECT song_id FROM songs WHERE path = '#{mp3_file_path}'")
#puts song_id
		if song_id == 0
			@db_song_insert.execute([mp3_file_path, tag.title, tag.artist, tag.album])
		else
			@db_song_update.execute([mp3_file_path, tag.title, tag.artist, tag.album, song_id])
		end
	end

	def update_song(song)
		#@db.execute "UPDATE songs SET path='#{song['path']}'"
	end

	def load_songs()
		@songs = {}
		@songs_arr = []
		@db.execute("SELECT * FROM songs") do |song|
			song_obj = Song.new(song[0], song[1], song[2], song[3], song[4])
			@songs[song[0]] = song_obj
			@songs_arr.push(song_obj)
		end
	end

	def get_song(song_id)
		@songs[song_id]
	end

	def create_new_playlist(title)

	end

	def load_playlists()

	end

	def add_songs_to_playlist(playlist_id, song_ids)

	end

	def remove_songs_from_playlist(playlist_id, song_ids)

	end

	def get_playlist(playlist_id)

	end

	def update_playlist()


	# def add_album(title, artist)
	# 	@db.execute "INSERT INTO albums(album_name, album_artist) VALUES('#{title}', '#{artist}');"
	# end

	# def get_albums
	# 	albums = []
	# 	@db.execute("SELECT * FROM albums") do |album|
	# 		albums.push Album.new(album[0], album[1], album[2])
	# 	end

	# 	albums
	# end

end
























