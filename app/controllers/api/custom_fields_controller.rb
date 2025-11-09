module Api
  class CustomFieldsController < BaseController
    before_action :set_custom_field, only: [:show, :update, :destroy]
    
    # GET /api/clients/:client_id/custom_fields
    def index
      client = Client.find_by(id: params[:client_id])
      
      if client.nil?
        render_error(["Client not found"], "error", :not_found)
        return
      end
      
      # Check authorization: client_id in header must match client_id in params
      if current_client && client.id != current_client.id
        render_error(["Unauthorized: Cannot access custom fields for different client"], "error", :forbidden)
        return
      end
      
      custom_fields_data = client.custom_fields.map { |cf| helpers.format_custom_field(cf) }
      
      render_success({ custom_fields: custom_fields_data }, "success")
    end
    
    # GET /api/custom_fields/:id
    def show
      if @custom_field.nil?
        render_error(["Custom field not found"], "error", :not_found)
        return
      end
      
      # Check authorization: client_id in header must match custom field's client_id
      if current_client && @custom_field.client_id != current_client.id
        render_error(["Unauthorized: Custom field does not belong to your client"], "error", :forbidden)
        return
      end
      
      render_success({ custom_field: helpers.format_custom_field(@custom_field) }, "success")
    end
    
    # POST /api/clients/:client_id/custom_fields
    def create
      client = Client.find_by(id: params[:client_id])
      
      if client.nil?
        render_error(["Client not found"], "error", :not_found)
        return
      end
      
      # Check authorization: client_id in header must match client_id in params
      if current_client && client.id != current_client.id
        render_error(["Unauthorized: Cannot create custom field for different client"], "error", :forbidden)
        return
      end
      
      @custom_field = client.custom_fields.build(custom_field_params)
      
      if @custom_field.save
        render_success({ custom_field: helpers.format_custom_field(@custom_field) }, "Custom field created successfully", :created)
      else
        render_error(@custom_field.errors.full_messages, "error", :unprocessable_entity)
      end
    end
    
    # PUT/PATCH /api/custom_fields/:id
    def update
      if @custom_field.nil?
        render_error(["Custom field not found"], "error", :not_found)
        return
      end
      
      # Check authorization: client_id in header must match custom field's client_id
      if current_client && @custom_field.client_id != current_client.id
        render_error(["Unauthorized: Custom field does not belong to your client"], "error", :forbidden)
        return
      end
      
      if @custom_field.update(custom_field_params)
        render_success({ custom_field: helpers.format_custom_field(@custom_field) }, "Custom field updated successfully")
      else
        render_error(@custom_field.errors.full_messages, "error", :unprocessable_entity)
      end
    end
    
    # DELETE /api/custom_fields/:id
    def destroy
      if @custom_field.nil?
        render_error(["Custom field not found"], "error", :not_found)
        return
      end
      
      # Check authorization: client_id in header must match custom field's client_id
      if current_client && @custom_field.client_id != current_client.id
        render_error(["Unauthorized: Custom field does not belong to your client"], "error", :forbidden)
        return
      end
      
      if @custom_field.destroy
        render_success({}, "Custom field deleted successfully")
      else
        render_error(["Failed to delete custom field"], "error", :unprocessable_entity)
      end
    end
    
    private
    
    def set_custom_field
      @custom_field = CustomField.find_by(id: params[:id])
    end
    
    def custom_field_params
      params.require(:custom_field).permit(:name, :display_name, :data_type, :enum_values)
    end
  end
end

