Polymer({
  is: 'corespring-pie-d3-pie-chart-polymer-ralf',
  properties: {
    state: {
      type: Object,
      observer: '_onStateChanged'
    },
    session: {
      type: Object,
      observer: '_onSessionChanged'
    }
  },
  _onSessionChanged: _onSessionChanged,
  _onStateChanged: _onStateChanged,
  attached: attached,
  createElements: createElements,
  drawChart: drawChart,
  refreshChart: refreshChart,
  updateSession: updateSession
});

function _onSessionChanged() {
  var me = this;
  console.log('_onSessionChanged', me.session, me.state);
  me.session.value = me.session.value || [];
  me.notifyPath('session.value', me.session.value);
}

function _onStateChanged() {
  var me = this;
  console.log('_onStateChanged', me.state);
  me.data = me.state.config.sections;
  me.data.forEach(function(d) {
    d.value = +d.value;
  });

  me.drawChart();

  //how to init the session with something based on the state?
  //setting the session directly doesn't work
  setTimeout(function() {
    me.updateSession()
  }, 100);
}


function attached() {
  this.createElements();
}

function createElements() {
  var width = 500,
    height = 500,
    radius = Math.min(width, height) / 2;

  this.arc = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

  this.pie = d3.pie()
    .sort(null)
    .value(function(d) {
      return d.value;
    });

  this.svg = d3.select(this.$.svg)
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
}

function drawChart() {
  var me = this;

  var arcs = me.svg.selectAll(".arc")
    .data(me.pie(me.data))

  //update the fill of existing paths
  arcs.select('path').style("fill", function(d) {
    return (d.data.color);
  });

  //update the color of existing text
  arcs.select('text').attr("fill", function(d) {
    return (d.data.textColor);
  });

  me.g = arcs.enter().append("g")
    .attr("class", "arc")

  me.g.append("path")
    .attr("d", me.arc)
    .style("fill", function(d) {
      return (d.data.color);
    })
    .style("stroke", 'white')
    .style("stroke-width", '2px')

  me.g.append("text")
    .attr("transform", function(d) {
      return "translate(" + me.arc.centroid(d) + ")";
    })
    .attr("dy", ".35em")
    .style("text-anchor", "middle")
    .text(function(d) {
      return d.data.label;
    })
    .attr('fill', function(d) {
      return d.data.textColor;
    });
}

function refreshChart(e) {
  var me = this;

  console.log("refreshChart", me.data);

  me.svg.selectAll(".arc path").data(me.pie(me.data))
    .attr("d", me.arc);

  me.svg.selectAll(".arc text").data(me.pie(me.data))
    .attr("transform", function(d) {
      return "translate(" + me.arc.centroid(d) + ")";
    });

  me.updateSession();
}

function updateSession() {
  var me = this;

  var values = _.map(me.data, 'value');
  me.session.value = values;
}