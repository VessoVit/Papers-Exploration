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
        this.view.renderSVG(id, this.model.getData());
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

    renderSVG(id, data) {
        // console.log(data[id].outCitations);
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
                    console.log("The user wants to know about " + d.title);
                    d3.selectAll(".cd-panel")
                        .classed("cd-panel--is-visible", true);
                    d3.selectAll(".cd-panel__content--text")
                        .html("<h1 class = paper-detail-title>" + d.title + "</h1>"
                            + "<ul class=subhead data-selenium-selector=paper-meta-subhead>" +
                            "<li>" +
                            "<span class=author-list>" +
                            "<span data-heap-id data-heap-author-id>" +
                            "<span class=author-list__author-name>" +
                            "<span>Yann LeCun</span></span></span>" +
                            "<span data-heap-id data-heap-author-id>, " +
                            "<span class=author-list__author-name>" +
                            "<span>Yoshua Bengio</span></span></span>" +
                            "<span data-heap-id data-heap-author-id=1695689>, " +
                            "<a class='author-list__link author-list__author-name' href=/author/Geoffrey-E.-Hinton/1695689>" +
                            "<span class=''>" +
                            "<span>Geoffrey E. Hinton</span></span></a></span></span></li>" +
                            "<li>Published in <span data-selenium-selector='venue-metadata'>" +
                            "<span class=''>" +
                            "<span>Nature</span></span></span> " +
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
            },
            {
                label: "background",
                items: [
                    {
                        label: "red",
                        onClick: function () {
                            svg.node().style.background = "#ff0000";
                        }
                    },
                    {
                        label: "blue",
                        action: function () {
                            svg.node().style.background = "#0000ff";
                        }
                    },
                    {
                        label: "pink",
                        action: function () {
                            alert('pink is clicked!');
                        },
                        items: function () {
                            return [
                                {
                                    label: "deep pink",
                                    action: function () {
                                        svg.node().style.background = "#ff1493";
                                    }
                                },
                                {
                                    label() {
                                        return "shocking pink";
                                    },
                                    action() {
                                        svg.node().style.background = "#fc0fc0";
                                    }
                                }
                            ];
                        }
                    }
                ]
            }
        ];

        // end of temporary item

        if (data[id].citations.length > 0){
            console.log(data[id].citations.length);
            for (i = 0; (i < 20) && (i < data[id].citations.length); i++) {
                console.log("i = " + i);
                console.log(data[id].citations[i]);
                // newNode = new ABNode(data[id].citations[i].title, data[id].citations[i].paperId);
                // console.log(newNode);
                this.paperList.nodes.push({
                    "title": data[id].citations[i]["title"],
                    "paperId": data[id].citations[i]["paperId"],
                    "abstract": data[id].citations[i]["abstract"],
                    "citations": data[id].citations[i]["citations"]
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
            .force("center", d3.forceCenter(width / 2, height / 2))

        node.append("circle")
            .attr("r", 20)
            // .attr("fill", "#bb2280")
            .on("click", function (d) {
                if (d3.event.shiftKey) {
                    d3.select("cd-panel")
                        .attr("class", "cd-panel--is-visible");
                } else {
                    let paper;
                    for (paper of this.paperList.nodes) {
                        console.log(paper.isExpanded);
                        if ((paper["paperId"] === d.paperId) && (paper["isExpanded"] == false)) {
                            console.log(paper["isExpanded"]);
                            console.log(d.title);
                            let subpaper;
                            for (subpaper of paper["citations"]) {
                                console.log(subpaper.title);
                                this.paperList.nodes.push({
                                    "title": subpaper.title, "paperId": subpaper.paperId
                                });
                                this.paperList.links.push({"source": paper.paperId, "target": subpaper.paperId});
                            }
                            paper.isExpanded = true;
                            restart();
                        }
                    }
                }
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
            node = node.data(this.paperList.nodes);
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

            // node.remove("text");

            // node = svg.selectAll(".node");
            enter
                .append("text")
                .attr("dx", 6)
                .text(function (d) {
                    return d.title;
                })
                .attr("font-family", "Helvetica")
                .attr("font-size", "0.75em");

            node = node.merge(enter);

            // node.enter().merge(node);

            // Apply the general update pattern to the links.
            link = link.data(this.paperList.links, function (d) {
                return d.source.paperId + "-" + d.target.paperId;
            });
            link.exit().remove();
            link = link.enter().append("line").merge(link);

            // Update and restart the simulation.
            simulation.nodes(this.paperList.nodes);
            simulation.force("link").links(this.paperList.links);
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