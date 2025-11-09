module ApplicationHelper
  def format_custom_field(custom_field)
    return {} unless custom_field

    {
      id: custom_field.id.to_s,
      name: custom_field.name,
      display_name: custom_field.display_name,
      data_type: custom_field.data_type,
      client_id: custom_field.client_id.to_s,
      enum_values: custom_field.enum_values
    }
  end

  def format_client(client)
    return {} unless client

    {
      id: client.id.to_s,
      name: client.name,
      custom_fields: client.custom_fields.map { |cf| format_custom_field(cf) }
    }
  end

  def format_building(building)
    return {} unless building

    {
      id: building.id.to_s,
      client: {
        name: building.client.name,
        id: building.client.id.to_s,
        custom_field_defs: building.client.custom_fields.map do |cf|
          {
            name: cf.name,
            display_name: cf.display_name,
            data_type: cf.data_type,
            enum_values: cf.enum_values
          }
        end
      },
      custom_field_vals: building.client.custom_fields.each_with_object({}) do |custom_field, vals|
        value = building.custom_field_values&.[](custom_field.name) || ""
        vals[custom_field.name] = value.to_s
      end,
      address: building.address,
      city: building.city,
      state: building.state,
      zip: building.zip
    }
  end
end
