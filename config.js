'use strict';

//daemon.js - Daemon script for cognicity-reports module

/* jshint node:true */
/* jshint unused:vars */ // We want to keep function parameters on callbacks like the originals
/* jshint curly:false */ // Don't require curly brackets around one-line statements

//sample-config.js - Configuration for cognicity-server

var config = {};

// Instance name - default name for this configuration (will be server process name)
config.instance = 'cognicity-server';

// Location of HTML files to serve
config.public_dir = __dirname+'/petajakarta-web/build/banjir';

// Optional URL prefix - e.g. http://localhost/project-name/
config.url_prefix = 'banjir';

// Optional redirect path for root ['/] requests
config.root_redirect = 'banjir/in';

// Default cache time expiry
config.cache_timeout = 60000; // Data cache expiry (1 minute)

config.data = true; // Enable data routes
config.aggregates = true; // Enable aggregate data outputs

//Postgres database connection
config.pg = {};
// Sample connection string using environment variables, e.g. from AWS Elastic Beanstalk.
// Substitute variable names for constants in other environments.
config.pg.conString = 'postgres://postgres:password@localhost:5432/mapjakarta';

config.pg.tbl_reports = 'tweet_reports';
config.pg.tbl_reports_unconfirmed = 'unconfirmed_reports';

//Optional support for report aggregation, required if config.data.aggregates set to true.
config.pg.aggregate_levels = {
	'subdistrict':'jkt_subdistrict_boundary',
	'village':'jkt_village_boundary',
	'rw':'jkt_rw_boundary'
};
config.pg.infrastructure_tbls = {
	'waterways':'waterways',
	'pumps':'pumps',
	'floodgates':'floodgates'
};
config.pg.limit = 'NULL'; // Limit number of rows returned in a query
config.pg.uc_limit = 'NULL'; // Limit number of unconfirmed reports.

config.logpath = './';

config.port = process.env.PORT || 8081;

module.exports = config;
