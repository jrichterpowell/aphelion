//LOAD function

const GRAVITY_RANGE = 20000;


paper.install(window);
window.onload = function(){
	var canvas = document.getElementById('myCanvas');
	paper.setup(canvas);
	view.zoom = 0.05;
	
	var univ = new Universe();
	var ship = undefined;
	var startPlanet = undefined;
	var mouse = new Point();
	mouse['down'] = false;

	window.onscroll = (event) =>{
	var deltaScroll = this.scrollY - this.oldScroll;
	if(!isNan(deltaScroll)){
		view.zoom += deltaScroll/1000;
	}
	this.oldScroll = this.scrollY;

	};
	//debugger;



	project.importSVG("assets/rocket.svg", {onLoad:x=>{
		startPlanet = univ.chunks.get((new Point()).toString()).objects[0]
		univ.physObjs.push(startPlanet);

		ship = x;
		//ship = new Path.Rectangle(new Point(startPlanet.position.x+1500, startPlanet.position.y), [100,100]);
		ship.scale(0.35,0.35);
		ship.position = new Point(startPlanet.position.x+1500, startPlanet.position.y);
		ship.physical = true;
		ship.mass = 1e-1;
		ship.fuel = 0;
		ship.vel = new Point(0,16);
		ship.applyMatrix = false;
		ship.throttleCoefficient = 1e-4;
		ship.effectedByGrav = true;
		ship.trail = new Path();
		ship.trail.strokeColor = 'red';
		ship.trail.strokeWidth = 10;
		ship.fillColor = 'white';

		ship.hitbox = ship.bounds;
		project.activeLayer.addChild(ship);
		univ.physObjs.push(ship);

		ship.updateRotation = () => {
			ship.rotation = -Math.atan2(mouse.x -ship.position.x, mouse.y-ship.position.y)*180/Math.PI + 135;
		}

		ship.updateTrail = () => {
			ship.trail.add(ship.position);

			if(ship.trail.segments.length > 50){
				ship.trail.segments.shift();
			}
		}

		ship.applyThrottle = () => {
			if(mouse.down && ship.fuel > 0.1){
				var direction = new Point(mouse.x-ship.position.x, mouse.y-ship.position.y);
				ship.vel = ship.vel.add(direction.multiply(ship.throttleCoefficient));
				ship.fuel -= 0.75;
				document.getElementById("fuelText").style.color = "white";
			}
		}
		ship.detectCollision = () => {
			var planets = Array.from(univ.chunks, ([key, value]) => value).map(value => value.objects);
			planets = planets.flat()

			planets.forEach(planet =>{
				if (planet.sprite.bounds.intersects(ship.bounds)){
					view.pause();
					document.getElementById("DeathOverlay").style.display = "block";
				}
			})
			planets.forEach(planet =>{
				if (planet.glow.bounds.intersects(ship.bounds) && planet.glow.visible == true){
					document.getElementById("fuelText").style.color = "#4caf50";
					ship.fuel += 100;
					planet.glow.visible = false;
				}
			})

		}

		view.draw();
	}, insert:true});
	

	view.onMouseMove = function(event){
		mouse.x = event.point.x;
		mouse.y = event.point.y;
	}

	view.onMouseDown = function(event){
		mouse.down = true;
		ship.fillColor = 'red';
	}
	view.onMouseUp = function(event){
		mouse.down = false;
		ship.fillColor = 'white';
	}

	view.onFrame = function(event){
		//update
		univ.updateGravity()
		univ.updatePosition()
		univ.generateUniverse()

		if(typeof ship !== 'undefined'){
			//clean this
			var delta = view.center.subtract(ship.position);
			view.center = ship.position;
			mouse.x -= delta.x;
			mouse.y -= delta.y;

			ship.updateRotation();
			ship.applyThrottle();
			ship.detectCollision();

			if (event.count % 5 === 0){
				ship.updateTrail();
			}

			document.getElementById('fuelText').innerHTML = "Fuel: " + ship.fuel.toFixed(3);
			if(ship.fuel < 10){
				document.getElementById('fuelText').style.color = 'red';
			}
			document.getElementById('distanceText').innerHTML = "Distance: " + ship.position.getDistance(startPlanet.position).toFixed(3);			
			document.getElementById('fpsText').innerHTML = "Fps: " + (1/event.delta).toFixed(3);
		}
		
	}
}

//GLOBALS

function handlePause(){
	view.pause();
	document.getElementById("IntroOverlay").style.display = "block";
}

function handleResume(){
	view.play();
	document.getElementById("IntroOverlay").style.display = "none";;
}




debugger;
