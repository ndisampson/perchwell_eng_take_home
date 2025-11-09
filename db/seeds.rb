# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# seed clients first
clients_data = [
  { name: 'James Baldwin' },
  { name: 'Mike Gravel' },
  { name: 'Nina Simone' },
  { name: 'Noam Chomsky' },
  { name: 'Six Seven' },
  { name: 'Zohran M.' }
]

clients = clients_data.map do |client_data|
  Client.find_or_create_by!(name: client_data[:name])
end

# seed custom fields for each client
clients.each do |client|
  # Create a few custom fields per client
  custom_fields_data = [
    { name: "basement", display_name: 'Basement', data_type: 'enum', enum_values: 'Yes,No' },
    { name: "brick_wall_color", display_name: 'Brick Wall Color', data_type: 'freeform', enum_values: nil },
    { name: "door_type", display_name: 'Door Type', data_type: 'enum', enum_values: 'Wood,Metal,None' },
    { name: "fence_type", display_name: 'Fence Type', data_type: 'enum', enum_values: 'Wood,Metal,None' },
    { name: "fireplace", display_name: 'Fireplace', data_type: 'enum', enum_values: 'Yes,No' },
    { name: "garage_type", display_name: 'Garage Type', data_type: 'enum', enum_values: 'Attached,Detached,None' },
    { name: "pool_type", display_name: 'Pool Type', data_type: 'enum', enum_values: 'Inground,Above Ground,None' },
    { name: "rock_wall_size", display_name: 'Rock Wall Size', data_type: 'number', enum_values: nil },
    { name: "roof_type", display_name: 'Roof Type', data_type: 'enum', enum_values: 'Tile,Metal,None' },
    { name: "walk_in_closet", display_name: 'Walk-in Closet', data_type: 'enum', enum_values: 'Yes,No' },
    { name: "walkway_type", display_name: 'Walkway Type', data_type: 'enum', enum_values: 'Brick,Concrete,None' },
    { name: "washer_dryer", display_name: 'Washer/Dryer', data_type: 'enum', enum_values: 'Yes,No' },
    { name: "window_type", display_name: 'Window Type', data_type: 'enum', enum_values: 'Double Pane,Triple Pane,None' },
  ]

  sample_size = ((rand * 10) % custom_fields_data.length)
  
  custom_fields_data.sample(sample_size).each do |cf_data|
    CustomField.find_or_create_by!(
      name: cf_data[:name],
      client: client
    ) do |cf|
      cf.display_name = cf_data[:display_name]
      cf.data_type = cf_data[:data_type]
      cf.enum_values = cf_data[:enum_values] if cf_data[:enum_values]
    end
  end
end

# seed buildings for each client
clients.each_with_index do |client, idx|
  buildings_data = [
    { address: "#{100 + 3 * idx * 100} Main St", city: 'Anytown', state: 'CA', zip: '12345' },
    { address: "#{200 + 3 * idx * 100} Main St", city: 'Anytown', state: 'CA', zip: '12345' },
    { address: "#{300 + 3 * idx * 100} Main St", city: 'Anytown', state: 'CA', zip: '12345' }
  ]
  
  buildings_data.each_with_index do |building_data, building_idx|
    building = Building.find_or_create_by!(
      address: building_data[:address],
      city: building_data[:city],
      state: building_data[:state],
      zip: building_data[:zip],
      client: client
    )
    
    # Set custom field values for the building
    client_custom_fields = client.custom_fields
    custom_field_values = {}
    
    client_custom_fields.each do |cf|
      case cf.data_type
      when 'number'
        custom_field_values[cf.name] = (10 + building_idx * 5).to_s
      when 'freeform'
        custom_field_values[cf.name] = ['Blue', 'Red', 'Green'][building_idx % 3]
      when 'enum'
        enum_options = cf.enum_values&.split(',') || ['Brick', 'Concrete', 'None']
        custom_field_values[cf.name] = enum_options[building_idx % enum_options.length]
      end
    end
    
    building.update!(custom_field_values: custom_field_values) if custom_field_values.any?
  end
end