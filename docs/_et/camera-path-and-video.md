---
title: "Kaamerarada ja video"
nav_order: 15
lang: "et"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---

# Kaamera teekond ja video

Tee oma andmetest film: paigutad kaamera mõnda kohta, vaataja lendab nende vahel ja salvestab video. Iga kaader on väga puhas, ilma terata. Kaamera ja mängupea liiguvad koos, nii et sama paneel teeb ka ajaliitri ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Tee lend {#make-a-flythrough}

1. Lenda kohta, kust film algab, ja vajuta paneelis **Kaamera teekond ja renderdamine** nuppu **Lisa võtmekaader siia**.
2. Lenda järgmisse kohta ja vajuta sama nuppu uuesti. Korda iga peatuse puhul.
3. Märgi **Eelvaade piki teekonda** ja lohista **Asukoht teekonnal**, et liikumist kontrollida.
4. Määra **Kestus** (kui pikk video on). Liikumine, mis on õige, aga liiga kiire, vajab ainult pikemat kestust.
5. Vajuta **Renderda video**. Oota edenemisriba; kui see lõpeb, laaditakse fail alla.

![Kaamera teekond ja renderdamise paneel kolme võtmekaadri, Sujuva interpoleerimise, 12 s, 30 fps ja 16 Mbps seadistusega](../assets/img/en/camera-path-panel.webp)

## Võtmekaadrid {#keyframes}

| Juhtnupp | Mõju |
|---|---|
| **Lisa võtmekaader siia** | Lisab praeguse kaamera asukoha, yaw, pitch ja vaatevälja võtmekaadrina. |
| **Tühjenda** | Eemaldab kõik võtmekaadrid. |
| Võtmekaadrite loend | Üks rida võtme kohta: selle number (klõps lendab kaamera sinna, seades ka vaatevälja), asukoht, `yaw° / pitch°` ja **×**, et see eemaldada. |

Võtmed paigutatakse **ühtlaselt** normaliseeritud teekonna teljel 0 kuni 1, kui üks lisatakse või eemaldatakse; väljundi kestus venitab kogu liikumise, seega piisab liikumise õigeks, aga liiga kiireks jäänud lõigu jaoks pikemast kestusest. Yaw keeratakse võtmete vahel lahti, et kaamera pöörduks lühema tee kaudu.

Ilma võtmekaadriteta hoiab renderdus praeguse kaamera kogu klipi vältel paigal - täiesti hea ajaliitri.

## Teekonna seaded {#path-settings}

| Juhtnupp | Vaikimisi | Vahemik (hüppamisega) | Tähendus |
|---|---|---|---|
| **Interpoleerimine** (2+ võtit) | *Sujuv* | *Sujuv* / *Sirge* | *Sujuv*: kuupiline Hermite'i kõver läbi võtmete, puutujad naaberkaadritest, nii et kiirus sobib iga võtme juures ja lõikude kohtumisel pole tõmblemist. *Sirge*: sirged lõigud võtmete vahel, ettearvatavad, iga võtme juures nähtav nurk. Vaateväli interpoleeritakse alati lineaarselt. |
| Liikumisjoon (2+ võtit) | | | `N ühikut liikumist - M sekundis selle kestuse juures` või märkus, et kõik võtmed on ühes kohas. |
| **Eelvaade piki teekonda** (1+ võtit) | väljas | | Juhib vaatepildi kaamerat teekonnast ja liigutab mängupead kaasa, nagu renderdus teeb, nii et liikumist saab hinnata enne renderdamist. |
| **Asukoht teekonnal** (eelvaate ajal) | 0% | 0-100% | Kus teekonnal eelvaadata. |
| **Kestus** | 12 s | 1-120 s (3600) | Video pikkus. |
| **Kaadrisagedus** | 30 fps | 6-60 (240) | |
| **Bitikiirus** | 16 Mbps | 1-60 Mbps, logaritmiline (400) | Soojusgradiendid lähevad madalal bitikiirusel triibuliseks: koodekil pole piisavalt detaili, mille taha viga peita. |
| **Koondumise ooteaja piir** | 240 kaadrit | 2-600 (10 000) | Kauim, mida üks väljundkaader võib oodata, et saada täpne. Kaadrid, mis piirini jõuavad, kirjutatakse siiski ja loetakse. |
| Kokkuvõte | | | `N kaadrit · aken: kumulatiivne/fikseeritud/eluiga`, ja kui ajajoon on režiimis Kõik: *(renderdus lülitab Kõik režiimi Esitamiseks, et mängupeal oleks mõte)*. |
| **Renderda video** / **Tühista** | | | Alustab renderdust; selle töötamise ajal näitab `kaader i / n · ootas w · X MB` ja mitu kaadrit ei olnud täpsed. Vajab andmestikku. |

## Näpunäited {#tips}

- Väljundi suurus on lõuendi suurus seadme pikslites (ekraani pikslisuhe, piiratud 2-ga). Suuruse muutmiseks muuda brauseriakna suurust.
- Kumulatiivne ajalugu koguneb soojuse üles kogu klipi jooksul; aken või eluiga näitab liikuvat ajalõiku.
- Võtmekaadrite asukohad on kuvakoordinaadid: [pööratud maailmatelje](camera.md#invert-world-axis) korral osutavad enne teljevahetust tehtud võtmed pärast seda mujale.

## Arendajatele {#for-developers}

### Mida renderdus teeb {#what-a-render-does}

1. Teeb proovipildi kaadrist, et teada saada täpne väljundi suurus seadme pikslites.
2. Valib WebCodecsi kaudu koodeki: **VP9** (`vp09.00.10.08`), vajadusel **VP8**, valitud bitikiiruse ja kaadrisagedusega. Ilma `VideoEncoder`ita peatub teade *This browser has no VideoEncoder - WebCodecs is required to write a video*; kummagi koodekita *No supported video codec (tried VP9, VP8)*.
3. Võtab üle renderduseks vajalikud seaded: peatab esituse, lülitab **kohanduva eelarve välja**, **järkjärgulise täpsustamise sisse** ja spraitieelarve 64 M kaadri kohta (kohanduv eelarve kaitseb kaadrisagedust, mis on siin vale eesmärk: see loeks iga aeglaselt koonduva kaadri põhjuseks joonistada vähem ridu, aga see vajaks rohkem kaadreid koondumiseks). Ajajoone režiim lülitub **Kõigilt** režiimile **Esita**. Ajaloo seade (kumulatiivne, aken, eluiga) jääb samaks: renderdus peaks olema see, mida vaatasid, mängitud läbi ja kirja pandud.
4. Iga väljundkaadri *f* jaoks *n*-st, väärtusel *u* = f / (n - 1):
   - paigutab kaamera teekonna poosi juures *u* (kui võtmeid on);
   - liigutab mängupea ajajoone vahemiku sama murdosa *u* juurde (valitud seansi ulatus kasti taasesituses);
   - sunnib värske hinnangu, isegi kui kaamera ei liikunud - eelmise kaadri akumulatsiooni päriminek jätaks eelmise akna varju;
   - ootab kaadri kaupa, kuni pilt on täpne (kõik kandidaadiread joonistatud ühes kaadris või akumulatsioon valmis), kuni ooteaja piirini;
   - jäädvustab koostatud kaadri ja kodeerib selle, võtmekaadriga iga 2 sekundi väljundi järel, et faili saaks kerida.
5. Pakib kaadrid WebM-faili ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)), ajatemplid valitakse kaadrisageduse järgi - kui kaua iga kaader seinakellaga aega võttis, pole oluline.
6. Taastab eelarve, vaatevälja, ajajoone režiimi, mängupea ja selle, kas mängiti.
7. Laadib video alla nimega `3dheat-<width>x<height>-<frames>f.webm` ja teatab `N kaadrit suurusega W×H, X MB - iga kaader täpne`, või mitu kaadrit jõudis ooteaja piirini.

**Tühista** peatab pärast praegust kaadrit (*Render cancelled.*) ja taastab seaded.
