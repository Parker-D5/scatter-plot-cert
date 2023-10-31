import "./style.scss";
import * as d3 from "/node_modules/d3";

const drawPlot = function (d) {
  const margin = { top: 50, right: 100, bottom: 100, left: 100 };
  const width = 920 * 1.5;
  const height = 630 * 1.5;
  console.log(d);

  const timeFormat = d3.timeFormat("%M:%S");

  console.log(d3.tickFormat(timeFormat));
  const xScale = d3
    .scaleLinear()
    .domain([d3.min(d, (d) => d.Year - 1), d3.max(d, (d) => d.Year + 1)])
    .range([0, width - margin.right - margin.left]);

  const yScale = d3
    .scaleTime()
    .domain(
      d3.extent(d, function (d) {
        return d.Time;
      })
    )
    .range([margin.top, height - margin.bottom - margin.top]);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // tooltip setup
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip")
    .style("opacity", "0");

  //  base canvas
  const canvas = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // x-axis
  canvas
    .append("g")
    .attr("id", "x-axis")
    .attr(
      "transform",
      "translate(0," + (height - margin.bottom - margin.top) + ")"
    )
    .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
    .append("text")
    .attr("class", "label")
    .attr("x", width - margin.right - margin.left - 30)
    .attr("y", -6)
    .text("Year");

  // y-axis
  canvas
    .append("g")
    .attr("id", "y-axis")
    .call(d3.axisLeft(yScale).tickFormat(timeFormat))
    .append("text")
    .attr("class", "label")
    .attr("x", -100)
    .attr("y", -50)
    .attr("transform", "rotate(-90)")
    .text("Time (Minutes)");

  // circles
  canvas
    .append("g")
    .selectAll("circle")
    .data(d)
    .join("circle")
    .attr("class", "dot")
    .style("fill", function (d) {
      return color(d.Doping !== "");
    })
    .attr("cx", (d) => xScale(d.Year))
    .attr("cy", (d) => yScale(d.Time))
    .attr("r", 7.5)
    .attr("data-xvalue", (d) => d.Year)
    .attr("data-yvalue", (d) => d.Time)
    .on("mouseover", function (event, d) {
      console.log(d);
      tooltip.style("opacity", ".9");
      tooltip.attr("data-year", d.Year);
      tooltip.html(
        d.Name +
          ": " +
          d.Nationality +
          "<br/>Year: " +
          d.Year +
          ", Time: " +
          timeFormat(d.Time) +
          (d.Doping ? "<br/><br/>" + d.Doping : "")
      ).style('left', event.pageX + 'px')
      .style('top', event.pageY - 28 + 'px');
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
    });

  // title
  canvas
    .append("text")
    .attr("id", "title")
    .attr("x", (width - margin.right - margin.left) / 2)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .text("Doping in Professional Bicycle Racing");

  // subtitle
  canvas
    .append("text")
    .attr("x", (width - margin.right - margin.left) / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("class", "label")
    .style("fill", "white")
    .text("35 Fastest times up Alpe d'Huez");

  // legend container

  const legendContainer = canvas.append("g").attr("id", "legend");

  const legend = legendContainer
    .selectAll("#legend")
    .data(color.domain())
    .enter()
    .append("g")
    .attr("class", "legend-label")
    .attr("transform", function (d, i) {
      return "translate(0," + (height / 2 - i * 35) + ")";
    });

  legend
    .append("rect")
    .attr("x", width - margin.right - margin.left)
    .attr("width", 20)
    .attr("height", 20)
    .style("fill", color);

  legend
    .append("text")
    .attr("x", width - margin.left - margin.right - 16)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function (d) {
      if (d) {
        return "Riders with doping allegations";
      } else {
        return "No doping allegations";
      }
    });
};

d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
).then(function (d) {
  d.forEach(function (d) {
    var parsedTime = d.Time.split(":");
    d.Time = new Date(0, 0, 1, 0, parsedTime[0], parsedTime[1]);
  });
  drawPlot(d);
});
