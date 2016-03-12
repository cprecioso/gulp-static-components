"use strict";

const gulp = require("gulp")
const rollup = require("gulp-rollup")
const babel = require("rollup-plugin-babel")
const rollupJSON = require("rollup-plugin-json")
const rename = require("gulp-rename")
const del = require("del")

const paths = {
  js: ["src/index.js"],
  "watch:js": ["src/**.js"]
}

gulp.task("clean", () => {
  return del("dist/**")
})

gulp.task("build:cjs", () => {
  return gulp.src(paths.js, {base: "src"})
             .pipe(rollup({
               format: "cjs",
               plugins: [
                 rollupJSON(),
                 babel({
                   exclude: "node_modules/**"
                 })
               ]
             }))
             .pipe(gulp.dest("dist"))
})

gulp.task("build:es6", () => {
  return gulp.src(paths.js, {base: "src"})
             .pipe(rollup({
               format: "es6",
               plugins: [
                 rollupJSON(),
                 babel({
                   exclude: "node_modules/**"
                 })
               ]
             }))
             .pipe(rename("index.es6.js"))
             .pipe(gulp.dest("dist"))
})

gulp.task("build:js", ["build:cjs", "build:es6"])

gulp.task("build", ["build:js"])

gulp.task("default", ["clean", "build"])

gulp.task("watch", ["default"], () => {
  return gulp.watch(paths["watch:js"], ["build:js"])
})

// TESTS

gulp.task("test", ["build"], () => {
  console.log("Importing...")
  const staticComponents = require("./dist/index.js")
  console.log("Imported!")
  console.log("Processing...")
  let ret = gulp.src("test/source.html")
             .pipe(staticComponents())
             .pipe(gulp.dest("test/build/"))
  console.log("Processed!")
  return ret
})
