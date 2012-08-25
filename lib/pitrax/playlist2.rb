require "json"

#require_relative "pitraxdbmanager"
require_relative "pitraxdb"

class Playlist
	include PitraxDB

	attr_accessor :id, :title, :date_created, :date_last_modified, :songs

	def self.init_db()
		if(!@@db_ready)
			@@db_ready = true
		end
	end

	def self.get_playlists()
		PitraxDB::db.execute('')
	end

	def self.get_playlist(playlist_id)
		#get playlist out of database
		playlist = Playlist.new(a, b, c)
	end

	def self.add_songs(playlist_id, songs)
		
	end

	def self.remove_songs()

	end

	def self.update()

	end

	def self.delete()

	end

	def initialize(id, title, date_created, date_last_modified, songs)
		@id = id
		@title = title
		@date_created = date_created
		@date_last_modified = date_last_modified
		@songs = songs
	end

	def add_songs(songs)
		self::add_songs(@id, songs)
	end

	def remove_songs(songs)
		self::remove_songs(@id, songs)
	end

	def to_s
		"PLAYLIST id:#{@id}, title:#{@title}"
	end

	def to_json(*a)
		{"id" => @id, "title" => @title, "date_created" => @date_created, "date_last_modified" => @date_last_modified, "songs" => @songs}.to_json(*a)
	end

	def self.json_create(o)
		new(o['id'], o['title'], o['date_created'], o['date_last_modified'], o['songs'])
	end

end