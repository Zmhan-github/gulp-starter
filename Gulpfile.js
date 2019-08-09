const { src, dest, parallel, series, watch } = require("gulp");
// CSS
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const soursemaps = require("gulp-sourcemaps");

// JS
const browserify = require("browserify");
const babelify = require("babelify");
const babel = require("gulp-babel");
const sourse = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");

// Browser
const browserSync = require("browser-sync").create();

const jsURL = "build/js";
const jsSRC = "main.js";
const jsFolder = "src/js/";
const jsWatch = "src/js/**/*.js";
const jsVendor = "!src/js/vendor/**";
const jsFiles = [jsSRC];

const cssURL = "build/css";
const cssSRC = "src/sass/main.scss";
const cssWatch = "src/sass/**/*.scss";
const cssVendor = "!src/sass/vendor/**";

const browser_sync = () => {
  browserSync.init({
    open: false,
    injectChanges: true,
    ui: false,
    server: {
      baseDir: "build"
    }
  });
};

const reload = done => {
  browserSync.reload();
  done();
};

const watch_files = () => {
  watch(cssWatch, series(css, reload));
  watch([jsWatch, jsVendor], series(js, reload));
};

const js = done => {
  jsFiles.map(entry =>
    browserify({ entries: [jsFolder + entry] })
      .transform(babelify, {
        presets: ["@babel/preset-env"]
      })
      .bundle()
      .pipe(sourse(entry))
      .pipe(rename({ extname: ".min.js" }))
      .pipe(buffer())
      .pipe(soursemaps.init({ loadMaps: false }))
      .pipe(uglify())
      .pipe(soursemaps.write("./"))
      .pipe(dest(jsURL))
      .pipe(browserSync.stream())
  );
  done();
};

const css = () =>
  src([cssSRC, cssVendor])
    .pipe(soursemaps.init())
    .pipe(
      sass({
        errLogToConsole: true,
        outputStyle: "compressed"
      })
    )
    .on("error", sass.logError)
    .pipe(autoprefixer({ cascade: true }))
    .pipe(rename({ suffix: ".min" }))
    .pipe(soursemaps.write("./"))
    .pipe(dest(cssURL));

exports.js = js;
exports.css = css;
exports.watch = parallel(browser_sync, watch_files);
exports.default = parallel(js, css);
