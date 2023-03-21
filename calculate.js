// Globale Variablen
let gi_sunrise_hr;
let gi_sunrise_min;
let gi_sundown_hr;
let gi_sundown_min;

let gi_sun_marker = 0; // 1= vor Sonnenaufgang; 2= vor Sonnenuntergang; 0= Nachts

const gdb_latitude 	= 50.1; // Breitengrad (Dezimalgrad), am Beispiel Frankfurt a.M.
const gi_midday_hr 	= 13; // Sommerzeit, rechnerischer Mittag (Symmetrieachse); am Beispiel von Frankfurt a.M.: 13:30 Uhr (Winterzeit wird ermittelt)
const gi_midday_min 	= 30;

// Umwandlung: Grad zu Radiand
function to_radians(db_deg)
{
  return db_deg * Math.PI / 180;
};

// Sommer-(1)/Winterzeit(0)
Date.prototype.isdst=function()
{  
  new Date(1).getTimezoneOffset() / 60;
  return (((new Date(1).getTimezoneOffset() / 60)==(this.getTimezoneOffset() / 60))?0:1);
}

//Tag im Jahr
Date.prototype.yday=function()
{  
  let today = this.setHours(0,0,0,0);
  let newyear = new Date(this.getFullYear(), 0, 1);
  
  // Testing
  /* 
    alert('today: '+today+
 	     '\nnewyear: '+newyear+
 	     '\nceil: '+Math.ceil((today - newyear) / (24*60*60*1000) + 1)
 	     );
 	*/
  return Math.ceil((today - newyear) / (24*60*60*1000) + 1);
}


/*
/  Gesamte Tageslänge, Sonnenauf- und -untergang berechnen
/  
/  i_day: 			der aktuelle Tag als Zahl, relativ zum 21.3. (Frühlingsanfang)
/  i_tm_isdst: 	Marker für Winter- oder Sommerzeit; Winterzeit (0) / Sommerzeit (> 0)
/  
/  Hint: Diese Funktion kann auf korrekte Uhrzeitwerte getestet werden (gbool_run_test = 1)
*/
function p_sun_hr_per_day(i_day, i_tm_isdst) {

    // decl
    let bool_errorcode = 0;

    // sun declination
    let db_sun_declination = Math.atan(Math.sin(2*Math.PI*(i_day/365))*Math.tan(to_radians(23.45))); // Deklination der Sonne, Näherung
    let db_sun_hr = (((Math.asin(Math.sin(db_sun_declination)*Math.tan(to_radians(gdb_latitude)))) * 2 + Math.PI)/ (2 * Math.PI)) * 24; // Tageslänge, Näherung
    //printf("Today's day length is about %d:%d h.\n", (int)db_sun_hr, (int)((db_sun_hr-(int)db_sun_hr) *60));
    
    
    // sunrise
    // Vorgehen: Tageslänge/2 (wird NICHT aufgerundet!); Minuten mit der Mittagszeit addieren; Überhang+Stunden -> von der Mittagszeit abziehen
	 gi_sunrise_hr = gi_midday_hr-Math.floor(db_sun_hr/2);
	 gi_sunrise_min = (db_sun_hr/2-Math.floor(db_sun_hr/2)) *60;
	 
	 if(gi_sunrise_min <= gi_midday_min){
	 	gi_sunrise_min = gi_midday_min - gi_sunrise_min;
	 } else{
	 	gi_sunrise_min = gi_midday_min+60 - gi_sunrise_min;
	 	gi_sunrise_hr = gi_sunrise_hr -1;
	 };
    
    
    // sundown
    // Vorgehen: Zeit des Sonnenaufgangs + Tageslänge
	 gi_sundown_hr = Math.floor(db_sun_hr) + gi_sunrise_hr;
	 gi_sundown_min = gi_sunrise_min + Math.trunc((db_sun_hr-Math.floor(db_sun_hr))*60);
	 
	 if (gi_sundown_min >= 60){
	 		gi_sundown_hr = gi_sundown_hr +1;
	 		gi_sundown_min = gi_sundown_min - 60;
	 };
    
 	 // correction
 	 // Winterzeit-Korrektur, Winterzeit (tm_istdst == 0), Sommerzeit (tm_isdst > 0)
    if(i_tm_isdst == 0){
    		gi_sundown_hr = gi_sundown_hr-1;
    		gi_sunrise_hr = gi_sunrise_hr-1;
 	 };
 	 
 	 // Testing
 	 /*
 	   alert('i_day: '+i_day+
 	     '\ndb_sun_declination: '+db_sun_declination+
 	     '\ndb_sun_hr: '+db_sun_hr+
 	     '\ni_tm_isdst: '+i_tm_isdst+
 	     '\nfloor: '+Math.floor(db_sun_hr/2)+
 	     '\nfloor: '+(db_sun_hr/2-Math.floor(db_sun_hr/2)) *60
 	     );
    */
};


/*
/  Main
/	i_now_hr 	- aktuelle Zeit, Stunde als Zahl
/	i_now_min 	- aktuelle Zeit, Minute als Zahl
/	i_tm_isdst 	- Sommer- oder Winterzeit
/	i_tm_yday 	- Tag seit 1. Januar (0–365; 1. Januar = 0)
*/
function calculate_dates(i_now_hr, i_now_min, i_tm_isdst, i_tm_yday)
{
    
    // decl

    // night
    let i_night_hr = 3; // Uhrzeit, zu der noch sicher Nacht ist (in DE)

    // day
    let i_day = i_tm_yday - 80; // der aktuelle Tag als Zahl, relativ zum 21.3. (Frühlingsanfang, ohne Schaltjahr)
    
    // sunrise and -down
    p_sun_hr_per_day(i_day, i_tm_isdst);
    
    // func
    if((i_now_hr == gi_sunrise_hr && i_now_min < gi_sunrise_min) || (i_now_hr < gi_sunrise_hr && i_now_hr > i_night_hr)){
        // Wenn VOR Sonnenaufgang und NICHT Nachts
        gi_sun_marker = 1;
    } else if((i_now_hr == gi_sundown_hr && i_now_min < gi_sundown_min) || (i_now_hr < gi_sundown_hr && i_now_hr > i_night_hr)){
        // Wenn NACH Sonnenaufgang aber VOR Sonnenuntergang
        gi_sun_marker = 2;
    } else {
        // Nachts
        gi_sun_marker = 0;
    };
    
};


function generateDates() {
      
      const heute = new Date();
      
      // "It's now 17.3.2023, 12:57 h."
      var p_now = document.createElement('p');
      var myText = document.createTextNode('It\'s now '+heute.toLocaleString('de-DE')+' h.');
      p_now.appendChild(myText);
      document.getElementById('col1').appendChild(p_now);
      
      
      calculate_dates(heute.getHours(), heute.getMinutes(), heute.isdst(), heute.yday()); // Achtung: yday() setzt Zeit zurück auf 0 Uhr, darum zuletzt aufrufen!!!
      
      
   	// <div class= "sundown"><img src="sun.png"></div>
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
      
    
      // "Sunrise is today about at 06:41 h,<br/>sundown about at 18:20 h."
      var p_sun = document.createElement('p');
      var sunText = document.createTextNode('Sunrise is today about at '+gi_sunrise_hr+':'+Math.round(gi_sunrise_min)+' h,\nsundown about at '+gi_sundown_hr+':'+Math.round(gi_sundown_min)+' h.');
      p_sun.appendChild(sunText);
      document.getElementById('col1').appendChild(p_sun);
      
     //<p class="lettering">Sorry, you're too late to watch the sunrise today.<br/>But you have a chance to watch the sundown, it's also nice :)</p>
      var p_lettering = document.createElement('p');
      p_lettering.setAttribute('class', 'lettering');
      switch(gi_sun_marker) {
	       case 1: var LetterText = document.createTextNode('Congrats, you can watch the sunrise today :)');
	       	break;
	    	 case 2: var LetterText = document.createTextNode('Sorry, you\'re too late to watch the sunrise today.\nBut you have a chance to watch the sundown, it\'s also nice :)');
	    	   break;
	    	 default:var LetterText = document.createTextNode('What ... is it exactly, your trying to do? (:');
	    	   break;
	    };
	   p_lettering.appendChild(LetterText);
      document.getElementById('col2').appendChild(p_lettering);
     
};

window.onload = generateDates;



