console.log("Hello World!");

$( function() {
	$(".draggable").draggable({
    scope: "buttonBox"});
} );

// Getter
var scope = $( ".selector" ).draggable( "option", "scope" );
 
// Setter
$( ".selector" ).draggable( "option", "scope", "buttonBox" );