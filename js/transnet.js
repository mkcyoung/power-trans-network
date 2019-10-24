/** Class implementing the transportation network */
class TransNet {

    // Creates a Power Network object
    constructor(data){
        //Assigning data variable
        //console.log(data)
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

        //Make an ordinal color scale for stations
        let pow_stations = ["n2","n13","n9","n33","n25","n31","n8"];
        this.stationColor = d3.scaleOrdinal(d3.schemeSet3).domain(pow_stations);


        let powSVG = d3.select(".view1").select("svg");

        let netGroup = powSVG.append("g")
            .attr("transform","translate("+(this.width/2 + 60)+","+this.margin.top+")");

        // First we create the links in their own group that comes before the node 
        //  group (so the circles will always be on top of the lines)
        this.linkLayer = netGroup.append("g")
            .attr("class", "links");

        //make tooltip div
        d3.select(".view1")
            .append("div")
            .attr("class", "tooltip")
            .attr("id","tooltip")
            .style("opacity", 0);
        
        //Create labels
        this.labelLayer = netGroup.append("g")
        .attr("class","labelsT");

        // Now we create the node group, and the nodes inside it
        this.nodeLayer = netGroup.append("g")
            .attr("class", "nodes");


         /** Charging station interface */
         let CSGroup = powSVG.append("g")
         .attr("transform","translate("+(this.width/2-70)+","+this.margin.top+")");

        // Create 7 nodes representing each station
        this.stations = CSGroup.append("g")
            .attr("class", "csgroup");
      
    }

    updateNet(){
        let that = this;
        // Now let's create the lines
        let links = this.linkLayer.selectAll("line")
            .data(this.data.links)
            .join("line")
            .classed("linkT",true);


        let nodes = this.nodeLayer
            .selectAll("circle")
            .data(this.data.nodes)
            .join("circle")
            .attr("class",d => d.StationNode.id)
            .classed("node",true)
            .classed("transNode",true)
            .attr("r", 15)
            .attr("fill","rgb(0, 153, 255)")
            //tooltip!
            .on("mouseover", function (d) {
                d3.select("#tooltip").transition()
                    .duration(200)
                    .style("opacity", 0.9);
                d3.select("#tooltip").html(that.tooltipRenderN(d))
                    .style("left", (d3.event.pageX+15) + "px")
                    .style("top", (d3.event.pageY+15) + "px");
                d3.selectAll("."+d.StationNode.id)
                    .classed("CHSP",true);
            })
            .on("mouseout", function (d) {
                d3.select("#tooltip").transition()
                    .duration(500)
                    .style("opacity", 0);
                d3.selectAll("."+d.StationNode.id)
                    .classed("CHSP",false);
            });
        

        let labels = this.labelLayer
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
            .attr("x",d => d.x-60)
            .attr("y",d => d.y-10)
            .text( d=> d.StationName)
            .attr("fill","black");


        // Now let's create the lines
        let station_nodes = this.stations.selectAll("circle")
            .data(this.data.nodes) //I want this to contain everything relevant to the stations
            .join("circle")
            .attr("cx", 20)
            .attr("cy", (d,i) => 50 + i*95)
            .attr("class", d => d.StationNode.id)
            .classed("station_node",true)
            .attr("r", 25)
            .attr("fill", d => this.stationColor(d.StationNode.id))
            //tooltip!
            .on("mouseover", function (d) {
                d3.select("#tooltip").transition()
                    .duration(200)
                    .style("opacity", 0.9);
                d3.select("#tooltip").html(that.tooltipRenderN(d))
                    .style("left", (d3.event.pageX+15) + "px")
                    .style("top", (d3.event.pageY+15) + "px");
                d3.selectAll("."+d.StationNode.id)
                    .attr("fill", d => { return (d.id != undefined) ? that.stationColor(d.id) : that.stationColor(d.StationNode.id)})
                    .classed("CHSP",true);
            })
            .on("mouseout", function (d) {
                d3.select("#tooltip").transition()
                    .duration(500)
                    .style("opacity", 0);
                d3.selectAll("."+d.StationNode.id)
                    .attr("fill", d => { return (d.id != undefined) ? "rgb(0, 153, 255)" : "rgb(0, 153, 255)"})
                    .classed("CHSP",false);
                d3.selectAll(".station_node")
                    .attr("fill", d => that.stationColor(d.StationNode.id));
            });

    }

    /**
     * Returns html that can be used to render the tooltip for nodes
     * @param data
     * @returns {string}
     */
    tooltipRenderN(data) {
        let text = null;
        text = "<h3>" + data.StationName + " ("+ data.StationID +")</h3>";
        //Adds in relevant data
        text = text + "<p> BEB Count: "+ data.BusData[0].total+ " busses</p>";
        text = text + "<p> Active Power : "+  data.chSP[0].value+" kW</p>";
        return text;
    }


}