// decl - global variables
let gi_sunrise_hr;
let gi_sundown_hr;
let gi_sun_marker = 0; // 1= vor Sonnenaufgang; 2= vor Sonnenuntergang; 0= Nachts

// decl - global constants
const gbool_testing	= true; 	// Test ausführen = true; Tests nicht ausführen = false
const gi_night_hr 	= 3; 		// Uhrzeit zu der noch sicher Nacht ist; am Beispiel Deutschland
const gi_max_sun_hr	= 17; 	// Maximale Tageslänge als Stundenzahl; am Beispiel Deutschland mit fast 17 Stunden im Juni (zu Testzwecken)
const gdb_latitude 	= 50.1; 	// Breitengrad (Dezimalgrad); am Beispiel Frankfurt a.M.: 50.1
const gi_midday_hr   = 11.5 + 2; // rechnerischer Mittag (Symmetrieachse) = 11.5 UTC; am Beispiel von Frankfurt a.M.: UTC+2


// returns the conversion of degrees to radians
function deg_to_rad(db_deg)
{
  return db_deg * Math.PI / 180; // Grad zu Radiand Umwandlung
};

// returns summer (1) or winter time (0)
Date.prototype.isdst=function()
{  
  new Date(1).getTimezoneOffset() / 60;
  return (((new Date(1).getTimezoneOffset() / 60)==(this.getTimezoneOffset() / 60))?0:1); // im Vergleich ermittelt: Sommer-(1) oder Winterzeit(0)
}

// returns the counted day of the year; e.g. 31.1. = 31, 1.2. = 32
Date.prototype.yday=function()
{  
  let today = this.setHours(0,0,0,0); // heute, als Tag ohne Berücksichtigung der Stunden
  let newyear = new Date(this.getFullYear(), 0, 1); // Neujahrstag des aktuellen Jahres
  return Math.ceil((today - newyear) / (24*60*60*1000) + 1); // Differenz als gezählter Tag
}

// returns the "hh:mm"(string) of a dezimal time (hour)
function dec_to_hr(i_hr) {
	return Math.floor(i_hr)+':'+Math.round((i_hr-Math.floor(i_hr))*60).toString().padStart(2, '0');
};



/*
/  Calculates total day length, sunrise and sunset
/  
/  i_now_hr:		locale time in hr (+ min/60)!
/  i_tm_yday: 		what day of the year?
/  i_tm_isdst: 	summer (1) or winter time (0)? // Marker für Sommer- oder Winterzeit
*/
Date.prototype.sun_hr_per_day=function()
{
	 
	 //error handling
	 try {
		 
	    // decl
	    let bool_errorcode = 0;
	    let i_now_hr = this.getHours() + this.getMinutes()/60 // aktuelle Zeit
	    let i_tm_isdst = this.isdst();
	    
	    // Achtung: yday() setzt Zeit zurück auf 0 Uhr, darum zuletzt aufrufen!!!
	    var d_spring  = new Date(this.getFullYear(), 2, 21); // 21.3. (Frühlingsanfang) als Zahl
	    let i_day = this.yday() - d_spring.yday(); // der aktuelle Tag als Zahl, relativ zum 21.3.
		
	
	    // sun declination
	    let db_sun_declination = Math.atan(Math.sin(2*Math.PI*(i_day/365))*Math.tan(deg_to_rad(23.45))); // Deklination der Sonne, Näherung
	    let db_sun_hr = (((Math.asin(Math.sin(db_sun_declination)*Math.tan(deg_to_rad(gdb_latitude)))) * 2 + Math.PI)/ (2 * Math.PI)) * 24; // Tageslänge, Näherung
	    
	    //testing day length
	    if(gbool_testing && (db_sun_hr >= gi_max_sun_hr)){
	    	window.alert('Attention: Today\'s day length is about '+Math.floor(db_sun_hr)+':'
	    	            +Math.round((db_sun_hr-Math.floor(db_sun_hr)) *60).toString().padStart(2, '0')
	    	      		+' h.\nPlease check the Input.');
	    };
	    
	    // sunrise
		 gi_sunrise_hr = gi_midday_hr- db_sun_hr/2;
	    
	    // sundown
		 gi_sundown_hr = db_sun_hr + gi_sunrise_hr;
		 
	    
	 	 // correction wintertime; winter (tm_istdst = 0) / summer (tm_isdst > 0)
	    if(i_tm_isdst == 0){ 
	    		gi_sundown_hr = gi_sundown_hr-1; // Winterzeit-Korrektur -1
	    		gi_sunrise_hr = gi_sunrise_hr-1; // Winterzeit-Korrektur -1
	 	 };
	    
	    
	    // can we still see the sunrise, the sundown or is it night?
	    if(i_now_hr <= gi_sunrise_hr && i_now_hr > gi_night_hr){
	        // Wenn VOR Sonnenaufgang und NICHT Nachts
	        gi_sun_marker = 1;
	    } else if(i_now_hr <= gi_sundown_hr && i_now_hr > gi_night_hr){
	        // Wenn NACH Sonnenaufgang aber VOR Sonnenuntergang
	        gi_sun_marker = 2;
	    } else {
	        // Nachts
	        gi_sun_marker = 0;
	    };
	 	 
 	 
 	 //error handling
 	 }catch(err) {
 	 	window.alert('Hi, im sorry to inform you that something went wrong.\n'
 	 			      +'Where?: p_sun_hr_per_day('+i_day+', '+i_tm_isdst+')\n'
 	 				   +'What?: '+ err.message);
 	 };
};



function generateDates() {
	
	//error handling
	 try {
      
      const t_today = new Date();
      
      // Text: local date and time
      var p_now = document.createElement('p');
      var myText = document.createTextNode('It\'s now '+t_today.toLocaleString('de-DE')+' h.');
      p_now.appendChild(myText);
      document.getElementById('col1').appendChild(p_now);
      
      
      //func
      t_today.sun_hr_per_day();
      
      
   	// Image of sunrise or -down
      var div_sun = document.createElement('div');
	    switch(gi_sun_marker) {
	       case 1: div_sun.setAttribute('class', 'sunrise');
	       	break;
	    	 case 2: div_sun.setAttribute('class', 'sundown');
	    	   break;
	    	 default: break;
	    };
      var img_sun = document.createElement('img');
      img_sun.setAttribute('src', 'sun.png');
      div_sun.appendChild(img_sun);
      document.getElementById('col1').appendChild(div_sun);
      
    
      // Text: sunrise and -down time
      var p_sun = document.createElement('p');
      var sunText = document.createTextNode('Sunrise is today approx. at '+dec_to_hr(gi_sunrise_hr)
                                           +' h,\nsundown approx. at '+dec_to_hr(gi_sundown_hr)+' h.');
      p_sun.appendChild(sunText);
      document.getElementById('col1').appendChild(p_sun);
      
     // Text: the leaflet (can I watch the sunrise or -down?)
      var p_lettering = document.createElement('p');
      p_lettering.setAttribute('class', 'lettering');
      switch(gi_sun_marker) {
	       case 1: var LetterText = document.createTextNode('Congrats, you can watch the sunrise today :)');
	       	break;
	    	 case 2: var LetterText = document.createTextNode('Sorry, you\'re too late to watch the sunrise today.'
	    	 																 +'\nBut you have a chance to watch the sundown, it\'s also nice :)');
	    	   break;
	    	 default:var LetterText = document.createTextNode('What ... is it exactly, your trying to do? (:');
	    	   break;
	    };
	   p_lettering.appendChild(LetterText);
      document.getElementById('col2').appendChild(p_lettering);
      
 	 //error handling
 	 }catch(err) {
 	 	window.alert('Hi, im sorry to inform you that something went wrong.\n'
 	 				   +'Where?: generateDates)\n'
 	 					+'What?: '+ err.message);
 	 };
     
};

// onchange date (user input)
function getDate() {
	
	try{
		
		var d_userinput  = new Date(document.getElementById('getDate').value);// Eingabewert
		
		//func
		d_userinput.sun_hr_per_day();
		
		//alert
		window.alert('Sunrise on '+d_userinput.toLocaleString('de-DE', {year: 'numeric', month: '2-digit', day: '2-digit'})
						 +' is approx. at '+dec_to_hr(gi_sunrise_hr)
	                +' h,\nsundown approx. at '+dec_to_hr(gi_sundown_hr)+' h.');
		
 	 //error handling
 	 }catch(err) {
 	 	window.alert('Hi, im sorry to inform you that something went wrong.\n'
 	 				   +'Where?: getDate)\n'
 	 					+'What?: '+ err.message);
 	 };
};


// onload
window.onload = generateDates;


