#@TODO: make sure you can pass trailing slash on album_art_dir safely
#@TODO: handle no art returned from last-fm (remember)
#@TODO: grab from id3 tag also (and save into id3 tag?)

require "open-uri"
require "json"

class AlbumArt
	LASTFM_API_URL = "http://ws.audioscrobbler.com/2.0/?method=album.getinfo"

	attr_reader :album_art_dir, :default_pic_path

	def initialize(album_art_dir, last_fm_api_key, default_pic_path)
		@album_art_dir = album_art_dir
		@last_fm_api_key = last_fm_api_key
		@default_pic_path = default_pic_path
	end

	def get_art(song, size)
		missing_file_path = get_expected_file_path(song, 'none')
		expected_path = get_expected_file_path(song, size)
		if File.exists?(missing_file_path)
			return @default_pic_path
		elsif File.exists?(expected_path)
			return expected_path
		else
			html = open("#{LASTFM_API_URL}&api_key=#{Settings::LASTFM_KEY}&artist=#{URI.escape(song.artist)}&album=#{URI.escape(song.album)}&format=json").read

			json = JSON.parse(html)

			target_image_url = ''
			images = json['album']['image']
			puts 'images'
			puts images
			images.each do |image|
				puts 'image'
				puts image
				if image['size'] == size
					target_image_url = image['#text']
					puts 'target image url found'
					puts target_image_url
					break
				end
			end

			if target_image_url == ''
				File.open(missing_file_path, 'w') {}
				return @default_pic_path
			end

			open(expected_path, 'wb') do |file|
				file << open(target_image_url).read
			end

			return expected_path
		end

		false
	end

	private
	def get_expected_file_path(song, size)
		@album_art_dir + '/' + song.artist + '_' + song.album + '_' + size + '.png'
	end

end
























