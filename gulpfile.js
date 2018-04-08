const gulp = require('gulp');
const responsive = require('gulp-responsive');
const inlineCss = require('gulp-inline-style');
const cleanCss = require('gulp-clean-css');
const minifyJs = require('gulp-minify');
const concatJs = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const serve = require('gulp-serve');

gulp.task('images', function () {
  return gulp.src('img/*.{jpg,png}')
    .pipe(responsive({
      // Resize all JPG images to three different sizes: 200, 500, and 630 pixels
      '*': [{
        width: 320,
        rename: { suffix: '-320px' },
      }, {
        width: 640,
        rename: { suffix: '-640px' },
      }, {
        // Compress, strip metadata, and rename original image
        rename: { suffix: '-original' },
      },
      {
        width: 320,
        rename: { suffix: '-320px', extname:'.webp' },
      }, {
        width: 640,
        rename: { suffix: '-640px', extname:'.webp' },
      }, {
        // Compress, strip metadata, and rename original image
        rename: { suffix: '-original', extname:'.webp' },
      }]
    }, {
      // Global configuration for all images
      // The output quality for JPEG, WebP and TIFF output formats
      quality: 70,
      // Use progressive (interlace) scan for JPEG and PNG output
      progressive: true,
      // Strip all metadata
      withMetadata: false,
    }))
    .pipe(gulp.dest('dist/img'));
});

gulp.task('css',['minify-css'], function() {
    gulp.src('./*.html')
    .pipe(inlineCss('./.tmp/'))
    .pipe(gulp.dest('dist'));
})

gulp.task('minify-css', function() {

  return gulp.src('./css/*.css')
  .pipe(cleanCss())
  .pipe(gulp.dest('./.tmp/css'));

});

gulp.task('concat-js', function() {
  gulp.src(['./js/common.js','./js/dbhelper.js','./js/idb.js'])
  .pipe(sourcemaps.init())
  .pipe(concatJs('common.js'))
  .pipe(minifyJs())
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('dist/js'))

  gulp.src('./js/main.js')
  .pipe(concatJs('main.js'))
  .pipe(minifyJs())
  .pipe(gulp.dest('dist/js'))

  gulp.src('./js/restaurant_info.js')
  .pipe(concatJs('restaurant_info.js'))
  .pipe(minifyJs())
  .pipe(gulp.dest('dist/js'))
})

gulp.task('watch', function() {
  gulp.watch('js/**/*.js', ['concat-js']);
  gulp.watch('css/**/*.css', ['css']);
  gulp.watch('*.html', ['css']);
});

gulp.task('copy-serviceworker', function() {
  gulp.src('sw.js')
  .pipe(gulp.dest('dist/'));

  gulp.src('manifest.json').pipe(gulp.dest('dist'));
})

gulp.task('default',['images','css','concat-js','copy-serviceworker','watch', 'serve'])

gulp.task('serve', serve('dist'));
