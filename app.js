class Controller {
    constructor(model, view) {
        this.model = model
        this.view = view;
    }
}

class View {
    constructor() {}
}

class Model {
    constructor() {}
}


function CloseInfo() {
    d3.selectAll(".cd-panel").classed("cd-panel--is-visible", false);
}

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
                displayGraph(d.paperId);
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


let paperList = {"nodes": [], "links": []};
let newNode;

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("width", 200)
    .style("height", 80);
function displayGraph(paperId){
    let i = 0;


    d3.select("svg").selectAll("*").remove();

    paperList = {"nodes": [], "links": []};

    let response = fetch("http://api.semanticscholar.org/v1/paper/" + paperId);
    let _text = "abc";
    let number = 10;
    function print2Screen(txt) {
        console.log(txt);
    }

    fetch("http://api.semanticscholar.org/v1/paper/" + paperId)
        .then(function(data) {
            data.text().then(function (text) {
                print2Screen(text);
            });
        });

    // console.log(_text);

    fetch("http://api.semanticscholar.org/v1/paper/" + paperId)
        .then(function(data) {
            data.text().then(function (text) {
                // console.log(text);
                let data = JSON.parse(text);
                let _text = "abc";
                // console.log(JSON.parse(text));
                //     });
                // });

                // d3.json("paper.json", function (error, data) {
                //     if (error) throw error;
                //     console.log(data);
                // for (pure of data) {
                //     pure.isExpanded = false;
                // }
                // data[0].isExpanded = true;
                // paperList.nodes.push({
                //     "title": data[0]["title"],
                //     "paperId": data[0]["paperId"],
                //     "abstract": data[0]["abstract"],
                //     "arxivId": data[0]["arxivId"],
                //     "authors": data[0]["authors"],
                //     "citationVelocity": data[0]["citationVelocity"],
                //     "doi": data[0]["doi"],
                //     "influentialCitationCount": data[0]["influentialCitationCount"],
                //     "topics": data[0]["topics"],
                //     "url": data[0]["url"],
                //     "venue": data[0]["Nature"],
                //     "year": data[0]["year"]
                // });

                paperList.nodes[0] = data;
                // console.log(data);
                var i = 0;
                var sourceID, targetID;
                for (i = 0; (i < 20) && (i < data["citations"].length); i++) {
                    if (true) {
                        newNode = new ABNode(data["citations"][i].title, data["citations"][i].paperId);
                        paperList.nodes.push({
                            "title": data["citations"][i]["title"],
                            "paperId": data["citations"][i]["paperId"],
                            "abstract": data["citations"][i]["abstract"],
                            "citations": data["citations"][i]["citations"]
                        });
                        // console.log(paperList.nodes[0].paperId);
                        sourceID = paperList.nodes[0].paperId;
                        targetID = newNode.paperId;
                        paperList.links.push({"source": sourceID, "target": targetID});
                    }
                }

                console.log(paperList);


                var svg = d3.select("svg"),
                    width = +svg.attr("width"),
                    height = +svg.attr("height");

                var color = d3.scaleOrdinal(d3.schemeCategory20);

                var link = svg.append("g")
                    .attr("class", "links")
                    .selectAll("line")
                    .data(paperList.links)
                    .enter()
                    .append("line")
                    .style("stroke", "#aaa")

                var node = svg.selectAll(".node")
                    .data(paperList.nodes)
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
                            for (paper of paperList.nodes) {
                                console.log(paper.isExpanded);
                                if ((paper["paperId"] === d.paperId) && (paper["isExpanded"] == false)) {
                                    console.log(paper["isExpanded"]);
                                    console.log(d.title);
                                    let subpaper;
                                    for (subpaper of paper["citations"]) {
                                        console.log(subpaper.title);
                                        paperList.nodes.push({
                                            "title": subpaper.title, "paperId": subpaper.paperId
                                        });
                                        paperList.links.push({"source": paper.paperId, "target": subpaper.paperId});
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
                    .nodes(paperList.nodes)
                    .on("tick", ticked);

                simulation.force("link")
                    .links(paperList.links);


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
                    node = node.data(paperList.nodes);
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
                                        paperList.nodes.push({"title": subpaper.title, "paperId": subpaper.paperId});
                                        paperList.links.push({"source": paper.paperId, "target": subpaper.paperId});
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
                    link = link.data(paperList.links, function (d) {
                        return d.source.paperId + "-" + d.target.paperId;
                    });
                    link.exit().remove();
                    link = link.enter().append("line").merge(link);

                    // Update and restart the simulation.
                    simulation.nodes(paperList.nodes);
                    simulation.force("link").links(paperList.links);
                    simulation.alpha(1).restart();
                }
            });
// this is only for the fetch, if not using fetch, remove this
        });
    // end of fetch extension
}

displayGraph("e4845fb1e624965d4f036d7fd32e8dcdd2408148");