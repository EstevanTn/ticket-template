let gulp = require('gulp');
let plumber = require('gulp-plumber');
let pug = require('gulp-pug');
let browserSync = require('browser-sync');
let sass = require('gulp-sass');
let postcss = require('gulp-postcss');
let cssnano = require('cssnano');
let watch = require('gulp-watch');
let browserify = require('browserify');
let babelify = require('babelify');
let source = require('vinyl-source-stream');
let sourcemaps = require('gulp-sourcemaps');
let buffer = require('vinyl-buffer');
let coffee = require('gulp-coffee');
let ts = require('gulp-typescript');
let notify = require('gulp-notify');

const server = browserSync.create();

// compressed|nested|expanded|compact
const sassOptions = {
    outputStyle: 'expanded'
};

const postcssPlugins = [
    cssnano({
        core: false,
        autoprefixer: {
            add: true,
            browsers: '> 1%, last 2 versions, Firefox ESR, Opera 12.1'
        }
    })
];

const tsProject = ts.createProject('tsconfig.json', {
    noImplicitAny: true
});

const pumblerOptions = {
    errorHandler: notify.onError({
        message: 'Error: <%= error.message %>',
        title: 'Error running something',
        appIcon: './public/images/app-error.png'
    }),
};

const notifyOptions = {
    title: 'Static template',
    message: 'Generated file: <%= file.relative %>',
    appIcon: './public/images/app.png',
    templateOptions: {
        date: new Date()
    }
}

gulp.task('styles', () =>
    gulp.src('./src/scss/style.scss')
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(plumber(pumblerOptions))
    .pipe(sass(sassOptions))
    .pipe(postcss(postcssPlugins))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./public/css'))
    .pipe(server.stream({match: '**/*.css'}))
    .pipe(notify(notifyOptions))
)

gulp.task('pug', () =>
    gulp.src('./src/pug/pages/*.pug')
    .pipe(plumber(pumblerOptions))
    .pipe(pug({
		pretty: true
    }))
    .pipe(gulp.dest('./public'))
    .pipe(notify(notifyOptions))
)

gulp.task('scripts', () =>
    browserify({
	    entries: ['./src/js/index.js'],
	    debug: true,
	    transform: ['vueify']
    })
    .transform(babelify, { presets: ['es2015', 'react'] })
    .bundle()
    .on('error', function(err){
      console.error(err);
      this.emit('end')
    })
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./public/js'))
    .pipe(notify(notifyOptions))
)

gulp.task('coffee', ()=> {
	gulp.src('./src/coffee/**/*.coffee')
  	.pipe(plumber(pumblerOptions))
  	.pipe(coffee())
    .pipe(gulp.dest('./src/coffee/dist'))
    .pipe(notify(notifyOptions))
})

gulp.task('tsc', ()=> {
    gulp.src('./src/ts/**/*.ts')
    .pipe(plumber(pumblerOptions))
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./src/ts/dist'))
    .pipe(notify(notifyOptions))
})

gulp.task('default', () => {
    server.init({
        server: {
            baseDir: './public'
        },
    });

    watch('./src/scss/**/*.scss', () => gulp.start('styles'));
    watch('./src/coffee/**/*.coffee', () => gulp.start('coffee'));
    watch(['./src/js/**/*.js', './src/vue/**/*.vue'], () => gulp.start('scripts',server.reload) );
    watch('./src/ts/**/*.ts', () => gulp.start('tsc', server.reload));
    watch('./src/pug/**/*.pug', () => gulp.start('pug', server.reload) );
})