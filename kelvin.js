/*
*	Kelvin Prototype version 0.0.3 by Asraelite.
*	GNU/GPL License.
*/

var assets = {},
	draw_cache = {},
	rotation = 0
	
var view = {
	x: 0,
	y: 0,
	zoom: 16
}

var world = {
	ships : {}
}

window.requestAnimFrame = (function(){
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame || function( callback ){
		window.setTimeout(callback, 1000 / 60);
	};
})();

String.prototype.hash = function(){ // Thanks to esmiralha for dis.
	var hash = 0, i, char;
	if (this.length == 0) return hash;
	for (i = 0, l = this.length; i < l; i++){
		char  = this.charCodeAt(i);
		hash  = ((hash << 5) - hash) + char;
		hash |= 0;
	}
	return hash;
}

function animate(){
	requestAnimFrame(animate);
	tick();
	print();
}

function loadAssets(requested, callback){
	to_load = 0;
	loaded = 0;
	var assetLoad = function(){
		if(++loaded >= to_load) callback();
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
				parent[i].onload = assetLoad;
			}
		}
	}
	loopSection(assets, requested);
}

function tileData(data){
	var w = 0;
	var h = data.length;
	var result = [];
	
	for(var row in data){
		result.push([]);
		w = Math.max(w, data[row].length);
		for(var cell in data[row]){
			var t = data[row][cell];
			result[result.length - 1].push(t !== false ? {img: 'a' + t} : false);
		}
	}
	
	return {tiles: result, width: w, height: h};
}

function Ship(){
	
}

function getDrawData(data){
	if(!(data.tiles && data.width && data.height)) return false;
	var cache = draw_cache[JSON.stringify(data).hash()];
	if(cache) return cache;
	
	var tile = function(x, y){
		return (x < 0 || x >= data.width || y < 0 || y >= data.height) ? false : (data.tiles[y] ? (data.tiles[y][x] !== false ? true : false) : false);
	}
	
	var line = function(x, y, w, h){
		dummy_ctx.strokeStyle = '#fff';
		dummy_ctx.beginPath();
		dummy_ctx.moveTo(x, y);
		dummy_ctx.lineTo(x + w, y + h);
		dummy_ctx.stroke();
		dummy_ctx.closePath();
	}
	
	dummy.width = data.width * 16;
	dummy.height = data.height * 16;
	dummy_ctx.clearRect(0, 0, data.width, data.height);
	
	for(var y in data.tiles){
		for(var x in data.tiles[y]){
			var t = data.tiles[y][x];
			if(tile(x, y)){
				dummy_ctx.drawImage(assets.tiles[t.img] || assets.tiles.missing, x * 16, y * 16);
				if(!tile(+x - 1, +y)) line(x * 16, y * 16, 0, 16);
				if(!tile(+x, +y - 1)) line(x * 16, y * 16, 16, 0);
				if(!tile(+x + 1, +y)) line(x * 16 + 16, y * 16, 0, 16);
				if(!tile(+x, +y + 1)) line(x * 16, y * 16 + 16, 16, 0);
			}
		}
	}
	
	console.log(tile(-1, 1));
	
	var output = {img: new Image(), width: data.width, height: data.height};
	output.img.src = dummy.toDataURL();
	draw_cache[JSON.stringify(data).hash()] = output;
	return output;
}

window.onload = function(){
	canvas = document.getElementById('game');
	context = canvas.getContext('2d');
	context.webkitImageSmoothingEnabled = false;
	dummy = document.getElementById('dummy');
	dummy_ctx = dummy.getContext('2d');
	
	loadAssets(assets_to_load, function(){
		var x = false;
		ship = [[x,0,6,6,6,6,0,x], 
				[0,0,4,4,4,4,0,0],
				[0,4,4,4,4,4,4,0],
				[6,4,4,4,4,4,4,6],
				[6,4,4,4,4,4,4,6],
				[0,4,4,4,4,4,4,0],
				[0,0,4,4,4,4,0,0],
				[x,0,0,1,1,0,0,x]
			   ];
		ship = tileData(ship);
		
		animate();
	});
};

function tick(){
	this.last = this.now || new Date().getTime();
	this.now = new Date().getTime();
	this.delta = this.now - this.last;
	var speed = this.delta / (1000 / 60);
}

function drawRotated(img, x, y, width, height, rot){
	x += (canvas.width / 2) / view.zoom;
	y += (canvas.height / 2) / view.zoom
	
	context.save();
	context.translate(x, y);
	context.rotate(rot);
	context.drawImage(img, -width / 2, -height / 2, width, height);
	context.restore();
}

function print(){
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.drawImage(assets.stars, 0, 0);
	
	context.save();
	context.scale(view.zoom, view.zoom);
	
	rotation += 0.005;
	
	var entity = getDrawData(ship);
	drawRotated(entity.img, view.x, view.y, entity.width, entity.height, rotation);
	
	context.restore();
}
