const gulp = require('gulp');
const responsive = require('gulp-responsive');
const inlineCss = require('gulp-inline-style');
const cleanCss = require('gulp-clean-css');

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
    .pipe(gulp.dest('img/dist'));
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
