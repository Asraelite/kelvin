// Define all image files the game is to load
var assets_to_load = {
	tiles: {
		missing: 'tiles/missing.png',
		blank: 'tiles/blank.png',	
		a0: 'tiles/basic_block.png',
		a1: 'tiles/cobble.png',
		a2: 'tiles/metal_tile_1.png',
		a3: 'tiles/plank.png',
		a4: 'tiles/panel.png',
		a5: 'tiles/cool.png',
		a6: 'tiles/glass.png',
		a7: 'tiles/grey_wall_tile.png',
		a8: 'tiles/textured_metal_wall.png'
	},
	turrets: {
	},
	hulls: {
		shuttle: {
			bow: {
				canary: {
					0: 'hulls/shuttle/bow/canary/col1.png',
					1: 'hulls/shuttle/bow/canary/col2.png'
				}
			},
			stern: {
				canary: {
					0: 'hulls/shuttle/stern/canary/col1.png',
					1: 'hulls/shuttle/stern/canary/col2.png',
				},
				tug: {
					0: 'hulls/shuttle/stern/tug/col1.png',
					1: 'hulls/shuttle/stern/tug/col2.png',
				}
			}
		},
		test: 'hulls/shuttle/bow/fox.png'
	},
	objects: {
		control: {
			helm: {
				kc_a1: 'objects/control/helm/kc-a1.png'
			}
		}
	},
	body_parts: {
		human: {
			test: 'objects/living/human/human1.png'
		}
	},
	tooltips: {
		e: 'tooltips/e.png'
	},
	sun: 'cellestials/stars/0.png',
	stars: 'stars.jpg',
	html5: 'html5.png'
};
