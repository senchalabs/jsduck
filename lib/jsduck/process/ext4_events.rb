module JsDuck
  module Process

    # Appends Ext4 options parameter to the parameter list of each event
    # in each class.
    #
    # But only does so when :ext4_events option is set to true or the
    # code itself is detected as being writted in Ext4 style.
    class Ext4Events
      def initialize(classes, opts={})
        @classes = classes
        @opts = opts
      end

      def process_all!
        if @opts[:ext4_events] == true || (@opts[:ext4_events] == nil && ext4_style_code?)
          @classes.each_value {|cls| process(cls) }
        end
      end

      # Are we dealing with code looking like ExtJS 4?
      # True if any of the classes is defined with Ext.define()
      def ext4_style_code?
        @classes.values.any? {|cls| cls[:code_type] == :ext_define }
      end

      def process(cls)
        cls[:members].each do |m|
          m[:params] << OPTIONS if m[:tagname] == :event
        end
      end

      OPTIONS = {
        :tagname => :param,
        :name => "eOpts",
        :type => "Object",
        :doc => "The options object passed to {@link Ext.util.Observable#addListener}."
      }

    end

  end
end
