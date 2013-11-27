
describe "smoke test running jsduck --version" do

  it "does not crash" do
    # Explicitly include rubygems, otherwise TravisCI will fail to
    # load the parallel and possibly other gems in Ruby 1.8
    `ruby -e 'require "rubygems"' ./bin/jsduck --version`
    $?.exitstatus.should == 0
  end

end
