/*
 * BEEP app
 * Author: Iconize <pim@iconize.nl>
 *
 * Meaurements model
 */
app.service('inspections', ['$http', '$rootScope', 'api', 'settings', function($http, $rootScope, api, settings)
{

	var self = this;

	this.reset = function()
	{
		this.refreshCount = 0;
		this.inspections  = [];
		this.inspection   = {};
		this.checklists   = [];
		this.checklistTree= [];
		this.checklist    = null; // use for filling
		this.checklistNull= null; // clean loaded checklist

		this.saveObject   = {}; // hold inspection items for saving

		this.DATE_FORMAT_API = 'YYYY-MM-DD';

	}

	self.reset();
	$rootScope.$on('reset', self.reset);

	this.STD_VALUES = {
		'default': null,
		'list_item': -1,
		'boolean': -1,
		'boolean_yes_red': -1,
		'date': "",
		'number': null,
		'number_percentage': -1,
		'number_degrees': 0,
		'number_positive': null,
		'number_negative': null,
		'number_0_decimals': null,
		'number_1_decimals': null,
		'number_2_decimals': null,
		'number_3_decimals': null,
		'text': "",
		'select': "",
		'options': "",
		'list': null,
		'bee_subspecies': -1,
		'select_country': "",
		'select_apiary': -1,
		'select_hive': -1,
		'select_hive_type': -1,
		'score': -1,
		'score_amount': 0,
		'score_quality': 0,
		'smileys_3': -1,
		'slider': 0,
		'grade': 0,
	}
	
	this.newSaveObject = function(data)
	{
		self.saveObject = 
		{
			impression: -1,
			attention : -1,
			reminder  : '',
			reminder_date  : '',
			notes 	  : '',
			date 	  : moment().format(self.DATE_FORMAT_API),
			items 	  : {}
		};

		if (self.checklistNull != null)
		{
			self.checklist = angular.copy(self.checklistNull);
			//console.log('newSaveObject checklist cloned');
		}

		if (typeof data != 'undefined')
		{
			//console.log('newSaveObject filling checklist with available data');
			if (typeof data.impression != 'undefined' && data.impression != null)
				self.saveObject.impression = parseInt(data.impression);

			if (typeof data.attention != 'undefined' && data.attention != null)
				self.saveObject.attention = parseInt(data.attention);

			if (typeof data.notes != 'undefined' && data.notes != null && data.notes != '')
				self.saveObject.notes = data.notes;

			if (typeof data.reminder != 'undefined' && data.reminder != null && data.reminder != '')
				self.saveObject.reminder = data.reminder;

			//console.log('data.reminder_date', data.reminder_date);
			if (typeof data.reminder_date != 'undefined' && data.reminder_date != null)
				self.saveObject.reminder_date = moment(data.reminder_date, [self.DATE_FORMAT_API, moment.ISO_8601]).format(self.DATE_FORMAT_API);

			if (typeof data.created_at != 'undefined')
				self.saveObject.date = moment(data.created_at, [self.DATE_FORMAT_API, moment.ISO_8601]).format(self.DATE_FORMAT_API);
			
			if (typeof data.items != 'undefined' && data.items.length > 0)
			{
				for (var i = data.items.length - 1; i >= 0; i--) 
				{
					var item = data.items[i];
					var val  = self.parseTypeValueForChecklistInput(item.type, item.value);
					self.createInspectionObject(item.type, item.category_id, val, true, item.unit);
					
					// fill inspection item input fields (convert selected id for select dropdowns)
					switch(item.type)
					{
						case 'bee_subspecies':
						case 'select_apiary':
						case 'select_hive':
						case 'select_hive_type':
							val = {'id':val};
					}
					var set = self.setSelectedInspectionItem(item.category_id, val);
					//if (set) console.log('setSelectedInspectionItem', item);
				}
				$rootScope.$broadcast('checklistUpdated');
			}
		}
		
		console.log('newSaveObject');
		return self.saveObject;
	}

	this.typeIsNonNumeric = function(type)
	{
		switch(type)
		{
			case 'default':
			case 'date':
			case 'text':
			case 'list':
			case 'select':
			case 'select_country':
				return true;
		}
		return false;
	}

	this.parseTypeValueForChecklistInput = function(type, value)
	{
		switch(type)
		{
			case 'list_item':
			case 'boolean':
			case 'boolean_yes_red':
			case 'options':
			case 'score':
			case 'score_amount':
			case 'score_quality':			
			case 'smileys_3':
			case 'slider':			
			case 'grade':	
			case 'number':
			case 'number_percentage':
			case 'number_degrees':				
			case 'number_positive':
			case 'number_negative':
			case 'bee_subspecies':
			case 'select_apiary':
			case 'select_hive':
			case 'select_hive_type':
				return parseInt(value);	
			case 'number_0_decimals':
			case 'number_1_decimals':
			case 'number_2_decimals':
			case 'number_3_decimals':	
				return parseFloat(value);	
		}
		return value;
	}

	// Inspection Lists
	this.loadChecklist = function(id)
	{
		var suffix = '';
		if (typeof id != 'undefined' && id != null)
			suffix = 'id='+id;

		api.getApiRequest('checklist', 'inspections/lists', suffix);
	};

	this.checklistHandler = function(e, data)
	{
		self.checklist 	   = data.checklist;
		self.checklistNull = data.checklist;
		if (self.inspection)
			self.newSaveObject(self.inspection);

		$rootScope.$broadcast('checklistUpdated');
	};
	$rootScope.$on('checklistLoaded', self.checklistHandler);
	

	this.loadChecklistTree = function(id)
	{
		var suffix = '';
		if (typeof id != 'undefined' && id != null)
			suffix = '/'+id;

		api.getApiRequest('checklistTree', 'checklists'+suffix);
	};
	this.checklistTreeHandler = function(e, data)
	{
		self.checklistTree = data;
		$rootScope.$broadcast('checklistTreeUpdated');
	};
	$rootScope.$on('checklistTreeLoaded', self.checklistTreeHandler);


	this.getChecklists = function()
	{
		api.getApiRequest('checklists', 'checklists');
	}
	this.checklistsHandler = function(e, data)
	{
		self.checklists = data;
		$rootScope.$broadcast('checklistsUpdated');
	};
	$rootScope.$on('checklistsLoaded', self.checklistsHandler);



	this.setSelectedInspectionItem = function(id, value)
	{
		if (self.checklist != null && self.checklist.categories.length > 0)
			return recurse(self.checklist.categories, id, value);
	}	

	function recurse(node, id, value) 
	{
	    //console.log('recurse', id, value, typeof node == 'object' ? node.name : node);

    	if (node.id == id)
    	{
    		node.value = value;
    		return true;
    	}
    	else if (typeof node.children == 'object')
	    {
		    for(var i in node.children) 
	    {
		        var ret = recurse(node.children[i], id, value);
		        if (ret)
		        	return ret;
		    }
    	}
	    else if (typeof node == 'object')
	    {
		    for(var j in node) 
		    {
		        var ret = recurse(node[j], id, value);
		        if (ret)
		        	return ret;
		    }
		}

	    return false;
	} 

	this.createInspectionObject = function(type, id, value, items=true, name='')
	{
		if (typeof type != 'undefined' && typeof value != 'undefined' && (items == false && typeof self.saveObject[type] != 'undefined' || (self.typeIsNonNumeric(type) || isNaN(value) == false) && typeof self.STD_VALUES[type] != 'undefined'))
		{
			if (items == false)
			{
				//console.log('Changed '+type+' = '+value, name);
				self.saveObject[type] = value;
			}
			else
			{
				if (self.STD_VALUES[type] != value)
				{
					//console.log('Added '+type+' ('+id+') = '+value, name);
					self.saveObject.items[id] = value;
				}
				else if (typeof self.saveObject.items[id] != 'undefined')
				{
					//console.log('Removed '+type+' ('+id+') = '+self.saveObject.items[id], name);
					delete self.saveObject.items[id];
				}
			}
		}
		else
		{
			//console.log('NOT createInspectionObject', type, id, value, name);
		}
	}

	this.correctMobileDateValue = function(d) // Convert date to YYYY-MM-DD
	{
	    date_start = d; //.substring(0,10);
	    console.log('date to correct: ',d);
	    date_corr =  moment(d, [self.DATE_FORMAT_API, moment.ISO_8601]).format(self.DATE_FORMAT_API);
	    console.log('date corrected : ',date_corr);
	    return date_corr;
	}

	// Inspections
	this.loadRemoteInspections = function(hive_id)
	{
		api.getApiRequest('inspections', 'inspections/hive/'+hive_id);
	};

	this.inspectionsHandler = function(e, data)
	{
		// get the result
		self.inspections = data;
		self.refresh();
		//console.table(self.inspections);
	};

	this.inspectionsError = function(e, error)
	{
		console.log('inspections error '+error.message+' status: '+error.status);
	};

	$rootScope.$on('inspectionsLoaded', self.inspectionsHandler);
	$rootScope.$on('inspectionsError', self.inspectionsError);

	this.loadRemoteInspection = function(inspection_id)
	{
		api.getApiRequest('inspection', 'inspections/'+inspection_id);
	};

	this.inspectionHandler = function(e, data)
	{
		self.inspection = data;
		$rootScope.$broadcast('inspectionUpdated', data);
	};
	$rootScope.$on('inspectionLoaded', self.inspectionHandler);
	


	this.refresh = function()
	{
		//update refresh count
		self.refreshCount++;

		// announce the update
		$rootScope.$broadcast('inspectionsUpdated');
	};

	// Init
	self.getChecklists();

}]);