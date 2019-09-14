// => base application
// (c) Copyright HtmlBase by Nik Ahmad 2019
;(function(c){'use strict';
const
dn='base',
v={},
now=Date.now,
bs=now(),
bt=function(t){return (t||now())-bs},
_=void 0,
fn=function(){},
a=function(_){return typeof _},
ac=function(_,x){return a(_)===a(x)},
af=function(_){return ac(_,fn)},
ao=function(_){return ac(_,{})},
avo=function(_){return ao(_)&&_!==null},
as=function(_){return ac(_,'')},
an=function(_){return ac(_,0)},
avr=function(n,ge,le){if(!an(n)){return}return n>=(ge||1)&&(le?(n<=le):true)},
avs=function(_,ge,le){if(!as(_)){return}const n=_.trim().length;return avr(n,ge,le)},
sb=function(_){return "["+_+"]"},
sq=function(_){return "'"+_+"'"},
xuse=function(f,v,x){return 'Invalid argument for '+sb(f)+', cannot use '+sb(v)+': '+sq(x)},
vc=function(n,c){
  if(!avo(c)){throw xuse(n,'config')}
  if(!avo(c.context)){throw xuse(n,'config.context',c.context)}
  return c.context
},
cc=vc(dn,c),
w=window,
wc=w.console,
g=typeof global!==a(_)?global:w,
d=g.document,
nr=function(r,x){
  if(!af(r)){throw xuse('newRoutine','function',r)}
  var c=0;
  const i=function(){
    var z;
    if(!v.error&&(!x||c<x)){
      z=r.apply(r,arguments);
      c++;
    }
    return z
  };
  i.count=function(){return c}
  return i
},
run=function(r,d){
  if(!af(r)){throw xuse('run','function',r)}
  return d>0?setTimeout(nr(r),d):r.apply(r,arguments)
},
be={},
addEvent=function(v,e,c){
  if(!avs(v)){throw xuse('addEvent','event',v)}
  if(!af(c)){throw xuse('addEvent','callback function',c)}
  const ov='on'+v;
  if(e.addEventListener){e.addEventListener(v,c)}
  else if(e.attachEvent){e.attachEvent(ov,c)}
  else{
    be[v]=c;
    if(af(e[ov])){be[ov]=e[ov]}
    e[ov]=function(){
      if(be[ov]){be[ov].apply(e,a)}
      be[v].apply(e,a)
    }
  }
},
removeEvent=function(v,e,c){
  if(!avs(v)){throw xuse('addEvent','event',v)}
  if(!af(c)){throw xuse('removeEvent','callback function',c)}
  const ov='on'+v;
  if(e.addEventListener){e.removeEventListener(v,c)}
  else if(e.attachEvent){e.detachEvent(ov,c)}
  else{be[v]=null}
},
dom=function(x,m){
  const e=d.getElementById(x);
  if(!e){
    const s='Cannot find '+sq('#'+x);
    if(m===false){wc.warn(s)}
    else{throw s}
  }
  return e
},
sa=function(e,a,v){e.setAttribute(a,v||'')},
ra=function(e,a){e.removeAttribute(a)},
hide=function(e,a){sa(e,'hidden')},
show=function(e,a){ra(e,'hidden')},
i={};
// error support
;(function(){
var er;
const
fn=nr(function(){
  removeEvent('error',w,fn)
  v.error=arguments[0];
  const e=dom(c.errorId||'_error',false);
	if(e){show(e)}
},1)
;
addEvent('error',w,fn)
v.setErrorId=function(x){const n=dom(x);n?c.errorId=x:_}
v.onError=function(c){
  if(!af(c)){throw xuse('then','function',c)}
  if(v.error){c();return}
  if(er){removeEvent('error',w,er)}
  er=c;
  addEvent('error',w,er)
}
v.setError=function(){const x=arguments;fn.apply(fn,x);af(er)?er.apply(er,x):_;throw x[0]}
}());// error support
var it=bs;
const git=function(){return it};
// base init
;(function(o){
var r=false,st;
const
ms=o.minimumSpin||2000, // duration of css-animation
h=hide,
s=show,
sw=function(f){
  const
  c=dom(o.viewId||'_view',false),
  p=dom(o.spinId||'_loader',false)
  ;
  f(c,p)
},
sc=function(){
  if(st==='c'){return}st='c';
  sw(function(c,p){
    p?h(p):_;
    if(c){
      v.onError(function(){h(c)})
      s(c)
    }
  })
},
sp=function(){
  if(st==='p'){return}st='p';
  sw(function(c,p){
    c?h(c):_;
    if(p){
      v.onError(function(){h(p)})
      s(p)
      it=now()+ms;
    }
  })
},
sr=function(){run(function(){r?sc():sp()},it-now())}
;
v.showContent=function(){r=true;sr()}
v.showLoading=function(){r=false;sr()}
const
fw=o.firstWonder||500,
wo=function(){
  removeEvent('load',w,wo)
  if(r){v.showContent()}
  if(!r&&bt()-fw>=0){v.showLoading()}
}
;
run(wo,bt(bs+fw))
addEvent('load',w,wo)
}(c));//base init
// base interface
i.getOption=function(){return c}
i.verifyConfig=function(name,config){vc.apply(this,arguments)}
i.use=function(f){f(fn,_,w,wc,g,d,a,ac,af,ao,avo,an,avr,as,avs,xuse)}
i.useDom=function(f){f(dom,hide,show)}
i.newRoutine=function(f,count){return nr.apply(this,arguments)}
i.run=function(f,delay){run.apply(this,arguments);return i}
i.getElementById=function(selector){return dom(selector)}
i.show=function(element){show(element);return i}
i.hide=function(element){hide(element);return i}
i.addEvent=function(event_name,dom,f){addEvent.apply(this,arguments);return i}
i.removeEvent=function(event_name,dom,f){removeEvent.apply(this,arguments);return i}
i.setErrorId=function(errorId){v.setErrorId(errorId);return i}
i.onError=function(f){v.onError(f);return i}
i.setError=function(){v.setError.apply(this,arguments);return i}
i.getError=function(){return v.error}
i.showLoading=function(){v.showLoading();return i}
i.showContent=function(){v.showContent();return i}
i.getIdle=function(){return git()}
const
exp=function(v,c,n){
  if(!avs(n)){wc.warn(xuse('export','name',n));return}
  if(!(ao(v)||af(v))){throw xuse('export','value',v)}
  if(!ao(c)){throw xuse('export','context',c)}
  const val=(c[n]!==_)?c[n]:_;
  if(val){wc.warn('Overwriting '+sb(n))}
  c[n]=v;
  return val
}
;
// to export methods into context
i.export=function(value,context,name){exp(value,context,name);return i}
i.conflict=exp(i,c.context,c.name||dn)
}({// base config

// - optional
/*
name:'b',
errorId:str,
spinId:str,
viewId:str,
minimumSpin:int,
firstWonder:int,
*/

// * required
context:this

}));
