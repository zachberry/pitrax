require "json"

class Song

	attr_accessor :id, :path, :title, :artist, :album

	def initialize(id, path, title, artist, album)
		@id = id
		@path = path
		@title = title
		@artist = artist
		@album = album
	end

	def to_s
		"SONG id:#{@id}, title:#{@title}"
	end

	def to_json(*a)
		{"id" => @id, "path" => @path, "title" => @title, "artist" => @artist, "album" => @album}.to_json(*a)
	end

	def self.json_create(o)
		new(o['id'], o['path'], o['title'], o['artist'], o['album'])
	end

end