// Cynthia Window library

$( document ).ready( function(){
	
	// Close App
	$(".CHUI-close").click(function() {
		chrome.app.window.current().close();
	});
	
	// Minimize App
	$(".CHUI-minimize").click(function() {
		chrome.app.window.current().minimize();
	});
	
	// Maximize App
	$(".CHUI-maximize").click(function() {
		
		currentWindow = chrome.app.window.current();
		if( currentWindow.isMaximized() || currentWindow.isFullscreen() ) return currentWindow.restore();
		currentWindow.maximize();
		
	});
	
});