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
var cradius = 2;

d3.select("#posCheckbox").on("change", changePos);
d3.select("#posCheckbox").property('checked', true);
d3.select("#negCheckbox").on("change", changeNeg);
d3.select("#negCheckbox").property('checked', true);


function changePos() {
   isPosChecked = this.checked;
   //console.log(this.value+" test "+this.checked);
}
function changeNeg() {
   isNegChecked = this.checked;
   //console.log(this.value+" test "+this.checked);
    
}



function changeSelectOption(value) {
    if(value == "numTweets") {
        d3.select("#chartotaltweets > *").remove();
        printTotalGraph(printableData);
    } else {
        //console.log("other");
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

var lineTotPos = d3.svg.line()
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d.posnum); });

var lineTotNeg = d3.svg.line()
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d.negnum); });

var lineTotNeu = d3.svg.line()
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d.neunum); });


var linePos = d3.svg.line()
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d.pos); });

var lineNeg = d3.svg.line()
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d.neg); });

function hasTextHash(data,hash) {
    for(var i = 0; i < data.word.length; i++) {
        if(data.word[i] == hash) {
            return true;
        }
    }
    return false;
}

function hasTextUser(data,hash) {
    for(var i = 0; i < data.user.length; i++) {
        if(data.user[i] == hash) {
            return true;
        }
    }
    return false;
}

function sortByDateAscending(a, b) {
    // Dates will be cast to numbers automagically:
    return a.date - b.date;
}

d3.json("data.json", function(error,result) {
    //result = type(result);
    
    //result = result.sort(sortByDateAscending);
    result = type(result);
    //console.log(result[0].time);
    gdata = result;
    ////console.log("here");
    //console.log(gdata);
    
    nestedData = d3.nest()
        .key(function(d) { return d.time; })
        .sortKeys(d3.ascending)
        .entries(gdata);
    
    
    //console.log(nestedData);

    selectData("",null);

    if (error) throw error;

}); 

var dates;
function selectData(filterChoice,type,timeSlider) {
    var country="", username="",hashtag="";
    var aux = filterChoice.toLowerCase().split(",");
    for(var i = 0; i < aux.length; i++) {
        if(aux[i].length > 1 && aux[i].charAt(0) == '#') {
            hashtag = aux[i].split("#")[1];
        } else if(aux[i].length > 1 && aux[i].charAt(0) == '@') {
            username = aux[i].split("@")[1];
        } else {
            country = aux[i];
        }
    }
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
    
    

   
    //printableData = new Array(nestedData.length);

    dates = new Array(nestedData.length);
    for(var i =0; i < nestedData.length; i++) {
        dates[i] = nestedData[i].key;
        //console.log(gdata[i]);
    }
    
    
    
    
    
    printableData = [];
    for(var i =0; i < nestedData.length; i++) {
        var p = 0, n = 0,size = 0, neu = 0;
        for(var j = 0; j < nestedData[i].values.length; j++) {
            if((country ==  "" || country == null || (nestedData[i].values[j].location != null && nestedData[i].values[j].location == country)) &&
               (hashtag == null || hashtag == "" || (nestedData[i].values[j].keywords != null && hasTextHash(nestedData[i].values[j].keywords,hashtag)))&&
                (username == null || username == "" || (nestedData[i].values[j].usernames != null && hasTextUser(nestedData[i].values[j].usernames,username)))) {
                if(nestedData[i].values[j].sentiment > 0) {
                    p++;
                } else if(nestedData[i].values[j].sentiment < 0.0) {
                    n++;
                } else {
                    neu++;
                }
                size++;
           }
        }
        
        
        if(size > 0) {
            printableData.push({
                size:size,
                time:nestedData[i].key,
                pos:p / size,
                neg: n / size,
                posnum:p,
                negnum:n,
                neunum:neu,
                date:nestedData[i].values[0].date
            });
            
        }
    }
    
    printTweets(gdata,country,username,hashtag,timeSlider);
    //console.log(printableData);
    x.domain([d3.min(dates),d3.max(dates)]);
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
    
    if( timeSlider!= null)
    changeLineInGraph(timeSlider);
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

// from here: http://stackoverflow.com/a/1968345/16363
var hoverLine = null;

function changeLineInGraph(sliderInt) {
    //console.log(dates);
    //console.log((sliderInt-1)+" "+dates[sliderInt-1]+" "+x(dates[sliderInt-1]));
    hoverLine.attr("x1", x(dates[sliderInt-1]))     // x position of the first end of the line
      .attr("x2", x(dates[sliderInt-1]));
}

function printMouse(d,i) {
    //function(d,i){ 
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
                                            "Date: "+formatDate(d.date)+"<br>"+
                                            "Pos: "+formatDec(d.posnum)+"<br>"+
                                            "Neg: "+formatDec(d.negnum)+"<br>" +
                                            "Neu: "+formatDec(d.neunum)+"<br>" +
                                            "Total: "+d.size);
      //  }
}

function printTotalGraph(printableData) {
    d3.select("#chartotaltweets > *").remove();
    
    
    y.domain([0,d3.max(printableData,function(d) { return Math.max(d.posnum,Math.max(d.negnum,d.neunum)); })]);//d3.extent(printableData, function(d) { return d.size; }));

    var svg = d3.select("#chartotaltweets")//("body").append("svg")
        .attr("width", gwidth + gmargin.left + gmargin.right)
        .attr("height", gheight + gmargin.top + gmargin.bottom)
        /*.on('mouseenter',function(d,i){ 
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
                                            "Possasa"+d);
        })
        .on('mouseleave',function(d,i){
            //tip.hide
           // hide();
            d3.select("#tooltip").style({visibility: "hidden",
                                        opacity:0});
        })*/
        .append("g")
        .attr("transform", "translate(" + gmargin.left + "," + gmargin.top + ")")
    ;
    
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

    hoverLine = svg.append("line")
      //.attr("class", "line")
      //.attr("x1", printableData[0].time)     // x position of the first end of the line
      //.attr("x2", printableData[printableData.length-1].time)      // y position of the first end of the line
      .attr("x1", 0)     // x position of the first end of the line
      .attr("x2", 0)      // y position of the first end of the line
      .attr("y1", 0)     // x position of the second end of the line
      .attr("y2", gheight)
    //.attr("opacity",0)
      .style("stroke",'grey');
    ///.x(function(d) { return x(d.time); })
    //.y(function(d) { return y(d.size); });

    svg.append("path")
      .attr("class", "line")
      .attr("d", lineTotPos(printableData))
            .style("stroke",'blue');;
    
     svg.append("path")
      .attr("class", "line")
      .attr("d", lineTotNeg(printableData))
            .style("stroke",'red');
    
    svg.append("path")
      .attr("class", "line")
      .attr("d", lineTotNeu(printableData))
            .style("stroke",'dimgray');

    var parseDate = d3.time.format("%d");

    svg.selectAll(".dot")
      .data(printableData)
      .enter().append("circle")
      .attr('class', 'datapoint')
      .attr('cx', function(d) { return x(d.time); })
      .attr('cy', function(d) { return y(d.posnum); })
      .attr('r', cradius)
      .attr('fill', 'blue')
      .attr('stroke', 'blue')
      .attr('stroke-width', '3')
      .on('mouseenter',function(d,i){ printMouse(d,i)})
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
      .attr('cy', function(d) { return y(d.negnum); })
      .attr('r', cradius)
      .attr('fill', 'red')
      .attr('stroke', 'red')
      .attr('stroke-width', '3')
      .on('mouseenter',function(d,i){ printMouse(d,i)})
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
      .attr('cy', function(d) { return y(d.neunum); })
      .attr('r', cradius)
      .attr('fill', 'dimgrey')
      .attr('stroke', 'dimgrey')
      .attr('stroke-width', '3')
      .on('mouseenter',function(d,i){ printMouse(d,i)})
        .on('mouseleave',function(d,i){
            //tip.hide
           // hide();
            d3.select("#tooltip").style({visibility: "hidden",
                                        opacity:0});
        })
}

function printAverageGraph(printableData) {
        d3.select("#chartotaltweets > *").remove();
    //x.domain(d3.extent(printableData, function(d) { return d.time; }));
    y.domain([0,1]);//d3.extent(printableData, -1,function(d) { return Math.max(d.pos,d.neg) * 2; }));

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

    hoverLine = svg.append("line")
      //.attr("class", "line")
      //.attr("x1", printableData[0].time)     // x position of the first end of the line
      //.attr("x2", printableData[printableData.length-1].time)      // y position of the first end of the line
      .attr("x1", 0)     // x position of the first end of the line
      .attr("x2", 0)      // y position of the first end of the line
      .attr("y1", 0)     // x position of the second end of the line
      .attr("y2", gheight)
    //.attr("opacity",0)
      .style("stroke",'grey');
    
    svg.selectAll(".dot")
      .data(printableData)
      .enter().append("circle")
      .attr('class', 'datapoint')
      .attr('cx', function(d) { return x(d.time); })
      .attr('cy', function(d) { return y(d.pos); })
      .attr('r', cradius)
      .attr('fill', 'white')
      .attr('stroke', 'blue')
      .attr('stroke-width', '3')
      .on('mouseenter',function(d,i){ printMouse(d,i)})
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
      .attr('r', cradius)
      .attr('fill', 'white')
      .attr('stroke', 'red')
      .attr('stroke-width', '3')
      .on('mouseenter',function(d,i){ printMouse(d,i)})
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



function printTweets(gData,country,username,hashtag,sliderInt) {
//list of tweets
    if(country != null)
        country = country.toLowerCase();

    d3.select("#listtweets > *").remove();
    //console.log(country);
    var tweD = [];
    for(var i = 0; i < gData.length; i++) {
        if((country == null || country == "" || (gData[i].location != null && gData[i].location == country)) &&
            (hashtag == null || hashtag == "" || (gData[i].keywords != null && hasTextHash(gData[i].keywords,hashtag)))&&
            (username == null || username == "" || (gData[i].usernames != null && hasTextUser(gData[i].usernames,username))) &&
            (sliderInt == null || (dates[sliderInt-1] == gData[i].time))) {
            tweD.push({
                username:gData[i].username,
                tweet:gData[i].tweet,
                time:gData[i].time,
                sentiment:gData[i].sentiment,
                hashtags:gData[i].keywords,
                usernames:gData[i].usernames,
                date:gData[i].date
            });
        //console.log(gData[i].username);
        }   
    }
    //console.log(tweD.length);
    
    list = d3.select("#listtweets").selectAll("li")
        .data(tweD, function(d) {return d.username+": "+d.tweet + " "+d.time;        })
    ;
    list.enter()
        .append("li")
        .html(function(d) {return "<b>"+d.username+"</b> ("+ formatDate(d.date) +"):<br> "+d.tweet + " <br>"}).attr("width",50)
    .on('mouseenter',function(d,i){ 
        //tip.show
            //highlight(d);
            d3.select("#tooltip").style({
                                        position:"absolute",
                                        visibility: "visible",
                                         opacity:2,
                                        top:d3.event.clientY + "px",
                                        left:d3.event.clientX + "px"    
                                        }).html(
                                            "Sentiment: "+d.sentiment+"<br>"
                
                                            +d.tweet
                                            );
        })
        .on('mouseleave',function(d,i){
            //tip.hide
           // hide();
            d3.select("#tooltip").style({visibility: "hidden",
                                        opacity:0});
        });

    list.exit().remove();
}

function type(d) {
//console.log(d);
for(var i = 0; i < d.length; i++) {
    //console.log("time"+d[i].time);
    d[i].date = (formatDate.parse(""+d[i].time));
    d[i].time = +(formatDate.parse(d[i].time));
    d[i].support = +d[i].support;
    d[i].sentiment = +d[i].sentiment;
    //console.log("time2"+d[i].time);
    //console.log(d[i].time);
}
//console.log("done");
return d;
}