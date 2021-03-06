var props = {
  width: 1200,
  height: 10000,
  marginTop: 20,
  marginBottom: 20,
  marginLeft: 20,
  marginRight: 20,
  line1x: -300,
  line2x: 300
}

function addDurations(time1, time2){
  var minutes1 = parseInt(time1.split(":")[0]);
  var seconds1 = parseInt(time1.split(":")[1]);
  var minutes2 = parseInt(time2.split(":")[0]);
  var seconds2 = parseInt(time2.split(":")[1]);
  var minutesTotal = minutes1 + minutes2;
  var secondsTotal = seconds1 + seconds2;
  if(secondsTotal > 59){
    minutesTotal++;
    secondsTotal -= 60;
  }
  return minutesTotal + ":" + secondsTotal
}

function renderLyricsPage(lyricsCSV, albumCSV, divSelection){
  props.width = $("#" + divSelection).width();
  var svg = d3.select("#" + divSelection).append("svg").attr("width", props.width).attr("height",props.height);
  var g = svg.append("g").attr("transform", "translate(" + props.width / 2 + "," + props.height / 2 + ")");

  var time = d3.timeParse("%M:%S");
  var categoryColor = d3.scaleOrdinal(d3.schemeCategory20);
  var scale = d3.scaleTime().domain([time("00:00"),time("40:58")]).range([(-props.height / 2) + props.marginLeft, (props.height / 2) - props.marginRight]);
  var categories = ["misc","morning","ribbon","melodrama","teeth","seasons","breathing","car","violent","sober","perfect","liability"]
  var colors =     ["#0B2B81","#F44355","#036DD0","#D26B7D","#FAAF4F","#0634B8","#93C5D3","#32A8EA","#D1A240","#00bf5c","#cc006c","#c28fd6"]
  var colorScale = d3.scaleOrdinal().domain(categories).range(colors);

  g.selectAll("line")
    .data([null])
    .enter()
    .append("line")
    .attr("y1", -props.height / 2 + props.marginLeft)
    .attr("y2", props.height / 2 - props.marginRight)
    .attr("x1", 0)
    .attr("x2", 0)
    .style("stroke","black");

  d3.csv(lyricsCSV, function(phrases_data){
    d3.csv(albumCSV, function(album_data){
        g.selectAll(".phrase-div")
          .data(phrases_data)
          .enter()
          .append("text")
          .text(function(d){
            return d.phrase;
          })
          .attr("x",function(d){
            if(d.speaker == "ella"){
              return 50;
            }
            return -500;
          })
          .attr("y",function(d){
            var trackStart = album_data[d.track_num-1].start;
            var startScaled = scale(time(addDurations(d.start, trackStart)));
            var endScaled = scale(time(addDurations(d.end, trackStart)));
            return (startScaled + endScaled) / 2;
          })
          .style("fill", function(d){return categoryColor(d.category)});//colorScale(d.category)});

        g.selectAll(".song-division")
          .data(album_data)
          .enter()
          .append("line")
          .attr("class","song-division")
          .attr("y1", function(d){return scale(time(d.cumulative_duration))})
          .attr("y2", function(d){return scale(time(d.cumulative_duration))})
          .attr("x1", -20)
          .attr("x2", 20)
          .style("stroke","black")

        g.selectAll(".song-label")
            .data(album_data)
            .enter()
            .append("text")
            .attr("x",function(d){return (-1 * scale(time(d.start)) - 200);})
            .attr("y", -20)
            .style("transform","rotate(270deg)")
            .text(function(d){return d.track_title})
    });
  });
}
