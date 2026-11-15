---
title: "Analiza lovirilor (fila Vehicule)"
parent: "Reluare"
nav_order: 4
lang: "ro"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---

# Analiza lovirilor (fila Vehicule)

Fila **Vehicule** arată unde a fost lovit un tanc, o navă sau un soldat și de cine. Folosește-o ca să vezi ce parte a unui tanc este lovită sau ce inamic face daunele.

## Încearcă {#try-it}

1. Încarcă un meci care are lovituri (tabelul de mai jos arată ce jocuri le dau).
2. Deschide fila **Vehicule** de sus.
3. Sub **Vehicul**, alege o unitate, de exemplu un tip de tanc. Numărul din paranteză este câte lovituri a primit.
4. Citește figura: fiecare marcaj este o lovitură, pusă acolo unde a lovit.
5. Deschide **Cine a lovit** ca să vezi trăgătorii, armele sau vehiculele trăgătorilor, cu lovituri, daune, uciderile și distanța.

![Fila Vehicule: un tanc demonstrativ cu marcaje de lovituri și Cine a lovit deschis](../assets/img/en/hit-analysis-tank.webp)

Dacă nu este încărcat nimic, sau datele nu au lovituri pe vehicule, fila spune ce lipsește și ce convertor să folosești.

```
        shooter ----> o  hit mark on the figure
        shooter ----> o
  [ tank figure ]
```

Figura arată loviturile acolo unde datele dau un punct sau o parte a corpului. Defalcarea (cine a lovit, cu ce, cât de tare, de la ce distanță) funcționează pentru fiecare sursă.

## Ce dă fiecare sursă {#what-each-source-gives}

| Sursă | Punctul de pe unitate | Trăgătorul | Arma | Daună / rezultat |
|---|---|---|---|---|
| War Thunder | da, în sistemul unității, cu direcția loviturii | da | vehiculul trăgătorului | critică, gravă, module distruse, lovitură fatală |
| CS2 | partea corpului (hitgroup) | da | da | daună, armură, viață rămasă |
| World of Tanks | da (cutia componentei, intrare și ieșire) | da | - | daună sau nimic (ricoșeu, fără penetrare) |
| World of Warships | da, în sistemul navei | da | tipul loviturii | - |
| Squad | vehicule: da - impactul pus în sistemul vehiculului, din poziția și direcția lui proprie | nu (datele nu numesc niciunul) | tipul de daună | scăderea vieții vehiculului în acel moment, distrus |
| Soldații din Squad | nu: rezultatele loviturilor (osul și punctul de impact) sunt păstrate brut de convertor; rândurile `impact` cu `hitBone` sunt citite imediat ce le scrie | | | doar răniri și morți |
| Arma (OCAP, înregistratorul din Arma 3) | nu: OCAP înregistrează cine a lovit sau a ucis pe cine, cu ce, de la ce distanță, nu unde | da | da | lovitură sau ucidere, distanța |
| Tacview ACMI | da, acolo unde un obiect-armă se termină la 30 m de o unitate (nu lansatorul): ultimul loc al lui în sistemul unității (direcție, tangaj, ruliu), venind pe calea pe care a zburat | `Parent` al armei | numele armei, sau AmmoType al unui Timeout | Outcome-ul Timeout-ului, scăderile lui `Health`, `Destroyed`; fără armă, o ucidere sau o daună fără punct |
| Telemetria IL-2 (Watcher) | da: evenimentele `hit` / `damage` poartă punctul în sistemul avionului jucătorului (luat ca x înainte, y în sus, z dreapta) | nu | nu | forța |
| Dota 2 | nu: jurnalul de luptă nu are loc pe un erou | unitatea atacatoare | abilitatea sau obiectul (niciunul: un atac) | daună, moartea eroului |
| Battlefield 6 (GameCapture) | nu: captura citește fluxul de ucideri (uciderile, morțile, indicatorul de lovitură în cap), nu loviturile | | | |
| Surse live Watcher DCS / altele | fără evenimente de lovitură dincolo de ce țin înregistrările lor Tacview | | | |

Acolo unde nicio lovitură a unității nu are un punct, figura nu arată niciun marcaj, iar defalcarea **Cine a lovit** se deschide singură: după trăgător, armă sau vehiculul trăgătorului, fiecare cu loviturile, daunele și uciderile sale, și distanța mediană și cea mai mare.

## Restrânge la o zonă {#restrict-to-an-area}

Secțiunea **Zonă** limitează analiza la loviturile care s-au petrecut într-un loc de pe hartă.

1. Apasă **Desenează dreptunghi** sau **Desenează poligon** și desenează pe terenul 3D sau pe harta tactică.
2. Alege **Victima înăuntru** (numără o lovitură când unitatea lovită a fost în zonă) sau **Trăgătorul înăuntru** (când cel care a tras a fost).
3. Apasă **Folosește-le ca filtru**. Cipurile arată „{n} din {total} lovituri în zonă”.
4. **Resetează zona** elimină toate zonele.

Fiecare zonă este un [volum](volumes.md), deci aceleași forme filtrează și harta de căldură, și reluarea. O zonă poate include sau exclude (o zonă de excludere își lasă loviturile afară, arătate ca „{n} din {total} lovituri în afara zonei”). Fiecare zonă apare ca un cip cu câte dintre loviturile unității au fost în ea; × de pe un cip o elimină. Numărătorile, figura, defalcarea și listele de filtre urmează toate.

Locurile unei lovituri: rândul din care provine ține locul unei singure părți (al victimei pentru o rănire sau o lovire, al trăgătorului pentru un foc); locul celeilalte este eșantionul propriu al unității, cel mai apropiat în timp (în 5 s). O lovitură al cărei loc al părții nu este cunoscut este lăsată afară cât timp un filtru de zonă lucrează, iar panoul spune câte („Lăsate afară, niciun loc cunoscut”).

## Pentru dezvoltatori {#for-developers}

Orice convertor poate adăuga lovituri: un rând al victimei (`hit`, `impact`, `hurt`, `wounded`) cu `hitBone` (un os al scheletului, o selecție Arma, o zonă de lovire Reforger - mapată la cap, piept, stomac, brațe și picioare) sau `hitLocalX/Y/Z` (metri, x înainte, y în sus, z dreapta), cu `other` trăgătorul și `damage`.
