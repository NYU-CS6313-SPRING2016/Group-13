function AhmedScript(){
    var histWidth = document.getElementById('rightPanel').offsetWidth / 2 * 0.9;
    var barHeight = 20;
    var gapBetween = 10;
    var labelSpaces = 130;
    var color = ["dimgrey", "blue", "red"];
    
    var tweets = [];
    
    AhmedScript.hashtagData = [];
    AhmedScript.usernameData = [];
    AhmedScript.hintArray = [];
    
    AhmedScript.load = function load(){
        d3.json("newData.json", 
            function(error, result){
                tweets = result;
                AhmedScript.prepareData("");
                AhmedScript.changeHistogram("numTweets");
            });
    }
    
    AhmedScript.prepareData = function (filterString){
        AhmedScript.hashtagData = [];
        AhmedScript.usernameData = [];
        
        var filters = filterString.split(",");
        var country = "";
        var hashtag = "";
        var username = "";
        var hsentiment = "t";
        var usentiment = "t";
        for (var i=0; i<filters.length; i++){
            var f = filters[i];
            if(f.trim().charAt(0) == "#"){
                var subIndex = 0;
                if(f.indexOf(":") >= 0){
                    subIndex = 2;
                    hsentiment = f.trim().substr(f.trim().length - 1, f.trim().length).toLowerCase();
                }
                hashtag = f.trim().substring(1, f.trim().length - subIndex).toLowerCase();
            }
            else if(f.trim().charAt(0) == "@"){
                var subIndex = 0;
                if(f.indexOf(":") >= 0){
                    subIndex = 2;
                    usentiment = f.trim().substr(f.trim().length - 1, f.trim().length).toLowerCase();
                }
                username = f.trim().substring(1, f.trim().length - subIndex).toLowerCase();
            }
            else{
                country = f.trim().toLowerCase();
            }
        }
        
        var tempHashDic = {};
        var tempUserDic = {};
        for (var i=0; i< tweets.data.row.length; i++){
            var tweet = tweets.data.row[i];
            var skipCountryTweet = false;
            if(country != "" && tweet.location != country){
                skipCountryTweet = true;
            }
            var skipHashTweet = true;
            if(hashtag == ""){
                skipHashTweet = false;
            }
            if(skipHashTweet){
                if(tweet.keywords != null){
                    if(!(tweet.keywords.word instanceof Array)){
                        var tag = tweet.keywords.word.toLowerCase();
                        if(tag.trim().toLowerCase() == hashtag){
                            skipHashTweet = false;
                        }
                    }
                    else{
                        for (var j=0; j<tweet.keywords.word.length; j++){
                            var tag = tweet.keywords.word[j].toLowerCase();
                            if(tag.trim().toLowerCase() == hashtag){
                                skipHashTweet = false;
                            }
                        }
                    }
                }
            }
            var skipUserTweet = true;
            if(username == ""){
                skipUserTweet = false;
            }
            if(skipUserTweet){
                if(!(tweet.usernames.user instanceof Array)){
                    var user = tweet.usernames.user.toLowerCase();
                    if(user.trim().toLowerCase() == username){
                        skipUserTweet = false;
                    }
                }
                else{
                    for (var j=0; j<tweet.usernames.user.length; j++){
                        var user = tweet.usernames.user[j].toLowerCase();
                        if(user.trim().toLowerCase() == username){
                            skipUserTweet = false;
                        }
                    }
                }
            }
            if(skipCountryTweet || skipHashTweet || skipUserTweet){
                continue;
            }
            if(tweet.keywords != null){
                if(!(tweet.keywords.word instanceof Array)){
                    var tag = tweet.keywords.word.toLowerCase();
                    if(tag.trim().length <= 1){
                        continue;
                    }
                    if(!tempHashDic.hasOwnProperty(tag)){
                        tempHashDic[tag] = {total:0, pos:0, neg:0, totSent:0, posSent:0, negSent:0};
                    }
                    tempHashDic[tag].total += 1;
                    tempHashDic[tag].totSent += parseFloat(tweet.sentiment);
                    if(parseFloat(tweet.sentiment) > 0 && hsentiment != "n"){
                        tempHashDic[tag].pos += 1;
                        tempHashDic[tag].posSent += parseFloat(tweet.sentiment);
                    }
                    else if(parseFloat(tweet.sentiment) < 0 && hsentiment != "p"){
                        tempHashDic[tag].neg += 1;
                        tempHashDic[tag].negSent += parseFloat(tweet.sentiment);
                    }
                }
                else{
                    for (var j=0; j<tweet.keywords.word.length; j++){
                        var tag = tweet.keywords.word[j].toLowerCase();
                        if(tag.trim().length <= 1){
                            continue;
                        }
                        if(!tempHashDic.hasOwnProperty(tag)){
                            tempHashDic[tag] = {total:0, pos:0, neg:0, totSent:0, posSent:0, negSent:0};
                        }
                        tempHashDic[tag].total += 1;
                        tempHashDic[tag].totSent += parseFloat(tweet.sentiment);
                        if(parseFloat(tweet.sentiment) > 0 && hsentiment != "n"){
                            tempHashDic[tag].pos += 1;
                            tempHashDic[tag].posSent += parseFloat(tweet.sentiment);
                        }
                        else if(parseFloat(tweet.sentiment) < 0 && hsentiment != "p"){
                            tempHashDic[tag].neg += 1;
                            tempHashDic[tag].negSent += parseFloat(tweet.sentiment);
                        }
                    }
                }
            }

            if(!(tweet.usernames.user instanceof Array)){
                var user = tweet.usernames.user.toLowerCase();
                if(!tempUserDic.hasOwnProperty(user)){
                    tempUserDic[user] = {total:0, pos:0, neg:0, totSent:0, posSent:0, negSent:0};
                }
                tempUserDic[user].total += 1;
                tempUserDic[user].totSent += parseFloat(tweet.sentiment);
                if(parseFloat(tweet.sentiment) > 0 && usentiment != "n"){
                    tempUserDic[user].pos += 1;
                    tempUserDic[user].posSent += parseFloat(tweet.sentiment);
                }
                else if(parseFloat(tweet.sentiment) < 0 && usentiment != "p"){
                    tempUserDic[user].neg += 1;
                    tempUserDic[user].negSent += parseFloat(tweet.sentiment);
                }
            }
            else{
                for (var j=0; j<tweet.usernames.user.length; j++){
                    var user = tweet.usernames.user[j].toLowerCase();
                    if(!tempUserDic.hasOwnProperty(user)){
                        tempUserDic[user] = {total:0, pos:0, neg:0, totSent:0, posSent:0, negSent:0};
                    }
                    tempUserDic[user].total += 1;
                    tempUserDic[user].totSent += parseFloat(tweet.sentiment);
                    if(parseFloat(tweet.sentiment) > 0 && usentiment != "n"){
                        tempUserDic[user].pos += 1;
                        tempUserDic[user].posSent += parseFloat(tweet.sentiment);
                    }
                    else if(parseFloat(tweet.sentiment) < 0 && usentiment != "p"){
                        tempUserDic[user].neg += 1;
                        tempUserDic[user].negSent += parseFloat(tweet.sentiment);
                    }
                }
            }
        }
        var index = 1;
        for(var key in tempHashDic){
            AhmedScript.hashtagData.push({index:index, label:key, total:tempHashDic[key].total, pos:tempHashDic[key].pos, 
                              neg:tempHashDic[key].neg, 
                              totSent:Math.abs(tempHashDic[key].totSent) / (1.0 * tempHashDic[key].total), 
                              posSent:Math.abs(tempHashDic[key].posSent) / (1.0 * tempHashDic[key].total), 
                              negSent:Math.abs(tempHashDic[key].negSent) / (1.0 * tempHashDic[key].total)});
            index+=1;
        }
        index = 1;
        for(var key in tempUserDic){
            AhmedScript.usernameData.push({index:index, label:key, total:tempUserDic[key].total, 
               pos:tempUserDic[key].pos, neg:tempUserDic[key].neg, 
               totSent:Math.abs(tempUserDic[key].totSent) / (1.0 * tempUserDic[key].total),
               posSent:Math.abs(tempUserDic[key].posSent) / (1.0 * tempUserDic[key].total),
               negSent:Math.abs(tempUserDic[key].negSent) / (1.0 * tempUserDic[key].total)});
            index+=1;
        }
    }
    
    AhmedScript.changeHistogram = function (choice){
        if(choice == "numTweets"){
            AhmedScript.hintArray = ["Total Number of Tweets", "Number of Positive Tweets", "Number of Negative Tweets"];
            AhmedScript.hashtagData.sort(function(x, y){
                    return d3.descending(x.total, y.total);
                });
            AhmedScript.usernameData.sort(function(x, y){
                   return d3.descending(x.total, y.total);
                });
        }
        else{
            AhmedScript.hintArray = ["Total Average Sentiment", "Average Positive Sentiment", "Average Negative Sentiment"];
            AhmedScript.hashtagData.sort(function(x, y){
                    return d3.descending(x.totSent, y.totSent);
                });
            AhmedScript.usernameData.sort(function(x, y){
                   return d3.descending(x.totSent, y.totSent);
                });
        }
        
        
        var zippedData = [];
        var labels = [];
        for (var i=0; i<AhmedScript.usernameData.length; i++) {
            labels.push("@" + AhmedScript.usernameData[i].label);
            if(choice == "numTweets"){
                zippedData.push({index:3*i, value:AhmedScript.usernameData[i].total});
                zippedData.push({index:3*i + 1, value:AhmedScript.usernameData[i].pos});
                zippedData.push({index:3*i + 2, value:AhmedScript.usernameData[i].neg});
            }
            else{
                var tempValue = Math.floor(1000 * AhmedScript.usernameData[i].totSent)/1000;
                zippedData.push({index:3*i, value:tempValue});
                tempValue = Math.floor(1000 * AhmedScript.usernameData[i].posSent)/1000;
                zippedData.push({index:3*i + 1, value:tempValue});
                tempValue = Math.floor(1000 * AhmedScript.usernameData[i].negSent)/1000;
                zippedData.push({index:3*i + 2, value:tempValue});
            }
        }
        renderHistogram(zippedData, labels, "#usernameHistogram");

        var zippedData = [];
        var labels = [];
        for (var i=0; i<AhmedScript.hashtagData.length; i++) {
            labels.push("#" + AhmedScript.hashtagData[i].label);
            if(choice == "numTweets"){
                zippedData.push({index:3*i, value:AhmedScript.hashtagData[i].total});
                zippedData.push({index:3*i + 1, value:AhmedScript.hashtagData[i].pos});
                zippedData.push({index:3*i + 2, value:AhmedScript.hashtagData[i].neg});
            }
            else{
                var tempValue = Math.floor(1000 * AhmedScript.hashtagData[i].totSent) / 1000;
                zippedData.push({index:3*i, value:tempValue});
                tempValue = Math.floor(1000 * AhmedScript.hashtagData[i].posSent) / 1000;
                zippedData.push({index:3*i + 1, value:tempValue});
                tempValue = Math.floor(1000 * AhmedScript.hashtagData[i].negSent) / 1000;
                zippedData.push({index:3*i + 2, value:tempValue});
            }
        }
        renderHistogram(zippedData, labels, "#hashtagHistogram");
    }
    
    function renderHistogram(zippedData, labels, htmlID){
        var xScale = d3.scale.linear()
            .domain([0, d3.max(zippedData, function(d,i){ return d.value; })])
            .range([10, histWidth - labelSpaces]);
        
        var yScale = d3.scale.linear()
            .range([barHeight * zippedData.length + gapBetween * labels.length, 0]);

        var yAxis = d3.svg.axis()
            .scale(yScale)
            .tickFormat('')
            .tickSize(0)
            .orient("left");

        // Specify the chart area and dimensions
        var chart = d3.select(htmlID)
            .attr("width", histWidth)
            .attr("height", barHeight * zippedData.length + gapBetween * labels.length);
        
        // Create bars
        var bar = chart.selectAll("g")
            .data(zippedData, function(d){ if(d == undefined) {return d;} return d.index; })
            .enter().append("g")
            .attr("transform", function(d, i) {
                return "translate(" + labelSpaces + "," + (i * barHeight + gapBetween * (0.5 + Math.floor(i/3))) + ")";
            });
        chart.selectAll("g")
            .data(zippedData, function(d){ if(d == undefined) {return d;} return d.index; })
            .exit().remove();
        bar.append("rect");
        bar.append("text")
            .attr("class", "histValue");
        bar.append("text")
            .attr("class", "histLabel");

        // Create rectangles of the correct width
        chart.selectAll("rect")
            .attr("fill", function(d,i) { return color[i % 3]; })
            .attr("class", "bar")
            .attr("width", function(d,i){ return xScale(zippedData[i].value); })
            .attr("height", barHeight - 1);
        
        // Add text label in bar
        chart.selectAll(".histValue")
            .attr("x", function(d,i) { return xScale(zippedData[i].value) - 2; })
            .attr("y", barHeight / 2)
            .attr("fill", "white")
            .attr("dy", ".35em")
            .attr("font-size", "8px")
            .attr("text-anchor", "end")
            .text(function(d,i) { return zippedData[i].value; });
        
        d3.selectAll(".bar")
            .on("mouseenter", function(d, i){
                d3.select("#tooltip").style({ 
                    visibility: "visible", 
                    top: (d3.event.clientY) + "px", 
                    left: d3.event.clientX + "px",
                    opacity: 1}).text(AhmedScript.hintArray[i % 3]);
            }).on("mouseleave", function(d, i){
                d3.select("#tooltip").style({ visibility: "hidden", opacity: 0 });
            });
//            .on("click", function(d, i){
//                var sent = ["t", "p", "n"];
//                var textBoxString = d3.select("#filterBox")[0][0].value;
//                if(textBoxString == null){
//                    textBoxString = "";
//                }
//                var smallText = textBoxString.split(",");
//                var country = "";
//                var user = "";
//                var hash = "";
//                if(smallText instanceof Array){
//                    for(var j=0; j<smallText.length; j++){
//                        if(smallText[j].trim().indexOf("#") >= 0){
//                            hash = smallText[j].trim();
//                        }
//                        else if(smallText[j].trim().indexOf("@") >= 0){
//                            user = smallText[j].trim();
//                        }
//                        else{
//                            country = smallText[j].trim();
//                        }
//                    }
//                }
//                else{
//                    if(smallText.trim().indexOf("#") >= 0){
//                        hash = smallText.trim();
//                    }
//                    else if(smallText.trim().indexOf("@") > 0){
//                        user = smallText.trim();
//                    }
//                    else{
//                        country = smallText.trim();
//                    }
//                }   
//            
//                var newText = country;
//                if(country.length > 0){
//                    newText += ", ";
//                }
//                if(d3.select(this.parentNode.parentNode.parentNode).attr("id").indexOf("Hash") >= 0){
//                    newText += d3.select(this.parentNode).select(".histLabel")[0][0].innerHTML;
//                    if(user.length > 0){
//                        newText += ", " + user;
//                    }
//                }
//                else{
//                    newText += hash;
//                    if(hash.length > 0){
//                        newText += ", ";
//                    }
//                    newText += d3.select(this.parentNode).select(".histLabel")[0][0].innerHTML;
//                }
//                
//                d3.select("#filterBox")[0][0].value = newText;
//                textOnChange();
//            });

        // Draw labels
        chart.selectAll(".histLabel")
            .attr("x", function(d) { return -labelSpaces; })
            .attr("y", 3 * barHeight / 2)
            .attr("dy", ".35em")
            .text(function(d,i) {
                if (i % 3 === 0)
                    return labels[Math.floor(i/3)];
                else
                    return ""});

        chart.append("g")
              .attr("class", "y axis")
              .attr("transform", "translate(" + (labelSpaces) + ", " + -gapBetween/2 + ")")
              .call(yAxis);
    }
}

AhmedScript();
AhmedScript.load();
//d3.select("#typeofdata").on("change",histogramComboboxChange);
//function histogramComboboxChange() {
//    console.log("enter");
//    d3.select("#usernameHistogram > *").remove();
//    d3.select("#hashtagHistogram > *").remove();
//    AhmedScript.renderCorrectHistogram(this.value);
//}