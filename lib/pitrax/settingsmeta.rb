module SettingsMeta

	SETTINGS_FILE = "pitrax/settings.rb"

	def self.has_settings?()
		begin
			file = File.open(SETTINGS_FILE, "r")
			file.close
		rescue
			return false
		end

		true
	end

	protected
	def self.write_settings(music_dir, music_db)
		begin
			File.delete(SETTINGS_FILE)
		rescue
			#
		end

		File.open(SETTINGS_FILE, "w") do |f|
			f.write "module Settings\n"
			f.write "	MUSIC_DIR = '#{music_dir}'\n"
			f.write "	MUSIC_DB = '#{music_db}'\n"
			f.write "end\n"
		end
	end

end
