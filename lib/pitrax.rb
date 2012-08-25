require "sinatra"
require "sinatra/reloader"
require "erb"
require "json"
require "open-uri"

require_relative "pitrax/version"
require_relative "pitrax/songmanager"
require_relative "pitrax/song"
require_relative "pitrax/playlistmanager"
require_relative "pitrax/playlist"
require_relative 'pitrax/settings'

#@TODO
# try using delayed_job
# downloading multiple: rubyzip

#dbm = PitraxDBManager.new(Settings::MUSIC_DB)
#songs = dbm.songs_arr


class Pitrax2 < Sinatra::Base

	#@TODO - get rid of this?
	def initialize()
		super()

		#SongManager::load_songs
		#PlaylistManager::load_playlists
	end

	# get '/' do
	# 	if SettingsMeta::has_settings?
	# 		require_relative 'pitrax/settings'
	# 		@@dbm = PitraxDBManager.new(Settings::MUSIC_DB)
	# 		@@dbm.load_songs

	# 		erb :index, :locals => { :song_list => @@dbm.songs_arr }
	# 	else
	# 		redirect '/config'
	# 	end
	# end

	def get_songs(from, to)
		songs = SongManager::songs(to - from, from)
		{:range => [from, to], :songs => songs}.to_json
	end

	get '/' do
		erb :player, :locals => {
			:total => SongManager::total,
			:songs => get_songs(0, 150),
			:playlists => PlaylistManager::playlists.to_json
		}
	end

	get '/songs/:from-:to' do
		get_songs(params[:from].to_i, params[:to].to_i)
	end

	get '/config' do
		erb :config, :locals => { }
	end

	post '/config' do
		SettingsMeta::write_settings(params[:music_dir], params[:music_db])
		redirect '/update'
	end

	get '/play/:song_id' do
		song = SongManager::get_song(params[:song_id].to_i)
		send_file song.path
	end

	get '/download/:song_id' do
		song = SongManager::get_song(params[:song_id].to_i)
		send_file song.path, :filename => song.get_filename, :type => 'Application/octet-stream'
	end

	get '/update' do
		require_relative "pitrax/updater"
		Updater.update
		
		erb :update, :locals => { }
	end

	get '/rebuild' do
		require_relative "pitrax/updater"
		Updater.rebuild
		puts "Rebuilt!"
	end

	# get '/songs' do
	# 	require_relative "pitrax/updater"
	# 	Updater.update

	# 	require_relative 'pitrax/settings'
	# 	@@dbm = PitraxDBManager.new(Settings::MUSIC_DB)
	# 	@@dbm.load_songs

	# 	content_type :json
	# 	songs = @@dbm.songs_arr
	# 	songs.to_json
	# end

	# size options = 'small', 'medium', 'large', 'extralarge', 'mega'
	get '/art/:song_id/:size' do
		require_relative 'pitrax/albumart'

		song = SongManager::get_song(params[:song_id].to_i)
		size = params[:size]

		art_getter = AlbumArt.new(Settings::ART_DIR, Settings::LASTFM_KEY, 'lib/public/assets/img/no-art.png')
		art = art_getter.get_art(song, size)
		if art
			puts 'send_file'
			puts art
			send_file art
		end
	end

	get '/playlist/new/:title' do
		playlist = Playlist.new
		playlist.title = params[:title]
		playlist.songs.push('21638')
		playlist.save
	end

end

Pitrax2.run!

