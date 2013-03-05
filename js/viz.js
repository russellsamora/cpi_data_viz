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
    maxMaxRadius = 80,
    resizeTimer = null,
    challenges = null,
    users = null,
    ready = false,
    challengeShowing = false,
    drumLine = false,
    selectedCircle = null,
    compare = false,
    colorScalePos = null,
    colorScaleNeg = null,
    wordCloudWords = null,
    wordColorScale = null,
    wordSizeScale = null,
    wordLimit = 150,
    smallWord = 16,
    bigWord = 30,
    bubbleViz = null,
    demographicViz = null,
    vizMode = 0,
    maxSent = 0,
    minSent = 0,
    aidan = ['#1884A8', '#1885AA', '#777', '#aaa'],
    aidanPos = ['rgb(129, 169, 101)', 'rgb(181, 212, 160)'],
    aidanNeg = ['rgb(250, 153, 176)' ,'rgb(234, 68, 106)'],
    ignoreWords = ['myself','our','ours','ourselves','you','your','yours','yourself','yourselves','him','his','himself','she','her','hers','herself','its','itself','they','them','their','theirs','themselves','what','which','who','whom','whose','this','that','these','those','are','was','were','been','being','have','has','had','having','does','did','doing','will','would','should','can','could','ought','i\'m','you\'re','he\'s','she\'s','it\'s','we\'re','they\'re','i\'ve','you\'ve','we\'ve','they\'ve','i\'d','you\'d','he\'d','she\'d','we\'d','they\'d','i\'ll','you\'ll','he\'ll','she\'ll','we\'ll','they\'ll','isn\'t','aren\'t','wasn\'t','weren\'t','hasn\'t','haven\'t','hadn\'t','doesn\'t','don\'t','didn\'t','won\'t','wouldn\'t','shan\'t','shouldn\'t','can\'t','cannot','couldn\'t','mustn\'t','let\'s','that\'s','who\'s','what\'s','here\'s','there\'s','when\'s','where\'s','why\'s','how\'s','the','and','but','because','until','while','for','with','about','against','between','into','through','during','before','after','above','below','from','upon','down','out','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','nor','not','only','own','same','than','too','very','say','says','said','shall'];
    ignore = null,
    twoRowsCompare = false,
    stats = null;

    var debug = 0;

//init and set most click events and stuff
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

    setupEvents();
    //begin
    init();
});

/****** SETUP *****/

//init the d3 and load in data
function init() {
    //setup d3
    createIgnoreList();
    viz = d3.select('.wrapper').append('svg');
    bubbleViz = viz.append('g').classed('bubbles', true);
    nodesData = [];
    nodesEl = bubbleViz.selectAll('.node');
    resize(true);
    setupForce();
    d3.csv('/data/responses_new.csv',function(csv) {
        bigData = csv;
        setPropertiesFromData();
    })
    .on('error', function(e) {
        console.log('messed up: ', e);
    });
}

//refine the user data (try to do most of this in excel?)
function refineUsers(firstUsers) {
    //go thru each user and refine stuff (ie. change age year to age group)
    var usersL = firstUsers.length,
        i = 0;

    while(i < usersL) {
        var tempUser = firstUsers[i];
        for(var prop in tempUser) {
            if(tempUser[prop].length < 1) {
                tempUser[prop] = 'unspecified';

                //some special case
                //this is array
                if(prop === 'stake') {
                    tempUser[prop] = ['unspecified'];
                }
                //creating new category
                if(prop === 'birth_year') {
                    tempUser.age = 'unspecified';
                }

            }
            else {
                tempUser[prop] = tempUser[prop].toLowerCase();

                //special case:
                //birth year -> age range
                if(prop === 'birth_year') {
                    var age = 2013 - parseInt(tempUser[prop],10);

                    if(age < 18) {
                        tempUser.age = 'under 18';
                    }
                    else if(age < 31) {
                        tempUser.age = '18-30';
                    }
                    else if(age < 41) {
                        tempUser.age = '31-40';
                    }
                    else if(age < 51) {
                        tempUser.age = '41-50';
                    }
                    else {
                        tempUser.age = 'over 50';
                    }
                }
                if(prop === 'stake') {
                    //split up stake by ,
                    var splits = tempUser[prop].split(',');
                    for(var s = 0; s < splits.length; s++) {
                        splits[s] = splits[s].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
                    }
                    tempUser[prop] = splits;
                }
            }
        }
        i++;
    }
    return firstUsers;
}

//update each response data and nest by challenge
function setPropertiesFromData() {
    var bigL = bigData.length,
        i = 0;

    while(i < bigL) {
        bigData[i].focus = 1;
        bigData[i].tokens = getTokens(bigData[i].response);
        bigData[i].score = parseInt(bigData[i].score, 10);
        bigData[i].replies_num = parseInt(bigData[i].replies_num, 10);
        bigData[i].likes_num = parseInt(bigData[i].likes_num, 10);
        bigData[i].popular = parseInt(bigData[i].popular, 10);
        i++;
    }
    nestedData = d3.nest()
        .key(function(d) {
            return d.challenge_id;
        })
        .map(bigData);
    loadUsers();
    setScales();
}

//load the user and challenge data
function loadUsers() {
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
        loadChallenges();
        setupDemographic();
    });
}

function loadChallenges() {
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
}

//put the challenge names in the menu
function populateChallenges() {
    //create mission labels up top
    var numMissions = parseInt(challenges[challenges.length-1].mission,10) + 1;
    for(var m = 1; m < numMissions; m++) {
        var missionHtml = '<ul class="mission' + m + '"><li class="missionTitle">Mission ' + m + '</li></ul>';
        challengeInfo.append(missionHtml);
    }

    for(var i = 0; i < challenges.length; i++) {
        var missionClass = '.mission' + challenges[i].mission;
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
            $('.challengeInfo ul').fadeOut(100);
            setTimeout(function() {
                changeChallenge(num);
            }, 250);
        }
        return false;
    });
}

//create the force for the nodes
function setupForce() {
    force = d3.layout.force()
                .nodes(nodesData)
                .size([width,height])
                .on('tick', function(e) {
                    nodesEl.select('circle').each(moveToCenter(e.alpha))
                        .attr('cx', function(d) { return d.x; })
                        .attr('cy', function(d) { return d.y; });
                    nodesEl.select('text').each(moveToCenter(e.alpha))
                        .attr('x', function(d) { return d.x; })
                        .attr('y', function(d) { return d.y; });
                });
    recharge();
}

//create the d3 layout for the demographic visualization
function setupDemographic(){
    demographicViz = viz.append('g')
        .classed('demographics', true);
}



/**** CHALLENGE CHANGING ****/

//change the challenge and reset a lot of things
function changeChallenge(cur) {
    //do a bunch of resets
    challengeShowing = true;
    userMessage.hide();
    $('.tool').css('opacity', 1);
    $('.demographicMode').css('opacity', 0.3);
    hideResponse();
    $('.selectChallenge').text('Challenge: ' + challenges[cur].challenge_title);
    var qLength = challenges[cur].challenge_question.length,
        fontSize = 12;
    //shrink down question size
    if(qLength > 450) {
        fontSize = 12;
    }
    else if(qLength > 350) {
        fontS = 14;
    }
    else if(qLength > 250) {
        fontSize = 15;
    }
    else {
        fontSize = 16;
    }
    $('.challengeQuestion p').css('font-size', fontSize);
    $('.challengeQuestion p').text(challenges[cur].challenge_question);

    $('.challengeQuestion').fadeIn(100);
    challengeData = [];
    $('.wrapper-dropdown span').removeClass('activeFilter');
    compare = false;
    twoRowsCompare = false;
    $('.filterList').empty();

    if(vizMode !== 0) {
        $('.tool').removeClass('currentMode');
        $('.cloud').fadeOut(function() {
            $('.bubbles').fadeIn();
            vizMode = 0;
        });
        $('.bubbleMode').addClass('currentMode');
        $('.demographics').fadeOut();
    }

    var challengeId = challenges[cur].challenge_id;
    challengeData = [];
    challengeData = nestedData[challengeId];

    /**** NEW EXCESSIVE WAY TO MAKE SURE THE SAME USER STAYS IN PLACE **/
    //go through nodes data, if exists in challenge, update
    //go through challenge data, still there, push to nodes
    var n = 0,
        nLength = nodesData.length,
        c = 0,
        cLength = challengeData.length;

    var newData = [];
    while(n < nLength) {
        for(var i = 0; i < cLength; i++) {
            // console.log(nodesDat[n].user_id, challeng)
            if(nodesData[n].user_id === challengeData[i].user_id) {
                challengeData[i].added = true;
                nodesData[n].challenge_id = challengeData[i].challenge_id;
                nodesData[n].likes_num = challengeData[i].likes_num;
                nodesData[n].replies_num = challengeData[i].replies_num;
                nodesData[n].response = challengeData[i].response;
                nodesData[n].replies = challengeData[i].replies;
                nodesData[n].popular = challengeData[i].popular;
                nodesData[n].score = challengeData[i].score;
                nodesData[n].tokens = challengeData[i].tokens;
                nodesData[n].media = challengeData[i].media;
                newData.push(nodesData[n]);
                continue;
            }
        }
        n++;
    }
    var num = 0;
    while(c < cLength) {
        if(!challengeData[c].added) {
            newData.push(challengeData[c]);
            num++;
        }
        //must reset for next time?
        challengeData[c].added = false;
        c++;
    }

    nodesData = [];
    nodesData = newData;
    //nodesData = challengeData;
    getMaxMin();
    force.nodes(nodesData);
    updateData();
    calculateStats();
}

//get stats for the current challenge
function calculateStats() {
    var nodesL = nodesData.length,
        i = 0;
    stats = {
        likes: 0,
        comments: 0,
        responses: 0
    };
    while(i < nodesL) {
        stats.likes += nodesData[i].likes_num;
        stats.comments += nodesData[i].replies_num;
        stats.responses += 1;
        i++;
    }   
}

//set color and size scales, and word size
function setScales() {
    //scale down the size of the circles based on the screen dimensions and max # comments
    // var max = (Math.floor(height * 0.04)) > maxMaxRadius ? maxMaxRadius : max;
    var frac = (1 / challengeData.length);
    var val = Math.floor(height * frac) * 5;
    var max = val > maxMaxRadius ? maxMaxRadius : val;
    var maxRadius =  max > (minRadius * 2) ? max : (minRadius * 2);
    radiusScale = d3.scale.linear().domain([0,maxPopular]).range([minRadius,maxRadius]);
    //radiusScale = d3.scale.linear().domain([0,maxPopular]).range([minRadius,maxRadius]);
    colorScalePos = d3.scale.quantize().domain([0, maxSent]).range(aidanPos);
    colorScaleNeg = d3.scale.quantize().domain([minSent, 0]).range(aidanNeg);

    bigWord = Math.floor(width / 20);
}

//figure out the max and min for the popularity, sentiment of responses
function getMaxMin() {
    maxPopular = d3.max(challengeData, function(d,i) {
        return d.popular;
    });
    maxSent = d3.max(challengeData, function(d,i) {
        return d.score;
    });
    minSent = d3.min(challengeData, function(d,i) {
        return d.score;
    });
    setScales();
}





/*** UPDATING CHALLENGE DATA *****/

//rebinds data, adds new elements, removes elements, updates elements
function start(filter) {
    /**** JOIN DATA ****/
    //console.log(0, force.nodes());
    nodesEl = nodesEl.data(force.nodes(), function(d,i) {
        return d.user_id;
    });


        /**** UPDATE *****/
    //select all circles, update their radius and color
    // console.log('***** UPDATE *****');
    d3.selectAll('.node')
        .select('circle')
        .transition(2000)
        .attr('r', function(d){
            if(d.label) {
                //based the size on the number of letters
                return d.len;
            }
            return radiusScale(d.popular);
        })
         .style('fill', function(d,i) {
            var s = d.score;
            if(d.label === true) {
                return 'rgba(0,0,0,0)';
            }
            if(s === 0) {
                return 'rgb(180,180,180)';
            }
            else if(s < 0) {
                return colorScaleNeg(s);
            }
            else {
                return colorScalePos(s);
            }
        });
    d3.selectAll('.label')
        .select('text')
        .text(function(d) {
            return d.name;
        });

    /***** ENTER *****/
    // console.log('***** ENTER *****');
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
            // console.log('enter: ',d.user_id);
            return radiusScale(d.popular);
        })
        .style('fill', function(d,i) {
            var s = d.score;
            if(d.label) {
                return 'rgba(0,0,0,0)';
            }
            if(s === 0) {
                return 'rgb(180,180,180)';
            }
            else if(s < 0) {
                return colorScaleNeg(s);
            }
            else {
                return colorScalePos(s);
            }
        })
        .call(force.drag)
        .on('click', showResponse);
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
        .style('text-anchor', 'middle')
        .style('font-size', function(d) {
            if(d.label) {
                //14 is base, 36 is longest
                var sz = Math.floor(10 + (36 - d.name.length) * 0.25);
                return sz;
            }
            else {
                return 0;
            }
        })
        .style('fill', function(d) {
            //make it a different color
            if(d.user_id === 'keyword') {
                return '#1884A8';
            }
            return '#222';
        });

    /***** EXIT ****/
    nodesEl.exit()
        .transition()
        .duration(500)
        .style('fill-opacity', 0)
        .remove();

    //restart ze force!
    force.start();
}

//go thru all the filters and figure out which data stays or goes (left or right)
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
    var nodesL = nodesData.length,
        i = 0;
    if(currentFilters.length > 0) {
        foci = 2;
        while(i < nodesL) {
            if(!nodesData[i].label) {
                var tempUser = users[nodesData[i].user_id][0];
                nodesData[i].focus = 1;
                for(var a = 0; a < currentFilters.length; a++) {
                    // console.log(users[nodesData[i].user_id][0][currentFilters[a].category], currentFilters[a].name);
                    if(currentFilters[a].category === 'keyword') {
                        var tokenExists = false;
                        for(var t = 0; t < nodesData[i].tokens.length; t++) {
                            if(nodesData[i].tokens[t] === currentFilters[a].name) {
                                tokenExists = true;
                                nodesData[i].focus = 1;
                                continue;
                            }
                        }
                        if(!tokenExists) {
                            nodesData[i].focus = 2;
                        }
                    }
                    else {
                        //must check if it is the stake category (cuz it could be multiple)
                        if(currentFilters[a].category === 'stake') {
                            var stakes = tempUser[currentFilters[a].category];
                                slength = stakes.length,
                                foc = 2;
                            for(var s = 0; s < slength; s++) {
                                if(stakes[s] === currentFilters[a].name) {
                                    foc = 1;
                                    continue;
                                }
                            }
                            nodesData[i].focus = foc;
                        }
                        else {
                            var value = tempUser[currentFilters[a].category];
                            if(value !== currentFilters[a].name) {
                                nodesData[i].focus = 2;
                                continue;
                            }
                        }
                    }
                }
            }
            i++;
        }
    }
    else {
        compare = false;
        $('.formShape').css('opacity', 1);
        foci = 1;
        while(i < nodesL) {
            nodesData[i].focus = 1;
            i++;
        }
    }
    setTimeout(updateNodeOpacity,17);
    start();
}

//when a compare filter is selected, like updateData but splits up all items, not binary
function compareAll(sibs, categoryName) {
        var filterValues = [];
        sibs.each(function() {
            var txtVal = $(this).text().toLowerCase();
            filterValues.push(txtVal);
        });
        compareLabels(filterValues);
        var nodesL = nodesData.length,
            i = 0;
        while(i < nodesL) {
            if(!nodesData[i].label) {
                for(var a = 0; a < filterValues.length; a++) {
                //console.log(users[nodesData[i].user_id][0][categoryName], filterValues[a]);
                    if(users[nodesData[i].user_id][0][categoryName] === filterValues[a]) {
                        nodesData[i].focus = (a + 1);
                        continue;
                    }
                }
            }
            i++;
        }
        updateNodeOpacity(true);
        force.start();
}

//add the keyword search to the filters and then update the data
function selectSearch(selection, fromCloud) {
    $('.formShape').css({
        opacity: 0.3,
        'background-position': '0px'
    });
    hideResponse();
    var text = null;
    if(fromCloud) {
        text = fromCloud;
    }
    else {
        text = $('.searchField').val().toLowerCase();
    }
    var displayText = '{' + text + '}',
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

//add the selected filter to the list and then update the data or compare all data
function selectFilter(selection) {
    hideResponse();
    $('.formShape').css({
        opacity: 0.3,
        'background-position': '0px'
    });
    var padre = $(selection).parentsUntil('.filters'),
        curDrop = $(padre[2]).children(),
        parentLi = $(selection).parent();
        index = $(padre[2]).index('.wrapper-dropdown'),
        text = $(parentLi).text().toLowerCase();
        displayText = '{' + text + '}',
        catName = $(curDrop[0]).text().toLowerCase(),
        html = null,
        sibs = null;

    compare = false;
    //if (compare all), remove all filters
    if(text === 'compare all') {
        compare = true;
        removeAllFilters();
        sibs = parentLi.siblings();
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
            $(this).attr('data-name', text);
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
            twoRowsCompare = false;
            $(this).remove();
            resetMenuColor(this);
            // console.log('delete it yo');
            updateData();
        });
    }
    if(!compare) {
        twoRowsCompare = false;
        updateData();
    }
    else {
        var numRows = Math.floor((width / sibs.length) / 170);
        if(numRows < 1) {
            twoRowsCompare = true;
        }
        compareAll(sibs, catName);
    }
}

//change node transparency based on if active or not
function updateNodeOpacity(comparing) {
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





/**** USER INTERACTIVITY ******/

//display the response of the selected node
function showResponse(d) {
    if(d.label) {
        deleteLabel(d);
        return;
    }
    hideResponse();
    selectedCircle = this;
    d3.select(this).classed('selectedCircle', true);

    //make p tags for the multi line responses
    var splits = d.response.split('\\n'),
        newP = '';
    for(var i = 0; i < splits.length; i++) {
        if(splits[i].substring(0,3) !== '[[[') {
            newP+= '<span>' + splits[i] + '</span><br>';
        }
        else {
            //no comment in a map challenge
            if(splits.length < 2) {
                newP+= '<span>no response</span>';
            }
        }
    }

    //add image
    if(d.media.length > 0) {
        newP += '<p class="imageInResponse"><img src="' + d.media + '">';
    }
    $('.displayInfo .mainResponse').html(newP);
    if(d.replies.length > 0) {
        populateComments(d.replies);
        $('.displayInfo .viewComments').show();
    }
    else {
        $('.displayInfo .viewComments').hide();
    }
    $('.displayInfo').show();
}

//hide the response of the previously showing
function hideResponse() {
    if(selectedCircle) {
        $('.displayInfo').hide();
        $('.allComments').hide();
        $('.viewComments').text('view comments');
        showingComments = false;
    
        d3.select(selectedCircle).classed('selectedCircle', false);
        selectedCircle = null;
    }
}

function populateComments(replies) {
    $('.allComments').empty();
    var comments = replies.split('\\\\');

    for(var i = 0; i < comments.length; i++) {
        var comment = '<p>' + comments[i] + '</p>';
        $('.allComments').append(comment);
    }
}



/**** LABEL STUFF ******/

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

//method for weeding out labels from nodes (when changing)
function isLabel(element, index, array) {
    
    return (element.label !== true);
}

//remove the lable from the bottom of the screen and update data
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
}





/**** FORCE UTILITIES *****/

//modify charges of nodes based on new data values
function recharge() {
    force.charge(function(d){
        if(d.label) {
            if(d.len > 12) {
                console.log('pow');
                return -Math.pow(d.len, 2.0);
            }
            return -Math.pow(d.len, 2.0) * 4;
        }
        var sz = radiusScale(d.popular);
        return -Math.pow(sz, 2.0) / 2.0;
    })
    .friction([0.9])
    .gravity([-0.01]);
}

//algorithm to update the position of the node
function moveToCenter(alph) {
    return function(d, i) {
        var targetX = null,
            targetY  = centerY;
        if(drumLine) {
            targetX = (i+1) / nodesData.length * width;
        }
        else if (twoRowsCompare) {
            var tempFoci = Math.ceil(foci / 2);
                tempFocus = d.focus < tempFoci ? d.focus : d.focus - (tempFoci-1);
            targetX = Math.floor(tempFocus / (tempFoci+1) * width);
            if(d.focus < tempFoci) {
                targetY = height * 0.3;
            }
            else {
                targetY = height * 0.5;
            }
        }
        else {
            targetX = Math.floor((d.focus / (foci+1)) * width);
        }
        d.x = d.x + (targetX - d.x) * (0.12) * alph;
        d.y = d.y + (targetY - d.y) * (0.12) * alph;
    };
}



/****** WORD CLOUD FUNCTIONS *******/

//setup a word cloud
function setupCloud() {

    var minFreq = wordCloudWords[wordCloudWords.length - 1].frequency,
        maxFreq = wordCloudWords[0].frequency;

    wordColorScale = d3.scale.quantize().domain([0,1]).range(aidan);
    wordSizeScale = d3.scale.linear().domain([minFreq,maxFreq]).range([smallWord,bigWord]);
    var cloudW = 0,
        cloudH = 0;

    if(wordCloudWords.length < wordLimit) {
        var frac = wordCloudWords.length / wordLimit;
        cloudW = (frac * width * 0.5) + width * 0.5;
        cloudH = (frac * height * 0.5) + height * 0.5;
    }
    else {
        cloudW = width * 0.9;
        cloudH = height * 0.9;
    }
    d3.layout.cloud()
        .size([cloudW, cloudH])
        .timeInterval(10)
        .words(wordCloudWords.map(function(d) {
            var sz = wordSizeScale(d.frequency);
            return {text: d.text, size: sz};
        }))
        .rotate(function() { return 0; })
        .font('vinyl')
        .fontSize(function(d) { return d.size; })
        .on('end', drawCloud)
        .start();
}

//draw the words to the screen
function drawCloud(words) {
    viz.append('g')
        .classed('cloud', true)
        .attr('transform', 'translate(' + centerX + ',' + centerY + ')')
        .selectAll('text')
        .data(words)
        .enter().append('text')
            .style('font-size', function(d) { return d.size + 'px'; })
            .style('font-family', 'vinyl')
            .style('fill', function(d, i) {
                var col = wordColorScale(Math.random());
                return col;
            })
            .attr('text-anchor', 'middle')
            .attr('transform', function(d) {
                return 'translate(' + [d.x, d.y] + ')';
            })
            .text(function(d) { return d.text; })
            .on('click', backToBubbles);
}

function backToBubbles(d) {
    selectSearch(false, d.text);
    if(challengeShowing && vizMode !== 0) {
        $('.cloud').fadeOut(function() {
            $('.bubbles').fadeIn();
        });
        vizMode = 0;
        $('.tool').removeClass('currentMode');
        $('.bubbleMode').addClass('currentMode');
    }
}
//creates a list of words to ignore
function createIgnoreList() {
    var ignoreCount = ignoreWords.length;
    
    ignore = (function(){
        var o = {}; // object prop checking > in array checking
        var i = 0;
        while(i < ignoreCount) {
            o[ignoreWords[i]] = true;
            i++;
        }
        return o;
    }());
}

//goes thru all the words in each response and creates dictionary and sets up word cloud
function compileWords() {
    var words = [];
    var nodesL = nodesData.length,
        i = 0;

    while(i < nodesL) {
        var node = nodesData[i];
        if(!node.label) {
            for(var t = 0; t < node.tokens.length; t++) {
                words.push(node.tokens[t]);
            }
        }
        i++;
    }
    sortedWords(words, function(result) {
        wordCloudWords = result;
        if(wordCloudWords.length > wordLimit) {
            wordCloudWords = wordCloudWords.slice(0,wordLimit);
        }
        setupCloud();
    });
}

//goes thru and makes a dictionary for word frequency
function sortedWords(input, callback) {

    var sWords = input;
    var iWordsCount = sWords.length; // count w/ duplicates

    // array of words to ignore
    var counts = {},
        i = 0;
    while(i < iWordsCount) {
        var sWord = sWords[i];
        if (sWord.length > 2) {
            counts[sWord] = counts[sWord] || 0;
            counts[sWord]++;
        }
        i++;
    }

    var arr = []; // an array of objects to return
    for (var w in counts) {
        arr.push({
            text: w,
            frequency: counts[w]
        });
    }

    // sort array by descending frequency | http://stackoverflow.com/a/8837505
    var finished = arr.sort(function(a,b){
        return (a.frequency > b.frequency) ? -1 : ((a.frequency < b.frequency) ? 1 : 0);
    });

    callback(finished);
}

//return a list of words to the response extracting non words
function getTokens(input) {
    var results = [],
        split = input.replace('\\n','')
            .replace(/\'s/g, '')
            .replace(/[^a-zA-Z ]+/g, '')
            .replace('/ {2,}/',' ')
            .toLowerCase()
            .split(' ');

    var splitL = split.length,
        i = 0;

    while(i < splitL) {
        if(split[i].length > 2 && !ignore[split[i]]) {
            results.push(split[i]);
        }
        i++;
    }
    return results;
}


/**** VISUAL UTILITIES *****/

//resize function
function resize(first) {
    //get the dimensions of the browser
    width = $(window).width();
    height = $(window).height();

    //make sure our comments popup changes to stay within the bounds of the browser
    // $('.allComments').css('max-height', height - 300);
    $('.box').css('max-height', height - 250);
    //adjust sizes of viz and wrapper
    
    viz.attr('width', width-1).attr('height', height - 118);
    wrapper.css('height', height-118);
    centerX = Math.floor(width / 2);
    centerY = Math.floor(height / 2) - 100;
    
    //if its not our first time (not on init), then we stop the motion, and do our resize timer
    if(!first && ready) {
        force.alpha(0);
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resizeEnd, 1000);
    }
}

//resize delay function so we don't call this EVERY resize trigger
function resizeEnd() {
    
    centerX = Math.floor(width / 2);
    centerY = Math.floor(height / 2) - 100;
    
    //reset the scales accordingly for cirlce sizes
    setScales();
    
    //change size and positions of circles
    viz.selectAll('circle')
        .attr('r', function(d,i) {
            return radiusScale(d.popular);
        });
    //start up the movement again
    recharge();
    force.start();

    viz.select('.cloud').attr('transform', 'translate(' + centerX + ',' + centerY + ')');
}

//highlight label text
function highlightText(d) {

    d3.select(this).style('fill', '#EA446A');
}

//remove highlight for label
function regularText(d) {
    if(d.user_id === 'keyword') {
        d3.select(this).style('fill', '#1884A8');
    }
    else {
        d3.select(this).style('fill', '#222');
    }   
}

//called when the filter is removed to reset the color of the menu
function resetMenuColor(item) {
    var index = $(item).attr('data-padre'),
        el = dropdown.get(index);
    $(el).children().removeClass('activeFilter');
}

/***** EVENTS *******/
function setupEvents(){
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

    //click off dropdown or response box
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
        $('.helpArea').css({
            width: width,
            height: height
        });
        $('.helpArea').fadeIn();
    });
    $('.helpArea').bind('click', function() {
        $('.helpArea').fadeOut();
    });

    //close response box
    $('.displayInfo a').bind('click', function(e) {
        e.preventDefault();
        hideResponse();
    });

    //slide the challenge window
    $('.challengeLink').bind('click', function() {
        clearTimeout(messageTimeout);
        dropdown.removeClass('active');
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

    $('.searchField').bind('keypress', function(e) {
        if(e.which === 13) {
            e.preventDefault();
            selectSearch(this);
        }
    });

    //view more comments
    $('.viewComments').bind('click', function() {
        justClicked = true;
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
                $(this).css('background-position', '0px');
            }
            else {
                $(this).css('background-position', '-32px');
            }
            force.start();
        }
    });

    //tool button click
    $('.bubbleMode').bind('click', function() {
        if(challengeShowing && vizMode !== 0) {
            $('.demographics').fadeOut();
            $('.cloud').fadeOut(function() {
                $('.bubbles').fadeIn();
            });
            vizMode = 0;
            $('.tool').removeClass('currentMode');
            $(this).addClass('currentMode');
        }
    });
    $('.cloudMode').bind('click', function() {
        if(challengeShowing && vizMode !== 1) {
            $('.demographics').fadeOut();
            $('.bubbles').fadeOut(function() {
                compileWords();
            });
            vizMode = 1;
            $('.tool').removeClass('currentMode');
            $(this).addClass('currentMode');
        }
    });
    $('.demographicMode').bind('click', function() {
        // if(challengeShowing && vizMode !== 2) {
        //     $('.cloud').fadeOut();
        //     $('.bubbles').fadeOut(function() {
        //         $('.demographics').fadeIn();
        //     });
        //     vizMode = 2;
        //     $('.tool').removeClass('currentMode');
        //     $(this).addClass('currentMode');
        // }
    });

    $('.mainResponse, .allComments, .imageInResponse').bind('click', function() {
        hideResponse();
    });

}