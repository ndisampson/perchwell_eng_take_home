module Api
  class BuildingsController < BaseController
    before_action :set_building, only: [:update]
    
    # GET /api/buildings/:id
    def show
      building = Building.find_by(id: params[:id])
      
      if building.nil?
        render_error(["Building not found"], "error", :not_found)
        return
      end
      
      # Check authorization: client_id in header must match building's client_id
      if current_client && building.client_id != current_client.id
        render_error(["Unauthorized: Building does not belong to your client"], "error", :forbidden)
        return
      end
      
      render_success({ building: helpers.format_building(building) }, "success")
    end
    
    # GET /api/buildings
    def index
      buildings = Building.includes(:client)
      
      # Filter by client_id from header if present
      if current_client
        buildings = buildings.where(client_id: current_client.id)
      end
      
      # Pagination
      page = params[:page]&.to_i || 1
      per_page = params[:per_page]&.to_i || 10
      per_page = [per_page, 100].min # Cap at 100 per page
      page = [page, 1].max # Ensure page is at least 1
      
      offset = (page - 1) * per_page
      total_count = buildings.count
      buildings = buildings.order(updated_at: :desc).limit(per_page).offset(offset)
      
      buildings_data = buildings.map { |building| helpers.format_building(building) }
      
      render json: { 
        status: "success",
        buildings: buildings_data,
        pagination: {
          page: page,
          per_page: per_page,
          total: total_count,
          total_pages: (total_count.to_f / per_page).ceil
        }
      }, status: :ok
    end
    
    # POST /api/buildings
    def create
      # Check authorization: client_id in header must match client_id in params
      if current_client
        requested_client_id = building_params[:client_id]
        if requested_client_id.present? && requested_client_id.to_i != current_client.id
          render_error(["Unauthorized: Cannot create building for different client"], "error", :forbidden)
          return
        end
      end
      
      building_attributes = building_params.to_h
      if current_client
        building_attributes["client_id"] = current_client.id
      end
      @building = Building.new(building_attributes)
      
      if validate_custom_fields && @building.save
        render_success({ building: helpers.format_building(@building) }, "Building created successfully", :created)
      else
        errors = @building.errors.full_messages
        errors.concat(@custom_field_errors) if @custom_field_errors
        render_error(errors, "error", :unprocessable_entity)
      end
    end
    
    # PUT/PATCH /api/buildings/:id
    def update
      if @building.nil?
        render_error(["Building not found"], "error", :not_found)
        return
      end
      
      # Check authorization: client_id in header must match building's client_id
      if current_client && @building.client_id != current_client.id
        render_error(["Unauthorized: Building does not belong to your client"], "error", :forbidden)
        return
      end
      
      # Also check if trying to change client_id to a different client
      if current_client && building_params[:client_id]
        requested_client_id = building_params[:client_id]&.to_i
        if requested_client_id != current_client.id
          render_error(["Unauthorized: Cannot change building to different client"], "error", :forbidden)
          return
        end
      end
      
      if validate_custom_fields && @building.update(building_params)
        render_success({ building: helpers.format_building(@building) }, "Building updated successfully")
      else
        errors = @building.errors.full_messages
        errors.concat(@custom_field_errors) if @custom_field_errors
        render_error(errors, "error", :unprocessable_entity)
      end
    end
    
    private
    
    def set_building
      @building = Building.find_by(id: params[:id])
    end
    
    def building_params
      params.require(:building).permit(:address, :city, :state, :zip, :client_id, custom_field_values: {})
    end
    
    def validate_custom_fields
      @custom_field_errors = []
      
      return true unless params[:building] && params[:building][:custom_field_values]
      
      custom_field_values = extract_custom_field_values(params[:building][:custom_field_values])
      client_id = params[:building][:client_id] || @building&.client_id
      
      return true if client_id.nil?
      
      client = Client.find_by(id: client_id)
      return true unless client
      
      client_custom_fields = client.custom_fields.index_by(&:name)
      sanitized_values = {}
      
      custom_field_values.each do |field_name, value|
        key = field_name.to_s
        custom_field = client_custom_fields[key]
        
        if custom_field.nil?
          @custom_field_errors << "Custom field '#{field_name}' is not valid for this client"
          next
        end
        
        case custom_field.data_type
        when 'number'
          if value.blank?
            sanitized_values[key] = nil
          elsif numeric?(value)
            sanitized_values[key] = cast_number(value)
          else
            @custom_field_errors << "Custom field '#{field_name}' must be a number"
          end
        when 'freeform'
          if value.blank? || value.is_a?(String)
            sanitized_values[key] = value
          else
            @custom_field_errors << "Custom field '#{field_name}' must be a string"
          end
        when 'enum'
          if value.blank?
            sanitized_values[key] = nil
          else
            enum_options = custom_field.enum_values&.split(',') || []
            if enum_options.map(&:strip).include?(value.to_s.strip)
              sanitized_values[key] = value.to_s
            else
              @custom_field_errors << "Custom field '#{field_name}' must be one of: #{enum_options.join(', ')}"
            end
          end
        else
          sanitized_values[key] = value
        end
      end
      
      assign_sanitized_custom_fields(sanitized_values) if @custom_field_errors.empty?
      
      @custom_field_errors.empty?
    end
    
    def numeric?(value)
      return true if value.blank?
      Float(value)
      true
    rescue ArgumentError, TypeError
      false
    end
    
    def cast_number(value)
      return value if value.is_a?(Numeric)
      Float(value)
    end
    
    def extract_custom_field_values(raw_values)
      case raw_values
      when ActionController::Parameters
        raw_values.to_unsafe_h
      when Hash
        raw_values.deep_dup
      else
        {}
      end
    end
    
    def assign_sanitized_custom_fields(values)
      params[:building][:custom_field_values] = values
      @building.custom_field_values = values if @building
    end
  end
end

