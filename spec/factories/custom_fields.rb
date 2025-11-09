FactoryBot.define do
  factory :custom_field do
    association :client
    sequence(:name) { |n| "custom_field_#{n}" }
    sequence(:display_name) { |n| "Custom Field #{n}" }
    data_type { "freeform" }

    trait :number do
      data_type { "number" }
    end

    trait :enum do
      data_type { "enum" }
      enum_values { "option_a, option_b" }
    end
  end
end

