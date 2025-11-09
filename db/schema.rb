# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2025_11_09_120000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "buildings", force: :cascade do |t|
    t.string "address"
    t.string "city"
    t.string "state"
    t.string "zip"
    t.bigint "client_id", null: false
    t.jsonb "custom_field_values"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["client_id"], name: "index_buildings_on_client_id"
  end

  create_table "clients", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "custom_fields", force: :cascade do |t|
    t.string "name"
    t.string "display_name"
    t.string "data_type"
    t.bigint "client_id", null: false
    t.text "enum_values"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["client_id", "name"], name: "index_custom_fields_on_client_id_and_name", unique: true
    t.index ["client_id"], name: "index_custom_fields_on_client_id"
  end

  add_foreign_key "buildings", "clients"
  add_foreign_key "custom_fields", "clients"
end
