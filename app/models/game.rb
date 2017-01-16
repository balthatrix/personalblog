class Game < ApplicationRecord
 def self.find_by_slug s
   t = s.gsub /-/, " "
   Game.where("LOWER(title) = ?", t).last
 end
end
