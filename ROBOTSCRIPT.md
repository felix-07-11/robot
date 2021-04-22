
- [RobotScript](#robotscript)
  - [Beispiele](#beispiele)
    - [Datentypen](#datentypen)
    - [Variablen definieren](#variablen-definieren)
    - [Wenm ( If )](#wenm--if-)
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

### Wenm ( If )
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

### Keywords
|Keyword|Bedeutung|
|:---:|:---|
|var|Variablendefinierung|
|variable|Variablendefinierung|
|und|logisches und (Beide Bedingungen müssen erfüllt sein)|
|oder|logisches oder (Eine der beiden Bedingungen muss erfüllt sein)|

### Regeln
```
expr:
    (Keyword:var | Keyword:variable) Identifier eq expr
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

atom:
    int|Identifier
    lparen expr rparen
    if-expr

if-expr:
    keyword:wenn expr co expr (keyword:sonst expr)? as+keyword:wenn
```
