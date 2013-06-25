# Test RKelly adapter.
$:.unshift File.dirname(File.dirname(File.dirname(__FILE__))) + "/lib"
require 'jsduck/js/rkelly_parser'
require 'pp'

pp RKelly::Parser.new.parse(<<-EOS, "foo.js")
        // Another
        x = 10;
EOS

# parser = JsDuck::Js::RKellyParser.new(<<-EOS)
#         /* Hello world
#         */

#         // Another
# EOS

# pp parser.parse
