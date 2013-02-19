function setEvents() {
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
        challengeInfo.toggleClass('challengeDropdown');
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
        var text = $('.searchField').val(),
            displayText = '{' + text + '}',
            html = '<p data-padre=999>' + displayText + '</p>';

        //check if the filter exists from that category already, if so, replace
        var found = false;
        //go thru each filter, check it data-padre matches index
        $('.filterList p').each(function(i) {
            var old = parseInt($(this).attr('data-padre'),10);
            if(old === 999) {
                $(this).text(displayText);
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
        filterKeyword(text);
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

    //handle challenge selection
    $('.selectLink').bind('click', function(e) {
        e.preventDefault();
        var num = $(this).attr('data-num');
        $('.downButton').toggleClass('rotateNinety');
        challengeInfo.toggleClass('challengeDropdown');
        $('.challengeInfo ul').fadeToggle(100);
        changeChallenge(num);
        return false;
    });
}
