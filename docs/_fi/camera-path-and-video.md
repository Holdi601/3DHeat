---
title: "Kamerapolku ja video"
nav_order: 15
lang: "fi"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---

# Kameran reitti ja video

Tee elokuva datastasi: asetat kameran muutamaan paikkaan, katselija lentää niiden välillä ja tallentaa videon. Jokainen kuva on hyvin puhdas, ilman rakeisuutta. Kamera ja toistokohta liikkuvat yhdessä, joten sama paneeli tekee myös aikaviivekuvan ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Tee lentoreitti {#make-a-flythrough}

1. Lennä kohtaan, josta elokuva alkaa, ja paina **Lisää avainkuva tähän** osiossa **Kamerareitti ja renderöinti**.
2. Lennä seuraavaan paikkaan ja paina sitä uudelleen. Toista jokaiselle pysäkille.
3. Ruksaa **Esikatsele reittiä pitkin** ja vedä **Sijainti reitillä** -liukusäädintä tarkistaaksesi liikkeen.
4. Aseta **Kesto** (kuinka pitkä video on). Liike, joka on oikea mutta liian nopea, tarvitsee vain pidemmän keston.
5. Paina **Renderöi video**. Odota edistymisriviä; tiedosto latautuu, kun se on valmis.

![Kamerareitti ja renderöinti -paneeli kolmella avainkuvalla, Sulava interpolointi, 12 s, 30 fps ja 16 Mbps](../assets/img/en/camera-path-panel.webp)

## Avainkuvat {#keyframes}

| Säädin | Vaikutus |
|---|---|
| **Lisää avainkuva tähän** | Lisää nykyisen kameran sijainnin, kiertokulman, nyökkäyskulman ja näkökentän avainkuvaksi. |
| **Tyhjennä** | Poistaa kaikki avainkuvat. |
| Avainkuvaluettelo | Yksi rivi avainkuvaa kohden: sen numero (napsauta, niin kamera lentää siihen ja asettaa myös näkökentän), sijainti, `kiertokulma° / nyökkäyskulma°` ja **×**, jolla se poistetaan. |

Avainkuvat jaetaan **tasaisesti** normalisoitua reittiakselia pitkin välille 0–1 aina, kun yksi lisätään tai poistetaan; tulostuksen kesto venyttää sitten koko liikkeen, joten kuva, joka on oikea mutta liian nopea, tarvitsee vain pidemmän keston. Kiertokulma puretaan avainkuvien välillä, jotta kamera kääntyy lyhyempää kautta.

Ilman avainkuvia renderöinti pitää nykyisen kameran paikallaan koko klipin ajan – täysin toimiva aikaviivekuva.

## Reitin asetukset {#path-settings}

| Säädin | Oletus | Alue (säätörulla) | Merkitys |
|---|---|---|---|
| **Interpolointi** (2+ avainkuvaa) | *Sulava* | *Sulava* / *Suora* | *Sulava*: kuutiollinen Hermite-käyrä avainkuvien läpi, tangentit naapuriavainkuvista, joten nopeus täsmää jokaisen avainkuvan yli eikä liikkeessä ole notkahdusta segmenttien kohdalla. *Suora*: suorat viivat avainkuvien välillä, ennustettava, ja näkyvä kulma jokaisessa avainkuvassa. Näkökenttä interpoloidaan aina lineaarisesti. |
| Matkalinja (2+ avainkuvaa) | | | `N yksikköä matkaa – M sekunnissa tällä kestolla`, tai huomautus siitä, että kaikki avainkuvat ovat yhdessä paikassa. |
| **Esikatsele reittiä pitkin** (1+ avainkuvaa) | pois | | Ohjaa näkymän kameraa reitin mukaan ja siirtää toistokohtaa sen mukana kuten renderöinti tekee, joten liikettä voi arvioida ennen renderöintiä. |
| **Sijainti reitillä** (esikatselun aikana) | 0 % | 0–100 % | Kohta reitillä, jota esikatsellaan. |
| **Kesto** | 12 s | 1–120 s (3600) | Videon pituus. |
| **Kuvataajuus** | 30 fps | 6–60 (240) | |
| **Bittinopeus** | 16 Mbps | 1–60 Mbps, logaritminen (400) | Lämpögradientit raidoittuvat pahasti matalilla bittinopeuksilla: koodekilla on vähän yksityiskohtia, joiden taakse virhe voi piiloutua. |
| **Konvergoinnin odotusraja** | 240 kuvaa | 2–600 (10 000) | Pisin aika, jonka yksi tulostuskuva saa odottaa tullakseen tarkaksi. Kuvat, jotka osuvat rajaan, kirjoitetaan silti ja lasketaan. |
| Yhteenveto | | | `N kuvaa · ikkuna: kumulatiivinen/kiinteä/elinikä`, ja kun aikajana on Kaikki-tilassa: *(renderöinti vaihtaa Kaikki-tilan Toistoon, jotta toistokohdalla on merkitys)*. |
| **Renderöi video** / **Peruuta** | | | Käynnistää renderöinnin; sen ollessa käynnissä näkyy `kuva i / n · odotettu w · X MB` ja kuinka monta kuvaa ei ollut tarkka. Vaatii aineiston. |

## Vinkit {#tips}

- Tulostuksen koko on kankaan koko laitepikseleinä (näytön pikselisuhde, enintään 2). Muuta selainikkunan kokoa muuttaaksesi sitä.
- Kumulatiivinen historia rakentaa lämmön klipin yli; ikkuna- tai elinikähistoria näyttää liikkuvan aikaviipaleen.
- Avainkuvien sijainnit ovat näyttökoordinaatteja: [käännetyllä maailmanakselilla](camera.md#invert-world-axis) avainkuvat, jotka tehtiin ennen kääntämistä, osoittavat sen jälkeen johonkin muualle.

## Kehittäjille {#for-developers}

### Mitä renderöinti tekee {#what-a-render-does}

1. Ottaa testikaappauksen kuvasta, jotta tiedetään tarkka tulostuskoko laitepikseleinä.
2. Valitsee koodekin WebCodecsin kautta: **VP9** (`vp09.00.10.08`), muuten **VP8**, valitulla bittinopeudella ja kuvataajuudella. Ilman `VideoEncoder`-rajapintaa se pysähtyy viestiin *Tämä selain ei tue VideoEncoderia – WebCodecs vaaditaan videon kirjoittamiseen*; ilman kumpaakaan koodekkia viestiin *Tuettua videokoodekkia ei ole (kokeiltiin VP9, VP8)*.
3. Ottaa haltuun asetukset, joita renderöinti tarvitsee: pysäyttää toiston, kytkee **mukautuvan budjetin pois**, **progressiivisen tarkennuksen päälle** ja spritebudjetin 64 M:ään kuvaa kohden (mukautuva budjetti suojelee kuvanopeutta, joka on väärä tavoite tässä: se lukisi jokaisen hitaasti konvergoivan kuvan syyksi piirtää vähemmän rivejä, mikä vaatii enemmän kuvia konvergoitumiseen), ja vaihtaa aikajanan tilan **Kaikki**-tilasta **Toistoon**. Historia-asetus (kumulatiivinen, ikkuna, elinikä) jätetään ennalleen: renderöinnin on tarkoitus olla se, mitä katsoit, toistettuna ja tallennettuna.
4. Jokaiselle tulostuskuvalle *f* / *n*, kohdassa *u* = f / (n - 1):
   - asettaa kameran reitin asentoon kohdassa *u* (jos avainkuvia on);
   - hakee toistokohdan aikajanan alueen samaan osuuteen *u* (valitun istunnon väli laatikkotoistossa);
   - pakottaa uuden arvion, vaikka kamera ei liikkuisi – edellisen kuvan kertymän perintö jättäisi aiemman ikkunan haamun;
   - odottaa kuva kerrallaan, kunnes kuva on tarkka (kaikki ehdokasrivit piirretty yhdessä kuvassa, tai kertymä valmis), enintään odotusrajaan asti;
   - kaappaa yhdistetyn kuvan ja koodaa sen, ja avainkuva joka 2 sekunnin tulostuksessa, jotta tiedosto on haettavissa.
5. Yhdistää kuvat WebM-tiedostoksi ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)) aikaleimoilla, jotka valitaan kuvataajuudesta – se seinäkellon aika, jonka kukin kuva vei, ei merkitse mitään.
6. Palauttaa budjetin, näkökentän, aikajanan tilan, toistokohdan ja sen, toistettiinko.
7. Lataa videon nimellä `3dheat-<width>x<height>-<frames>f.webm` ja ilmoittaa `N kuvaa kohteessa W×H, X MB – jokainen kuva tarkka`, tai kuinka monta osui odotusrajaan.

**Peruuta** pysähtyy nykyisen kuvan jälkeen (*Renderöinti peruttiin.*) ja palauttaa asetukset.
