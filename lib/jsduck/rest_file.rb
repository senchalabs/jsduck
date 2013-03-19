require 'yaml'
YAML::ENGINE.yamler = 'syck'

module JsDuck
  # Represents one YAML file documenting a REST object
  #
  class RestFile
    attr_reader :filename
    attr_reader :contents
    attr_reader :docs
    attr_reader :html_filename

    def initialize(contents, filename="", options={})
      @contents = contents
      @filename = filename
      @options = options
      @links = {}
      # we don't do source linking for REST files, but we'll put together a fake file
      # object to keep the other classes happy...
      @fakefile = {
          :filename => filename,
          :href => filename,
          :linenr => 0
      }

      classData = YAML.load(contents)

      @docs = parse
    end

    # loops through each doc-object in file
    def each(&block)
      @docs.each(&block)
    end

    def id(doc)
      if doc[:tagname] == :class
        doc[:name].gsub(/\./, '-')
      else
        # when creation of global class is skipped,
        # this owner property can be nil.
        (doc[:owner] || "global").gsub(/\./, '-') + "-" + doc[:id]
      end
    end

    private


    # Parses the YAML file
    def parse
      begin 
        data = YAML.load(@contents)
      rescue Exception => e
        print "Error: failed to parse " + @filename
      end
      objects = []
      data.each do |item|
        if item[0] == "name"
            @currentObject = {
                :tagname => :class,
                :name => item[1],
                :doc => "",
                :alternateClassNames => [],
                :mixins => [],
                :meta => {},
                :aliases => {},
                :files => [ @fakefile ],
                :members => {
                    :method => [],
                    :property => [],
                    :example => [],
                    :cfg => []
                }
            }
            objects << @currentObject
        elsif item[0] == "description"
            @currentObject[:doc] = item[1]
        elsif item[0] == "private"
            @currentObject[:private] = item[1]
        elsif item[0] == "mixin"
            @currentObject[:mixins] << item[1]
        elsif item[0] == "methods"
            item[1].each do |method|
               objects << parse_method(method)
            end
        elsif item[0] == "fields"
            item[1].each do |property|
               objects << parse_property(property)
            end
        elsif item[0] == "examples"
            item[1].each do |ex|
               objects << parse_example(ex)
            end
        else
            print "Warning: Skipping tag " + item[0] + "\n"
        end
      end
      objects
    end

    def parse_method(method)
        methodHash = { 
            :tagname => :method,
            :name => method["name"],
            :id => "method-"+method["name"],
            :doc => method["description"],
            :files => [ @fakefile ],
            :meta => {
                :hide => false,
                :loginRequired => false
            },
            :url => "Error: No URL set for this method.",
            :httpMethod => "GET",
            :return => { 
                :type => "undefined"
            },
            :examples => []
        }
        if not methodHash.has_key?(:url)
            print "Error: method " + method["name"] + " in " + @fakefile + " missing URL\n"
        end
        method.each do |tag|
            if tag[0] == "parameters"
                tag[1].each do |param|
                    if not methodHash.has_key?(:params)
                        methodHash[:params] = []
                    end
                    methodHash[:params] << parse_parameter(param)
                end
            elsif tag[0] == "response-parameters"
                tag[1].each do |param|
                    if not methodHash.has_key?(:response)
                        methodHash[:response] = []
                    end
                    methodHash[:response] << parse_parameter(param)
                end
            elsif tag[0] == "examples"
                tag[1].each do |ex|
                    if not methodHash.has_key?(:examples)
                        methodHash[:examples] = []
                    end
                    methodHash[:examples] << parse_example(ex)
                end
            elsif tag[0] == "http-method"
                httpmethod = tag[1]
                if not httpmethod
                    print "Error, bad HTTP method in "+ method["name"] + " in " + @fakefile + " \n"
                end
                methodHash[:httpMethod] = httpmethod.upcase
            elsif tag[0] == "url"
                methodHash[:url] = tag[1]
            elsif tag[0] == "login-required"
                methodHash[:meta][:loginRequired] = tag[1]
            end
        end
        methodHash
    end

    def parse_property(prop)
        propHash = { 
            :tagname => :property,
            :files => [ @fakefile ],
            :optional => true,
            :meta => {
                [:hide] => false
            }
        }
        prop.each do |tag|
            if tag[0] == "name"
                propHash[:name] = tag[1]
                propHash[:id] = "property-"+tag[1]
            elsif tag[0] == "description"
                propHash[:doc] = tag[1]
            elsif tag[0] == "type"
                propHash[:type] = convert_type(tag[1])
            elsif tag[0] == "required"
                propHash[:optional] = ! tag[1]
            end
        end
        propHash
    end

    def parse_example(ex)
        exampleHash = { 
            :tagname => :example,
            :name => "example-" + ex["platform"],
            :files => [ @fakefile ],
            :platform => ex["platform"],
            :doc => ex["example"],
            :meta => {
                [:hide] => false
            }
        }
        exampleHash
    end

    def parse_parameter(param)
        paramHash = { 
            :name  => param["name"],
            :doc => param["description"]
        }
        if param.has_key?("required")
            paramHash[:optional] = ! param["required"]
        else
            paramHash[:optional] = true
        end
        if param.has_key?("type")
            paramHash[:type] = convert_type(param["type"])
        end
        paramHash
    end

    def convert_type(type)
      converted_type = type
      if type.kind_of?(String)
        if type =~ /^Array</
            converted_type = type.sub(/^Array<([^>]*)>/,'\1[]')
        end
      elsif type.kind_of?(Array)
        converted_type = type.map { |t| convert_type(t) }.join("/")
      end
      converted_type
    end

  end

end
