require 'v8'
require 'json'
require 'singleton'

class V8::Object
  attr_reader :native
end

module JsDuck

  # Uses Esprima.js engine through V8 to tokenize JavaScript string.
  class EsprimaTokenizer
    include Singleton

    def initialize
      @v8 = V8::Context.new
      esprima = File.dirname(File.dirname(File.dirname(File.dirname(File.expand_path(__FILE__)))))+"/esprima/esprima.js";
      @v8.load(esprima)
      wrapper = File.dirname((File.expand_path(__FILE__)))+"/esprima_wrapper.js";
      @v8.load(wrapper)
    end

    # Input must be a String.
    def tokenize(input)
      @v8['js'] = @input = input

      out = @v8.eval("EsprimaWrapper.parse(js)")

      len = out["type"].length
      out_type = out["type"].native
      out_value = out["value"].native
      out_linenr = out["linenr"].native
      out_value_array = out["valueArray"].native

      lock = V8::C::Locker.new

      type_array = [
        :number,
        :string,
        :ident,
        :regex,
        :operator,
        :keyword,
        :doc_comment,
      ]

      value_array = []
      for i in (0..(out_value_array.Length()-1))
        value_array << out_value_array.Get(i).AsciiValue();
      end

      tokens = []
      for i in (0..(len-1))
        t = type_array[out_type.Get(i)]
        if t == :doc_comment
          tokens << { :type => t, :value => out_value.Get(i).AsciiValue(), :linenr => out_linenr.Get(i) }
        elsif t == :keyword
          kw = value_array[out_value.Get(i)].to_sym
          tokens << { :type => kw, :value => kw }
        else
          tokens << { :type => t, :value => value_array[out_value.Get(i)] }
        end
      end

      lock.delete

      tokens
    end

  end
end
