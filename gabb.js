var gdata = [];
//nested is the data by date
var nestedData;
//printable is the actual data to be printed
var printableData = [];

var gmargin = {top: 20, right: 20, bottom: 30, left: 40},
    gwidth = document.getElementById('rightPanel').offsetWidth - gmargin.left - gmargin.right,
    gheight = document.getElementById('rightPanel').offsetHeight / 2 - 
        document.getElementById('tweetTimeLabel').offsetHeight - 
        gmargin.top - gmargin.bottom;

var formatDec = d3.format(".2f");
var formatDate = d3.time.format("%m/%d/%Y");

//Checkboxes

var isPosChecked = true;
var isNegChecked = true;

d3.select("#posCheckbox").on("change", changePos);
d3.select("#posCheckbox").property('checked', true);
d3.select("#negCheckbox").on("change", changeNeg);
d3.select("#negCheckbox").property('checked', true);


function changePos() {
   isPosChecked = this.checked;
   console.log(this.value+" test "+this.checked);
}
function changeNeg() {
   isNegChecked = this.checked;
   console.log(this.value+" test "+this.checked);
    
}

//select
d3.select("#typeofdata").on("change",changeSelectOption);

function changeSelectOption() {
    console.log(this.value);
    if(this.value == "numTweets") {
        d3.select("#chartotaltweets > *").remove();
        printTotalGraph(printableData);
    } else {
        console.log("other");
        d3.select("#chartotaltweets > *").remove();
        printAverageGraph(printableData);
    }
}



var x = d3.time.scale()
    .range([0, gwidth]);

var y = d3.scale.linear()
    .range([gheight, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");


var line = d3.svg.line()
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d.size); });


var linePos = d3.svg.line()
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d.pos); });

var lineNeg = d3.svg.line()
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d.neg); });


d3.json("data.json", function(error,result) {
    result = type(result);
    gdata = result;
    //console.log("here");
    //console.log(gdata);
    printTweets(gdata);
    
    nestedData = d3.nest()
        .key(function(d) { return d.time; })
        .entries(result);

    var nestedDataSent = d3.nest()
        .key(function(d) { return d.time; })
        .key(function(d) { return d.sentiment; })
        .entries(result);

    //printableData = new Array(nestedData.length);

    var dates = new Array(gdata.length);
    for(var i =0; i < gdata.length; i++) {
        dates[i] = gdata[i].time;
        //console.log(gdata[i]);
    }

    for(var i =0; i < nestedData.length; i++) {
        var p = 0, n = 0;
        for(var j = 0; j < nestedData[i].values.length; j++) {
            if(nestedData[i].values[j].sentiment > 0) {
                p++;
            } else if(nestedData[i].values[j].sentiment < 0.0) {
                n++;
            }
        }
        printableData.push({
            size:nestedData[i].values.length,
            time:nestedData[i].key,
            pos:p / nestedData[i].values.length,
            neg:n / nestedData[i].values.length
        });
    }

//    console.log("result "+ gdata.length);
//    console.log(nestedData);
    //console.log(printableData);

    minDate = d3.min(dates);
    maxDate = d3.max(dates);
//    console.log(minDate);
//    console.log(maxDate);

    if (error) throw error;

    printTotalGraph(printableData);
}); 




/*function highlight(gdata) {
console.log(viz.selectAll("circle"));
viz.selectAll("circle").style("stroke", function(d,i) { return d.name==name ? "black" : undefined});
list.selectAll("li")
    .style("background-color", function(d,i) {console.log(d.name); return d.name == name ? "black" : undefined})
    .style("color",function(d,i){return d.name == name ? "white" : undefined});
}

function hide() {
viz.selectAll("circle").style("stroke", undefined);
list.selectAll("li")
    .style("background-color", undefined)
    .style("color",undefined);
}*/

function printTotalGraph(printableData) {
    x.domain(d3.extent(printableData, function(d) { return d.time; }));
    y.domain(d3.extent(printableData, function(d) { return d.size; }));

    var svg = d3.select("#chartotaltweets")//("body").append("svg")
        .attr("width", gwidth + gmargin.left + gmargin.right)
        .attr("height", gheight + gmargin.top + gmargin.bottom)
        
        .append("g")
        .attr("transform", "translate(" + gmargin.left + "," + gmargin.top + ")");

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + gheight + ")")
      .call(xAxis)
    .append("text")
      .attr("x", gwidth)
      .attr("dx", ".71em")
      .style("text-anchor", "end")
      .text("Date");

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Amount of tweets");



    svg.append("path")
      .attr("class", "line")
      .attr("d", line(printableData));

    svg.selectAll(".dot")
      .data(printableData)
      .enter().append("circle")
      .attr('class', 'datapoint')
      .attr('cx', function(d) { return x(d.time); })
      .attr('cy', function(d) { return y(d.size); })
      .attr('r', 6)
      .attr('fill', 'white')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', '3')
      .on('mouseenter',function(d,i){ 
        //tip.show
            //highlight(d);
    //    console.log(d3.event.clientX+","+d3.event.clientY);
            d3.select("#tooltip").style({
                                        position:"absolute",
                                        visibility: "visible",
                                         opacity:1,
                                        top:d3.event.clientY + "px",
                                        left:d3.event.clientX + "px"    
                                        }).html(
                                            "Pos: "+formatDec(d.pos)+"<br>"+
                                            "Neg: "+formatDec(d.neg)+"\t\n" +
                                            "Total: "+d.size);
        })
        .on('mouseleave',function(d,i){
            //tip.hide
           // hide();
            d3.select("#tooltip").style({visibility: "hidden",
                                        opacity:0});
        })

    /*        svg.append("path")
      .attr("class", "line")
      .attr("d", linePos(printableData));

    svg.append("path")
      .attr("class", "line")
      .attr("d", lineNeg(printableData));*/
}

function printAverageGraph(printableData) {
    x.domain(d3.extent(printableData, function(d) { return d.time; }));
    y.domain(d3.extent(printableData, function(d) { return Math.max(d.pos,d.neg); }));

    var svg = d3.select("#chartotaltweets")//("body").append("svg")
        .attr("width", gwidth + gmargin.left + gmargin.right)
        .attr("height", gheight + gmargin.top + gmargin.bottom)
        
        .append("g")
        .attr("transform", "translate(" + gmargin.left + "," + gmargin.top + ")")
        .attr("height", gheight + gmargin.top + gmargin.bottom);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + gheight + ")")
      .call(xAxis)
    .append("text")
      .attr("x", gwidth)
      .attr("dx", ".71em")
      .style("text-anchor", "end")
      .text("Date");

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Amount of tweets");



    svg.append("path")
      .attr("class", "line")
      .attr("d", linePos(printableData));

    svg.selectAll(".dot")
      .data(printableData)
      .enter().append("circle")
      .attr('class', 'datapoint')
      .attr('cx', function(d) { return x(d.time); })
      .attr('cy', function(d) { return y(d.pos); })
      .attr('r', 6)
      .attr('fill', 'white')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', '3')
      .on('mouseenter',function(d,i){ 
        //tip.show
            //highlight(d);
    //    console.log(d3.event.clientX+","+d3.event.clientY);
            d3.select("#tooltip").style({
                                        position:"absolute",
                                        visibility: "visible",
                                         opacity:1,
                                        top:d3.event.clientY + "px",
                                        left:d3.event.clientX + "px"    
                                        }).html(
                                            "Pos: "+formatDec(d.pos)+"<br>"+
                                            "Neg: "+formatDec(d.neg)+"\t\n" +
                                            "Total: "+d.size);
        })
        .on('mouseleave',function(d,i){
            //tip.hide
           // hide();
            d3.select("#tooltip").style({visibility: "hidden",
                                        opacity:0});
        })

    /*        svg.append("path")
      .attr("class", "line")
      .attr("d", linePos(printableData));

    svg.append("path")
      .attr("class", "line")
      .attr("d", lineNeg(printableData));*/
}

function printTweets(gdata) {
//list of tweets
list = d3.select("#listtweets").selectAll("li")
    .data(gdata, function(d) {
        return d.username+": "+d.tweet + " "+d.time;
    })
;
list.enter()
    .append("li")
    .html(function(d) {return "<b>"+d.username+":</b><br> "+d.tweet + " <br>"}).attr("width",50);

list.exit().remove();
}

function type(d) {
//console.log(d);
for(var i = 0; i < d.length; i++) {
    //console.log("time"+d[i].time);
    d[i].time = +(formatDate.parse(d[i].time));
    d[i].support = +d[i].support;
    d[i].sentiment = +d[i].sentiment;
  //  console.log("time2"+d[i].time);
}
//console.log("done");
return d;
}