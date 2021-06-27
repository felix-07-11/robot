
- [RobotScript](#robotscript)
  - [Beispiele](#beispiele)
    - [Datentypen](#datentypen)
    - [Variablen definieren](#variablen-definieren)
    - [Wenn ( If )](#wenn--if-)
    - [Widerhole ( For )](#widerhole--for-)
    - [Wiederhole_solange ( While )](#wiederhole_solange--while-)
      - [Vergleichsoperatoren](#vergleichsoperatoren)
      - [Besonderheiten](#besonderheiten)
  - [Syntax](#syntax)
    - [Symbole](#symbole)
    - [Keywords](#keywords)
    - [Regeln](#regeln)

# RobotScript

## Beispiele

### Datentypen

- Int (Ganzzahlen)
- Boolean (Wahrheitswerte; 'wahr' wird durch 1 und 'falsch' durch 0 repräsentiert)

### Variablen definieren

`var a = 1`  
`var b = wahr`  
`variable c = 2`  
`variable d = falsch`

### Wenn ( If )
```
wenn <Bedingung>:
    <wenn Bedingung wahr>
sonst
    <wenn Bedingung falsch>
*wenn

wenn wahr:
    schritt()
*wenn

wenn falsch:
    schritt()
sonst
    linksdrehen()
*wenn
```

### Widerhole ( For )
```
wiederhole <Zahl, Berechnung, Ausdruck>:
    <wird wiederholt>
*wiederhole
```

### Wiederhole_solange ( While )
```
wiederhole_solange <Bedingung>:
    <wird wiederholt>
*wiederhole
```

#### Vergleichsoperatoren
|Bedeutung|Operator|
|:---:|:---:|
|Gleich|==|
|Ungleich|!=|
|kleiner als|<|
|größer als|>|
|kleiner als / gleich|<=|
|größer als / gleich|>=|

```
1 == 1           -> wahr
144 / 12 != 12   -> falsch
```

#### Besonderheiten

```
wahr == 1   -> wahr
wahr == 0   -> falsch
wahr >  1   -> falsch

falsch != 0 -> falsch
```

## Syntax

### Symbole
|Name|Symbol|
|:---:|:---:|
|plus|+|
|minus|-|
|mul oder as|*|
|div|/|
|lparen|(|
|rparen|)|
|eq|=|
|ee|==|
|ne|!=|
|lt|<|
|gt|>|
|lte|<=|
|gte|>=|
|co|:|
|comma|,|

### Keywords
|Keyword|Bedeutung|
|:---:|:---|
|var|Variablendefinierung|
|variable|Variablendefinierung|
|und|logisches und (Beide Bedingungen müssen erfüllt sein)|
|oder|logisches oder (Eine der beiden Bedingungen muss erfüllt sein)|
|[wenn](#wenn--if-)|führt Code nur aus, wenn die Bedingung "wahr" ist|
|[wiederhole](#wenn--if-)|einfache Zählschleife|
|[wiederhole_solange](#wenn--if-)|wiederholt den Code solange die Bedingung "wahr" ist|

### Regeln
```
statements: newline* expr (newline+ expr)* newline*

expr:
    (Keyword:var | Keyword:variable) identifier eq expr
    comp-expr ((Keyword:und | Keyword:oder) comp-expr)*

comp-expr:
    Keyword:nicht comp-expr
    arith-expr ((ee|ne|lt|gt|lte|gte) arith-expr)*

arith-expr:
    term ((plus|minus) term)*

term:
    factor ((mul|div) factor)*

factor:
    (plus|minus) factor
    call

call:
    atom (lparen (expr (comma expr)*)? rparen)?

atom:
    int|identifier
    lparen expr rparen
    if-expr
    for-expr
    while-expr
    function-def

if-expr:
    keyword:wenn expr co expr|statements (keyword:sonst statements)? as+keyword:wenn

for-expr:
    keyword:wiederhole expr co expr|statements as+keyword:wiederhole

while-expr:
    keyword:wiederhole_solange expr co expr|statements as+keyword:wiederhole_solange

function-def:
    keyword:funktion (lparen (identifier (comma identifier)*)? rparen)? co expr|statements as+keyword:funktion
```
