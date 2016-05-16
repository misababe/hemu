var misa = {};

misa.timeScroll = null;  //挂载整屏切换动画的实例

misa.currentStep = "step1";

misa.init = function(){

	misa.resize(); //设置每一屏的高度和top值

	misa.nav();

	misa.events(); //配置事件

	misa.topDrag();//顶部绳子

	misa.focusPicAnimate();//配置首屏轮播图的动画

	misa.configTimeScroll(); //配置每屏切换的动画

	twoAnimate.init();//执行第二屏动画

	threeAnimate.init();

	fourAnimate.init();//执行第四屏里的动画

};
$(document).ready( misa.init );

//首屏轮播图
misa.focusPicAnimate = function(){
	misa.resize();
	//var iHeight = $(window).height()+'px';
	//$(".banner").css('height',iHeight);
	var scrW = $(window).width();
	//$(".banner li").css({'width':scrW+'px','height':iHeight});

	var i=0;
	var clone=$(".banner .img li").first().clone();
	$(".banner .img").append(clone);
	var size=$(".banner .img li").size();
	$(".banner .slider-dots").append("<a class='slider-indicator'></a>");
	for(var j=0;j<size-1;j++){
		$(".banner .slider-dots").append("<a class='slider-dot' data-pos="+j+"></a>");
	}
	//$(".banner .slider-dots li").first().addClass("on");

	/*-------------------------------------------
	 轮播图点点
	 ---------------------------------------------*/
	var sliderElem = document.querySelector('.slider');
	var dotElems = sliderElem.querySelectorAll('.slider-dot');
	var indicatorElem = sliderElem.querySelector('.slider-indicator');
	Array.prototype.forEach.call(dotElems, function (dotElem) {
		dotElem.addEventListener('click', function (e) {
			var currentPos = parseInt(sliderElem.getAttribute('data-pos'));
			var newPos = parseInt(dotElem.getAttribute('data-pos'));
			var newDirection = newPos > currentPos ? 'right' : 'left';
			var currentDirection = newPos < currentPos ? 'right' : 'left';
			indicatorElem.classList.remove('slider-indicator--' + currentDirection);
			indicatorElem.classList.add('slider-indicator--' + newDirection);
			sliderElem.setAttribute('data-pos', newPos);
			var index=$(this).index();
			i=index;
			$(".banner .img").stop().animate({left:-index*scrW},1000)
		});
	});

	/*自动轮播*/
	var t=setInterval(function(){
		i++;
		move()
	},3000)


	/*焦点图自动轮播*/
	$(".banner").hover(function(){
		clearInterval(t);
	},function(){
		t=setInterval(function(){
			i++;
			move()
		},3000)
	})



	function move(){
		//console.log(i)
		var picAnimate = new TimelineMax();

		var scrW = $(window).width();

		if(i==size){
			picAnimate.to(".banner  .img",0,{left:0,ease:Cubic.easeInOut})
			i=1;
		}


		if(i==-1){
			picAnimate.to(".banner  .img",0,{left:-(size-1)*scrW,ease:Cubic.easeInOut})
			i=size-2;
		}

		picAnimate.to(".banner  .img",1.5,{left:-i*scrW,ease:Cubic.easeInOut})

		if(i==size-1){
			//$(".slider-dot").eq(0).addClass("on").siblings().removeClass("on")
			sliderElem.setAttribute('data-pos', 0);
		}else{
			//$(".slider-dot").eq(i).addClass("on").siblings().removeClass("on")
			sliderElem.setAttribute('data-pos', i);
		}
	}
}

//设置每一屏的高度和top值
misa.resize = function(){

	$(".scene").height( $(window).height() )// 设置每一屏的height
	$(".scene:not(':first')").css("top",$(window).height()+$(".top-nav").height());

	misa.configTimeScroll();

	//设置轮播图自适应size
	var iHeight = $(window).height()+'px';
	$(".banner").css('height',iHeight);
	var scrW = $(window).width();
	$("#top-bg li").css({'width':scrW+'px','height':iHeight});

	if( $(window).width() <= 780 ){

		$(".wrapper").unbind();
		$(window).unbind("mousewheel");
		$(window).unbind("scroll");
		$(window).unbind("mousedown");
		$(window).unbind("mouseup");

		$("body").css("height","auto");
		$("body").addClass("r780 r950").css("overflow-y","scroll");

		$(".menu").css("top",0);
		$(".menu").css("transform","none");
		$(".menu_wrapper").css("top",0);

		$(".menu").removeClass("menu_state2");
		$(".menu").removeClass("menu_state3");

	}else if( $(window).width() <= 950 ){
		$("body").css("height",8500);
		$("body").removeClass("r780").addClass("r950");
		$(".menu").css("top",0);
		$(".menu").css("transform","none");
	}else{
		$("body").removeClass("r780 r950");
		$("body").css("height",8500);
		$("body").removeClass("r950");
		$(".menu").css("top",22);
		$(".left_nav").css("left",-300);
	}

};

misa.events = function(){

	$(window).bind("scroll",scrollFn);

	function scrollFn(){
		$(window).scrollTop(0);
	}
	//在滚动条滚动的过程中，计算页面中应该到哪一个时间点上去
	$(window).bind("scroll",misa.scrollStatus);

	//当mousedown的时候，解除scroll事件对应的scrollFn

	$(window).bind("mousedown",function(){
		$(window).unbind("scroll",scrollFn);
	});

	//当mouseup的时候，让当前这一屏到达某个状态

	$(window).bind("mouseup",misa.mouseupFn)

	//干掉浏览器默认的滚动行为

	$(".wrapper").bind("mousewheel",function(ev){
		if($(window).width()>780) ev.preventDefault();
	});

	$(".wrapper").one("mousewheel",mousewheelFn);

	var timer = null;
	function mousewheelFn(ev,direction){
		$(window).unbind("scroll",scrollFn);
		if( direction<1 ){  //向下滚动
			//console.log("next");
			misa.changeStep("next");
		}else{  //向上滚动
			//console.log("prev");
			misa.changeStep("prev");
		};
		clearTimeout(timer);
		timer = setTimeout(function(){
			if( $(window).width() > 780 ){
				$(".wrapper").one("mousewheel",mousewheelFn);
			}
		},1200)
	}


	$(window).resize( misa.resize );


}

misa.nav = function(){
	var navAnimate = new TimelineMax();
	$(".nav1 a:gt(0)").bind("mouseenter",function(){
		//console.log('navin')
		var w = $(this).width();
		var l = $(this).offset().left;
		navAnimate.clear();
		navAnimate.to(".line",0.4,{opacity:1,left:l,width:w,top:-10});
	});

	$(".nav1 a").bind("mouseleave",function(){
		//console.log('navout')
		navAnimate.clear();
		navAnimate.to(".line",0.4,{opacity:0});
	});
}
/*-------------------------------------------
 顶部下拉幕布
 ---------------------------------------------*/
misa.topDrag = function(){

	var $strap = $('.top-drag');
	var strapTL = new TimelineMax({paused:true,repeat:-1,repeatDelay:3});

	//1-2-3-4-3-2-1-5-6-7-6-5-1
	strapTL
		.set($strap,{backgroundPosition:'0 0'})//1
		.set($strap,{backgroundPosition:'0 -52px'},'+=0.1')//2
		.set($strap,{backgroundPosition:'0 -104px'},'+=0.1')//3
		.set($strap,{backgroundPosition:'0 -156px'},'+=0.125')//4
		.set($strap,{backgroundPosition:'0 -104px'},'+=0.1')//3
		.set($strap,{backgroundPosition:'0 -52px'},'+=0.1')//2
		.set($strap,{backgroundPosition:'0 0'},'+=0.125')//1
		.set($strap,{backgroundPosition:'0 -208px'},'+=0.1')//5
		.set($strap,{backgroundPosition:'0 -260px'},'+=0.1')//6
		.set($strap,{backgroundPosition:'0 -312px'},'+=0.125')//7
		.set($strap,{backgroundPosition:'0 -260px'},'+=0.1')//6
		.set($strap,{backgroundPosition:'0 -208px'},'+=0.1')//5
		.set($strap,{backgroundPosition:'0 0'},'+=0.125')//1
		.set($strap,{backgroundPosition:'0 -52px'},'+=0.1')//2
		.set($strap,{backgroundPosition:'0 -104px'},'+=0.1')//3
		.set($strap,{backgroundPosition:'0 -156px'},'+=0.125')//4
		.set($strap,{backgroundPosition:'0 -104px'},'+=0.1')//3
		.set($strap,{backgroundPosition:'0 -52px'},'+=0.1')//2
		.set($strap,{backgroundPosition:'0 0'},'+=0.125')//1
		.set($strap,{backgroundPosition:'0 -208px'},'+=0.1')//5
		.set($strap,{backgroundPosition:'0 -260px'},'+=0.1')//6
		.set($strap,{backgroundPosition:'0 -312px'},'+=0.125')//7
		.set($strap,{backgroundPosition:'0 -260px'},'+=0.1')//6
		.set($strap,{backgroundPosition:'0 -208px'},'+=0.1')//5
		.set($strap,{backgroundPosition:'0 0'},'+=0.125');
	strapTL.play();

	$('#header').on({
		'mouseenter':function(){
			if($(window).width()>=768){
				$('#header').stop(true,false).animate({
					top:0
				})
				$strap.stop(true,false).animate({
					top:180
				},420)
				strapTL.pause(0);
			}
		},
		'mouseleave':function(){
			if($(window).width()>=768){
				$('#header').stop(true,false).animate({
					top:-180
				},500)
				$strap.stop(true,false).animate({
					top:0
				},420)
				strapTL.play();
			}
		}
	});


}

//当mouseup的时候，让当前这一屏到达某个状态
misa.mouseupFn = function(){
	//在滚动过程中计算出一个比例
	var scale = misa.scale();
	//得到当前页面到达的某个时间点
	var times = scale * misa.timeScroll.totalDuration();

	//获取到上一个状态和下一个状态
	var prevStep = misa.timeScroll.getLabelBefore(times);
	var nextStep = misa.timeScroll.getLabelAfter(times);

	//获取到上一个状态的时间和下一个状态的时间
	var prevTime = misa.timeScroll.getLabelTime(prevStep);
	var nextTime = misa.timeScroll.getLabelTime(nextStep);

	//计算差值
	var prevDvalue = Math.abs( prevTime - times );
	var nextDvalue = Math.abs( nextTime - times );

	/*
	 如果scale为0
	 step1
	 如果scale为1
	 step5
	 如果 prevDvalue < nextDvalue
	 prevStep
	 如果 prevDvalue > nextDvalue
	 nextStep
	 */
	var step = "";
	if( scale === 0 ){
		step = "step1"
	}else if( scale === 1 ){
		step = "footer"
	}else if(prevDvalue < nextDvalue){
		step = prevStep;
	}else{
		step = nextStep;
	};

	misa.timeScroll.tweenTo(step);
	//-----------------当松开鼠标时候，控制滚动条到达某个状态计算出的距离-----------------------
	//获取动画的总时长
	var totalTime = misa.timeScroll.totalDuration();
	//获取到要到达的状态的时间
	var afterTime = misa.timeScroll.getLabelTime(step);
	//获取到滚动条能够滚动的最大的高度
	var maxH = $("body").height() - $(window).height();
	//计算出滚动条滚动的距离
	var positionY = afterTime/totalTime * maxH;
	//滚动条滚动的距离的持续时间
	var d = Math.abs( misa.timeScroll.time() - afterTime );

	var scrollAnimate = new TimelineMax();

	scrollAnimate.to("html,body",d,{scrollTop:positionY});

	misa.currentStep = step;
}

//计算滚动条在滚动过程中的一个比例

misa.scale = function(){
	var scrollT = $(window).scrollTop();
	var MaxH = $("body").height() - $(window).height();
	var s = scrollT/MaxH;
	return s;
}

//在滚动条滚动的过程中，计算页面中应该到哪一个时间点上去
misa.scrollStatus = function (){
	var times = misa.scale() * misa.timeScroll.totalDuration();
	//当滚动条在滚动的过程中，让页面中的动画到打某个时间点
	misa.timeScroll.seek(times,false);
}

//切换整屏并且计算滚动条的距离

misa.changeStep = function(value){
	if( value === "next" ){ //向下切换

		//获取当前的时间
		var currentTime = misa.timeScroll.getLabelTime(misa.currentStep);

		//获取到下一个状态的字符串
		var afterStep = misa.timeScroll.getLabelAfter(currentTime);

		if( !afterStep ) return;

		//获取动画的总时长
		var totalTime = misa.timeScroll.totalDuration();
		//获取到下一个状态的时间
		var afterTime = misa.timeScroll.getLabelTime(afterStep);
		//获取到滚动条能够滚动的最大的高度
		var maxH = $("body").height() - $(window).height();

		//计算出滚动条滚动的距离
		var positionY = afterTime/totalTime * maxH;
		//滚动条滚动的距离的持续时间
		var d = Math.abs( misa.timeScroll.time() - afterTime );

		var scrollAnimate = new TimelineMax();

		scrollAnimate.to("html,body",d,{scrollTop:positionY});

		//运动到下一个状态

		//misa.timeScroll.tweenTo(afterStep);
		//记录当前的状态为下一个状态，方便继续切换到下一个状态上
		misa.currentStep = afterStep;

	}else{ //向上切换

		//获取当前的时间
		var currentTime = misa.timeScroll.getLabelTime(misa.currentStep);

		//获取到上一个状态的字符串
		var beforeStep = misa.timeScroll.getLabelBefore(currentTime);

		if( !beforeStep ) return;

		//获取动画的总时长
		var totalTime = misa.timeScroll.totalDuration();
		//获取到下一个状态的时间
		var BeforeTime = misa.timeScroll.getLabelTime(beforeStep);
		//获取到滚动条能够滚动的最大的高度
		var maxH = $("body").height() - $(window).height();

		//计算出滚动条滚动的距离
		var positionY = BeforeTime/totalTime * maxH;
		//滚动条滚动的距离的持续时间
		var d = Math.abs( misa.timeScroll.time() - BeforeTime );

		var scrollAnimate = new TimelineMax();

		scrollAnimate.to("html,body",d,{scrollTop:positionY});

		//运动到上一个状态

		//misa.timeScroll.tweenTo(beforeStep);
		//记录当前的状态为上一个状态，方便继续切换到上一个状态上
		misa.currentStep = beforeStep;
	}
}

misa.configTimeScroll = function(){
	var time = misa.timeScroll ? misa.timeScroll.time() : 0;

	if( misa.timeScroll ) misa.timeScroll.clear();

	misa.timeScroll = new TimelineMax();

	misa.timeScroll.add("step1");

	//切換到第二屏時第一屏向上滑
	misa.timeScroll.to(".scene1",0.8,{top:-$(window).height(),ease:Cubic.easeInOut});

	misa.timeScroll.to(".scene2",0.8,{top:0,ease:Cubic.easeInOut,onReverseComplete:function(){
		twoAnimate.timeline.seek(0,false);
	}},"-=1");
	misa.timeScroll.to({},0.1,{onComplete:function(){
		//console.log('第二屏')
		twoAnimate.timeline.tweenTo("state5");
	}},"-=1.5");

	misa.timeScroll.add("step2");

	//切換到第三屏時第二屏向上滑
	misa.timeScroll.to(".scene2",0.8,{top:-$(window).height(),ease:Cubic.easeInOut,onComplete:function(){
		//通过json获取产品参数 静态博客不行
		//$.getJSON("js/demo_ajax_json.js",function(result){
		//	//console.log(result);
		//	//console.log($(".circle-works-item img").index("img"));
		//	$.each(result.products,function(index,value){
		//		//console.log(result.products[index].nam);
		//		var aImg = createImg(result.products[index].src);
		//		var aH4 = createTitle(result.products[index].nam,result.products[index].price);
		//		$('.circle-works').find('li').find('a').eq(index).prepend(aImg);
		//		$('.circle-works').find('li').find('a').eq(index).append(aH4);
		//	})
		//})

	}});

	misa.timeScroll.to(".scene3",0.8,{top:0,ease:Cubic.easeInOut,onReverseComplete:function(){
		//console.log('re2')
		twoAnimate.timeline.seek(0,false);
	}},"-=1");

	misa.timeScroll.to({},0.1,{onComplete:function(){
		//console.log('第三屏')
		threeAnimate.timeline.tweenTo("state1");
	}},"-=0.2");

	misa.timeScroll.add("step3");

	//切换到第四屏的时候第三屏向上滑
	misa.timeScroll.to(".scene3",0.8,{top:-$(window).height(),ease:Cubic.easeInOut});
	misa.timeScroll.to(".scene4",0.8,{top:0,ease:Cubic.easeInOut
		//,onReverseComplete:function(){
		//console.log('re2')
		//threeAnimate.timeline.seek(0,false);}
	},"-=0.8");

	misa.timeScroll.to({},0.1,{onComplete:function(){
		//console.log('第三屏')
		fourAnimate.timeline.tweenTo("state1");
	}},"-=0.8");

	misa.timeScroll.add("step4");

	//滚动到第五屏的时候，要让第四屏滚出屏幕外
	misa.timeScroll.to(".scene4",0.8,{top:-$(window).height(),ease:Cubic.easeInOut});

	misa.timeScroll.to(".scene5",0.8,{top:0,ease:Cubic.easeInOut,onReverseComplete:function(){
		//console.log('re2')
		fiveAnimate.timeline.seek(0,false);
	}},"-=0.8");

	misa.timeScroll.to({},0.1,{onComplete:function(){
		//console.log('第三屏')
		fiveAnimate.timeline.tweenTo("state1");
	}},"-=0.6");

	misa.timeScroll.add("step5");

	misa.timeScroll.to(".scene5",0.5,{top:-$(".footer").height(),ease:Cubic.easeInOut});
	misa.timeScroll.to(".footer",0.5,{top:$(window).height()-$(".footer").height(),ease:Cubic.easeInOut},"-=0.5");

	misa.timeScroll.add("footer");

	misa.timeScroll.stop();
	//当改变浏览器的大小时，让动画走到之前已经到达的时间点
	misa.timeScroll.seek(time);
}

//配置第二屏动画
var twoAnimate = {};
twoAnimate.timeline = new TimelineMax();
twoAnimate.init = function(){
	twoAnimate.timeline.to('.lst',1,{height:381,opacity:1},"-=0.6");
	twoAnimate.timeline.to('.aboutus',1,{"margin-top":"100px"},"-=0.1");

	//初始右一飞入
	twoAnimate.timeline.to('.r1 b',0,{"left":"50%","margin-left":"-30px","opacity":"1"},"-=1");
	twoAnimate.timeline.to('.r1 i',0,{"left":"50%","margin-left":"42px","opacity":"1"},"-=1");
	twoAnimate.timeline.to('.r1 .word',0,{"left":"50%","margin-left":"120px","opacity":"1"},"-=1");

	twoAnimate.timeline.add("state1");

	//初始左一飞入
	twoAnimate.timeline.to('.l1 b',0,{"left":"50%","margin-left":"-30px","opacity":"1"},"-=1");
	twoAnimate.timeline.to('.l1 i',0,{"left":"50%","margin-left":"-115px","opacity":"1"},"-=1");
	twoAnimate.timeline.to('.l1 .word',0,{"left":"50%","margin-left":"-635px","opacity":"1"},"-=1");

	twoAnimate.timeline.add("state2");

	//初始右二飞入
	twoAnimate.timeline.to('.r2 b',0,{"left":"50%","margin-left":"-30px","opacity":"1"},"-=1");
	twoAnimate.timeline.to('.r2 i',0,{"left":"50%","margin-left":"42px","opacity":"1"},"-=1");
	twoAnimate.timeline.to('.r2 .word',0,{"left":"50%","margin-left":"120px","opacity":"1"},"-=1");

	twoAnimate.timeline.add("state3");

	//初始左二飞入
	twoAnimate.timeline.to('.l2 b',0,{"left":"50%","margin-left":"-30px","opacity":"1"},"-=1");
	twoAnimate.timeline.to('.l2 i',0,{"left":"50%","margin-left":"-115px","opacity":"1"},"-=1");
	twoAnimate.timeline.to('.l2 .word',0,{"left":"50%","margin-left":"-635px","opacity":"1"},"-=1");

	twoAnimate.timeline.add("state4");

	//初始右三飞入
	twoAnimate.timeline.to('.r3 b',0,{"left":"50%","margin-left":"-30px","opacity":"1"},"-=1");
	twoAnimate.timeline.to('.r3 i',0,{"left":"50%","margin-left":"42px","opacity":"1"},"-=1");
	twoAnimate.timeline.to('.r3 .word',0,{"left":"50%","margin-left":"120px","opacity":"1"},"-=1");

	twoAnimate.timeline.add("state5");
	//console.log(2)
	twoAnimate.timeline.stop();

}

//配置第三屏动画
var threeAnimate = {};
threeAnimate.timeline = new TimelineMax();
threeAnimate.init = function(){
	var num=0;
	$('.containerTab').click(function(e){
		if(num++ %2 == 0){
			$('.containerTab .label').text('♂')
		}else{
			$('.containerTab .label').text('♀')
		}
		e.preventDefault(); //阻止元素的默认动作（如果存在）
	});
	threeAnimate.timeline.staggerTo('.hairList li',3,{opacity:1,ease:Elastic.easeOut},0.2);
	threeAnimate.timeline.to('hairList',0.2,{"transition-timing-function":" cubic-bezier(0.1, 0.57, 0.1, 1)",
		"transition-duration": "0ms",
		"transform":" translate(0px, 0px) translateZ(0px)"});
	//console.log(3)
	threeAnimate.timeline.add('state1');
	threeAnimate.timeline.stop();
}

//配置第四屏动画
var fourAnimate = {};
fourAnimate.timeline = new TimelineMax();
fourAnimate.init = function(){

	//第四屏泡泡效果
	var $worksMask = $('.circle-works-mask');
	var worksMaskTL = new TimelineMax({paused:true,repeat:-1});

	$('.circle-works-mask').each(function(idx,elm){
		var clsNum = Math.round(Math.random()*5)+1;//1〜6の整数
		//console.log(clsNum);
		$(elm).addClass('mask-type0'+clsNum);
	});

	worksMaskTL
		.set($worksMask,{backgroundPosition:'0 0'})//1
		.set($worksMask,{backgroundPosition:'0 -200px'},'+=0.125')//2
		.set($worksMask,{backgroundPosition:'0 -400px'},'+=0.125')//3
		.set($worksMask,{backgroundPosition:'0 -600px'},'+=0.125')//4
		.set($worksMask,{backgroundPosition:'0 -800px'},'+=0.125')//5
		.set($worksMask,{backgroundPosition:'0 -1000px'},'+=0.125')//6
		.set($worksMask,{backgroundPosition:'0 -1200px'},'+=0.125')//7
		.set($worksMask,{backgroundPosition:'0 -1400px'},'+=0.125')//8
		.set($worksMask,{backgroundPosition:'0 -1600px'},'+=0.125')//9
		.set($worksMask,{backgroundPosition:'0 -1800px'},'+=0.125')//10
		.set($worksMask,{backgroundPosition:'0 -2000px'},'+=0.125')//11
		.set($worksMask,{backgroundPosition:'0 -2200px'},'+=0.125')//12
		.set($worksMask,{backgroundPosition:'0 -2400px'},'+=0.125')//13
		.set($worksMask,{backgroundPosition:'0 -2600px'},'+=0.125')//14
		.set($worksMask,{backgroundPosition:'0 -2800px'},'+=0.125')//15
		.set($worksMask,{backgroundPosition:'0 -3000px'},'+=0.125')//16
		.set($worksMask,{backgroundPosition:'0 -3200px'},'+=0.125')//17
		.set($worksMask,{backgroundPosition:'0 -3400px'},'+=0.125')//18
		.set($worksMask,{backgroundPosition:'0 -3600px'},'+=0.125')//19
		.set($worksMask,{backgroundPosition:'0 -3800px'},'+=0.125')//20
		.set($worksMask,{backgroundPosition:'0 0'},'+=0.125');//1
	worksMaskTL.play();

	$('.circle-works').find('li').on('mouseenter',function(){
		//console.log($(this));
		$(this).find('h4').removeClass('hidden');
	})
	$('.circle-works').find('li').on('mouseleave',function(){
		//console.log($(this));
		$(this).find('h4').addClass('hidden');
	})

	fourAnimate.timeline.staggerTo('.circle-works li',3,{opacity:1,ease:Elastic.easeOut},0.2);
	fourAnimate.timeline.to('circle-works',0.2,{"transition-timing-function":" cubic-bezier(0.1, 0.57, 0.1, 1)",
		"transition-duration": "0ms",
		"transform":" translate(0px, 0px) translateZ(0px)"});
	console.log(4)
	fourAnimate.timeline.add('state1');
	fourAnimate.timeline.stop();
}
//创建一个新的产品li
//function createImg(src){
//	var newImg = document.createElement('img');
//	newImg.className = 'attachment-post-thumbnail wp-post-image';
//	newImg.src = src;
//
//	return newImg;
//}
//function createTitle(name,price){
//	var newh4 = document.createElement('h4');
//	newh4.className = 'hair-title hidden';
//	newh4.innerHTML = ' <span>'+name+'</span> <br/> <span>'+price+'</span><br/><div class="addTo">加入购物车</div>';
//
//	return newh4;
//}