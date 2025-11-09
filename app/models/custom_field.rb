class CustomField < ApplicationRecord
  belongs_to :client

  # Explicitly define attributes
  attribute :name, :string
  attribute :display_name, :string
  attribute :data_type, :string
  attribute :client_id, :integer
  attribute :enum_values, :text

  DATA_TYPES = %w[number freeform enum].freeze

  validates :name, presence: true, uniqueness: { scope: :client_id, case_sensitive: false }
  validates :display_name, presence: true
  validates :data_type, inclusion: { in: DATA_TYPES }
end

