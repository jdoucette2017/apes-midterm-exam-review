var database = firebase.database();
google.charts.load('current', {'packages':['corechart']});

var questionArray =[
	"Microscopic droplets or particles that can either have a warming or cooling effect",
	"Decline in soil quality and productivity",
	"Within each water molecule, ____ connect(s) two hydrogens to ever molecule",
	"____ are composed of amino acids.",

];
var answerArray = [
	["Aerosols", "Greenhouse Gases", "Carbon Dioxide", "Ash"],
	["Land Degredation", "Erosion", "Weathering", "Soil Degredation"],
	["Ionic Bonds", "Covalent Bonds", "Hydrogen Bonds", "Water Bonds"],
	["Proteins", "Lipids","aminos","acids"],
];
var correctAnswers = [
	"Aerosols", "Soil Degredation","Covalent Bonds", "Proteins",
];

var selectedAnswers = [];
var questionCounter = 0;
var numberCorrect = 0;
var correctCounter = 0;

$( document ).ready(function() {
    displayProgress();
    displayQuestion();
    displayAnswers();
});

var displayQuestion = function() {
	document.getElementById("questionText").innerHTML = questionArray[questionCounter]; 
}
var displayAnswers = function(){
	$("input").removeAttr("checked");
	var answers = answerArray[questionCounter];
	for (var i = 0; i < answers.length; i++) {
		var answerText = answers[i];
		var choiceName = "choice" + (i+1);
		document.getElementById(choiceName).innerHTML = answerText;
	}
}

var displayProgress = function() {
	var QNumb = questionCounter + 1;
	var QProgress = QNumb + "/" + questionArray.length;
	document.getElementById("QuestionNumber").innerHTML = QProgress;
}


var buttonClicked = function () {
	var radioButtons = document.getElementsByClassName("radioButton");
	var checkedFlag = false;
	for (var i = 0; i < radioButtons.length; i++){
		var currentButton = radioButtons[i];
		if(currentButton.checked == true){
			var checkedFlag = true;
			var choiceName = "choice" + (i+1);
			var selection = document.getElementById(choiceName).innerHTML
			selectedAnswers.push(selection);
			if(selection == correctAnswers[i]){
				correctCounter++;
			}
			break;
		}
	}
	if(checkedFlag == false){
		confirm("Please Select An Answer")
		return;
	}	
	console.log(correctCounter);
	questionCounter++;
	if (questionCounter >= questionArray.length){
		collectData();
		document.getElementById("buttonClicked").innerHTML = "End Test";
		window.location = "index3.html"
	}
	displayQuestion();
	displayAnswers();
	displayProgress();
}

var collectData = function() {
	var outputObject = {};
	for (var i =0; i< selectedAnswers.length; i++) {
		var outputValue = 0;
		if (answerArray[i].indexOf(selectedAnswers[i]) == correctAnswers[i]) {
			//question is correct
			outputValue = 1;
		}
		var outputKey = "question" + i;
		outputObject[outputKey] = outputValue;
	}
	sendData(outputObject);
}

var sendData = function(opobj) {	
	// Get a key for a new Post.
  	var newPostKey = firebase.database().ref().child('responses').push().key;
 	// Write the new response's data simultaneously to the database.
  	var updates = {};
  	updates['/responses/' + newPostKey] = opobj;
  	firebase.database().ref().update(updates);
  	readData();
}

var readData = function() {
	firebase.database().ref('/responses/').once('value').then(function(snapshot) {
  		// ...
  		console.log(snapshot.val());
  		//first calculate student score
  		var studentScore = 100*correctCounter / questionArray.length;
  		var classAverage = 0;
  		var classScore = 0;
  		var keys = Object.keys(snapshot.val());
  		var outputArray = [
  			['Grade', 'Number'],
  			['F', 0],
  			['D', 0],
  			['C', 0],
  			['B', 0],
  			['A', 0]
  		];
  		for (var i = 0; i< keys.length; i++) {
  			var key = keys[i];
  			var response = snapshot.val()[key];
  			var responseKeys = Object.keys(response);
  			var responseScore = 0;
  			for (var x = 0; x<responseKeys.length; x++) {
  				var responseKey = responseKeys[x];
  				responseScore+=response[responseKey];
  			}
  			var responsePercent = 100*responseScore / questionArray.length;
  			if (responsePercent >= 90) {
  				outputArray[5][1] += 1;
  			} else if (responsePercent >= 80) {
  				outputArray[4][1] += 1;
  			} else if (responsePercent >= 70) {
  				outputArray[3][1] += 1;
  			} else if (responsePercent >= 60) {
  				outputArray[2][1] += 1;
  			} else {
  				outputArray[1][1] += 1;
  			}
  			classScore+=responseScore;
  		}
  		classAverage = 100*classScore / (keys.length * questionArray.length);
  		classAverage = classAverage.toFixed(2);
  		$("#main").hide();
  		$("#scoreReport").show();
  		$("#totalScoreDiv").html("Your score: " + studentScore + "<br>Class Average: " + classAverage);
  		drawChart(outputArray);
	});
}
var drawChart = function(withData) {
        var data = google.visualization.arrayToDataTable(withData);

        var options = {
          title: 'Test Performance',
          hAxis: {title: 'Year',  titleTextStyle: {color: '#333'}},
          vAxis: {minValue: 0}
        };

        var chart = new google.visualization.AreaChart(document.getElementById('bellChartDiv'));
        chart.draw(data, options);

}