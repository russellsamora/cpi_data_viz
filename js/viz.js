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
    force = null,
    foci = 1,
    currentFilters = [],
    challengeData = null,
    maxLikes = 0,
    maxComments = 0,
    maxPopular = 0,
    radiusScale = null,
    minRadius = 8;

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

    /***** EVENTS ******/
    
    //dropdown show / hid
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
        selectFilter(this);
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
    $(window).bind('resize', resize);

    //begin
    init();
    
});

function resize() {
    width = $(window).width();
    height = $(window).height();
    centerX = Math.floor(width / 2);
    centerY = Math.floor(height / 2) + 60;
    $('.allComments').css('max-height', height - 300);
    viz.attr('width', width-1).attr('height', height-4);
    wrapper.css('height', height-1);
    /*****TO DO: ** should reset scale here and then update circles *****/
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
        .style('opacity',0)
        .each('end',function() {
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
    
    meter_rate = 0.02;
    d3.csv('../data/output.csv',function(csv) {
        // var data = d3.nest()
        //             .key(function(d) {
        //                 return d.Race;
        //             })
        //             .entries(csv);

        bigData = csv;
        
        refineData();
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
    
}

function refineData() {
    //go thru each user and refine stuff (ie. change birth year to age group)
    bigData.forEach(function(o,i) {
        o.focus = 1;

        //tolowercase for bad data....
        var lower = o.gender.toLowerCase();
        o.gender = lower;

        //check if there IS a birth year
        if(o.age.length > 0) {
            var age = 2013 - o.age;
            if(age < 18) {
                o.age = 1;
            }
            else if(age < 35) {
                o.age = 2;
            }
            else if(age < 50) {
                o.age = 3;
            }
            else if(age < 65) {
                o.age = 4;
            }
            else {
                o.age = 5;
            }
        }
        else {
            //unspecified
            o.age = 6;
        }
    });


    maxLikes = d3.max(bigData, function(d,i) {
        var num = parseInt(d.likes, 10);
        return num;

    });
    maxComments = d3.max(bigData, function(d,i) {
        var num = parseInt(d.comments, 10);
        return num;
    });
    maxPopular = d3.max(bigData, function(d,i) {
        var num = parseInt(d.comments, 10) + parseInt(d.likes, 10);
        return num;
    });

    // console.log(maxPopular, maxLikes, maxComments);
    setScales();

    challengeData = bigData;

}
function setupForce() {
    force = d3.layout.force()
                .nodes(challengeData)
                .size([width,height])
                .charge(function(d){
                    // var sz = radiusScale((d.comments + d.likes));
                    var sz = radiusScale(d.likes);
                    return -Math.pow(sz, 2.0) / 4.0;
                })
                .friction([0.9])
                .gravity([-0.01])
                .on('tick', function(e) {
                    nodes.each(moveToCenter(e.alpha))
                        .attr('cx', function(d) { return d.x; })
                        .attr('cy', function(d) { return d.y; });
                });

               nodes = viz.selectAll('circle')
                        .data(challengeData)
                        .enter()
                        .append('circle')
                        .attr('r', function(d) {
                            var sz = radiusScale(d.likes);
                            return sz;
                            // return radiusScale((d.comments + d.likes));
                        })
                        .style('fill', function(d) {
                            
                            var s = colorScale(parseInt(d.comparative,10));
                            //console.log(d.comparative,s);
                            return colorScale(d.comparative);
                        })
                        // .style('stroke', function(d) {
                        //     var col = d3.rgb(colorScale(d.comparative));
                        //     return col.darker();
                        // })
                        .classed('defaultCircle',true)
                        .call(force.drag)
                        .on('click', showText);

                viz.selectAll("text")
                    .data(challengeData)
                    .enter()
                    .append("text")
                    .text(function(d) {
                        return d.comments;
                   })
                   .attr("font-family", "sans-serif")
                   .attr("font-size", "11px")
                   .attr("fill", "white");
            // force.on('tick', function() {
            //     nodes.attr('cx', function(d) { return d.x; })
            //         .attr('cy', function(d) { return d.y; });
            // });
    start();
}

function moveToCenter(alph) {
    
    return function(d) {
        var targetX = Math.floor((d.focus / (foci+1)) * width);
        d.x = d.x + (targetX - d.x) * (0.12) * alph;
        d.y = d.y + (centerY - d.y) * (0.12) * alph;
    };
}

function showText(d) {
    $('.displayInfo .mainResponse').text(d.response);
    $('.displayInfo').show();
}
function hideText(d) {
    $('.displayInfo').hide();
}

function start() {
    
    //nodes = node.data(force.nodes(), function(d) { return d.id;});
    //nodes.enter().append('circle').attr('class', function(d) { return 'node ' + d.id; }).attr('r', 8);
    //node.exit().remove();

    force.start();
}

function updateData() {
    //extract value from filter list
    currentFilters = [];
    $('.filterList p').each(function(i){
        var text = $(this).text(),
            len = text.length,
            sub = text.substring(1,len-1).toLowerCase(),
            padre = $(this).attr('data-padre'),
            el = $('.wrapper-dropdown').get(padre),
            child = $(el).children()[0],
            catName = $(child).text().toLowerCase();

            tempFilter = {
                category: catName,
                name: sub
            };
            currentFilters.push(tempFilter);
    });

    if(currentFilters.length > 0) {
        foci = 2;
        challengeData.forEach(function(o,i) {
            o.focus = 1;
            for(var a = 0; a < currentFilters.length; a++) {
                if(o[currentFilters[a].category] !== currentFilters[a].name) {
                    o.focus = 2;
                    continue;
                }
            }
        });
    }
    else {
        foci = 1;
        challengeData.forEach(function(o,i) {
            o.focus = 1;
        });
    }

    updateNodes();
    force.resume();
}

function updateNodes(compare) {
    nodes.classed('backgroundCircle', function(d) {
        if(compare) {
            return false;
        }
        else {
            if(d.focus === 2) {
                return true;
            }
            else {
                return false;
            }    
        }
        
    });
    
}

function setScales() {
    //scale down the size of the circles based on the screen dimensions and max # comments
    var max = Math.floor(height * 0.04),
        maxRadius =  max > (minRadius * 2) ? max : (minRadius * 2);

    radiusScale = d3.scale.linear().domain([0,maxLikes]).range([minRadius,maxRadius]);
    //radiusScale = d3.scale.linear().domain([0,maxPopular]).range([minRadius,maxRadius]);
    //PiYG
    // colorScale = d3.scale.ordinal().domain([0,maxLikes]).range(colorbrewer.GnBu[7]);
    colorScale = d3.scale.quantize().domain([-2,2]).range(colorbrewer.GnBu[7]);
    
}

function compareAll(sibs, categoryName) {
        var filterValues = [];
        sibs.each(function() {
            var txtVal = $(this).text().toLowerCase();
            filterValues.push(txtVal);
        });

        challengeData.forEach(function(o,i) {
            for(var a = 0; a < filterValues.length; a++) {
                ///console.log(o[categoryName], filterValues[a]);
                if(o[categoryName] === filterValues[a]) {
                    o.focus = (a + 1);
                    continue;
                }
            }
        });
        updateNodes(true);
        force.resume();
}

function removeAllFilters() {
    console.log('removin');
    dropdown.children().removeClass('activeFilter');
    $('.filterList p').remove();
}

function selectFilter(selection) {
    var padre = $(selection).parentsUntil('.filters'),
            curDrop = $(padre[2]).children(),
            index = $(padre[2]).index('.wrapper-dropdown'),
            text = '{' + $(selection).text() + '}',
            html = '<p data-padre=' + index +'>' + text + '</p>',
            catName = $(curDrop[0]).text().toLowerCase(),
            compare = false;

        //check if the filter exists from that category already, if so, replace
        var found = false;
        
        //if (compare all), remove all filters
        if($(selection).text() === 'Compare All') {
            compare = true;
            removeAllFilters();
            var par = $(selection).parent(),
                sibs = par.siblings(),
                numSibs = sibs.length;

            foci = numSibs;
            compareAll(sibs, catName);
        }

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
                updateData();
            });
        }

        if(!compare) {
            updateData();
        }
}
