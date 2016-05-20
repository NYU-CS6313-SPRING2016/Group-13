var TiagoScript = function drawMap(){

    /**VARS**/
    var width = document.getElementById('middlePanel').offsetWidth - 14,
        height = document.getElementById('middlePanel').offsetHeight * 0.9;

    var country_list = [];

    var tweets = [];

    var myCountries = [];

    var countryNames = [];

    var user = "";

    var currentDay = "11";

    var stringDate = "Date: 04/11";

    var dateParam = stringDate.substring(6) + "/2016";

    var color = d3.scale.linear()
        .domain([-1, 0, 1])
        .range(["red", "dimgray", "blue"]);

    var projection = d3.geo.mercator()
        .scale(width*0.16)
        .translate([width / 2, height / 2])

    var path = d3.geo.path()
        .projection(projection);

    var graticule = d3.geo.graticule();

    var type = d3.select("#typeofdata");

    var selection = "numtweets";

    var svg = d3.select("#chartmap")
        .attr("width", width)
        .attr("height", height);

    svg.append("defs").append("path")
        .datum({type: "Sphere"})
        .attr("id", "sphere")
        .attr("d", path);

    svg.append("use")
        .attr("class", "stroke")
        .attr("xlink:href", "#sphere");

    svg.append("use")
        .attr("class", "fill")
        .attr("xlink:href", "#sphere");

    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path);

    var textTooltip = d3.select("#tooltip");

    var textSlider =  svg.append("text")         // append text
        .style("fill", "red")   // fill the text with the colour black
        .attr("x", 480)           // set x position of left side of text
        .attr("y", 20)

    var textSupportive = svg.append("text")         // append text
        .style("fill", "blue")   // fill the text with the colour black
        .attr("x", 10)           // set x position of left side of text
        .attr("y", 20)           // set y position of bottom of text

    var supp = [];
    for(var i = 0; i < 3; i++)
    {
        supp[i] = svg.append("text");
    }

    var non_supp = [];
    for(var i = 0; i < 3; i++)
    {
        non_supp[i] = svg.append("text");
    }

    var leastSupp = svg.append("text")         // append text
        .style("fill", "red")   // fill the text with the colour black
        .attr("x", 230)           // set x position of left side of text
        .attr("y", 20)           // set y position of bottom of text

    /**INLINE FUNCTIONS**/
    d3.json("gamergate.json", function(error, result)
    {
        if (error) throw error;
        tweets = result;
        loadCountryList();
    });

    d3.select(window).on('resize', function(){
        width = document.getElementById('middlePanel').offsetWidth - 2;
        height = (document.getElementById('middlePanel').offsetHeight) * 0.9;

        projection
            .scale(width*0.16)
            .translate([width / 2, height / 2])

        path
            .projection(projection);

        svg.selectAll(".country")
            .data(myCountries)
            .style('opacity', 0.5)
            .style("fill", newColorCountry)
            .attr('d', path);

    });

    d3.select("#timeSlider").on("input", function()
    {
        if(parseInt(this.value) >= 1 && parseInt(this.value) <= 20)
        {
            currentDay = parseInt(this.value) + 10;
            stringDate = "Date: 04/" + currentDay;
        }
        else if(parseInt(this.value) > 20)
        {
            currentDay = parseInt(this.value) - 20;
            if(currentDay >= 1 && currentDay <= 9)
            {
                currentDay = "0" + currentDay;
                stringDate = "Date: 05/" + currentDay;
            }
            else
            {
                stringDate = "Date: 05/" + currentDay;
            }
        }
        dateParam = stringDate.substring(6) + "/2016";
        loadCountryListBasedOnDate(dateParam);
    });

    type.on('change', function()
    {
        selection = (this.value).toLowerCase()
    })

    d3.select("#clearButton").on("click", function()
    {
        loadCountryListBasedOnDate(dateParam);
    });

    d3.select("#filterBox").on('input', function(){

        user = d3.select("#filterBox")[0][0].value;

        if(user.charAt(0) == "#") {
            user = user.substring(1);
            var tweets_of_the_user = retrieveTweetsForThisHash(user);
            var locations = findHashLocations(tweets_of_the_user);
        } else if(user.charAt(0) == "@") {
            user = user.substring(1);
            var tweets_of_the_user = retrieveTweetsForThisUser(user);
            var locations = findUserLocations(tweets_of_the_user);
        }
        svg.selectAll(".country")
            .data(myCountries)
            .style('opacity', function (d) {
                var opacity = 0.5;
                for (var i = 0; i < locations.length; i++) {
                    console.log("name = " + d.name);
                    if (d.name.toLowerCase().localeCompare(locations[i].name.toLowerCase()) == 0) {
                        opacity = 1;
                    }
                }
                return opacity;
            })
            .style("fill", newColorCountry)
            .attr('d', path);

    });

    d3.select(self.frameElement).style("height", height + "px");

    /**FUNCTIONS**/
    function supportiveCountries(countries)
    {
        var supportiveCountries = countries;
        supportiveCountries = filterNoDataSentiment(supportiveCountries);
        supportiveCountries.sort(function(a, b) {
            return b.sentiment - a.sentiment;
        });
        var countries_to_return = [];
        for(var i = 0; i < supportiveCountries.length; i++)
        {
            if(parseFloat(supportiveCountries[i].sentiment) > 0.00)
            {
                countries_to_return.push(supportiveCountries[i]);
            }
        }
        console.log("SP: " + countries_to_return);
        //var countries_to_return = [supportiveCountries[0], supportiveCountries[1], supportiveCountries[2]];
        return countries_to_return;
    }

    function againstCountries(countries)
    {
        var against_countries = countries;
        against_countries = filterNoDataSentiment(against_countries);
        against_countries.sort(function(a, b) {
            return a.sentiment - b.sentiment;
        });
        var countries_to_return = [];
        for(var i = 0; i < against_countries.length; i++)
        {
            if(parseFloat(against_countries[i].sentiment) < 0.00)
            {
                countries_to_return.push(against_countries[i]);
            }
        }
        console.log("AG: " + countries_to_return);
        //var countries_to_return = [against_countries[0], against_countries[1], against_countries[2]];
        return countries_to_return;
    }

    function filterNoDataSentiment(countries)
    {
        var filtered_countries = [];
        for(var i = 0; i < countries.length; i++)
        {
            if(!isNaN(countries[i].sentiment))
            {
                filtered_countries.push(countries[i]);
            }
        }
        return filtered_countries;
    }

    function loadCountryList()
    {
        queue()
            .defer(d3.json, "world-110m2.json")
            .defer(d3.tsv, "world-country-names.tsv")
            .await(ready);
    }

    function loadCountryListBasedOnDate(date)
    {
        clearLists();

        for(var i = 0; i < country_list.length; i++)
        {
            var totals = totalPosNeg(country_list[i].name.toLowerCase(), date);
            var pos = parseFloat(totals[0]);
            var neg = parseFloat(totals[1]);
            var sentiment = pos - neg;
            var c = new Country(country_list[i].id, country_list[i].name.toLowerCase(), sentiment, pos, neg);
            updateCountry(c);
        }

        user = d3.select("#filterBox")[0][0].value;

        if(user.charAt(0) == "#") {
            user = user.substring(1);
            var tweets_of_the_user = retrieveTweetsForThisHash(user);
            var locations = findHashLocations(tweets_of_the_user);
            svg.selectAll(".country")
                .data(myCountries)
                .style('opacity', function (d) {
                    var opacity = 0.5;
                    for (var i = 0; i < locations.length; i++) {
                        console.log("name = " + d.name);
                        if (d.name.toLowerCase().localeCompare(locations[i].name.toLowerCase()) == 0) {
                            opacity = 1;
                        }
                    }
                    return opacity;
                })
                .style("fill", newColorCountry)
                .attr('d', path);
        } else if(user.charAt(0) == "@") {
            user = user.substring(1);
            var tweets_of_the_user = retrieveTweetsForThisUser(user);
            var locations = findUserLocations(tweets_of_the_user);
            svg.selectAll(".country")
                .data(myCountries)
                .style('opacity', function (d) {
                    var opacity = 0.5;
                    for (var i = 0; i < locations.length; i++) {
                        console.log("name = " + d.name);
                        if (d.name.toLowerCase().localeCompare(locations[i].name.toLowerCase()) == 0) {
                            opacity = 1;
                        }
                    }
                    return opacity;
                })
                .style("fill", newColorCountry)
                .attr('d', path);
        }else{
            svg.selectAll(".country")
                .data(myCountries)
                .style('opacity', 0.5)
                .style("fill", newColorCountry);
        }

        var listSupport = supportiveCountries(country_list);
        var listAgainst = againstCountries(country_list);
        var posX = 10;
        posY = 30;
        textSupportive.text("Most supportive countries");

        for (var i = 0; i < listSupport.length; i++) {
            var textContent = "";
            if(listSupport[i] != null) {
                if (listSupport[i].name.length > 0) {
                    textContent = listSupport[i].name;
                    if(supp[i] != null ) {
                        supp[i].style("fill", "black")   // fill the text with the colour black
                            .attr("x", posX)           // set x position of left side of text
                            .attr("y", posY).text((i + 1).toString() + ". " + textContent);
                        posY = posY + posX;
                    }
                }
            }
        }

        var posX = 230; var posY = 30;
        leastSupp.text("Most hatred countries");

        for (var i = 0; i < listAgainst.length; i++) {
            var textContent = "";
            if(listAgainst[i] != null) {
                if (listAgainst[i].name.length > 0) {
                    textContent = listAgainst[i].name;
                    if(non_supp[i] != null) {
                        non_supp[i].style("fill", "black")   // fill the text with the colour black
                            .attr("x", posX)           // set x position of left side of text
                            .attr("y", posY).text((i + 1).toString() + ". " + textContent);
                        posY = posY + 10;
                    }
                }
            }
        }

        textSlider.text(stringDate);
    }

    function clearLists()
    {
        for(var i = 0; i < supp.length; i++)
        {
            supp[i].text("");
        }
        for(var i = 0; i < non_supp.length; i++)
        {
            non_supp[i].text("");
        }
    }

    function retrieveTweetsForThisDate(tweets, date) {

        var tweets_of_the_day = [];
        for (var i = 0; i < tweets.length; i++) {
            if(tweets[i].time.toString().localeCompare(date.toString()) == 0) {
                tweets_of_the_day.push(tweets[i]);
            }
        }
        return tweets_of_the_day;
    }

    function retrieveTweetsForThisUser(user) {

        var tweets_of_the_user = [];
        for (var i = 0; i < tweets.length; i++) {

            var t1 = tweets[i].username.toLowerCase();
            var t2 = user.toLowerCase();
            if(t1.localeCompare(t2) == 0) {
                tweets_of_the_user.push(tweets[i]);
            }
        }
        console.log(tweets_of_the_user);
        return tweets_of_the_user;
    }

    function retrieveTweetsForThisHash(hashtag) {

        var tweets_of_the_hash = [];
        for (var i = 0; i < tweets.length; i++) {
            if(tweets[i].keywords != null && tweets[i].location.localeCompare("") != 0) {
                var hash = tweets[i].keywords.word;
                for (var j = 0; j < hash.length; j++) {
                    if (hashtag.toLowerCase().localeCompare(hash[j].toLowerCase()) == 0) {
                        tweets_of_the_hash.push(tweets[i]);
                    }
                }
            }
        }
        tweets_of_the_hash = uniq(tweets_of_the_hash);
        console.log(tweets_of_the_hash);
        return tweets_of_the_hash;
    }

    function findHashLocations(twits_of_the_hash)
    {
        var locations = [];
        for (var i = 0; i < twits_of_the_hash.length; i++) {
            for(var j = 0; j < country_list.length; j++) {
                if (twits_of_the_hash[i].location.toLowerCase().localeCompare(country_list[j].name.toLowerCase()) == 0) {
                    locations.push(country_list[j]);
                }
            }
        }
        locations = uniq(locations);
        console.log(locations);
        return locations;
    }

    function findUserLocations(twits_of_the_user)
    {
        var locations = [];
        for (var i = 0; i < twits_of_the_user.length; i++) {
            for(var j = 0; j < country_list.length; j++) {
                if (twits_of_the_user[i].location.toLowerCase().localeCompare(country_list[j].name.toLowerCase()) == 0) {
                    locations.push(country_list[j]);
                }
            }
        }
        locations = uniq(locations);
        console.log(locations);
        return locations;
    }

    function uniq(a) {
        return Array.from(new Set(a));
    }

    function getSentimentFromCountry(countryId)
    {
        var sentiment = 0.0;
        country_list.forEach(function(d) {
            if (d.id == countryId)
            {
                sentiment = d.sentiment;
            }
        });
        return sentiment;
    }

    function newColorCountry(country) {

        var sentiment = getSentimentFromCountry(country.id);
        var newcolor;
        if (isNaN(sentiment)) {
            return '#D3D3D3';
        }
        newcolor = color(sentiment);

        return newcolor;
    }

    function totalTweetsOfThisCountryOnThisDate(country, date)
    {
        var count = 0;
        for(var i = 0; i < tweets.length; i++)
        {
            if (tweets[i].location.length > 0) {
                if(tweets[i].time.localeCompare(date) == 0) {
                    var c1 = tweets[i].location.toLowerCase();
                    var c2 = country.toLowerCase();
                    if (c1.localeCompare(c2) == 0) {
                        count++;
                    }
                }
            }
        }
        return count;
    }

    function totalPosNeg(country, data)
    {
        var neg = 0.0;
        var pos = 0.0;
        var negTotal = 0.0;
        var posTotal = 0.0;
        var result = [];
        var twits_of_the_date = retrieveTweetsForThisDate(tweets, data);
        for (var i = 0; i < twits_of_the_date.length; i++) {
            if (twits_of_the_date[i].location.length > 0) {
                if (twits_of_the_date[i].time.localeCompare(data) == 0) {
                    var c1 = twits_of_the_date[i].location.toLowerCase();
                    var c2 = country.toLowerCase();
                    if (c1.localeCompare(c2) == 0)
                    {
                        if (parseFloat(twits_of_the_date[i].sentiment) < 0.0) {
                            neg = neg + 1.0;
                        }else if(parseFloat(twits_of_the_date[i].sentiment) > 0.0){
                            pos = pos + 1.0;
                        }
                        negTotal = negTotal + 1.0;
                        posTotal = posTotal + 1.0;
                    }
                }
            }
        }
        result[0] = formatDec(pos / posTotal).toString();
        result[1] = formatDec(neg / negTotal).toString();

        return result;
    }

    function updateCountry(country)
    {
        for(var i = 0; i < country_list.length; i++)
        {
            if(country_list[i].id == country.id)
            {
                if(country_list[i].sentiment != country.sentiment) {

                    country_list[i].sentiment = country.sentiment;
                }

                if(country_list[i].pos != country.pos)
                {
                    country_list[i].pos = country.pos;
                }

                if(country_list[i].neg != country.neg)
                {
                    country_list[i].neg = country.neg;
                }
            }
        }
    }

    function panelLegend()
    {
        svg.append("rect")       // attach a rectangle
            .attr("x", 5)         // position the left of the rectangle
            .attr("y", 425)          // position the top of the rectangle
            .attr("height", 65)    // set the height
            .attr("width", 130)     // set the width
            .style("fill", "aliceblue")
            .attr("opacity", 0.75);

        svg.append("rect")       // attach a rectangle
            .attr("x", 10)         // position the left of the rectangle
            .attr("y", 430)          // position the top of the rectangle
            .attr("height", 10)    // set the height
            .attr("width", 20)     // set the width
            .style("fill", "blue");

        svg.append("rect")       // attach a rectangle
            .attr("x", 10)         // position the left of the rectangle
            .attr("y", 445)          // position the top of the rectangle
            .attr("height", 10)    // set the height
            .attr("width", 20)     // set the width
            .style("fill", "dimgray");

        svg.append("rect")       // attach a rectangle
            .attr("x", 10)         // position the left of the rectangle
            .attr("y", 460)          // position the top of the rectangle
            .attr("height", 10)    // set the height
            .attr("width", 20)     // set the width
            .style("fill", "red");

        svg.append("rect")       // attach a rectangle
            .attr("x", 10)         // position the left of the rectangle
            .attr("y", 475)          // position the top of the rectangle
            .attr("height", 10)    // set the height
            .attr("width", 20)     // set the width
            .style("fill", "lightgrey");

        svg.append("text")         // append text
            .style("fill", "black")   // fill the text with the colour black
            .attr("x", 35)           // set x position of left side of text
            .attr("y", 437)           // set y position of bottom of text
            .text("Support Women");     // define the text to display

        svg.append("text")         // append text
            .style("fill", "black")   // fill the text with the colour black
            .attr("x", 35)           // set x position of left side of text
            .attr("y", 452)           // set y position of bottom of text
            .text("Neutral");     // define the text to display

        svg.append("text")         // append text
            .style("fill", "black")   // fill the text with the colour black
            .attr("x", 35)           // set x position of left side of text
            .attr("y", 467)           // set y position of bottom of text
            .text("Against Women");     // define the text to display

        svg.append("text")         // append text
            .style("fill", "black")   // fill the text with the colour black
            .attr("x", 35)           // set x position of left side of text
            .attr("y", 482)           // set y position of bottom of text
            .text("No data");     // define the text to display
    }

    function ready(err, world, names) {

        if (err) throw err
        let countries = topojson.feature(world, world.objects.countries).features
        countries = countries.filter(function(d) {
            return names.some(function(n) {
                if (d.id == n.id) {
                    var c = new Country(n.id, n.name.toLowerCase());
                    country_list.push(c);
                    myCountries.push(d);
                    return d.name = n.name;
                }
            })
        })

        myCountries = countries;
        countryNames = names;
        svg.selectAll('.country')
            .data(countries)
            .enter()
            .insert('path', '.graticule')
            .attr('class', 'country')
            .attr({
                'data-name': function(d) {
                    return d.name
                },
                'data-x-centroid': function(d) {
                    return path.centroid(d)[0]
                },
                'data-y-bottom': function(d) {
                    return path.bounds(d)[1][1]
                }
            })
            .attr('d', path)
            .attr('title', 'Blah')
            .style("fill", "lightgrey")
            .style("opacity", 0.5)
            .attr("cx", function (d) {
                return projection([d.lon, d.lat])[0];
            })
            .attr("cy", function (d) {
                return projection([d.lon, d.lat])[1];
            })
            .on('mouseover', function() {
                d3.select(this).style('opacity', 1)
                let countryName = d3.select(this).attr('data-name')
                let xCentroid = d3.select(this).attr('data-x-centroid')
                let yBottom = d3.select(this).attr('data-y-bottom')
                nameTag.style('visibility', 'hidden')
                nameTag.text(countryName)
                let textWidth = nameTag.node().getComputedTextLength()
                nameTag.attr({
                    x: xCentroid - (textWidth / 2),
                    y: Number(yBottom) + (countryName === 'Antarctica' ? -70 : 15),
                })
                nameTag.style('visibility', 'visible');
            })
            .on('click', function() {
                d3.select("#filterBox")[0][0].value = d3.select(this).attr('data-name');
                textOnChange();
                if (selection.localeCompare("numTweets".toLowerCase()) == 0) {
                    textTooltip.style({
                            visibility: "visible",
                            top: (d3.event.clientY) + "px",
                            left: d3.event.clientX + "px",
                            opacity: 1})
                        .text("\t\n" + "Total Tweets: " + "\n" +
                            totalTweetsOfThisCountryOnThisDate(d3.select(this).attr('data-name'),
                                dateParam))
                } else if (selection.localeCompare("avgSentiment".toLowerCase()) == 0) {
                    var totals = totalPosNeg(d3.select(this).attr('data-name'), dateParam);
                    textTooltip.style({
                        visibility: "visible",
                        top: (d3.event.clientY) + "px",
                        left: d3.event.clientX + "px",
                        opacity: 1}).text("Pos: " + (totals[0]) + "\n" +
                        "Neg: -" + (totals[1]))
                }
            })
            .on('mouseout', function() {
                d3.select(this).style('opacity', 0.5)
                nameTag.style('visibility', 'hidden')
            })
            .on('mouseleave',function(d,i){
                //tip.hide
                // hide();
                textTooltip.style({visibility: "hidden",
                    opacity:0});
            })
            .attr('title', 'Blah')
        let nameTag = svg.append('text')
            .attr('font-family', 'Verdana')
            .attr('font-size', '15px')

        svg.insert("path", ".graticule")
            .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
            .attr("class", "boundary")
            .attr("d", path);

    }

    /**CLASS FUNCTIONS**/
    function Country (id, name, sentiment, pos, neg) {
        this.id = id;
        this.name = name;
        this.sentiment = sentiment;
        this.pos = pos;
        this.neg = neg;
        this.getCountryInfo = function() {
            return this.id + ' ' + this.name + '' + this.balance;
        };
    }

    /**SINGLE FUNCTION CALLS**/
    panelLegend();
}

var tiago = new TiagoScript();