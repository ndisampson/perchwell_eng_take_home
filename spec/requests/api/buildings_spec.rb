require "rails_helper"

RSpec.describe "Api::Buildings", type: :request do
  let(:client) { create(:client) }
  let!(:number_field) { create(:custom_field, :number, client: client, name: "height_ft") }
  let!(:enum_field) { create(:custom_field, :enum, client: client, name: "material", enum_values: "Brick, Concrete") }
  let!(:freeform_field) { create(:custom_field, client: client, name: "nickname") }
  let!(:building) do
    create(
      :building,
      client: client,
      custom_field_values: {
        "height_ft" => "120",
        "material" => "Brick",
        "nickname" => "HQ"
      }
    )
  end

  let(:other_client) { create(:client) }
  let!(:other_building) { create(:building, client: other_client) }

  describe "GET /api/buildings" do
    it "returns all buildings with pagination metadata" do
      get "/api/buildings"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json["status"]).to eq("success")
      expect(json["buildings"].map { |b| b["id"] }).to include(building.id.to_s, other_building.id.to_s)
      expect(json["pagination"]).to include(
        "page" => 1,
        "per_page" => 10,
        "total" => 2,
        "total_pages" => 1
      )

      payload = json["buildings"].find { |b| b["id"] == building.id.to_s }
      expect(payload["client"]["id"]).to eq(client.id.to_s)
      expect(payload["client"]["custom_field_defs"].map { |cf| cf["name"] }).to match_array(%w[height_ft material nickname])
      expect(payload["custom_field_vals"]).to include("height_ft" => "120", "material" => "Brick", "nickname" => "HQ")
    end

    it "filters buildings by current client when X-Client-Id header is present" do
      get "/api/buildings", headers: { "X-Client-Id" => client.id.to_s }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json["buildings"].map { |b| b["id"] }).to eq([building.id.to_s])
      expect(json["pagination"]).to include("total" => 1, "total_pages" => 1)
    end
  end

  describe "GET /api/buildings/:id" do
    it "returns the requested building" do
      get "/api/buildings/#{building.id}", headers: { "X-Client-Id" => client.id.to_s }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json["status"]).to eq("success")
      expect(json.dig("data", "building", "id")).to eq(building.id.to_s)
    end

    it "returns not found when the building does not exist" do
      get "/api/buildings/0"

      expect(response).to have_http_status(:not_found)
      json = JSON.parse(response.body)

      expect(json["errors"]).to include("Building not found")
    end

    it "returns forbidden when accessing a building for a different client" do
      get "/api/buildings/#{building.id}", headers: { "X-Client-Id" => other_client.id.to_s }

      expect(response).to have_http_status(:forbidden)
      json = JSON.parse(response.body)

      expect(json["errors"]).to include("Unauthorized: Building does not belong to your client")
    end
  end

  describe "POST /api/buildings" do
    let(:valid_params) do
      {
        building: {
          address: "200 Park Ave",
          city: "New York",
          state: "NY",
          zip: "10017",
          client_id: client.id,
          custom_field_values: {
            height_ft: 250,
            material: "Concrete",
            nickname: "Grand Central"
          }
        }
      }
    end

    it "creates a building when payload is valid" do
      expect do
        post "/api/buildings", params: valid_params, headers: { "X-Client-Id" => client.id.to_s }, as: :json
      end.to change(Building, :count).by(1)

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)

      expect(json["status"]).to eq("Building created successfully")
      expect(json.dig("data", "building", "custom_field_vals")).to include(
        "height_ft" => "250",
        "material" => "Concrete",
        "nickname" => "Grand Central"
      )
    end

    it "rejects creating a building for another client" do
      post "/api/buildings", params: valid_params, headers: { "X-Client-Id" => other_client.id.to_s }, as: :json

      expect(response).to have_http_status(:forbidden)
      json = JSON.parse(response.body)

      expect(json["errors"]).to include("Unauthorized: Cannot create building for different client")
    end

    it "validates custom field values and returns errors" do
      invalid_params = valid_params.deep_dup
      invalid_params[:building][:custom_field_values][:height_ft] = "not-a-number"

      expect do
        post "/api/buildings", params: invalid_params, headers: { "X-Client-Id" => client.id.to_s }, as: :json
      end.not_to change(Building, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)

      expect(json["errors"]).to include("Custom field 'height_ft' must be a number")
    end

    it "validates unknown custom fields and returns errors" do
      invalid_params = valid_params.deep_dup
      invalid_params[:building][:custom_field_values][:unknown] = "value"

      post "/api/buildings", params: invalid_params, headers: { "X-Client-Id" => client.id.to_s }, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)

      expect(json["errors"]).to include("Custom field 'unknown' is not valid for this client")
    end
  end

  describe "PATCH /api/buildings/:id" do
    it "updates a building and returns the formatted payload" do
      patch "/api/buildings/#{building.id}",
            params: {
              building: {
                address: "400 Updated Ave",
                custom_field_values: { height_ft: 180 }
              }
            },
            headers: { "X-Client-Id" => client.id.to_s },
            as: :json

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json["status"]).to eq("Building updated successfully")
      expect(json.dig("data", "building", "address")).to eq("400 Updated Ave")
      expect(json.dig("data", "building", "custom_field_vals", "height_ft")).to eq("180")
    end

    it "returns forbidden when updating a building for another client" do
      patch "/api/buildings/#{building.id}",
            params: { building: { address: "123 Fake St" } },
            headers: { "X-Client-Id" => other_client.id.to_s },
            as: :json

      expect(response).to have_http_status(:forbidden)
      json = JSON.parse(response.body)

      expect(json["errors"]).to include("Unauthorized: Building does not belong to your client")
    end

    it "returns not found when the building is missing" do
      patch "/api/buildings/0",
            params: { building: { address: "123 Fake St" } },
            headers: { "X-Client-Id" => client.id.to_s },
            as: :json

      expect(response).to have_http_status(:not_found)
      json = JSON.parse(response.body)

      expect(json["errors"]).to include("Building not found")
    end

    it "validates custom fields on update" do
      patch "/api/buildings/#{building.id}",
            params: {
              building: {
                custom_field_values: { height_ft: "not-a-number" }
              }
            },
            headers: { "X-Client-Id" => client.id.to_s },
            as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)

      expect(json["errors"]).to include("Custom field 'height_ft' must be a number")
    end
  end
end

