(function () {
  // persons moving between Marin, Sonoma, Napa, SF, EB, SV and other regions
  var matrix = [
    [ 5000, 1000, 2000, 4000, 3000, 3000, 5000 ],
    [ 100, 2000, 80, 30, 10, 0, 0 ],
    [ 0, 1, 5001, 29, 17, 0, 26 ],
    [ 1000, 2000, 800, 300, 10, 0, 0 ],
    [ 1000, 2000, 800, 300, 10, 0, 0 ],
    [ 1000, 2000, 800, 300, 10, 0, 0 ],
    [ 1000, 2000, 800, 300, 10, 0, 0 ]
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
    console.log(d)
    var k = (d.endAngle - d.startAngle) / 2;
    return [
      {
        angle: d.startAngle,
        label: "0k"
      },
      {
        angle: d.startAngle + (d.endAngle - d.startAngle) / 2,
        label: array[d.index]
      },
      {
        angle: d.endAngle,
        label: Math.round(d.value/1000) + "k"
      }
    ]
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
