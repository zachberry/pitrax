require "sqlite3"
#require_relative "tagger"
#require_relative "album" #@TODO delete?
#require_relative "song"

#lastfm = Lastfm.new(Settings::LASTFM_KEY, Settings::LASTFM_SECRET)
#token = lastfm.auth.get_token
#lastfm.session = lastfm.auth.get_session(:token => token)['key']

class LastFmManager

	attr_reader :api

	def initialize(db_file_path)
		@db_file_path = db_file_path
		@db = SQLite3::Database.open @db_file_path

		create_tables
	end

	

	# if authorization is needed then this returns the authorization url
	# otherwise it returns false
	def get_auth_url
		session_key = get_session_key
		if(session_key)
			false
		end

		"http://www.last.fm/api/auth/?api_key=" + Settings::LASTFM_KEY + "&token=" + token
	end

	private
	def create_tables
		@db.execute "CREATE TABLE IF NOT EXISTS last_fm (id INTEGER PRIMARY KEY, key VARCHAR(255) UNIQUE, value VARCHAR(255));"
	end

	def get_session_key
		@db.execute "SELECT * FROM lastfm WHERE key='session_key'"
	end

end
























