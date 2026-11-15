/**
 * The bibliography. Every knowledge entry cites ids from here. `pd` marks a
 * public-domain work (published before 1929, or a US government work): only
 * those may be quoted, and only briefly. URLs point at a public copy or the
 * publisher's record where one is known.
 */

import type { Reference } from './types';

const r = (id: string, authors: string, year: number, title: string, publisher: string, extra: Partial<Reference> = {}): Reference => ({ id, authors, year, title, publisher, ...extra });

export const REFERENCES: Reference[] = [
  // Classics of military thought
  r('suntzu-giles', 'Sun Tzu (trans. Giles, L.)', 1910, 'The Art of War', 'Luzac & Co., London', { pd: true, url: 'https://www.gutenberg.org/ebooks/132' }),
  r('clausewitz-graham', 'Clausewitz, C. von (trans. Graham, J. J.)', 1873, 'On War', 'N. Trübner, London', { pd: true, url: 'https://www.gutenberg.org/ebooks/1946' }),
  r('jomini-1862', 'Jomini, A.-H. de (trans. Mendell, G. H.; Craighill, W. P.)', 1862, 'The Art of War', 'J. B. Lippincott, Philadelphia', { pd: true, url: 'https://www.gutenberg.org/ebooks/13549' }),
  r('vegetius-clarke', 'Vegetius (trans. Clarke, J.)', 1767, 'De Re Militari (The Military Institutions of the Romans)', 'W. Griffin, London', { pd: true }),
  r('dupicq-1921', 'Ardant du Picq, C. (trans. Greely, J. N.; Cotton, R. C.)', 1921, 'Battle Studies: Ancient and Modern Battle', 'Macmillan, New York', { pd: true, url: 'https://www.gutenberg.org/ebooks/7294' }),
  r('mahan-1890', 'Mahan, A. T.', 1890, 'The Influence of Sea Power upon History, 1660-1783', 'Little, Brown, Boston', { pd: true, url: 'https://www.gutenberg.org/ebooks/13529' }),
  r('corbett-1911', 'Corbett, J. S.', 1911, 'Some Principles of Maritime Strategy', 'Longmans, Green, London', { pd: true, url: 'https://www.gutenberg.org/ebooks/15076' }),
  r('fuller-1926', 'Fuller, J. F. C.', 1926, 'The Foundations of the Science of War', 'Hutchinson, London'),
  r('liddellhart-1954', 'Liddell Hart, B. H.', 1954, 'Strategy: The Indirect Approach', 'Faber & Faber, London'),
  r('douhet-1921', 'Douhet, G. (trans. Ferrari, D.)', 1942, 'The Command of the Air (orig. 1921)', 'Coward-McCann, New York; reprinted Office of Air Force History 1983'),
  r('rommel-1937', 'Rommel, E.', 1937, 'Infanterie greift an (Infantry Attacks)', 'Voggenreiter, Potsdam'),
  r('boyd-1986', 'Boyd, J. R.', 1986, 'Patterns of Conflict (briefing)', 'Unpublished briefing; archived by the Marine Corps University, Quantico', { url: 'https://www.usmcu.edu/Research/Marine-Corps-History-Division/' }),
  r('osinga-2007', 'Osinga, F. P. B.', 2007, 'Science, Strategy and War: The Strategic Theory of John Boyd', 'Routledge, Abingdon'),
  r('mcdp1-1997', 'US Marine Corps', 1997, 'MCDP 1 Warfighting', 'Headquarters USMC, Washington DC', { pd: true }),
  // Doctrine (US government, public domain)
  r('fm3-0-2022', 'Headquarters, Department of the Army', 2022, 'FM 3-0 Operations', 'US Army, Washington DC', { pd: true, url: 'https://armypubs.army.mil' }),
  r('fm3-90-2023', 'Headquarters, Department of the Army', 2023, 'FM 3-90 Tactics', 'US Army, Washington DC', { pd: true, url: 'https://armypubs.army.mil' }),
  r('fm3-90-1-2013', 'Headquarters, Department of the Army', 2013, 'FM 3-90-1 Offense and Defense, Volume 1', 'US Army, Washington DC', { pd: true }),
  r('atp2-01.3-2019', 'Headquarters, Department of the Army', 2019, 'ATP 2-01.3 Intelligence Preparation of the Battlefield', 'US Army, Washington DC', { pd: true, url: 'https://armypubs.army.mil' }),
  r('fm34-130-1994', 'Headquarters, Department of the Army', 1994, 'FM 34-130 Intelligence Preparation of the Battlefield', 'US Army, Washington DC', { pd: true }),
  r('fm5-33-1990', 'Headquarters, Department of the Army', 1990, 'FM 5-33 Terrain Analysis', 'US Army, Washington DC', { pd: true }),
  r('fm3-21.8-2007', 'Headquarters, Department of the Army', 2007, 'FM 3-21.8 The Infantry Rifle Platoon and Squad', 'US Army, Washington DC', { pd: true }),
  r('fm3-20.15-2007', 'Headquarters, Department of the Army', 2007, 'FM 3-20.15 Tank Platoon', 'US Army, Washington DC', { pd: true }),
  r('fm3-06-2022', 'Headquarters, Department of the Army', 2022, 'FM 3-06 Urban Operations', 'US Army, Washington DC', { pd: true }),
  r('fm90-10-1979', 'Headquarters, Department of the Army', 1979, 'FM 90-10 Military Operations on Urbanized Terrain (MOUT)', 'US Army, Washington DC', { pd: true }),
  r('fm100-5-1982', 'Headquarters, Department of the Army', 1982, 'FM 100-5 Operations', 'US Army, Washington DC', { pd: true }),
  r('jp3-01-2017', 'Joint Chiefs of Staff', 2017, 'JP 3-01 Countering Air and Missile Threats', 'US Joint Staff, Washington DC', { pd: true }),
  r('afdp3-01', 'US Air Force', 2019, 'AFDP 3-01 Counterair Operations', 'LeMay Center for Doctrine, Maxwell AFB', { pd: true }),
  // Operations research and combat modelling
  r('lanchester-1916', 'Lanchester, F. W.', 1916, 'Aircraft in Warfare: The Dawn of the Fourth Arm', 'Constable, London', { pd: true, url: 'https://archive.org/details/aircraftinwarfar00lancrich' }),
  r('osipov-1915', 'Osipov, M. (trans. Helmbold, R. L.; Rehm, A. S.)', 1995, 'The influence of the numerical strength of engaged forces on their casualties (orig. 1915)', 'Naval Research Logistics 42(3): 435-490'),
  r('engel-1954', 'Engel, J. H.', 1954, 'A verification of Lanchester\'s law', 'Journal of the Operations Research Society of America 2(2): 163-171'),
  r('bracken-1995', 'Bracken, J.', 1995, 'Lanchester models of the Ardennes campaign', 'Naval Research Logistics 42(4): 559-577'),
  r('hartley-helmbold-1995', 'Hartley, D. S.; Helmbold, R. L.', 1995, 'Validating Lanchester\'s square law and other attrition models', 'Naval Research Logistics 42(4): 609-633'),
  r('fricker-1998', 'Fricker, R. D.', 1998, 'Attrition models of the Ardennes campaign', 'Naval Research Logistics 45(1): 1-22', { url: 'https://www.rand.org/pubs/external_publications/EP19980204.html' }),
  r('lucas-turkes-2004', 'Lucas, T. W.; Turkes, T.', 2004, 'Fitting Lanchester equations to the battles of Kursk and Ardennes', 'Naval Research Logistics 51(1): 95-116', { doi: '10.1002/nav.10101' }),
  r('taylor-1983', 'Taylor, J. G.', 1983, 'Lanchester Models of Warfare (2 vols.)', 'Operations Research Society of America, Military Applications Section, Arlington VA'),
  r('washburn-kress-2009', 'Washburn, A.; Kress, M.', 2009, 'Combat Modeling', 'Springer, New York'),
  r('morse-kimball-1951', 'Morse, P. M.; Kimball, G. E.', 1951, 'Methods of Operations Research', 'MIT Press / Wiley, New York (first issued as OEG Report 54, 1946)', { pd: true }),
  r('koopman-1946', 'Koopman, B. O.', 1946, 'Search and Screening (OEG Report 56)', 'Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC', { pd: true }),
  r('blackett-1962', 'Blackett, P. M. S.', 1962, 'Studies of War: Nuclear and Conventional', 'Oliver & Boyd, Edinburgh'),
  r('dupuy-1979', 'Dupuy, T. N.', 1979, 'Numbers, Predictions and War', 'Bobbs-Merrill, Indianapolis'),
  r('dupuy-1987', 'Dupuy, T. N.', 1987, 'Understanding War: History and Theory of Combat', 'Paragon House, New York'),
  r('biddle-2004', 'Biddle, S.', 2004, 'Military Power: Explaining Victory and Defeat in Modern Battle', 'Princeton University Press, Princeton'),
  r('hughes-1995', 'Hughes, W. P.', 1995, 'A salvo model of warfare between missile-armed ships', 'Naval Research Logistics 42(2): 267-289'),
  r('hughes-2000', 'Hughes, W. P.', 2000, 'Fleet Tactics and Coastal Combat (2nd ed.)', 'Naval Institute Press, Annapolis'),
  r('perla-1990', 'Perla, P. P.', 1990, 'The Art of Wargaming', 'Naval Institute Press, Annapolis'),
  r('perla-mcgrady-2011', 'Perla, P. P.; McGrady, E. D.', 2011, 'Why wargaming works', 'Naval War College Review 64(3): 111-130'),
  r('kress-2012', 'Kress, M.', 2012, 'Modeling armed conflicts', 'Science 336(6083): 865-869'),
  r('mearsheimer-1989', 'Mearsheimer, J. J.', 1989, 'Assessing the conventional balance: the 3:1 rule and its critics', 'International Security 13(4)'),
  r('epstein-1989', 'Epstein, J. M.', 1989, 'The 3:1 rule, the adaptive dynamic model, and the future of security studies', 'International Security 13(4)'),
  // Air combat
  r('boyd-em-1966', 'Boyd, J. R.; Christie, T. P.; Gibson, J. E.', 1966, 'Energy-Maneuverability (APGC-TR-66-4)', 'Air Proving Ground Center, Eglin AFB'),
  r('shaw-1985', 'Shaw, R. L.', 1985, 'Fighter Combat: Tactics and Maneuvering', 'Naval Institute Press, Annapolis'),
  r('red-baron-1974', 'USAF Tactical Fighter Weapons Center', 1974, 'Project Red Baron III: Air-to-Air Encounters in Southeast Asia', 'Nellis AFB', { pd: true }),
  r('gwaps-1993', 'Keaney, T. A.; Cohen, E. A.', 1993, 'Gulf War Air Power Survey: Summary Report', 'US Government Printing Office, Washington DC', { pd: true }),
  r('hallion-1992', 'Hallion, R. P.', 1992, 'Storm over Iraq: Air Power and the Gulf War', 'Smithsonian Institution Press, Washington DC'),
  r('lambeth-1984', 'Lambeth, B. S.', 1984, "Moscow's Lessons from the 1982 Lebanon Air War", 'RAND Corporation, Santa Monica'),
  r('werrell-2005', 'Werrell, K. P.', 2005, 'Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea', 'Naval Institute Press, Annapolis'),
  r('michel-1997', 'Michel, M. L.', 1997, 'Clashes: Air Combat over North Vietnam 1965-1972', 'Naval Institute Press, Annapolis'),
  r('overy-2000', 'Overy, R.', 2000, 'The Battle of Britain: The Myth and the Reality', 'Penguin, London'),
  r('bungay-2000', 'Bungay, S.', 2000, 'The Most Dangerous Enemy: A History of the Battle of Britain', 'Aurum Press, London'),
  r('lambeth-2001', 'Lambeth, B. S.', 2001, 'NATO\'s Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF)', 'RAND Corporation, Santa Monica', { url: 'https://www.rand.org/pubs/monograph_reports/MR1365.html' }),
  r('ethell-price-1983', 'Ethell, J.; Price, A.', 1983, 'Air War South Atlantic', 'Sidgwick & Jackson, London'),
  // Land and urban history
  r('glantz-house-1995', 'Glantz, D. M.; House, J. M.', 1995, 'When Titans Clashed: How the Red Army Stopped Hitler', 'University Press of Kansas, Lawrence'),
  r('zetterling-frankson-2000', 'Zetterling, N.; Frankson, A.', 2000, 'Kursk 1943: A Statistical Analysis', 'Frank Cass, London'),
  r('glantz-house-1999', 'Glantz, D. M.; House, J. M.', 1999, 'The Battle of Kursk', 'University Press of Kansas, Lawrence'),
  r('krause-1991', 'Krause, M. D.', 1991, 'The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation', 'US Army Center of Military History / DARPA, Washington DC', { pd: true }),
  r('bourque-2002', 'Bourque, S. A.', 2002, 'Jayhawk! The VII Corps in the Persian Gulf War', 'Center of Military History, US Army, Washington DC', { pd: true }),
  r('heinl-1968', 'Heinl, R. D.', 1968, 'Victory at High Tide: The Inchon-Seoul Campaign', 'Lippincott, Philadelphia'),
  r('frieser-2005', 'Frieser, K.-H.', 2005, 'The Blitzkrieg Legend: The 1940 Campaign in the West', 'Naval Institute Press, Annapolis'),
  r('forty-2004', 'Forty, G.', 2004, 'Villers Bocage (Battle Zone Normandy)', 'Sutton, Stroud'),
  r('herzog-1975', 'Herzog, C.', 1975, 'The War of Atonement', 'Weidenfeld & Nicolson, London'),
  r('rabinovich-2004', 'Rabinovich, A.', 2004, 'The Yom Kippur War: The Epic Encounter That Transformed the Middle East', 'Schocken, New York'),
  r('kahalani-1984', 'Kahalani, A.', 1984, 'The Heights of Courage: A Tank Leader\'s War on the Golan', 'Greenwood Press, Westport'),
  r('beevor-1998', 'Beevor, A.', 1998, 'Stalingrad', 'Viking, London'),
  r('nolan-1983', 'Nolan, K. W.', 1983, 'Battle for Hue: Tet, 1968', 'Presidio Press, Novato'),
  r('matthews-2006', 'Matthews, M. M.', 2006, 'Operation AL FAJR: A Study in Army and Marine Corps Joint Operations', 'Combat Studies Institute Press, Fort Leavenworth', { pd: true }),
  r('grau-1997', 'Grau, L. W.', 1997, 'Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience', 'Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth', { pd: true }),
  r('bowden-1999', 'Bowden, M.', 1999, 'Black Hawk Down: A Story of Modern War', 'Atlantic Monthly Press, New York'),
  r('arnold-fiore-2019', 'Arnold, T. D.; Fiore, N.', 2019, 'Five operational lessons from the Battle for Mosul', 'Military Review (January-February 2019), Army University Press', { pd: true }),
  r('doubler-1994', 'Doubler, M. D.', 1994, 'Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945', 'University Press of Kansas, Lawrence'),
  r('cole-1965', 'Cole, H. M.', 1965, 'The Ardennes: Battle of the Bulge (US Army in World War II)', 'Office of the Chief of Military History, Washington DC', { pd: true }),
  r('blumenson-1961', 'Blumenson, M.', 1961, 'Breakout and Pursuit (US Army in World War II)', 'Office of the Chief of Military History, Washington DC', { pd: true }),
  r('showalter-1991', 'Showalter, D. E.', 1991, 'Tannenberg: Clash of Empires', 'Archon Books, Hamden'),
  r('middlebrook-1971', 'Middlebrook, M.', 1971, 'The First Day on the Somme', 'Allen Lane, London'),
  r('horne-1962', 'Horne, A.', 1962, 'The Price of Glory: Verdun 1916', 'Macmillan, London'),
  r('trotter-1991', 'Trotter, W. R.', 1991, 'A Frozen Hell: The Russo-Finnish Winter War of 1939-1940', 'Algonquin Books, Chapel Hill'),
  r('fall-1966', 'Fall, B. B.', 1966, 'Hell in a Very Small Place: The Siege of Dien Bien Phu', 'Lippincott, Philadelphia'),
  r('moore-galloway-1992', 'Moore, H. G.; Galloway, J. L.', 1992, 'We Were Soldiers Once... and Young', 'Random House, New York'),
  r('barr-2004', 'Barr, N.', 2004, 'Pendulum of War: The Three Battles of El Alamein', 'Jonathan Cape, London'),
  r('blumenson-1967', 'Blumenson, M.', 1967, 'Kasserine Pass', 'Houghton Mifflin, Boston'),
  r('coddington-1968', 'Coddington, E. B.', 1968, 'The Gettysburg Campaign: A Study in Command', 'Scribner, New York'),
  r('ofr-21', 'US War Department', 1888, 'The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I vol. 21 (Fredericksburg)', 'Government Printing Office, Washington DC', { pd: true }),
  r('chandler-1966', 'Chandler, D. G.', 1966, 'The Campaigns of Napoleon', 'Macmillan, New York'),
  r('siborne-1844', 'Siborne, W.', 1844, 'History of the War in France and Belgium in 1815', 'T. & W. Boone, London', { pd: true }),
  r('showalter-1996', 'Showalter, D. E.', 1996, 'The Wars of Frederick the Great', 'Longman, London'),
  r('knight-2002', 'Knight, I.', 2002, 'Isandlwana 1879: The Great Zulu Victory', 'Osprey, Oxford'),
  r('curry-2005', 'Curry, A.', 2005, 'Agincourt: A New History', 'Tempus, Stroud'),
  r('herodotus-rawlinson', 'Herodotus (trans. Rawlinson, G.)', 1858, 'The History of Herodotus', 'John Murray, London', { pd: true, url: 'https://www.gutenberg.org/ebooks/2707' }),
  r('polybius-shuckburgh', 'Polybius (trans. Shuckburgh, E. S.)', 1889, 'The Histories of Polybius', 'Macmillan, London', { pd: true }),
  r('arrian-chinnock', 'Arrian (trans. Chinnock, E. J.)', 1893, 'The Anabasis of Alexander', 'Hodder & Stoughton, London', { pd: true, url: 'https://www.gutenberg.org/ebooks/46976' }),
  r('xenophon-dakyns', 'Xenophon (trans. Dakyns, H. G.)', 1897, 'Hellenica', 'Macmillan, London', { pd: true, url: 'https://www.gutenberg.org/ebooks/1174' }),
  r('tacitus-church', 'Tacitus (trans. Church, A. J.; Brodribb, W. J.)', 1876, 'The Annals', 'Macmillan, London', { pd: true }),
  r('goldsworthy-2001', 'Goldsworthy, A.', 2001, 'Cannae', 'Cassell, London'),
  r('morillo-1996', 'Morillo, S. (ed.)', 1996, 'The Battle of Hastings: Sources and Interpretations', 'Boydell Press, Woodbridge'),
  r('barrow-1965', 'Barrow, G. W. S.', 1965, 'Robert Bruce and the Community of the Realm of Scotland', 'Eyre & Spottiswoode, London'),
  // Naval history
  r('parshall-tully-2005', 'Parshall, J. B.; Tully, A. P.', 2005, 'Shattered Sword: The Untold Story of the Battle of Midway', 'Potomac Books, Washington DC'),
  r('morison-1958', 'Morison, S. E.', 1958, 'Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, vol. 12)', 'Little, Brown, Boston'),
  r('cutler-1994', 'Cutler, T. J.', 1994, 'The Battle of Leyte Gulf, 23-26 October 1944', 'HarperCollins, New York'),
  r('gordon-1996', 'Gordon, A.', 1996, 'The Rules of the Game: Jutland and British Naval Command', 'John Murray, London'),
  r('campbell-1986', 'Campbell, N. J. M.', 1986, 'Jutland: An Analysis of the Fighting', 'Conway Maritime Press, London'),
  r('corbett-1919', 'Corbett, J. S.', 1919, 'Naval Operations vol. 3 (History of the Great War)', 'Longmans, Green, London', { pd: true }),
  r('corbett-1910', 'Corbett, J. S.', 1910, 'The Campaign of Trafalgar', 'Longmans, Green, London', { pd: true }),
  r('evans-peattie-1997', 'Evans, D. C.; Peattie, M. R.', 1997, 'Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941', 'Naval Institute Press, Annapolis'),
  r('strauss-2004', 'Strauss, B.', 2004, 'The Battle of Salamis', 'Simon & Schuster, New York'),
  r('woodward-1992', 'Woodward, S.; Robinson, P.', 1992, 'One Hundred Days: The Memoirs of the Falklands Battle Group Commander', 'HarperCollins, London'),
  // Game design and level design
  r('salen-zimmerman-2003', 'Salen, K.; Zimmerman, E.', 2003, 'Rules of Play: Game Design Fundamentals', 'MIT Press, Cambridge MA'),
  r('schell-2008', 'Schell, J.', 2008, 'The Art of Game Design: A Book of Lenses', 'Morgan Kaufmann, Burlington'),
  r('adams-dormans-2012', 'Adams, E.; Dormans, J.', 2012, 'Game Mechanics: Advanced Game Design', 'New Riders, Berkeley'),
  r('koster-2004', 'Koster, R.', 2004, 'A Theory of Fun for Game Design', 'Paraglyph Press, Scottsdale'),
  r('totten-2019', 'Totten, C. W.', 2019, 'An Architectural Approach to Level Design (2nd ed.)', 'CRC Press, Boca Raton'),
  r('hullett-whitehead-2010', 'Hullett, K.; Whitehead, J.', 2010, 'Design patterns in FPS levels', 'Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85'),
  r('guttler-johansson-2003', 'Güttler, C.; Johansson, T. D.', 2003, 'Spatial principles of level-design in multi-player first-person shooters', 'Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170'),
  r('kremers-2009', 'Kremers, R.', 2009, 'Level Design: Concept, Theory, and Practice', 'A K Peters, Wellesley'),
  r('bjork-holopainen-2005', 'Björk, S.; Holopainen, J.', 2005, 'Patterns in Game Design', 'Charles River Media, Hingham'),
  r('lynch-1960', 'Lynch, K.', 1960, 'The Image of the City', 'MIT Press, Cambridge MA'),
  r('alexander-1977', 'Alexander, C.; Ishikawa, S.; Silverstein, M.', 1977, 'A Pattern Language', 'Oxford University Press, New York'),
  r('elias-2012', 'Elias, G. S.; Garfield, R.; Gutschera, K. R.', 2012, 'Characteristics of Games', 'MIT Press, Cambridge MA'),
  r('sirlin-2006', 'Sirlin, D.', 2006, 'Playing to Win: Becoming the Champion', 'Lulu.com'),
  r('csikszentmihalyi-1990', 'Csikszentmihalyi, M.', 1990, 'Flow: The Psychology of Optimal Experience', 'Harper & Row, New York'),
  r('fullerton-2008', 'Fullerton, T.', 2008, 'Game Design Workshop (2nd ed.)', 'Morgan Kaufmann, Burlington'),
  r('juul-2005', 'Juul, J.', 2005, 'Half-Real: Video Games between Real Rules and Fictional Worlds', 'MIT Press, Cambridge MA'),
  // Ratings and matchmaking
  r('elo-1978', 'Elo, A. E.', 1978, 'The Rating of Chessplayers, Past and Present', 'Arco, New York'),
  r('bradley-terry-1952', 'Bradley, R. A.; Terry, M. E.', 1952, 'Rank analysis of incomplete block designs: I. The method of paired comparisons', 'Biometrika 39(3/4): 324-345'),
  r('glickman-1999', 'Glickman, M. E.', 1999, 'Parameter estimation in large dynamic paired comparison experiments', 'Journal of the Royal Statistical Society C 48(3): 377-394'),
  r('herbrich-2007', 'Herbrich, R.; Minka, T.; Graepel, T.', 2007, 'TrueSkill: a Bayesian skill rating system', 'Advances in Neural Information Processing Systems 19, MIT Press: 569-576'),
  r('minka-2018', 'Minka, T.; Cleven, R.; Zaykov, Y.', 2018, 'TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8)', 'Microsoft Research, Redmond'),
  // Game analytics and telemetry
  r('seifelnasr-2013', 'Seif El-Nasr, M.; Drachen, A.; Canossa, A. (eds.)', 2013, 'Game Analytics: Maximizing the Value of Player Data', 'Springer, London'),
  r('drachen-canossa-2009', 'Drachen, A.; Canossa, A.', 2009, 'Analyzing spatial user behavior in computer games using geographic information systems', 'Proc. 13th International MindTrek Conference, ACM: 182-189'),
  r('wallner-kriglstein-2013', 'Wallner, G.; Kriglstein, S.', 2013, 'Visualization-based analysis of gameplay data - a review of literature', 'Entertainment Computing 4(3): 143-155'),
  r('hoobler-2004', 'Hoobler, N.; Humphreys, G.; Agrawala, M.', 2004, 'Visualizing competitive behaviors in multi-user virtual environments', 'Proc. IEEE Visualization 2004: 163-170'),
  r('kim-2008', 'Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D.', 2008, 'Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems', 'Proc. CHI 2008, ACM: 443-452'),
  r('bowman-2012', 'Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J.', 2012, 'Toward visualization for games: theory, design space, and patterns', 'IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968'),
  r('drachen-2009', 'Drachen, A.; Canossa, A.; Yannakakis, G. N.', 2009, 'Player modeling using self-organization in Tomb Raider: Underworld', 'Proc. IEEE Symposium on Computational Intelligence and Games: 1-8'),
  r('wallner-2019', 'Wallner, G. (ed.)', 2019, 'Data Analytics Applications in Gaming and Entertainment', 'CRC Press, Boca Raton'),
  // Esports analytics
  r('xenopoulos-2020', 'Xenopoulos, P.; Doraiswamy, H.; Silva, C.', 2020, 'Valuing player actions in Counter-Strike: Global Offensive', 'Proc. IEEE International Conference on Big Data 2020: 1283-1292', { url: 'https://arxiv.org/abs/2011.01324' }),
  r('xenopoulos-2022', 'Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C.', 2022, 'ggViz: accelerating large-scale esports game analysis', 'Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238'),
  r('schubert-2016', 'Schubert, M.; Drachen, A.; Mahlmann, T.', 2016, 'Esports analytics through encounter detection', 'MIT Sloan Sports Analytics Conference 2016'),
  r('hodge-2021', 'Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A.', 2021, 'Win prediction in multiplayer esports: live professional match prediction', 'IEEE Transactions on Games 13(4): 368-379'),
  r('makarov-2018', 'Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I.', 2018, 'Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games', 'Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196'),
  r('rioult-2014', 'Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C.', 2014, 'Mining tracks of competitive video games', 'AASRI Procedia 8: 82-87'),
  // Sports analytics
  r('fernandez-bornn-2018', 'Fernández, J.; Bornn, L.', 2018, 'Wide open spaces: a statistical technique for measuring space creation in professional soccer', 'MIT Sloan Sports Analytics Conference 2018'),
  r('cervone-2016', 'Cervone, D.; D\'Amour, A.; Bornn, L.; Goldsberry, K.', 2016, 'A multiresolution stochastic process model for predicting basketball possession outcomes', 'Journal of the American Statistical Association 111(514): 585-599'),
  r('spearman-2018', 'Spearman, W.', 2018, 'Beyond expected goals', 'MIT Sloan Sports Analytics Conference 2018'),
  r('goldsberry-2012', 'Goldsberry, K.', 2012, 'CourtVision: new visual and spatial analytics for the NBA', 'MIT Sloan Sports Analytics Conference 2012'),
  // Statistics
  r('benjamini-hochberg-1995', 'Benjamini, Y.; Hochberg, Y.', 1995, 'Controlling the false discovery rate: a practical and powerful approach to multiple testing', 'Journal of the Royal Statistical Society B 57(1): 289-300'),
  r('moran-1950', 'Moran, P. A. P.', 1950, 'Notes on continuous stochastic phenomena', 'Biometrika 37(1/2): 17-23'),
  r('getis-ord-1992', 'Getis, A.; Ord, J. K.', 1992, 'The analysis of spatial association by use of distance statistics', 'Geographical Analysis 24(3): 189-206'),
  r('anselin-1995', 'Anselin, L.', 1995, 'Local indicators of spatial association - LISA', 'Geographical Analysis 27(2): 93-115'),
  r('kulldorff-1997', 'Kulldorff, M.', 1997, 'A spatial scan statistic', 'Communications in Statistics - Theory and Methods 26(6): 1481-1496'),
  r('ripley-1977', 'Ripley, B. D.', 1977, 'Modelling spatial patterns', 'Journal of the Royal Statistical Society B 39(2): 172-212'),
  r('mccullagh-nelder-1989', 'McCullagh, P.; Nelder, J. A.', 1989, 'Generalized Linear Models (2nd ed.)', 'Chapman & Hall, London'),
  r('mann-whitney-1947', 'Mann, H. B.; Whitney, D. R.', 1947, 'On a test of whether one of two random variables is stochastically larger than the other', 'Annals of Mathematical Statistics 18(1): 50-60'),
  r('gini-1912', 'Gini, C.', 1912, 'Variabilità e mutabilità', 'Tipografia di Paolo Cuppini, Bologna', { pd: true }),
  r('fisher-1993', 'Fisher, P. F.', 1993, 'Algorithm and implementation uncertainty in viewshed analysis', 'International Journal of Geographical Information Systems 7(4): 331-347'),
  r('kendall-1938', 'Kendall, M. G.', 1938, 'A new measure of rank correlation', 'Biometrika 30(1/2): 81-93'),
];

export const REF_BY_ID = new Map(REFERENCES.map((x) => [x.id, x]));

/** "Lanchester 1916" or "Hartley & Helmbold 1995" or "Morse et al. 1951". */
export function shortCite(id: string): string {
  const x = REF_BY_ID.get(id);
  if (!x) return id;
  // An organisation (no initials): a document code from the title (FM 3-90, JP 3-01), else its name.
  if (!/,\s*[A-Z][a-z]?\./.test(x.authors)) {
    const code = /^((?:FM|ATP|ADP|JP|AFDP|MCDP|MCWP)\s[\d.-]+)/.exec(x.title)?.[1];
    return `${code ?? x.authors.replace(/^Headquarters,\s*/, '')} ${x.year}`;
  }
  const names = x.authors
    .replace(/\s*\(trans\.[^)]*\)/, '')
    .split(';')
    .map((a) => a.trim().split(',')[0].trim());
  const who = names.length === 1 ? names[0] : names.length === 2 ? `${names[0]} & ${names[1]}` : `${names[0]} et al.`;
  return `${who} ${x.year}`;
}

/** The full reference, one line. */
export function fullCite(id: string): string {
  const x = REF_BY_ID.get(id);
  if (!x) return id;
  const link = x.doi ? ` doi:${x.doi}` : x.url ? ` ${x.url}` : '';
  return `${x.authors} (${x.year}). ${x.title}. ${x.publisher}.${link}`;
}
