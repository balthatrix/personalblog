class AddSourceUrlToGame < ActiveRecord::Migration[5.0]
  def change
    add_column :games, :source_url, :string
  end
end
