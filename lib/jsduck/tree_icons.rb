module JsDuck

  # Takes the structure produced by JsDuck::Tree.create and creates
  # hashmap of classname-icon pairs.
  class TreeIcons
    def extract_icons(node)
      icons = {}
      if node[:children]
        node[:children].each do |child|
          icons.merge!(extract_icons(child))
        end
      else
        icons[node[:clsName]] = node[:iconCls]
      end
      icons
    end
  end

end
