class lineChartViz{
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

        vis.margin = {top: 40, right: 40, bottom: 60, left: 40};

		vis.width = 1000 - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.x = d3.scaleTime()
            .range([0, vis.width])
            .domain(d3.extent(vis.cleanedData, d=>{
                    return new Date("January 1").setFullYear(d.date.getFullYear())
            }));

        console.log(vis.x.domain()[0]);
        
        vis.y = d3.scaleLinear()
            .range([vis.height, 0])
            .domain([0, 8])

        vis.sexyPath = vis.svg.append("path")
            .attr("class", "line");

        vis.womenPath = vis.svg.append("path")
            .attr("class", "line");

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.svg.append("g")
            .attr("class", "y-axis axis");
                
        vis.wrangleData();


    }
    wrangleData(){
        let vis = this;
        
		// Update the visualization
		vis.updateVis();
    }

    cleanData(){
        let vis = this;
        vis.occurances = {}
        vis.cleanedData = [];
        for(let x = 0; x < vis.wordData.length; x++){
            // TODO: Add other intervals like minutes, seconds
            let currentYear = vis.wordData[x]["date"].getFullYear();
            let info = {sex : 0, women : 0, date: vis.wordData[x]["date"]}
            // Check if date already exists
            if (!(currentYear in vis.occurances)){
                // If it doesnt set all potential word values to 0
                vis.occurances[currentYear] = info;
            }

            if (vis.wordData[x]["word"] == "sex" || vis.wordData[x]["word"] == "sexy" || vis.wordData[x]["word"] == "hot" || vis.wordData[x]["word"] == "sexual"){
                vis.occurances[currentYear]["sex"]++;
            }
            else if(vis.wordData[x]["word"] == "women" || vis.wordData[x]["word"] == "woman" || vis.wordData[x]["word"] == "she" || vis.wordData[x]["word"] == "her" || vis.wordData[x]["word"] == "lady" || vis.wordData[x]["word"] == "ladies" || vis.wordData[x]["word"] == "girl"){
                vis.occurances[currentYear]["women"]++;
            }
        }
        vis.cleanedData = Object.values(vis.occurances);
        console.log(vis.cleanedData)
    }
    updateVis(){
        let vis = this;
        vis.cleanData();

        vis.sexyLine = d3.line()
            .x(d => vis.x(new Date("January 1").setFullYear(d.date.getFullYear())))
            .y(d => vis.y(d.sex))
            .curve(d3.curveLinear);

        vis.sexyPath.datum(vis.cleanedData)
            .attr("d", vis.sexyLine)
            .attr("fill", "none")
            .attr("stroke", "blue");

        vis.womenLine = d3.line()
            .x(d => vis.x(new Date("January 1").setFullYear(d.date.getFullYear())))
            .y(d => vis.y(d.women))
            .curve(d3.curveLinear);

        vis.womenPath.datum(vis.cleanedData)
            .attr("d", vis.womenLine)
            .attr("fill", "none")
            .attr("stroke", "pink");

        let circle = vis.svg.selectAll("circle")
            .data(vis.cleanedData);
        
        // Enter (initialize the newly added elements)
        circle.enter().append("circle")
            .attr("class", "dot")
            .attr("fill", "blue")
            // Enter and Update (set the dynamic properties of the elements)
            .merge(circle)
            .attr("r", 5)
            .attr("cx", d => vis.x(new Date("January 1").setFullYear(d.date.getFullYear())))
            .attr("cy", d => vis.y(d.sex));

        circle.enter().append("circle")
            .attr("class", "dot")
            .attr("fill", "pink")
            // Enter and Update (set the dynamic properties of the elements)
            .merge(circle)
            .attr("r", 5)
            .attr("cx", d => vis.x(new Date("January 1").setFullYear(d.date.getFullYear())))
            .attr("cy", d => vis.y(d.women));
        
        // Exit
        circle.exit().remove();

		// Call axis functions with the new domain
		vis.svg.select(".x-axis").call(vis.xAxis.ticks(d3.timeYear));
		vis.svg.select(".y-axis").call(vis.yAxis);
    }
}
