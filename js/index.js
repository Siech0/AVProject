console.log("Hello World!");

$( function() {
	$(".draggable").draggable({
    scope: "buttonBox"});
} );

//Function to hide master_main_container id
$( function() {
    $("#master_close").click(function(){
        $("#master_main_container").hide(500);
    });
});

//Function to hide breakers_main_container id
$( function() {
    $("#breakers_close").click(function(){
        $("#breakers_main_container").hide(500);
    });
});

//Function to hide switches_main_container id
$( function() {
    $("#switches_close").click(function(){
        $("#switches_main_container").hide(500);
    });
});

//Function to hide switches_main_container id
$( function() {
    $("#master_button").click(function(){
        $("#master_main_container").show(500);
    });
});

//Function to hide switches_main_container id
$( function() {
    $("#breaker_button").click(function(){
        $("#breaker_main_container").show(500);
    });
});

//Function to hide switches_main_container id
$( function() {
    $("#switches_button").click(function(){
        $("#switches_main_container").show(500);
    });
});

//Function to switch master_alt on and off !! Will play music !!
$( function() {
    $("#master_switch_alt").click(function(){
       if ($("#master_switch_alt").hasClass("master_switch_off_alt"))
           {
               $("#master_switch_alt").removeClass("master_switch_off_alt");
               $("#master_switch_alt").addClass("master_switch_on_alt");
               $("#master_switch_bat").removeClass("master_switch_off_bat");
               $("#master_switch_bat").addClass("master_switch_on_bat");
               $("#audio_master").trigger("play");
           }
        else
            {
               $("#master_switch_alt").removeClass("master_switch_on_alt");
               $("#master_switch_alt").addClass("master_switch_off_alt");                
            }
    });
});

//Function to switch master_bat on and off
$( function() {
    $("#master_switch_bat").click(function(){
       if ($("#master_switch_bat").hasClass("master_switch_off_bat"))
           {
               $("#master_switch_bat").removeClass("master_switch_off_bat");
               $("#master_switch_bat").addClass("master_switch_on_bat");
           }
        else
            {
               $("#master_switch_bat").removeClass("master_switch_on_bat");
               $("#master_switch_bat").addClass("master_switch_off_bat"); 
               $("#master_switch_alt").removeClass("master_switch_on_alt");
               $("#master_switch_alt").addClass("master_switch_off_alt");
            }
    });
});

// Getter
var scope = $( ".selector" ).draggable( "option", "scope" );

// puts svg into wrapper.
$( "#svg_wrapper" ).load("images/C172SSchematic.svg");	
 
// Setter
$( ".selector" ).draggable( "option", "scope", "buttonBox" );