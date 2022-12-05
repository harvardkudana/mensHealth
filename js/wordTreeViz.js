class wordTreeViz{
    constructor(parentElement,word, wordData, wordPairData) {
        this.parentElement = parentElement;
        this.word = word;
        this.wordPairData = wordPairData;
        this.listOfNotWords = ['your', "the", "to", "in", "you", "for", "of", "this"] 
        this.color = d3.scaleLinear()
        .domain([1, 4])
        .range(["red", "black"]);
        this.initVis();
    }

    initVis(){
        let vis = this

        vis.margin = {top: 40, right: 40, bottom: 60, left: 40};
        vis.width = 700 - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;
        
        d3.select("#theSVG").remove();
        d3.select("#wordTreeSVG").remove();


        vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .attr("id", "theSVG")
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.textBox = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", 400)
        .attr("height", 300)
        .attr("id", "wordTreeSVG")


        vis.textBox.append("text")
        .text("Here are 3 made up sentences based on this data")
        .attr("x", 0)
        .attr("y", 50)
        .attr("id", "wordTreeSentence")

        vis.textBox.append("text")
        .text("Here are 3 made up sentences based on this data")
        .attr("x", 0)
        .attr("y", 90)
        .attr("id", "wordTreeSentence1")

        vis.textBox.append("text")
        .text("Here are 3 made up sentences based on this data")
        .attr("x", 0)
        .attr("y", 110)
        .attr("id", "wordTreeSentence2")

        vis.textBox.append("text")
        .text("Here are 3 made up sentences based on this data")
        .attr("x", 0)
        .attr("y", 130)
        .attr("id", "wordTreeSentence3")
        
        vis.wrangleData();
    }


    getBracketDepth(word,depth){
        let vis = this;
        
        let wordDict = {}
        if (depth == 0 || word == []){
            return
        }

        for(let x = 0; x < vis.wordPairData.length; x++){
            let pair = vis.wordPairData[x]["word"]
            let index = pair.indexOf("-")
            let word1 = pair.substring(0, index)
            let word2 = pair.substring(index + 1, pair.length)
            if (word1 == word){
                if (wordDict[word2] == null){
                    wordDict[word2] = 1
                }
                else{
                    wordDict[word2] ++;
                }
            }
        }
                // Create items array
        var items = Object.keys(wordDict).map(function(key) {
            return [key, wordDict[key]];
        });
        
        // Sort the array based on the second element
        items.sort(function(first, second) {
            return second[1] - first[1];
        }); 

        let l = (items[0] == null) ? [] : items[0][0]
        let child1 = vis.getBracketDepth(l, depth - 1)
        l = items[1] == null ? [] : items[1][0]
        let child2 =  vis.getBracketDepth(l, depth - 1)
        l = items[2] == null ? [] : items[2][0]
        let child3 =  vis.getBracketDepth(l, depth - 1)
        let children = [child1,child2,child3]
        
        if (depth == 1){
            return {word:word, level: vis.color(depth),value : 10 - (2.5 * (depth - 1))}
        }

        let d = {word:word,children:children, level: vis.color(depth), value : 10 - (2.5 * (depth - 1))}
        return d
    }

    wrangleData(){
        let vis = this;
        vis.word = document.getElementById('chosenWord') == null? "muscle" :document.getElementById('chosenWord').textContent;

        let wordPairTree = vis.getBracketDepth(vis.word, 3);
        const treemap = d3.tree().size([vis.height, vis.width - 100]);
        let nodes = d3.hierarchy(wordPairTree, d => {
            if (d != null){
                return d.children
            }
        });
        vis.nodes = treemap(nodes);

        let pairTreeForSentence = vis.getBracketDepth(vis.word, 6);

        vis.Sentence1 = "-"+vis.word +" "+ pairTreeForSentence.children[0].word +" "+ (vis.makeSentence(pairTreeForSentence.children[0], 4))
        vis.Sentence2 = "-"+vis.word +" "+ pairTreeForSentence.children[1].word +" "+ (vis.makeSentence(pairTreeForSentence.children[1], 4))
        vis.Sentence3 = "-"+vis.word +" "+ pairTreeForSentence.children[2].word +" " +(vis.makeSentence(pairTreeForSentence.children[2], 4))
        vis.updateVis()
    }

    makeSentence(pairTree, depth){
        if (pairTree.children != null){
        return pairTree.children[0].word + " " + this.makeSentence(pairTree.children[0], depth - 1)}
        return ""
    }

    
    updateVis(){
        let vis = this;

        d3.selectAll(".node").remove();
        d3.selectAll(".link").remove();
        


        let node = vis.svg.selectAll(".node")
        .data(vis.nodes.descendants())
        .enter().append("g")
            .attr("class", d => "node" + (d.children ? " node--internal"
                : " node--leaf"))
            .attr("transform", d => "translate(" + d.y + "," +
                d.x + ")");

        node.append("circle")
                .attr("r", 10)
                .style("stroke", d => {
                    if (d.data != null){
                        return d.data.type;
                    }
                })
                .style("fill", d =>  {
                    if (d.data != null){
                    return d.data.level
                    }
                });

        const link = vis.svg.selectAll(".link")
            .data(vis.nodes.descendants().slice(1))
            .enter().append("path")
            .attr("class", "link")
            .style("stroke", d => d.data.level)
            .attr("d", d => {
                return "M" + d.y + "," + d.x
                    + "C" + (d.y + d.parent.y) / 2 + "," + d.x
                    + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
                    + " " + d.parent.y + "," + d.parent.x;
            });


        node.append("text")
            .attr("dy", ".35em")
            .attr("x", d =>  {
               if (d.height == 0){
                   return 10
               }
                return 0
            })
            .attr("y", d =>  {
                if (d.height == 0){
                    return 0
                }
                 return 25
             })
            .style("text-anchor","left")
            .text(d => {
                if (d.data != null){
                    return d.data.word
                }
            });

        d3.select("#wordTreeSentence1").text(vis.Sentence1)
        d3.select("#wordTreeSentence2").text(vis.Sentence2)
        d3.select("#wordTreeSentence3").text(vis.Sentence3)

    }
}