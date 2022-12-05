/* main JS file */
let myBarChart;
let myCirlceChart;
let myAreaChart;
let myHeatMap;
let myWordTree;
let myBirthdayViz;
let myLineChartViz;
let vizDict;


let promises = [
    d3.csv("data/wordData.csv"),
    d3.csv("data/word-pairData.csv")
]

Promise.all(promises)
	.then(function(data){
		initMainPage(data)
	})
    .catch(function (err) {
        console.log(err)
    });

function initMainPage(dataArray){

    vizDict = {"circleChart" : "wordTree", "wordTree": "heatMap", "heatMap": "circleChart"}
    getParentElement();
    d3.select("#chartTitle").text("20 most common words in Men's Health Magazine Covers")


    myAreaChart = new areaChartViz("areaChart", dataArray[0])
    myHeatMap = new heatMapViz("heatMap", dataArray[0])
    myWordTree = new wordTreeViz("wordTree","muscle", dataArray[0], dataArray[1])
    myCirlceChart = new circleChartViz("circleChart", dataArray[0], dataArray[1], myWordTree)
    myBirthdayViz = new brithdayViz("birthdayViz")
    myBarChart = new groupedBarChartViz("groupedBarChart", dataArray[0])
    myLineChartViz = new lineChartViz("lineChart", dataArray[0])

}

function changeMap(){
    myHeatMap.changeMap()
}

/* * * * * * * * * * * * * *
*         Carousel         *
* * * * * * * * * * * * * */

// Create bootstrap carousel, disabling rotating
let carousel = new bootstrap.Carousel(document.getElementById('magazineCarousel'), {interval: false})


// on button click switch view
function switchViewBack() {
    getParentElement();
        carousel.prev();
        getParentElement();

}

function switchViewFront() {
    getParentElement();
    carousel.next();
    getParentElement();
}

function getParentElement(){
    let parentElement = document.getElementsByClassName("active")[0]

    let children = parentElement.children
    let chosenWord = "muscle"
    console.log(children[0])
    console.log(children[0].children[0].children[0].id)
    if(vizDict[children[0].children[0].children[0].id] == "circleChart"){
       d3.select("#chartTitle").text("20 most common words in Men's Health Magazine Covers")
    }
    else if(vizDict[children[0].children[0].children[0].id] == "wordTree"){
        d3.select("#chartTitle").text("Word Tree - 3 most common subsequent words")
    }
    else if(vizDict[children[0].children[0].children[0].id] == "heatMap"){
        d3.select("#chartTitle").text("Calendar Heat Map")
    }
}