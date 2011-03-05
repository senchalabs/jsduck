require "jsduck/class"
require "jsduck/members"

describe JsDuck::Members do

  before do
    @members = JsDuck::Members.new
  end

  describe "first_sentence" do
    it "extracts first sentence" do
      @members.first_sentence("Hi John. This is me.").should == "Hi John."
    end
    it "extracts first sentence of multiline text" do
      @members.first_sentence("Hi\nJohn.\nThis\nis\nme.").should == "Hi\nJohn."
    end
    it "returns everything if no dots in text" do
      @members.first_sentence("Hi John this is me").should == "Hi John this is me"
    end
    it "returns everything if no dots in text" do
      @members.first_sentence("Hi John this is me").should == "Hi John this is me"
    end
    it "ignores dots inside words" do
      @members.first_sentence("Hi John th.is is me").should == "Hi John th.is is me"
    end
    it "ignores first empty sentence" do
      @members.first_sentence(". Hi John. This is me.").should == ". Hi John."
    end
  end

end

