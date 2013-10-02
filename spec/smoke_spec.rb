
describe "smoke test running jsduck --version" do

  it "does not crash" do
    `./bin/jsduck --version`
    $?.exitstatus.should == 0
  end

end
