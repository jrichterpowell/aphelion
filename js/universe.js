//Universe class applies global physics to the planets, stars, quasars, etc.
class Universe {
	constructor(){
		this.physObjs = [];
		this.gravitationConstant = 5e-2;
		this.gravityRange = 20000;
		this.stars = [];
		this.gasses = [];
		this.chunks = new Map()
		this.chunkSize = 20000;
		this.planetSeparation = 10000; //enforce minimum distance between planets
		this.planetColors = ["#A93226","#CB4335", "#884EA0","#7D3C98", "#2471A3", "#2E86C1", "#17A589","#138D75", "#229954","#28B463","#D4AC0D", "#D68910", "#CA6F1E", "#BA4A00", "#D0D3D4", "#A6ACAF", "#839192"]
	}

	//Update list of objects close enough to the ship to exert gravitational influence
	updatePhysObjs(ship){
		var allObjs = Array.from(this.chunks.values()).map(x => x.objects).flat();;
		this.physObjs = allObjs.filter(x => x.position.getDistance(ship.position) < this.gravityRange);
		this.physObjs.push(ship);
	}

	updateGravity(){
		var self = this;
		self.physObjs.forEach(obj1 =>{
			self.physObjs.filter(x=> (x != obj1) && (x.effectedByGrav)).forEach(obj2 =>{
				var distance = obj1.position.getDistance(obj2.position,false);

				//compute the effect of obj1 ON obj2
				var scalar = -1* obj1.mass / (distance * 2) * self.gravitationConstant;
				var gravVec = obj2.position.subtract(obj1.position);
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

	generateUniverse(){
		var curChunk = new Point(view.center.divide(this.chunkSize));
		curChunk = curChunk.round();

		var visibleChunks = [
		curChunk,
		curChunk.add(-1,0),
		curChunk.add(-1,-1),
		curChunk.add(0,-1),
		];

		//check if the chunks in a quadrant centered around the player have been generated, and if not, generate them.
		visibleChunks.forEach(index => {
			if(!(this.chunks.has(index.toString()))){
				this.chunks.set(index.toString(), this.generateChunk(index));
				//this.chunks.forEach(chunk => chunk.background.forEach(child => project.activeLayer.insertChild(0, child)));
			}
		})
	}

	generateChunk(location){
		//Eventually this will change based on how far from the origin we are
		var chunk = new Chunk();

		//generate the stars for the background
		var starPath = new Path.Circle([0,0], 25);
		starPath.fillColor= { gradient: { 
			stops: [[new Color(1,1,1,1), 0.0], [new Color(1,1,1,0), 1]],
			radial:true},
			origin: starPath.position,
			destination: starPath.bounds.rightCenter
		};

		var star = new Symbol(starPath);
		//place stars
		for(var i = 0; i < chunk.numStars; i++){
			//find a random point in the new chunk
			var pos = (Point.random().subtract(0.5)).multiply(this.chunkSize * 2).add(this.chunkSize/2).add(location.multiply(this.chunkSize));
			var placed = star.place(pos);
			chunk.background.addChild(placed);
			placed.remove();
		}
		var rasterbg = chunk.background.rasterize();
		rasterbg.position = location;
		chunk.background.remove();

		project.activeLayer.insertChild(0, rasterbg);

		//generate the planets
		for(var i = 0; i< chunk.numPlanets; i++){
			//find a random point in the new chunk, making sure not to be within the separation boundary of the other planets
			var pos = (Point.random().subtract(0.5)).multiply((this.chunkSize-this.planetSeparation) * 2).add(this.chunkSize/2).add(location.multiply(this.chunkSize));
			while( chunk.objects.length > 0 && (Math.min(chunk.objects.map(obj => obj.position.getDistance(pos))) < this.planetSeparation)){
				pos = (Point.random().subtract(0.5)).multiply((this.chunkSize-this.planetSeparation) * 2).add(this.chunkSize/2).add(location.multiply(this.chunkSize));
			}

			var radius = Math.random()*100 + 200;
			var color = this.planetColors[Math.floor(Math.random() * this.planetColors.length)]
			var planet = new Planet(pos, color,radius);
			chunk.objects.push(planet);
		}

		return chunk;

	}
}

class Chunk{
	constructor(){
		this.objects = []
		this.background = new Layer();
		this.position = new Point();
		this.numStars = 1000;
		this.numPlanets = 3;
	}
}