/* Ship Tier Notes:

	Shuttle
	Corvette
	Frigate
	Brig
	Cruiser
	Monitor
	Destroyer
	Battleship
	Dreadnought
	
	Shuttle
		Bow, Stern
		16x32
		2-6 hard points
		1-2 crew
	
	Corvette
		Bow, Midship, Stern
		24x48
		4-10 hard points
		2-5 crew
	
	Frigate
		Bow, Starboard, Port, Stern
		36x60
		6-14 hard points
		2-8 crew
	
	Others TBD.
*/
var tier_data = {
	parts: {
		shuttle: ['bow', 'stern'],
		corvette: ['bow', 'midship', 'stern'],
		frigate: ['bow', 'port', 'starboard', 'stern']
	},
	sizes: {
		'shuttle': {width: 16, height: 30},
		'corvette': {width: 25, height: 50},
		'frigate': {width: 35, height: 60},
		'brig': {},
		'cruiser': {},
		'monitor': {}
	}
}
/*
					
					*/

var ship_hulls = {
	shuttle: {
		bow: {
			canary: {
				floor: [0,0,[],[],[],[0,0,0,0,0,1,1,1,1,1,1],[0,0,0,0,1,1,1,1,1,1,1,1],
					[0,0,0,0,1,1,1,1,1,1,1,1],[0,0,0,0,1,1,1,1,1,1,1,1],[0,0,0,0,1,1,1,1,1,1,1,1],
					[0,0,0,0,1,1,1,1,1,1,1,1],[0,0,0,0,1,1,1,1,1,1,1,1],[0,0,0,0,1,1,1,1,1,1,1,1],
					[0,0,0,0,1,1,1,1,1,1,1,1],[0,0,0,0,1,1,1,1,1,1,1,1],[0,0,0,0,1,1,1,1,1,1,1,1],
					[0,0,0,0,0,1,1,1,1,1,1]],
				hardpoints: {
						
				},
				com: {
					x: 8, y: 10
				}
			}
		},
		stern: {
			canary: {
				floor: [0,15,[0,0,0,0,0,0,1,1,1,1],[0,0,0,0,0,0,1,1,1,1],[0,0,0,0,0,0,1,1,1,1],[0,0,0,0,0,0,1,1,1,1],
					[0,0,0,0,1,1,1,1,1,1,1,1],[0,0,0,0,1,1,1,1,1,1,1,1],[0,0,0,0,1,1,1,1,1,1,1,1],
					[0,0,0,0,1,1,1,1,1,1,1,1],[0,0,0,0,1,1,0,0,0,0,1,1]],
				hardpoints: {
						
				},
				com: {
					x: 8, y: 22
				}
			},
			tug: {
				floor: [0,15,[0,0,0,0,0,1,1,1,1,1,1],[0,0,0,0,0,1,1,1,1,1,1],[0,0,0,0,1,1,1,1,1,1,1,1],[0,0,0,0,1,1,1,1,1,1,1,1],
					[0,0,0,1,1,1,1,1,1,1,1,1,1],[0,0,0,1,1,1,1,1,1,1,1,1,1],[0,0,0,1,1,1,1,1,1,1,1,1,1],[0,0,0,1,1,1,1,1,1,1,1,1,1],
					[0,0,0,0,1,1,1,1,1,1,1,1]],
				hardpoints: {
						
				},
				com: {
					x: 8, y: 22
				}
			}
		}
	}
}
