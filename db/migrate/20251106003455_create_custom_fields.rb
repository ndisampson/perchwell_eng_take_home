class CreateCustomFields < ActiveRecord::Migration[7.2]
  def change
    create_table :custom_fields do |t|
      t.string :name
      t.string :display_name
      t.string :data_type
      t.references :client, null: false, foreign_key: true
      t.text :enum_values

      t.timestamps
    end
  end
end
