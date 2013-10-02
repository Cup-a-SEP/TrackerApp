'use strict';

module.exports = function (grunt) {
  // load grunt tasks
  grunt.loadNpmTasks('grunt-preprocess');

  grunt.initConfig({
    preprocess : {
      options: {
        context : {
          $PACKAGE_NAME: process.env.PACKAGE_NAME
        }
      },
      js : {
        src : 'StatusNotificationIntentGruntPreprocess.java',
        dest : 'src/android/StatusNotificationIntent.java'
      }
    }
  });

  grunt.registerTask('default', ['preprocess']);
};
