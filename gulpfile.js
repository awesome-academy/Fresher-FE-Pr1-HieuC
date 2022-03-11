/** Declare module */

const { src, dest, parallel, watch, series } = require("gulp"),
  concat = require("gulp-concat"),
  sass = require("gulp-sass"),
  pug = require("gulp-pug"),
  browserSync = require("browser-sync").create();

/** Files Path */
const FilesPath = {
  sassFiles: "assets/scss/**",
  htmlFiles: "*.html",
  pugFiles: "assets/pug/pages/*.pug*",
};

const { sassFiles, htmlFiles, pugFiles } = FilesPath;

/** Sass Task */
function sassTask() {
  return src(sassFiles)
    .pipe(sass({ outputStyle: "compressed" }))
    .pipe(concat("style.css"))
    .pipe(dest("assets/css"))
    .pipe(browserSync.stream());
}

/** Pug Task */
function pugTask() {
  return src(pugFiles)
    .pipe(pug({ pretty: true }))
    .pipe(dest("./"))
    .pipe(browserSync.stream());
}

/** HTML Task */

/** Watch Task */

function serve() {
  browserSync.init({
    server: {
      baseDir: "./",
    },
    port: 3000,
  });
  watch(pugFiles, pugTask);
  watch(sassFiles, sassTask);
}

exports.sass = sassTask;
exports.pug = pugTask;
exports.default = series(parallel(pugTask, sassTask));
exports.serve = series(serve, parallel(pugTask, sassTask));
