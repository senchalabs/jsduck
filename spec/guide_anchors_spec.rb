require "jsduck/guide_anchors"

describe JsDuck::GuideAnchors do

  def transform(html)
    JsDuck::GuideAnchors.transform(html, "myguide")
  end

  it "transforms anchor links" do
    transform("<a href='#blah'>label</a>").should ==
      "<a href='#!/guide/myguide-section-blah'>label</a>"
  end

  it "transforms anchor links in fuzzier HTML" do
    transform("<a\n class='blah' href=\"#blah\"\n>label</a>").should ==
      "<a\n class='blah' href=\"#!/guide/myguide-section-blah\"\n>label</a>"
  end

  it "transforms anchor links in longer HTML" do
    transform("Some\nlong\ntext\nhere...\n\n <a href='#blah'>label</a>").should ==
      "Some\nlong\ntext\nhere...\n\n <a href='#!/guide/myguide-section-blah'>label</a>"
  end

  it "doesn't transform normal links" do
    transform("<a href='http://example.com'>label</a>").should ==
      "<a href='http://example.com'>label</a>"
  end

  it "doesn't transform docs-app #! links" do
    transform("<a href='#!/api/Ext.Base'>Ext.Base</a>").should ==
      "<a href='#!/api/Ext.Base'>Ext.Base</a>"
  end

  it "doesn't transform docs-app (backwards-compatible) # links" do
    transform("<a href='#/api/Ext.Base'>Ext.Base</a>").should ==
      "<a href='#/api/Ext.Base'>Ext.Base</a>"
  end

  it "transforms anchors" do
    transform("<a name='blah'>target</a>").should ==
      "<a name='myguide-section-blah'>target</a>"
  end

  it "doesn't transforms anchors already in target format" do
    transform("<a name='myguide-section-blah'>target</a>").should ==
      "<a name='myguide-section-blah'>target</a>"
  end

  it "transforms ID-s" do
    transform("<h1 id='blah'>target</h1>").should ==
      "<h1 id='myguide-section-blah'>target</h1>"
  end

  it "doesn't ID-s already in target format" do
    transform("<h1 id='myguide-section-blah'>target</h1>").should ==
      "<h1 id='myguide-section-blah'>target</h1>"
  end

end
