/** Class implementing the table */
class Table{

    constructor(BEBdata,station_Data){
        this.BEB = BEBdata;
        this.station = station_Data;
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


    }

    updateTable(){

        
    }

}