function FreighterUnit(pos_x, pos_y, player)
{
	this._proto = FreighterUnit;
	this.player = player;
	this.health = 15;
	
	this.action = {
		type: '',
		building: -1,
		well: -1,
		target_position: null
	};
	this._res_type = RESOURCE_WATER;
	this._res_now = 0;
	this._res_max = 50;
	this._load_speed = 0;
	this._unload_speed = 0;
	
	this.init(pos_x, pos_y);
	
	this.runCustom = function() 
	{
		var obj;
		
		switch (this.state)
		{
			case 'LOADING':
				if (this.action.type == 'loading')
				{
					obj = AbstractBuilding.getById(this.action.well);
					if (obj === null)
					{
						this.orderStop();
						return;
					}
					this._res_now += obj.decreaseRes(this._load_speed);
				
					if (this._res_now >= this._res_max)
					{
						this._res_now = this._res_max;
						this._moveBase();
					}
				}
				else
				{
					//Uloading
					obj = AbstractBuilding.getById(this.action.building);
					if (obj===null || obj.isResFull())
					{
						this.orderStop();
						return;
					}
					this._res_now -= obj.increaseRes(this._unload_speed);

					if (this._res_now <= 0)
					{
						this._res_now = 0;
						this._moveWell();
					}
				}
				break;
		}
	};
	
	this.draw = function(current_time) 
	{
		var top_x = this.position.x - game.viewport_x, top_y = this.position.y - game.viewport_y, diff;
		
		switch (this.state)
		{
			case 'MOVE':
				diff = (parseInt((current_time - this.startAnimation) / ANIMATION_SPEED) % this._proto.images.move.frames);
				game.objDraw.addElement(DRAW_LAYER_GUNIT, this.position.x, {
					res_key: this._proto.resource_key + '_move',
					src_x: this.move_direction * this._proto.images.move.size.x,
					src_y: diff * this._proto.images.move.size.y,
					src_width: this._proto.images.move.size.x,
					src_height: this._proto.images.move.size.y,
					x: top_x - this._proto.images.move.padding.x,
					y: top_y - this._proto.images.move.padding.y
				});
				break;
				
			case 'LOADING':
				diff = (parseInt((current_time - this.startAnimation) / (ANIMATION_SPEED*2)) % 15);
				game.objDraw.addElement(DRAW_LAYER_GUNIT, this.position.x, {
					res_key: this._proto.resource_key + '_load',
					src_x: 0,
					src_y: diff * this._proto.images.load.size.y,
					src_width: this._proto.images.load.size.x,
					src_height: this._proto.images.load.size.y,
					x: top_x - this._proto.images.load.padding.x,
					y: top_y - this._proto.images.load.padding.y
				});
				break;
				
			default:
				game.objDraw.addElement(DRAW_LAYER_GUNIT, this.position.x, {
					res_key: this._proto.resource_key + '_move',
					src_x: this.move_direction * this._proto.images.move.size.x,
					src_y: 0,
					src_width: this._proto.images.move.size.x,
					src_height: this._proto.images.move.size.y,
					x: top_x - this._proto.images.move.padding.x,
					y: top_y - this._proto.images.move.padding.y
				});
				break;
		}
	};
	
	this.drawSelection = function(is_onmouse)
	{
		this._drawStandardSelection(is_onmouse);
		
		var top_x = this.position.x - game.viewport_x - 1 - this._proto.images.selection.padding.x, 
			top_y = this.position.y - game.viewport_y + 5 - this._proto.images.selection.padding.y,
			bar_size = Math.floor((this._res_now/this._res_max)*28);
			
			
		game.viewport_ctx.fillStyle = '#000000';
		game.viewport_ctx.fillRect(top_x, top_y, 4, 30);
		
		if (this._res_now < this._res_max)
		{
			game.viewport_ctx.fillStyle = '#bbbbbb';
			game.viewport_ctx.fillRect(top_x + 1, top_y + 1, 2, 28);
		}
		
		game.viewport_ctx.fillStyle = (this._res_type == RESOURCE_WATER) ? '#00a5ff' : '#ffff00';
		game.viewport_ctx.fillRect(top_x + 1, top_y + 29 - bar_size, 2, bar_size);
	};
	
	this.canHarvest = function()
	{
		return true;
	};
	
	this.orderHarvest = function(obj, play_sound)
	{
		var cell = this.getCell(), tmp;
		
		if (play_sound)
			this._playSound(this._proto.response_sounds);
		
		if (obj instanceof TaelonPowerBuilding)
		{
			if (this._res_now>0 && this._res_type==RESOURCE_WATER)
				return;
			
			this._res_type = RESOURCE_TAELON;
			this.action.building = obj.uid;
			tmp = game.findNearestInstance(TaelonMineBuilding, PLAYER_NEUTRAL, cell.x, cell.y);
			
			if (tmp === null)
				return;
			
			this.action.well = tmp.uid;
		}
		else if (obj instanceof TaelonMineBuilding)
		{
			if (this._res_now>0 && this._res_type==RESOURCE_WATER)
				return;
			
			this._res_type = RESOURCE_TAELON;
			this.action.well = obj.uid;
			tmp = game.findNearestInstance(TaelonPowerBuilding, this.player, cell.x, cell.y);
			
			if (tmp === null)
				return;
			
			this.action.building = tmp.uid;
		}
		else if (obj instanceof WaterLaunchPadBuilding)
		{
			if (this._res_now>0 && this._res_type==RESOURCE_TAELON)
				return;
			
			this._res_type = RESOURCE_WATER;
			this.action.building = obj.uid;
			tmp = game.findNearestInstance(WaterWellBuilding, PLAYER_NEUTRAL, cell.x, cell.y);
			
			if (tmp === null)
				return;
			
			this.action.well = tmp.uid;
		}
		else if (obj instanceof WaterWellBuilding)
		{
			if (this._res_now>0 && this._res_type==RESOURCE_TAELON)
				return;
				
			this._res_type = RESOURCE_WATER;
			this.action.well = obj.uid;
			tmp = game.findNearestInstance(WaterLaunchPadBuilding, this.player, cell.x, cell.y);
			
			if (tmp === null)
				return;
			
			this.action.building = tmp.uid;
		}
		else
			return;
		
		if (this._res_now > 0)
			this._moveBase();
		else
			this._moveWell();
	};
	
	this._moveBase = function()
	{
		var obj = AbstractBuilding.getById(this.action.building);
		
		if (obj === null)
		{
			this.state = 'STAND';
			return;
		}
		
		this.action.target_position = obj.getCell();
		if (this._res_type == RESOURCE_TAELON)
		{
			this.action.target_position.x += 1;
			this.action.target_position.y += 2;
		}
		else
		{
			this.action.target_position.x += 3;
			this.action.target_position.y += 1;
		}
		this.action.type = 'go_base';
		this._move(this.action.target_position.x, this.action.target_position.y, false);
	};
	
	this._moveWell = function()
	{
		var obj = AbstractBuilding.getById(this.action.well), tmp;
		
		if (obj === null)
		{
			this.orderStop();
			return;
		}
		
		tmp = obj.getCell();
		tmp.x += 1;
		tmp.y += 1;
		this.action.type = 'go_well';
		this.action.target_position = tmp;
		this._move(tmp.x, tmp.y, false);
	};
	
	this.onStopMovingCustom = function()
	{
		var cell = this.getCell();
		if (cell.x==this.action.target_position.x && cell.y==this.action.target_position.y)
		{
			if (this.action.type == 'go_well')
				this.action.type = 'loading';
			else
				this.action.type = 'unloading';
			
			this.state = 'LOADING';
			this._setLoadSpeed();
			this.startAnimation = (new Date).getTime();
			this.move_direction = 4;
		}
		else
			this.orderWait(1000); //Wait 1 second
	};
	
	this.afterWaitingCustom = function()
	{
		var obj_id = (this.action.type == 'go_well') ? this.action.well : this.action.building;
		if (AbstractBuilding.isExists(obj_id))
			this._move(this.action.target_position.x, this.action.target_position.y, false);
		else
			this.orderStop();
	};
	
	this._setLoadSpeed = function()
	{
		if (this.res_type == RESOURCE_TAELON)
		{
			this._load_speed = 0.2;
			this._unload_speed = 0.5;
		}
		else
		{
			this._load_speed = 0.36;
			this._unload_speed = 0.36;
		}
	};
}

AbstractUnit.setUnitCommonOptions(FreighterUnit);

FreighterUnit.obj_name = 'Freighter';
FreighterUnit.resource_key = 'freighter';
FreighterUnit.die_effect = 'death_with_sparks_animation';
FreighterUnit.images = {
	selection: {
		size: {x: 40, y: 40},
		padding: {x: 8, y: 8}
	},
	stand: {
		size: {x: 40, y: 40},
		padding: {x: 8, y: 8}
	},
	move: {
		size: {x: 40, y: 40},
		padding: {x: 8, y: 8},
		frames: 3
	},
	load: {
		size: {x: 40, y: 40},
		padding: {x: 8, y: 8}
	}
};
FreighterUnit.select_sounds = ['gvig1sl0', 'gvig1sl1', 'gvig1sl2', 'gvig1sl5'];
FreighterUnit.response_sounds = ['gvig1rl0', 'gvig1rl1', 'gvig1rl2', 'gvig1rl3'];

FreighterUnit.cost = 1000;
FreighterUnit.health_max = 750;
FreighterUnit.speed = 1.5;
FreighterUnit.shield_type = 'TankPlatingWet';

FreighterUnit.require_building = [AssemblyPlantBuilding];

FreighterUnit.construction_building = [AssemblyPlantBuilding, AssemblyPlant2Building];
FreighterUnit.construction_time = 4;

FreighterUnit.loadResources = function() 
{
	var i;
	
	game.resources.addImage(this.resource_key + '_move',  'images/units/' + this.resource_key + '/move.png');
	game.resources.addImage(this.resource_key + '_load', 'images/units/' + this.resource_key + '/load.png');
	
	for (i in FreighterUnit.select_sounds)
		game.resources.addSound('sound_' + FreighterUnit.select_sounds[i],   'sounds/units/' + FreighterUnit.select_sounds[i] + '.' + AUDIO_TYPE);
	for (i in FreighterUnit.response_sounds)
		game.resources.addSound('sound_' + FreighterUnit.response_sounds[i],   'sounds/units/' + FreighterUnit.response_sounds[i] + '.' + AUDIO_TYPE);
};