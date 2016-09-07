(function CorespringPieD3PieChartPolymerRalf() {

  return Polymer({
    is: 'corespring-pie-d3-pie-chart-polymer-ralf',
    properties: {
      model: {
        type: Object,
        observer: '_onModelChanged'
      },
      session: {
        type: Object,
        observer: '_onSessionChanged'
      }
    },
    _onModelChanged: _onModelChanged,
    _onSessionChanged: _onSessionChanged,
    attached: attached,
    onToggleCorrectAnswer: onToggleCorrectAnswer,
    updatePieChart: updatePieChart,
    updateSession: updateSession
  });

  //--------------------------------------------------
  //
  //--------------------------------------------------

  function _onModelChanged(newValue, oldValue) {
    console.log('_onModelChanged', arguments, this.model);
  }

  function _onSessionChanged() {
    var me = this;
    console.log('_onSessionChanged', me.session, me.model);
    me.session.value = me.session.value || [];
    me.notifyPath('session.value', me.session.value);
  }

  function _onModelChanged(newValue, oldValue) {
    var me = this;

    console.log('_onModelChanged', newValue);
    me.data = newValue.config.sections;
    me.chart.setData(me.data);
    me.chart.drawChart();

    //how to init the session with something based on the state?
    //setting the session directly doesn't work
    setTimeout(function() {
      me.updateSession()
    }, 100);
  }


  function attached() {
    this.chart = new PieChart('corespring-pie-d3-pie-chart-polymer-ralf');
    this.chart.createElements(this.$.svg);
  }

  function updatePieChart() {
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
      me.data = me.model.config.correctResponse;
      me.chart.setData(me.model.config.correctResponse)
    } else {
      me.data = me.model.config.sections;
      me.chart.setData(me.model.config.sections)
    }
    me.chart.drawChart();
  }

  //----------------------------

  function PieChart(cssNamespace) {
    var me = this;

    me.createElements = createElements;
    me.cssNamespace = cssNamespace;
    me.drawChart = drawChart;
    me.refreshChart = refreshChart;
    me.setData = setData;
    me.cssClass = cssClass;

    //------------------------------
    //
    //------------------------------

    function setData(data) {
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
        .value(function(d) {
          return d.value;
        });

      this.svg = d3.select(holder)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    }

    function updatePaths(paths) {
      return paths
        .style("fill", function(d) {
          return (d.data.color);
        })
        .transition().attr('d', me.arc);
    }

    function updateTexts(texts) {
      return texts
        .text(function(d) {
          return d.data.label;
        })
        .attr("class", function(d) {
          return me.cssClass(d.data.textClass);
        })
        .transition().attr("transform", function(d) {
          return "translate(" + me.arc.centroid(d) + ")";
        });
    }

    function drawChart() {
      var me = this;

      var arcs = me.svg.selectAll(".arc")
        .data(me.pie(me.data))

      me.g = arcs.enter().append("g")
        .attr("class", me.cssClass("arc"))

      me.g.append("path")
        .style("stroke", 'white')
        .style("stroke-width", '2px')

      me.g.append("text")
        .attr("dy", ".35em")
        .style("text-anchor", "middle");

      updateTexts(arcs.select('text'));
      updatePaths(arcs.select('path'));
    }

    function refreshChart(e) {
      var me = this;

      console.log("refreshChart", me.data);

      var arcs = me.svg.selectAll(".arc")
        .data(me.pie(me.data))

      updateTexts(arcs.select('text'));
      updatePaths(arcs.select('path'));
    }

    function cssClass() {
      var arr = Array.prototype.slice.call(arguments);
      arr.push(this.cssNamespace);
      return arr.join(' ');
    }
  }


})();