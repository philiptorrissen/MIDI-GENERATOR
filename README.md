# Loopgenerator 

Ved å velge tilfeldige noter fra en skala og sette dem sammen til en loop, vil man kunne lage ganske kule loops. Musikkteori sier at toner fra samme skalaer høres bra ut sammen. 

Jeg har laget en liten webapplikasjon som velger tilfeldige noter fra 5 skalaer og setter dem sammen til loops. Disse kan brukeren høre på og laste ned i en MIDI-fil hvis han er fornøyd. MIDI er et filformat for å lagre noter i. Det brukes av datamaskiner og synther. 

Brukeren kan velge hvilke skala og hvilke instrumenter som skal brukes. I tillegg kan brukeren velge lengde på notene. 

For å starte serveren gjør du følgende: 
```
npm install 
node loopmaster-server.js
```

Serveren starter da på port 3000, og du kan nå den på http://localhost:3000

## Biblioteker
Jeg bruker følgende bibloteker og verktøy
- Node.js: Node er et verktøy for å kjøre javascript på server 
- materialize.js: Er et CSS bibliotek for å få ting til å se bra ut uten å måtte skrive CSS selv 
- Express.js: Er et verktøy som fungerer bra sammen med Node.js for å lage API-er og webapplikasjoner. 
- jsmidgen: Er et bibliotek for å lage og lese MIDI-filer 
- Bodyparser: Et bibliotek for å enket hente ut parametere fra requesten. Det er en del av Express.js
- Path: Et bibliotek for å kunne lage og lese filer og directories 
- Fs: Et bibliotek for å jobbe med filer. 
- midi-player: En HTML/javascript komponent som lar deg spille MIDI-filer i nettleser 

## Beskrivelse av hvordan applikasjonen fungerer 
Løsningen består av to deler: 
- En index.html fil som inneholder et form som lar brukeren gjøre valg som påvirker hvordan loopen bli
- loopmaster-server.js er serveren som tar i mot posten fra formet, og genererer MIDI-fil. I tillegg viser den en webside med preview av fila, lenke til MIDI-fila, og en knapp som lar deg lage en ny loop. 

## Viktige deler av løsningen 

HTML-en er selvforklarende, men jeg har lagt inn noen kommentarer. Under beskriver jeg viktige funksjoner i JavaScript-koden.


Denne funksjonen gir deg et tilfeldig tall mellom 0 og max. Math.random() gir deg et tall mellom 0 og 1. Nå vi ganger det med makstallet brukeren sender inn og runder ned vil vi få et tall tilfeldig tall mellom 0 og max.
```javascript
function getRandomInt(max) {
  var rand = Math.floor(Math.random() * max);
  return rand
}
```

Denne funksjonen tar inn en array og et tall. Den returnerer en array som er den opprinnelige arrayen kopiert like mange ganger som tallet som sendes inn som parameter. 
```javascript
function extendArray(arr, times) {
    let extendedArray = arr.slice();
    for (let i = 0; i < times; i++) {
        extendedArray = extendedArray.concat(arr);
    }    
    return extendedArray;
}
```

Denne funksjonen tar inn en skala og returnerer en array med 6 tilfeldige noter fra skalaen. Den bruker getRandomInt funksjonen for å velge tilfeldige noter fra skalaen.  
```javascript
function generateRandomNotes(scale){
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
}
```
Denne funksjonen lager MIDI-fila. Den tar inn filnavn, lengde på notene, skala og instrument. Den bruker jsmidgen biblioteket for å lage MIDI-fila.
```javascript
unction genFile(filename, duration, scale, instrument){

    let file = new Midi.File();
    let track = new Midi.Track();
    file.addTrack(track);
    
    let instrumentMidiNumber = instruments[instrument];

    let notes = generateRandomNotes(scale);
    var bars = extendArray(notes, 4)

    track.setInstrument(0, instrumentMidiNumber)
    for (let i = 0; i < bars.length; i++) {
        track.addNote(0, bars[i], duration); 
    }
    fs.writeFileSync('pub/'+filename + '.mid', file.toBytes(), 'binary');
}
```
I tillegg er det standard express-funksjoner som lar brukeren hente index.html og tar imot post fra formet og genererer en HTML-side brukeren kan laste MIDI-fila fra. 
```javascript
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html/index.html'));
});

app.post('/files', (req, res) => {

    const { duration, scale, instrument } = req.body;
    var filename = crypto.randomUUID();
    genFile(filename, duration, scale, instrument);

    res.send(`
        <!DOCTYPE html>
        <!-- Se kildekoden for denne filen -->
         `);
});


```