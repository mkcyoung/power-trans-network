/**Loads the data  */

/** POWER SYSTEM LOADING
 * NODE feautres
 * 1) Active Load
 * 2) Voltage
 * 3) Charging Station Power */
 
 //Initializaing power network object
 this.powNet = {
     "nodes":[],
     "links":[]
 };
let that = this;

/** DATA LOADING AND CLASS CALLING */

 //  Active load
d3.csv("data/PowerSystem_csvs/activeLoad.csv").then(csvData => {

    //Adding active load to power net object w/ id
    csvData.forEach( (d, i) => {
        this.powNet.nodes.push({
            "id": d[""],
            "aLoad": Object.entries(d).slice(1),
            "volt": null,
            "chSP": null
        });          
    });
    
    // Voltage
    d3.csv("data/PowerSystem_csvs/voltage.csv").then(csvData => {
        //Adding voltage to power net object nodes
        csvData.forEach( (d, i) => {
            if (this.powNet.nodes[i].id == d[""]){
                this.powNet.nodes[i].volt = Object.entries(d).slice(1)
            }
        });
    });

    //Charging station power
    //Stations 1-7 belong to nodes 2,13,9,33,25,31, & 8.
    d3.csv("data/PowerSystem_csvs/chargingStationPower.csv").then(csvData => {

        //Adding charging station power to correct nodes
        stations = ["n2","n13","n9","n33","n25","n31","n8"];
        csvData.forEach( (d, i) => {
            this.powNet.nodes.forEach( (e,j) => {
                if(e.id == stations[i]){
                    e["chSP"] = Object.entries(d).slice(1);
                } 
            })
        });
    });

/** EDGE features
 * 1) Current
 * 2) Maximum line current
 * 3) Active Power flow
 */

    //  Current
    d3.csv("data/PowerSystem_csvs/current.csv").then(csvData => {
        //Creating link properties and adding in current
        csvData.forEach( (d, i) => {
            this.powNet.links.push({
                "From": d.From,
                "To": d.To,
                "current": Object.entries(d).slice(2),
                "mLC": null,
                "aPF": null
            })          
        });
    });

    // Maximum line current
    d3.csv("data/PowerSystem_csvs/maxLineCurrent.csv").then(csvData => {

        //Add maximum line currents to links
        csvData.forEach( (d, i) => {
            if((d.From == this.powNet.links[i]['From']) && (d.To == this.powNet.links[i]['To'])){
                this.powNet.links[i].mLC = +d.Imax;
            }
        });
        console.log("Max Line Current",csvData);
    });

    //active power flow
    d3.csv("data/PowerSystem_csvs/activePowerFlow.csv").then(csvData => {

        csvData.forEach( (d, i) => {
            if ((d.From == this.powNet.links[i]['From']) && (d.To == this.powNet.links[i]['To'])){
                this.powNet.links[i].aPF = Object.entries(d).slice(2)
            }
        });
    });


console.log("Power net",this.powNet);
});
console.log("Power net outside",this.powNet);
 
//TODO get this into a node-link format

