// => the main application
// (c) Copyright Tornbase by Nik Ahmad 2019
;(function(c){"use strict";
base.use(function(fn,_,w,wc,g,d,a,ac,af,ao,avo,as,avs,xuse){
// torn resources
const
tb=function(x){return 'https://api.torn.com/'+x+'/'},
torn={
user:{url:tb('user')},
user_noty:{url:tb('user'),sel:'notifications'},
user_bars:{url:tb('user'),sel:'bars'},
user_money:{url:tb('user'),sel:'money'}
},
now=Date.now,
run=base.run,
dom=base.getElementById,
getParameterByName=function(name,url){
  const r=new RegExp(
    '[?&]'+name.replace(/[\[\]]/g,
    '\\$&')+'(=([^&#]*)|&|#|$)'
  ).exec(url||w.location.href);
  return !r?null:!r[2]?'':decodeURIComponent(r[2].replace(/\+/g, ' '));
},
isKeyValid=function(x){return avs(x)&&(x.length>=11)},
pushState=(w.history.pushState?function(n,v){
  w.history.pushState(
    null,'tornbase',
    w.location.origin
    +w.location.pathname
    +(n&&v?('?'+n+'='+v):'')
  )
}:fn),
formatCurrency=function(n){return n.toLocaleString('us-US',{minimumFractionDigits:0, maximumFractionDigits:2})},
getParam=function(key,selections,id){
  return (
    (id?id+'/':'')
    +'?key='+key
    +(selections?'&selections='+selections:'')
  )
},
getResult=function(response){
  const result=response.status===200
    ?JSON.parse(response.responseText)
    :{error:{code:response.status,error:response.statusText}}
  ;
  if(result.error){
    wc.error('Ajax call failed. Error code: '+result.error.code+' ('+result.error.error+')')
  }
  return result
},
loadData=function(keys,finish){
  const db={},app=this;
  Array.prototype.slice.call(keys).forEach(function(k){
    const o=torn[k];
    load.ajax(o.url+getParam(key,o.sel,o.id),{done:function(response){
      db[k]=getResult(response);
      // wc.log('Data loaded ['+k+']: ',db[k]);
    }})
  })
  load.done(function(){
    // wc.log('Data loaded : ',db);
    const d=base.getIdle()-now();
    // if(d>0){wc.log('Waiting: '+d+'ms')}
    run(function(){
      // wc.log('Finish loading')
      finish.call(app,db)
    },d)
  })
}
;
var
key=getParameterByName('key')
;
base.addEvent('load',w,function(){load
.js('https://cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.min.js')
// .js('/a-vue/js/vue.js')
.done(function(){

Vue.config.errorHandler=function(err,vm,info){base.setError(err)}
Vue.config.warnHandler=function(err,vm,info){wc.warn(err)}

const
v={},
m={}
;

v.state='';
m.stateIs=function(x){return this.state===x}
m.useState=function(x){this.state=(avs(x))?x:'404'}
m.formatCurrency=formatCurrency;
m.href=function(url,target){avs(target)?w.open(url,target).focus():w.location=url}
m.getErrorMessage=function(s,o){
  return '<b>'+s+(o&&o.code?o.code:'0')+'</b> | No data. '+(o&&o.error?o.error+'. ':'')
}
m.getNotification=function(o){
  var html='',c=0;
  const
  n=o?o.notifications:_,
  nb=function(i,s){
    if(i>0){
      // html+=(c>0?',':'')
      html+=(c>2?'<br> ':' ')+'<button>'+i+' '+(i>1?s+'s':s)+'</button>'
      c++
    }
  };
  if(n){
    nb(n.messages,'Message')
    nb(n.events,'Event')
    nb(n.awards,'Award')
    nb(n.competition,'Competition')
  }
  if(html.length<=0){html+='<span>.</span>'}
  return html
}
const startApp=function(){
  base.showContent()
  i.start(key)
  base.addEvent('popstate',w,function(){
    key=getParameterByName('key')
    i.start(key)
  })
};
m.keyDialog_submitKey=function(input_id){
  key=dom(input_id).value.toString();
  if(!isKeyValid(key)){this.useState('invalidKey');return}
  pushState('key',key)
  this.start(key)
}
m.restart=function(){
  key='';
  this.db=_;
  this.db_timestamp=_;
  pushState('key',key)
  this.start(key)
}
v.db=_;
v.db_timestamp=_;
m.start=function(k){
  // wc.log('Using key: ',k)
  if(!k){this.useState('keyDialog');return}
  if(!isKeyValid(k)){this.useState('invalidKey');return}
  this.db={};
  this.useState('index')
  // this.loadData('user_noty')
}
m.loadData=function(){loadData.call(_,Array.prototype.slice.call(arguments),this.useData)}
m.useData=function(db){
  // wc.log('Data received: ',db);
  const n=avo(this.db)?this.db:{};
  Object.keys(db).forEach(function(k){
    n[k]=db[k]
  })
  this.db=n;
  this.db_timestamp=now();
}
const
i=new Vue({
  el:'#v-app',
  data:v,
  methods:m,
  mounted:function(){this.$nextTick(startApp)},
  renderError:function(h,err){base.setError(err,h)}
})
;
base.export(i,w,'app')
});//done
});//load
})//base.use
}({// torn config

	context:this

}));
