module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jsbeautifier: {
            files: [
                "api/*.js",
                "models/*.js",
                "passport/*.js",
                "routes/*.js",
                "views/**/*.js",
                "config.js",
                "Gruntfile.js",
                "server.js"
            ],
        }
    });

    grunt.loadNpmTasks("grunt-jsbeautifier");

    // Default task(s).
    grunt.registerTask('default', ['jsbeautifier']);

};
