// Cynthia System module

var CynthiaSystem = function(){

	this.namespace = 'system';
	this.title = 'System';
	this.imageType = 'icon';
	this.imageSrc = 'screen';
	this.isMenuApp = 1;
	this.isPublic = 1;

	this.onCynthiaLaunched = function(){

	}

	this.onHomePlatformClosed = function(){

	}

	this.onLaunch = function(){

		Cynthia.newWindow({
			id: 'system',
			index: 'html/system.html',
			width: 600,
			height: 600,
			resizable: true,
			minWidth: 315,
			minHeight: 500,
			callback: function( window ){

				chrome.app.window.get( 'system' ).onClosed.addListener(function(){
					chrome.app.window.get( 'cynthiaHomePlatform' ).contentWindow.CynthiaHomePlatform.stoppedRunning( 'system' );
				});

				window.contentWindow.init = Cynthia.modules.system.initializeUI;
				window.contentWindow.init();

			}
		});

	}

	this.initializeUI = function(){

		this.onload = function(){

			var window = this;
			var system = Cynthia.modules.system;

			system.listResources( window );

		}

	}

	this.listResources = function( window ){

		var $ = window.$;
		var resourcesLoaded = 0;
		chrome.system.cpu.getInfo(function( data ){

			$('#modelName').html( data.modelName );
			$('#archName').html( data.archName );
			$('#numOfProcessors').html( data.numOfProcessors );
			$('#features').append( data.features.join(', ') );

			window.prevUsage = data.processors;

			data.processors.forEach(function( processor ){
				var usage = Math.round( ( ( ( processor.usage.kernel + processor.usage.kernel ) ) / processor.usage.total ) * 100 );
				$('.system-cpu-pool').append('<div class="processor"><div class="ani10" style="height: ' + usage + '%"></div></div>');
			});

			$('.processor').css( 'width' , ( Math.round( 100 / data.processors.length ) - 1 ) + '%' );

      var operatingSystem;
      var navigator = window.navigator;

      $('#chromeVersion').html( navigator.userAgent.match('Chrome/([0-9]*\.[0-9]*\.[0-9]*\.[0-9]*)')[1] );

      /CrOS/.test(navigator.userAgent) && ( operatingSystem = 'Chrome OS' );
      /Mac/.test(navigator.userAgent) && ( operatingSystem = 'Mac OS' );
      /Win/.test(navigator.userAgent) && ( operatingSystem = 'Windows' );
      /Android/.test(navigator.userAgent) && ( operatingSystem = 'Android' );
      /Linux/.test(navigator.userAgent) && ( operatingSystem = 'Linux' );

      $('#operatingSystem').html( operatingSystem );
      $('#platform').html( navigator.platform.replace(/_/g, '-') );
      $('#primaryLanguage').html( navigator.language );

      chrome.i18n.getAcceptLanguages(function( languages ) {
        $('#allLanguages').html( languages.join(', ') );
      });

      var plugins = [];
      if( navigator.plugins.length ) for(var i = 0; i < navigator.plugins.length; i++){
        plugins.push( navigator.plugins[i].name );
      }
      plugins.length && $('#plugins').html( plugins.join(', ') );

			Cynthia.modules.system.updateInfo();

		});

	}

	this.updateInfo = function(){

		var window = chrome.app.window.get( 'system' ).contentWindow;
		if( !window ) return console.warn( 'system.updateCPU exited because the window was not found.' );
		var $ = window.$;

		chrome.system.cpu.getInfo(function( data ){

			var index = 0;
			var prevUsage = window.prevUsage;

			data.processors.forEach(function( processor ){
				var usage = Math.floor(( ( ( prevUsage[ index ].usage.kernel + prevUsage[ index ].usage.user - processor.usage.kernel - processor.usage.user ) ) / ( prevUsage[ index ].usage.total - processor.usage.total ) ) * 100);
				$('.processor:nth(' + index + ') div').css( 'height' , usage + '%' );
				index++;
			});

			window.prevUsage = data.processors;

			setTimeout( Cynthia.modules.system.updateInfo , 900 );

		});

		var navigator = window.navigator;

		$('#internet').html( navigator.onLine ? 'Online' : 'Offline' );

    chrome.system.storage.getInfo(function( storageInfo ) {

      var storageElements = $('<div>');

      storageInfo.forEach(function( drive ){

        if( !drive.capacity ) return;
        var element = $('<div>').addClass('system-storage-element').html(
          '<div>' + Math.ceil( drive.capacity / 1024 / 1024 / 1024 * 100 ) / 100  + ' GB</div>' +
          '<div>"' + drive.name + '"<br/><span>' + drive.id  + '</span></div>'
        );

        storageElements.append( element );

      });

      $('.system-category-title:nth-child(3)').next().html( storageElements );

    })

    chrome.system.memory.getInfo(function( memoryInfo ) {

      var percentage = Math.ceil( ( memoryInfo.capacity - memoryInfo.availableCapacity ) / memoryInfo.capacity * 100 );
      $('#memoryCapacity').html(Math.ceil(memoryInfo.capacity/1024/1024/1024*100)/100 + ' GB (' + percentage + '%)');
      $('.system-memory > div').css('width',percentage+'%');

    });

		navigator.getBattery().then(function( batteryInfo ){

		  $('#batteryStatus').html( batteryInfo.charging ? 'Charging' : 'Unplugged' );
		  $('#batteryLevel').html( Math.floor( batteryInfo.level * 100 ) + '% (' + ( batteryInfo.dischargingTime != Infinity ? Math.floor( batteryInfo.dischargingTime / 60 / 60 * 100 ) / 100 + ' hours' : 'Plugged' ) + ')' );

		});

    chrome.system.display.getInfo(function(displayInfo) {

      var otherDisplays = 0;
      $('#otherDisplays,#primaryDisplay').html('');
      displayInfo.forEach(function( display ){

        var name = (display.name) ? display.name + ' - ' : '';
        var dpi = (display.dpiX) ? ' @ ' + display.dpiX + 'dpi' : '';
        var displayName = name + display.bounds.width + 'x' + display.bounds.height + dpi;
        var element = $('<div>').html(displayName);

        $( display.isPrimary ? '#primaryDisplay' : '#otherDisplays').append(element);
        !display.isPrimary && otherDisplays++;

      });

      !otherDisplays && $('#otherDisplays').html('-');

    });

    chrome.system.network.getNetworkInterfaces(function(networkInterfaces) {

      var localAdapters = $('#network')[0];
      localAdapters.innerHTML = '';

      networkInterfaces.sort(function(a, b) {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        if (a.address.length < b.address.length) return -1;
        if (a.address.length > b.address.length) return 1;
        return 0;
      });

      for (var i = 0; i < networkInterfaces.length; i++) {
        localAdapters.innerHTML += '<div>' + networkInterfaces[i].name + ' - ' +
            networkInterfaces[i].address.toUpperCase().replace(/(:|\.)/g, '<span class="dim">$1</span>') + '</div>';
      }

      if (localAdapters.textContent === '') { localAdapters.textContent = '-' };

    });


	}

}

Cynthia.modules.system = new CynthiaSystem();