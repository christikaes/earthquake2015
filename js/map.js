(function () {
    var extent, scale,
        classes = 9, scheme_id = "BuPu",
        reverse = false;
        scheme = colorbrewer[scheme_id][classes],
        container = L.DomUtil.get('map'),
        map = L.map(container).setView([28.3, 84], 7);

    L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png', {
        attribution: '<a href="http://content.stamen.com">Stamen WaterColor</a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        maxZoom: 17
    }).setOpacity(0.2).addTo(map);

    var imageUrl ='http://www.niwfnepal.org.np/images/projects(map).png'
    imageUrl = 'http://www.state.gov/gm/nepal_crc_dark_blue_80.png'
    var imageBounds = [[26.2, 79.9], [30.6, 88.4]];
    L.imageOverlay(imageUrl, imageBounds).addTo(map);

    d3.json(container.dataset.source, function(collection) {
        L.pointsLayer(collection, {
            radius: get_radius,
            applyStyle: circle_style
        }).addTo(map);

        var chart = timeseries_chart(scheme)
                .x(get_time).xLabel("Earthquake origin time")
                .y(get_magnitude).yLabel("Magnitude")
                .brushmove(on_brush);

        d3.select("#earthquake-plot").datum(collection.features).call(chart);
    });

    function get_time(d) {
        return d3.time.format.iso.parse(d.properties.time);
    }

    function get_magnitude(d) {
        return +d.properties.mag;
    }

    function on_brush(brush) {
        var s = brush.extent();
        d3.selectAll(".circle").classed("selected", function (d) {
            var time = get_time(d);
            return s[0] <= time && time <= s[1];
        });
    }

    function get_radius(d) {
        return d.properties.mag * d.properties.mag;
    }

    function circle_style(circles) {
        if (!(extent && scale)) {
            extent = d3.extent(circles.data(), function (d) { return d.properties.dmin; });
            scale = d3.scale.log()
                    .domain(reverse ? extent.reverse() : extent)
                    .range(d3.range(classes));
        }
        circles.attr('opacity', 0.4)
            .attr('stroke', scheme[classes - 1])
            .attr('stroke-width', 1)
            .attr('fill', function (d) {
                return scheme[(scale(d.properties.dmin) * 10).toFixed()];
            });

        circles.on('click', function (d, i) {
            L.DomEvent.stopPropagation(d3.event);

            var t = '<h3><%- id %></h3>' +
                    '<ul>' +
                    '<li>Magnitude: <%- mag %> mb</li>' +
                    '<li>Depth: <%- depth %> km</li>' +
                    '</ul>';

            var data = {
                    id: d.properties.title,
                    mag: d.properties.mag,
                    depth: d.properties.dmin
                };

            L.popup()
                .setLatLng([d.geometry.coordinates[1], d.geometry.coordinates[0]])
                .setContent(_.template(t, data))
                .openOn(map);

        });
    }

    function timeseries_chart(color) {
        var margin = { top: 5, right: 5, bottom: 40, left: 45 },
            width = 600 - margin.left - margin.right,
            height = 200;

        var x = d3.time.scale(),
            y = d3.scale.linear(),
            x_label = "X", y_label = "Y",
            brush = d3.svg.brush().x(x).on("brush", _brushmove);

        var get_x = no_op,
            get_y = no_op;

        function timeseries(selection) {
            selection.each(function (d) {
                x.range([0, width]);
                y.range([height, 0]);

                var series = d3.select(this).append("svg").attr("id", "quake-timeseries")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g").attr("id", "date-brush")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                var x_axis = series.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")");

                var y_axis = series.append("g")
                        .attr("class", "y axis");

                x_axis.append("text")
                    .attr("class", "label")
                    .attr("x", width)
                    .attr("y", 30)
                    .style("text-anchor", "end")
                    .text(x_label);

                y_axis.append("text")
                    .attr("class", "label")
                    .attr("transform", "rotate(-90)")
                    .attr("y", -40)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text(y_label);

                series.append("clipPath")
                    .attr("id", "clip")
                    .append("rect")
                    .attr("width", width - 1)
                    .attr("height", height - .25)
                    .attr("transform", "translate(1,0)");

                series.append("g")
                        .attr("class", "brush")
                        .call(brush)
                        .selectAll("rect")
                        .attr("height", height)
                        .style("stroke-width", 1)
                        .style("stroke", color[color.length - 1])
                        .style("fill", color[2])
                        .attr("opacity", 0.4);

                x.domain(d3.extent(d, get_x));
                x_axis.call(d3.svg.axis().scale(x).orient("bottom"));

                y.domain(d3.extent(d, get_y));
                y_axis.call(d3.svg.axis().scale(y).orient("left"));

                series.append("g").attr("class", "timeseries")
                    .attr("clip-path", "url(#clip)")
                    .selectAll("circle")
                    .data(d).enter()
                    .append("circle")
                    .style("stroke", color[color.length - 2])
                    .style("stroke-width", .5)
                    .style("fill", color[color.length - 1])
                    .attr("opacity", .4)
                    .attr("r", 4)
                    .attr("transform", function (d) {
                        return "translate(" + x(get_x(d)) + "," + y(get_y(d)) + ")";
                    });

                series.append("text")
                    .attr("x", (width / 2))
                    .attr("y", 10)
                    .attr("text-anchor", "middle")
                    .style("font-size", "16px")
                    .style("text-decoration", "underline")
                    .text("The first 2 days of Earthquakes");
            });
        }

        timeseries.x = function (accessor) {
            if (!arguments.length) return get_x;
            get_x = accessor;
            return timeseries;
        };

        timeseries.y = function (accessor) {
            if (!arguments.length) return get_y;
            get_y = accessor;
            return timeseries;
        };

        timeseries.xLabel = function (label) {
            if (!arguments.length) return x_label;
            x_label = label;
            return timeseries;
        }

        timeseries.yLabel = function (label) {
            if (!arguments.length) return y_label;
            y_label = label;
            return timeseries;
        }

        timeseries.brushmove = function (cb) {
            if (!arguments.length) return brushmove;
            brushmove = cb;
            return timeseries;
        };

        function _brushmove() {
            brushmove.call(null, brush);
        }

        function no_op() {}

        return timeseries;
    }
}());
