require "json"
require "pathname"

require_relative "pitraxdb"


class Song

	attr_accessor :id, :path, :title, :artist, :album

	@@db_select = PitraxDB::db.prepare("SELECT * FROM songs WHERE song_id=?")
	@@db_insert = PitraxDB::db.prepare("INSERT INTO songs(path, title, artist, album) VALUES(?,?,?,?)")
	@@db_delete = PitraxDB::db.prepare("DELETE FROM songs WHERE song_id=?")
	@@db_update = PitraxDB::db.prepare("UPDATE songs SET path=?, title=?, artist=?, album=? WHERE song_id=?")

	def self.get(song_id)
		@@db_select.execute([song_id]) do |row|
			fields = []
			row.each do |field|
				fields.push(field)
			end

			return self.create(fields[0])
		end
	end

	def self.create(row)
		song = self.new
		song.id = row[0]
		song.path = row[1]
		song.title = row[2]
		song.artist = row[3]
		song.album = row[4]

		song
	end

	def self.save(song)
		@@db_insert.execute([song.path, song.title, song.artist, song.album])
	end

	def self.update(song)
		@@db_update.execute([song.path, song.title, song.artist, song.album, song.id])
	end

	def self.delete(song)
		@@db_delete.execute([song.id]);
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

	def to_s
		"SONG id:#{@id}, title:#{@title}"
	end

	def get_filename
		Pathname.new(@path).basename
	end

	def to_json(*a)
		{"id" => @id, "path" => @path, "title" => @title, "artist" => @artist, "album" => @album}.to_json(*a)
	end

	def self.json_create(o)
		new(o['id'], o['path'], o['title'], o['artist'], o['album'])
	end

end