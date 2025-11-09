require "rails_helper"

RSpec.describe "Api::CustomFields", type: :request do
  let(:client) { create(:client) }
  let(:headers) { { "X-Client-Id" => client.id.to_s } }
  let!(:custom_field) { create(:custom_field, client: client, name: "nickname", display_name: "Nickname") }
  let(:other_client) { create(:client) }

  describe "GET /api/clients/:client_id/custom_fields" do
    it "returns all custom fields for a client" do
      get "/api/clients/#{client.id}/custom_fields", headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json["status"]).to eq("success")
      expect(json.dig("data", "custom_fields").first).to include(
        "id" => custom_field.id.to_s,
        "name" => "nickname",
        "display_name" => "Nickname"
      )
    end

    it "returns forbidden when requesting fields for a different client" do
      get "/api/clients/#{client.id}/custom_fields", headers: { "X-Client-Id" => other_client.id.to_s }

      expect(response).to have_http_status(:forbidden)
      json = JSON.parse(response.body)

      expect(json["errors"]).to include("Unauthorized: Cannot access custom fields for different client")
    end

    it "returns not found for a missing client" do
      get "/api/clients/0/custom_fields"

      expect(response).to have_http_status(:not_found)
      json = JSON.parse(response.body)

      expect(json["errors"]).to include("Client not found")
    end
  end

  describe "GET /api/custom_fields/:id" do
    it "returns the requested custom field" do
      get "/api/custom_fields/#{custom_field.id}", headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json["status"]).to eq("success")
      expect(json.dig("data", "custom_field", "id")).to eq(custom_field.id.to_s)
    end

    it "returns forbidden when the custom field belongs to another client" do
      other_custom_field = create(:custom_field, client: other_client)

      get "/api/custom_fields/#{other_custom_field.id}", headers: headers

      expect(response).to have_http_status(:forbidden)
      json = JSON.parse(response.body)

      expect(json["errors"]).to include("Unauthorized: Custom field does not belong to your client")
    end

    it "returns not found when the custom field is missing" do
      get "/api/custom_fields/0"

      expect(response).to have_http_status(:not_found)
      json = JSON.parse(response.body)

      expect(json["errors"]).to include("Custom field not found")
    end
  end

  describe "POST /api/clients/:client_id/custom_fields" do
    let(:valid_params) do
      {
        custom_field: {
          name: "height",
          display_name: "Height (ft)",
          data_type: "number"
        }
      }
    end

    it "creates a custom field for the client" do
      expect do
        post "/api/clients/#{client.id}/custom_fields", params: valid_params, headers: headers, as: :json
      end.to change(CustomField, :count).by(1)

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)

      expect(json["status"]).to eq("Custom field created successfully")
      expect(json.dig("data", "custom_field", "name")).to eq("height")
    end

    it "prevents creating a custom field for another client" do
      post "/api/clients/#{client.id}/custom_fields", params: valid_params, headers: { "X-Client-Id" => other_client.id.to_s }, as: :json

      expect(response).to have_http_status(:forbidden)
      json = JSON.parse(response.body)

      expect(json["errors"]).to include("Unauthorized: Cannot create custom field for different client")
    end

    it "validates payload" do
      invalid_params = {
        custom_field: {
          name: "height",
          display_name: "Height (ft)",
          data_type: "invalid"
        }
      }

      expect do
        post "/api/clients/#{client.id}/custom_fields", params: invalid_params, headers: headers, as: :json
      end.not_to change(CustomField, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)

      expect(json["errors"]).to include("Data type is not included in the list")
    end
  end

  describe "PATCH /api/custom_fields/:id" do
    it "updates the custom field" do
      patch "/api/custom_fields/#{custom_field.id}",
            params: { custom_field: { display_name: "Building Nickname" } },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json["status"]).to eq("Custom field updated successfully")
      expect(json.dig("data", "custom_field", "display_name")).to eq("Building Nickname")
      expect(custom_field.reload.display_name).to eq("Building Nickname")
    end

    it "prevents updating a custom field belonging to another client" do
      other_custom_field = create(:custom_field, client: other_client)

      patch "/api/custom_fields/#{other_custom_field.id}",
            params: { custom_field: { display_name: "Updated" } },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:forbidden)
      json = JSON.parse(response.body)

      expect(json["errors"]).to include("Unauthorized: Custom field does not belong to your client")
    end

    it "returns validation errors when update fails" do
      patch "/api/custom_fields/#{custom_field.id}",
            params: { custom_field: { data_type: "invalid" } },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)

      expect(json["errors"]).to include("Data type is not included in the list")
    end

    it "returns not found when the custom field is missing" do
      patch "/api/custom_fields/0",
            params: { custom_field: { display_name: "Missing" } },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:not_found)
      json = JSON.parse(response.body)

      expect(json["errors"]).to include("Custom field not found")
    end
  end

  describe "DELETE /api/custom_fields/:id" do
    it "deletes the custom field" do
      expect do
        delete "/api/custom_fields/#{custom_field.id}", headers: headers
      end.to change(CustomField, :count).by(-1)

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json["status"]).to eq("Custom field deleted successfully")
    end

    it "prevents deleting a custom field for another client" do
      other_custom_field = create(:custom_field, client: other_client)

      delete "/api/custom_fields/#{other_custom_field.id}", headers: headers

      expect(response).to have_http_status(:forbidden)
      json = JSON.parse(response.body)

      expect(json["errors"]).to include("Unauthorized: Custom field does not belong to your client")
    end

    it "returns not found when the custom field is missing" do
      delete "/api/custom_fields/0", headers: headers

      expect(response).to have_http_status(:not_found)
      json = JSON.parse(response.body)

      expect(json["errors"]).to include("Custom field not found")
    end
  end
end

