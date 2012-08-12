require_relative 'pitraxdbmanager'
require_relative 'songfinder'
require_relative 'settings'

module Updater
	def self.update
		dbm = PitraxDBManager.new(Settings::MUSIC_DB)
		songFinder = SongFinder.new(Settings::MUSIC_DIR, dbm)
		songFinder.find_songs
	end

	def self.rebuild
		dbm = PitraxDBManager.new(Settings::MUSIC_DB)
		dbm.clear_db
		songFinder = SongFinder.new(Settings::MUSIC_DIR, dbm)
		songFinder.find_songs
	end
end