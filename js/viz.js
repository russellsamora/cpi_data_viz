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
    topBar = 112,
    bigData = null,
    showingComments = false,
    nodes = null,
    force = null;

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

    //close response box
    $('.displayInfo a').bind('click', function(e) {
        e.preventDefault();

        $('.displayInfo').fadeOut(100, function() {
            $('.allComments').hide();
            $('.viewComments').text('view comments');
            showingComments = false;
        });
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
            text = '{' + $(this).text() + '}',
            html = '<p data-padre=' + index +'>' + text + '</p>';

        //check if the filter exists from that category already, if so, replace
        var found = false;
        //go thru each filter, check it data-padre matches index
        $('.filterList p').each(function(i) {
            var old = parseInt($(this).attr('data-padre'),10);
            if(old === index) {
                $(this).text(text);
                found = true;
                return true;
            }
        });

        //add a new one if the the category is not in filters
        if(!found) {
             $(curDrop[0]).addClass('activeFilter');

            filterList.append(html);

            //delete filter on click
            $('.filterList p').bind('click', function() {
                //change color of dropdown menu
                var index = $(this).attr('data-padre'),
                    el = $('.wrapper-dropdown').get(index);
                $(el).children().removeClass('activeFilter');

                //remove from filter list
                $(this).remove();
            });
        }
    });

    //filter search
    $('.submitSearch').bind('click', function(e) {
        e.preventDefault();
        var text = '{' + $('.searchField').val() + '}',
            html = '<p data-padre=999>' + text + '</p>';

        //check if the filter exists from that category already, if so, replace
        var found = false;
        //go thru each filter, check it data-padre matches index
        $('.filterList p').each(function(i) {
            var old = parseInt($(this).attr('data-padre'),10);
            if(old === 999) {
                $(this).text(text);
                found = true;
                return true;
            }
        });

        //add a new one if the the category is not in filters
        if(!found) {
            filterList.append(html);

            //delete filter on click
            $('.filterList p').bind('click', function() {
                //remove from filter list
                $(this).remove();
            });
        }
        $('.searchField').val('');
    });

    //view more comments
    $('.viewComments').bind('click', function() {
        if(showingComments) {
            $(this).text('view comments');
            showingComments = false;
        }
        else {
            $(this).text('hide comments');
            showingComments = true;
        }
        
        $('.allComments').toggle();
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
    $('.allComments').css('max-height', height - 300);
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
                    setupForce();
                }, 500);
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
            // var data = d3.nest()
            //             .key(function(d) {
            //                 return d.Race;
            //             })
            //             .entries(csv);

            bigData = csv;
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

function setupForce() {
    force = d3.layout.force()
                .nodes(bigData)
                .size([width,height])
                .charge(function(d){
                    return -Math.pow(d.Age/2, 2.0) / 4.0;
                })
                .friction([0.9])
                .gravity([-0.01])
                .on('tick', function(e) {
                    nodes.each(moveToCenter(e.alpha))
                        .attr("cx", function(d) { return d.x; })
                        .attr("cy", function(d) { return d.y; });
                });

                nodes = viz.selectAll("circle")
                        .data(bigData)
                        .enter()
                        .append("circle")
                        .attr("r", function(d) {
                            return d.Age/2;
                        })
                        .classed('defaultCircle',true)
                        .call(force.drag)
                        .on('click', showText);

            // force.on("tick", function() {
            //     nodes.attr("cx", function(d) { return d.x; })
            //         .attr("cy", function(d) { return d.y; });
            // });
    start(); 
}

function moveToCenter(alph) {
    return function(d) {
        d.x = d.x + (centerX - d.x) * (0.12) * alph;
        d.y = d.y + (centerY - d.y) * (0.12) * alph;
    };
}

function showText(d) {
    $('.displayInfo .mainResponse').text(d.Comment);
    $('.displayInfo').show();
}
function hideText(d) {
    $('.displayInfo').hide();
}

function start() {
    
    //nodes = node.data(force.nodes(), function(d) { return d.id;});
    //nodes.enter().append("circle").attr("class", function(d) { return "node " + d.id; }).attr("r", 8);
    //node.exit().remove();

    force.start();
}