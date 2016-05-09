function drawHistograms(){
    var margin = {left:5, right:5, top:5, bottom:5};
    var width = document.getElementById('rightPanel').offsetWidth / 2;
    var height = document.getElementById('rightPanel').offsetHeight / 2 - 
        document.getElementById('hashUserLabel').offsetHeight;
    var barHeight = 20;
    var gapBetween = 5;
    var labelSpaces = 130;
    
    var tweets = [];
    var hashtagData = [];
    var usernameData = [];
    
    function load(){
        d3.json("newData.json", 
                function(error, result){
                    tweets = result;
                    var tempHashDic = {};
                    var tempUserDic = {};
                    for (var i=0; i< tweets.data.row.length; i++){
                        var tweet = tweets.data.row[i];
                        if(!(tweet.keywords.word instanceof Array)){
                            var tag = tweet.keywords.word.toLowerCase();
                            if(tempHashDic.hasOwnProperty(tag)){
                                tempHashDic[tag] += 1;
                            }
                            else{
                                tempHashDic[tag] = 1;
                            }
                        }
                        else{
                            for (var j=0; j<tweet.keywords.word.length; j++){
                                var tag = tweet.keywords.word[j].toLowerCase();
                                if(tag.trim().length <= 1){
                                    continue;
                                }
                                if(tempHashDic.hasOwnProperty(tag)){
                                    tempHashDic[tag] += 1;
                                }
                                else{
                                    tempHashDic[tag] = 1;
                                }
                            }
                        }
                        
                        
                        if(!(tweet.usernames.user instanceof Array)){
                            var user = tweet.usernames.user.toLowerCase();
                            if(tempUserDic.hasOwnProperty(user)){
                                tempUserDic[user] += 1;
                            }
                            else{
                                tempUserDic[user] = 1;
                            }
                        }
                        else{
                            for (var j=0; j<tweet.usernames.user.length; j++){
                                var user = tweet.usernames.user[j].toLowerCase();
                                if(tempUserDic.hasOwnProperty(user)){
                                    tempUserDic[user] += 1;
                                }
                                else{
                                    tempUserDic[user] = 1;
                                }
                            }
                        }
                    }
                    for(var key in tempHashDic){
                        hashtagData.push({label:key, value:tempHashDic[key]});
                    }
                    for(var key in tempUserDic){
                        if(key[key.length - 1] == ":"){
                            usernameData.push({label:key.substring(0, key.length - 1), value:tempUserDic[key]});
                        }
                        else{
                            usernameData.push({label:key, value:tempUserDic[key]});
                        }
                    }
                    hashtagData.sort(function(x, y){
                           return d3.descending(x.value, y.value);
                        });
                    usernameData.sort(function(x, y){
                           return d3.descending(x.value, y.value);
                        });
                    renderUserHistogram();
                    renderHashtagHistogram();
                });
    }
    
    function renderUserHistogram(){
        var zippedData = [];
        var labels = [];
        for (var i=0; i<usernameData.length; i++) {
            labels.push("@" + usernameData[i].label);
            zippedData.push(usernameData[i].value);
        }
        
        var xScale = d3.scale.linear()
            .domain([0, d3.max(zippedData)])
            .range([0, width - labelSpaces - margin.right]);

        var yScale = d3.scale.linear()
            .range([usernameData.length * (barHeight + gapBetween) + margin.top + margin.bottom, 0]);

        var yAxis = d3.svg.axis()
            .scale(yScale)
            .tickFormat('')
            .tickSize(0)
            .orient("left");

        // Specify the chart area and dimensions
        var chart = d3.select("#usernameHistogram")
            .attr("width", width - margin.right)
            .attr("height", usernameData.length * (barHeight + gapBetween) + margin.top + margin.bottom);

        // Create bars
        var bar = chart.selectAll("g")
            .data(zippedData)
            .enter().append("g")
            .attr("transform", function(d, i) {
              return "translate(" + labelSpaces + "," + (i * (barHeight + gapBetween) + margin.top) + ")";
            });

        // Create rectangles of the correct width
        bar.append("rect")
            .attr("fill", "blue")
            .attr("class", "bar")
            .attr("width", function(d, i){ return xScale(d); })
            .attr("height", barHeight - 1);
        
        d3.selectAll(".bar")
            .on("mouseenter", function(d, i){
                d3.select("#tooltip").style({ 
                    visibility: "visible", 
                    top: (d3.event.clientY) + "px", 
                    left: d3.event.clientX + "px",
                    opacity: 1}).text("Total: " + d);
            }).on("mouseleave", function(d, i){
                d3.select("#tooltip").style({ visibility: "hidden", opacity: 0 });
            });

        // Draw labels
        bar.append("text")
            .attr("class", "label")
            .attr("x", function(d) { return -labelSpaces; })
            .attr("y", barHeight / 2)
            .attr("dy", ".35em")
            .text(function(d,i) {return labels[i];});

        chart.append("g")
              .attr("class", "y axis")
              .attr("transform", "translate(" + labelSpaces + ", " + -gapBetween/2 + ")")
              .call(yAxis);
    }
    
    function renderHashtagHistogram(){
        var zippedData = [];
        var labels = [];
        for (var i=0; i<hashtagData.length; i++) {
            labels.push("#" + hashtagData[i].label);
            zippedData.push(hashtagData[i].value);
        }
        
        var xScale = d3.scale.linear()
            .domain([0, d3.max(zippedData)])
            .range([0, width - labelSpaces - margin.left]);

        var yScale = d3.scale.linear()
            .range([hashtagData.length * (barHeight + gapBetween) + margin.top + margin.bottom, 0]);

        var yAxis = d3.svg.axis()
            .scale(yScale)
            .tickFormat('')
            .tickSize(0)
            .orient("left");

        // Specify the chart area and dimensions
        var chart = d3.select("#hashtagHistogram")
            .attr("width", width - margin.left)
            .attr("height", hashtagData.length * (barHeight + gapBetween) + margin.top + margin.bottom);

        // Create bars
        var bar = chart.selectAll("g")
            .data(zippedData)
            .enter().append("g")
            .attr("transform", function(d, i) {
              return "translate(" + (labelSpaces + margin.left) + "," + (i * (barHeight + gapBetween) + margin.top) + ")";
            });

        // Create rectangles of the correct width
        bar.append("rect")
            .attr("fill", "blue")
            .attr("class", "bar")
            .attr("width", function(d, i){ return xScale(d); })
            .attr("height", barHeight - 1);
        
        d3.selectAll(".bar")
            .on("mouseenter", function(d, i){
                d3.select("#tooltip").style({ 
                    visibility: "visible", 
                    top: (d3.event.clientY) + "px", 
                    left: d3.event.clientX + "px",
                    opacity: 1}).text("Total: " + d);
            }).on("mouseleave", function(d, i){
                d3.select("#tooltip").style({ visibility: "hidden", opacity: 0 });
            });

        // Draw labels
        bar.append("text")
            .attr("class", "label")
            .attr("x", function(d) { return -labelSpaces + margin.left; })
            .attr("y", barHeight / 2)
            .attr("dy", ".35em")
            .text(function(d,i) {return labels[i];});

        chart.append("g")
              .attr("class", "y axis")
              .attr("transform", "translate(" + (labelSpaces + margin.left) + ", " + -gapBetween/2 + ")")
              .call(yAxis);
    }
    load();
}

drawHistograms();