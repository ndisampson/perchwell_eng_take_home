module Api
  class BaseController < ApplicationController
    # Skip CSRF token verification for API endpoints
    skip_before_action :verify_authenticity_token
    
    protected
    
    def current_client
      @current_client ||= begin
        client_id = request.headers['X-Client-Id']
        return nil if client_id.blank?
        Client.find_by(id: client_id)
      end
    end
    
    def render_success(data = {}, message = "success", status = :ok)
      render json: { status: message, data: data }, status: status
    end
    
    def render_error(errors, message = "error", status = :unprocessable_entity)
      render json: { status: message, errors: errors }, status: status
    end
  end
end

