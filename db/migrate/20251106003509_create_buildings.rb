class CreateBuildings < ActiveRecord::Migration[7.2]
  def change
    create_table :buildings do |t|
      t.string :address
      t.string :city
      t.string :state
      t.string :zip
      t.references :client, null: false, foreign_key: true
      t.jsonb :custom_field_values

      t.timestamps
    end
  end
end
