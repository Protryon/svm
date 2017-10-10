const heuristicFunc = {
  Array: ['push', 'pop', 'splice', 'slice', 'join'],
  String: ['charAt', 'indexOf'], // generally indexOf wont work because of arrays
}

const heuristicStaticFunc = {
  String: ['fromCharCode'],
}

const constructors = [
  'Float64Array',
  'Uint8Array',
  'ArrayBuffer',
]

const varNameMap = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJLKMOPQRSTUVWXYZ'.split('');
function idm(id){
  return {type: 'Identifier', name: id};
}

function memm(parent, child) {
  return {
    type: 'MemberExpression',
    object: parent,
    property: child,
    computed: false,
    optional: false
  };
}

module.exports = function(babel) {
  var t = babel.types;
  return {
    visitor: {
      Program: function(path) {
        for(let type in heuristicFunc) {
          for(let func of heuristicFunc[type]) {
            path.node.body.splice(0, 0, {
              type: 'VariableDeclaration',
              declarations: [ {
                  type: 'VariableDeclarator',
                  id: idm(type + '_' + func),
                  init: {
                    type: 'CallExpression',
                    callee: memm(memm(memm(memm(idm(type), idm('prototype')), idm(func)), idm('call')), idm('bind')),
                    arguments: [memm(memm(idm(type), idm('prototype')), idm(func))],
                    optional: false,
                  }
                }
              ],
              kind: 'var'
            });
          }
        }
        for(let type in heuristicStaticFunc) {
          for(let func of heuristicStaticFunc[type]) {
            path.node.body.splice(0, 0, {
              type: 'VariableDeclaration',
              declarations: [ {
                  type: 'VariableDeclarator',
                  id: idm(type + '_' + func),
                  init: {
                    type: 'CallExpression',
                    callee: memm(memm(memm(idm(type), idm(func)), idm('call')), idm('bind')),
                    arguments: [memm(idm(type), idm(func))],
                    optional: false,
                  }
                }
              ],
              kind: 'var'
            });
          }
        }
        for(let cnst of constructors) {
          path.node.body.splice(0, 0, {
            type: 'VariableDeclaration',
            declarations: [ {
                type: 'VariableDeclarator',
                id: idm('cnst_' + cnst),
                init: idm(cnst),
              }
            ],
            kind: 'var'
          });
        }
      },
    	MemberExpression: function(path) {
        if(path.node.property.type != 'Identifier') return;
        if(path.parent.type == 'CallExpression' && path.parent.callee == path.node) {
          for(let type in heuristicFunc) {
            for(let func of heuristicFunc[type]) {
              if(path.node.property.name == func) {
                path.parent.arguments.splice(0, 0, path.node.object);
                path.parent.callee = idm(type + '_' + func);
              }
            }
          }
          for(let type in heuristicStaticFunc) {
            for(let func of heuristicStaticFunc[type]) {
              if(path.node.property.name == func) {
                path.parent.callee = idm(type + '_' + func);
              }
            }
          }
        }
      },
      Identifier: function(path) {
        if(path.parent.type == 'NewExpression' && path.parent.callee == path.node) {
          for(let cls of constructors) {
            if(path.node.name == cls) {
              path.parent.callee = idm('cnst_' + cls);
            }
          }
        }
      }
    }
  };
}
