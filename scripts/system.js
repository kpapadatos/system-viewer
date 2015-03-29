// Cynthia System module
var SystemViewerFactory = function(){
  
  var obj = this;
  
	this.onLaunch = function(){

		newWindow({
			id: 'system',
			index: 'html/system.html',
			width: 600,
			height: 600,
			resizable: true,
			minWidth: 315,
			minHeight: 500,
			callback: function( window ){

				window.contentWindow.init = obj.initializeUI;
        window.contentWindow.init();
        
			}
		});

	};

	this.initializeUI = function(){

		this.onload = function(){

			var window = this;
			var system = obj;

			system.listResources( window );

		};

	};

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
				$('.system-cpu-pool').append('<div class="processor"><div class="ani04" style="height: ' + usage + '%"></div></div>');
			});

			$('.processor').css( 'width' , ( Math.round( 100 / data.processors.length ) - 1 ) + '%' );

      var operatingSystem;
      var navigator = window.navigator;
      var chromeVersion = navigator.userAgent.match('Chrome/([0-9]*\.[0-9]*\.[0-9]*\.[0-9]*)')[1];

      $('#chromeVersion').html( chromeVersion );

      if(/CrOS/.test(navigator.userAgent))    operatingSystem = 'Chrome OS';
      if(/Mac/.test(navigator.userAgent))     operatingSystem = 'Mac OS';
      if(/Win/.test(navigator.userAgent))     operatingSystem = 'Windows';
      if(/Android/.test(navigator.userAgent)) operatingSystem = 'Android';
      if(/Linux/.test(navigator.userAgent))   operatingSystem = 'Linux';

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
      
      if(plugins.length) $('#plugins').html( plugins.join(', ') );

			obj.updateInfo();

		});

	};

	this.updateInfo = function(){

		var window = chrome.app.window.get( 'system' ).contentWindow;
		if( !window ) return console.warn( 'system.updateCPU exited because the window was not found.' );
		var $ = window.$,
		    navigator = window.navigator;

    setInterval(updateCPU,        400); updateCPU();
    setInterval(updateRAM,       1000); updateRAM();
    setInterval(updateNetwork,  15000); updateNetwork();
    setInterval(updateMonitors, 20000); updateMonitors();
    setInterval(updateInternet,   900); updateInternet();
    setInterval(updateStorage,  10000); updateStorage();
    setInterval(updateBattery,  25000); updateBattery();

    function updateCPU(){
      chrome.system.cpu.getInfo(function( data ){
  
  			var index = 0;
  			var prevUsage = window.prevUsage;
  
  			data.processors.forEach(function( processor ){
  				var usage = Math.floor(( ( ( prevUsage[ index ].usage.kernel + prevUsage[ index ].usage.user - processor.usage.kernel - processor.usage.user ) ) / ( prevUsage[ index ].usage.total - processor.usage.total ) ) * 100);
  				$('.processor:nth(' + index + ') div').css( 'height' , usage + '%' );
  				index++;
  			});
  
  			window.prevUsage = data.processors;
  
  		});
    }
    
    function updateRAM(){
      chrome.system.memory.getInfo(function( memoryInfo ) {
  
        var percentage = Math.ceil( ( memoryInfo.capacity - memoryInfo.availableCapacity ) / memoryInfo.capacity * 100 );
        $('#memoryCapacity').html(Math.ceil(memoryInfo.capacity/1024/1024/1024*100)/100 + ' GB (' + percentage + '%)');
        $('.system-memory > div').css('width',percentage+'%');
  
      });
    }

		function updateInternet(){
  		$('#internet').html( navigator.onLine ? 'Online' : 'Offline' );
		}

    function updateStorage(){
      chrome.system.storage.getInfo(function( storageInfo ) {
  
        var storageElements = $('<div>');
  
        storageInfo.forEach(function( drive ){
  
          if( !drive.capacity ) return;
          var element = $('<div>').addClass('system-storage-element').html(
            '<div>' + Math.ceil( drive.capacity / 1024 / 1024 / 1024 * 100 ) / 100  + ' GB</div>' +
            '<div class="drive-name">' + (drive.name?'"'+drive.name+'"' : '<span class="ud">Untitled drive</span>') + '<br/><span>' + drive.id  + '</span></div>'
          );
          
          storageElements.append( element );
  
        });
  
        $('.system-category-title:nth-child(3)').next().html( storageElements );
  
      });
    }

    function updateBattery(){
      navigator.getBattery().then(function( batteryInfo ){
  
  		  $('#batteryStatus').html( batteryInfo.charging ? 'Charging' : 'Unplugged' );
  		  $('#batteryLevel').html( Math.floor( batteryInfo.level * 100 ) + '% (' + ( batteryInfo.dischargingTime != Infinity ? Math.floor( batteryInfo.dischargingTime / 60 / 60 * 100 ) / 100 + ' hours' : 'Plugged' ) + ')' );
  
  		});
    }

    function updateMonitors(){
      chrome.system.display.getInfo(function(displayInfo) {
  
        var otherDisplays = 0;
        $('#otherDisplays,#primaryDisplay').html('');
        displayInfo.forEach(function( display ){
  
          var name = (display.name) ? display.name + ' - ' : '';
          var dpi = (display.dpiX) ? ' @ ' + display.dpiX + 'dpi' : '';
          var displayName = name + display.bounds.width + 'x' + display.bounds.height + dpi;
          var element = $('<div>').html(displayName);
  
          $( display.isPrimary ? '#primaryDisplay' : '#otherDisplays').append(element);
          if(!display.isPrimary) otherDisplays++;
  
        });
  
        if(!otherDisplays) $('#otherDisplays').html('-');
  
      });
    }
    
    function updateNetwork(){
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
  
        if(localAdapters.textContent === '') localAdapters.textContent = '-';
  
      });
    }
	
	};

};