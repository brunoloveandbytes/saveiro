$(document).ready(function() {
	var lastScrollRefresh = 0;

	var AnimationType = {
		TopDown : 0,
		UpCar : 1,
		ZoomInCar : 2,
		RotateCars : 3,
		ZoomOutCar : 4,
		ShowHome : 5
	}

	var AnimatedProperty = function(options){
		this.name = options.name;
		this.animationType = options.animationType;
		this.delay = (options.delay)?(options.delay):(0);
		this.inverseDelay = (options.inverseDelay)?(options.inverseDelay):(0);
		this.onAnimation = false;
		this.animate = function(propName,animationTime,init,end, easing, inverse){
			var delay = this.delay;
			if(inverse){
				delay = this.inverseDelay;
			}
			var execute = this.executeAnimation;
			var myCompleteFunction = this.onComplete;
			var name = this.name;
			setTimeout(function(){
   				execute(name,propName,animationTime,init,end, easing, inverse,myCompleteFunction);
        	}, delay);
		};
		this.executeAnimation = function(name,propName,animationTime,init,end, easing, inverse,myCompleteFunction){
			var id = "#" + name;
			this.onAnimation = true;
			$({deg: init}).animate({deg: end},{
			  duration: animationTime,
			  easing: easing,
			  step: function(now){
				var prop = {};
				if(propName == 'transform'){
					prop[propName] = 'rotate(' + now + 'deg)';
				}else if(propName == 'opacity'){
					prop[propName] = now;
				}else{
					prop[propName] = now + '%';
				}
			    $(id).css(prop);
			  },
			  complete: function() {
			      myCompleteFunction(inverse);
			  }
			});
		}

		this.onComplete = function(inverse){
			this.onAnimation = false;
			stateMachine.state.completedAnimation(inverse);
		};
	}

	var StateMachine = function(){
		this.states = [];

		this.states.push(new State(this,{"animatedProperties":[new AnimatedProperty({"name":"frame1","animationType":AnimationType.TopDown})], "autoplay":false}));
		this.states.push(new State(this,{"animatedProperties":[new AnimatedProperty({"name":"frame2","animationType":AnimationType.TopDown})], "autoplay":false}));
		this.states.push(new State(this,{"animatedProperties":[new AnimatedProperty({"name":"frame3","animationType":AnimationType.TopDown})], "autoplay":false}));
		this.states.push(new State(this,{"animatedProperties":[new AnimatedProperty({"name":"rotational","animationType":AnimationType.UpCar,"delay":0, "inverseDelay":200})], "autoplay":true}));
		this.states.push(new State(this,{"animatedProperties":[new AnimatedProperty({"name":"black_car","animationType":AnimationType.ZoomInCar,"delay":500, "inverseDelay":200})], "autoplay":true}));
		this.states.push(new State(this,{"animatedProperties":[new AnimatedProperty({"name":"rotational","animationType":AnimationType.RotateCars,"delay":200, "inverseDelay":200})], "autoplay":true}));
		this.states.push(new State(this,{"animatedProperties":[new AnimatedProperty({"name":"blue_car","animationType":AnimationType.ZoomOutCar})], "autoplay":true}));
		this.states.push(new State(this,{"animatedProperties":[new AnimatedProperty({"name":"home","animationType":AnimationType.ShowHome})], "autoplay":false, "welcomeLeftFunction": function(){$('.menu').show();}, "byebyeLeftFunction": function(){$('.menu').hide();}}));
	
 		this.state = this.states[0];
 		this.onAnimation = false;
 		this.animationCounter = 0;
 		this.hasNextState = function(){
 			return this.state != this.states[this.states.length-1];
 		}
 		this.hasPrevState = function(){
 			return this.state.idx != 0;
 		}
 		this.goToNextState = function(){
 			if(this.hasNextState()){
 				this.onAnimation = true;
	 			this.state = this.states[this.state.idx+1];
	 			this.state.goToNext();
	 		}
 		}
 		this.goToPrevState = function(){
 			if(this.hasPrevState()){
 				this.onAnimation = true;
	 			this.state.goToPrev();
	 			this.state = this.states[this.state.idx-1];
	 		}
 		}
	}
	var State = function(stateMachine,options){
		this.idx = stateMachine.states.length;
		this.animatedProperties = options.animatedProperties;
		this.stateMachine = stateMachine;
		this.autoplay = (options.autoplay)?(options.autoplay):false;
		this.welcomeLeftFunction = (options.welcomeLeftFunction)?(options.welcomeLeftFunction):(null);
		this.welcomeRightFunction = (options.welcomeRightFunction)?(options.welcomeRightFunction):(null);
		this.byebyeLeftFunction = (options.byebyeLeftFunction)?(options.byebyeLeftFunction):(null);
		this.byebyeRightFunction = (options.byebyeRightFunction)?(options.byebyeRightFunction):(null);
		this.completedAnimation = function(inverse){
			stateMachine.animationCounter--;
			if(stateMachine.animationCounter<1){
				this.completeAllAnimation(inverse);
			}
		}
		this.completeAllAnimation = function(inverse){
			var autoplay = stateMachine.state.autoplay;
	  		if(inverse){
	  			if(autoplay)stateMachine.goToPrevState();
	  		}else{
	  			if(autoplay)stateMachine.goToNextState();
	  		}
	  		if(!autoplay){
	  			stateMachine.onAnimation = false;
	  		}
	  		if(stateMachine.state.welcomeLeftFunction && !inverse){
	  			stateMachine.state.welcomeLeftFunction();
	  		}
	  		if(stateMachine.state.welcomeRightFunction && inverse){
	  			stateMachine.state.welcomeRightFunction();
	  		}
		}

		this.goToNext = function(){
			
			if(stateMachine.state.byebyeRightFunction){
	  			stateMachine.state.byebyeRightFunction();
	  		}

			for(var i=0;i<this.animatedProperties.length; i++){
				var animationProperty = this.animatedProperties[i];
				var animationType = animationProperty.animationType;
				stateMachine.animationCounter++;

				switch(animationType){
			  		case AnimationType.TopDown:
							animationProperty.animate('top',300,100,0, "swing");
			  			break;
			  		case AnimationType.UpCar:
			  				animationProperty.animate('top',300,40,0, "swing");
			  			break;
			  		case AnimationType.ZoomInCar:
			  				animationProperty.animate('background-size',300,200,75, "swing");
						break;
			  		case AnimationType.RotateCars:
			  				animationProperty.animate('transform',500,0,180, "swing");
			  			break;
			  		case AnimationType.ZoomOutCar:
			  				animationProperty.animate('background-size',200,75,200, "swing");
			  			break;
			  		case AnimationType.ShowHome:
			  				animationProperty.animate('opacity',100,0,1, "linear");
			  			break;
			  	}
			}
		}
		this.goToPrev = function(){
			if(stateMachine.state.byebyeLeftFunction){
	  			stateMachine.state.byebyeLeftFunction();
	  		}
			for(var i=0;i<this.animatedProperties.length; i++){
				var animationProperty = this.animatedProperties[i];
				var animationType = animationProperty.animationType;
				stateMachine.animationCounter++;
				switch(animationType){
			  		case AnimationType.TopDown:
							animationProperty.animate('top',100,0,100, "swing", true);
			  			break;
			  		case AnimationType.UpCar:
			  				animationProperty.animate('top',100,0,40, "swing",true);
			  			break;
			  		case AnimationType.ZoomInCar:
			  				animationProperty.animate('background-size',100,75,200, "swing", true);
						break;
			  		case AnimationType.RotateCars:
			  				animationProperty.animate('transform',100,180,0, "swing", true);
			  			break;
			  		case AnimationType.ZoomOutCar:
			  				animationProperty.animate('background-size',200,200,75, "swing", true);
			  			break;
			  		case AnimationType.ShowHome:
			  				animationProperty.animate('opacity',100,1,0, "linear",true);
			  			break;
			  	}
			}
		}
	}

	var stateMachine = new StateMachine();
    $(document).keydown(function(e){
	    switch(e.which) {
	        case 37: // left
	        	break;
	        case 38: // up
	        	//goToPrev();
	        	stateMachine.goToPrevState();
	        	break;
	        case 39: // right
	        	break;
	        case 40: // down
	        	//goToNext();
	        	stateMachine.goToNextState();
	        	break;
	        default: return; //exit this handler for other keys
	    }
	    e.preventDefault(); //prevent the default action (scroll / move caret)
	});
	if (window.addEventListener) {
		// IE9, Chrome, Safari, Opera
		window.addEventListener("mousewheel", onScroll, false);
		// Firefox
		window.addEventListener("DOMMouseScroll", onScroll, false);
	}
	// IE 6/7/8
	else window.attachEvent("onmousewheel", onScroll);
	function onScroll(e) {
		var e = window.event || e; // old IE support
		var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
		if(Date.now() - lastScrollRefresh > 1){
			if(!stateMachine.onAnimation){
				if(delta > 0){
					//goToPrev();
					stateMachine.goToPrevState();
				}else if(delta < 0){
					//goToNext();
					stateMachine.goToNextState();
				}
			}
			lastScrollRefresh = Date.now();
		}
	}
});