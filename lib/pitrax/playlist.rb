require "json"

require_relative "pitraxdb"

class Playlist

	attr_accessor :id, :title, :date_created, :date_last_modified, :songs

	@@db_select = PitraxDB::db.prepare("SELECT * FROM playlists WHERE playlist_id=?")
	@@db_insert = PitraxDB::db.prepare("INSERT INTO playlists(title, date_created, date_last_modified, songs) VALUES(?,datetime(),datetime(),?)")
	@@db_delete = PitraxDB::db.prepare("DELETE FROM playlists WHERE playlist_id=?")
	@@db_update = PitraxDB::db.prepare("UPDATE playlists SET title=?, date_last_modified=datetime(), songs=? WHERE playlist_id=?")

	def self.get(playlist_id)
		@@db_select.execute() do |row|
			return self::create(row)
		end
	end

	def self.create(row)
		playlist = self.new
		playlist.id = row[0]
		playlist.title = row[1]
		playlist.date_created = row[2]
		playlist.date_last_modified = row[3]
		playlist.songs = row[4].split(',')

		return playlist
	end

	def self.save(playlist)
		@@db_insert.execute([playlist.title, playlist.songs.join(',')])
	end

	def self.update(playlist)
		@@db_update.execute([playlist.title, playlist.songs.join(','), playlist.id])
	end

	def self.delete(playlist)
		@@db_delete.execute([playlist.id]);
	end

	def initialize()
		@songs = []
	end

	def save()
		self.class::save(self)
	end

	def update()
		self.class::update(self)
	end

	def delete()
		self.class::delete(self)
	end

	def add_songs(songs)
		songs.each do |song|
			if !@songs.include?(song.id)
				@songs.push(song.id)
			end
		end

		update()
	end

	def remove_songs(songs)
		songs.delete_if do |song|
			@songs.include?(song.id)
		end

		update()
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