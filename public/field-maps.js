window.TATRY_FIELD_MAPS={
  'morskie-oko':{
    issue:'FIELD MAP 01 / MORSKIE OKO',title:'Не просто дорога к озеру.',
    intro:'Где не пропустить нужную ветку, когда заканчивается лёгкий подход и чем круг вокруг озера отличается от асфальта.',
    stops:[
      {ratio:0,kicker:'00 / START',name:'Palenica Białczańska',tag:'СТАРТ',meta:'0.0 км',level:'info',prompt:'ЛОГИСТИКА',decision:'Сверь красную маркировку на Morskie Oko и не рассчитывай на свободный паркинг без проверки заранее.',body:'Большая часть людей идёт в ту же сторону, но именно здесь полезно скачать офлайн-карту и проверить актуальные ограничения TPN.'},
      {ratio:.145,kicker:'01 / JUNCTION',name:'Wodogrzmoty Mickiewicza',tag:'ОСТАВАЙСЯ НА КРАСНОМ',meta:'≈ 2.8 км',level:'nav',prompt:'КЛЮЧЕВАЯ РАЗВИЛКА',decision:'На Morskie Oko продолжай по широкой дороге с красной маркировкой. Зелёный уходит в Dolina Roztoki.',body:'Самая заметная развилка дня. Поворот в Dolina Roztoki нужен для маршрута к Пяти Ставам, но не для классического подхода к озеру.'},
      {ratio:.30,kicker:'02 / APPROACH',name:'Włosienica',tag:'ОТКРЫТЫЙ ФИНАЛ',meta:'≈ 5.7 км',level:'effort',prompt:'ЧТО МЕНЯЕТСЯ',decision:'Продолжай по красной маркировке; впереди последний устойчивый подъём к озеру.',body:'Лес расходится, виды становятся шире, а уклон заметнее. Это хороший момент оценить силы до дополнительного круга вокруг озера.'},
      {ratio:.40,kicker:'03 / LAKE',name:'Schronisko Morskie Oko',tag:'ОЗЕРО + ПРИЮТ',meta:'≈ 7.6 км',level:'info',prompt:'КОНТРОЛЬНАЯ ТОЧКА',decision:'Для короткого варианта можно развернуться. Для полного маршрута продолжай по красной тропе вокруг озера.',body:'Здесь заканчивается дорожный подход и начинается более неровная прибрежная тропа.',photoIndex:1},
      {ratio:.49,kicker:'04 / SHORE',name:'Дальний берег',tag:'КАМНИ У ВОДЫ',meta:'≈ 9.3 км',level:'danger',prompt:'ПОКРЫТИЕ',decision:'Держись размеченной прибрежной тропы и не срезай по мокрым плитам у самой воды.',body:'Круг вокруг озера заметно грубее асфальта: камни, корни и мокрые участки меняют темп, особенно после дождя.'},
      {ratio:.592,kicker:'05 / LOOP',name:'Morskie Oko',tag:'КРУГ ЗАМКНУТ',meta:'≈ 11.3 км',level:'summit',prompt:'ПЛАН ВОЗВРАЩЕНИЯ',decision:'Вернись к Palenica по той же красной дороге; цветная часть карты здесь заканчивается.',body:'На обратный путь остаётся длинный, пусть и технически простой, спуск. Оставь время и силы на дорогу до автобуса.',photoIndex:0}
    ],
    terrain:[{from:0,to:.30,kind:'approach'},{from:.30,to:.40,kind:'effort'},{from:.40,to:.592,kind:'navigation'}],
    sources:[['TPN','https://tpn.gov.pl/szlaki-turystyczne/palenica-bialczanska-morskie-oko-i-spacer-wokol-morskiego-oka']]
  },
  'five-lakes':{
    issue:'FIELD MAP 02 / FIVE LAKES',title:'Петля с двумя разными днями внутри.',
    intro:'Долинный подъём, мокрые плиты у Siklawa, высокий траверс Świstówka и понятный возврат от Morskie Oko.',
    stops:[
      {ratio:0,kicker:'00 / START',name:'Palenica Białczańska',tag:'СТАРТ',meta:'0.0 км',level:'info',prompt:'ПЛАН ДНЯ',decision:'Начинай по красной дороге на Morskie Oko, но готовься покинуть её у Wodogrzmoty.',body:'Это длинная петля: ранний старт важнее скорости на первых километрах.'},
      {ratio:.15,kicker:'01 / JUNCTION',name:'Wodogrzmoty Mickiewicza',tag:'ПОВОРОТ В DOLINA ROZTOKI',meta:'≈ 3.0 км',level:'nav',prompt:'КЛЮЧЕВАЯ РАЗВИЛКА',decision:'Сверни с красной дороги на зелёную маркировку в Dolina Roztoki.',body:'Если продолжить по асфальту, попадёшь к Morskie Oko и пропустишь основную часть петли.'},
      {ratio:.30,kicker:'02 / VALLEY',name:'Dolina Roztoki',tag:'ДЛИННЫЙ НАБОР',meta:'≈ 6.0 км',level:'effort',prompt:'ТЕМП',decision:'Оставайся на зелёной маркировке и не расходуй силы до финального подъёма к водопаду.',body:'Лесной участок кажется спокойным, но набирает высоту почти без паузы.'},
      {ratio:.39,kicker:'03 / WATERFALL',name:'Siklawa',tag:'МОКРЫЕ ПЛИТЫ',meta:'≈ 7.8 км',level:'danger',prompt:'СКОЛЬЗКИЙ УЧАСТОК',decision:'Следуй разметке по каменным ступеням; не приближайся к краю водопада ради фото.',body:'После дождя и при остаточном снеге плиты могут быть скользкими. Здесь маршрут впервые требует внимательной работы ног.'},
      {ratio:.45,kicker:'04 / LAKES',name:'Wielki Staw',tag:'ПЯТЬ СТАВОВ',meta:'≈ 9.0 км',level:'info',prompt:'ФОТОТОЧКА',decision:'На развилках у долины держи направление на Świstówka и Morskie Oko.',body:'Открывается широкая высокогорная долина. При ухудшении погоды оцени, входить ли в высокий траверс.',photoIndex:1},
      {ratio:.50,kicker:'05 / TRAVERSE',name:'Świstówka Roztocka',tag:'ВЫСОКИЙ ТРАВЕРС',meta:'≈ 10.0 км',level:'danger',prompt:'ПОГОДА + СЕЗОН',decision:'Проверь, что тропа открыта и видимость достаточная; не уходи на боковые следы в траве.',body:'Открытый склон даёт сильный ветер и мало укрытий. Снег может держаться здесь дольше, чем в долине.',photoIndex:0},
      {ratio:.612,kicker:'06 / LAKE',name:'Morskie Oko',tag:'ВЫХОД К ОЗЕРУ',meta:'≈ 12.2 км',level:'nav',prompt:'СМЕНА ЛОГИКИ',decision:'У озера выйди на красную дорогу и возвращайся по ней к Palenica.',body:'Сложная часть позади, но до финиша ещё длинный дорожный спуск.'},
      {ratio:1,kicker:'07 / FINISH',name:'Palenica Białczańska',tag:'ФИНИШ',meta:'≈ 20.0 км',level:'summit',prompt:'ТРАНСПОРТ',decision:'Сверь остановку и последний рейс до Zakopane.',body:'Петля замыкается у того же trailhead; закладывай запас на очереди и транспорт.'}
    ],
    terrain:[{from:0,to:.15,kind:'approach'},{from:.15,to:.39,kind:'effort'},{from:.39,to:.50,kind:'technical'},{from:.50,to:.612,kind:'navigation'},{from:.612,to:1,kind:'approach'}],
    sources:[['TPN','https://tpn.gov.pl/szlaki-turystyczne/palenica-bialczanska-wodogrzmoty-mickiewicza-dolina-roztoki-dolina-pieciu-stawow-polskich-swistowka-roztocka-morskie-oko']]
  },
  'czarny-staw':{
    issue:'FIELD MAP 03 / CZARNY STAW',title:'Где городская тропа становится альпийской.',
    intro:'Развилки над Kuźnice, открытый Skupniów Upłaz, контрольная пауза у Murowaniec и короткий финал к холодному озеру.',
    stops:[
      {ratio:0,kicker:'00 / START',name:'Kuźnice',tag:'СТАРТ',meta:'0.0 км',level:'info',prompt:'МАРКИРОВКА',decision:'Ищи синюю маркировку к Boczań и Przełęcz między Kopami.',body:'Несколько популярных маршрутов начинаются рядом, поэтому не выбирай направление только по потоку людей.'},
      {ratio:.04,kicker:'01 / JUNCTION',name:'Развилка над Kuźnice',tag:'НЕ НА NOSAL',meta:'≈ 0.5 км',level:'nav',prompt:'РАННЯЯ РАЗВИЛКА',decision:'Оставайся на синем пути к Hala Gąsienicowa; зелёный ведёт к Nosal.',body:'Ошибка здесь не опасна сама по себе, но быстро уводит в совсем другой маршрут.'},
      {ratio:.24,kicker:'02 / RIDGE',name:'Skupniów Upłaz',tag:'ОТКРЫТЫЙ СКЛОН',meta:'≈ 3.0 км',level:'effort',prompt:'ЧТО МЕНЯЕТСЯ',decision:'Продолжай по синей маркировке и следи за погодой: укрытий становится меньше.',body:'Лес отступает, набор ощущается сильнее, а виды впервые показывают масштаб Hala Gąsienicowa.'},
      {ratio:.32,kicker:'03 / PASS',name:'Przełęcz między Kopami',tag:'ТРОПЫ СХОДЯТСЯ',meta:'≈ 4.0 км',level:'nav',prompt:'КОНТРОЛЬНАЯ ТОЧКА',decision:'Продолжай в сторону Hala Gąsienicowa и Murowaniec.',body:'Здесь варианты подхода сходятся. В тумане проверяй маркировку, а не визуальную линию рельефа.'},
      {ratio:.37,kicker:'04 / SHELTER',name:'Hala Gąsienicowa',tag:'MUROWANIEC',meta:'≈ 4.6 км',level:'info',prompt:'ПАУЗА + РЕШЕНИЕ',decision:'От приюта продолжай по синей маркировке к Czarny Staw.',body:'Последняя удобная пауза перед более каменистым финалом. Здесь хорошо решить, хватает ли времени на озеро.',photoIndex:0},
      {ratio:.50,kicker:'05 / LAKE',name:'Czarny Staw Gąsienicowy',tag:'ЦЕЛЬ',meta:'≈ 6.2 км',level:'summit',prompt:'ПЛАН ВОЗВРАЩЕНИЯ',decision:'Для этого маршрута развернись у озера и вернись через Hala Gąsienicowa.',body:'Дальнейшие тропы ведут к более серьёзным целям; не продолжай автоматически за другими группами.',photoIndex:1}
    ],
    terrain:[{from:0,to:.24,kind:'approach'},{from:.24,to:.37,kind:'effort'},{from:.37,to:.50,kind:'navigation'}],
    sources:[['TPN','https://tpn.gov.pl/szlaki-turystyczne/dolina-suchej-wody-hala-gasienicowa-czarny-staw-gasienicowy-przelecz-miedzy-kopami-boczan-kuznice']]
  },
  kasprowy:{
    issue:'FIELD MAP 04 / KASPROWY',title:'Подъём пешком, а не очередь на канатку.',
    intro:'Где отделиться от соседних маршрутов, когда заканчивается лес и почему верхняя станция ещё не означает конец усилия.',
    stops:[
      {ratio:0,kicker:'00 / START',name:'Kuźnice',tag:'СТАРТ',meta:'0.0 км',level:'info',prompt:'ВЫБОР ТРОПЫ',decision:'Найди зелёную маркировку на Kasprowy Wierch и не уходи по синему к Hala Gąsienicowa.',body:'У старта сходится много маршрутов и инфраструктуры канатной дороги; цвет маркировки важнее толпы.'},
      {ratio:.12,kicker:'01 / JUNCTION',name:'Лесная развилка',tag:'ДЕРЖИСЬ ЗЕЛЁНОГО',meta:'≈ 1.5 км',level:'nav',prompt:'НАВИГАЦИЯ',decision:'На боковых тропах к Kalatówki и Giewont оставайся на зелёной маркировке Kasprowy.',body:'После Kuźnice направление легко принять за продолжение соседнего маршрута.'},
      {ratio:.25,kicker:'02 / FOREST',name:'Myślenickie Turnie',tag:'СЕРЕДИНА НАБОРА',meta:'≈ 3.2 км',level:'effort',prompt:'ТЕМП',decision:'Продолжай устойчивый подъём и оцени запас воды до выхода на открытый склон.',body:'Лесной участок длиннее, чем кажется по карте; канатка над головой не сокращает пеший маршрут.'},
      {ratio:.36,kicker:'03 / OPEN',name:'Верхний склон',tag:'ВЕТЕР + СОЛНЦЕ',meta:'≈ 4.6 км',level:'danger',prompt:'ПОГОДА',decision:'Если облака закрывают гребень или ветер мешает устойчиво идти, разворот здесь проще, чем выше.',body:'Укрытий почти нет, покрытие становится каменистым, а погода на хребте меняется быстро.',photoIndex:0},
      {ratio:.46,kicker:'04 / STATION',name:'Верхняя станция',tag:'ЛЮДИ + РАЗВИЛКИ',meta:'≈ 5.8 км',level:'nav',prompt:'НЕ ФИНИШ',decision:'Сверь зелёную маркировку к вершине и не уходи вдоль хребта случайно.',body:'Инфраструктура и поток с канатки маскируют обычную логику тропы.'},
      {ratio:.50,kicker:'05 / SUMMIT',name:'Kasprowy Wierch',tag:'1987 М',meta:'≈ 6.3 км',level:'summit',prompt:'ПЛАН СПУСКА',decision:'Для пешего out-and-back вернись тем же зелёным маршрутом в Kuźnice.',body:'На вершине открытый международный хребет: не продолжай по нему без отдельного плана.',photoIndex:1}
    ],
    terrain:[{from:0,to:.25,kind:'approach'},{from:.25,to:.46,kind:'effort'},{from:.46,to:.50,kind:'navigation'}],
    sources:[['Zakopane.pl','https://www.zakopane.pl/strefa-turystyczna/turystyka/wycieczki-gorskie-latem/szlaki-lato']]
  },
  giewont:{
    issue:'FIELD MAP 05 / GIEWONT',title:'Топокарта, которая объясняет маршрут.',
    intro:'Рельеф и соседние тропы остаются на месте. Поверх них — восемь точек, где меняется нагрузка, нужно принять решение или особенно внимательно свериться с маркировкой.',
    stops:[
      {ratio:0,kicker:'00 / START',name:'Kuźnice',tag:'СТАРТ',meta:'≈ 1025 м · 0.0 км',level:'info',prompt:'МАРКИРОВКА',decision:'Держись синей маркировки в сторону Kalatówki и Hala Kondratowa.',body:'Каменная дорога начинается почти сразу. Это последний удобный момент проверить воду, офлайн-карту и прогноз до ухода в лес.'},
      {ratio:.14,kicker:'01 / JUNCTION',name:'Kalatówki',tag:'СЛЕДИ ЗА СИНИМ',meta:'≈ 1200 м · 1.6 км',level:'nav',prompt:'БОКОВЫЕ ВАРИАНТЫ',decision:'У развилок и построек не иди за самым большим потоком автоматически: сверяй синюю маркировку на Hala Kondratowa.',body:'На широкой дороге легко расслабиться, но здесь появляются боковые варианты. После дождя камни и короткий скальный порог могут быть скользкими.'},
      {ratio:.291,kicker:'02 / SHELTER',name:'Hala Kondratowa',tag:'РЕШЕНИЕ + ПАУЗА',meta:'1335 м · 3.4 км',level:'nav',prompt:'КЛЮЧЕВАЯ РАЗВИЛКА',decision:'Зелёный уходит к Przełęcz pod Kopą Kondracką. На Giewont продолжай по синему к Kondracka Przełęcz.',body:'Приют — хорошая контрольная точка перед более серьёзным набором. Проверь погоду и силы: дальше быстро становится круче.',photoIndex:2},
      {ratio:.335,kicker:'03 / EFFORT',name:'Piekiełko',tag:'ЗДЕСЬ НАЧИНАЕТСЯ КРУТО',meta:'≈ 1500 м · 3.9 км',level:'effort',prompt:'СЛОЖНОСТЬ',decision:'Маршрут по-прежнему синий; в тумане не срезай широкие петли подъёма.',body:'После халы начинается устойчивый крутой набор по открытому склону. Темп падает, ветер ощущается сильнее, а назад до укрытия уже не две минуты.',photoIndex:0},
      {ratio:.443,kicker:'04 / PASS',name:'Kondracka Przełęcz',tag:'КЛЮЧЕВАЯ РАЗВИЛКА',meta:'1725 м · 5.1 км',level:'nav',prompt:'НАВИГАЦИЯ',decision:'Жёлтый ведёт к Kopa Kondracka. На Giewont поверни вправо и оставайся на синем.',body:'Самая важная навигационная точка подъёма: в облаке нужное направление не всегда читается по рельефу. Здесь особенно полезна офлайн-карта.',photoIndex:3},
      {ratio:.469,kicker:'05 / PASS',name:'Wyżnia Kondracka Przełęcz',tag:'ПОСЛЕДНЕЕ РЕШЕНИЕ',meta:'1765 м · 5.4 км',level:'nav',prompt:'КРИТЕРИЙ РАЗВОРОТА',decision:'Красный уходит в Dolina Strążyska. К вершине продолжай по синему; выше начинается односторонняя петля.',body:'До вершины недалеко, но характер маршрута резко меняется. Если погода портится, это разумная точка не входить в скальный финал.'},
      {ratio:.482,kicker:'06 / TECHNICAL',name:'Цепи и скальные ступени',tag:'РУКИ НА СКАЛУ',meta:'≈ 1840 м · 5.6 км',level:'danger',prompt:'ТЕХНИЧЕСКИЙ УЧАСТОК',decision:'Следуй одностороннему потоку и разметке. Не разворачивайся против движения на цепях.',body:'Полированный известняк, цепи и скобы требуют свободных рук и спокойного темпа. В грозу этот участок и металлические элементы особенно опасны.',photoIndex:4},
      {ratio:.497,kicker:'07 / SUMMIT',name:'Giewont',tag:'1894 М / КРЕСТ',meta:'1894 м · 5.75 км',level:'summit',prompt:'СПУСК',decision:'Спуск начинается по другой стороне односторонней петли, затем возвращается к Wyżnia Kondracka Przełęcz.',body:'На вершине мало пространства и много людей. Не задерживай поток ради фото и не оставайся у металлического креста при риске грозы.',photoIndex:5}
    ],
    terrain:[{from:0,to:.291,kind:'approach'},{from:.291,to:.443,kind:'effort'},{from:.443,to:.469,kind:'navigation'},{from:.469,to:.50,kind:'technical'}],
    sources:[['TPN','https://tpn.gov.pl/szlaki-turystyczne/kuznice-polana-kalatowki-polana-kondratowa'],['Zakopane.pl','https://www.zakopane.pl/strefa-turystyczna/turystyka/wycieczki-gorskie-latem/szlaki-lato/hala-kondratowa-giewont-dolina-strazyska']]
  },
  czerwone:{
    issue:'FIELD MAP 06 / CZERWONE WIERCHY',title:'Четыре вершины, один длинный выход.',
    intro:'Где покинуть Dolina Kościeliska, как читать широкий хребет в тумане и на какой вершине начинается логистика спуска к Kuźnice.',
    stops:[
      {ratio:0,kicker:'00 / START',name:'Kiry',tag:'СТАРТ',meta:'0.0 км',level:'info',prompt:'ПЛАН A → B',decision:'Иди по зелёной маркировке в Dolina Kościeliska и заранее держи в голове финиш в Kuźnice.',body:'Это маршрут между двумя trailhead: автомобиль у старта не решает возвращение с финиша.'},
      {ratio:.20,kicker:'01 / JUNCTION',name:'Adamica',tag:'УХОД ИЗ ДОЛИНЫ',meta:'≈ 3.1 км',level:'nav',prompt:'КЛЮЧЕВАЯ РАЗВИЛКА',decision:'Покинь основную долину по красной маркировке в сторону Ciemniak.',body:'Если продолжить по зелёному дну долины, попадёшь к Ornak, а не на Czerwone Wierchy.'},
      {ratio:.36,kicker:'02 / RIDGE',name:'Ciemniak',tag:'ВЫХОД НА ХРЕБЕТ',meta:'≈ 5.5 км',level:'effort',prompt:'ПОГОДА',decision:'Дальше держись красной маркировки по открытому хребту.',body:'Лес остаётся внизу. Ветер, облако и отсутствие укрытий теперь важнее технической сложности.'},
      {ratio:.45,kicker:'03 / SUMMIT',name:'Krzesanica',tag:'2122 М',meta:'≈ 6.9 км',level:'summit',prompt:'ФОТОТОЧКА',decision:'Продолжай по красному к Małołączniak; не спускайся с широкого гребня по неразмеченным следам.',body:'Самая высокая точка польской части массива и длинная панорама хребта.',photoIndex:0},
      {ratio:.54,kicker:'04 / RIDGE',name:'Małołączniak',tag:'ТУМАН = КАРТА',meta:'≈ 8.3 км',level:'nav',prompt:'ОРИЕНТИРОВАНИЕ',decision:'На широком плато регулярно сверяй красные метки и направление к Kopa Kondracka.',body:'В хорошую погоду линия очевидна; в облаке округлый рельеф делает боковые спуски обманчивыми.',photoIndex:1},
      {ratio:.65,kicker:'05 / TURN',name:'Kopa Kondracka',tag:'НАЧАЛО СПУСКА',meta:'≈ 10.0 км',level:'nav',prompt:'ВЫБОР ДОЛИНЫ',decision:'Сверни на зелёную маркировку к Przełęcz pod Kopą Kondracką и Hala Kondratowa.',body:'Красный гребень продолжается дальше; для финиша в Kuźnice нужен явный уход с хребта.'},
      {ratio:.78,kicker:'06 / SHELTER',name:'Hala Kondratowa',tag:'ПОСЛЕДНИЙ ЭТАП',meta:'≈ 12.0 км',level:'info',prompt:'КОНТРОЛЬ ВРЕМЕНИ',decision:'От халы следуй синему через Kalatówki в Kuźnice.',body:'Технически проще, но ноги уже уставшие, а каменная дорога на спуске длиннее, чем кажется.'},
      {ratio:1,kicker:'07 / FINISH',name:'Kuźnice',tag:'ФИНИШ',meta:'≈ 15.4 км',level:'summit',prompt:'ТРАНСПОРТ',decision:'Маршрут заканчивается в другом месте: используй городской транспорт до базы.',body:'Проверяй транспорт заранее, особенно при позднем возвращении.'}
    ],
    terrain:[{from:0,to:.20,kind:'approach'},{from:.20,to:.36,kind:'effort'},{from:.36,to:.65,kind:'navigation'},{from:.65,to:1,kind:'approach'}],
    sources:[['Zakopane.pl','https://www.zakopane.pl/strefa-turystyczna/turystyka/wycieczki-gorskie-latem/szlaki-lato']]
  },
  sarnia:{
    issue:'FIELD MAP 07 / SARNIA SKAŁA',title:'Короткий маршрут с настоящими решениями.',
    intro:'Боковой заход к Siklawica, крутой подъём на Czerwona Przełęcz, тесная скальная вершина и выход через другую долину.',
    stops:[
      {ratio:0,kicker:'00 / START',name:'Dolina Strążyska',tag:'СТАРТ',meta:'0.0 км',level:'info',prompt:'НАПРАВЛЕНИЕ',decision:'Следуй красной маркировке в глубину Dolina Strążyska.',body:'Первые километры спокойные, но маршрут не остаётся прогулкой по дну долины.'},
      {ratio:.30,kicker:'01 / MEADOW',name:'Polana Strążyska',tag:'ВОДОПАД — БОКОВОЙ ЗАХОД',meta:'≈ 2.0 км',level:'nav',prompt:'ВЫБОР',decision:'К Siklawica ведёт короткая жёлтая ветка; после фото вернись на поляну для продолжения к Sarnia Skała.',body:'Не продолжай вверх от водопада по случайным следам. Основной маршрут на перевал начинается с поляны.',photoIndex:1},
      {ratio:.42,kicker:'02 / CLIMB',name:'Czerwona Przełęcz',tag:'КРУТОЙ ПОДЪЁМ',meta:'≈ 2.8 км',level:'effort',prompt:'СЛОЖНОСТЬ',decision:'На перевале сверь чёрную маркировку к Sarnia Skała.',body:'Короткий маршрут сжимает набор высоты в один плотный участок; мокрые корни и камни требуют внимания.'},
      {ratio:.58,kicker:'03 / SUMMIT',name:'Sarnia Skała',tag:'СКАЛЬНЫЙ ФИНАЛ',meta:'≈ 3.9 км',level:'summit',prompt:'ТЕСНАЯ ВЕРШИНА',decision:'Вернись по той же ветке к Czerwona Przełęcz, не спускайся с вершины напрямую.',body:'Финальные камни несложные в сухую погоду, но тесны и скользки при большом потоке.',photoIndex:0},
      {ratio:.70,kicker:'04 / RETURN',name:'Czerwona Przełęcz',tag:'ПОВОРОТ К БЕЛОЙ ДОЛИНЕ',meta:'≈ 4.7 км',level:'nav',prompt:'ДРУГОЙ ФИНИШ',decision:'Выбирай чёрную маркировку в сторону Dolina Białego, а не назад в Strążyska.',body:'Здесь маршрут превращается в point-to-point. Ошибка вернёт тебя к старту вместо нужного финиша.'},
      {ratio:1,kicker:'05 / FINISH',name:'Dolina Białego',tag:'ФИНИШ',meta:'≈ 6.7 км',level:'info',prompt:'ВОЗВРАЩЕНИЕ',decision:'Выйди к городской части Zakopane и строй навигацию от фактического выхода.',body:'Финиш не совпадает со стартом, зато находится ближе к городской инфраструктуре.'}
    ],
    terrain:[{from:0,to:.30,kind:'approach'},{from:.30,to:.42,kind:'effort'},{from:.42,to:.70,kind:'technical'},{from:.70,to:1,kind:'navigation'}],
    sources:[['TPN','https://tpn.gov.pl/szlaki-turystyczne/dolina-strazyska-polana-strazyska-siklawica-strazyska-sarnia-skala-dolina-bialego-wielka-krokiew']]
  },
  koscieliska:{
    issue:'FIELD MAP 08 / KOŚCIELISKA',title:'Спокойная долина с боковыми соблазнами.',
    intro:'Основная зелёная ось, ответвления к ущелью и пещерам, поворот у Ornak и тихий лесной финал к Smreczyński Staw.',
    stops:[
      {ratio:0,kicker:'00 / START',name:'Kiry',tag:'СТАРТ',meta:'0.0 км',level:'info',prompt:'ОСНОВНАЯ ЛИНИЯ',decision:'Держись зелёной маркировки вдоль Dolina Kościeliska.',body:'Маршрут выглядит простым, но боковые достопримечательности легко превращают его в более длинный день.'},
      {ratio:.18,kicker:'01 / GATE',name:'Brama Kantaka',tag:'УЗКАЯ ДОЛИНА',meta:'≈ 2.4 км',level:'info',prompt:'ПОКРЫТИЕ',decision:'Оставайся на широкой зелёной тропе вдоль потока.',body:'Скальные ворота сужают долину; после осадков покрытие может быть мокрым и холоднее, чем у старта.'},
      {ratio:.30,kicker:'02 / MEADOW',name:'Polana Pisana',tag:'БОКОВЫЕ МАРШРУТЫ',meta:'≈ 4.0 км',level:'nav',prompt:'НЕ СМЕШИВАЙ ПЛАНЫ',decision:'Для Smreczyński Staw продолжай по зелёному. Wąwóz Kraków — отдельный боковой вариант с возвратом.',body:'Если добавить ущелье или пещеры, пересчитай время и снаряжение, а не считай их «по пути».',photoIndex:0},
      {ratio:.40,kicker:'03 / CAVES',name:'Пещерные ответвления',tag:'ОТДЕЛЬНЫЙ ПЛАН',meta:'≈ 5.4 км',level:'danger',prompt:'СНАРЯЖЕНИЕ',decision:'Не входи в пещерные маршруты без отдельной проверки открытия, света и подходящей экипировки.',body:'Маркированная долина остаётся простой; боковые пещеры — это уже другая задача.'},
      {ratio:.426,kicker:'04 / SHELTER',name:'Schronisko Ornak',tag:'ПОВОРОТ К ОЗЕРУ',meta:'≈ 5.7 км',level:'nav',prompt:'КЛЮЧЕВАЯ РАЗВИЛКА',decision:'Для озера найди чёрную маркировку на Smreczyński Staw.',body:'У приюта легко решить, достаточно ли времени на дополнительный лесной подъём.'},
      {ratio:.51,kicker:'05 / LAKE',name:'Smreczyński Staw',tag:'ТИХИЙ ФИНАЛ',meta:'≈ 6.8 км',level:'summit',prompt:'РАЗВОРОТ',decision:'От озера вернись той же чёрной веткой к Ornak, затем по зелёному в Kiry.',body:'Помост у озера — конец этой ветки; дальше по берегу размеченного продолжения нет.',photoIndex:1}
    ],
    terrain:[{from:0,to:.30,kind:'approach'},{from:.30,to:.426,kind:'navigation'},{from:.426,to:.51,kind:'effort'}],
    sources:[['TPN','https://tpn.gov.pl/szlaki-turystyczne/kiry-polana-pisana-wawoz-krakow-schronisko-ornak-smreczynski-staw-kiry']]
  },
  chocholowska:{
    issue:'FIELD MAP 09 / CHOCHOŁOWSKA',title:'Длинная долина, где расстояние — главная сложность.',
    intro:'Переход от асфальта к гравию, психологическая середина, открытая поляна и приют, после которого ещё нужно вернуться.',
    stops:[
      {ratio:0,kicker:'00 / START',name:'Siwa Polana',tag:'СТАРТ',meta:'0.0 км',level:'info',prompt:'ЛОГИСТИКА',decision:'Иди по зелёной маркировке в Dolina Chochołowska.',body:'Проверь правила въезда и транспорта: это длинный линейный подход, а не короткая прогулка к точке.'},
      {ratio:.20,kicker:'01 / SURFACE',name:'Polana Huciska',tag:'КОНЕЦ ЛЁГКОГО АСФАЛЬТА',meta:'≈ 3.1 км',level:'info',prompt:'ЧТО МЕНЯЕТСЯ',decision:'Продолжай по зелёной долинной тропе.',body:'Дорожное покрытие становится менее ровным, но основная сложность всё ещё в общей дистанции.'},
      {ratio:.35,kicker:'02 / DISTANCE',name:'Середина долины',tag:'НЕ ФИНИШ',meta:'≈ 5.3 км',level:'effort',prompt:'ТЕМП',decision:'Сверь время: после приюта придётся пройти почти тот же путь обратно.',body:'Рельеф спокойный, поэтому легко идти быстрее плана и забыть про запас на возвращение.'},
      {ratio:.46,kicker:'03 / MEADOW',name:'Polana Chochołowska',tag:'ОТКРЫТАЯ ПОЛЯНА',meta:'≈ 7.0 км',level:'info',prompt:'ФОТОТОЧКА',decision:'Продолжай по зелёному к приюту, не уходя на хребтовые ответвления.',body:'Главная визуальная сцена маршрута; весенний крокусовый сезон резко увеличивает поток людей.',photoIndex:0},
      {ratio:.50,kicker:'04 / SHELTER',name:'Schronisko Chochołowskie',tag:'ЦЕЛЬ',meta:'≈ 7.6 км',level:'summit',prompt:'РАЗВОРОТ',decision:'Для базового маршрута возвращайся тем же зелёным путём к Siwa Polana.',body:'Приют — не середина «лёгкой прогулки», а точка разворота полного 15-километрового дня.',photoIndex:1}
    ],
    terrain:[{from:0,to:.20,kind:'approach'},{from:.20,to:.46,kind:'effort'},{from:.46,to:.50,kind:'navigation'}],
    sources:[['TPN','https://tpn.gov.pl/szlaki-turystyczne/siwa-polana-polana-huciska-polana-chocholowska']]
  },
  'gesia-szyja':{
    issue:'FIELD MAP 10 / GĘSIA SZYJA',title:'Панорама доступная, лестница — нет.',
    intro:'Лёгкий подход к Rusinowa Polana, ясный выбор на поляне, тысяча деревянных ступеней и point-to-point выход к Palenica.',
    stops:[
      {ratio:0,kicker:'00 / START',name:'Wierch Poroniec',tag:'СТАРТ',meta:'0.0 км',level:'info',prompt:'МАРКИРОВКА',decision:'Следуй зелёной маркировке к Rusinowa Polana.',body:'Первые километры мягкие и подходят для разогрева; не суди по ним о подъёме на вершину.'},
      {ratio:.20,kicker:'01 / MEADOW',name:'Rusinowa Polana',tag:'БОЛЬШАЯ ПАНОРАМА',meta:'≈ 1.6 км',level:'info',prompt:'ФОТОТОЧКА',decision:'На поляне найди зелёную маркировку к Gęsia Szyja.',body:'До поляны приходят с нескольких сторон, поэтому обратное направление не всегда совпадает с потоком людей.',photoIndex:0},
      {ratio:.30,kicker:'02 / JUNCTION',name:'Bacówka',tag:'ВЕРШИНА ИЛИ ВИКТОРУВКИ',meta:'≈ 2.3 км',level:'nav',prompt:'ВЫБОР',decision:'Для вершины оставайся на зелёном подъёме; Wiktorówki — отдельное направление.',body:'Решение здесь определяет, входишь ли ты в самый крутой участок маршрута.'},
      {ratio:.45,kicker:'03 / STAIRS',name:'Деревянные ступени',tag:'КРУТО И ДОЛГО',meta:'≈ 3.5 км',level:'effort',prompt:'СЛОЖНОСТЬ',decision:'Держи ровный темп и пропускай встречных только на устойчивых площадках.',body:'Серия ступеней набирает высоту быстро; мокрое дерево может быть скользким.'},
      {ratio:.567,kicker:'04 / SUMMIT',name:'Gęsia Szyja',tag:'1489 М',meta:'≈ 4.4 км',level:'summit',prompt:'ФОТОТОЧКА',decision:'Продолжай по запланированной зелёной линии к финишу, не уходя на случайные боковые тропы.',body:'Скальная вершина даёт более высокий ракурс, но мало места при большом потоке.',photoIndex:1},
      {ratio:.72,kicker:'05 / DESCENT',name:'Спуск к долине',tag:'СВЕРЬ НАПРАВЛЕНИЕ',meta:'≈ 5.6 км',level:'nav',prompt:'POINT TO POINT',decision:'Проверь, что выбранная ветка ведёт к Palenica Białczańska, а не обратно к Wierch Poroniec.',body:'После вершины сеть троп снова становится важнее рельефа.'},
      {ratio:1,kicker:'06 / FINISH',name:'Palenica Białczańska',tag:'ФИНИШ',meta:'≈ 7.8 км',level:'info',prompt:'ТРАНСПОРТ',decision:'Возвращайся в Zakopane от Palenica, а не от стартового trailhead.',body:'Финиш в другом месте — это часть маршрута, а не ошибка геометрии.'}
    ],
    terrain:[{from:0,to:.30,kind:'approach'},{from:.30,to:.567,kind:'effort'},{from:.567,to:1,kind:'navigation'}],
    sources:[['TPN','https://tpn.gov.pl/szlaki-turystyczne/zazadnia-wiktorowki-rusinowa-polana-i-gesia-szyja']]
  },
  nosal:{
    issue:'FIELD MAP 11 / NOSAL',title:'Коротко не значит без последствий.',
    intro:'Ранняя развилка над Kuźnice, быстрый набор, скальные ступени у вершины и спуск в другую точку.',
    stops:[
      {ratio:0,kicker:'00 / START',name:'Kuźnice',tag:'СТАРТ',meta:'0.0 км',level:'info',prompt:'МАРКИРОВКА',decision:'Ищи зелёную маркировку на Nosal.',body:'Рядом начинаются маршруты к Hala Gąsienicowa и Kasprowy, поэтому название направления нужно проверить сразу.'},
      {ratio:.10,kicker:'01 / JUNCTION',name:'Развилка над Kuźnice',tag:'ПОВОРОТ НА NOSAL',meta:'≈ 0.2 км',level:'nav',prompt:'КЛЮЧЕВАЯ РАЗВИЛКА',decision:'Оставайся на зелёной маркировке к Nosal, не уходи по синему в сторону Hala.',body:'Маршрут короткий, и ранняя ошибка съедает значительную часть дня.'},
      {ratio:.35,kicker:'02 / CLIMB',name:'Лесной подъём',tag:'УКЛОН РАСТЁТ',meta:'≈ 0.8 км',level:'effort',prompt:'ТЕМП',decision:'Иди по зелёным меткам и не срезай серпантин.',body:'Высота набирается быстро; мокрые корни делают короткий подъём менее дружелюбным.'},
      {ratio:.55,kicker:'03 / ROCK',name:'Скальный склон',tag:'ОТКРЫТЫЕ СТУПЕНИ',meta:'≈ 1.3 км',level:'danger',prompt:'ПОКРЫТИЕ',decision:'Держись размеченных каменных ступеней и оставляй дистанцию до людей сверху.',body:'На мокрой скале нужен аккуратный шаг, а на узких местах — терпение.',photoIndex:1},
      {ratio:.641,kicker:'04 / SUMMIT',name:'Nosal',tag:'1206 М',meta:'≈ 1.5 км',level:'summit',prompt:'ВЕРШИНА',decision:'Продолжай по зелёному к Nosalowa Przełęcz; маршрут не возвращается тем же путём.',body:'Вершина компактная, зато быстро открывает вид поверх леса.',photoIndex:0},
      {ratio:.78,kicker:'05 / PASS',name:'Nosalowa Przełęcz',tag:'СПУСК',meta:'≈ 1.9 км',level:'nav',prompt:'ДРУГОЙ ФИНИШ',decision:'Сверь зелёную ветку к Kuźnicka Polana.',body:'Развилки у перевала могут вернуть к другим долинам, если идти за потоком.'},
      {ratio:1,kicker:'06 / FINISH',name:'Kuźnicka Polana',tag:'ФИНИШ',meta:'≈ 2.4 км',level:'info',prompt:'ГОРОД',decision:'Строй возвращение от фактического выхода, а не от Kuźnice.',body:'Финиш близко к городской сети, но не совпадает со стартом.'}
    ],
    terrain:[{from:0,to:.10,kind:'approach'},{from:.10,to:.55,kind:'effort'},{from:.55,to:.78,kind:'technical'},{from:.78,to:1,kind:'navigation'}],
    sources:[['Zakopane.pl','https://www.zakopane.pl/strefa-turystyczna/turystyka/wycieczki-gorskie-latem/szlaki-lato']]
  },
  kopieniec:{
    issue:'FIELD MAP 12 / KOPIENIEC',title:'Маленькая петля с большим горизонтом.',
    intro:'Лесная развилка, выбор направления петли на поляне, короткий каменный подъём и другой спуск с вершины.',
    stops:[
      {ratio:0,kicker:'00 / START',name:'Toporowa Cyrhla',tag:'СТАРТ',meta:'0.0 км',level:'info',prompt:'МАРКИРОВКА',decision:'Следуй зелёной маркировке к Polana Kopieniec.',body:'Старт находится вне главного потока Kuźnice; проверь остановку и обратный транспорт.'},
      {ratio:.20,kicker:'01 / FOREST',name:'Лесная развилка',tag:'ДЕРЖИСЬ ЗЕЛЁНОГО',meta:'≈ 0.9 км',level:'nav',prompt:'НАВИГАЦИЯ',decision:'Не уходи на соседние долинные ветки; сверяй направление на Kopieniec.',body:'В лесу вершина не видна, а широкие дорожки могут выглядеть убедительнее маркированной тропы.'},
      {ratio:.35,kicker:'02 / MEADOW',name:'Polana Kopieniec',tag:'ВЫБОР ПЕТЛИ',meta:'≈ 1.6 км',level:'nav',prompt:'КЛЮЧЕВАЯ РАЗВИЛКА',decision:'Выбери вершину по запланированной стороне петли; вернёшься с другой.',body:'Здесь полезно запомнить точку возвращения и направление выхода к Toporowa Cyrhla.',photoIndex:0},
      {ratio:.45,kicker:'03 / CLIMB',name:'Финальный склон',tag:'КАМЕННЫЕ СТУПЕНИ',meta:'≈ 2.1 км',level:'effort',prompt:'СЛОЖНОСТЬ',decision:'Держись зелёных меток и уступай встречным на широких местах.',body:'Подъём короткий, но ощутимо круче всей лесной части.'},
      {ratio:.50,kicker:'04 / SUMMIT',name:'Wielki Kopieniec',tag:'1328 М',meta:'≈ 2.3 км',level:'summit',prompt:'ПАНОРАМА',decision:'Продолжай петлю по зелёному с противоположной стороны вершины.',body:'Небольшая высота даёт неожиданно широкий обзор на высокие Татры.',photoIndex:1},
      {ratio:.65,kicker:'05 / LOOP',name:'Возврат на поляну',tag:'ЗАМКНИ ПЕТЛЮ',meta:'≈ 3.0 км',level:'nav',prompt:'НАПРАВЛЕНИЕ ФИНИША',decision:'На поляне выбери зелёную ветку обратно к Toporowa Cyrhla.',body:'Не продолжай в сторону Jaszczurówka, если транспорт ждёт у старта.'},
      {ratio:1,kicker:'06 / FINISH',name:'Toporowa Cyrhla',tag:'ФИНИШ',meta:'≈ 4.7 км',level:'info',prompt:'ТРАНСПОРТ',decision:'Проверь ближайшую остановку и направление автобуса.',body:'Петля заканчивается у того же trailhead.'}
    ],
    terrain:[{from:0,to:.35,kind:'approach'},{from:.35,to:.50,kind:'effort'},{from:.50,to:.65,kind:'technical'},{from:.65,to:1,kind:'navigation'}],
    sources:[['Zakopane.pl','https://www.zakopane.pl/strefa-turystyczna/turystyka/wycieczki-gorskie-latem/szlaki-lato']]
  },
  wolowiec:{
    issue:'FIELD MAP 13 / WOŁOWIEC',title:'Хребтовый день, который начинается в долине.',
    intro:'Длинный подход к приюту, явный уход на Grześ, открытая граница через Rakoń и разворот с Wołowiec.',
    stops:[
      {ratio:0,kicker:'00 / START',name:'Siwa Polana',tag:'СТАРТ',meta:'0.0 км',level:'info',prompt:'ДЛИННЫЙ ДЕНЬ',decision:'Следуй зелёной маркировке в Dolina Chochołowska.',body:'До настоящего хребтового маршрута ещё несколько километров долины; ранний старт обязателен.'},
      {ratio:.27,kicker:'01 / SHELTER',name:'Schronisko Chochołowskie',tag:'ПОСЛЕДНИЙ ПРИЮТ',meta:'≈ 6.4 км',level:'info',prompt:'ПАУЗА + ПОГОДА',decision:'Сверь время и условия перед уходом на жёлтую тропу к Grześ.',body:'Отсюда начинается более серьёзная часть; возвращение к укрытию займёт время.'},
      {ratio:.35,kicker:'02 / JUNCTION',name:'Подъём на Grześ',tag:'УХОД ИЗ ДОЛИНЫ',meta:'≈ 8.3 км',level:'nav',prompt:'КЛЮЧЕВАЯ РАЗВИЛКА',decision:'Выбирай жёлтую маркировку на Grześ.',body:'Если остаться на долинной линии, день закончится у приюта, а не на хребте.'},
      {ratio:.43,kicker:'03 / RIDGE',name:'Grześ',tag:'ОТКРЫТЫЙ ХРЕБЕТ',meta:'≈ 10.1 км',level:'effort',prompt:'ПОГОДА',decision:'Продолжай по синей маркировке к Rakoń.',body:'Деревья остаются внизу; ветер и гроза теперь определяют возможность продолжения.'},
      {ratio:.49,kicker:'04 / RIDGE',name:'Rakoń',tag:'ЕЩЁ НЕ ЦЕЛЬ',meta:'≈ 11.6 км',level:'nav',prompt:'КОНТРОЛЬ ВРЕМЕНИ',decision:'Оцени запас до Wołowiec и обратного спуска; держись польской маркировки.',body:'Широкий гребень обманчиво простой, но маршрут уже длинный.',photoIndex:1},
      {ratio:.527,kicker:'05 / SUMMIT',name:'Wołowiec',tag:'2064 М',meta:'≈ 12.4 км',level:'summit',prompt:'РАЗВОРОТ',decision:'Не продолжай по словацким направлениям без отдельного плана; начинай возврат по заданной петле.',body:'Открытая вершина быстро становится некомфортной при ветре и облаке.',photoIndex:0},
      {ratio:.60,kicker:'06 / DESCENT',name:'Развилка спуска',tag:'НЕ НА СЛОВАЦКУЮ СТОРОНУ',meta:'≈ 14.1 км',level:'danger',prompt:'НАВИГАЦИЯ',decision:'Сверь маркировку на возвращение в Dolina Chochołowska.',body:'На международном хребте неверный поворот меняет не только долину, но и страну финиша.'},
      {ratio:1,kicker:'07 / FINISH',name:'Siwa Polana',tag:'ФИНИШ',meta:'≈ 23.6 км',level:'info',prompt:'ТРАНСПОРТ',decision:'Проверь, что успеваешь на обратный транспорт после длинного долинного выхода.',body:'Последние километры технически простые, но проходят на уставших ногах.'}
    ],
    terrain:[{from:0,to:.27,kind:'approach'},{from:.27,to:.43,kind:'effort'},{from:.43,to:.60,kind:'navigation'},{from:.60,to:1,kind:'approach'}],
    sources:[['TPN: условия','https://tpn.gov.pl/komunikat-turystyczny']]
  },
  koscielec:{
    issue:'FIELD MAP 14 / KOŚCIELEC',title:'Гранитная вершина без цепей.',
    intro:'Длинный подход через Hala Gąsienicowa, решение у Czarny Staw и Karb, затем скальная работа руками без искусственных опор.',
    stops:[
      {ratio:0,kicker:'00 / START',name:'Kuźnice',tag:'СТАРТ',meta:'0.0 км',level:'info',prompt:'ПЛАН',decision:'Следуй маршруту к Hala Gąsienicowa и Murowaniec.',body:'Первые километры совпадают с популярным маршрутом к Czarny Staw; техническая цель ещё далеко.'},
      {ratio:.20,kicker:'01 / PASS',name:'Przełęcz między Kopami',tag:'ОТКРЫТЫЙ ПОДХОД',meta:'≈ 3.4 км',level:'effort',prompt:'ПОГОДА',decision:'Продолжай к Hala Gąsienicowa, наблюдая за облачностью над Kościelec.',body:'Если вершина уже закрыта облаком, выше ориентирование и оценка скалы станут сложнее.'},
      {ratio:.266,kicker:'02 / SHELTER',name:'Murowaniec',tag:'ПОСЛЕДНИЙ ПРИЮТ',meta:'≈ 4.5 км',level:'info',prompt:'ПАУЗА + РЕШЕНИЕ',decision:'Продолжай по синей маркировке к Czarny Staw только при достаточном времени и устойчивой погоде.',body:'После приюта укрытий на финальной части нет.'},
      {ratio:.34,kicker:'03 / LAKE',name:'Czarny Staw Gąsienicowy',tag:'ВЕРШИНА ВИДНА',meta:'≈ 5.8 км',level:'nav',prompt:'ВЫБОР МАРШРУТА',decision:'Сверь ветку к Karb и Kościelec; не продолжай автоматически к Zawrat.',body:'От озера уже видно масштаб пирамиды и можно трезво оценить условия.',photoIndex:1},
      {ratio:.38,kicker:'04 / PASS',name:'Karb',tag:'ПОСЛЕДНИЙ РАЗВОРОТ',meta:'≈ 6.4 км',level:'nav',prompt:'КРИТЕРИЙ РЕШЕНИЯ',decision:'Если скала мокрая, видимость плохая или нет уверенности в спуске, разворачивайся здесь.',body:'Дальше маршрут становится техническим и не предлагает простой запасной линии.'},
      {ratio:.40,kicker:'05 / SCRAMBLE',name:'Скальная тропа',tag:'БЕЗ ЦЕПЕЙ',meta:'≈ 6.8 км',level:'danger',prompt:'ТЕХНИЧЕСКИЙ УЧАСТОК',decision:'Следуй меткам по сухой скале, используй руки и не рассчитывай на цепи или скобы.',body:'Главная сложность — экспозиция, поиск линии и обязательный спуск тем же способом.',photoIndex:0},
      {ratio:.416,kicker:'06 / SUMMIT',name:'Kościelec',tag:'2155 М',meta:'≈ 7.0 км',level:'summit',prompt:'СПУСК',decision:'Возвращайся тем же маршрутом через Karb; не ищи прямой спуск с вершины.',body:'Успех маршрута определяется не подъёмом, а безопасным спуском по тем же плитам.'}
    ],
    terrain:[{from:0,to:.266,kind:'approach'},{from:.266,to:.38,kind:'effort'},{from:.38,to:.416,kind:'technical'}],
    sources:[['TPN: условия','https://tpn.gov.pl/komunikat-turystyczny'],['Zakopane.pl','https://www.zakopane.pl/strefa-turystyczna/turystyka/wycieczki-gorskie-latem/szlaki-lato']]
  },
  rysy:{
    issue:'FIELD MAP 15 / RYSY',title:'25 километров до технического финала.',
    intro:'Дорожный подход, два озера, развилка к другой перевальной цели, снежник у Bula и длинная цепная линия под вершиной.',
    stops:[
      {ratio:0,kicker:'00 / START',name:'Palenica Białczańska',tag:'СТАРТ ЗАТЕМНО',meta:'0.0 км',level:'info',prompt:'ДЛИННЫЙ ДЕНЬ',decision:'Начинай по красной дороге на Morskie Oko и держи жёсткий контроль времени.',body:'Техническая часть далеко, но именно поздний старт чаще всего отнимает запас на безопасный спуск.'},
      {ratio:.113,kicker:'01 / JUNCTION',name:'Wodogrzmoty Mickiewicza',tag:'ОСТАВАЙСЯ НА КРАСНОМ',meta:'≈ 2.8 км',level:'nav',prompt:'РАННЯЯ РАЗВИЛКА',decision:'Продолжай по красной дороге к Morskie Oko; зелёный ведёт в Dolina Roztoki.',body:'Поворот к Пяти Ставам выглядит заманчиво, но это уже другой маршрут.'},
      {ratio:.313,kicker:'02 / LAKE',name:'Morskie Oko',tag:'КОНТРОЛЬ ВРЕМЕНИ',meta:'≈ 7.7 км',level:'info',prompt:'ПОСЛЕДНЯЯ ИНФРАСТРУКТУРА',decision:'Продолжай по красной маркировке вдоль озера к Czarny Staw pod Rysami.',body:'Если здесь уже поздно или погода ухудшается, до цепей ещё далеко, а возвращение остаётся полным.',photoIndex:0},
      {ratio:.402,kicker:'03 / LAKE',name:'Czarny Staw pod Rysami',tag:'НЕ НА MIĘGUSZOWIECKĄ',meta:'≈ 9.9 км',level:'nav',prompt:'КЛЮЧЕВАЯ РАЗВИЛКА',decision:'Для Rysy оставайся на красной маркировке; зелёный ведёт к Przełęcz pod Chłopkiem.',body:'В облаке направление двух высокогорных маршрутов легко перепутать.'},
      {ratio:.44,kicker:'04 / SNOW',name:'Bula pod Rysami',tag:'СНЕГ МОЖЕТ ОСТАТЬСЯ',meta:'≈ 10.8 км',level:'danger',prompt:'УСЛОВИЯ',decision:'Оцени фактический снег, лёд и возможность безопасного спуска до входа в цепную линию.',body:'Сезон внизу не гарантирует летнего покрытия здесь; решение зависит от текущих условий и навыков.'},
      {ratio:.47,kicker:'05 / CHAINS',name:'Rysa + цепи',tag:'КАМНЕПАД + ЭКСПОЗИЦИЯ',meta:'≈ 11.6 км',level:'danger',prompt:'ТЕХНИЧЕСКИЙ ФИНАЛ',decision:'Держи дистанцию, не стой под людьми и следуй красным меткам по цепям.',body:'Длинный крутой участок совмещает встречный поток, подвижные камни и экспозицию; спуск идёт здесь же.'},
      {ratio:.498,kicker:'06 / SUMMIT',name:'Rysy',tag:'2499 М',meta:'≈ 12.3 км',level:'summit',prompt:'ТОЛЬКО ПОЛОВИНА',decision:'Возвращайся тем же польским маршрутом; не спускайся в Словакию без отдельной логистики.',body:'Вершина — географическая середина полного дня. Самая требовательная часть ещё повторится на спуске.',photoIndex:1}
    ],
    terrain:[{from:0,to:.313,kind:'approach'},{from:.313,to:.44,kind:'effort'},{from:.44,to:.498,kind:'technical'}],
    sources:[['Zakopane.pl','https://www.zakopane.pl/strefa-turystyczna/turystyka/wycieczki-gorskie-latem/szlaki-lato/rysy'],['TPN: условия','https://tpn.gov.pl/komunikat-turystyczny']]
  },
  szpiglasowy:{
    issue:'FIELD MAP 16 / SZPIGLASOWY',title:'Две долины и один цепной порог.',
    intro:'Где уйти с дороги к Morskie Oko, почему цепи лучше проходить вверх и как после вершины попасть на более плавный спуск.',
    stops:[
      {ratio:0,kicker:'00 / START',name:'Palenica Białczańska',tag:'СТАРТ',meta:'0.0 км',level:'info',prompt:'ПЛАН ПЕТЛИ',decision:'Иди по красной дороге до Wodogrzmoty, но готовься первым делом уйти в Dolina Roztoki.',body:'Направление петли выбрано так, чтобы цепной участок проходить на подъём, а не спускаться по нему.'},
      {ratio:.12,kicker:'01 / JUNCTION',name:'Wodogrzmoty Mickiewicza',tag:'ПОВОРОТ НА ЗЕЛЁНЫЙ',meta:'≈ 2.8 км',level:'nav',prompt:'КЛЮЧЕВАЯ РАЗВИЛКА',decision:'Сверни на зелёную маркировку в Dolina Roztoki; не продолжай пока к Morskie Oko.',body:'Если пропустить поворот, петля пойдёт в обратную сторону и цепи придётся проходить вниз.'},
      {ratio:.31,kicker:'02 / LAKES',name:'Dolina Pięciu Stawów',tag:'ПОСЛЕДНЕЕ УКРЫТИЕ',meta:'≈ 7.4 км',level:'info',prompt:'ПОГОДА + ВРЕМЯ',decision:'У приюта оцени прогноз и запас дня перед уходом на жёлтую тропу к Szpiglasowa Przełęcz.',body:'Дальше нет быстрого укрытия, а возвращение в любую сторону остаётся длинным.',photoIndex:0},
      {ratio:.405,kicker:'03 / JUNCTION',name:'Niżnie Solnisko',tag:'ЖЁЛТЫЙ НА ПЕРЕВАЛ',meta:'≈ 9.6 км',level:'nav',prompt:'НЕ НА ZAWРАТ',decision:'Выбирай жёлтую маркировку на Szpiglasowa Przełęcz; синяя идёт вдоль Five Lakes.',body:'В тумане широкая долина маскирует направление нужного ответвления.'},
      {ratio:.465,kicker:'04 / CHAINS',name:'Под Szpiglasowa Przełęcz',tag:'ЦЕПИ + ЭКСПОЗИЦИЯ',meta:'≈ 11.0 км',level:'danger',prompt:'ТЕХНИЧЕСКИЙ ПОРОГ',decision:'Следуй жёлтым меткам и цепям; при мокрой скале, льду или встречной пробке не протискивайся.',body:'Короткий, но настоящий технический участок расположен уже после большого набора высоты.'},
      {ratio:.497,kicker:'05 / SUMMIT',name:'Szpiglasowy Wierch',tag:'2172 М',meta:'≈ 11.8 км',level:'summit',prompt:'ВОЗВРАТ НА ПЕРЕВАЛ',decision:'Вернись к Szpiglasowa Przełęcz и спускайся по жёлтому к Dolina za Mnichem.',body:'Не ищи прямой спуск с вершины; вся логика продолжения снова проходит через перевал.',photoIndex:1},
      {ratio:.68,kicker:'06 / LAKE',name:'Morskie Oko',tag:'ТЕХНИКА ПОЗАДИ',meta:'≈ 16.1 км',level:'nav',prompt:'ДЛИННЫЙ ФИНИШ',decision:'Выйди на красную дорогу и возвращайся по ней к Palenica.',body:'До транспорта ещё около восьми километров: простая дорога не означает короткий остаток.'},
      {ratio:1,kicker:'07 / FINISH',name:'Palenica Białczańska',tag:'ФИНИШ',meta:'≈ 23.7 км',level:'info',prompt:'ТРАНСПОРТ',decision:'Проверь очередь и фактический последний рейс до Zakopane.',body:'Петля заканчивается у исходного trailhead.'}
    ],
    terrain:[{from:0,to:.31,kind:'approach'},{from:.31,to:.405,kind:'effort'},{from:.405,to:.465,kind:'navigation'},{from:.465,to:.51,kind:'technical'},{from:.51,to:.68,kind:'effort'},{from:.68,to:1,kind:'approach'}],
    sources:[['Маршрут','https://mapa-turystyczna.pl/route/ex3'],['TPN: условия','https://tpn.gov.pl/komunikat-turystyczny']]
  },
  swinica:{
    issue:'FIELD MAP 17 / ŚWINICA',title:'Перевал — только начало финала.',
    intro:'Длинный подход через Murowaniec, каменная котловина, критерий разворота на Świnicka Przełęcz и цепи перед 2301 м.',
    stops:[
      {ratio:0,kicker:'00 / START',name:'Kuźnice',tag:'СТАРТ',meta:'0.0 км',level:'info',prompt:'ПОЛНЫЙ ДЕНЬ',decision:'Следуй к Hala Gąsienicowa и не считай знакомый подход разминкой без затрат.',body:'До технической части далеко; запас на обратный путь нужно сохранить уже сейчас.'},
      {ratio:.20,kicker:'01 / PASS',name:'Przełęcz między Kopami',tag:'ПРОВЕРЬ НЕБО',meta:'≈ 3.5 км',level:'effort',prompt:'ПОГОДА',decision:'Продолжай к Murowaniec только если вершина не собирает грозовое облако.',body:'Выше маршрут будет открытым, а быстрых укрытий после перевала не останется.'},
      {ratio:.265,kicker:'02 / SHELTER',name:'Murowaniec',tag:'ПОСЛЕДНИЙ ПРИЮТ',meta:'≈ 4.6 км',level:'info',prompt:'ВРЕМЯ + ВОДА',decision:'Сверь темп, воду и прогноз до выхода к Zielony Staw.',body:'Это последняя полноценная инфраструктура перед скальной частью.',photoIndex:0},
      {ratio:.375,kicker:'03 / BASIN',name:'Zielony Staw Gąsienicowy',tag:'КАМЕННЫЙ ЭТАЖ',meta:'≈ 6.5 км',level:'nav',prompt:'МАРКИРОВКА',decision:'Держись чёрной маркировки к Świnicka Przełęcz, не уходи по соседним озёрным веткам.',body:'Тропа становится грубее, склон круче, а линия в облаке читается хуже.'},
      {ratio:.47,kicker:'04 / PASS',name:'Świnicka Przełęcz',tag:'ПОСЛЕДНИЙ РАЗВОРОТ',meta:'≈ 8.2 км',level:'danger',prompt:'УСЛОВИЯ НА СКАЛЕ',decision:'Не начинай красный финал при мокрой скале, льду, сильном ветре или плохой видимости.',body:'До вершины меньше километра, но по времени и сложности это отдельная часть маршрута.'},
      {ratio:.485,kicker:'05 / CHAINS',name:'Żleb Blatona',tag:'ЦЕПИ + ОТКРЫТЫЙ СКЛОН',meta:'≈ 8.5 км',level:'danger',prompt:'ТЕХНИЧЕСКИЙ ФИНАЛ',decision:'Следуй красным меткам и не обходи цепи по случайным следам.',body:'Полированные ступени и экспозиция требуют свободных рук; этим же коридором предстоит спуск.'},
      {ratio:.50,kicker:'06 / SUMMIT',name:'Świnica',tag:'2301 М',meta:'≈ 8.7 км',level:'summit',prompt:'ТОЛЬКО ПОЛОВИНА',decision:'Возвращайся через Świnicka Przełęcz по тому же польскому варианту.',body:'Не продолжай за вершину без отдельного плана: текущий маршрут — чистый out-and-back.',photoIndex:1}
    ],
    terrain:[{from:0,to:.265,kind:'approach'},{from:.265,to:.47,kind:'effort'},{from:.47,to:.50,kind:'technical'}],
    sources:[['Маршрут','https://mapa-turystyczna.pl/route/dq5q'],['TPN: условия','https://tpn.gov.pl/komunikat-turystyczny']]
  },
  'kozi-wierch':{
    issue:'FIELD MAP 18 / KOZI WIERCH',title:'Не Orla Perć, но уже серьёзные горы.',
    intro:'Прямая польская линия из Five Lakes: где покинуть синюю тропу, когда начинается Szeroki Żleb и почему вершина не отменяет сложный спуск.',
    stops:[
      {ratio:0,kicker:'00 / START',name:'Palenica Białczańska',tag:'СТАРТ',meta:'0.0 км',level:'info',prompt:'ДЛИННЫЙ ПОДХОД',decision:'Иди до Wodogrzmoty и сворачивай в Dolina Roztoki.',body:'Основная сложность спрятана далеко за долиной; ранний старт обязателен.'},
      {ratio:.14,kicker:'01 / JUNCTION',name:'Wodogrzmoty Mickiewicza',tag:'ЗЕЛЁНЫЙ В ROZTOKI',meta:'≈ 2.8 км',level:'nav',prompt:'РАЗВИЛКА',decision:'Покинь красную дорогу и следуй зелёной маркировке к Five Lakes.',body:'Morskie Oko — другое направление и не ведёт к выбранной чёрной тропе.'},
      {ratio:.36,kicker:'02 / SHELTER',name:'Schronisko Five Lakes',tag:'ПОСЛЕДНЕЕ УКРЫТИЕ',meta:'≈ 7.2 км',level:'info',prompt:'КОНТРОЛЬ УСЛОВИЙ',decision:'Перед продолжением оцени снег на склоне и облачность над Kozi Wierch.',body:'После приюта быстрых укрытий нет.',photoIndex:0},
      {ratio:.425,kicker:'03 / JUNCTION',name:'Под Kozim Wierchem',tag:'ЧЁРНЫЙ В ЖЁЛОБ',meta:'≈ 8.5 км',level:'nav',prompt:'КЛЮЧЕВОЙ ПОВОРОТ',decision:'Сверни с синей тропы на чёрную маркировку к Kozi Wierch.',body:'Синяя продолжает вдоль долины; нужная ветка резко уходит вверх.'},
      {ratio:.455,kicker:'04 / GULLY',name:'Szeroki Żleb',tag:'ЗДЕСЬ НАЧИНАЕТСЯ СЛОЖНОСТЬ',meta:'≈ 9.1 км',level:'danger',prompt:'КРУТО + СЫПУЧЕ',decision:'Держись размеченной линии на ребре, не срезай по дну жёлоба и сохраняй дистанцию.',body:'Уклон и подвижные камни опасны для людей ниже; снег превращает участок в зимнюю задачу.'},
      {ratio:.50,kicker:'05 / SUMMIT',name:'Kozi Wierch',tag:'2291 М',meta:'≈ 10.0 км',level:'summit',prompt:'НЕ НА ORLA PERĆ',decision:'Разворачивайся по чёрной тропе; не продолжай по красной линии Orla Perć.',body:'На вершине пересекается маршрут другого класса. Текущий план заканчивается здесь.',photoIndex:1}
    ],
    terrain:[{from:0,to:.36,kind:'approach'},{from:.36,to:.425,kind:'navigation'},{from:.425,to:.455,kind:'effort'},{from:.455,to:.50,kind:'technical'}],
    sources:[['Маршрут','https://mapa-turystyczna.pl/route/pgty'],['TPN: условия','https://tpn.gov.pl/komunikat-turystyczny']]
  },
  'skrajny-granat':{
    issue:'FIELD MAP 19 / SKRAJNY GRANAT',title:'Подняться к Orla Perć — и не пойти по ней.',
    intro:'Знакомый Czarny Staw, неприметный уход на жёлтый, крутой подъём и ясная граница между нашей вершиной и полным траверсом.',
    stops:[
      {ratio:0,kicker:'00 / START',name:'Kuźnice',tag:'СТАРТ',meta:'0.0 км',level:'info',prompt:'ПЛАН OUT & BACK',decision:'Следуй к Hala Gąsienicowa и Czarny Staw.',body:'Сегодня красная Orla Perć не является маршрутом — только точкой встречи на вершине.'},
      {ratio:.265,kicker:'01 / SHELTER',name:'Murowaniec',tag:'ПОСЛЕДНИЙ ПРИЮТ',meta:'≈ 4.3 км',level:'info',prompt:'ПОГОДА',decision:'Продолжай к Czarny Staw только при сухом бесснежном верхе.',body:'На крутом финале мокрые камни и снег меняют класс задачи.'},
      {ratio:.35,kicker:'02 / LAKE',name:'Czarny Staw Gąsienicowy',tag:'ГРАНАТЫ НАД ОЗЕРОМ',meta:'≈ 5.7 км',level:'info',prompt:'ВИЗУАЛЬНАЯ ПРОВЕРКА',decision:'Осмотри верхний склон и продолжай по синему вдоль восточного берега.',body:'Отсюда хорошо видно масштаб набора, которого не чувствуется у Murowaniec.',photoIndex:0},
      {ratio:.405,kicker:'03 / JUNCTION',name:'Под Granatami',tag:'ЖЁЛТЫЙ ВВЕРХ',meta:'≈ 6.6 км',level:'nav',prompt:'НЕ ПРОПУСТИ ПОВОРОТ',decision:'Сверни на жёлтую маркировку к Skrajny Granat.',body:'Синяя тропа ведёт дальше к Zawrat; это не наш маршрут.'},
      {ratio:.445,kicker:'04 / CLIMB',name:'Скальный порог',tag:'КОРОТКАЯ ЦЕПЬ + КЛАМРА',meta:'≈ 7.3 км',level:'danger',prompt:'КАМНИ + ЭКСПОЗИЦИЯ',decision:'Держись жёлтых меток, используй цепь и скобу на самом неудобном месте и сохраняй дистанцию.',body:'Большая часть подъёма идёт по крутым камням; короткая искусственная страховка появляется на скальном пороге.'},
      {ratio:.50,kicker:'05 / SUMMIT',name:'Skrajny Granat',tag:'2225 М / СТОП',meta:'≈ 8.2 км',level:'summit',prompt:'ГРАНИЦА МАРШРУТА',decision:'Вернись по жёлтой тропе. Не продолжай по красной Orla Perć.',body:'Красная маркировка с вершины — уже технический траверс другого уровня, не «ещё один километр».',photoIndex:1}
    ],
    terrain:[{from:0,to:.35,kind:'approach'},{from:.35,to:.405,kind:'navigation'},{from:.405,to:.445,kind:'effort'},{from:.445,to:.50,kind:'technical'}],
    sources:[['Маршрут','https://mapa-turystyczna.pl/route/spgo'],['TPN: условия','https://tpn.gov.pl/komunikat-turystyczny']]
  },
  starorobocianski:{
    issue:'FIELD MAP 20 / STAROROBOCIAŃSKI',title:'Длинный гребень без цепей и без скидок.',
    intro:'Где выйти из Chochołowska, как читать широкий хребет в тумане и когда разворачиваться до самого высокого польского Западного Татра.',
    stops:[
      {ratio:0,kicker:'00 / START',name:'Siwa Polana',tag:'СТАРТ',meta:'0.0 км',level:'info',prompt:'10-ЧАСОВОЙ ДЕНЬ',decision:'Иди по зелёной оси Dolina Chochołowska и контролируй темп с первого километра.',body:'Технических цепей нет, но длина и набор делают маршрут серьёзным.'},
      {ratio:.18,kicker:'01 / JUNCTION',name:'Polana Trzydniówka',tag:'КРАСНЫЙ ИЗ ДОЛИНЫ',meta:'≈ 4.2 км',level:'nav',prompt:'КЛЮЧЕВОЙ ПОВОРОТ',decision:'Сверни на красную маркировку к Trzydniowiański Wierch.',body:'Если продолжить по главной долине, попадёшь к Chochołowska shelter и потеряешь петлю.'},
      {ratio:.31,kicker:'02 / RIDGE',name:'Trzydniowiański Wierch',tag:'ОТКРЫВАЕТСЯ ВЕСЬ ПЛАН',meta:'≈ 7.3 км',level:'effort',prompt:'ВРЕМЯ + ПОГОДА',decision:'Оцени видимость и запас до Kończysty; дальше укрытия нет.',body:'Отсюда Starorobociański уже виден, но между вами остаётся длинный открытый гребень.',photoIndex:0},
      {ratio:.385,kicker:'03 / RIDGE',name:'Kończysty Wierch',tag:'ПОСЛЕДНЕЕ ПРОСТОЕ РЕШЕНИЕ',meta:'≈ 8.9 км',level:'nav',prompt:'КРИТЕРИЙ РАЗВОРОТА',decision:'Не продолжай при нарастающем ветре, грозе или плохой видимости.',body:'Следующий набор выше и круче; быстрых путей вниз с середины участка нет.',photoIndex:1},
      {ratio:.435,kicker:'04 / CLIMB',name:'Starorobociańska Przełęcz',tag:'ФИНАЛЬНЫЙ НАБОР',meta:'≈ 10.0 км',level:'effort',prompt:'КРУТОЙ ТРАВЕРС',decision:'Следуй маркированной гребневой линии и не уходи на словацкую сторону по боковым следам.',body:'Широкий склон в облаке выглядит безобидно, но легко теряет визуальную линию маршрута.'},
      {ratio:.49,kicker:'05 / SUMMIT',name:'Starorobociański Wierch',tag:'2176 М',meta:'≈ 11.3 км',level:'summit',prompt:'ПОЛОВИНА ДНЯ',decision:'Продолжай только по запланированной польской петле к Dolina Starorobociańska.',body:'Финиш всё ещё далеко; контролируй маркировку на открытом пограничном рельефе.'},
      {ratio:.67,kicker:'06 / DESCENT',name:'Dolina Starorobociańska',tag:'ТУМАН ОСТАЁТСЯ СВЕРХУ',meta:'≈ 15.5 км',level:'nav',prompt:'СПУСК В ДОЛИНУ',decision:'Держись польской маркированной ветки до соединения с Dolina Chochołowska.',body:'После гребня ориентирование упрощается, но длинный каменистый спуск нагружает колени.'},
      {ratio:1,kicker:'07 / FINISH',name:'Siwa Polana',tag:'ФИНИШ',meta:'≈ 23.1 км',level:'info',prompt:'ПОСЛЕДНИЙ РЕЙС',decision:'Сверь обратный транспорт; усталость не сокращает долинный выход.',body:'Петля заканчивается там же, где начиналась.'}
    ],
    terrain:[{from:0,to:.18,kind:'approach'},{from:.18,to:.31,kind:'effort'},{from:.31,to:.49,kind:'navigation'},{from:.49,to:.67,kind:'effort'},{from:.67,to:1,kind:'approach'}],
    sources:[['Маршрут','https://mapa-turystyczna.pl/route/a1dw'],['TPN: условия','https://tpn.gov.pl/komunikat-turystyczny']]
  },
  'pajakowka-gubalowka-loop':{
    issue:'FIELD MAP 21 / GUBAŁÓWKA FROM HOME',title:'Панорама Татр прямо от нашей двери.',
    intro:'Короткая петля без транспорта: где дорога становится грунтовой, где открывается главный вид и почему развитая Gubałówka — не высокогорье.',
    stops:[
      {ratio:0,kicker:'00 / HOME',name:'Apartamenty Polana Pająkówka',tag:'СТАРТ У ДОМА',meta:'0.0 км',level:'info',prompt:'WALK-OUT',decision:'Выходи пешком и сразу сохрани офлайн-карту локальных дорог.',body:'Транспорт и парковка не нужны; задача дня начинается прямо у нашего домика.'},
      {ratio:.16,kicker:'01 / JUNCTION',name:'Верхняя Pająkówka',tag:'НЕ УЙТИ К ДОМАМ',meta:'≈ 0.6 км',level:'nav',prompt:'ЛОКАЛЬНАЯ РАЗВИЛКА',decision:'На боковых дорогах сверяй линию трека, а не просто направление «вверх».',body:'Много частных подъездов выглядят одинаково; это главный навигационный нюанс короткой петли.'},
      {ratio:.34,kicker:'02 / VIEW',name:'Окно на Татры',tag:'ПЕРВАЯ ПАНОРАМА',meta:'≈ 1.3 км',level:'summit',prompt:'ФОТОТОЧКА',decision:'Остановись только вне проезда и не выходи на край частного участка.',body:'Здесь хребет впервые открывает Zakopane и всю стену Татр напротив.',photoIndex:0},
      {ratio:.50,kicker:'03 / RIDGE',name:'Gubałówka — верхняя станция',tag:'РАЗВИТЫЙ ХРЕБЕТ',meta:'≈ 1.9 км',level:'info',prompt:'НЕ HIGH ALPINE',decision:'Используй инфраструктуру как паузу, но не путай доступность с гарантией хорошей погоды.',body:'Кафе, аттракционы и толпа делают точку простой, но ветер и облачность всё равно меняются.',photoIndex:1},
      {ratio:.68,kicker:'04 / TURN',name:'Поворот к Pająkówka',tag:'СХОД С ПРОМЕНАДА',meta:'≈ 2.6 км',level:'nav',prompt:'НУЖНАЯ ВЕТКА',decision:'Покинь развитую гребневую дорогу по линии трека к дому.',body:'Если продолжить по хребту, уйдёшь в сторону Butorowy и превратишь короткую петлю в другой маршрут.'},
      {ratio:.84,kicker:'05 / DESCENT',name:'Грунтовый спуск',tag:'СКОЛЬЗКО ПОСЛЕ ДОЖДЯ',meta:'≈ 3.2 км',level:'effort',prompt:'ТЕМП НА СПУСКЕ',decision:'На мокрой траве и колее сократи шаг; не срезай через участки.',body:'Технически просто, но именно здесь грязь чаще всего меняет заявленное время.'},
      {ratio:1,kicker:'06 / FINISH',name:'Наш дом',tag:'ФИНИШ',meta:'≈ 3.8 км',level:'info',prompt:'RECOVERY DAY',decision:'Маршрут закончен; дополнительная логистика не нужна.',body:'Хороший короткий выход на день приезда или между большими горами.'}
    ],
    terrain:[{from:0,to:.16,kind:'approach'},{from:.16,to:.34,kind:'navigation'},{from:.34,to:.68,kind:'approach'},{from:.68,to:.84,kind:'navigation'},{from:.84,to:1,kind:'effort'}],
    sources:[['Zakopane: Gubałówka','https://www.zakopane.pl/en/tourist-area/tourism/a-walk-around-zakopane/gubalowka'],['OSM foot routing','https://routing.openstreetmap.de/about.html']]
  },
  'pajakowka-gubalowka-butorowy-loop':{
    issue:'FIELD MAP 22 / BUTOROWY LOOP',title:'Тихий лес, затем весь панорамный фасад.',
    intro:'Домашняя петля подлиннее: как выйти к Butorowy, где начинается официальный ridge walk и где не пропустить спуск обратно к Pająkówka.',
    stops:[
      {ratio:0,kicker:'00 / HOME',name:'Apartamenty Polana Pająkówka',tag:'СТАРТ У ДОМА',meta:'0.0 км',level:'info',prompt:'ПОЛНЫЙ КРУГ',decision:'Иди западнее к Butorowy; Gubałówka оставляем на вторую половину.',body:'Так маршрут постепенно переходит от тихой части к главной панораме.'},
      {ratio:.12,kicker:'01 / JUNCTION',name:'Западная связка',tag:'ПРОВЕРЬ ТРЕК',meta:'≈ 0.7 км',level:'nav',prompt:'ЧАСТНЫЕ ДОРОГИ',decision:'Держись публичной пешеходной линии и не срезай через дворы.',body:'На карте связка понятнее, чем на местности: подъездные дороги здесь очень похожи.'},
      {ratio:.27,kicker:'02 / PEAK',name:'Butorowy Wierch',tag:'1160 М',meta:'≈ 1.5 км',level:'summit',prompt:'ЗАПАДНАЯ ТОЧКА',decision:'От верхней станции продолжай на восток по хребту в сторону Gubałówka.',body:'Лесная точка и кресельная дорога отмечают начало самой панорамной части.',photoIndex:0},
      {ratio:.43,kicker:'03 / RIDGE',name:'Окна над Kościelisko',tag:'ТАТРЫ НАПРОТИВ',meta:'≈ 2.4 км',level:'info',prompt:'ФОТО БЕЗ РИСКА',decision:'Для остановки выбери широкую обочину, не стой на проезжей части.',body:'На открытых промежутках видно, как Butorowy и Gubałówka складываются в один хребет.',photoIndex:1},
      {ratio:.66,kicker:'04 / BUSY',name:'Gubałówka',tag:'КАФЕ + ТОЛПА',meta:'≈ 3.7 км',level:'info',prompt:'КОНТРОЛЬ ВРЕМЕНИ',decision:'Отдохни, но оставь запас на локальный спуск к дому.',body:'Официальная прогулка по гребню здесь заканчивается; наша петля продолжаетcя к Pająkówka.'},
      {ratio:.78,kicker:'05 / TURN',name:'Сход с хребта',tag:'НЕ ПРОПУСТИ',meta:'≈ 4.4 км',level:'nav',prompt:'КЛЮЧЕВОЙ ПОВОРОТ',decision:'Сверни с основной гребневой дороги по треку к жилью.',body:'Продолжение прямо уводит к верхней станции и центру Gubałówka, а не домой.'},
      {ratio:1,kicker:'06 / FINISH',name:'Наш дом',tag:'ФИНИШ',meta:'≈ 5.6 км',level:'info',prompt:'БЕЗ ТРАНСПОРТА',decision:'Круг замкнут у Pająkówka.',body:'Самая содержательная лёгкая петля, которую можно начать буквально от двери.'}
    ],
    terrain:[{from:0,to:.12,kind:'approach'},{from:.12,to:.27,kind:'navigation'},{from:.27,to:.66,kind:'approach'},{from:.66,to:.78,kind:'navigation'},{from:.78,to:1,kind:'effort'}],
    sources:[['Zakopane: Gubałówka–Butorowy','https://www.zakopane.pl/en/tourist-area/tourism/a-walk-around-zakopane/gubalowka'],['OSM foot routing','https://routing.openstreetmap.de/about.html']]
  },
  'gubalowka-ridge-dzianisz':{
    issue:'FIELD MAP 23 / RIDGE TO DZIANISZ',title:'Длинный хребет, где карта важнее рук.',
    intro:'Линейный маршрут от дома: туристическая Gubałówka, лесной Butorowy, грязные западные связки и заранее организованный финиш в Dzianisz.',
    stops:[
      {ratio:0,kicker:'00 / HOME',name:'Apartamenty Polana Pająkówka',tag:'СТАРТ У ДОМА',meta:'0.0 км',level:'info',prompt:'ЛИНЕЙНЫЙ ДЕНЬ',decision:'До выхода договорись о pickup или такси из Dzianisz.',body:'Главный риск сегодня логистический: финиш не возвращает к машине и жилью автоматически.'},
      {ratio:.18,kicker:'01 / RIDGE',name:'Gubałówka',tag:'ПОСЛЕДНЯЯ ТОЛПА',meta:'≈ 1.9 км',level:'info',prompt:'ВОДА + СВЯЗЬ',decision:'Пополнить воду и проверить заряд лучше здесь; дальше инфраструктура редеет.',body:'После развитой Gubałówka маршрут постепенно становится сельским и заметно тише.'},
      {ratio:.38,kicker:'02 / PEAK',name:'Butorowy Wierch',tag:'1160 М',meta:'≈ 4.0 км',level:'summit',prompt:'ПРОДОЛЖАТЬ НА ЗАПАД',decision:'От верхней станции держи западное продолжение красного хребта.',body:'До этой точки всё ещё легко развернуться домой; дальше начинается линейная часть.',photoIndex:0},
      {ratio:.585,kicker:'03 / JUNCTION',name:'Palenica Kościeliska',tag:'МНОГО БОКОВЫХ ДОРОГ',meta:'≈ 6.3 км',level:'nav',prompt:'СВЕРКА КАЖДОГО ПОВОРОТА',decision:'Следуй загруженному треку и маркировке; не выбирай дорогу только по ширине.',body:'Полевые и лесовозные колеи часто выглядят логичнее нужной линии — это главный навигационный участок.'},
      {ratio:.74,kicker:'04 / TRACKS',name:'Западные поля',tag:'ГРЯЗЬ + КОЛЕИ',meta:'≈ 7.9 км',level:'effort',prompt:'ПОКРЫТИЕ',decision:'После дождя закладывай больше времени и обходи глубокие колеи по устойчивой кромке.',body:'Технических скал нет, но мокрый грунт может заметно замедлить весь траверс.'},
      {ratio:.916,kicker:'05 / VIEW',name:'Gruszków Wierch',tag:'ТИХАЯ ПАНОРАМА',meta:'≈ 9.8 км',level:'summit',prompt:'ФИНИШ УЖЕ БЛИЗКО',decision:'Продолжай к Dzianisz по выбранной линии, не сворачивая к случайным хуторам.',body:'Вместо коммерческого хребта — сельское Podhale и Татры далеко за спиной.',photoIndex:1},
      {ratio:1,kicker:'06 / FINISH',name:'Dzianisz Rondo',tag:'PICKUP POINT',meta:'≈ 10.7 км',level:'info',prompt:'ОБРАТНАЯ ЛОГИСТИКА',decision:'Используй заранее согласованный транспорт; не рассчитывай на частый случайный рейс.',body:'Линейный маршрут закончен. Координаты финиша сохранены в карточке.'}
    ],
    terrain:[{from:0,to:.18,kind:'approach'},{from:.18,to:.38,kind:'approach'},{from:.38,to:.585,kind:'navigation'},{from:.585,to:.74,kind:'navigation'},{from:.74,to:.916,kind:'effort'},{from:.916,to:1,kind:'navigation'}],
    sources:[['Zakopane: Gubałówka–Butorowy','https://www.zakopane.pl/en/tourist-area/tourism/a-walk-around-zakopane/gubalowka'],['Gubałówka ridge account','https://tinkadventures.com/2021/12/04/gubalowka-ridge-from-zakopane-to-chocholow/'],['OSM foot routing','https://routing.openstreetmap.de/about.html']]
  }
};
