module JsDuck

  # Auto-detector return values and @chainable tags.
  #
  # Adds @chainable tag when doc-comment contains @return {OwnerClass}
  # this.  Also the other way around: when @chainable found, adds
  # appropriate @return.
  class ReturnValues
    # Only this static method of this class should be called.
    def self.auto_detect(relations)
      ReturnValues.new(relations).process_all!
    end

    def initialize(relations)
      @relations = relations
      @cls = nil
    end

    def process_all!
      @relations.each do |cls|
        @cls = cls
        cls.find_members(:tagname => :method, :local => true, :static => false).each do |m|
          process(m)
        end
      end
    end

    private

    def process(m)
      if constructor?(m)
        add_return_new(m)
      elsif chainable?(m)
        add_return_this(m)
      elsif returns_this?(m)
        add_chainable(m)
      end
    end

    def constructor?(m)
      m[:name] == "constructor"
    end

    def chainable?(m)
      m[:meta][:chainable]
    end

    def returns_this?(m)
      m[:return] && m[:return][:type] == @cls[:name] && m[:return][:doc] =~ /\Athis\b/
    end

    def add_chainable(m)
      m[:meta][:chainable] = true
    end

    def add_return_this(m)
      if m[:return][:type] == "undefined" && m[:return][:doc] == ""
        m[:return] = {:type => @cls[:name], :doc => "this"}
      end
    end

    def add_return_new(m)
      if m[:return][:type] == "undefined" || m[:return][:type] == "Object"
        # Create a whole new :return hash.
        # If we were to just change the :type field it would modify
        # the type of all the inherited constructor docs.
        m[:return] = {:type => @cls[:name], :doc => m[:return][:doc]}
      end
    end
  end

end
