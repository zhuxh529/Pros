// copied from d3.v2 in order to make rotated labels
d3.svg.waterfallAxis = function() {
    var scale = d3.scale.linear(),
        tickMajorSize = 6,
        tickMinorSize = 6,
        tickEndSize = 6,
        tickPadding = 3,
        tickArguments_ = [ 10 ],
        tickValues = null,
        tickFormat_,
        tickSubdivide = 0,
        labelRotate;

    function axis(g) {
        g.each(function() {
            var g = d3.select(this);
            var ticks = tickValues == null ? scale.ticks ? scale.ticks.apply(scale, tickArguments_) : scale.domain() : tickValues,
                tickFormat = tickFormat_ == null ? scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments_) : String : tickFormat_;
            var subticks = d3_svg_axisSubdivide(scale, ticks, tickSubdivide),
                subtick = g.selectAll(".minor").data(subticks, String),
                subtickEnter = subtick.enter().insert("line", "g").attr("class", "tick minor").style("opacity", 1e-6),
                subtickExit = d3.transition(subtick.exit()).style("opacity", 1e-6).remove(),
                subtickUpdate = d3.transition(subtick).style("opacity", 1);
            var tick = g.selectAll("g").data(ticks, String),
                tickEnter = tick.enter().insert("g", "path").style("opacity", 1e-6),
                tickExit = d3.transition(tick.exit()).style("opacity", 1e-6).remove(),
                tickUpdate = d3.transition(tick).style("opacity", 1),
                tickTransform;
            var range = d3_scaleRange(scale), path = g.selectAll(".domain").data([ 0 ]),
                pathEnter = path.enter().append("path").attr("class", "domain"), pathUpdate = d3.transition(path);
            var scale1 = scale.copy(),
                scale0 = this.__chart__ || scale1;
            this.__chart__ = scale1;
            tickEnter.append("line").attr("class", "tick");
            tickEnter.append("text");
            var lineEnter = tickEnter.select("line"),
                lineUpdate = tickUpdate.select("line"),
                text = tick.select("text").text(tickFormat),
                textEnter = tickEnter.select("text"),
                textUpdate = tickUpdate.select("text");

            tickTransform = d3_svg_axisX;
            subtickEnter.attr("y2", tickMinorSize);
            subtickUpdate.attr("x2", 0).attr("y2", tickMinorSize);
            lineEnter.attr("y2", tickMajorSize);
            textEnter.attr("y", Math.max(tickMajorSize) + tickPadding);
            lineUpdate.attr("x2", 0).attr("y2", tickMajorSize);
            textUpdate.attr("x", 10).attr("y", Math.max(tickMajorSize, 0) + tickPadding);
            text.attr("dy", ".71em").attr("text-anchor", "center").attr("transform", "rotate("+labelRotate+")");
            pathUpdate.attr("d", "M" + range[0] + "," + tickEndSize + "V0H" + range[1] + "V" + tickEndSize);

            if (scale.ticks) {
                tickEnter.call(tickTransform, scale0);
                tickUpdate.call(tickTransform, scale1);
                tickExit.call(tickTransform, scale1);
                subtickEnter.call(tickTransform, scale0);
                subtickUpdate.call(tickTransform, scale1);
                subtickExit.call(tickTransform, scale1);
            } else {
                var dx = scale1.rangeBand() / 2, x = function(d) {
                    return scale1(d) + dx;
                };
                tickEnter.call(tickTransform, x);
                tickUpdate.call(tickTransform, x);
            }
        });
    }
    axis.scale = function(x) {
        if (!arguments.length) return scale;
        scale = x;
        return axis;
    };
    axis.orient = function(x) {
        if (!arguments.length) return orient;
        orient = x;
        return axis;
    };
    axis.labelRotation = function(x) {
        if (!arguments.length) return labelRotate;
        labelRotate = x;
        return axis;
    }
    axis.ticks = function() {
        if (!arguments.length) return tickArguments_;
        tickArguments_ = arguments;
        return axis;
    };
    axis.tickValues = function(x) {
        if (!arguments.length) return tickValues;
        tickValues = x;
        return axis;
    };
    axis.tickFormat = function(x) {
        if (!arguments.length) return tickFormat_;
        tickFormat_ = x;
        return axis;
    };
    axis.tickSize = function(x, y, z) {
        if (!arguments.length) return tickMajorSize;
        var n = arguments.length - 1;
        tickMajorSize = +x;
        tickMinorSize = n > 1 ? +y : tickMajorSize;
        tickEndSize = n > 0 ? +arguments[n] : tickMajorSize;
        return axis;
    };
    axis.tickPadding = function(x) {
        if (!arguments.length) return tickPadding;
        tickPadding = +x;
        return axis;
    };
    axis.tickSubdivide = function(x) {
        if (!arguments.length) return tickSubdivide;
        tickSubdivide = +x;
        return axis;
    };
    return axis;
};
function d3_svg_axisX(selection, x) {
    selection.attr("transform", function(d) {
        return "translate(" + x(d) + ",0)";
    });
}
function d3_svg_axisY(selection, y) {
    selection.attr("transform", function(d) {
        return "translate(0," + y(d) + ")";
    });
}
function d3_svg_axisSubdivide(scale, ticks, m) {
    subticks = [];
    if (m && ticks.length > 1) {
        var extent = d3_scaleExtent(scale.domain()), subticks, i = -1, n = ticks.length, d = (ticks[1] - ticks[0]) / ++m, j, v;
        while (++i < n) {
            for (j = m; --j > 0; ) {
                if ((v = +ticks[i] - j * d) >= extent[0]) {
                    subticks.push(v);
                }
            }
        }
        for (--i, j = 0; ++j < m && (v = +ticks[i] + j * d) < extent[1]; ) {
            subticks.push(v);
        }
    }
    return subticks;
}
function d3_scaleExtent(domain) {
    var start = domain[0], stop = domain[domain.length - 1];
    return start < stop ? [ start, stop ] : [ stop, start ];
}
function d3_scaleRange(scale) {
    return scale.rangeExtent ? scale.rangeExtent() : d3_scaleExtent(scale.range());
}