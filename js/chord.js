(function () {
  // Data based off off: http://www.worldpop.org.uk/nepal/Flowminder-Nepal-2015-08-27_%28V3%29.pdf
  var matrix = [
    [ 0, 12, 3, 1, 10, 5, 7, 2, 21, 0, 2, 3 ], // 63 out 130 in .75         /
    [ 1, 0, 0, 0, 0, 1, 1, 0, 3, 0, 0, 0 ], // 2 out 16 in                  /
    [ 8, 1, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0 ], // 13 4                         /
    [ 8, 1, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0 ], //13 1                          /
    [ 8, 1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0 ], // 14 13                        /
    [ 4, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0 ], // 5.4 6                        /
    [ 6, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0 ], //7,4 9                         /
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // -1, 2                        /
    [ 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0 ], // 2 27                         /
    [ 1, 0, 0, 0, 0, 1, 1, 0, 3, 0, 0, 0 ], // 2.8                          /
    [ 4, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0 ], // 5.6 2.2                      /
    [ 13, 2, 0, 0, 1, 0, 1, 0, 3, 0, 0, 0 ], // 25 4                        /
  ];

  var array = [ "Kathmandu", "Dhading", "Dolakha", "Gorkha", "Kavrepalanchok", "Makwanpur", "Nuwakot", "Okhaldhunga", "Ramechhap", "Rasuwa", "Sindhuli", "Sindupalchok" ];
  var chord = d3.layout.chord()
      .padding(.05)
      .sortSubgroups(d3.descending)
      .matrix(matrix);

  var width = 500,
      height = 500,
      innerRadius = Math.min(width, height) * .30,
      outerRadius = innerRadius * 1.1;

  var fill = d3.scale.ordinal()
      .domain(d3.range(4))
      .range(["#00aeef", "#e1f4fd", "#000000", "#96999b", "#5d6263", "#e1d8ad", "#cf5c42", "#00447c", "#f4d5e3"]);

  var svg = d3.select("#earthquake-chord").append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  svg.append("g").selectAll("path")
      .data(chord.groups)
    .enter().append("path")
      .style("fill", function(d) { return fill(d.index); })
      .style("stroke", function(d) { return fill(d.index); })
      .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
      .on("mouseover", fade(.1))
      .on("mouseout", fade(1));

  var ticks = svg.append("g").selectAll("g")
      .data(chord.groups)
    // .enter().append("g").selectAll("g")
    //   .data(groupTicks)
    .enter().append("g").selectAll("g")
      .data(groupName)
    .enter().append("g")
      .attr("transform", function(d) {
        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
            + "translate(" + outerRadius + ",0)";
      });

  ticks.append("line")
      .attr("x1", 1)
      .attr("y1", 0)
      .attr("x2", 5)
      .attr("y2", 0)
      .style("stroke", "#000");

  ticks.append("text")
      .attr("x", 8)
      .attr("dy", ".35em")
      .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180)translate(-16)" : null; })
      .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
      .text(function(d) { return d.label; });

  svg.append("g")
      .attr("class", "chord")
    .selectAll("path")
      .data(chord.chords)
    .enter().append("path")
      .attr("d", d3.svg.chord().radius(innerRadius))
      .style("fill", function(d) { return fill(d.target.index); })
      .style("opacity", 1);

  // Returns an array of tick angles and labels, given a group.
  function groupTicks(d) {
    var k = (d.endAngle - d.startAngle) / d.value;
    return d3.range(0, d.value, 1000).map(function(v, i) {
      return {
        angle: v * k + d.startAngle,
        label: i % 5 ? null : v / 1000 + "k"
      };
    });
  }

  function groupName(d) {
    // labels
    var k = (d.endAngle - d.startAngle) / d.value;
    var labels = d3.range(0, d.value, 1).map(function(v, i) {
      return {
        angle: v * k + d.startAngle,
        label: i % 5 ? null : v / 1 + "k"
      };
    });

    // Group Name
    labels.push({
      angle: d.startAngle + (d.endAngle - d.startAngle) / 2,
      label: array[d.index]
    })

    return labels;
  }

  // Returns an event handler for fading a given chord group.
  function fade(opacity) {
    return function(g, i) {
      svg.selectAll(".chord path")
          .filter(function(d) { return d.source.index != i && d.target.index != i; })
        .transition()
          .style("opacity", opacity);
    };
  }

}());
