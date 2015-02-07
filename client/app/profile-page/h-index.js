
// current understanding of h index
/*To determine the h-index of a researcher, organize articles in 
descending order, based on the number of times they have been cited. 
Thus, if an individual has eight papers that have been cited 33, 30, 
20, 15, 7, 6, 5 and 4 times, the individual’s h-index would be 6. 
The first paper 33, gives us a 1 – there is one paper that has been 
cited at least once, the second paper gives a 2, there are two papers 
that have been cited at least twice, the third paper, 3 and all the way 
up to 6 with the sixth highest paper –the final two papers have no effect 
in this case as they have been cited less than six times (Ireland, MacDonald 
& Stirling, 2013). h-index calculation*/

/*
      Articles      Citation Numbers
      1             33
      2             30
      3             20
      4             14
      5             7
      6             6       h-index = 6, because numCitations>=6 to add 1 to h-index
      7             5
      8             4
*/

var h_index = function(repoforks/*this is an object [{repo: forks},{repo: forks}]*/){
  var h_indices = [];
  var getIndiH = function(tuple){
    var sortedForks = [];
    sortedForks = tuple[1].sort();     //quicksort(tuple[1]);
    var h_index = 0;
    var counter = 1;
    for(var i=sortedForks.length-1; i>=0; i--){
      if(sortedForks[i]>=counter){
        h_index+=1;
        counter+=1;
      }
    }
    return [tuple[0], counter-1, h_index];
  };
  for(var key in repoforks){
    h_indices.push(getIndiH([key, repoforks[key]]));  //[user, arrayOfForks]
  }
  return h_indices;  // [user, repos, H_Index]
};


var opts = {
   lines: 13, // The number of lines to draw
   length: 7, // The length of each line
   width: 4, // The line thickness
   radius: 10, // The radius of the inner circle
   rotate: 0, // The rotation offset
   color: '#b3b3b3', // #rgb or #rrggbb
   speed: 0.75, // Rounds per second
   trail: 50, // Afterglow percentage
   shadow: false, // Whether to render a shadow
   hwaccel: false, // Whether to use hardware acceleration
   className: 'spinner', // The CSS class to assign to the spinner
   zIndex: 2e9, // The z-index (defaults to 2000000000)
   top: 'auto', // Top position relative to parent in px
   left: 'auto' // Left position relative to parent in px
};

function kimonoCallback(data) {
  var stats = data;

  var x=d3.scale.linear().domain([0,d3.max(stats, function(d) { return d[1]; })])
                         .range([margin,width-margin]);
  var y=d3.scale.linear().domain([0,d3.max(stats, function(d) { return d[2]; })])
                         .range([height-margin,margin]);
  var r=d3.scale.linear().domain([0,d3.max(stats, function(d) { return 5; })])
                         .range([0,20]);
  var o=d3.scale.linear().domain([10000,100000]).range([.5,1]);
  var c=d3.scale.ordinal().domain(["W","L"]).range(["#26E810","#E84956"]);
  var s=d3.scale.ordinal().domain(["points","fieldgoalper","freethrowper","threepointers","rebounds","assists","steals","blocks","turnovers","fouls","plusminus"])
                          .range(["Points","Field Goal %","Free Throw %","Threes Made","Rebounds","Assists","Steals","Blocks","Turnovers","Fouls","+/-"]);

// create axes

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

  svg.append("g")
    .attr("class", "xaxis")
    .attr("transform", "translate(0," + (height - margin) + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class", "yaxis")
    .attr("transform", "translate(" + margin + ",0)")
    .call(yAxis);

// add text to axes

  svg.append("text")
    .attr("class", "xlabel")
    .attr("text-anchor", "middle")
    .attr("x", width/2)
    .attr("y", height-10)
    .text("Repos");

  svg.append("text")
    .attr("class", "ylabel")
    .attr("text-anchor", "middle")
    .attr("x", -height/2)
    .attr("y", margin - 70)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("H-Index");

// start with circles at bottom

  svg.selectAll("circle").data(stats).enter()
    .append("circle")
    .attr("cx",function(d) {return x(d[1]);})
    .attr("cy",function(d) {return y(d[2]);})
    .attr("r",function(d) {return r(5);})

// initiate circles and move to position

  svg.selectAll("circle").transition().duration(1000)
    .attr("cx",function(d) {return x(d[1]);})
    .attr("cy",function(d) {return y(d[2]);})
    .attr("r",function(d) {return r(2);})

  svg.selectAll("circle").append("title")
    .html(function(d) {return 'Name: ' + d[0]});
// makes 'Track Stat' select disabled while ajax loading  

  $('select').removeAttr('disabled');

};

$('select').attr('disabled', 'disabled');

var width = 1200,
    height = 600, 
    margin = 70;

var svg=d3.select(".chart").append("svg").attr("width",width).attr("height",height);

var data = [['a',30, 3], ['b',10, 5], ['c',10, 6]]; //h_index([{user:[forks1, forks2, forks3]}, {user2: [forks1, forks2, forks3]}]);
kimonoCallback(data);