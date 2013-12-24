/*
*	Kelvin Prototype version 0.0.8 build 8 by Asraelite.
*	GNU/GPL License.
*/
	
var	c1 = 125;
var	c2 = 200;

var assets = {},
	draw_cache = {},
	rotation = 0
	
var view = {
	x: 0,
	y: 0,
	zoom: 16
}

var world = {
	ships : {},
	objects: {},
	cellestials: {},
	players: {}
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

function colorHull(img, color){
	// Modified version of Ken Fyrstenberg's code http://stackoverflow.com/questions/20748259/
	var hsl2rgb = function(h, s, l){
		var r, g, b, q, p;
		h /= 360;
		
		if(s == 0){
			r = g = b = l;
		}else{
			var hue2rgb = function(p, q, t) {
				if (t < 0) t++;
				if (t > 1) t--;
				if (t < 1 / 6) return p + (q - p) * 6 * t;
				if (t < 1 / 2) return q;
				if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
				return p;
			}
			
			q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			p = 2 * l - q;
			
			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}
		
		return {
			r: r * 255,
			g: g * 255,
			b: b * 255};
	}
		
	dummy_ctx.clearRect(0, 0, dummy_ctx.width, dummy_ctx.height);
	dummy_ctx.width = img.width;
	dummy_ctx.height = img.height;
	dummy_ctx.drawImage(img, 0, 0);
	
	var angle = parseInt(color, 10),
        idata = dummy_ctx.getImageData(0, 0, img.width, img.height),
        data = idata.data,
        len = data.length,
        i = 0;
    
    for(;i < len; i += 4){
        var lum = data[i] / 255;
        col = hsl2rgb(angle, 1, lum);
        
        data[i] = col.r;
        data[i+1] = col.g;
        data[i+2] = col.b;
    }
	
    dummy_ctx.putImageData(idata, 0, 0);
	// End of his code
	
	var result = new Image();
	result.src = dummy.toDataURL();
	return result;
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

function blankTileData(tier, parts){
	var w = tier_data.sizes[tier].width || 0;
	var h = tier_data.sizes[tier].height || 0;
	var result = [];
	
	for(var row = 0; row < h; row++){
		for(var cell = 0; cell < w; cell++){
			
		}
	}
	
	return false;
}

function getCenterOfMass(data){
	try{
		return {x: data[0].length / 2, y: data.length / 2}; // Approximation for now, assuming data is a perfect rectangle
	}catch(e){
		console.error(e);
	}
}

function Ship(tier, name, owner, faction, hull, col1, col2, rooms, wiring, roof, mounts, x, y){
	this.tier = tier || 'shuttle';
	this.name = name || 'Crag';
	this.faction = faction || ['SLF', ''];
	this.build = {hulls: hull, rooms: rooms, roof: roof};
	this.com = getCenterOfMass(this.build.rooms);
	this.mounts = mounts;
	this.col1 = col1;
	this.col2 = col2;
	this.x = x || 0;
	this.y = y || 0;
	this.rot = 0;
	this.rotvel = 0;
	this.xvel = 0;
	this.yvel = 0;
	this.boundaries = [];
	this.owner = owner || false;
	this.objects = {};
}

function getShipDrawData(ship){
	if(!(ship instanceof Ship)) return false;
	var cache = draw_cache[JSON.stringify(ship.build).hash()];
	if(cache) return cache;
	
	dummy.width = tier_data.sizes[ship.tier].width * 16;
	dummy.height = tier_data.sizes[ship.tier].height * 16;
	dummy_ctx.clearRect(0, 0, dummy.width, dummy.height);
	
	var printFloor = function(floor_data){
		dummy_ctx.clearRect(0, 0, dummy_ctx.width, dummy_ctx.height);
		for(var row = 0; row < floor_data.length; row++){
			for(var col = 0; col < floor_data[row] ? floor_data[row].length : 0; col++){
				if(floor_data[row][col]) dummy_ctx.drawImage(assets.tiles.blank);
			}
		}
		var result = new Image;
		result.src = dummy.toDataURL();
		return result;
	}
	
	// Draw hull, coloured
	var hull_parts = [];
	var bld = ship.build.hulls;
	for(var i in bld){
		var part = assets.hulls[ship.tier][i][bld[i]]; // Gets e.g. assets.hulls.shuttle.bow.canary
		hull_parts.push(ship.col1 ? colorHull(part[0], ship.col1) : part[0]);
		hull_parts.push(ship.col2 ? colorHull(part[1], ship.col2) : part[1]);
		hull_parts.push(printFloor(ship_hulls[ship.tier][i][bld[i]].floor));
	}
	
	for(var i in hull_parts){
		dummy_ctx.drawImage(hull_parts[i], 0, 0);
	}
	
	var tile = function(x, y){
		return (x < 0 || x >= data.width || y < 0 || y >= data.height) ? false : (data.tiles[y] ? (data.tiles[y][x] !== false ? true : false) : false);
	}
	
	var line = function(x, y, w, h){
		dummy_ctx.strokeStyle = '#000';
		dummy_ctx.beginPath();
		dummy_ctx.moveTo(x, y);
		dummy_ctx.lineTo(x + w, y + h);
		dummy_ctx.stroke();
		dummy_ctx.closePath();
	}
	
	var hullParts = [colorHull(assets.hulls.shuttle.bow.canary[0], c1),
					colorHull(assets.hulls.shuttle.bow.canary[1], c2),
					colorHull(assets.hulls.shuttle.stern.canary[0], c1),
					colorHull(assets.hulls.shuttle.stern.canary[1], c2)]
	
	for(var i in hullParts) dummy_ctx.drawImage(hullParts[i], 0, 0);
	
	for(var y in data.tiles){
		for(var x in data.tiles[y]){
			var t = data.tiles[y][x];
			if(tile(x, y) && false){
				x = +x;
				y = +y;
				dummy_ctx.drawImage(assets.tiles[t.img] || assets.tiles.missing, x * 16, y * 16);
				if(!tile(x - 1, y)) line(x * 16 - 0.5, y * 16, 0, 16);
				if(!tile(x, y - 1)) line(x * 16, y * 16 - 0.5, 16, 0);
				if(!tile(x + 1, y)) line(x * 16 + 16.5, y * 16, 0, 16);
				if(!tile(x, y + 1)) line(x * 16, y * 16 + 16.5, 16, 0);
			}
		}
	}
	
	//var output = {img: new Image(), width: data.width, height: data.height};
	var output = {img: new Image(), width: 16, height: 30};
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
		ship = new Ship('shuttle', 'KPS-1 Canary', false, false, {bow: 'canary', stern: 'canary'}, 0, 0, false, false, false, {}, 0, 0);
		
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
	
	var entity = getShipDrawData(ship);
	!entity || drawRotated(entity.img, view.x, view.y, entity.width, entity.height, rotation);
	
	context.restore();
}
