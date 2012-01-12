module JsDuck

  class Sitemap

    def initialize(opts)
      @opts = opts
    end

    # Writes sitemap.xml to a file
    def write(file)
      urls = []

      if @opts[:categories]
        @opts[:categories].to_array.collect do |category|
          category['groups'].each do |group|
            group['classes'].each do |cls|
              urls << "  <url><loc>#{@opts[:base_url]}/#!/api/#{cls}</loc></url>"
            end
          end
        end
      end

      if @opts[:guides]
        @opts[:guides].to_array.each do |category|
          category['items'].each do |guide|
            urls << "  <url><loc>#{@opts[:base_url]}/#!/guide/#{guide['name']}</loc></url>"
          end
        end
      end

      # @videos.to_array.each do |category|
      #   puts category['items'].collect{|vid| vid['id'] }
      # end

      File.open(file, 'w') do |f|
        f.write [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            urls,
          '</urlset>'
        ].flatten.join("\n")
      end

    end

  end

end
