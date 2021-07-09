/*

Diese Datei erstellt einen Quader
(2 breit, 5 tief, 3 hoch).
Dazu werden fortgeschrittene Programmiertechniken
(Funktionen, Variablen) verwendent.

---------------------------------------------

Zuerst wird in einder Funktion beschrieben,
wie der Roboter eine Ebene mit einer bestimmten
Breite und Tiefe mit Boxen auslegt.

Dann wird mit einer Schleife die Funktion
so oft aufgerufen, um die bestimmte Höhe
zu erreichen.

*/

/*
Funktion "umdrehen": dreht den Charakter um 180° um.
*/
funktion umdrehen():
	linksdrehen()
	linksdrehen()
*funktion

/*
Funktion "rechteck": Legt ein Rechteck mit einer
bestimmten Breite und Tiefe.
*/
funktion rechteck(breite, tiefe):
	schritt()
	
	// Die Funktion "umdrehen" kann hier verwendet werden
	umdrehen()
	
	hinlegen()
	schritt()
	umdrehen()
	var b = 1
	wiederhole breite:
		// Legt eine Reihe
		wiederhole tiefe - 1:
			hinlegen()
			schritt()
		*wiederhole
		
		umdrehen()
		
		// Geht auf der gelegten Reihe zurück
		wiederhole tiefe - 1:
			schritt()
		*wiederhole
		
		wenn breite != b:
			// Beginnt die nächste Reihe zu legen
			rechtsdrehen()
			hinlegen()
			schritt()
			rechtsdrehen()
		*wenn

		var b = b + 1
	*wiederhole
	
	// Wenn das Rechteck fertig gelegt ist,
	// geht der Roboter wieder zur
	// Ausgangsposition zurück
	linksdrehen()
	wiederhole breite - 1:
		schritt()
	*wiederhole
	linksdrehen()
*funktion

/*
Funktion "quader": Baut einen Quader mit
der Funktion "rechteck" und einer bestimmten Höhe.
*/
funktion quader(breite, tiefe, höhe):
	wiederhole höhe:
		rechteck(breite, tiefe)
	*wiederhole
*funktion

// Funktion "quader" wird aufgerufen
quader(2, 5, 3)