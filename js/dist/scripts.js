var MY_UTILS = ( function( $ ) {

    var Utils = {
        $document:      $( document ),
        $window:        $( window ),
        $body:          $( 'body' ),
        $scrollRoot:    $( 'html, body'),

        $functionElems: null,
        $targetElems: null,

        selectors: {
            functionElement:    '[data-fn]',
            targetElement:      '[data-tg]'
        },

        attributes: {
            target:     'data-fn-target',
            options:    'data-fn-options'
        },

        classes: {
            open:           'show',
            animating:      'animating',
            animatingIn:    'animating-in',
            animatingOut:   'animating-out'
        },
		
		mediaSize: null,
        mediaSizes: [ 
            {
                breakpoint: 0,
                label: 'xs'
            },
            {
                breakpoint: 576,
                label: 'sm'
            },
            {
                breakpoint: 768,
                label: 'md'
            },
            {
                breakpoint: 992,
                label: 'lg'
            },
            {
                breakpoint: 1200,
                label: 'xl'
            }
        ],

        anchorOffsetTop: 0
    };

    // cache all functional elements
    var $functionAndTargetElems = $( Utils.selectors.functionElement + ', ' + Utils.selectors.targetElement );
    Utils.$functionElems = $functionAndTargetElems.filter( Utils.selectors.functionElement );
    Utils.$targetElems = $functionAndTargetElems.filter( Utils.selectors.targetElement );

    // anchors offset top
    var anchorOffsetTopSelector = '[data-fn="anchor-offset-elem"]';
    var anchorOffsetTopDistance = 20;
    var $anchorOffsetTopElem = Utils.$functionElems.filter( anchorOffsetTopSelector );

    $.fn._getAnchorOffset = function() {
        return ( ( $anchorOffsetTopElem.length > 0 ) ? this.outerHeight(): 0 ) + anchorOffsetTopDistance;
    }

    Utils.anchorOffsetTop = $anchorOffsetTopElem._getAnchorOffset();

    Utils.$window.on( 'sizeChange', function() {
        Utils.anchorOffsetTop = $anchorOffsetTopElem._getAnchorOffset();
    } );

    // convert type
    function _convertType( value ) {
        try {
            value = JSON.parse( value );
            return value;
        } 
        catch( e ) {
            // 'value' is not a json string.
            return value
        }
    }

    // get transition duration
    $.fn.getTransitionDuration = function() {
        var duration = 0;
        var cssProperty = 'transition-duration';
        var prefixes = [ 'webkit', 'ms', 'moz', 'o' ];
        if ( this.css( cssProperty ) ) {
            duration = this.css( cssProperty );
        }
        else {
            for ( i = 0; i < prefixes.length; i++ ) {
                if ( this.css( '-' + prefixes[ i ] + '-' + cssProperty ) ) {
                    duration = this.css( '-' + prefixes[ i ] + '-' + cssProperty );
                    break;
                }
            }
        }
        return ( duration.indexOf( 'ms' ) > -1 ) ? parseFloat( duration ) : parseFloat( duration ) * 1000;
    };

    // set and remove animation class
    $.fn.setRemoveAnimationClass = function( animatingClass ) {
        var currentAnimatingClass = ( !! animatingClass ) ? animatingClass : Utils.classes.animating;
        var $this = $( this );
        var transitionDuration = $this.getTransitionDuration();
        if ( transitionDuration > 0 ) {
            $this.addClass( animatingClass );
            var timeout = setTimeout( function() {
                $this.removeClass( animatingClass );
            }, transitionDuration );
        }
    };

    // check if element is positiones inside (x, y, width, height) of another element
    $.fn.elemPositionedInside = function( container ) {

        var $this = $( this );
        var $container = $( container );

        var elemOffsetLeft = $this.offset().left;
        var elemOffsetTop = $this.offset().top;
        var elemWidth = $this.width();
        var elemHeight = $this.height();

        var containerOffsetLeft = $container.offset().left;
        var containerOffsetTop = $container.offset().top;
        var containerWidth = $container.outerWidth(); // include border since offset will calulate only to border
        var containerHeight = $container.outerHeight();

        return elemOffsetLeft >= containerOffsetLeft
            && ( elemOffsetLeft + elemWidth ) <= ( containerOffsetLeft + containerWidth )
            && elemOffsetTop >= containerOffsetTop
            && ( elemOffsetTop + elemHeight ) <= ( containerOffsetTop + containerHeight );
    };

    // aria expanded
    $.fn.ariaExpanded = function( value ) {
        if ( typeof value !== 'undefined' ) {
            $( this ).attr( 'aria-expanded', value );
            return value;
        }
        return _convertType( $( this ).attr( 'aria-expanded' ) );
    };

    // aria
    $.fn.aria = function( ariaName, value ) {
        if ( typeof value !== 'undefined' ) {
            $( this ).attr( 'aria-' + ariaName, value );
            return value;
        }
        else {
            return _convertType( $( this ).attr( 'aria-' + ariaName ) );
        }
    };
	
	// media size (media change event)
	var mediaSize = '';
    var mediaSizeBodyClassPrefix = 'media-';

	_getmediaSize = function() {
		var currentmediaSize;
		if ( !! window.matchMedia ) {
			// modern browsers
			for ( i = 0; i < Utils.mediaSizes.length - 1; i++ ) {
				if ( window.matchMedia( '(max-width: ' + ( Utils.mediaSizes[ i + 1 ].breakpoint - 1 ) + 'px)' ).matches ) {
					currentmediaSize = Utils.mediaSizes[ i ].label;
					break;
				}
				else {
					currentmediaSize = Utils.mediaSizes[ Utils.mediaSizes.length - 1 ].label;
				}
			}
		}
		else {
			// fallback old browsers
			for ( i = 0; i < Utils.mediaSizes.length - 1; i++ ) {
				if ( Utils.$window.width() < Utils.mediaSizes[ i + 1 ].breakpoint ) {
					currentmediaSize = Utils.mediaSizes[ i ].label;
					break;
				}
				else {
					currentmediaSize = Utils.mediaSizes[ Utils.mediaSizes.length - 1 ].label;
				}
			}
		}
		if ( currentmediaSize != Utils.mediaSize ) {
            // remove / set body class
            Utils.$body.removeClass( mediaSizeBodyClassPrefix + Utils.mediaSize );
            Utils.$body.addClass( mediaSizeBodyClassPrefix + currentmediaSize );

			Utils.mediaSize = currentmediaSize;
			Utils.$window.trigger( 'sizeChange' );
		}
	};
	Utils.$document.ready( function() {
		_getmediaSize();
		Utils.$window.trigger( 'sizeChangeReady' );
	} );
	Utils.$window.on( 'resize', function() {
		_getmediaSize();	
	} );
	// /media size (media change event)

    // get options from attribute
    // syntax: data-fn-options="{ focusOnOpen: '[data-tg=\'header-search-input\']', bla: true, foo: 'some text content' }"
    $.fn.getOptionsFromAttr = function () {
        var $this = $(this);
        var options = $this.attr( Utils.attributes.options );
        if ( typeof options !== 'undefined' ) {
            return ( new Function( 'return ' + options ) )();
        }
        else {
            return false;
        }
    }
    // /get options from attribute

    return Utils;
} )( jQuery );

var DIB_ELECTION_CALCULATOR = ( function( $ ) {

    var DibElectionCalculator = {

        getResult: function( input ) {
/*

(FALL 1: gemeinsame Wahl -> "joint" == true bzw. typeof "current" === 'string' )

input = {
    "structure": [
        {
            "name": "Vorsitzende",
            "count": 2,
            "joint": true
        },
        {
            "name": "Schatzmeister*in",
            "count": 1
        },
        {
            "name": "weitere Mitglieder",
            "count": 2,
            "joint": true,
            "overall": true
        }
    ],
    "current": "weitere Mitglieder",
    "previous": [
        {
            "candidate": {
                "name": "Lina Limone",
                "female": true,
                "diverse": false
            }
        },
        {
            "candidate": {
                "name": "Manfred Mango",
                "female": false,
                "diverse": false
            }
        },
        {
            "candidate": {
                "name": "Melly Melone",
                "female": true,
                "diverse": false
            }
        }
    ],
    "candidates": [
        {
            "candidate": {
                "name": "Maria Maracuja",
                "female": true,
                "diverse": true
            },
            "yes": 10,
            "no": 0
        },
        {
            "candidate": {
                "name": "Bernard Banane",
                "female": false,
                "diverse": false
            },
            "yes": 12,
            "no": 1
        },
        {
            "candidate": {
                "name": "Kira Kirsch-Banane",
                "female": true,
                "diverse": false
            },
            "yes": 18,
            "no": 2
        },
        {
            "candidate": {
                "name": "Alfred Apfel",
                "female": false,
                "diverse": true
            },
            "yes": 15,
            "no": 3
        },
        {
            "candidate": {
                "name": "Anna Ananas",
                "female": true,
                "diverse": true
            },
            "yes": 12,
            "no": 4
        },
        {
            "candidate": {
                "name": "Cora Cocos",
                "female": true,
                "diverse": false
            },
            "yes": 7,
            "no": 1
        }
    ]
}


(FALL 2: einzelne Wahl -> "joint" != true bzw. typeof "current" === 'object')

input = {
    "structure": [
        {
            "name": "Vorsitzende",
            "count": 2,
            "joint": false
        },
        {
            "name": "Schatzmeister*in",
            "count": 1
        },
        {
            "name": "weitere Mitglieder",
            "count": 2,
            "joint": false,
            "overall": true
        }
    ],
    "current": [
        "weitere Mitglieder",
        0
    ],
    "previous": [
        {
            "candidate": {
                "name": "Lina Limone",
                "female": true,
                "diverse": false
            }
        },
        {
            "candidate": {
                "name": "Manfred Mango",
                "female": false,
                "diverse": false
            }
        },
        {
            "candidate": {
                "name": "Melly Melone",
                "female": true,
                "diverse": false
            }
        }
    ],
    "candidates": [
        {
            "candidate": {
                "name": "Maria Maracuja",
                "female": true,
                "diverse": true
            },
            "yes": 10,
            "no": 0
        },
        {
            "candidate": {
                "name": "Bernard Banane",
                "female": false,
                "diverse": false
            },
            "yes": 12,
            "no": 1
        },
        {
            "candidate": {
                "name": "Kira Kirsch-Banane",
                "female": true,
                "diverse": false
            },
            "yes": 18,
            "no": 2
        },
        {
            "candidate": {
                "name": "Alfred Apfel",
                "female": false,
                "diverse": true
            },
            "yes": 15,
            "no": 3
        },
        {
            "candidate": {
                "name": "Anna Ananas",
                "female": true,
                "diverse": true
            },
            "yes": 12,
            "no": 4
        },
        {
            "candidate": {
                "name": "Cora Cocos",
                "female": true,
                "diverse": false
            },
            "yes": 7,
            "no": 1
        }
    ]
}


output = {
    "candidates": [
        {
            "candidate": {
                "name": "Holly Holunder",
                "female": true,
                "diverse": false
            }
        },
        {
            "candidate": {
                "name": "Hila Himbeere",
                "female": true,
                "diverse": true
            }
        }
    ],
    "explanation": [
        {
            "headline": "Vielfaltsquote erfüllen",
            "content": [
                {
                    "headline": "",
                    "type": "text",
                    "items": [
                        {
                            "item": "Die aktuelle Auswahl erfüllt nicht die Vielfaltsquote."
                        },
                        {
                            "item": "Penelope Pineapple wird durch Olivia Orange ersetzt."
                        }
                    ]
                },
                {
                    "headline": "Neue Auswahl",
                    "type": "list"
                    "items": [
                        {
                            "item": "Lina Limone",
                            "selected": true
                        },
                        {
                            "item": "Manfred Mango",
                            "selected": false
                        },
                        {
                            "item": "Penelope Pineapple",
                            "selected": true
                        },
                        {
                            "item": "Olivia Orange",
                            "selected": true
                        }
                    ]
                }
            ]  
        }
    ]
}
*/

            function error (message) {
                return {error: message};
            }

            function stringify (object) {
                return JSON.stringify (object,null,2);
            }

            function log (message) {
                console.log (message);
            }
            
            log ("***********");
            log ("** INPUT **");
            log ("***********");
            log (stringify (input));
            log ("***********");

            var explanation = [];

            // find the current election in the election structure array
            var current = 0;
            while (current < input.structure.length && input.structure [current].name != input.current)
                current++;

            if (current >= input.structure.length)
                return error ("current election is not configured");

            var structure = input.structure [current];

            if (!structure.joint && structure.count != 1)
                return error ("only joint elections implemented");

            // determine the successful candidates in the sense of §10
            var candidates = input.candidates.filter (candidate => Number (candidate.yes) > Number (candidate.no));
            
            // sort the candidates in lexical order by yes votes, then yes minus no votes, then a random number to resolve ties 
            // TODO: ensure consistency of random lots across repeated evaluations
            for (var candidate of candidates)
                candidate.priority = [Number (candidate.yes),-Number (candidate.no),Math.random ()]; // no is only compared if yes is equal; thus -no is equivalent to yes - no

            // compare two arrays of numbers (of equal length) in lexical order 
            function lexicalOrderArrayComparison (a,b) {
                if (a.length != b.length)
                    return error  ("array lengths for lexical order comparison differ");
                for (var i = 0;i < a.length;i++) {
                    diff = b [i] - a [i];
                    if (diff)
                        return diff;
                }
                return 0;
            }
            
            candidates.sort (function (a,b) {
                return lexicalOrderArrayComparison (a.priority,b.priority);
            });

            // remove temporary entries used only for sorting
            for (var candidate of candidates)
                delete candidate.priority;

            log ("successful candidates: " + stringify (candidates));

            var reverseCandidates = candidates.slice ().reverse ();

            // determine the quotas (§6 (2))

            // determine the count from which the quota are calculated
            // if the quotas refer only to these offices, the count is the number of offices being elected
            var count = structure.count;
            
            // if the quotas refer to a body overall (§5 (4)) the count is the number of offices being elected plus the number of offices previously elected in the same body 
            if (structure.overall)
                count += input.previous.length;
            
            var quotas = {
                    "female" : count == 1 ? 0 : (count + 1) >> 1, // at least 50%, but no quota is applied to single offices
                    "diverse" : (count + 1) >> 2                  // equivalent to §5 (3) WO : 1 for 3, 2 for 7, ...
            };
            
            log ("quotas: " + stringify (quotas));

         // if the quotas refer to a body overall, reduce them according to the previously elected candidates
            if (structure.overall) {
                for (var group of ["female","diverse"])
                    for (var previousCandidate of input.previous)
                        if (previousCandidate.candidate [group])
                            quotas [group]--;
                log ("remaining quotas in overall election: " + stringify (quotas));
            }

            // limit the quotas to the number of offices being elected
            for (var group in quotas)
                if (quotas [group] > count) {
                    log ("more reservations for " + group + " candidates than offices");
                    quotas [group] = count;
                }

            // initially, the top candidates are selected, §6 (4)
            for (var i = 0;i < structure.count && i < candidates.length;i++)
                candidates [i].selected = true;
            
            // number of selected candidates of a given group
            function countGroup (group) {
                return candidates.filter (candidate => candidate.selected && candidate.candidate [group]).length;
            };
            
            // is the quota fulfilled for a given group?
            function isRepresented (group) {
                return countGroup (group) >= quotas [group];
            };

            // not more successful candidates than offices -- they're all elected 
            if (candidates.length <= structure.count) {
                // TODO: announce (non)fulfilment of diversity quota
                log ((candidates.length == structure.count ? "as many successful candidates as" : "fewer successful candidates than") + " offices -- all successful candidates have been elected");
            }
            // more successful candidates than offices -- try to fulfill the quotas
            else {
                // describe a given candidate by name and group membership
                function candidateDescription (candidate) {
                    var result = candidate.name;
                    if (candidate.female)
                        result += " (f)";
                    if (candidate.diverse)
                        result += " (v)";
                    return result;
                }
                
                function printSeparator () {
                    log ("------------------------------------------------------------------");
                }
    
                function printCandidates () {
                    for (var candidate of candidates)
                        log ((candidate.selected ? "** " : "   ") + candidateDescription (candidate.candidate));
                    printSeparator ();
                }
                
                log ("initial selection:");
                
                printCandidates ();
                
                // find the first candidate who is not selected and fulfils a given condition
                function findFirstNonSelected (condition) {
                    return candidates.find (candidate => condition (candidate) && !candidate.selected);
                }
                
                // find the last candidate who is selected and fulfils a given condition
                function findLastSelected (condition) {
                    return reverseCandidates.find (candidate => condition (candidate) && candidate.selected);
                }
            
                // find the first candidate who is not selected and is a member of a given group
                function findFirstNonSelectedMember (group) {
                    return findFirstNonSelected (candidate => candidate.candidate [group]);
                };
                
                // find the last candidate who is selected and is not a member of a given group
                function findLastSelectedNonMember (group) {
                    return findLastSelected (candidate => !candidate.candidate [group]);
                };
                
                // replace one given candidate by another in the selection
                function replace (replacing,replaced) {
                    log ("replacing " + replaced.candidate.name + " by " + replacing.candidate.name);
    
                    replacing.selected = true;
                    replaced.selected = false;
                }

                // fulfil the diversity quota (§6 (5))
                if (quotas.diverse) {
                    log ("ensuring diversity quota");
                    printSeparator ();

                    while (!isRepresented ("diverse")) {
                        var replacing = findFirstNonSelectedMember ("diverse");
                        if (!replacing) {
                            log ("not enough successful candidates to fulfil diversity quota");
                            break;
                        }
        
                        var replaced = findLastSelectedNonMember ("diverse");
                        if (!replaced)
                            return error ("more reservations for diversity than offices");
        
                        replace (replacing,replaced);
                        printCandidates ();
                    }

                    var diversityQuotaFulfilled = isRepresented ("diverse");
                    log (diversityQuotaFulfilled ? "diversity quota fulfilled" : "diversity quota not fulfilled");
                    printCandidates ();
        
                    // if the diversity quota can't be fulfilled, adjust it to the number of successful diverse candidates  
                    if (!diversityQuotaFulfilled)
                        quotas.diverse = countGroup ("diverse");
                }
                else
                    log ("no diversity quota applies");

                // fulfil the women's quota (§6 (6))
    
                if (quotas.female) {
                    log ("ensuring women's quota");
                    printSeparator ();
                    while (!isRepresented ("female")) {
                        // first just try to replace the last selected non-female by the first non-selected female (§6 (6) 1st sentence)
                        var replacing = findFirstNonSelectedMember ("female");
                        if (!replacing) {
                            log ("not enough successful candidates to fulfil women's quota");
                            break;
                        }

                        var replaced = findLastSelectedNonMember ("female");
                        if (!replaced)
                            throw new Error ("more reservations for women than offices");

                        replace (replacing,replaced);

                        // now check if the replacement violated the diversity quota 
                        if (!isRepresented ("diverse")) {
                            log ("replacement violated diversity quota -- undoing");
                            replace (replaced,replacing); // undo replace

                            // standard replacement violated diversity quota
                            // only replace non-diverse candidates (§6 (6) 2nd sentence, 1st part)

                            var replacedNonDiverse = findLastSelected (candidate => !candidate.candidate.female && !candidate.candidate.diverse);
                            if (replacedNonDiverse)
                                // a non-diverse candidate to be replaced was found
                                replaced = replacedNonDiverse;
                            else {
                                // there's no non-diverse candidates to be replaced
                                // only replace with diverse candidates instead (§6 (6) 2nd sentence, 2nd part)

                                var replacingDiverse = findFirstNonSelected (candidate => candidate.candidate.female && candidate.candidate.diverse);
                                if (replacingDiverse)
                                    // a diverse candidate who can replace was found
                                    replacing = replacingDiverse;
                                else
                                    log ("cannot make a replacement without violating diversity quota -- women's quota can't be fulfilled");
                            }

                            replace (replacing,replaced);
                        }           

                        printCandidates ();
                    }
                    log (isRepresented ("female") ? "women's quota fulfilled" : "women's quota not fulfilled");
                    printSeparator ();
                }
                else
                    log ("no women's quota applies");
            }
            
            log ("Final selection:");
            
            for (var selectedCandidate of candidates.filter (candidate => candidate.selected))
                log (selectedCandidate.candidate.name);

            var output = {};
            // outpupt.explanation = explanation; 
            // Kann mir jemand erklären, warum das nicht funktioniert, wenn ich stattdessen "map (candidate => {candidate: candidate.candidate})" schreibe?
            output.candidates = candidates.filter (candidate => candidate.selected).map (function (candidate) { return {candidate: candidate.candidate}});        

            log ("output: " + stringify (output));
            
            // remove temporary property used for selection
            for (var candidate of candidates)
                delete candidate.selected;
            
            return output;
        }
    };

    return DibElectionCalculator;

} )( jQuery );

( function() {
	
	// detect ios / android
	var isIos = /iPad|iPhone|iPod/.test( navigator.platform ) && ! window.MSStream;
	var isAndroid = /(android)/i.test( navigator.userAgent );
	if ( isIos ) {
		document.body.className += ' is-ios';
	}
	else if ( isAndroid ) {
		document.body.className += ' is-android';
	}
	
	function detectIE() {
		var ua = window.navigator.userAgent;
		var msie = ua.indexOf( 'MSIE ' );
			if ( msie > 0 ) {
			return parseInt( ua.substring( msie + 5, ua.indexOf( '.', msie ) ), 10 );
		}
		var trident = ua.indexOf( 'Trident/' );
		if ( trident > 0 ) {
			var rv = ua.indexOf( 'rv:' );
			return parseInt( ua.substring( rv + 3, ua.indexOf( '.', rv ) ), 10 );
		}
		var edge = ua.indexOf( 'Edge/' );
		if ( edge > 0 ) {
			return parseInt( ua.substring( edge + 5, ua.indexOf( '.', edge ) ), 10 );
		}
		return false;
	}

	// detect ie gt 9
	var ieMaxVersion = 14;
	var ieVersion = detectIE();
	if ( ieVersion !== false && ieVersion > 9 ) {
		document.body.className += ' ie ie' + ieVersion;
		for ( i = ieVersion; i <= ieMaxVersion; i++ ) {
			document.body.className += ' ielte' + i;
		}
	}

	// fix ios missing body click event (set event to all div elements which are children of body)
	if ( isIos ) {
		var bodyChildren = document.body.children;
		for ( i = 0; i < bodyChildren.length; i++ ) {
			if ( bodyChildren[ i ].tagName == 'DIV' ) {
				bodyChildren[ i ].setAttribute( 'onclick', 'void(0);' );
			}
		}
	}

} )();
( function( $, Utils ) {

    // smooth scrolling to anchors
    $.fn.animatedAnchors = function( options ) {

        var $elems = $( this );

        var defaults = {
            scrollToInitialHash: true,
            scrollDurationMin: 300,
            scrollDurationMax: 800,
            scrollDurationPer1000: 400,
            offset: function() {
                return 0;
            },
            scrollTolerance: 1, // scroll little bit more than to anchor position to make sure to trigger scrollspy
            fixedClass: 'fixed'
        };

        options = $.extend( {}, defaults, options );

        $.fn._animatedScrollTo = function() {

            $this = $( this );

            var scrollTop = Utils.$window.scrollTop();
            var thisOffsetTop = $this.offset().top + options.scrollTolerance;

            var scrollDuration = Math.abs( thisOffsetTop - options.offset() - scrollTop ) * options.scrollDurationPer1000 / 1000;

            // limit scroll duration (min, max)
            if  ( scrollDuration < options.scrollDurationMin ) {
                scrollDuration = options.scrollDurationMin;
            }
            else if ( scrollDuration > options.scrollDurationMax ) {
                scrollDuration = options.scrollDurationMax;
            }

            Utils.$scrollRoot.animate({ scrollTop: ( thisOffsetTop - options.offset() ) }, scrollDuration);

        }

        // scroll to initial url anchor
        if ( options.scrollToInitialHash ) {
            var $currentAnchor = $( window.location.hash );
            if ( window.location.hash && $currentAnchor.length > 0 ) {

                // TODO: use browser native jumping to hash instead of smooth (but late) scrolling?
                // scroll to top while loading
                /*
                Utils.$document.ready( function() {
                    Utils.$scrollRoot.scrollTop( 0 );
                } );
                */
                // scroll to anchor
                $currentAnchor._animatedScrollTo();

                // scroll to anchor again after fonts loaded
                Utils.$window.on( 'load', function() {
                    $currentAnchor._animatedScrollTo();
                } );
            }
        }

        $elems.each( function() {

            var $elem = $( this );

            $elem.on( 'click', function() {

                var targetSelector = $elem.attr( 'href' );
                var $target = $( targetSelector );

                if ( $target.length > 0 ) {
                    $target._animatedScrollTo();
                }

            } );

        } );

    };

} )( jQuery, MY_UTILS );
// check slide toggle

/*

*/

( function( $, Utils ) {

    $.fn.checkSlideToggle = function( options ) {

        var defaults = {
            effectIn: 'slideDown',
            effectOut: 'slideUp',
            effectDuration: 400,
            triggerSelector: 'input[type="checkbox"]',
            openedClass: Utils.classes.open,
            animatingClass: Utils.classes.animating,
            animatingInClass: Utils.classes.animatingIn,
            animatingOutClass: Utils.classes.animatingOut
        };

        options = $.extend( {}, defaults, options );

        var $elems = $( this );

        $elems.each( function() {

            var $elem = $( this );
            var $elemTrigger = $elem.find( options.triggerSelector );
            var $elemBody = $elem.find( $( $elemTrigger.attr( 'aria-controls' ) ) );

            // initial set closed
            if ( ! $elemTrigger.is( ':checked' ) ) {
                $elem.removeClass( options.openedClass );
                $elemTrigger.ariaExpanded( false );
                $elemBody.hide();
            }
            else {
                $elem.addClass( options.openedClass );
                $elemTrigger.ariaExpanded( true );
                $elemBody.show();
            }

            // bind click event
            $elemTrigger.on( 'change', function() {

                if ( ! $elemTrigger.ariaExpanded() ) {
                    $elem
                        .addClass( options.animatingClass )
                        .addClass( options.animatingInClass );
                    $elemTrigger.ariaExpanded( true );
                    $elemBody
                    .stop()[ options.effectIn ]( options.effectDuration, function() {
                        $elem
                            .addClass( options.openedClass )
                            .removeClass( options.animatingClass )
                            .removeClass( options.animatingInClass );
                    } );
                }
                else {
                    $elem
                        .addClass( options.animatingClass )
                        .addClass( options.animatingOutClass )
                        .removeClass( options.openedClass );
                    $elemTrigger.ariaExpanded( false );
                    $elemBody.stop()[ options.effectOut ]( options.effectDuration, function() {
                        $elem
                            .removeClass( options.animatingClass )
                            .removeClass( options.animatingOutClass );
                    } );
                }

            } );

        } );

    };

} )( jQuery, MY_UTILS );
// dib elections tool

( function( $, Utils, DibElectionCalculator ) {

	var electionConfig = {
		"Vorstand": [
			{
				"name": "Vorsitzende",
				"count": 2
			},
			{
				"name": "Schatzmeister*in",
				"count": 1
			},
			{
				"name": "weitere Mitglieder",
				"count": "variable",
				"countVariable": true,
				"overall": true
			}
		],
		"Schiedsgericht": [
			{
				"name": "Richter*innen",
				"count": 3
			},
			{
				"name": "Ersatzrichter*innen",
				"count": 2,
				"overall": true
			}
		],
		"Kassenprüfer*innen": [
			{
				"name": "Kassenprüfer*innen",
				"count": 2
			}
		]
	};

	// LOCAL STORAGE
	var localStorageKey = 'currentElectionConfig';
	// get current config from local storage if exists – set with: localStorage.setItem( localStorageKey, stringigiedContent );
	if ( localStorage.getItem( localStorageKey ) ) {
		currentElectionPreset = JSON.parse( localStorage.getItem( localStorageKey ) );
	}

	// TEST – TODO: remove
	var currentElectionPreset;

	var url = new URL( document.location.href );
	var preset = url.searchParams.get( 'preset' );
	
	if ( preset == 2 ) {
		// TEST (test configuration joint and single election) – TODO: remove
		currentElectionPreset = {
			"Vorstand": [
				{
					"name": "Vorsitzende",
					"count": 2,
					"joint": true,
					"candidates": [
						{
							"candidate": {
								"name": "Lina Limone",
								"female": true,
								"diverse": false
							},
							"yes": 18,
							"no": 2
						},
						{
							"candidate": {
								"name": "Manfred Mango",
								"female": false,
								"diverse": false
							},
							"yes": 12,
							"no": 1
						},
						{
							"candidate": {
								"name": "Olivia Orange",
								"female": true,
								"diverse": true
							},
							"yes": 12,
							"no": 0
						}
					]
				},
				{
					"name": "Schatzmeister*in",
					"count": 1,
					"candidates": [
						{
							"candidate": {
								"name": "Anna Ananas",
								"female": true,
								"diverse": true
							},
							"yes": 12,
							"no": 4
						},
						{
							"candidate": {
								"name": "Cora Cocos",
								"female": true,
								"diverse": false
							},
							"yes": 7,
							"no": 1
						}
					]
				},
				{
					"name": "weitere Mitglieder",
					"count": 3,
					"countVariable": true,
					"overall": true,
					"joint": false,
					"candidates": [
						[
							{
								"candidate": {
									"name": "Maria Maracuja",
									"female": true,
									"diverse": true
								},
								"yes": 12,
								"no": 0
							},
							{
								"candidate": {
									"name": "Bernard Banane",
									"female": false,
									"diverse": false
								},
								"yes": 12,
								"no": 1
							}
						],
						[
							{
								"candidate": {
									"name": "Kira Kirsch-Banane",
									"female": true,
									"diverse": false
								},
								"yes": 18,
								"no": 2
							},
							{
								"candidate": {
									"name": "Alfred Apfel",
									"female": false,
									"diverse": true
								},
								"yes": 11,
								"no": 3
							},
							{
								"candidate": {
									"name": "Anna Ananas",
									"female": true,
									"diverse": true
								},
								"yes": 12,
								"no": 4
							},
							{
								"candidate": {
									"name": "Cora Cocos",
									"female": true,
									"diverse": false
								},
								"yes": 7,
								"no": 1
							}
						],
						[
							{
								"candidate": {
									"name": "Kilian Kiwi",
									"female": false,
									"diverse": true
								},
								"yes": 7,
								"no": 0
							},
							{
								"candidate": {
									"name": "Mandy Mandarine",
									"female": true,
									"diverse": true
								},
								"yes": 8,
								"no": 2
							},
							{
								"candidate": {
									"name": "Melly Melone",
									"female": true,
									"diverse": false
								},
								"yes": 15,
								"no": 3
							}
						]
					]
				}
			]
		};
	}
	else if ( preset == 1 ) {
		// TEST (test configuration joint election) – TODO: remove
		currentElectionPreset = {
			"Vorstand": [
				{
					"name": "Vorsitzende",
					"count": 2,
					"joint": true,
					"candidates": [
						{
							"candidate": {
								"name": "Lina Limone",
								"female": true,
								"diverse": false
							},
							"yes": 18,
							"no": 2
						},
						{
							"candidate": {
								"name": "Manfred Mango",
								"female": false,
								"diverse": false
							},
							"yes": 12,
							"no": 1
						},
						{
							"candidate": {
								"name": "Olivia Orange",
								"female": true,
								"diverse": true
							},
							"yes": 12,
							"no": 0
						}
					],
					"results": [
						{
							"candidate": {
								"name": "Lina Limone",
								"female": true,
								"diverse": false
							}
						},
						{
							"candidate": {
								"name": "Manfred Mango",
								"female": false,
								"diverse": false
							}
						}
					]
				},
				{
					"name": "Schatzmeister*in",
					"count": 1,
					"candidates": [
						{
							"candidate": {
								"name": "Kilian Kiwi",
								"female": false,
								"diverse": true
							},
							"yes": 7,
							"no": 0
						},
						{
							"candidate": {
								"name": "Mandy Mandarine",
								"female": true,
								"diverse": true
							},
							"yes": 8,
							"no": 2
						},
						{
							"candidate": {
								"name": "Melly Melone",
								"female": true,
								"diverse": false
							},
							"yes": 15,
							"no": 3
						}
					],
					"results": [
						{
							"candidate": {
								"name": "Melly Melone",
								"female": true,
								"diverse": false
							}
						}
					]
				},
				{
					"name": "weitere Mitglieder",
					"count": 3,
					"countVariable": true,
					"overall": true,
					"joint": true,
					"candidates": [
						{
							"candidate": {
								"name": "Maria Maracuja",
								"female": true,
								"diverse": true
							},
							"yes": 12,
							"no": 0
						},
						{
							"candidate": {
								"name": "Bernard Banane",
								"female": false,
								"diverse": false
							},
							"yes": 12,
							"no": 1
						},
						{
							"candidate": {
								"name": "Kira Kirsch-Banane",
								"female": true,
								"diverse": false
							},
							"yes": 18,
							"no": 2
						},
						{
							"candidate": {
								"name": "Alfred Apfel",
								"female": false,
								"diverse": true
							},
							"yes": 11,
							"no": 3
						},
						{
							"candidate": {
								"name": "Anna Ananas",
								"female": true,
								"diverse": true
							},
							"yes": 12,
							"no": 4
						},
						{
							"candidate": {
								"name": "Cora Cocos",
								"female": true,
								"diverse": false
							},
							"yes": 7,
							"no": 1
						}
					]
				}
			],
			"Schiedsgericht": [
				{
					"name": "Richter*innen",
					"count": 3,
					"joint": true,
					"candidates": [
						{
							"candidate": {
								"name": "Pablo Papaya",
								"female": false,
								"diverse": true
							},
							"yes": 8,
							"no": 0
						},
						{
							"candidate": {
								"name": "Lydia Litschi",
								"female": false,
								"diverse": false
							},
							"yes": 5,
							"no": 1
						},
						{
							"candidate": {
								"name": "Eduard Erdbeere",
								"female": true,
								"diverse": true
							},
							"yes": 7,
							"no": 0
						}
					]
				},
				{
					"name": "Ersatzrichter*innen",
					"count": 2,
					"joint": true,
					"overall": true,
					"candidates": [
						{
							"candidate": {
								"name": "Holly Holunder",
								"female": true,
								"diverse": false
							},
							"yes": 15,
							"no": 1
						},
						{
							"candidate": {
								"name": "Hila Himbeere",
								"female": true,
								"diverse": true
							},
							"yes": 9,
							"no": 0
						}
					]
				}
			]
		};
	}

	// TEST – TODO: remove
/*
	var testElectionResult = {
		"Vorstand": [
			{
				"name": "Vorsitzende",
				"count": 2,
				"joint": true,
				"candidates": [
					{
						"candidate": {
							"name": "Lina Limone",
							"female": true,
							"diverse": false
						},
						"yes": 18,
						"no": 2
					},
					{
						"candidate": {
							"name": "Manfred Mango",
							"female": false,
							"diverse": false
						},
						"yes": 12,
						"no": 1
					},
					{
						"candidate": {
							"name": "Olivia Orange",
							"female": true,
							"diverse": true
						},
						"yes": 12,
						"no": 0
					}
				],
				"results": [
					{
						"candidate": {
							"name": "Lina Limone",
							"female": true,
							"diverse": false
						}
					},
					{
						"candidate": {
							"name": "Manfred Mango",
							"female": false,
							"diverse": false
						}
					}
				]
			},
			{
				"name": "Schatzmeister*in",
				"count": 1,
				"candidates": [
					{
						"candidate": {
							"name": "Kilian Kiwi",
							"female": false,
							"diverse": true
						},
						"yes": 7,
						"no": 0
					},
					{
						"candidate": {
							"name": "Mandy Mandarine",
							"female": true,
							"diverse": true
						},
						"yes": 8,
						"no": 2
					},
					{
						"candidate": {
							"name": "Melly Melone",
							"female": true,
							"diverse": false
						},
						"yes": 15,
						"no": 3
					}
				],
				"previous": [
					{
						"candidate": {
							"name": "Lina Limone",
							"female": true,
							"diverse": false
						}
					},
					{
						"candidate": {
							"name": "Manfred Mango",
							"female": false,
							"diverse": false
						}
					}
				],
				"results": [
					{
						"candidate": {
							"name": "Melly Melone",
							"female": true,
							"diverse": false
						}
					}
				]
			},
			{
				"name": "weitere Mitglieder",
				"count": 3,
				"countVariable": true,
				"overall": true,
				"joint": true,
				"candidates": [
					{
						"candidate": {
							"name": "Maria Maracuja",
							"female": true,
							"diverse": true
						},
						"yes": 12,
						"no": 0
					},
					{
						"candidate": {
							"name": "Bernard Banane",
							"female": false,
							"diverse": false
						},
						"yes": 12,
						"no": 1
					},
					{
						"candidate": {
							"name": "Kira Kirsch-Banane",
							"female": true,
							"diverse": false
						},
						"yes": 18,
						"no": 2
					},
					{
						"candidate": {
							"name": "Alfred Apfel",
							"female": false,
							"diverse": true
						},
						"yes": 11,
						"no": 3
					},
					{
						"candidate": {
							"name": "Anna Ananas",
							"female": true,
							"diverse": true
						},
						"yes": 12,
						"no": 4
					},
					{
						"candidate": {
							"name": "Cora Cocos",
							"female": true,
							"diverse": false
						},
						"yes": 7,
						"no": 1
					}
				],
				"previous": [
					{
						"candidate": {
							"name": "Lina Limone",
							"female": true,
							"diverse": false
						}
					},
					{
						"candidate": {
							"name": "Manfred Mango",
							"female": false,
							"diverse": false
						}
					},
					{
						"candidate": {
							"name": "Melly Melone",
							"female": true,
							"diverse": false
						}
					}
				],
				"results": [
					{
						"candidate": {
							"name": "Kira Kirsch-Banane",
							"female": true,
							"diverse": false
						}
					},
					{
						"candidate": {
							"name": "Alfred Apfel",
							"female": false,
							"diverse": true
						}
					},
					{
						"candidate": {
							"name": "Anna Ananas",
							"female": true,
							"diverse": true
						}
					}
				]
			}
		],
		"Schiedsgericht": [
			{
				"name": "Richter*innen",
				"count": 3,
				"joint": true,
				"candidates": [
					{
						"candidate": {
							"name": "Pablo Papaya",
							"female": false,
							"diverse": true
						},
						"yes": 8,
						"no": 0
					},
					{
						"candidate": {
							"name": "Lydia Litschi",
							"female": false,
							"diverse": false
						},
						"yes": 5,
						"no": 1
					},
					{
						"candidate": {
							"name": "Eduard Erdbeere",
							"female": true,
							"diverse": true
						},
						"yes": 7,
						"no": 0
					}
				],
				"results": [
					{
						"candidate": {
							"name": "Pablo Papaya",
							"female": false,
							"diverse": true
						}
					},
					{
						"candidate": {
							"name": "Lydia Litschi",
							"female": false,
							"diverse": false
						}
					},
					{
						"candidate": {
							"name": "Eduard Erdbeere",
							"female": true,
							"diverse": true
						}
					}
				]
			},
			{
				"name": "Ersatzrichter*innen",
				"count": 2,
				"joint": true,
				"overall": true,
				"candidates": [
					{
						"candidate": {
							"name": "Holly Holunder",
							"female": true,
							"diverse": false
						},
						"yes": 15,
						"no": 1
					},
					{
						"candidate": {
							"name": "Hila Himbeere",
							"female": true,
							"diverse": true
						},
						"yes": 9,
						"no": 0
					}
				],
				"previous": [
					{
						"candidate": {
							"name": "Paul Papaya",
							"female": false,
							"diverse": true
						}
					},
					{
						"candidate": {
							"name": "Lydia Litschi",
							"female": false,
							"diverse": false
						}
					},
					{
						"candidate": {
							"name": "Eduard Erdbeere",
							"female": true,
							"diverse": true
						}
					}
				],
				"resultsBefore": [
					{
						"candidate": {
							"name": "Holly Holunder",
							"female": true,
							"diverse": false
						}
					},
					{
						"candidate": {
							"name": "Hila Himbeere",
							"female": true,
							"diverse": true
						}
					}
				],
				"results": {
					"candidates": [
						{
							"candidate": {
								"name": "Holly Holunder",
								"female": true,
								"diverse": false
							}
						},
						{
							"candidate": {
								"name": "Hila Himbeere",
								"female": true,
								"diverse": true
							}
						}
					],
				    "explanation": [
				        {
				            "headline": "Vielfaltsquote erfüllen",
				            "content": [
				                {
				                    "headline": "",
				                    "type": "text",
				                    "items": [
				                        {
				                            "item": "Die aktuelle Auswahl erfüllt nicht die Vielfaltsquote."
				                        },
				                        {
				                            "item": "Penelope Pineapple wird durch Olivia Orange ersetzt."
				                        }
				                    ]
				                },
				                {
				                    "headline": "Neue Auswahl",
				                    "type": "list"
				                    "items": [
				                        {
				                            "item": "Lina Limone",
				                            "selected": true
				                        },
				                        {
				                            "item": "Manfred Mango",
				                            "selected": false
				                        },
				                        {
				                            "item": "Penelope Pineapple",
				                            "selected": true
				                        },
				                        {
				                            "item": "Olivia Orange",
				                            "selected": true
				                        }
				                    ]
				                }
				            ]  
				        }
				    ]
				}
			}
		]
	};
*/

	// TODO: load existing config instead of this?
	var currentElectionConfig = ( typeof currentElectionPreset !== 'undefined' ) ? $.extend( {}, electionConfig, currentElectionPreset ) : $.extend( {}, electionConfig );
	
	// TEMPLATE SELECTORS

    var identifierSuffix = '"]';
	var formIdentifierPrefix = '[data-fn="election-step-';

	// step
	var stepIdentifierPrefix = '[data-tg="election-step-';

	// back button
	var stepPrevIdentifierPrefix = '[data-fn="election-back-';

	// form
	var stepFormIdentifierPrefix = '[data-fn="election-step-form-';

	// select
	var stepSelectIdentifierPrefix = '[data-fn="election-step-select-';

	// item
	var itemTemplateIdentifierPrefix = '[data-tg="election-item-template-';
	var itemAppendIdentifierPrefix = '[data-tg="election-item-append-';
	var itemIdentifierAttr = 'data-g-tg';
	var itemIdentifierAttrVal = 'election-item';

	var itemIdAttr = 'data-item-id';

	// subitemgroup
	var subitemgroupTemplateIdentifierPrefix = '[data-tg="election-subitemgroup-template-';
	var subitemgroupAppendIdentifierPrefix = '[data-g-tg="election-subitemgroup-append-';
	var subitemgroupIdentifierAttr = 'data-g-tg';
	var subitemgroupIdentifierAttrVal = 'election-subitemgroup';

	// subitem
	var subitemTemplateIdentifierPrefix = '[data-tg="election-subitem-template-';
	var subitemAppendIdentifierPrefix = '[data-g-tg="election-subitem-append-';
	var subitemIdentifierAttr = 'data-g-tg';
	var subitemIdentifierAttrVal = 'election-subitem';

	var subitemIdAttr = 'data-subitem-id';

	// subitem input
	var confirmDeleteInputAttr = 'data-confirm-delete';
	var confirmDeleteInputClass = 'is-invalid';

	// user interaction
	var addSubitemsIdentifier = '[data-g-fn="add-subitems"]';
	var addSubitemsCountIdentifier = '[data-g-tg="add-subitems-count"]';
	var subitemRemoveIdentifier = '[data-g-fn="election-subitem-remove"]';
	var validateNumberInputIdentifier = '[data-g-fn="validate"]';

	var downloadFileFallback = 'dib_wahl-checker_';

	// INPUT NAMES

	var itemInputs = [];
	var subitemInputs = [];

	var inputIdentifierSeparator = '_';
	var formIdentifierAttr = 'name';
	var idSeparator = '-';

	// items
	itemInputs[ 0 ] = {
		"check": {
			"selector": "[id^=\"election-check-\"]",
			"value": "true",
			"name": "election_"
		}
	};

	// subitems
	subitemInputs[ 0 ] = {
		"count": {
			"selector": "[id^=\"election-count-\"]",
			"value": "",
			"name": "count_"
		},
		"joint": {
			"selector": "[id^=\"election-joint-\"]",
			"value": "true",
			"name": "joint_",
			"saveAs": "joint"
		}
	};
	subitemInputs[ 1 ] = {
		"name": {
			"selector": "[id^=\"name-\"]",
			"value": "",
			"name": "name_",
			"confirmSubitemDelete": true,
			"saveAs": "name"
		},
		"female": {
			"selector": "[id^=\"female-check-\"]",
			"value": "true",
			"name": "female_",
			"saveAs": "female"
		},
		"diverse": {
			"selector": "[id^=\"diverse-check-\"]",
			"value": "true",
			"name": "diverse_",
			"saveAs": "diverse"
		}
	};
	subitemInputs[ 2 ] = {
		"yes": {
			"selector": "[id^=\"votes-yes-\"]",
			"value": "",
			"name": "yes_",
			"saveAs": "yes"
		},
		"no": {
			"selector": "[id^=\"votes-no-\"]",
			"value": "",
			"name": "no_",
			"saveAs": "no"
		}
	};

	// ui content
	var electionTitleSeparator = ' » ';
	var addEmptyCandidatesCount = 3; // add x more empty items then candidates to elect
	var selectInitialOption = '<option value="-1" selected>Alle</option>';

	// FUNCTIONS

	// replace placeholders
	$.fn._replaceTemplatePlaceholders = function( replaceArr ) {
		// replaceArr = [ [ find, replace ], ... ]

		var $template = $( this );

		if ( $template.length > 0 ) {

			for ( var i = 0; i < replaceArr.length; i++ ) {
	        	var replaceString = '{{ ' + replaceArr[ i ][ 0 ] + ' }}';
	        	var regex = new RegExp( replaceString, 'g' );
				$template.html( $template.html().replace( regex, replaceArr[ i ][ 1 ] ) );
			}

			return $template;
		}

	}

	// check current config for candidates or votes
	_checkElectionConfigCandidatesOrVotes = function( keyIndex, i, j ) {
		// get key
		var key = Object.keys( currentElectionConfig )[ keyIndex ];

		if ( ! key || typeof i === 'undefined' ) {
			return false;
		}

		console.log( 'key: ' + key + ' – i: ' + i + ' – j: ' + j );

		var hasCandidates = false;
		var hasVotes = false;

		_validCandidatesOrVotes = function( currentCandidatesList ) {

			//console.log( '_validCandidatesOrVotes' );

			var missingCandidates = false;
			var missingVotes = false;

			if ( typeof currentCandidatesList !== 'undefined' ) {

				for ( var k = 0; k < currentCandidatesList.length; k++ ) {
					//console.log( 'k: ' + k + ' (' + currentCandidatesList[ k ].candidate.name + ')' );
					if ( typeof currentCandidatesList[ k ].candidate === 'undefined' ) {
						missingCandidates = true;
						//console.log( 'missingCandidates: ' + missingCandidates );
					}
					if ( 
						typeof currentCandidatesList[ k ].yes === 'undefined' 
						|| typeof currentCandidatesList[ k ].no === 'undefined' 
					) {
						missingVotes = true;
						//console.log( 'missingVotes: ' + missingVotes );
					}
				}
				//console.log( 'all valid' );

				return [ ! missingCandidates, ! missingVotes ];
			}
			else {
				//console.log( 'nothing – currentCandidatesList: ' + currentCandidatesList );
				return [ false, false ];
			}
		}

		// get current candidates to check
		var candidatesList;

		if (
			typeof currentElectionConfig[ key ] !== 'undefined'
			&& typeof currentElectionConfig[ key ][ i ] !== 'undefined'
			&& typeof currentElectionConfig[ key ][ i ].candidates !== 'undefined'
			&& currentElectionConfig[ key ][ i ].candidates.length > 0
		) {
			//console.log( 'candidates object found' );
			if ( typeof j === 'undefined' ) {
				//console.log( 'joint' );
				// joint election, one candidates list
				if (
					typeof currentElectionConfig[ key ][ i ].candidates[ 0 ] !== 'undefined'
				) {
					candidatesList = currentElectionConfig[ key ][ i ].candidates;
					//console.log( 'candidatesList: ' + candidatesList );
				}
			}
			else {
				//console.log( 'single' );
				// single election, multiple candidates list
				if (
					typeof currentElectionConfig[ key ][ i ].candidates[ j ] !== 'undefined'
					&& currentElectionConfig[ key ][ i ].candidates[ j ].length > 0
				) {
					candidatesList = currentElectionConfig[ key ][ i ].candidates[ j ];
					//console.log( 'candidatesList: ' + candidatesList );
				}
			}

		}

		var result = _validCandidatesOrVotes( candidatesList );

		return [ result[ 0 ], result[ 1 ] ];

	}

	// TODO: not in use
	// validate all items
	var validate = [];
	var l = 0;
	_validateItems = function() {

		console.log( '_validateItems()' );

		for ( var key in currentElectionConfig ) {

        	var keyIndex = Object.keys( currentElectionConfig ).indexOf( key );

        	for ( var i = 0; i < currentElectionConfig[ key ].length; i++ ) {

        		if (
					typeof currentElectionConfig[ key ] !== 'undefined'
					&& typeof currentElectionConfig[ key ][ i ] !== 'undefined'
					&& typeof currentElectionConfig[ key ][ i ].candidates !== 'undefined'
					//&& currentElectionConfig[ key ][ i ].candidates.length > 0
					&& typeof currentElectionConfig[ key ][ i ].candidates[ 0 ] !== 'undefined'
					//&& currentElectionConfig[ key ][ i ].candidates[ 0 ].length > 0
        		) {

	        		// check joint or single
	        		if (
						typeof currentElectionConfig[ key ][ i ].candidates[ 0 ].candidate !== 'undefined'
	        		) {
	        			// joint, has candidate
	        			console.log( 'joint, has candidate' );

	        		}
	        		else if (
						typeof currentElectionConfig[ key ][ i ].candidates[ 0 ][ 0 ] !== 'undefined'
						//&& currentElectionConfig[ key ][ i ].candidates[ 0 ][ 0 ].length > 0
						&& typeof currentElectionConfig[ key ][ i ].candidates[ 0 ][ 0 ].candidate !== 'undefined'
	        		) {
	        			// single, has candidate
	        			for ( var j = 0; j < currentElectionConfig[ key ][ i ].candidates.length; j++ ) {
	        				console.log( 'single' );
	        				if (
								typeof currentElectionConfig[ key ][ i ].candidates[ j ][ 0 ] !== 'undefined'
								&& typeof currentElectionConfig[ key ][ i ].candidates[ j ][ 0 ].candidate !== 'undefined'
	        				) {
	        					console.log( j + ' has candidate' );
	        				}
	        				else {
	        					console.log( j + ' has no candidate' );
	        				}
	        			}

	        		}
	        		else {
	        			// has no candidates
	        			console.log( 'has no candidates 2' );
	        		}

        		}
        		else {
        			// has no candidates
        			console.log( 'has no candidates 1' );

        		}

        	}

		}

	}

    // add sublist item (candidate list item)
    $.fn._addSublistItems = function( currentCount, currentItemIndex, currentI, currentJ, currentCandidates ) {

    	var newItemsCount = currentCount || 1;
    	var electionGroupIndex = currentItemIndex;
    	var electionIndex = currentI;
    	var singleElectionIndex = currentJ;
    	var candidates = ( typeof singleElectionIndex !== 'undefined' && currentCandidates ) ? currentCandidates[ singleElectionIndex ] : currentCandidates;
    	
    	var step = 1;
    	var $item = $( this );
    	var $subitemTemplate = Utils.$targetElems.filter( subitemTemplateIdentifierPrefix + step + identifierSuffix );
    	var $subitemAppend = $item.find( subitemAppendIdentifierPrefix + step + identifierSuffix );

    	// get start index from last item attr since any items may have been deleted
    	var $lastExistingSubitem = $item.find( '[' + subitemIdAttr + ']' ).last();
    	var startIndex = 0;
    	if ( $lastExistingSubitem.length > 0 ) {
    		startIndex = parseInt( $lastExistingSubitem.attr( subitemIdAttr ) ) + 1;
    	}
    	
    	for ( var i = 0; i < newItemsCount; i++ ) {
    		var currentIndex = startIndex + i;

    		// build subitem
    		var $subitemClone = $subitemTemplate.clone();

    		$subitemClone
    			._replaceTemplatePlaceholders( [ 
    				[ 'itemIndex', electionGroupIndex ],
    				[ 'subitemgroupIndex', electionIndex ], 
    				[ 'subitemIndex', ( ( typeof singleElectionIndex !== 'undefined' ) ? singleElectionIndex + idSeparator + currentIndex : currentIndex ) ] 
    			] )
    			.removeAttr( 'style data-tg' )
    			.attr( subitemIdentifierAttr, subitemIdentifierAttrVal )
    			.attr( subitemIdAttr, currentIndex )
    			.show()
    			.find( subitemRemoveIdentifier )
				.on( 'click', function( event ) {
					event.preventDefault();
					var $subitem = $( this ).closest( '[' + subitemIdentifierAttr + '="' + subitemIdentifierAttrVal + '"]' );
					var $confirmDeleteInputs = $subitem.find( 'input[' + confirmDeleteInputAttr + ']' );
					if ( $confirmDeleteInputs.length > 0 ) {
						var deleteStop = false;
						$confirmDeleteInputs.each( function() {
							$input = $( this );
							if ( $input.val() != '' ) {
								deleteStop = true;
    							$input
    								.addClass( confirmDeleteInputClass )
    								.on( 'focus', function() {
    									$( this ).removeClass( confirmDeleteInputClass );
    								} )
    							;
							}
						} );
						if ( ! deleteStop ) {
							$subitem.remove();
						}
					}
					else {
						$subitem.remove();
					}
				} )
			;

    		// name subitem inputs
    		for ( var inputKey in subitemInputs[ step ] ) {
    			var $input = $subitemClone.find( subitemInputs[ step ][ inputKey ].selector );
    			// get item id for input naming
    			var itemId = $item.attr( itemIdAttr );
    			if ( $input.length > 0 ) {
    				$input
    					.attr( formIdentifierAttr, subitemInputs[ step ][ inputKey ].name + itemId + inputIdentifierSeparator + currentIndex )
    					.attr( 'value', subitemInputs[ step ][ inputKey ].value )
    				;
    				if ( subitemInputs[ step ][ inputKey ].confirmSubitemDelete ) {
    					$input.attr( confirmDeleteInputAttr, '' );
    				}
    			}
    		}
    		// name hidden inputs for votes
    		for ( var inputKey in subitemInputs[ step + 1 ] ) {
    			var $input = $subitemClone.find( subitemInputs[ step + 1 ][ inputKey ].selector );
    			// get item id for input naming
    			var itemId = $item.attr( itemIdAttr );
    			if ( $input.length > 0 ) {
    				$input
    					.attr( formIdentifierAttr, subitemInputs[ step + 1 ][ inputKey ].name + itemId + inputIdentifierSeparator + currentIndex )
    					.attr( 'value', subitemInputs[ step + 1 ][ inputKey ].value )
    				;
    				if ( subitemInputs[ step + 1 ][ inputKey ].confirmSubitemDelete ) {
    					$input.attr( confirmDeleteInputAttr, '' );
    				}
    			}
    		}

			// fill if pre configured
			if ( candidates && candidates[ i ] && candidates[ i ].candidate ) {
				if ( candidates[ i ].candidate.name && candidates[ i ].candidate.name != '' ) {
					$subitemClone.find( 'input[name^="name"]' ).val( candidates[ i ].candidate.name );
				}
				if ( candidates[ i ].candidate.female ) {
					$subitemClone.find( 'input[name^="female"]' ).attr( 'checked', '' );
				}
				if ( candidates[ i ].candidate.diverse ) {
					$subitemClone.find( 'input[name^="diverse"]' ).attr( 'checked', '' );
				}
				if ( typeof candidates[ l ].yes !== 'undefined' ) {
					$subitemClone.find( 'input[name^="yes"]' ).val( candidates[ i ].yes );
				}
				if ( typeof candidates[ l ].no !== 'undefined' ) {
					$subitemClone.find( 'input[name^="no"]' ).val( candidates[ i ].no );
				}
			}

			// append subitem
			$subitemClone.appendTo( $subitemAppend );

    	}
    }

    // validate number input
	$.fn._validateNumberInput = function() {

		var $subitemClone = $( this );
		var $input = $subitemClone.find( validateNumberInputIdentifier );

		if ( $input.length > 0 ) {

			var $target = $subitemClone.find( $input.attr( 'data-g-tg' ) );

			$input.on( 'change keyup', function() {

				var $input = $( this );

				// limit election count value
				var min = parseInt( $input.attr( 'min' ) );
				var max = parseInt( $input.attr( 'max' ) );
				var value = $input.val();
				console.log( 'min: ' + min + ' – max: ' + max );
				if ( ( typeof min !== 'NaN' || typeof man !== 'NaN' ) && value != '' ) {
					if ( typeof min !== 'NaN' && value < min ) {
						$input.val( min );
					}
					else if ( typeof man !== 'NaN' && value > max ) {
						$input.val( max );
					}
				}

				if ( $target.length > 0 ) {
					// show / hide joint election checkbox
					if ( value > 1 ) {
						$target.show();
					}
					else {
						$target.hide();
					}
				}
			} );

		}

	}

	$.fn._getFormValues = function( currentIdentifierAttr ) {

		var $form = $( this );
		var values = {};
		var identifierAttr = currentIdentifierAttr || 'name';

		$form.find( 'input[' + identifierAttr + '], select[' + identifierAttr + '], textarea[' + identifierAttr + ']' ).each( function( i, elem ) {

			var $input = $( elem );

			if ( $input.attr( 'type' ) == 'radio' ) {
				// radio requires identifier 'name'
				if ( $input.is( ':checked' ) ) {
					values[ $input.attr( identifierAttr ) ] = $input.val();
				}
			}
			else if ( $input.attr( 'type' ) == 'checkbox' ) {
				values[ $input.attr( identifierAttr ) ] = ( $input.is( ':checked' ) ) ? $input.val() : null;
			}
			else {
				values[ $input.attr( identifierAttr ) ] = $input.val();
			}
		});

		return values;
	}

	_filterMatchingIndexes = function( indexes, startString ) {
		var matchingIndexes = [];
		for ( var i = 0; i < indexes.length; i++ ) {
			if ( indexes[ i ].indexOf( startString ) === 0 ) {
				matchingIndexes.push( indexes[ i ] );
			}
		}
		return matchingIndexes;
	}

	_getElectionResult = function() {

		var hasError = false;

		// election groups
		for ( var key in currentElectionConfig ) {

			// fill electionCalculationInput
			var electionCalculationInput = {
				"structure": [],
				"current": '',
				"previous": [],
				"candidates": []
			};
			var copyIfSet = [
				'name',
				'count',
				'joint',
				'overall'
			];
			for ( var i = 0; i < currentElectionConfig[ key ].length; i++ ) {
				electionCalculationInput.structure.push( {} );

				for ( var k = 0; k < copyIfSet.length; k++ ) {
					if ( typeof currentElectionConfig[ key ][ i ][ copyIfSet[ k ] ] !== 'undefined' ) {
						electionCalculationInput.structure[ i ][ copyIfSet[ k ] ] = currentElectionConfig[ key ][ i ][ copyIfSet[ k ] ];
					}
				}
			}

        	// elections within group
			for ( var i = 0; i < currentElectionConfig[ key ].length; i++ ) {

				_setPrevious = function() {
					if ( i === 0 ) {
						// reset previous at fist election within election group
						electionCalculationInput.previous = [];
					}
					else {
						// all following elections if results copy into previous
						var previousI = i - 1;
						if ( 
							typeof currentElectionConfig[ key ][ previousI ].results !== 'undefined' 
							&& typeof currentElectionConfig[ key ][ previousI ].results.candidates !== 'undefined'
							&& currentElectionConfig[ key ][ previousI ].results.candidates.length > 0 
						) {
							for ( var k = 0; k < currentElectionConfig[ key ][ previousI ].results.candidates.length; k++ ) {
								electionCalculationInput.previous.push( currentElectionConfig[ key ][ previousI ].results.candidates[ k ] );
							}
						}
					}
				}

				// TODO: use new function _checkElectionConfigCandidatesOrVotes()

				// check if votes
				var voteFound = false;
				var missingVoteFound = false;
				if (
					typeof currentElectionConfig[ key ][ i ] !== 'undefined'
					&& typeof currentElectionConfig[ key ][ i ].candidates !== 'undefined'
					&& currentElectionConfig[ key ][ i ].candidates.length > 0
					&& typeof currentElectionConfig[ key ][ i ].candidates[ 0 ].candidate !== 'undefined'
				) {
					// election joint, one candidates list

					// check if all candidates have valid votes
					for ( var k = 0; k < currentElectionConfig[ key ][ i ].candidates.length; k++ ) {

						if (
							typeof currentElectionConfig[ key ][ i ].candidates[ k ].yes !== 'undefined'
							&& typeof currentElectionConfig[ key ][ i ].candidates[ k ].no !== 'undefined'
						) {
							if ( 
								currentElectionConfig[ key ][ i ].candidates[ k ].yes != '0'
								|| currentElectionConfig[ key ][ i ].candidates[ k ].no != '0' ) {
								// vote exists, minimum one yes vote is > 0 (since ui saves '0' if not filled)
								voteFound = true;
								//console.log( '    VOTE FOUND' );
							}
							else {
								//console.log( '    NO VOTE FOUND' );
							}
						}
						else {
							missingVoteFound = true;
						}

					}

					// call DibElectionCalculator.getResult (one time)

					// if all votes valid call election tool
					if ( voteFound && ! missingVoteFound ) {

						// fill electionCalculationInput
						electionCalculationInput.current = currentElectionConfig[ key ][ i ].name;
						_setPrevious();
						electionCalculationInput.candidates = currentElectionConfig[ key ][ i ].candidates;

						// call election tool
						var electionCalculationOutput = DibElectionCalculator.getResult( electionCalculationInput );
						
						// handle errors
						// TEST <<<<<<<<<<<<<
						if ( true || typeof electionCalculationOutput.error !== 'undefined' ) {
							// has error
							hasError = true;
							// TEST <<<<<<<<<<<<<
							//_handleError( electionCalculationOutput.error );
							_handleError( { "message": 'Dies ist nur ein Testfehler.' } );
							return false;
						}
						else {
							// copy results into currentElectionConfig
							currentElectionConfig[ key ][ i ].results = electionCalculationOutput;
						}

					}

				}
				else if (
					typeof currentElectionConfig[ key ][ i ] !== 'undefined'
					&& typeof currentElectionConfig[ key ][ i ].candidates !== 'undefined'
					&& currentElectionConfig[ key ][ i ].candidates.length > 0
					&& typeof currentElectionConfig[ key ][ i ].candidates[ 0 ].candidate === 'undefined'
					&& currentElectionConfig[ key ][ i ].candidates[ 0 ].length > 0
					&& typeof currentElectionConfig[ key ][ i ].candidates[ 0 ][ 0 ].candidate !== 'undefined'
				) {
					// election single, multiple candidates lists

					// fill electionCalculationInput
					_setPrevious();

					for ( var j = 0; j < currentElectionConfig[ key ][ i ].candidates.length; j++ ) {

						// check if all candidates have valid votes
						for ( var k = 0; k < currentElectionConfig[ key ][ i ].candidates[ j ].length; k++ ) {

							if (
								typeof currentElectionConfig[ key ][ i ].candidates[ j ][ k ].yes !== 'undefined'
								&& typeof currentElectionConfig[ key ][ i ].candidates[ j ][ k ].no !== 'undefined'
							) {
								if ( 
									currentElectionConfig[ key ][ i ].candidates[ j ][ k ].yes != '0'
									|| currentElectionConfig[ key ][ i ].candidates[ j ][ k ].no != '0' 
								) {
									// vote exists, minimum one yes vote is > 0 (since ui saves '0' if not filled)
									voteFound = true;
								}
							}
							else {
								missingVoteFound = true;
							}

						}

						// call DibElectionCalculator.getResult each single election

						// if all votes valid call election tool
						if ( voteFound && ! missingVoteFound ) {

							// fill electionCalculationInput
							electionCalculationInput.current = [ currentElectionConfig[ key ][ i ].name, j ];
							// if still no results define results
							if ( j === 0 ) {
								currentElectionConfig[ key ][ i ].results = {
									"candidates": [],
									"explanation": []
								};
							}
							electionCalculationInput.candidates = currentElectionConfig[ key ][ i ].candidates[ j ];

							// call election tool
							var electionCalculationOutput = DibElectionCalculator.getResult( electionCalculationInput );
							
							// handle errors
							if ( typeof electionCalculationOutput.error !== 'undefined' ) {
								// has error
								hasError = true;
								_handleError( electionCalculationOutput.error );
							}
							else {
								// copy results into currentElectionConfig
								currentElectionConfig[ key ][ i ].results.candidates.push( electionCalculationOutput.candidates[ 0 ] );
								electionCalculationInput.previous.push( electionCalculationOutput.candidates[ 0 ] );
							}

						}

					}
				}

			}

		}

		if ( electionCalculationOutput ) {
	    	// save in local storage
	    	localStorage.setItem( localStorageKey, JSON.stringify( currentElectionConfig ) );
		}

		// if election result return true
		return ! hasError;
	}

	// get config step 0
	$.fn._getElectionCurrentConfig_0 = function() {

		// TODO: what if changing count while preconfigured single elections lists

		var step = 0;

		currentElectionConfig = ( typeof currentElectionPreset !== 'undefined' ) ? $.extend( {}, electionConfig, currentElectionPreset ) : $.extend( {}, electionConfig );

		var $form = $( this );

		var values = $form._getFormValues( formIdentifierAttr );
        var deleteKeys = [];

		for ( var key in currentElectionConfig ) {
			// get selected election types

        	var itemIndex = Object.keys( currentElectionConfig ).indexOf( key );
        	var value = values[ itemInputs[ step ].check.name + itemIndex ];

        	if ( value === null ) {
        		// remember non selected items, delete later
        		deleteKeys.push( key );
        	}
        	else {
        		// get values of selected items

	        	for ( var subitemIndex = 0; subitemIndex < currentElectionConfig[ key ].length; subitemIndex++ ) {

	        		var count = values[ subitemInputs[ step ].count.name + itemIndex + inputIdentifierSeparator + subitemIndex ];
	        		if ( !! count ) {
	        			count = parseInt( count );
	        		}
	        		var joint = values[ subitemInputs[ step ].joint.name + itemIndex + inputIdentifierSeparator + subitemIndex ];
	        		if ( !! joint ) {
	        			joint = JSON.parse( joint );
	        		}

		        	if ( count != null ) {
		        		currentElectionConfig[ key ][ subitemIndex ].count = count;
		        	}
		        	else {
		        		count = currentElectionConfig[ key ][ subitemIndex ].count;
		        	}

		        	if ( joint != null ) {
		        		currentElectionConfig[ key ][ subitemIndex ].joint = true;
		        	}
		        	else if ( count > 1 ) {
		        		currentElectionConfig[ key ][ subitemIndex ].joint = false;
		        	}

	        		// reset existing candidates if change of 'joint'
	        		if ( count > 1 && ! joint ) {
	        			// make candidates groups – try delete election candidates (one group)
		        		if ( 
		        				typeof currentElectionConfig[ key ][ subitemIndex ].candidates !== 'undefined'
		        				&& typeof currentElectionConfig[ key ][ subitemIndex ].candidates[ 0 ] !== 'undefined'
		        				&& typeof currentElectionConfig[ key ][ subitemIndex ].candidates[ 0 ].candidate !== 'undefined'
		        			) {
		        			// delete multiple candidates lists
		        			delete currentElectionConfig[ key ][ subitemIndex ][ 'candidates' ];
		        		}
	        		}
	        		else {
	        			// make one group – try delete single election candidates groups
		        		if ( 
		        				typeof currentElectionConfig[ key ][ subitemIndex ].candidates !== 'undefined'
		        				&& typeof currentElectionConfig[ key ][ subitemIndex ].candidates[ 0 ] !== 'undefined'
		        				&& typeof currentElectionConfig[ key ][ subitemIndex ].candidates[ 0 ][ 0 ] !== 'undefined'
		        				&& typeof currentElectionConfig[ key ][ subitemIndex ].candidates[ 0 ][ 0 ].candidate !== 'undefined'
		        			) {
		        			// delete multiple candidates lists
		        			delete currentElectionConfig[ key ][ subitemIndex ][ 'candidates' ];
		        		}
	        		}

	        	}

        	}

		}

    	// delete non selected items
    	for ( var i = 0; i < deleteKeys.length; i++ ) {
    		delete currentElectionConfig[ deleteKeys[ i ] ];
    	}

    	// save in local storage
    	localStorage.setItem( localStorageKey, JSON.stringify( currentElectionConfig ) );

		//console.log( 'config step 0 (currentElectionConfig): ' + JSON.stringify( currentElectionConfig, null, 2 ) );

	}

	// get config step 1
	$.fn._getElectionCurrentConfig_1 = function() {

		// TODO: check if configuration change of election joint (reset candidates or merge existing candidates?)
		// joint: true || undefined

		var step = 1;

		var $form = $( this );

		_isValidCandidate = function( nameKey ) {
			return ( typeof values[ nameKey ] !== 'undefined' && values[ nameKey ] !== null && values[ nameKey ] !== '' );
		}
        
		_getCandidate = function( nameKey ) {
			var name = values[ nameKey ];
			var female = values[ nameKey.replace( nameStart_name, nameStart_female ) ] || false;
			var diverse = values[ nameKey.replace( nameStart_name, nameStart_diverse ) ] || false; 
			
			return {
				[ subitemInputs[ step ].name.saveAs ]: name,
				[ subitemInputs[ step ].female.saveAs ]: female,
				[ subitemInputs[ step ].diverse.saveAs ]: diverse
			};

		}

		var values = $form._getFormValues( formIdentifierAttr );

        // election groups
        for ( var key in currentElectionConfig ) {

        	var itemIndex = Object.keys( currentElectionConfig ).indexOf( key );
	        var electionGroup = key;

        	// elections within group
			for ( var i = 0; i < currentElectionConfig[ key ].length; i++ ) {

				// reset candidates
				//if ( typeof currentElectionConfig[ key ][ i ][ 'candidates' ] === 'undefined' ) {
				currentElectionConfig[ key ][ i ][ 'candidates' ] = [];
				//}

	        	var election = currentElectionConfig[ key ][ i ].name;

	        	var electionCount = parseInt( currentElectionConfig[ key ][ i ].count );
	        	var electionJoint = currentElectionConfig[ key ][ i ].joint;
				var valuesKeys = Object.keys( values );

				var nameStart_name = subitemInputs[ step ].name.name;
				var nameStart_female = subitemInputs[ step ].female.name;
				var nameStart_diverse = subitemInputs[ step ].diverse.name;
				var nameStart_yes = subitemInputs[ step + 1 ].yes.name;
				var nameStart_no = subitemInputs[ step + 1 ].no.name;
				var nameIndexes;
				var matchingKeys;

		        if ( electionCount === 1 || electionJoint === true ) {
	        		// make (one) candidates list
	        		var $item = $form.find( '[' + itemIdAttr + '="' + itemIndex + inputIdentifierSeparator + i + '"]' );
	        		var $subitems = $item.find( '[' + subitemIdAttr + ']' );

	        		// get all candidates from list
					nameIndexes = itemIndex + inputIdentifierSeparator + i + inputIdentifierSeparator;
					matchingKeys = _filterMatchingIndexes( valuesKeys, nameStart_name + nameIndexes );

					var reduceIndex = 0;
					for ( var k = 0; k < matchingKeys.length; k++ ) {

						if ( _isValidCandidate( matchingKeys[ k ] ) ) {

	        				var candidate = _getCandidate( matchingKeys[ k ] );
							var yes = values[ matchingKeys[ k ].replace( nameStart_name, nameStart_yes ) ] || false;
							var no = values[ matchingKeys[ k ].replace( nameStart_name, nameStart_no ) ] || false; 

	        				// check if already exiting or push
	        				if ( typeof currentElectionConfig[ key ][ i ].candidates === 'undefined' ) {
	        					currentElectionConfig[ key ][ i ].candidates = [];
	        				}

	        				if ( typeof currentElectionConfig[ key ][ i ].candidates[ k - reduceIndex ] === 'undefined' ) {
	        					currentElectionConfig[ key ][ i ].candidates[ k - reduceIndex ] = {};
	        				}
	        				currentElectionConfig[ key ][ i ].candidates[ k - reduceIndex ].candidate = candidate;
	        				if ( yes ) {
	        					currentElectionConfig[ key ][ i ].candidates[ k - reduceIndex ].yes = yes;
	        				}
	        				if ( no ) {
	        					currentElectionConfig[ key ][ i ].candidates[ k - reduceIndex ].no = no;
	        				}
						}
						else {
							reduceIndex++;
						}
					}

		        }
	        	else {
	        		// make list of candidates list
	        		for ( var j = 0; j < electionCount; j++ ) {

						nameIndexes = itemIndex + inputIdentifierSeparator + i + inputIdentifierSeparator + j + inputIdentifierSeparator;
						matchingKeys = _filterMatchingIndexes( valuesKeys, nameStart_name + nameIndexes );

						currentElectionConfig[ key ][ i ].candidates[ j ] = [];

						var reduceIndex = 0;
						for ( var k = 0; k < matchingKeys.length; k++ ) {

							if ( _isValidCandidate( matchingKeys[ k ] ) ) {
								
		        				var candidate = _getCandidate( matchingKeys[ k ] );
								var yes = values[ matchingKeys[ k ].replace( nameStart_name, nameStart_yes ) ] || false;
								var no = values[ matchingKeys[ k ].replace( nameStart_name, nameStart_no ) ] || false;

		        				// check if already exiting or push
		        				/*if ( typeof currentElectionConfig[ key ][ i ].candidates === 'undefined' ) {
		        					currentElectionConfig[ key ][ i ].candidates = [];
		        				}
		        				if ( typeof currentElectionConfig[ key ][ i ].candidates[ j ] === 'undefined' ) {
		        					currentElectionConfig[ key ][ i ].candidates[ j ] = [];
		        				}*/

		        				if ( typeof currentElectionConfig[ key ][ i ].candidates[ j ][ k - reduceIndex ] === 'undefined' ) {
		        					currentElectionConfig[ key ][ i ].candidates[ j ][ k - reduceIndex ] = {};
		        				}
		        				currentElectionConfig[ key ][ i ].candidates[ j ][ k - reduceIndex ].candidate = candidate;
		        				if ( yes ) {
		        					currentElectionConfig[ key ][ i ].candidates[ j ][ k - reduceIndex ].yes = yes;
		        				}
		        				if ( no ) {
		        					currentElectionConfig[ key ][ i ].candidates[ j ][ k - reduceIndex ].no = no;
		        				}
							}
							else {
								reduceIndex++;
							}

						}
	        		}
	        	}

	        }

        }

    	// save in local storage
    	localStorage.setItem( localStorageKey, JSON.stringify( currentElectionConfig ) );

		//console.log( 'config step 1 (currentElectionConfig): ' + JSON.stringify( currentElectionConfig, null, 2 ) );

	}

	// get config step 2
	$.fn._getElectionCurrentConfig_2 = function() {

		var step = 2;

		var $form = $( this );

		var values = $form._getFormValues( formIdentifierAttr );

        // election groups
        for ( var key in currentElectionConfig ) {

        	var itemIndex = Object.keys( currentElectionConfig ).indexOf( key );
	        var electionGroup = key;

        	// elections within group
			for ( var i = 0; i < currentElectionConfig[ key ].length; i++ ) {

	        	var election = currentElectionConfig[ key ][ i ].name;

	        	var electionCount = parseInt( currentElectionConfig[ key ][ i ].count );
	        	var electionJoint = currentElectionConfig[ key ][ i ].joint;
				var valuesKeys = Object.keys( values );

				var nameStart_yes = subitemInputs[ step ].yes.name;
				var nameStart_no = subitemInputs[ step ].no.name;
				var nameIndexes;
				var matchingKeys;

		        if ( electionCount === 1 || electionJoint === true ) {
	        		// make (one) candidates list
	        		var $item = $form.find( '[' + itemIdAttr + '="' + itemIndex + inputIdentifierSeparator + i + '"]' );
	        		var $subitems = $item.find( '[' + subitemIdAttr + ']' );

	        		// get all candidates from list
					nameIndexes = itemIndex + inputIdentifierSeparator + i + inputIdentifierSeparator;
					matchingKeys = _filterMatchingIndexes( valuesKeys, nameStart_yes + nameIndexes );

					for ( var k = 0; k < matchingKeys.length; k++ ) {

						var yes = values[ matchingKeys[ k ] ] || 0;
						var no = values[ matchingKeys[ k ].replace( nameStart_yes, nameStart_no ) ] || 0;

        				currentElectionConfig[ key ][ i ].candidates[ k ].yes = yes;
        				currentElectionConfig[ key ][ i ].candidates[ k ].no = no;
					}

		        }
	        	else {
	        		// make list of candidates list
	        		for ( var j = 0; j < electionCount; j++ ) {
	        			
						nameIndexes = itemIndex + inputIdentifierSeparator + i + inputIdentifierSeparator + j + inputIdentifierSeparator;
						matchingKeys = _filterMatchingIndexes( valuesKeys, nameStart_yes + nameIndexes );

						for ( var k = 0; k < matchingKeys.length; k++ ) {

							var yes = values[ matchingKeys[ k ] ] || 0;
							var no = values[ matchingKeys[ k ].replace( nameStart_yes, nameStart_no ) ] || 0;

	        				currentElectionConfig[ key ][ i ].candidates[ j ][ k ].yes = yes;
	        				currentElectionConfig[ key ][ i ].candidates[ j ][ k ].no = no;
						}
	        		}
	        	}

	        }

        }

    	// save in local storage
    	localStorage.setItem( localStorageKey, JSON.stringify( currentElectionConfig ) );

		//console.log( 'config step 2 (currentElectionConfig): ' + JSON.stringify( currentElectionConfig, null, 2) );

	}

	// step 3 – results
    _buildStep_3 = function() {

    	var step = 3;

        // item
        var $itemTemplate = Utils.$targetElems.filter( itemTemplateIdentifierPrefix + step + identifierSuffix );
        var $itemAppend = Utils.$targetElems.filter( itemAppendIdentifierPrefix + step + identifierSuffix );

        // subitemgroup
        var $subitemgroupTemplate = Utils.$targetElems.filter( subitemgroupTemplateIdentifierPrefix + step + identifierSuffix );

        // subitem
        var $subitemTemplate = Utils.$targetElems.filter( subitemTemplateIdentifierPrefix + step + identifierSuffix );

        // empty before fill
        $itemAppend.empty();
        
        // election groups
        for ( var key in currentElectionConfig ) {

        	var itemIndex = Object.keys( currentElectionConfig ).indexOf( key );
	        var electionGroup = key;

        	// clone
			var $itemClone = $itemTemplate.clone();

			$itemClone
				.removeAttr( 'data-tg style' )
    			._replaceTemplatePlaceholders( [ 
					[ 'title', electionGroup ], 
					[ 'index', itemIndex ] 
				] )
			;

			var $subitemgroupAppend = $itemClone.find( subitemgroupAppendIdentifierPrefix + step + identifierSuffix );

        	// elections within group
			for ( var i = 0; i < currentElectionConfig[ key ].length; i++ ) {
	        	var election = currentElectionConfig[ key ][ i ].name;

	    		// build subitemgroup
	    		var $subitemgroupClone = $subitemgroupTemplate.clone();

	    		$subitemgroupClone
	    			._replaceTemplatePlaceholders( [ 
	    				[ 'index', i ],
	    				[ 'title', election ]
	    			] )
	    			.removeAttr( 'style data-tg' )
	    			.show()
				;

	        	// check if results
	        	if ( 
	        		typeof currentElectionConfig[ key ][ i ].results !== 'undefined' 
	        		&& typeof currentElectionConfig[ key ][ i ].results.candidates !== 'undefined' 
	        		&& currentElectionConfig[ key ][ i ].results.candidates.length > 0 
	        	) {
	        		
					var $subitemAppend = $subitemgroupClone.find( subitemAppendIdentifierPrefix + step + identifierSuffix );

	        		for ( var k = 0; k < currentElectionConfig[ key ][ i ].results.candidates.length; k++ ) {

		        		// clone subitems
						var $subitemClone = $subitemTemplate.clone();

			    		var candidateName = currentElectionConfig[ key ][ i ].results.candidates[ k ].candidate.name || '';

			    		$subitemClone
			    			._replaceTemplatePlaceholders( [ 
			    				[ 'candidateName', candidateName ]
			    			] )
			    			.removeAttr( 'style data-tg' )
			    			.show()
						;

						// empty
						if ( k == 0 && candidateName != '' ) {
							$subitemAppend.empty();
						}

						// append subitem
						if ( candidateName != '' ) {
							$subitemClone.appendTo( $subitemAppend );
						}
						
	        		}

	        	}

				// explanation

		    	/*
		    	[data-g-tg="explanation-template-append"]
				[data-tg="explanation-template"] {{ headline }}

				[data-g-tg="explanation-item-append"] 

				[data-tg="explanation-item-text"] {{ itemHeadline }}
				[data-g-tg="explanation-subitem-append-text"] 
				[data-tg="explanation-subitem-text"] {{ subitemContent }}

				[data-tg="explanation-item-list"] {{ itemHeadline }}
				[data-g-tg="explanation-subitem-append-list"] 
				[data-tg="explanation-subitem-list">] {{ subitemContent }}
		    	*/
		    	if ( 
	        		typeof currentElectionConfig[ key ][ i ].results !== 'undefined' 
	        		&& typeof currentElectionConfig[ key ][ i ].results.explanation !== 'undefined' 
	        		&& currentElectionConfig[ key ][ i ].results.explanation.length > 0 
	        	) {
					console.log( 'explanation found' );

					var $explanationTemplate = Utils.$targetElems.filter( '[data-tg="explanation-template"]' );
					var $explanationTemplateAppend = $subitemgroupClone.find( '[data-g-tg="explanation-template-append"]' );
					
					//

					//var $explanationTypeTextItem = Utils.$targetElems.filter( '[data-g-tg="explanation-item-text"]' );
					var $explanationTypeTextSubitem = Utils.$targetElems.filter( '[data-g-tg="explanation-subitem-text"]' );
					//var $explanationTypeTextSubitemAppend = $subitemgroupClone.find( '[data-g-tg="explanation-subitem-text"]' );
					
					//var $explanationTypeListItem = Utils.$targetElems.filter( '[data-g-tg="explanation-item-list"]' );
					var $explanationTypeListSubitem = Utils.$targetElems.filter( '[data-g-tg="explanation-subitem-list"]' );
					//var $explanationTypeListSubitemAppend = $subitemgroupClone.find( '[data-g-tg="explanation-subitem-list"]' );
					
					var explanation = currentElectionConfig[ key ][ i ].results.explanation;

					for ( var j = 0; j < explanation.length; j++ ) {

						console.log( 'explanation j: ' + j );

						// clone
						var $explanationClone = $explanationTemplate.clone();

						// set content
						$explanationClone
			    			._replaceTemplatePlaceholders( [ 
			    				[ 'headline', explanation[ j ].headline ]
			    			] )
			    			.removeAttr( 'style data-tg' )
			    			.show()
			    		;

			    		var $explanationItemAppend = $explanationClone.find( '[data-g-tg="explanation-item-append"]' );

			    		// items
			    		for ( var k = 0; k < explanation[ j ].content.length; k++ ) {

							console.log( 'explanation[' + j + '] k: ' + k );
							
			    			var item = explanation[ j ].content[ k ];

			    			// clone item
			    			var $explanationItemClone = Utils.$targetElems.filter( '[data-tg="explanation-item-' + item.type + '"]' ).clone();

			    			// set content
			    			$explanationItemClone
				    			._replaceTemplatePlaceholders( [ 
				    				[ 'itemHeadline', item.headline ]
				    			] )
				    			.removeAttr( 'style data-tg' )
				    			.show()
			    			;

			    			var $explanationSubitemAppend = $explanationItemClone.find( '[data-g-tg="explanation-subitem-append"]' );
							
							// subitems
			    			var subitem = item.items;
			    			for ( var l = 0; l < subitem.length; l++ ) {

								console.log( 'subitem[' + l + '].item: ' + subitem[ l ].item );

			    				// clone subitem
								var $explanationSubitemClone = Utils.$targetElems.filter( '[data-tg="explanation-subitem-' + item.type + '"]' ).clone();

								// set content
								$explanationSubitemClone
					    			._replaceTemplatePlaceholders( [ 
					    				[ 'subitemContent', subitem[ l ].item ]
					    			] )
					    			.removeAttr( 'style data-tg' )
					    			.show()
				    			;

				    			// manipulate
				    			if ( ! subitem[ l ].selected ) {
				    				// add class if selected
				    				var addClass = $explanationSubitemClone.attr( 'data-selected-class' );
				    				$explanationSubitemClone.addClass( addClass );
				    			}

				    			// append
				    			$explanationSubitemClone.appendTo( $explanationSubitemAppend );

			    			}

			    			// append item
			    			$explanationItemClone.appendTo( $explanationItemAppend );

			    		}

			    		// append explanation
			    		$explanationClone.appendTo( $explanationTemplateAppend );

					}

	        	}

				// append subitem
				$subitemgroupClone.appendTo( $subitemgroupAppend );

			}

			// append
        	$itemClone.appendTo( $itemAppend );

        	// show results container
        	Utils.$targetElems.filter( stepIdentifierPrefix + step + identifierSuffix ).show();

        }

    };

	// step 2 – results
    _buildStep_2 = function() {

    	var step = 2;

    	// form
        var $form = Utils.$functionElems.filter( stepFormIdentifierPrefix + step + identifierSuffix );

        // item
        var $itemTemplate = Utils.$targetElems.filter( itemTemplateIdentifierPrefix + step + identifierSuffix );
        var $itemAppend = Utils.$targetElems.filter( itemAppendIdentifierPrefix + step + identifierSuffix );

        // item subitem
        var $subitemTemplate = Utils.$targetElems.filter( subitemTemplateIdentifierPrefix + step + identifierSuffix );

        // empty before fill
        $itemAppend.empty();

        // reset select
        _Nav.$select[ step ]
        	.empty()
        	.append( selectInitialOption )
        ;
        
        // election groups
        for ( var key in currentElectionConfig ) {

        	var itemIndex = Object.keys( currentElectionConfig ).indexOf( key );
	        var electionGroup = key;

	        // fill select
	        //_Nav.$select[ step ].append( '<option value="' + itemIndex + '">' + electionGroup + '</option>' );

        	// elections within group
			for ( var i = 0; i < currentElectionConfig[ key ].length; i++ ) {
	        	var election = currentElectionConfig[ key ][ i ].name;

	        	var electionCount = parseInt( currentElectionConfig[ key ][ i ].count );
	        	var electionJoint = currentElectionConfig[ key ][ i ].joint;
				var electionCandidates = currentElectionConfig[ key ][ i ].candidates;
    	
	        	var title;

	        	_cloneStep_2 = function( currentJ ) {

	        		var $itemClone = $itemTemplate.clone();
	        		var j = currentJ;

			        // fill select
			        _Nav.$select[ step ].append( '<option value="' + itemIndex + inputIdentifierSeparator + i + ( ( typeof j !== 'undefined' ) ? inputIdentifierSeparator + j : '' ) + '">' + title + '</option>' );

					$itemClone
						.removeAttr( 'data-tg style' )
		    			.attr( itemIdentifierAttr, itemIdentifierAttrVal )
		    			.attr( itemIdAttr, ( typeof j !== 'undefined' ) ? itemIndex + inputIdentifierSeparator + i + inputIdentifierSeparator + j : itemIndex + inputIdentifierSeparator + i )
						._replaceTemplatePlaceholders( [ 
							[ 'title', title ] 
						] )
					;

					// TODO: simplify? (electionCandidates may be undefined)
    				var subitemsCount;
    				if ( typeof j !== 'undefined' && typeof electionCandidates !== 'undefined' && typeof electionCandidates[ j ] !== 'undefined' && electionCandidates[ j ].length > 0 ) {
    					subitemsCount = electionCandidates[ j ].length;
    				}
    				else if ( typeof j === 'undefined' && typeof electionCandidates !== 'undefined' && typeof electionCandidates[ 0 ] !== 'undefined' && typeof electionCandidates[ 0 ].candidate !== 'undefined' && electionCandidates.length > 0 ) {
    					subitemsCount = electionCandidates.length;
    				}
    				else {
    					subitemsCount = 0;
    				}

			    	var candidates = ( typeof j !== 'undefined' && electionCandidates ) ? electionCandidates[ j ] : electionCandidates;

			    	var $subitemAppend = $itemClone.find( subitemAppendIdentifierPrefix + step + identifierSuffix );
			    	
			    	for ( var l = 0; l < subitemsCount; l++ ) {

			    		// build subitem
			    		var $subitemClone = $subitemTemplate.clone();

			    		var candidateName = candidates[ l ].candidate.name || '';

			    		$subitemClone
			    			._replaceTemplatePlaceholders( [ 
			    				[ 'candidateName', candidateName ],
			    				[ 'itemIndex', itemIndex ],
			    				[ 'subitemgroupIndex', i ], 
			    				[ 'subitemIndex', ( ( typeof j !== 'undefined' ) ? j + idSeparator + l : l ) ]
				    			] )
			    			.removeAttr( 'style data-tg' )
			    			.attr( subitemIdentifierAttr, subitemIdentifierAttrVal )
			    			.attr( subitemIdAttr, l )
			    			.show()
							._validateNumberInput()
						;
			    		// name subitem inputs
			    		for ( var inputKey in subitemInputs[ step ] ) {
			    			var $input = $subitemClone.find( subitemInputs[ step ][ inputKey ].selector );
			    			// get item id for input naming
			    			var itemId = $itemClone.attr( itemIdAttr );
			    			if ( $input.length > 0 ) {
			    				$input
			    					.attr( formIdentifierAttr, subitemInputs[ step ][ inputKey ].name + itemId + inputIdentifierSeparator + l )
			    					.attr( 'value', subitemInputs[ step ][ inputKey ].value )
			    				;
			    			}
			    		}
						// fill if pre configured
						if ( candidates && candidates[ l ] && candidates[ l ].candidate ) {
							//console.log( 'PREFILL ' + key + ' ' + i + ' ' + j + ' – ' + l + ' (' + candidates[ l ].candidate.name + ') – yes: ' + candidates[ l ].yes + ' – no: ' + candidates[ l ].no );
							if ( typeof candidates[ l ].yes !== 'undefined' ) {
								$subitemClone.find( 'input[name^="yes"]' ).val( candidates[ l ].yes );
							}
							if ( typeof candidates[ l ].no !== 'undefined' ) {
								$subitemClone.find( 'input[name^="no"]' ).val( candidates[ l ].no );
							}
						}

						// append subitem
						$subitemClone.appendTo( $subitemAppend );

			    	}

					// append
		        	$itemClone.appendTo( $itemAppend );
		        }

		        if ( electionCount == 1 ) {
	        		title = electionGroup + electionTitleSeparator + election;
	        		_cloneStep_2();
		        }
		        else {
		        	if ( electionJoint ) {
		        		title = electionGroup + electionTitleSeparator + election + ' (gemeinsam ' + electionCount + ')';
		        		_cloneStep_2();
		        	}
		        	else {
		        		for ( var j = 0; j < electionCount; j++ ) {
		        			title = electionGroup + electionTitleSeparator + election + electionTitleSeparator + ( j + 1 ) + '&thinsp;/&thinsp;' + electionCount;
		        			_cloneStep_2( j );
		        		}
		        	}
		        }

			}

        }

        // only calculate election button
        $CalculateElectionButton = Utils.$functionElems.filter( '[data-fn="calculate-election"]' );
        $CalculateElectionButton
        	.off( 'click.calculate' )
        	.on( 'click.calculate', function( event ) {
        		event.preventDefault();
        		
        		var $form = Utils.$functionElems.filter( stepFormIdentifierPrefix + step + identifierSuffix );
	        	$form._getElectionCurrentConfig_2();

	        	// get election result
	        	if ( _getElectionResult() ) {

					//console.log( 'RESULT (currentElectionConfig): ' + JSON.stringify( currentElectionConfig, null, 2) );
	        		
	        		_buildStep_3();
	        	}
				
        	} )
        ;

        // get config on submit
        $form
        	.off( 'submit.form.' + step )
	        .on( 'submit.form.' + step, function( event ) {

	        	event.preventDefault();

	        	var $form = $( this );
	        	$form._getElectionCurrentConfig_2();

	        	//_validateItems();

	        	// get election result
	        	if ( _getElectionResult() ) {

					//console.log( 'RESULT (currentElectionConfig): ' + JSON.stringify( currentElectionConfig, null, 2) );
	        		
	        		_buildStep_3();

	        		$form.trigger( 'built' );

	        	}

	        } )
	    ;

    };

	// step 1 – prepare
    _buildStep_1 = function() {

    	var step = 1;

    	// form
        var $form = Utils.$functionElems.filter( stepFormIdentifierPrefix + step + identifierSuffix );

        // item
        var $itemTemplate = Utils.$targetElems.filter( itemTemplateIdentifierPrefix + step + identifierSuffix );
        var $itemAppend = Utils.$targetElems.filter( itemAppendIdentifierPrefix + step + identifierSuffix );

        // item subitem
        var $subitemTemplate = Utils.$targetElems.filter( subitemTemplateIdentifierPrefix + step + identifierSuffix );

        // empty before fill
        $itemAppend.empty();

        // reset select
        _Nav.$select[ step ]
        	.empty()
        	.append( selectInitialOption )
        ;
        
        // election groups
        for ( var key in currentElectionConfig ) {

        	var itemIndex = Object.keys( currentElectionConfig ).indexOf( key );
	        var electionGroup = key;

	        // fill select
	        //_Nav.$select[ step ].append( '<option value="' + itemIndex + '">' + electionGroup + '</option>' );

        	// elections within group
			for ( var i = 0; i < currentElectionConfig[ key ].length; i++ ) {
	        	var election = currentElectionConfig[ key ][ i ].name;

	        	var electionCount = parseInt( currentElectionConfig[ key ][ i ].count );
	        	var electionJoint = currentElectionConfig[ key ][ i ].joint;
				var electionCandidates = currentElectionConfig[ key ][ i ].candidates;
    	
	        	var title;

	        	_cloneStep_1 = function( currentJ ) {

	        		var $itemClone = $itemTemplate.clone();
	        		var j = currentJ;

			        // fill select
			        _Nav.$select[ step ].append( '<option value="' + itemIndex + inputIdentifierSeparator + i + ( ( typeof j !== 'undefined' ) ? inputIdentifierSeparator + j : '' ) + '">' + title + '</option>' );

					$itemClone
						.removeAttr( 'data-tg style' )
		    			.attr( itemIdentifierAttr, itemIdentifierAttrVal )
		    			.attr( itemIdAttr, ( typeof j !== 'undefined' ) ? itemIndex + inputIdentifierSeparator + i + inputIdentifierSeparator + j : itemIndex + inputIdentifierSeparator + i )
						._replaceTemplatePlaceholders( [ 
							[ 'title', title ], 
							[ 'index', itemIndex ] 
						] )
					;

					// add subitems
    				var subitemsCount;
    				if ( typeof j !== 'undefined' && typeof electionCandidates !== 'undefined' && typeof electionCandidates[ j ] !== 'undefined' && electionCandidates[ j ].length > 0 ) {
    					subitemsCount = electionCandidates[ j ].length;
    				}
    				else if (
    					typeof j === 'undefined' && typeof electionCandidates !== 'undefined' 
    					&& typeof electionCandidates[ 0 ] !== 'undefined' 
    					&& typeof electionCandidates[ 0 ].candidate !== 'undefined' 
    					&& electionCandidates.length > 0
    				) {
    					subitemsCount = electionCandidates.length;
    				}
    				else {
    					subitemsCount = ( electionCount == 1 || ! electionJoint ) ? 1 + addEmptyCandidatesCount : electionCount + addEmptyCandidatesCount;
					}
					
					$itemClone._addSublistItems( subitemsCount, itemIndex, i, j, electionCandidates );
					
					// bind add subitems button
				    $itemClone
				    	.find( addSubitemsIdentifier )
				    	.on( 'click', function( event ) {
				    		event.preventDefault();
				    		var $addSubitemsButton = $( this );
				    		var $item = $addSubitemsButton.closest( '[' + itemIdentifierAttr + '="' + itemIdentifierAttrVal + '"]' );
				    		var $addSubitemsCountInput = $item.find( addSubitemsCountIdentifier );
				    		var newItemsCount = $addSubitemsCountInput.val();
				    		$item._addSublistItems( newItemsCount, itemIndex, i, j );
				    	} )
				    ;

					// append
		        	$itemClone.appendTo( $itemAppend );
		        }

		        if ( electionCount == 1 ) {
	        		title = electionGroup + electionTitleSeparator + election;
	        		_cloneStep_1();
		        }
		        else {
		        	if ( electionJoint ) {
		        		title = electionGroup + electionTitleSeparator + election + ' (gemeinsam ' + electionCount + ')';
		        		_cloneStep_1();
		        	}
		        	else {
		        		for ( var j = 0; j < electionCount; j++ ) {
		        			title = electionGroup + electionTitleSeparator + election + electionTitleSeparator + ( j + 1 ) + '&thinsp;/&thinsp;' + electionCount;
		        			_cloneStep_1( j );
		        		}
		        	}
		        }

			}

        }

        // get config on submit
        $form
        	.off( 'submit.form.' + step )
	        .on( 'submit.form.' + step, function( event ) {

	        	event.preventDefault();

	        	var $form = $( this );
	        	$form._getElectionCurrentConfig_1();

	        	//_validateItems();

	        	_buildStep_2();

	        	$form.trigger( 'built' );

	        } )
	    ;

    };

	// step 0 – config
    _buildStep_0 = function() {

    	// TOFIX?: what about currentElectionPreset vs. currentElectionConfig?

    	var step = 0;

    	// form
        var $form = Utils.$functionElems.filter( stepFormIdentifierPrefix + step + identifierSuffix );

        // item
        var $itemTemplate = Utils.$targetElems.filter( itemTemplateIdentifierPrefix + step + identifierSuffix );
        var $itemAppend = Utils.$targetElems.filter( itemAppendIdentifierPrefix + step + identifierSuffix );

        // item subitem
        var $subitemTemplate = Utils.$targetElems.filter( subitemTemplateIdentifierPrefix + step + identifierSuffix );

        // empty before fill
        $itemAppend.empty();
        
        // build ui for each election type
        for ( var key in electionConfig ) {

        	var itemIndex = Object.keys( electionConfig ).indexOf( key );
        	var $itemClone = $itemTemplate.clone();
			$itemClone
				.removeAttr( 'data-tg style' )
    			.attr( itemIdentifierAttr, itemIdentifierAttrVal )
    			.attr( itemIdAttr, itemIndex )
				._replaceTemplatePlaceholders( [ 
					[ 'title', key ], 
					[ 'index', itemIndex ] 
				] )
			;

    		// name item inputs
    		for ( var inputKey in itemInputs[ step ] ) {
    			var $input = $itemClone.find( itemInputs[ step ][ inputKey ].selector );
    			if ( $input.length > 0 ) {
    				$input
    					.attr( formIdentifierAttr, itemInputs[ step ][ inputKey ].name + itemIndex )
    					.attr( 'value', itemInputs[ step ][ inputKey ].value )
    				;
		    		// fill if pre configured (use currentElectionPreset here since currentElectionConfig will always contain these values at this time)
		    		if ( 
		    			typeof currentElectionPreset !== 'undefined' 
		    			&& currentElectionPreset[ key ] 
		    		) {
		    			$input.attr( 'checked', '' );
		    		}
    			}
    		}

			// add subitems
			var $electionTypesListSubitemAppend = $itemClone.find( subitemAppendIdentifierPrefix + step + identifierSuffix );

			for ( var i = 0; i < electionConfig[ key ].length; i++ ) {

        		var subitemIndex = i;
        		var $subitemClone = $subitemTemplate.clone();

        		// remove count input or hide checkbox
        		if ( electionConfig[ key ][ i ].countVariable ) {
        			if ( 
        				typeof currentElectionConfig[ key ] !== 'undefined'
        				&& typeof currentElectionConfig[ key ][ i ] !== 'undefined'
        				&& ! currentElectionConfig[ key ][ i ].count > 1 
        			) {
	        			// hide checkbox
	        			$subitemClone.find( '[data-tp-o="3"]' ).hide();
        			}
        		}
        		else if ( ! ( Number.isInteger( electionConfig[ key ][ i ].count ) && electionConfig[ key ][ i ].count > 1 ) ) {
        			// remove input
        			$subitemClone.find( '[data-tp-o="3"]' ).remove();
        		} 

        		// remove count if not required
        		if ( electionConfig[ key ][ i ].countVariable ) {
        			$subitemClone.find( '[data-tp-o="1"]' ).remove();
        		}
        		else {
        			$subitemClone.find( '[data-tp-o="2"]' ).remove();
        		}

        		$subitemClone
        			.removeAttr( 'data-tg style' )
        			._replaceTemplatePlaceholders( [ 
        				[ 'electionItemType', electionConfig[ key ][ i ].name ], 
        				[ 'electionItemCount', electionConfig[ key ][ i ].count ], 
        				[ 'itemIndex', itemIndex ], 
        				[ 'index', subitemIndex ] 
        			] )
					._validateNumberInput()
        		;

        		// name subitem inputs
        		for ( var inputKey in subitemInputs[ step ] ) {
        			var $input = $subitemClone.find( subitemInputs[ step ][ inputKey ].selector );
        			if ( $input.length > 0 ) {
        				// add current value if set (checkbox: checkend, number: value)
        				$input
        					.attr( formIdentifierAttr, subitemInputs[ step ][ inputKey ].name + itemIndex + inputIdentifierSeparator + subitemIndex )
	    					.attr( 'value', subitemInputs[ step ][ inputKey ].value )
	    				;
			    		// fill if pre configured
			    		if ( 
			    			$input.is( '[' + formIdentifierAttr + '^="count"]' ) 
			    			&& currentElectionConfig[ key ] 
			    			&& currentElectionConfig[ key ][ i ] 
			    			&& currentElectionConfig[ key ][ i ].countVariable === true 
			    			&& currentElectionConfig[ key ][ i ].count > 0 
			    		) {
			    			$input.attr( 'value', currentElectionConfig[ key ][ i ].count );
			    		}
			    		if ( 
			    			$input.is( '[type="checkbox"]' ) 
			    			&& currentElectionConfig[ key ] 
			    			&& currentElectionConfig[ key ][ i ] 
			    			&& currentElectionConfig[ key ][ i ].joint === JSON.parse( subitemInputs[ step ].joint.value ) 
			    		) {
			    			$input.attr( 'checked', '' );
			    		}
        			}
        		}

        		// append subitem
				$subitemClone.appendTo( $electionTypesListSubitemAppend );
			}

			// append item
        	$itemClone
        		.appendTo( $itemAppend )
        		.checkSlideToggle( {
			        triggerSelector: '[data-g-fn="accordion-trigger"]'
			    } )
			;

        }

        // get config on submit
        $form
        	.off( 'submit.form.' + step )
	        .on( 'submit.form.' + step, function( event ) {

	        	event.preventDefault();

	        	var $form = $( this );
	        	$form._getElectionCurrentConfig_0();

	        	_buildStep_1();

	        	$form.trigger( 'built' );

	        } )
	    ;

    };

    // NAVIGATION

	// vars
    var _Nav = {
    	steps: 3,
    	currentStep: 0,
    	previousStep: null,
    	$electionStep: [],
    	$stepPrev: [],
    	$stepNext: [],
    	$select: [],
    	selectValues: [],
    	currentSelectValue: [],
    	currentItemCoordinates: null,
    	electionDoingSelectValue: null
    };

	_Nav._getSelectValues = function( select ) {
		var values = [];
		$( select ).find( 'option' ).each( function() {
			values.push( $( this ).val() );
		} );
		return values;
	}

	_Nav._setItem = function( value, step, disableOptionsList ) {

		var targetStep = ( typeof step === 'undefined' ) ? _Nav.currentStep : step;
		_Nav.currentSelectValue[ targetStep ] = value;

		console.log( '_Nav._setItem (step: ' + targetStep + ') to: ' + value );

		// enable if option disabled
		_Nav.$select[ targetStep ]
			.find( 'option[value="' + value + '"]' )
				.removeAttr( 'disabled' )
		;

		// change select
		_Nav.$select[ targetStep ]
			.val( value )
			.trigger( 'change' )
		;

		// disable options
		if ( typeof disableOptionsList !== 'undefined' ) {
			for ( var i = 0; i < disableOptionsList.length; i++ ) {
				_Nav.$select[ targetStep ]
					.find( 'option[value="' + disableOptionsList[ i ] + '"]' )
						.removeAttr( 'disabled' )
						.attr( 'disabled', '' )
				;
			}
		}
	}

	_Nav._gotoStep = function( gotoStep, gotoSelectValue ) {

		console.log( 'begin nav goto ' + gotoStep );

		_Nav.previousStep = _Nav.currentStep;
		_Nav.currentStep = gotoStep;

		console.log( 'GOTO: ' + _Nav.currentStep + ' FROM: ' + _Nav.previousStep );

		for ( var l = 0; l < _Nav.steps; l++ ) {

    		if ( l !== _Nav.currentStep ) {
    			// hide all step sections but current
    			_Nav.$electionStep[ l ].hide();
    		}
    		else {
    			// show current
    			_Nav.$electionStep[ l ].show();
    		}

		}

		// get select values (always refresh since may have changed in step 0)
		if ( _Nav.currentStep == 1 ) {
			// iterate each selection
			_Nav.selectValues = _Nav._getSelectValues( _Nav.$select[ _Nav.currentStep ] );
		}

		// if step == 0 (config election)
		if ( _Nav.currentStep == 0 ) {
			// forget done elections since config may change (candidates and votes will be kept as long as relatet config will be kept)
			_Nav.electionDoingSelectValue = null;
		}

		// if step > 0
		if ( _Nav.currentStep > 0 ) {
			// select uptate only if null (else keep current value)
			_Nav.currentSelectValue[ _Nav.currentStep ] = _Nav.$select[ _Nav.currentStep ].val();

			console.log( '_Nav.currentSelectValue[ ' + _Nav.currentStep + ' ]: ' + _Nav.currentSelectValue[ _Nav.currentStep ] );
		}

		// if step == 1 (prepare election)
		if ( _Nav.currentStep == 1 ) {

			_showMissingElectionsDialog = function() {
				var $confirmModal = Utils.$targetElems.filter( '[data-tg="confirm-modal"]' );
				$confirmModal._confirmModal( {
					header: 'Hinweis',
					headerClass: 'modal-title',
					body: 'Bitte wähle mindestens eine Wahl aus.',
					confirmButtonHide: true,
					dismissButtonClass: 'btn btn-primary',
					dismissButtonIconClass: 'fa fa-check',
					dismissButtonText: 'Ok'
				} );
			}

			if ( _Nav.previousStep < _Nav.currentStep ) {
				console.log( 'going forward: ' + typeof currentElectionConfig );
				// going forward
				if ( JSON.stringify( currentElectionConfig ) === '{}' ) {
					_showMissingElectionsDialog();
					_Nav._gotoStep( 0 );
					return false;
				}
			}

			if ( _Nav.previousStep > _Nav.currentStep ) {
				// going back
				if ( _Nav.currentSelectValue[ _Nav.currentStep ] != '-1' ) {
					// if item != all, set to same value as step 2
					_Nav._setItem( _Nav.currentSelectValue[ _Nav.currentStep + 1 ] );
				}
			}

		}
		
		// if step == 2 (execute election) set select to 1st item
		if ( _Nav.currentStep == 2 ) {

			_checkForCandidates = function( value ) {
				// TEST –  && _Nav.selectValues.indexOf( value ) >= 0
				if ( typeof value !== 'undefined' ) {
					var selectCoordinates = value.split( inputIdentifierSeparator );
					var check = _checkElectionConfigCandidatesOrVotes( selectCoordinates[ 0 ], selectCoordinates[ 1 ], selectCoordinates[ 2 ] );
					return check[ 0 ];
				}
				else {
					return false;
				}
			}

			_showMissingCandidatesDialog = function() {
				var $confirmModal = Utils.$targetElems.filter( '[data-tg="confirm-modal"]' );
				$confirmModal._confirmModal( {
					header: 'Hinweis',
					headerClass: 'modal-title',
					body: 'Bitte Kandidaten hinzufügen.',
					confirmButtonHide: true,
					dismissButtonClass: 'btn btn-primary',
					dismissButtonIconClass: 'fa fa-check',
					dismissButtonText: 'Ok'
				} );
			}

			_increaseSelectValue = function( value, disableOptionsList ) {

				// remember currently doing item
				_Nav.electionDoingSelectValue = value;
				console.log( '_Nav.electionDoingSelectValue: ' + _Nav.electionDoingSelectValue );

				_Nav.currentSelectValue[ _Nav.currentStep ] = value;
				console.log( '_increaseSelectValue: ' + value );
				//  check for candidates before increase
				if ( _checkForCandidates( value ) ) {
					console.log( 'valid' );
					_Nav._setItem( value, undefined, disableOptionsList );
					return true;
				}
				else {
					console.log( 'candidates missing, go back' );
					_showMissingCandidatesDialog();
					_Nav._gotoStep( 1, value );
					return false;
				}

			}

			_getDisableOptionsList = function( startList ) {
				var valueList = ( typeof startList !== 'undefined' ) ? startList : [];
				var startI = ( _Nav.electionDoingSelectValue !== null ) ? _Nav.selectValues.indexOf( _Nav.electionDoingSelectValue ) + 1 : startList.length + 1;
				console.log( 'DISABLE:' );
				for ( var i = startI; i < _Nav.selectValues.length; i++ ) {
					console.log( i + ': ' + _Nav.selectValues[ i ] );
					valueList.push( _Nav.selectValues[ i ] );
				}
				return valueList;
			}

		    // check increase currentSelectValue

		    //console.log( '_Nav.currentSelectValue[ _Nav.currentStep ]: ' + _Nav.currentSelectValue[ _Nav.currentStep ] );

			// entering step 2
			console.log( 'CHECK IF SET SELECT' );
			if ( _Nav.previousStep != _Nav.currentStep ) {
				console.log( _Nav.previousStep + ' != ' + _Nav.currentStep );
				// check if select value
				if ( 
					_Nav.currentSelectValue[ _Nav.currentStep ] == '-1' 
					&& _Nav.electionDoingSelectValue === null
				){
					console.log( 'increase & check' );
					// increase item if exists (set to first)
					var value = _Nav.selectValues[ ( _Nav.selectValues.indexOf( '-1' ) + 1 ) ];
					// TODO: calculate disable list
					var disableOptionsList = ( _Nav.electionDoingSelectValue != _Nav.selectValues[ _Nav.selectValues.length - 1 ] ) ? _getDisableOptionsList( [ '-1' ] ) : undefined;
					if ( ! _increaseSelectValue( value, disableOptionsList ) ) {
						return false;
					}
				}
				else {
					// set select to current value since markup has been built new
					console.log( 'adapting value to doing' );
					var value = _Nav.electionDoingSelectValue;
					// TODO: calculate disable list
					var disableOptionsList = ( _Nav.electionDoingSelectValue != _Nav.selectValues[ _Nav.selectValues.length - 1 ] ) ? _getDisableOptionsList( [ '-1' ] ) : undefined;
					/*if ( ! _increaseSelectValue( value, disableOptionsList ) ) {
						return false;
					}*/
					// check for candidates
					if ( _checkForCandidates( value ) ) {
						// has candidates
						_Nav._setItem( value, undefined, disableOptionsList );
					}
					else {
						// TODO: if not first item go to latest valid item
						console.log( 'candidates missing but not first, goint to latest valid election' );
						if ( _Nav.selectValues.indexOf( _Nav.electionDoingSelectValue ) - 1 > 0 ) {
							// is not first item, go one item back
							var value = _Nav.selectValues[ ( _Nav.selectValues.indexOf( _Nav.electionDoingSelectValue ) - 1 ) ];
							_Nav.electionDoingSelectValue = value;
							var disableOptionsList = ( _Nav.electionDoingSelectValue != _Nav.selectValues[ _Nav.selectValues.length - 1 ] ) ? _getDisableOptionsList( [ '-1' ] ) : undefined;
							_Nav._setItem( value, undefined, disableOptionsList );
							return true;
						}
						else {
							// is first item, cannot go one item back, going back to step 1
							_showMissingCandidatesDialog();
							_Nav._gotoStep( 1, value );
							return false;
						}
					}
				}
			}
			// already in step 2
			if ( _Nav.previousStep == _Nav.currentStep ) {
				console.log( _Nav.previousStep + ' == ' + _Nav.currentStep );

				// increase item if exists
				if ( _Nav.selectValues.indexOf( _Nav.currentSelectValue[ _Nav.currentStep ] ) + 1 < _Nav.selectValues.length ) {
					console.log( 'increase & check' );
					// next item exists
					var value = _Nav.selectValues[ ( _Nav.selectValues.indexOf( _Nav.currentSelectValue[ _Nav.currentStep ] ) + 1 ) ];
					if ( ! _increaseSelectValue( value, disableOptionsList ) ) {
						return false;
					}
				}
				else {
					// all elections done, show dialog
					var $confirmModal = Utils.$targetElems.filter( '[data-tg="confirm-modal"]' );

					$confirmModal._confirmModal( {
						header: 'Fertig',
						headerClass: 'modal-title text-success',
						body: '<p>Es wurden alle Wahlgänge durchgeführt.<p><p class="mb-0">Falls irgendwo Korrekturen nötig sein sollten, einfach zurück gehen, korrigieren und Wahlen fortsetzen bis zu dieser Meldung.</p>',
						confirmButtonHide: true,
						dismissButtonClass: 'btn btn-success',
						dismissButtonIconClass: 'fa fa-check',
						dismissButtonText: 'Ok'
					} );

					// enable all select options
					_Nav.$select[ _Nav.currentStep ]
						.find( 'option[disabled]' )
							.removeAttr( 'disabled' )
					;
				}
			}

		}

		_Nav._toTop();

	    // set select
	    if ( 
	    	typeof gotoSelectValue !== 'undefined' 
	    	&& typeof _Nav.$select[ _Nav.currentStep ] !== 'undefined'
	    	&& _Nav.selectValues.indexOf( gotoSelectValue ) >= 0 
	    ) {
			_Nav._setItem( gotoSelectValue );
	    }

		console.log( 'end nav goto ' + _Nav.currentStep );
	}

	_Nav._prev = function( gotoSelectValue ) {

		var currentStep = ( _Nav.currentStep > 0 ) ? _Nav.currentStep - 1 : 0;
		_Nav._gotoStep( currentStep, gotoSelectValue );
		_Nav._toTop();

		console.log( 'nav prev ' + _Nav.currentStep );
	}

	_Nav._next = function( gotoSelectValue ) {

		var currentStep = ( _Nav.currentStep < _Nav.steps - 1 ) ? _Nav.currentStep + 1 : _Nav.steps - 1;
		_Nav._gotoStep( currentStep, gotoSelectValue );
		_Nav._toTop();

		console.log( 'nav next ' + _Nav.currentStep );
	}

	_Nav._toTop = function() {
		//Utils.$scrollRoot.animate( { scrollTop: 0 }, 300 );
		Utils.$functionElems.filter( '[data-fn="to-top-wrapper"]' ).children( 'a' ).trigger( 'click' );
	}

    _Nav._init = function() {

    	// get step sections, get back buttons
    	for ( var i = 0; i < _Nav.steps; i++ ) {
    		//console.log( 'i: ' + i );

    		_Nav.$electionStep[ i ] = Utils.$targetElems.filter( stepIdentifierPrefix + i + identifierSuffix );

    		// prev (only step 1 & 2)
    		if ( i > 0 ) {
    			_Nav.$stepPrev[ i ] = Utils.$functionElems.filter( stepPrevIdentifierPrefix + i + identifierSuffix );
    			_Nav.$stepPrev[ i ].on( 'click', function( event ) {
    				event.preventDefault();
    				_Nav._prev();
    			} );
    		}

			// next (all but step 3)
    		if ( i < _Nav.steps ) {
    			_Nav.$stepNext[ i ] = Utils.$functionElems.filter( stepFormIdentifierPrefix + i + identifierSuffix );
    			// use own event – build first, then navigate since otherwise next step’s data is empty
    			_Nav.$stepNext[ i ].on( 'built', function() {
    				_Nav._next();
    			} );
    		}

    		// get select / select change functions
    		if ( i > 0 ) {

	    		if ( Utils.$functionElems.filter( stepSelectIdentifierPrefix + i + identifierSuffix ).length > 0 ) {
	    			_Nav.$select[ i ] = Utils.$functionElems.filter( stepSelectIdentifierPrefix + i + identifierSuffix );

					// select value initial definition
	    			_Nav.currentSelectValue[ i ] = _Nav.$select[ i ].val();

	    			console.log( '_Nav.currentSelectValue[ ' + i + ' ]: ' + _Nav.currentSelectValue[ i ] );

	    			_Nav.$select[ i ].on( 'change', function() {

	    				var value = $( this ).val();
	    				var $form = $( this ).closest( 'form' );
	    				var $showStepsButLast = $form .find( Utils.$targetElems.filter( '[data-tg="hide-last-item"]' ) );

	    				// refresh navigator data
	    				_Nav.currentSelectValue[ _Nav.currentStep ] = value;
	    				if ( !! value ) {
	    					_Nav.currentItemCoordinates = value.split( inputIdentifierSeparator );
	    				}

	    				console.log( 'doing select change to: ' + value + ' – _Nav.currentSelectValue[ ' + _Nav.currentStep + ' ]: ' + ( ( _Nav.currentSelectValue != null  ) ? _Nav.currentSelectValue[ _Nav.currentStep ] : undefined ) + ' – _Nav.currentItemCoordinates: ' + _Nav.currentItemCoordinates[ 0 ] + ' ' + _Nav.currentItemCoordinates[ 1 ] + ' ' + _Nav.currentItemCoordinates[ 2 ] );

	    				if ( value != -1 ) {
		    				// hide all
		    				$form
		    					.find( '[' + itemIdAttr + ']' )
		    					.hide()
		    				;
		    				// show selected
		    				$form
		    					.find( '[' + itemIdAttr + '^="' + value + '"]' )
		    					.show()
		    				;

		    				// show next item button / button addon (only if not last value)
		    				if ( value != _Nav.selectValues[ _Nav.selectValues.length - 1 ] ) {
			    				$showStepsButLast.show();
			    			}
			    			else {
			    				$showStepsButLast.hide();
			    			}
	    				}
	    				else {
		    				// show all

		    				// get current item coordinates
		    				_Nav.currentItemCoordinates = null;

		    				$form
		    					.find( '[' + itemIdAttr + ']' )
		    					.show()
		    				;

		    				// hide next item button / button addon
			    			$showStepsButLast.hide();
	    				}

	    			} );
	    		}
    		}

			// next item button
			if ( i == 1 ) {
				if ( Utils.$functionElems.filter( '[data-fn="election-next-item"]' ) ) {
					$nextItemButton = Utils.$functionElems.filter( '[data-fn="election-next-item"]' );
					
					$nextItemButton.on( 'click', function( event ) {
						event.preventDefault();
						var value = _Nav.$select[ _Nav.currentStep ].val()
						var newValue = _Nav.selectValues[ ( _Nav.selectValues.indexOf( value ) + 1 ) ];
						_Nav.$select[ _Nav.currentStep ]
							.val( newValue )
							.trigger( 'change' )
						;
						_Nav.currentSelectValue[ i ] = newValue;
		    			_Nav.currentItemCoordinates = newValue.split( inputIdentifierSeparator );
						_Nav._toTop();
					} );
					
				}
			}

    	}

    	// hide step sections but current
    	_Nav._gotoStep( _Nav.currentStep );

    }

    _Nav._reset = function() {

    	_Nav.currentStep = 0;
    	_Nav.previousStep = null;
    	_Nav.selectValues = [];
    	_Nav.currentSelectValue = [];
    	_Nav.electionDoingSelectValue = null;

    	_Nav._gotoStep( _Nav.currentStep );

    }

    // MENU FUNCTIONS

	// save election in local storage
	_saveLocal = function( triggerElem ) {
		console.log( 'save' );
		var $triggerElem = $( triggerElem );
		var successClass = 'bg-success text-white';
		
		Utils.$functionElems.filter( stepFormIdentifierPrefix + _Nav.currentStep + identifierSuffix )[ ( '_getElectionCurrentConfig_' + _Nav.currentStep ) ]();
		
		if ( localStorage.getItem( localStorageKey ) ) {
			$triggerElem
				.addClass( successClass )
				.delay( 300 ).queue( function() {
					$( this ).removeClass( successClass ).dequeue();
					Utils.$functionElems.filter( '#toggle-navbar-collapse' ).trigger( 'click' );
				} )
			;
		}
	}
	// init
	Utils.$functionElems.filter( '[data-fn="config-save"]' ).on( 'click', function() {
		_saveLocal( this );
	} );

	// reset election
	_resetElection = function( config ) {

		// delete local storage
		localStorage.removeItem( localStorageKey );

		var newConfig = ( typeof config !== 'undefined' ) ? $.extend( {}, config ) : $.extend( {}, electionConfig );

		if ( typeof config !== 'undefined' ) {
			currentElectionPreset = $.extend( {}, newConfig );
		}
		else {
			currentElectionPreset = undefined;
		}
		currentElectionConfig = $.extend( {}, newConfig );

		_buildStep_0();
		_Nav._reset();

    	// hide results container
    	Utils.$targetElems.filter( stepIdentifierPrefix + 3 + identifierSuffix ).hide();
	}

	// save current election config as json file
	_downloadCurrentElectionConfig = function() {
		// save config if exists

		// get current config of current step
		console.log( 'save step: ' + _Nav.currentStep );

		var currentStep = ( _Nav.currentStep < _Nav.steps - 1 ) ? _Nav.currentStep : _Nav.steps - 2;
		Utils.$functionElems.filter( stepFormIdentifierPrefix + currentStep + identifierSuffix )[ ( '_getElectionCurrentConfig_' + currentStep ) ]();

		if ( typeof currentElectionConfig !== 'undefined' ) {
			var $saveModal = Utils.$targetElems.filter( '[data-tg="save-modal"]' );
			var $fileNameInput = $saveModal.find( 'input[name="file_name"]' );
			var $confirmButton = $saveModal.filter( Utils.$functionElems.find( '[data-fn="save-modal-confirm"]' ) );

			var d = new Date,
			dateString = [ 
				d.getFullYear(), 
				( '00' + ( d.getMonth() + 1 ) ).slice( -2 ),
				( '00' + d.getDate() ).slice( -2 )
			].join( '-' ) + '_' + [ 
				( '00' + d.getHours() ).slice( -2 ),
				( '00' + d.getMinutes() ).slice( -2 ),
				( '00' + d.getSeconds() ).slice( -2 )
			].join( '-' );
			$fileNameInput
				.val( downloadFileFallback + dateString )
				.on( 'focus', function() {
					$( this ).select();
				} )
			;

			$.fn._addDownload = function( name ) {
				var $a = $( this );
				var content = JSON.stringify( currentElectionConfig );
				var type = 'application/json';
				var file = new Blob( [ content ], { type: type } );
				$a
					.attr( 'href', URL.createObjectURL( file ) )
					.attr( 'download', $fileNameInput.val() + '.json' )
				;
			}

			$saveModal.on( 'shown.bs.modal', ( function( fileNameInput ) {

				$fileNameInput = $( fileNameInput );
				$confirmButton = Utils.$functionElems.filter( '[data-fn="save-modal-confirm"]' );

				$confirmButton._addDownload();

				// update file name on change
				$fileNameInput.on( 'change', function() {
					$confirmButton._addDownload();
				} );

				setTimeout( function() {
					$fileNameInput.focus();
				}, 550 );

			} )( $fileNameInput ) );

			// prepare hide modal
			$confirmButton.on( 'click', function() {
				Utils.$targetElems.filter( '[data-tg="save-modal"]' ).modal( 'hide' );
			} );

			// show
			$saveModal.modal( 'show' );
		}
		else {
			// TODO: fallback message
		}
	}
	// init
	Utils.$functionElems.filter( '[data-fn="config-download"]' ).on( 'click', function() {
		Utils.$functionElems.filter( '#toggle-navbar-collapse' ).trigger( 'click' );
		_downloadCurrentElectionConfig();
	} );

	// load election config from json file
	_loadCurrentElectionConfig = function() {
		// save config if exists
		var $loadModal = Utils.$targetElems.filter( '[data-tg="load-modal"]' );
		var $form = $loadModal.find( 'form' );

		var $fileInput = $form.find( 'input[name="file_name"]' );
		var result;

		$loadModal.modal( 'show' );

		$fileInput.on( 'change', function( event ) {

			var files = event.target.files;

			if ( !! files && files.length > 0 ) {
				var reader = new FileReader();

				reader.onload = ( function( file ) {
		            return function( event ) {
						try {
							result = JSON.parse( event.target.result );
						} 
						catch( error ) {
							console.log( 'error trying to parse json: ' + error );
						}
					}
				} )( files[ 0 ] );
				reader.readAsText( files[ 0 ] );
			}
		} );

		$form.one( 'submit', function( event ) {
			event.preventDefault();

			if ( typeof result !== 'undefined' ) {

		    	_resetElection( result );

				Utils.$targetElems.filter( '[data-tg="load-modal"]' ).modal( 'hide' );

				// reset file input
				$fileInput.val( '' );
			}

		} );
	}
	// init
	Utils.$functionElems.filter( '[data-fn="config-load"]' ).on( 'click', function() {
		Utils.$functionElems.filter( '#toggle-navbar-collapse' ).trigger( 'click' );
		_loadCurrentElectionConfig();
	} );

	// confirm modal
	$.fn._confirmModal = function( options ) {

        var defaults = {
			header: 'Bitte bestätigen',
			headerClass: 'modal-title',
			body: 'Bitte bestätige die Aktion.',
			dismissButtonHide: false,
			confirmButtonHide: false,
			dismissButtonClass: 'btn btn-default',
			confirmButtonClass: 'btn btn-danger',
			dismissButtonIconClass: 'fa fa-close',
			confirmButtonIconClass: 'fa fa-check',
			dismissButtonText: 'Abbrechen',
			confirmButtonText: 'Ok',
			confirmCallback: null,
			dismissCallback: null
        };

        options = $.extend( {}, defaults, options );

        var $modal = $( this );

		$modal.find( '[data-g-tg="modal-title"]' ).html( options.header ).attr( 'class', options.headerClass );
		$modal.find( '[data-g-tg="modal-body"]' ).html( options.body );

		var $confirmButton = $modal.find( '[data-g-fn="confirm-modal-confirm"]' );
		if ( ! options.confirmButtonHide ) {
			$confirmButton
				.attr( 'class', options.confirmButtonClass )
				.show()
			;
			$confirmButton.find( '[data-g-tg="btn-icon"]' ).attr( 'class', options.confirmButtonIconClass );
			$confirmButton.find( '[data-g-tg="btn-text"]' ).html( options.confirmButtonText );
		}
		else {
			$confirmButton.hide();
		}

		var $dismissButton = $modal.find( '[data-g-fn="confirm-modal-dismiss"]' );
		if ( ! options.dismissButtonHide ) {
			$dismissButton
				.attr( 'class', options.dismissButtonClass )
				.show()
			;
			$dismissButton.find( '[data-g-tg="btn-icon"]' ).attr( 'class', options.dismissButtonIconClass );
			$dismissButton.find( '[data-g-tg="btn-text"]' ).html( options.dismissButtonText );
		}
		else {
			$dismissButton.hide();
		}

		$modal.modal( 'show' );

		if ( options.confirmCallback ) {
			$confirmButton.one( 'click', function() {
				options.confirmCallback();
			} );
		}

		if ( options.dismissCallback ) {
			$modal.one( 'hide.bs.modal', function() {
				options.dismissCallback();
			} );
		}
	}
	// init
	Utils.$functionElems.filter( '[data-fn="config-delete"]' ).on( 'click', function() {

		Utils.$functionElems.filter( '#toggle-navbar-collapse' ).trigger( 'click' );

		var $confirmModal = Utils.$targetElems.filter( '[data-tg="confirm-modal"]' );

		$confirmModal._confirmModal( {
			header: 'Löschen bestätigen',
			headerClass: 'modal-title text-danger',
			body: 'Möchtest Du wirklich die gesamte Wahl zurücksetzen?',
			dismissButtonClass: 'btn btn-default',
			confirmButtonClass: 'btn btn-danger',
			dismissButtonIconClass: 'fa fa-close',
			confirmButtonIconClass: 'fa fa-trash',
			dismissButtonText: 'Nein, doch nicht',
			confirmButtonText: 'Zurücksetzen',
			confirmCallback: function() {
				_resetElection();
				Utils.$targetElems.filter( '[data-tg="confirm-modal"]' ).modal( 'hide' );
			}
		} );
	} );

	// ERRORS
	function _handleError( error ) {

		// fallback message
		var message = 'Bei der Berechnung des Wahlergebnisses ist leider ein unbekannter Fehler aufgetreten.';

		// get error message
		if ( typeof error.message ) {
			message = error.message;
		}

		// show modal
		var $confirmModal = Utils.$targetElems.filter( '[data-tg="confirm-modal"]' );
		$confirmModal._confirmModal( {
			header: 'Fehler',
			headerClass: 'modal-title text-warning',
			body: message,
			confirmButtonHide: true,
			dismissButtonClass: 'btn btn-primary btn-warning',
			dismissButtonIconClass: 'fa fa-check',
			dismissButtonText: 'Ok'
		} );
	}

	// SECURITY

	// TODO: enable

	// confirm before refresh or close (confirm close will not work in all browsers)
	/*
	window.addEventListener( 'beforeunload', function( event ) {
		var confirmationMessage = 'Möchtest Du diese Seite wirklich verlassen?';
		( event || window.event ).returnValue = confirmationMessage;
		return confirmationMessage;
	} );
	*/

	// INIT

    // (called from init.js)
    $.fn.dibElection = function() {
    	_buildStep_0();
    	_Nav._init();
    }

} )( jQuery, MY_UTILS, DIB_ELECTION_CALCULATOR );

/*

EXAMPLE 1:

<ul>
    <li>
        <a href="#" aria-label="close" data-fn="dropdown-multilevel-close"></a>
    </li>
    <li>
        <a id="id-1" href="#" data-fn="dropdown-multilevel" aria-haspopup="true" aria-expanded="false">Link</a>
        <ul aria-labelledby="id-1"><!--  -->
            ...
        </ul>
    </li>
    ...
</ul>

<div data-tg="dropdown-multilevel-excluded">I will be ignored</div>


EXAMPLE 2:

- external trigger for level 1 (anywhere)
- trigger and list do not have to share a common list

<a id="id-0" href="#" data-fn="dropdown-multilevel" data-fn-target="[data-tg='navbar']" aria-haspopup="true" aria-expanded="false">Open menu</a>

<div data-tg="navbar">
    <ul aria-labelledby="id-0">
        <li>
            <a href="#" aria-label="close" data-fn="dropdown-multilevel-close"></a>
        </li>
        <li>
            <a id="id-1" href="#" data-fn="dropdown-multilevel" aria-haspopup="true" aria-expanded="false">Link</a>
            <ul aria-labelledby="id-1"><!--  -->
                ...
            </ul>
        </li>
        ...
    </ul>
</div>

*/

( function( $, Utils ) {

    // dropdown multilevel (e.g. main navigation lists)
    $.fn.dropdownMultilevel = function( options ) {

        // config
        var defaults = {
            openedClass: Utils.classes.open,
            hasOpenedSublevelClass: 'has-' + Utils.classes.open,
            animatingClass: Utils.classes.animating,
            closeElemSelector: '[data-fn="dropdown-multilevel-close"]',
            excludedBodyElements: '[data-tg="dropdown-multilevel-excluded"]',
            scrollDuration: 100
        };

        options = $.extend( {}, defaults, options );

        // vars
        var openedElems = []; // remember opened elements
        var $elems = $( this );
        var $excludedElems = Utils.$targetElems.filter( options.excludedBodyElements );

        // functions
        $.fn._getTarget = function() {
            // gets target (li) defined by triggers target attribute or gets parent li as target
            var $this = $( this );
            var $target;
            if ( $this.attr( Utils.attributes.target ) ) {
                // has fn target attr
                var targetSelector = $this.attr( Utils.attributes.target );
                $target = ( Utils.$targetElems.filter( targetSelector ).lenght > 0 ) ? Utils.$targetElems.filter( targetSelector ) : $( targetSelector );
            }
            else {
                // parent
                $target = $this.parent( 'li' );
            }
            return $target;
        };
        $.fn._getList = function() {
            // gets relatet list (ul) using aria labelledby attribute (refers to trigger id)
            var $this = $( this );
            return $this._getTarget().find( '[aria-labelledby="' + $this.attr( 'id' ) + '"]' );
        };
        $.fn._getCloseElem = function() {
            // gets close link (must be placed within first list element)
            var $this = $( this );
            return $this._getList().children().fist().find( '[data-fn="dropdown-multilevel-close"]' );
        };
        $.fn._getParentList = function() {
            // gets parent ul to target (doesn’t have to be parent to trigger)
            var $this = $( this );
            return $this._getTarget().parent( 'ul' );
        };
        $.fn._openDropdown = function() {

            var $this = $( this );
            var $thisTarget = $this._getTarget();
            var $thisParentList = $this._getParentList();
            $thisTarget
                .addClass( options.openedClass )
                .setRemoveAnimationClass( options.animatingClass );
            $this.ariaExpanded( 'true' );
            $thisParentList
                // scroll up to keep opened sublevel in position
                .animate({ scrollTop: 0 }, options.scrollDuration, function() {
                    $( this ).addClass( options.hasOpenedSublevelClass );
                } );

            // remember
            openedElems.push( $this );
        };
        $.fn._closeDropdown = function() {

            var $this = $( this );
            var $thisTarget = $this._getTarget();
            var $thisParentList = $this._getParentList();
            $thisTarget
                .removeClass( options.openedClass )
                .setRemoveAnimationClass( options.animatingClass );
            $this.ariaExpanded( 'false' );
            $thisParentList.removeClass( options.hasOpenedSublevelClass );

            // remember
            openedElems.pop();
        };
        function _closeAllDropdowns() {

            // close from latest to earliest
            for ( var i = openedElems.length - 1; i >= 0; i-- ) {
                $( openedElems[ i ] )._closeDropdown();
            }

        };

        function _listenBodyWhileDropdownOpen( currentOpenedElems ) {

            Utils.$body.one( 'click.body', function( bodyEvent ) {

                var $bodyEventTarget = $( bodyEvent.target );

                // if dropdowns open
                if ( currentOpenedElems.length > 0 ) {

                    if ( $.inArray( $bodyEventTarget[ 0 ], $excludedElems ) == -1 ) {

                        var $currentLatestOpenedList = $( currentOpenedElems[ currentOpenedElems.length - 1 ] )._getList();

                        if ( $currentLatestOpenedList.children().children( options.closeElemSelector ).parent().has( $bodyEventTarget ).length > 0 ) {
                            // click on close button

                            // TODO: allow executing link if bigmenu deepest level shown but still has sublevels

                            bodyEvent.preventDefault();

                            // close current dropdown level
                            $( currentOpenedElems[ currentOpenedElems.length - 1 ] )._closeDropdown();

                            // create new close listener
                            _listenBodyWhileDropdownOpen( openedElems );
                        }
                        else if ( $currentLatestOpenedList.has( $bodyEventTarget ).length > 0 || $currentLatestOpenedList.is( $bodyEventTarget ) ) {
                            // click on opend list (event is inside list || event is list)

                            // create new close listener
                            _listenBodyWhileDropdownOpen( openedElems );
                        }
                        else if ( ! $currentLatestOpenedList.has( $bodyEventTarget ).length > 0 ) {
                            // click outside dropdowns

                            //close all
                            _closeAllDropdowns();
                        }

                    }
                    else {

                        // create new close listener
                        _listenBodyWhileDropdownOpen( openedElems );

                    }

                }

            } );

        }

        $elems.each( function() {

            var $elem = $(this);
            var targetSelector = $elem.attr( Utils.attributes.target ) || '';
            var $target = $elem._getTarget(); // ( targetSelector != '' ) ? $( targetSelector ) : $elem.parent();
            var $list = $elem._getList(); // $target.find( '[aria-labelledby="' + $elem.attr( 'id' ) + '"]' );

            $elem.on( 'click', function( event ) {

                if ( $target.length > 0 && $list.length > 0 ) {

                    // remove event listener if click on dropdown trigger since new event listener will be created after click
                    Utils.$body.off( 'click.body' );

                    // check if clicked on open dropdown trigger
                    var $eventTarget = $( event.target );
                    var $latestOpenedElem = $( openedElems[ openedElems.length - 1 ] );

                    if ( $latestOpenedElem.has( $eventTarget ).length > 0 || $latestOpenedElem.is( $eventTarget ) ) {

                        event.preventDefault();

                        // close current dropdown level
                        $( openedElems[ openedElems.length - 1 ] )._closeDropdown();

                        if ( openedElems.length > 0 ) {

                            // create new close listener
                            _listenBodyWhileDropdownOpen( openedElems );
                        }

                    }
                    else {

                        // check if do something (check visibility and position inside parent since might be visible but out of sight)
                        if ( ! $list.is( ':visible' ) || ! $list.elemPositionedInside( $target.parent() ) ) {

                            // show list, stop link execution
                            event.preventDefault();

                            // close opened dropdowns if not parents
                            if ( openedElems.length > 0 ) {

                                var $latestOpenedList = $( openedElems[ openedElems.length - 1 ] )._getList();

                                // check if clicked dropdown is inside or outside of already opened dropdown
                                if ( ! $latestOpenedList.has( $elem ).length > 0 ) {

                                    // click outside opened dropdown – close all
                                    _closeAllDropdowns();
                                }
                                else {
                                    // keep opened dropdowns
                                }

                            }

                            // open
                            $elem._openDropdown();

                            // check options, do any special taks?
                            var options;
                            if ( ( options = $elem.getOptionsFromAttr() ) ) {
                                if ( options.focusOnOpen ) {
                                    Utils.$targetElems.filter( options.focusOnOpen ).focus();
                                }
                            }

                            event.stopPropagation();

                            // create new close listener
                            _listenBodyWhileDropdownOpen( openedElems );

                        }
                        else {
                            // related list is already shown, do not open or close anything

                            // create new close listener
                            _listenBodyWhileDropdownOpen( openedElems );
                        }
                    }

                }

            } );

        } );

        // close all dropdowns on resize & orientationchange
        Utils.$window.on( 'orientationchange sizeChange', function() {
            _closeAllDropdowns();
        } );

    };

} )( jQuery, MY_UTILS );

/*

<div data-fn="remote-event" data-fn-target="#id-1" data-fn-options="{ triggerEvent: 'click',  remoteEvent: 'click' }"></div>

*/

( function( $, Utils ) {

    $.fn.remoteEvent = function() {

        var $elems = $( this );

        $elems.each( function() {

            var $elem = $( this );
            var targetSelector = $elem.attr( Utils.attributes.target ) || '';
            var $target = ( Utils.$targetElems.filter( targetSelector ).lenght > 0 ) ? Utils.$targetElems.filter( targetSelector ) : $( targetSelector );
            var attrOptions = $elem.getOptionsFromAttr();
            var triggerEvent = attrOptions.triggerEvent || 'click';
            var remoteEvent = attrOptions.remoteEvent || 'click';

            $elem.on( triggerEvent, function() {
                if ( $target.length > 0 ) {
                    $target.trigger( remoteEvent );
                }
            } );

        } );

    };

} )( jQuery, MY_UTILS );
( function( $, Utils ) {

    // to top
    $.fn.toggleToTopButton = function( options ) {

        $elem = $( this );

        var defaults = {
            threshold: 100,
            visibleClass: Utils.classes.open
        };

        options = $.extend( {}, defaults, options );
    
        function _positionToTopButton() {
            if ( Utils.$document.scrollTop() > 100 ) {
                if ( ! $elem.is( '.' + options.visibleClass ) ) {
                    $elem.addClass( options.visibleClass );
                }
            }
            else {
                if ( $elem.is( '.' + options.visibleClass ) ) {
                    $elem.removeClass( options.visibleClass );
                }
            }
        }

        // position
        _positionToTopButton()
        
        Utils.$window.on( 'scroll resize', function() {
            _positionToTopButton();
        });
    
    }
    // to top

} )( jQuery, MY_UTILS );
( function( $, Utils ) {

    $.fn.toggle = function() {

        var $elems = $( this );

        $elems.each( function() {

            var $elem = $( this );
            var targetSelector = $elem.attr( Utils.attributes.target ) || '';
            var $target = ( Utils.$targetElems.filter( targetSelector ).lenght > 0 ) ? Utils.$targetElems.filter( targetSelector ) : $( targetSelector );
            var openedClass = Utils.classes.open;
            var animatingClass = Utils.classes.animating;
            var transitionDuration = $target.getTransitionDuration();

            $elem.on( 'click', function() {
                if ( $target.length > 0 ) {

                    // toggle 'openedClass' & aria-expanded (use 'openedClass' to check visibility since element might be ':visible' but out of viewport)
                    if ( ! $target.is( '.' + openedClass ) ) {
                        $target.addClass( openedClass );
                        $elem.ariaExpanded( 'true' );
                    }
                    else {
                        $target.removeClass( openedClass );
                        $elem.ariaExpanded( 'false' );
                    }

                    // set & remove 'animatingClass'
                    $target.setRemoveAnimationClass( animatingClass );
                }
            } );

        } );

    };

} )( jQuery, MY_UTILS );
( function( $, Utils ) {

    // toggle (e.g. main navigation)
    Utils.$functionElems.filter( '[data-fn="toggle"]' ).toggle();

    // dropdown multilevel (e.g. main navigation lists)
    Utils.$functionElems.filter( '[data-fn="dropdown-multilevel"]' ).dropdownMultilevel();

    // remote event (e.g. main navigation backdrop)
    Utils.$functionElems.filter( '[data-fn="remote-event"]' ).remoteEvent();

    // animated anchors
    $('a[href^="#"]:not([href="#"])').animatedAnchors( {
        offset: function() {
            return Utils.anchorOffsetTop;
        }
    } );

    // to top button wrapper
    Utils.$functionElems.filter( '[data-fn="to-top-wrapper"]' ).toggleToTopButton();

    // dib election tool
    Utils.$functionElems.filter( '[data-fn="dib-election-tool"]' ).dibElection();

} )( jQuery, MY_UTILS );


//# sourceMappingURL=scripts.js.map
