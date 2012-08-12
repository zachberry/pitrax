#require_relative "pitraxfilemanager"
#fm = PitraxFileManager.new('media')
#list = fm.generate_list
#fm.print_list
#puts list

# require_relative "pitrax/pitraxdbmanager"
# require_relative "pitrax/songfinder"
# dbm = PitraxDBManager.new('test.db')
# puts "current"
# dbm.load_songs
# puts dbm.songs
# songFinder = SongFinder.new('media', dbm)
# songFinder.find_songs
# puts "found"
# dbm.load_songs
# puts dbm.songs

#dbm.add_album('Beaucoup Fish', 'Underworld')

require_relative "pitrax/settingsmeta"

puts SettingsMeta::has_settings?