---
title: "Dybde og utsortering"
parent: "Varmemodi"
nav_order: 4
lang: "no"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---

# Dybde og avskjæring

Dybde gjør at åser og vegger skjuler varmen bak seg, slik en ekte vegg skjuler en person. Avskjæring etter avstand beholder bare varmen mellom en nær og en fjern avstand fra kameraet.

![Et lavt kamera bak en ås, med Skjul bak terrenget av (venstre) og på (høyre)](../assets/img/en/depth-and-culling-terrain.webp)

![Avskjæring etter avstand med Fjern på 400 m og Skjær også nivået på: en skive av kartet rundt kameraet](../assets/img/en/depth-and-culling-far.webp)

Uten dybde er et varmekart over et 3D-[nivå](levels.md) bare et flatt overlegg: alt datasettet inneholder lyser gjennom hver vegg med full styrke, de dybdesignalene nivået gir, blir opphevet, og et varmepunkt inne i en bygning ser likt ut som et på taket. Delen **Dybde** får nivået til å skjule det som er bak det; **Avskjæring etter avstand** begrenser varmen til et skall eller en plate rundt kameraet; [Skiven](slice.md) skjærer en plate ut av verden. Alle tre gjelder varmemodusene og endrer hvilke rader som bidrar, så når du endrer dem, starter akkumuleringen på nytt.

## Dybde {#depth}

Begge kontrollene krever et [nivå](levels.md) – et kartbilde eller en 3D-modell. Uten innlastet nivå er det ingenting som kan være bak noe, og de gjør ingenting. Begge er slått av mens [Flat ut på bakkeplanet](sprite-shape.md#flatten-onto-ground-plane) er på.

### Skjul bak terrenget {#hide-behind-terrain}

**Skjul bak terrenget** (standard på): et datapunkt der den nærmeste flaten mot kameraet er *bakken* (ikke en konstruksjon), blir fjernet helt, ikke bare dempet.

Terreng og vegger er ugjennomsiktige på ulike måter. Du ser *gjennom* en vegg med vilje, for å se hvilken etasje trafikken var på; du vil aldri se gjennom en ås, for bak den ligger den andre siden av kartet – som på et kart flere kilometer stort er det meste av dataene, og som summerer seg langs horisonten til et bånd lysere enn alt i forgrunnen. Én demping kan ikke tjene begge, så terrenget får en avskjæring og vegger beholder dempingen under.

### Skjult bak geometri {#hidden-behind-geometry}

**Skjult bak geometri** (standard 0,8): hvor sterkt et datapunkt bak nivågeometri blir undertrykt. Verdien betyr *viser gjennom* ved 0, *N % svakere* mellom, og *helt skjult* ved 1. (Det er skyveposisjonen, ikke den målte dempingen.)

Hver vegg eller gulv mellom et punkt og kameraet demper det ytterligere: én vegg etterlater noen få prosent ved standarden, og hver ekstra flate halverer det som er igjen, opptil fire flater. Ved 1 tegnes ingenting bak geometri, og det er den billigste innstillingen.

Se også [Nivåutseende](level-appearance.md).

## Avskjæring etter avstand {#distance-culling}

**Avskjæring etter avstand** (lukket som standard) begrenser varmen til rader mellom en nær og en fjern grense fra kameraet. Sett en fjern grense for å lese tettheten inne i en bygning uten at den fjerne siden av kartet summerer seg oppå den; sett en nær grense for å fly *gjennom* et varmepunkt i stedet for inn i det.

| Kontroll | Standard | Område (jog) | Betydning |
|---|---|---|---|
| **Nær** | av | 0,5–5000 m, logaritmisk; de nederste 5 % av sporet = av (200 000) | Rader som er nærmere enn dette, hoppes over. |
| **Fjern** | av | 1–200 000 m, logaritmisk; nederst = av (10 000 000) | Rader som er lenger unna enn dette, hoppes over. |
| **Kutt i et plan** | på | | Mål grensene langs synsaksen i stedet for fra øyet, slik at kuttet er et plan parallelt med skjermen i stedet for en kule rundt deg. Kanten på en kule buer bort over bildet og glir når du snur deg; et plan blir der du plasserte det. |
| **Skjær også nivået** | på | | Skjær bakken, konstruksjonene og vannet ved de samme grensene. Med nivået helt igjen fjerner kuttet datapunktene og lar bygningen stå foran dem; med begge kuttet er det et snitt gjennom kartet, og punktene står mot veggene og gulvene sine. Denne endrer bare tegningen; den starter ikke akkumuleringen på nytt. |

### Tastatur {#keyboard}

Den fjerne grensen er en kontroll du sveiper – gå den gjennom en bygning og se hvilken etasje trafikken dukker opp på – så den ligger på tastaturet mens du flyr ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Tast | Effekt |
|---|---|
| `]` | Skyv den fjerne grensen ut med en faktor 1,12 (Shift: 1,35) |
| `[` | Trekk den inn med samme faktor |
| `\` | Slå den fjerne grensen av, eller på igjen der den ble forlatt (6000 første gang) |

Trinnene er geometriske fordi det nyttige området spenner over fire størrelsesordener, fra et rom til et kart. Tastaturet holder den fjerne grensen mellom 100 og 400 000. Tastene gjør ingenting mens en tekstboks eller meny har fokus.

## For utviklere {#for-developers}

### Skjul bak terrenget {#hide-behind-terrain}

Konstruksjonene blir tegnet inn i en egen dybdetekstur. Et fragment som er bak scenens dybde, men *ikke* bak konstruksjonenes dybde, er bak bakken, og blir kastet. Det koster ett dybdepass over konstruksjonene, og det hoppes over når bryteren er av.

### Skjult bak geometri {#hidden-behind-geometry}

Det telles **per flate**. En enkelt dybdesammenligning kan bare si «noe står foran», så et punkt bak én vegg og et punkt fire rom inne i en bygning ville blitt dempet likt, og innsiden ville sett ut som én svak utsmøring. I stedet blir konstruksjonsgeometrien **dybdeskrellet** i opptil 3 lag til ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Hvert fragment teller hvor mange flater som står foran det (scenens egen dybde pluss de skrellede lagene: opptil fire), og dempingen blir sammensatt:

```
strength      = 1 - (1 - slider)²                  (slider 1 → 1)
visibility    = (1 - strength) × 0.5 ^ (surfaces - 1)
visibility    = max(visibility, 0.006)             (no floor at slider 1)
```

| Skyver | 1 flate | 2 | 3 | 4 |
|---|---|---|---|---|
| 0,5 | 25 % | 12,5 % | 6,25 % | 3,1 % |
| 0,8 (standard) | 4 % | 2 % | 1 % | 0,6 % (gulv) |
| 1,0 | tegnes ikke | tegnes ikke | tegnes ikke | tegnes ikke |

Hvorfor to faktorer: skyveknappen er kalibrert slik at én vegg etterlater noen få prosent – utseendet som leses som «bak noe» – og noen få prosent sammensatt ville vært ingenting ved tredje vegg; halvering per ekstra flate beholder fire tydelige trinn. Hvorfor kvadrert: lineært ga et mettet felt som fortsatt var mettet bak en vegg; en fjerde potens utslettet det ved 0,8. Hvorfor et gulv: å skjule okkludert varme helt får et rom fullt av skjult trafikk til å se ut som et tomt rom, uten noe som tyder på å ta i bruk [Skiven](slice.md). Bare en skyveknapp låst på 1 skjuler det helt – og det er den billigste innstillingen, siden okkluderte punkter da blir kastet.

Slik virker det ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), punktvarmeshaderne): sammenligningen gjøres per fragment, mot scenens dybdetekstur, i **vindusdybde** i stedet for verdensavstand. Et hent av dybdeteksturen i vertex-trinnet gir «fjernt» overalt på noen drivere (blant dem ANGLEs programvarerasterizer), og å lineærisere begge dybdene til meter mister skillet på grunn av presisjon når nær- og fjernområdet er bredt. Forskyvningen er én sprite-radius omregnet til vindusenheter pluss noen få minst signifikante bit, slik at et datapunkt som ligger på en flate ikke skygger for seg selv.

Konstruksjonene tegnes gjennomsiktige, men de tegnes inn i dybden som okklusjonen leser; et nivå hvis konstruksjoner ikke nådde dybdeteksturen ville bare okkludert mot terreng.

### Avskjæring etter avstand {#distance-culling}

Begge grensene evalueres i vertex-shaderen, så en avskåret rad koster ett vertex og ingen fragmenter.
