require "sinatra"
require "sinatra/reloader"
require "erb"
require_relative "pitrax/version"

module Pitrax

	get '/' do
		erb :index, :locals => { }
	end

end
