class AddUniqueIndexToCustomFields < ActiveRecord::Migration[7.2]
  def change
    add_index :custom_fields, [:client_id, :name], unique: true
  end
end

