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
    maxMaxRadius = 50,
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
    bigWord = 40,
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
    stats = null,
    cityPath = null,
    minWidth = 1024,
    minHeight = 600;

//demographic specific variables
var demoColors = ['rgb(129, 169, 101)','rgb(250, 153, 176)' , 'rgb(24, 132, 168)', 'rgb(181, 212, 160)', 'rgb(234, 68, 106)', 'rgb(129, 169, 101)','rgb(250, 153, 176)' , 'rgb(24, 132, 168)', 'rgb(181, 212, 160)', 'rgb(234, 68, 106)'],
    demoFilterData = null,
    demoFilterDonut = null,
    demoFilterArray = null,
    demoChallengesBars = null,
    demographicFilters = [],
    demoChallengesArray = null,
    demoText = null,
    rawUsers = [],
    innerRadius = 0,
    outerRadius = 0,
    arc = null,
    pieArc = null,
    govArc = null,
    donut = null,
    totalCoins = 0,
    totalResponses = 0,
    numUsers = 0,
    demoUsers = 0,
    demoChallenges = null,
    demoZips = null,
    demoZipsGroup = null,
    demoPies = null,
    demoPiesData = null,
    demoPiesArray = null,
    demoGovernment = null,
    demoGovernmentData = null,
    demoGovernmentArray = null,
    challengeScale = null,
    zipsScale = null,
    thirds = 0,
    demoWrapper = null,
    demoZipsArray = null,
    filterLocations = {'gender': [0,0], 'age': [1,0], 'race': [0,1], 'stake': [1,1], 'income': [0,2], 'education': [1,2]},
    leftG = null,
    middleG = null,
    rightG = null,
    barWidth = 0,
    mouseCategoryOff = 0,
    demoColorsGray = ['#333','#777','#555','#999','#777','#aaa','#999','#ccc','#aaa','#eee','#ccc'];

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
    //get data name for this game
    cityPath = '/data/' + $('body').attr('data-city') + '/';
    //setup d3
    createIgnoreList();
    viz = d3.select('.wrapper').append('svg');
    bubbleViz = viz.append('g').classed('bubbles', true);
    nodesData = [];
    nodesEl = bubbleViz.selectAll('.node');
    resize(true);
    setupForce();
    var responsePath = cityPath + 'responses.csv';
    d3.csv(responsePath,function(csv) {
        bigData = csv;
        setPropertiesFromData();
    })
    .on('error', function(e) {
        console.log('messed up: ', e);
    });
}

//refine the user data (try to do most of this in excel?)
function refineUsers(firstUsers) {
    //pull in the zip codes from the body attr and parse it
    var dataZips = $('body').attr('data-zips'),
        cityZips = dataZips.split(',');

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
                if(prop === 'education') {
                    var newEducation = tempUser[prop].replace(/\'/g, '');
                    tempUser.education = newEducation;
                }
                if(prop === 'coins') {
                    tempUser.coins = parseInt(tempUser[prop], 10);
                }
                if(prop === 'challenges_completed') {
                    var percent = parseInt(tempUser[prop],10);
                    if(percent < 10) {
                        tempUser.challenges_completed = '1% - 10%';
                    }
                    else if(percent < 20) {
                        tempUser.challenges_completed = '10% - 20%';
                    }
                    else if(percent < 30) {
                        tempUser.challenges_completed = '20% - 30%';
                    }
                    else if(percent < 40) {
                        tempUser.challenges_completed = '30% - 40%';
                    }
                    else if(percent < 50) {
                        tempUser.challenges_completed = '40% - 50%';
                    }
                    else if(percent < 60) {
                        tempUser.challenges_completed = '50% - 60%';
                    }
                    else if(percent < 70) {
                        tempUser.challenges_completed = '60% - 70%';
                    }
                    else if(percent < 80) {
                        tempUser.challenges_completed = '70% - 80%';
                    }
                    else if(percent < 90) {
                        tempUser.challenges_completed = '80% - 90%';
                    }
                    else {
                        tempUser.challenges_completed = '90% - 100%';
                    }
                    tempUser.total_responses = Math.floor(percent * 0.01 * challenges.length);
                }
                if(prop === 'communication_with_government') {
                    var com = tempUser[prop];
                    if(com === 'no communication') {
                        tempUser.communication_with_government = 'none';
                    }
                    else if(com === 'yes, by email') {
                        tempUser.communication_with_government = 'email';
                    }
                    else if(com === 'yes, by letter') {
                        tempUser.communication_with_government = 'letter';
                    }
                    else if(com === 'yes, by phone') {
                        tempUser.communication_with_government = 'phone';
                    }
                    else if(com === 'yes, through community meetings') {
                        tempUser.communication_with_government = 'community meetings';
                    }
                    else if(com === 'yes, through personal meetings') {
                        tempUser.communication_with_government = 'personal meetings';
                    }
                    else if(com === 'yes, through social media') {
                        tempUser.communication_with_government = 'social media';
                    }
                }
                if(prop === 'zip_code') {
                    var tempZip = tempUser[prop];

                    if(tempZip.length !== 5) {
                        tempUser.zip_code = 'unspecified';
                    }
                    else {
                        //this will be replaced (but in index file in data body)
                        var found = false;
                        for(var c = 0; c < cityZips.length; c++) {
                            if(tempZip === cityZips[c]) {
                                found = true;
                            }
                        }
                        if(found) {
                            tempUser.zip_code = 'inside';
                         }
                         else {
                            tempUser.zip_code = 'outside';
                        }
                    }
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

    var num = 0;
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
    loadChallenges();
    setScales();
}

//load the user and challenge data
function loadUsers() {
    //load demographic user info
    var usersPath = cityPath + 'users.csv';
    d3.csv(usersPath, function(csv_users) {
        //refine user data (ie. changing birth year to age range etc.)
        rawUsers = csv_users;
        numUsers = csv_users.length;
        var refinedUsers = refineUsers(csv_users);
        users = d3.nest()
        .key(function(d) {
            return d.user_id;
        })
        .map(refinedUsers);


        //load challenge info
        setupDemographics();
        //now all the data is ready, fade out the user message box
        userMessage.fadeOut(1000, function() {
            $(this).text('Select a challenge above to begin!');
            $(this).fadeIn(200, function() {
                ready = true;
            });
        });
    });
}

function loadChallenges() {
    var challengesPath = cityPath + 'challenges.csv';
    d3.csv(challengesPath, function(csv_challenges) {
        challenges = csv_challenges;
        populateChallenges();
        loadUsers();
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

/**** CHALLENGE CHANGING ****/

//change the challenge and reset a lot of things
function changeChallenge(cur) {
    //do a bunch of resets
    challengeShowing = true;
    userMessage.hide();
    $('.tool').css('opacity', 1);
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
        $('.resetDemo').fadeOut();
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
function setDemoScales() {
    var spacing = 20,
        confines = false,
        factor = 3,
        realH = (height - (spacing * 6 + 80)),
        tempRad = 0;

    if(height < minHeight) {
        realH = minHeight - (spacing * 6 + 80);
    }
    //must check to see if circles are within bounds, if not, shrink em down
    //we start with factor 3 because we will have 3 rows
    while(!confines) {
        tempRad = Math.floor((realH  / factor) * 0.5);
        var totalW = tempRad * 4 + (spacing * 3);
        if(totalW < thirds) {
            //we are okay
            confines = true;
        }
        else {
            factor += 0.2;
        }
        //console.log(tempRad, thirds);
    }
    innerRadius = tempRad-tempRad/2;
    outerRadius = tempRad;

    //60 is spacing
    barWidth = (thirds - 60) / 10;

    var baseFont = Math.floor(thirds * 0.035);
    $('.demoText').css('font-size', baseFont);
    $('.demoFilterList').css('font-size', (baseFont * 1.2));
    resetDemoSizes();

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
    $('.cloud').remove();
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

        $('.cloud').fadeIn();
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
    thirds = width / 3 - 52;
    if(width < minWidth) {
        thirds = minWidth / 3 - 52;
    }
}

//resize delay function so we don't call this EVERY resize trigger
function resizeEnd() {
    
    centerX = Math.floor(width / 2);
    centerY = Math.floor(height / 2) - 100;
    
    //reset the scales accordingly for cirlce sizes
    setScales();
    
    //setDemo
    setDemoScales();
    updateDemographicData();
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
            hideResponse();
            $('.resetDemo').fadeOut();
            $('.filterList').fadeIn();
            $('.userDemographics').fadeOut(100,function() {
                $('.questions').fadeIn();
                $('.cloud').fadeOut();
                $('.bubbles').fadeIn();
            });
            vizMode = 0;
            $('.tool').removeClass('currentMode');
            $(this).addClass('currentMode');
        }
    });
    $('.cloudMode').bind('click', function() {
        if(challengeShowing && vizMode !== 1) {
            hideResponse();
            $('.resetDemo').fadeOut();
            $('.userDemographics').fadeOut(100,function() {
                $('.questions').fadeIn();
                $('.bubbles').fadeOut();
                compileWords();
            });
            vizMode = 1;
            $('.tool').removeClass('currentMode');
            $(this).addClass('currentMode');
        }
    });
    $('.demographicMode').bind('click', function() {
        if(challengeShowing && vizMode !== 2) {
            // $('.cloud').fadeOut();
            // $('.bubbles').fadeOut(function() {
            $('.filterList').fadeOut();
            $('.questions').fadeOut(function() {
                $('.userDemographics').fadeIn();
                $('.demoFiltList').empty();
                $('.resetDemo').fadeIn();
            });
            vizMode = 2;
            $('.tool').removeClass('currentMode');
            $(this).addClass('currentMode');
        }
    });
    $('.resetDemo').bind('click', function() {
        $('.demoFilterList').empty();
        demographicFilters = [];
        updateDemographicData();
    });

    $('.mainResponse, .allComments, .imageInResponse').bind('click', function() {
        hideResponse();
    });
}





/***** DEMOGRAPHICS *****/
//create the d3 layout for the demographic visualization
function setupDemographics(){
    resetDemoData();

    demoWrapper = d3.select('.userDemographics').append('svg').attr('width', width-1).attr('height', height-38);
    demographicViz = demoWrapper.append('g')
        .classed('demographics', true);

    demoFilterDonut = {
        gender: null,
        age: null,
        race: null,
        income: null,
        stake: null,
        education: null
    };

    demoPies = {
        worked_in_planning: null,
        prior_participation: null
    };

    leftG = demographicViz.append('g').classed('leftG', true);
    middleG = demographicViz.append('g').classed('middleG', true);
    rightG = demographicViz.append('g').classed('rightG', true);

    demoFilterDonut.gender = leftG.append('g')
        .classed('gender', true);
    demoFilterDonut.age = leftG.append('g')
        .classed('age', true);
    demoFilterDonut.race = leftG.append('g')
        .classed('race', true);
    demoFilterDonut.income = leftG.append('g')
        .classed('income', true);
    demoFilterDonut.education = leftG.append('g')
        .classed('education', true);
    demoFilterDonut.stake = leftG.append('g')
        .classed('stake', true);

    demoPies.worked_in_planning = rightG.append('g')
        .classed('worked', true);
    demoPies.prior_participation = rightG.append('g')
        .classed('prior', true);

    demoGovernment = rightG.append('g')
        .classed('government', true);

    demoChallengesBars = middleG.append('g')
        .classed('challenges', true);

    demoText = $('.userDemographics').append('<div class="demoText"><p>There were <span class="num_users"></span> active players that left <br> <span class="num_responses"></span> responses and earned <span class="num_coins"></span> coins!</p></div>');

    //universal pie
    donut = d3.layout.pie()
    .sort(null)
    .value(function(d) {
        return d.quantity;
    });

    demoZipsGroup = middleG.append('g')
        .classed('zips', true);

    setDemoScales();
    updateDemographicData(true);
}

function resetDemoSizes() {
    demoWrapper.attr('width', width-1).attr('height', height-38);

    leftG.attr('width', thirds)
        .attr('height', height - 40)
        .attr('transform', 'translate(' + (outerRadius + 20) + ',' + (outerRadius + 60 ) + ')');
    middleG.attr('width', thirds)
        .attr('height', height - 40)
        .attr('transform', 'translate(' + (thirds) + ',0)');
    rightG.attr('width', thirds)
        .attr('height', height - 40)
        .attr('transform', 'translate(' + (thirds * 2) + ',40)');
    //universal arc size
    for(var category in demoFilterDonut) {
        //use data sheet above
        var locX = filterLocations[category][0] * (outerRadius * 2 + 20),
            locY = filterLocations[category][1] * (outerRadius * 2 + 40);
        demoFilterDonut[category].attr("transform", "translate(" + locX + "," + locY + ")");
    }

    demoGovernment.attr('transform', 'translate(' + (outerRadius * 3.33 + 20) +',' + (outerRadius * 1.33 + 20) + ')');
    demoPies.worked_in_planning.attr('transform', 'translate(' + (outerRadius * 2.33 + 20) + ',' + (outerRadius * 4 + 20) + ')');
    $('.workedPlanning').css({
        left: (thirds * 2 + outerRadius + 20),
        top: (outerRadius * 5 + 50)
    });
    
    demoPies.prior_participation.attr('transform', 'translate(' + (outerRadius * 4.33 + 20) + ',' + (outerRadius * 4 + 20) + ')');
    $('.priorParticipation').css({
        left: (thirds * 2 + (outerRadius * 5 + 10)),
        top: (outerRadius * 3.66)
    });

    arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

    pieArc = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(outerRadius * .66);

    govArc = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(outerRadius * 1.33);

    demoZipsGroup.attr("transform", "translate(" + (40) + "," + (60) + ")");

    demoChallengesBars.attr('transform', 'translate(' + 60 + ',' + (height - (outerRadius * 3 + 50)) + ')');
    $('.percentCompleted').css('top', (height - (outerRadius * 3 + 100)));
}

function resetDemoData() {
    demoFilterData = {
        age: {
            "under 18": 0,
            "18-30": 0,
            "31-40": 0,
            "41-50": 0,
            "over 50": 0,
            "unspecified": 0
        },
        gender: {
            "male": 0,
            "female": 0,
            "unspecified": 0
        },
        stake: {
            "business owner": 0,
            "community organizer or activist": 0,
            "educator": 0,
            "resident": 0,
            "observer": 0,
            "religious leader": 0,
            "student": 0,
            "volunteer": 0,
            "worker": 0,
            "unspecified": 0
        },
        income: {
            "$0 - $25k": 0,
            "$25k - $50k": 0,
            "$50k - $75k": 0,
            "$75k - $100k": 0,
            "over $100k": 0,
            "unspecified": 0
        },
        education: {
            "high school or less": 0,
            "some college": 0,
            "associates degree": 0,
            "bachelors degree": 0,
            "professional degree": 0,
            "masters degree": 0,
            "doctoral degree": 0,
            "unspecified": 0
        },
        race: {
            "black or african american": 0,
            "asian": 0,
            "hispanic, latino, or spanish": 0,
            "white": 0,
            "multiracial": 0,
            "american indian or alaskan native": 0,
            "other": 0,
            "unspecified": 0
        }
    };
    demoChallenges = {
        "1% - 10%": 0,
        "10% - 20%": 0,
        "20% - 30%": 0,
        "30% - 40%": 0,
        "40% - 50%": 0,
        "50% - 60%": 0,
        "60% - 70%": 0,
        "70% - 80%": 0,
        "80% - 90%": 0,
        "90% - 100%": 0
    };
    demoPiesData = {
        worked_in_planning: {
            "yes": 0,
            "no": 0,
            "unspecified": 0
        },
        prior_participation: {
            "yes": 0,
            "no": 0,
            "unspecified": 0
        }
    };
    demoGovernmentData = {
        "none": 0,
        "other": 0,
        "unspecified": 0,
        "email": 0,
        "letter": 0,
        "phone": 0,
        "community meetings": 0,
        "personal meetings": 0,
        "social media": 0
    };

    demoZips = {
        "inside": 0,
        "outside": 0,
        "unspecified": 0
    };

    demoUsers = 0;
    totalCoins = 0;
    totalResponses = 0;

    //reset data arrays
    demoFilterArray = {
        age: [],
        stake: [],
        race: [],
        income: [],
        gender: [],
        education: []
    };
    demoChallengesArray = [];
    demoGovernmentArray = [];
    demoZipsArray = [];
    demoPiesArray = {
        worked_in_planning: [],
        prior_participation: []
    };
}

function showCategory(d) {
    var mouse = {top: (d3.event.pageY - 42), left: d3.event.pageX},
        category = null,
        quant = 0;
    
    if(d.data) {
        category = d.data.category;
        quant = d.data.quantity;
    }
    else {
        category = d.category;
        quant = d.quantity;
    }
    //put in count too?
    if(category === 'masters degree') {
        category = "master's degree";
    }
    if( category === 'bachelors degree') {
        category = "bachelor's degree";
    }
    $('.demoHover span').text(category + ': ' + quant);
    var w = $('.demoHover').css('width'),
        index = w.indexOf('px');
    mouseCategoryOff = Math.floor(parseInt(w.substring(0,index), 10) / 2);
    mouse.left -= mouseCategoryOff;
    $('.demoHover').css(mouse).show();
}
function moveCategory() {
    var mouse = {top: (d3.event.pageY - 42), left: d3.event.pageX};
    mouse.left -= mouseCategoryOff;
    $('.demoHover').css(mouse);
}

function hideCategory(d) {
    $('.demoHover').hide();
}

function updateDemoFilters(d) {
    //if already in demo filters, then update it
    var col = $(this).attr('fill');
    var found = false;
    for(var i = 0; i < demographicFilters.length; i++) {
        //our pies have nested data
        if(d.data) {
            if(demographicFilters[i].category === d.data.filter) {
            demographicFilters[i].value = d.data.category;
            demographicFilters[i].color = col;
            found = true;
            continue;
            }
        }
        else {
            if(demographicFilters[i].category === d.filter) {
                demographicFilters[i].value = d.data.category;
                demographicFilters[i].color = col;
                found = true;
                continue;
            }
        }
    }
    if(!found) {
        if(d.data) {
            demographicFilters.push({category: d.data.filter, value: d.data.category, color: col});
        }
        else {
            demographicFilters.push({category: d.filter, value: d.category, color: col});
        }
    }

    //clear filter list on screen and refill
    $('.demoFilterList').empty();
    for(var f = 0; f < demographicFilters.length; f++) {
        if(f===0) {
            $('.demoFilterList').append('<span class="demoFilterTitle">Showing:</span><br>');
            $('.demoFilterList').append('<span class = "demo' + f +'"> ' + demographicFilters[f].value + '</span>');
        }
        else {
            $('.demoFilterList').append('<span class = "demo' + f +'"> &rsaquo;&rsaquo; ' + demographicFilters[f].value + '</span>');
        }
        var colSel = '.demo' + f;
        $(colSel).css('color', demographicFilters[f].color);   
    }

    updateDemographicData();
}

function updateDemographicData(first) {
    //filter down users based on DEMOGRAPHIC filters
    resetDemoData();
    var demoFilterStakeHack = false;
    var u = 0;
    while(u < numUsers) {
        var useMe = true;

        for(var i = 0; i < demographicFilters.length; i++) {
            //check for stake first since this could be multiple
            if(demographicFilters[i].category === 'stake') {
                demoFilterStakeHack = demographicFilters[i].value;
                var foundStake = false;
                for(var t = 0; t < rawUsers[u].stake.length; t++) {
                    if(rawUsers[u]['stake'][t] === demographicFilters[i].value) {
                        foundStake = true;
                        continue;
                    }
                }
                if(!foundStake) {
                    useMe = false;
                }
            }
            else {
                if(rawUsers[u][demographicFilters[i].category] !== demographicFilters[i].value) {
                    useMe = false;
                }
            }
        }
        if(useMe) {
            demoFilterData['age'][rawUsers[u].age] += 1;
            demoFilterData['race'][rawUsers[u].race] += 1;
            demoFilterData['gender'][rawUsers[u].gender] += 1;
            demoFilterData['income'][rawUsers[u].income] += 1;
            demoFilterData['education'][rawUsers[u].education] += 1;

            //special case where user can be multiple has special cases :)
            if(demoFilterStakeHack) {
                //only add if it is the same as demo filter
                demoFilterData['stake'][demoFilterStakeHack] +=1;
            }
            else {
                for(var s = 0; s < rawUsers[u].stake.length; s++) {
                    demoFilterData['stake'][rawUsers[u].stake[s]] +=1;
                }
            }

            demoChallenges[rawUsers[u].challenges_completed] += 1;
            demoGovernmentData[rawUsers[u].communication_with_government] += 1;
            demoPiesData['prior_participation'][rawUsers[u].prior_participation] += 1;
            demoPiesData['worked_in_planning'][rawUsers[u].worked_in_planning] += 1;
            demoZips[rawUsers[u].zip_code] += 1;
            demoUsers++;
            totalResponses += rawUsers[u].total_responses;
            totalCoins += rawUsers[u].coins;
        }
        u++;
    }
    //put the values in an array for actual viz
    //demofilters
    for(var d in demoFilterData) {
        for(var a in demoFilterData[d]) {
            var newVal = {category: a, quantity: demoFilterData[d][a], filter: d};
            demoFilterArray[d].push(newVal);
        }
    }
    //prior pies
    for(var p in demoPiesData) {
        for(var b in demoPiesData[p]) {
            var newVal1 = {category: b, quantity: demoPiesData[p][b], filter: p};
            demoPiesArray[p].push(newVal1);
        }
    }
    //challenges
    for(var c in demoChallenges) {
        var newVal2 = {category: c, quantity: demoChallenges[c], filter: 'challenges_completed'};
        demoChallengesArray.push(newVal2);
    }
    //zips
    var previous = 0;
    for(var z in demoZips) {
        var newVal3 = {category: z, quantity: demoZips[z], previous: previous, filter: 'zip_code'};
        previous += newVal3.quantity;
        demoZipsArray.push(newVal3);
    }
    //gov
    for(var g in demoGovernmentData) {
        var newVal4 = {category: g, quantity: demoGovernmentData[g], filter: 'communication_with_government'};
        demoGovernmentArray.push(newVal4);
    }

    averageCoins = Math.floor(totalCoins / demoUsers);
    if(first) {
        setupCharts();
    }
    else {
        updateCharts();
    }
}

function setupCharts() {
    setupDonuts();
    setupBars();
    setupPies();
    setupZips();
    updateText();
}

function updateCharts() {
    updateDonuts();
    updatePies();
    updateZips();
    updateBars();
    updateText();
}

function updateText() {
    averageCoins = Math.floor(totalCoins / demoUsers);
    averageResponses = Math.floor(totalResponses / demoUsers);
    $('.demoText p span').animate({
            opacity: 0
        },200, function() {
            $('.num_users').text(demoUsers);
            $('.num_responses').text(totalResponses);
            $('.num_coins').text(totalCoins);
            $(this).animate({
                opacity: 1
            },500);
        }
    );
    
    // $('.total_coins').html(totalCoins + ' coins earned');
    // $('.average_coins').html(averageCoins + ' coins per user');
    // $('.total_responses').html(totalResponses + ' responses left');
    // $('.average_responses').html(averageResponses + ' responses per user');
}

function setupDonuts(){
    for(var category in demoFilterDonut) {
        var path = demoFilterDonut[category].selectAll("path")
        .data(donut(demoFilterArray[category]))
        .enter().append("path")
            .attr("fill", function(d, i) {
                if(d.data.category === 'unspecified') {
                    return 'rgb(180,180,180)';
                }
                else {
                    return demoColors[i];
                }
            })
            // .each(function(d) { this._current = d.quantity; }) // store the initial values
            .attr("d", arc)
            .on('mouseover', showCategory)
            .on('mouseout', hideCategory)
            .on('mousemove', moveCategory)
            .on('click', updateDemoFilters)
            .classed('clickMe', true)
            .each(function(d) { this._current = d; });

        demoFilterDonut[category].append('text')
            .text(function(d) {
                return category;
            })
            .attr('font-size', function() {
                return Math.floor(outerRadius * .2);
            })
            .attr('dy', '.3em')
            .style('text-anchor', 'middle')
            .style('fill', function(d) {
                return '#222';
            });
    }
}

function updateDonuts() {
    for(var category in demoFilterDonut) {
        var path = demoFilterDonut[category].selectAll("path")
            .data(donut(demoFilterArray[category]))
            .transition().duration(1000).attrTween('d', arcTween);
        var textis = demoFilterDonut[category].selectAll('text')
            .attr('font-size', function() {
                return Math.floor(outerRadius * .2);
            });
    }
}

function arcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return arc(i(t));
  };
}

function setupZips() {
    var zipTotal = (demoZipsArray[0].quantity + demoZipsArray[1].quantity + demoZipsArray[2].quantity);
    demoZipsGroup.selectAll('rect')
        .data(demoZipsArray, function(d) {
            return d.category;
        })
        .enter()
        .append('rect')
        .attr('x', function(d,i) {
            return d.previous / zipTotal * (outerRadius * 4);
        })
        .attr('y', 20)
        .attr('width', function(d,i) {
            return d.quantity / zipTotal * (outerRadius * 4);
        })
        .attr('height', function() {
            return outerRadius - innerRadius;
        })
        .attr('fill', function(d, i) {
            if(d.category === 'unspecified') {
                return 'rgb(180,180,180)';
            }
            return demoColors[i];
        })
        .classed('clickMe', true)
        .on('mousemove', moveCategory)
        .on('mouseover', showCategory)
        .on('mouseout', hideCategory)
        .on('click', updateDemoFilters);
}

function updateZips() {
    var zipTotal = (demoZipsArray[0].quantity + demoZipsArray[1].quantity + demoZipsArray[2].quantity);
    demoZipsGroup.selectAll('rect')
        .data(demoZipsArray, function(d) {
            return d.category;
        })
        .transition().duration(1000)
        .attr('x', function(d,i) {
            return d.previous / zipTotal * (outerRadius * 4);
        })
        .attr('y', 20)
        .attr('width', function(d,i) {
            return d.quantity / zipTotal * (outerRadius * 4);
        })
        .attr('height', function() {
            return outerRadius - innerRadius;
        });
}

function setupBars() {
    var maxC = d3.max(demoChallengesArray, function(d,i) {
        return d.quantity;
    });
    challengeScale = d3.scale.linear().domain([0,maxC]).range([0,(outerRadius * 3)]);

    demoChallengesBars
        .selectAll('rect')
        .data(demoChallengesArray)
        .enter()
        .append('rect')
        .attr('x', function(d, i) {
            return i * (barWidth + 5);
        })
        .attr('y', function(d) {
            return (outerRadius * 3) - challengeScale(d.quantity);
        })
        .attr('width', function() {
            return barWidth;
        })
        .attr('height', function(d) {
            return challengeScale(d.quantity);
        })
        .attr('fill', demoColors[3])
        .on('mousemove', moveCategory)
        .on('mouseover', showCategory)
        .on('mouseout', hideCategory)
        .classed('clickMe', true)
        .on('click', updateDemoFilters);
}

function updateBars() {
    var maxC = d3.max(demoChallengesArray, function(d,i) {
        return d.quantity;
    });
    challengeScale = d3.scale.linear().domain([0,maxC]).range([0,(outerRadius * 3)]);
    demoChallengesBars.selectAll('rect')
        .data(demoChallengesArray)
        .transition().duration(1000)
        .attr('x', function(d, i) {
            return i * (barWidth + 5);
        })
        .attr('y', function(d) {
            return (outerRadius * 3) - challengeScale(d.quantity);
        })
        .attr('width', function() {
            return barWidth;
        })
        .attr('height', function(d) {
            return challengeScale(d.quantity);
        });
}

function setupPies() {
    for(var category in demoPies) {
        var path = demoPies[category].selectAll("path")
        .data(donut(demoPiesArray[category]))
        .enter().append("path")
            .attr("fill", function(d, i) {
                if(d.data.category === 'unspecified') {
                    return 'rgb(180,180,180)';
                }
                else {
                    return demoColors[i];
                }
            })
            // .each(function(d) { this._current = d.quantity; }) // store the initial values
            .attr("d", pieArc)
            .on('mousemove', moveCategory)
            .on('mouseover', showCategory)
            .on('mouseout', hideCategory)
            .on('click', updateDemoFilters)
            .classed('clickMe', true)
            .each(function(d) { this._current = d; });
    }

    //gov
    var path2 = demoGovernment.selectAll("path")
        .data(donut(demoGovernmentArray))
        .enter().append("path")
            .attr("fill", function(d, i) {
                if(d.data.category === 'unspecified') {
                    return 'rgb(180,180,180)';
                }
                else {
                    return demoColors[i];
                }
            })
            // .each(function(d) { this._current = d.quantity; }) // store the initial values
            .attr("d", govArc)
            .on('mousemove', moveCategory)
            .on('mouseover', showCategory)
            .on('mouseout', hideCategory)
            .on('click', updateDemoFilters)
            .classed('clickMe', true)
            .each(function(d) { this._current = d; });
}

function updatePies() {
    for(var category in demoPies) {
        var path = demoPies[category].selectAll("path")
            .data(donut(demoPiesArray[category]))
            .transition().duration(1000).attrTween('d', pieArcTween);
    }
    var path2 = demoGovernment.selectAll("path")
            .data(donut(demoGovernmentArray))
            .transition().duration(1000).attrTween('d', govArcTween);
}

function pieArcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return pieArc(i(t));
  };
}

function govArcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return govArc(i(t));
  };
}