---
title: "Κατάλογος γνώσης"
parent: "Ο φακός γνώσης"
nav_order: 2
lang: "el"
source: "knowledge-catalogue.md"
source_hash: "dc29e603ed50"
translated: true
outdated: false
---

# Κατάλογος γνώσης

Αυτή είναι η πλήρης λίστα με όσα ξέρει ο [φακός γνώσης](knowledge.md): τα μοτίβα που ψάχνει, τις ιδέες, τις μεθόδους, τις ιστορικές περιπτώσεις και τις μελέτες που αναφέρει, και τα βιβλία και τα άρθρα πίσω από αυτές. Χρησιμοποιήστε τον για να βρείτε μια καταχώριση με το αναγνωριστικό της ή για να ελέγξετε μια πηγή.

Αυτή η σελίδα δημιουργείται από τη βάση γνώσης με την εντολή `node tools/knowledge-doc.mjs`· μην την επεξεργάζεστε ανάμεσα στους δείκτες.

<!-- kb:begin -->

Η βάση γνώσης έχει 579 καταχωρίσεις (135 έννοιες, 37 μέθοδοι, 277 ιστορικές περιπτώσεις, 17 αρχές σχεδιασμού, 113 μελέτες) πάνω σε 93 μοτίβα, με 556 αναφορές.

### Μοτίβα (93) {#patterns-93}

| αναγνωριστικό | οικογένεια | πώς φαίνεται στα δεδομένα |
|---|---|---|
| `concentration` | δύναμη | Η πλευρά που φέρνει περισσότερες μονάδες σε ένα σημείο κερδίζει εκείνο το σημείο με διαφορά μεγαλύτερη από τους αριθμούς της μόνο. |
| `local-superiority` | δύναμη | Οι νεκροί πέφτουν στην πλευρά που υπερέχει αριθμητικά μέσα στην εμβέλεια εμπλοκής, ό,τι κι αν λένε τα σύνολα. |
| `attrition` | δύναμη | Οι απώλειες ακολουθούν τις δυνάμεις και των δύο πλευρών στον χρόνο· τη μάχη την κρίνει όποιος τελειώσει πρώτος. |
| `exchange-ratio` | δύναμη | Οι νεκροί ανά απώλεια διαφέρουν πολύ ανάλογα με τον τόπο, την πλευρά ή την κλάση. |
| `aimed-fire` | δύναμη | Οι απώλειες αυξάνονται με τους αριθμούς του εχθρού, αλλά όχι με τους δικούς σας. |
| `area-fire` | δύναμη | Οι απώλειες αυξάνονται με το γινόμενο των αριθμών και των δύο πλευρών: το συνωστισμό τον τιμωρεί το πυρ. |
| `defeat-in-detail` | δύναμη | Μια πλευρά καταστρέφεται τμηματικά, καθώς τα μέρη της φτάνουν ένα ένα. |
| `mutual-support` | δύναμη | Μια απώλεια απαντιέται γρήγορα από έναν κοντινό συμπαίκτη: ανταλλαγές. |
| `combined-arms` | δύναμη | Οι κλάσεις τα πάνε καλά μαζί, όπου η καθεμία καλύπτει την αδυναμία της άλλης, και άσχημα μόνες τους. |
| `class-counter` | δύναμη | Μια κλάση νικά δυσανάλογα μια συγκεκριμένη άλλη κλάση ή σε ένα συγκεκριμένο σημείο. |
| `initiative` | δύναμη | Όποιος σημειώνει πρώτος στη εμπλοκή τείνει να την κερδίζει. |
| `key-terrain` | έδαφος | Τα ίδια λίγα σημεία κρίνουν τις μάχες ματς μετά από ματς. |
| `fields-of-fire` | έδαφος | Τα σημεία που βλέπουν μακριά πάνω από το έδαφος που πρέπει να διασχίσουν οι άλλοι σημειώνουν περισσότερους νεκρούς. |
| `high-ground` | έδαφος | Οι νεκροί προκύπτουν από ψηλότερα από το έδαφος όπου στέκονται τα θύματα. |
| `cover` | έδαφος | Οι θάνατοι ανά χρόνο μειώνονται εκεί όπου η γεωμετρία εμποδίζει την όραση και τα πυρά. |
| `open-ground` | έδαφος | Οι θάνατοι ανά χρόνο αυξάνονται εκεί όπου τίποτα δεν εμποδίζει την όραση και τα πυρά. |
| `kill-zone` | έδαφος | Οι θάνατοι συγκεντρώνονται εκεί όπου η κίνηση αναγκάζεται να περάσει από έδαφος που παρατηρείται και καλύπτεται από πυρά. |
| `chokepoint` | έδαφος | Πολλές διαβάσεις στριμώχνονται μέσα από λίγο έδαφος, με απώλειες εκεί. |
| `reverse-slope` | έδαφος | Ασφάλεια ακριβώς πίσω από μια κορυφογραμμή ή τοίχο, έξω από την άμεση θέα του εχθρού. |
| `safe-ground` | έδαφος | Ένα σημείο όπου περνάει χρόνος αλλά πεθαίνουν λίγοι. |
| `obstacle` | έδαφος | Οι διαδρομές στρίβουν γύρω από αποκλεισμένο έδαφος και καταλήγουν σε λίγες λωρίδες. |
| `flank` | κίνηση | Μια σπάνια χρησιμοποιούμενη διαδρομή οδηγεί σε περισσότερους νεκρούς από τις κύριες. |
| `avenue-of-approach` | κίνηση | Η κίνηση ρέει κατά μήκος λίγων λωρίδων ανάμεσα σε περιοχές. |
| `mobility` | κίνηση | Οι κινούμενες μονάδες πεθαίνουν λιγότερο (ή περισσότερο) ανά χρόνο από τις αργές ή ακίνητες. |
| `static-exposure` | κίνηση | Οι μονάδες που στέκονται ακίνητες πεθαίνουν περισσότερο ανά χρόνο από αυτές που κινούνται. |
| `interior-lines` | κίνηση | Μια πλευρά με σύντομες διαδρομές ανάμεσα στις μάχες της μετακινεί τη δύναμή της γρηγορότερα από την άλλη. |
| `envelopment` | κίνηση | Οι νεκροί έρχονται από πολλές κατευθύνσεις πάνω στη θέση μιας πλευράς. |
| `ambush` | κίνηση | Οι μονάδες που κινούνται σε μια διαδρομή πεθαίνουν γρήγορα από εχθρούς που είναι ήδη στη θέση τους. |
| `spawn-pressure` | χρόνος | Οι ζωές τελειώνουν σύντομα μετά την αρχή τους σε μία αναγέννηση. |
| `tempo` | χρόνος | Η γρηγορότερη πλευρά φτάνει στη μάχη και σημειώνει πριν αντιδράσει η άλλη. |
| `surprise` | χρόνος | Οι απώλειες έρχονται ως έκρηξη πριν τα θύματα απαντήσουν στα πυρά. |
| `energy-advantage` | αέρας | Οι δολοφόνοι έχουν περισσότερο ύψος και ταχύτητα από τα θύματά τους. |
| `air-superiority` | αέρας | Τα αεροσκάφη μιας πλευράς σκοτώνουν πολλές φορές όσα χάνουν. |
| `sead` | αέρας | Οι αντιαεροπορικές άμυνες εδάφους καταρρίπτουν πολλά αεροσκάφη, ώσπου να εντοπιστούν και να καταστραφούν. |
| `bvr` | αέρας | Οι νεκροί έρχονται από μεγάλη απόσταση, προτού το θύμα μπορέσει να πλησιάσει. |
| `fleet-salvo` | θάλασσα | Μια δύναμη που καταφέρνει πρώτη το χτύπημα χάνει λίγα· τα λίγα που επιζούν της άλλης απαντούν. |
| `scouting` | θάλασσα | Η πλευρά που βρίσκει πρώτη την άλλη επιλέγει τη μάχη. |
| `urban-close` | αστικό | Σύντομες εμβελείες εμπλοκής, πολλοί νεκροί ανάμεσα σε πυκνή γεωμετρία, αργός καθαρισμός. |
| `vertical` | αστικό | Νεκροί από ανώτερους ορόφους ή ταράτσες πάνω σε δρόμους. |
| `skill-dispersion` | άνθρωποι | Λίγοι παίκτες αντιστοιχούν σε μεγάλο μέρος των νεκρών ή των θανάτων. |
| `ai-vs-player` | άνθρωποι | Οι μονάδες που ελέγχει η AI τα πάνε διαφορετικά από τους παίκτες στο ίδιο σημείο. |
| `balance` | σχεδιασμός | Οι πλευρές, οι αναγεννήσεις ή οι κλάσεις ξεκινούν με άνισες πιθανότητες. |
| `economy` | σχεδιασμός | Οι πόροι που κερδίζονται, πληρώνονται και χάνονται συγκεντρώνονται σε λίγα σημεία ή παίκτες. |
| `flow` | σχεδιασμός | Πώς κινούνται οι παίκτες μέσα στο επίπεδο: κύκλοι, λωρίδες, αδιέξοδα. |
| `sightlines` | σχεδιασμός | Οι μεγάλες γραμμές θέασης αποφασίζουν πού ξεκινούν οι μάχες και ποιος τις κερδίζει. |
| `readability` | σχεδιασμός | Θάνατοι που οι παίκτες δεν μπορούν να προβλέψουν: από πίσω, από εκτός θέας. |
| `formation` | κίνηση | Οι μονάδες μιας πλευράς κινούνται μαζί σε αναγνωρίσιμο σχήμα: γραμμή, στήλη, σφήνα, κλιμακωτή διάταξη, τετράγωνο. |
| `frontal-assault` | κίνηση | Μια ομάδα πέφτει πάνω στον εχθρό ευθεία, πάνω στο μέτωπό του. |
| `double-envelopment` | κίνηση | Δύο ομάδες χτυπούν και τα δύο πλευρά ενός εχθρικού σώματος περίπου ταυτόχρονα. |
| `encirclement` | κίνηση | Μια εχθρική ομάδα βρίσκεται με την άλλη πλευρά γύρω της από όλες τις μεριές και με λίγες διεξόδους. |
| `penetration` | κίνηση | Μια ομάδα περνά μέσα από την εχθρική γραμμή εκεί όπου υπάρχουν εχθροί και στις δύο πλευρές της. |
| `fire-and-maneuver` | κίνηση | Ένα μέρος της ομάδας κινείται ενώ το υπόλοιπο στέκεται και την καλύπτει, και οι ρόλοι εναλλάσσονται. |
| `feint` | κίνηση | Μια μικρή ομάδα τραβά τον εχθρό σε ένα σημείο· η κύρια προσπάθεια χτυπά αλλού λίγο αργότερα. |
| `withdrawal` | κίνηση | Μια ομάδα σε επαφή γυρίζει και ανοίγει την απόσταση από τον εχθρό. |
| `pursuit` | κίνηση | Μια ομάδα ακολουθεί έναν εχθρό που απομακρύνεται, διατηρώντας ή μειώνοντας την απόσταση. |
| `defence-in-depth` | έδαφος | Οι αμυνόμενοι στέκονται σε πολλαπλές ζώνες, η μία πίσω από την άλλη, κατά μήκος του άξονα προέλασης του εχθρού. |
| `screening` | κίνηση | Ένα μικρό στοιχείο κινείται αρκετά μπροστά από το κύριο σώμα του και συναντά πρώτο τον εχθρό. |
| `dispersion` | δύναμη | Μια πλευρά απλώνεται με τον καιρό· λιγότερες μονάδες της μοιράζονται το ίδιο σημείο. |
| `missile-defence` | αέρας | Τα αεροσκάφη υπό απειλή πυραύλων στρέφουν την απειλή στο πλάι ή στην ουρά: crank, notch, drag, pump. |
| `angles-fight` | αέρας | Εναέρια μάχη σε κοντινή απόσταση, με χαμηλή ταχύτητα και μεγάλη ταχύτητα στροφής, που δίνεται για τη θέση της μύτης και όχι για την ενέργεια. |
| `cap` | αέρας | Τα αεροσκάφη κάνουν κύκλους σε σταθερό σταθμό για λεπτά, περιμένοντας τον εχθρό να έρθει. |
| `strike-package` | αέρας | Αεροσκάφη με διαφορετικούς ρόλους πετούν μαζί προς στόχο· μερικά επιτίθενται στο έδαφος, άλλα τα καλύπτουν. |
| `line-of-battle` | θάλασσα | Τα πλοία πλέουν σε στήλη, το ένα πίσω από το άλλο, ώστε να μπορούν να βάλουν όλα τα κανόνια τους. |
| `crossing-the-t` | θάλασσα | Μια στήλη περνά μπροστά από την κεφαλή της εχθρικής στήλης: όλα τα κανόνια της βάλλουν, λίγα του εχθρού. |
| `fatal-funnel` | αστικό | Παίκτες που μπαίνουν από μία πόρτα, δωμάτιο ή στενό χάνονται εκεί μέσα σε στιγμές πολύ πιο συχνά απ' ό,τι όταν μπαίνουν αλλού. |
| `crossfire` | δύναμη | Όσοι κρατούν θέση, με γραμμές πυρός που συγκλίνουν από διαφορετικές γωνίες, κερδίζουν περισσότερες μονομαχίες από έναν μόνο. |
| `peeker-advantage` | χρόνος | Ο παίκτης που μπαίνει στη θέα κερδίζει τις μονομαχίες απέναντι σε εκείνον που κρατά τη γωνία πιο συχνά (ή λιγότερο συχνά) από το μισό. |
| `entry` | χρόνος | Ο πρώτος θάνατος ενός γύρου καθορίζει μεγάλο μέρος του γύρου· οι είσοδοι κερδίζουν ή χάνουν ανάλογα με τη θέση και την υποστήριξη. |
| `utility-support` | δύναμη | Μια λάμψη ή καπνός λίγο πριν από μια μονομαχία αλλάζει ποιος θα τη κερδίσει. |
| `man-advantage` | δύναμη | Οι γύροι κερδίζονται από την πλευρά με περισσότερους ζωντανούς παίκτες, και κάποιες πλευρές μετατρέπουν ή πετούν ένα προβάδισμα. |
| `clutch` | άνθρωποι | Οι τελευταίοι ζωντανοί παίκτες κερδίζουν περισσότερο (ή λιγότερο) συχνά απ' ό,τι προβλέπει η κατάσταση του γύρου. |
| `action-value` | άνθρωποι | Νεκροί, ανταλλαγές, τοποθετήσεις βομβών και βοηθητικά εργαλεία διαφέρουν ως προς το πόσο αλλάζουν την πιθανότητα να κερδίσεις. |
| `lurk` | κίνηση | Ένας παίκτης μόνος του, μακριά από την ομάδα, σκοτώνει (ή πεθαίνει) με διαφορετικό ρυθμό από τη συνέχεια. |
| `rotation` | κίνηση | Το πόσο γρήγορα μια πλευρά μετακινεί παίκτες στη μάχη ή στον στόχο αποφασίζει αν θα κρατήσει ή θα ανακτήσει. |
| `collective-order` | άνθρωποι | Οι κινούμενες μονάδες μιας πλευράς κατευθύνονται προς την ίδια κατεύθυνση πολύ πιο συχνά απ' ό,τι θα έδειχναν οι δικές τους τροχιές, μετατοπισμένες στον χρόνο, τυχαία. |
| `milling` | άνθρωποι | Οι μονάδες μιας πλευράς κυκλώνουν ένα κοινό κέντρο: περιστροφή χωρίς καθαρή μετακίνηση. |
| `herding` | άνθρωποι | Οι μονάδες φεύγουν από ένα σημείο όπως ο συμπαίκτης πριν από αυτές, πέρα από τις δικές του πιθανότητες του σημείου και πέρα από την αντιγραφή του εχθρού. |
| `lane-formation` | άνθρωποι | Αντίθετες ροές κρατούν χωριστές λωρίδες· η κίνηση συγκεντρώνεται σε λίγα μονοπάτια που ξαναχρησιμοποιούνται ματς μετά από ματς. |
| `crowding` | άνθρωποι | Η ταχύτητα και η ροή πέφτουν όταν οι μονάδες στριμώχνονται· μέσα από ένα στενό, το να σπρώχνεις πιο δυνατά περνά λιγότερους. |
| `leadership` | άνθρωποι | Μερικές μονάδες στρέφονται πρώτες και άλλες αντιγράφουν την κατεύθυνσή τους λίγα δευτερόλεπτα μετά. |
| `cohesion` | άνθρωποι | Οι μονάδες που απομακρύνονται από την ομάδα τους πεθαίνουν πιο συχνά από εκείνες που μένουν μαζί της. |
| `breaking-point` | άνθρωποι | Μια πλευρά που έχει χάσει ένα μέρος της δύναμής της σταματά να πλησιάζει και υποχωρεί, πέρα από ό,τι εξηγεί η απόστασή της από τον εχθρό. |
| `panic` | άνθρωποι | Υπό ξαφνική απειλή οι μονάδες σκορπούν, φεύγουν μακριά ή παγώνουν, και ο συντονισμός διαλύεται. |
| `loss-chasing` | άνθρωποι | Μετά από μια απώλεια οι μονάδες παίρνουν περισσότερο (ή λιγότερο) ρίσκο απ' ό,τι μετά από ένα κέρδος. |
| `hot-hand` | άνθρωποι | Η επιτυχία ακολουθεί την επιτυχία πιο συχνά απ' ό,τι επιτρέπουν οι ανακατεμένες ακολουθίες του ίδιου παίκτη. |
| `conformity` | άνθρωποι | Τα μέλη μιας πλευράς επιλέγουν το ίδιο - αγορές, εξοπλισμούς, διαδρομές - πέρα από τις δικές τους προτιμήσεις. |
| `suppression` | άνθρωποι | Τα εισερχόμενα πυρά αλλάζουν τον τρόπο που κινούνται και πυροβολούν οι μονάδες, ακόμη κι όταν δεν σκοτώνουν. |
| `social-loafing` | άνθρωποι | Η δράση ανά κεφαλή πέφτει όσο περισσότεροι συμπαίκτες είναι παρόντες. |
| `mixed-strategy` | άνθρωποι | Οι επιλογές που θα έπρεπε να είναι απρόβλεπτες γίνονται κανονικές: μία επιλογή κερδίζει περισσότερο, ή οι επιλογές ακολουθούν αλληλουχίες. |
| `coordination` | άνθρωποι | Τα μέλη ενεργούν συντονισμένα χωρίς ορατές εντολές: συγχρονισμένη κίνηση, χρονισμός και επιλογές. |
| `contagion` | άνθρωποι | Μια κατάσταση περνά από μονάδα σε μονάδα με επαφή ή με γειτνίαση και εξαπλώνεται στον χάρτη. |
| `territoriality` | άνθρωποι | Οι μονάδες κρατούν την απόστασή τους από τις άλλες και μένουν στο δικό τους έδαφος. |
| `interaction-network` | άνθρωποι | Ποιος μάχεται, ποιον υποστηρίζει και ποιον ακολουθεί σχηματίζει δίκτυο με κόμβους, ομάδες και γέφυρες. |

### Έννοιες (135) {#concepts-135}

| αναγνωριστικό | τίτλος | φακοί | μοτίβα | πηγές |
|---|---|---|---|---|
| `concept.lanchester-square` | Νόμος τετραγώνου του Lanchester (στοχευμένο πυρ) | στρατιωτικό, αέρας, ναυτικό, e-sports | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | Γραμμικός νόμος του Lanchester (περιοχικό πυρ, ένας προς έναν) | στρατιωτικό, αστικό, e-sports | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | Συγκέντρωση δύναμης (μάζα) | στρατιωτικό, αέρας, ναυτικό, e-sports | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | Λόγοι δύναμης και ο κανόνας 3:1 | στρατιωτικό | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | Λόγος ανταλλαγής απωλειών | στρατιωτικό, αέρας, e-sports, σχεδιασμός | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; Weapons Systems Evaluation Group 1967; Dupuy 1979 |
| `concept.combat-power` | Μαχητική ισχύς και οι πολλαπλασιαστές της | στρατιωτικό | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | Το σύγχρονο σύστημα χρήσης δύναμης | στρατιωτικό | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | Ο βρόχος OODA (παρατήρηση-προσανατολισμός-απόφαση-δράση) | στρατιωτικό, αέρας, e-sports | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | Θεωρία ενέργειας-ευελιξίας | αέρας | energy-advantage, angles-fight, high-ground, mobility | Boyd et al. 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | Βασικοί αεροπορικοί ελιγμοί και ελιγμοί αερομαχίας | αέρας | angles-fight, energy-advantage, initiative, surprise | Shaw 1985; Weapons Systems Evaluation Group 1967 |
| `concept.terrain-ocoka` | Ανάλυση εδάφους: OAKOC / KOCOA | στρατιωτικό, σχεδιασμός, αστικό | key-terrain, fields-of-fire, avenue-of-approach, cover, obstacle | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.mett-tc` | METT-TC: μεταβλητές αποστολής | στρατιωτικό | balance, key-terrain | FM 3-90 2023; FM 3-0 2022 |
| `concept.key-terrain` | Κρίσιμο και αποφασιστικό έδαφος | στρατιωτικό, σχεδιασμός, e-sports | key-terrain, high-ground, fields-of-fire | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994 |
| `concept.fields-of-fire` | Παρατήρηση και πεδία πυρός | στρατιωτικό, σχεδιασμός, e-sports, αστικό | fields-of-fire, sightlines, high-ground | FM 3-21.8 2007; FM 3-90 2023; ATP 2-01.3 2019; Fisher 1993 |
| `concept.cover-concealment` | Κάλυψη και απόκρυψη | στρατιωτικό, αστικό, σχεδιασμός | cover, open-ground, reverse-slope | FM 3-21.8 2007; FM 3-90 2023; Biddle 2004 |
| `concept.avenue-of-approach` | Άξονες προσέγγισης και διάδρομοι κινητικότητας | στρατιωτικό, σχεδιασμός | avenue-of-approach, flow, chokepoint, obstacle | ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.chokepoint` | Στενά και διάβαση | στρατιωτικό, σχεδιασμός, e-sports | chokepoint, kill-zone, obstacle, avenue-of-approach | FM 3-90 2023; Jomini 1862; Herodotus 1858 |
| `concept.engagement-area` | Περιοχές εμπλοκής και ζώνες θανάτου | στρατιωτικό, αστικό, σχεδιασμός | kill-zone, fields-of-fire, chokepoint, obstacle | FM 3-90 2023; FM 3-90-1 2013; FM 3-21.8 2007 |
| `concept.reverse-slope` | Άμυνα στην αντίστροφη πλαγιά και κάλυψη από τη θέα | στρατιωτικό, σχεδιασμός | reverse-slope, safe-ground, cover, high-ground | FM 3-90-1 2013; FM 3-21.8 2007; Siborne 1844 |
| `concept.high-ground` | Το ψηλό έδαφος | στρατιωτικό, σχεδιασμός | high-ground, fields-of-fire, key-terrain | Sun Tzu 1910; Vegetius 1767; FM 3-90 2023 |
| `concept.interior-lines` | Εσωτερικές και εξωτερικές γραμμές | στρατιωτικό | interior-lines, tempo, concentration | Jomini 1862; Clausewitz 1873 |
| `concept.defeat-in-detail` | Ήττα κατά μέρη | στρατιωτικό, e-sports | defeat-in-detail, concentration, local-superiority | Jomini 1862; Lanchester 1916 |
| `concept.mutual-support` | Αμοιβαία υποστήριξη | στρατιωτικό, αέρας, e-sports | mutual-support, combined-arms, defeat-in-detail | FM 3-90 2023; FM 3-21.8 2007; Shaw 1985; Xenopoulos et al. 2020 |
| `concept.combined-arms` | Συνδυασμένα όπλα | στρατιωτικό, σχεδιασμός | combined-arms, class-counter | FM 3-0 2022; Biddle 2004; Doubler 1994 |
| `concept.suppression` | Καταστολή | στρατιωτικό, αστικό | combined-arms, mutual-support, cover | FM 3-90 2023; Biddle 2004 |
| `concept.sead` | Καταστολή και καταστροφή εχθρικής αεράμυνας (SEAD/DEAD) | αέρας, στρατιωτικό | sead, air-superiority, combined-arms | JP 3-01 2017; Department of the Air Force 2002; Lambeth 1984; Keaney & Cohen 1993 |
| `concept.cap` | Εναέρια περιπολία μάχης και αεροπορική υπεροχή | αέρας | cap, air-superiority, exchange-ratio, key-terrain | Department of the Air Force 2002; JP 3-01 2017; Douhet 1942 |
| `concept.bvr` | Εμπλοκή πέρα από οπτική επαφή | αέρας | bvr, initiative, missile-defence, fields-of-fire | Michel 1997; Keaney & Cohen 1993; Shaw 1985 |
| `concept.indirect-approach` | Η έμμεση προσέγγιση | στρατιωτικό, e-sports, σχεδιασμός | flank, surprise, avenue-of-approach | Liddell Hart 1954; Sun Tzu 1910 |
| `concept.envelopment` | Περικύκλωση και κύκλωση | στρατιωτικό | envelopment, double-envelopment, encirclement, flank, concentration | FM 3-90 2023; Polybius 1889; Goldsworthy 2001 |
| `concept.ambush` | Ενέδρα | στρατιωτικό, e-sports, σχεδιασμός | ambush, surprise, kill-zone, avenue-of-approach | FM 3-21.8 2007; FM 3-90 2023; Tacitus 1876 |
| `concept.defence-in-depth` | Άμυνα σε βάθος | στρατιωτικό | defence-in-depth, attrition, kill-zone, key-terrain | FM 3-90-1 2013; Glantz & House 1999 |
| `concept.friction` | Τριβή και η ομίχλη του πολέμου | στρατιωτικό, e-sports | readability, surprise, tempo | Clausewitz 1873; Benjamini & Hochberg 1995 |
| `concept.culminating-point` | Σημείο αποκορύφωσης της επίθεσης | στρατιωτικό | attrition, tempo, interior-lines | Clausewitz 1873; FM 3-0 2022 |
| `concept.surprise` | Αιφνιδιασμός | στρατιωτικό, αέρας, ναυτικό, e-sports | surprise, initiative, ambush | Sun Tzu 1910; Dupuy 1987; MCDP 1 1997 |
| `concept.economy-of-force` | Οικονομία δύναμης | στρατιωτικό, e-sports | concentration, safe-ground, balance | FM 3-0 2022; MCDP 1 1997 |
| `concept.urban-terrain` | Αστικό έδαφος | αστικό, στρατιωτικό, e-sports | urban-close, vertical, cover, kill-zone | FM 3-06 2006; FM 90-10 1979 |
| `concept.sea-control` | Έλεγχος της θάλασσας και η αποφασιστική ναυτική μάχη | ναυτικό | fleet-salvo, concentration, scouting | Mahan 1890; Corbett 1911; Hughes 2000 |
| `concept.salvo` | Μοντέλο σάλβου του Hughes: να επιτίθεσαι αποτελεσματικά πρώτος | ναυτικό, αέρας | fleet-salvo, initiative, scouting | Hughes 1995; Hughes 2000 |
| `concept.search-theory` | Θεωρία αναζήτησης και ανίχνευσης | ναυτικό, αέρας, στρατιωτικό | scouting, fields-of-fire | Koopman 1946; Morse & Kimball 1951 |
| `concept.operations-research` | Επιχειρησιακή έρευνα: μέτρα αποτελεσματικότητας | στρατιωτικό, αέρας, ναυτικό, σχεδιασμός | exchange-ratio, attrition | Morse & Kimball 1951; Blackett 1962; Koopman 1946 |
| `concept.wargaming` | Πολεμικά παιχνίδια ως ανάλυση | στρατιωτικό, σχεδιασμός | balance, flow | Perla 1990; Perla & McGrady 2011 |
| `concept.manoeuvre-warfare` | Πόλεμος ελιγμών | στρατιωτικό, e-sports | tempo, flank, surprise, mobility | MCDP 1 1997; Boyd 1986; Liddell Hart 1954 |
| `concept.morale-cohesion` | Συνοχή και ο ηθικός παράγοντας | στρατιωτικό | mutual-support, defeat-in-detail | Ardant du Picq 1921 |
| `concept.centre-of-gravity` | Κέντρο βάρους | στρατιωτικό | key-terrain, concentration | Clausewitz 1873; Echevarria 2002; JP 5-0 2020; Vego 2007 |
| `concept.decisive-point` | Αποφασιστικά σημεία | στρατιωτικό, e-sports | key-terrain, concentration | Jomini 1862; JP 5-0 2020; Vego 2007 |
| `concept.lines-of-operation` | Γραμμές επιχειρήσεων | στρατιωτικό | avenue-of-approach, interior-lines, flow | Jomini 1862; Vego 2007 |
| `concept.attrition-annihilation` | Στρατηγικές εξόντωσης και εξάντλησης | στρατιωτικό | attrition, envelopment, tempo | Delbrück 1990; Clausewitz 1873 |
| `concept.deep-battle` | Μάχη σε βάθος και επιχειρήσεις βάθους | στρατιωτικό | tempo, flank, concentration, interior-lines | Triandafillov 1994; Isserson 2013; Glantz 1991 |
| `concept.airland-battle` | AirLand Battle | στρατιωτικό, αέρας | combined-arms, tempo, initiative | FM 100-5 1982; Romjue 1984 |
| `concept.mission-command` | Διοίκηση αποστολής (Auftragstaktik) | στρατιωτικό, e-sports | tempo, initiative, mutual-support | Citino 2005; van Creveld 1982; MCDP 1 1997 |
| `concept.exploitation` | Ρήξη και εκμετάλλευση | στρατιωτικό | tempo, pursuit, penetration, flank, defeat-in-detail | Triandafillov 1994; Blumenson 1961; FM 3-90 2023 |
| `concept.fire-and-movement` | Πυρ και κίνηση | στρατιωτικό, e-sports | fire-and-maneuver, mutual-support, cover, combined-arms | ATP 3-21.8 2016; FM 3-21.8 2007; House 1984 |
| `concept.bounding-overwatch` | Εναλλασσόμενη κάλυψη (bounding overwatch) | στρατιωτικό, e-sports | fire-and-maneuver, mutual-support, fields-of-fire, mobility | FM 3-20.15 2007; ATP 3-21.8 2016 |
| `concept.reconnaissance-pull` | Έλξη αναγνώρισης και διείσδυση | στρατιωτικό, e-sports | flank, screening, scouting, tempo | Gudmundsson 1989; Lupfer 1981; FM 3-90-2 2013 |
| `concept.reserve` | Η εφεδρεία | στρατιωτικό, e-sports | tempo, concentration, interior-lines | Clausewitz 1873; FM 3-90 2023 |
| `concept.elastic-defence` | Ελαστική άμυνα και αντεπίθεση | στρατιωτικό | defence-in-depth, kill-zone, withdrawal, reverse-slope, tempo | Lupfer 1981; FM 3-90-1 2013 |
| `concept.kill-chain` | Η αλυσίδα εξόντωσης (εντοπισμός, καθήλωση, παρακολούθηση, στόχευση, εμπλοκή, αξιολόγηση) | στρατιωτικό, αέρας, ναυτικό | tempo, scouting, initiative | JP 3-60 2018; Boyd 1986 |
| `concept.detection-engagement` | Εμβέλεια ανίχνευσης έναντι εμβέλειας εμπλοκής | αέρας, ναυτικό, στρατιωτικό | scouting, bvr, fields-of-fire, initiative | Koopman 1946; Washburn 2002; Hughes & Girrier 2018 |
| `concept.cev` | Αξία αποτελεσματικότητας μάχης | στρατιωτικό, e-sports | exchange-ratio, local-superiority, skill-dispersion | Dupuy 1987; Dupuy 1979; Lawrence 2017; van Creveld 1982 |
| `concept.dispersion` | Διασπορά στο πεδίο της μάχης | στρατιωτικό, e-sports | dispersion, area-fire, mutual-support, concentration | Dupuy 1987; Biddle 2004; Clark & Evans 1954 |
| `concept.cas` | Κοντινή αεροπορική υποστήριξη | αέρας, στρατιωτικό | combined-arms, class-counter, sead | JP 3-09.3 2019 |
| `concept.interdiction` | Αεροπορική αποκοπή | αέρας, στρατιωτικό | avenue-of-approach, interior-lines, tempo | Warden 1988; Pape 1996; JP 3-60 2018 |
| `concept.escort-sweep` | Συνοδεία έναντι σάρωσης μαχητικών | αέρας | air-superiority, initiative, mutual-support | Davis 1993; McFarland & Newton 1991 |
| `concept.boom-zoom` | Μάχη ενέργειας έναντι μάχης στροφών | αέρας | energy-advantage, initiative | Shaw 1985; Boyd et al. 1966 |
| `concept.pursuit-geometry` | Καταδίωξη με προπορεία, καθαρή και με καθυστέρηση | αέρας | energy-advantage, initiative | Shaw 1985 |
| `concept.thach-weave` | Το ζιγκζάγκ του Thach | αέρας | mutual-support, formation, local-superiority | Lundstrom 1984; Shaw 1985 |
| `concept.finger-four` | Το finger-four και το ζεύγος μάχης | αέρας | mutual-support, formation, scouting | Shaw 1985 |
| `concept.fleet-in-being` | Στόλος ύπαρξης | ναυτικό | safe-ground, interior-lines, balance | Corbett 1911; Till 2018 |
| `concept.crossing-the-t` | Διέλευση του T | ναυτικό, στρατιωτικό | crossing-the-t, local-superiority, fields-of-fire, concentration, line-of-battle | Hughes & Girrier 2018; Evans & Peattie 1997 |
| `concept.convoy` | Συνοδεία φορτηγών πλοίων | ναυτικό | mutual-support, scouting, concentration | Waddington 1973; Blackett 1962; Corbett 1911 |
| `concept.a2ad` | Αντιπρόσβαση και περιοχική άρνηση | ναυτικό, αέρας, στρατιωτικό | fields-of-fire, sead, avenue-of-approach | Krepinevich et al. 2003; Till 2018 |
| `concept.strongpoint` | Άμυνα ισχυρού σημείου σε κατοικημένες περιοχές | αστικό, στρατιωτικό | urban-close, kill-zone, mutual-support, vertical | FM 3-06 2006; FM 90-10 1979 |
| `concept.mouseholing` | Διάνοιξη τρυπών στους τοίχους και κίνηση μέσα από κτίρια | αστικό, στρατιωτικό, σχεδιασμός | urban-close, flank, obstacle | FM 90-10 1979; ATP 3-21.8 2016 |
| `concept.siege` | Πολιορκία | στρατιωτικό, αστικό | envelopment, attrition, safe-ground | Vegetius 1767; FM 3-06 2006 |
| `concept.guerrilla` | Αντάρτικος πόλεμος | στρατιωτικό, αστικό | ambush, mobility, surprise, safe-ground | Lawrence 1920; Mao Tse-tung 1961; Deitchman 1962 |
| `concept.counterinsurgency` | Αντεξέγερση | στρατιωτικό, αστικό | scouting, key-terrain, safe-ground | Galula 1964; FM 3-24 2006 |
| `concept.sanctuary` | Καταφύγιο | στρατιωτικό, σχεδιασμός | safe-ground, balance | Galula 1964; Mao Tse-tung 1961 |
| `concept.deception` | Παραπλάνηση (maskirovka) | στρατιωτικό, e-sports | feint, surprise, flank, scouting | Glantz 1989; Sun Tzu 1910 |
| `concept.information-advantage` | Πλεονέκτημα πληροφοριών | στρατιωτικό, e-sports | scouting, initiative, tempo | FM 3-0 2022; Boyd 1986 |
| `concept.economy-rounds` | Γύροι οικονομίας και ρυθμός πόρων | e-sports, σχεδιασμός | economy, balance, tempo | Xenopoulos et al. 2020; Adams & Dormans 2012 |
| `concept.tactical-formations` | Διατάξεις κίνησης: γραμμή, στήλη, σφήνα, κλιμακωτή | στρατιωτικό, e-sports | formation, mutual-support | FM 3-21.8 2007; FM 3-20.15 2007; FM 3-90 2023 |
| `concept.frontal-attack` | Μετωπική επίθεση | στρατιωτικό | frontal-assault, attrition, concentration | FM 3-90 2023; FM 3-90-1 2013; Liddell Hart 1954 |
| `concept.double-envelopment` | Διπλή περικύκλωση (η λαβίδα) | στρατιωτικό | double-envelopment, envelopment, encirclement, flank | FM 3-90 2023; Goldsworthy 2001; Polybius 1889 |
| `concept.encirclement-pocket` | Περικύκλωση και ο θύλακας | στρατιωτικό | encirclement, envelopment, defeat-in-detail | FM 3-90 2023; Glantz & House 1995; Goldsworthy 2001 |
| `concept.penetration` | Διείσδυση και ρήξη | στρατιωτικό | penetration, concentration, local-superiority | FM 3-90 2023; Frieser 2005; Gudmundsson 1989 |
| `concept.pursuit` | Καταδίωξη | στρατιωτικό | pursuit, tempo, withdrawal | FM 3-90-1 2013; FM 3-90 2023; Clausewitz 1873 |
| `concept.retrograde` | Οπισθοχώρηση: υποχώρηση, καθυστέρηση και φυγή | στρατιωτικό | withdrawal, defence-in-depth, mobility | FM 3-90-1 2013; FM 3-90 2023 |
| `concept.feint-demonstration` | Ψευδής επίθεση και επίδειξη | στρατιωτικό, e-sports | feint, surprise, concentration | FM 3-90 2023; Glantz 1989; Liddell Hart 1954 |
| `concept.security-operations` | Προφύλαξη, φρουρά και κάλυψη: ασφάλεια μπροστά από το κύριο σώμα | στρατιωτικό | screening, scouting, surprise | FM 3-90-2 2013; FM 3-90 2023 |
| `concept.bvr-defensive` | Άμυνα απέναντι σε πύραυλο: crank, notch, drag και pump | αέρας | missile-defence, bvr, energy-advantage | Shaw 1985; Michel 1997; Boyd et al. 1966 |
| `concept.bvr-formations` | Διατάξεις πέρα από οπτική επαφή: wall, lead-trail, grinder, pincer | αέρας | bvr, formation, double-envelopment, cap | Shaw 1985; Michel 1997 |
| `concept.angles-energy-fight` | Η μάχη γωνιών και η μάχη ενέργειας | αέρας | angles-fight, energy-advantage | Shaw 1985; Boyd et al. 1966 |
| `concept.strike-package` | Πακέτο κρούσης και η σειρά της καταστολής | αέρας | strike-package, sead, combined-arms | Keaney & Cohen 1993; Werrell 2005; Nordeen 1990 |
| `concept.line-of-battle` | Η γραμμή μάχης | ναυτικό | line-of-battle, formation, crossing-the-t | Mahan 1890; Hughes & Girrier 2018; Corbett 1910 |
| `concept.fatal-funnel` | Η θανάσιμη χοάνη | αστικό, στρατιωτικό, e-sports, σχεδιασμός | fatal-funnel, chokepoint, kill-zone, urban-close, entry | FM 3-06.11 2002; ATP 3-21.8 2016; Department of the Army 2011 |
| `concept.room-clearing` | Εκκαθάριση δωματίου: αιφνιδιασμός, ταχύτητα, ελεγχόμενη βία | αστικό, στρατιωτικό, e-sports | entry, surprise, tempo, initiative, urban-close, utility-support | FM 3-06.11 2002; Department of the Army 2011; MCWP 3-35.3 1998 |
| `concept.points-of-domination` | Σημεία κυριαρχίας | αστικό, στρατιωτικό, e-sports | crossfire, mutual-support, fields-of-fire, entry | FM 3-06.11 2002; Department of the Army 2011 |
| `concept.slicing-the-pie` | Έλεγχος γωνιών: το κόψιμο της πίτας | αστικό, στρατιωτικό, e-sports | peeker-advantage, sightlines, cover, readability | FM 3-06.11 2002 |
| `concept.crossfire` | Διασταυρούμενα πυρά και αλληλοκαλυπτόμενα πεδία πυρός | στρατιωτικό, αστικό, e-sports, σχεδιασμός | crossfire, fields-of-fire, kill-zone, mutual-support | FM 3-21.8 2007; ATP 3-06 2022; FM 3-06.11 2002 |
| `concept.peekers-advantage` | Το πλεονέκτημα του όποιου ρίχνει μια ματιά | e-sports, σχεδιασμός | peeker-advantage, initiative, surprise, readability | Bernier 2001; Tokey et al. 2024; Lee & Chang 2017; Liu et al. 2022 |
| `concept.man-advantage` | Πλεονέκτημα ανδρών στους γύρους αποκλεισμού | e-sports, στρατιωτικό | man-advantage, local-superiority, entry, concentration | Xenopoulos et al. 2022; Xenopoulos et al. 2020; Makarov et al. 2018 |
| `concept.entry-duel` | Είσοδος και η εναρκτήρια μονομαχία | e-sports, αστικό | entry, initiative, action-value, tempo | Xenopoulos et al. 2020; Xenopoulos et al. 2022; FM 3-06.11 2002 |
| `concept.utility-entry` | Βοηθητικά πριν την είσοδο: λάμψη και καπνός | e-sports, αστικό, στρατιωτικό | utility-support, surprise, entry, cover | FM 3-06.11 2002; ATP 3-06 2022; Xenopoulos et al. 2020 |
| `concept.social-force-model` | Μοντέλο κοινωνικής δύναμης για την κίνηση πεζών | σχεδιασμός, αστικό, στρατιωτικό | crowding, lane-formation, panic, territoriality | Helbing & Molnár 1995; Helbing et al. 2005; Moussaïd et al. 2011 |
| `concept.lane-formation` | Σχηματισμός λωρίδων σε αντίθετη ροή | σχεδιασμός, αστικό | lane-formation, flow, avenue-of-approach | Helbing et al. 2005; Helbing & Molnár 1995; Moussaïd et al. 2011 |
| `concept.faster-is-slower` | Το γρηγορότερο είναι αργότερο | σχεδιασμός, αστικό, στρατιωτικό | crowding, chokepoint, panic | Helbing et al. 2000; Garcimartín et al. 2014; Haghani & Sarvi 2018 |
| `concept.fundamental-diagram` | Το θεμελιώδες διάγραμμα των πλήθων | σχεδιασμός, αστικό | crowding, flow | Seyfried et al. 2005; Fruin 1971; Haghani & Sarvi 2018 |
| `concept.trail-formation` | Σχηματισμός μονοπατιών και γραμμές επιθυμίας | σχεδιασμός, στρατιωτικό | lane-formation, flow, avenue-of-approach, key-terrain | Helbing et al. 1997; Helbing et al. 2005 |
| `concept.panic-myth` | Ο πανικός είναι σπάνιος: συλλογική ανθεκτικότητα | στρατιωτικό, αστικό, σχεδιασμός | panic, cohesion, mutual-support | Quarantelli 1954; Drury et al. 2009; Helbing et al. 2000 |
| `concept.boids` | Boids: διαχωρισμός, ευθυγράμμιση, συνοχή | σχεδιασμός, στρατιωτικό | collective-order, cohesion, territoriality | Reynolds 1987; Vicsek & Zafeiris 2012 |
| `concept.vicsek-order` | Παράμετρος τάξης και η εμφάνιση συλλογικής κίνησης | σχεδιασμός, στρατιωτικό, αέρας, ναυτικό | collective-order, coordination | Vicsek et al. 1995; Vicsek & Zafeiris 2012 |
| `concept.collective-states` | Σμήνος, περιστροφή και πολωμένες καταστάσεις | σχεδιασμός, στρατιωτικό, ναυτικό | milling, collective-order | Couzin et al. 2002; Tunstrøm et al. 2013 |
| `concept.effective-leadership` | Αποτελεσματική ηγεσία χωρίς σήματα | στρατιωτικό, e-sports, σχεδιασμός | leadership, coordination, herding | Couzin et al. 2005; Dyer et al. 2009; Krause et al. 2010 |
| `concept.topological-interaction` | Γείτονες κατά αριθμό, όχι κατά απόσταση | αέρας, στρατιωτικό | cohesion, collective-order | Ballerini et al. 2008 |
| `concept.swarm-intelligence` | Ευφυΐα σμήνους | σχεδιασμός, e-sports, στρατιωτικό | coordination, herding, collective-order | Krause et al. 2010; Lorenz et al. 2011 |
| `concept.information-cascade` | Αγέλη και καταρράκτες πληροφοριών | e-sports, σχεδιασμός, στρατιωτικό | herding, conformity | Banerjee 1992; Bikhchandani et al. 1992; Anderson & Holt 1996 |
| `concept.social-loafing` | Κοινωνική χαλαρότητα | e-sports, σχεδιασμός, στρατιωτικό | social-loafing, mutual-support | Latané et al. 1979; Karau & Williams 1993 |
| `concept.diffusion-of-responsibility` | Διάχυση ευθύνης | e-sports, στρατιωτικό | social-loafing, mutual-support | Darley & Latané 1968; Fischer et al. 2011 |
| `concept.primary-group` | Συνοχή της πρωτογενούς ομάδας | στρατιωτικό, e-sports | cohesion, mutual-support, breaking-point | Shils & Janowitz 1948; Siebold 2007; King 2013 |
| `concept.breaking-point` | Σημεία θραύσης και όρια απωλειών | στρατιωτικό | breaking-point, attrition, panic | Dupuy 1987; Rowland 2006; Dupuy 1990 |
| `concept.suppression-effects` | Καταστολή: τι κάνει το πυρ εκτός από το να σκοτώνει | στρατιωτικό, αστικό | suppression, static-exposure, panic | Rowland 2006; Marshall 1947 |
| `concept.fear-in-combat` | Φόβος και άγχος στις αποφάσεις της μάχης | στρατιωτικό, e-sports | panic, suppression, loss-chasing | Stouffer & et al. 1949; Starcke & Brand 2012 |
| `concept.choking` | Κατάρρευση υπό πίεση | e-sports | panic, loss-chasing, hot-hand | Baumeister 1984 |
| `concept.prospect-theory` | Θεωρία προοπτικής και αποστροφή της απώλειας | e-sports, σχεδιασμός | loss-chasing | Kahneman & Tversky 1979; Tversky & Kahneman 1992 |
| `concept.break-even` | Επίδραση του σημείου ισορροπίας και των «χρημάτων του καζίνου» | e-sports | loss-chasing | Thaler & Johnson 1990; Post et al. 2008 |
| `concept.tilt` | Tilt (εκνευρισμός) | e-sports | loss-chasing, panic | Smith et al. 2009 |
| `concept.sunk-cost` | Κόστος που έχει ήδη γίνει | e-sports, στρατιωτικό | loss-chasing, key-terrain, attrition | Arkes & Blumer 1985 |
| `concept.hot-hand` | Το «καυτό χέρι» και η πλάνη του | e-sports | hot-hand, skill-dispersion | Gilovich et al. 1985; Bar-Eli et al. 2006; Miller & Sanjurjo 2018 |
| `concept.mixed-strategy` | Μικτές στρατηγικές: να είσαι απρόβλεπτος | e-sports, σχεδιασμός, στρατιωτικό | mixed-strategy, balance | von Neumann & Morgenstern 1944; Walker & Wooders 2001; Wald & Wolfowitz 1940 |
| `concept.shared-mental-models` | Κοινά νοητικά πρότυπα | e-sports, στρατιωτικό | coordination, leadership | Mohammed et al. 2010; DeChurch & Mesmer-Magnus 2010 |
| `concept.teamwork-components` | Τα συστατικά της ομαδικής εργασίας | e-sports, στρατιωτικό | coordination, leadership, mutual-support | Salas et al. 2005 |
| `concept.virtual-worlds-labs` | Εικονικοί κόσμοι ως εργαστήρια συμπεριφοράς | σχεδιασμός, e-sports | interaction-network, contagion, territoriality, coordination | Bainbridge 2007; Castronova 2005; Yee et al. 2007 |
| `concept.proxemics-territory` | Προσωπικός χώρος και έδαφος | σχεδιασμός, αστικό | territoriality, cohesion, crowding | Hall 1966; Altman 1975; Yee et al. 2007 |
| `concept.interaction-networks` | Δίκτυα αλληλεπίδρασης: κόμβοι και ασθενείς δεσμοί | e-sports, σχεδιασμός | interaction-network, coordination | Barabási & Albert 1999; Granovetter 1973; Newman 2003 |

### Μέθοδοι (37) {#methods-37}

| αναγνωριστικό | τίτλος | μοτίβα | πηγές |
|---|---|---|---|
| `method.lanchester-fit` | Προσαρμογή των εκθετών του Lanchester σε δεδομένα εμπλοκών | attrition, aimed-fire, area-fire, concentration | Engel 1954; Bracken 1995; Fricker 1998; Hartley & Helmbold 1995; Lucas & Turkes 2004; McCullagh & Nelder 1989 |
| `method.exchange-ratio` | Λόγος ανταλλαγής ανά πλευρά και ανά τόπο | exchange-ratio, kill-zone | Morse & Kimball 1951; Gini 1912; Dupuy 1979 |
| `method.force-ratio` | Τοπικός λόγος δύναμης τη στιγμή κάθε νεκρού | local-superiority, concentration, defeat-in-detail, bvr | Lanchester 1916; Dupuy 1987; Mearsheimer 1989; Washburn & Kress 2009 |
| `method.viewshed` | Ορατότητα: πεδία πυρός με γραμμή θέασης | fields-of-fire, sightlines, cover, reverse-slope | Fisher 1993; ATP 2-01.3 2019; FM 5-33 1990; Kendall 1938 |
| `method.energy-state` | Ειδική ενέργεια στους νεκρούς και τους θανάτους (αέρας) | energy-advantage, air-superiority | Boyd et al. 1966; Shaw 1985; Mann & Whitney 1947 |
| `method.key-terrain` | Επιμονή των σημείων έντασης ματς μετά από ματς | key-terrain, flow | FM 3-90 2023; Drachen & Canossa 2009; Kendall 1938 |
| `method.trades` | Ρυθμός ανταλλαγών (αμοιβαία υποστήριξη) | mutual-support, defeat-in-detail | Xenopoulos et al. 2020; Schubert et al. 2016; FM 3-21.8 2007 |
| `method.initiative` | Εμπλοκές και πλεονέκτημα του πρώτου νεκρού | initiative, tempo, fleet-salvo, surprise | Hughes 1995; Boyd 1986; Schubert et al. 2016; Xenopoulos et al. 2020 |
| `method.spatial-autocorrelation` | Χωρική αυτοσυσχέτιση των θανάτων (Moran's I) | kill-zone, flow, key-terrain | Moran 1950; Anselin 1995; Getis & Ord 1992 |
| `method.rate-baseline` | Ρυθμοί σε σχέση με τη δική βάση του χάρτη, με έλεγχο FDR | exchange-ratio, safe-ground, kill-zone | Benjamini & Hochberg 1995; Kulldorff 1997; Getis & Ord 1992; Drachen & Canossa 2009 |
| `method.ipb` | Προετοιμασία του πεδίου της μάχης από πληροφορίες (IPB) | key-terrain, avenue-of-approach, obstacle, fields-of-fire | ATP 2-01.3 2019; FM 34-130 1994 |
| `method.rating-models` | Μοντέλα βαθμολόγησης ζευγαρωτών συγκρίσεων (Elo, Glicko, TrueSkill) | skill-dispersion, balance | Elo 1978; Bradley & Terry 1952; Glickman 1999; Herbrich et al. 2007; Minka et al. 2018 |
| `method.win-probability` | Πιθανότητα νίκης και αποτίμηση ενεργειών | initiative, economy, skill-dispersion | Xenopoulos et al. 2020; Hodge et al. 2021; Makarov et al. 2018; Cervone et al. 2016 |
| `method.space-control` | Έλεγχος χώρου και έλεγχος γηπέδου | key-terrain, flow, local-superiority | Fernández & Bornn 2018; Spearman 2018; Goldsberry 2012 |
| `method.salvo-fit` | Εξίσωση σάλβου προσαρμοσμένη σε πλοία σε επαφή | fleet-salvo, initiative, scouting, attrition | Hughes 1995; Hughes 2000; Armstrong 2005; Hughes & Girrier 2018 |
| `method.combat-power` | Λόγος μαχητικής αποτελεσματικότητας ανά ώρα μονάδας σε δράση | exchange-ratio, balance, local-superiority, skill-dispersion | Dupuy 1979; Dupuy 1987; Dupuy 1990; Rotte & Schmidt 2003; Biddle 2004 |
| `method.engagement-ranges` | Εμβέλειες ανίχνευσης προς εμπλοκή και εμπλοκής | bvr, fields-of-fire, scouting, sightlines | Weapons Systems Evaluation Group 1967; Ault 1969; Keaney & Cohen 1993; Shaw 1985; Koopman 1946 |
| `method.kill-chain` | Χρονισμός αλυσίδας εξόντωσης | tempo, initiative, surprise | Boyd 1986; Osinga 2007; Weapons Systems Evaluation Group 1967 |
| `method.dispersion` | Διασπορά έναντι μεριδίου νεκρών (συγκέντρωση δύναμης στον χρόνο) | concentration, area-fire, local-superiority, mutual-support | Lanchester 1916; Biddle 2004; Clausewitz 1873; Jomini 1862 |
| `method.sortie-attrition` | Ρυθμός απωλειών και νεκροί ανά εξόρμηση | air-superiority, exchange-ratio, attrition | Keaney & Cohen 1993; Morse & Kimball 1951; Overy 2000; Weapons Systems Evaluation Group 1967 |
| `method.round-win-probability` | Μοντέλο πιθανότητας νίκης γύρου | action-value, man-advantage, entry, clutch | Xenopoulos et al. 2022; Lock & Nettleton 2014; Robberechts et al. 2021; Brier 1950; Guo et al. 2017; Pakdaman Naeini et al. 2015 |
| `method.win-probability-added` | Αξία ενέργειας: πιθανότητα νίκης που προστέθηκε | action-value, entry, utility-support, mutual-support | Xenopoulos et al. 2020; Maymin 2021; Fernández et al. 2021; Pollard & Reep 1997; Decroos et al. 2019 |
| `method.adjusted-plus-minus` | Προσαρμοσμένο plus-minus με παλινδρόμηση ridge (RAPM) | skill-dispersion, action-value, mutual-support | Sill 2010; Macdonald 2012; Hoerl & Kennard 1970 |
| `method.empirical-bayes` | Συρρίκνωση: εμπειρικό Bayes | skill-dispersion, action-value, clutch | Efron & Morris 1975 |
| `method.expected-kills` | Αναμενόμενα αποτελέσματα: από τα αναμενόμενα γκολ στις αναμενόμενες μονομαχίες | clutch, action-value, peeker-advantage, sightlines | Rathke 2017; Pollard & Reep 1997; Spearman 2018 |
| `method.setups-rotations` | Μέτρηση στημάτων, εναλλαγών και ενέδρων παρατήρησης | rotation, lurk, interior-lines, concentration, flank | Benjamini & Hochberg 1995 |
| `method.reflection-problem` | Το πρόβλημα της αντανάκλασης: αντιγραφή ή κοινή αιτία | herding, conformity | Manski 1993 |
| `method.streak-correction` | Σειρές με διόρθωση για πεπερασμένη ακολουθία | hot-hand | Miller & Sanjurjo 2018; Phipson & Smyth 2010 |
| `method.order-parameters` | Παράμετροι πόλωσης και περιστροφής | collective-order, milling | Vicsek et al. 1995; Couzin et al. 2002; Tunstrøm et al. 2013 |
| `method.lagged-heading` | Ηγέτες από τη συσχέτιση της κατεύθυνσης με χρονική υστέρηση | leadership, coordination | Nagy et al. 2010; Couzin et al. 2005 |
| `method.route-cascade` | Έλεγχος διαδρομής καταρράκτη για την αγέλη | herding, conformity | Bikhchandani et al. 1992; Manski 1993; Phipson & Smyth 2010 |
| `method.lane-segregation` | Διαχωρισμός λωρίδων και επιμονή μονοπατιών | lane-formation, flow | Helbing et al. 2005; Helbing et al. 1997 |
| `method.straggler-hazard` | Κίνδυνος του καθυστερημένου | cohesion, mutual-support, defeat-in-detail | Moussaïd et al. 2010; Siebold 2007 |
| `method.breaking-curve` | Καμπύλη θραύσης | breaking-point, attrition | Dupuy 1987; Rowland 2006 |
| `method.suppression-response` | Αντίδραση στα εισερχόμενα πυρά | suppression | Rowland 2006 |
| `method.risk-after-outcome` | Ρίσκο μετά από απώλεια ή κέρδος | loss-chasing | Thaler & Johnson 1990; Miller & Sanjurjo 2018 |
| `method.buy-agreement` | Συμφωνία αγορών (kappa του Fleiss) | conformity, economy, coordination | Fleiss 1971; Phipson & Smyth 2010 |

### Ιστορικές περιπτώσεις (277) {#historical-cases-277}

| αναγνωριστικό | περίπτωση | πότε | κλίμακα | μοτίβα | πηγές |
|---|---|---|---|---|---|
| `case.thermopylae` | Θερμοπύλες | 480 π.Χ. | μάχη | chokepoint, kill-zone, local-superiority, flank | Herodotus 1858 |
| `case.salamis` | Σαλαμίνα | 480 π.Χ. | μάχη | chokepoint, local-superiority, concentration | Herodotus 1858; Strauss 2004 |
| `case.marathon` | Μαραθώνας | 490 π.Χ. | μάχη | envelopment, tempo, concentration | Herodotus 1858 |
| `case.leuctra` | Λεῦκτρα | 371 π.Χ. | μάχη | concentration, local-superiority | Xenophon 1897 |
| `case.gaugamela` | Γαυγάμηλα | 331 π.Χ. | μάχη | concentration, tempo, flank | Arrian 1893 |
| `case.trasimene` | Λίμνη Τρασιμένο | 217 π.Χ. | μάχη | ambush, surprise, kill-zone, chokepoint | Polybius 1889 |
| `case.cannae` | Κάννες | 216 π.Χ. | μάχη | double-envelopment, envelopment, encirclement, local-superiority, concentration, attrition | Polybius 1889; Goldsworthy 2001 |
| `case.teutoburg` | Δάσος του Τεοβούργιου | μ.Χ. 9 | μάχη | ambush, surprise, chokepoint, obstacle | Tacitus 1876 |
| `case.hastings` | Χέιστινγκς | 1066 | μάχη | high-ground, key-terrain, surprise | Morillo 1996 |
| `case.stirling-bridge` | Γέφυρα του Στέρλινγκ | 1297 | μάχη | defeat-in-detail, chokepoint, local-superiority | Barrow 1965 |
| `case.agincourt` | Αζενκούρ | 1415 | μάχη | chokepoint, kill-zone, fields-of-fire, open-ground | Curry 2005 |
| `case.leuthen` | Λόιτεν | 1757 | μάχη | concentration, feint, flank, surprise, interior-lines | Showalter 1996 |
| `case.austerlitz` | Αουστερλίτς | 1805 | μάχη | key-terrain, high-ground, concentration, surprise | Chandler 1966 |
| `case.trafalgar` | Τραφάλγκαρ | 1805 | μάχη | concentration, line-of-battle, local-superiority, penetration, initiative | Corbett 1910; Mahan 1890 |
| `case.waterloo` | Βατερλό | 1815 | μάχη | reverse-slope, key-terrain, safe-ground, attrition | Siborne 1844 |
| `case.fredericksburg` | Φρέντερικσμπεργκ: Λόφοι Μάρυ | 1862 | εμπλοκή | kill-zone, open-ground, cover, fields-of-fire | US War Department 1888 |
| `case.little-round-top` | Γκέτισμπεργκ: Little Round Top | 1863 | εμπλοκή | key-terrain, high-ground, fields-of-fire | Coddington 1968 |
| `case.picketts-charge` | Γκέτισμπεργκ: Η έφοδος του Πίκετ | 1863 | εμπλοκή | frontal-assault, open-ground, kill-zone, fields-of-fire, envelopment | Coddington 1968 |
| `case.isandlwana` | Ισαντλβάνα | 1879 | μάχη | envelopment, defeat-in-detail, surprise | Knight 2002 |
| `case.rorkes-drift` | Ρορκς Ντριφτ | 1879 | εμπλοκή | cover, kill-zone, mutual-support, local-superiority | Knight 2002 |
| `case.tannenberg` | Τάνενμπεργκ | 1914 | εκστρατεία | interior-lines, defeat-in-detail, double-envelopment, encirclement, concentration, envelopment | Showalter 1991 |
| `case.somme-1916` | Η Σόμη, η πρώτη ημέρα | 1 Ιουλίου 1916 | μάχη | open-ground, frontal-assault, kill-zone, attrition, static-exposure | Middlebrook 1971; Biddle 2004 |
| `case.verdun` | Βερντέν | 1916 | εκστρατεία | attrition, key-terrain, kill-zone | Horne 1962 |
| `case.jutland` | Γιούτλαντ | 1916 | μάχη | crossing-the-t, line-of-battle, scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1923 |
| `case.suomussalmi` | Σουομουσάλμι | 1939-40 | μάχη | defeat-in-detail, ambush, mobility, envelopment | Trotter 1991 |
| `case.ardennes-1940` | Σεντάν και Αρδέννες | Μάιος 1940 | εκστρατεία | penetration, flank, surprise, tempo, avenue-of-approach | Frieser 2005 |
| `case.arras-1940` | Αντεπίθεση στο Αρράς | 21 Μαΐου 1940 | εμπλοκή | combined-arms, class-counter, surprise | Frieser 2005 |
| `case.battle-of-britain` | Μάχη της Βρετανίας | Ιούλ.-Οκτ. 1940 | εκστρατεία | air-superiority, interior-lines, scouting, concentration | Overy 2000; Bungay 2000 |
| `case.battle-of-atlantic` | Μάχη του Ατλαντικού: επιχειρησιακή έρευνα για τα συνοδευόμενα convoy | 1939-45 | εκστρατεία | scouting, concentration, mutual-support | Blackett 1962; Morse & Kimball 1951 |
| `case.midway` | Μίντγουεϊ | Ιούνιος 1942 | μάχη | fleet-salvo, scouting, initiative, surprise | Parshall & Tully 2005 |
| `case.el-alamein` | Δεύτερο Ελ Αλαμέιν | Οκτ.-Νοέμ. 1942 | μάχη | attrition, obstacle, kill-zone, combined-arms | Barr 2004 |
| `case.kasserine` | Πέρασμα Κασερίν | Φεβ. 1943 | μάχη | mutual-support, defeat-in-detail, key-terrain | Blumenson 1967 |
| `case.stalingrad` | Στάλινγκραντ | Αύγ. 1942-Φεβ. 1943 | εκστρατεία | encirclement, urban-close, attrition, double-envelopment, vertical, envelopment | Beevor 1998; Glantz & House 1995 |
| `case.kursk` | Κουρσκ | Ιούλ. 1943 | εκστρατεία | defence-in-depth, attrition, obstacle, fields-of-fire, kill-zone | Glantz & House 1999; Zetterling & Frankson 2000; Lucas & Turkes 2004 |
| `case.prokhorovka` | Προχορόφκα | 12 Ιουλίου 1943 | εμπλοκή | exchange-ratio, fields-of-fire, open-ground, local-superiority | Zetterling & Frankson 2000; Glantz & House 1999 |
| `case.villers-bocage` | Βιλέρ-Μποκάζ | 13 Ιουνίου 1944 | εμπλοκή | ambush, kill-zone, chokepoint, class-counter | Forty 2004 |
| `case.normandy-bocage` | Φράχτες της Νορμανδίας (bocage) | Ιούν.-Ιούλ. 1944 | εκστρατεία | cover, combined-arms, fields-of-fire, urban-close | Doubler 1994; Blumenson 1961 |
| `case.cobra` | Επιχείρηση Cobra | Ιούλ. 1944 | εκστρατεία | concentration, tempo, local-superiority | Blumenson 1961 |
| `case.leyte-gulf` | Κόλπος Λέιτε | Οκτ. 1944 | μάχη | scouting, concentration, chokepoint, surprise | Morison 1958; Cutler 1994 |
| `case.bastogne` | Μπαστόν | Δεκ. 1944 | μάχη | key-terrain, interior-lines, mutual-support | Cole 1965 |
| `case.tsushima` | Τσουσίμα | Μάιος 1905 | μάχη | crossing-the-t, concentration, line-of-battle, local-superiority, fields-of-fire | Evans & Peattie 1997 |
| `case.inchon` | Ιντσόν | Σεπτ. 1950 | εκστρατεία | flank, surprise, interior-lines | Heinl 1968 |
| `case.mig-alley` | Η «Λεωφόρος MiG» | 1950-53 | εκστρατεία | air-superiority, exchange-ratio, skill-dispersion, energy-advantage | Werrell 2005 |
| `case.dien-bien-phu` | Ντιέν Μπιέν Φου | 1954 | μάχη | high-ground, fields-of-fire, key-terrain, attrition | Fall 1966 |
| `case.ia-drang` | Ια Ντραγκ: LZ X-Ray | Νοέμ. 1965 | εμπλοκή | mutual-support, combined-arms, mobility | Moore & Galloway 1992 |
| `case.operation-bolo` | Επιχείρηση Bolo | 2 Ιαν. 1967 | εμπλοκή | feint, surprise, ambush, initiative, energy-advantage | Michel 1997 |
| `case.valley-of-tears` | Γκολάν: Η Κοιλάδα των Δακρύων | Οκτ. 1973 | μάχη | fields-of-fire, exchange-ratio, high-ground, kill-zone, obstacle | Herzog 1975; Rabinovich 2004; Kahalani 1984 |
| `case.chinese-farm` | Σινάι: Η Κινέζικη Φάρμα | Οκτ. 1973 | μάχη | combined-arms, class-counter, kill-zone | Herzog 1975; Rabinovich 2004 |
| `case.bekaa-1982` | Κοιλάδα Μπεκάα (Επιχείρηση Mole Cricket 19) | Ιούν. 1982 | μάχη | sead, air-superiority, strike-package, scouting, exchange-ratio | Lambeth 1984 |
| `case.falklands` | Αεροπορικός πόλεμος των Φώκλαντ | Μάιος-Ιούν. 1982 | εκστρατεία | air-superiority, kill-zone, exchange-ratio, chokepoint | Ethell & Price 1983; Woodward & Robinson 1992 |
| `case.desert-storm-air` | Αεροπορική εκστρατεία της Desert Storm | Ιαν.-Φεβ. 1991 | εκστρατεία | air-superiority, sead, bvr, tempo | Keaney & Cohen 1993; Hallion 1992 |
| `case.73-easting` | 73 Easting | 26 Φεβ. 1991 | εμπλοκή | exchange-ratio, initiative, fields-of-fire, surprise | Krause 1991; Bourque 2002; Biddle 2004 |
| `case.mogadishu` | Μογκαντίσου | Οκτ. 1993 | εμπλοκή | urban-close, kill-zone, avenue-of-approach, vertical | Bowden 1999 |
| `case.grozny` | Γκρόζνι | Δεκ. 1994-Φεβ. 1995 | μάχη | vertical, urban-close, combined-arms, class-counter, ambush | Grau 1997; FM 3-06 2006 |
| `case.hue` | Χουέ | Ιαν.-Μαρ. 1968 | μάχη | urban-close, attrition, combined-arms | Nolan 1983 |
| `case.kosovo-1999` | Αεροπορική εκστρατεία του Κοσόβου | Μαρ.-Ιούν. 1999 | εκστρατεία | sead, scouting, static-exposure | Lambeth 2001 |
| `case.fallujah` | Φαλούτζα (Επιχείρηση Al Fajr) | Νοέμ. 2004 | μάχη | combined-arms, urban-close, mutual-support, envelopment | Matthews 2006 |
| `case.mosul` | Μοσούλη | 2016-17 | εκστρατεία | urban-close, attrition, vertical, ambush | Arnold & Fiore 2019 |
| `case.kadesh` | Κάδες | περ. 1274 π.Χ. | μάχη | surprise, ambush, scouting, mutual-support | Healy 1993 |
| `case.issus` | Ισσός | 333 π.Χ. | μάχη | chokepoint, concentration, local-superiority, tempo | Arrian 1893 |
| `case.zama` | Ζάμα | 202 π.Χ. | μάχη | class-counter, envelopment, combined-arms | Polybius 1889; Livy 1905 |
| `case.carrhae` | Κάρρες | 53 π.Χ. | μάχη | class-counter, open-ground, mobility, attrition | Plutarch 1916 |
| `case.pharsalus` | Φάρσαλος | 48 π.Χ. | μάχη | class-counter, flank, concentration | Caesar 1869 |
| `case.adrianople` | Αδριανούπολη | μ.Χ. 378 | μάχη | envelopment, surprise, scouting, defeat-in-detail | Ammianus Marcellinus 1862 |
| `case.yarmouk` | Γιαρμούκ | μ.Χ. 636 | μάχη | mobility, key-terrain, attrition, envelopment | Kennedy 2007 |
| `case.manzikert` | Μαντζικέρτ | 1071 | μάχη | mobility, ambush, mutual-support, defeat-in-detail | Haldon 2001 |
| `case.hattin` | Χαττίν | 1187 | μάχη | attrition, key-terrain, envelopment, static-exposure | Smail 1956 |
| `case.bannockburn` | Μπάνοκμπερν | 1314 | μάχη | chokepoint, obstacle, key-terrain, local-superiority | Barrow 1965 |
| `case.crecy` | Κρεσύ | 1346 | μάχη | fields-of-fire, kill-zone, high-ground, class-counter | Sumption 1990 |
| `case.poitiers-1356` | Πουατιέ | 1356 | μάχη | cover, obstacle, flank, fields-of-fire | Sumption 1990 |
| `case.grunwald-1410` | Γκρουνβάλντ (Τάνενμπεργκ) | 1410 | μάχη | envelopment, attrition, flank, local-superiority | Turnbull 2003 |
| `case.breitenfeld` | Μπράιτενφελντ | 1631 | μάχη | combined-arms, mobility, flank, interior-lines | Roberts 1958 |
| `case.blenheim` | Μπλένχαϊμ | 1704 | μάχη | concentration, local-superiority, kill-zone | Chandler 1973 |
| `case.poltava` | Πολτάβα | 1709 | μάχη | fields-of-fire, obstacle, defeat-in-detail, attrition | Englund 2003 |
| `case.rossbach` | Ροσμπάχ | 1757 | μάχη | surprise, flank, tempo, reverse-slope | Showalter 1996 |
| `case.saratoga` | Σαρατόγκα | 1777 | εκστρατεία | obstacle, key-terrain, attrition, fields-of-fire | Ketchum 1997 |
| `case.yorktown` | Γιορκτάουν | 1781 | μάχη | envelopment, key-terrain, attrition | Greene 2005 |
| `case.jena-auerstedt` | Γενά-Άουερσταντ | 1806 | μάχη | tempo, mobility, defeat-in-detail, local-superiority | Chandler 1966 |
| `case.borodino` | Μποροδίνο | 1812 | μάχη | attrition, fields-of-fire, key-terrain | Chandler 1966 |
| `case.leipzig` | Λειψία | 1813 | μάχη | envelopment, interior-lines, concentration, chokepoint | Chandler 1966 |
| `case.antietam` | Αντιέταμ | 1862 | μάχη | defeat-in-detail, attrition, chokepoint, interior-lines | Sears 1983 |
| `case.chancellorsville` | Τσάνσελορσβιλ | 1863 | μάχη | flank, surprise, cover | Sears 1996 |
| `case.vicksburg` | Βικσμπέργκ | 1863 | εκστρατεία | mobility, key-terrain, interior-lines, defeat-in-detail | Ballard 2004 |
| `case.koniggratz` | Κένιγκρατς (Σάδοβα) | 1866 | μάχη | envelopment, class-counter, tempo, fields-of-fire | Wawro 1996 |
| `case.sedan-1870` | Σεντάν | 1870 | μάχη | envelopment, high-ground, fields-of-fire | Howard 1961 |
| `case.mukden` | Μουκντέν | 1905 | μάχη | attrition, envelopment, fields-of-fire | Connaughton 1988 |
| `case.omdurman` | Ομντουρμάν | 1898 | μάχη | fields-of-fire, open-ground, exchange-ratio, class-counter | Churchill 1899 |
| `case.spion-kop` | Σπάιον Κόπ | 1900 | εμπλοκή | high-ground, fields-of-fire, static-exposure, key-terrain | Pakenham 1979 |
| `case.gallipoli` | Καλλίπολη | 1915 | εκστρατεία | high-ground, attrition, kill-zone, key-terrain | Travers 2001 |
| `case.cambrai-1917` | Καμπραί | Νοέμ. 1917 | μάχη | surprise, combined-arms, penetration, class-counter, tempo | Cooper 1967 |
| `case.caporetto` | Καπορέτο | Οκτ.-Νοέμ. 1917 | εκστρατεία | tempo, flank, avenue-of-approach, surprise | Gudmundsson 1989; Rommel 1937 |
| `case.kaiserschlacht` | Η γερμανική εαρινή επίθεση (Επιχείρηση Michael) | Μαρ.-Απρ. 1918 | εκστρατεία | penetration, tempo, surprise, attrition, mobility | Gudmundsson 1989 |
| `case.amiens-1918` | Αμιέν | Αύγ. 1918 | μάχη | combined-arms, surprise, concentration | Prior & Wilson 1992 |
| `case.khalkhin-gol` | Χαλχιν Γκολ (Νομονχάν) | Αύγ. 1939 | μάχη | envelopment, combined-arms, concentration, surprise | Drea 1981; Coox 1985 |
| `case.poland-1939` | Η πολωνική εκστρατεία | Σεπτ. 1939 | εκστρατεία | envelopment, tempo, mobility, air-superiority | Zaloga & Madej 1985 |
| `case.hannut-gembloux` | Αννύ και Ζαμπλού | Μάιος 1940 | μάχη | concentration, class-counter, combined-arms | Frieser 2005 |
| `case.stonne` | Στον | Μάιος 1940 | εμπλοκή | key-terrain, attrition, high-ground | Frieser 2005; Doughty 1990 |
| `case.dunkirk` | Η περίμετρος του Ντάνκιρκ | Μάιος-Ιούν. 1940 | εκστρατεία | withdrawal, obstacle, safe-ground, mutual-support | Frieser 2005; May 2000 |
| `case.beda-fomm` | Επιχείρηση Compass και Μπέντα Φόμμ | Δεκ. 1940-Φεβ. 1941 | εκστρατεία | mobility, flank, tempo, exchange-ratio | Playfair et al. 1954 |
| `case.crusader` | Επιχείρηση Crusader και Σίντι Ρεζέγκ | Νοέμ.-Δεκ. 1941 | εκστρατεία | defeat-in-detail, combined-arms, attrition, concentration | Playfair et al. 1960 |
| `case.gazala` | Γκαζαλά | Μάιος-Ιούν. 1942 | μάχη | flank, defeat-in-detail, mutual-support, obstacle | Playfair et al. 1960 |
| `case.alam-halfa` | Αλαμ Χάλφα | Αύγ.-Σεπτ. 1942 | μάχη | fields-of-fire, key-terrain, obstacle, air-superiority | Barr 2004 |
| `case.dubno-brody` | Ντούμπνο-Μπρόντι | Ιούν. 1941 | μάχη | defeat-in-detail, combined-arms, air-superiority | Glantz 2001; Glantz & House 1995 |
| `case.kiev-1941` | Περικύκλωση του Κιέβου | Σεπτ. 1941 | εκστρατεία | encirclement, envelopment, double-envelopment, static-exposure, tempo | Glantz & House 1995; Erickson 1975 |
| `case.moscow-1941` | Μόσχα | Οκτ. 1941-Ιαν. 1942 | εκστρατεία | attrition, tempo, interior-lines, surprise | Glantz & House 1995; Erickson 1975 |
| `case.rzhev-mars` | Ρζέφ και Επιχείρηση Mars | 1942 | εκστρατεία | attrition, kill-zone, defeat-in-detail | Glantz 1999 |
| `case.second-kharkov` | Δεύτερο Χάρκοβο | Μάιος 1942 | μάχη | envelopment, flank, tempo | Glantz 1998 |
| `case.third-kharkov` | Τρίτο Χάρκοβο (το αντίχτυπο του Manstein) | Φεβ.-Μαρ. 1943 | εκστρατεία | tempo, flank, interior-lines, local-superiority | Glantz 1991; Manstein 1958 |
| `case.bagration` | Επιχείρηση Μπαγκρατιόν | Ιούν.-Αύγ. 1944 | εκστρατεία | concentration, envelopment, surprise, tempo | Zaloga 1996; Glantz & House 1995 |
| `case.korsun` | Θύλακας Κορσούν-Τσερκάσι | Ιαν.-Φεβ. 1944 | μάχη | encirclement, envelopment, attrition, open-ground | Nash 2002; Glantz & House 1995 |
| `case.kamenets-podolsky` | Θύλακας Καμενέτς-Ποντόλσκι | Μαρ.-Απρ. 1944 | εκστρατεία | mobility, envelopment, interior-lines | Glantz & House 1995 |
| `case.epsom` | Επιχείρηση Epsom | Ιούν. 1944 | μάχη | attrition, key-terrain, cover | D'Este 1983; Hastings 1984 |
| `case.goodwood` | Επιχείρηση Goodwood | Ιούλ. 1944 | μάχη | open-ground, fields-of-fire, combined-arms, exchange-ratio | D'Este 1983; Hastings 1984 |
| `case.totalize` | Επιχείρηση Totalize | Αύγ. 1944 | μάχη | surprise, combined-arms, tempo | Copp 2003 |
| `case.mortain` | Μορτέν | Αύγ. 1944 | μάχη | key-terrain, high-ground, fields-of-fire, air-superiority | Blumenson 1961 |
| `case.falaise` | Θύλακας Φαλαίζ | Αύγ. 1944 | εκστρατεία | encirclement, envelopment, double-envelopment, kill-zone, chokepoint | Blumenson 1961; Hastings 1984 |
| `case.market-garden` | Market Garden και Άρνχεμ | Σεπτ. 1944 | εκστρατεία | chokepoint, avenue-of-approach, tempo, key-terrain | MacDonald 1963; Ryan 1974 |
| `case.aachen` | Άαχεν | Οκτ. 1944 | μάχη | urban-close, combined-arms, envelopment | MacDonald 1963 |
| `case.hurtgen` | Δάσος Χουρτγκεν | Σεπτ. 1944-Φεβ. 1945 | εκστρατεία | attrition, cover, class-counter, ambush | MacDonald 1963 |
| `case.arracourt` | Αρακούρ | Σεπτ. 1944 | μάχη | exchange-ratio, fields-of-fire, mobility, scouting | Cole 1950 |
| `case.st-vith` | Σεν Βιτ | Δεκ. 1944 | μάχη | key-terrain, interior-lines, mobility | Cole 1965; MacDonald 1985 |
| `case.elsenborn` | Ράχη Έλζενμπορν | Δεκ. 1944 | μάχη | high-ground, fields-of-fire, key-terrain, chokepoint | Cole 1965; MacDonald 1985 |
| `case.seelow` | Υψώματα του Ζέλοφ | Απρ. 1945 | μάχη | high-ground, fields-of-fire, attrition, obstacle | Beevor 2002; Glantz & House 1995 |
| `case.berlin-1945` | Βερολίνο | Απρ.-Μάιος 1945 | μάχη | urban-close, combined-arms, attrition, vertical | Beevor 2002 |
| `case.spring-awakening` | Επιχείρηση Spring Awakening | Μαρ. 1945 | μάχη | obstacle, attrition, mobility, kill-zone | Glantz & House 1995 |
| `case.ortona` | Ορτόνα | Δεκ. 1943 | μάχη | urban-close, vertical, kill-zone, ambush | Zuehlke 1999 |
| `case.warsaw-1944` | Εξέγερση της Βαρσοβίας | Αύγ.-Οκτ. 1944 | εκστρατεία | urban-close, attrition, vertical | Davies 2003 |
| `case.tarawa` | Ταράβα | Νοέμ. 1943 | μάχη | open-ground, kill-zone, obstacle, fields-of-fire | Alexander 1993 |
| `case.peleliu` | Πελέλιου | Σεπτ.-Νοέμ. 1944 | μάχη | cover, attrition, high-ground, mutual-support | Gayle 1996 |
| `case.iwo-jima` | Ιβο Τζίμα | Φεβ.-Μαρ. 1945 | μάχη | attrition, aimed-fire, cover, kill-zone | Bartley 1954; Engel 1954 |
| `case.okinawa` | Οκινάουα | Απρ.-Ιούν. 1945 | εκστρατεία | attrition, reverse-slope, mutual-support, fields-of-fire | Appleman et al. 1948 |
| `case.manila-1945` | Μανίλα | Φεβ.-Μαρ. 1945 | μάχη | urban-close, attrition, vertical | Smith 1963 |
| `case.manchuria-1945` | Μαντζουρία (Αυγουστιάτικη Καταιγίδα) | Αύγ. 1945 | εκστρατεία | tempo, avenue-of-approach, surprise, envelopment | Glantz 1983 |
| `case.pusan-perimeter` | Περίμετρος του Πουσάν | Αύγ.-Σεπτ. 1950 | εκστρατεία | interior-lines, mutual-support, obstacle | Appleman 1961 |
| `case.chosin` | Ταμιευτήρας Τσοσίν | Νοέμ.-Δεκ. 1950 | εκστρατεία | envelopment, mutual-support, chokepoint, key-terrain | Montross & Canzona 1957; Appleman 1987 |
| `case.imjin` | Ποταμός Ιμτζίν | Απρ. 1951 | μάχη | mutual-support, key-terrain, defeat-in-detail, attrition | Salmon 2009 |
| `case.kapyong` | Καπγιόνγκ | Απρ. 1951 | μάχη | key-terrain, high-ground, mutual-support, fields-of-fire | O'Neill 1985 |
| `case.pork-chop` | Λόφος Pork Chop | Απρ. και Ιούλ. 1953 | εμπλοκή | attrition, kill-zone, key-terrain | Marshall 1956; Hermes 1966 |
| `case.khe-sanh` | Κε Σανχ | Ιαν.-Απρ. 1968 | μάχη | high-ground, attrition, air-superiority, key-terrain | Shulimson et al. 1997; Prados & Stubbe 1991 |
| `case.dak-to` | Ντακ Το | Νοέμ. 1967 | μάχη | high-ground, attrition, cover | MacGarrigle 1998 |
| `case.hamburger-hill` | Hamburger Hill (Όρος Απ Μπια) | Μάιος 1969 | εμπλοκή | attrition, high-ground, kill-zone | Zaffiri 1988 |
| `case.abu-ageila-1967` | Αμπού Αγκέιλα-Ούμ Κατέφ | Ιούν. 1967 | μάχη | combined-arms, flank, tempo, surprise | Herzog 1982; Pollack 2002 |
| `case.ismailia-1973` | Ισμαηλία | Οκτ. 1973 | μάχη | urban-close, cover, ambush, class-counter | Herzog 1975; Rabinovich 2004 |
| `case.sultan-yacoub` | Σουλτάν Γιακούμπ | Ιούν. 1982 | εμπλοκή | ambush, kill-zone, avenue-of-approach, scouting | Gabriel 1984; Herzog 1982 |
| `case.beirut-1982` | Πολιορκία της Βηρυτού | Ιούν.-Αύγ. 1982 | εκστρατεία | urban-close, envelopment, attrition | Gabriel 1984 |
| `case.bint-jbeil-2006` | Λίβανος 2006: Μπιντ Τζμπέιλ και η απειλή των αντιαρματικών | Ιούλ.-Αύγ. 2006 | εκστρατεία | class-counter, combined-arms, ambush, urban-close | Matthews 2008 |
| `case.fao-1986` | Αλ-Φάου | Φεβ. 1986 | μάχη | surprise, obstacle, attrition | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.basra-1987` | Βασόρα (Karbala-5) | Ιαν.-Φεβ. 1987 | μάχη | attrition, obstacle, kill-zone, fields-of-fire | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.khafji` | Χαφτζί | Ιαν.-Φεβ. 1991 | μάχη | air-superiority, combined-arms, scouting, urban-close | Westermeyer 2008 |
| `case.norfolk-1991` | Στόχος Norfolk | 26-27 Φεβ. 1991 | μάχη | exchange-ratio, initiative, fields-of-fire, combined-arms | Bourque 2002; Scales 1993 |
| `case.medina-ridge` | Ράχη Μεδίνα | 27 Φεβ. 1991 | μάχη | exchange-ratio, fields-of-fire, reverse-slope, air-superiority | Bourque 2002; Scales 1993 |
| `case.wadi-al-batin` | Ψευδείς επιθέσεις στο Wadi al-Batin | Φεβ. 1991 | εκστρατεία | flank, surprise, scouting | Bourque 2002; Scales 1993 |
| `case.nasiriyah` | Νασιρίγια | Μαρ. 2003 | μάχη | ambush, urban-close, avenue-of-approach, readability | Fontenot et al. 2004; Reynolds 2005 |
| `case.objective-peach` | Στόχος Peach | Απρ. 2003 | εμπλοκή | key-terrain, chokepoint, exchange-ratio | Fontenot et al. 2004 |
| `case.thunder-runs` | Οι «Thunder Runs» | Απρ. 2003 | μάχη | tempo, urban-close, class-counter, surprise | Zucchino 2004; Fontenot et al. 2004 |
| `case.debecka-pass` | Πέρασμα Ντεμπέτσκα | Απρ. 2003 | εμπλοκή | class-counter, fields-of-fire, key-terrain | Robinson 2004 |
| `case.ramadi-2006` | Ραμάντι | 2006-07 | εκστρατεία | key-terrain, urban-close, flow, attrition | Michaels 2010 |
| `case.sadr-city-2008` | Σάντρ Σίτι | Μαρ.-Μάιος 2008 | μάχη | obstacle, scouting, urban-close, air-superiority | Johnson et al. 2013 |
| `case.anaconda` | Επιχείρηση Anaconda | Μαρ. 2002 | μάχη | high-ground, scouting, surprise, air-superiority | Kugler 2007; Naylor 2005 |
| `case.wanat` | Βανάτ | Ιούλ. 2008 | εμπλοκή | high-ground, static-exposure, fields-of-fire, surprise | Combat Studies Institute 2010 |
| `case.kamdesh` | Καμντές (COP Keating) | Οκτ. 2009 | εμπλοκή | high-ground, fields-of-fire, static-exposure | Tapper 2012 |
| `case.musa-qala` | Μούσα Κάλα και τα φυλάκια της διμοιρίας | 2006-07 | εκστρατεία | static-exposure, attrition, key-terrain | Farrell 2017 |
| `case.algiers-1957` | Μάχη του Αλγερίου | 1956-57 | εκστρατεία | scouting, urban-close, flow | Horne 1977 |
| `case.rhodesia-fireforce` | Rhodesian Fireforce | 1974-79 | εκστρατεία | mobility, tempo, exchange-ratio, envelopment | Cilliers 1985 |
| `case.sarajevo` | Πολιορκία του Σαραγέβου | 1992-96 | εκστρατεία | high-ground, sightlines, fields-of-fire, kill-zone | Burg & Shoup 1999; Andreas 2008 |
| `case.grozny-2000` | Γκρόζνι 1999-2000 | Δεκ. 1999-Φεβ. 2000 | μάχη | urban-close, combined-arms, attrition, envelopment | Oliker 2001 |
| `case.georgia-2008` | Ρωσο-Γεωργιανός πόλεμος | Αύγ. 2008 | εκστρατεία | chokepoint, tempo, local-superiority | Cohen & Hamilton 2011 |
| `case.zelenopillia` | Ζελενοπίλια | Ιούλ. 2014 | εμπλοκή | surprise, static-exposure, area-fire, scouting | Fox & Rossow 2017 |
| `case.ilovaisk` | Ιλοβάισκ | Αύγ. 2014 | μάχη | envelopment, kill-zone, surprise | Fox & Rossow 2017 |
| `case.debaltseve` | Ντεμπάλτσεβε | Ιαν.-Φεβ. 2015 | μάχη | envelopment, area-fire, attrition, chokepoint | Fox & Rossow 2017 |
| `case.donetsk-airport` | Αεροδρόμιο του Ντόνετσκ | Σεπτ. 2014-Ιαν. 2015 | μάχη | urban-close, attrition, key-terrain, vertical | Fox 2019 |
| `case.hostomel` | Αεροδρόμιο Gostomel | Φεβ. 2022 | εμπλοκή | key-terrain, surprise, defeat-in-detail, tempo | Zabrodskyi et al. 2022; Watling & Reynolds 2022 |
| `case.brovary` | Ο άξονας του Κιέβου και η ενέδρα του Μπροβάρι | Μαρ. 2022 | εμπλοκή | ambush, avenue-of-approach, area-fire, chokepoint | Zabrodskyi et al. 2022 |
| `case.mariupol` | Μαριούπολη και Αζοβστάλ | Φεβ.-Μάιος 2022 | μάχη | urban-close, attrition, envelopment, vertical | Watling & Reynolds 2022 |
| `case.kharkiv-2022` | Αντεπίθεση του Χάρκοβου | Σεπτ. 2022 | εκστρατεία | surprise, tempo, concentration, local-superiority | Watling & Reynolds 2023 |
| `case.bilohorivka` | Διάβαση του Σιβέρσκι Ντονέτς στο Μπιλογκορίβκα | Μάιος 2022 | εμπλοκή | chokepoint, kill-zone, static-exposure, scouting | Zabrodskyi et al. 2022 |
| `case.bakhmut` | Μπαχμούτ | Αύγ. 2022-Μάιος 2023 | μάχη | attrition, urban-close, area-fire | Watling & Reynolds 2023 |
| `case.zaporizhzhia-2023` | Επίθεση της Ζαπορίζια | Ιούν.-Νοέμ. 2023 | εκστρατεία | obstacle, kill-zone, attrition, scouting | Watling & Reynolds 2023 |
| `case.karabakh-2020` | Πόλεμος του Ναγκόρνο-Καραμπάχ | Σεπτ.-Νοέμ. 2020 | εκστρατεία | sead, static-exposure, scouting, class-counter | Shaikh & Rumbaugh 2020 |
| `case.blitz-1940` | Το Μπλιτζ | Σεπτ. 1940-Μάιος 1941 | εκστρατεία | attrition, scouting, air-superiority, surprise | Overy 2013; Murray 1983 |
| `case.barbarossa-air-1941` | Barbarossa: η πρώτη μέρα στον αέρα | 22 Ιουνίου 1941 | μάχη | surprise, static-exposure, air-superiority, initiative | Hardesty 1982; Murray 1983 |
| `case.crete-1941` | Κρήτη | Μάιος 1941 | μάχη | key-terrain, air-superiority, attrition, combined-arms | Beevor 1991 |
| `case.malta-siege` | Η πολιορκία της Μάλτας | 1940-1942 | εκστρατεία | key-terrain, attrition, air-superiority, interior-lines | Holland 2003; Roskill 1956 |
| `case.stalingrad-airlift` | Η αεροπορική γέφυρα του Στάλινγκραντ | Νοέμ. 1942-Φεβ. 1943 | εκστρατεία | attrition, economy, air-superiority | Hayward 1998; Murray 1983 |
| `case.kuban-1943` | Αερομαχίες πάνω από την Κουμπάν | Απρ.-Ιούν. 1943 | εκστρατεία | energy-advantage, mutual-support, air-superiority, skill-dispersion | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.kursk-air-1943` | Το Κουρσκ στον αέρα | Ιούλ. 1943 | μάχη | surprise, air-superiority, combined-arms, class-counter | Hardesty & Grinberg 2012 |
| `case.bagration-air-1944` | Επιχείρηση Μπαγκρατιόν στον αέρα | Ιούν.-Αύγ. 1944 | εκστρατεία | air-superiority, concentration, combined-arms, tempo | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.ploesti-1943` | Πλοέστι (Επιχείρηση Tidal Wave) | 1 Αυγ. 1943 | εμπλοκή | kill-zone, sead, surprise, open-ground | Dugan & Stewart 1962; Craven & Cate 1949 |
| `case.chastise-1943` | Η επιδρομή στα φράγματα (Επιχείρηση Chastise) | 16-17 Μαΐου 1943 | εμπλοκή | surprise, key-terrain, class-counter, attrition | Sweetman 1982 |
| `case.hamburg-1943` | Αμβούργο (Επιχείρηση Gomorrah) | Ιούλ.-Αύγ. 1943 | μάχη | sead, surprise, area-fire, scouting | Middlebrook 1980; Overy 2013 |
| `case.schweinfurt-regensburg-1943` | Σβάινφουρτ-Ρέγκενσμπουργκ | 17 Αυγ. 1943 | μάχη | attrition, mutual-support, exchange-ratio, air-superiority | Middlebrook 1983; Craven & Cate 1949 |
| `case.black-thursday-1943` | Δεύτερο Σβάινφουρτ («Μαύρη Πέμπτη») | 14 Οκτ. 1943 | εμπλοκή | attrition, exchange-ratio, mutual-support | Craven & Cate 1949; Caldwell & Muller 2007 |
| `case.big-week-1944` | Η «Μεγάλη Εβδομάδα» (Επιχείρηση Argument) | Φεβ. 1944 | εκστρατεία | air-superiority, attrition, mutual-support, combined-arms | Craven & Cate 1951; Murray 1983; Caldwell & Muller 2007 |
| `case.nuremberg-raid-1944` | Η επιδρομή στη Νυρεμβέργη | 30-31 Μαρ. 1944 | εμπλοκή | ambush, avenue-of-approach, scouting, static-exposure | Middlebrook 1973; Overy 2013 |
| `case.bodenplatte-1945` | Επιχείρηση Bodenplatte | 1 Ιαν. 1945 | μάχη | surprise, static-exposure, attrition, readability | Caldwell & Muller 2007; Murray 1983 |
| `case.bismarck-sea-1943` | Μάχη της Θάλασσας του Μπίσμαρκ | Μαρ. 1943 | μάχη | class-counter, air-superiority, surprise, kill-zone | Morison 1950 |
| `case.rabaul-1943` | Εξουδετέρωση του Ραμπάουλ | 1943-1944 | εκστρατεία | flank, air-superiority, key-terrain, attrition | Morison 1950 |
| `case.philippine-sea-1944` | Θάλασσα των Φιλιππίνων («Marianas Turkey Shoot») | Ιούν. 1944 | μάχη | exchange-ratio, skill-dispersion, scouting, air-superiority | Y'Blood 1981; Morison 1953 |
| `case.black-tuesday-1951` | «Μαύρη Τρίτη» πάνω από το Νάμσι | 23 Οκτ. 1951 | εμπλοκή | class-counter, attrition, mutual-support | Futrell 1983; Werrell 2005 |
| `case.rolling-thunder` | Επιχείρηση Rolling Thunder | 1965-1968 | εκστρατεία | sead, attrition, safe-ground, tempo | Clodfelter 1989; Thompson 2000 |
| `case.thanh-hoa-bridge` | Η γέφυρα του Thanh Hoa | 1965-1972 | εμπλοκή | key-terrain, kill-zone, class-counter, attrition | Thompson 2000 |
| `case.wild-weasel` | Τα «Wild Weasels» | 1965-1973 | εκστρατεία | sead, combined-arms, initiative | Thompson 2000; Werrell 2005 |
| `case.ault-report-1968` | Η έκθεση του Ault και το Top Gun | 1968-1972 | εκστρατεία | skill-dispersion, exchange-ratio, bvr | Ault 1969; Michel 1997 |
| `case.linebacker-i-1972` | Επιχείρηση Linebacker | Μάιος-Οκτ. 1972 | εκστρατεία | class-counter, concentration, key-terrain | Clodfelter 1989; Thompson 2000 |
| `case.linebacker-ii-1972` | Linebacker II («Ο πόλεμος των έντεκα ημερών») | Δεκ. 1972 | εκστρατεία | sead, avenue-of-approach, attrition, readability | Michel 2002; Clodfelter 1989 |
| `case.operation-focus` | Επιχείρηση Focus (Moked) | 5 Ιουν. 1967 | μάχη | surprise, air-superiority, static-exposure, initiative | Oren 2002; Nordeen 1990 |
| `case.war-of-attrition-sam` | Πόλεμος φθοράς: η ζώνη των πυραύλων | 1969-1970 | εκστρατεία | sead, attrition, key-terrain, ambush | Bar-Siman-Tov 1980; Nordeen 1990 |
| `case.sam-umbrella-1973` | Η «ομπρέλα» των SAM πάνω από το κανάλι | Οκτ. 1973 | μάχη | sead, combined-arms, safe-ground, kill-zone | Herzog 1975; Rabinovich 2004; Werrell 2005 |
| `case.osirak-1981` | Οσιράκ (Επιχείρηση Opera) | 7 Ιουν. 1981 | εμπλοκή | surprise, avenue-of-approach, key-terrain | Nordeen 1990 |
| `case.el-dorado-canyon-1986` | Επιχείρηση El Dorado Canyon | 15 Απρ. 1986 | εμπλοκή | tempo, sead, surprise, concentration | Venkus 1992 |
| `case.iran-iraq-air` | Ο αεροπορικός πόλεμος Ιράν-Ιράκ | 1980-1988 | εκστρατεία | attrition, static-exposure, balance | Murray & Woods 2014 |
| `case.black-buck-1982` | Επιδρομές Black Buck | Μάιος-Ιούν. 1982 | εμπλοκή | economy, key-terrain, avenue-of-approach | Ethell & Price 1983 |
| `case.instant-thunder` | Instant Thunder: ο σχεδιασμός της αεροπορικής εκστρατείας του Κόλπου | Αύγ. 1990-Ιαν. 1991 | εκστρατεία | tempo, concentration, sead, key-terrain | Putney 2004; Keaney & Cohen 1993 |
| `case.task-force-normandy-1991` | Task Force Normandy: το πρώτο χτύπημα των Apache | 17 Ιαν. 1991 | εμπλοκή | sead, surprise, initiative, combined-arms | Keaney & Cohen 1993; Atkinson 1993 |
| `case.scud-hunt-1991` | Το μεγάλο κυνήγι των Scud | Ιαν.-Φεβ. 1991 | εκστρατεία | scouting, mobility, static-exposure | Keaney & Cohen 1993; Rosenau 2001 |
| `case.highway-of-death-1991` | Ράχη Μούτλα («Ο δρόμος του θανάτου») | 26-27 Φεβ. 1991 | εμπλοκή | chokepoint, kill-zone, pursuit, withdrawal, open-ground, air-superiority | Atkinson 1993; Keaney & Cohen 1993 |
| `case.anaconda-2002` | Επιχείρηση Anaconda: τα Apache στο Σάχι-Κοτ | Μαρ. 2002 | μάχη | high-ground, kill-zone, scouting, readability | Naylor 2005 |
| `case.karbala-apache-2003` | Η επίθεση των Apache στην Καρμπάλα | 24 Μαρ. 2003 | εμπλοκή | ambush, kill-zone, urban-close, readability | Fontenot et al. 2004 |
| `case.libya-2011` | Η αεροπορική εκστρατεία της Λιβύης | Μαρ.-Οκτ. 2011 | εκστρατεία | air-superiority, sead, scouting | Mueller 2015 |
| `case.nagorno-karabakh-2020` | Ναγκόρνο-Καραμπάχ: drones και αεράμυνα | Σεπτ.-Νοέμ. 2020 | εκστρατεία | sead, class-counter, static-exposure, scouting | Shaikh & Rumbaugh 2020 |
| `case.ukraine-air-2022` | Ουκρανία: ο αμφισβητούμενος αέρας | 2022 | εκστρατεία | sead, mobility, air-superiority, static-exposure | Bronk et al. 2022 |
| `case.hostomel-2022` | Αεροδρόμιο Gostomel | Φεβ. 2022 | εμπλοκή | key-terrain, surprise, attrition | Watling & Reynolds 2022 |
| `case.lam-son-719` | Lam Son 719 | Φεβ.-Μαρ. 1971 | εκστρατεία | kill-zone, attrition, avenue-of-approach, static-exposure | Nolan 1986; Hinh 1979 |
| `case.eagle-claw-1980` | Επιχείρηση Eagle Claw | Απρ. 1980 | εμπλοκή | readability, mutual-support, attrition | Special Operations Review Group (Holloway 1980 |
| `case.afghanistan-stinger` | Αφγανιστάν: τα Stinger | 1986-1989 | εκστρατεία | class-counter, sead, high-ground | Kuperman 1999; Grau 1996 |
| `case.lepanto-1571` | Ναυμαχία της Ναυπάκτου | 1571 | μάχη | class-counter, fields-of-fire, concentration | Guilmartin 1974 |
| `case.spanish-armada-1588` | Η Ισπανική Armada | 1588 | εκστρατεία | mobility, fields-of-fire, surprise, attrition | Mattingly 1959; Martin & Parker 1988 |
| `case.quiberon-bay-1759` | Κόλπος Κιμπερόν | 1759 | μάχη | tempo, initiative, obstacle | Mahan 1890 |
| `case.chesapeake-1781` | Chesapeake (Virginia Capes) | 1781 | μάχη | key-terrain, scouting, interior-lines | Mahan 1890 |
| `case.nile-1798` | Νείλος (Κόλπος Αμπουκίρ) | 1798 | μάχη | concentration, local-superiority, surprise, envelopment | Mahan 1897; Lavery 1998 |
| `case.copenhagen-1801` | Κοπεγχάγη | 1801 | μάχη | attrition, obstacle, fields-of-fire | Mahan 1897 |
| `case.hampton-roads-1862` | Hampton Roads | Μαρ. 1862 | εμπλοκή | class-counter, balance | US Navy Department 1898 |
| `case.lissa-1866` | Λίσσα (Βίς) | 1866 | μάχη | skill-dispersion, concentration, mutual-support | Wilson 1896 |
| `case.yalu-1894` | Γιαλού | 1894 | μάχη | mobility, fields-of-fire, class-counter | Paine 2003; Evans & Peattie 1997 |
| `case.manila-bay-1898` | Κόλπος της Μανίλας | 1898 | μάχη | exchange-ratio, static-exposure, balance | Trask 1981 |
| `case.heligoland-bight-1914` | Κόλπος Χέλιγκολαντ | Αύγ. 1914 | μάχη | concentration, surprise, readability | Corbett 1920 |
| `case.coronel-falklands-1914` | Κορονέλ και Φώκλαντ | Νοέμ.-Δεκ. 1914 | εκστρατεία | class-counter, local-superiority, mobility | Corbett 1920 |
| `case.dogger-bank-1915` | Dogger Bank | Ιαν. 1915 | μάχη | readability, exchange-ratio, initiative | Corbett 1921 |
| `case.river-plate-1939` | Ρίο ντε λα Πλάτα | Δεκ. 1939 | μάχη | envelopment, mutual-support, local-superiority | Pope 1956; Roskill 1954 |
| `case.taranto-1940` | Τάραντας | Νοέμ. 1940 | εμπλοκή | surprise, static-exposure, class-counter | Roskill 1954; Greene & Massignani 1998 |
| `case.matapan-1941` | Ακρωτήριο Ματαπάν | Μαρ. 1941 | μάχη | scouting, surprise, exchange-ratio | Greene & Massignani 1998; Roskill 1954 |
| `case.bismarck-1941` | Στενά της Δανίας και η βύθιση του Μπίσμαρκ | Μάιος 1941 | εκστρατεία | scouting, concentration, class-counter | Kennedy 1974; Roskill 1954 |
| `case.pearl-harbor-1941` | Περλ Χάρμπορ | 7 Δεκ. 1941 | εμπλοκή | surprise, static-exposure, initiative | Prange 1981; Morison 1948 |
| `case.prince-of-wales-repulse-1941` | Prince of Wales και Repulse | 10 Δεκ. 1941 | εμπλοκή | class-counter, air-superiority, open-ground | Middlebrook & Mahoney 1977; Roskill 1954 |
| `case.java-sea-1942` | Θάλασσα της Ιάβας | Φεβ. 1942 | μάχη | mutual-support, fields-of-fire, readability | Morison 1948 |
| `case.coral-sea-1942` | Θάλασσα των Κοραλλίων | Μάιος 1942 | μάχη | scouting, fleet-salvo, initiative | Lundstrom 1984; Morison 1949 |
| `case.savo-island-1942` | Νήσος Σάβο | Αύγ. 1942 | μάχη | surprise, ambush, scouting, readability | Frank 1990; Morison 1949 |
| `case.eastern-solomons-1942` | Ανατολικά Νησιά Σολομώντα | Αύγ. 1942 | μάχη | scouting, fleet-salvo, air-superiority | Lundstrom 1994; Frank 1990 |
| `case.cape-esperance-1942` | Ακρωτήριο Εσπεράνς | Οκτ. 1942 | μάχη | fields-of-fire, surprise, readability | Frank 1990; Hornfischer 2011 |
| `case.santa-cruz-1942` | Νήσοι Σάντα Κρουζ | Οκτ. 1942 | μάχη | attrition, exchange-ratio, skill-dispersion | Lundstrom 1994; Frank 1990 |
| `case.guadalcanal-naval-1942` | Ναυμαχία του Γκουανταλκάναλ | 12-15 Νοέμ. 1942 | μάχη | attrition, fields-of-fire, readability, key-terrain | Hornfischer 2011; Frank 1990 |
| `case.tassafaronga-1942` | Τασαφαρόνγκα | Νοέμ. 1942 | εμπλοκή | class-counter, fields-of-fire, initiative | Frank 1990; Hornfischer 2011 |
| `case.channel-dash-1942` | Η διέλευση της Μάγχης | Φεβ. 1942 | εμπλοκή | surprise, tempo, defeat-in-detail | Roskill 1956 |
| `case.pedestal-1942` | Επιχείρηση Pedestal | Αύγ. 1942 | μάχη | attrition, mutual-support, kill-zone | Roskill 1956; Holland 2003 |
| `case.black-may-1943` | Η «Μαύρη Μάιος» | Μάιος 1943 | εκστρατεία | scouting, combined-arms, exchange-ratio, mutual-support | Blair 1998; Roskill 1956 |
| `case.north-cape-1943` | Βόρειο Ακρωτήριο | Δεκ. 1943 | μάχη | scouting, envelopment, concentration | Roskill 1960 |
| `case.pacific-submarines` | Η αμερικανική υποβρυχιακή εκστρατεία κατά της Ιαπωνίας | 1941-1945 | εκστρατεία | economy, attrition, class-counter | Blair 1975 |
| `case.samar-1944` | Ανοιχτά της Σαμάρ | 25 Οκτ. 1944 | μάχη | mutual-support, surprise, readability, local-superiority | Hornfischer 2004; Cutler 1994 |
| `case.surigao-1944` | Στενά του Σουρίγκαο | 25 Οκτ. 1944 | μάχη | crossing-the-t, chokepoint, kill-zone, concentration, line-of-battle, fields-of-fire | Tully 2009; Morison 1958 |
| `case.okinawa-kamikaze-1945` | Οκινάουα: η εκστρατεία των καμικάζι | Απρ.-Ιούν. 1945 | εκστρατεία | attrition, static-exposure, scouting, kill-zone | Morison 1960 |
| `case.eilat-1967` | Η βύθιση του Eilat | Οκτ. 1967 | εμπλοκή | fleet-salvo, class-counter, safe-ground | Hughes 2000; Rabinovich 1988 |
| `case.latakia-1973` | Λατάκια | Οκτ. 1973 | μάχη | fleet-salvo, class-counter, initiative | Rabinovich 1988; Hughes 2000 |
| `case.belgrano-1982` | Η βύθιση του General Belgrano | 2 Μαΐου 1982 | εμπλοκή | class-counter, scouting, safe-ground | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.sheffield-1982` | Η απώλεια του HMS Sheffield | 4 Μαΐου 1982 | εμπλοκή | fleet-salvo, scouting, static-exposure | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.uss-stark-1987` | USS Stark | 17 Μαΐου 1987 | εμπλοκή | surprise, readability, fleet-salvo | Wise 2007 |
| `case.praying-mantis-1988` | Επιχείρηση Praying Mantis | 18 Απρ. 1988 | μάχη | exchange-ratio, combined-arms, fleet-salvo | Wise 2007 |
| `case.evo-moment-37` | Evo Moment 37 | Αύγ. 2004 | εμπλοκή | tempo, initiative, readability | ESPN 2016 |
| `case.bisu-revolution` | Η επανάσταση του Bisu | Μάρ. 2007 | μάχη | balance, class-counter, mobility | Taylor 2012 |
| `case.dream-coil-ti3` | Το Dream Coil στο The International 2013 | Αύγ. 2013 | εμπλοκή | interior-lines, defeat-in-detail, tempo, initiative | PC Gamer 2013 |
| `case.faker-zed-2013` | Το Zed του Faker απέναντι στον Ryu | Σεπτ. 2013 | εμπλοκή | skill-dispersion, initiative, readability | Riot Games 2013 |
| `case.olofboost` | Το boost στο Overpass | Νοέμ. 2014 | εμπλοκή | sightlines, readability, balance, fields-of-fire | GameSpot 2014 |
| `case.coldzera-jump` | Ο άλτης AWP στο Mirage | Απρ. 2016 | εμπλοκή | surprise, skill-dispersion, chokepoint, local-superiority | PC Gamer 2016 |
| `case.astralis-2018` | Astralis και η εποχή των βοηθητικών | 2018 | εκστρατεία | combined-arms, mutual-support, kill-zone | Upcomer 2018 |
| `case.openai-five-og` | Το OpenAI Five απέναντι στην OG | Απρ. 2019 | μάχη | ai-vs-player, tempo, concentration | Berner et al. 2019 |
| `case.alphastar-2019` | Το AlphaStar φτάνει στο grandmaster | 2019 | εκστρατεία | ai-vs-player, skill-dispersion | Vinyals et al. 2019 |
| `case.desert-storm-left-hook` | Το αριστερό γάντζο (χερσαία επίθεση της Desert Storm) | 24-28 Φεβ. 1991 | εκστρατεία | flank, envelopment, tempo, penetration | Scales 1993; Bourque 2002; Keaney & Cohen 1993 |
| `case.corrupted-blood` | Το περιστατικό Corrupted Blood | Σεπτ. 2005 | εκστρατεία | contagion, panic, herding, territoriality | Balicer 2007; Lofgren & Fefferman 2007 |

### Σχεδιασμός παιχνιδιού και επιπέδων (17) {#game-and-level-design-17}

| αναγνωριστικό | τίτλος | μοτίβα | πηγές |
|---|---|---|---|
| `design.chokepoint` | Στενά στον σχεδιασμό επιπέδων | chokepoint, flow, kill-zone, balance | Totten 2019; Hullett & Whitehead 2010; Güttler & Johansson 2003 |
| `design.flank-routes` | Διαδρομές πλευρικής κίνησης και εναλλακτικά μονοπάτια | flank, flow, avenue-of-approach | Hullett & Whitehead 2010; Totten 2019; Björk & Holopainen 2005 |
| `design.sightlines` | Γραμμές θέασης και απόσταση εμπλοκής | sightlines, fields-of-fire, class-counter, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.cover-placement` | Τοποθέτηση κάλυψης και ρυθμός | cover, open-ground, flow | Totten 2019; Kremers 2009; Hullett & Whitehead 2010 |
| `design.spawn` | Σχεδιασμός αναγέννησης και προστασία αναγέννησης | spawn-pressure, balance, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.symmetry-balance` | Συμμετρική και ασύμμετρη ισορροπία χαρτών | balance, exchange-ratio, key-terrain | Elias et al. 2012; Adams & Dormans 2012; Schell 2008 |
| `design.class-counters` | Ισορροπία κλάσεων και αντίμετρα | class-counter, balance, combined-arms | Sirlin 2006; Elias et al. 2012; Adams & Dormans 2012 |
| `design.flow` | Ροή, κύκλοι και ευανάγνωστες διατάξεις | flow, avenue-of-approach, readability | Lynch 1960; Totten 2019; Alexander et al. 1977; Csikszentmihalyi 1990 |
| `design.economy` | Οικονομίες παιχνιδιών και βρόχοι ανάδρασης | economy, balance, skill-dispersion | Adams & Dormans 2012; Salen & Zimmerman 2003; Koster 2004 |
| `design.matchmaking` | Matchmaking και διασπορά δεξιοτήτων | skill-dispersion, balance | Herbrich et al. 2007; Glickman 1999; Elo 1978 |
| `design.ai-behaviour` | Αντίπαλοι AI ως εξερευνητές επιπέδου | ai-vs-player, readability | Seif El-Nasr et al. 2013; Drachen et al. 2009 |
| `design.meaningful-play` | Ουσιαστικό παιχνίδι και επιλογή | balance, flow, flank | Salen & Zimmerman 2003; Schell 2008; Juul 2005 |
| `design.trading` | Ανταλλαγές και ομαδικό παιχνίδι στα shooters | mutual-support, initiative | Xenopoulos et al. 2020; Schubert et al. 2016 |
| `design.map-control` | Έλεγχος χάρτη | key-terrain, local-superiority, flow | Xenopoulos et al. 2022; Rioult et al. 2014; Fernández & Bornn 2018 |
| `design.heatmaps` | Θερμικοί χάρτες και χωρική τηλεμετρία στον σχεδιασμό | flow, kill-zone, key-terrain | Drachen & Canossa 2009; Wallner & Kriglstein 2013; Hoobler et al. 2004; Kim et al. 2008; Bowman et al. 2012 |
| `design.fun-mastery` | Κυριαρχία, μάθηση και διασκέδαση | readability, skill-dispersion | Koster 2004; Csikszentmihalyi 1990; Schell 2008 |
| `design.buy-economy` | Οικονομίες γύρων και αποφάσεις αγορών | conformity, economy, coordination, mixed-strategy | Xenopoulos et al. 2020; Fleiss 1971 |

### Μελέτες (113) {#studies-113}

| αναγνωριστικό | τίτλος | πηγές |
|---|---|---|
| `study.engel-1954` | Engel: ο νόμος του τετραγώνου του Lanchester στο Iwo Jima | Engel 1954 |
| `study.bracken-1995` | Bracken: μοντέλα Lanchester για τις Αρδένες | Bracken 1995 |
| `study.fricker-1998` | Fricker: ξανά στα μοντέλα φθοράς των Αρδενών | Fricker 1998 |
| `study.lucas-turkes-2004` | Lucas και Turkes: Κουρσκ και Αρδένες | Lucas & Turkes 2004 |
| `study.hartley-helmbold-1995` | Hartley και Helmbold: επικύρωση του νόμου του τετραγώνου | Hartley & Helmbold 1995 |
| `study.drachen-canossa-2009` | Ανάλυση GIS των θανάτων παικτών | Drachen & Canossa 2009; Seif El-Nasr et al. 2013 |
| `study.hoobler-2004` | Lighthouse: απεικόνιση ανταγωνιστικής συμπεριφοράς | Hoobler et al. 2004 |
| `study.xenopoulos-2020` | Αποτίμηση ενεργειών στο Counter-Strike | Xenopoulos et al. 2020 |
| `study.schubert-2016` | Ανίχνευση εμπλοκών στα e-sports | Schubert et al. 2016 |
| `study.red-baron` | Project Red Baron: αερομαχία πάνω από το Βιετνάμ | Weapons Systems Evaluation Group 1967; Michel 1997 |
| `study.dupuy-qjm` | Dupuy: ποσοτική κρίση ιστορικών μαχών | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Biddle: η χρήση της δύναμης εξηγεί τα αποτελέσματα | Biddle 2004 |
| `study.wallner-kriglstein-2013` | Επισκόπηση της οπτικοποίησης δεδομένων παιχνιδιού | Wallner & Kriglstein 2013; Bowman et al. 2012 |
| `study.willard-1962` | Willard: ο Lanchester απέναντι σε τρεις αιώνες χερσαίων μαχών | Willard 1962; Fain 1977 |
| `study.fain-1977` | Fain: εξήντα εμπλοκές του Δεύτερου Παγκοσμίου Πολέμου | Fain 1977; Willard 1962 |
| `study.weiss-1966` | Weiss: μοντέλα μάχης και ο Αμερικανικός Εμφύλιος | Weiss 1966 |
| `study.hartley-1995-attrition` | Hartley: στατιστικό μοντέλο δεδομένων φθοράς | Hartley 1995 |
| `study.helmbold-1995` | Helmbold: ρυθμοί προέλασης στις χερσαίες μάχες | Helmbold 1995 |
| `study.lucas-dinges-2004` | Lucas και Dinges: οι περιστάσεις μετρούν περισσότερο από τον νόμο | Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.kursk-data-base` | Η βάση δεδομένων του Κουρσκ | Lawrence 2015; Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.ardennes-data-base` | Η βάση δεδομένων της εκστρατείας των Αρδενών | Bracken 1995; Fricker 1998; Lucas & Turkes 2004 |
| `study.johnson-mackay-2011` | Johnson και MacKay: η Μάχη της Βρετανίας ως δεδομένα Lanchester | Johnson & MacKay 2011 |
| `study.rotte-schmidt-2003` | Rotte και Schmidt: οι αριθμοί κερδίζουν ακόμη τις μάχες | Rotte & Schmidt 2003 |
| `study.dupuy-attrition` | Dupuy: κανονικότητες στις απώλειες των μαχών | Dupuy 1990; Dupuy 1987 |
| `study.dupuy-tndm` | Το Tactical Numerical Deterministic Model του Dupuy | Dupuy 1990; Lawrence 2017; Dupuy 1987 |
| `study.lawrence-2017` | Lawrence: ο πόλεμος με αριθμούς | Lawrence 2017 |
| `study.vancreveld-1982` | Van Creveld: η μαχητική δύναμη | van Creveld 1982; Dupuy 1987 |
| `study.reiter-stam-2002` | Reiter και Stam: οι δημοκρατίες σε πόλεμο | Reiter & Stam 2002; Desch 2002 |
| `study.epstein-1985` | Epstein: το προσαρμοστικό δυναμικό μοντέλο | Epstein 1985; Epstein 1989 |
| `study.deitchman-1962` | Deitchman: Lanchester και αντάρτικος πόλεμος | Deitchman 1962; Taylor 1983 |
| `study.armstrong-2005` | Armstrong: το στοχαστικό μοντέλο σάλβου | Armstrong 2005; Hughes 1995 |
| `study.hughes-fleet-tactics` | Hughes: οι βάσεις της τακτικής του στόλου | Hughes & Girrier 2018; Hughes 2000 |
| `study.mearsheimer-epstein` | Η συζήτηση για τον κανόνα 3:1 | Mearsheimer 1989; Epstein 1989 |
| `study.kress-2012` | Kress: μοντελοποίηση των ένοπλων συγκρούσεων | Kress 2012; Washburn & Kress 2009 |
| `study.ault-1969` | Η έκθεση του Ault: πύραυλοι που εκτοξεύθηκαν εκτός της εμβέλειάς τους | Ault 1969; Michel 1997 |
| `study.gwaps` | Gulf War Air Power Survey | Keaney & Cohen 1993; Hallion 1992 |
| `study.blackett-circus` | Ο «κύκλος» του Blackett | Blackett 1962; Kirby 2003; Budiansky 2013; McCloskey 1987 |
| `study.depth-charge-settings` | Ρυθμίσεις βομβών βάθους στην Coastal Command | Waddington 1973; Budiansky 2013; Morse & Kimball 1951 |
| `study.aircraft-camouflage` | Λευκές κάτω επιφάνειες στα αντισυγκεντρωτικά αεροσκάφη | Waddington 1973; Budiansky 2013 |
| `study.wald-survivorship` | Wald: θωράκιση εκεί όπου δεν χτυπήθηκαν τα επιστρέφοντα βομβαρδιστικά | Mangel & Samaniego 1984 |
| `study.optimal-search` | Βέλτιστη αναζήτηση: από τα υποβρύχια έως την AF447 | Stone 1975; Stone et al. 2014; Koopman 1946; Washburn 2002 |
| `study.glenn-1996` | Glenn: μάχη στην κόλαση | Glenn 1996; FM 3-06 2006 |
| `study.a2ad-2003` | Αντιπρόσβαση και περιοχική άρνηση | Krepinevich et al. 2003 |
| `study.bauckhage-2012` | Πώς χάνουν το ενδιαφέρον τους οι παίκτες | Bauckhage et al. 2012; Kaplan & Meier 1958 |
| `study.drachen-sifa-2012` | Ομαδοποίηση της συμπεριφοράς των παικτών σε πραγματικές συνθήκες | Drachen et al. 2012; Drachen et al. 2009 |
| `study.canossa-2011` | Ανίχνευση της απογοήτευσης των παικτών | Canossa et al. 2011 |
| `study.medler-2011` | Data Cracker: πίνακες τηλεμετρίας σε παραγωγή | Medler et al. 2011 |
| `study.wallner-kriglstein-2014` | PLATO: οπτική ανάλυση του παιχνιδιού | Wallner & Kriglstein 2014; Wallner & Kriglstein 2013 |
| `study.miller-crowcroft-2009` | Κίνηση avatar στα πεδία μάχης του World of Warcraft | Miller & Crowcroft 2009 |
| `study.kim-2008` | TRUE: μετρήσεις σε δοκιμές χρηστών σε μεγάλη κλίμακα | Kim et al. 2008 |
| `study.game-data-science` | Επιστήμη δεδομένων παιχνιδιού | Seif El-Nasr et al. 2021; Seif El-Nasr et al. 2013 |
| `study.ai-and-games` | Τεχνητή νοημοσύνη και παιχνίδια | Yannakakis & Togelius 2018 |
| `study.drachen-2014` | Δεξιότητα και κίνηση ομάδας στο Dota 2 | Drachen et al. 2014 |
| `study.yang-2014` | Μοτίβα μάχης που προβλέπουν τις νίκες στα MOBA | Yang et al. 2014; Schubert et al. 2016 |
| `study.eggert-2015` | Ρόλοι παικτών στο Dota 2 | Eggert et al. 2015 |
| `study.semenov-2017` | Πρόβλεψη των αποτελεσμάτων του Dota 2 από τις επιλογές ηρώων | Semenov et al. 2017; Makarov et al. 2018 |
| `study.hodge-2021` | Πρόβλεψη νίκης σε πραγματικό χρόνο στα επαγγελματικά e-sports | Hodge et al. 2021 |
| `study.rioult-2014` | Τοπολογία των θέσεων των παικτών | Rioult et al. 2014 |
| `study.bednarek-2017` | Αξιολόγηση παικτών σε ομαδικά shooters | Bednárek et al. 2017 |
| `study.katona-2019` | Πρόβλεψη του ποιος πεθαίνει επόμενος | Katona et al. 2019 |
| `study.block-2018` | Ιστορίες βασισμένες σε δεδομένα για κοινό e-sports | Block et al. 2018 |
| `study.ggviz` | ggViz: αναζήτηση καταστάσεων παιχνιδιού σε μεγάλη κλίμακα | Xenopoulos et al. 2022 |
| `study.openai-five` | OpenAI Five: ενισχυτική μάθηση μεγάλης κλίμακας στο Dota 2 | Berner et al. 2019 |
| `study.alphastar` | AlphaStar: επίπεδο grandmaster στο StarCraft II | Vinyals et al. 2019 |
| `study.cervone-2016` | Αναμενόμενη αξία κατοχής στο μπάσκετ | Cervone et al. 2016 |
| `study.decroos-2019` | VAEP: αποτίμηση ενεργειών με την μπάλα στο ποδόσφαιρο | Decroos et al. 2019 |
| `study.pitch-control` | Έλεγχος γηπέδου και δημιουργία χώρου | Spearman 2018; Fernández & Bornn 2018; Taki et al. 1996 |
| `study.franks-2015` | Η χωρική δομή της αμυντικής δεξιότητας | Franks et al. 2015; Miller et al. 2014 |
| `study.lucey-2013` | Ρόλοι ομάδας από δεδομένα παρακολούθησης | Lucey et al. 2013 |
| `study.shot-quality` | Αναμενόμενα γκολ και ποιότητα σουτ | Decroos et al. 2019; Pollard & Reep 1997; Reep & Benjamin 1968 |
| `study.goldsberry-2012` | CourtVision: χωρική αποτελεσματικότητα σουτ | Goldsberry 2012; Miller et al. 2014 |
| `study.team-sports-survey` | Χωροχρονική ανάλυση των ομαδικών αθλημάτων | Gudmundsson & Horton 2017 |
| `study.ripley-k` | Ripley's K: ομαδοποίηση σε κάθε κλίμακα | Ripley 1977; Baddeley et al. 2015; Diggle 2013 |
| `study.clark-evans-1954` | Clark και Evans: διασπορά κατά τον πλησιέστερο γείτονα | Clark & Evans 1954 |
| `study.getis-ord` | Θερμά σημεία Getis-Ord | Getis & Ord 1992; Ord & Getis 1995; Benjamini & Hochberg 1995 |
| `study.lisa` | Τοπικοί δείκτες χωρικής συσχέτισης | Anselin 1995; Moran 1950 |
| `study.scan-statistic` | Η στατιστική σάρωσης χώρου | Kulldorff 1997 |
| `study.kde` | Εκτίμηση πυκνότητας πυρήνα | Silverman 1986 |
| `study.knox-1964` | Αλληλεπίδραση χώρου-χρόνου | Knox 1964; Diggle 2013 |
| `study.maup` | Το πρόβλημα της τροποποιήσιμης χωρικής μονάδας | Openshaw 1984; Tobler 1970 |
| `study.isovists` | Ισόβιστ και γράφοι ορατότητας | Benedikt 1979; Turner et al. 2001; Hillier & Hanson 1984 |
| `study.space-syntax` | Σύνταξη χώρου | Hillier & Hanson 1984; Turner et al. 2001 |
| `study.mean-crowding` | Μέση συγκέντρωση | Lloyd 1967 |
| `study.survival-analysis` | Ανάλυση επιβίωσης για τον χρόνο θανάτου | Kaplan & Meier 1958; Cox 1972 |
| `study.glm` | Γενικευμένα γραμμικά μοντέλα για μετρήσεις | Nelder & Wedderburn 1972; McCullagh & Nelder 1989; Akaike 1974 |
| `study.bootstrap` | Bootstrap και διαστήματα εκτίμησης | Efron 1979; Wilson 1927 |
| `study.tokey-2024` | Tokey et al.: καθυστέρηση και το πλεονέκτημα του όποιου ρίχνει μια ματιά | Tokey et al. 2024 |
| `study.lee-chang-2017` | Lee και Chang: βολή γύρω από γωνία | Lee & Chang 2017; Bernier 2001 |
| `study.claypool-latency` | Claypool: καθυστέρηση και ενέργειες παικτών | Claypool & Claypool 2006; Liu et al. 2022 |
| `study.xenopoulos-2022-wp` | Xenopoulos et al.: επαγγελματίες και ερασιτέχνες μέσα από την πιθανότητα νίκης | Xenopoulos et al. 2022; Xenopoulos & Silva 2022 |
| `study.xenopoulos-2021-econ` | Xenopoulos et al.: οικονομικές αποφάσεις στο Counter-Strike | Xenopoulos et al. 2021 |
| `study.maymin-2021` | Maymin: έξυπνοι θάνατοι και άχρηστα χτυπήματα | Maymin 2021 |
| `study.moba-live-prediction` | Πρόβλεψη αποτελέσματος σε πραγματικό χρόνο στα MOBA | Yang et al. 2017; Silva et al. 2018 |
| `study.hayakawa-2025` | Hayakawa et al.: γύροι του Valorant από τακτικά χαρακτηριστικά | Hayakawa et al. 2025 |
| `study.paskiv-2026` | Paskiv et al.: ρόλοι στο επαγγελματικό Counter-Strike 2 | Paskiv et al. 2026 |
| `study.ibrahim-2024` | Ibrahim et al.: εκπαίδευση στη μάχη εκ του σύνεγγυς | Ibrahim et al. 2024 |
| `study.crowd-turbulence` | Αναταραχή πλήθους στο Hajj του 2006 | Helbing et al. 2007; Moussaïd et al. 2011 |
| `study.walking-groups` | Οι ομάδες που περπατούν διαμορφώνουν τα πλήθη | Moussaïd et al. 2010 |
| `study.pigeon-hierarchy` | Ιεραρχική δυναμική ομάδας σε σμήνη περιστεριών | Nagy et al. 2010; Vicsek & Zafeiris 2012 |
| `study.music-lab` | Η κοινωνική επιρροή κάνει την επιτυχία άνιση και απρόβλεπτη | Salganik et al. 2006 |
| `study.wisdom-undermined` | Η κοινωνική επιρροή υπονομεύει τη σοφία των πλήθων | Lorenz et al. 2011 |
| `study.drawing-power-of-crowds` | Η έλξη του πλήθους | Milgram et al. 1969; Gallup et al. 2012 |
| `study.asch-conformity` | Συμμόρφωση στην ομόφωνη πλειοψηφία | Asch 1956; Bond & Smith 1996 |
| `study.why-they-fight` | Why They Fight: το κίνητρο μάχης στο Ιράκ | Wong et al. 2003; Shils & Janowitz 1948 |
| `study.cohesion-performance` | Συνοχή και απόδοση: μετα-αναλύσεις | Mullen & Copper 1994; Beal et al. 2003 |
| `study.loss-averse-golfers` | Αποστροφή της απώλειας στους επαγγελματίες γκολφ | Pope & Schweitzer 2011 |
| `study.hot-hand-baseball` | Καυτά χέρια στο μπέιζμπολ | Green & Zwiebel 2018 |
| `study.penalty-kicks` | Πέναλτι: οι επαγγελματίες παίζουν minimax | Chiappori et al. 2002; Palacios-Huerta 2003; Bar-Eli et al. 2007 |
| `study.minimax-wimbledon` | Παιχνίδι minimax στο Wimbledon | Walker & Wooders 2001 |
| `study.collective-intelligence` | Συλλογική νοημοσύνη των ομάδων | Woolley et al. 2010; Kim et al. 2017 |
| `study.online-world-networks` | Κοινωνικά δίκτυα ενός διαδικτυακού κόσμου | Szell et al. 2010 |
| `study.team-networks` | Δίκτυα πάσων και απόδοση ομάδας | Duch et al. 2010; Grund 2012 |
| `study.complex-contagion` | Η συμπεριφορά εξαπλώνεται μέσα από συστάδες δικτύων | Centola 2010 |


### Βιβλιογραφία {#bibliography}

- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control 19(6): 716-723. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Alexander, J. H. (1993). Across the Reef: The Marine Assault of Tarawa. Marine Corps Historical Center, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Altman, I. (1975). The Environment and Social Behavior: Privacy, Personal Space, Territory, Crowding. Brooks/Cole, Monterey CA. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Ammianus Marcellinus (trans. Yonge, C. D.) (1862). The Roman History of Ammianus Marcellinus. Henry G. Bohn, London. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Anderson, L. R.; Holt, C. A. (1996). Classroom games: information cascades. Journal of Economic Perspectives 10(4): 187-193. doi:10.1257/jep.10.4.187 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Andreas, P. (2008). Blue Helmets and Black Markets: The Business of Survival in the Siege of Sarajevo. Cornell University Press, Ithaca. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. Geographical Analysis 27(2): 93-115. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Appleman, R. E. (1961). South to the Naktong, North to the Yalu (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Appleman, R. E. (1987). East of Chosin: Entrapment and Breakout in Korea, 1950. Texas A&M University Press, College Station. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Appleman, R. E.; Burns, J. M.; Gugeler, R. A.; Stevens, J. (1948). Okinawa: The Last Battle (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Ardant du Picq, C. (trans. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Arkes, H. R.; Blumer, C. (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes 35(1): 124-140. doi:10.1016/0749-5978(85)90049-4 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Armstrong, M. J. (2005). A stochastic salvo model for naval surface combat. Operations Research 53(5): 830-841. doi:10.1287/opre.1040.0195 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Arrian (trans. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Asch, S. E. (1956). Studies of independence and conformity: I. A minority of one against a unanimous majority. Psychological Monographs: General and Applied 70(9): 1-70. doi:10.1037/h0093718 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Atkinson, R. (1993). Crusade: The Untold Story of the Persian Gulf War. Houghton Mifflin, Boston. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Ault, F. W. (1969). Report of the Air-to-Air Missile System Capability Review (the Ault Report). Naval Air Systems Command, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Baddeley, A.; Rubak, E.; Turner, R. (2015). Spatial Point Patterns: Methodology and Applications with R. CRC Press, Boca Raton. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Bainbridge, W. S. (2007). The scientific research potential of virtual worlds. Science 317(5837): 472-476. doi:10.1126/science.1146930 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Balicer, R. D. (2007). Modeling infectious diseases dissemination through online role-playing games. Epidemiology 18(2): 260-261. doi:10.1097/01.ede.0000254692.80550.60 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Ballard, M. B. (2004). Vicksburg: The Campaign That Opened the Mississippi. University of North Carolina Press, Chapel Hill. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Ballerini, M.; Cabibbo, N.; Candelier, R.; Cavagna, A.; Cisbani, E.; Giardina, I.; Lecomte, V.; Orlandi, A.; Parisi, G.; Procaccini, A.; Viale, M.; Zdravkovic, V. (2008). Interaction ruling animal collective behavior depends on topological rather than metric distance: evidence from a field study. Proceedings of the National Academy of Sciences 105(4): 1232-1237. doi:10.1073/pnas.0711437105 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Banerjee, A. V. (1992). A simple model of herd behavior. Quarterly Journal of Economics 107(3): 797-817. doi:10.2307/2118364 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Bar-Eli, M.; Avugos, S.; Raab, M. (2006). Twenty years of "hot hand" research: review and critique. Psychology of Sport and Exercise 7(6): 525-553. doi:10.1016/j.psychsport.2006.03.001 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Bar-Eli, M.; Azar, O. H.; Ritov, I.; Keidar-Levin, Y.; Schein, G. (2007). Action bias among elite soccer goalkeepers: the case of penalty kicks. Journal of Economic Psychology 28(5): 606-621. doi:10.1016/j.joep.2006.12.001 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Bar-Siman-Tov, Y. (1980). The Israeli-Egyptian War of Attrition, 1969-1970. Columbia University Press, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Barabási, A.-L.; Albert, R. (1999). Emergence of scaling in random networks. Science 286(5439): 509-512. doi:10.1126/science.286.5439.509 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Bartley, W. S. (1954). Iwo Jima: Amphibious Epic. Historical Branch, US Marine Corps, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Bauckhage, C.; Kersting, K.; Sifa, R.; Thurau, C.; Drachen, A.; Canossa, A. (2012). How players lose interest in playing a game: an empirical study based on distributions of total playing times. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 139-146. doi:10.1109/CIG.2012.6374148 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Baumeister, R. F. (1984). Choking under pressure: self-consciousness and paradoxical effects of incentives on skillful performance. Journal of Personality and Social Psychology 46(3): 610-620. doi:10.1037/0022-3514.46.3.610 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Beal, D. J.; Cohen, R. R.; Burke, M. J.; McLendon, C. L. (2003). Cohesion and performance in groups: a meta-analytic clarification of construct relations. Journal of Applied Psychology 88(6): 989-1004. doi:10.1037/0021-9010.88.6.989 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Bednárek, D.; Kruliš, M.; Yaghob, J.; Zavoral, F. (2017). Player performance evaluation in team-based first-person shooter eSport. Data Management Technologies and Applications (DATA 2017), CCIS, Springer. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Beevor, A. (1991). Crete: The Battle and the Resistance. John Murray, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Beevor, A. (1998). Stalingrad. Viking, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Beevor, A. (2002). Berlin: The Downfall 1945. Viking, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Benedikt, M. L. (1979). To take hold of space: isovists and isovist fields. Environment and Planning B 6(1): 47-65. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Berner, C.; Brockman, G.; Chan, B.; Cheung, V.; et al. (OpenAI) (2019). Dota 2 with large scale deep reinforcement learning. arXiv:1912.06680. https://arxiv.org/abs/1912.06680 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Bernier, Y. W. (2001). Latency compensating methods in client/server in-game protocol design and optimization. Valve Developer Community (Valve Software). https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Bikhchandani, S.; Hirshleifer, D.; Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. Journal of Political Economy 100(5): 992-1026. doi:10.1086/261849 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Blair, C. (1975). Silent Victory: The U.S. Submarine War Against Japan. Lippincott, Philadelphia. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Blair, C. (1998). Hitler's U-Boat War: The Hunted, 1942-1945. Random House, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Block, F.; Hodge, V.; Hobson, S.; Sephton, N.; Devlin, S.; Ursu, M. F.; Drachen, A.; Cowling, P. I. (2018). Narrative bytes: data-driven content production in esports. Proc. ACM International Conference on Interactive Experiences for TV and Online Video (TVX 2018): 29-41. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Bond, R.; Smith, P. B. (1996). Culture and conformity: a meta-analysis of studies using Asch's (1952b, 1956) line judgment task. Psychological Bulletin 119(1): 111-137. doi:10.1037/0033-2909.119.1.111 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Boyd, J. R. (1986). Patterns of Conflict (briefing). Unpublished briefing; archived by the Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/ *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review 78(1): 1-3. doi:10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Bronk, J.; Reynolds, N.; Watling, J. (2022). The Russian Air War and Ukrainian Requirements for Air Defence. Royal United Services Institute, London (Special Resources, November 2022). *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Budiansky, S. (2013). Blackett's War: The Men Who Defeated the Nazi U-Boats and Brought Science to the Art of Warfare. Alfred A. Knopf, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Burg, S. L.; Shoup, P. S. (1999). The War in Bosnia-Herzegovina: Ethnic Conflict and International Intervention. M. E. Sharpe, Armonk. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Caesar, G. J. (trans. McDevitte, W. A.; Bohn, W. S.) (1869). The Commentaries: The Civil War. Harper & Brothers, New York. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Caldwell, D.; Muller, R. (2007). The Luftwaffe over Germany: Defense of the Reich. Greenhill Books, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Canossa, A.; Drachen, A.; Sørensen, J. R. M. (2011). Arrrgghh!!! - blending quantitative and qualitative methods to detect player frustration. Proc. 6th International Conference on Foundations of Digital Games (FDG 2011), ACM: 61-68. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Castronova, E. (2005). Synthetic Worlds: The Business and Culture of Online Games. University of Chicago Press, Chicago. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Centola, D. (2010). The spread of behavior in an online social network experiment. Science 329(5996): 1194-1197. doi:10.1126/science.1185231 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Chandler, D. G. (1973). Marlborough as Military Commander. Batsford, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Chiappori, P.-A.; Levitt, S.; Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. American Economic Review 92(4): 1138-1151. doi:10.1257/00028280260344678 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Churchill, W. S. (1899). The River War: An Historical Account of the Reconquest of the Soudan. Longmans, Green, London. https://www.gutenberg.org/ebooks/4943 *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Cilliers, J. K. (1985). Counter-Insurgency in Rhodesia. Croom Helm, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Citino, R. M. (2005). The German Way of War: From the Thirty Years' War to the Third Reich. University Press of Kansas, Lawrence. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Clark, P. J.; Evans, F. C. (1954). Distance to nearest neighbor as a measure of spatial relationships in populations. Ecology 35(4): 445-453. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Clausewitz, C. von (trans. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Claypool, M.; Claypool, K. (2006). Latency and player actions in online games. Communications of the ACM 49(11): 40-45. doi:10.1145/1167838.1167860 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Clodfelter, M. (1989). The Limits of Air Power: The American Bombing of North Vietnam. Free Press, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Cohen, A.; Hamilton, R. E. (2011). The Russian Military and the Georgia War: Lessons and Implications. Strategic Studies Institute, US Army War College, Carlisle. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Cole, H. M. (1950). The Lorraine Campaign (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Combat Studies Institute (2010). Wanat: Combat Action in Afghanistan, 2008. Combat Studies Institute Press, Fort Leavenworth. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Connaughton, R. M. (1988). The War of the Rising Sun and Tumbling Bear: A Military History of the Russo-Japanese War, 1904-5. Routledge, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Cooper, B. (1967). The Ironclads of Cambrai. Souvenir Press, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Coox, A. D. (1985). Nomonhan: Japan Against Russia, 1939. Stanford University Press, Stanford. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Copp, T. (2003). Fields of Fire: The Canadians in Normandy. University of Toronto Press, Toronto. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Corbett, J. S. (1920). Naval Operations vol. 1 (History of the Great War). Longmans, Green, London. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Corbett, J. S. (1921). Naval Operations vol. 2 (History of the Great War). Longmans, Green, London. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Corbett, J. S. (1923). Naval Operations vol. 3 (History of the Great War). Longmans, Green, London. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Cordesman, A. H.; Wagner, A. R. (1990). The Lessons of Modern War, Volume II: The Iran-Iraq War. Westview Press, Boulder. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Couzin, I. D.; Krause, J.; Franks, N. R.; Levin, S. A. (2005). Effective leadership and decision-making in animal groups on the move. Nature 433(7025): 513-516. doi:10.1038/nature03236 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Couzin, I. D.; Krause, J.; James, R.; Ruxton, G. D.; Franks, N. R. (2002). Collective memory and spatial sorting in animal groups. Journal of Theoretical Biology 218(1): 1-11. doi:10.1006/jtbi.2002.3065 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B 34(2): 187-220. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Craven, W. F.; Cate, J. L. (eds.) (1949). The Army Air Forces in World War II, vol. 2: Europe: Torch to Pointblank, August 1942 to December 1943. University of Chicago Press, Chicago. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Craven, W. F.; Cate, J. L. (eds.) (1951). The Army Air Forces in World War II, vol. 3: Europe: Argument to V-E Day, January 1944 to May 1945. University of Chicago Press, Chicago. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- D'Este, C. (1983). Decision in Normandy. Collins, London. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Darley, J. M.; Latané, B. (1968). Bystander intervention in emergencies: diffusion of responsibility. Journal of Personality and Social Psychology 8(4, Pt. 1): 377-383. doi:10.1037/h0025589 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Davies, N. (2003). Rising '44: The Battle for Warsaw. Macmillan, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Davis, R. G. (1993). Carl A. Spaatz and the Air War in Europe. Center for Air Force History, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- DeChurch, L. A.; Mesmer-Magnus, J. R. (2010). The cognitive underpinnings of effective teamwork: a meta-analysis. Journal of Applied Psychology 95(1): 32-53. doi:10.1037/a0017328 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Decroos, T.; Bransen, L.; Van Haaren, J.; Davis, J. (2019). Actions speak louder than goals: valuing player actions in soccer. Proc. 25th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2019): 1851-1861. doi:10.1145/3292500.3330758 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Deitchman, S. J. (1962). A Lanchester model of guerrilla warfare. Operations Research 10(6): 818-827. doi:10.1287/opre.10.6.818 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Delbrück, H. (trans. Renfroe, W. J.) (1990). History of the Art of War, vol. 4: The Dawn of Modern Warfare (orig. 1920). University of Nebraska Press, Lincoln. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Department of the Air Force (2002). Counterair Operations (Air Force Doctrine Document 2-1.1). Headquarters US Air Force, Washington DC (DTIC ADA404825). doi:10.21236/ada404825 *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Desch, M. C. (2002). Democracy and victory: why regime type hardly matters. International Security 27(2): 5-47. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Diggle, P. J. (2013). Statistical Analysis of Spatial and Spatio-Temporal Point Patterns (3rd ed.). CRC Press, Boca Raton. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Doughty, R. A. (1990). The Breaking Point: Sedan and the Fall of France, 1940. Archon Books, Hamden. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Douhet, G. (trans. Ferrari, D.) (1942). The Command of the Air (orig. 1921). Coward-McCann, New York; reprinted Office of Air Force History 1983. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Drachen, A.; Sifa, R.; Bauckhage, C.; Thurau, C. (2012). Guns, swords and data: clustering of player behavior in computer games in the wild. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 163-170. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Drachen, A.; Yancey, M.; Maguire, J.; Chu, D.; Wang, I. Y.; Mahlmann, T.; Schubert, M.; Klabjan, D. (2014). Skill-based differences in spatio-temporal team behaviour in Defence of the Ancients 2 (DotA 2). Proc. IEEE Games Media Entertainment (GEM 2014): 1-8. doi:10.1109/GEM.2014.7048109 *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Drea, E. J. (1981). Nomonhan: Japanese-Soviet Tactical Combat, 1939 (Leavenworth Papers 2). Combat Studies Institute, Fort Leavenworth. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Drury, J.; Cocking, C.; Reicher, S. (2009). Everyone for themselves? A comparative study of crowd solidarity among emergency survivors. British Journal of Social Psychology 48(3): 487-506. doi:10.1348/014466608X357893 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Duch, J.; Waitzman, J. S.; Amaral, L. A. N. (2010). Quantifying the performance of individual players in a team activity. PLoS ONE 5(6): e10937. doi:10.1371/journal.pone.0010937 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Dugan, J.; Stewart, C. (1962). Ploesti: The Great Ground-Air Battle of 1 August 1943. Random House, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Dupuy, T. N. (1990). Attrition: Forecasting Battle Casualties and Equipment Losses in Modern War. HERO Books, Fairfax VA. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Dyer, J. R. G.; Johansson, A.; Helbing, D.; Couzin, I. D.; Krause, J. (2009). Leadership, consensus decision making and collective behaviour in humans. Philosophical Transactions of the Royal Society B 364(1518): 781-789. doi:10.1098/rstb.2008.0233 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Echevarria, A. J. (2002). Clausewitz's Center of Gravity: Changing Our Warfighting Doctrine - Again!. Strategic Studies Institute, US Army War College, Carlisle PA. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Efron, B. (1979). Bootstrap methods: another look at the jackknife. Annals of Statistics 7(1): 1-26. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Efron, B.; Morris, C. (1975). Data analysis using Stein's estimator and its generalizations. Journal of the American Statistical Association 70(350): 311-319. doi:10.1080/01621459.1975.10479864 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Eggert, C.; Herrlich, M.; Smeddinck, J.; Malaka, R. (2015). Classification of player roles in the team-based multi-player game Dota 2. Entertainment Computing - ICEC 2015, LNCS 9353, Springer: 112-125. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171. doi:10.1287/opre.2.2.163 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Englund, P. (2003). The Battle That Shook Europe: Poltava and the Birth of the Russian Empire. I. B. Tauris, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Epstein, J. M. (1985). The Calculus of Conventional War: Dynamic Analysis without Lanchester Theory. Brookings Institution, Washington DC. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4). *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Erickson, J. (1975). The Road to Stalingrad: Stalin's War with Germany, Volume One. Harper & Row, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- ESPN (2016). Daigo and JWong: the legacy of Street Fighter's Moment 37. ESPN Esports. https://www.espn.com/espn/story/_/id/17391663 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Fain, J. B. (1977). The Lanchester equations and historical warfare: an analysis of sixty World War II land engagements. History, Numbers and War 1(1), Historical Evaluation and Research Organization, Dunn Loring VA. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Farrell, T. (2017). Unwinnable: Britain's War in Afghanistan, 2001-2014. Bodley Head, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Fernández, J.; Bornn, L.; Cervone, D. (2021). A framework for the fine-grained evaluation of the instantaneous expected value of soccer possessions. Machine Learning 110(6): 1389-1427. doi:10.1007/s10994-021-05989-6 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Fischer, P.; Krueger, J. I.; Greitemeyer, T.; Vogrincic, C.; Kastenmüller, A.; Frey, D.; Heene, M.; Wicher, M.; Kainbacher, M. (2011). The bystander-effect: a meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies. Psychological Bulletin 137(4): 517-537. doi:10.1037/a0023304 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Fleiss, J. L. (1971). Measuring nominal scale agreement among many raters. Psychological Bulletin 76(5): 378-382. doi:10.1037/h0031619 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Fontenot, G.; Degen, E. J.; Tohn, D. (2004). On Point: The United States Army in Operation Iraqi Freedom. Combat Studies Institute Press, Fort Leavenworth. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Fox, A. C. (2019). "Cyborgs at Little Stalingrad": A Brief History of the Battles of the Donetsk Airport, 26 May 2014 to 21 January 2015 (Land Warfare Paper). Association of the United States Army, Institute of Land Warfare, Arlington. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Fox, A. C.; Rossow, A. J. (2017). Making Sense of Russian Hybrid Warfare: A Brief Assessment of the Russo-Ukrainian War (Land Warfare Paper 112). Association of the United States Army, Institute of Land Warfare, Arlington. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Frank, R. B. (1990). Guadalcanal: The Definitive Account of the Landmark Battle. Random House, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Franks, A.; Miller, A.; Bornn, L.; Goldsberry, K. (2015). Characterizing the spatial structure of defensive skill in professional basketball. Annals of Applied Statistics 9(1): 94-121. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Fruin, J. J. (1971). Pedestrian Planning and Design. Metropolitan Association of Urban Designers and Environmental Planners, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Fullerton, T.; Swain, C.; Hoffman, S. (2008). Game Design Workshop (2nd ed.). Morgan Kaufmann, Burlington. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Futrell, R. F. (1983). The United States Air Force in Korea, 1950-1953 (rev. ed.). Office of Air Force History, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Gabriel, R. A. (1984). Operation Peace for Galilee: The Israeli-PLO War in Lebanon. Hill & Wang, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Gallup, A. C.; Hale, J. J.; Sumpter, D. J. T.; Garnier, S.; Kacelnik, A.; Krebs, J. R.; Couzin, I. D. (2012). Visual attention and the acquisition of information in human crowds. Proceedings of the National Academy of Sciences 109(19): 7245-7250. doi:10.1073/pnas.1116141109 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Galula, D. (1964). Counterinsurgency Warfare: Theory and Practice. Praeger, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- GameSpot (2014). Counter-Strike eSports team forfeits victory after using map exploit. GameSpot. https://www.gamespot.com/articles/counter-strike-esports-team-forfeits-victory-after/1100-6423866/ *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Garcimartín, A.; Zuriguel, I.; Pastor, J. M.; Martín-Gómez, C.; Parisi, D. R. (2014). Experimental evidence of the "faster is slower" effect. Transportation Research Procedia 2: 760-767. doi:10.1016/j.trpro.2014.09.085 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Gayle, G. D. (1996). Bloody Beaches: The Marines at Peleliu. Marine Corps Historical Center, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Gilovich, T.; Vallone, R.; Tversky, A. (1985). The hot hand in basketball: on the misperception of random sequences. Cognitive Psychology 17(3): 295-314. doi:10.1016/0010-0285(85)90010-6 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Glantz, D. M. (1983). August Storm: The Soviet 1945 Strategic Offensive in Manchuria (Leavenworth Papers 7). Combat Studies Institute, Fort Leavenworth. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Glantz, D. M. (1989). Soviet Military Deception in the Second World War. Frank Cass, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Glantz, D. M. (1991). From the Don to the Dnepr: Soviet Offensive Operations, December 1942-August 1943. Frank Cass, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Glantz, D. M. (1991). Soviet Military Operational Art: In Pursuit of Deep Battle. Frank Cass, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Glantz, D. M. (1998). Kharkov 1942: Anatomy of a Military Disaster Through Soviet Eyes. Ian Allan, Shepperton. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Glantz, D. M. (1999). Zhukov's Greatest Defeat: The Red Army's Epic Disaster in Operation Mars, 1942. University Press of Kansas, Lawrence. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Glantz, D. M. (2001). Barbarossa: Hitler's Invasion of Russia 1941. Tempus, Stroud. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Glenn, R. W. (1996). Combat in Hell: A Consideration of Constrained Urban Warfare (MR-780). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR780.html *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Goldsworthy, A. (2001). Cannae. Cassell, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Granovetter, M. S. (1973). The strength of weak ties. American Journal of Sociology 78(6): 1360-1380. doi:10.1086/225469 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Grau, L. W. (ed.) (1996). The Bear Went Over the Mountain: Soviet Combat Tactics in Afghanistan. National Defense University Press, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Green, B.; Zwiebel, J. (2018). The hot-hand fallacy: cognitive mistakes or equilibrium adjustments? Evidence from Major League Baseball. Management Science 64(11): 5315-5348. doi:10.1287/mnsc.2017.2804 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Greene, J. A. (2005). The Guns of Independence: The Siege of Yorktown, 1781. Savas Beatie, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Greene, J.; Massignani, A. (1998). The Naval War in the Mediterranean, 1940-1943. Chatham Publishing, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Grund, T. U. (2012). Network structure and team performance: the case of English Premier League soccer teams. Social Networks 34(4): 682-690. doi:10.1016/j.socnet.2012.08.004 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Gudmundsson, B. I. (1989). Stormtroop Tactics: Innovation in the German Army, 1914-1918. Praeger, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Gudmundsson, J.; Horton, M. (2017). Spatio-temporal analysis of team sports. ACM Computing Surveys 50(2): article 22. https://arxiv.org/abs/1602.06994 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Guilmartin, J. F. (1974). Gunpowder and Galleys: Changing Technology and Mediterranean Warfare at Sea in the Sixteenth Century. Cambridge University Press, Cambridge. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Guo, C.; Pleiss, G.; Sun, Y.; Weinberger, K. Q. (2017). On calibration of modern neural networks. Proceedings of the 34th International Conference on Machine Learning (ICML 2017): 1321-1330. doi:10.48550/arXiv.1706.04599 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Haghani, M.; Sarvi, M. (2018). Crowd behaviour and motion: empirical methods. Transportation Research Part B: Methodological 107: 253-294. doi:10.1016/j.trb.2017.06.017 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Haldon, J. (2001). The Byzantine Wars. Tempus, Stroud. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Hall, E. T. (1966). The Hidden Dimension. Doubleday, Garden City NY. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Hardesty, V. (1982). Red Phoenix: The Rise of Soviet Air Power, 1941-1945. Smithsonian Institution Press, Washington DC. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Hardesty, V.; Grinberg, I. (2012). Red Phoenix Rising: The Soviet Air Force in World War II. University Press of Kansas, Lawrence. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Hartley, D. S. (1995). A mathematical model of attrition data. Naval Research Logistics 42(4): 585-607. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Hastings, M. (1984). Overlord: D-Day and the Battle for Normandy. Michael Joseph, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Hastings, M.; Jenkins, S. (1983). The Battle for the Falklands. Michael Joseph, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Hayakawa, N.; Shimari, K.; Yamasaki, K.; Hoshikawa, H.; Tsuchida, R.; Matsumoto, K. (2025). Round outcome prediction in VALORANT using tactical features from video analysis. IEEE Conference on Games (CoG) 2025: 1-4. doi:10.1109/CoG64752.2025.11114177 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Hayward, J. S. A. (1998). Stopped at Stalingrad: The Luftwaffe and Hitler's Defeat in the East, 1942-1943. University Press of Kansas, Lawrence. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Headquarters, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Headquarters, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Headquarters, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Headquarters, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Headquarters, Department of the Army (2002). FM 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (28 February 2002). https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/index.html *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Headquarters, Department of the Army (2006). FM 3-06 Urban Operations. US Army, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Headquarters, Department of the Army (2006). FM 3-24 Counterinsurgency. US Army, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Headquarters, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Headquarters, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Headquarters, Department of the Army (2011). ATTP 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (10 June 2011). https://archive.org/details/attp-3-06.11-combined-arms-operations-in-urban-terrain-2011 *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Headquarters, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Headquarters, Department of the Army (2013). FM 3-90-2 Reconnaissance, Security, and Tactical Enabling Tasks, Volume 2. US Army, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Headquarters, Department of the Army (2016). ATP 3-21.8 Infantry Platoon and Squad. US Army, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Headquarters, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Headquarters, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Headquarters, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Headquarters, Department of the Army; Marine Corps Tactics and Operations Group (2022). ATP 3-06 / MCTP 12-10B Urban Operations. Department of the Army, Washington DC (21 July 2022). https://archive.org/details/arn-35826-atp-3-06-000-web-1 *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Headquarters, US Marine Corps (1998). MCWP 3-35.3 Military Operations on Urbanized Terrain (MOUT). Department of the Navy, Washington DC (26 April 1998). https://archive.org/details/milmanual-mcwp-3-35.3-military-operations-on-urbanized-terrain-mout *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Healy, M. (1993). Qadesh 1300 BC: Clash of the Warrior Kings (Campaign 22). Osprey, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Helbing, D.; Buzna, L.; Johansson, A.; Werner, T. (2005). Self-organized pedestrian crowd dynamics: experiments, simulations, and design solutions. Transportation Science 39(1): 1-24. doi:10.1287/trsc.1040.0108 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Helbing, D.; Farkas, I.; Vicsek, T. (2000). Simulating dynamical features of escape panic. Nature 407(6803): 487-490. doi:10.1038/35035023 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Helbing, D.; Johansson, A.; Al-Abideen, H. Z. (2007). Dynamics of crowd disasters: an empirical study. Physical Review E 75(4): 046109. doi:10.1103/PhysRevE.75.046109 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Helbing, D.; Keltsch, J.; Molnár, P. (1997). Modelling the evolution of human trail systems. Nature 388(6637): 47-50. doi:10.1038/40353 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Helbing, D.; Molnár, P. (1995). Social force model for pedestrian dynamics. Physical Review E 51(5): 4282-4286. doi:10.1103/PhysRevE.51.4282 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Helmbold, R. L. (1995). Rates of advance in land combat operations. Naval Research Logistics 42(4): 635-669. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Hermes, W. G. (1966). Truce Tent and Fighting Front (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Herodotus (trans. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Herzog, C. (1982). The Arab-Israeli Wars: War and Peace in the Middle East. Random House, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Hillier, B.; Hanson, J. (1984). The Social Logic of Space. Cambridge University Press, Cambridge. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Hinh, N. D. (1979). Lam Son 719 (Indochina Monographs). US Army Center of Military History, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Hoerl, A. E.; Kennard, R. W. (1970). Ridge regression: biased estimation for nonorthogonal problems. Technometrics 12(1): 55-67. doi:10.1080/00401706.1970.10488634 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Holland, J. (2003). Fortress Malta: An Island Under Siege, 1940-1943. Orion, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Horne, A. (1977). A Savage War of Peace: Algeria 1954-1962. Macmillan, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Hornfischer, J. D. (2004). The Last Stand of the Tin Can Sailors. Bantam, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Hornfischer, J. D. (2011). Neptune's Inferno: The U.S. Navy at Guadalcanal. Bantam, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- House, J. M. (1984). Toward Combined Arms Warfare: A Survey of 20th-Century Tactics, Doctrine, and Organization. Combat Studies Institute, Fort Leavenworth. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Howard, M. (1961). The Franco-Prussian War: The German Invasion of France, 1870-1871. Rupert Hart-Davis, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Hughes, W. P. (1995). A salvo model of warships in missile combat used to evaluate their staying power. Naval Research Logistics 42(2): 267-289. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2nd ed.). Naval Institute Press, Annapolis. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Hughes, W. P.; Girrier, R. P. (2018). Fleet Tactics and Naval Operations (3rd ed.). Naval Institute Press, Annapolis. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Ibrahim, F.; Feildboy, E.; Huber, Y.; Nagy, D.; Hennig, J.; Herzberg, P. Y. (2024). Enhancing close quarters battle performance: the effect of a compact training on the tactical performance and stress response of non-specialized and special forces. Journal of Police and Criminal Psychology. doi:10.1007/s11896-024-09699-2 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Isserson, G. S. (trans. Menning, B. W.) (2013). The Evolution of Operational Art (orig. 1936-37). Combat Studies Institute Press, Fort Leavenworth. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Johnson, D. E.; Markel, M. W.; Shannon, B. (2013). The 2008 Battle of Sadr City: Reimagining Urban Combat (RR-160-A). RAND Corporation, Santa Monica. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Johnson, I. R.; MacKay, N. J. (2011). Lanchester models and the Battle of Britain. Naval Research Logistics 58(3): 210-222. doi:10.1002/nav.20328 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Joint Chiefs of Staff (2018). JP 3-60 Joint Targeting. US Joint Staff, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Joint Chiefs of Staff (2019). JP 3-09.3 Close Air Support. US Joint Staff, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Joint Chiefs of Staff (2020). JP 5-0 Joint Planning. US Joint Staff, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Jomini, A.-H. de (trans. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Kahneman, D.; Tversky, A. (1979). Prospect theory: an analysis of decision under risk. Econometrica 47(2): 263-291. doi:10.2307/1914185 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Kaplan, E. L.; Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association 53(282): 457-481. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Karau, S. J.; Williams, K. D. (1993). Social loafing: a meta-analytic review and theoretical integration. Journal of Personality and Social Psychology 65(4): 681-706. doi:10.1037/0022-3514.65.4.681 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Katona, A.; Spick, R.; Hodge, V. J.; Demediuk, S.; Block, F.; Drachen, A.; Walker, J. A. (2019). Time to die: death prediction in Dota 2 using deep learning. Proc. IEEE Conference on Games (CoG 2019): 1-8. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Kennedy, H. (2007). The Great Arab Conquests: How the Spread of Islam Changed the World We Live In. Weidenfeld & Nicolson, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Kennedy, L. (1974). Pursuit: The Chase and Sinking of the Bismarck. Collins, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Ketchum, R. M. (1997). Saratoga: Turning Point of America's Revolutionary War. Henry Holt, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Kim, Y. J.; Engel, D.; Woolley, A. W.; Lin, J. Y. T.; McArthur, N.; Malone, T. W. (2017). What makes a strong team? Using collective intelligence to predict team performance in League of Legends. Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing (CSCW): 2316-2329. doi:10.1145/2998181.2998185 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- King, A. (2013). The Combat Soldier: Infantry Tactics and Cohesion in the Twentieth and Twenty-First Centuries. Oxford University Press, Oxford. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Kirby, M. W. (2003). Operational Research in War and Peace: The British Experience from the 1930s to 1970. Imperial College Press, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Knox, E. G. (1964). The detection of space-time interactions. Journal of the Royal Statistical Society C 13(1): 25-30. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Krause, J.; Ruxton, G. D.; Krause, S. (2010). Swarm intelligence in animals and humans. Trends in Ecology & Evolution 25(1): 28-34. doi:10.1016/j.tree.2009.06.016 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Krepinevich, A.; Watts, B.; Work, R. (2003). Meeting the Anti-Access and Area-Denial Challenge. Center for Strategic and Budgetary Assessments, Washington DC. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Kugler, R. (2007). Operation Anaconda in Afghanistan: A Case Study of Adaptation in Battle (Case Studies in Defense Transformation 5). Center for Technology and National Security Policy, National Defense University, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Kuperman, A. J. (1999). The Stinger missile and U.S. intervention in Afghanistan. Political Science Quarterly 114(2): 219-263. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Latané, B.; Williams, K.; Harkins, S. (1979). Many hands make light the work: the causes and consequences of social loafing. Journal of Personality and Social Psychology 37(6): 822-832. doi:10.1037/0022-3514.37.6.822 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Lavery, B. (1998). Nelson and the Nile: The Naval War Against Bonaparte, 1798. Chatham Publishing, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Lawrence, C. A. (2015). Kursk: The Battle of Prokhorovka. Aberdeen Books, Sheridan CO. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Lawrence, C. A. (2017). War by Numbers: Understanding Conventional Combat. Potomac Books, Lincoln NE. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Lawrence, T. E. (1920). The evolution of a revolt. Army Quarterly 1(1): 55-69. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Lee, S. W. K.; Chang, R. K. C. (2017). On "shot around a corner" in first-person shooter games. 15th Annual Workshop on Network and Systems Support for Games (NetGames 2017): 1-6. doi:10.1109/NetGames.2017.7991545 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Liu, S.; Xu, X.; Claypool, M. (2022). A survey and taxonomy of latency compensation techniques for network computer games. ACM Computing Surveys 54(11s): 1-34. doi:10.1145/3519023 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Livy (trans. Roberts, W. M.) (1905). History of Rome. J. M. Dent (Everyman's Library), London. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Lloyd, M. (1967). Mean crowding. Journal of Animal Ecology 36(1): 1-30. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Lock, D.; Nettleton, D. (2014). Using random forests to estimate win probability before each play of an NFL game. Journal of Quantitative Analysis in Sports 10(2). doi:10.1515/jqas-2013-0100 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Lofgren, E. T.; Fefferman, N. H. (2007). The untapped potential of virtual game worlds to shed light on real world epidemics. The Lancet Infectious Diseases 7(9): 625-629. doi:10.1016/S1473-3099(07)70212-8 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Lorenz, J.; Rauhut, H.; Schweitzer, F.; Helbing, D. (2011). How social influence can undermine the wisdom of crowd effect. Proceedings of the National Academy of Sciences 108(22): 9020-9025. doi:10.1073/pnas.1008636108 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Lucas, T. W.; Dinges, J. A. (2004). The effect of battle circumstances on fitting Lanchester equations to the Battle of Kursk. Military Operations Research 9(2): 17-30. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Lucey, P.; Bialkowski, A.; Carr, P.; Morgan, S.; Matthews, I.; Sheikh, Y. (2013). Representing and discovering adversarial team behaviors using player roles. Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2013): 2706-2713. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Lundstrom, J. B. (1984). The First Team: Pacific Naval Air Combat from Pearl Harbor to Midway. Naval Institute Press, Annapolis. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Lundstrom, J. B. (1994). The First Team and the Guadalcanal Campaign: Naval Fighter Combat from August to November 1942. Naval Institute Press, Annapolis. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Lupfer, T. T. (1981). The Dynamics of Doctrine: The Changes in German Tactical Doctrine During the First World War (Leavenworth Papers 4). Combat Studies Institute, Fort Leavenworth. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Macdonald, B. (2012). Adjusted plus-minus for NHL players using ridge regression with goals, shots, Fenwick, and Corsi. Journal of Quantitative Analysis in Sports 8(3). doi:10.1515/1559-0410.1447 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- MacDonald, C. B. (1963). The Siegfried Line Campaign (US Army in World War II). Office of the Chief of Military History, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- MacDonald, C. B. (1985). A Time for Trumpets: The Untold Story of the Battle of the Bulge. William Morrow, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- MacGarrigle, G. L. (1998). Taking the Offensive: October 1966 to October 1967 (US Army in Vietnam). Center of Military History, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Mahan, A. T. (1897). The Life of Nelson: The Embodiment of the Sea Power of Great Britain. Little, Brown, Boston. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's work on aircraft survivability. Journal of the American Statistical Association 79(386): 259-267. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Manski, C. F. (1993). Identification of endogenous social effects: the reflection problem. Review of Economic Studies 60(3): 531-542. doi:10.2307/2298123 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Manstein, E. von (1958). Lost Victories. Methuen, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Mao Tse-tung (trans. Griffith, S. B.) (1961). On Guerrilla Warfare (orig. 1937). Praeger, New York. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Marshall, S. L. A. (1947). Men Against Fire: The Problem of Battle Command in Future War. William Morrow, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Marshall, S. L. A. (1956). Pork Chop Hill: The American Fighting Man in Action, Korea, Spring 1953. William Morrow, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Martin, C.; Parker, G. (1988). The Spanish Armada. Hamish Hamilton, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Matthews, M. M. (2008). We Were Caught Unprepared: The 2006 Hezbollah-Israeli War (Long War Series Occasional Paper 26). Combat Studies Institute Press, Fort Leavenworth. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Mattingly, G. (1959). The Armada. Houghton Mifflin, Boston. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- May, E. R. (2000). Strange Victory: Hitler's Conquest of France. Hill & Wang, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Maymin, P. Z. (2021). Smart kills and worthless deaths: eSports analytics for League of Legends. Journal of Quantitative Analysis in Sports 17(1): 11-27. doi:10.1515/jqas-2019-0096 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- McCloskey, J. F. (1987). The beginnings of operations research: 1934-1941. Operations Research 35(1): 143-152. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2nd ed.). Chapman & Hall, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- McFarland, S. L.; Newton, W. P. (1991). To Command the Sky: The Battle for Air Superiority over Germany, 1942-1944. Smithsonian Institution Press, Washington DC. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4): 54-89 (Spring 1989). doi:10.2307/2538780 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Medler, B.; John, M.; Lane, J. (2011). Data Cracker: developing a visual game analytic tool for analyzing online gameplay. Proc. CHI 2011, ACM: 2365-2374. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Michaels, J. (2010). A Chance in Hell: The Men Who Triumphed over Iraq's Deadliest City and Turned the Tide of War. St. Martin's Press, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Michel, M. L. (2002). The Eleven Days of Christmas: America's Last Vietnam Battle. Encounter Books, San Francisco. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Middlebrook, M. (1973). The Nuremberg Raid, 30-31 March 1944. Allen Lane, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Middlebrook, M. (1980). The Battle of Hamburg: Allied Bomber Forces Against a German City in 1943. Allen Lane, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Middlebrook, M. (1983). The Schweinfurt-Regensburg Mission. Allen Lane, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Middlebrook, M.; Mahoney, P. (1977). Battleship: The Loss of the Prince of Wales and the Repulse. Allen Lane, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Milgram, S.; Bickman, L.; Berkowitz, L. (1969). Note on the drawing power of crowds of different size. Journal of Personality and Social Psychology 13(2): 79-82. doi:10.1037/h0028070 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Miller, A.; Bornn, L.; Adams, R.; Goldsberry, K. (2014). Factorized point process intensities: a spatial analysis of professional basketball. Proc. 31st International Conference on Machine Learning (ICML 2014), PMLR 32: 235-243. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Miller, J. B.; Sanjurjo, A. (2018). Surprised by the hot hand fallacy? A truth in the law of small numbers. Econometrica 86(6): 2019-2047. doi:10.3982/ECTA14943 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Miller, J. L.; Crowcroft, J. (2009). Avatar movement in World of Warcraft battlegrounds. Proc. 8th Workshop on Network and System Support for Games (NetGames 2009), IEEE: 1-6. doi:10.1109/NETGAMES.2009.5446226 *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Mohammed, S.; Ferzandi, L.; Hamilton, K. (2010). Metaphor no more: a 15-year review of the team mental model construct. Journal of Management 36(4): 876-910. doi:10.1177/0149206309356804 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Montross, L.; Canzona, N. A. (1957). The Chosin Reservoir Campaign (US Marine Operations in Korea 1950-1953, Volume III). Historical Branch, US Marine Corps, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Morillo, S. (ed.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Morison, S. E. (1948). The Rising Sun in the Pacific, 1931-April 1942 (History of US Naval Operations in WWII, vol. 3). Little, Brown, Boston. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Morison, S. E. (1949). Coral Sea, Midway and Submarine Actions, May 1942-August 1942 (History of US Naval Operations in WWII, vol. 4). Little, Brown, Boston. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Morison, S. E. (1949). The Struggle for Guadalcanal, August 1942-February 1943 (History of US Naval Operations in WWII, vol. 5). Little, Brown, Boston. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Morison, S. E. (1950). Breaking the Bismarcks Barrier, 22 July 1942-1 May 1944 (History of US Naval Operations in WWII, vol. 6). Little, Brown, Boston. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Morison, S. E. (1953). New Guinea and the Marianas, March 1944-August 1944 (History of US Naval Operations in WWII, vol. 8). Little, Brown, Boston. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, vol. 12). Little, Brown, Boston. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Morison, S. E. (1960). Victory in the Pacific, 1945 (History of US Naval Operations in WWII, vol. 14). Little, Brown, Boston. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. Technology Press of MIT and John Wiley & Sons, New York, 1951. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Moussaïd, M.; Helbing, D.; Theraulaz, G. (2011). How simple rules determine pedestrian behavior and crowd disasters. Proceedings of the National Academy of Sciences 108(17): 6884-6888. doi:10.1073/pnas.1016507108 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Moussaïd, M.; Perozo, N.; Garnier, S.; Helbing, D.; Theraulaz, G. (2010). The walking behaviour of pedestrian social groups and its impact on crowd dynamics. PLoS ONE 5(4): e10047. doi:10.1371/journal.pone.0010047 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Mueller, K. P. (ed.) (2015). Precision and Purpose: Airpower in the Libyan Civil War (RR-676-AF). RAND Corporation, Santa Monica. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Mullen, B.; Copper, C. (1994). The relation between group cohesiveness and performance: an integration. Psychological Bulletin 115(2): 210-227. doi:10.1037/0033-2909.115.2.210 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Murray, W. (1983). Strategy for Defeat: The Luftwaffe 1933-1945. Air University Press, Maxwell AFB. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Murray, W.; Woods, K. M. (2014). The Iran-Iraq War: A Military and Strategic History. Cambridge University Press, Cambridge. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Nagy, M.; Ákos, Z.; Biro, D.; Vicsek, T. (2010). Hierarchical group dynamics in pigeon flocks. Nature 464(7290): 890-893. doi:10.1038/nature08891 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Nash, D. E. (2002). Hell's Gate: The Battle of the Cherkassy Pocket, January-February 1944. RZM Imports, Stamford, CT. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Naylor, S. (2005). Not a Good Day to Die: The Untold Story of Operation Anaconda. Berkley Books, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Nelder, J. A.; Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A 135(3): 370-384. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Newman, M. E. J. (2003). The structure and function of complex networks. SIAM Review 45(2): 167-256. doi:10.1137/S003614450342480 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Nolan, K. W. (1986). Into Laos: The Story of Dewey Canyon II/Lam Son 719, Vietnam 1971. Presidio Press, Novato. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Nordeen, L. O. (1990). Fighters over Israel. Orion Books, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- O'Neill, R. (1985). Australia in the Korean War 1950-53, Volume II: Combat Operations. Australian War Memorial and Australian Government Publishing Service, Canberra. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Oliker, O. (2001). Russia's Chechen Wars 1994-2000: Lessons from Urban Combat (MR-1289-A). RAND Corporation, Santa Monica. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Openshaw, S. (1984). The Modifiable Areal Unit Problem (CATMOG 38). Geo Books, Norwich. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Ord, J. K.; Getis, A. (1995). Local spatial autocorrelation statistics: distributional issues and an application. Geographical Analysis 27(4): 286-306. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Oren, M. B. (2002). Six Days of War: June 1967 and the Making of the Modern Middle East. Oxford University Press, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Osipov, M. (trans. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (orig. 1915). Naval Research Logistics 42(3): 435-490. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Overy, R. (2000). The Battle. Penguin, London, 2000. US edition: W. W. Norton, New York, 2001, as 'The Battle of Britain: The Myth and the Reality'. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Overy, R. (2013). The Bombing War: Europe 1939-1945. Allen Lane, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Paine, S. C. M. (2003). The Sino-Japanese War of 1894-1895: Perceptions, Power, and Primacy. Cambridge University Press, Cambridge. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Pakdaman Naeini, M.; Cooper, G. F.; Hauskrecht, M. (2015). Obtaining well calibrated probabilities using Bayesian binning. Proceedings of the AAAI Conference on Artificial Intelligence 29(1). doi:10.1609/aaai.v29i1.9602 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Pakenham, T. (1979). The Boer War. Weidenfeld & Nicolson, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Palacios-Huerta, I. (2003). Professionals play minimax. Review of Economic Studies 70(2): 395-415. doi:10.1111/1467-937X.00249 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Pape, R. A. (1996). Bombing to Win: Air Power and Coercion in War. Cornell University Press, Ithaca. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Paskiv, V.; Zanevskyy, I.; Koman, V. (2026). Differentiating playing roles in professional Counter-Strike 2 by performance indicators: an observational study. Health, Sport, Rehabilitation. doi:10.58962/hsr.1395 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- PC Gamer (2013). The International 2013: Grand Finals in review. PC Gamer. https://www.pcgamer.com/the-international-2013-grand-finals-in-review *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- PC Gamer (2016). The best CS:GO plays of 2016. PC Gamer. https://www.pcgamer.com/the-best-csgo-plays-of-2016 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Phipson, B.; Smyth, G. K. (2010). Permutation p-values should never be zero: calculating exact p-values when permutations are randomly drawn. Statistical Applications in Genetics and Molecular Biology 9(1): Article 39. doi:10.2202/1544-6115.1585 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Playfair, I. S. O.; Flynn, F. C.; Molony, C. J. C.; Gleave, T. P. (1960). The Mediterranean and Middle East, Volume III: British Fortunes Reach Their Lowest Ebb (History of the Second World War). HMSO, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Playfair, I. S. O.; Stitt, G. M. S.; Molony, C. J. C.; Toomer, S. E. (1954). The Mediterranean and Middle East, Volume I: The Early Successes against Italy (History of the Second World War). HMSO, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Plutarch (trans. Perrin, B.) (1916). Lives, Volume III: Pericles and Fabius Maximus, Nicias and Crassus (Loeb Classical Library). Heinemann, London; Macmillan, New York. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Pollack, K. M. (2002). Arabs at War: Military Effectiveness, 1948-1991. University of Nebraska Press, Lincoln. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Pollard, R.; Reep, C. (1997). Measuring the effectiveness of playing strategies at soccer. Journal of the Royal Statistical Society D 46(4): 541-550. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Polybius (trans. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Pope, D. (1956). The Battle of the River Plate. William Kimber, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Pope, D. G.; Schweitzer, M. E. (2011). Is Tiger Woods loss averse? Persistent bias in the face of experience, competition, and high stakes. American Economic Review 101(1): 129-157. doi:10.1257/aer.101.1.129 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Post, T.; van den Assem, M. J.; Baltussen, G.; Thaler, R. H. (2008). Deal or No Deal? Decision making under risk in a large-payoff game show. American Economic Review 98(1): 38-71. doi:10.1257/aer.98.1.38 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Prados, J.; Stubbe, R. W. (1991). Valley of Decision: The Siege of Khe Sanh. Houghton Mifflin, Boston. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Prange, G. W. (1981). At Dawn We Slept: The Untold Story of Pearl Harbor. McGraw-Hill, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Prior, R.; Wilson, T. (1992). Command on the Western Front: The Military Career of Sir Henry Rawlinson, 1914-1918. Blackwell, Oxford. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Putney, D. T. (2004). Airpower Advantage: Planning the Gulf War Air Campaign, 1989-1991. Air Force History and Museums Program, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Quarantelli, E. L. (1954). The nature and conditions of panic. American Journal of Sociology 60(3): 267-275. doi:10.1086/221536 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Rabinovich, A. (1988). The Boats of Cherbourg. Seaver Books, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Rathke, A. (2017). An examination of expected goals and shot efficiency in soccer. Journal of Human Sport and Exercise 12(Proc2). doi:10.14198/jhse.2017.12.proc2.05 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Reep, C.; Benjamin, B. (1968). Skill and chance in association football. Journal of the Royal Statistical Society A 131(4): 581-585. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Reiter, D.; Stam, A. C. (2002). Democracies at War. Princeton University Press, Princeton. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Reynolds, C. W. (1987). Flocks, herds and schools: a distributed behavioral model. Proceedings of SIGGRAPH '87 (Computer Graphics 21(4)): 25-34. doi:10.1145/37401.37406 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Reynolds, N. E. (2005). Basrah, Baghdad, and Beyond: The U.S. Marine Corps in the Second Iraq War. Naval Institute Press, Annapolis. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Riot Games (2013). Road to Worlds: Korea regionals recap. League of Legends Nexus. https://nexus.leagueoflegends.com/en-us/2013/09/road-to-worlds-korea-regionals-recap/ *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Robberechts, P.; Van Haaren, J.; Davis, J. (2021). A Bayesian approach to in-game win probability in soccer. Proceedings of the 27th ACM SIGKDD Conference on Knowledge Discovery & Data Mining: 3512-3521. doi:10.1145/3447548.3467194 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Roberts, M. (1958). Gustavus Adolphus: A History of Sweden, 1611-1632, Volume II. Longmans, Green, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Robinson, L. (2004). Masters of Chaos: The Secret History of the Special Forces. PublicAffairs, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Romjue, J. L. (1984). From Active Defense to AirLand Battle: The Development of Army Doctrine 1973-1982. US Army Training and Doctrine Command Historical Office, Fort Monroe. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Rosenau, W. (2001). Special Operations Forces and Elusive Enemy Ground Targets: Lessons from Vietnam and the Persian Gulf War (MR-1408-AF). RAND Corporation, Santa Monica. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Roskill, S. W. (1954). The War at Sea 1939-1945, vol. 1: The Defensive. HMSO, London. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Roskill, S. W. (1956). The War at Sea 1939-1945, vol. 2: The Period of Balance. HMSO, London. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Roskill, S. W. (1960). The War at Sea 1939-1945, vol. 3, part 1: The Offensive. HMSO, London. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Rotte, R.; Schmidt, C. M. (2003). On the production of victory: empirical determinants of battlefield success in modern war. Defence and Peace Economics 14(3): 175-192. doi:10.1080/1024269022000000868 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Rowland, D. (2006). The Stress of Battle: Quantifying Human Performance in Combat. The Stationery Office, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Ryan, C. (1974). A Bridge Too Far. Simon & Schuster, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Salas, E.; Sims, D. E.; Burke, C. S. (2005). Is there a "Big Five" in teamwork?. Small Group Research 36(5): 555-599. doi:10.1177/1046496405277134 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Salganik, M. J.; Dodds, P. S.; Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. Science 311(5762): 854-856. doi:10.1126/science.1121066 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Salmon, A. (2009). To the Last Round: The Epic British Stand on the Imjin River, Korea 1951. Aurum Press, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Scales, R. H. (1993). Certain Victory: The United States Army in the Gulf War. Office of the Chief of Staff, US Army, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Sears, S. W. (1983). Landscape Turned Red: The Battle of Antietam. Ticknor & Fields, New Haven. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Sears, S. W. (1996). Chancellorsville. Houghton Mifflin, Boston. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (eds.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Seif El-Nasr, M.; Nguyen, T.-H. D.; Canossa, A.; Drachen, A. (2021). Game Data Science. Oxford University Press, Oxford. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Semenov, A.; Romov, P.; Korolev, S.; Yashkov, D.; Neklyudov, K. (2017). Performance of machine learning algorithms in predicting game outcome from drafts in Dota 2. Analysis of Images, Social Networks and Texts (AIST 2016), CCIS 661, Springer: 26-37. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Seyfried, A.; Steffen, B.; Klingsch, W.; Boltes, M. (2005). The fundamental diagram of pedestrian movement revisited. Journal of Statistical Mechanics: Theory and Experiment 2005(10): P10002. doi:10.1088/1742-5468/2005/10/P10002 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Shaikh, S.; Rumbaugh, W. (2020). The Air and Missile War in Nagorno-Karabakh: Lessons for the Future of Strike and Defense. Center for Strategic and International Studies, Washington DC. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Shils, E. A.; Janowitz, M. (1948). Cohesion and disintegration in the Wehrmacht in World War II. Public Opinion Quarterly 12(2): 280-315. doi:10.1086/265951 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Shulimson, J.; Blasiol, L. A.; Smith, C. R.; Dawson, D. A. (1997). U.S. Marines in Vietnam: The Defining Year, 1968. History and Museums Division, US Marine Corps, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Siebold, G. L. (2007). The essence of military group cohesion. Armed Forces & Society 33(2): 286-295. doi:10.1177/0095327X06294173 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Sill, J. (2010). Improved NBA adjusted +/- using regularization and out-of-sample testing. MIT Sloan Sports Analytics Conference 2010. https://www.sloansportsconference.com/research-papers/improved-nba-adjusted-using-regularization-and-out-of-sample-testing *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Silva, A. L. C.; Pappa, G. L.; Chaimowicz, L. (2018). Continuous outcome prediction of League of Legends competitive matches using recurrent neural networks. SBGames 2018, Computing Track (short paper). http://www.sbgames.org/sbgames2018/files/papers/ComputacaoShort/188226.pdf *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis. Chapman & Hall, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Smail, R. C. (1956). Crusading Warfare, 1097-1193. Cambridge University Press, Cambridge. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Smith, G.; Levere, M.; Kurtzman, R. (2009). Poker player behavior after big wins and big losses. Management Science 55(9): 1547-1555. doi:10.1287/mnsc.1090.1044 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Smith, R. R. (1963). Triumph in the Philippines (US Army in World War II). Office of the Chief of Military History, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Special Operations Review Group (Holloway, J. L., chair) (1980). Rescue Mission Report. Joint Chiefs of Staff, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Starcke, K.; Brand, M. (2012). Decision making under stress: a selective review. Neuroscience & Biobehavioral Reviews 36(4): 1228-1248. doi:10.1016/j.neubiorev.2012.02.003 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Stone, L. D. (1975). Theory of Optimal Search. Academic Press, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Stone, L. D.; Keller, C. M.; Kratzke, T. M.; Strumpfer, J. P. (2014). Search for the wreckage of Air France flight AF 447. Statistical Science 29(1): 69-80. doi:10.1214/13-STS420 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Stouffer, S. A.; et al. (1949). The American Soldier, Volume II: Combat and Its Aftermath. Princeton University Press, Princeton. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Sumption, J. (1990). The Hundred Years War, Volume I: Trial by Battle. Faber & Faber, London. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Sun Tzu (trans. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Sweetman, J. (1982). Operation Chastise: The Dams Raid, Epic or Myth. Jane's, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Szell, M.; Lambiotte, R.; Thurner, S. (2010). Multirelational organization of large-scale social networks in an online world. Proceedings of the National Academy of Sciences 107(31): 13636-13641. doi:10.1073/pnas.1004008107 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Tacitus (trans. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Taki, T.; Hasegawa, J.; Fukumura, T. (1996). Development of motion analysis system for quantitative evaluation of teamwork in soccer games. Proc. IEEE International Conference on Image Processing (ICIP 1996). *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Tapper, J. (2012). The Outpost: An Untold Story of American Valor. Little, Brown, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 vols.). Operations Research Society of America, Military Applications Section, Arlington VA. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Taylor, T. L. (2012). Raising the Stakes: E-Sports and the Professionalization of Computer Gaming. MIT Press, Cambridge MA. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Thaler, R. H.; Johnson, E. J. (1990). Gambling with the house money and trying to break even: the effects of prior outcomes on risky choice. Management Science 36(6): 643-660. doi:10.1287/mnsc.36.6.643 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Thompson, W. W. (2000). To Hanoi and Back: The United States Air Force and North Vietnam, 1966-1973. Air Force History and Museums Program, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Till, G. (2018). Seapower: A Guide for the Twenty-First Century (4th ed.). Routledge, Abingdon. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Tobler, W. R. (1970). A computer movie simulating urban growth in the Detroit region. Economic Geography 46 (supplement): 234-240. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Tokey, S. S.; Chen, Z.-S.; Mettler, C.; Tang, D.-X.; Boudaoud, B.; Kim, J.; Spjut, J.; Claypool, M. (2024). The effects of network latency on the peeker's advantage in first-person shooter games. Proceedings of the 19th International Conference on the Foundations of Digital Games (FDG 2024). doi:10.1145/3649921.3650002 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Totten, C. W. (2019). An Architectural Approach to Level Design (2nd ed.). CRC Press, Boca Raton. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Trask, D. F. (1981). The War with Spain in 1898. Macmillan, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Travers, T. (2001). Gallipoli 1915. Tempus, Stroud. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Triandafillov, V. K. (trans. Kipp, W. A.) (1994). The Nature of the Operations of Modern Armies (orig. 1929). Frank Cass, Ilford. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Tully, A. P. (2009). Battle of Surigao Strait. Indiana University Press, Bloomington. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Tunstrøm, K.; Katz, Y.; Ioannou, C. C.; Huepe, C.; Lutz, M. J.; Couzin, I. D. (2013). Collective states, multistability and transitional behavior in schooling fish. PLoS Computational Biology 9(2): e1002915. doi:10.1371/journal.pcbi.1002915 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Turnbull, S. (2003). Tannenberg 1410: Disaster for the Teutonic Knights (Campaign 122). Osprey, Oxford. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Turner, A.; Doxa, M.; O'Sullivan, D.; Penn, A. (2001). From isovists to visibility graphs: a methodology for the analysis of architectural space. Environment and Planning B 28(1): 103-121. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Tversky, A.; Kahneman, D. (1992). Advances in prospect theory: cumulative representation of uncertainty. Journal of Risk and Uncertainty 5(4): 297-323. doi:10.1007/BF00122574 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Upcomer (2018). CSGO 2018 retrospective: the reign of Astralis. Upcomer. https://upcomer.com/csgo-2018-retrospective-astralis/ *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- US Navy Department (1898). Official Records of the Union and Confederate Navies in the War of the Rebellion, Series I, vol. 7. Government Printing Office, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I vol. 21 (Fredericksburg). Government Printing Office, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- van Creveld, M. (1982). Fighting Power: German and U.S. Army Performance, 1939-1945. Greenwood Press, Westport. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Vegetius (trans. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Vego, M. N. (2007). Joint Operational Warfare: Theory and Practice. Naval War College, Newport. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Venkus, R. E. (1992). Raid on Qaddafi. St. Martin's Press, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Vicsek, T.; Czirók, A.; Ben-Jacob, E.; Cohen, I.; Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. Physical Review Letters 75(6): 1226-1229. doi:10.1103/PhysRevLett.75.1226 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Vicsek, T.; Zafeiris, A. (2012). Collective motion. Physics Reports 517(3-4): 71-140. doi:10.1016/j.physrep.2012.03.004 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Vinyals, O.; Babuschkin, I.; Czarnecki, W. M.; et al. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. Nature 575(7782): 350-354. doi:10.1038/s41586-019-1724-z *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- von Neumann, J.; Morgenstern, O. (1944). Theory of Games and Economic Behavior. Princeton University Press, Princeton. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Waddington, C. H. (1973). O.R. in World War 2: Operational Research against the U-Boat. Elek Science, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Wald, A.; Wolfowitz, J. (1940). On a test whether two samples are from the same population. Annals of Mathematical Statistics 11(2): 147-162. doi:10.1214/aoms/1177731909 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Walker, M.; Wooders, J. (2001). Minimax play at Wimbledon. American Economic Review 91(5): 1521-1538. doi:10.1257/aer.91.5.1521 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Wallner, G. (ed.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Wallner, G.; Kriglstein, S. (2014). PLATO: a visual analytics system for gameplay data. Computers & Graphics 38: 341-356. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Warden, J. A. (1988). The Air Campaign: Planning for Combat. National Defense University Press, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Washburn, A. R. (2002). Search and Detection (4th ed.). INFORMS / Military Applications Section, Linthicum MD. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Watling, J.; Reynolds, N. (2022). Operation Z: The Death Throes of an Imperial Delusion. Royal United Services Institute, London (Special Report, April 2022). *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Watling, J.; Reynolds, N. (2022). Ukraine at War: Paving the Road from Survival to Victory. Royal United Services Institute, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Watling, J.; Reynolds, N. (2023). Meatgrinder: Russian Tactics in the Second Year of Its Invasion of Ukraine. Royal United Services Institute, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Watling, J.; Reynolds, N. (2023). Stormbreak: Fighting Through Russian Defences in Ukraine's 2023 Offensive. Royal United Services Institute, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Wawro, G. (1996). The Austro-Prussian War: Austria's War with Prussia and Italy in 1866. Cambridge University Press, Cambridge. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Weapons Systems Evaluation Group (1967). Project Red Baron: Air-to-Air Encounters in Southeast Asia, Volume I (WSEG Report 116). Weapons Systems Evaluation Group, Washington DC (DTIC). *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Weiss, H. K. (1966). Combat models and historical data: the U.S. Civil War. Operations Research 14(5): 759-790. doi:10.1287/opre.14.5.759 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Werrell, K. P. (2005). Archie to SAM: A Short Operational History of Ground-Based Air Defense (2nd ed.). Air University Press, Maxwell AFB. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Westermeyer, P. W. (2008). U.S. Marines in Battle: Al-Khafji, 28 January-1 February 1991. History Division, US Marine Corps, Washington DC. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Willard, D. (1962). Lanchester as Force in History: An Analysis of Land Battles of the Years 1618-1905 (RAC-TP-74). Research Analysis Corporation, Bethesda MD. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association 22(158): 209-212. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Wilson, H. W. (1896). Ironclads in Action: A Sketch of Naval Warfare from 1855 to 1895. Sampson Low, Marston, London. *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Wise, H. L. (2007). Inside the Danger Zone: The U.S. Military in the Persian Gulf, 1987-1988. Naval Institute Press, Annapolis. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Wong, L.; Kolditz, T. A.; Millen, R. A.; Potter, T. M. (2003). Why They Fight: Combat Motivation in the Iraq War. Strategic Studies Institute, US Army War College, Carlisle PA. https://press.armywarcollege.edu/monographs/322/ *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Woolley, A. W.; Chabris, C. F.; Pentland, A.; Hashmi, N.; Malone, T. W. (2010). Evidence for a collective intelligence factor in the performance of human groups. Science 330(6004): 686-688. doi:10.1126/science.1193147 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Xenophon (trans. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *(δημόσιο κτήμα)* *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Xenopoulos, P.; Coelho, B.; Silva, C. (2021). Optimal team economic decisions in Counter-Strike. arXiv preprint 2109.12990. doi:10.48550/arXiv.2109.12990 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Xenopoulos, P.; Freeman, W. R.; Silva, C. (2022). Analyzing the differences between professional and amateur esports through win probability. Proceedings of the ACM Web Conference 2022 (WWW '22): 3418-3427. doi:10.1145/3485447.3512277 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Xenopoulos, P.; Silva, C. (2022). ESTA: an esports trajectory and action dataset. arXiv preprint 2209.09861. doi:10.48550/arXiv.2209.09861 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Y'Blood, W. T. (1981). Red Sun Setting: The Battle of the Philippine Sea. Naval Institute Press, Annapolis. *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Yang, P.; Harrison, B.; Roberts, D. L. (2014). Identifying patterns in combat that are predictive of success in MOBA games. Proc. 9th International Conference on Foundations of Digital Games (FDG 2014). *(ελέγχθηκε 2026-11-15: ύπαρξη)*
- Yang, Y.; Qin, T.; Lei, Y.-H. (2017). Real-time eSports match result prediction. arXiv preprint 1701.03162. doi:10.48550/arXiv.1701.03162 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Yannakakis, G. N.; Togelius, J. (2018). Artificial Intelligence and Games. Springer, Cham. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Yee, N.; Bailenson, J. N.; Urbanek, M.; Chang, F.; Merget, D. (2007). The unbearable likeness of being digital: the persistence of nonverbal social norms in online virtual environments. CyberPsychology & Behavior 10(1): 115-121. doi:10.1089/cpb.2006.9984 *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Zabrodskyi, M.; Watling, J.; Danylyuk, O. V.; Reynolds, N. (2022). Preliminary Lessons in Conventional Warfighting from Russia's Invasion of Ukraine: February-July 2022. Royal United Services Institute, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Zaffiri, S. (1988). Hamburger Hill: May 11-20, 1969. Presidio Press, Novato. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Zaloga, S. J. (1996). Bagration 1944: The Destruction of Army Group Centre (Campaign 42). Osprey, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Zaloga, S. J.; Madej, W. V. (1985). The Polish Campaign 1939. Hippocrene Books, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Zucchino, D. (2004). Thunder Run: The Armored Strike to Capture Baghdad. Atlantic Monthly Press, New York. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*
- Zuehlke, M. (1999). Ortona: Canada's Epic World War II Battle. Stoddart, Toronto. *(ελέγχθηκε 2026-11-15: λεπτομέρεια)*


<!-- kb:end -->
