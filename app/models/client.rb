class Client < ApplicationRecord
  has_many :buildings, dependent: :destroy
  has_many :custom_fields, dependent: :destroy

  # Explicitly define attributes
  attribute :name, :string

  validates :name, presence: true
end

