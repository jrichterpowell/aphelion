//Universe class applies global physics to the planets, stars, quasars, etc.
class Universe {
	constructor(){
		this.gravitationConstant = 5e-1;
		this.gravityRange = 20000;
		this.stars = [];
		this.gasses = [];
		this.objects = [];
		this.physObjs = [];
		this.planetColors = ["#A93226","#CB4335", "#884EA0","#7D3C98", "#2471A3", "#2E86C1", "#17A589","#138D75", "#229954","#28B463","#D4AC0D", "#D68910", "#CA6F1E", "#BA4A00", "#D0D3D4", "#A6ACAF", "#839192"]
	}

	//Update list of objects close enough to the ship to exert gravitational influence
	updatePhysObjs(ship){
		this.physObjs = this.objects.filter(x => x.position.getDistance(ship.position) < this.gravityRange);
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
			if(x.constructor.name == 'Planet'){
				x.sprite.translate(x.vel)
			}
			else{
				x.translate(x.vel);
			}
		})
	}

	generateUniverse(){}

	generatePlanets(firstPlanet){
		//inductively generates planets
		var p = firstPlanet;
		for(var i = 0; i< 10; i++){
			this.objects.push(p);
			p = p.reproduce();
		}
			

	}
}