require "sinatra"
require "sinatra/reloader"
require "erb"
require_relative "pitrax/version"
require_relative "pitraxfilemanager"

module Pitrax

	MUSIC_DIR = 'media'

	@@fileManager = PitraxFileManager.new(MUSIC_DIR)

	get '/' do
		erb :index, :locals => { :file_list => @@fileManager.get_list }
	end

end


