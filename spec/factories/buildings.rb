FactoryBot.define do
  factory :building do
    association :client
    sequence(:address) { |n| "123#{n} Main St" }
    city { "New York" }
    state { "NY" }
    zip { "10001" }
    custom_field_values { {} }
  end
end

