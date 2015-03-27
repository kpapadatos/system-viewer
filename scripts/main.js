// Cynthia Home Platform

var startupDelay = 2000;
var CynthiaHomePlatform = function(){ }
var primaryDisplay = {};
var Cynthia = window.opener.Cynthia;

chrome.system.display.getInfo(function(displayInfo){
	primaryDisplay = displayInfo.filter( function( display ){ return display.isPrimary } )[0];
});

CynthiaHomePlatform.prototype.stoppedRunning = function( moduleNamespace ){

	$( '[data-module-namespace="' + moduleNamespace + '"]' ).removeClass( 'running' );
	Cynthia.modules[ moduleNamespace ].onClosed();

}

CynthiaHomePlatform.prototype.initialize = function(){

	var dragbar = $('.CHUI-dragbar');
	var body = $('body');
	dragbar.html( 'Cynthia Home Platform' );
	$('.version').html( 'v' + window.opener.manifest.version );

	for( var m in Cynthia.modules ){

		module = Cynthia.modules[ m ];

		if( module.isPublic < Cynthia.publicMode ){ debugger; continue; }
		var element = $(document.createElement( 'div' ));

		element.addClass( 'listed-module ani04' ).html(
			( module.imageType == "icon" ? '<div class="icon-' + module.imageSrc + '"></div>' : '<div style="background-image:url(' + module.imageSrc + ')"></div>' ) +
			'<a>' + module.title + '</a>'
		);

		element.click(function(){

			if( $(this).is('.running') ) return chrome.app.window.get( $(this).attr( 'data-module-namespace' ) ).focus();{}
			Cynthia.modules[ $(this).attr( 'data-module-namespace' ) ].onLaunch();
			$(this).addClass('running');

		});

		$('.module-pool').append( element.attr( 'data-module-namespace' , module.namespace ) );

	};

	setTimeout(function(){

		body.addClass('initialized');

		window.opener.chrome.app.window.get('cynthiaHomePlatform').resizeTo( 500 , 500 );
		window.opener.chrome.app.window.get('cynthiaHomePlatform').moveTo( primaryDisplay.bounds.width / 2 - 250,  primaryDisplay.bounds.height / 2 - 250 );

	}, startupDelay );

}

var CynthiaHomePlatform = new CynthiaHomePlatform();

$( document ).ready( CynthiaHomePlatform.initialize );

