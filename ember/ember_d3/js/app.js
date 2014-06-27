App = Ember.Application.create();

/** Class: App.ChartView
 * Provides an Ember View containing a simple line chart.
 * Use contentBinding to bind it to an ArrayControllers content.
 */
App.ChartView = Ember.View.extend({
    chart: {}
    ,line: {}
    ,area: {}
    
    /** Method: updateChart()
     * Listens for changes in the content and updates the line chart
     * dynamically with a fancy animation.
     *
     * Observes:
     *  - content.@each.value
     */
    ,updateChart: function updateChart() {
        var content = this.get('content');
        var chart = this.get('chart');
        var line = this.get('line');
        var area = this.get('area');
        
        chart.selectAll('path.line')
            .data(content)
            .transition()
            .duration(500)
            .ease('sin')
            .attr('d', line(content));
        chart.selectAll('path.area')
            .data(content)
            .transition()
            .duration(500)
            .ease('sin')
            .attr('d', area(content));
    }.observes('content.@each.value')

    /** Method: didInsertElement()
     * Creates a D3 SVG line chart with an X and Y axis.
     */
    ,didInsertElement: function didInsertElement() {
        var elementId = this.get('elementId');
        var content = this.get('content');

        var margin = { top: 35, right: 35, bottom: 35, left: 35};
        var w = 500 - margin.right - margin.left;
        var h = 300 - margin.top - margin.top;

        var x = d3.scale.linear()
            .range([0,w])
            .domain([1,content.length]);
        var y = d3.scale.linear()
            .range([h,0])
            .domain([0,100]);    
        var xAxis = d3.svg.axis()
            .scale(x)
            .ticks(10)
            .tickSize(-h)
            .tickSubdivide(true);
        var yAxis = d3.svg.axis()
            .scale(y)
            .ticks(4)
            .tickSize(-w)
            .orient('left');

        // Prepeare Chart Elements:
        var line = d3.svg.line()
            .interpolate('monotone')
            .x(function(d) { return x(d.get('timestamp'))})
            .y(function(d) { return y(d.get('value'))});
        this.set('line',line);
        
        var area = d3.svg.area()
            .interpolate('monotone')
            .x(function(d) { return x(d.get('timestamp')); })
            .y0(h)
            .y1(function(d) { return y(d.get('value')); });
        this.set('area',area);
                             
        var chart = d3.select('#'+elementId).append('svg:svg')
            .attr('id','chart')
            .attr('width', w+margin.left+margin.right)
            .attr('height', w+margin.top+margin.bottom)
            .append('svg:g')
            .attr('transform', 'translate('+margin.left+','+margin.top+')');

        // Add Chart Elements to Chart:
        chart.append('svg:g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + h + ')')
            .call(xAxis);
        
        chart.append('svg:g')
            .attr('class', 'y axis')
            .call(yAxis);
                             
        chart.append('svg:clipPath')
            .attr('id', 'clip')
            .append('svg:rect')
            .attr('width', w)
            .attr('height', h);

        chart.append('svg:path')
            .attr('class', 'area')
            .attr('clip-path', 'url(#clip)')
            .attr('d', area(content));

        chart.append('svg:path')
            .attr('class', 'line')
            .attr('clip-path', 'url(#clip)')
            .attr('d', line(content));
        this.set('chart',chart);
    }
});

/** Controller: App.chartValuesController
 * An ArrayController with randomly generated values for the App.ChartView.
 */
App.chartValuesController = Ember.ArrayController.create({
    content: []
    
    ,init: function init() {
        this.replaceWithRandom();
    }
    
    /** Method: replaceWithRandom
     * Replaces the content of this ArrayController with randomly generated values.
     * Each object in the content array will have following structure:
     *
     *     { timestamp: [int], value: [int] }
     */
    ,replaceWithRandom: function replaceWithRandom() {
        var newContent = [];
        var max = 100;
        
        for(var i = 0, l = 100; i < l; i++) {
            var item = Ember.Object.create({
                timestamp: i
                ,value: max/2+Math.sin(i)*Math.ceil((max/2.5)*Math.random())
            });
            
            newContent[i] = item;
        }
        
        this.set('content', newContent);
    }
});

/** Class: App.ApplictaionView
 * A simple root level application view which uses the "application" handlebar
 * template for rendering.
 */
App.ApplicationView = Ember.View.extend({
    templateName: 'application'
    ,chartValuesBinding: 'App.chartValuesController.content'
    
    /** Event Handler: generateNewChartValues(event)
     * Handles the generateNewChartValues action and triggers a regeneration of
     * the App.chartValuesController contained random chart values.
     */
    ,generateNewChartValues: function(event) {
        App.chartValuesController.replaceWithRandom();
    }
});
App.ApplicationController = Ember.Controller.extend();

App.Router = Ember.Router.extend({
    root: Ember.Route.extend({
        index: Ember.Route.extend({
            route: '/'
        })
    })
});

App.initialize();