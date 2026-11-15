---
title: "Knihovna levelů"
parent: "Levely a geometrie pozadí"
nav_order: 4
lang: "cs"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---

# Knihovna levelů

Knihovna drží vaše úrovně v tomto prohlížeči, takže je nemusíte znovu načítat a zjednodušovat. **Smazání dat webu v prohlížeči smaže knihovnu a neexistuje žádný export.** Uschovejte si své původní soubory.

Zpracování úrovně – čtení, klasifikace, svařování, decimace, balení textur – je pomalé a výsledek je pokaždé stejný. **Knihovna** ve spodní části panelu Pozadí / úroveň drží zpracované úrovně v tomto prohlížeči, takže se decimovaná síť nikdy nestaví dvakrát ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Uložení a znovunačtení úrovně {#save-and-reload-a-level}

1. Načtěte obraz mapy nebo 3D model a ověřte, že vypadá správně.
2. Stiskněte **Uložit do knihovny**. Panel napíše *Uloženo. Příště se načte okamžitě.*
3. Příště otevřete seznam **Knihovna** a stiskněte ▸ u úrovně.
4. Stiskněte ✕ pro smazání položky, která už nepotřebujete.

## Použití {#using-it}

| Ovládání | Účinek |
|---|---|
| **Uložit do knihovny** | Uloží aktuální úroveň. Obraz mapy se uloží jako PNG se dvěma kotvami; model jako jeho zpracované buffery. Panel napíše *Uloženo. Příště se načte okamžitě.* |
| Seznam knihovny | Jeden řádek na uloženou úroveň: název (s jeho uloženou velikostí po najetí), u modelu trojúhelníky, u obrazu šířka v pixelech. |
| ▸ (*Načíst*) | Načte položku jako aktuální úroveň. |
| ✕ (*Smazat*) | Odstraní položku. |
| Řádek využití | `Využito X z Y.` – odhad úložiště prohlížeče pro tento web. |

Když nic není uloženo, seznam říká *Prázdné. Načtěte mapu nebo model a pak „Uložit do knihovny“.*

## Co se ukládá {#what-is-stored}

| Druh | Uloženo | Neuloženo |
|---|---|---|
| Obraz mapy | Obraz (PNG), jeho velikost, jeho kotvy | Výška, překlopení, průhlednost, jas, odbarvení – vrátí se na výchozí hodnoty (výška = nejnižší Y aktuální datové sady, překlopení zapnuto) |
| 3D úroveň | Vrcholy, barvy vrcholů, souřadnice textur, jejich dlaždice a atlas textur, trojúhelníky terénu / konstrukcí / vody, hrany konstrukcí, počty trojúhelníků | Názvy částí a důvody klasifikace a každé nastavení vzhledu – vrátí se na výchozí hodnoty čerstvého importu |

Model načtený z knihovny nemá seznam částí a jeho hranice a pásmo výšky terénu se přepočítají z jeho vrcholů.

## Kde leží {#where-it-lives}

V IndexedDB prohlížeče, databáze `3dheat`, úložiště objektů `levels`, pro původ stránky (adresa v adresním řádku prohlížeče). Je místní pro ten profil prohlížeče: jiný prohlížeč, jiný profil nebo jiná adresa (například `localhost` místo `127.0.0.1`) vidí jinou, prázdnou knihovnu. Smazání dat webu v prohlížeči ji smaže. Položky uložené staršími verzemi bez struktur, barev a vody se stále načtou.
