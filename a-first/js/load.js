// => to load resources dynamicly
// (c) Copyright HtmlBase by Nik Ahmad 2019
;(function(c){"use strict";
const dn='load';
base.use(function(fn,_,w,wc,g,d,a,ac,af,ao,avo,as,avs,xuse){
base.verifyConfig(dn,c)
const
warnFor=function(f,x){wc.warn(xuse(f,'callback function',x))},
nr=base.newRoutine,
ae=base.addEvent,
re=base.removeEvent,
sa=function(e,n,v){e.setAttribute(n,v)},
sas=function(e,o){for(var n in o){sa(e,n,o[n])}},
when_=function(x,c,i){x()?c():setTimeout(function(){return when_(x,c,i)},i)},
when =function(x,c,i){
	if(!af(c)){throw xuse('when','function',c)}
	if(!x){wc.warn("when() will never trigger for '"+x+"'")}
	when_(af(x)?x:function(){return x},c,i||500)
},

load=function(){
	const
		loads=[],
		then=function(f){return af(f)&&i.isDone()?f():_},
		i={}
	;
	i.add=function(){
		loads.push(0);
		return loads.length-1 // returns a pointer
	}
	i.done=function(p,c){
		loads[p]=1;
		then(c)
	}
	i.total=function(){return loads.length}
	i.finish=function(){return loads.reduce(function(t,n){return t+n},0)}
	i.isDone=function(){return i.finish()===i.total()}
	return i
}(),

res=function(t,s,o){
	if(!avs(s)){wc.warn(xuse(t,'src',s));return}
	if(o&&o.done&&!af(o.done)){warnFor(t,o.done)}
	const
		q={
			tag:'script',
			attr:o&&ao(o.attr)?o.attr:{},
			type_success:fn,
			done:o&&af(o.done)?o.done:fn,
			load:function(e){sa(e,'src',s)}
		}
	;
	if(t==='js'){}
	else if(t==='css'){
		q.tag='link';
		q.attr.rel='stylesheet';
		q.attr.media='none';
		q.type_success=function(e){return sa(e,'media',o&&o.media?o.media:'all')}
		q.load=function(e){sa(e,'href',s)}
	}
	else{
		q.attr.type='text';
	}
	const
		p=load.add(),
		e=d.createElement(q.tag),
		r=nr(function(){
			re('load',e,ro)
			re('error',e,rx)
			load.done(p,done)
		},1),
		ro=function(){i.status='success';q.type_success(e);q.done();r()},
		rx=function(){i.status='failed';q.done();r()},
		i={}
	;
	i.status='loading';
	sas(e,q.attr)
	when(
		function(){return d.body},
		function(){
			const
				z=d.getElementsByTagName('base')[0]||d.getElementsByTagName('script')[0]
			;
			z.parentNode.insertBefore(e,z)
			ae('load',e,ro)
			ae('error',e,rx)
		},
		100
	)
	q.load(e)
	if(o&&af(o.isLoaded)){when(o.isLoaded,r)}
	return i
},

ajax=function(s,o){
	const
		p=load.add(),
		xr=new XMLHttpRequest(),
		r=function(){
			re('load',xr,r)
			if(o&&af(o.done)){o.done(this)}
			load.done(p,done)
		}
	;
	if(!xr){wc.error('Cannot create ajax request');return}
	ae('load',xr,r)
	xr.open('GET',s,true)
	xr.send()
},

test=function(t){
	wc.log('load.test in '+t+' ms')
	const p=load.add();
	setTimeout(function(){load.done(p,done)},t)
},

set_done=function(c){
	if(af(c)){
		done=nr(c,1)
		when(load.isDone,done)
	}
	else{warnFor('done',c)}
},

i={}
;
var
	done=fn
;

i.test=function(time){test(time);return i}
i.done=function(f){set_done(f);return i}
i.total=function(){return load.total()}
i.finish=function(){return load.finish()}
i.loaded=function(){return load.loaded()}
i.failed=function(){return load.failed()}
i.isDone=function(){return load.isDone()}
i.js=function(src,opt){res('js',src,opt);return i}
i.css=function(src,opt){res('css',src,opt);return i}
i.ajax=function(src,opt){ajax(src,opt);return i}
i.conflict=base.export(i,c.context,c.name||dn)
})//base.use
}({// load config

	context:this

}));
