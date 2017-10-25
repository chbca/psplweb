var gulp = require('gulp'),
    del = require('del'),
    less = require('gulp-less'),
    sourcemaps = require('gulp-sourcemaps'),
    spritesmith = require('gulp.spritesmith'),
    autoprefixer = require('gulp-autoprefixer'),
    sequence = require('gulp-sequence'),
    buffer = require('vinyl-buffer'),
    csso = require('gulp-csso'),
    imagemin = require('gulp-imagemin'),
    merge = require('merge-stream'),
    usemin = require('gulp-usemin'),
    uglify=require('gulp-uglify'),
    rev=require('gulp-rev'),
    imageminPngquant=require('imagemin-pngquant'),
    livereload = require('gulp-livereload');
/*
    chrome浏览器上装livereload插件配合使用
 */

gulp.task('clean', function () {
    return del(['dist']);
});
gulp.task('usemin', function () {
    return gulp.src('workspace/*.html')
        .pipe(usemin({
            css: [rev()],
            js: [uglify(), rev()],
        }))
        .pipe(gulp.dest('dist/'));
});
gulp.task('less', function () {
    gulp.src('workspace/less/*.less')
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 3 versions','not ie <= 8'],
            cascade: false
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('workspace/css'))
        .pipe(livereload());
});


gulp.task('watch', function () {
    livereload.listen();
    gulp.watch('workspace/less/**/*.less', ['less']);
    gulp.watch('workspace/sprites/icons/**', ['sprite-icon']);
});

gulp.task('copy', function () {
    return gulp.src(
        ['workspace/images/**', 'workspace/css/*'], {
            base: 'workspace'   //如果设置为 base: 'js' 将只会复制 js目录下文件, 其他文件会忽略
        }
    ).pipe(gulp.dest('dist'));
});

gulp.task('sprite-icon', function () {
    // Generate our spritesheet
    var spriteData = gulp.src('workspace/sprites/icons/*.png').pipe(spritesmith({
        imgName: 'icons.png',
        cssName: 'icons.css',
        padding: 6,
        algorithm: 'binary-tree',
        cssTemplate: "handelbarstr.less",
    }));

    // Pipe image stream through image optimizer and onto disk
    var imgStream = spriteData.img
    // DEV: We must buffer our stream into a Buffer for `imagemin`
        .pipe(buffer())
        .pipe(imagemin())
        .pipe(gulp.dest('workspace/images/'));

    // Pipe CSS stream through CSS optimizer and onto disk
    var cssStream = spriteData.css
        .pipe(csso())
        .pipe(gulp.dest('workspace/css'))
        .pipe(gulp.dest('dist/css/'));

    // Return a merged stream to handle both `end` events
    return merge(imgStream, cssStream);
});
gulp.task('imagemin', function () {
    return gulp.src('workspace/images/**')
        .pipe(imagemin([imageminPngquant({quality: 40, speed: 1})]))
        .pipe(gulp.dest('dist/images'));
});
gulp.task('dist-less', function () {
    gulp.src('workspace/less/*.less')
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 3 versions', 'not ie <= 8'],
            cascade: false
        }))
        .pipe(gulp.dest('dist/css'))
});


gulp.task('default', sequence('clean', ['less', 'sprite-icon', 'watch']));
gulp.task('build', sequence('clean', ['sprite-icon','imagemin','dist-less', 'usemin']));


