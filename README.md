# Magyar Diceware szószedetek

**Magyar nyelvű Diceware-szószedetek** kriptográfiailag erős, mégis megjegyezhető jelmondatok készítéséhez. Két szószedet érhető el: egy **1296 szavas rövid** (ékezet nélküli) és egy **7776 szavas hosszú** (kizárólag ékezetes) változat.

> 🎲 **Online generátor:** [kockajelszo.hu](https://kockajelszo.hu) — fizikai kocka nélkül is, közvetlenül a böngésződben.

---

## Cél

A klasszikus angol Diceware-szószedetek (Arnold Reinhold eredeti, 1995-ös listája, az EFF 2016-os listái) régóta elérhetők. Magyar nyelven azonban a könnyű felidézhetőséget előtérbe helyező, jól strukturált, nyilvánosan használható Diceware-szószedet eddig gyakorlatilag nem létezett.

Ez a projekt két magyar szószedetet kínál, mindkettő gondosan válogatva a [Magyar Wikiszótár szógyűjteményéből](https://hu.wiktionary.org/wiki/Kateg%C3%B3ria:Magyar_szavak_list%C3%A1ja), magyar Hunspell-szótárral ellenőrizve, és Diceware-szabványos méretű (a 6 hatványa).

## A két szószedet

### Rövid szószedet — 1296 szó (6⁴)

Könnyen felidézhető, **kizárólag ékezet nélküli** magyar szavak — főleg konkrét főnevek és jellemzően hangutánzó igék. A szavak **eredetileg, a helyes magyar írásmód szerint is ékezet nélküliek** — semmilyen ékezet-eltávolítás vagy torzítás nincs a listában. Például `medve`, `szerviz`, `zacc`, `vatta` helyesen írva magyarul mind ékezet nélküliek.

- **Méret:** 1296 szó (4 kockadobás, `1111`–`6666`)
- **Entrópia/szó:** ~10,34 bit
- **Szóhossz:** általában rövidebb, képi szavak
- **Karakterkészlet:** kizárólag ASCII

### Hosszú szószedet — 7776 szó (6⁵)

EFF-stílusú, gazdagabb választékot adó szószedet, **túlnyomórészt ékezetes szavakkal**. Fontos válogatási kritérium volt, hogy ha egy szóból az ékezeteket eltávolítjuk, **ne "zuhanjon össze" egy létező ékezet nélküli magyar szóvá**: az ilyen párokat (pl. `köröm` ↔ `korom`, `tévé` ↔ `teve`) eltávolítottam. Így az ékezetmentes megjelenítés sem rontja a felismerhetőséget.

- **Méret:** 7776 szó (5 kockadobás, `11111`–`66666`)
- **Entrópia/szó:** ~12,92 bit
- **Szóhossz:** 4–8 betű
- **5 betűs prefix-szabály:** ha két szó első 4 betűje megegyezik, az 5. betű biztosan eltér — így a leírt szavak az első 5 karakter alapján egyértelműen visszafejthetők
- **Karakterkészlet:** teljes magyar ABC

## Entrópia és ajánlott szószám

A jelmondat entrópiája azt méri, hány különböző jelmondatot tudna a támadó egyenlő valószínűséggel kitalálni. Egy szó kiválasztása `log₂(szószedetméret)` bit entrópiát ad.

| Szavak | Rövid szószedet (10,34 bit/szó) | Hosszú szószedet (12,92 bit/szó) | Erősség |
|------:|---------------------------:|----------------------------:|:--------|
|     5 |                       51,7 |                        64,6 | Gyenge / közepes |
|     6 |                       62,0 |                        77,5 | Közepes / Erős |
|     7 |                       72,4 |                        90,4 | Erős |
|     8 |                       82,7 |                       103,3 | Nagyon erős |
|    10 |                      103,4 |                       129,2 | Kiváló |

**Általános ajánlás:** legalább **6 szó a hosszú** vagy **8 szó a rövid** listából komoly biztonsági igényhez.

## Hogyan használd

### Fizikai kockával (a klasszikus Diceware-módszer)

1. Dobj **4 kockával** (rövid szószedet) vagy **5 kockával** (hosszú szószedet) — vagy egy kockával ennyiszer egymás után.
2. Olvasd le a számokat sorrendben, pl. `3, 1, 5, 2` → `3152`.
3. Keresd ki ezt a számot a megfelelő `.txt` fájlban (`diceware_hu_short.txt` vagy `diceware_hu_long.txt`).
4. Ismételd, amíg el nem éred a kívánt szószámot (általában 6–10).
5. **A szavakat soha ne magad válaszd ki** — csak a kockákra hagyatkozz. Az emberi „véletlen" választás bizonyítottan torzít.

A fizikai-kockás módszer a Diceware lényege: nem kell bíznod egyetlen szoftverben sem, a fizika dolgozik neked.

### Online, böngészőben

A [kockajelszo.hu](https://kockajelszo.hu) oldalon a böngésződ kriptográfiai véletlenszám-generátorát (`window.crypto.getRandomValues`) használja a generátor, és semmilyen adat nem hagyja el a gépedet. Választhatsz a két szószedet között, állíthatod a szószámot, az elválasztó karaktert, és igény szerint hozzáadhatsz véletlen nagy kezdőbetűt vagy szimbólumot.

### Programozottan, JavaScript-ből

A `.js` fájlok egy-egy konstans tömböt exportálnak:

```javascript
// Rövid szószedet
import { HUNGARIAN_WORDS_SHORT } from './diceware_hu_short.js';

// Hosszú szószedet
import { HUNGARIAN_WORDS_LONG } from './diceware_hu_long.js';

// Egy szó kiválasztása kriptográfiailag biztonságos forrásból,
// torzítás nélkül (rejection sampling).
function pickWord(list) {
  const N = list.length;
  const limit = Math.floor(0x100000000 / N) * N;
  const buf = new Uint32Array(1);
  let r;
  do {
    crypto.getRandomValues(buf);
    r = buf[0];
  } while (r >= limit);
  return list[r % N];
}

const word = pickWord(HUNGARIAN_WORDS_LONG);
```

**Fontos:** kriptográfiai célokra **mindig** használj `crypto.getRandomValues`-t vagy ezzel egyenértékű forrást. A `Math.random()` **nem alkalmas** jelszógenerálásra, mert nem kriptográfiailag biztonságos. A `% N` egyszerű modulo is enyhe torzítást okoz, ha `N` nem osztója a tartomány méretének — ezt a fenti rejection sampling kiküszöböli.

## Fájlformátumok

| Fájl | Formátum | Mire való |
|---|---|---|
| `diceware_hu_short.txt` | TAB-elválasztott szöveg | Fizikai kockával történő manuális használat, EFF-konvenció szerint |
| `diceware_hu_short.js` | JavaScript modul | Programozott használat, weboldalakon való beágyazás |
| `diceware_hu_long.txt` | TAB-elválasztott szöveg | Mint fent, a hosszú listához |
| `diceware_hu_long.js` | JavaScript modul | Mint fent, a hosszú listához |

## Eredet és attribúció

A szószedetek a **CarryPass** projekt keretében jöttek létre — egy nyílt forráskódú, a személyes adatok védelmét előtérbe helyező hozzáférési-adat kezelőhöz készültek először, majd külön közöltük őket, hogy más projektek is használhassák. [carrypass.net](https://carrypass.net)

- **Forrás:** a szavak válogatása a [Magyar Wikiszótár — Magyar szavak listája](https://hu.wiktionary.org/wiki/Kateg%C3%B3ria:Magyar_szavak_list%C3%A1ja) alapján történt.
- **Szerző / összeállító:** CarryPass / Rácz Zoltán.
- **Helyesírás-ellenőrzés:** magyar Hunspell szótár.

Mivel a forrásanyag a magyar Wikiszótárból származik, a projekt a Wikiszótár licencét örökli (lásd lentebb).

## Illetlen vagy sértő szavak

A válogatás során igyekeztem kiszűrni a durva, sértő vagy obszcén szavakat. Ha mégis bennmaradt valami, kérlek jelezd a **carrypass-info@proton.me** címen — a soron következő verzióból eltávolítom.

## Licenc

A szószedetek a **Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)** licenc alatt érhetők el, mivel a forrásanyag (Magyar Wikiszótár) is ezt a licencet használja és követeli meg.

- **Szabadon felhasználható, módosítható, terjeszthető** — kereskedelmi célokra is.
- **Attribúció kötelező:** az eredeti szerzőt (CarryPass / Rácz Zoltán) és a forrást (Magyar Wikiszótár) meg kell nevezni.
- **Származékos művek ugyanezen licenc alatt** — ha a szószedetet módosítva továbbadod, a tiéd is CC BY-SA 4.0 alatt kell legyen.

A teljes licencszöveg és az attribúciós sablonok: [LICENSE](LICENSE) · [https://creativecommons.org/licenses/by-sa/4.0/deed.hu](https://creativecommons.org/licenses/by-sa/4.0/deed.hu)
