/*
*	Kelvin by Asraelite ©2013. See below, line 8, for current version.
*	Github repository: https://github.com/Asraelite/Kelvin .
*	Standard GNU/GPL License.
*/
	
var	c1 = 125;
var	c2 = 200;
var version = '0.1.1 build 14'

var assets = {},
	draw_cache = {},
	rotation = 0
	
var view = {
	x: 0,
	y: 0,
	zoom: 0.0005
}

var game = {
	loc: 1,
	login: false,
	loaded: false,
	menu: {
		loc: 0,
		buttons: {}
	}
}

var input = {
	keys_held: [],
	keys_pressed: [],
	mouse_held: [],
	mouse_pressed: [],
	mouse_x: 0,
	mouse_y: 0,
	keyHeld: function(n){return input.keys_held.indexOf(n) > -1}
}

var world = {
	ships : {},
	objects: {},
	cellestials: {},
	players: {},
	camera: false,
	background: false,
	star_size: 2000
}

window.requestAnimFrame = (function(){
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame || function( callback ){
		window.setTimeout(callback, 1000 / 60);
	};
})();

window.addEventListener('keydown', function(e){
	key = e.which;
	if(input.keys_held.indexOf(key) == -1){
		input.keys_pressed.push(key);
		input.keys_held.push(key);
	}
});

window.addEventListener('keyup', function(e){
	key = e.which;
	if(input.keys_held.indexOf(key) > -1){
		input.keys_held.splice(input.keys_held.indexOf(key), 1);
	}
});

window.addEventListener('mousedown', function(e){
	key = e.button;
	if(input.mouse_held.indexOf(key) == -1){
		input.mouse_pressed.push(key);
		input.mouse_held.push(key);
	}
});

document.oncontextmenu = function(){return false;};

window.addEventListener('mouseup', function(e){
	key = e.button;
	if(input.mouse_held.indexOf(key) > -1){
		input.mouse_held.splice(input.keys_held.indexOf(key), 1);
	}
});

window.addEventListener('mousemove', function(e){
	input.mouse_x = getMouse(e).x;
	input.mouse_y = getMouse(e).y;
});

function getMouse(e){
	if(typeof canvas !== 'undefined'){
		var rect = canvas.getBoundingClientRect();
		return {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};
	}else{
		return {x: 0, y: 0};
	}
}

String.prototype.hash = function(){ // Thanks to esmiralha for dis.
	var hash = 0, i, char;
	if (this.length == 0) return hash;
	for (i = 0, l = this.length; i < l; i++){
		char = this.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash |= 0;
	}
	return hash;
}

Math.seedNum = 6;
Math.TAU = Math.PI * 2;

Math.seed = function(max, min, seed){
    max = max || 1;
    min = min || 0;
	seed = seed || Math.seedNum;
    Math.seedNum = (seed * 9301 + 49297) % 233280;
    var rnd = Math.seedNum / 233280;
	
    return min + rnd * (max - min);
}

function animate(){
	requestAnimFrame(animate);
	switch(game.loc){
		case 0:
			runMenu();
			break;
		case 1:
			tick();
			print();
			break;
	}
	input.keys_pressed = [];
	input.mouse_pressed = [];
}

function runMenu(){
	canvas.width = Math.min(Math.max(600, window.innerWidth), 1900);
	canvas.height = Math.min(Math.max(400, window.innerHeight), 1900);
	var margin_x = ((world.star_size - canvas.width) / 2) + Math.cos(new Date().getTime() / 5000 % Math.TAU) * 100,
		margin_y = ((world.star_size - canvas.height) / 2) + Math.sin(new Date().getTime() / 5000 % Math.TAU) * 100;
	!world.background || context.drawImage(world.background, (view.x / world.star_size) - margin_x, (view.y / world.star_size) - margin_y);
	
	var area = game.menu.area = game.menu.area || 0;
	switch(area){
		case 0:
			textBox('Kelvin', canvas.width / 2 - 100, 20, 200, 100, '48px');
			textBox('', canvas.width - 180, canvas.height - (!isFullScreen() ? 50 : 34), 170, !isFullScreen() ? 40 : 24);
			if(!isFullScreen()) drawText('Press F11 to go full screen', canvas.width - 95, canvas.height - 46, '#fff', '16px', 'center');
			drawText('version alpha ' + version, canvas.width - 95, canvas.height - 30, '#fff', '16px', 'center');
			drawText
			context.globalAlpha = 0.5;
			context.drawImage(assets.html5, 5, canvas.height - 55, 50, 50);
			context.globalAlpha = 1;
			button('start game', canvas.width / 2 - 50, canvas.height / 2, 100, 25, function(){
				game.loc = 1;
			});
			break;
	}
}

function generateStars(){
	dummy_ctx.clearRect(0, 0, dummy.width, dummy.height);
	dummy.width = world.star_size;
	dummy.height = world.star_size;
	dummy_ctx.fillStyle = '#000';
	dummy_ctx.fillRect(0, 0, world.star_size, world.star_size);
	dummy_ctx.fillStyle = '#fff';
	Math.seedNum = 6;
	for(var i = 0; i < world.star_size; i++){
		var size =  Math.seed(0, 1.5);
		dummy_ctx.fillRect(Math.seed(0, world.star_size), Math.seed(0, world.star_size), size, size);
	}
	var result = new Image();
	result.src = dummy.toDataURL();
	return result;
}

function colorHull(img, color, lum){
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
		
	dummy_ctx.width = img.width;
	dummy_ctx.height = img.height;
	dummy_ctx.clearRect(0, 0, dummy.width, dummy.height);
	dummy_ctx.drawImage(img, 0, 0);
	
	var angle = parseInt(color, 10),
        idata = dummy_ctx.getImageData(0, 0, img.width, img.height),
        data = idata.data,
        len = data.length,
        i = 0;
    for(;i < len; i += 4){
		var shine = ((i % img.width) + ((i / img.width) | 0)) % 30 <= 15,
			collum = (lum ? (data[i] / 255 + (lum * 2)) / 3 : data[i] / 255),
			dif = 1 - collum;
		col = hsl2rgb(angle, 1, (shine ? (1 - (dif / 1.05)): collum));
        
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

function loadAssets(requested, callback, increment){
	to_load = 0;
	loaded = 0;
	var assetLoad = function(){
		increment();
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

function blankTileData(tier, data){
	var w = tier_data.sizes[tier].width || 0;
	var h = tier_data.sizes[tier].height || 0;
	var result = [];
	
	for(var row = 0; row < h; row++){
		result.push([]);
		for(var cell = 0; cell < w; cell++){
			result[result.length - 1].push({tile: data[row][cell] > 0 ? 'a' + data[row][cell] : false, rotation: 0});
		}
	}
	
	return result;
}

function Entity(name, type, image, parent, x, y, size, rot, xvel, yvel){
	this.x = x;
	this.y = y;
	this.xvel = 0;
	this.yvel = 0;
	this.type = type;
	this.size = size;
	this.rotation = rot;
	this.img = image;
	this.parent = parent;
}

function Ship(tier, name, owner, faction, hull, color, floor, rooms, wiring, roof, mounts, x, y){
	this.tier = tier || 'shuttle';
	this.name = name || 'Crag';
	this.faction = faction || ['SLF', ''];
	this.build = {hulls: hull, floor: floor, rooms: rooms, roof: roof};
	this.mounts = mounts;
	this.color = color;
	this.x = x || 0;
	this.y = y || 0;
	this.width = tier_data.sizes[this.tier].width;
	this.height = tier_data.sizes[this.tier].height;
	this.rotation = 0;
	this.rotvel = 0;
	this.xvel = 0;
	this.yvel = 0;
	this.boundaries = [];
	this.owner = owner || false;
	this.com = {x: this.width / 2, y: this.height / 2};
	this.entities = {};
}

function tile(data, x, y){
	return data[y] ? (data[y][x] ? data[y][x].tile !== false : false) : false;
}

function getShipDrawData(ship){
	if(!(ship instanceof Ship)) return false;
	var cache = draw_cache[(JSON.stringify(ship.build) + JSON.stringify(ship.color)).hash()];
	if(cache) return cache;
	
	dummy.width = tier_data.sizes[ship.tier].width * 16;
	dummy.height = tier_data.sizes[ship.tier].height * 16;
	dummy_ctx.clearRect(0, 0, dummy.width, dummy.height);
	
	var printFloor = function(floor_data){
		dummy_ctx.clearRect(0, 0, dummy_ctx.width, dummy_ctx.height);
		for(var y = 2; y < floor_data.length; y++){
			for(var x = 0; x < floor_data[y].length; x++){
				if(floor_data[y][x]) dummy_ctx.drawImage(assets.tiles.a4, (x + floor_data[0]) * 16, (y + floor_data[1] - 2) * 16);
			}
		}
		var result = new Image;
		result.src = dummy.toDataURL();
		return result;
		dummy_ctx.clearRect(0, 0, dummy.width, dummy.height);
	}
	
	// Draw hull, coloured
	var hull_parts = [];
	var bld = ship.build.hulls;
	for(var i in bld){
		hull_parts.push(printFloor(ship_hulls[ship.tier][i][bld[i]].floor));
		var part = assets.hulls[ship.tier][i][bld[i]]; // Gets e.g. assets.hulls.shuttle.bow.canary
		hull_parts.push(ship.color.h1 ? colorHull(part[0], ship.color.h1, ship.color.l1) : part[0]);
		hull_parts.push(ship.color.h2 ? colorHull(part[1], ship.color.h2, ship.color.l2) : part[1]);
	}
	
	dummy_ctx.clearRect(0, 0, dummy.width, dummy.height);
	for(var i in hull_parts){
		dummy_ctx.drawImage(hull_parts[i], 0, 0);
	}
	
	var line = function(x, y, w, h){
		dummy_ctx.strokeStyle = '#000';
		dummy_ctx.beginPath();
		dummy_ctx.moveTo(x, y);
		dummy_ctx.lineTo(x + w, y + h);
		dummy_ctx.stroke();
		dummy_ctx.closePath();
	}
	
	dummy_ctx.clearRect(0, 0, dummy_ctx.width, dummy_ctx.height);
	for(var i in hull_parts){
		dummy_ctx.drawImage(hull_parts[i], 0, 0);
	}
	
	var rms = ship.build.rooms;
	for(var row in rms || []){
		for(var cell in rms[row]){
			var t = rms[row][cell];
			if(t && t.tile){
				dummy_ctx.drawImage(assets.tiles[t.tile], cell * 16, row * 16);
				if(!tile(rms, +cell - 1, row)) line(cell * 16 - 0.5, row * 16, 0, 16);
				if(!tile(rms, +cell + 1, row)) line(cell * 16 + 16.5, row * 16, 0, 16);
				if(!tile(rms, cell, +row - 1)) line(cell * 16 + 0.5, row * 16 - 0.5, 15, 0);
				if(!tile(rms, cell, +row + 1)) line(cell * 16 + 0.5, row * 16 + 16.5, 15, 0);
			}
		}
	}
	
	var output = {img: new Image(), width: dummy.width, height: dummy.height};
	output.img.src = dummy.toDataURL();
	draw_cache[(JSON.stringify(ship.build) + JSON.stringify(ship.color)).hash()] = output;
	return output;
}

window.onload = function(){
	canvas = document.getElementById('game');
	context = canvas.getContext('2d');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	context.webkitImageSmoothingEnabled = false;
	dummy = document.getElementById('dummy');
	dummy_ctx = dummy.getContext('2d');
	world.background = generateStars();
	
	loadAssets(assets_to_load, function(){
		game.loaded = true;
		var x = false;
		var test_hull = ['', '', '', '00000766667', '000077000077', '000070000007', '000070000007', '000070000007', 
			'000070000007', '000070000007', '000070000007', '000070000007', '000070000007', '000077000077', '00000700007', '00000700007', 
			'00000700007', '000077000077', '000070000007', '0007700000077', '0007000000007', '0007000000007', '0007700000077', '000077777777', 
			'', '', '', '', '', ''];
		world.ships.alpha = new Ship('shuttle', 'KPS-1 Canary', false, false, {bow: 'canary', stern: 'tug'}, {h1: 300, l1: 0, h2: 270, l2: 0}, false, false, false, false, {}, -200, 0);
		world.ships.beta = new Ship('shuttle', 'KPS-2 Pure Silence', false, false, {bow: 'canary', stern: 'tug'}, {h1: 100, l1: 0, h2: 140, l2: 0}, false, blankTileData('shuttle', test_hull), false, false, {}, 200, 0);
		world.objects.control = new Entity('', 2, assets.objects.control.helm.kc_a1, world.ships.beta, 128, 72, 32, 0, 0, 0);
		world.objects.guy = new Entity('', 0, assets.body_parts.human.test, world.ships.beta, 128, 80, 28, 0, 0, 0);
		// name, type, image, parent, x, y, size, rot, xvel, yvel
		animate();
		z();
	}, function(){
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		context.clearRect(0, 0, canvas.width, canvas.height);
		textBox('Loading...', 0, 0, canvas.width, canvas.height);
		context.strokeStyle = '#000';
		context.fillStyle = '#338';
		context.fillRect(canvas.width / 2 - 50, canvas.height / 2 + 20, (loaded + 1) / to_load * 100, 10);
		context.strokeRect(canvas.width / 2 - 50, canvas.height / 2 + 20.5, 100, 10);
	});
};

function tick(){
	this.last = this.now || new Date().getTime();
	this.now = new Date().getTime();
	this.delta = this.now - this.last;
	var speed = this.delta / (1000 / 60);
	canvas.width = window.innerWidth | 0;
	canvas.height = window.innerHeight | 0;
	context.webkitImageSmoothingEnabled = false;
	
	for(var i in world.ships){
		var s = world.ships[i];
		s.rotation += s.rotvel;
		s.rotation %= Math.TAU;
		s.x += s.xvel;
		s.y += s.yvel;
	}
	
	for(var i in world.objects){
		var o = world.objects[i],
			d = o.parent ? o.parent.build.rooms : false,
			check = function(r){
				r = r || d;
				var cover = o.size + 15 >> 4,
					mul = (o.size / (cover * 16)) * 16;
				for(var tx = 0; tx <= cover; tx++){
					for(var ty = 0; ty <= cover; ty++){
						ket = cover;
						if(tile(r, ((o.x + tx * mul) - o.size / 2) >> 4, ((o.y + ty * mul) - o.size / 2) >> 4)) return true;
					}
				}
				return false;
			};
			
		if(o.type != 2){
			if(d && check()){
				o.x += o.xvel * speed;
				o.y += o.yvel * speed;
			}
			o.x += o.xvel * speed;
			if(d && check()){
				o.x -= o.xvel * speed;
				o.xvel= 0;
			}
			o.y += o.yvel * speed;
			if(d && check()){
				o.y -= o.yvel * speed;
				o.yvel = 0;
			}
			
			var p = o.parent;
			if(p){
				// TODO: Implement detection if entity is still on ship floor, if not, delete parent
			}
		}else if(o.draw){
			if(input.mouse_x > o.draw.x - 50 && input.mouse_x < o.draw.x + 50 && input.mouse_y > o.draw.y - 50 && input.mouse_y < o.draw_y + 50){
				o.hover = true;
			}else{
				o.hover = false;
			}
		}
		
		if(view.camera === o){
			var rot1 = false,
				rot2 = false;
				
			if(input.keyHeld(83)){
				o.yvel = 2;
				rot1 = 0;
			}else if(input.keyHeld(87)){
				o.yvel = -2;
				rot1 = Math.PI;
			}else{
				o.yvel *= 0.5;
			}
			
			if(input.keyHeld(65)){
				o.xvel = -2;
				rot2 = Math.PI / 2;
			}else if(input.keyHeld(68)){
				o.xvel = 2;
				rot2 = Math.PI * 1.5;
			}else{
				o.xvel *= 0.5;
			}
			
			var x = Math.abs(rot1 - rot2) % 360;
			if(rot1 !== false && rot2 !== false){
				if(x >= 0 && x <= Math.PI){
					o.rotation = ((rot1 + rot2) / 2) % Math.TAU;
				}else if(x > Math.PI && x < Math.PI * 1.5){
					o.rotation = (((rot1 + rot2) / 2) % Math.TAU) + Math.PI;
				}else{
					o.rotation = (((rot1 + rot2) / 2) % Math.TAU) - Math.PI;
				}
			}else{
				if(rot1 !== false || rot2 !== false) o.rotation = Math.max(rot1, rot2);
			}
		}
	}
	
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	if(view.camera){
		var o = view.camera;
		var p = view.camera.parent;
		if(p){
			var angle = Math.atan2((o.y - 240), (o.x - 128));
			var dis = Math.sqrt((o.y - 240) * (o.y - 240) + (o.x - 128) * (o.x - 128));
			var x = Math.cos(angle + p.rotation) * dis;
			var y = Math.sin(angle + p.rotation) * dis;
			view.x = -((p.x + x));
			view.y = -((p.y + y));
		}else{
			view.x = -o.x;
			view.y = -o.y;
		}
		view.rotation = view.camera.parent ? -view.camera.parent.rotation : 0;
	}
}

function drawRotated(img, x, y, rot, can){
	var can_given = can ? true : false;
	can = can || canvas;
	var con = can ? can.getContext('2d') : context;
	x += can_given ? 0 : (can.width / 2) / view.zoom;
	y += can_given ? 0 : (can.height / 2) / view.zoom;
	
	con.save();
	con.translate(x, y);
	con.rotate(rot);
	con.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
	con.restore();
}

function print(){
	context.save();
	
	if(view.rotation){
		context.translate(canvas.width / 2, canvas.height / 2);
		context.rotate(view.rotation);
		context.translate(-canvas.width / 2, -canvas.height / 2);
	}
	
	var size = Math.pow(1.3, Math.log(1 / (view.zoom))),
		size = world.star_size - (size < 0 ? 0 : size),
		margin_x = (size - canvas.width) / 2,
		margin_y = (size - canvas.height) / 2;
	!world.background || context.drawImage(world.background, (view.x / world.star_size) - margin_x, (view.y / world.star_size) - margin_y, size, size);
	context.scale(view.zoom, view.zoom);
	
	for(var i in world.ships){
		var entity = getShipDrawData(world.ships[i]);
		!entity || drawRotated(entity.img, view.x + world.ships[i].x, view.y + world.ships[i].y, world.ships[i].rotation);
	}
	
	for(var i in world.objects){
		var p = world.objects[i].parent,
			o = world.objects[i],
			x = o.x;
			y = o.y;
			
		if(p){
			var angle = Math.atan2((y - 240), (-x + 128));
			var dis = Math.sqrt((y - 240) * (y - 240) + (x - 128) * (x - 128));
			var x = p.x - Math.cos(-angle + p.rotation) * dis;
			var y = p.y - Math.sin(-angle + p.rotation) * dis;
			if(o.type == 2) o.draw = {x: (x + view.x) / view.zoom, y: (y + view.y) / view.zoom};
		}
		
		if(o.draw && false){
			var img = outline(o.img);
		}else{
			var img = o.img;
		}
		drawRotated(img, x + view.x, y + view.y, o.rotation + (p ? p.rotation : 0));
	}
	
	context.restore();
	
	textBox((world.objects.guy.x >> 4) + ', ' + (world.objects.guy.y >> 4), 10, canvas.height - 110, 150, 100);
	
	view.zoom *= view.zoom < 2 ? 1.02 : 1;
}

function textBox(text, x, y, w, h, size){
	context.fillStyle = '#222';
	context.globalAlpha = 0.5;
	context.fillRect(x, y, w, h);
	context.globalAlpha = 1;
	drawText(text, x + w / 2, y + h / 2, '#fff', size || '16px', 'center', 'middle');
}

function drawText(text, x, y, color, size, align, base){
	context.fillStyle = color || '#222';
	context.font = (size || '16px') + ' Pixel';
	context.textAlign = align || 'left';
	context.textBaseline = base || 'top';
	context.fillText(text, x, y);
}

function isFullScreen(){
	return (window.fullScreen) || (window.innerWidth == screen.width && window.innerHeight == screen.height);
}

function button(text, x, y, w, h, callback){
	var id = (text + x + ',' + y).hash();
	if(!game.menu.buttons[id]){
		game.menu.buttons[id] = 0;
	}
	var mouseover = input.mouse_x > x && input.mouse_x < x + w && input.mouse_y > y && input.mouse_y < y + h ? 1 : 0;
	if(mouseover && input.mouse_pressed.indexOf(0) > -1){
		game.menu.buttons[id] = 1;
	}
	if(input.mouse_held.indexOf(0) == -1){
		if(game.menu.buttons[id] == 1 && mouseover) callback();
		game.menu.buttons[id] = 0;
	}else if(game.menu.buttons[id] == 1){
		mouseover = 2;
	}
	context.fillStyle = ['#444', '#555', '#333'][mouseover];
	context.fillRect(x, y, w, h);
	context.fillStyle = ['#333', '#444', '#222'][mouseover];
	context.fillRect(x + 2, y + 2, w - 4, h - 4);
	drawText(text, x + w / 2, y + h / 2 + (mouseover == 2 ? 1 : 0), '#fff', '16px', 'center', 'middle');
}

function z(){
	view.camera = world.objects.guy;
	a = world.objects.guy.rotation;
	world.objects.guy.parent.rotvel = 0.00;
}
