---
title: "Kujud kujude ülekattes"
parent: "Kujud"
grand_parent: "Kordus"
nav_order: 2
lang: "et"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---

# Kujud kujude ülekattes

See leht räägib sellest, kuidas kastid muudetakse väikesteks 3D kujudeks sellest, mis iga üksus tegelikult oli, ja suitsust ning tulest, mida kujud maha jätavad. Kordusvaate enda juhtnupud on lehel [Matši kordus](match-replay.md).

Lehel [Kujude ülekate](box-replay.md) ja vahekaardi Matš kujude kordusel joonistab **Kujud kastide asemel** (vaikimisi sisse) iga elava isiku kujuna sellest, mis ta on: jalgsi liikuva sõduri, tanki, mida keegi juhib, või lennuki, mis on Tacview rada. Kujul on kasti värv, koht ja suund. Lennukite ja rakettide puhul on tal ka kalle ning, kui andmetes on Roll-veerg, kallutus. **Kujude suurus** skaleerib neid; 1 kordne on tõeline suurus. Kujul tehtud klõpsud vastavad nii, nagu vastasid kasti klõpsud.

## Milline kuju {#which-figure}

Andmete enda nime- ja tüübiveerud otsustavad. Täielikud reeglid koos veergude nimedega on lehel [Kujud](figures.md#which-figure-a-unit-gets). Andmed, millel pole kumbagi liiki veerge, on inimeste andmed: kõik on sõdurid.

Vaste on vahemällu salvestatud sildi kaupa, nii et kaader maksab ainult paigutamise. Andmeüksus on meeter, kui andmed ei ütle, kui suur on üks jälgitav asi (CS2 eksport ütleb, et mängija on 32 ühikut lai); kujud skaleeritakse selle järgi.

Oma kujude valikuline pakk võib masinas asendada kataloogi kujud; vt [Kujud](figures.md#an-optional-local-figure-pack).

## Efektid {#effects}

Sündmuse read, mis jätavad midagi maha, joonistatakse seal, kus see juhtus, nii kaua kui see kestab, selle värviga, kes selle põhjustas: suits (umbes 18 s), molotov või süütepomm (7 s), välk (umbes üks sekund) ja lõhkeplahvatus (alla ühe sekundi), ansamblipettus (15 s), paigaldatud pomm (40 s). Need tulevad sündmuseveerust (Event, Events), mille silt on `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` või `plant`. CS2 eksport kirjutab need plahvatuse hetkel.

## Matši kordus: Tacview tööriistad {#match-replay-tacviews-tools}

Kaamerad, järjehoidjad, taktikaline kuvamine, statistika, sildid, **Loodjooned**, sündmuste loend ja graafikaaken on kirjeldatud lehel [Matši kordus](match-replay.md). [Tacview tasemel](tacview-parity.md) loetleb iga Tacview funktsiooni ja selle seisu.
