var gdata = [];
//nested is the data by date
var nestedData;
//printable is the actual data to be printed
var printableData = [];

var gmargin = {top: 20, right: 20, bottom: 30, left: 40},
    gwidth = document.getElementById('rightPanel').offsetWidth - gmargin.left - gmargin.right,
    gheight = document.getElementById('rightPanel').offsetHeight / 2 -  
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



function changeSelectOption(value) {
    if(value == "numTweets") {
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
    .orient("bottom")
    .tickFormat(d3.time.format("%m/%d"));
xAxis.ticks(d3.time.day, 5);
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


function sortByDateAscending(a, b) {
    // Dates will be cast to numbers automagically:
    return a.date - b.date;
}

d3.json("data.json", function(error,result) {
    result = type(result);
    
    result = result.sort(sortByDateAscending);
    gdata = result;
    //console.log("here");
    //console.log(gdata);
    
    nestedData = d3.nest()
        .key(function(d) { return d.time; })
        .sortKeys(d3.ascending)
        .entries(gdata);
    
    
    

    selectData("",null);

    if (error) throw error;

}); 


function selectData(country,type) {

    /*var nestedCountry = d3.nest()
        .key(function(d) { return d.location; })
        .sortKeys(d3.ascending)
        .entries(gdata);
    
    var values = null;
    for(var i =0; i < nestedData.length; i++) {
        if(nestedData[i].key == country) {
            values = i;
        }
    }*/
    
    printTweets(gdata,country);

   
    //printableData = new Array(nestedData.length);

    var dates = new Array(gdata.length);
    for(var i =0; i < gdata.length; i++) {
        dates[i] = gdata[i].time;
        //console.log(gdata[i]);
    }
    printableData = [];
    
    console.log(country);
    if(country != null)
        country = country.toLowerCase();

    for(var i =0; i < nestedData.length; i++) {
        var p = 0, n = 0,size = 0;
        for(var j = 0; j < nestedData[i].values.length; j++) {
            if(country ==  "" || country == null || (nestedData[i].values[j].location != null && nestedData[i].values[j].location == country)) {
                if(nestedData[i].values[j].sentiment > 0) {
                    p++;
                } else if(nestedData[i].values[j].sentiment < 0.0) {
                    n++;
                }
                size++;
           }
        }
        if(size > 0) {
            printableData.push({
                size:size,
                time:nestedData[i].key,
                pos:p / size,
                neg: -1 *n / size,
                posnum:p,
                negnum:n
            });
        }
    }

//    console.log("result "+ gdata.length);
//    console.log(nestedData);
    //console.log(printableData);

    minDate = d3.min(dates);
    maxDate = d3.max(dates);
//    console.log(minDate);
//    console.log(maxDate);

    //printableData =  printableData.sort(sortByDateAscending);

   
    if(type=="avgSentiment")        
        printAverageGraph(printableData);
    else
        printTotalGraph(printableData);
}


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
    d3.select("#chartotaltweets > *").remove();
    x.domain(d3.extent(printableData, function(d) { return d.time; }))
    ;
    
    y.domain([0,d3.max(printableData,function(d) { return d.size; })]);//d3.extent(printableData, function(d) { return d.size; }));

    var svg = d3.select("#chartotaltweets")//("body").append("svg")
        .attr("width", gwidth + gmargin.left + gmargin.right)
        .attr("height", gheight + gmargin.top + gmargin.bottom)
        
        .append("g")
        .attr("transform", "translate(" + gmargin.left + "," + gmargin.top + ")");

    svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + gheight + ")")
      .call(xAxis)
    .append("text")
      .attr("x", gwidth)
      .attr("dx", ".71em")
      .style("text-anchor", "end")
      .text("Date");

    svg.append("g")
      .attr("class", "axis")
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
                                            "Neg: "+formatDec(d.neg)+"<br>" +
                                            "Total: "+d.size);
        })
        .on('mouseleave',function(d,i){
            //tip.hide
           // hide();
            d3.select("#tooltip").style({visibility: "hidden",
                                        opacity:0});
        })

}

function printAverageGraph(printableData) {
        d3.select("#chartotaltweets > *").remove();
    x.domain(d3.extent(printableData, function(d) { return d.time; }));
    y.domain([-1,1]);//d3.extent(printableData, -1,function(d) { return Math.max(d.pos,d.neg) * 2; }));

    var svg = d3.select("#chartotaltweets")//("body").append("svg")
        .attr("width", gwidth + gmargin.left + gmargin.right)
        .attr("height", gheight + gmargin.top + gmargin.bottom)
        
        .append("g")
        .attr("transform", "translate(" + gmargin.left + "," + gmargin.top + ")")
        .attr("height", gheight + gmargin.top + gmargin.bottom);

    svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + gheight + ")")
      .call(xAxis)
    .append("text")
      .attr("x", gwidth)
      .attr("dx", ".71em")
      .style("text-anchor", "end")
      .text("Date");

    svg.append("g")
      .attr("class", "axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Amount of tweets");



    svg.append("path")
      .attr("class", "line")
      .attr("d", linePos(printableData))
        .style("stroke",'blue');
    
    svg.append("path")
      .attr("class", "line")
      .attr("d", lineNeg(printableData))
        .style("stroke",'red');

    svg.selectAll(".dot")
      .data(printableData)
      .enter().append("circle")
      .attr('class', 'datapoint')
      .attr('cx', function(d) { return x(d.time); })
      .attr('cy', function(d) { return y(d.pos); })
      .attr('r', 6)
      .attr('fill', 'white')
      .attr('stroke', 'blue')
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
                                            "Neg: "+formatDec(d.neg)+"<br>" +
                                            "Total: "+d.size);
        })
        .on('mouseleave',function(d,i){
            //tip.hide
           // hide();
            d3.select("#tooltip").style({visibility: "hidden",
                                        opacity:0});
        })

    svg.selectAll(".dot")
      .data(printableData)
      .enter().append("circle")
      .attr('class', 'datapoint')
      .attr('cx', function(d) { return x(d.time); })
      .attr('cy', function(d) { return y(d.neg); })
      .attr('r', 6)
      .attr('fill', 'white')
      .attr('stroke', 'red')
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

function printTweets(gData,country) {
//list of tweets
    if(country != null)
        country = country.toLowerCase();

    d3.select("#listtweets > *").remove();
    
    var tweD = [];
    for(var i = 0; i < gData.length; i++) {
        if(country == null || country == "" || (gData[i].location != null && gData[i].location == country)) {
            tweD.push({
                username:gData[i].username,
                tweet:gData[i].tweet,
                time:gData[i].time
            });
        //console.log(gData[i].username);
        }   
    }
    console.log(tweD.length);
    
    list = d3.select("#listtweets").selectAll("li")
        .data(tweD, function(d) {return d.username+": "+d.tweet + " "+d.time;        })
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