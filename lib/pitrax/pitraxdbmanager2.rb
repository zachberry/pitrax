require "sqlite3"
require_relative "tagger"
require_relative "album" #@TODO delete?
require_relative "song"


class PitraxDBManager

	attr_reader :db, :songs, :songs_arr #@TODO: Temporary?

	def initialize(db_file_path)
		@db_file_path = db_file_path
		@db = SQLite3::Database.open @db_file_path
		create_tables
	end

	def create_tables
		#@db.execute "CREATE TABLE IF NOT EXISTS albums (album_id INTEGER PRIMARY KEY, album_name VARCHAR(255), album_artist VARCHAR(255));"
		@db.execute "CREATE TABLE IF NOT EXISTS songs (song_id INTEGER PRIMARY KEY, path VARCHAR(255) UNIQUE, title VARCHAR(255), artist VARCHAR(255), album VARCHAR(255));"
		@db.execute "CREATE TABLE IF NOT EXISTS playlists (playlist_id INTEGER PRIMARY KEY, title VARCHAR(255), date_created DATETIME, date_last_modified DATETIME, songs TEXT);"

		@db_get_song_id_by_path = @db.prepare("SELECT ifnull(song_id, 0) FROM songs WHERE path = ?")
		@db_song_insert = @db.prepare("INSERT INTO songs(path, title, artist, album) VALUES(?,?,?,?)")
		@db_song_update = @db.prepare("UPDATE songs SET path=?, title=?, artist=?, album=? WHERE song_id=?")

		@db_playlist_insert = @db.prepare("INSERT INTO playlists(title, date_created, date_last_modified, songs) VALUES(?,DATETIME(NOW),DATETIME(NOW),?)")
		@db_playlist_update = @db.prepare("UPDATE playlists SET title=?, date_last_modified=DATETIME(now), songs=?")
	end

	# DOESNT WORK!
	def clear_db
		# finalize prepareds (do this somewhere else?)

		@db.close
		File.delete @db_file_path
		@db = SQLite3::Database.open @db_file_path
		create_tables
	end

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
























