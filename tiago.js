function drawMap(){
    var width = document.getElementById('middlePanel').offsetWidth - 2, 
        height = (document.getElementById('middlePanel').offsetHeight - document.getElementById('tweetDistLabel').offsetHeight) * 0.9;

    //console.log(width + " " + height);

    var country_list = [];

    var tweets = [];
    d3.json("gamergate.json", function(error, result)
    {
        if (error) throw error;
        tweets = result;
    });

    var color = d3.scale.linear()
       .domain([-2, -1, 0])
       .range(["red", "lightblue", "blue"]);

    var projection = d3.geo.mercator()
            .scale(100)
            .translate([width / 2, height / 2])
            .precision(.1);

    var path = d3.geo.path()
            .projection(projection);

    var graticule = d3.geo.graticule();

    var svg = d3.select("#chartmap")//select("body").append("svg")
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

    loadCountryList();
    //console.log(showList());
    draw();

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
        });
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
            substring = "france";
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

    function draw()
    {
        d3.json("world-110m2.json", function(error, world) {
            if (error) throw error;

            var countries = topojson.feature(world, world.objects.countries).features,
                    neighbors = topojson.neighbors(world.objects.countries.geometries);

            svg.selectAll(".country")
                    .data(countries)
                    .enter().insert("path", ".graticule")
                    .attr("class", "country")
                    .attr("d", path)
                    .style("fill", newColorCountry);

            svg.insert("path", ".graticule")
                    .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
                    .attr("class", "boundary")
                    .attr("d", path);

        });

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

    d3.select(self.frameElement).style("height", height + "px");
}

drawMap();