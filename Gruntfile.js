module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({

        shell: {
            demo: {
                command: `node-static demo`
            },
        },


    })

}