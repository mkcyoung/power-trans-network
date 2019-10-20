/** Class implementing the power grid network */
class PowNet {

    // Creates a Power Network object
    constructor(data){
        //Assigning data variable
        this.data = data;

        //Margins - the bostock way
        this.margin = {top: 20, right: 20, bottom: 20, left: 20};
        this.width = 700 - this.margin.left - this.margin.right;
        this.height = 700 - this.margin.top-this.margin.bottom; 

    }

    /** Builds network based on data passed into object */
    createNet(){
        console.log("Power Network Object: ",this.data)
        
        //May need to use this later
        let that = this;

        /** Creating Scales */

        //Finding max/min of aLoad
        let max_aload = d3.max(this.data.nodes.map((d) => {
            //console.log(d)
            return d3.max(d.aLoad.map(f => {
                //console.log(f[1])
                return parseFloat(f[1])
            }))
        }));
        //console.log(max_aload)
        let min_aload = d3.min(this.data.nodes.map((d) => {
            //console.log(d)
            return d3.min(d.aLoad.map(f => {
                //console.log(f[1])
                return parseFloat(f[1])
            }))
        }));
        //console.log(min_aload)

        //Finding max/min of 




        //Select view1 and append an svg to it
        let powSVG = d3.select(".view1").append("svg")
            .attr("height",this.height+this.margin.top+this.margin.bottom)
            .attr("width",this.width+this.margin.left+this.margin.right);

        let netGroup = powSVG.append("g")
            .attr("transform","translate("+this.margin.left+","+this.margin.top+")");

        // First we create the links in their own group that comes before the node 
        //  group (so the circles will always be on top of the lines)
        let linkLayer = netGroup.append("g")
            .attr("class", "links");
         // Now let's create the lines
        let links = linkLayer.selectAll("line")
            .data(this.data.links)
            .join("line")
            .classed("link",true)
            //tooltip!
            .on("mouseover", function (d) {
                d3.select("#tooltip").transition()
                    .duration(200)
                    .style("opacity", 0.9);
                d3.select("#tooltip").html(that.tooltipRenderL(d))
                    .style("left", (d3.event.pageX+15) + "px")
                    .style("top", (d3.event.pageY+15) + "px")
            })
            .on("mouseout", function (d) {
                d3.select("#tooltip").transition()
                    .duration(500)
                    .style("opacity", 0)
            });;

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
            .attr("fill", d=> (d.chSP!=null) ? "#4ccc43" : "#f26b6b")
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

        //Going to do this with a force-directed graph first
        var simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d) { return d.id; }))
            .force("charge", d3.forceManyBody().strength(-25))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2));

        // Feeding data to simulation
        simulation.nodes(this.data.nodes);
        simulation.force("link")
                .links(this.data.links);

        
        // Finally, let's tell the simulation how to update the graphics
        simulation.on("tick", function () {
            // Every "tick" of the simulation will create / update each node's 
            //  coordinates; we need to use those coordinates to move the lines
            //  and circles into place
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

            nodes
                .attr("cx", function (d) {
                    return d.x;
                })
                .attr("cy", function (d) {
                    return d.y;
                });

            labels
                .attr("x",d => d.x-20)
                .attr("y",d => d.y-5)
                .text( d=> d.index+1)
                .attr("fill","black");
        });

        



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
        text = text + "<p> Active Load: "+ parseFloat(data.aLoad[0][1]).toFixed(2)+" kW</p>";
        text = text + "<p> Voltage: "+ parseFloat(data.volt[0][1]).toFixed(2)+" kV</p>";
        if (data.chSP != null){
            text = text + "<p> Active Power: "+ parseFloat(data.chSP[0][1]).toFixed(2)+" kW</p>"
        } 
        return text;
    }

    /**
     * Returns html that can be used to render the tooltip for links
     * @param data
     * @returns {string}
     */
    tooltipRenderL(data) {
        let text = "<h3>" + data.source.id + ' <span>&#8594;</span> ' + data.target.id +"</h3>";
        //Adds in relevant data
        text = text + "<p> Current: "+ parseFloat(data.current[0][1]).toFixed(2)+" A</p>";
        text = text + "<p> Acitve Power Flow: "+ parseFloat(data.aPF[0][1]).toFixed(2)+" kW</p>";
        text = text + "<p> Max Line Current: "+ data.mLC.toFixed(2)+" A</p>"
        return text;
    }

}