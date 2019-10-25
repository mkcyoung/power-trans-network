/** Class implementing the table */
class Table{

    constructor(BEBdata,station_Data){
        this.BEB = BEBdata;
        this.station = station_Data;
        this.activeTime = 50;
        console.log("BEBdata",this.BEB)
        console.log("Station_Data",this.station)

        //Margins for table cells- the bostock way
        this.margin = {top: 0, right: 10, bottom: 0, left: 10};
        this.width = 150 - this.margin.left - this.margin.right;
        this.height = 30 - this.margin.top-this.margin.bottom;

        // I'm gonna make this an array of objects with keys and sorted values
        this.tableHeaders = [
            {
                'key':"BEB",
                'sorted': false
            },
            {
                'key':"Location",
                'sorted': false
            },
            {
                'key': "Energy",
                'sorted': false
            },
            {
                'key': "Power",
                'sorted': false
            },
            {
                'key':'Speed',
                'sorted': false
            }
        ];


    }

    createTable(){

    //Set-up scales etc. 


    //Create axes


    //Implement sorting

    this.updateTable(this.BEB);
    }

    updateTable(data){

        /** Updates the table with data **/

        //Create table rows
        let rows = d3.select("tbody").selectAll('tr').data(data);

        //Enter selection
        let rowsE = rows.enter().append('tr');

        //Appending and initializing table headers + table cells
        rowsE.append("th").classed("busID",true).append("text");
        rowsE.append("td").classed("location",true).append("text")
        rowsE.append("td").classed("energyR",true).append("svg")
            .append("rect").classed("energyRect",true);
        rowsE.append("td").classed("powerR",true).append("svg")
            .append("rect").classed("powerRect",true);
        rowsE.append("td").classed("speed",true).append("text")


        //Handle exits
        rows.exit().remove();

        //Merge
        rows = rows.merge(rowsE);

        //Update

        //Header
        rows.select(".busID")
            .html(d => d.id);

        //frequency
        let locationR = rows.select(".location")
            .attr("width",this.width+this.margin.left+this.margin.right)
            .attr("height",this.height+this.margin.top+this.margin.bottom)
            .attr("transform",`translate(0,${this.margin.top*2})`);

        locationR.select("text")
            .attr("y",this.margin.top)
            .attr("x",this.margin.left)
            .html(d => { ( d.location ) ? (d.location[this.activeTime]) : "road"  })
            .attr("fill","red");

        // //Percentages
        // let percR = rows.select(".percR").select("svg")
        //     .attr("width",this.width+this.margin.left+this.margin.right)
        //     .attr("height",this.height+this.margin.top+this.margin.bottom)
        //     .attr("transform",`translate(0,${this.margin.top*2})`);

        // //Dem side
        // percR.select(".demRect")
        //     .attr("y",this.margin.top)
        //     .attr("x",d => (this.width+this.margin.left+this.margin.right)/2 - this.percScale(parseInt(d.percent_of_d_speeches)))
        //     .attr("fill","#61a3e3")
        //     .attr("width",d => this.percScale(parseInt(d.percent_of_d_speeches)))
        //     .attr("height",this.height);

        // //Rep side
        // percR.select(".repRect")
        //     .attr("y",this.margin.top)
        //     .attr("x",d => (this.width+this.margin.left+this.margin.right)/2)
        //     .attr("fill","#a82e2e")
        //     .attr("width",d => this.percScale(parseInt(d.percent_of_r_speeches)))
        //     .attr("height",this.height);

        // //Total
        // rows.select(".totalR")
        //     .html((d) => d.total);
    

        
    }

}