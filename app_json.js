let data;

// this is the Controller

class Controller {
    constructor() {
        this.model = new Model(this);
        // this.view = new View(this);
    }

    setView(view){
        this.view = view;
    }

    changeSaveOption(saveOption) {
        console.log("save option: " + saveOption);
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

    visualize(id){
        console.log("I am visualizing this paper");
        this.view.renderSVG(id, this.model.getData(), this.view);
    }

    playPaper(id) {
        var i;
        var paperExists = false;
        for (i = 0; i < this.model.getData().length; i++) {
            if (this.model.getData()[i].paperId == id) {
                paperExists = true;
                break;
            }
        }
        if (!paperExists) {
            console.log("I'm gonna fetch this, add this to my database, and the visualize it for you!");
            fetch("http://api.semanticscholar.org/v1/paper/" + id)
                .then(function(data) {
                    data.text().then(function (text) {
                        var json = JSON.parse(text);
                        app.addToDB(json);
                        app.visualize(i);
                    });
                });
        }
    }

    addToDB(record) {
        this.model.appendDB(record);
    }
}

// this is the View class

class View {
    constructor(controller) {
        this.controller = controller;
        this.controller.setView(this);
        this.paperList = {"nodes": [], "links": []};
        this.setupUI();
    }

    dummyFunc(id){
        console.log("I am dummy" + id);
        this.controller.visualize(id);
    }

    update(){
        console.log('model has changed');
        this.controller.displayListPaper();
    }

    explorePaper(id) {
        this.controller.playPaper(id);
    }

    renderSVG(id, data, view) {
        d3.select("svg").selectAll("*").remove();

        this.paperList = {"nodes": [], "links": []};
        this.paperList.nodes[0] = data[id];
        var i = 0;
        var sourceID, targetID;

        // temporary item for now
        var items = [
            {
                label: "Show Details about Paper",
                onClick: function (d) {
                    var authorList = "<span class='author-list'>";
                    for (var i = 0; i < d.authors.length; i++) {
                        authorList = authorList + "<span data-heap-id data-heap-author-id>" +
                                                    "<span class=author-list__author-name>";
                        authorList = authorList + "<span>" + d.authors[i].name + "<br></span></span></span>";
                    }
                    authorList = authorList + "</span>";
                    console.log("The user wants to know about " + d.title);
                    d3.selectAll(".cd-panel")
                        .classed("cd-panel--is-visible", true);
                    d3.selectAll(".cd-panel__content--text")
                        .html("<h1 class = paper-detail-title>" + d.title + "</h1>"
                            + "<ul class=subhead data-selenium-selector=paper-meta-subhead>" +
                            "<li>" + authorList +
                            "<span data-selenium-selector='paper-year'>" +
                            "<span class=''>" +
                            "<span>2015</span></span></span></li>" +
                            "<li data-selenium-selector='paper-doi'>" +
                            "<section class='doi'>" +
                            "<span class='doi__label'>DOI:</span>" +
                            "<a class='doi__link' href='https://doi.org/10.1038/nature14539'>10.1038/nature14539</a></section></li></ul>"
                            + "Abstract: " + "<div class='cd-panel__content--abstract'>" + d.abstract + "</div>")
                    ;
                }
            },
            {
                label: "Explore this paper",
                onClick: function(d) {
                    if (d.paperId != null) {
                        view.explorePaper(d.paperId);
                    }
                }
            }
        ];

        // end of temporary item

        if (data[id].citations.length > 0){
            console.log(data[id].citations.length);
            for (i = 0; (i < 20) && (i < data[id].citations.length); i++) {
                console.log("i = " + i);
                console.log(data[id].citations[i]);
                this.paperList.nodes.push({
                    "title": data[id].citations[i]["title"],
                    "paperId": data[id].citations[i]["paperId"],
                    "abstract": data[id].citations[i]["abstract"],
                });
                sourceID = this.paperList.nodes[0].paperId;
                targetID = data[id].citations[i].paperId;
                this.paperList.links.push({"source": sourceID, "target": targetID});
            }
        }

        console.log(this.paperList);

        var svg = d3.select("svg"),
            width = +svg.attr("width"),
            height = +svg.attr("height");

        var color = d3.scaleOrdinal(d3.schemeCategory20);

        var link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(this.paperList.links)
            .enter()
            .append("line")
            .style("stroke", "#aaa")

        var node = svg.selectAll(".node")
            .data(this.paperList.nodes)
            .enter().append("g")
            .attr("class", "node")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));


        var simulation = d3.forceSimulation()
            .force("link", d3.forceLink()
                .id(function (d) {
                    return d.paperId;
                }).distance(200))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 3, height / 2))

        function addToTree(branch){
            var ppList = view.paperList;
            for (var i = 0; i < ppList.nodes.length; i++) {
                if (ppList.nodes[i].paperId == branch.paperId){
                    ppList.nodes[i].abstract = branch.abstract;
                    console.log("found it");
                    break;
                }
            }
            for (i = 0; (i < 20) && (i < branch.citations.length); i++) {
                view.paperList.nodes.push({
                    "title": branch.citations[i]["title"],
                    "paperId": branch.citations[i]["paperId"],
                    "abstract": branch.citations[i]["abstract"],
                });
                sourceID = branch.paperId;
                targetID = branch.citations[i].paperId;
                view.paperList.links.push({"source": sourceID, "target": targetID});
            }
            restart();
        }

        node.append("circle")
            .attr("r", 20)
            .on("click", function (d) {
                console.log("The user has clicked on a circle " + d.paperId);
                //// working on this



                fetch("http://api.semanticscholar.org/v1/paper/" + d.paperId)
                    .then(function(data) {
                        console.log("got the data");
                        data.text().then(function (text) {
                            var json = JSON.parse(text);
                            addToTree(json);
                        });
                    });
            })
            .on("mouseover", handleMouseOver)
            .on("mouseleave", handleMouseOut)
            .on('contextmenu', d3.contextmenu(items));

        function handleMouseOver(d, i) {
            console.log("mouse has entered");
            d3.select(this).attr("fill", "blue")
                .style("stroke", "orange")
                .style("stroke-width", "4px");
        }

        function handleMouseOut(d, i) {
            d3.select(this).attr("fill", "black")
                .style("stroke", "none");
        }

        node.append("text")
            .attr("dx", 6)
            .text(function (d) {
                return d.title;
            })
            .attr("font-family", "Helvetica")
            .attr("font-size", "0.75em");

        simulation
            .nodes(this.paperList.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(this.paperList.links);


        function ticked() {
            link
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

            node.attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        }

        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        function restart() {

            // Apply the general update pattern to the nodes.
            // node = node.data(paperList.nodes, function(d) { return d.paperId;});
            node = node.data(view.paperList.nodes);
            node.exit().remove();
            var enter = node.enter().append("g")
                .attr("class", "node")
                // .merge(node)
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            enter.append("circle")
                .attr("r", 20)
                .on("click", function (d) {
                    let paper;
                    for (paper of data) {
                        if (paper["paperId"] === d.paperId) {
                            console.log(d.title);
                            let subpaper;
                            for (subpaper of paper["citations"]) {
                                console.log(subpaper.title);
                                this.paperList.nodes.push({"title": subpaper.title, "paperId": subpaper.paperId});
                                this.paperList.links.push({"source": paper.paperId, "target": subpaper.paperId});
                                restart();
                            }
                        }
                    }
                })
                .on("mouseover", handleMouseOver)
                .on("mouseleave", handleMouseOut);

            enter
                .append("text")
                .attr("dx", 6)
                .text(function (d) {
                    return d.title;
                })
                .attr("font-family", "Helvetica")
                .attr("font-size", "0.75em");

            node = node.merge(enter);

            link = link.data(view.paperList.links, function (d) {
                return d.source.paperId + "-" + d.target.paperId;
            });
            link.exit().remove();
            link = link.enter().append("line").merge(link);

            // Update and restart the simulation.
            simulation.nodes(view.paperList.nodes);
            simulation.force("link").links(view.paperList.links);
            simulation.alpha(1).restart();
        }

    }

    simpleDisplay(data1) {
        console.log(data1);
        var root = d3.select("#root");
        root.html("");
        for (var i = 0; i < data1.length; i++) {
            var item = root.append("div");
            item.classed("single-page-item", true);
            item.append("a")
                .attr("href", "http://api.semanticscholar.org/" + data1[i].paperId)
                .html(data1[i].title);
            item.append("button")
                .attr("type", "button")
                .attr("onclick", "view.dummyFunc(" + i + ")")
                .html("Visualize");
        }
    }

    setupUI() {
        var ui = d3.select("#UI");
        var form = ui.append("form");
        form.html("Do you want to save the list to offline JSON file?" +
            "<label class='switch'>" +
            "<input id='save-option' type='checkbox' onclick='view.changeOption()'>" +
            "<span class='slider'></span></label>");
    }

    changeOption() {
        console.log("The user has changed his mind");
        var saveOption = document.getElementById("save-option").checked;
        this.controller.changeSaveOption(saveOption);
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

    appendDB(record) {
        this.data.push(record);
        this.modelChange();
    }
}

// main program

const app = new Controller();
const view = new View(app);

d3.json("paper.json", function (error, data) {
    if (error) throw error;
    app.getModel().importData(data);
    ;});

function CloseInfo() {
    d3.selectAll(".cd-panel").classed("cd-panel--is-visible", false);
}