/* main JS file */
let myBarChart;
let myCirlceChart;
let myAreaChart;
let myHeatMap;
let myWordTree;


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
    // myBarChart = new MatrixTable('matrixDiv', dataArray[0])
    console.log(dataArray[0])
    console.log(dataArray[1])

    myAreaChart = new areaChartViz("areaChart", dataArray[0])
    myCirlceChart = new circleChartViz("circleChart", dataArray[0])
    myHeatMap = new heatMapViz("heatMap", dataArray[0])
    myWordTree = new wordTreeViz("wordTree","fat", dataArray[0], dataArray[1])

}