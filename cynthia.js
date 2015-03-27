/* Cynthia
** Desinged and developed by Kosmas Papadatos
** Creation date 29/9/2014
*/

var manifest = chrome.runtime.getManifest();
var loadQueue = 0;
var loaded = 0;

function loadScript( file ){

	var script = document.createElement( 'script' );
	script.setAttribute( 'src' , file );

	window.loadQueue++;
	script.onload = function(){ ++window.loaded == loadQueue && window.onScriptsLoaded(); }

	document.body.appendChild( script );

}

// Libraries
loadScript( 'libs/polyfills.js' );

// Class vars
var Cynthia = function(){

	var ref = this;
	chrome.storage.local.get(
		'nodeAddress',
		function( key ){
			ref.nodeAddress = key.nodeAddress || 'http://127.0.0.1:1337/';
			!key.nodeAddress && chrome.storage.local.set( { nodeAddress : ref.nodeAddress } );
		}
	);
	chrome.storage.local.get(
		'publicMode',
		function( key ){
			ref.publicMode = "publicMode" in key ? key.publicMode : 1;
			!key.publicMode && chrome.storage.local.set( { publicMode : ref.publicMode } );
		}
	);

	this.runtimeFlags = {};
	this.modules = [];
	this.coreWelcomePhrases = [
		'Hello.',
		'Cynthia is listening.',
		'Cynthia is here.',
		'It is good to be back.',
		'Hi.',
		'I am here.',
		'I am ready.',
		'Greetings.',
		'Welcome.',
		'I am Cynthia.'
	];

}

// Cynthia say
Cynthia.prototype.say = function( quote , notificationOptions ){

	return false;

}

// Core greeting function
Cynthia.prototype.greet = function(){

	return false;

}

// Module loader
Cynthia.prototype.initializeModules = function(){

	for( var m in this.modules ){
		module = this.modules[ m ];
		module.isPublic >= this.publicMode && module.onCynthiaLaunched();
	};

}

// Cynthia background speech
Cynthia.prototype.initializeSpeech = function(){

	return false;

}

// Cynthia new window
Cynthia.prototype.newWindow = function( options ){

	if( !options || typeof options != "object" ) return console.warn( 'Cynthia.newWindow was called with a non-object parameter.' );
	chrome.system.display.getInfo(function(displayInfo){

		var primaryDisplay = displayInfo.filter( function( display ){ return display.isPrimary } )[0];

		chrome.app.window.create(
			options.index,
			{
				id: options.id,
				innerBounds: {
					top: primaryDisplay.bounds.height / 2 - options.height / 2,
					left: primaryDisplay.bounds.width / 2 - options.width / 2,
					height: options.height,
					width: options.width,
					minWidth: options.minWidth || undefined,
					minHeight: options.minHeight || undefined
				},
				frame: 'none',
				resizable: options.resizable || false
			},
			function( window ){

				chrome.app.window.get( options.id ).setBounds({
					top: primaryDisplay.bounds.height / 2 - options.height / 2,
					left: primaryDisplay.bounds.width / 2 - options.width / 2,
					height: options.height,
					width: options.width
				});

				options.callback && typeof options.callback == "function" && options.callback( window );

			}
		);
	});

}

// Cynthia Home initialization
Cynthia.prototype.initialize = function(){

	Cynthia.say( 'Initializing Cynthia Home platform.' );

	// Speech start
	Cynthia.initializeSpeech();

	// Initialize Home Platform window
	Cynthia.modules.system.onLaunch();

}

// Create Cynthia
var Cynthia = new Cynthia();

// Load modules asynchronously
loadScript( 'scripts/system.js' );

window.onScriptsLoaded = function(){

	// Initialize loaded modules
	Cynthia.initializeModules();

	// Bind initialization script
	chrome.app.runtime.onLaunched.addListener( Cynthia.initialize );

	// Initialize chrome.tts
	Cynthia.greet();

}
