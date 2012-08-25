require_relative 'pitraxdb';
require_relative 'song';
require_relative 'tagger';


class SongFinder

	attr_reader :music_dir

	@@db_get_song_id_by_path = PitraxDB::db.prepare("SELECT ifnull(song_id, 0) FROM songs WHERE path = ?")

	def initialize(music_dir)
		@music_dir = music_dir
	end
	
	#@TODO - handle errors (bad dir,e tc)
	def find_songs()
		scan_dir(@music_dir)
	end

	protected
	def scan_dir(target_dir)
		#puts "scan_dir #{target_dir}"
		Dir.entries(target_dir).select do |entry|
			if actual? entry
				full_rel_path = File.join(target_dir, entry)
				if mp3_file?(full_rel_path)
					insert_song_if_new(full_rel_path)
				elsif dir?(full_rel_path)
					scan_dir(full_rel_path)
				end
			end
		end
	end

	def insert_song_if_new(mp3_file_path)
		song_id = 0
		@@db_get_song_id_by_path.execute([mp3_file_path]) do |row|
			row.each do |fields|
				song_id = fields
				break
			end
		end

		if song_id == 0
			#@@db_song_insert.execute([mp3_file_path, tag.title, tag.artist, tag.album])
			tag = Tagger::generate_tag(mp3_file_path)
			song = Song.new
			song.path = mp3_file_path
			song.title = tag.title
			song.artist = tag.artist
			song.album = tag.album
			song.save
		end
	end

	def dir?(entry)
		File.directory?(entry)
	end

	def mp3_file?(entry)
		!dir?(entry) && entry.include?('.mp3')
	end

	def actual?(entry)
		!(entry == '.' || entry == '..')
	end

end