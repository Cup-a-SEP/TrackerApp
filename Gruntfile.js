// THIS GRUNTFILE MINIMIZES THE AMOUNT OF FILES COPIED DURING CORDOVA PREPARE
// BASED ON THE FILES REFERENCED IN INDEX.HTML (SO NOT WORKING IF ANY DYNAMIC INCLUDES)
// 
// Is being run by the after_prepare hook found in /.cordova/hooks
// 
// REQUIRES:
// nodejs & npm
// 
// INSTALL:
// $ npm install
// (will read package.json file for dependencies and installs the world)

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        after_prepare: {
            options: {
                cwd: 'www',
                htmlFile: 'index.html',
                alwaysInclude: ['index.html', 'config.xml', 'img/**'],
                foldersToClean: ['platforms/android/assets/www/', 'platforms/ios/www/']
            }
        }
    });

    // Register Tasks
    grunt.registerTask('after_prepare', 'After cordova prepare', function() {
        // Force task into async mode and grab a handle to the "done" function.
        var done = this.async();

        var path    = require('path');
        var cheerio = require('cheerio');

        grunt.log.writeln('Currently running the "after_prepare" task.');

        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            'cwd': 'www',
            'htmlFile': 'index.html',
            'alwaysInclude': [],
            'foldersToClean': []
        });


        function findIncludesFromHTML (htmlFile, cbFindIncludes) {
            var data = grunt.file.read(htmlFile);

            $ = cheerio.load(data);

            var includedFiles = [];

            $('script,link[rel="stylesheet"][type="text/css"]').each(function() {
                var el = $(this);
                var src = null;

                if (el.is('script')) {
                    src = el.attr('src');
                } else if (el.is('link')) {
                    src = el.attr('href');
                }

                if (src) {
                    includedFiles.push(src);
                }
            });
            cbFindIncludes(null, includedFiles);
        }
        
        function getFilesToKeep (files) {
            return grunt.file.expand({
                'cwd': options.cwd,
                'dot': true,
                'filter': 'isFile'
            }, files.concat(options.alwaysInclude));
        }

        function getFilesToDelete (filesToKeep) {
            return grunt.file.expand({
                'cwd': options.cwd,
                'dot': true,
                'filter': function(filepath) {
                    // Get all files that are not in filesToKeep
                    return grunt.file.isFile(filepath) && filesToKeep.indexOf(path.relative(options.cwd, filepath)) === -1;
                }
            }, ['**']);
        }

        function hasFiles (folderpath) {
            var files = grunt.file.expand({
                'cwd': folderpath,
                'dot': true,
                'filter': 'isFile'
            }, ['**', '!.DS_Store']);
            return files.length > 0;
        }

        function cleanFolders (toDelete, cbCleanFolders) {
            options.foldersToClean.forEach(function (folder) {
                toDelete.forEach(function (fileToDelete) {
                    var fullPath = path.join(folder, fileToDelete);
                    if (grunt.file.exists(fullPath)) {
                        // console.warn('delete:', fullPath);
                        grunt.file.delete(fullPath);
                    }
                });
            });
            cbCleanFolders();
        }

        function removeEmptyFolders (cbRemoveEmpty) {
            options.foldersToClean.forEach(function (folder) {
                var folders = grunt.file.expand({
                    'cwd': folder,
                    'dot': true,
                    'filter': function (filepath) {
                        return grunt.file.isDir(filepath) && filepath !== folder;
                    }
                }, ['**']);

                folders.forEach(function (folderToDelete) {
                    var fullPath = path.join(folder, folderToDelete);

                    if (grunt.file.exists(fullPath) && !hasFiles(fullPath)) {
                        // console.warn('delete empty folder:', fullPath);
                        grunt.file.delete(fullPath);
                    }
                });
            });
            cbRemoveEmpty();
        }

        findIncludesFromHTML(path.join(options.cwd, options.htmlFile), function (err, files) {
            if (err) {
                done(false);
            }

            var toKeep = getFilesToKeep(files);
            // console.warn('TO KEEP', toKeep);

            var toDelete = getFilesToDelete(toKeep);
            // console.warn('TO DELETE', toDelete);

            cleanFolders(toDelete, function () {
                removeEmptyFolders(function () {
                    done();
                });
            });
        });
    });

};