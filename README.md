# Spoker v2 - Work In Progress 
Spoker v2 - refactored from the ground up using professional industry development experience. SpokerV2 is based on my original devCodeCamp Capstone project from 2020 called [Spoker.io](https://github.com/fmorrisey/Spoker.io). After 4 years of industry experience, it's long overdue for a refactoring from the ground up.


## Getting Started

### Local App Hot-Load Development Environment
 - `npm run build:dev` builds the local development docker environment image
 - `npm run docker:dev` run the local development docker environment image with hot-loading
 ** point browser at `localhost:4200`

### Production App Deployment and Testing
 - `npm run build:prod` builds the local development docker environment image
 - `npm run docker:prod` run the local development docker environment image with hot-loading
 ** point browser at `localhost:4200`


## Basic Design
- [Backend](./design/technical/backend_arch.md)   
- [Frontend](./design/technical/frontend_arch.md)

## Testing

## Frontend Testing
- `npm run test:frontend` will run unit tests for the frontend client with code coverage report found in the `frontend/coverage` directory
- `npm run cy:test:frontend` will run Cypress tests for the frontend client `frontend/coverage` directory

### Unit Testing

### Cypress
From the frontend client directory
- `npx cypress open`
- `npx cypress run`
