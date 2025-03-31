# Spoker V2 Frontend Architecture  

```
/frontend
├── Dockerfile         # Dockerfile for the production builds
    ├── Dockerfile.dev     # Dockerfile for the development environments
    ├── karma.conf.js      # Configuration for the Jasmine-Karma unit testing 
    ├── cypress            # Cypress-Gherkin Test Files
|── src/
    ├── app/
    │   ├── components/      # Reusable UI components
    │   ├── pages/           # Page-level components (Home, Product, Cart)
    │   ├── services/        # API calls & shared services
    │   ├── guards/          # Route protection logic
    │   ├── interceptors/    # Global HTTP interceptors (JWT, error handling)
    │   ├── store/           # NgRx (if used)
    │   ├── app-routing.module.ts  # App routes
    │   ├── app.module.ts          # Main Angular module
    │   ├── app.component.ts       # Root component
    ├── assets/            # Static files (images, icons, etc.)
    ├── environments/      # Configuration for dev & prod
    ├── styles.scss        # Global styles
    ├── main.ts            # Bootstrap Angular
    ├── test.ts            # Tests Client
    ├── index.html         # Main HTML file


```

### Logging and Errors
Error Service tied into logging to allow tracing issues up the stack. This service will use RxJs to allow the developer to easily pass and process errors to the console, server, and log files.


