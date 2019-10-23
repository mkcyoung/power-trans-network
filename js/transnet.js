/** Class implementing the transportation network */
class TransNet {

    // Creates a Power Network object
    constructor(data){
        //Assigning data variable
        console.log(data)
        this.data = data;

        //Margins - the bostock way
        this.margin = {top: 20, right: 20, bottom: 20, left: 20};
        this.width = 1200 - this.margin.left - this.margin.right;
        this.height = 900 - this.margin.top-this.margin.bottom; 

    }

    createNet(){
        //TODO potentially highlight routes along the transportation system
        //console.log("In trans net");
        //Select view1 and append an svg to it
        let that = this;
        let powSVG = d3.select(".view1").select("svg");

        let netGroup = powSVG.append("g")
            .attr("transform","translate("+(this.width/2 + 60)+","+this.margin.top+")");

        // First we create the links in their own group that comes before the node 
        //  group (so the circles will always be on top of the lines)
        let linkLayer = netGroup.append("g")
            .attr("class", "links");
         // Now let's create the lines
        let links = linkLayer.selectAll("line")
            .data(this.data.links)
            .join("line")
            .classed("link",true);

        //make tooltip div
        d3.select(".view1")
            .append("div")
            .attr("class", "tooltip")
            .attr("id","tooltip")
            .style("opacity", 0);

        // Now we create the node group, and the nodes inside it
        let nodeLayer = netGroup.append("g")
            .attr("class", "nodes");
        let nodes = nodeLayer
            .selectAll("circle")
            .data(this.data.nodes)
            .join("circle")
            .classed("node",true)
            .attr("r", d => (d.chSP!=null) ? 10 : 6)
            .attr("fill", d=> (d.chSP!=null) ? "#4ccc43" : "orange")
            //tooltip!
            .on("mouseover", function (d) {
                d3.select("#tooltip").transition()
                    .duration(200)
                    .style("opacity", 0.9);
                d3.select("#tooltip").html(that.tooltipRenderN(d))
                    .style("left", (d3.event.pageX+15) + "px")
                    .style("top", (d3.event.pageY+15) + "px")
            })
            .on("mouseout", function (d) {
                d3.select("#tooltip").transition()
                    .duration(500)
                    .style("opacity", 0)
            });
        
        //Create labels
        let labelLayer = netGroup.append("g")
            .attr("class","labels");
        let labels = labelLayer
            .selectAll("text")
            .data(this.data.nodes)
            .enter().append("text");

        nodes
            .attr("cx", function (d,i) {
                let X_Start = 300;
                switch(parseInt(d.StationID)){
                    case 1:
                        d.x = X_Start;
                        return d.x;
                    case 5:
                        d.x = X_Start + 50;
                        return d.x;
                    case 7:
                        d.x = X_Start -160;
                        return d.x;
                    case 3:
                        d.x = X_Start -120;
                        return d.x;
                    case 2:
                        d.x = X_Start -180;
                        return d.x;
                    case 6:
                        d.x = X_Start  -210;
                        return d.x;
                    case 4:
                        d.x = X_Start -280;
                        return d.x;
                }
                // Main branch from n1 to 18
                // if(d.StationID == 1){
                //     d.x = X_Start + i*10;
                //     return d.x;
                // }
                // //Branch off of 3 containing n23->25
                // if(d).StationID == {
                //     d.x = X_Start + (i-20)*50;
                //     return d.x;
                // }
                // //Branch off of 2 containing 19 -> 22
                // if((d.index > 17) & (d.index < 22)){
                //     d.x = X_Start + (i-15)*50;
                //     return d.x;
                // }
                // // Bracnh off of 6(may change to 13) containing 26->33
                // if( d.index > 24 ){
                //     d.x = X_Start + (i-23)*40;
                //     return d.x;
                // }
                // else{
                //     return X_Start;
                // }
                
            })
            .attr("cy", function (d,i) {
                let Y_Start = that.height*(0.75);
                switch(parseInt(d.StationID)){
                    case 1:
                        d.y = Y_Start;
                        return d.y;
                    case 5:
                        d.y = Y_Start - 300;
                        return d.y;
                    case 7:
                        d.y = Y_Start - 220;
                        return d.y;
                    case 3:
                        d.y = Y_Start -240;
                        return d.y;
                    case 2:
                        d.y = Y_Start - 400;
                        return d.y;
                    case 6:
                        d.y = Y_Start - 500;
                        return d.y;
                    case 4:
                        d.y = Y_Start -600;
                        return d.y;
                }
                // // Main branch from n1 to 18
                // let Y_Start = 50;
                // let Y_Spacing = 35;
                // if(d.index < 18){
                //     d.y = Y_Start + i*Y_Spacing;
                //     return d.y;
                // }
                // //Branch off of 3 containing n23->25
                // if ((d.index > 21) & (d.index < 25)){
                //     d.y = Y_Start + 2*Y_Spacing;
                //     return d.y;
                // }
                // //Branch off of 2 containing 19 -> 22
                // if((d.index > 17) & (d.index < 22)){
                //     d.y = Y_Start;
                //     return d.y;
                // }
                // // Branch off of 6 (may change to 13) containing 26->33
                // if(d.index > 24){
                //     d.y = Y_Start + (i-20)*Y_Spacing;
                //     return d.y;
                // }
                // else{
                //     return d.y;
                // }
            });

        links
            .attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        labels
            .attr("x",d => d.x-20)
            .attr("y",d => d.y-5)
            .text( d=> d.StationName)
            .attr("fill","black");
    }

    /**
     * Returns html that can be used to render the tooltip for nodes
     * @param data
     * @returns {string}
     */
    tooltipRenderN(data) {
        let text = null;
        (data.chSP != null) ? text = "<h3> <span>&#9889;</span> Node: " + data.id + "</h3>": 
        text = "<h3> Node: " + data.id + "</h3>";
        //Adds in relevant data
        text = text + "<p> Active Load: "+ parseFloat(data.aLoad[0].value).toFixed(2)+" kW</p>";
        text = text + "<p> Voltage: "+ parseFloat(data.volt[0].value).toFixed(2)+" kV</p>";
        if (data.chSP != null){
            text = text + "<p> Active Power: "+ parseFloat(data.chSP[0].value).toFixed(2)+" kW</p>"
        } 
        return text;
    }


}