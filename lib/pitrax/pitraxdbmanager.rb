require "sqlite3"
require_relative "tagger"
require_relative "album" #@TODO delete?
require_relative "song"


class PitraxDBManager

	attr_reader :songs, :songs_arr #@TODO: Temporary?

	def initialize(db_file_path)
		@db_file_path = db_file_path
		@db = SQLite3::Database.open @db_file_path
		create_tables
	end

	def create_tables
		#@db.execute "CREATE TABLE IF NOT EXISTS albums (album_id INTEGER PRIMARY KEY, album_name VARCHAR(255), album_artist VARCHAR(255));"
		@db.execute "CREATE TABLE IF NOT EXISTS songs (song_id INTEGER PRIMARY KEY, path VARCHAR(255) UNIQUE, title VARCHAR(255), artist VARCHAR(255), album VARCHAR(255));"

		@db_song_insert = @db.prepare("INSERT OR REPLACE INTO songs(path, title, artist, album) VALUES(?,?,?,?)")
	end

	# DOESNT WORK!
	def clear_db
		# finalize prepareds (do this somewhere else?)

		@db.close
		File.delete @db_file_path
		@db = SQLite3::Database.open @db_file_path
		create_tables
	end

	def upsert_song(mp3_file_path)
		puts "upsert #{mp3_file_path}"
		tag = Tagger.generate_tag(mp3_file_path)
		@db_song_insert.execute([mp3_file_path, tag.title, tag.artist, tag.album])
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
		songs[song_id]
	end

	def add_album(title, artist)
		@db.execute "INSERT INTO albums(album_name, album_artist) VALUES('#{title}', '#{artist}');"
	end

	def get_albums
		albums = []
		@db.execute("SELECT * FROM albums") do |album|
			albums.push Album.new(album[0], album[1], album[2])
		end

		albums
	end

end
























