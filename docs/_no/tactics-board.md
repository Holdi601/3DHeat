---
title: "Taktikktavle"
nav_order: 15
has_children: true
lang: "no"
source: "tactics-board.md"
source_hash: "09172046f5ac"
translated: true
outdated: false
---

# Taktikktavlen

Fanen **Taktikk** er en tegnetavle for en lagplan: du legger små figurer på et kart, tegner piler for hvor de skal, og trykker avspilling for å se det skje. Bruk den til å planlegge en runde eller et angrep før du spiller. Den deler lerret, kamera og [banen](levels.md) med de andre fanene og ingenting annet; en plan er ikke data og tegner ingen varme.

## Din første plan {#your-first-plan}

1. Åpne fanen **Taktikk**. Velg **Spill** (for eksempel Counter-Strike 2) og, for Valorant, trykk **Last inn Valorant-kart** og velg et **Kart**. Eller last inn en [bane](levels.md) først.
2. Velg en **Side** (den setter fargen) og trykk **Ovenfra**.
3. Velg **Plasser**, velg en figur i **Figurer** (bruk **Søk i figurer** for å finne en) og klikk på kartet. Plasser to eller tre.
4. Velg **Pil**, klikk på en figur, klikk langs veien den skal gå, og trykk **Enter** for å avslutte pilen.
5. Trykk **+** under visningen for å legge til steg 2. Hver figur starter der pilen endte. Tegn flere piler der.
6. Trykk **▶** (eller `K`) for å spille planen fra vist steg til slutten.
7. Gi planen et navn i **Navn på planen** og trykk **Lagre**.

![Taktikkfanen i ovenfra-visning: spill, sider og verktøy til venstre, tre figurer med Flytt-piler, en røykbue for Kast, et Område og stegene langs bunnen](../assets/img/en/tactics.webp)

## Starte en plan {#starting-a-plan}

| Kontroll | Hva den gjør |
|---|---|
| **Spill** | Velger sidene og figurene paletten tilbyr: Counter-Strike 2 (T, CT; spillere og utstyr), Valorant (Angrep, Forsvar; spillere og generiske evner), Battlefield, Squad, Arma (infanteri, kjøretøy på bakken, fly, båter), DCS / War Thunder / IL-2 (jetfly, propellfly, helikoptre, luftvern, bakke, skip, våpen), og Annet. En plan som allerede har figurer beholder sine sider når spillet endres. |
| **Navn på planen** | Navnet planen lagres under. |
| **Kart**, **Last inn Valorant-kart** | Med Valorant valgt: **Last inn Valorant-kart** henter listen over kart fra [valorant-api.com](https://valorant-api.com); **Kart** legger så det valgte kartets minikart ned som bane, rammet ovenfra. Bildet hentes når det velges og sendes aldri med. Riots merknad vises mens den er på skjermen (se nedenfor). |
| **Side** | Siden den neste figuren, pilen eller området tilhører; den tar sidens farge. |

Uten en bane er tavlen det flate bakkeplanet. Last inn en bane under **Bakgrunn / nivå** for å planlegge på et ekte kart: et CS2-kart eksportert med CS2-verktøyet, en bane fra biblioteket, eller et kartbilde.

## Verktøy {#tools}

| Verktøy | Klikk | Merknader |
|---|---|---|
| **Velg** | En figur, et veipunkt, en pil, et område eller et notat velges. | Shift+klikk legger til eller fjerner; Shift+dra tegner en boks rundt det som skal legges til. Utvalget får et transformasjonshåndtak (se nedenfor); `Delete` eller `Backspace` fjerner det. `M` flytter den valgte figuren til neste klikk. |
| **Plasser** | Setter ned den valgte figuren. | En figur velges i paletten **Figurer** (med **Søk i figurer**). Uten noe valgt snur `R` den neste figuren 15° før den plasseres (`Shift+R` den andre veien). |
| **Pil** | Hvert klikk legger til et punkt; Enter, dobbeltklikk eller høyreklikk avslutter, Esc kaster den. | **Forflytt**, **Angrep** (bredere spiss) eller **Overvåk** (en tynn linje i øyehøyde). En pil som begynner på en figur er den figurens rute i dette steget: spilles den av, går figuren den, og neste steg starter der den endte. |
| **Kast** | Kasteren, og deretter hvor det lander. | En stiplet bue fra den ene til den andre, og det valgte utstyret (røyk, blink, molotov, ...) dukker opp der det lander og blir værende fra dette steget og videre. |
| **Område** | Midten, og deretter kanten. | En skive i sidens farge. |
| **Notat** | Hvor notatet skal, deretter spørsmål om teksten. | Vises som en nål, og teksten over den. |
| **Slett** | En figur, pil, et område eller et notat. | Fjerner det fra dette steget og videre; på sitt første steg fjerner det det helt. |

**Angre** og **Gjør om** (`Ctrl+Z`; `Ctrl+Y` eller `Ctrl+Shift+Z`) går gjennom hver endring. En linje under planen viser hvor mange figurer, piler og steg den har. **Ovenfra** ser rett ned (ortografisk), **3D-visning** går tilbake til perspektiv, **Ramme inn** tilpasser planen, eller banen når planen er tom.

**Figurstørrelse** skalerer alle figurer på tavlen; 1× er reell størrelse, som ovenfra er noen få piksler for en person.

## Flytte, snu og skalere {#moving-turning-and-scaling}

Alt på tavlen kan flyttes som i en 3D-editor: figurer, utstyr, markører, enkeltveipunkter og hele piler, områder og notater. Det som er valgt får et håndtak i midten:

| Modus | Taster | Håndtak |
|---|---|---|
| **Flytt** | W (eller G) | En pil per akse (X rød, Y grønn og opp, Z blå) flytter langs den; en firkant flytter over planet sitt; midten flytter over banen under pekeren. |
| **Roter** | E (eller R) | En ring per akse dreier rundt den. En enkelt figurs ringer er dens egen gir, stigning og rulling; en gruppe dreier om verdens akser rundt midten. |
| **Skaler** | R (eller S) | Sprer eller samler utvalget fra midten langs en akse eller alle veier; et områdes radius vokser med det. |

**Taster** bytter mellom W / E / R (Unity, Unreal) og G / R / S (Blender); tastene velger modus bare når noe er valgt, og flyr kameraet ellers. Så `R` betyr **Skaler** med W / E / R-tastene og **Roter** med G / R / S-tastene når noe er valgt, og snur den neste figuren som skal plasseres når ingenting er det. Alle tavletastene står i [tastaturreferansen](keyboard-reference.md#tactics-board). Hold **Ctrl** mens du drar for å feste en flytting til **Rutenett** (meter) eller en dreining til **Vinkelsteg**. **Fest til bakken** (på som standard) setter flyttede personer, kjøretøy, markører, veipunkter og områder på banens overflate; fly og helikoptre beholder høyden sin, og et drag langs Y-pilen festes aldri. Å dra et håndtak flytter aldri kameraet. **Esc** avbryter et drag, og hver endring er ett steg i Angre.

Veipunkter vises som prikker på det viste stegets piler: klikk for å velge, dra for å flytte, Delete for å fjerne. Seksjonen **Valgt** viser utvalgets plass i meter, en figurs gir, stigning og rulling i grader og et områdes radius, hver for seg å skrive inn.

## Timing {#timing}

En figurs rute er tidsatt: hvert segment tar sin lengde over banen – samplet på overflaten hver par meter, så en høyde eller en trapp mellom to punkter teller – i farten til figurens bevegelsesmodus i det spillet, pluss eventuell **ventetid** ved et veipunkt. Infanteri krysser, bøyer seg, går (lydløst), løper eller sprinter; kjøretøy og båter kryper, kjører forsiktig, normalt eller stormer; fly og helikoptre flyr sakte, på krysning, i kampfart eller maksimalt. En modus spillet ikke har (CS2 har ikke sprint) tar den nærmeste det har. Hvordan en skråning bremser avhenger av spillet: i CS2 og Valorant teller bare horisontal avstand, som i spillene; militærsimulatorer bremser infanteri oppover (Toblers gåfunksjon) og kjøretøy etter stigning.

Fartene kommer fra tabeller per spill med sine kilder (se [Bevegelseshastigheter](tactics-speeds.md)): CS2 etter våpenet som holdes, fra spillets våpendefinisjoner; Valorant etter våpen; Battlefield, Squad, Arma og luftspillene etter kjøretøytype og klasse. **Beveger seg som** velger en figurs profil (et våpen, en kjøretøytype); **Egen (m/s)** overstyrer hvilken som helst modus for den figuren. Modusene har navn som tavlen viser dem: *Krype*, *Bøye seg*, *Gå (lydløst)*, *Løpe*, *Sprint*; *Forsiktig*, *Normal*, *Storm*; *Sakte*, *Krysning*, *Kamp*, *Maksimum*.

Hvert veipunkt viser tiden fra det forrige og tiden siden planens start («+3,9 s · 0:12»). Den valgte figurens rute lister hvert segment med modus, lengde og tid, ventetiden og ankomsten. **Ankomster** under **Timing** plasserer hver ruteplanlagt figur på én tidslinje, første ankomst øverst. Med **Spill i reell tid** (på som standard) varer et steg til den tregeste ruten ankommer, og hver figur beveger seg i sin egen fart; **Sekunder** er da stegets minste lengde. **Baneenheter per meter** sier hva banen er i: 39,37 for CS2-kart (spillenheter), 1 for kart i meter.

## Sammenlign med kampdata {#compare-with-match-data}

**Last inn kampfiler…** leser CS2-kampdata for kartet (CS2-verktøyets Parquet-filer, så mange som ønskelig; bare de nødvendige kolonnene, i bakgrunnen); **Bruk innlastede data** tar dataene som er lastet inn i visningen. Da:

- **Tidligste ankomst på kartet** farger kartet etter tiden siden rundestart da en spiller først nådde hvert sted – knappen **Raskest** viser den raskeste over alle runder, **Typisk (median)** den midterste runden – grønt tidlig til rødt sent, for én side eller begge. Den viser hva som er mulig, og når.
- Den valgte ruten sammenlignes med det spillerne oppnådde fra dens start (eller fra rundens start) til slutten, hver ende en skive med den satte radiusen: «Raskest observert 14,2 s, p10 15,0 s, median 18,3 s over 41 kjøringer; din plan 15,1 s».
- Farten spillerne faktisk beveget seg i – løping, gange, krybing, fra tabellenes kolonner for gange og bøying – i m/s.

## Steg {#steps}

Stolpen under visningen holder stegene. En plan starter med ett; **+** legger til ett, og hver figur starter der sin rute i siste steg endte; **−** fjerner det viste. **Sekunder** er hvor lang tid det viste steget tar når det spilles. **▶** (K) spiller fra det viste steget til slutten: figurer med en rute går den, figurer flyttet til et nytt sted i neste steg glir dit, resten står. Mens et steg vises, tegnes hver figurs plass i neste steg som et svakt spøkelse, og siste stegs piler svakt under dette stegets.

## Lagring {#saving}

Seksjonen **Fil** har **Lagre**, **Åpne** og **Tøm**. **Lagre** skriver planen som `<navn>.h3dplan.json` (ren JSON: sider, steg, figurer med en plass per steg, piler, områder, notater); **Åpne** leser en tilbake. En fil fra en annen versjon, eller en som ikke er en plan, avvises med grunnen. **Tøm** tømmer planen; Angre henter den tilbake.

## Figurer {#figures}

Hver figur er bygget av visningsprogrammet selv: enkle former i en type publisert størrelse, med de trekkene som skiller den fra naboene – en stridsvogns veihjul og tårn, kanonene, missilene og radarene til et luftvernkjøretøy, et flys vingeplan, hale og motorer, et helikopters rotorer og stumpvinger. Ingenting er hentet fra et spill. En design et spill har funnet på, vises som den generiske figuren for sin klasse. Se [Figurer](figures.md#which-figure-a-unit-gets) for hvordan data finner sin figur.

## Riots merknad {#riots-notice}

Valorant-kart vises under Riot Games' «Legal Jibber Jabber»-policy, som tillater gratis fellesskapsprosjekter å bruke dem og krever at denne merknaden vises der de brukes. Merknaden står på engelsk, ordrett, slik Riot krever den: *3DHeat was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.* Evnene på tavlen er generiske former, ikke Riots kunst.
