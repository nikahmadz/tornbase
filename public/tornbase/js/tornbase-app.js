// => the main application
// (c) Copyright Tornbase by Nik Ahmad 2019
;(function(c){"use strict";
base.use(function(fn,_,w,wc,g,d,a,ac,af,ao,avo,as,avs,xuse){

const
now=Date.now,
today=new Date().setHours(0,0,0,0),
dom=base.getElementById,
run=base.run,
getParameterByName=function(name,url){
  const r=new RegExp(
    '[?&]'+name.replace(/[\[\]]/g,
    '\\$&')+'(=([^&#]*)|&|#|$)'
  ).exec(url||w.location.href);
  return !r?null:!r[2]?'':decodeURIComponent(r[2].replace(/\+/g, ' '));
},
isValidKey=function(x){return avs(x)&&(x.length==16)},
pushState=(w.history.pushState?function(n,v){
  w.history.pushState(
    null,'tornbase',
    w.location.origin
    +w.location.pathname
    +(n&&v?('?'+n+'='+v):'')
  )
}:fn),
formatCurrency=function(n){return n.toLocaleString('us-US',{minimumFractionDigits:0, maximumFractionDigits:2})},
formatTime=function(time){

	function get00(v){
		return (v<10)?'0'+v:
				(v>59)?'00':v
	}

	function get12(h){
		return (h<12)?get00(h):
				(h>23)?'00':get12(h-12)
	}

	function getSession(time){
		return (time.getHours()<12)?'AM':'PM'
	}

	const
	h = get12(time.getHours()),
	m = get00(time.getMinutes()),
	s = get00(time.getSeconds()),
	session = getSession(time),
	formatedTime = h + ":" + m + ":" + s + " " + session
	;

	return formatedTime
},
torn=function(key,type,selections,id){
  var url='https://api.torn.com/';
  if(avs(type)){url+=type+'/'}
  if(avs(id)){url+=id+'/'}
  if(avs(key)){url+='?key='+key}
  if(avs(selections)){url+='&selections='+selections}
  return url
},
getQi=function(q){return q[0]+(q[1]?'_'+q[1]:'')+(q[2]?'_'+q[2]:'')},
loadData=function(key,queries,finish){
  // wc.log(queries,finish)
  var done=0;
  const db={};
  queries.forEach(function(query){
    const
      type=query[0],
      selections=query[1],
      id=query[2],
      qi=getQi(query)
    ;
    run(function(){
      wc.log('Loading: ',torn(key,type,selections,id))
      axios.get(torn(key,type,selections,id))
      .then(function (response) {
        db[qi]=response.data;
      })
      .catch(function (error) {
        var msg='Ajax call '+error;
        wc.error(msg)
        db[qi]={error:{code:'400',error:msg}};
      })
      .finally(function () {
        done++;
        if(done>=queries.length){finish(db)}
      })
    },apilag-now())
    apilag+=1000;
  })
},
key=getParameterByName('key')
;

var
apilag=now()
;

base.addEvent('load',w,function(){

Vue.config.errorHandler=function(err,vm,info){base.setError(err)}
Vue.config.warnHandler=function(err,vm,info){base.setError(err)}

Vue.component('t-bar',{
  props:['data'],
  template:'<div class="t-bar">'
  +'<div class="t-bar-value" :style="{ width:(data.current / data.maximum * 100) + \'%\' }"></div>'
  +'</div>'
})

const
data={},
method={},
computed={}
;

data.db={};
data.isLoading=false;
method.sync=function(queries){
  const lag=apilag-now();
  apilag=now()+(lag>0?lag:0);
  data.isLoading=true;
  loadData(this.key,queries,function(db){
    // wc.log('Using data',db)
    queries.forEach(function(query){
      const qi=getQi(query);
      i.db[qi]=db[qi];
      i[qi]=qi+'-'+now();
    })
    data.isLoading=false;
  })
}

method.href=function(url,target){avs(target)?w.open(url,target).focus():w.location=url}

method.getErrorMessage=function(s,eo){
  const o=eo||{code:'9',error:'No data'}
  return '<b>'+s+(o&&o.code?o.code:'0')+'</b> | Error. '+(o&&o.error?o.error+'. ':'')
}

method.formatCurrency=formatCurrency;

method.formatBackstamp=function(t){ return t }

method.formatTimestamp=function(t){ return new Date(t).toUTCString() }

method.getStatusIcon=function(){
  let icon='thumb_up';
  if(this.db.user && this.db.user.status){
    let str=this.db.user.status.toString();
    if(/hospital/i.test(str)){icon='local_hospital'}
    else if(/jail/i.test(str)){icon='grid_off'}
    else if(/returning/i.test(str)){icon='flight_land'}
    else if(/traveling/i.test(str)){icon='flight_takeoff'}
  }
  return icon
}

data.key='';

method.keyDialog_submitKey=function(input_id){
  var key=dom(input_id).value.toString();
  pushState('key',key)
  this.start(key)
}

method.restart=function(){
  pushState('key','')
  i.start()
}

data.state='initial';

const Q1=[
  ['user'],
  ['user','notifications'],
  ['user','money'],
  ['user','bars']
];
(function(queries){
  queries.forEach(function(query){
    const qi=getQi(query);
    data.db[qi]=_;
    data[qi]=_;
  })
}(Q1));

method.start=function(key){
  this.key=key;
  if(!avs(key)){this.state='keyDialog';return}
  if(!isValidKey(key)){this.state='invalidKey';return}
  this.state='home';
  this.sync(Q1)
}

const
startApp=function(){
  base.showContent()
  i.start(key)
  base.addEvent('popstate',w,function(){
    i.start(getParameterByName('key'))
  })
},
i=new Vue({
  el:'#_app',
  data:data,
  methods:method,
  computed:computed,
  mounted:function(){this.$nextTick(startApp)},
  renderError:function(h,err){base.setError(err,h)}
})
;
base.export(i,w,'app')

})//w.load
})//base.use
}({// torn config

	context:this

}));
