# Perchwell Engineering Take-Home

Welcome to the Perchwell take-home assignment!

# Requirements

Please see the requirements [here](https://github.com/RivingtonHoldings/engineering_take_home/blob/main/REQUIREMENTS.md).

# Local Dev Setup

## Running with Docker

### Initial Setup

```bash
# Start db and app containers
docker compose up -d

# Set up database
docker compose exec web rails db:setup
docker compose exec web rails db:seed
```

Access the application at http://localhost:3000

### Reset Database

```bash
# Quick reset (drop, create, migrate, seed)
docker compose exec web rails db:reset

# Complete reset (remove volumes and start fresh)
docker compose down -v
docker compose up -d
docker compose exec web rails db:setup
docker compose exec web rails db:seed
```

### Useful Commands

```bash
# Rails console
docker compose exec web rails console

# Run tests
docker compose exec web RAILS_ENV=test bundle exec rspec

# View logs
docker compose logs -f web
```

## Running Locally (without Docker)

### Prerequisites

- Ruby 3.x
- PostgreSQL
- Node.js and Yarn

### Setup

```bash
# Install dependencies
bundle install
yarn install

# Start the db docker container only
docker compose up db -d

# Create and initialize the database
rails db:setup
rails db:seed

# Start server
yarn build
bundle exec rails s
```

### Reset Database

```bash
# Clear all data and reseed (keeps database structure)
rails db:seed:replant

# Or drop and recreate database (full reset)
rails db:reset
```