/*jslint nomen: true, unparam: true, regexp: true */
/*global jQuery, window, document */

// ===================================================
// main
// ===================================================

var kk = {

    whom_to_ask: "KK",

    add_question: function( text ) {
        var html =
            '<div class="interviewer bubble">';
        html +=     '<div class="triangle-border left text-fragment">';
        html +=         '<div class="icon"></div>';
        html +=         text;
        html +=     '<div class="timestamp">' + new Date().toUTCString() + '</div>';
        html +=     '</div>';
        html += '</div>';
        jQuery(".discussion").prepend( html );
    },

    add_answer: function( text, options ) {
        options = options || {};
        var html =
            '<div class="person bubble">';
        if ( true === options["error"] ) {
            html += '<div class="triangle-border right text-fragment alert alert-danger">';
            text = "ERROR: " + text;
        }else {
            html += '<div class="triangle-border right text-fragment">';
        }
        if ( true === options["backoff"] ) {
            html += '<div class="icon-backoff"></div>';
        }else {
            html += '<div class="icon"></div>';
        }
        html +=         text;
        html +=     '<div class="timestamp">' + new Date().toUTCString() + '</div>';
        html +=     '</div>';
        html += '</div>';
        jQuery(".discussion").prepend( html );
    },

    handle_error: function( data ) {
        if ( data.hasOwnProperty('error') ) {
            kk.add_answer(data.error, { error: true });
        }else {
            kk.add_answer(data, { error: true });
        }
    },

    ask: function( person, question ) {
        var to_send = {
            person: kk.whom_to_ask,
            question: question
        };

        // ask
        jQuery.ajax({
            url: './chat/get',
            data: to_send,
            type: 'POST',
            crossDomain: true,

            success: function (data) {
                if ( data.hasOwnProperty('answer') ) {
                    kk.add_answer(data.answer);
                    return;
                }
                if ( data.hasOwnProperty('backoff') ) {
                    kk.add_answer(data.backoff, { backoff: true });
                    return;
                }
                kk.handle_error( data );
            },

            error: function (data) {
                kk.handle_error( data );
            }
        });

    },

    version: function( ftor_success, ftor_error ) {
        // ask
        jQuery.ajax({
            url: './version',
            type: 'GET',
            crossDomain: true,
            success: function (data) {
                ftor_success( data );
            },
            error: function (data) {
                ftor_error( data );
            }
        });
    },

    check_online: function() {
        jQuery("#online span").removeClass();
        jQuery("#online span").html('');
        kk.version(
            function(data) {
                jQuery("#online").addClass( "label label-success" );
                jQuery("#online span").addClass("glyphicon glyphicon-ok-circle");
                jQuery("#online span").append( ' v' + data.version );
            }, function(data) {
                jQuery("#online").addClass( "label label-danger" );
                jQuery("#online span").addClass("glyphicon glyphicon-remove-circle");
            }
        );
    }

}; // kk


// wait for the DOM to be loaded
jQuery(document).ready(function () {

    jQuery("#ask").click(function () {
        // get question from textarea
        var question = jQuery("#asker").val();
        // show question
        kk.add_question( question );
        // ask
        kk.ask( kk.whom_to_ask, question );
    }); // click


    jQuery("#clear").click(function () {
       jQuery("#asker").val("");
    });

    // are we online
    kk.check_online();

    // start conversation
    kk.add_answer( 'Tak se ptejte' );

});
