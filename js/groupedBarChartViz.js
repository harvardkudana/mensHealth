class groupedBarChartViz {
    constructor(parentElement, wordData) {
        this.parentElement = parentElement;
        this.wordData = wordData;
        this.colors = d3.scaleLinear()
            .range(["black", "red"]);

        // parse date method
        this.parseDate = d3.timeParse("%Y-%m-%d");
        this.parseYear = d3.timeParse("%Y");

        this.initVis();
    }
    initVis(){
        let vis = this;
        vis.cleanData();
        vis.data = vis.wordData;

        vis.margin = {top: 40, right: 40, bottom: 60, left: 40};

		vis.width = 800 - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.x = d3.scaleTime()
        .range([0, vis.width])
        .domain(d3.extent(vis.cleanedData, d=>{
                return d.date
        }));

        vis.y = d3.scaleLinear()
        .range([vis.height, 0])
        .domain([0, 5])


        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.legend = d3.select("#barChartDetails").append('div');

        vis.tooltip = d3.select("#barChartDetails").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip')

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
            let info = {days : 0, weeks : 0, months : 0, date: vis.wordData[x]["date"]}
            // Check if date already exists
            if (!(currentYear in vis.occurances)){
                // If it doesnt set all potential word values to 0
                vis.occurances[currentYear] = info;
            }

            if (vis.wordData[x]["word"] == "minute" || vis.wordData[x]["word"] == "minutes" || vis.wordData[x]["word"] == "second" || vis.wordData[x]["word"] == "seconds" || vis.wordData[x]["word"] == "hour" || vis.wordData[x]["word"] == "hours"){
                vis.occurances[currentYear]["days"]++;
            }
            else if(vis.wordData[x]["word"] == "week" || vis.wordData[x]["word"] == "weeks" || vis.wordData[x]["word"] == "day" || vis.wordData[x]["word"] == "days"){
                vis.occurances[currentYear]["weeks"]++;
            }
            else if(vis.wordData[x]["word"] == "month" || vis.wordData[x]["word"] == "months" || vis.wordData[x]["word"] == "year" || vis.wordData[x]["word"] == "years"){
                vis.occurances[currentYear]["months"]++;
            }
        }
        vis.cleanedData = Object.values(vis.occurances);
    }

    updateVis(){
        let vis = this;
        vis.cleanData();

        vis.colors.domain([0, 1]);

        vis.legend.html(`
            <p><em>Legend</em><p>
            <ul>
                <li style="color:${vis.colors(0.9)}">Short Time Frame ( < Day)</li>
                <li style="color:${vis.colors(0.3)}">Medium Time Frame (Between Day and Week)</li>
                <li style="color:${vis.colors(0.6)}">Long Time Frame ( > Month)</li>
            </ul>
        `);

		// Draw the layers
		let rect = vis.svg.selectAll("rect")
            .data(vis.cleanedData);

        rect.enter().append("rect")
            .attr("fill", vis.colors(0.9))
            // Enter update
            .merge(rect)
            .attr("id", d => "days" + d.date.getFullYear())
            .attr("x", d => vis.x(new Date().setFullYear(d.date.getFullYear())) - 10)
            .attr("y", d => vis.y(d.days))
            .attr("width", 10)
            .attr("height", d => vis.height - vis.y(d.days))
            .on('mouseout', function (event, d) {
                vis.svg.selectAll("rect")
                    .transition(800)
                    .style("opacity", 1);

                vis.svg.select("#days" + d.date.getFullYear())
                    .transition(800)
                    .style("opacity", 1)
                    .style("stroke", "none");

                vis.tooltip.data(vis.cleanedData)
                    .style("opacity", 0);
            })
            .on('mouseover', function (event, d) {
                // Update the size of the hovered circle
                vis.svg.selectAll("rect")
                    .transition(800)
                    .style("opacity", 0.5);

                vis.svg.select("#days" + d.date.getFullYear())
                    .transition(800)
                    .style("opacity", 1)
                    .style("stroke", "black");
                
                vis.tooltip.data(vis.cleanedData)
                    .style("opacity", 1)
                    .html(`
                        <div style="border: thick solid ${vis.colors(0.9)}; border-radius: 5px; background-color: white; padding: 15px; width: 95%">
                            <h4>Year : ${d.date.getFullYear()}</h4>
                            <h5>Words Capturing a Time Period of < 1 Day : ${d.days}</h5>
                            <h6>Eligible Terms Found :</h6>
                            <ul>
                                <li>Seconds</li>
                                <li>Minutes</li>
                                <li>Hours</li>
                            </ul>
                        </div>
                    `);
            });
            

        rect.enter().append("rect")
            .attr("fill", vis.colors(0.3))
            // Enter update
            .merge(rect)
            .attr("id", d => "weeks" + d.date.getFullYear())
            .attr("x", d => vis.x(new Date().setFullYear(d.date.getFullYear())))
            .attr("y", d => vis.y(d.weeks))
            .attr("width", 10)
            .attr("height", d => vis.height - vis.y(d.weeks))
            .on('mouseout', function (event, d) {
                vis.svg.selectAll("rect")
                    .transition(800)
                    .style("opacity", 1);

                vis.svg.select("#weeks" + d.date.getFullYear())
                    .transition(800)
                    .style("opacity", 1)
                    .style("stroke", "none");

                vis.tooltip.data(vis.cleanedData)
                    .style("opacity", 0);
            })
            .on('mouseover', function (event, d) {
                // Update the size of the hovered circle
                vis.svg.selectAll("rect")
                    .transition(800)
                    .style("opacity", 0.5);

                vis.svg.select("#weeks" + d.date.getFullYear())
                    .transition(800)
                    .style("opacity", 1)
                    .style("stroke", "black");
                
                vis.tooltip.data(vis.cleanedData)
                    .style("opacity", 1)
                    .html(`
                        <div style="border: thick solid ${vis.colors(0.3)}; border-radius: 5px; background-color: white; padding: 15px; width: 95%">
                            <h4>Year : ${d.date.getFullYear()}</h4>
                            <h5>Words Capturing a Time Period > 1 Day but < 1 Month : ${d.weeks}</h5>
                            <h6>Eligible Terms Found :</h6>
                            <ul>
                                <li>Days</li>
                                <li>Weeks</li>
                            </ul>
                        </div>
                    `);
            });

        rect.enter().append("rect")
            .attr("fill", vis.colors(0.6))
            // Enter update
            .merge(rect)
            .attr("id", d => "months" + d.date.getFullYear())
            .attr("x", d => vis.x(new Date().setFullYear(d.date.getFullYear())) + 10)
            .attr("y", d => vis.y(d.months))
            .attr("width", 10)
            .attr("height", d => vis.height - vis.y(d.months))
            .on('mouseout', function (event, d) {
                vis.svg.selectAll("rect")
                    .transition(800)
                    .style("opacity", 1);

                vis.svg.select("#months" + d.date.getFullYear())
                    .transition(800)
                    .style("opacity", 1)
                    .style("stroke", "none");

                vis.tooltip.data(vis.cleanedData)
                    .style("opacity", 0);
            })
            .on('mouseover', function (event, d) {
                // Update the size of the hovered circle
                vis.svg.selectAll("rect")
                    .transition(800)
                    .style("opacity", 0.5);

                vis.svg.select("#months" + d.date.getFullYear())
                    .transition(800)
                    .style("opacity", 1)
                    .style("stroke", "black");
                
                vis.tooltip.data(vis.cleanedData)
                    .style("opacity", 1)
                    .html(`
                        <div style="border: thick solid ${vis.colors(0.6)}; border-radius: 5px; background-color: white; padding: 15px; width: 95%">
                            <h4>Year : ${d.date.getFullYear()}</h4>
                            <h5>Words Capturing a Time Period > 1 Month : ${d.months}</h5>
                            <h6>Eligible Terms Found :</h6>
                            <ul>
                                <li>Months</li>
                                <li>Years</li>
                            </ul>
                        </div>
                    `);
            });

        rect.exit().remove();

		// Call axis functions with the new domain
		vis.svg.select(".x-axis").call(vis.xAxis.ticks(d3.timeYear));
		vis.svg.select(".y-axis").call(vis.yAxis);
    }
}