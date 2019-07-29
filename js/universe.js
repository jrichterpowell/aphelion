//Universe class applies global physics to the planets, stars, quasars, etc.
class Universe {
	constructor(){
		this.gravitationConstant = 5e-2;
		this.gravityRange = 20000;
		this.stars = [];
		this.gasses = [];
		this.objects = [];
		this.physObjs = [];
		this.planetColors = ["#A93226",
		"#CB4335", "#884EA0","#7D3C98", 
		"#2471A3", "#2E86C1", "#17A589",
		"#138D75", "#229954","#28B463",
		"#D4AC0D", "#D68910", "#CA6F1E", 
		"#BA4A00", "#D0D3D4", "#A6ACAF", 
		"#839192"];
		this.numPlanets = 2;//set the number of planets per chunk
		this.minDist = 5000;
		this.chunks = [];
		this.chunkSize=5000;
	}

	//Update list of objects close enough to the ship to exert gravitational influence
	updatePhysObjs(ship){
		this.physObjs = this.chunks.flat().filter(x => x.position.getDistance(ship.position) < this.gravityRange);
		this.physObjs.push(ship);
	}

	updateGravity(){
		this.physObjs.forEach(obj1 =>{
			this.physObjs.filter(x=> (x != obj1) && (x.effectedByGrav)).forEach(obj2 =>{
				var distance = obj1.position.getDistance(obj2.position,false);

				//compute the effect of obj1 ON obj2
				var scalar = -1* obj1.mass / (distance * 2) * this.gravitationConstant;
				var gravVec = obj2.position.subtract(obj1.position);
				//scale the gravity direction vector by the constant
				gravVec = gravVec.divide(gravVec.length);
				gravVec = gravVec.multiply(scalar);

				obj2.vel = obj2.vel.add(gravVec);
			})
		});
	}
	updatePosition(){
		this.physObjs.forEach(x =>{
			x.translate(x.vel);
		})
	}

	initUniverse(){
		this.chunks[1] = [];
		for(var i = 0; i < 4; i++){
			var newPlanets = this.generatePlanets(6000, 90*i, 45);
			this.chunks[1].push(...newPlanets);
		}
	}

	generateUniverse(ship){
		var distance = ship.position.length+20000; //assumes origin is (0,0)
		var angle = ship.angle;

		var range = 450000/distance; //why does this library use degrees instead of radians :/	
		var idx = Math.floor(distance/this.chunkSize);
		if(typeof this.chunks[idx] === 'undefined'){
			this.chunks[idx] = this.generatePlanets(distance, angle, range);
		}
		/*else if(this.chunks[idx].length < this.maxPlanets){
			
		}*/

	}

	generatePlanets(radius, angle, range){
		var proposedPlanets = [];

		for(var i = 0; i < this.numPlanets; i++){
			var numFailures = 0;
			do{
				var newAngle = (Math.random()-0.5)*2*range + angle; //get an angle near the ship
				var newRadius = Math.random() + radius;
				var proposedLocation = new Point(newRadius*Math.cos(newAngle*Math.PI/180), newRadius*Math.sin(newAngle*Math.PI/180));//convert location to cartesian
				var distances = proposedPlanets.map(p => p.position.getDistance(proposedLocation));
				var minDistToOthers = Math.min(distances);
				numFailures += 1;
			}while(proposedPlanets.length > 0 && minDistToOthers < this.minDist && numFailures < 10)//reroll if we choose a point to close to another planet

			//log in the console if we failed to roll an acceptable location
			if(numFailures == 10){
				console.log("Failed to generate planet at", radius,angle, range);
				continue;
			}
			var color = this.planetColors[Math.floor(Math.random()*this.planetColors.length)];
			var newPlanet = new Planet(proposedLocation, color, 100);
			proposedPlanets.push(newPlanet);
		}
		return proposedPlanets;

	}
	
	animatePlanets(time){
		this.chunks.flat().forEach(p => p.animateGlow(time));
	}
}