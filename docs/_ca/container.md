---
title: "Un fitxer per partida (.3dheat)"
parent: "Carregar dades"
nav_order: 9
lang: "ca"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Un fitxer per partida: `.3dheat`

Un fitxer `.3dheat` és una partida sencera en un sol fitxer, per copiar, guardar o compartir. Per obrir-ne un, només cal deixar anar el fitxer al panell Origen.

```
match.3dheat   (a ZIP file)
  manifest      what the match is, and the list of everything inside
  table         the positions (Parquet)
  match.json    the match document
  sidecars      what the converter kept whole (events, messages, ...)
```

Una partida convertida solia ser diversos fitxers un al costat de l'altre: la taula
`<partida>.parquet`, el document de la partida `<partida>.match.json` i els auxiliars
`<partida>.<què>.parquet` ([Els convertidors ho conserven tot](converters.md)). Un fitxer
`.3dheat` els conté tots en un: una repetició, un fitxer, per copiar, guardar o compartir.

Està pensat perquè carregar-ne mil sigui tan ràpid com carregar les taules soltes, i perquè els
convertidors posteriors hi puguin posar molt més sense un format nou.

## Carregar-ne un {#loading-one}

Allà on es carrega un fitxer o una carpeta, també es carrega un fitxer `.3dheat`, i una carpeta
pot barrejar contenidors i fitxers solts:

| On | Què es llegeix del contenidor |
|---|---|
| El panell Origen del **Mapa de calor** (fitxers, carpeta, arrossegar i deixar anar) | les seves taules, com si fossin el `<partida>.parquet` solt |
| **Mapa de calor → Moltes partides alhora** (Fitxers, Carpeta, Afegeix carpeta) | les seves taules, llegides al seu lloc pels treballadors del carregador |
| La pestanya **Partida** (Carrega, o deixar anar sobre la vista) | el document de la partida |
| La pissarra **Tàctica** (telemetria) | les seves taules |

Obrir un contenidor llegeix dues petites parts: el seu directori al final i el seu manifest a l'inici;
no es llegeix res d'una taula fins que el carregador la llegeix. Els auxiliars i el document de la
partida només es llegeixen quan alguna cosa els demana. Una carpeta que té la mateixa partida dues
vegades, solta i empaquetada, la carrega una sola vegada.

## Empaquetar i desempaquetar {#packing-and-unpacking}

Les noves conversions escriuen contenidors per defecte: el convertidor de War Thunder
(`heat3d-wt-replay`), el convertidor de CS2 (`heat3d_cs2 demos`) i l'eina de Tacview
(`node tools/acmi-to-parquet.mjs`). `--loose` manté els fitxers separats.

Les partides convertides abans, o per altres eines, s'empaqueten amb:

```
node tools/3dheat-pack.mjs <folder>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <folder|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <folder|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <role>[:<name>]=<file>]... [--remove <name>]...
node tools/3dheat-pack.mjs repack <folder|file.3dheat>...
```

- **pack** troba sota les carpetes cada taula `<partida>.parquet` amb els fitxers que
  li pertanyen i escriu `<partida>.3dheat` al costat. Una partida ja empaquetada s'omet.
  Cada contenidor es llegeix de nou sencer (el sha256, la mida, el CRC i el peu Parquet de
  cada membre) abans de res més; els fitxers solts només s'eliminen amb `--delete-loose`, i
  per a una partida empaquetada abans només quan són, byte per byte, el que conté el
  contenidor. Una partida amb un fitxer canviat en els últims `--settle` minuts (10 per
  defecte) es deixa estar: un convertidor encara pot estar escrivint-la.
- **unpack** escriu els membres de nou com a fitxers solts al costat del contenidor.
- **update** afegeix o reemplaça membres sense reescriure les taules que ja hi ha al
  contenidor (més avall).
- **repack** reescriu un contenidor sencer, eliminant el que les actualitzacions han deixat enrere.

## El format {#the-format}

Un fitxer `.3dheat` és un arxiu ZIP (qualsevol eina ZIP l'obre), amb aquestes regles:

1. **`manifest.json` és el primer membre** quan s'escriu un contenidor, i sempre hi és. Es troba
   pel directori central del ZIP, de manera que després d'un `update` pot estar més endavant al fitxer.
2. **Els membres que es llegeixen per rang de bytes o que ja estan comprimits s'emmagatzemen**
   (mètode ZIP 0): Parquet, Arrow, imatges, models, àudio, vídeo, blobs opacs. Un membre
   emmagatzemat és un rang de bytes contigu del contenidor, de manera que un lector llegeix el peu
   d'una taula i els seus fragments de columna al seu lloc, amb `File.slice` en un navegador o una
   petició de rang HTTP, exactament com llegiria el fitxer solt.
3. **El text es comprimeix amb deflate** (mètode 8): JSON, CSV, text pla. Són petits i es
   llegeixen sencers.
4. Els noms són UTF-8 (indicador de bit 11), relatius, separats per `/`, sense `..`; poden tenir
   carpetes (`analysis/heat.json`). Un fitxer solt empaquetat conserva el seu propi nom, de manera
   que desempaquetar en torna els mateixos fitxers.
5. Els membres de més de 4 GiB, o els contenidors de més de 65.535 membres, usen ZIP64 com és habitual.
   Els escriptors no posen descriptors de dades després dels membres.

Els membres que els convertidors escriuen avui, en aquest ordre:

| Paper | Membre | Emmagatzemat |
|---|---|---|
| `table` | `<partida>.parquet` | sí |
| `match` | `<partida>.match.json` | no (comprimit amb deflate) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<partida>.<paper>.parquet` | sí |
| `summary` | `<partida>.summary.json`, el resum de l'índex massiu ([Anàlisi massiva](mass-analysis.md)), afegit per `tools/3dheat-summarize.mjs` | no (comprimit amb deflate) |

La taula ve just després del manifest, de manera que la primera lectura del lector a l'inici del
fitxer cobreix el manifest i la capçalera local de la taula.

### El manifest {#the-manifest}

```json
{
 "format": "3dheat",
 "format_version": "1.0",
 "game": "warthunder",
 "source": "client replay",
 "converter": { "name": "heat3d-wt-replay", "version": "0.2.0" },
 "match": "<map>_RB_<date>_<session>",
 "map": "<map>",
 "mode": "RB ground",
 "started": "2026-01-01T12:00:00+00:00",
 "created": "2026-01-01T13:00:00.000Z",
 "roles": { "table": "<match>.parquet", "match": "<match>.match.json", "flight": "<match>.flight.parquet" },
 "members": [
  {
   "name": "<match>.parquet",
   "role": "table",
   "media_type": "application/vnd.apache.parquet",
   "compression": "stored",
   "bytes": 1738575,
   "rows": 38105,
   "sha256": "<64 hex digits>",
   "schema": { "id": "heat3d-table", "version": "1" }
  }
 ]
}
```

| Camp | Significat |
|---|---|
| `format` | sempre `3dheat` |
| `format_version` | `major.minor` (més avall) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | què és la partida i què l'ha fet; `null` quan no es coneix |
| `created`, `updated` | quan s'ha escrit, quan s'ha actualitzat per última vegada (`updated` només apareix després d'una actualització) |
| `roles` | cada paper amb el nom del seu primer membre: un índex ràpid |
| `members` | tots els membres excepte el manifest: la llista completa, i la que un lector es fia |
| `matches` | opcional: les partides d'un contenidor que en té diverses (més avall) |
| `references` | opcional: fitxers que el contenidor necessita però no conté |
| `extensions` | opcional: les metadades pròpies d'un convertidor |

Cada membre:

| Camp | Significat |
|---|---|
| `name` | el seu camí dins del contenidor |
| `role` | per a què serveix (més avall) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` o `deflate` |
| `bytes` | la seva mida, sense comprimir |
| `sha256` | dels seus bytes, sense comprimir |
| `rows` | el nombre de files d'una taula |
| `schema` | la convenció que segueix, `{ "id", "version" }`: el `format` i `version` propis d'un document (`heat3d-wt-replay-match` 2), `heat3d-table` per a una taula que el visor llegeix pel seu peu `heat3d`, `heat3d-acmi-table` per a la de l'eina de Tacview |
| `match` | en un contenidor de diverses partides, el `matches[].id` al qual pertany |

### Pensat per créixer {#made-to-grow}

El format està pensat per portar repeticions molt més riques que les d'avui sense trencar el
que les llegeix ara:

- **Versions.** `format_version` és `major.minor`. Un lector llegeix totes les versions menors de la seva
  major i ignora tots els camps que no coneix. La menor puja quan s'afegeix alguna cosa; la major només
  quan canvia el disseny de manera que un lector antic el llegiria malament (un membre que ja no
  s'emmagatzema, el manifest mogut fora de l'arxiu). La convenció de cada membre té la seva
  pròpia versió, a `schema`, de manera que un disseny de taula nou o una versió nova d'un document
  no necessiten una versió nova de contenidor. Els primers contenidors escrits deien `"version": 1`
  en lloc d'això; els lectors ho prenen com a 1.0.
- **Els papers són oberts.** Un paper és qualsevol cadena. Els lectors usen els papers que coneixen
  i conserven la resta: un paper desconegut es llista, mai no es rebutja, i `update` i `repack` el
  porten sense tocar-lo. Un paper pot tenir molts membres: diverses taules (pistes per unitat,
  telemetria a altres ritmes), esdeveniments, veu, sincronització de vídeo, referències de nivell,
  substitucions de figures, resultats d'anàlisi. Els noms poden tenir carpetes.
- **Qualsevol mitjà.** Un membre pot ser qualsevol cosa amb un tipus de mitjà: Parquet, JSON,
  Arrow, miniatures PNG o JPEG, models glTF, àudio, blobs en brut.
- **Diverses partides.** Una sessió o un torneig pot anar en un sol contenidor: `matches` les llista
  (`{ "id", "map", "mode", "started", ... }`) i cada membre n'anomena la `match`. El visor carrega
  cada membre amb el paper `table`.
- **Referències.** Els fitxers que un contenidor necessita però no conté, com un nivell per a una
  partida, es llisten a `references` pel nom i el sha256
  (`{ "kind": "level", "name": "...", "sha256": "..." }`), de manera que el fitxer correcte es troba
  i es comprova sense copiar-lo a cada partida.
- **Extensions.** `extensions` guarda les metadades pròpies d'un convertidor sota la seva pròpia clau,
  `"<proveïdor>/<nom>": { ... }`, de manera que dos convertidors mai no xoquen i no cal afegir res als
  camps compartits.
- **Actualitzar al lloc.** `update` afegeix o reemplaça membres sense reescriure les taules
  emmagatzemades grans: els membres nous i un manifest nou s'afegeixen després del final del
  contenidor, seguits d'un directori central nou. El que s'ha reemplaçat es queda com a bytes sense
  referència fins a `repack`. Es conserva cada membre i cada camp del manifest, conegut o no. Una
  actualització que falla es retalla i el contenidor queda com era.

Els tests del visor ho garanteixen: un contenidor de format 1.7 amb un paper desconegut, un camp de
membre, una extensió i un membre d'àudio en una carpeta es carrega, i sobreviu a una actualització i a
un repack amb tot intacte; un contenidor de major 2 és rebutjat.

## Escriptors {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)
  (escriure, llegir, verificar, actualitzar, repack), usat per l'eina d'empaquetat i l'eina de Tacview.
- Python: `container.py`, unes 140 línies sobre el `zipfile` estàndard, el mateix fitxer a cada
  convertidor (`heat3d_ext_warthunder/container.py`, `heat3d_cs2/container.py`), de manera que cap
  convertidor depèn d'un altre. Un convertidor nou el copia.
- El visor llegeix amb
  [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
