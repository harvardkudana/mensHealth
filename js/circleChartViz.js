class circleChartViz{
    constructor(parentElement, wordData) {
        this.parentElement = parentElement;
        this.wordData = wordData;
        this.listOfNotWords = ['your', "the", "to", "in", "you", "for", "of", "this"] 
        this.colors = d3.scaleQuantize()
        .range(["#5E4FA2", "#3288BD", "#66C2A5", "#ABDDA4", "#E6F598", 
        "#FFFFBF", "#FEE08B", "#FDAE61", "#F46D43", "#D53E4F", "#9E0142"]);

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


        vis.size = d3.scaleLinear()
        .range([10, 40]);

        vis.fontSize = d3.scaleLinear()
        .range([10, 30]);


        vis.wrangleData();
    }

    wrangleData(){
        let vis = this;

        let listOfMostCommon = {};

        for (let x = 0; x < vis.wordData.length; x++){
            if (vis.wordData[x]["word"] in listOfMostCommon){
                listOfMostCommon[vis.wordData[x]["word"]]++;
            }
            else if (!(vis.listOfNotWords.indexOf(vis.wordData[x]["word"]) > -1)){
                listOfMostCommon[vis.wordData[x]["word"]] = 1;
            }
        }
       
        // Create items array
        var items = Object.keys(listOfMostCommon).map(function(key) {
            return [key, listOfMostCommon[key]];
        });
        
        // Sort the array based on the second element
        items.sort(function(first, second) {
            return second[1] - first[1];
        });

        vis.displayData = items;

        vis.updateVis();

        // console.log(items)
    }

    updateVis(){
        let vis = this;
        let numCircles = 20; 

        

        let min = vis.displayData[numCircles]
        let max = vis.displayData[0]
        let filtered = [];

        vis.colors.domain([min[1],max[1]])
        vis.colors.domain([min[1],max[1]])


        for (let x = 0; x < numCircles; x++){
            filtered.push(vis.displayData[x])
        }
    
       vis.size
       .domain([min[1], max[1]]);
       vis.fontSize
       .domain([min[1], max[1]]);
       

        let circles = vis.svg.selectAll("#areaChart")
        .data(filtered);

        let sizes = [];

        for (let x = 0; x < filtered.length; x++){
            
           let circle = {}
           circle["size"] = vis.size(filtered[x][1])
           circle["word"] = filtered[x][0]

           let cx = Math.floor(Math.random() * (vis.width ));
           let cy = Math.floor(Math.random() * (vis.height ));
           
           for(let z = 0; z < sizes.length; z++){
                let  otherCX = sizes[z]["location"][0]
                let  otherCY = sizes[z]["location"][1]
                let otherRadius = sizes[z]["size"]

                let circle1 = [otherCX, otherCY, otherRadius]

                let circle2 = [cx, cy, circle["size"]]

                while (vis.overlaps(circle1, circle2)){
                    cx = Math.floor(Math.random() * (vis.width ));
                    cy = Math.floor(Math.random() * (vis.height ));
                    circle2 = [cx, cy, circle["size"]]
                    z = 0
                }
           }
            circle["location"] = vis.overlapsWithAny([cx,cy,circle["size"]],sizes)
            sizes.push(circle)
        }

        circles
        .enter().append("circle")
        .style("stroke", "gray")
        .style("fill", d =>{
            return vis.colors(d[1])
        })
        .attr("r", d => {
            return(vis.size(d[1]))
        })
        .attr("cx", (d,i) => {
            return sizes[i]["location"][0]
        })
        .attr("cy", (d,i) => {
            return sizes[i]["location"][1]
        });

        circles.enter().append("text")
        .text((d,i) => {
            return d[0]
        })
        .attr("x", (d,i) => {
            return sizes[i]["location"][0]
        })
        .attr("y",(d,i) => {
            return sizes[i]["location"][1] + 5
        } )
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", d => {
            return vis.fontSize(d[1])
        })

    }

    overlapsWithAny(circle, circles){
        let vis = this; 
        let cx = circle[0]
        let cy = circle[1]
        for (let x = 0; x < circles.length;x++){
            let dx = circles[x]["location"][0]
            let dy = circles[x]["location"][1]
            let circleB = [dx,dy, circles[x]["size"]]
            while(vis.overlaps(circle, circleB)){
                cx = Math.floor(Math.random() * (vis.width ));
                cy = Math.floor(Math.random() * (vis.height ));
                circle = [cx, cy, circle[3]]
                x = 0
            }
        }

        return [cx,cy]
    }
    overlaps(circle1, circle2) {
        //Use distance formula to check if a circle overlaps with another circle.
        let x1 = circle1[0]
        let y1 = circle1[1]
        let radius1 = circle1[2]

        let x2 = circle2[0]
        let y2 = circle2[1]
        let radius2 = circle2[2]

        let distance = Math.sqrt(Math.pow(x1 - x2, 2) + (Math.pow(y1 - y2, 2)));
        if (distance + radius2 == radius1 || distance + radius1 == radius2){
            return true
        }

        return distance <= (radius1 + radius2) && distance >= Math.abs(radius1 - radius2)
}


}