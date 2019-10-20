/** Class implementing the transportation network */
class TransNet {

    // Creates a Power Network object
    constructor(data){
        //Assigning data variable
        this.data = data;

        //Margins - the bostock way
        this.margin = {top: 20, right: 20, bottom: 20, left: 20};
        this.width = 700 - this.margin.left - this.margin.right;
        this.height = 700 - this.margin.top-this.margin.bottom; 

    }

}