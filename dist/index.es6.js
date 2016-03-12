import path from 'path';
import through from 'through2';
import gutil, { PluginError } from 'gulp-util';
import posthtml from 'posthtml';
import renderHTML from 'posthtml-render';
import fs, { readFileSync } from 'fs';
import memoize from 'lodash.memoize';
import postcss from 'postcss';
import prefix from 'postcss-prefix-selector';
import Mustache from 'mustache';

var babelHelpers = {};

babelHelpers.defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

babelHelpers.slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

babelHelpers;

var name = "gulp-static-components";

function ComponentFetcher(_ref) {
  var paths = _ref.componentsFolders;

  var readdir = memoize(fs.readdirSync);

  var componentsInFolder = memoize(function (folder) {
    var files = readdir(folder).map(function (file) {
      return [path.basename(file, path.extname(file)), path.resolve(folder, file)];
    }).reduce(function (acc, _ref2) {
      var _ref3 = babelHelpers.slicedToArray(_ref2, 2);

      var name = _ref3[0];
      var path = _ref3[1];

      acc[name] = path;
      return acc;
    }, {});
    return files;
  });

  return memoize(function fetchComponent(name) {
    for (var i = 0, len = paths.length; i < len; i++) {
      var comps = componentsInFolder(paths[i]);
      if (name in comps) return comps[name];
    }
    return false;
  });
}

var final$3 = false;

function render$3(str, data) {
  return {
    html: Mustache.render(str, data)
  };
}

var mustache = Object.freeze({
  final: final$3,
  render: render$3
});

function getTypeOfNode(_ref, or) {
  var attrs = _ref.attrs;

  if (attrs != null && attrs.type != null) {
    return attrs.type.split("/").slice(-1)[0].toLowerCase();
  } else {
    return or;
  }
}

var final$2 = true;

function render$2(str, data) {
  var ret = {
    javascript: false,
    css: false,
    html: false
  };

  ret.html = posthtml().use(function (tree) {
    tree.match({ tag: "style" }, function (node) {
      ret[getTypeOfNode(node, "css")] = renderHTML(node.content);
      return [];
    });
    tree.match({ tag: "script" }, function (node) {
      ret[getTypeOfNode(node, "javascript")] = renderHTML(node.content);
      return [];
    });
    tree.match({ tag: "template" }, function (node) {
      return node.content;
    });
  }).process(str, { sync: true }).html;

  return ret;
}

function scope$2(id, nodes) {
  if (nodes.html) {
    nodes.html = posthtml().use(function (tree) {
      return { tag: "div", content: tree, attrs: { id: id } };
    }).process(nodes.html, { sync: true }).html;
  }
  return nodes;
}

var html = Object.freeze({
  final: final$2,
  render: render$2,
  scope: scope$2
});

var final$1 = true;

function render$1(str, data) {
  return { javascript: str };
}

function scope$1(id, nodes, data) {
  if (nodes.javascript) {
    var template = fs.readFileSync(path.resolve(__filename, "js_template.js"), "utf8");
    nodes.javascript = template.replace("$$CONTENT$$", nodes.javascript).replace("$$ID$$", id).replace("$$DATA$$", JSON.stringify(data));
  }
  return nodes;
}

var javascript = Object.freeze({
  final: final$1,
  render: render$1,
  scope: scope$1
});

var final = true;

function render(str, data) {
  return { css: str };
}

function scope(id, nodes) {
  if (nodes.css) {
    nodes.css = postcss().use(prefix({
      prefix: "#" + id + " ",
      exclude: ["html"]
    })).process(nodes.css).css;
  }
  return nodes;
}

var css = Object.freeze({
  final: final,
  render: render,
  scope: scope
});



var transforms = Object.freeze({
	css: css,
	javascript: javascript,
	html: html,
	mustache: mustache
});

var SCOPING_BASE = 36;
var MAX_SCOPING = parseInt("zzzzzz", 36);

function ComponentImporter(options) {
  //let {transforms} = options

  return function componentFromFile(file, data) {
    var ext = path.extname(file).slice(1);
    var name = path.basename(file, ext).slice(0, -1);
    var str = readFileSync(file, { encoding: "utf8" });
    return componentFromString(name, str, ext, data);
  };

  function componentFromString(name, str, type, data) {
    return scopeComponents(name, renderComponent(babelHelpers.defineProperty({}, type, str), name, data), data);
  }

  function renderComponent(nodes, name, data) {
    var final = {};
    var notFinal = false;

    for (var type in nodes) {
      var str = nodes[type];
      if (!(type in transforms)) {
        final[type] = str;
        continue;
      }
      var transform = transforms[type];
      var transformed = transform.render(str, data);
      Object.assign(transform.final ? final : notFinal || (notFinal = {}), transformed);
    }

    if (notFinal) Object.assign(final, renderComponent(notFinal, name, data));
    return final;
  }

  function scopeComponents(name, nodes, data) {
    var valid = ["javascript", "css", "html"];
    for (var type in nodes) {
      if (valid.indexOf(type) < 0) throw new Error("Type " + type + " not valid");
    }

    var randomId = Math.floor(Math.random() * MAX_SCOPING).toString(SCOPING_BASE);
    var id = name + "_" + randomId;

    if (nodes.html) nodes = scope$2(id, nodes, data);
    if (nodes.css) nodes = scope(id, nodes, data);
    if (nodes.javascript) nodes = scope$1(id, nodes, data);

    return nodes;
  }
}

var CustomComponentTagRegEx = /^[a-z]+(-[a-z]+)+$/i;

function FileProcessor(options) {
  var fetchComponent = ComponentFetcher(options);
  var importComponent = ComponentImporter(options);

  return function processFile(file) {
    var name = path.basename(file.path, path.extname(file.path));

    var cache = {
      js: "",
      css: "",
      html: ""
    };

    cache.html = posthtml().use(PosthtmlProcessor(name, fetchComponent, importComponent, cache)).process(file.contents.toString("utf8"), { sync: true }).html;

    var output = [];
    for (var ext in cache) {
      var contents = cache[ext];
      if (contents) output.push(cloneFile(file, ext, contents));
    }
    return output;
  };
}

function cloneFile(file, extension, contents) {
  var newFile = new gutil.File({
    cwd: file.cwd,
    base: file.base,
    path: file.path,
    contents: new Buffer(contents, "utf8")
  });
  newFile.extname = "." + extension;
  return newFile;
}

function PosthtmlProcessor(name, fetcher, importer, cache) {
  return function processPosthtml(tree) {
    tree.match({ tag: CustomComponentTagRegEx }, function (node) {
      var componentPath = fetcher(node.tag);
      if (!componentPath) return node;
      var data = Object.assign({ content: renderHTML(node.content) }, node.attrs);
      var el = importer(componentPath, data);
      if (el.css) cache.css += el.css;
      if (el.javascript) cache.js += el.js;
      return el.html;
    });

    if (cache.css || cache.js) {
      tree.match({ tag: "head" }, function (node) {
        if (cache.css) {
          node.content.push({
            tag: "link",
            attrs: {
              rel: "stylesheet",
              href: name + ".css"
            }
          });
        }
        if (cache.js) {
          node.content.push({
            tag: "script",
            attrs: { src: name + ".js" }
          });
        }
        return node;
      });
    }

    return tree;
  };
}

var DefaultOptions = {
  componentsFolders: [],
  transforms: []
};

function index () {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  options = Object.assign({}, DefaultOptions, options);

  return through.obj(function (file, encoding, cb) {
    try {
      if (file.isNull()) return cb(null, file);

      if (file.isStream()) file.contents = file.contents.setEncoding(null).read();

      options.componentsFolders = options.componentsFolders.slice(0).concat([path.join(file.base, "/components"), path.resolve(require.main.filename || __filename, "../components")]);

      var processFile = FileProcessor(options);
      var output = processFile(file);
      for (var i = 0, len = output.length; i < len; i++) {
        this.push(output[i]);
      }
      return cb();
    } catch (error) {
      this.emit("error", new PluginError(name, error));
      return cb();
    }
  });
}

export default index;