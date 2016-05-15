var TiagoScript = function drawMap(){
    var width = document.getElementById('middlePanel').offsetWidth - 2,
        height = (document.getElementById('middlePanel').offsetHeight - document.getElementById('tweetDistLabel').offsetHeight) * 0.9;

    var country_list = [];

    var tweets = [];

    var myCountries = [];

    d3.json("gamergate.json", function(error, result)
    {
        if (error) throw error;
        tweets = result;
        loadCountryList();
    });

    d3.select("#timeSlider").on("input", function()
    {
        loadCountryListBasedOnDay(this.value);
    });

    var check = false;

    var color = d3.scale.linear()
        .domain([-2, -1, 0])
        .range(["red", "lightblue", "blue"]);

    var projection = d3.geo.mercator()
        .scale(85)
        .translate([width / 2, height / 2])
        .precision(.1);

    var path = d3.geo.path()
        .projection(projection);

    var graticule = d3.geo.graticule();

    var svg = d3.select("#chartmap")//("body").append("svg")
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
        .style("fill", "lightblue");

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

//    d3.select("#leftPanel").on('click', function()
//    {
//        d3.select("#filterBox").attr("value", "");
//        //console.log(d3.select(this).attr('data-name'));
//    });

//    d3.select("#rightPanel").on('click', function()
//    {
//        d3.select("#filterBox").attr("value", "");
//        //console.log(d3.select(this).attr('data-name'));
//    });

    function againstCountries()
    {
        console.log(country_list.length);
        var supportiveCountries = country_list;
        supportiveCountries.sort(function(a, b) {
            return a.sentiment - b.sentiment;
        });
        supportiveCountries = filterNoDataSentiment(supportiveCountries);
        var countries_to_return = [supportiveCountries[0], supportiveCountries[1], supportiveCountries[2]];
        return countries_to_return;
    }

    function supportiveCountries()
    {
        console.log(country_list.length);
        var against_countries = country_list;
        against_countries.sort(function(a, b) {
            return b.sentiment - a.sentiment;
        });
        against_countries = filterNoDataSentiment(against_countries);
        var countries_to_return = [against_countries[0], against_countries[1], against_countries[2]];
        return countries_to_return;
    }

    function filterNoDataSentiment(countries)
    {
        var filtered_countries = [];
        for(var i = 0; i < countries.length; i++)
        {
            if(countries[i].sentiment != 9)
            {
                filtered_countries.push(countries[i]);
            }
        }
        return filtered_countries;
    }

    console.log(showList());

    /*FUNCTIONS*/
    function loadCountryList()
    {
        d3.tsv("world-country-names.tsv", function(error, data) {
            if (error) throw error;
            data.forEach(function(d) {
                var sentiment = countCountrySentiment(tweets, d.name);
                var c = new Country(d.id, d.name.toLowerCase(), sentiment);
                country_list.push(c);
            });
            var listSupport = supportiveCountries();
            var listAgainst = againstCountries();

            svg.append("rect")       // attach a rectangle
                .attr("x", 95)         // position the left of the rectangle
                .attr("y", 10)          // position the top of the rectangle
                .attr("height", 44)    // set the height
                .attr("width", 442)     // set the width
                .style("fill", "aliceblue")
                .attr("opacity", 0.25);

            svg.append("text")         // append text
                .style("fill", "blue")   // fill the text with the colour black
                .attr("x", 100)           // set x position of left side of text
                .attr("y", 20)           // set y position of bottom of text
                .text("Most supportive countries on April/2016");
            svg.append("text")         // append text
                .style("fill", "black")   // fill the text with the colour black
                .attr("x", 100)           // set x position of left side of text
                .attr("y", 30)           // set y position of bottom of text
                .text("1. " + listSupport[0].name);
            svg.append("text")         // append text
                .style("fill", "black")   // fill the text with the colour black
                .attr("x", 100)           // set x position of left side of text
                .attr("y", 40)           // set y position of bottom of text
                .text("2. " + listSupport[1].name);
            svg.append("text")         // append text
                .style("fill", "black")   // fill the text with the colour black
                .attr("x", 100)           // set x position of left side of text
                .attr("y", 50)           // set y position of bottom of text
                .text("3. " + listSupport[2].name);
            svg.append("text")         // append text
                .style("fill", "red")   // fill the text with the colour black
                .attr("x", 320)           // set x position of left side of text
                .attr("y", 20)           // set y position of bottom of text
                .text("Least supportive countries on April/2016");
            svg.append("text")         // append text
                .style("fill", "black")   // fill the text with the colour black
                .attr("x", 320)           // set x position of left side of text
                .attr("y", 30)           // set y position of bottom of text
                .text("1. " + listAgainst[0].name);
            svg.append("text")         // append text
                .style("fill", "black")   // fill the text with the colour black
                .attr("x", 320)           // set x position of left side of text
                .attr("y", 40)           // set y position of bottom of text
                .text("2. " + listAgainst[1].name);
            svg.append("text")         // append text
                .style("fill", "black")   // fill the text with the colour black
                .attr("x", 320)           // set x position of left side of text
                .attr("y", 50)           // set y position of bottom of text
                .text("3. " + listAgainst[2].name);
            //draw();
            queue()
                .defer(d3.json, "world-110m2.json")
                .defer(d3.tsv, "world-country-names.tsv")
                .await(ready)

        });

    }

    function loadCountryListBasedOnDay(day)
    {

        d3.tsv("world-country-names.tsv", function (error, data) {
            if (error) throw error;
            if (country_list.length == 0) {
                data.forEach(function (d) {
                    var sentiment = countCountrySentimentInASpecificDay(tweets, d.name, day);
                    var c = new Country(d.id, d.name.toLowerCase(), sentiment);
                    country_list.push(c);
                });
            } else {
                data.forEach(function (d) {
                    var sentiment = countCountrySentimentInASpecificDay(tweets, d.name, day);
                    var c = new Country(d.id, d.name.toLowerCase(), sentiment);
                    updateCountry(c);
                });
            }
        });
        svg.selectAll(".country")
            .data(myCountries)
            .style('opacity', 0.7)
            .style("fill", newColorCountry);

    }

    d3.select("#checkMonth").on("change", function() {
        d3.tsv("world-country-names.tsv", function(error, data) {
            if (error) throw error;
            if(country_list.length == 0) {
                data.forEach(function (d) {
                    var sentiment = countCountrySentiment(tweets, d.name);
                    var c = new Country(d.id, d.name.toLowerCase(), sentiment);
                    country_list.push(c);
                });
            }else{
                data.forEach(function (d) {
                    var sentiment = countCountrySentiment(tweets, d.name);
                    var c = new Country(d.id, d.name.toLowerCase(), sentiment);
                    updateCountry(c);
                });
            }
        });
        svg.selectAll(".country")
            .data(myCountries)
            .style('opacity', 0.7)
            .style("fill", newColorCountry);
        check = !check;
    });

    function dateFormatter(date, day)     {
        var day_ = "";
        if(date.includes("/" + day + "/"))         {
            day_ = "/" + day + "/";
            while(str.includes("/"))             {
                day_ = day_.replace("/", "");
            }         }
        return day_;
    }

    function retrieveTweetsForThisDay(tweets, day) {
        var tweets_of_the_day = [];
        for (var i = 0; i < tweets.length; i++)         {
            if(tweets[i].time.includes("/" + day + "/"))             {
                tweets_of_the_day.push(tweets[i]);
            }
        }
        return tweets_of_the_day;
    }

    function countCountrySentimentInASpecificDay(tweets, countryName, day)     {
        var sentiment = 0.0;
        var sentimentAccumulator = 0.0;
        var sentimentCount = 0.0;
        var sentimentAvg = 0.0;
        var tweets_of_the_day = retrieveTweetsForThisDay(tweets, day);
        for(var i = 0; i < tweets_of_the_day.length; i++)         {
            if(tweets_of_the_day[i].location.length > 0) {
                var c1 = tweets_of_the_day[i].location.toLowerCase();
                var c2 = countryName.toLowerCase();
                if (c1.localeCompare(c2) == 0)
                {
                    sentimentAccumulator = sentimentAccumulator + parseFloat(tweets_of_the_day[i].sentiment);
                    sentimentCount = sentimentCount + 1.0;
                }
            }
        }
        if(sentimentCount > 0.0) {
            sentimentAvg = sentimentAccumulator / sentimentCount;
        }else{
            sentimentAvg = 10;
        }
        sentiment = Idistance(sentimentAvg);
        //console.log(sentiment); 
        return sentiment;
    }

    function showList()
    {
        country_list.forEach(function(d) {
        });
        return country_list;
    }

    function countCountrySentiment(tweets, countryName)
    {
        var sentiment = 0.0;
        var sentimentAccumulator = 0.0;
        var sentimentCount = 0.0;
        var sentimentAvg = 0.0;

        for(var i = 0; i < tweets.length; i++)
        {
            if(tweets[i].location.length > 0) {
                var c1 = tweets[i].location.toLowerCase();
                var c2 = countryName.toLowerCase();
                if (c1.localeCompare(c2) == 0)
                {
                    sentimentAccumulator = sentimentAccumulator + parseFloat(tweets[i].sentiment);
                    sentimentCount = sentimentCount + 1.0;
                }
            }
        }

        if(sentimentCount > 0.0) {
            sentimentAvg = sentimentAccumulator / sentimentCount;
        }else{
            sentimentAvg = 10;
        }
        sentiment = Idistance(sentimentAvg);
        //console.log(sentiment);
        return sentiment;
    }

    function Idistance(value)
    {
        var result = value - 1.0;
        return result;
    }

    function countUSA(locations)
    {
        for(var i = 0; i < locations.length; i++)
        {
            var string = locations[i].location;
            substring = "usa";
            if(string.indexOf(substring) > -1)
            {
                count++;
            }
        }
    }

    function colorCountry(country) {
        if (country.id == 643) {
            return '#00AA00';
        } else {
            return "#000000";
        }
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
        if (sentiment == 9) {
            return '#D3D3D3';
        }
        newcolor = color(sentiment);

        return newcolor;
    }

    function updateCountry(country)
    {
        for(var i = 0; i < country_list.length; i++)
        {
            if(country_list[i].id == country.id)
            {
                console.log("++++++++++");
                country_list[i].sentiment = country.sentiment
            }
        }
    }

    function updateAllCountries(day)
    {

        var sentiment = countCountrySentimentInASpecificDay(tweets, d.name, day);
        var c = new Country(d.id, d.name.toLowerCase(), sentiment);
        updateCountry(c);

    }

    function draw()
    {
        var err_;
        var world_;
        d3.json("world-110m2.json", function(error, world) {
            err_ = error;
            world_ = world;
            if (error) throw error;

            var countries = topojson.feature(world, world.objects.countries).features,
                neighbors = topojson.neighbors(world.objects.countries.geometries);

            svg.selectAll(".country")
                .data(countries)
                .enter()
                .insert("path", ".graticule")
                .attr("class", "country")
                .attr("d", path)
                .attr('title', 'Blah')
                .style('opacity', 0.7)
                .style("fill", newColorCountry)
                .attr("cx", function (d) {
                    return projection([d.lon, d.lat])[0];
                })
                .attr("cy", function (d) {
                    return projection([d.lon, d.lat])[1];
                });

            svg.insert("path", ".graticule")
                .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
                .attr("class", "boundary")
                .attr("d", path);

        });
    }

    function ready(err, world, names) {

        if (err) throw err
        let countries = topojson.feature(world, world.objects.countries).features
        countries = countries.filter(function(d) {
            return names.some(function(n) {
                if (d.id == n.id) {
                    myCountries.push(d);
                    return d.name = n.name;
                }
            })
        })
        myCountries = countries;
        console.log(myCountries);
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
            .style("fill", newColorCountry)
            .style("opacity", 0.7)
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
                nameTag.style('visibility', 'visible')
                // console.log('in')
            })
            .on('click', function()
            {
                d3.select("#filterBox")[0][0].value = d3.select(this).attr('data-name');
                textOnChange();
            })
            .on('mouseout', function() {
                //console.log('out')
                d3.select(this).style('opacity', 0.7)
                nameTag.style('visibility', 'hidden')
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

    /*CLASS FUNCTIONS*/
    function Country (id, name, sentiment) {
        this.id = id;
        this.name = name;
        this.sentiment = sentiment;
        this.getCountryInfo = function() {
            return this.id + ' ' + this.name;
        };
    }

    function checked()
    {
        if(check)
        {
            loudCountryListBasedOnMonth();
            console.log("OOOOOO");
        }
    }

    d3.select(self.frameElement).style("height", height + "px");
}

var tiago = new TiagoScript();