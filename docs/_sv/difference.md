---
title: "Differens"
parent: "Värmelägen"
nav_order: 5
lang: "sv"
source: "difference.md"
source_hash: "12fc27dc0616"
translated: true
outdated: true
---

# Differens

Rött där lag A var mer, grönblått där lag B var det, inget där de var lika.

**Differens** (tangent 2) är signerad värme. Rader ur en population adderar värme; rader ur en annan subtraherar den. Där de två överlappar jämnt blir resultatet noll och helt genomskinligt; där den ena dominerar syns den i den sidans färger – som standard varma (genomskinlig → röd → gul → vit) för **+**-sidan och kalla (genomskinlig → grön → blå → lila) för **−**-sidan.

![Differensvärme: rött där +-sidan var mer, grönt och blått där −-sidan var mer](../assets/img/sv/difference-split.webp)

## Så använder du den {#how-to-use-it}

1. Tryck `2` (eller välj **Differens** i lägesraden).
2. Öppna **Differensuppdelning** i sidofältet.
3. Välj vad du vill **Dela upp efter**: oftast *Grupper*.
4. Lägg en grupp (eller ett värde) på **+** och en annan på **−**.
5. Läs färgerna: varmt betyder +-sidan, kallt betyder −-sidan. Panelen varnar om en sida saknar rader (se [Meddelanden du kan se](#messages-you-may-see)).

*Vilka* två populationer det gäller är hela frågan, så uppdelningen kan vara vilken behållen kolumn som helst, inte bara grupper. Rader som hamnar på **ingen** av sidorna **utelämnas**, de räknas inte som noll: det är det som gör att en uppdelning över två av många värden jämför exakt de två, och den fungerar ihop med [filtren](filters.md) – filtrera ner till en karta, dela sedan upp den efter version.

Läget behöver två sidor: en gruppkolumn med minst två grupper, eller en uppdelning över en kolumn som behållits för filtrering. På data med färre än två grupper startar en inläsning med en kolumnuppdelning – först kolumnen *Källfil* vid en inläsning av flera filer, annars den första kategorikolumnen med två värden, annars den första numeriska kolumnen med ett spann – så *jämför två inläsningar* fungerar även på data utan några grupper. Bara data utan något av detta gör läget otillgängligt; så gör också en kolumnuppdelning som lämnar en sida tom.

## Panelen Differensuppdelning {#the-difference-split-panel}

Visas i differensläget, under värmepanelerna.

**Dela upp efter** erbjuder:

| Alternativ | Visas som | Uppdelningsregel |
|---|---|---|
| Grupper | *Grupp (N)* (när det finns en gruppkolumn) | Varje grupp på +, − eller ingen, satt i [Lagslistan](teams-list.md) |
| En kategorikolumn | *kolumn (N värden)* | Värden på +, − eller ingen |
| En numerisk kolumn | *kolumn (numerisk)* | Ett värdeintervall för varje sida |
| Filen den kommer från | *Källfil – jämför två inläsningar* (när flera filer lästes in) | Filer på +, − eller ingen |

Bara kolumner som behållits under *Behåll för filtrering* vid inläsningen erbjuds.

### Jämför andelar, inte antal {#compare-shares-not-counts}

**Jämför andelar, inte antal** (av som standard) viktar varje sida med ett delat med dess egna antal rader, så att en sida med fem gånger så många rader inte vinner bara på siffrorna. Färgen visar då var varje sida är proportionellt vanligare än den andra. Använd det när de två sidorna har mycket olika mängder data, till exempel två sessioner av olika längd.

### Meddelanden du kan se {#messages-you-may-see}

Panelen varnar när bilden inte är en verklig differens:

| Meddelande | Betydelse |
|---|---|
| *N + / M −* (eller *N + / M − / K oanvända*) | Hur många värden som ligger på varje sida (och på ingen). |
| Ingen rad i fönstret ligger på **+**-sidan | Bara **−**-sidan ritas. Flytta tidslinjens fönster eller ändra uppdelningen. |
| Ingen rad i fönstret ligger på **−**-sidan | Bara **+**-sidan ritas. |
| Inget värde ligger på någon sida | Differensen ritar ingenting. Lägg minst ett värde på **+** eller **−**. |
| *kolumn* kan inte delas upp på det här sättet | Den valda kolumnen passar inte uppdelningen. Välj kolumnen igen. |
| Uppdelningskolumnen fick inte plats i GPU-minnet för N av M block | De raderna ritas inte. Höj GPU-budgeten under Prestanda → Resursbudgetar, eller läs in färre rader. |

### Efter grupp {#by-group}

Panelen pekar bara på [Lagslistan](teams-list.md), där varje grupp har en knapp **+** och en **−**. Vid varje inläsning läggs den första halvan av grupperna (avrundat uppåt) på +, resten på −; **Dela jämnt** i Lagslistan gör detsamma igen. En grupp som inte är på någon sida, eller döljs med sin kryssruta, bidrar med ingenting.

### Efter kategorivärden {#by-category-values}

| Del | Betydelse |
|---|---|
| `a + / b − / c oanvända` | Hur många värden som ligger på varje sida och på ingen. |
| **Rensa** | Lägger varje värde på ingen sida. |
| Värdelista | Varje värde med en knapp **+** och en **−** (klicka på den aktiva igen för att ta bort den från sidan). Ett tomt värde visas som *(saknas)*. |
| Notering om antal | Bara de första 200 värdena listas: *Visar de första 200 av N värden. En så bred kolumn smalnas hellre av med ett filter först, eller delas upp efter intervall om värdena är ordnade.* |

När du väljer kolumnen läggs dess första värde på + och dess andra på −. När ingen av sidorna har något värde faller uppdelningen tillbaka på grupper i stället för att visa en tom bild. *Källfil* fungerar på samma sätt, ett värde per fil – så jämför man två exporter, två testkörningar eller två versioner.

### Efter intervall {#by-range}

| Del | Betydelse |
|---|---|
| Ledtråd | Kolumnens minsta och största värde. |
| **Positivt intervall (+)**, **från** / **till** | Rader med ett värde i detta intervall, inklusive i båda ändar, adderar. |
| **Negativt intervall (−)**, **från** / **till** | Rader i detta intervall subtraherar. |
| **Dela vid mittpunkten** | Sätter + till [minimum, mitten] och − till [mitten, maximum] – det som också händer när du väljer kolumnen. |

Ett värde i båda intervallen räknas som +. Intervallen behöver inte täcka kolumnen; värden i inget av dem utelämnas. *De två första minuterna mot de två sista* är en intervalluppdelning på en tidsliknande kolumn.

## Färger {#colours}

Avsnittet **Värmefärger** visar två skaleditorer i det här läget: **Positiv (additiva lag)** och **Negativ (subtraherande lag)**, var och en med sin egen återställningsknapp (*Återställ till genomskinlig → röd → gul → vit*, *Återställ till genomskinlig → grön → blå → lila*). Den sammansatta bilden tar absolutbeloppet av nettovärmen genom [mättnadspunkten och svaret](colour-and-exposure.md), och väljer den negativa skalan där nettot är under noll. Se [Färg och exponering](colour-and-exposure.md#the-ramp-editor).

Använd svaret *Linjär* densitet när storleken på skillnaden spelar roll: det är det enda svar där lika färg betyder lika antal.

## För utvecklare {#for-developers}

Varje rad får ett tecken på +1, −1 eller 0 i hörnshadern ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); en 0 avvisar raden innan något fragment ritas.

- Efter grupp kommer tecknet från en gruppatabell med 4 096 poster, indexerad med radens grupp-id (grupp-id:t ligger i den fjärde kanalen i radens positionstexel).
- Efter kategori kommer tecknet från en andra tabell med 4 096 poster, fylld per kategorivärde, och radens värde läses från kolumnens filtertextur; ett värde efter tabellens slut avvisas på båda bakändarna.
- Efter intervall jämförs radens värde med de två intervallen.

Att ändra uppdelningen startar om ackumuleringen.

**Dolda grupper förblir dolda vid varje uppdelning.** Under en uppdelning efter en kolumn bär gruppabellen inte längre tecken; den håller 1 för en synlig grupp och 0 för en dold ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), och båda tabellerna når shadern tillsammans – två rader i en teckentextur på WebGL2, två halvor av en lagringsbuffert på WebGPU. En rad ritas bara när dess grupp är synlig *och* dess kolumnvärde ligger på en sida. Så en grupp som avmarkerats i [Lagslistan](teams-list.md), eller utelämnats av Match-fliken:s sidfokus, bidrar med ingenting oavsett hur differensen delas upp.
