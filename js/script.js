/**Loads the data  */

/** POWER SYSTEM LOADING
 * NODE feautres
 * 1) Active Load
 * 2) Voltage
 * 3) Charging Station Power */

 /** EDGE features
 * 1) Current
 * 2) Maximum line current
 * 3) Active Power flow
 */
 

Promise.all([
    //Power grid data 
    d3.csv("data/PowerSystem_csvs/activeLoad.csv"),
    d3.csv("data/PowerSystem_csvs/voltage.csv"),
    d3.csv("data/PowerSystem_csvs/chargingStationPower.csv"),
    d3.csv("data/PowerSystem_csvs/current.csv"),
    d3.csv("data/PowerSystem_csvs/maxLineCurrent.csv"),
    d3.csv("data/PowerSystem_csvs/activePowerFlow.csv"),
    //Transit data
    d3.csv("data/TransitSystem_csvs/BEBenergy.csv"),
    d3.csv("data/TransitSystem_csvs/BEBpower.csv"),
    d3.csv("data/TransitSystem_csvs/busStationTime.csv"),
    d3.csv("data/TransitSystem_csvs/speed.csv"),

]).then(function(files){

    //Initializaing power network object
    let powNet = {
        "nodes":[],
        "links":[]
    };

    //Adding active load to power net object w/ id
    files[0].forEach( (d, i) => {
        powNet.nodes.push({
            "id": d[""],
            "aLoad": Object.entries(d).slice(1), //.map(f => parseFloat(f[1]), //gets rid of "t1, t2, etc."
            "volt": null,
            "chSP": null
        });          
    });

    //Adding voltage to power net object nodes
    files[1].forEach( (d, i) => {
        if (powNet.nodes[i].id == d[""]){
            powNet.nodes[i].volt = Object.entries(d).slice(1)
        }
    });

    //Adding charging station power to correct nodes
    stations = ["n2","n13","n9","n33","n25","n31","n8"];
    files[2].forEach( (d, i) => {
        powNet.nodes.forEach( (e,j) => {
            if(e.id == stations[i]){
                e["chSP"] = Object.entries(d).slice(1);
            } 
        })
    });

    //Creating link properties and adding in current
    files[3].forEach( (d, i) => {
        powNet.links.push({
            "source": d.From,
            "target": d.To,
            "current": Object.entries(d).slice(2),
            "mLC": null,
            "aPF": null
        })          
    });

    //Add maximum line currents to links
    files[4].forEach( (d, i) => {
        if((d.From == powNet.links[i]['source']) && (d.To == powNet.links[i]['target'])){
            powNet.links[i].mLC = +d.Imax;
        }
    });

    //Adding in active power flow
    files[5].forEach( (d, i) => {
        if ((d.From == powNet.links[i]['source']) && (d.To == powNet.links[i]['target'])){
            powNet.links[i].aPF = Object.entries(d).slice(2)
        }
    });
    console.log("Power Net: ",powNet);

    /** TRANSIT SYSTEM DATA 
     * Make nodes and links out of bus stations 
     * Each node will contain which busses are there at which times
     * maxes separate bus objects w/ time-point data
     * depending on what those bus object values are at certain times,
     * they'll either be present at the station, or on the links
    */

   // Init object that will contain station data 
    let transNet = {
        "nodes":[],
        "links":[]
    };

    //Init object that will contain bebs
    let bebs = [];

    //Adding in BEB energy 
    files[6].forEach( (d, i) => {
        bebs.push({
            "id": d[""],
            "BusID": i+1,
            "energy": Object.entries(d).slice(1),
            "power":null,
            "Stations": {},
            "Speeds": {}
        })
    });

    //Adding in BEB power
    files[7].forEach( (d, i) => {
        if (bebs[i].id == d[""]){
            bebs[i].power = Object.entries(d).slice(1)
        }
    });

    //Adding station data to beb objects
    //console.log("Station Data: ",files[8])

    files[8].forEach( (d, i) => {
        bebs.forEach( (c,j) => {
            if (c.BusID == d["BusID"]){
                c.Stations[d["StationName"]] = Object.entries(d).slice(0,-5)
            }
        })
    });

    //Adding speed data to beb objects
    files[9].forEach( (d, i) => {
        bebs.forEach( (c,j) => {
            if (c.BusID == d["BusID"]){
                c.Speeds[d["StationName"]] = Object.entries(d).slice(0,-5)
            }
        })
    });

    console.log("BEBs",bebs)


    /**Questions
     * 1) Max current units, current exceeds that a lot
     * 2) How to visualize these networks
     *      Power connections don't line up w/ pics
     *      Other than charging statings we don't know where buses are
     *      In email:  Below is a table indicating the mapping between the Bus Station Number/Name and the Power System Node Number.
     *      Where is that table?
     * It doesn't seem like any data in the trans system matters other than charging station stops?
     * Seems like this only needs 1 network visualization then..... idk
     *      
     */






    /** Pass data into PowNet class */
    let powNetwork = new PowNet(powNet);
    powNetwork.createNet();

    /** Pass data into TransNet class */
    let transNetwork = new TransNet();
    //transNetwork.createNet();

});