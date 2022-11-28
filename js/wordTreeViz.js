class wordTreeViz{
    constructor(parentElement, word, wordPairData) {
        this.parentElement = parentElement;
        this.word = word;
        this.wordPairData = wordPairData;
        this.listOfNotWords = ['your', "the", "to", "in", "you", "for", "of", "this"] 

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

        vis.wrangleData();
    }

    wrangleData(){
        let vis = this;
        console.log(vis.wordPairData)
    }
}