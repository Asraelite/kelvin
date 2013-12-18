/*
	Kelvin Prototype version 0.0.1 by Asraelite.
	GNU/GPL License.
*/

var assets = {};
var view = {
	x: 0,
	y: 0,
	zoom: 16
}

window.requestAnimFrame = (function(){
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame || function( callback ){
		window.setTimeout(callback, 1000 / 60);
	};
})();

function animate(){
	requestAnimFrame(animate);
	tick();
	print();
}

function loadAssets(requested, callback){
	var to_load = 0;
	var loaded = 0;
	var assetLoad = function(){
		if(loaded++ >= to_load) callback();
	}
	
	// This loops through all items in requested assets and uses recursion to retain their categories.
	var loopSection = function(parent, obj){
		for(var i in obj){
			if(typeof obj[i] == 'object'){
				parent[i] = {};
				loopSection(parent[i], obj[i]);
			}else{
				parent[i] = new Image();
				parent[i].src = 'assets/' + obj[i];
				to_load++;
				parent[i].onload = assetLoad();
			}
		}
	}
	loopSection(assets, requested);
}

window.onload = function(){
	canvas = document.getElementById('game');
	context = canvas.getContext('2d');
	
	loadAssets(assets_to_load, function(){
		console.log('Assets loaded');
	});
	
	animate();
}

window.tick = function(){
	this.last = this.now || new Date().getTime();
	this.now = new Date().getTime();
	this.delta = this.now - this.last;
	var speed = this.delta / (1000 / 60);
	
	view.zoom = Math.abs(Math.sin(this.now / 1000) * 100);
}

window.print = function(){
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	for(var x = 0; x < 20; x++){
		for(var y = 0; y < 20; y++){
			context.save();
			context.scale(view.zoom, view.zoom);
			context.webkitImageSmoothingEnabled = false;
			context.drawImage(assets.tiles.a1, (x + view.x), (y + view.y), 1, 1);
			context.restore();
		}
	}
}
