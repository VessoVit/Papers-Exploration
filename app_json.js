let data;

// this is the Controller

class Controller {
    constructor() {
        this.model = new Model(this);
        this.view = new View(this);
    }

    getModel() {
        return this.model;
    }

    getView() {
        return this.view;
    }

    displayListPaper() {
        this.view.simpleDisplay(this.model.getData());
    }
}

// this is the View class

class View {
    constructor(controller) {
        this.constroller = controller;
    }

    update(){
        console.log('model has changed');
        this.constroller.displayListPaper();
    }

    simpleDisplay(data1) {
        for (var i = 0; i < 10000; i++) {
            d3.select("#root")
                .append("a")
                .attr("href", data1[i].s2Url)
                .html(data1[i].title);
            d3.select("#root")
                .append("br");
        }
    }
}

// this is the Model class

class Model {
    constructor(controller) {
        this.controller = controller;
    }

    importData(data) {
        this.data = data;
        this.modelChange();
    }

    modelChange(){
        this.controller.getView().update();
    }

    getData(){
        return this.data;
    }
}

// main program

const app = new Controller();

d3.json("paperfix.json", function (error, data) {
    if (error) throw error;
    app.getModel().importData(data);
    ;});
