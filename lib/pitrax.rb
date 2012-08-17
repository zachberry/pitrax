require "sinatra"
require "sinatra/reloader"
require "erb"
require "json"
require "open-uri"
require_relative "pitrax/version"
require_relative "pitrax/pitraxdbmanager"
require_relative "pitrax/settingsmeta"

module Pitrax

	get '/' do
		if SettingsMeta::has_settings?
			require_relative 'pitrax/settings'
			@@dbm = PitraxDBManager.new(Settings::MUSIC_DB)
			@@dbm.load_songs

			erb :index, :locals => { :song_list => @@dbm.songs_arr }
		else
			redirect '/config'
		end
	end

	get '/config' do
		erb :config, :locals => { }
	end

	post '/config' do
		SettingsMeta::write_settings(params[:music_dir], params[:music_db])
		redirect '/update'
	end

	get '/play' do
		#erb :play, :locals => { :path => params[:file] }
		send_file params[:file]
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

	get '/player' do
		require_relative "pitrax/updater"
		Updater.update

		require_relative 'pitrax/settings'
		#@@dbm = PitraxDBManager.new(Settings::MUSIC_DB)
		#@@dbm.load_songs

		#content_type :json
		songs = @@dbm.songs_arr
		songs = songs.to_json

		erb :player, :locals => { :songs => songs }
	end

	get '/songs' do
		require_relative "pitrax/updater"
		Updater.update

		require_relative 'pitrax/settings'
		@@dbm = PitraxDBManager.new(Settings::MUSIC_DB)
		@@dbm.load_songs

		content_type :json
		songs = @@dbm.songs_arr
		songs.to_json
	end

	# size options = 'small', 'medium', 'large', 'extralarge', 'mega'
	get '/art/:song_id/:size' do
		require_relative 'pitrax/albumart'

		song = @@dbm.get_song(params[:song_id].to_i)
		size = params[:size]

		art_getter = AlbumArt.new(Settings::ART_DIR, Settings::LASTFM_KEY, 'lib/public/assets/img/no-art.png')
		art = art_getter.get_art(song, size)
		if art
			puts 'send_file'
			puts art
			send_file art
		end
	end

end


