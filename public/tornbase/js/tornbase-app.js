// => the main application
// (c) Copyright Tornbase by Nik Ahmad 2019
;(function(c){"use strict";
base.use(function(fn,_,w,wc,g,d,a,ac,af,ao,avo,an,avr,as,avs,xuse){

// tool set
const
run=base.run,
now=Date.now,
today=new Date().setHours(0,0,0,0),
gvo=function(x,d){return avo(x)?x:d},
gn=function(x,d){return an(x)?x:(d||0)},
gpn=function(x,d){const n=gn(x);return n>0?n:(d||0)},
getParameterByName=function(name,url){
  const r=new RegExp(
    '[?&]'+name.replace(/[\[\]]/g,
    '\\$&')+'(=([^&#]*)|&|#|$)'
  ).exec(url||w.location);
  return !r?null:!r[2]?'':decodeURIComponent(r[2].replace(/\+/g,' '));
},
getParameterString=function(params){
  const o=[];
  params.forEach(function(p){
    if(ac(p,[])){o.push(p.join('='))}
    else{o.push(p+'=')}
  })
  return o.join('&')
},
setParameter=(w.history.pushState?function(params){
  w.history.pushState(
    null,'tornbase',
    w.location.origin
    +w.location.pathname
    +(ac(params,[])?('?'+getParameterString(params)):'')
  )
}:fn),
formatCurrency=function(n){return n.toLocaleString('us-US',{minimumFractionDigits:0,maximumFractionDigits:2})},
formatTime=function(time){
	function get00(v){
		return
      (v<10)?'0'+v:
			(v>59)?'00':v
	}
	function get12(h){
		return
      (h<12)?get00(h):
			(h>23)?'00':get12(h-12)
	}
	const
	h=get12(time.getHours()),
	m=get00(time.getMinutes()),
	s=get00(time.getSeconds())
	;
	return h+':'+m+':'+s+' '+(time.getHours()<12)?'AM':'PM'
},
openUrl=function(url,target,delay){
  const u=url||'';
  run(function(){avs(target)?w.open(u,target||'_blank').focus():w.location=u},delay||250)
}
;

// configurations
const
CONFIG={
  tornApi:'https://api.torn.com/'
}
;
// CONFIG.tornApi='https://reqres.in/api/'; // use test server
if(Object.freeze){Object.freeze(CONFIG)}
// wc.log(CONFIG);return;

// lang
const
LANG={
  unknownError:'Something went wrong',
  invalidKey:'That is not a valid key',
  wrongKey:'Oops, wrong key',
  requestError:'Request Error',
  ignoredCall:'Continuous request ignored',
  invalidOperation:'Invalid operation',
  success:'Success'
}
;

// torn queries
const
TQS=[
  ['user'],
  ['user','notifications'],
  ['user','money'],
  ['user','bars']
],
TORN_CALL_RATE=1200, // 600 ms = 100 request per minute
TORN_CALL_FREQUENCY=1000*60*5, // 5 minutes
TORN={}
;

// build torn queries
TORN.ALL=TQS;
TORN.USER_ALL=TQS.slice(0,TQS.length);
TORN.USER_SUBS=TQS.slice(1,TQS.length);
TQS.forEach(function(query){TORN[query.join('_').toUpperCase()]=[query]});
if(Object.freeze){Object.freeze(TORN)}
// wc.log(TORN);return;

// data mapper
const
TORN_USER_NOTIES={
  messages:{key:'messages',url:'messages',label:'New Messages',icon:'email',count:0},
  events:{key:'events',url:'events',label:'New Events',icon:'error',count:0},
  awards:{key:'awards',url:'awards',label:'New Awards',icon:'stars',count:0},
  competition:{key:'competition',url:'calendar',label:'New Competition Alert',icon:'event',count:0}
},
TORN_USER_NOTIES_MAP=['messages','events','awards','competition'],
TORN_USER_BARS_MAP=['energy','nerve','happy','life','chain'],
STATUS_ICON={
  default:'thumb_up',
  hospital:'local_hospital',
  jail:'lock',
  returning:'flight_land',
  traveling:'flight_takeoff'
},
STATUS_ICON_REGEX=/hospital|jail|(return|travel)ing/i
;

// torn methods
const
isValidTornKey=function(key){return avs(key,16,16)},
tornUrl=function(key,query){
  const
  type=query[0],
  selections=query[1],
  id=query[2]
  ;
  var url=CONFIG.tornApi;
  if(avs(type)){url+=type+'/'}
  if(avs(id)){url+=id+'/'}
  if(avs(key)){url+='?key='+key}
  if(avs(selections)){url+='&selections='+selections}
  return url
},
callTorn=function(key,query,respondWith){
  var data,result;
  const
    callTime=now(),
    qi=query.join('_'),
    finish=function(){
      // wc.log(result)
      torn.db[qi]=data;
      torn.latest.qi=qi;
      torn.latest.result=torn.result[qi]=result;
      torn.latest.stamp=torn.stamp[qi]=now();
      torn.loadQue=gpn(torn.loadQue-1);
      if(af(respondWith)){respondWith(qi,result,data)}
    }
  ;
  torn.loadQue+=1;
  // ignore if too quick
  if(callTime-torn.nextQue<TORN_CALL_RATE){
    wc.warn(LANG.ignoredCall+' for: ',qi)
    result={warn:{code:'300',warn:LANG.ignoredCall}};
    data={};
    finish()
    return
  }
  // wc.log('Calling: ',url)
  torn.nextQue=callTime;
  axios.get(tornUrl(key,query))
  .then(function(response){
    // wc.log(response)
    if(response.data.error){
      result={error:{code:'80'+response.data.error.code,error:response.data.error.error}};
      data={};
      return
    }
    if(response.status==200){
      result={success:{code:'200',success:LANG.success}};
      data=response.data;
      return
    }
    wc.error('E840: '+LANG.requestError+'. ')
    result={error:{code:'840',error:LANG.requestError}};
    data={};
  })
  .catch(function(error){
    wc.error('E841: '+LANG.requestError+' - '+error)
    result={error:{code:'841',error:LANG.requestError+' - '+error}};
    data={};
  })
  .finally(finish)
},
loadTorn=function(key,queries,respondWith){
  // wc.log(queries)
  torn.loadQue+=1;
  const
    _data={},
    _result={},
    callEach=function(){
      query=queries[index++];
      query?callTorn(key,query,callNext):finish();
    },
    callNext=function(qi,result,data){
      _result[qi]=result;
      _data[qi]=data;
      run(callEach,TORN_CALL_RATE)
    },
    finish=function(){
      torn.loadQue-=1;
      // wc.log(result)
      if(af(respondWith)){respondWith(_result,_data)}
    }
  ;
  var index=0,query;
  callEach()
}
;

const
xloadTornData=function(key){

  // case 1 - data is loading
  // torn.loadQue=1;return;

  // case 2 - data is ready immidiately
  // key[0]!='f'?useCorrectKey(torn.db,torn.result):useIncorrectKey(torn.db,torn.result);return;

  // case 3 - data is ready after a moment
  torn.loadQue=1;
  run(function(){
    if(key[0]!='f'){
      useCorrectKey(torn.db,torn.result)
      torn.key_sync=key;
      run(function(){
        makeUserSubs(torn.db,torn.result)
        torn.loadQue=0;
      },TORN_CALL_RATE*2)
    }
    else{
      useIncorrectKey(torn.db,torn.result)
      torn.loadQue=0;
    }
  },TORN_CALL_RATE)

},
loadTornData=function(key){

  // use mockup data
  // xloadTornData(key);return;

  // use real data
  loadTorn(key,TORN.USER,function(result){
    if(result.user.error===_){
      torn.key_sync=key;
      loadTorn(key,TORN.USER_SUBS)
      torn.callInterval?clearInterval(torn.callInterval):_;
      torn.callInterval=setInterval(function(){
        if(torn.vm&&torn.vm.error===_){torn.vm.sync()}
      },TORN_CALL_FREQUENCY)
    }
  })

}
;

// torn application
const
newTornApp=function(){

  // application properties
  const
  app=torn.app,
  watch={},
  method={},
  computed={}
  ;

  // error handler
  Vue.config.errorHandler=
  Vue.config.warnHandler=
  function(err,vm,info){base.setError(err)};

  // error
  app.error=_;

  computed.errorMessage=function(){
    const e=gvo(this.error,{});
    e.ref=e.ref||'E';
    e.code=e.code||'900';
    e.error=e.error||LANG.unknownError;

    if(e.code==='802'){e.error=LANG.wrongKey}

    return '<b>'+e.ref+e.code+'</b> | '+e.error;
  }

  // helper
  app.NONE=_;
  app.window=w;
  app.TORN=TORN;

  // state
  app.view=_;
  app.spinLoader=_;

  // data
  app.data={};

  // content formating
  method.formatCurrency=formatCurrency;
  method.formatTimestamp=function(t){ return new Date(t).toUTCString() }
  method.formatTornTimestamp=function(t){ return new Date(t*1000).toUTCString() }
  computed.statusIcon={
    get:function(){
      var icon;
      if(torn.db.user&&torn.db.user.status){
        var match=torn.db.user.status.join('.').match(STATUS_ICON_REGEX);
        if(match){icon=STATUS_ICON[match[0].toLowerCase()]}
      }
      return icon||STATUS_ICON.default
    }
  }

  // components
  Vue.component('t-noties',{
    computed:{
      classNames:function(){
        const cn=['ir'];
        if(this.item.count<=0){cn.push('_text-grey')}
        return cn
      }
    },
    methods:{
      click:function(){openUrl('//torn.com/'+this.item.url+'.php','_blank')}
    },
    props:['item'],
    template:''
    +'<button :class=" classNames " :title=" item.label " @click="click">'
      +'<i class="-icon material-icons">{{ item.icon }}</i>'
      +'<b class="-count">{{ item.count }}</b>'
    +'</button>'
  })
  const newNoties=function(){
    app.data.user_noties=[];
    TORN_USER_NOTIES_MAP.forEach(function(item){app.data.user_noties.push(TORN_USER_NOTIES[item])})
  };
  newNoties()

  Vue.component('t-bars',{
    computed:{
      classNames:function(){return ['t-bar','t-bar-'+this.item.key]},
      barValue:function(){const val=(this.item.value.current / this.item.value.maximum * 100);return val<100?val:100}
    },
    props:['item'],
    template:''
    +'<div :class=" classNames ">'
      +'<span class="-label">{{ item.label }}:</span>'
      +'<span class="-value">{{ item.value.current||0 }} / {{ item.value.maximum>1?item.value.maximum:0 }}</span>'
      +'<div class="-bar">'
        +'<div class="-bar-value" :style="{ width:barValue + \'%\' }"></div>'
      +'</div>'
    +'</div>'
  })
  const newBars=function(){
    app.data.user_bars=[];
    TORN_USER_BARS_MAP.forEach(function(item){
      app.data.user_bars.push({key:item,label:item.charAt(0).toUpperCase()+item.slice(1),value:{current:0,maximum:1}})
    })
  };
  newBars()

  // interaction
  method.check=function(){
    wc.warn('=========== APP-CHECK ===========')
    wc.log('app.key: ',this.key)
    wc.log('app.data: ',this.data)
    wc.log('app.view: ',this.view)
    wc.log('app.error: ',this.error)
  }

  method.openUrl=openUrl;

  method.reload=function(){openUrl()}

  method.sync=function(queries){
    if(!isValidTornKey(torn.key_sync)){
      this.error={code:'901',error:LANG.invalidOperation};
      this.view='error';
      return
    }
    loadTorn(torn.key_sync,queries||TORN.ALL,function(){
      torn.vm.spinLoader=torn.loadQue>0;
      syncTornData.call(torn.vm)
    })
    torn.vm.spinLoader=torn.loadQue>0;
  }

  // syncTornData
  const
  syncTornData=function(){
    if(torn.result.user===_||torn.result.user.success===_){return}
    // check()
    // this.check()

    var qi;
    TORN.ALL.forEach(function(query){
      qi=query.join('_');
      if(qi==='user_notifications' && torn.db[qi] && torn.db[qi].notifications){
        TORN_USER_NOTIES_MAP.forEach(function(item,key){
          torn.app.data.user_noties[key].count=torn.db[qi].notifications[item];
        })
      }
      else if(qi==='user_bars' && torn.db[qi]){
        TORN_USER_BARS_MAP.forEach(function(item,key){
          torn.app.data.user_bars[key].value=torn.db[qi][item];
        })
      }
      else{
        torn.app.data[qi]=torn.db[qi];
      }
    })

  }
  ;

  // route app
  const
  route=function(){

    if(!avs(this.key)){this.view='keyDialog';return}
    if(!isValidTornKey(this.key)){
      this.error={code:'400',error:LANG.invalidKey};
      this.view='error';
      return
    }

    if(torn.result.user){
      if(torn.result.user.error){
        this.error=torn.result.user.error;
        this.view='error';
        return
      }
      if(torn.result.user.success){
        this.view='home';
        return
      }
    }

    const loading=torn.loadQue>0;
    this.spinLoader=loading;
    if(loading){this.view='loading';return}

    wc.error('=========== UNKNOWN ERROR ===========');
    this.view='error';
    w.check()
    this.check()

  }
  ;

  // application entries

  method.tryAgain=function(){
    const e=this.error;
    if(e){
      if(e.code==='400'||e.code==='802'){this.restart();return}
    }
    this.reload()
  }

  method.keyDialog_submit=function(){
    if(!avs(this.key)){
      const e=base.getElementById('page-key-password');
      e?e.focus():_;
      return
    }
    this.restart(this.key)
  }

  method.restart=function(newKey){

    const key=(newKey||'').trim();
    key.length>0?setParameter([['key',key]]):setParameter();
    this.error=_;
    this.spinLoader=_;
    this.key=key;
    torn.key_sync=_;
    torn.result={};
    this.data={};
    newNoties()
    newBars()
    if(!isValidTornKey(key)){route.call(this);return}
    loadTornData(this.key)
    route.call(this)
    whenUserAvailable(function(){
      route.call(torn.vm)
      whenDataAvailable(function(){
        torn.vm.spinLoader=torn.loadQue>0;
        syncTornData.call(torn.vm)
      })
    })

  }

  const
  start=function(){
    route.call(this)
    whenUserAvailable(function(){
      route.call(torn.vm)
      whenDataAvailable(function(){
        torn.vm.spinLoader=torn.loadQue>0;
        syncTornData.call(torn.vm)
      })
    })
    base.showContent()

    base.addEvent('popstate',w,function(){
      torn.vm.restart(getParameterByName('key'))
    })

  },
  whenUserAvailable=function(userLoaded){
    if(torn.loadQue>0&&torn.result.user===_){run(function(){whenUserAvailable(userLoaded)},TORN_CALL_RATE*0.5);return}
    userLoaded()
  },
  whenDataAvailable=function(dataLoaded){
    if(torn.loadQue>0){run(function(){whenDataAvailable(dataLoaded)},TORN_CALL_RATE*0.5);return}
    dataLoaded()
  }
  ;

  // mount
  torn.vm=new Vue({
    el:'#_app',
    data:app,
    watch:watch,
    methods:method,
    computed:computed,
    renderError:function(h,err){wc.error(h);base.setError(err)},
    mounted:function(){this.$nextTick(start)}
  });
  base.export(torn.vm,w,'torn')

},
appLoaded=function(){

  torn.app.key=getParameterByName('key');
  if(isValidTornKey(torn.app.key)){
    loadTornData(torn.app.key)
  }
  newTornApp()

},
torn={
  key_sync:_,
  db:{},
  loadQue:0,
  nextQue:0,
  result:{},
  stamp:{},
  latest:{},
  app:{}
},
check=function(){
  wc.warn('=========== ROOT-CHECK ===========')
  wc.log('torn.app.key: ',torn.app.key)
  wc.log('torn.app.data: ',torn.app.data)
  wc.log('torn.key_sync: ',torn.key_sync)
  wc.log('torn.loadQue: ',torn.loadQue)
  wc.log('torn.latest: ',JSON.stringify(torn.latest))
  wc.log('torn.result: ',torn.result)
  wc.log('torn.db: ',torn.db)
}
;
base.export(check,w,'check')
base.addEvent('load',w,appLoaded)

}) // base.use
}({ // torn config

	context:this

}));
