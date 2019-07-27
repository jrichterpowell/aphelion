class Ship{
	constructor(pos=new Point(),vel=new Point()){
		this.physical = true;
		this.mass = 1e-5;
		this.fuel = 0;
		this.fuelUse = 0.75;
		this.vel = vel;
		this.throttleCoefficient = 5e-5;
		this.effectedByGrav = true;
		this.trail = new Path();
		this.trail.strokeColor = 'red';
		this.trail.strokeWidth = 10;
		this.deltaV = vel.length;
		this._position = pos;

		//placeholder until the svg loads
		this.sprite = "placeholder";
	}
	//pass the methods through to the sprite object
	set position(pos){
		if(this.sprite == 'placeholder'){
			this._position = pos
		}
		else{
			this.sprite.position = pos;
		}	
	}

	get position(){
		if(this.sprite == 'placeholder'){
			return this._position;
		}
		else{
			return this.sprite.position;
		}
	}

	set fillColor(color){
		this.sprite.fillColor = color;
	}
	get fillColor(){
		return this.sprite.fillColor;
	}
	get bounds(){
		return this.sprite.bounds;
	}
	updateRotation(mouse) {
		this.sprite.rotation = -Math.atan2(mouse.x -this.position.x, mouse.y-this.position.y)*180/Math.PI + 180;
	}

	updateTrail() {
		this.trail.add(this.position);

		if(this.trail.segments.length > 50){
			this.trail.segments.shift();
		}
	}

	applyThrottle(mouse){
		if(mouse.down && this.fuel >= this.fuelUse){
			var direction = new Point(mouse.x-this.position.x, mouse.y-this.position.y);
			this.deltaV += this.vel.add(direction.multiply(this.throttleCoefficient)).length;
			this.vel = this.vel.add(direction.multiply(this.throttleCoefficient));
			this.fuel -= this.fuelUse;
			document.getElementById("fuelText").style.color = "white";
		}
	}
	detectCollision(univ, startPlanet){

		var planets = univ.physObjs.filter(x => x != this);

		planets.forEach(planet =>{	
			if (planet.sprite.intersects(this.sprite)){
				view.pause();
				document.getElementById("DeathOverlay").style.display = "block";
				document.getElementById("DeathTextL").innerHTML = "Final Score: " + (this.position.getDistance(startPlanet.position).toFixed(3)/this.deltaV).toFixed(3).toString();
			}
		})
		planets.forEach(planet =>{
			planet.glow.selected = true;
			if (planet.glow.intersects(this.sprite) && planet.glow.visible == true){
				document.getElementById("fuelText").style.color = "#4caf50";
				this.fuel += 100;
				planet.glow.visible = false;
			}
			planet.glow.selected = false;
		})


	}
	translate(vec){
		this.sprite.translate(vec);
	}
	loadSprite(sprite){
		sprite.position = this.position;
		this.sprite = sprite;
		this.sprite.rotate(-45);
		this.sprite.scale(0.35);
		this.sprite.applyMatrix = false;
	}
}


//debug only
function showRectangle(rect, color){
	var rect = new Path.Rectangle(rect);
	rect.fillColor = color;
	return rect;
}