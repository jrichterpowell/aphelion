//Universe class applies global physics to the planets, stars, quasars, etc.
class Universe {
	constructor(){
		this.physObjs = [];
		this.gravitationConstant = 5e-2;
		this.stars = [];
		this.gasses = [];
		this.chunks = new Map()
		this.chunkSize = 20000;
		this.planetSeparation = 10000; //enforce minimum distance between planets
		this.planetColors = ["#A93226","#CB4335", "#884EA0","#7D3C98", "#2471A3", "#2E86C1", "#17A589","#138D75", "#229954","#28B463","#D4AC0D", "#D68910", "#CA6F1E", "#BA4A00", "#D0D3D4", "#A6ACAF", "#839192"]
	}

	updateGravity(){
		this.physObjs.forEach(obj1 =>{
			this.physObjs.filter(x => (x != obj1) && (x.effectedByGrav)).forEach(obj2 =>{
				var distance = obj1.position.getDistance(obj2.position,false);

				//don't compute gravity for objects far away
				if(distance > GRAVITY_RANGE){
					return
				}

				//otherwise compute the effect of obj1 ON obj2
				var scalar = -1* obj1.mass / (distance * 2) * this.gravitationConstant;
				var gravVec = obj2.position.subtract(obj1.position);
				gravVec = gravVec.divide((new Point()).getDistance(gravVec));
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

		visibleChunks.forEach(index => {
			if(!(this.chunks.has(index.toString()))){
				this.chunks.set(index.toString(), this.generateChunk(index));
				this.chunks.forEach(chunk => chunk.background.forEach(child => project.activeLayer.insertChild(0, child)));
			}
		})
	}

	generateChunk(location){
		//Eventually this will change based on how far from the origin we are
		var chunk = new Chunk();

		//generate the background pane
		var backgroundColor = new Path.Rectangle(new Rectangle(
			location.multiply(this.chunkSize),
			new Size(this.chunkSize).add(10)
			));
		backgroundColor.fillColor = "#17202A";
		chunk.background.push(backgroundColor);
		backgroundColor.remove();


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
		/*for(var i = 0; i < chunk.numStars; i++){
			//find a random point in the new chunk
			var pos = (Point.random().subtract(0.5)).multiply(this.chunkSize * 2).add(this.chunkSize/2).add(location.multiply(this.chunkSize));
			var placed = star.place(pos);
			chunk.background.push(placed);
			placed.remove();
		}*/

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
		this.physObjs = this.physObjs.concat(chunk.objects);

		return chunk;


	}
}

class Chunk{
	constructor(){
		this.objects = []
		this.background = []
		this.position = new Point();
		this.numStars = 100;
		this.numPlanets = 3;
	}
}