// Karma configuration file for Angular + Jasmine + Coverage
module.exports = function (config) {
    config.set({
      basePath: '',
      frameworks: ['jasmine', '@angular-devkit/build-angular'],
      plugins: [
        require('karma-jasmine'),
        require('karma-chrome-launcher'),
        require('karma-coverage'),
        require('karma-jasmine-html-reporter'),
        require('@angular-devkit/build-angular/plugins/karma')
      ],
      client: {
        jasmine: {
          random: false
        },
        clearContext: false // leave Jasmine Spec Runner output visible in browser
      },
      coverageReporter: {
        dir: require('path').join(__dirname, './coverage/spokerv2'),
        subdir: '.',
        reporters: [
          { type: 'html' },
          { type: 'text-summary' }
        ]
      },
      reporters: ['progress', 'kjhtml', 'coverage'],
      port: 9876,
      colors: true,
      logLevel: config.LOG_INFO,
      autoWatch: true,
      browsers: ['ChromeHeadless'], //<--- We'll add firefox support later
      singleRun: true,
      restartOnFileChange: false
    });
  };
  