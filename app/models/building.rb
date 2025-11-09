class Building < ApplicationRecord
  belongs_to :client

  # Explicitly define attributes
  attribute :address, :string
  attribute :city, :string
  attribute :state, :string
  attribute :zip, :string
  attribute :client_id, :integer
  attribute :custom_field_values, :jsonb, default: {}

  validates :address, presence: true
  validates :state, presence: true
  validates :city, presence: true
  validates :zip, presence: true, format: { with: /\A\d{5}\z/, message: "must be exactly 5 digits" }
end

