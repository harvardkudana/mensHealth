class heatMapViz{
    constructor(parentElement, wordData) {
        this.parentElement = parentElement;
        this.wordData = wordData;
        this.colors = d3.scaleQuantize()
        .range(["#5E4FA2", "#3288BD", "#66C2A5", "#ABDDA4", "#E6F598", 
        "#FFFFBF", "#FEE08B", "#FDAE61", "#F46D43", "#D53E4F", "#9E0142"]);

        this.parseDate = d3.timeParse("%Y-%m-%d");
        this.month = ["Jan","Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


        this.initVis();
    }

    initVis(){
        let vis = this

        vis.margin = {top: 40, right: 40, bottom: 60, left: 40};
		vis.width = 700 - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;
        
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        for (let x = 0; x < vis.wordData.length; x++){
            vis.wordData[x]["date"] = vis.parseDate( vis.wordData[x]["date"].substring(0,10))
        }

        vis.wrangleData();

        vis.color = d3.scaleSequential()
        .interpolator(d3.interpolateInferno)


        vis.y = d3.scaleBand()
        .range([vis.height, 0])
        .domain(vis.month);

        vis.yAxis = d3.axisLeft()
        .scale(vis.y);

        vis.svg.append("g")
        .attr("class", "y-axis axis")
        .style("font-size", 10)
        .attr("transform", "translate(0,0)");



        vis.x = d3.scaleTime()
        .range([0, vis.width])
        .domain(d3.extent(vis.wordData, d=>{
                return d.date
        }));

        vis.xAxis = d3.axisBottom()
        .scale(vis.x);

        vis.svg.append("g")
        .attr("class", "x-axis axis")
        .style("font-size", 10)
        .attr("transform", "translate(0," + vis.height + ")");

        vis.updateVis();
    }

    wrangleData(){
        let vis = this 

        let cleanedDict = {};

        for (let x = 0; x < vis.wordData.length; x++){
            if (cleanedDict[vis.wordData[x]["date"]] == null) {
                cleanedDict[vis.wordData[x]["date"]] = 1;
            }
            else{
                cleanedDict[vis.wordData[x]["date"]] = 1 + cleanedDict[vis.wordData[x]["date"]]
            }
        }
        vis.cleanedList = []

        for (const [key, value] of Object.entries(cleanedDict)) {
            vis.cleanedList.push([key,value])
        }
       vis.cleanedDict = cleanedDict
        let yearExtent = d3.extent(vis.wordData, d=>{
            return d.date
            });
        let firstYear = yearExtent[0].getFullYear()
        let lastYear = yearExtent[1].getFullYear()

        vis.years = []
        for (let x = 0; x <= (lastYear - firstYear); x++){
            vis.years[x] = x + firstYear
        }
    }

    updateVis(){
        let vis = this; 		// Call axis functions with the new domain
        
        vis.color
        .domain(d3.extent(vis.cleanedList, d=>{
            return d[1]
          }))

       vis.svg.selectAll()
       .data(vis.cleanedList)
       .enter()
       .append("rect")
        .attr("x", function(d,i) { 
            let date = new Date(d[0].substring(0,25))
            date = new Date(date.getFullYear(), 1)
            if (date.getFullYear() == 1995){
                return - 100
            }
            return (vis.x(date) - 15)})
        .attr("y", function(d) { 
            let date = new Date(d[0].substring(0,25))
            return vis.y(vis.month[date.getMonth()])})
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", vis.y.bandwidth )
        .attr("height", vis.y.bandwidth )
        .style("fill", (d) => {
            console.log(d)
            return vis.color(d[1])
        })

 
		vis.svg.select(".x-axis").call(vis.xAxis);
		vis.svg.select(".y-axis").call(vis.yAxis);
    }
        
}