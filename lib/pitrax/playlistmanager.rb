require_relative "pitraxdb"
require_relative "playlist"


module PlaylistManager

	@playlists_loaded = false

	def self.load_playlists()
		# grab playlists from the db
		@@playlists = []
		@@playlists_map = {}
		PitraxDB::db.execute("SELECT * FROM playlists") do |row|
			playlist = Playlist::create(row)
			@@playlists_map[row[0]] = playlist
			@@playlists.push(playlist)
		end

		@playlists_loaded = true
	end

	def self.playlists()
		if !@playlists_loaded
			load_playlists()
		end

		@@playlists
	end

	def self.get_playlist(playlist_id)
		playlist = @@playlists_map[playlist_id]
		if playlist.nil?
			playlist = playlist::get(playlist_id)
			@@playlists_map[playlist_id] = playlist
			@@playlists.push(playlist)
		end

		playlist
	end

end