"""
World of Warships ship numbers -> 3DHeat figures.

The World of Warships converter writes the recording player's ship by its
index name ("PASB018-Iowa-1944") and every other ship by the game's ship number
("4253956080"): the names are in the game's own parameter files, not in the
replay. The game's public encyclopedia lists every ship with its number, index
name, kind, tier and nation:

    https://vortex.worldofwarships.eu/api/encyclopedia/en/vehicles/

This script turns that list into src/figures/specs/aliases-wows.ts: each ship
number and index name mapped to the figure of its class - the ship's own class
where the catalogue has it (by name, or by the class table below for ships
named after one ship of a class), else a figure of the same kind, era and size
(by nation, kind and tier). Fictional and paper ships get the nearest real
class of their size.

    python -I tools/figures/wows_ships.py --vortex vehicles.json --figures naval-figs.tsv --out src/figures/specs/aliases-wows.ts [--report report.txt]

--vortex: the encyclopedia's JSON as downloaded (or a URL to fetch).
--figures: the catalogue's sea figures, one "name<TAB>class" per line (any
dump of the catalogue; only used to check every figure named exists).
"""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
import urllib.request
from pathlib import Path

KINDS = {'Destroyer': 'dd', 'Cruiser': 'cr', 'Battleship': 'bb', 'AirCarrier': 'cv', 'Submarine': 'ss'}

# A figure class that can stand for each kind (a cruiser is never drawn as a frigate, a battleship never as a cruiser).
FITS = {
    'dd': {'destroyer'},
    'cr': {'cruiser', 'light-cruiser', 'heavy-cruiser', 'armoured-cruiser', 'battlecruiser'},
    'bb': {'battleship', 'battlecruiser'},
    'cv': {'carrier'},
    'ss': {'submarine'},
}

# Ships named after one ship of a class (or a paper ship close to one): base name -> figure.
# Names as the encyclopedia's English name, lower case, accents dropped, variant marks removed (see base());
# "kind:name" where two kinds share a name.
CLASS = {
    # USA
    'sampson': 'clemson', 'smith': 'clemson', 'wickes': 'clemson', 'dd 214': 'clemson', 'hill': 'clemson',
    'nicholas': 'fletcher', 'monaghan': 'farragut', 'hughes': 'gleaves', 'sims': 'gleaves', 'benson': 'gleaves',
    'kidd': 'fletcher', 'osborne': 'gearing', 'benham': 'bagley', 'black': 'fletcher', 'christopher': 'fletcher',
    'frank friday': 'fletcher', 'gq johnny': 'fletcher', 'halford': 'fletcher', 'johnston': 'fletcher',
    'burrows': 'gearing', 'hull': 'forrest-sherman', 'laffey': 'sumner', 'joshua humphreys': 'mitscher',
    'erie': 'pillau', 'albany': 'pillau', 'chester': 'pillau', 'charleston': 'pillau', 'st. louis': 'pillau',
    'phoenix': 'omaha', 'marblehead': 'omaha', 'rattlehead': 'omaha', 'dallas': 'brooklyn', 'boise': 'brooklyn',
    'helena': 'brooklyn', 'honolulu': 'brooklyn', 'flint': 'atlanta', 'indianapolis': 'portland',
    'anchorage': 'baltimore', 'bridgeport': 'baltimore', 'congress': 'baltimore', 'protector': 'baltimore',
    'rochester': 'baltimore', 'san diego': 'atlanta', 'wichita': 'new-orleans', 'buffalo': 'baltimore',
    'cambridge': 'baltimore', 'fort worth': 'worcester', 'seattle': 'cleveland', 'tulsa': 'baltimore',
    'vallejo': 'baltimore', 'austin': 'worcester', 'hawaii': 'alaska', 'puerto rico': 'alaska', 'salem': 'des-moines',
    'annapolis': 'des-moines', 'jacksonville': 'des-moines', 'montpelier': 'cleveland',
    'south carolina': 'delaware', 'arkansas': 'wyoming', 'oklahoma': 'nevada', 'texas': 'new-york',
    'arizona': 'pennsylvania', 'w. virginia': 'colorado', 'west virginia': 'colorado', 'california': 'tennessee',
    'florida': 'south-dakota', 'alabama': 'south-dakota', 'massachusetts': 'south-dakota', 'indiana': 'south-dakota',
    'constellation': 'alaska', 'kansas': 'north-carolina', 'kheper': 'south-dakota', 'nebraska': 'north-carolina',
    'tennessee': 'tennessee', 'volunteer state': 'tennessee', 'kearsarge': 'iowa', 'bird cry': 'iowa',
    'delaware': 'iowa', 'georgia': 'iowa', 'illinois': 'iowa', 'missouri': 'iowa', 'minnesota': 'iowa',
    'montana': 'iowa', 'louisiana': 'iowa', 'new jersey': 'iowa', 'ohio': 'iowa', 'oregon': 'iowa',
    'rhode island': 'iowa', 'utah': 'iowa', 'vermont': 'iowa', 'wisconsin': 'iowa', 'maine': 'iowa',
    'langley': 'colossus', 'bogue': 'colossus', 'independence': 'colossus', 'ranger': 'yorktown',
    'saipan': 'colossus', 'enterprise': 'yorktown', 'hornet': 'yorktown', 'midway': 'forrestal',
    'franklin d. roosevelt': 'forrestal', 'pinatapolis': 'essex', 'united states': 'forrestal',
    'lexington': 'lexington-cv2', 'cachalot': 'gato', 'salmon': 'gato', 'archerfish': 'balao',
    # Japan
    'tachibana': 'momi', 'umikaze': 'momi', 'wakatake': 'momi', 'isokaze': 'momi', 'fujin': 'kamikaze',
    'minekaze': 'kamikaze', 'shinonome': 'fubuki', 'akatsuki': 'fubuki', 'yudachi': 'shiratsuyu',
    'shigure': 'shiratsuyu', 'asashio': 'kagero', 'yukikaze': 'kagero', 'harekaze': 'kagero', 'kitakaze': 'akizuki',
    'minegumo': 'kagero', 'yugumo': 'yugumo', 'fuyutsuki': 'akizuki', 'harugumo': 'akizuki', 'hayate': 'shimakaze',
    'yamagiri': 'akizuki',
    'hashidate': 'yubari', 'chikuma': 'tone', 'katori': 'yubari', 'tenryu': 'kuma', 'iwaki': 'kuma',
    'yahagi': 'agano', 'gokase': 'aoba', 'ashigara': 'myoko', 'haguro': 'myoko', 'nachi': 'myoko', 'maya': 'myoko',
    'takao': 'myoko', 'atago': 'myoko', 'omono': 'mogami', 'tokachi': 'mogami', 'eastern dragon': 'myoko',
    'southern dragon': 'myoko', 'desert falcon': 'furutaka', 'shimanto': 'mogami', 'azuma': 'kronshtadt',
    'takahashi': 'myoko', 'chikuma sho-go': 'tone', 'chikuma ii': 'tone', 'ibuki': 'mogami', 'suzuya': 'mogami-1943',
    'ota': 'mogami', 'kitakami': 'oyodo', 'kushiro': 'mogami', 'yari': 'mogami', 'yodo': 'oyodo',
    'yoshino': 'kronshtadt', 'zao': 'mogami', 'kurama': 'kronshtadt',
    'mikasa': 'dreadnought', 'ishizuchi': 'kongo', 'myogi': 'kongo', 'haruna': 'kongo', 'hiei': 'kongo',
    'kirishima': 'kongo', 'hyuga': 'ise', 'mutsu': 'nagato', 'ashitaka': 'tosa', 'ignis purgatio': 'amagi',
    'kii': 'amagi', 'ragnarok': 'amagi', 'yumihari': 'amagi', 'adatara': 'yamato', 'daisen': 'yamato',
    'hizen': 'amagi', 'hotaka': 'yamato', 'iwami': 'yamato', 'izumo': 'yamato', 'musashi': 'yamato',
    'tsurugi': 'yamato', 'aki': 'yamato', 'bungo': 'yamato', 'shikishima': 'yamato', 'togasa': 'yamato',
    'yamato kai': 'yamato', 'satsuma': 'yamato',
    'hosho': 'colossus', 'zuiho': 'colossus', 'ryujo': 'colossus', 'hiryu': 'shokaku', 'kaga': 'lexington-cv2',
    'akagi': 'lexington-cv2', 'taiho': 'shokaku', 'shinano': 'shokaku', 'hakuryu': 'shokaku', 'sekiryu': 'shokaku',
    'i-56': 'balao', "arona's whale": 'balao',
    # Germany
    'v-25': 'raubtier', 'g-101': 'raubtier', 'v-170': 'raubtier', 't-22': 'type-1939', 't-61': 'type-1939',
    'ernst gaede': 'type-1934a', 'karl von schonberg': 'type-1934a', 'leberecht maass': 'type-1934a',
    'z-31': 'type-1936a', 'z-39': 'type-1936a', 'gustav-julius maerker': 'type-1936a', 'z-23': 'type-1936a',
    'z-35': 'type-1936c', 'felix schultz': 'type-1936c', 'z-44': 'type-1936c', 'z-46': 'type-1936c',
    'zf-6': 'z52', 'zh-1': 'z52', 'elbing': 'z52', 'georg hoffmann': 'z52', 'lubeck': 'z52', 'sharqi': 'z52',
    'z-42': 'z52', 'z-57': 'z52', 'z-52': 'z52',
    'hermelin': 'pillau', 'dresden': 'pillau', 'emden': 'pillau', 'kolberg': 'pillau', 'karlsruhe': 'konigsberg',
    'admiral graf spee': 'deutschland', 'admiral scheer': 'deutschland', 'nurnberg': 'leipzig', 'munchen': 'hipper',
    'weimar': 'hipper', 'yorck': 'hipper', 'admiral hipper': 'hipper', 'cross of dorn': 'hipper', 'knesebeck': 'hipper',
    'mainz': 'hipper', 'prinz eugen': 'hipper', 'schill': 'hipper', 'wiesbaden': 'hipper', 'aegir': 'kronshtadt',
    'admiral schroder': 'hipper', 'blucher': 'hipper', 'manteuffel': 'hipper', 'roon': 'hipper', 'siegfried': 'kronshtadt',
    'bremen': 'kronshtadt', 'agir': 'kronshtadt', 'hildebrand': 'hipper', 'hindenburg': 'hipper', 'prinz adalbert': 'hipper',
    'clausewitz': 'kronshtadt',
    'konig albert': 'kaiser', 'moltke': 'von-der-tann', 'prinz eitel friedrich': 'mackensen', 'prinz heinrich': 'mackensen',
    'gneisenau': 'gneisenau-380', 'anhalt': 'bismarck-battleship', 'tirpitz': 'bismarck-battleship',
    'bismarck': 'bismarck-battleship', 'brandenburg': 'bismarck-battleship', 'eiserner kanzler': 'bismarck-battleship',
    'odin': 'scharnhorst', 'sea howl': 'bismarck-battleship', 'wahnsinn': 'bismarck-battleship', 'zieten': 'scharnhorst',
    'friedrich carl': 'bismarck-battleship', 'friedrich der grosse': 'bismarck-battleship', 'pommern': 'bismarck-battleship',
    'prinz rupprecht': 'bismarck-battleship', 'prinz sigismund': 'bismarck-battleship', 'grosser kurfurst': 'bismarck-battleship',
    'mecklenburg': 'bismarck-battleship', 'preussen': 'bismarck-battleship', 'schlieffen': 'bismarck-battleship',
    'von zuckerhoff': 'bismarck-battleship', 'hannover': 'bismarck-battleship',
    'rhein': 'colossus', 'weser': 'colossus', 'erich loewenhardt': 'colossus', 'graf zeppelin': 'shokaku',
    'august von parseval': 'shokaku', 'manfred von richthofen': 'essex', 'max immelmann': 'essex',
    'otto lilienthal': 'essex', 'susshofen': 'essex', 'werner voss': 'essex', 'oswald boelcke': 'essex',
    'u-69': 'type-viic', 'u-190': 'type-viic', 'u-2501': 'balao', 'u-4501': 'balao',
    # USSR
    'storozhevoi': 'novik', 'derzki': 'frunze', 'izyaslav': 'novik', 'gnevny': 'type-7-destroyer',
    'gremyashchy': 'type-7-destroyer', 'okhotnik': 'type-7-destroyer', 'podvoisky': 'novik', 'ognevoi': 'project-30bis',
    'kiev': 'tashkent', 'minsk': 'leningrad', 'tashkent': 'tashkent', 'provorny': 'project-30bis',
    'neustrashimy': 'project-41', 'udaloi': 'project-41', 'delny': 'kotlin', 'grozovoi': 'project-41',
    'khabarovsk': 'project-48', 'peredovoy': 'kotlin', 'zorkiy': 'project-48',
    'orlan': 'pillau', 'diana': 'pillau', 'cr:novik': 'pillau', 'avrora': 'pillau', 'aurora': 'pillau',
    'bogatyr': 'pillau', 'oleg': 'pillau', 'varyag': 'pillau', 'svietlana': 'svetlana', 'kirov': 'kirov-1936',
    'kotovsky': 'kirov-1936', 'krasny krym': 'svetlana', 'mikoyan': 'atlanta', 'murmansk': 'omaha',
    'admiral makarov': 'leipzig', 'budyonny': 'chapayev', 'molotov': 'maxim-gorky', 'lazo': 'chapayev',
    'shchors': 'chapayev', 'bagration': 'chapayev', 'dmitry pozharsky': 'chapayev', 'kiberpankov': 'chapayev',
    'mikhail kutuzov': 'sverdlov', 'ochakov': 'chapayev', 'pyotr bagration': 'chapayev', 'tallinn': 'hipper',
    'dmitri donskoi': 'sverdlov', 'kozma minin': 'sverdlov', 'riga': 'hipper', 'vyazma': 'sverdlov',
    'alexander nevsky': 'sverdlov', 'komissar': 'sverdlov', 'moskva': 'kronshtadt', 'ptrpvlsk': 'kronshtadt',
    'petropavlovsk': 'kronshtadt', 'petrozavodsk': 'sverdlov', 'sevastopol': 'kronshtadt', 'smolensk': 'sverdlov',
    'vladimir monomakh': 'sverdlov', 'novosibirsk': 'kronshtadt',
    'knyaz suvorov': 'dreadnought', 'imperator nikolai i': 'imperatritsa-mariya', 'oktyabrskaya revolutsiya': 'gangut',
    'pyotr velikiy': 'gangut', 'novorossiysk': 'cavour-1933', 'arkhangelsk': 'royal-sovereign', 'poltava': 'izmail',
    'sinop': 'izmail', 'borodino': 'izmail', 'lenin': 'izmail', 'v. i. lenin': 'izmail', 'vladivostok': 'sovetsky-soyuz',
    'navarin': 'sovetsky-soyuz', 'respublika': 'sovetsky-soyuz', 'sovetskaya rossiya': 'sovetsky-soyuz',
    'sov. rossiya': 'sovetsky-soyuz', 'zarya svobody': 'sovetsky-soyuz', 'mahtaga': 'sovetsky-soyuz',
    'kremlin': 'sovetsky-soyuz', 'rodina': 'sovetsky-soyuz', 'sibir': 'sovetsky-soyuz', 'slava': 'sovetsky-soyuz',
    'admiral ushakov': 'sovetsky-soyuz', 'hovercraft': 'sovetsky-soyuz',
    'komsomolets': 'colossus', 'serov': 'colossus', 'chkalov': 'essex', 'pobeda': 'essex', 'admiral nakhimov': 'essex',
    'admiral orlov': 'essex',
    's-1': 'shchuka', 'l-20': 'gato', 's-189': 'tango', 'k-1': 'gato',
    # UK and Commonwealth
    'medea': 'v-class', 'campbeltown': 'clemson', 'valkyrie': 'v-class', 'wakeful': 'v-class', 'vampire': 'v-class',
    'acasta': 'g-class', 'gallant': 'g-class', 'icarus': 'g-class', 'jervis': 'j-class',
    'cossack': 'tribal', 'eskimo': 'tribal', 'haida': 'tribal', 'huron': 'tribal', 'lightning': 'j-class', 'dd:jupiter': 'j-class',
    'cayuga': 'tribal', 'barfleur': 'battle', 'jutland': 'battle', 'somme': 'battle', 'druid': 'daring',
    'vampire ii': 'daring',
    'black swan': 'egret-sloop', 'weymouth': 'pillau', 'caledon': 'arethusa', 'danae': 'arethusa',
    'caradoc': 'arethusa', 'dunedin': 'arethusa', 'delhi': 'arethusa', 'sutlej': 'egret-sloop', 'port jackson': 'pillau',
    'exeter': 'york', 'devonshire': 'kent', 'london': 'london-1941', 'cr:orion': 'leander', 'bb:orion': 'orion', 'hobart': 'leander',
    'perth': 'leander', 'mysore': 'fiji', 'gambia': 'fiji', 'uganda': 'fiji', 'river gambra': 'fiji',
    'surrey': 'london-1941', 'boinn': 'belfast', 'cheshire': 'kent', 'albemarle': 'kent', 'edinburgh': 'belfast',
    'hampshire': 'kent', 'nottingham': 'belfast', 'sinann': 'belfast', 'cr:tiger': 'tiger-1959', 'bb:tiger': 'queen-mary', 'erne': 'belfast',
    'auckland': 'fiji', 'aberdeen': 'kent', 'cursed fang': 'belfast', 'drake': 'kent', 'neptune': 'belfast',
    'encounter': 'belfast', 'hector': 'belfast', 'defence': 'belfast', 'fearmaw': 'belfast', 'gibraltar': 'kent',
    'minotaur': 'tiger-1959', 'monmouth': 'kent', 'plymouth': 'belfast', 'edgar': 'kent',
    'brisbane': 'tiger-1959', 'cerberus': 'belfast', 'pioneer': 'belfast',
    'bellerophon': 'dreadnought', 'indefatigable': 'invincible-1908', 'agincourt': 'iron-duke',
    'queen elizabeth': 'warspite', 'repulse': 'renown', 'danu': 'nelson', 'duke of york': 'king-george-v',
    'rodney': 'nelson', 'rooke': 'nelson', 'hawke': 'king-george-v', 'monarch': 'king-george-v',
    'prince of wales': 'king-george-v', 'duncan': 'lion-1938', 'lion': 'lion-1938', 'marlborough': 'lion-1938',
    'scarlet thunder': 'lion-1938', 'conqueror': 'lion-1938', 'cumberland': 'lion-1938', 'incomparable': 'hood',
    'st. vincent': 'lion-1938', 'thunderer': 'lion-1938', 'devastation': 'lion-1938', 'yukon': 'king-george-v',
    'irresistible': 'lion-1938', 'collingwood': 'nelson',
    'hermes': 'colossus', 'ark royal': 'yorktown', 'furious': 'yorktown', 'implacable': 'essex', 'indomitable': 'essex',
    'theseus': 'colossus', 'audacious': 'essex', 'malta': 'forrestal', 'ocean': 'colossus', 'eagle': 'essex',
    'undine': 'type-viic', 'alliance': 'gato', 'sturdy': 'type-viic', 'seal': 'gato', 'thrasher': 'type-viic',
    # France
    'enseigne gabolde': 'bourrasque', 'fusilier': 'bourrasque', "l'adroit": 'bourrasque', 'siroco': 'bourrasque',
    'jaguar': 'jaguar-1923', 'aigle': 'guepard', 'duchaffault': 'guepard', 'le hardi': 'bourrasque',
    'vauquelin': 'guepard', 'hoche': 'le-fantasque', "l'aventurier": 'le-fantasque', 'le terrible': 'le-fantasque',
    'orage': 'mogador', 'cassard': 'mogador', 'chateaurenault': 'mogador', 'kleber': 'mogador', 'marceau': 'mogador',
    'la galissonniere': 'la-galissoniere', 'bougainville': 'egret-sloop', 'jurien de la graviere': 'pillau', 'friant': 'pillau', 'de grasse': 'la-galissoniere',
    'dupleix': 'suffren', 'montcalm': 'la-galissoniere', 'toulon': 'algerie', 'bayard': 'algerie',
    'charles martel': 'algerie', 'cherbourg': 'la-galissoniere', 'metz': 'algerie', 'brest': 'algerie',
    'carnot': 'algerie', 'le havre': 'algerie', 'saint-louis': 'algerie', 'amiral lartigue': 'algerie',
    'brennus': 'kronshtadt', 'colbert': 'algerie', 'henri iv': 'algerie', 'latouche-treville': 'algerie',
    'marseille': 'kronshtadt', 'conde': 'algerie', "utnapishtim's ship": 'algerie',
    'turenne': 'courbet', 'normandie': 'bretagne', 'lyon': 'bretagne', 'strasbourg': 'dunkerque',
    'champagne': 'richelieu', 'flandre': 'richelieu', 'gascogne': 'richelieu', 'picardie': 'richelieu',
    'alsace': 'richelieu', 'dark corsair': 'richelieu', 'jean bart': 'richelieu', 'roussillon': 'richelieu',
    'bourgogne': 'richelieu', 'republique': 'richelieu', 'patrie': 'richelieu',
    'bearn': 'colossus', 'surcouf': 'gato',
    # Italy
    'curtatone': 'turbine', 'nazario sauro': 'turbine', 'aviere': 'soldati', 'fr25': 'leone',
    'luca tarigo': 'navigatori', 'vittorio cuniberti': 'medaglie-d-oro', 'adriatico': 'impetuoso',
    'paolo emilio': 'capitani-romani', 'alberico da barbiano': 'impetuoso', 'attilio regolo': 'capitani-romani',
    'eritrea': 'egret-sloop', 'nino bixio': 'pillau', 'taranto': 'pillau', 'alberto di giussano': 'giussano',
    'genova': 'montecuccoli', 'raimondo montecuccoli': 'montecuccoli', "duca d'aosta": 'montecuccoli',
    'duca degli abruzzi': 'abruzzi', 'fiume': 'zara', 'gorizia': 'zara', 'francesco ferruccio': 'abruzzi',
    'optio': 'zara', 'amalfi': 'zara', 'mirage': 'zara', 'brindisi': 'zara', 'ferrante gonzaga': 'zara',
    'la spezia': 'zara', 'messina': 'zara', 'michelangelo': 'zara', 'napoli': 'kronshtadt', 'ravenna': 'zara',
    'varese': 'zara', 'venezia': 'zara', 'piemonte': 'zara',
    'conte di cavour': 'cavour-1915', 'giulio cesare': 'cavour-1933', 'andrea doria': 'doria-1940',
    'francesco caracciolo': 'caracciolo', 'marcantonio colonna': 'littorio', 'roma': 'littorio', 'roma aeterna': 'littorio',
    'vittorio veneto': 'littorio', 'binah': 'littorio', 'giuseppe verdi': 'littorio', 'lepanto': 'littorio',
    'marco polo': 'littorio', 'pilus posterior': 'littorio', 'pilus prior': 'littorio', 'amerigo vespucci': 'littorio',
    'conte verde': 'littorio', 'cristoforo colombo': 'littorio', 'ruggiero di lauria': 'littorio', 'sicilia': 'littorio',
    'tempesta nera': 'littorio', 'affondatore': 'littorio',
    'aquila': 'essex', 'foca': 'type-viic', 'pietro micca': 'type-viic', 'pietro calvi': 'gato',
    # Pan-Asia (ships of other navies' classes)
    'longjiang': 'momi', 'phra ruang': 'v-class', 'shenyang': 'type-7-destroyer', 'jianwei': 'type-7-destroyer',
    'anshan': 'type-7-destroyer', 'fushun': 'type-7-destroyer', 'gadjah mada': 'j-class', 'loyang': 'gleaves',
    'hsienyang': 'sumner', 'fenyang': 'fletcher', 'datong': 'akizuki', 'siliwangi': 'project-30bis',
    'zhu que': 'fletcher', 'ship smasha': 'fletcher', 'chung mu': 'fletcher', 'nanning': 'kotlin',
    'red hare': 'fletcher', 'lushun': 'kotlin', 'yueyang': 'gearing', 'kunming': 'gearing',
    'chengan': 'pillau', 'ning hai': 'yubari', 'chungking': 'arethusa', 'huanghe': 'emerald', 'rahmat': 'emerald',
    'chumphon': 'brooklyn', 'lanzhou': 'cleveland', 'harbin': 'baltimore', 'irian': 'sverdlov', 'narai': 'leander',
    'pinatian': 'sverdlov', 'wukong': 'baltimore', 'baotou': 'baltimore', 'chao heng': 'cleveland', 'dalian': 'baltimore',
    'mengchong': 'cleveland', 'sejong': 'baltimore', 'tianjin': 'baltimore', 'incheon': 'des-moines',
    'jinan': 'des-moines', 'taejong': 'des-moines', 'zhuge liang': 'des-moines',
    'teng she': 'kongo', 'bajie': 'yamato', 'wujing': 'richelieu', 'sun yat-sen': 'iowa', 'louchuan': 'iowa',
    'xuan wu': 'iowa', 'taihang': 'iowa', 'jiuhua': 'iowa', 'yimeng': 'iowa', 'xuan ming': 'iowa','sanzang': 'essex', 'xin zhong guo 14': 'gato',
    # Europe
    'tatra': 'momi', 'romulus': 'turbine', 'klas horn': 'v-class', 'kalmar': 'g-class', 'muavenet': 'g-class',
    'visby': 'g-class', 'stord': 's-class', 'vasteras': 'g-class', 'blyskawica': 'tribal', 'grom': 'tribal',
    'scarlet storm': 'tribal', 'skane': 'j-class', 'orkan': 's-class', 'split': 'tribal', 'oland': 'j-class',
    'friesland': 'battle', 'jager': 'battle', 'lambros katsonis': 'fletcher', 'velos': 'fletcher',
    'ostergotland': 'j-class', 'gdansk': 'battle', 'halland': 'battle', 'ovasen': 'battle', 'ragnar': 'battle',
    'smaland': 'battle', 'sodermanland': 'battle', 'dalarna': 'battle', 'orzel': 'type-viic',
    'gryf': 'egret-sloop', 'dragon': 'emerald', 'kralj petar i': 'emerald', 'elli': 'emerald', 'tre kronor': 'fiji',
    'hel': 'fiji', 'kriti': 'kent', 'regele carol i': 'kent', 'tirfing': 'kent', 'svea': 'kent', 'vanadis': 'kent',
    'yavuz sultan selim': 'von-der-tann', 'tegetthoff': 'kaiser', 'viribus unitis': 'kaiser', 'laudon': 'bayern',
    'chios': 'scharnhorst', 'lugdunum': 'scharnhorst', 'enigheten': 'king-george-v', 'turgut reis': 'king-george-v',
    'gustav den store': 'king-george-v', 'karl xiv johan': 'king-george-v', 'niord': 'king-george-v', 'thor': 'lion-1938',
    # Netherlands
    'philips van almonde': 'j-class', 'groningen': 'battle', 'tromp': 'battle', 'tonijn': 'gato',
    'van kinsbergen': 'egret-sloop', 'gelderland': 'pillau', 'java': 'emerald', 'de ruyter': 'emile-bertin',
    'celebes': 'leipzig', 'kijkduin': 'leipzig', 'eendracht': 'hipper', 'admiraal': 'hipper', 'de zeven provincien': 'hipper',
    'haarlem': 'hipper', 'jaarsveld': 'hipper', 'statenland': 'hipper', 'vrijheid': 'hipper', 'johan de witt': 'hipper',
    'menno van coehoorn': 'hipper', 'van speijk': 'hipper', 'gouden leeuw': 'kronshtadt', 'prins van oranje': 'kronshtadt',
    'unie': 'kronshtadt', 'utrecht': 'kronshtadt',
    'grote geus': 'bayern', 'graaf van egmont': 'scharnhorst', 'prins maurits': 'king-george-v', 'eenhoorn': 'iowa',
    'neptunus': 'iowa', 'willem de eerste': 'iowa',
    # Pan-America
    'almirante villar': 'novik', 'serrano': 'v-class', 'antioquia': 'g-class', 'cervantes': 'clemson',
    'jurua': 'j-class', 'marcilio dias': 'mahan', 'cuauhtemoc': 'fletcher', 'nueva esparta': 'battle',
    '20 de julio': 'gearing', 'la pampa': 'gearing',
    'hercules': 'pillau', 'almirante abreu': 'pillau', 'almirante barroso': 'pillau', 'vicente guerrero': 'pillau',
    'cordoba': 'arethusa', 'la argentina': 'arethusa', 'almirante cochrane': 'leander', 'coronel bolognesi': 'emerald',
    'nueve de julio': 'brooklyn', 'almirante grau': 'fiji', 'comandante aguirre': 'brooklyn', 'ignacio allende': 'baltimore',
    'santander': 'baltimore', 'almirante irizar': 'des-moines', 'san martin': 'des-moines',
    'rio de janeiro': 'iron-duke', 'atlantico': 'south-dakota', 'ipiranga': 'south-dakota', 'los andes': 'iowa',
    'valparaiso': 'iowa', 'almirante perez gacitua': 'iowa', 'comodoro': 'iowa', 'libertad': 'iowa',
    'sete de setembro': 'iowa', 'independencia': 'essex',
    # Spain
    'halcon': 'battle', 'alvaro de bazan': 'gearing', 'cr:jupiter': 'pillau', 'mendez nunez': 'pillau',
    'navarra': 'emerald', 'almirante cervera': 'emerald', 'galicia': 'emerald', 'baleares': 'kent', 'canarias': 'kent',
    'asturias': 'hipper', 'cataluna': 'hipper', 'numancia': 'hipper', 'almirante oquendo': 'hipper',
    'andalucia': 'hipper', 'aragon': 'hipper', 'castilla': 'hipper', 'triunfante': 'littorio', 'victoria': 'littorio',
}

# Kind and tier -> figure, for a ship neither named nor in the table above: a class of the same kind and its size.
TIERS = {
    'dd': ['v-class', 'v-class', 'v-class', 'clemson', 'farragut', 'mahan', 'j-class', 'fletcher', 'fletcher', 'gearing', 'gearing'],
    'cr': ['pillau', 'pillau', 'arethusa', 'emerald', 'omaha', 'leander', 'fiji', 'hipper', 'baltimore', 'des-moines', 'des-moines'],
    'bb': ['dreadnought', 'dreadnought', 'dreadnought', 'iron-duke', 'new-york', 'nevada', 'nelson', 'king-george-v', 'iowa', 'iowa', 'iowa'],
    'cv': ['colossus', 'colossus', 'colossus', 'colossus', 'colossus', 'colossus', 'yorktown', 'yorktown', 'essex', 'essex', 'essex'],
    'ss': ['type-viic'] * 6 + ['gato'] * 5,
}

VARIANT = re.compile(r"^(?:al|arp|hsf|ba|star)\s+|\s+\(<[^)]*\)$|\s+(?:b|golden|clr|te|vl|st|lima|beta|alpha|r|2|3)$|\s+'\d\d$")


def plain(s: str) -> str:
    for a, b in (('\xa0', ' '), ('ł', 'l'), ('Ł', 'L'), ('\xf8', 'o'), ('\xdf', 'ss'), ('\xe6', 'ae')):
        s = s.replace(a, b)
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    return re.sub(r'\s+', ' ', s).strip().lower()


def base(en: str) -> str:
    s = plain(en).strip('[]')
    while True:
        t = VARIANT.sub('', s).strip()
        if t == s:
            return s
        s = t


def norm(s: str) -> str:
    return re.sub(r'[^a-z0-9]+', '', s.lower())


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--vortex', required=True)
    ap.add_argument('--figures', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--report')
    a = ap.parse_args()
    if a.vortex.startswith('https://'):
        with urllib.request.urlopen(urllib.request.Request(a.vortex, headers={'User-Agent': 'Mozilla/5.0'}), timeout=120) as r:
            data = json.load(r)['data']
    else:
        data = json.loads(Path(a.vortex).read_text(encoding='utf-8'))['data']
    figs = dict(line.split('\t')[:2] for line in Path(a.figures).read_text(encoding='utf-8').splitlines() if '\t' in line)
    by_norm = {norm(n): n for n in figs}
    for v in CLASS.values():
        if v not in figs:
            raise SystemExit(f'class table names a figure the catalogue lacks: {v}')
    rows, report = [], []
    for sid, v in sorted(data.items(), key=lambda kv: (kv[1]['nation'], kv[1]['name'])):
        kind = next((KINDS[t] for t in v['tags'] if t in KINDS), None)
        if not kind:
            continue
        en = v['localization']['mark'].get('en') or v['name']
        b = base(en)
        bare = base(re.sub(r'^[A-Z]{4}\d{3}_', '', v['name']).replace('_', ' '))
        how, fig = 'class', next((CLASS[k] for k in (f'{kind}:{b}', b, f'{kind}:{bare}', bare) if k in CLASS), None)
        if not fig:
            how = 'name'
            for n in (b, bare):
                f = by_norm.get(norm(n))
                if f and figs[f] in FITS[kind]:
                    fig = f
                    break
        if not fig:
            how, fig = 'tier', TIERS[kind][min(max(v['level'], 1), 11) - 1]
        rows.append((sid, v['name'], fig))
        report.append(f"{v['nation']}\t{kind}\t{v['level']}\t{en}\t{v['name']}\t{how}\t{fig}")
    lines = [
        '/**',
        " * World of Warships ships by the game's ship number (how the converter writes every ship but the",
        " * recording player's) and by index name (the recording player's own, \"PASB018-Iowa-1944\"): each mapped",
        " * to the figure of its class, else of the nearest real class of its kind and size (fictional and paper ships).",
        ' * Numbers and names from the game\'s public encyclopedia; generated by tools/figures/wows_ships.py - edit the',
        ' * tables there and regenerate rather than editing this file.',
        ' */',
        '',
        "import type { SpecSet } from './index';",
        '',
        '// [ship number, index name, figure]',
        'const SHIPS: [string, string, string][] = [',
    ]
    lines += [f"  ['{sid}', '{name.lower()}', '{fig}']," for sid, name, fig in rows]
    lines += [
        '];',
        '',
        'export const WOWS_ALIASES: SpecSet = { aliases: Object.fromEntries(SHIPS.flatMap(([id, name, fig]) => [[id, fig], [name, fig]])) };',
        '',
    ]
    Path(a.out).write_text('\n'.join(lines), encoding='utf-8', newline='\n')
    if a.report:
        Path(a.report).write_text('\n'.join(report) + '\n', encoding='utf-8')
    print(len(rows), 'ships;', sum(1 for r in report if r.split('\t')[5] == 'tier'), 'by tier')


if __name__ == '__main__':
    main()
