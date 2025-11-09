Rails.application.routes.draw do
  get "welcome/index"
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/*
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

  # API Routes
  namespace :api do
    resources :buildings, only: [:index, :show, :create, :update]
    resources :clients, only: [:index, :show] do
      resources :custom_fields, only: [:index, :create]
    end
    resources :custom_fields, only: [:show, :update, :destroy]
  end

  # React Router routes - explicit routes for SSR readiness
  # Each route maps to a React Router path and serves the welcome#index view
  # This allows for easy SSR implementation later by changing the controller action
  root "home#index"
  get "/buildings", to: "home#index"
  get "/buildings/new", to: "home#index"
  get "/buildings/:id/edit", to: "home#index"
  get "/custom-fields", to: "home#index"
  
  # Add more React Router routes here as needed:
  # get "/buildings/:id", to: "home#index"
end
