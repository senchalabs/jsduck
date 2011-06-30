require 'json'

module JsDuck

  # Utility class for writing JsonP files
  class JsonP

    # Turns hash into JSON and writes inside JavaScript that calls the
    # given callback name
    def self.write(filename, callback_name, data)
      jsonp = "Ext.data.JsonP." + callback_name + "(" + JSON.pretty_generate(data) + ");"
      File.open(filename, 'w') {|f| f.write(jsonp) }
    end

  end

end
