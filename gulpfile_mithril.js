'use strict';
var gulp = require('gulp');
var spawn = require('child_process').spawn;
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var gutil = require('gulp-util');
var browserify = require('gulp-browserify');


var files = {
  styles: {
    src: './public/sass/*.scss',
    dest: './public/css/',
  },
  mithril: {
    src: 'src/admin/app.js',
    dest: 'public/admin',
  },
  watch: {
    styles: 'public/sass/**/*.scss',
    server: ['server/**/*.js', 'server/**/*.html'],
    scripts: ['src/**/*.js'],
  }
};

var node;
gulp.task('server', function() {
  if (node) node.kill()
  node = spawn('node', ['start.js'], {stdio: 'inherit'})
  node.on('close', function (code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
})

gulp.task('watch', function() {
  gulp.watch(files.watch.styles, ['styles']);
  gulp.watch(files.watch.server, ['server']);
  gulp.watch(files.watch.scripts, ['scripts']);
});



gulp.task('styles', function() {
    function styleError(err) {
        gutil.beep();
        console.error(gutil.colors.red("Styles Error"));
        console.error("Message:\n    ", err.message);
        console.error("Details:");
        console.error("    Filename:", err.file);
        console.error("    Line:", err.line);
        console.error("    Col:", err.column);
    }

    return gulp.src(files.styles.src)
        .pipe(plumber())
        .pipe(sass({onError: styleError}))
        .pipe(gulp.dest(files.styles.dest))
    ;
});


// Basic usage
gulp.task('scripts', function() {
    // Single entry point to browserify
    gulp.src(files.mithril.src)
        .pipe(browserify({
          insertGlobals : true,
          debug : !gulp.env.production,
          transform: ['mithrilify'],
        }))
        .pipe(gulp.dest(files.mithril.dest))
});



gulp.task('default', ['styles', 'scripts', 'server', 'watch'], function() {});


// clean up if an error goes unhandled.
process.on('exit', function() {
    if (node) node.kill()
})
