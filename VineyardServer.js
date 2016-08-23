'use strict';

// Validation module, parameter validation functions
var Validation = require('./Validation.js');

/**
 * A VineyardServer object queries against the cognicity database and returns data to be returned
 * to the client via the REST service.
 * @constructor
 * @param {config} config The server configuration object loaded from the configuration file
 * @param {object} logger Configured Winston logger instance
 * @param {Database} database Instance of Database DB query object
 */
var VineyardServer = function(
	config,
	logger,
	database
	){

	this.config = config;
	this.logger = logger;
	this.database = database;
};

VineyardServer.prototype = {

	/**
	 * Server configuration
	 * @type {object}
	 */
	config: null,

	/**
	 * Configured Winston logger instance
	 * @type {object}
	 */
	logger: null,

	/**
	 * Configured 'Database' module for DB interaction
	 * @type {Database}
	 */
	database: null,

	getSoilData: function(callback){
		var self = this;


		// SQL
		var queryObject = {
			text: "SELECT 'FeatureCollection' As type, " +
			    "array_to_json(array_agg(f)) As features " +
			  "FROM (SELECT 'Feature' As type, " +
			    "ST_AsGeoJSON(lg.wkb_geometry)::json As geometry, " +
			    "row_to_json( " +
			      "(SELECT l FROM " +
			        "(SELECT ogc_fid, " +
			        "pit_location, " +
			        "depth, " +
			        "texture, " +
			        "pedality) " +
			      " As l) " +
			    ") As properties " +
			    "FROM soil_data AS lg " +
			    "ORDER BY pit_location" +
			" ) As f ;"

		};
		// Call data query
		self.database.dataQuery(queryObject, callback);
	},

	/**
	 * Get the GeoJSON sensor data including flooded state in the feature properties.
	 * Call the callback function with error or response data.
	 * @param {object} options Configuration options for the query
	 * @param {string} options.polygon_layer Database table for layer of geo data
	 * @param {number} options.minimum_state_filter Only return areas where current state is equal to or greater than this value (must be an integer)
	 * @param {DataQueryCallback} callback Callback for handling error or response data
	 */
	getSensors: function(options, callback){
		var self = this;

		// Validate options
		var err;
		if ( !options.polygon_layer ) err = new Error( "'polygon_layer' option must be supplied" );
		if ( !Validation.validateIntegerParameter(options.minimum_state_filter) ) err = new Error( "'minimum_state_filter' parameter is invalid" );
		if (err) {
			callback(err);
			return;
		}

		// SQL
		// Note that references to tables were left unparameterized as these cannot be passed by user
		var queryObject = {
			text: "SELECT 'FeatureCollection' AS type, " +
					"array_to_json(array_agg(f)) AS features " +
				"FROM (SELECT 'Feature' AS type, " +
					"ST_AsGeoJSON(lg.the_geom)::json AS geometry, " +
					"row_to_json(attributes) AS properties " +
							"FROM (SELECT area_name as level_name , " +
							"rs.state as state, " +
							"COALESCE(rs.last_updated at time zone 'ICT', null) as last_updated," +
							"parent_name, " +
							"pkey " +
							"FROM " + options.polygon_layer + " as j " +
							"LEFT JOIN rem_status as rs " +
							"ON rs.rw=j.pkey " +
							"WHERE COALESCE(rs.state,0) >= $1::int ) " +
					"AS attributes, " +
					options.polygon_layer + " AS lg " +
					"WHERE attributes.pkey = lg.pkey )" +
				"AS f;",
			values: [options.minimum_state_filter]
		};

		// Call data query
		self.database.dataQuery(queryObject, callback);
	},



};

// Export our object constructor method from the module
module.exports = VineyardServer;
