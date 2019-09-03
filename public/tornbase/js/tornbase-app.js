// => the main application
// (c) Copyright Tornbase by Nik Ahmad 2019
;(function(c){"use strict";
base.use(function(fn,_,w,wc,g,d,a,ac,af,ao,avo,as,avs,xuse){

const
getParameterByName=function(name,url){
  const r=new RegExp(
    '[?&]'+name.replace(/[\[\]]/g,
    '\\$&')+'(=([^&#]*)|&|#|$)'
  ).exec(url||w.location.href);
  return !r?null:!r[2]?'':decodeURIComponent(r[2].replace(/\+/g, ' '));
},
isValidKey=function(x){return avs(x)&&(x.length==16)},
key=getParameterByName('key'),
keyx='ABCDEF1234567890',
keyi='';

const
now=Date.now,
today=new Date().setHours(0,0,0,0),
gn=function(x,d){return ac(x,0)?x:(d||0)},
gpn=function(x,d){const n=gn(x);return n>0?n:(d||0)},
getWaitingTime=function(referedTime){return gpn(gn(referedTime)-now())}
;

var tornTurn;
const
run=base.run,
db={torn:{}},
tornQi=function(queries){const q=queries;return q[0]+(q[1]?'_'+q[1]:'')+(q[2]?'_'+q[2]:'')},
tornUrl=function(key,type,selections,id){
  var url='https://api.torn.com/';
  // url='https://reqres.in/api/'; // use test server
  // type=_; // trigger error
  if(avs(type)){url+=type+'/'}
  if(avs(id)){url+=id+'/'}
  if(avs(key)){url+='?key='+key}
  if(avs(selections)){url+='&selections='+selections}
  return url
},
callTorn=function(key,query,respond){
  const
    type=query[0],
    selections=query[1],
    id=query[2],
    url=tornUrl(key,type,selections,id),
    qi=tornQi(query),
    result={}
  ;
  // wc.log('Calling: ',url)
  axios.get(url)
  .then(function(response){
    db.torn[qi]=result[qi]=response.data;
  })
  .catch(function(error){
    wc.error('E900: Ajax '+error)
    result[qi]={error:{code:'900',error:'Ajax '+error}};
  })
  .finally(function(){
    // wc.log(result)
    if(af(respond)){respond(qi,result)}
  })
},
syncTorn=function(key,queries,finish){
  // wc.log(key,queries,finish)
  var done=0;
  const result={};
  queries.forEach(function(query){
    run(function(){callTorn(key,query,function(qi,respond){
      done++;
      result[qi]=respond[qi];
      if(done>=queries.length){
        // wc.log(result)
        if(af(finish)){finish(result)}
      }
    })},getWaitingTime(tornTurn))
    tornTurn=now()+1000;
  })
}
;

const
dom=base.getElementById,
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
}
;

// setup vue
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
  watch={},
  method={},
  computed={}
  ;

  data.errorMessage=_;
  watch.errorMessage=function(){
    this.state='error';
  }

  data.state='';

  method.getErrorMessage=function(error){
    const
    r=this.errorMessage?this.errorMessage:_,
    e=avo(error)?error:{}
    ;
    e.error=avo(e.error)?e.error:r?r.error:{};
    e.ref=e.ref||'E';
    e.code=e.error.code||'900';
    e.error=e.error.error||'Something went wrong';
    return '<b>'+e.ref+e.code+'</b> | '+e.error;
  }

  method.href=function(url,target){url=url||'';avs(target)?w.open(url,target).focus():w.location=url}

  method.formatCurrency=formatCurrency;

  method.formatBackstamp=function(t){ return t }

  method.formatTimestamp=function(t){ return new Date(t).toUTCString() }

  computed.statusIcon={
    get:function(){
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
  }

  data.db={};
  const
  TUSER=[['user']],
  TUSERO=[
    ['user','notifications'],
    ['user','money'],
    ['user','bars']
  ],
  initTorn=function(queries){
    queries.forEach(function(query){
      const qi=tornQi(query);
      data.db[qi]=_;
      data[qi]=_;
    })
  }
  ;
  initTorn(TUSER);
  initTorn(TUSERO);

  data.key='';

  method.keyDialog_submitKey=function(input_id){
    var key=dom(input_id).value.toString();
    pushState('key',key)
    this.start(key)
  }

  method.restart=function(){
    pushState('key','')
    this.start()
  }

  method.sync=function(queries,then){
    this.isLoading=true;
    syncTorn(this.key,queries,function(respond){
      data.isLoading=false;
      queries.forEach(function(query){
        const
          qi=tornQi(query),
          e=respond[qi].error
        ;
        if(!avo(e)){
          data.db[qi]=respond[qi];
          data[qi]=qi+'_'+now();
        }
      })
      if(af(then)){then(respond)}
    })
  }

  data.isLoading=false;

  method.start=function(key){
    if(!avs(key)){this.state='keyDialog';return}
    if(!isValidKey(key)){
      this.errorMessage={error:{code:'901',error:'Invalid key'}};
      return
    }

    this.key=key;
    this.isLoading=true;
    this.sync(TUSER,function(respond){
      data.isLoading=false;
      const e=respond.user.error;
      if(e){
        const error='Error loading data. '+e.error;
        e.code='80'+e.code;
        // wc.error('E'+e.code+': '+error)
        data.errorMessage={error:e};
      }
      else{
        data.state='home';
        i.sync(TUSERO);
      }
    })

  }

  const vueReady=function(){
    base.showContent()
    i.start(key)
    base.addEvent('popstate',w,function(){
      i.start(getParameterByName('key'))
    })
  },
  i=new Vue({
    el:'#_app',
    data:data,
    watch:watch,
    methods:method,
    computed:computed,
    mounted:function(){this.$nextTick(vueReady)},
    renderError:function(h,err){base.setError(err,h)}
  })
  ;
  base.export(i,w,'app')

})//vue setup
})//base.use
}({// torn config

	context:this

}));
