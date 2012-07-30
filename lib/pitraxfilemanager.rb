class PitraxFileManager

	attr_reader :target_dir, :list

	#valid_file_types = ['mp3']

	def initialize(target_dir)
		@target_dir = target_dir
	end

	def generate_list()
		@list = populate_dir(MusicDir.new(@target_dir))
		@list
	end

	def print_list(level = 0, list = @list)
		tabs = "\t" * level
		puts tabs + list.name + ':'
		list.files.each do |file|
			puts tabs + "\t#{file.tag}"
		end
		level += 1
		list.subdirs.each do |subdir|
			print_list(level, subdir)
		end
	end

	protected
	def dir?(entry)
		File.directory?(entry)
	end

	def file?(entry)
		!dir?(entry) && entry.include?('.mp3')
	end

	def actual?(entry)
		!(entry == '.' || entry == '..')
	end

	def populate_dir(dir)
		Dir.entries(dir.name).select do |entry|
			if actual? entry
				full_rel_path = File.join(dir.name, entry)
				if file?(full_rel_path)
					new_item = MusicFile.new(full_rel_path)
				elsif dir?(full_rel_path)
					new_item = MusicDir.new(full_rel_path)
					populate_dir(new_item)
				end

				if new_item != nil
					dir.add_item(new_item)
				end
			end
		end

		dir
	end

end


#require 'id3' # requires changing the library to include digest/md5 instead of just md5

class MusicDir

	attr_accessor :name, :files, :subdirs

	def initialize(name)
		@name = name
		@files = []
		@subdirs = []
	end

	def add_item(item)
		if item.instance_of?(MusicDir)
			if !item.empty?
				@subdirs.push item
			end
		else
			@files.push item
		end
	end

	def empty?
		@files.length == 0 && @subdirs.length == 0
	end

	def to_s
		"DIR:'#{name}'|FILES:#{files}|SUBDIRS:#{subdirs}"
	end

end


require_relative "tagger"
class MusicFile

	attr_reader :path, :tag

	def initialize(path)
		@path = path
		@tag = Tagger.generate_tag(path)
	end

	def to_s
		"<FILE:'#{@path}'|TAG:#{@tag}>"
	end

	protected
	def get_tag(path)
		puts path
		Mp3Info.open(path) do |mp3|
			@tag = mp3.tag
		end
	end
end


# abstracted so we can switch out the library that creates it
class MusicTag

	attr_accessor :title, :artist, :album, :tracknum, :genre

	def to_s
		"Title:#{@title},Artist:#{@artist},Album:#{@album},Tracknum:#{@tracknum},Genre:#{@genre}"
	end

end