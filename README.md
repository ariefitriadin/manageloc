# Building Locations API

This project is a NestJS-based API for managing building locations.
( For Test Purposes Only )

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Test](#test)
- [API Documentation](#api-documentation)
- [Docker](#docker)

## Prerequisites

- Node.js (v14 or later)
- npm or pnpm
- Docker (optional) ( recommended )
- Docker-compose (optional) ( recommended )

## Installation

1. Clone the repository:
   ```
   git clone git@github.com:ariefitriadin/manageloc.git
   cd manageloc
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

   Or if you're using npm:
   ```
   npm install
   ```

3. Set up your environment variables:
   ```
   cp .env.example .env
   ```
   Then edit the `.env` file with your specific configuration.

## Running the App
  One time setup : 
   
   in one time setup, there is no need to edit .env file, 
   all variables are already set in .env.docker and docker-compose.yml
   
1. Run docker-compose up to start all required database, postgres and migrations 
    ```
    docker-compose up
    ```
    wait until all containers are up and running, 
    api can be accessed at http://localhost:3000



  Multiple Step Setup : 


1. Run docker-compose.db to start the database
    ```
    docker-compose.db up -d
    ```

2. Run migrations
    ```
    pnpm run migration:run
    ```

3. start the app
    ```
    pnpm start
    ```
    if you want to run the app in development mode with query logging enabled
    ```
    pnpm start:dev:querylog
    ```

    api can be accessed at http://localhost:3000

## Test

```
pnpm test
``` 

## API Documentation
after application start, you can access the api documentation at
```
http://localhost:3000/api/v1/documentation
```