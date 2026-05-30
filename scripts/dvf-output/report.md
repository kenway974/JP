# Calibration DVF Île-de-France

_Généré le 2026-05-23 par `scripts/calibrate-dvf.ts`_

## Source
- Base : DVF (Demandes de Valeurs Foncières), Etalab / files.data.gouv.fr
- Départements : 75, 77, 78, 91, 92, 93, 94, 95
- Années : 2022, 2023, 2024
- Lignes brutes lues : **1 439 845**
- Mutations Vente Appart/Maison : **411 292**
- Transactions mono-lot retenues : **377 501**

## Filtres
- `nature_mutation = "Vente"`
- `type_local ∈ {Appartement, Maison}`
- `surface_reelle_bati ≥ 10 m²`
- `prix_m² ∈ [1000, 30000] €/m²`
- Mutation conservée seulement si **1 seule ligne** appart/maison (élimine les ventes multi-lots qui faussent le ratio prix/surface)

## Résultats globaux
| Indicateur | Valeur |
|---|---|
| Médiane appartement IDF | **5 833 €/m²** |
| Médiane maison IDF | **3 827 €/m²** |
| Multiplicateur maison/appart | **0.656** |
| Base price retenue (sale) | **5 830 €/m²** |

## Top 30 codes postaux (par volume)
| Code postal | Commune | Ventes | Médiane appart | Médiane maison | Multiplicateur |
|---|---|---:|---:|---:|---:|
| 75015 | Paris 15e Arrondissement | 9095 | 10 009 | 13 416 | 1.72 |
| 75018 | Paris 18e Arrondissement | 8843 | 9 408 | 13 883 | 1.61 |
| 75017 | Paris 17e Arrondissement | 7464 | 10 758 | 14 500 | 1.84 |
| 75016 | Paris 16e Arrondissement | 7141 | 11 370 | 16 685 | 1.95 |
| 75011 | Paris 11e Arrondissement | 7133 | 10 400 | 18 403 | 1.78 |
| 75020 | Paris 20e Arrondissement | 5849 | 8 820 | 12 071 | 1.51 |
| 75012 | Paris 12e Arrondissement | 4941 | 9 579 | 13 163 | 1.64 |
| 92100 | Boulogne-Billancourt | 4744 | 8 855 | 13 511 | 1.52 |
| 75019 | Paris 19e Arrondissement | 4720 | 8 611 | 12 549 | 1.48 |
| 75014 | Paris 14e Arrondissement | 4550 | 10 000 | 12 859 | 1.71 |
| 75010 | Paris 10e Arrondissement | 4473 | 10 000 | — | 1.71 |
| 75013 | Paris 13e Arrondissement | 4314 | 9 150 | 13 897 | 1.57 |
| 92600 | Asnières-sur-Seine | 3685 | 6 658 | 8 882 | 1.14 |
| 93100 | Montreuil | 3333 | 6 429 | 6 833 | 1.10 |
| 75009 | Paris 9e Arrondissement | 3252 | 11 295 | 16 689 | 1.94 |
| 92400 | Courbevoie | 3097 | 7 075 | 9 266 | 1.21 |
| 95100 | Argenteuil | 2832 | 3 333 | 4 207 | 0.57 |
| 78000 | Versailles | 2825 | 6 938 | 9 192 | 1.19 |
| 92500 | Rueil-Malmaison | 2809 | 5 872 | 8 186 | 1.01 |
| 92300 | Levallois-Perret | 2734 | 9 476 | 11 873 | 1.62 |
| 92200 | Neuilly-sur-Seine | 2701 | 11 029 | 17 300 | 1.89 |
| 92700 | Colombes | 2680 | 5 333 | 7 585 | 0.91 |
| 75007 | Paris 7e Arrondissement | 2572 | 14 500 | 23 058 | 2.49 |
| 75005 | Paris 5e Arrondissement | 2488 | 12 321 | 19 670 | 2.11 |
| 94300 | Vincennes | 2387 | 8 964 | 11 601 | 1.54 |
| 75006 | Paris 6e Arrondissement | 2249 | 14 802 | 18 387 | 2.54 |
| 92130 | Issy-les-Moulineaux | 2231 | 7 976 | 10 326 | 1.37 |
| 94100 | Saint-Maur-des-Fossés | 2197 | 5 602 | 7 664 | 0.96 |
| 93160 | Noisy-le-Grand | 2165 | 4 302 | 4 817 | 0.74 |
| 92110 | Clichy | 2091 | 7 247 | 9 715 | 1.24 |

## Top 10 zones les plus chères (parmi celles ≥30 ventes)
| Code postal | Commune | Médiane appart | Multiplicateur |
|---|---|---:|---:|
| 75006 | Paris 6e Arrondissement | 14 802 | 2.54 |
| 75007 | Paris 7e Arrondissement | 14 500 | 2.49 |
| 75004 | Paris 4e Arrondissement | 13 000 | 2.23 |
| 75001 | Paris 1er Arrondissement | 12 857 | 2.20 |
| 75008 | Paris 8e Arrondissement | 12 636 | 2.17 |
| 75005 | Paris 5e Arrondissement | 12 321 | 2.11 |
| 75003 | Paris 3e Arrondissement | 12 244 | 2.10 |
| 75002 | Paris 2e Arrondissement | 11 727 | 2.01 |
| 75016 | Paris 16e Arrondissement | 11 370 | 1.95 |
| 75009 | Paris 9e Arrondissement | 11 295 | 1.94 |

## Top 10 zones les moins chères (parmi celles ≥30 ventes)
| Code postal | Commune | Médiane appart | Multiplicateur |
|---|---|---:|---:|
| 95200 | Sarcelles | 2 000 | 0.34 |
| 77130 | Saint-Germain-Laval | 2 031 | 0.35 |
| 91130 | Ris-Orangis | 2 107 | 0.36 |
| 91000 | Évry-Courcouronnes | 2 211 | 0.38 |
| 93270 | Sevran | 2 283 | 0.39 |
| 77140 | Saint-Pierre-lès-Nemours | 2 327 | 0.40 |
| 95400 | Arnouville | 2 364 | 0.41 |
| 91940 | Les Ulis | 2 388 | 0.41 |
| 91150 | Brouy | 2 463 | 0.42 |
| 91380 | Chilly-Mazarin | 2 545 | 0.44 |

## Limites
- L'état du bien (neuf/bon/à rafraîchir/à rénover) **n'est pas dans DVF** → multiplicateurs conservés tels quels.
- Les features (parking, balcon, etc.) ne sont pas dans DVF → conservés tels quels.
- Les loyers (`basePricePerM2.rent`) ne sont pas calibrés (DVF = transactions de vente uniquement).
- Les ventes multi-lots (appart + parking + cave par exemple) sont exclues pour ne pas biaiser le prix/m².
- Le coefficient maison/appart calculé sur IDF (0.656) peut être plus faible que la valeur initiale (1.1) car en IDF les maisons sont souvent en périphérie moins chère.
