(function CorespringPieD3PieChartPolymerRalf() {

  return Polymer({
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
    onToggleCorrectAnswer: onToggleCorrectAnswer,
    updatePieChart: updatePieChart,
    updateSession: updateSession
  });

  //--------------------------------------------------
  //
  //--------------------------------------------------

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
    me.chart.setData(me.data);
    me.chart.drawChart();

    //how to init the session with something based on the state?
    //setting the session directly doesn't work
    setTimeout(function() {
      me.updateSession()
    }, 100);
  }


  function attached() {
    this.chart = new PieChart();
    this.chart.createElements(this.$.svg);
  }

  function updatePieChart(){
    var me = this;

    me.chart.refreshChart();
    me.updateSession();
  }

  function updateSession() {
    var me = this;

    var values = _.map(me.data, 'value');
    me.session.value = values;
  }

  function onToggleCorrectAnswer(event, show) {
    var me = this;

    if (show) {
      me.data = me.state.config.correctResponse;
      me.chart.setData(me.state.config.correctResponse)
    } else {
      me.data = me.state.config.sections;
      me.chart.setData(me.state.config.sections)
    }
    me.chart.drawChart();
  }

  //----------------------------

  function PieChart() {
    var me = this;

    me.setData = setData;
    me.createElements = createElements;
    me.drawChart = drawChart;
    me.refreshChart = refreshChart;

    //------------------------------
    //
    //------------------------------

    function setData(data){
      me.data = data;
      me.data.forEach(function(d) {
        d.value = +d.value;
      });
    }

    function createElements(holder) {
      var width = 500,
        height = 500,
        radius = Math.min(width, height) / 2;

      this.arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

      this.pie = d3.pie()
        .sort(null)
        .value(function (d) {
          return d.value;
        });

      this.svg = d3.select(holder)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    }

    function drawChart() {
      var me = this;

      var arcs = me.svg.selectAll(".arc")
        .data(me.pie(me.data))

      //update the existing paths
      arcs.select('path').style("fill", function (d) {
        return (d.data.color);
      }).attr('d', me.arc);

      //update the existing text
      arcs.select('text').attr("fill", function (d) {
        return (d.data.textColor);
      });

      me.g = arcs.enter().append("g")
        .attr("class", "arc")

      me.g.append("path")
        .attr("d", me.arc)
        .style("fill", function (d) {
          return (d.data.color);
        })
        .style("stroke", 'white')
        .style("stroke-width", '2px')

      me.g.append("text")
        .attr("transform", function (d) {
          return "translate(" + me.arc.centroid(d) + ")";
        })
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(function (d) {
          return d.data.label;
        })
        .attr('fill', function (d) {
          return d.data.textColor;
        });
    }

    function refreshChart(e) {
      var me = this;

      console.log("refreshChart", me.data);

      me.svg.selectAll(".arc path").data(me.pie(me.data))
        .attr("d", me.arc);

      me.svg.selectAll(".arc text").data(me.pie(me.data))
        .attr("transform", function (d) {
          return "translate(" + me.arc.centroid(d) + ")";
        });
    }
  }
})();