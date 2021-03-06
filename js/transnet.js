/** Class implementing the transportation network */
class TransNet {

    // Creates a Power Network object
    constructor(data,pow_data,bebs,time,table,updateTime){
        //Assigning data variable
        console.log("Trans data:",data);
        this.data = data;
        this.pow_data = pow_data;
        this.activeTime = time;
        this.bebs = bebs;
        this.table = table;
        this.updateTime = updateTime;

        //Margins - the bostock way
        this.margin = {top: 20, right: 20, bottom: 20, left: 20};
        this.width = 1200 - this.margin.left - this.margin.right;
        this.height = 900 - this.margin.top-this.margin.bottom; 

        //Margins - the bostock way - line chart
        this.marginL = {top: 20, right: 60, bottom: 60, left: 60};
        this.widthL = 1100 - this.marginL.left - this.marginL.right;
        this.heightL = 400 - this.marginL.top-this.marginL.bottom; 

        this.clicked = null; //my click selection - used for updating tooltip later
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

        //Finding max/min of active power flow
        let max_apf = d3.max(this.pow_data.links.map((d) => {
            //console.log(d)
            return d3.max(d.aPF.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))
        }));
        let min_apf = d3.min(this.pow_data.links.map((d) => {
            //console.log(d)
            return d3.min(d.aPF.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))
        }));
        

        /** Set Scales  */
        //Make circle size scale for bus count
        this.buscountScale = d3.scaleSqrt().domain([min_bus_count,max_bus_count]).range([5,35]);

        //Color scale for station power
        this.powLoadScale = d3.scaleSequential(d3.interpolateViridis).domain([min_chsp,max_chsp]);

        // Scales for line chart
        this.powLoadLineScale = d3.scaleLinear().domain([min_chsp,max_chsp]).range([this.heightL+this.marginL.top,this.marginL.top]);
        this.timeScale = d3.scaleLinear().domain([1,288]).range([this.marginL.left,this.marginL.left+this.widthL]);

        //Setting custom max because the first node skews it - have this for color setting
        this.aLoadScale = d3.scaleSequential(d3.interpolatePurples).domain([min_aload,300])
        //Make an ordinal color scale for stations
        let pow_stations = ["n2","n13","n9","n33","n25","n31","n8"];
        this.stationColor = d3.scaleOrdinal(d3.schemeTableau10).domain(pow_stations);
        //Power links
        this.apfScale = d3.scaleSequential(d3.interpolateBlues).domain([min_apf,max_apf]);

        //Select view1 and append an svg to it
        let powSVG = d3.select(".view1").append("svg")
            .attr("class","netsvg")
            .attr("height",this.height+this.margin.top+this.margin.bottom)
            .attr("width",this.width+this.margin.left+this.margin.right);

        //Appending time bar
        let time_bar = d3.select(".viewsHead")
            .append('div').attr('id', 'activeTime-bar');

         //Add text above nets
        d3.select(".viewsHead").append("div")
            .style("left","675px")
            .style("top","175px")
            .attr("class","net_headers")
            .text("BEB charging stops");

        d3.select(".viewsHead").append("div")
            .style("left","200px")
            .style("top","175px")
            .attr("class","net_headers")
            .text("power grid");


        // TODO, my idea here is to make a little legend with all 3 of the color scales up
        //Create svg for color scale legend
        let scaleLegendGroup =  powSVG.append("g")
            .attr("transform","translate(100,700)")
            .attr("id","scale_leg");

        let scaleLegend = scaleLegendGroup
            .append("svg");

        let defs = scaleLegend.append('defs');
        //Append a linearGradient element to the defs and give it a unique id
        let linearGradient_AL = defs.append("linearGradient")
            .attr("id", "linear-gradient-AL");
        let linearGradient_CP = defs.append("linearGradient")
            .attr("id", "linear-gradient-CP");
        let linearGradient_apF = defs.append("linearGradient")
            .attr("id", "linear-gradient-apF");
        
        this.scaleLegender(linearGradient_AL,this.aLoadScale)
        this.scaleLegender(linearGradient_CP,this.powLoadScale)
        this.scaleLegender(linearGradient_apF,this.apfScale)

        //Draw the rectangle and fill with gradient (Active Power (powLoad))
        let powLoadG = scaleLegend.append("g")
            .attr("transform","translate(460,15)");
        powLoadG.append("rect")
            .attr("width", 200)
            .attr("height", 20)
            .style("fill", "url(#linear-gradient-CP)")
        powLoadG.append("text")
            .attr("y",35)
            .text("active power (kW)");
        powLoadG.append("text")
            .attr("x",150)
            .attr("y",15)
            .attr("fill","white")
            .style("font-weight","light")
            .text(`${max_chsp.toFixed(1)}`);
        powLoadG.append("text")
            .attr("x",5)
            .attr("y",15)
            .attr("fill","white")
            .style("font-weight","light")
            .text(`${min_chsp.toFixed(1)}`);



        //Draw the rectangle and fill with gradient (Active load)
        let aLoadG = scaleLegend.append("g")
            .attr("transform","translate(200,40)");
        aLoadG.append("rect")
            .attr("width", 200)
            .attr("height", 20)
            .style("fill", "url(#linear-gradient-AL)");
        aLoadG.append("text")
            .attr("y",35)
            .text("active load (kW)");
        aLoadG.append("text")
            .attr("x",5)
            .attr("y",15)
            .attr("fill","grey")
            .style("font-weight","light")
            .text(`${min_aload.toFixed(1)}`);
        aLoadG.append("text")
            .attr("x",150)
            .attr("y",15)
            .attr("fill","white")
            .style("font-weight","light")
            .text(`${max_aload.toFixed(1)}`);

        //Draw the rectangle and fill with gradient (active power flow)
        let aPFG = scaleLegend.append("g")
            .attr("transform","translate(200,0)");
        aPFG.append("rect")
            .attr("width", 200)
            .attr("height", 20)
            .style("fill", "url(#linear-gradient-apF)");
        aPFG.append("text")
            .attr("y",35)
            .text("active power flow (kW)");
        aPFG.append("text")
            .attr("x",5)
            .attr("y",15)
            .attr("fill","grey")
            .style("font-weight","light")
            .text(`${min_apf.toFixed(1)}`);
        aPFG.append("text")
            .attr("x",150)
            .attr("y",15)
            .attr("fill","white")
            .style("font-weight","light")
            .text(`${max_apf.toFixed(1)}`);

        /** Charging station interface */
        let CSGroup = powSVG.append("g")
            .attr("transform","translate("+(this.width/2-70)+","+this.margin.top+")");

        //Bus net
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
            .attr("id","s_tooltip_click")
            .style("opacity", 0);

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


        //Draw time bar
        this.drawTimeBar();
      
    }

    updateNet(){
        let that = this;
        
        //Updates table with clicked seletion
        if(that.clicked != null){
            Clicked(that.clicked);
            that.updateLine();
        }

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
            //tooltip + linked styling when hovered over
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
                    .style("top", "250px"); //(d3.event.pageY-80)
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

            })
            //Updates table to consist of only busses at this station
            .on("click", Clicked);

        
        //Clicked function
        function Clicked(d) {
            //console.log("in clicked")
            //setting this so the tooltip updates on slider bar later - as well as table
            that.clicked = d;

            //Call update line
            that.updateLine();


            //console.log("this.clicked",that.clicked)
            //console.log(d.BusData[that.activeTime].busses)
            let busses = d.BusData[that.activeTime].busses;
            busses = busses.map((c) => parseInt(c))
            //console.log(busses)
            let newData = that.bebs.filter((f,i) => busses.includes(f.BusID));
            //console.log(newData)
            that.table.BEB = newData;
            that.table.updateTable();

            //Want to keep lines connecting other nodes and tooltip (copied from above - should make this a function)
            d3.select("#s_tooltip_click").transition()
                .duration(200)
                .style("opacity", 1);
            d3.select("#s_tooltip_click").html(that.tooltipRenderS(d))
                .style("left","800px") //(d3.event.pageX+30)
                .style("top", "250px"); //(d3.event.pageY-80)
            
            //Want to removes netlines
            d3.selectAll(".netlineclick").remove();
            d3.selectAll(".netline").remove();

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
                .attr("class","netlineclick")
                .attr("stroke","black")
                .attr("stroke-width",0.5)
                .attr("fill","none")
                .attr("d",lineFunction(line_data));

            let path2 = that.lineLayer.append("path")
                .attr("class","netlineclick")
                .attr("stroke","black")
                .attr("stroke-width",0.5)
                .attr("fill","none")
                .attr("d",lineFunction(line_data2));
        }

        // This clears a selection by listening for a click
        document.addEventListener("click", function(e) {
            if (e.target.classList.contains("netsvg")){
            //console.log(e.target);
            //Remove tooltip
            d3.select("#s_tooltip_click")
                    .style("opacity", 0);

            //Restore data
            that.table.BEB = that.bebs;
            that.table.updateTable();
            
            //Remove net lines
            d3.selectAll(".netlineclick").remove();

            //Sets clicked to null
            that.clicked = null;

            //Clear path from line chart
            d3.selectAll(".line-path").style("visibility","hidden");
            d3.selectAll(".chart-text").style("visibility","hidden");
            }
            
            
        
        }, true);

    }

      /**
     * Draws the time bar and hooks up the events of time change
     */
    drawTimeBar() {
        let that = this;

        //Slider to change the activeTime of the data
        //May want to adjust these values later
        let timeScale = d3.scaleLinear().domain([1, 287]).range([30, 730]);

        let timeSlider = d3.select('#activeTime-bar')
            .append('div').classed('slider-wrap', true)
            .append('input').classed('slider', true)
            .attr('type', 'range')
            .attr('min', 1)
            .attr('max', 287)
            .attr('value', this.activeTime);

        let sliderLabel = d3.select('.slider-wrap')
            .append('div').classed('slider-label', true)
            .append('svg');

        let sliderText = sliderLabel.append('text').text(this.activeTime);

        sliderText.attr('x', timeScale(this.activeTime));
        sliderText.attr('y', 25);

        timeSlider.on('input', function() {
            

            // d3.select("#backtext")
            //     .text(this.value);
            sliderText.text(this.value);
            sliderText.attr('x', timeScale(this.value));
            that.updateTime(this.value);
            if(that.clicked != null){
                //Updatiting tooltip
                d3.select("#s_tooltip_click")
                    .html(that.tooltipRenderS(that.clicked));
            }
        });
    }

    /** Creates a line chart */
    createLine(){
        //console.log("data in line:",this.data.nodes[0])

        let that = this;

        //Create line chart svg
        let lineSvg = d3.select(".view3").append("svg")
                            .attr("class","lineSvg")
                            .attr("height",400)
                            .attr("width",1100);

        //Create a chart group
        let powStatSvg = lineSvg.append("g");
            // .attr("transform",`translate(${this.marginL.left},${this.marginL.top})`);

        //Create label for group
        powStatSvg.append("text")
            .attr("class","chart-text")
            .attr("x",850)
            .attr("y",60);

        //Create labels for axes
        powStatSvg.append("text")
            .attr("class","axis-text")
            .attr("x",70)
            .attr("y",23)
            .text("active power (kW)");
        
        powStatSvg.append("text")
            .attr("class","axis-text")
            .attr("x",950)
            .attr("y",380)
            .text("intervals");

        
        // Scales for line chart
        let yScale = this.powLoadLineScale;
        let xScale = this.timeScale;


        //Xaxis group
        let xAxis = d3.axisBottom();
        xAxis.scale(xScale);

        //Y axis group
        let yAxis = d3.axisLeft().ticks(5);;
        yAxis.scale(yScale);

        //Gridlines
        // gridlines in y axis function 
        // function make_y_gridlines() {		
        //     return d3.axisLeft(yScale)
        //         .ticks(5)
        // }

        // // add the Y gridlines
        // powStatSvg.append("g")			
        //     .attr("class", "grid")
        //     .attr("transform",`translate(${this.marginL.left},0)`)
        //     .call(make_y_gridlines()
        //         .tickSize(-(this.widthL))
        //         .tickFormat("")
        //     );

        //X-axis
        powStatSvg.append("g")
            .classed("axis",true)
            .attr("transform",`translate(${0},${this.heightL+this.marginL.top})`)
            .call(xAxis);

        //Y-axis
        powStatSvg.append("g")
            .classed("axis",true)
            .attr("transform",`translate(${this.marginL.left},${0})`)
            .call(yAxis);

        
        //Add data to chart

        //Making line function
        let line = d3.line()
            // .curve(d3.curveStep)
            .defined(d => !isNaN(d.value))
            .x((d,i) => this.timeScale(i))
            .y(d => this.powLoadLineScale(d.value));

        //Drawing path
        powStatSvg.append("path")
            .attr("class","line-path");
    }

    updateLine(){
        let that = this;
        //console.log("that.clicked in update line",this.clicked)

        //Making line function
        let line = d3.line()
            // .curve(d3.curveStep)
            .defined(d => !isNaN(d.value))
            .x((d,i) => this.timeScale(i))
            .y(d => this.powLoadLineScale(d.value));


        d3.select(".line-path")
            .datum(this.data.nodes[that.clicked.index].chSP.slice(0,this.activeTime))
            .style("visibility","visible")
            .attr("fill", "none")
            .attr("stroke", `${that.stationColor(that.clicked.StationNode.id)}`)//d => that.stationColor(d.StationNode.id))
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", line);

        //Line chart label
        d3.select(".chart-text")
            .style("visibility","visible")
            .text(`${that.clicked.StationName}`);

        
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

    tooltipRenderS(data,time) {
        time = this.activeTime;
        let that = this;
        let text = null;
        text = "<h3>" + data.StationName + " ("+ data.StationNode.id +")</h3>";
        //Adds in relevant data
        text = text + "<p> BEB Count: "+ data.BusData[time].total+ " busses</p>";
        text = text + "<p> Active Power : "+  parseFloat(data.chSP[time].value).toFixed(2)+" kW</p>";
        text = text + "<p> Active Load : "+  parseFloat(data.aLoad[time].value).toFixed(2)+" kW</p>";
        text = text + "<p> Voltage : "+  parseFloat(data.volt[time].value).toFixed(2)+" kV</p>";
        return text;
    }

    //** Got the idea from: https://observablehq.com/@tmcw/d3-scalesequential-continuous-color-legend-example */
    scaleLegender(linearGradient,colorScale){

        linearGradient.selectAll("stop")
            .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: colorScale(t) })))
            .enter().append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color)
    }
}