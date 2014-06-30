/** @author Barry Becker  */
dc.waterfallChart = function(parent, chartGroup) {
    var MIN_BAR_WIDTH = 1;
    var DEFAULT_GAP_BETWEEN_BARS = 2;
    var BENCHMARK = "benchmark";
    var DIFFERENTIAL = "differential";

    var _chart = dc.coordinateGridChart({});

    var _numberOfBars;
    var _gap = DEFAULT_GAP_BETWEEN_BARS;
    var _centerBar = false;
    var _measures = [];
    var _waterfallData = {};
    var _filter;
    /** position where the next differential bar should start */
    var _lastY = [];

    _chart.xAxis(d3.svg.axis().tickSize(0, 0));

    _chart.render = function() {
        if (_measures.length == 0)
            throw new dc.errors.InvalidStateException("Mandatory measures attribute is missing on waterfall  chart["
                + _chart.anchor() + "]");

        updateWaterfallData();

        var result = _chart.doRender();
        _chart.invokeRenderlet(_chart);
        return result;
    };

    _chart.benchmarkMeasure = function(accessor) {
        _measures.push({accessor:accessor, type:BENCHMARK});
        return _chart;
    };

    _chart.differentialMeasure = function(accessor) {
        _measures.push({accessor:accessor, type:DIFFERENTIAL});
        return _chart;
    };

    _chart.plotData = function() {
        generateBars();
    };

    _chart.filter = function(_) {
        if (!arguments.length) return _filter;

        if (_) {
            _filter = _;
            _chart.dimension().filter(_);
            _chart.turnOnControls();
        } else {
            _filter = null;
            _chart.turnOffControls();
        }
        return _chart;
    };

    function generateBars() {
        var bars = _chart.g().selectAll("rect." + dc.constants.STACK_CLASS).data(_waterfallData);

        addNewBars(bars);
        updateBars(bars);
        deleteBars(bars);
    }

    function updateWaterfallData() {

        _waterfallData = [];
        var rowValue = _chart.group().value();

        _measures.forEach(function(measure) {
            _waterfallData.push(measure.accessor(rowValue));
        });
    }

    function addNewBars(bars) {

        bars.enter()
            .append("rect")
                .attr("class", "bar " + dc.constants.STACK_CLASS)
                .attr("x", function(data, dataIndex) {
                    return barX(this, data, dataIndex);
                })
                .attr("y", _chart.xAxisY())
                .attr("width", barWidth);

        if (_chart.isOrdinal()) {
            bars.on("click", _chart.onClick);
        }
        if (_chart.renderTitle()) {
            bars.append("title").text(_chart.title());
        }

        dc.transition(bars, _chart.transitionDuration())
            .attr("y", function(data, dataIndex) {
                return barY(data, dataIndex);
            })
            .attr("height", function(data, dataIndex) {
                return barHeight(data);
            });
    }

    function updateBars(bars) {
        if (_chart.renderTitle()) {
            bars.select("title").text(_chart.title());
        }

        dc.transition(bars, _chart.transitionDuration())
            .attr("x", function(data, dataIndex) {
                return barX(this, data, dataIndex);
            })
            .attr("y", function(data, dataIndex) {
                return barY(data, dataIndex);
            })
            .attr("height", function(data, dataIndex) {
                return barHeight(data);
            });
    }

    function deleteBars(bars) {
        dc.transition(bars.exit(), _chart.transitionDuration())
            .attr("y", _chart.xAxisY())
            .attr("height", 0);
    }

    function getNumberOfBars() {
        if (_numberOfBars == null)
            _numberOfBars = _chart.xUnitCount();
        return _numberOfBars;
    }

    function barWidth() {
        var numberOfBars = getNumberOfBars();
        var w = MIN_BAR_WIDTH;
        if (_chart.isOrdinal())
            w = Math.floor(_chart.xAxisLength() / (numberOfBars + 1));
        else
            w = Math.floor(_chart.xAxisLength() / numberOfBars);
        w -= _gap;
        if (isNaN(w) || w < MIN_BAR_WIDTH)
            w = MIN_BAR_WIDTH;
        return w;
    }

    function barX(bar, data, dataIndex) {
        var position = _chart.x()(_chart.x().domain()[dataIndex]) + _chart.margins().left;
        if (_centerBar)
            position = position - barWidth() / 2;
        return position;
    }

    function barY(d, dataIndex) {
        var isDifferential = (_measures[dataIndex].type == DIFFERENTIAL);
        var chartHt = _chart.height();
        var barHt = barHeight(d);
        var y = (isDifferential) ?
                _lastY[dataIndex-1] :
                (chartHt - barHt);
        if (isNaN(y)) {
            y = 0;
        }
        _lastY[dataIndex] = isDifferential ? (_lastY[dataIndex-1] + barHt) : y;
        return y - _chart.margins().bottom;
    }

    function barHeight(d) {
        var chartHt = _chart.height() - _chart.margins().bottom - _chart.margins().top;
        var ht = chartHt - _chart.y()(d);
        if (isNaN(ht)) {
            ht = 0;
        }
        return ht;
    }

    _chart.yAxisMin = function() {
        return d3.min([0].concat(_waterfallData));
    };

    /** should proly be max of benchmarks only */
    _chart.yAxisMax = function() {
        return d3.max(_waterfallData);
    };

    _chart.centerBar = function(_) {
        if (!arguments.length) return _centerBar;
        _centerBar = _;
        return _chart;
    };

    _chart.gap = function(_) {
        if (!arguments.length) return _gap;
        _gap = _;
        return _chart;
    };

    _chart.renderXAxis = function(g) {
        var axisXG = g.selectAll("g.x");

        if (axisXG.empty())
            axisXG = g.append("g")
                .attr("class", "axis x")
                .attr("transform", "translate(" + _chart.margins().left + "," + _chart.xAxisY() + ")");

        dc.transition(axisXG, _chart.transitionDuration())
            .call(_chart.xAxis())
            .selectAll("text")
            .attr("dy", ".35em")
            .attr("transform", "rotate(90, 12, 8)")
            .style("text-anchor", "end");
    };

    dc.override(_chart, "prepareOrdinalXAxis", function(_super) {
        return _super(_chart.xUnitCount() + 1);
    });

    dc.override(_chart, "doRedraw", function(_super) {
        updateWaterfallData();
        return _super();
    });


    return _chart.anchor(parent, chartGroup);
};