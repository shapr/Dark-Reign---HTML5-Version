function Headquarter2Building(pos_x, pos_y, player)
{
	this._proto = Headquarter2Building;
	this.player = player;
	this.health = this._proto.health_max;
	
	this._text_under_construction = 'Upgrading';
	
	this.setPosition(pos_x, pos_y);
	this.setActionTime(this._proto.build_time);
	
	this.run = function()
	{
		switch (this.state)
		{
			case 'CONSTRUCTION':
				this._runStandartConstruction();
				break;
				
			case 'PRODUCING':
				this._runStandartProducing();
				break;
				
			case 'NORMAL':
				if (this.producing_queue.length > 0)
				{
					this.producing_start = (new Date).getTime();
					this.state = 'PRODUCING';
				}
				break;
				
			case 'SELL':
				this._runStandartSell();
				break;
		}
	}
}

Headquarter2Building.prototype = new AbstractBuilding();

Headquarter2Building.res_key = 'headquarter';
Headquarter2Building.obj_name = 'Headquarter 2';
Headquarter2Building.cost = 1000;
Headquarter2Building.sell_cost = 500;
Headquarter2Building.health_max = 2880;
Headquarter2Building.build_time = 20;
Headquarter2Building.energy = 100;
Headquarter2Building.enabled = false;
Headquarter2Building.count = 0;

Headquarter2Building.cell_size = {x: 5, y: 4};
Headquarter2Building.cell_matrix = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
Headquarter2Building.move_matrix = [0,0,1,1,1,1,1,0,0,1,0,1,1,1,1,1,0,1,1,1];
Headquarter2Building.cell_padding = {x: 2, y: 2};
Headquarter2Building.image_size = {x: 103, y: 138};
Headquarter2Building.image_padding = {x: -9, y: 42};
Headquarter2Building.require_building = [];

Headquarter2Building.upgradable = false;

HeadquarterBuilding.loadResources = function(){
	AbstractBuilding.loadResources(this);
};