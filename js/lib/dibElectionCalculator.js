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

        	var explanation = [];
            var currentExplanationItem;

            function startExplanationItem (headline) {
            	currentExplanationItem = {
            			headline: headline,
            			content: []
            	}
            	explanation.push (currentExplanationItem);
            }
            
            // describe a given candidate by name and group membership
            function candidateDescription (candidate) {
                var result = candidate.name;
                if (candidate.female)
                    result += " (f)";
                if (candidate.diverse)
                    result += " (v)";
                return result;
            }
            
            function addCandidateList (headline,allSelected = false) {
            	var contentEntry = {
            			headline: headline,
            			type: "list",
            			items: []
            	};
            	
            	for (var candidate of candidates)
            		contentEntry.items.push ({
            			item: candidateDescription (candidate.candidate),
            			selected: candidate.selected | allSelected
            		});

            	currentExplanationItem.content.push (contentEntry);
            }
            
            function addStatement (statement,headline = "") {
            	currentExplanationItem.content.push ({
            		headline: headline,
            		type: "text",
            		items: [{item: statement}]
            	});
            }
             
            function error (message) {
                return {error: {text: message}};
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
            
            candidates.sort ((a,b) => lexicalOrderArrayComparison (a.priority,b.priority));

            // remove temporary entries used only for sorting
            for (var candidate of candidates)
                delete candidate.priority;

            log ("successful candidates: " + stringify (candidates));
            
            startExplanationItem ("Erfolgreiche Kandidierende");
            addCandidateList ("Die erforderliche Mehrheit nach §10 haben erreicht, in Reihenfolge nach §11:",true);

            // initially, the top candidates are selected, §6 (4)
            for (var i = 0;i < structure.count && i < candidates.length;i++)
                candidates [i].selected = true;

            // not more successful candidates than offices -- they're all elected 
            if (candidates.length <= structure.count) {
                // TODO: announce (non)fulfilment of diversity quota
                log ((candidates.length == structure.count ? "as many successful candidates as" : "fewer successful candidates than") + " offices -- all successful candidates have been elected");
                addStatement ("Es gibt " + (candidates.length == structure.count ? "ebenso viele erfolgreiche Kandidierende wie" : "weniger erfolgreiche Kandidierende als") + " zu vergebende Ämter; daher sind alle erfolgreichen Kandidierenden gewählt.");
            }
            // more successful candidates than offices -- try to fulfill the quotas
            else {
                var reverseCandidates = candidates.slice ().reverse ();

                // determine the quotas (§6 (2))

                startExplanationItem ("Zu reservierende Ämter");

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

                function addQuotaStatement (prefix,singular,plural) {
                	var quotaStatement = prefix;
                	quotaStatement += ' ';
                	quotaStatement += (quotas.female + quotas.diverse == 1) ? singular : plural;
                	if (quotas.female)
                		quotaStatement += ' ' + quotas.female + ' ' + (quotas.female > 1 ? "Ämter" : "Amt") + " für Frauen";
                	if (quotas.female && quotas.diverse)
                		quotaStatement += " und";
                	if (quotas.diverse)
                		quotaStatement += ' ' + quotas.diverse + ' ' + (quotas.diverse > 1 ? "Ämter" : "Amt") + " für Vielfalt";
                	if (!(quotas.female || quotas.diverse))
                		quotaStatement += " keine Ämter";
            		quotaStatement += " zu reservieren.";
            		addStatement (quotaStatement);
                }
                
             // if the quotas refer to a body overall, reduce them according to the previously elected candidates
                if (structure.overall) {
                	addQuotaStatement ("Im Gremium insgesamt","ist","sind");
                    for (var group of ["female","diverse"])
                        for (var previousCandidate of input.previous)
                            if (previousCandidate.candidate [group] && quotas [group])
                            	quotas [group]--;
                    log ("remaining quotas in overall election: " + stringify (quotas));
                	addQuotaStatement ("Davon","verbleibt","verbleiben");
                }
                else
                	addQuotaStatement ("Es","ist","sind");

                // limit the quotas to the number of offices being elected
                for (var group in quotas)
                    if (quotas [group] > count) {
                        log ("more reservations for " + group + " candidates than offices");
                        // TODO Erklärung hinzufügen
                        quotas [group] = count;
                    }

                // number of selected candidates of a given group
                function countGroup (group) {
                    return candidates.filter (candidate => candidate.selected && candidate.candidate [group]).length;
                };
                
                // is the quota fulfilled for a given group?
                function isRepresented (group) {
                    return countGroup (group) >= quotas [group];
                };

                function printSeparator () {
                    log ("------------------------------------------------------------------");
                }
    
                function printCandidates () {
                    for (var candidate of candidates)
                        log ((candidate.selected ? "** " : "   ") + candidateDescription (candidate.candidate));
                    printSeparator ();
                }
                
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
                function replace (replacing,replaced,quota = null) {
                    log ("replacing " + replaced.candidate.name + " by " + replacing.candidate.name);
                    if (quota)
                    	addStatement ("Zur Erfüllung der " + quota + "quote wird " + replaced.candidate.name + " in der Auswahl durch " + replacing.candidate.name + " ersetzt:");
    
                    replacing.selected = true;
                    replaced.selected = false;
                    addCandidateList ("");
                }

                startExplanationItem ("Anwendung der Quotierungsregeln");
                addCandidateList ("Ursprüngliche Auswahl vor Anwendung der Quotierungsregeln");
                
                log ("initial selection:");
                
                printCandidates ();
                
                // fulfil the diversity quota (§6 (5))
                if (quotas.diverse) {
                	addStatement ("Erfüllung der Vielfaltsquote:");
                    log ("ensuring diversity quota");
                    printSeparator ();

                    while (!isRepresented ("diverse")) {
                        var replacing = findFirstNonSelectedMember ("diverse");
                        if (!replacing) {
                        	addStatement ("Es gibt nicht genügend erfolgreiche Kandidierende mit Vielfalt, um die Vielfaltsquote zu erfüllen.");
                            log ("not enough successful candidates to fulfil diversity quota");
                            break;
                        }
        
                        var replaced = findLastSelectedNonMember ("diverse");
                        if (!replaced)
                            return error ("more reservations for diversity than offices");

                        replace (replacing,replaced,"Vielfalts");
                        printCandidates ();
                    }

                    var diversityQuotaFulfilled = isRepresented ("diverse");
                    log (diversityQuotaFulfilled ? "diversity quota fulfilled" : "diversity quota not fulfilled");
                    addStatement ("Die Vielfaltsquote ist " + (diversityQuotaFulfilled ? "" : "nicht ") + "erfüllt.");
                    printCandidates ();
        
                    // if the diversity quota can't be fulfilled, adjust it to the number of successful diverse candidates  
                    if (!diversityQuotaFulfilled)
                        quotas.diverse = countGroup ("diverse");
                }
                else
                    log ("no diversity quota applies");

                // fulfil the women's quota (§6 (6))
    
                if (quotas.female) {
                	addStatement ("Erfüllung der Frauenquote:");
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

                        replace (replacing,replaced,"Frauen");

                        // now check if the replacement violated the diversity quota 
                        if (!isRepresented ("diverse")) {
                            log ("replacement violated diversity quota -- undoing");
                            addStatement ("Die Ersetzung würde die Vielfaltsquote verletzen und wird deshalb rückgängig gemacht:");
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
                                else {
                                	addStatement ("Es kann keine Ersetzung zur Erfüllung der Frauenquote vorgenommen werden, ohne die Vielfaltsquote zu verletzen.")
                                    log ("cannot make a replacement without violating diversity quota -- women's quota can't be fulfilled");
                                	break;
                                }
                            }

                            replace (replacing,replaced,"Frauen");
                        }           

                        printCandidates ();
                    }
                    var womensQuotaFulfilled = isRepresented ("female");
                    log (womensQuotaFulfilled ? "women's quota fulfilled" : "women's quota not fulfilled");
                    addStatement ("Die Frauenquote ist " + (womensQuotaFulfilled ? "" : "nicht ") + "erfüllt.");
                    printSeparator ();
                }
                else
                    log ("no women's quota applies");
                
                addCandidateList ("Ergebnis nach Anwendung der Quotierungsregeln:");
            }
            
            log ("Final selection:");
            
            for (var selectedCandidate of candidates.filter (candidate => candidate.selected))
                log (selectedCandidate.candidate.name);

            var output = {};

            output.explanation = explanation; 
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
