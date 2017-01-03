require "jsduck/guide_toc"

describe JsDuck::GuideToc do

  def inject(html)
    JsDuck::GuideToc.inject(html, "myguide")
  end

  it "adds no toc section when no headings" do
    inject("blah").should_not =~ /<div class='toc'>/
  end

  it "adds no toc section when less than two H2 headings" do
    inject(<<-EOHTML).should_not =~ /<div class='toc'>/
      <h2>Chapter A</h2>
    EOHTML
  end

  it "adds toc section when at least two H2 headings" do
    inject(<<-EOHTML).should =~ /<div class='toc'>/
      <h2>Chapter A</h2>
      <h2>Chapter B</h2>
    EOHTML
  end

  it "adds ID-s to H2 headings" do
    inject(<<-EOHTML).should =~ /<h2 id='myguide-section-my-chapter'>My Chapter/
      <h2>My Chapter</h2>
      <h2>Another Chapter</h2>
    EOHTML
  end

  it "links to headings from TOC" do
    inject(<<-EOHTML).should =~ /<a href='#!\/guide\/myguide-section-my-chapter'>/
      <h2>My Chapter</h2>
      <h2>Another Chapter</h2>
    EOHTML
  end

  it "adds ID-s to H2 headings even when no TOC" do
    inject(<<-EOHTML).should =~ /<h2 id='myguide-section-my-chapter'>My Chapter/
      <h2>My Chapter</h2>
    EOHTML
  end

  it "ignores HTML in headings" do
    inject(<<-EOHTML).should =~ /<h2 id='myguide-section-my-chapter'>My Chapter/
      <h2>My <span>Chapter</span></h2>
    EOHTML
  end

  it "adds ID-s also all H* headings" do
    inject(<<-EOHTML).should =~ /<h5 id='myguide-section-my-chapter'>My Chapter/
      <h5>My Chapter</h5>
    EOHTML
  end

  it "doesn't include any other headings besides H2 to TOC" do
    inject(<<-EOHTML).should_not =~ /<a href='#!\/guide\/myguide-section-my-chapter'>/
      <h3>My Chapter</h3>
      <h5>Another Chapter</h5>
    EOHTML
  end

end
