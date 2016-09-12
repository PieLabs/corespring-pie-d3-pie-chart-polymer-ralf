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

  function _onSessionChanged() {
    var me = this;
    console.log('_onSessionChanged', me.session, me.model);
    me.session.value = me.session.value || [];
    me.notifyPath('session.value', me.session.value);
    me.initialised = true;
  }

  function _onModelChanged(newValue, oldValue) {
    var me = this;

    console.log('_onModelChanged', newValue);
    me.data = newValue.config.sections;

    if(me.initialised) {
      me.chart.setData(me.data);
      me.chart.drawChart();
    }
  }

  function attached() {
    console.log('attached');
    this.chart = new PieChart('corespring-pie-d3-pie-chart-polymer-ralf');
    this.chart.createElements(this.$.svg);
  }

  function updatePieChart() {
    var me = this;

    if(me.initialised) {
      console.log('updatePieChart', arguments);
      me.chart.refreshChart();
      me.updateSession();
    }
  }

  function updateSession() {
    var me = this;

    if(me.model.config.disabled) {
      console.log('updateSession: not updating bc. pie is disabled');
    } else {
      var values = _.map(me.data, 'value');
      console.log('updateSession: updating to:', values);
      me.session.value = values;
    }
  }

  function onToggleCorrectAnswer(event, show) {
    var me = this;

    if (show) {
      me.data = me.model.config.correctResponse;
      me.chart.setData(me.model.config.correctResponse);
    } else {
      me.data = me.model.config.sections;
      me.chart.setData(me.model.config.sections);
    }
    me.chart.drawChart();
  }

  //----------------------------

  function PieChart(cssNamespace) {
    var me = this;

    me.createElements = createElements;
    me.cssClass = cssClass;
    me.cssNamespace = cssNamespace;
    me.drawChart = drawChart;
    me.refreshChart = refreshChart;
    me.setData = setData;
    me.updatePaths = updatePaths;
    me.updateTexts = updateTexts;
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
      var me = this;

      return paths
        .transition().ease(d3.easeLinear).attr('d', me.arc)
        .style("fill", function(d) {
          return (d.data.color);
        });
    }

    function updateTexts(texts) {
      var me = this;

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

      console.log('drawChart', me.data)

      var arcs = me.svg.selectAll(".arc")
        .data(me.pie(me.data))

      me.g = arcs.enter().append("g")
        .attr("class", me.cssClass("arc"))

      me.updatePaths(me.g.append("path"))
        .style("stroke", 'white')
        .style("stroke-width", '2px')

      me.updateTexts(me.g.append("text"))
        .attr("dy", ".35em")
        .style("text-anchor", "middle");

      me.updateTexts(arcs.select('text'));
      me.updatePaths(arcs.select('path'));
    }

    function refreshChart(e) {
      var me = this;

      console.log("refreshChart", me.data);

      var arcs = me.svg.selectAll(".arc")
        .data(me.pie(me.data))

      me.updateTexts(arcs.select('text'));
      me.updatePaths(arcs.select('path'));
    }

    function cssClass() {
      var arr = Array.prototype.slice.call(arguments);
      arr.push(this.cssNamespace);
      return arr.join(' ');
    }
  }


})();