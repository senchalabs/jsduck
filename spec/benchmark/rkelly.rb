# Test for RKelly tokenizer
#
require 'rkelly'

tokenizer = RKelly::Tokenizer.new

ARGV.each do |fname|
  tokenizer.tokenize(IO.read(fname))
end
