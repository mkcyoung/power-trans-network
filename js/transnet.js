/** Class implementing the transportation network */
class TransNet {

    // Creates a Power Network object
    constructor(data){
        //Assigning data variable
        //console.log(data)
        this.data = data;
        this.activeTime = 50;

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

        //Create bus count scale
        //Finding max/min of aLoad
        let max_bus_count = d3.max(this.data.nodes.map((d) => {
            return d3.max(d.BusData.map((d)=>{
                return d.total
            }))
        }));
        let min_bus_count = d3.min(this.data.nodes.map((d) => {
           return d3.min(d.BusData.map((d)=>{
               return d.total
           }))
        }));
        //console.log(max_bus_count,min_bus_count);

        //Finding max/min of CHSP
        let max_chsp = d3.max(this.data.nodes.map((d) => {
            //console.log(d)
            if(d.chSP!=null){
            return d3.max(d.chSP.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))}
        }));
        let min_chsp = d3.min(this.data.nodes.map((d) => {
            // console.log(d)
            if(d.chSP!=null){
            return d3.min(d.chSP.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))}
        }));

        //Finding max/min of aLoad
        let max_aload = d3.max(this.data.nodes.map((d) => {
            //console.log(d)
            return d3.max(d.aLoad.map(f => {
                // console.log(f.value)
                return parseFloat(f.value)
            }))
        }));
        // console.log(max_aload)
        let min_aload = d3.min(this.data.nodes.map((d) => {
            //console.log(d)
            return d3.min(d.aLoad.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))
        }));
        

        /** Set Scales  */
        //Make circle size scale for bus count
        this.buscountScale = d3.scaleSqrt().domain([min_bus_count,max_bus_count]).range([7,22]);
        this.powLoadScale = d3.scaleSequential(d3.interpolateOranges).domain([min_chsp,max_chsp]);
        //Setting custom max because the first node skews it - have this for color setting
        this.aLoadScale = d3.scaleSequential(d3.interpolatePurples).domain([min_aload,400])
        //Make an ordinal color scale for stations
        let pow_stations = ["n2","n13","n9","n33","n25","n31","n8"];
        this.stationColor = d3.scaleOrdinal(d3.schemeSet3).domain(pow_stations);


        //Select view1 and append an svg to it
        let powSVG = d3.select(".view1").append("svg")
            .attr("height",this.height+this.margin.top+this.margin.bottom)
            .attr("width",this.width+this.margin.left+this.margin.right);


        /** Charging station interface */
        let CSGroup = powSVG.append("g")
            .attr("transform","translate("+(this.width/2-70)+","+this.margin.top+")");

        let netGroup = powSVG.append("g")
            .attr("transform","translate("+(this.width/2 + 60)+","+this.margin.top+")");


       // Create 7 nodes representing each station
       this.stations = CSGroup.append("g")
           .attr("class", "csgroup");

        //I'll creat lines first so they're beneath everything
        this.lineLayer = this.stations.append("g")
            .attr("class","netlines");

        // First we create the links in their own group that comes before the node 
        //  group (so the circles will always be on top of the lines)
        this.linkLayer = netGroup.append("g")
            .attr("class", "links");

        //make Station tooltip div
        d3.select(".view1")
            .append("div")
            .attr("class", "s_tooltip")
            .attr("id","s_tooltip")
            .style("opacity", 0);
        
        //Create labels
        this.labelLayer = netGroup.append("g")
        .attr("class","labelsT");

        // Now we create the node group, and the nodes inside it
        this.nodeLayer = netGroup.append("g")
            .attr("class", "nodes");

      
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
            .attr("r", d => this.buscountScale(d.BusData[this.activeTime].total))
            .attr("fill", d => this.powLoadScale(d.chSP[this.activeTime].value))
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
                    .attr("fill", d => { return (d.id != undefined) ? that.aLoadScale(d.aLoad[that.activeTime].value) : that.powLoadScale(d.chSP[that.activeTime].value)})
                    .classed("CHSP",false);
                d3.selectAll(".station_node")
                    .attr("fill", d => that.stationColor(d.StationNode.id));
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

        // Creating lines that will connect the trans nodes 
        this.lineOTTC = [{"x":20,"y":50},{"x":80,"y":50},
        {"x":80,"y":645},{"x":413,"y":645}];
        this.lineOTTC2 = [{"x":20,"y":50},{"x":20,"y":10},
        {"x":-470,"y":10},{"x":-470,"y":60},
        {"x":-470,"y":85},{"x":-440,"y":85}];

        this.lineKJTC = [{"x":20,"y":145},{"x":80,"y":145},
        {"x":80,"y":245},{"x":235,"y":245}];
        this.lineKJTC2 = [{"x":20,"y":145},{"x":-200,"y":145},
        {"x":-200,"y":470},{"x":-310,"y":470}];

        this.lineCTH = [{"x":20,"y":240},{"x":200,"y":240},
        {"x":200,"y":350},{"x":310,"y":350},
        {"x":310,"y":395}];
        this.lineCTH2 = [{"x":20,"y":240},{"x":-200,"y":240},
        {"x":-200,"y":330},{"x":-355,"y":330}];

        this.lineJRPR = [{"x":20,"y":335},{"x":150,"y":335},
        {"x":150,"y":55}];
        this.lineJRPR2 = [{"x":20,"y":335},{"x":-80,"y":335},
        {"x":-80,"y":480}];
        
        this.lineKPR = [{"x":20,"y":430},{"x":200,"y":430},
        {"x":200,"y":550},{"x":480,"y":550},
        {"x":480,"y":350}];
        this.lineKPR2 = [{"x":20,"y":430},{"x":-50,"y":430},
        {"x":-50,"y":120},{"x":-230,"y":120}];

        this.lineEH = [{"x":20,"y":525},{"x":175,"y":525},
        {"x":175,"y":145},{"x":215,"y":145}];
        this.lineEH2 = [{"x":20,"y":525},{"x":-30,"y":525},
        {"x":-30,"y":400},{"x":-150,"y":400}];

        this.lineGS = [{"x":20,"y":620},{"x":270,"y":620},
        {"x":270,"y":415}];
        this.lineGS2 = [{"x":20,"y":620},{"x":-150,"y":620},
        {"x":-150,"y":675},{"x":-420,"y":675},
        {"x":-420,"y":295},{"x":-380,"y":295}];

        // Now let's create Station node area
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
                d3.select("#s_tooltip").transition()
                    .duration(200)
                    .style("opacity", 1);
                d3.select("#s_tooltip").html(that.tooltipRenderS(d))
                    .style("left","800px") //(d3.event.pageX+30)
                    .style("top", "175px"); //(d3.event.pageY-80)
                d3.selectAll("."+d.StationNode.id)
                    .attr("fill", d => { return (d.id != undefined) ? that.stationColor(d.id) : that.stationColor(d.StationNode.id)})
                    .classed("CHSP",true);
                //Creating lines that connect node to power station
                let lineFunction = d3.line()
                    .x(function(d){
                        return d.x;
                    })
                    .y(function(d){
                        return d.y;
                    });
                
                let line_data = null;
                let line_data2 = null;
                
                switch(parseInt(d.StationID)){
                    case 1:
                       line_data = that.lineOTTC;
                       line_data2 = that.lineOTTC2;
                       break;
                    case 2:
                        line_data = that.lineKJTC;
                        line_data2 = that.lineKJTC2;
                        break;
                    case 3:
                        line_data = that.lineCTH;
                        line_data2 = that.lineCTH2;
                        break;
                    case 4:
                        line_data = that.lineJRPR;
                        line_data2 = that.lineJRPR2;
                        break;
                    case 5:
                        line_data = that.lineKPR;
                        line_data2 = that.lineKPR2;
                        break;
                    case 6:
                        line_data = that.lineEH;
                        line_data2 = that.lineEH2;
                        break;
                    case 7:
                        line_data = that.lineGS;
                        line_data2 = that.lineGS2;
                        break;
                }

                //Path to trans
                let path = that.lineLayer.append("path")
                    .attr("class","netline")
                    .attr("stroke","black")
                    .attr("stroke-width",0.5)
                    .attr("fill","none")
                    .attr("d",lineFunction(line_data));

                let totalLength = path.node().getTotalLength();

                path
                    .attr("stroke-dasharray",totalLength + " " +totalLength)
                    .attr("stroke-dashoffset",totalLength)
                    .transition()
                    .duration(750)
                    .attr("stroke-dashoffset",0);

                // Path to power
                let path2 = that.lineLayer.append("path")
                    .attr("class","netline")
                    .attr("stroke","black")
                    .attr("stroke-width",0.5)
                    .attr("fill","none")
                    .attr("d",lineFunction(line_data2));

                let totalLength2 = path2.node().getTotalLength();

                path2
                    .attr("stroke-dasharray",totalLength2 + " " +totalLength2)
                    .attr("stroke-dashoffset",totalLength2)
                    .transition()
                    .duration(750)
                    .attr("stroke-dashoffset",0);

            })
            .on("mouseout", function (d) {
                d3.select("#s_tooltip").transition()
                    .duration(500)
                    .style("opacity", 0);
                d3.selectAll("."+d.StationNode.id)
                    .attr("fill", d => { return (d.id != undefined) ? that.aLoadScale(d.aLoad[that.activeTime].value) : that.powLoadScale(d.chSP[that.activeTime].value)})
                    .classed("CHSP",false);
                d3.selectAll(".station_node")
                    .attr("fill", d => that.stationColor(d.StationNode.id));

                d3.selectAll(".netline").remove();

            });

    }

    /**
     * Returns html that can be used to render the tooltip for nodes
     * @param data
     * @returns {string}
     */
    tooltipRenderN(data) {
        let that = this;
        let text = null;
        text = "<h3>" + data.StationName + " ("+ data.StationID +")</h3>";
        //Adds in relevant data
        text = text + "<p> BEB Count: "+ data.BusData[that.activeTime].total+ " busses</p>";
        text = text + "<p> Active Power : "+  parseFloat(data.chSP[that.activeTime].value).toFixed(2)+" kW</p>";
        return text;
    }

    tooltipRenderS(data) {
        let that = this;
        let text = null;
        text = "<h3>" + data.StationName + " ("+ data.StationNode.id +")</h3>";
        //Adds in relevant data
        text = text + "<p> BEB Count: "+ data.BusData[that.activeTime].total+ " busses</p>";
        text = text + "<p> Active Power : "+  parseFloat(data.chSP[that.activeTime].value).toFixed(2)+" kW</p>";
        text = text + "<p> Active Load : "+  parseFloat(data.aLoad[that.activeTime].value).toFixed(2)+" kW</p>";
        text = text + "<p> Voltage : "+  parseFloat(data.volt[that.activeTime].value).toFixed(2)+" kV</p>";
        return text;
    }


}