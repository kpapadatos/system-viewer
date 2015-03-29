/*
** System Viewer
** Copyright (c) 2015 Kosmas Papadatos
** License: MIT
*/

var manifest = chrome.runtime.getManifest();
var loadQueue = 0;
var loaded = 0;

function loadScript( file ){

	var script = document.createElement( 'script' );
	script.setAttribute( 'src' , file );

	window.loadQueue++;
	script.onload = function(){ if(++window.loaded == loadQueue) window.onScriptsLoaded(); };

	document.body.appendChild( script );

}

// Create new window
function newWindow( options ){

	if( !options || typeof options != "object" ) return console.warn( 'newWindow( options ) was called with a non-object parameter.' );
	chrome.system.display.getInfo(function(displayInfo){

		var primaryDisplay = displayInfo.filter( function( display ){ return display.isPrimary; } )[0];

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

				if(options.callback) options.callback( window );

			}
		);
	});

}

// Load modules asynchronously
loadScript( 'scripts/system.js' );

window.onScriptsLoaded = function(){
  
  window.SystemViewer = new SystemViewerFactory();
  chrome.app.runtime.onLaunched.addListener( SystemViewer.onLaunch );
  
};
