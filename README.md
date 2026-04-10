🍸 Cocktailpedia
Cocktailpedia ist ein kollaboratives Wiki für Cocktails, das im Rahmen eines Uni‑Projekts entwickelt wird.
Ziel ist es, eine übersichtliche, benutzerfreundliche Plattform zu schaffen, auf der klassische und moderne Cocktails strukturiert dargestellt werden.


📌 Projektidee
Cocktailpedia funktioniert ähnlich wie eine Wikipedia, jedoch speziell für Cocktails.
Nutzer:innen sollen Cocktails durchsuchen, nach Kategorien filtern und detaillierte Informationen zu Zutaten, Zubereitung und Herkunft erhalten.
Das Projekt legt den Fokus auf:

-klare Datenstrukturen
-sauberen Frontend‑Code
-gute Usability
-einfache Erweiterbarkeit


👥 Projektteam

Flo
Tim

Studienprojekt an der DHBW Lörrach


🛠️ Technologien
Das Projekt wird bewusst mit einfachen, gut erklärbaren Web‑Technologien umgesetzt:

HTML5 – Struktur der Website
CSS / Bootstrap 5 – Layout & responsives Design
JavaScript (Vanilla) – Dynamische Inhalte (z. B. Suche, Filter)
JSON – Speicherung der Cocktail‑Daten


📁 Projektstruktur (geplant)
/
│── index.html          # Startseite
│── cocktails.html      # Übersicht aller Cocktails
│── cocktail.html       # Detailseite eines Cocktails
│── kategorien.html     # Kategorien / Filter
│── about.html          # Projektbeschreibung
│
│── data/
│   └── cocktails.json  # Cocktail-Daten
│
│── css/
│   └── styles.css
│
│── js/
│   └── app.js


🍹 Cocktail-Datenmodell (Beispiel)
Cocktails werden in einer JSON-Datei gespeichert:
{
  "id": 1,
  "name": "Mojito",
  "alcohol": "Rum",
  "ingredients": [
    "4 cl weißer Rum",
    "Minze",
    "Limette",
    "Zucker",
    "Sodawasser"
  ],
  "glass": "Highball",
  "categories": ["Klassiker", "Sommer"],
  "description": "Ein klassischer Cocktail aus Kuba."
}


✅ Geplante Funktionen

-Übersicht aller Cocktails
-Detailseiten mit vollständigen Informationen
-Kategorien (z. B. alkoholisch, alkoholfrei, Klassiker)
-Suchfunktion nach Cocktail‑Namen
-Responsives Design (Desktop & Mobile)


🎓 Lernziele des Projekts

-Anwendung von HTML, CSS und JavaScript in einem realistischen Szenario
-Trennung von Daten (JSON) und Darstellung (HTML)
-Strukturierung eines Webprojekts
-Nutzerfreundliches Design
-Arbeiten im Team an einem gemeinsamen Code‑Projekt


🚀 Zukunftsideen

-Favoritenfunktion
-Bewertungssystem
-Cocktail‑Varianten
-Dark Mode
-Benutzer können Cocktails vorschlagen


📄 Lizenz
Dieses Projekt wurde ausschließlich für Lehr‑ und Lernzwecke erstellt.
