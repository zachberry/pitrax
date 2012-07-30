require_relative "pitraxfilemanager"
fm = PitraxFileManager.new('media')
list = fm.generate_list
fm.print_list
#puts list