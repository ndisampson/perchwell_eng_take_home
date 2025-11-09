module Api
  class ClientsController < BaseController
    # GET /api/clients
    def index
      clients = Client.includes(:custom_fields).all
      
      clients_data = clients.map { |client| helpers.format_client(client) }
      
      render_success({ clients: clients_data }, "success")
    end

    # GET /api/clients/:id
    def show
      client = Client.find_by(id: params[:id])
      
      if client.nil?
        render_error(["Client not found"], "error", :not_found)
        return
      end
      
      # Check authorization: client_id in header must match client_id in params
      if current_client && client.id != current_client.id
        render_error(["Unauthorized: Client does not belong to your client"], "error", :forbidden)
        return
      end
    
      render_success({ client: helpers.format_client(client) }, "success")
    end
  end
end

