require_relative "pitraxfilemanager"
fm = PitraxFileManager.new('media')
list = fm.generate_list
list.print
puts list