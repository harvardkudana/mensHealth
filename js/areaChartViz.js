class areaChartViz{
    constructor(parentElement, wordData) {
        this.parentElement = parentElement;
        this.wordData = wordData;

        // parse date method
        this.parseDate = d3.timeParse("%Y-%m-%d");

        this.initVis();
    }

    initVis(){
        let vis = this;
        vis.cleanData();
        vis.data = vis.wordData;

        vis.margin = {top: 60, right: 230, bottom: 50, left: 50};

		vis.width = 660 - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.clip = vis.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height)
        .attr("x", 0)
        .attr("y", 0);

        vis.areaChart = vis.svg.append('g')
        .attr("clip-path", "url(#clip)")


        vis.x = d3.scaleTime()
        .range([0, vis.width])
        .domain(d3.extent(vis.cleanedData, d=>{
                return vis.parseDate(d.date.substring(0,10))
        }));

        let counts = vis.occurances.reduce((a, c) => {
            a[c] = (a[c] || 0) + 1;
            return a;
          }, {});

        let maxCount = Math.max(...Object.values(counts));

        vis.y = d3.scaleLinear()
        .range([vis.height, 0])
        .domain([0, maxCount])

        vis.xAxis = d3.axisBottom()
        .scale(vis.x);

        vis.yAxis = d3.axisLeft()
        .scale(vis.y);

        vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

        vis.svg.append("g")
        .attr("class", "y-axis axis");

        vis.svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", vis.width)
        .attr("y", vis.height+40 )
        .text("Time (year)");

        vis.svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", -20 )
        .text("# of times were mentioned")
        .attr("text-anchor", "start")
  
        vis.brush = d3.brushX()                 // Add the brush feature using the d3.brush function
        .extent( [ [0,0], [vis.width,vis.height] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on("end", vis.updateVis())

        let categories = vis.occurances.filter((item,
            index) => vis.occurances.indexOf(item) === index);
        
        let stack = d3.stack()
        .keys(categories);

        let stackedData = stack(vis.cleanedData);
		
        vis.stackedData = stackedData;


        vis.area = d3.area()
		.curve(d3.curveCardinal)
		.x(d => vis.x(d.data["date"]))
		.y0(d=> vis.y(d[0]))
        .y1(d=> vis.y(d[1]));

        vis.areaChart.selectAll("mylayers")
            .data(vis.stackedData)
            .enter()
            .append("path")
                .style("fill", d => {
                    return "red"
                    // return vis.colorScale(d)
                })
                .attr("d", vis.area)

      // Add the brushing
        vis.areaChart
        .append("g")
          .attr("class", "brush")
          .call(vis.brush);
    
        
        vis.wrangleData();

    }

    wrangleData(){
        let vis = this;
        
        vis.displayData = vis.stackedData;

		// Update the visualization
		vis.updateVis();
    }
    
    cleanData(){
        let vis = this;
        vis.occurances = []
        vis.cleanedData = [];
        for(let x = 0; x < vis.wordData.length; x++){
            let info = {abs:0, biceps: 0, legs:0, back:0, chest:0, arms:0, date: vis.wordData[x]["date"], id: vis.wordData[x]["id"], race: vis.wordData[x]["race"]}
            if (vis.wordData[x]["word"] == "biceps"){
                info["biceps"] = 1
                vis.occurances.push(vis.wordData[x]["word"])
                vis.cleanedData.push(info)
            }
            else if(vis.wordData[x]["word"] == "legs"){
                info["legs"] = 1
                vis.occurances.push(vis.wordData[x]["word"])
                vis.cleanedData.push(info)
            }
            else if(vis.wordData[x]["word"] == "back"){
                info["back"] = 1
                vis.occurances.push(vis.wordData[x]["word"])
                vis.cleanedData.push(info)
            }
            else if(vis.wordData[x]["word"] == "chest"){
                info["chest"] = 1
                vis.occurances.push(vis.wordData[x]["word"])
                vis.cleanedData.push(info)
            }
            else if(vis.wordData[x]["word"] == "abs"){
                info["abs"] = 1
                vis.occurances.push(vis.wordData[x]["word"])
                vis.cleanedData.push(info)
            }
            else if(vis.wordData[x]["word"] == "arms"){
                info["arms"] = 1
                vis.occurances.push(vis.wordData[x]["word"])
                vis.cleanedData.push(info)
            }
        }
    }
    updateVis(){
        let vis = this;
        vis.cleanData();

        let counts = vis.occurances.reduce((a, c) => {
            a[c] = (a[c] || 0) + 1;
            return a;
          }, {});

        let maxCount = Math.max(...Object.values(counts));

		// Update domain
        // Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer
        vis.y.domain([0, maxCount]);
       
        vis.areaChart
        .selectAll("path")
        .transition().duration(1000)
        .attr("d", (d) => {
            return vis.area(d)
        })
      

		// Call axis functions with the new domain
		vis.svg.select(".x-axis").call(vis.xAxis);
		vis.svg.select(".y-axis").call(vis.yAxis);
    }


}