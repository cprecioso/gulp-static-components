# gulp-static-components
Want to use custom components, in the style of [Polymer] or [Ractive], to
ease your **static** page development? **You've come to the right place.**

Supports Mustache templates! *...and soon Stylus, LESS, Sass, CofeeScript, or
whatever flavour of HTML, CSS or JS your heart desires*

> Here be dragons! This Gulp plugin is very **not** tested, and customized to my
  own use cases. Therefore, it hasn't been uploaded to the npm registry (yet)
  until it stabilizes a bit (and I see there is demand for it). Check the
  [TODO]. Use under the supervision of an adult.

Any kind of contribution to make it stage-ready is very welcome and encouraged.

[Install](#install) · [What?](#what) · [Why?](#why) · [How?](#how) · [Usage](#usage) · [API](#API)

## Install
<a name="install"></a>

```sh
$ npm i --save-dev cprecioso/gulp-static-components
# (Not yet on the npm registry)
```

## What?
<a name="what"></a>

`gulp-static-components` uses the [Ractive component] format (loosely), and
allows you to use custom elements and tags in your markup; but it **doesn't**
require any kind of JS runtime, instead it compiles everything down to a static
HTML file (+ CSS or JS if needed) without React, Polymer, Ractive, Vue or
whatever.

## Why?
<a name="why"></a>

All of the aforementioned custom components solutions are very good in their
field. However, some require you to buy in their whole system, are slow, need
huge polyfills or modern browsers, or are otherwise overkill for the small,
static pages of old.

Is there a better system? Probably. I wanted to make this for my own use and as
a hobby weekend project after lots of time away from front-end development.
However, I'd be grateful for anyone to either contribute to this project in any
way; or to suggest me a better way of doing this.

## How?
<a name="how"></a>

Whenever a file is passed to `gulp-static-components`, it scans for references
to custom tags (tags with a dash in them). Whenever one is found, it searches a
component definition ([as explained here](#componentsFolders)).

Once found, if it's a Mustache template, it fills it out with the data passed
from the attributes; and the inlines the HTML into the main file, scoped with a
unique random ID. It then removes any JS scripts or CSS stylesheets found in
these definitions, concats them together, scopes them to their component and
adds references back in the main file.

## Usage
<a name="usage"></a>

In your `gulpfile.js`:

```js
const staticComponents = require("gulp-static-components")

gulp.task("build:html", () => {
  return gulp.src("html/index.html")
         .pipe(staticComponents())
         .pipe(gulp.dest("build/"))
})
```

In `html/index.html`:

```html
<!-- ... -->
<h1>Call me!</h1>
<contact-view name="My toll free number" tel="1-800-WHATEVER">
  <img src="/imgs/telephone.png" />
</contact-view>
<!-- ... -->
```

And in `html/components/contact-view.mustache`:
```mustache
<template>
  <!-- The template element is actually optional, you can just put your tags in
	   the top level -->
  {{content}}
  <!-- The {{content}} gets replaced by the tag's content -->
  <a class="telephone-link" href="tel:{{tel}}">{{name}}</a>
  <!-- All the attributes are mustaches too -->
</template>

<!-- These tags are optional -->
<script>
  component.exports = function($, data) {
    /* Automatically called with a scoped jQuery and the data passed to your
	   element */
    $(".telephone-link").on("click", function() {
      console.log("Number", data.tel, "called");
    })
  }
</script>

<style>
  /* Every selector here is automatically scoped to this component, it won't
  	 collide with other instances of this same component in the page */
  a { color: red; }
  /* Use the html selector in your component to bypass the scoping */
  html a { background: yellow; }
</style>

```

The resulting `build/index.html`:

```html
<!-- In the <head> -->
  <link rel="stylesheet" href="index.css">
  <script src="index.js"></script>
  <!-- This has all your components' CSS and JS, scoped to each one -->
<!-- In the body -->
  <div id="contact-view_9sa8h">
    <img src="/imgs/telephone.png" />
    <a class="telephone-link" href="tel:{{tel}}">{{name}}</a>
  </div>
```

## API
<a name="API"></a>

Not many options for the time being, more will be added soon (or you can
contribute them yourself!)

### `staticComponents([options])`
Creates a gulp transform that takes `html` files with custom elements, inlines
the components' `html`, and concats and links the components' `js` and `css`.
Returns a `html`, a `js` and a `css` file (if applicable) all, with the same
name.

> More options coming soon. You can check the [TODO] and help.

### `options`

- **`componentsFolders`**
  <a name="componentsFolders"></a>
  
  *Default value:* `[]`
  
  List of folders in which to search for components. Will start scanning the
  left-most folder and continue to the next if not found. If the component
  isn't found anywhere, it will look for it in a `components` folder next to
  the `html` file being processed, and ultimately in a `components` folder next
  to the entry file of your application.

[Polymer]: https://www.polymer-project.org/
[Ractive]: http://www.ractivejs.org
[Ractive component]: https://github.com/ractivejs/component-spec
[TODO]: https://github.com/cprecioso/gulp-static-components/blob/master/TODO.md
