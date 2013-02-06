var currentInfo = null,
    challengeInfo = null,
    vizContainer = null,
    drop_stake = null,
    drop_gender = null,
    drop_race = null,
    drop_income = null,
    drop_age = null,
    dropdown = null,
    viz = null,
    w = null,
    wrapper = null,
    userMessage = null,
    messageTimeout = null,
    filterList = null,
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
    topBar = 112;

$(function() {

    //create selector vars
    currentInfo = $('.currentInfo');
    challengeInfo = $('.challengeInfo');
    vizContainer = $('.vizContainer');
    drop_stake = $('#drop_stake');
    drop_gender = $('#drop_gender');
    drop_race = $('#drop_race');
    drop_income = $('#drop_income');
    drop_age = $('#drop_age');
    dropdown = $('.wrapper-dropdown');
    wrapper = $('.wrapper');
    userMessage = $('.userMessage');
    filterList = $('.filterList');
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
        if($('.challengeInfo').is('.challengeDropdown')) {
            $('.downButton').toggleClass('rotateNinety');
            $('.challengeInfo').toggleClass('challengeDropdown');
            $('.challengeInfo ul').fadeToggle(100);
        }
    });

    //help button
    $('.helpButton').bind('click', function() {
        $('.helpArea').fadeIn();
    });
    $('.helpArea').bind('click', function() {
        $('.helpArea').fadeOut();
    });

    //slide the challenge window
    $('.challengeLink').bind('click', function() {
        clearTimeout(messageTimeout);
        userMessage.fadeOut();
        $('.downButton').toggleClass('rotateNinety');
        $('.challengeInfo').toggleClass('challengeDropdown');
        $('.challengeInfo ul').fadeToggle(100);
    });

    //filter click
    $('.dropdown li a').bind('click', function(e) {
        e.preventDefault();
        var padre = $(this).parentsUntil('.filters'),
            curDrop = $(padre[2]).children(),
            index = $(padre[2]).index('.wrapper-dropdown'),
            txt = '<p data-padre=' + index +'>{' + $(this).text() + '}</p>';

        $(curDrop[0]).addClass('activeFilter');

        filterList.append(txt);

        //delete filter on click
        $('.filterList p').bind('click', function() {
            //change color of dropdown menu
            var index = $(this).attr('data-padre'),
                el = $('.wrapper-dropdown').get(index);
            $(el).children().removeClass('activeFilter');

            //remove from filter list
            $(this).remove();
        });
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
    viz.attr('width', width-1).attr('height', height-1);
    wrapper.css('height', height);
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
            userMessage.fadeIn(200, function() {
                messageTimeout = setTimeout(function() {
                    userMessage.fadeOut(200);
                }, 5000);
            });
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
    
    //temp thing until we get real data
    setTimeout(function() {
        meter_rate = 0.02;
        d3.csv('../data/test.csv',function(csv) {
            var data = d3.nest()
                        .key(function(d) {
                            return d.Race;
                        })
                        .entries(csv);
        })
        .on('progress', function(event){
        //update progress bar
            if (event.lengthComputable) {
                var percentComplete = Math.round(event.loaded * 100 / event.total);
                console.log(percentComplete);
            }
        })
        .on('error', function() {
            console.log('error loading data');
        });
        
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
