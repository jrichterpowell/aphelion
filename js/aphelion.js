var univ;
var ship;
var startPlanet;
var mouse = new Point();
mouse['down'] = false;
mouse['scrolled'] = false;

function launchGame(){
	document.getElementById('IntroOverlay').style.display = 'none';
	var canvas = document.getElementById('myCanvas');
	var scope2 = new PaperScope();
	scope2.activate();
	canvas.onwheel = (event) => handleScroll(event, mouse);
	paper.setup(canvas);
	univ = new Universe();
	startPlanet = new Planet(new Point(), 'red', 1000);
	startPlanet.glow.visible = false;

	//var initialVelocity = new Point(0, Math.sqrt(univ.gravitationConstant*startPlanet.mass/1200));
	var initialVelocity = new Point(0, 100);
	ship = new Ship(startPlanet.bounds.rightCenter.add([2000,0]), initialVelocity);
	view.center = startPlanet.position;
	view.zoom = 0.001;

	project.importSVG("assets/rocket.svg", {onLoad:sprite=>{
		sprite.fillColor = 'white';
		ship.loadSprite(sprite);
		view.draw();
		univ.initUniverse();
		univ.chunks[0] = [startPlanet];
		defViewMethods(view,univ);
	}, insert:true});
}

//GLOBALS
function defViewMethods(view, univ){
	view.onMouseMove = function(event){
		mouse.x = event.point.x;
		mouse.y = event.point.y;
	}

	view.onMouseDown = function(event){
		mouse.down = true;
	}
	view.onMouseUp = function(event){
		mouse.down = false;
		ship.hideExhaust();
	}

	view.onFrame = function(event){
		//check if ship is loaded
		if(ship.sprite == 'placeholder'){
			return
		}
		//intro zoom animation
		if(event.count < 500 && !mouse.scrolled){
			view.zoom += 1e-4;
		}

		//update
		univ.updateGravity()
		univ.updatePosition()
		univ.animatePlanets(event.time);
		if (event.count % 5 === 0){
			univ.updatePhysObjs(ship);
			univ.generateUniverse(ship);
			ship.updateTrail();
		}

		//fixes drift due to lack of mouse updates
		var delta = view.center.subtract(ship.position);
		view.center = ship.position;
		mouse.x -= delta.x;
		mouse.y -= delta.y;

		ship.updateRotation(mouse);
		ship.applyThrottle(mouse);
		ship.detectCollision(univ,startPlanet);

		document.getElementById('fuelText').innerHTML = "Fuel: " + ship.fuel.toFixed(3);
		if(ship.fuel < 10){
			document.getElementById('fuelText').style.color = 'red';
		}
		document.getElementById('distanceText').innerHTML = "Distance: " + ship.position.getDistance(startPlanet.position).toFixed(3);			
		document.getElementById('fpsText').innerHTML = "Fps: " + (1/event.delta).toFixed(3);
		
	}
}

function handlePause(){
	view.pause();
	document.getElementById("PauseOverlay").style.display = "block";
}

function handleResume(){
	view.play();
	document.getElementById("PauseOverlay").style.display = "none";
}

function handleStart(){
	view.play();
	document.getElementById("IntroOverlay").style.display = "none";
}

function handleScroll(event, mouse){
	event.preventDefault();
	mouse.scrolled = true;
	var scaleFac = 1 - event.deltaY/100;
	//don't zoom if we're already too close or too far
	if((view.zoom < 0.01 && scaleFac < 1) || (view.zoom > 2 && scaleFac > 1) ){
		return;
	}
	view.scale(scaleFac, mouse);
	
}

function clamp(number, lower, upper){
	if(number > upper){ return upper; }
	else if (number < lower){ return lower; }
	return number
}

