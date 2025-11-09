require "rails_helper"

RSpec.describe "Api::Clients", type: :request do
  describe "GET /api/clients" do
    it "returns all clients with their custom fields" do
      client = create(:client)
      create(:custom_field, client: client, name: "nickname", display_name: "Nickname")
      create(:custom_field, client: client, name: "height_ft", display_name: "Height (ft)", data_type: "number")

      get "/api/clients"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json["status"]).to eq("success")
      expect(json.dig("data", "clients").size).to eq(1)

      client_payload = json.dig("data", "clients").first
      expect(client_payload["id"]).to eq(client.id.to_s)
      expect(client_payload["name"]).to eq(client.name)
      expect(client_payload["custom_fields"].map { |cf| cf["name"] }).to match_array(%w[nickname height_ft])
    end
  end

  describe "GET /api/clients/:id" do
    let(:client) { create(:client) }

    it "returns the requested client when authorized" do
      get "/api/clients/#{client.id}", headers: { "X-Client-Id" => client.id.to_s }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json["status"]).to eq("success")
      expect(json.dig("data", "client", "id")).to eq(client.id.to_s)
    end

    it "returns forbidden when requesting a different client" do
      other_client = create(:client)

      get "/api/clients/#{client.id}", headers: { "X-Client-Id" => other_client.id.to_s }

      expect(response).to have_http_status(:forbidden)
      json = JSON.parse(response.body)

      expect(json["errors"]).to include("Unauthorized: Client does not belong to your client")
    end

    it "returns not found when the client does not exist" do
      get "/api/clients/0", headers: { "X-Client-Id" => client.id.to_s }

      expect(response).to have_http_status(:not_found)
      json = JSON.parse(response.body)

      expect(json["errors"]).to include("Client not found")
    end
  end
end

