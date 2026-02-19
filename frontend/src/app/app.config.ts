import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { ConfigService } from './services/config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: (config: ConfigService) => () => config.loadConfig(),
      deps: [ConfigService],
      multi: true,
    },
  ]
};
