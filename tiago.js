var TiagoScript = function drawMap(){
    var width = document.getElementById('middlePanel').offsetWidth - 14,
        height = document.getElementById('middlePanel').offsetHeight;

    var country_list = [];

    var tweets = [];

    var myCountries = [];

    var currentDay = "11";

    var stringDate = "Date: 04/11";
    var dateParam = stringDate.substring(6) + "/2016";

    d3.json("gamergate.json", function(error, result)
    {
        if (error) throw error;
        tweets = result;
        loadCountryList();
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

    var check = false;

    var color = d3.scale.linear()
        .domain([-2, -1, 0])
        .range(["red", "dimgray", "blue"]);

    var projection = d3.geo.mercator()
        .scale(85)
        .translate([width / 2, height / 2])
        .precision(.1);

    var path = d3.geo.path()
        .projection(projection);

    var graticule = d3.geo.graticule();

    var type = d3.select("#typeofdata");
    var selection = "numtweets";

    type.on('change', function()
    { selection = (this.value).toLowerCase()})

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

    var textTooltip = d3.select("#tooltipaux").append('text');

    var textSlider =  svg.append("text")         // append text
        .style("fill", "red")   // fill the text with the colour black
        .attr("x", 480)           // set x position of left side of text
        .attr("y", 20)
    //.text(" Date: 04/" + 11);

    var textSupportive = svg.append("text")         // append text
        .style("fill", "blue")   // fill the text with the colour black
        .attr("x", 10)           // set x position of left side of text
        .attr("y", 20)           // set y position of bottom of text

    //.text("Most supportive countries on " + textSlider);

    var support1 = svg.append("text")         // append text
        .style("fill", "black")   // fill the text with the colour black
        .attr("x", 10)           // set x position of left side of text
        .attr("y", 30)           // set y position of bottom of text
    //    .text("1. " + listSupport[0].name);

    var support2 = svg.append("text")         // append text
        .style("fill", "black")   // fill the text with the colour black
        .attr("x", 10)           // set x position of left side of text
        .attr("y", 40)           // set y position of bottom of text
    //    .text("2. " + listSupport[1].name);

    var support3 = svg.append("text")         // append text
        .style("fill", "black")   // fill the text with the colour black
        .attr("x", 10)           // set x position of left side of text
        .attr("y", 50)           // set y position of bottom of text
    //    .text("3. " + listSupport[2].name);

    var leastSupp = svg.append("text")         // append text
        .style("fill", "red")   // fill the text with the colour black
        .attr("x", 230)           // set x position of left side of text
        .attr("y", 20)           // set y position of bottom of text
    //    .text("Least supportive countries on April/2016");

    var non_supp1 = svg.append("text")         // append text
        .style("fill", "black")   // fill the text with the colour black
        .attr("x", 230)           // set x position of left side of text
        .attr("y", 30)           // set y position of bottom of text
    //    .text("1. " + listAgainst[0].name);

    var non_supp2 = svg.append("text")         // append text
        .style("fill", "black")   // fill the text with the colour black
        .attr("x", 230)           // set x position of left side of text
        .attr("y", 40)           // set y position of bottom of text
    //    .text("2. " + listAgainst[1].name);

    var non_supp3 = svg.append("text")         // append text
        .style("fill", "black")   // fill the text with the colour black
        .attr("x", 230)           // set x position of left side of text
        .attr("y", 50)           // set y position of bottom of text
    //    .text("3. " + listAgainst[2].name);

    panelLegend();

    function supportiveCountries(countries)
    {
        var supportiveCountries = countries;
        supportiveCountries.sort(function(a, b) {
            return b.sentiment - a.sentiment;
        });
        supportiveCountries = filterNoDataSentiment(supportiveCountries);
        var countries_to_return = [supportiveCountries[0], supportiveCountries[1], supportiveCountries[2]];
        return countries_to_return;
    }

    function againstCountries(countries)
    {
        var against_countries = countries;
        against_countries.sort(function(a, b) {
            return a.sentiment - b.sentiment;
        });
        against_countries = filterNoDataSentiment(against_countries);
        var countries_to_return = [against_countries[0], against_countries[1], against_countries[2]];
        return countries_to_return;
    }

    function rankPos(countries)
    {
        var against_countries = countries;
        against_countries.sort(function(a, b) {
            return a.balance - b.balance;
        });
        against_countries = filterNoDataSentiment(against_countries);
        var countries_to_return = [against_countries[0], against_countries[1], against_countries[2]];
        return countries_to_return;
    }

    function rankNeg(countries)
    {
        var against_countries = countries;
        against_countries.sort(function(a, b) {
            return b.balance - a.balance;
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

    /*FUNCTIONS*/
    function loadCountryList()
    {
        d3.tsv("world-country-names.tsv", function(error, data) {
            if (error) throw error;
            data.forEach(function(d) {
                var sentiment = countCountrySentimentInASpecificDate(tweets, d.name, dateParam);
                var c = new Country(d.id, d.name.toLowerCase(), sentiment);
                country_list.push(c);
            });
            queue()
                .defer(d3.json, "world-110m2.json")
                .defer(d3.tsv, "world-country-names.tsv")
                .await(ready);

            var listSupport = supportiveCountries(country_list);
            var listAgainst = againstCountries(country_list);

            textSupportive.text("Most supportive countries");
            support1.text("1. " + listSupport[0].name);
            support2.text("2. " + listSupport[1].name);
            support3.text("3. " + listSupport[2].name);
            leastSupp.text("Least supportive countries");
            non_supp1.text("1. " + listAgainst[0].name);
            non_supp2.text("2. " + listAgainst[1].name);
            non_supp3.text("3. " + listAgainst[2].name);
            loadCountryListBasedOnDate(dateParam);
        });

    }

    function loadCountryListBasedOnDay(day)
    {
        //var new_country_list = [];
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
                    var pos = printTotalPos(d.name, day);
                    var neg = printTotalNeg(d.name, day);
                    var balance;
                    if(pos > 0.0)
                    {
                        balance = pos;
                    }
                    else if(neg < 0.0)
                    {
                        balance = neg;
                    }
                    var c = new Country(d.id, d.name.toLowerCase(), sentiment, balance);
                    updateCountry(c);
                });
            }
            svg.selectAll(".country")
                .data(myCountries)
                .style('opacity', 0.7)
                .style("fill", newColorCountry);

            var listSupport = supportiveCountries(country_list);
            var listAgainst = againstCountries(country_list);

            textSupportive.text("Most supportive countries");
            support1.text("1. " + listSupport[0].name);
            support2.text("2. " + listSupport[1].name);
            support3.text("3. " + listSupport[2].name);
            leastSupp.text("Least supportive countries");
            non_supp1.text("1. " + listAgainst[0].name);
            non_supp2.text("2. " + listAgainst[1].name);
            non_supp3.text("3. " + listAgainst[2].name);
        });

        //var new_country_list = nova(day, country_list);

        textSlider.text(stringDate);

        //currentDay = day;

    }

    function loadCountryListBasedOnDate(date)
    {
        //var new_country_list = [];
        d3.tsv("world-country-names.tsv", function (error, data) {
            if (error) throw error;
            if (country_list.length == 0) {
                data.forEach(function (d) {
                    var sentiment = countCountrySentimentInASpecificDate(tweets, d.name, date);
                    var c = new Country(d.id, d.name.toLowerCase(), sentiment);
                    country_list.push(c);
                });
            } else {
                data.forEach(function (d) {
                    var sentiment = countCountrySentimentInASpecificDate(tweets, d.name, date);
                    var c = new Country(d.id, d.name.toLowerCase(), sentiment);
                    updateCountry(c);
                });
            }
            svg.selectAll(".country")
                .data(myCountries)
                .style('opacity', 0.7)
                .style("fill", newColorCountry);

            var listSupport = supportiveCountries(country_list);
            var listAgainst = againstCountries(country_list);

            textSupportive.text("Most supportive countries");
            support1.text("1. " + listSupport[0].name);
            support2.text("2. " + listSupport[1].name);
            support3.text("3. " + listSupport[2].name);
            leastSupp.text("Least supportive countries");
            non_supp1.text("1. " + listAgainst[0].name);
            non_supp2.text("2. " + listAgainst[1].name);
            non_supp3.text("3. " + listAgainst[2].name);
        });

        //var new_country_list = nova(day, country_list);

        textSlider.text(stringDate);

        //currentDay = day;

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
        if(date.includes("/" + day + "/"))
        {
            day_ = "/" + day + "/";
            while(day_.includes("/"))             {
                day_ = day_.replace("/", "");
            }
        }
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

    function retrieveTweetsForThisDate(tweets, date) {

        var tweets_of_the_day = [];
        for (var i = 0; i < tweets.length; i++) {
            if(tweets[i].time.toString().localeCompare(date.toString()) == 0) {
                tweets_of_the_day.push(tweets[i]);
            }
        }
        return tweets_of_the_day;
    }


    function nova(day, list_of_countries)
    {
        var new_country_list = [];
        var tweets_of_the_day = retrieveTweetsForThisDay(tweets, day);
        for(var i = 0; i < tweets_of_the_day.length; i++)         {
            for(var j = 0; j < list_of_countries.length; j++) {
                if (tweets_of_the_day[i].location.length > 0) {
                    var c1 = tweets_of_the_day[i].location.toLowerCase();
                    var c2 = list_of_countries[j].name.toLowerCase();
                    if (c1.localeCompare(c2) == 0) {
                        new_country_list.push(country);
                    }
                }
            }
        }
        return new_country_list;
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
        return sentiment;
    }

    function countCountrySentimentInASpecificDate(tweets, countryName, date)     {
        var sentiment = 0.0;
        var sentimentAccumulator = 0.0;
        var sentimentCount = 0.0;
        var sentimentAvg = 0.0;
        var tweets_of_the_day = retrieveTweetsForThisDate(tweets, date);

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

    function totalTweetsOfThisCountry(country)
    {
        var count = 0;
        for(var i = 0; i < tweets.length; i++)
        {
            if (tweets[i].location.length > 0) {
                var c1 = tweets[i].location.toLowerCase();
                var c2 = country.toLowerCase();
                if (c1.localeCompare(c2) == 0) {
                    count++;
                }
            }
        }
        return count;
    }

    function totalTweetsOfThisCountryOnThisDay(country, day)
    {
        var count = 0;
        for(var i = 0; i < tweets.length; i++)
        {
            if (tweets[i].location.length > 0) {
                if(dateFormatter(tweets[i].time, day) == day) {
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

    function t_neg(country, data) {
        var neg = 0.0;
        var total = 0.0;
        var twits_of_the_date = retrieveTweetsForThisDate(tweets, data);
//        console.log("OPOPOPOPOPOP");
//        console.log(twits_of_the_date);
        for (var i = 0; i < twits_of_the_date.length; i++) {
            if (twits_of_the_date[i].location.length > 0) {
                if (twits_of_the_date[i].time.localeCompare(data) == 0) {

                    var c1 = twits_of_the_date[i].location.toLowerCase();
                    var c2 = country.toLowerCase();
                    if (c1.localeCompare(c2) == 0) {
                        if (parseFloat(twits_of_the_date[i].sentiment) < 0.0) {
                            neg = neg + 1.0;
                        }
                        total = total + 1.0;
                    }
                }
            }
        }
        return formatDec(neg / total).toString();
    }

    function t_pos(country, data) {
        var pos = 0.0;
        var total = 0.0;
        var twits_of_the_date = retrieveTweetsForThisDate(tweets, data);
        for (var i = 0; i < twits_of_the_date.length; i++) {
            if (twits_of_the_date[i].location.length > 0) {
                if (twits_of_the_date[i].time.localeCompare(data) == 0) {
                    var c1 = twits_of_the_date[i].location.toLowerCase();
                    var c2 = country.toLowerCase();
                    if (c1.localeCompare(c2) == 0) {
                        if (parseFloat(twits_of_the_date[i].sentiment) > 0.0) {
                            pos = pos + 1.0;
                        }
                        total = total + 1.0;
                    }
                }
            }
        }
        return formatDec(pos / total).toString();
    }

    function printTotalPos(country, day)
    {
        var pos = totalPosOfThisCountryOnThisDay(country, day);
        var total = totalTweetsOfThisCountryOnThisDay(country, day);
        var totalPos = formatDec(pos/total);

        return totalPos;
    }

    function printTotalNeg(country, day)
    {
        var neg = totalNegOfThisCountryOnThisDay(country, day);
        var total = totalTweetsOfThisCountryOnThisDay(country, day);
        var totalPos = formatDec(neg/total);
        return totalPos;
    }

    function totalPosOfThisCountryOnThisDay(country, day)
    {
        var pos = 0.0;
        for(var i = 0; i < tweets.length; i++)
        {
            if (tweets[i].location.length > 0) {
                if(dateFormatter(tweets[i].time, day) == day) {
                    var c1 = tweets[i].location.toLowerCase();
                    var c2 = country.toLowerCase();
                    if (c1.localeCompare(c2) == 0) {
                        if(parseFloat(tweets[i].sentiment) > 0)
                        {
                            pos = pos + parseFloat(tweets[i].sentiment);
                        }
                    }
                }
            }
        }
        return pos;
    }

    function totalNegOfThisCountryOnThisDay(country, day)
    {
        var neg = 0.0;
        for(var i = 0; i < tweets.length; i++)
        {
            if (tweets[i].location.length > 0) {
                if(dateFormatter(tweets[i].time, day) == day) {
                    var c1 = tweets[i].location.toLowerCase();
                    var c2 = country.toLowerCase();
                    if (c1.localeCompare(c2) == 0) {
                        if(parseFloat(tweets[i].sentiment) < 0)
                        {
                            neg = neg + parseFloat(tweets[i].sentiment);
                        }
                    }
                }
            }
        }
        return neg;
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
            //.style("fill", newColorCountry)
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
                nameTag.style('visibility', 'visible');
            })
            .on('click', function() {
                d3.select("#filterBox")[0][0].value = d3.select(this).attr('data-name');
                textOnChange();
                if (selection.localeCompare("numTweets".toLowerCase()) == 0) {
                    textTooltip.text("\t\n" + "Total Tweets: " + "\n" +
                        totalTweetsOfThisCountryOnThisDate(d3.select(this).attr('data-name'), dateParam)).fontcolor("red")
                } else if (selection.localeCompare("avgSentiment".toLowerCase()) == 0) {
                    textTooltip.text("Pos: " + t_pos(d3.select(this).attr('data-name'), dateParam) + "\n" +
                        "Neg: -" + t_neg(d3.select(this).attr('data-name'), dateParam))

                }
            })
            .on('mouseout', function() {
                d3.select(this).style('opacity', 0.7)
                nameTag.style('visibility', 'hidden')
            })
            .on('mouseleave', function (){
                textTooltip.style({
                    position:"absolute",
                    visibility: "visible",
                    opacity:1,
                    top:d3.event.clientY + "px",
                    left:d3.event.clientX + "px"
                }).text("")
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
    function Country (id, name, sentiment, balance) {
        this.id = id;
        this.name = name;
        this.sentiment = sentiment;
        this.balance = balance;
        this.getCountryInfo = function() {
            return this.id + ' ' + this.name + '' + this.balance;
        };
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

    d3.select(self.frameElement).style("height", height + "px");
}

var tiago = new TiagoScript();