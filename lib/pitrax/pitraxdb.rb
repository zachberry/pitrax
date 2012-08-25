require "sqlite3"

require_relative "settings"

module PitraxDB

	@@connected = false

	def self.db()
		if !@@connected
			connect
		end

		@@db
	end

	def self.connect()
		@@db = SQLite3::Database.open Settings::MUSIC_DB
		@@db.execute "CREATE TABLE IF NOT EXISTS songs (song_id INTEGER PRIMARY KEY, path VARCHAR(255) UNIQUE, title VARCHAR(255), artist VARCHAR(255), album VARCHAR(255));"
		@@db.execute "CREATE TABLE IF NOT EXISTS playlists (playlist_id INTEGER PRIMARY KEY, title VARCHAR(255), date_created DATE, date_last_modified DATE, songs TEXT);"

		@@connect = true
	end

end
























