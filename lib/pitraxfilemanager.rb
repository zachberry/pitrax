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

	def print_list()
		@list.print
	end

	protected
	def dir?(entry)
		(actual? entry) && (File.directory? File.join(@target_dir, entry))
	end

	def file?(entry)
		(actual? entry) && (!dir? entry) && entry.include?('.mp3')
	end

	def actual?(entry)
		!(entry == '.' || entry == '..')
	end

	def populate_dir(dir)
		Dir.entries(dir.name).select do |entry|
			#puts "entry is #{entry}"
			if file?(entry) 
				new_item = MusicFile.new(entry)
			elsif dir?(entry)
				#puts 'deeper'
				new_item = MusicDir.new(File.join(dir.name, entry))
				populate_dir(new_item)
			end

			if new_item != nil
				dir.add_item(new_item)
			end
		end

		#puts "returning #{dir}"
		dir
	end

end


class MusicDir

	attr_accessor :name, :files, :subdirs

	def initialize(name)
		@name = name
		@files = []
		@subdirs = []
	end

	def add_item(item)
		puts item.class

		if item.instance_of?(MusicDir)
			puts 'HERE'
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

	def print
		subdirs_str = ''
		subdirs.each do |subdir|
			#subdirs_str = subdirs_str + subdir.print
		end

		files_str = ''
		files.each do |file|
			files_str += file.to_s + "\n"
		end

		puts "#{name}:\n\t#{files_str}\n\t#{subdirs_str}"
	end

end


class MusicFile

	attr_accessor :name

	def initialize(name)
		@name = name
	end

	def to_s
		"FILE:'#{@name}'"
	end
end
