var currentInfo = null,
    globalInfo = null,
    vizContainer = null,
    drop_stake = null,
    drop_gender = null,
    drop_race = null,
    drop_income = null,
    drop_age = null,
    dropdown = null,
    viz = null,
    w = null,
    width = 0,
    height = 0,
    centerX = 0,
    centerY = 0,
    arc = null,
    meter = null,
    meter_foreground = null,
    meter_text = null,
    meter_progress = 0,
    twoPi = 2 * Math.PI,
    formatPercent = d3.format('.0%'),
    meter_rate = 0.001,
    testData = [
        {
            name: 'jerry',
            age: 54,
            quote: 'I like bananas!'
        },
        {
            name: 'bob',
            age: 24,
            quote: 'Where are the pandas?'
        },
        {
            name: 'steph',
            age: 18,
            quote: 'Put a ring on it.'
        },
        {
            name: 'rachel',
            age: 86,
            quote: 'I am really old.'
        }
    ];

$(function() {

    //create selector vars
    currentInfo = $('.currentInfo');
    globalInfo = $('.globalInfo');
    vizContainer = $('.vizContainer');
    drop_stake = $('#drop_stake');
    drop_gender = $('#drop_gender');
    drop_race = $('#drop_race');
    drop_income = $('#drop_income');
    drop_age = $('#drop_age');
    dropdown = $('.wrapper-dropdown');
    w = $(window);

    //dropdown click events
    dropdown.bind('click',function()  {
        var makeActive = true;

        if($(this).is('.active')) {
            makeActive = false;
        }
        //remove from all of them
        dropdown.removeClass('active');

        //bring it up if it was off
        if(makeActive) {
            $(this).toggleClass('active');
        }
        
    });

    //click off dropdown
    vizContainer.click(function() {
        dropdown.removeClass('active');
    });

    //help button
    $('.helpButton').bind('click', function() {
        $('.helpArea').fadeIn();
    });
    $('.helpArea').bind('click', function() {
        $('.helpArea').fadeOut();
    });

    //resize bind
    $(w).bind('resize', resize);

    //begin
    init();
});

function resize() {
    width = w.width();
    height = w.height();
    centerX = Math.floor(width / 2);
    centerY = Math.floor(height / 2);
    
    //reset size of svg area
    viz.attr('width', width).attr('height', height);
}

function createPreloader() {
    arc = d3.svg.arc()
        .startAngle(0)
        .innerRadius(32)
        .outerRadius(48);

    meter = viz.append('g')
                .attr('class', 'progress-meter')
                .attr('transform', function() {
                    var trans = 'translate(' + centerX + ', ' + centerY + ')';
                    return trans;
                });

    meter.append('path')
        .attr('class', 'meter-background')
        .attr('d', arc.endAngle(twoPi));

    meter_foreground = meter.append('path')
        .attr('class', 'meter-foreground');

    meter_text = meter.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em');

    incrementProgress();
}

//progress
function incrementProgress() {
    meter_progress += meter_rate;
    if(meter_progress >= 1) {
        meter_progress = 1;
        meter
        .transition()
        .duration(1000)
        .style("opacity",0)
        .each("end",function() {
            d3.select(this).remove();
            $('.el_grupo').fadeIn();
        });
    }
    else {
        setTimeout(incrementProgress, 17);
    }
    d3.transition().tween('progress', function() {
        return function() {
            meter_foreground.attr('d', arc.endAngle(twoPi * meter_progress));
            meter_text.text(formatPercent(meter_progress));
            };
    });
}

function init() {
    //setup d3
    viz = d3.select('.vizContainer').append('svg');
    
    resize();

    createPreloader();
    
    setTimeout(function() {
        meter_rate = 0.02;
        grupo = viz.append('g')
                .attr('class', 'el_grupo')
                .selectAll('circle')
                .data(testData)
                .enter()
                .append('circle')
                    .attr('fill', 'rgba(200,200,200,.5)')
                    .attr('stroke', 'rgba(0,0,0,.7)')
                    .attr('stroke-width', 4)
                    .attr('cx', function(d,i) {
                        return i * 200 + 100;
                    })
                    .attr('cy', centerY)
                    .attr('r', function(d) {
                        return d.age;
                    })
                    .on('mouseover', showText)
                    .on('mouseout', hideText);
    },200);
    
}

function showText(d) {
    var x = d3.event.offsetX,
        y = d3.event.offsetY;

    $('.displayInfo').css({
        top: y - 100,
        left: x - 120
    })
    .text(d.quote).show();
}
function hideText(d) {
    $('.displayInfo').hide();
}
