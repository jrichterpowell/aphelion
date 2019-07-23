class Planet{

	constructor(position,color,radius){
		this.sprite = new Path.Circle(position, radius);
		this.sprite.strokeColor = 'white';
		this.sprite.fillColor = color;
		this.position = position;
		this.vel = new Point();
		this.mass = 1e4;
		this.physical = true;
		this.effectedByGrav = false;
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


}