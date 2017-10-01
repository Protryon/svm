module.exports = function(babel) {
  var t = babel.types;
  return {
    visitor: {
    	ThrowStatement: function(path) {
    		path.node.type = 'ReturnStatement';
    		path.node.argument = null;
    	}
    }
  };
};