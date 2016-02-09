var gulp        = require('gulp'),
    stylus      = require('gulp-stylus'),
    del         = require('del'),
    vinylPaths  = require('vinyl-paths'),
    concat      = require('gulp-concat'),
    browserSync = require('browser-sync'),
    cssmin      = require('gulp-cssmin'),
    gulpif      = require('gulp-if'),
    imagemin    = require('gulp-imagemin'),
    rename      = require('gulp-rename'),
    shell       = require('gulp-shell'),
    uglify      = require('gulp-uglify'),
    config      = require('./build.config.json'),
    plumber     = require('gulp-plumber'),
    bower       = require('gulp-bower'),
    // PostCSS processors
    poststylus  = require('poststylus'),
    postcss     = require('gulp-postcss'),
    autoprefixer     = require('autoprefixer'),
    rucksack  = require('rucksack-css'),
    postcssAssets  = require('postcss-assets'),
    postcssSVG  = require('postcss-svg')

// Trigger
var production;

// Task: Clean:before
// Description: Removing assets files before running other tasks
gulp.task('clean:before', function () {
  return gulp.src(
    config.assets.dest
  )
    .pipe(vinylPaths(del))
});

// Task: Handle scripts
gulp.task('scripts', function () {
  return gulp.src(config.scripts.files)
    .pipe(concat(
      'main.js'
    ))
    .pipe(gulpif(production, uglify()))
    .pipe(gulpif(production, rename({
      suffix: '.min'
    })))
    .pipe(gulp.dest(
      config.scripts.dest
    ))
    .pipe(browserSync.reload({stream:true}));
});


// Task: Handle images
gulp.task('images', function () {
  return gulp.src(config.images.files)
    .pipe(gulpif(production, imagemin()))
    .pipe(gulp.dest(
      config.images.dest
    ))
    .pipe(browserSync.reload({stream:true}));
});

// Task: Distribute bower libraries
gulp.task('bower', function () {
  return gulp.src(config.bower.files)
    .pipe(gulp.dest(
      config.bower.dest
    ))
});


// Task: Handle Stylus and CSS procesessing
gulp.task('stylus', function () {
  // Set PostCSS processors
  var processors = [
    autoprefixer({browsers: ['last 2 version']}),
    rucksack,
    postcssAssets,
    postcssSVG({
      paths: [config.images.base + 'svgs/'],
    })
  ];
  return gulp.src(config.stylus.base)
    .pipe(plumber())
    .pipe(stylus({
      use: [
        poststylus(processors)
      ]
    }))
    .pipe(gulpif(production, cssmin()))
    .pipe(gulpif(production, rename({
      suffix: '.min'
    })))
    .pipe(gulp.dest(
      config.stylus.dest
    ))
    .pipe(browserSync.reload({stream:true}));
});


// Task: patternlab
// Description: Build static Pattern Lab files via PHP script
gulp.task('patternlab', function () {
  return gulp.src('', {read: false})
    .pipe(shell([
      'php patternlab.php'
    ]))
    .pipe(browserSync.reload({stream:true}));
});

// Task: styleguide
// Description: Copy Styleguide-Folder from core/ to public
gulp.task('styleguide', function() {
  return gulp.src(config.patternlab.styleguide.files)
    .pipe(gulp.dest(config.patternlab.styleguide.dest));
});

// task: BrowserSync
// Description: Run BrowserSync server with disabled ghost mode
gulp.task('browser-sync', function() {
  browserSync({
    server: {
        baseDir: config.root
    },
    ghostMode: true,
    open: "external"
  });
});

// Task: Watch files
gulp.task('watch', function () {

  // Watch Pattern Lab files
  gulp.watch(
    config.patternlab.files,
    ['patternlab']
  );

  // Watch scripts
  gulp.watch(
    config.scripts.files,
    ['scripts']
  );

  // Watch images
  gulp.watch(
    config.images.files,
    ['images']
  );

  // Watch Stylus
  gulp.watch(
    config.stylus.files,
    ['stylus']
  );

  // Watch Bower
  gulp.watch(
    config.bower.files,
    ['stylus']
  );


});

// Task: Default
// Description: Build all stuff of the project once
gulp.task('default', ['clean:before'], function () {
  production = false;

  gulp.start(
    'stylus',
    'styleguide',
    'images',
    'scripts',
    'patternlab',
    'bower'
  );
});

// Task: Start your production-process
// Description: Typ 'gulp' in the terminal
gulp.task('serve', function () {
  production = false;

  gulp.start(
    'browser-sync',
    'default',
    'watch'
  );
});

// Task: Deploy static content
// Description: Deploy static content using rsync shell command
gulp.task('deploy', function () {
  return gulp.src(config.deployment.local.path, {read: false})
    .pipe(shell([
      'rsync '+ config.deployment.rsync.options +' '+ config.deployment.local.path +'/ '+ config.deployment.remote.host
    ]))
});

// Function: Releasing (Bump & Tagging)
// Description: Bump npm versions, create Git tag and push to origin
gulp.task('release', function () {
  production = true;

  return gulp.src(config.versioning.files)
    .pipe(bump({
      type: gulp.env.type || 'patch'
    }))
    .pipe(gulp.dest('./'))
    .pipe(git.commit('Release a ' + gulp.env.type + '-update'))

    // read only one file to get version number
    .pipe(filter('package.json'))

    // Tag it
    .pipe(tagversion())

    // Publish files and tags to endpoint
    .pipe(shell([
      'git push origin develop',
      'git push origin --tags'
    ]));
});
