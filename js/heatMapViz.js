class heatMapViz{
    constructor(parentElement, wordData) {
        this.parentElement = parentElement;
        this.wordData = wordData;

        this.parseDate = d3.timeParse("%Y-%m-%d");
        this.month = ["Jan","Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        for (let x = 0; x < this.wordData.length; x++){
            this.wordData[x]["date"] = this.parseDate(this.wordData[x]["date"].substring(0,10))
        }
        this.ofRace = true;
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
        .attr("id", "heatMapSVG")
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", vis.width)
        .attr("y", vis.height+40 )
        .text("Year");


        let chartTitle = ""; 
        if(vis.ofRace == false){
            chartTitle = "# of words / magazine"
            vis.color = d3.scaleSequential()
            .interpolator(d3.interpolateInferno)
        }
        else{
            chartTitle = "Race of cover  model"
            vis.color = {"white":"white", "black":"#422518", "asian":"orange"}
        }

        vis.svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", -20 )
        .text(chartTitle)
        .attr("text-anchor", "start")




        vis.wrangleData();

        vis.tooltip =d3.select("#" + vis.parentElement).append('div')
        .attr('class', "tooltip")
        .attr('id', 'magTooltip')
        .attr("width", 100)
        .attr("height", 100)

    
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
                if(vis.ofRace){
                    cleanedDict[vis.wordData[x]["date"]] = vis.wordData[x]["race"];
                }
                else{
                    cleanedDict[vis.wordData[x]["date"]] = 1;
                }
            }
            else if (vis.ofRace == false){
                cleanedDict[vis.wordData[x]["date"]] = 1 + cleanedDict[vis.wordData[x]["date"]]
            }
        }

        vis.picDict = {};
        
        for (let x = 0; x < vis.wordData.length; x++){
            if (vis.picDict[vis.wordData[x]["date"]] == null) {
                    vis.picDict[vis.wordData[x]["date"]] = vis.wordData[x]["id"];            
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
        if (!vis.ofRace){
            let arr = d3.extent(vis.cleanedList, d=>{
                return d[1]
              });
            vis.min = arr[0]
    
            vis.max = arr[1]
        }
    }

    updateVis(){
        let vis = this; 		// Call axis functions with the new domain
        
        if(!vis.ofRace){
            vis.color
            .domain([vis.min,vis.max])
        }

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
            if(vis.ofRace){
                return vis.color[d[1]]
            }
            return vis.color(d[1])
        })
        .on('mouseover', function(event, d){

            let jpeg = ""            
            jpeg = "imgs/" + vis.picDict[d[0]] + ".jpg" 
            d3.select(this)
            .attr('stroke-width', '3px')
            .attr('stroke', 'black')
            
            vis.tooltip
            .style("opacity", 1)
            .attr("x", 0)
            .attr("y", -600)
            .style("left", (event.pageX - 150)+ "px")
            .style("top", (event.pageY - 250)+"px")
            .html(`
                <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                    <img src="${jpeg}" alt="image is not available" height = "200" width = "150">                                                                      
                </div>
                `);
        })
        .on('mouseout', function(event, d){
            d3.select(this)
                .attr('stroke-width', '1px')
            
            vis.tooltip
                .style("opacity", 0)
                .style("left", 0)
                .style("top", 0)
                .html(``);
        })
        .attr("stroke", "black")
        .attr('stroke-width', '1px');

        vis.svg.append("rect")
        .attr("x", 200)
        .attr("y", -35)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", vis.y.bandwidth )
        .attr("height", vis.y.bandwidth )
        .style("fill", (d) => {
            if(vis.ofRace){
                return vis.color["white"]
            }
            return vis.color(vis.min)
        })

        vis.svg.append("rect")
        .attr("x", 300)
        .attr("y", -35)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", vis.y.bandwidth )
        .attr("height", vis.y.bandwidth )
        .style("fill", (d) => {
            if(vis.ofRace){
                return vis.color["black"]
            }
            return vis.color(vis.max)
        })

        let boxOne = "Max"
        let boxTwo = "Min"
        if(vis.ofRace){
            boxOne = "black"
            boxTwo = "white"

            vis.svg.append("text")
            .text("asian")
            .attr("x", 530)
            .attr("y", -15)
    
            vis.svg.append("text")
            .text("other")
            .attr("x", 430)
            .attr("y", -15)

            vis.svg.append("rect")
            .attr("x", 500)
            .attr("y", -35)
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("width", vis.y.bandwidth )
            .attr("height", vis.y.bandwidth )
            .style("fill", (d) => {
                return "orange"
            })
    
            vis.svg.append("rect")
            .attr("x", 400)
            .attr("y", -35)
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("width", vis.y.bandwidth )
            .attr("height", vis.y.bandwidth )
            .style("fill", (d) => {
                return "black"
            })
        }
        vis.svg.append("text")
        .text(boxOne)
        .attr("x", 330)
        .attr("y", -15)

        vis.svg.append("text")
        .text(boxTwo)
        .attr("x", 230)
        .attr("y", -15)

 
		vis.svg.select(".x-axis").call(vis.xAxis);
		vis.svg.select(".y-axis").call(vis.yAxis);
    }

    changeMap(){
       let vis = this

       console.log("removed")
       d3.select("#heatMapSVG").remove();
        vis.ofRace = (vis.ofRace == false)


        vis.initVis()

    }
        
}