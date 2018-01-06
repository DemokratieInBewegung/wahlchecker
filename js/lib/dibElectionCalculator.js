var DIB_ELECTION_CALCULATOR = ( function( $ ) {

    var DibElectionCalculator = {

        getResult: function( input ) {

            var output;

            // TODO: do magic here



            // TEST – TODO: delete
            output = ( typeof input.current === 'string' ) ?     [
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
            ] : [
                {
                    "candidate": {
                        "name": "Lina Limone",
                        "female": true,
                        "diverse": false
                    }
                }
            ];
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
