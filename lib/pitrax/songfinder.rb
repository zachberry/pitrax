require_relative('pitraxdbmanager')

class SongFinder

	attr_reader :music_dir, :db_manager

	def initialize(music_dir, db_manager)
		@music_dir = music_dir
		@db_manager = db_manager
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
					db_manager.insert_song_if_new(full_rel_path)
				elsif dir?(full_rel_path)
					scan_dir(full_rel_path)
				end
			end
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