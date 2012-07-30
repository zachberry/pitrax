require "mp3info"
require_relative "pitraxfilemanager"

module Tagger

	def self.generate_tag(file_path)
		tag = MusicTag.new

		Mp3Info.open(file_path) do |mp3|
			tag.title = mp3.tag.title
			tag.artist = mp3.tag.artist
			tag.album = mp3.tag.album
			tag.tracknum = mp3.tag.tracknum
			tag.genre = mp3.tag.genre_s
		end

		tag
	end

end