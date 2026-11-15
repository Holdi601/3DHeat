/**
 * References of the collective-behaviour entries (`behaviour.ts`): crowd
 * dynamics, collective motion, herding and conformity, cohesion and morale,
 * decisions under risk, streaks, mixed strategies, teamwork, virtual worlds and
 * networks. Every one was checked on 2026-11-15: articles against their
 * Crossref record by DOI (authors, year, title, journal, volume, issue,
 * pages), books against their Open Library record (author, year, publisher).
 * None is quoted; the entries say what they found in our own words.
 */

import type { Reference } from './types';

const V = '2026-11-15';
const a = (id: string, authors: string, year: number, title: string, publisher: string, doi: string): Reference => ({ id, authors, year, title, publisher, doi, verified: V, verifiedLevel: 'detail' });
const b = (id: string, authors: string, year: number, title: string, publisher: string, extra: Partial<Reference> = {}): Reference => ({ id, authors, year, title, publisher, verified: V, verifiedLevel: 'detail', ...extra });

export const REFS_BEHAVIOUR: Reference[] = [
  // Crowd dynamics and evacuation
  a('helbing-molnar-1995', 'Helbing, D.; Molnár, P.', 1995, 'Social force model for pedestrian dynamics', 'Physical Review E 51(5): 4282-4286', '10.1103/PhysRevE.51.4282'),
  a('helbing-1997', 'Helbing, D.; Keltsch, J.; Molnár, P.', 1997, 'Modelling the evolution of human trail systems', 'Nature 388(6637): 47-50', '10.1038/40353'),
  a('helbing-2000', 'Helbing, D.; Farkas, I.; Vicsek, T.', 2000, 'Simulating dynamical features of escape panic', 'Nature 407(6803): 487-490', '10.1038/35035023'),
  a('helbing-2005', 'Helbing, D.; Buzna, L.; Johansson, A.; Werner, T.', 2005, 'Self-organized pedestrian crowd dynamics: experiments, simulations, and design solutions', 'Transportation Science 39(1): 1-24', '10.1287/trsc.1040.0108'),
  a('helbing-2007', 'Helbing, D.; Johansson, A.; Al-Abideen, H. Z.', 2007, 'Dynamics of crowd disasters: an empirical study', 'Physical Review E 75(4): 046109', '10.1103/PhysRevE.75.046109'),
  a('moussaid-2010', 'Moussaïd, M.; Perozo, N.; Garnier, S.; Helbing, D.; Theraulaz, G.', 2010, 'The walking behaviour of pedestrian social groups and its impact on crowd dynamics', 'PLoS ONE 5(4): e10047', '10.1371/journal.pone.0010047'),
  a('moussaid-2011', 'Moussaïd, M.; Helbing, D.; Theraulaz, G.', 2011, 'How simple rules determine pedestrian behavior and crowd disasters', 'Proceedings of the National Academy of Sciences 108(17): 6884-6888', '10.1073/pnas.1016507108'),
  a('seyfried-2005', 'Seyfried, A.; Steffen, B.; Klingsch, W.; Boltes, M.', 2005, 'The fundamental diagram of pedestrian movement revisited', 'Journal of Statistical Mechanics: Theory and Experiment 2005(10): P10002', '10.1088/1742-5468/2005/10/P10002'),
  a('garcimartin-2014', 'Garcimartín, A.; Zuriguel, I.; Pastor, J. M.; Martín-Gómez, C.; Parisi, D. R.', 2014, 'Experimental evidence of the "faster is slower" effect', 'Transportation Research Procedia 2: 760-767', '10.1016/j.trpro.2014.09.085'),
  a('haghani-sarvi-2018', 'Haghani, M.; Sarvi, M.', 2018, 'Crowd behaviour and motion: empirical methods', 'Transportation Research Part B: Methodological 107: 253-294', '10.1016/j.trb.2017.06.017'),
  a('drury-2009', 'Drury, J.; Cocking, C.; Reicher, S.', 2009, 'Everyone for themselves? A comparative study of crowd solidarity among emergency survivors', 'British Journal of Social Psychology 48(3): 487-506', '10.1348/014466608X357893'),
  a('quarantelli-1954', 'Quarantelli, E. L.', 1954, 'The nature and conditions of panic', 'American Journal of Sociology 60(3): 267-275', '10.1086/221536'),
  b('fruin-1971', 'Fruin, J. J.', 1971, 'Pedestrian Planning and Design', 'Metropolitan Association of Urban Designers and Environmental Planners, New York'),
  // Collective motion
  a('reynolds-1987', 'Reynolds, C. W.', 1987, 'Flocks, herds and schools: a distributed behavioral model', 'Proceedings of SIGGRAPH \'87 (Computer Graphics 21(4)): 25-34', '10.1145/37401.37406'),
  a('vicsek-1995', 'Vicsek, T.; Czirók, A.; Ben-Jacob, E.; Cohen, I.; Shochet, O.', 1995, 'Novel type of phase transition in a system of self-driven particles', 'Physical Review Letters 75(6): 1226-1229', '10.1103/PhysRevLett.75.1226'),
  a('couzin-2002', 'Couzin, I. D.; Krause, J.; James, R.; Ruxton, G. D.; Franks, N. R.', 2002, 'Collective memory and spatial sorting in animal groups', 'Journal of Theoretical Biology 218(1): 1-11', '10.1006/jtbi.2002.3065'),
  a('couzin-2005', 'Couzin, I. D.; Krause, J.; Franks, N. R.; Levin, S. A.', 2005, 'Effective leadership and decision-making in animal groups on the move', 'Nature 433(7025): 513-516', '10.1038/nature03236'),
  a('ballerini-2008', 'Ballerini, M.; Cabibbo, N.; Candelier, R.; Cavagna, A.; Cisbani, E.; Giardina, I.; Lecomte, V.; Orlandi, A.; Parisi, G.; Procaccini, A.; Viale, M.; Zdravkovic, V.', 2008, 'Interaction ruling animal collective behavior depends on topological rather than metric distance: evidence from a field study', 'Proceedings of the National Academy of Sciences 105(4): 1232-1237', '10.1073/pnas.0711437105'),
  a('dyer-2009', 'Dyer, J. R. G.; Johansson, A.; Helbing, D.; Couzin, I. D.; Krause, J.', 2009, 'Leadership, consensus decision making and collective behaviour in humans', 'Philosophical Transactions of the Royal Society B 364(1518): 781-789', '10.1098/rstb.2008.0233'),
  a('nagy-2010', 'Nagy, M.; Ákos, Z.; Biro, D.; Vicsek, T.', 2010, 'Hierarchical group dynamics in pigeon flocks', 'Nature 464(7290): 890-893', '10.1038/nature08891'),
  a('krause-2010', 'Krause, J.; Ruxton, G. D.; Krause, S.', 2010, 'Swarm intelligence in animals and humans', 'Trends in Ecology & Evolution 25(1): 28-34', '10.1016/j.tree.2009.06.016'),
  a('vicsek-zafeiris-2012', 'Vicsek, T.; Zafeiris, A.', 2012, 'Collective motion', 'Physics Reports 517(3-4): 71-140', '10.1016/j.physrep.2012.03.004'),
  a('tunstrom-2013', 'Tunstrøm, K.; Katz, Y.; Ioannou, C. C.; Huepe, C.; Lutz, M. J.; Couzin, I. D.', 2013, 'Collective states, multistability and transitional behavior in schooling fish', 'PLoS Computational Biology 9(2): e1002915', '10.1371/journal.pcbi.1002915'),
  // Herding, cascades, conformity, social influence
  a('asch-1956', 'Asch, S. E.', 1956, 'Studies of independence and conformity: I. A minority of one against a unanimous majority', 'Psychological Monographs: General and Applied 70(9): 1-70', '10.1037/h0093718'),
  a('milgram-1969', 'Milgram, S.; Bickman, L.; Berkowitz, L.', 1969, 'Note on the drawing power of crowds of different size', 'Journal of Personality and Social Psychology 13(2): 79-82', '10.1037/h0028070'),
  a('banerjee-1992', 'Banerjee, A. V.', 1992, 'A simple model of herd behavior', 'Quarterly Journal of Economics 107(3): 797-817', '10.2307/2118364'),
  a('bikhchandani-1992', 'Bikhchandani, S.; Hirshleifer, D.; Welch, I.', 1992, 'A theory of fads, fashion, custom, and cultural change as informational cascades', 'Journal of Political Economy 100(5): 992-1026', '10.1086/261849'),
  a('manski-1993', 'Manski, C. F.', 1993, 'Identification of endogenous social effects: the reflection problem', 'Review of Economic Studies 60(3): 531-542', '10.2307/2298123'),
  a('bond-smith-1996', 'Bond, R.; Smith, P. B.', 1996, 'Culture and conformity: a meta-analysis of studies using Asch\'s (1952b, 1956) line judgment task', 'Psychological Bulletin 119(1): 111-137', '10.1037/0033-2909.119.1.111'),
  a('anderson-holt-1996', 'Anderson, L. R.; Holt, C. A.', 1996, 'Classroom games: information cascades', 'Journal of Economic Perspectives 10(4): 187-193', '10.1257/jep.10.4.187'),
  a('salganik-2006', 'Salganik, M. J.; Dodds, P. S.; Watts, D. J.', 2006, 'Experimental study of inequality and unpredictability in an artificial cultural market', 'Science 311(5762): 854-856', '10.1126/science.1121066'),
  a('lorenz-2011', 'Lorenz, J.; Rauhut, H.; Schweitzer, F.; Helbing, D.', 2011, 'How social influence can undermine the wisdom of crowd effect', 'Proceedings of the National Academy of Sciences 108(22): 9020-9025', '10.1073/pnas.1008636108'),
  a('gallup-2012', 'Gallup, A. C.; Hale, J. J.; Sumpter, D. J. T.; Garnier, S.; Kacelnik, A.; Krebs, J. R.; Couzin, I. D.', 2012, 'Visual attention and the acquisition of information in human crowds', 'Proceedings of the National Academy of Sciences 109(19): 7245-7250', '10.1073/pnas.1116141109'),
  // Effort and responsibility in groups
  a('darley-latane-1968', 'Darley, J. M.; Latané, B.', 1968, 'Bystander intervention in emergencies: diffusion of responsibility', 'Journal of Personality and Social Psychology 8(4, Pt. 1): 377-383', '10.1037/h0025589'),
  a('latane-1979', 'Latané, B.; Williams, K.; Harkins, S.', 1979, 'Many hands make light the work: the causes and consequences of social loafing', 'Journal of Personality and Social Psychology 37(6): 822-832', '10.1037/0022-3514.37.6.822'),
  a('karau-williams-1993', 'Karau, S. J.; Williams, K. D.', 1993, 'Social loafing: a meta-analytic review and theoretical integration', 'Journal of Personality and Social Psychology 65(4): 681-706', '10.1037/0022-3514.65.4.681'),
  a('fischer-2011', 'Fischer, P.; Krueger, J. I.; Greitemeyer, T.; Vogrincic, C.; Kastenmüller, A.; Frey, D.; Heene, M.; Wicher, M.; Kainbacher, M.', 2011, 'The bystander-effect: a meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies', 'Psychological Bulletin 137(4): 517-537', '10.1037/a0023304'),
  // Cohesion, combat motivation, morale
  a('shils-janowitz-1948', 'Shils, E. A.; Janowitz, M.', 1948, 'Cohesion and disintegration in the Wehrmacht in World War II', 'Public Opinion Quarterly 12(2): 280-315', '10.1086/265951'),
  b('marshall-1947', 'Marshall, S. L. A.', 1947, 'Men Against Fire: The Problem of Battle Command in Future War', 'William Morrow, New York'),
  b('stouffer-1949', 'Stouffer, S. A.; et al.', 1949, 'The American Soldier, Volume II: Combat and Its Aftermath', 'Princeton University Press, Princeton'),
  b('wong-2003', 'Wong, L.; Kolditz, T. A.; Millen, R. A.; Potter, T. M.', 2003, 'Why They Fight: Combat Motivation in the Iraq War', 'Strategic Studies Institute, US Army War College, Carlisle PA', { pd: true, url: 'https://press.armywarcollege.edu/monographs/322/' }),
  b('rowland-2006', 'Rowland, D.', 2006, 'The Stress of Battle: Quantifying Human Performance in Combat', 'The Stationery Office, London'),
  b('king-2013', 'King, A.', 2013, 'The Combat Soldier: Infantry Tactics and Cohesion in the Twentieth and Twenty-First Centuries', 'Oxford University Press, Oxford'),
  a('siebold-2007', 'Siebold, G. L.', 2007, 'The essence of military group cohesion', 'Armed Forces & Society 33(2): 286-295', '10.1177/0095327X06294173'),
  a('mullen-copper-1994', 'Mullen, B.; Copper, C.', 1994, 'The relation between group cohesiveness and performance: an integration', 'Psychological Bulletin 115(2): 210-227', '10.1037/0033-2909.115.2.210'),
  a('beal-2003', 'Beal, D. J.; Cohen, R. R.; Burke, M. J.; McLendon, C. L.', 2003, 'Cohesion and performance in groups: a meta-analytic clarification of construct relations', 'Journal of Applied Psychology 88(6): 989-1004', '10.1037/0021-9010.88.6.989'),
  // Decisions under risk and stress
  a('kahneman-tversky-1979', 'Kahneman, D.; Tversky, A.', 1979, 'Prospect theory: an analysis of decision under risk', 'Econometrica 47(2): 263-291', '10.2307/1914185'),
  a('tversky-kahneman-1992', 'Tversky, A.; Kahneman, D.', 1992, 'Advances in prospect theory: cumulative representation of uncertainty', 'Journal of Risk and Uncertainty 5(4): 297-323', '10.1007/BF00122574'),
  a('baumeister-1984', 'Baumeister, R. F.', 1984, 'Choking under pressure: self-consciousness and paradoxical effects of incentives on skillful performance', 'Journal of Personality and Social Psychology 46(3): 610-620', '10.1037/0022-3514.46.3.610'),
  a('arkes-blumer-1985', 'Arkes, H. R.; Blumer, C.', 1985, 'The psychology of sunk cost', 'Organizational Behavior and Human Decision Processes 35(1): 124-140', '10.1016/0749-5978(85)90049-4'),
  a('thaler-johnson-1990', 'Thaler, R. H.; Johnson, E. J.', 1990, 'Gambling with the house money and trying to break even: the effects of prior outcomes on risky choice', 'Management Science 36(6): 643-660', '10.1287/mnsc.36.6.643'),
  a('post-2008', 'Post, T.; van den Assem, M. J.; Baltussen, G.; Thaler, R. H.', 2008, 'Deal or No Deal? Decision making under risk in a large-payoff game show', 'American Economic Review 98(1): 38-71', '10.1257/aer.98.1.38'),
  a('smith-levere-2009', 'Smith, G.; Levere, M.; Kurtzman, R.', 2009, 'Poker player behavior after big wins and big losses', 'Management Science 55(9): 1547-1555', '10.1287/mnsc.1090.1044'),
  a('pope-schweitzer-2011', 'Pope, D. G.; Schweitzer, M. E.', 2011, 'Is Tiger Woods loss averse? Persistent bias in the face of experience, competition, and high stakes', 'American Economic Review 101(1): 129-157', '10.1257/aer.101.1.129'),
  a('starcke-brand-2012', 'Starcke, K.; Brand, M.', 2012, 'Decision making under stress: a selective review', 'Neuroscience & Biobehavioral Reviews 36(4): 1228-1248', '10.1016/j.neubiorev.2012.02.003'),
  // Streaks
  a('gilovich-1985', 'Gilovich, T.; Vallone, R.; Tversky, A.', 1985, 'The hot hand in basketball: on the misperception of random sequences', 'Cognitive Psychology 17(3): 295-314', '10.1016/0010-0285(85)90010-6'),
  a('bareli-2006', 'Bar-Eli, M.; Avugos, S.; Raab, M.', 2006, 'Twenty years of "hot hand" research: review and critique', 'Psychology of Sport and Exercise 7(6): 525-553', '10.1016/j.psychsport.2006.03.001'),
  a('miller-sanjurjo-2018', 'Miller, J. B.; Sanjurjo, A.', 2018, 'Surprised by the hot hand fallacy? A truth in the law of small numbers', 'Econometrica 86(6): 2019-2047', '10.3982/ECTA14943'),
  a('green-zwiebel-2018', 'Green, B.; Zwiebel, J.', 2018, 'The hot-hand fallacy: cognitive mistakes or equilibrium adjustments? Evidence from Major League Baseball', 'Management Science 64(11): 5315-5348', '10.1287/mnsc.2017.2804'),
  // Mixed strategies
  b('vonneumann-morgenstern-1944', 'von Neumann, J.; Morgenstern, O.', 1944, 'Theory of Games and Economic Behavior', 'Princeton University Press, Princeton'),
  a('walker-wooders-2001', 'Walker, M.; Wooders, J.', 2001, 'Minimax play at Wimbledon', 'American Economic Review 91(5): 1521-1538', '10.1257/aer.91.5.1521'),
  a('chiappori-2002', 'Chiappori, P.-A.; Levitt, S.; Groseclose, T.', 2002, 'Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer', 'American Economic Review 92(4): 1138-1151', '10.1257/00028280260344678'),
  a('palacios-huerta-2003', 'Palacios-Huerta, I.', 2003, 'Professionals play minimax', 'Review of Economic Studies 70(2): 395-415', '10.1111/1467-937X.00249'),
  a('bareli-2007', 'Bar-Eli, M.; Azar, O. H.; Ritov, I.; Keidar-Levin, Y.; Schein, G.', 2007, 'Action bias among elite soccer goalkeepers: the case of penalty kicks', 'Journal of Economic Psychology 28(5): 606-621', '10.1016/j.joep.2006.12.001'),
  // Teams
  a('salas-2005', 'Salas, E.; Sims, D. E.; Burke, C. S.', 2005, 'Is there a "Big Five" in teamwork?', 'Small Group Research 36(5): 555-599', '10.1177/1046496405277134'),
  a('mohammed-2010', 'Mohammed, S.; Ferzandi, L.; Hamilton, K.', 2010, 'Metaphor no more: a 15-year review of the team mental model construct', 'Journal of Management 36(4): 876-910', '10.1177/0149206309356804'),
  a('dechurch-2010', 'DeChurch, L. A.; Mesmer-Magnus, J. R.', 2010, 'The cognitive underpinnings of effective teamwork: a meta-analysis', 'Journal of Applied Psychology 95(1): 32-53', '10.1037/a0017328'),
  a('woolley-2010', 'Woolley, A. W.; Chabris, C. F.; Pentland, A.; Hashmi, N.; Malone, T. W.', 2010, 'Evidence for a collective intelligence factor in the performance of human groups', 'Science 330(6004): 686-688', '10.1126/science.1193147'),
  a('kim-2017', 'Kim, Y. J.; Engel, D.; Woolley, A. W.; Lin, J. Y. T.; McArthur, N.; Malone, T. W.', 2017, 'What makes a strong team? Using collective intelligence to predict team performance in League of Legends', 'Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing (CSCW): 2316-2329', '10.1145/2998181.2998185'),
  // Virtual worlds, space and networks
  b('hall-1966', 'Hall, E. T.', 1966, 'The Hidden Dimension', 'Doubleday, Garden City NY'),
  b('altman-1975', 'Altman, I.', 1975, 'The Environment and Social Behavior: Privacy, Personal Space, Territory, Crowding', 'Brooks/Cole, Monterey CA'),
  b('castronova-2005', 'Castronova, E.', 2005, 'Synthetic Worlds: The Business and Culture of Online Games', 'University of Chicago Press, Chicago'),
  a('balicer-2007', 'Balicer, R. D.', 2007, 'Modeling infectious diseases dissemination through online role-playing games', 'Epidemiology 18(2): 260-261', '10.1097/01.ede.0000254692.80550.60'),
  a('lofgren-fefferman-2007', 'Lofgren, E. T.; Fefferman, N. H.', 2007, 'The untapped potential of virtual game worlds to shed light on real world epidemics', 'The Lancet Infectious Diseases 7(9): 625-629', '10.1016/S1473-3099(07)70212-8'),
  a('bainbridge-2007', 'Bainbridge, W. S.', 2007, 'The scientific research potential of virtual worlds', 'Science 317(5837): 472-476', '10.1126/science.1146930'),
  a('yee-2007', 'Yee, N.; Bailenson, J. N.; Urbanek, M.; Chang, F.; Merget, D.', 2007, 'The unbearable likeness of being digital: the persistence of nonverbal social norms in online virtual environments', 'CyberPsychology & Behavior 10(1): 115-121', '10.1089/cpb.2006.9984'),
  a('szell-2010', 'Szell, M.; Lambiotte, R.; Thurner, S.', 2010, 'Multirelational organization of large-scale social networks in an online world', 'Proceedings of the National Academy of Sciences 107(31): 13636-13641', '10.1073/pnas.1004008107'),
  a('granovetter-1973', 'Granovetter, M. S.', 1973, 'The strength of weak ties', 'American Journal of Sociology 78(6): 1360-1380', '10.1086/225469'),
  a('barabasi-albert-1999', 'Barabási, A.-L.; Albert, R.', 1999, 'Emergence of scaling in random networks', 'Science 286(5439): 509-512', '10.1126/science.286.5439.509'),
  a('newman-2003', 'Newman, M. E. J.', 2003, 'The structure and function of complex networks', 'SIAM Review 45(2): 167-256', '10.1137/S003614450342480'),
  a('duch-2010', 'Duch, J.; Waitzman, J. S.; Amaral, L. A. N.', 2010, 'Quantifying the performance of individual players in a team activity', 'PLoS ONE 5(6): e10937', '10.1371/journal.pone.0010937'),
  a('centola-2010', 'Centola, D.', 2010, 'The spread of behavior in an online social network experiment', 'Science 329(5996): 1194-1197', '10.1126/science.1185231'),
  a('grund-2012', 'Grund, T. U.', 2012, 'Network structure and team performance: the case of English Premier League soccer teams', 'Social Networks 34(4): 682-690', '10.1016/j.socnet.2012.08.004'),
  // Methods
  a('wald-wolfowitz-1940', 'Wald, A.; Wolfowitz, J.', 1940, 'On a test whether two samples are from the same population', 'Annals of Mathematical Statistics 11(2): 147-162', '10.1214/aoms/1177731909'),
  a('fleiss-1971', 'Fleiss, J. L.', 1971, 'Measuring nominal scale agreement among many raters', 'Psychological Bulletin 76(5): 378-382', '10.1037/h0031619'),
  a('phipson-smyth-2010', 'Phipson, B.; Smyth, G. K.', 2010, 'Permutation p-values should never be zero: calculating exact p-values when permutations are randomly drawn', 'Statistical Applications in Genetics and Molecular Biology 9(1): Article 39', '10.2202/1544-6115.1585'),
];
