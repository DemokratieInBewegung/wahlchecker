var DIB_ELECTION_CALCULATOR = ( function( $ ) {

    var DibElectionCalculator = {

        getResult: function( input ) {

            var output;

            // TODO: do magic here
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


            // TEST – TODO: delete
            output = ( typeof input.current === 'string' ) ? {
                "candidates": [
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
                    }
                ],
                "explanation": [
                    {
                        "headline": "Erklärung",
                        "content": [
                            {
                                "headline": "Vielfaltsquote erfüllen",
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
                                "type": "list",
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
            : 
            {
                "candidates": [
                    {
                        "candidate": {
                            "name": "Lina Limone",
                            "female": true,
                            "diverse": false
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
                                "type": "list",
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
            };
            // /TEST

        

            if ( output ) {
                return output;
            }
            else {
                return false;
            }
        }

    };

    return DibElectionCalculator;

} )( jQuery );
