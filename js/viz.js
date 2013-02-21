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
    topBar = 112,
    bigData = null,
    nestedData = null,
    showingComments = false,
    nodesData = [],
    nodesEl = null,
    force = null,
    foci = 1,
    currentFilters = [],
    nodesData = [],
    challengeData = [],
    maxLikes = 0,
    maxComments = 0,
    maxPopular = 0,
    radiusScale = null,
    minRadius = 8,
    maxMaxRadius = 40,
    resizeTimer = null,
    challenges = null,
    users = null,
    ready = false,
    challengeShowing = false,
    drumLine = false,
    selectedCircle = null,
    compare = false;

$(function() {

    //create selector vars
    currentInfo = $('.currentInfo');
    challengeInfo = $('.challengeInfo');
    vizContainer = $('.wrapper');
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
        if(challengeInfo.is('.challengeDropdown')) {
            $('.downButton').toggleClass('rotateNinety');
            challengeInfo.toggleClass('challengeDropdown');
            $('.challengeInfo ul').fadeToggle(100);
        }
    });
    $('.wrapper').click(function() {
        dropdown.removeClass('active');
        
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
        hideText();
    });

    //slide the challenge window
    $('.challengeLink').bind('click', function() {
        clearTimeout(messageTimeout);
        userMessage.hide();
        $('.downButton').toggleClass('rotateNinety');
        challengeInfo.toggleClass('challengeDropdown');
        $('.challengeInfo ul').fadeToggle(100);
    });

    //filter click
    $('.dropdown li a').bind('click', function(e) {
        e.preventDefault();
        if(challengeShowing && ready) {
            drumLine = false;
            selectFilter(this);
        }
    });

    //filter search
    $('.submitSearch').bind('click', function(e) {
        e.preventDefault();
        selectSearch(this);
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
    $(window).bind('resize', function() {
        resize(false);
    });

    //form shape click
    $('.formShape').bind('click', function() {
        if(currentFilters.length === 0 && !compare && challengeShowing) {
            drumLine = !drumLine;
            if(drumLine) {
                $(this).css('background-position', '-32px');
            }
            else {
                $(this).css('background-position', '0px');
            }
            force.start();
        }
    });
    //begin
    init();
});

function resize(first) {
    //get the dimensions of the browser
    width = $(window).width();
    height = $(window).height();

    //make sure our comments popup changes to stay within the bounds of the browser
    $('.allComments').css('max-height', height - 300);
    //adjust sizes of viz and wrapper
    
    viz.attr('width', width-1).attr('height', height - 118);
    wrapper.css('height', height-118);
    centerX = Math.floor(width / 2);
    centerY = Math.floor(height / 2) - 50;
    
    //if its not our first time (not on init), then we stop the motion, and do our resize timer
    if(!first && ready) {
        force.alpha(0);
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resizeEnd, 1000);
    }
}

function resizeEnd() {
    
    centerX = Math.floor(width / 2);
    centerY = Math.floor(height / 2) - 50;
    
    //reset the scales accordingly for cirlce sizes
    setScales();
    
    //change size and positions of circles
    viz.selectAll('circle')
        .attr('r', function(d,i) {
            var sz = radiusScale(d.likes_num);
            return sz;
        });
    //start up the movement again
    recharge();
    force.start();
}

function init() {
    //setup d3
    
    viz = d3.select('.wrapper').append('svg');
    nodesData = [];
    nodesEl = viz.selectAll('.node');
    resize(true);
    setupForce();
    d3.csv('/data/output219.csv',function(csv) {
        bigData = csv;
        setPropertiesFromData();
    })
    .on('error', function(e) {
        console.log('messed up: ', e);
    });
}

function refineUsers(firstUsers) {
    //go thru each user and refine stuff (ie. change age year to age group)
    firstUsers.forEach(function(o,i) {

        //tolowercase for bad data....
        var lower = o.gender.toLowerCase();
        o.gender = lower;

        //check if there IS a age year
        if(o.age.length > 0) {
            /** THIS WILL BE THE CASE WHEN ITS DATES SON **/
            var age = 2013 - parseInt(o.age,10);

            if(age < 18) {
                o.age = 'less than 18';
            }
            else if(age < 31) {
                o.age = '18-30';
            }
            else if(age < 41) {
                o.age = '31-40';
            }
            else if(age < 51) {
                o.age = '41-50';
            }
            else {
                o.age = 'over 50';
            }
        }
        else {
            //unspecified
            o.age = 'unspecified';
        }
    });
    return firstUsers;
}

function setPropertiesFromData() {
    bigData.forEach(function(o,i) {
        o.focus = 1;
        o.tokens = getTokens(o.response);
    });
    maxLikes = d3.max(bigData, function(d,i) {
        var num = parseInt(d.likes_num, 10);
        return num;

    });
    maxComments = d3.max(bigData, function(d,i) {
        var num = parseInt(d.comments_num, 10);
        return num;
    });
    maxPopular = d3.max(bigData, function(d,i) {
        var num = parseInt(d.comments_num, 10) + parseInt(d.likes_num, 10);
        return num;
    });

    nestedData = d3.nest()
        .key(function(d) {
            return d.challenge_id;
        })
        .map(bigData);

    loadUsersAndChallenges();
    setScales();
}

function loadUsersAndChallenges() {
    //load demographic user info
    d3.csv('/data/users.csv',function(csv_users) {
        //refine user data (ie. changing birth year to age range etc.)
        var refinedUsers = refineUsers(csv_users);
        users = d3.nest()
        .key(function(d) {
            return d.user_id;
        })
        .map(refinedUsers);

        //load challenge info
        d3.csv('/data/challenges.csv',function(csv_challenges) {
            challenges = csv_challenges;
            
            populateChallenges();
            //now all the data is ready, fade out the user message box
            userMessage.fadeOut(1000, function() {
                $(this).text('Select a challenge above to begin!');
                $(this).fadeIn(200, function() {
                    ready = true;
                });
            });
        });
    });
}

function populateChallenges() {
    for(var i = 0; i < challenges.length; i++) {
        var missionClass = '.mission' + challenges[i].mission_num;
        var html = '<li><a class="selectLink" data-num="' + i + '" href="">' + challenges[i].challenge_title + '</a></li>';
        $(missionClass).append(html);
    }
    //handle challenge selection
    $('.selectLink').bind('click', function(e) {
        e.preventDefault();
        if(ready) {
            var num = $(this).attr('data-num');
            $('.downButton').toggleClass('rotateNinety');
            challengeInfo.toggleClass('challengeDropdown');
            $('.challengeInfo ul').fadeToggle(100, function() {
                changeChallenge(num);
            });
            
        }
        
        return false;
    });
}
function setupForce() {
    force = d3.layout.force()
                .nodes(nodesData)
                .size([width,height])
                .on('tick', function(e) {
                    nodesEl.select('circle').each(moveToCenter(e.alpha))
                        .attr('cx', function(d) { return d.x; })
                        .attr('cy', function(d) { return d.y; });
                    nodesEl.attr("cx", function(d) { return d.x; })
                        .attr("cy", function(d) { return d.y; });
                    nodesEl.select('text').each(moveToCenter(e.alpha))
                        .attr('x', function(d) { return d.x; })
                        .attr('y', function(d) { return d.y; });
                    nodesEl.attr("x", function(d) { return d.x; })
                        .attr("y", function(d) { return d.y; });
                });
    recharge();
}

function moveToCenter(alph) {
    
    return function(d, i) {
        var targetX = null;
        if(drumLine) {
            targetX = (i+1) / nodesData.length * width;
        }
        else {
            targetX = Math.floor((d.focus / (foci+1)) * width);
        }
        
        d.x = d.x + (targetX - d.x) * (0.12) * alph;
        d.y = d.y + (centerY - d.y) * (0.12) * alph;
    };
}

function showText(d) {

    if(d.label) {
        deleteLabel(d);
        return;
    }
    hideText();
    selectedCircle = this;
    d3.select(this).classed('selectedCircle', true);
    $('.displayInfo .mainResponse').text(d.response);
    if(d.comments_num > 0) {
        $('.displayInfo .viewComments').show();
    }
    else {
        $('.displayInfo .viewComments').hide();
    }
    $('.displayInfo').show();
}

function hideText() {
    if(selectedCircle) {
        $('.displayInfo').hide();
        $('.allComments').hide();
        $('.viewComments').text('view comments');
        showingComments = false;
    
        d3.select(selectedCircle).classed('selectedCircle', false);
        selectedCircle = null;
    }
    
}
function deleteLabel(d) {
    if(compare) {
        $('.filterList p').each(function(i){
            $(this).remove();
            compare = false;
        });
        $('.wrapper-dropdown span').removeClass('activeFilter');
    }
    else {
        var filterName = '{' + d.name + '}';

        //remove the node
        for(var i = 0; i < nodesData.length; i++) {
            if(nodesData[i].name === d.name) {
                nodesData.splice(i,1);
                continue;
            }
        }

        //remove from currentFilters
        $('.filterList p').each(function(i){
            var text = $(this).text().toLowerCase();
            if(text === filterName) {
                var thisIndex = $(this).attr('data-padre'),
                    el = dropdown.get(thisIndex);
                
                $(el).children().removeClass('activeFilter');
                $(this).remove();

            }
        });
    }
    
    //update data
    updateData();
    //reset dropdown
    // start();
}

function start(filter) {
    //join
    nodesEl = nodesEl.data(force.nodes(), function(d) {
        return d.user_id;
    });

    //enter
    var g = nodesEl.enter().append('g')
        .classed('node', true)
        .classed('label', function(d,i) {
            if(d.label) {
                return true;
            }
            return false;
        });

    g.append('circle')
        .attr('r', function(d) {
            if(d.label) {
                //based the size on the number of letters
                return d.len;
            }
            var sz = radiusScale(d.likes_num);
            return sz;
            // return radiusScale((d.comments_num + d.likes_num));
        })
        .style('fill', function(d,i) {
            var s = colorScale(parseInt(d.comparative,10));
            //console.log(d.comparative,s);
            if(d.label === true) {
                return 'rgba(0,0,0,0)';
            }
            return colorScale(d.comparative);
        })
        .call(force.drag)
        .on('click', showText);

    g.append('text')
        .text(function(d) {
            if(d.label) {
                return d.name;
            }
            return '';
        })
        .classed('off', function(d) {
            return !d.label;
        })
        .on('click', deleteLabel)
        .on('mouseover', highlightText)
        .on('mouseout', regularText)
        .attr('dy', '.3em')
        .style('text-anchor', 'middle');


    //update
    //select all circles, update their radius and color
    d3.selectAll('.node')
        .select('circle')
        .transition(2000)
        .attr('r', function(d){
            if(d.label) {
                //based the size on the number of letters
                return d.len;
            }
            var sz = radiusScale(d.likes_num);
            return sz;
        })
         .style('fill', function(d,i) {
            var s = colorScale(parseInt(d.comparative,10));
            //console.log(d.comparative,s);
            if(d.label === true) {
                return 'rgba(0,0,0,0)';
            }
            return colorScale(d.comparative);
        });
    d3.selectAll('.label')
        .select('text')
        .text(function(d) {
            return d.name;
        });

    nodesEl.exit()
        .transition()
        .duration(500)
        .style('fill-opacity', 0)
        .remove();
    force.start();
}

function updateNodes(comparing) {
    nodesEl.classed('backgroundCircle', function(d) {
        if(comparing) {
            return false;
        }
        else {
            if(d.label) {
                return false;
            }
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
    // var max = (Math.floor(height * 0.04)) > maxMaxRadius ? maxMaxRadius : max;
    var val = Math.floor(height * 0.03);
    var max = val > maxMaxRadius ? maxMaxRadius : val;
    var maxRadius =  max > (minRadius * 2) ? max : (minRadius * 2);

    radiusScale = d3.scale.linear().domain([0,maxLikes]).range([minRadius,maxRadius]);
    //radiusScale = d3.scale.linear().domain([0,maxPopular]).range([minRadius,maxRadius]);
    //PiYG
    // colorScale = d3.scale.ordinal().domain([0,maxLikes]).range(colorbrewer.GnBu[7]);
    colorScale = d3.scale.quantize().domain([-2,2]).range(colorbrewer.GnBu[7]);
}
function updateData() {
    
    //extract value from filter list
    currentFilters = [];
    $('.filterList p').each(function(i){
        var text = $(this).attr('data-name'),
            padre = $(this).attr('data-padre'),
            tempFilter =  null;
        //keyword
        if(padre === '999') {
            tempFilter = {
                category: 'keyword',
                name: text
            };
        }
        else {
          var el = dropdown.get(padre),
                child = $(el).children()[0],
                catName = $(child).text().toLowerCase();

            tempFilter = {
                category: catName,
                name: text
            };
        }
            
        currentFilters.push(tempFilter);
        //nodesData.push({focus: 1, len: sub.length, label: true, name: sub});
    });

    updateLabels();
    if(currentFilters.length > 0) {
        foci = 2;
        
        nodesData.forEach(function(o,i) {
            if(!o.label) {
                o.focus = 1;
                for(var a = 0; a < currentFilters.length; a++) {
                    // console.log(users[o.user_id][0][currentFilters[a].category], currentFilters[a].name);
                    if(currentFilters[a].category === 'keyword') {
                        var tokenExists = false;
                        for(var t = 0; t < o.tokens.length; t++) {
                            if(o.tokens[t] === currentFilters[a].name) {
                                tokenExists = true;
                                o.focus = 1;
                                continue;
                            }
                        }
                        if(!tokenExists) {
                            o.focus = 2;
                        }
                    }
                    else {
                        if(users[o.user_id][0][currentFilters[a].category] !== currentFilters[a].name) {
                            o.focus = 2;
                            continue;
                        }
                    }
                }
            }
        });
    }
    else {
        compare = false;
        $('.formShape').css('opacity', 1);
        foci = 1;
        nodesData.forEach(function(o,i) {
            o.focus = 1;
        });
    }
    setTimeout(updateNodes,17);
    start();
}

function compareAll(sibs, categoryName) {
        var filterValues = [];
        sibs.each(function() {
            var txtVal = $(this).text().toLowerCase();
            filterValues.push(txtVal);
        });
        
        compareLabels(filterValues);

        nodesData.forEach(function(o,i) {
            if(!o.label) {
                for(var a = 0; a < filterValues.length; a++) {
                //console.log(users[o.user_id][0][categoryName], filterValues[a]);
                    if(users[o.user_id][0][categoryName] === filterValues[a]) {
                        o.focus = (a + 1);
                        continue;
                    }
                }
            }
            
        });

        updateNodes(true);
        force.start();
}

function selectSearch(selection) {
    $('.formShape').css({
        opacity: 0.3,
        'background-position': '0px'
    });
    hideText();
    var text = $('.searchField').val(),
            displayText = '{' + text + '}',
            html = '<p data-compare="0" data-padre=999 data-name="' + text + '">' + displayText + '</p>';

        //go thru each filter, check it data-padre matches index
        $('.filterList p').each(function(i) {
            var old = parseInt($(this).attr('data-padre'),10),
                isCompare = parseInt($(this).attr('data-compare'), 10);
            if(old === 999) {
                $(this).remove();
            }
            else if(isCompare === 1) {
            //if there was pre-existing compare all, remove it.
                $(this).remove();
                resetMenuColor(this);
            }
        });

        //add a new one if the the category is not in filters
        filterList.append(html);

        //delete filter on click
        $('.filterList p').bind('click', function() {
            //remove from filter list
            $(this).remove();
            updateData();
        });

        $('.searchField').val('');
        updateData();
}

//when a filter is selected, we must figure out a lot of things,
//like what were the filters before, what should they be, etc.

function selectFilter(selection) {
    hideText();
    $('.formShape').css({
        opacity: 0.3,
        'background-position': '0px'
    });
    var padre = $(selection).parentsUntil('.filters'),
        curDrop = $(padre[2]).children(),
        index = $(padre[2]).index('.wrapper-dropdown'),
        text = $(selection).text().toLowerCase();
        displayText = '{' + text + '}',
        catName = $(curDrop[0]).text().toLowerCase(),
        html = null,
        sibs = null;

    compare = false;
        
    //if (compare all), remove all filters
    if(text === 'compare all') {
        compare = true;
        removeAllFilters();
        var par = $(selection).parent();
        sibs = par.siblings();
        var numSibs = sibs.length;

        foci = numSibs;
        html = '<p data-compare="1" data-padre=' + index +'>' + displayText + '</p>';
    }
    else {
        html = '<p data-compare="0" data-name="' + text + '" data-padre=' + index +'>' + displayText + '</p>';
    }

    var found = false;
    //if there is a compare all, we should remove it
    //go thru each filter, check it data-padre matches index
    $('.filterList p').each(function(i) {
        var old = parseInt($(this).attr('data-padre'),10),
            isCompare = parseInt($(this).attr('data-compare'), 10);

        //if there was pre-existing compare all, remove it.
        if(isCompare === 1) {
            $(this).remove();
            resetMenuColor(this);
        }

        //replace the text if it is the same category AND not a compare all
        else if(old === index) {
            $(this).text(displayText);
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
            $(this).remove();
            resetMenuColor(this);
            updateData();
        });
    }
    if(!compare) {
        updateData();
    }
    else {
        compareAll(sibs, catName);
    }
}

//remove the labels from the bottom
function removeAllFilters() {
    dropdown.children().removeClass('activeFilter');
    $('.filterList p').remove();
}

//update the labels for the compare all feature
function compareLabels(filters) {
    //delete all labels
    nodesData = nodesData.filter(isLabel);
    
    //add new ones
    for(var i = 0; i < filters.length; i++) {
        var realFocus = i + 1,
            startX = (realFocus / foci) * width;
        nodesData.push({focus: realFocus, len: filters[i].length, label: true, name: filters[i], user_id: filters[i], x: startX, y: centerY});
    }
    force.nodes(nodesData);
    //must call start here since we aren't joining the new data anywhere else
    start();
    // recharge();
}

//update the labels when we are not comparing all
function updateLabels() {
    //delete all label nodes
    nodesData = nodesData.filter(isLabel);
    var len = currentFilters.length,
        interval = 60,
        topStart = centerY - ((interval * len) / 2);

    //go thru and push all the new ones
    for(var i = 0; i < len; i++) {
        var startY = topStart + interval * i,
            startX = len > 1 ? (width * 0.33) : centerX;
        nodesData.push({focus: 1, len: currentFilters[i].name.length, label: true, name: currentFilters[i].name, user_id: currentFilters[i].category, x: startX, y: startY});
    }
    force.nodes(nodesData);
    // recharge();
}
    
function isLabel(element, index, array) {
    return (element.label !== true);
}
function recharge() {
    force.charge(function(d){
        if(d.label) {
            return -Math.pow(d.len, 2.0) * 6;
        }
        var sz = radiusScale(d.likes_num);
        return -Math.pow(sz, 2.0) / 2.0;
    })
    .friction([0.9])
    .gravity([-0.01]);
}

function changeChallenge(cur) {
    challengeShowing = true;
    hideText();
    $('.selectChallenge').text('Challenge: ' + challenges[cur].challenge_title);
    $('.challengeQuestion').text(challenges[cur].challenge_question);
    challengeData = [];
    $('.wrapper-dropdown span').removeClass('activeFilter');
    compare = false;
    $('.filterList').empty();
    var challengeId = challenges[cur].challenge_id;
    challengeData = nestedData[challengeId];

    nodesData = challengeData;
    updateData();

    force.nodes(nodesData);
    start();
}

function getTokens(input) {
    results = [],
    split = input.replace(/[^a-zA-Z ]+/g, '')
            .replace('/ {2,}/',' ')
            .toLowerCase()
            .split(' ');

    for(var i =0; i< split.length; i++) {
        if(split[i].length > 1) {
            results.push(split[i]);
        }
    }
    return results;
}

function highlightText(d) {
    d3.select(this).style('fill', '#EA446A');
}

function regularText(d) {
    d3.select(this).style('fill', '#000');
}

function resetMenuColor(item) {
    var index = $(item).attr('data-padre'),
                    el = dropdown.get(index);
                $(el).children().removeClass('activeFilter');
}