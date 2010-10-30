$:.unshift File.dirname(__FILE__) # For running the actual JsDuck app

require 'jsduck/lexer'
require 'jsduck/doc_comment'
require 'jsduck/doc_comment_parser'
require 'jsduck/parser'

require 'pp'

module JsDuck
  def JsDuck.parse(input)
    doc_parser = DocCommentParser.new
    documentation = []

    Parser.new(input).parse.each do |docset|
      # Parsing of doc-block may result in several doc-comment
      # objects. Only the first one of these gets augmented with
      # information inferred from the code that follows doc-block.
      comments = doc_parser.parse(docset[:comment]).map { |d| DocComment.new(d) }
      comments.each { |c| documentation << c }
      doc = comments[0]
      code = docset[:code]

      if code[:type] == :function then
        doc.set_default_name(*code[:name]) if code[:name]
        doc.set_default_params(code[:params])
      elsif code[:type] == :assignment then
        doc.set_default_name(*code[:left])
        if code[:right] then
          right = code[:right]
          if right[:type] == :function then
            doc.set_default_params(right[:params])
          elsif right[:type] == :ext_extend then
            doc.set_default_extends(right[:extend])
          elsif right[:type] == :literal then
            doc.set_default_type(right[:class])
          end
        end
      end
    end

    documentation
  end
end


if __FILE__ == $0 then
  JsDuck.parse($stdin.read).each {|d| pp d; puts}
end

