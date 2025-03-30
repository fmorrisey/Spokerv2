module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
    ],

    client: {
      jasmine: {
        random: false
      },
      clearContext: false,
      captureConsole: false,
      useIframe: false
    },
    jasmineHtmlReporter: {
      suppressAll: true,
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ],
      check: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80
        }
      }
    },
    reporters: ['progress', 'kjhtml', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    failOnEmptyTestSuite: true,
    autoWatch: true,
    browsers: ['ChromeHeadless', 'FirefoxHeadless'],
    singleRun: true,
    restartOnFileChange: true
  });
};
