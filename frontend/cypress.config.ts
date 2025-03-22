import { defineConfig } from 'cypress';
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';
import { createEsbuildPlugin } from '@badeball/cypress-cucumber-preprocessor/esbuild';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/features/**/*.feature',
    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config);

      on(
        'file:preprocessor',
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        })
      );

      config.env = {
        ...config.env,
        stepDefinitions: 'cypress/fixtures/**/*.{js,ts}',
      };    

      return config;
    },
    fixturesFolder: 'cypress/fixtures', // explicitly set, optional but recommended
    supportFile: 'cypress/support/e2e.ts', // explicitly set, optional but recommended
  },
});
