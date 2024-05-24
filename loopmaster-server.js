const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto');
var fs = require('fs');
var Midi = require('jsmidgen');

// Sett opp express 
const app = express();
const port = 3000;

// Skalaer vi skal bruke til å generere loops
const C_dur = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
const C_dur_pent = ['C4', 'D4', 'E4', 'G4', 'A4'];
const G_dur = ['G4', 'A4', 'Bb4', 'C4', 'D4', 'Eb4', 'F4', 'G5'];
const A_mol = ['A4', 'H4', 'C4', 'D4', 'E4', 'F4', 'G4'];
const A_mol_pent = ['A4', 'C4', 'D4', 'E4', 'G4'];

let instruments =  {}

// fra https://fmslogo.sourceforge.io/manual/midi-instrument.html
instruments["bass"] = 39;
instruments["piano"] = 1;
instruments["steel_drum"] = 114;

// sett opp område for HTML og der hvor filene skal lages
app.use(express.static(path.join(__dirname, 'html')));
app.use('/pub', express.static(path.join(__dirname, '/pub')))

// bodyparser for å hente ut parametere
app.use(bodyParser.urlencoded({ extended: true }));

// random function
function getRandomInt(max) {
  var rand = Math.floor(Math.random() * max);
  return rand
}

// funksjon for å kopiere array 
function extendArray(arr, times) {
    let extendedArray = arr.slice();
    for (let i = 0; i < times; i++) {
        extendedArray = extendedArray.concat(arr);
    }    
    return extendedArray;
}

// generate a file containing random notes 
function genFile(filename, duration, scale, instrument){

    let file = new Midi.File();
    let track = new Midi.Track();
    file.addTrack(track);


    let instrumentMidiNumber = instruments[instrument];

    console.log(instrumentMidiNumber);

    var notes = []; 
    for (let i = 0; i < 6; i++) {
        if (scale === 'C_dur'){
           notes[i] = C_dur[getRandomInt(C_dur.length)]
        } else if(scale === 'C_dur_pent'){
            notes[i] = C_dur_pent[getRandomInt(C_dur_pent.length)]
        }else if (scale === 'G_dur') {
            notes[i] = G_dur[getRandomInt(G_dur.length)]
        } else if (scale === 'A_mol'){
            notes[i] = A_mol[getRandomInt(A_mol.length)]
        } else {
            notes[i] = A_mol_pent[getRandomInt(A_mol_pent.length)] 
        }
    }

    
    var bars = extendArray(notes, 4)

    track.setInstrument(0, instrumentMidiNumber)
    for (let i = 0; i < bars.length; i++) {
        track.addNote(0, bars[i], duration); 
    }


    fs.writeFileSync('pub/'+filename + '.mid', file.toBytes(), 'binary');
}

// Vis førsteside
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html/index.html'));
});


// Lag fil basert på valg
app.post('/files', (req, res) => {

    const { duration, scale, instrument } = req.body;
    var filename = crypto.randomUUID(); 
    genFile(filename, duration, scale, instrument);

    res.send(`
        <!DOCTYPE html>
        <html lang="no" translate="no">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Last ned fila</title>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container">
                <h1 class="center-align">Loop er generert!</h1>
                <a class="waves-effect blue-grey btn-large" href="pub/` +filename+ `.mid">Last ned fila</a>
                <a class="waves-effect blue-grey btn-large" href="http://localhost:3000">Generer ny fil</a> 
              
                <script src="https://cdn.jsdelivr.net/combine/npm/tone@14.7.58,npm/@magenta/music@1.23.1/es6/core.js,npm/focus-visible@5,npm/html-midi-player@1.5.0"></script> 

                <div class="card blue-grey darken-1">
                    <div class="card-content white-text">
                        <span class="card-title">Hør på loopen her før du laster ned</span>
                            <midi-player src="http://localhost:3000/pub/`+filename+`.mid" sound-font 
                            visualizer="#myVisualizer"> </midi-player>
                            <midi-visualizer type="piano-roll" id="myVisualizer"></midi-visualizer>
                    </div>
               </div>
                
        </body>
    </html>
    `);
});

// Start serveren
app.listen(port, () => {
    console.log(`Kjører loop-server på http://localhost:${port}`);
});