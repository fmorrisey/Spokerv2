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
        global: { // TODO: Increase code coverage once feature becomes finalized
          statements: 50,
          branches: 25,
          functions: 50,
          lines: 50
        }
      }
    },
    reporters: ['progress', 'kjhtml', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    failOnEmptyTestSuite: true,
    autoWatch: true,
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
      },
      FirefoxHeadlessCI: {
        base: 'Firefox',
        flags: ['-headless', '-new-instance', '-no-remote']
      }
    },
    browsers: ['ChromeHeadlessCI'],
    singleRun: true,
    restartOnFileChange: true,
    hostname: 'localhost',
    listenAddress: '127.0.0.1',
    browserNoActivityTimeout: 120000,
    captureTimeout: 120000,
    browserDisconnectTimeout: 120000,
    browserDisconnectTolerance: 3,
  });
};
