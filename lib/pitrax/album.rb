class Album

	attr_accessor :id, :name, :artist

	def initialize(id, name, artist)
		@id = id
		@name = name
		@artist = artist
	end

	def to_s
		"ALBUM id:#{@id} name:#{@name} artist:#{@artist}"
	end

end