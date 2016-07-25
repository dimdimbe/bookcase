/**
 * Static Variable
**/

let _init,
    _hooks;

let _data = {};


class Bookcase {

  constructor(opts){
    if(opts){

      /**
       * Initialisation of data at creation
      **/
      if(!_init && opts.init){
        _init = opts.init;
        _data = _init;
      }
      if(!_init && opts.initPath){
        _init = require(opts.initPath);
      }
      _data = _init;

      /**
       * All the possible way to attach hooks to the Bookcase
      **/
      if(!_hooks && this.hooks){
        _hooks = this.hooks
      }
      if(!_hooks && this.setHooks && typeof this.setHooks === 'function'){
        _hooks = this.setHooks()
      }
      if(!_hooks && opts.hooks){
        _hooks = opts.hooks;
      }
      if(!_hooks){
        _hooks = [];
      }
    }

    _hooks = _hooks.map(_mapHooks)

    _constructHooks()


  }

  /**
   * Attach one or more hooks
  **/
  attachHooks(hooks){
    if(!hooks){ return false}
    if([] instanceof Array){
      _hooks.concat(hooks)
    }else {
      _hooks.push(hooks)
    }
    return true;
  }

  /**
   * Use an action
  **/
  action(name){
    if(this[name] && typeof this[name] === 'function'){
      return  _useAction.bind(this,name).apply(this,Array.prototype.slice.call(arguments, 1))
    }
    return null;
  }

  /**
   * Get an action as a function (currying)
  **/
  getAction(name){
    return _useAction.bind(this,name);
  }

}


/**
 * Static function
**/

function _useAction(name,a,b,c){
  let args = Array.prototype.slice.call(arguments, 1)
  let beforeActionData = _useHooks.bind(this)('beforeAction',_copyData());
  let res = this[name].bind(this,beforeActionData).apply(this,args);
  _data = _useHooks.bind(this)('afterAction',res);
}

function _copyData(){
  return Object.assign({},_data)
}

function _useHooks(method,data){
  return _hooks.reduce((currentData,hook)=>{
    if(hook.fn[method] && typeof hook.fn[method] == 'function'){
      let res = hook.fn[method].bind(this,hook.static)(currentData);
      if(res){
        return res;
      }
    }
    return currentData;
  },data);
}

function _constructHooks(){
  _hooks = _hooks.map((hook)=>{
    let fn = function(s){return s}
    if(hook.fn['construct'] && typeof hook.fn['construct'] === 'function'){ fn = hook.fn['construct'] }
    hook.static = fn(hook.static)
    return hook
  })
}

function _mapHooks(hook){
  return {
    fn : hook,
    static : {}
  }
}

module.exports = Bookcase;
