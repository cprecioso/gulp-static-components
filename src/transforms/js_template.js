;(function(){
  function _inherits(subClass, superClass) {
  	subClass.prototype = Object.create(superClass.prototype, {
  		constructor: {
  			value: subClass,
  			enumerable: false,
  			writable: true,
  			configurable: true
  		}
  	});
    Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }
  
  var $ = (function(_j, id) {
  	_inherits($, _j);
  
  	function $(sel) {
  		return _j.call(this, sel, id);
  	}
  
  	return $;
  });
  
  var component = {"exports":{}};(function(component, exports){
    $$CONTENT$$
  })(component, component.exports);
  component.exports($(require("jquery").noConflict(), $$ID$$), $$DATA$$);
})();
