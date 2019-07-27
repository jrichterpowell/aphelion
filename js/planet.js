class Planet{

	constructor(position,color,radius){
		this.sprite = new Path.Circle(position, radius);
		this.sprite.strokeColor = 'white';
		this.sprite.fillColor = color;
		this.vel = new Point();
		this.mass = 1e4;
		this.physical = true;
		this.effectedByGrav = false;

		//spacing options
		this.origin = new Point();
		this.minDist = 3000;
		this.maxDist = 10000;

		//glow options
		this.fuelUp = radius * 0.1;
		this.glow = new Path.Circle(this.position, radius*5);
		this.glow.fillColor = {
			gradient:{
			stops: [[color, 0], [ new Color(0,0,0,0),1]],
			radial: true
			},
			origin: this.position,
			destination: this.glow.bounds.rightCenter
		};	
	}

	get position(){
		return this.sprite.position;
	}

	reproduce(avoidList=[this.origin]){
		var location = this.position;
        var distanceToOrigin = location.getDistance(this.origin);
        var parentDistanceToOrigin = this.position.getDistance(this.origin);
        var minAvoid = Math.min(avoidList.map(obj => obj.position.getDistance(location)))
        while(location.getDistance(this.position) < this.minDist || minAvoid < this.minDist || distanceToOrigin < parentDistanceToOrigin){
            var location = Point.random().subtract(0.5).multiply(this.maxDist*2);
            location = location.add(this.sprite.position);
            distanceToOrigin = location.getDistance(this.origin);
            minAvoid = Math.min(avoidList.map(obj => obj.position.getDistance(location)))
        }
        return new Planet(location, this.sprite.fillColor, 200);
	}
	//move the planet sprite which we use as the source for the position data
	translate(pos){
		this.sprite.translate(pos);
	}


}