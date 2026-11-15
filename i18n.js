/* Языки интерфейса и документов: ru / kk / en */
(function (root) {
'use strict';
const D = {
ru: {
 'app.title': 'Калькулятор ПА',
 'tab.calc': 'Расчёт', 'tab.hist': 'История', 'tab.set': 'Настройки',
 'f.transfer': 'Переоформление договора из другой КСЖ',
 'f.oldDate': 'Дата действующего договора', 'f.surr': 'Выкупная сумма на дату заключения, ₸',
 'f.transferHint': 'С даты действующего договора должно пройти не менее 2 лет. Выкупная сумма добавляется к накоплениям ЕНПФ. При переоформлении единовременной выплаты нет.',
 'f.name': 'Клиент (для истории и PDF)', 'f.namePh': 'Имя клиента',
 'f.dob': 'Дата рождения', 'f.sign': 'Дата заключения', 'f.gender': 'Пол',
 'f.male': 'мужской', 'f.female': 'женский',
 'f.oppv': 'ОППВ (проф. накопления за 60 мес.)', 'f.yes': 'да', 'f.no': 'нет',
 'f.dis': 'Инвалидность (бессрочная)', 'f.dis1': 'инвалидность 1 группы', 'f.dis2': 'инвалидность 2 группы', 'f.dis3': 'инвалидность 3 группы',
 'f.enpf': 'Накопления в ЕНПФ, ₸', 'f.reserve': 'Остаток в ЕНПФ (резерв на колебания инвестдохода)',
 'f.own': 'Собственные средства, ₸', 'f.lump': 'Единовременная выплата', 'f.lump8': '8% (максимум)', 'f.lump6': '6%',
 'f.mode': 'Что считаем', 'f.modeMin': 'Минимальный договор', 'f.modeMax': 'Договор на все накопления', 'f.modeCustom': 'Своя сумма договора',
 'f.contract': 'Сумма договора, ₸', 'f.gp': 'Гарантированный период, лет', 'f.go': 'Рассчитать', 'gp.none': 'без',
 'r.title': 'Результат', 'r.copy': 'Скопировать текст', 'r.share': 'Отправить текст', 'r.pdf': 'PDF с графиком', 'r.save': 'Сохранить в историю',
 'r.pdfMonthly': 'В PDF полный помесячный график', 'r.yearly': 'Выплаты по годам', 'r.monthly': 'Помесячный график и выкупные суммы', 'r.text': 'Текст расчёта',
 'h.search': 'Поиск по имени', 'h.export': 'Экспорт истории', 'h.import': 'Импорт', 'h.empty': 'Сохранённых расчётов пока нет.', 'h.noname': 'Без имени', 'h.open': 'Открыть',
 'h.confirmDel': 'Удалить расчёт?', 'h.imported': 'Импортировано', 'h.badfile': 'Файл не распознан', 'h.saved': 'Сохранено в историю', 'h.enpf': 'ЕНПФ',
 's.title': 'Настройки', 's.gp': 'Гарантированный период по умолчанию, лет', 's.agent': 'Ваше имя и телефон для PDF', 's.agentPh': 'Аскар, +7 ...',
 's.lm': 'Прожиточный минимум по годам, ₸', 's.lmHint': 'Нужен для минимальной суммы договора (70% от прожиточного минимума). В вашем файле значения заданы до 2026 года. Для 2027+ введите значение, когда оно будет утверждено.',
 's.notset': 'не задан', 's.save': 'Сохранить настройки', 's.saved': 'Настройки сохранены',
 's.ver': 'Движок: порт файла «График выплат» (листы first/calc). Ставки: до 15.02.2026 — 8%/7%, после — 9%/8%.',
 'm.copied': 'Скопировано', 'm.saveFail': 'Не удалось сохранить данные на телефоне', 'm.pdfFail': 'Не удалось создать PDF: ',
 'e.needOld': 'Укажите дату действующего договора с другой КСЖ',
 'e.twoYears': 'Переоформление невозможно: с даты действующего договора не прошло 2 лет. Раньше {0} заключить новый договор нельзя.',
 'e.calc': 'Ошибка расчёта: ',
 'e.lmMissing': 'Для года {0} не задан прожиточный минимум (в файле для 2027+ стоят нули). Минимальная сумма договора считается как 0. Введите значение в «Настройки».',
 'e.need': ' (нужно {0} ₸)', 'e.maxLess': 'Накоплений меньше минимальной суммы договора ({0} ₸).',
 'st.ok': 'ок', 'st.low': 'накоплений не достаточно', 'st.age': 'возраст не соответствует',
 'c.status': 'Статус', 'c.perMonth': ' / мес', 'c.type': 'Вид', 'c.start': 'Начало выплат', 'c.ageSuffix': '{0} лет',
 'c.surrIn': 'Выкупная сумма другой КСЖ в договор', 'c.enpfIn': 'Накопления ЕНПФ в договор', 'c.left': 'Останется в ЕНПФ', 'c.reserve': 'Резерв в ЕНПФ',
 'c.lumpIn': 'Из единовременной в договор', 'c.own': 'Собственные средства', 'c.contract': 'Сумма договора', 'c.gp': 'Гарантированный период', 'c.until': ' (до {0})',
 'c.lumpAll': 'Единовременная всего / на карту', 'c.minSum': 'Минимальная сумма договора',
 'c.calc': 'Расчёт', 'c.v1': 'С минимальной доплатой', 'c.v2': 'С защитой семьи', 'c.var': 'Вариант {0}', 'c.varGp': 'Вариант: гарантированный период {0}',
 't.def': 'отложенный ПА', 't.imm': 'пенсионный аннуитет',
 'tb.period': 'Период', 'tb.month': 'В месяц', 'tb.year': 'За год', 'tb.date': 'Дата', 'tb.pay': 'Выплата', 'tb.death': 'Гарант. при смерти', 'tb.surr': 'Выкупная',
 'p.title': 'Расчёт пенсионного аннуитета', 'p.date': 'Дата расчёта: {0} · дата заключения: {1}', 'p.client': 'Клиент: {0}',
 'p.type': 'Вид', 'p.ageSign': 'Возраст на дату заключения', 'p.startDate': 'Дата начала выплат', 'p.minPay': 'Минимальная периодичная выплата',
 'p.transfer': 'Переоформление из другой КСЖ', 'p.transferVal': 'договор от {0}, выкупная сумма {1}',
 'p.monthlyStart': 'Ежемесячная выплата на старте', 'p.monthlyVal': '{0}, пожизненно, индексация {1}% в год',
 'p.surrIn': 'Выкупная сумма другой КСЖ в договор', 'p.enpfIn': 'Накопления из ЕНПФ в договор', 'p.lumpIn': 'Из единовременной выплаты в договор',
 'p.own': 'Собственные средства', 'p.contract': 'Сумма договора', 'p.left': 'Останется в ЕНПФ после оформления',
 'p.reserve': 'Резерв в ЕНПФ на колебания инвестдохода', 'p.reserveVal': '{0}% от накоплений', 'p.gp': 'Гарантированный период',
 'p.lumpAll': 'Единовременная выплата всего ({0}%)', 'p.toCard': 'Единовременная выплата на карту',
 'p.yearlyTitle': 'График выплат по годам', 'p.thPeriod': 'Период выплат', 'p.thMonth': 'В месяц, ₸', 'p.thYear': 'За год, ₸',
 'p.monthlyTitle': 'Помесячный график и выкупные суммы · {0}', 'p.thDate': 'Дата выплаты', 'p.thPay': 'Выплата, ₸', 'p.thDeath': 'Гарант. выплата при смерти, ₸', 'p.thSurr': 'Выкупная сумма, ₸',
 'p.disc': 'Расчёт предварительный и ориентировочный, не является офертой.', 'p.page': 'стр. {0} / {1}', 'p.file': 'Расчет_ПА',
 'q.title': '*Ваш расчёт*',
 'q.sexM': 'мужчина', 'q.sexF': 'женщина', 'q.oppv': 'с ОППВ', 'q.noOppv': 'без ОППВ', 'q.savings': 'накопления в ЕНПФ {0}',
 'q.transfer': ', переоформление из другой КСЖ (договор от {0}, выкупная сумма {1})',
 'q.deferred': 'Выплаты начинаются не сразу. Договор заключаете сейчас, а выплаты стартуют с {0} лет, то есть через {1} (ориентировочно с {2}).',
 'q.immediate': 'Выплаты начинаются сразу, с {0}.',
 'q.impossible': 'Расчёт невозможен: {0}',
 'q.surrIn': 'Выкупная сумма из другой КСЖ идёт в договор: {0}', 'q.enpfIn': 'Накопления из ЕНПФ идут в договор: {0}',
 'q.lumpIn': 'Из единовременной выплаты засчитывается в договор: {0}', 'q.own': 'Ваши собственные деньги: {0}', 'q.contract': 'Сумма договора: {0}',
 'q.left': 'Останется в ЕНПФ после оформления договора: {0}', 'q.reserve': 'Резерв в ЕНПФ на колебания инвестдохода: {0}% от накоплений',
 'q.monthlyDef': 'Ежемесячная выплата: {0}, пожизненно (на дату начала выплат, с индексацией {1}% в год)', 'q.monthly': 'Ежемесячная выплата: {0}, пожизненно (с индексацией {1}% в год)',
 'q.gp': 'Гарантированный период: {0}', 'q.gpNone': 'без гарантированного периода',
 'q.lumpAll': 'Единовременная выплата всего: {0} ({1}% от суммы договора)', 'q.toCard': 'Единовременная выплата на карту: {0}',
 'q.short': 'Накоплений на договор не хватает: {0} вносятся собственными средствами.',
 'q.gpDiff': 'Гарантированный период {0} стоит около {1} {2}, ежемесячная выплата при этом та же.', 'q.more': 'сверху', 'q.less': 'меньше',
 'q.disc': 'Расчёт предварительный и ориентировочный. Полный график выплат — в приложенном файле PDF.',
 'mon': ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
},
kk: {
 'app.title': 'Аннуитет калькуляторы',
 'tab.calc': 'Есептеу', 'tab.hist': 'Тарих', 'tab.set': 'Баптаулар',
 'f.transfer': 'Басқа ӨСК-дан шартты қайта рәсімдеу',
 'f.oldDate': 'Қолданыстағы шарттың күні', 'f.surr': 'Жасалу күніндегі өтеу сомасы, ₸',
 'f.transferHint': 'Қолданыстағы шарт күнінен бастап кемінде 2 жыл өтуі керек. Өтеу сомасы БЖЗҚ-дағы жинаққа қосылады. Қайта рәсімдеу кезінде біржолғы төлем болмайды.',
 'f.name': 'Клиент (тарих пен PDF үшін)', 'f.namePh': 'Клиенттің аты',
 'f.dob': 'Туған күні', 'f.sign': 'Шарт жасалатын күн', 'f.gender': 'Жынысы',
 'f.male': 'ер', 'f.female': 'әйел',
 'f.oppv': 'МКЗЖ (соңғы 60 айдағы кәсіби жинақ)', 'f.yes': 'иә', 'f.no': 'жоқ',
 'f.dis': 'Мүгедектік (мерзімсіз)', 'f.dis1': '1-топ мүгедектігі', 'f.dis2': '2-топ мүгедектігі', 'f.dis3': '3-топ мүгедектігі',
 'f.enpf': 'БЖЗҚ-дағы жинақ, ₸', 'f.reserve': 'БЖЗҚ-да қалатын қалдық (инвестициялық табыс ауытқуына резерв)',
 'f.own': 'Өз қаражаты, ₸', 'f.lump': 'Біржолғы төлем', 'f.lump8': '8% (максимум)', 'f.lump6': '6%',
 'f.mode': 'Нені есептейміз', 'f.modeMin': 'Ең аз шарт', 'f.modeMax': 'Барлық жинақтан шарт', 'f.modeCustom': 'Шарттың өз сомасы',
 'f.contract': 'Шарт сомасы, ₸', 'f.gp': 'Кепілдік берілген кезең, жыл', 'f.go': 'Есептеу', 'gp.none': 'жоқ',
 'r.title': 'Нәтиже', 'r.copy': 'Мәтінді көшіру', 'r.share': 'Мәтінді жіберу', 'r.pdf': 'Кестесі бар PDF', 'r.save': 'Тарихқа сақтау',
 'r.pdfMonthly': 'PDF-те толық айлық кесте', 'r.yearly': 'Жылдар бойынша төлемдер', 'r.monthly': 'Айлық кесте және өтеу сомалары', 'r.text': 'Есеп мәтіні',
 'h.search': 'Аты бойынша іздеу', 'h.export': 'Тарихты экспорттау', 'h.import': 'Импорт', 'h.empty': 'Сақталған есептер әзірге жоқ.', 'h.noname': 'Атаусыз', 'h.open': 'Ашу',
 'h.confirmDel': 'Есепті жою керек пе?', 'h.imported': 'Импортталды', 'h.badfile': 'Файл танылмады', 'h.saved': 'Тарихқа сақталды', 'h.enpf': 'БЖЗҚ',
 's.title': 'Баптаулар', 's.gp': 'Әдепкі кепілдік берілген кезең, жыл', 's.agent': 'PDF үшін атыңыз бен телефоныңыз', 's.agentPh': 'Асқар, +7 ...',
 's.lm': 'Жылдар бойынша ең төменгі күнкөріс деңгейі, ₸', 's.lmHint': 'Шарттың ең аз сомасын есептеу үшін керек (ең төменгі күнкөріс деңгейінің 70%-ы). Файлда мәндер 2026 жылға дейін берілген. 2027+ үшін бекітілгенде мәнін енгізіңіз.',
 's.notset': 'берілмеген', 's.save': 'Баптауларды сақтау', 's.saved': 'Баптаулар сақталды',
 's.ver': 'Қозғалтқыш: «Төлемдер кестесі» файлының порты (first/calc беттері). Мөлшерлемелер: 15.02.2026 дейін — 8%/7%, кейін — 9%/8%.',
 'm.copied': 'Көшірілді', 'm.saveFail': 'Деректерді телефонға сақтау мүмкін болмады', 'm.pdfFail': 'PDF жасау мүмкін болмады: ',
 'e.needOld': 'Басқа ӨСК-мен қолданыстағы шарттың күнін көрсетіңіз',
 'e.twoYears': 'Қайта рәсімдеу мүмкін емес: қолданыстағы шарт күнінен бастап 2 жыл өтпеген. {0} дейін жаңа шарт жасауға болмайды.',
 'e.calc': 'Есептеу қатесі: ',
 'e.lmMissing': '{0} жылы үшін ең төменгі күнкөріс деңгейі берілмеген (файлда 2027+ үшін нөл тұр). Шарттың ең аз сомасы 0 деп есептеледі. «Баптаулар» бөліміне мәнін енгізіңіз.',
 'e.need': ' (қажет {0} ₸)', 'e.maxLess': 'Жинақ шарттың ең аз сомасынан аз ({0} ₸).',
 'st.ok': 'жарайды', 'st.low': 'жинақ жеткіліксіз', 'st.age': 'жас сәйкес келмейді',
 'c.status': 'Күйі', 'c.perMonth': ' / ай', 'c.type': 'Түрі', 'c.start': 'Төлемдердің басталуы', 'c.ageSuffix': '{0} жас',
 'c.surrIn': 'Басқа ӨСК өтеу сомасы шартқа', 'c.enpfIn': 'БЖЗҚ жинағы шартқа', 'c.left': 'БЖЗҚ-да қалады', 'c.reserve': 'БЖЗҚ-дағы резерв',
 'c.lumpIn': 'Біржолғы төлемнен шартқа', 'c.own': 'Өз қаражаты', 'c.contract': 'Шарт сомасы', 'c.gp': 'Кепілдік берілген кезең', 'c.until': ' ({0} дейін)',
 'c.lumpAll': 'Біржолғы төлем барлығы / картаға', 'c.minSum': 'Шарттың ең аз сомасы',
 'c.calc': 'Есеп', 'c.v1': 'Ең аз қосымша төлеммен', 'c.v2': 'Отбасын қорғаумен', 'c.var': '{0}-нұсқа', 'c.varGp': 'Нұсқа: кепілдік берілген кезең {0}',
 't.def': 'кейінге қалдырылған аннуитет', 't.imm': 'зейнетақы аннуитеті',
 'tb.period': 'Кезең', 'tb.month': 'Айына', 'tb.year': 'Жылына', 'tb.date': 'Күні', 'tb.pay': 'Төлем', 'tb.death': 'Қайтыс болғанда кепіл', 'tb.surr': 'Өтеу сомасы',
 'p.title': 'Зейнетақы аннуитетінің есебі', 'p.date': 'Есеп күні: {0} · шарт жасалатын күн: {1}', 'p.client': 'Клиент: {0}',
 'p.type': 'Түрі', 'p.ageSign': 'Шарт жасалатын күндегі жасы', 'p.startDate': 'Төлемдердің басталу күні', 'p.minPay': 'Ең аз кезеңдік төлем',
 'p.transfer': 'Басқа ӨСК-дан қайта рәсімдеу', 'p.transferVal': 'шарт күні {0}, өтеу сомасы {1}',
 'p.monthlyStart': 'Басында ай сайынғы төлем', 'p.monthlyVal': '{0}, өмір бойы, жылына {1}% индекстеу',
 'p.surrIn': 'Басқа ӨСК өтеу сомасы шартқа', 'p.enpfIn': 'БЖЗҚ жинағы шартқа', 'p.lumpIn': 'Біржолғы төлемнен шартқа',
 'p.own': 'Өз қаражаты', 'p.contract': 'Шарт сомасы', 'p.left': 'Рәсімдегеннен кейін БЖЗҚ-да қалады',
 'p.reserve': 'Инвестициялық табыс ауытқуына БЖЗҚ-дағы резерв', 'p.reserveVal': 'жинақтың {0}%-ы', 'p.gp': 'Кепілдік берілген кезең',
 'p.lumpAll': 'Біржолғы төлем барлығы ({0}%)', 'p.toCard': 'Картаға біржолғы төлем',
 'p.yearlyTitle': 'Жылдар бойынша төлемдер кестесі', 'p.thPeriod': 'Төлем кезеңі', 'p.thMonth': 'Айына, ₸', 'p.thYear': 'Жылына, ₸',
 'p.monthlyTitle': 'Айлық кесте және өтеу сомалары · {0}', 'p.thDate': 'Төлем күні', 'p.thPay': 'Төлем, ₸', 'p.thDeath': 'Қайтыс болғандағы кепілді төлем, ₸', 'p.thSurr': 'Өтеу сомасы, ₸',
 'p.disc': 'Есеп алдын ала және болжамды, ұсыныс (оферта) болып табылмайды.', 'p.page': 'бет {0} / {1}', 'p.file': 'Есеп_ЗА',
 'q.title': '*Сіздің есебіңіз*',
 'q.sexM': 'ер адам', 'q.sexF': 'әйел адам', 'q.oppv': 'МКЗЖ-мен', 'q.noOppv': 'МКЗЖ-сыз', 'q.savings': 'БЖЗҚ-дағы жинақ {0}',
 'q.transfer': ', басқа ӨСК-дан қайта рәсімдеу (шарт күні {0}, өтеу сомасы {1})',
 'q.deferred': 'Төлемдер бірден басталмайды. Шартты қазір жасайсыз, ал төлемдер {0} жастан басталады, яғни {1} кейін (шамамен {2} бастап).',
 'q.immediate': 'Төлемдер бірден, {0} бастап басталады.',
 'q.impossible': 'Есептеу мүмкін емес: {0}',
 'q.surrIn': 'Басқа ӨСК өтеу сомасы шартқа енеді: {0}', 'q.enpfIn': 'БЖЗҚ жинағы шартқа енеді: {0}',
 'q.lumpIn': 'Біржолғы төлемнен шартқа есептеледі: {0}', 'q.own': 'Сіздің өз ақшаңыз: {0}', 'q.contract': 'Шарт сомасы: {0}',
 'q.left': 'Шарт рәсімделгеннен кейін БЖЗҚ-да қалады: {0}', 'q.reserve': 'Инвестициялық табыс ауытқуына БЖЗҚ-дағы резерв: жинақтың {0}%-ы',
 'q.monthlyDef': 'Ай сайынғы төлем: {0}, өмір бойы (төлем басталған күнге, жылына {1}% индекстеумен)', 'q.monthly': 'Ай сайынғы төлем: {0}, өмір бойы (жылына {1}% индекстеумен)',
 'q.gp': 'Кепілдік берілген кезең: {0}', 'q.gpNone': 'кепілдік берілген кезеңсіз',
 'q.lumpAll': 'Біржолғы төлем барлығы: {0} (шарт сомасының {1}%-ы)', 'q.toCard': 'Картаға біржолғы төлем: {0}',
 'q.short': 'Шартқа жинақ жетпейді: {0} өз қаражатыңызбен енгізіледі.',
 'q.gpDiff': '{0} кепілдік берілген кезең шамамен {1} {2} тұрады, ай сайынғы төлем сол күйінде қалады.', 'q.more': 'қымбат', 'q.less': 'арзан',
 'q.disc': 'Есеп алдын ала және болжамды. Төлемдердің толық кестесі — қоса берілген PDF файлында.',
 'mon': ['қаңтардан','ақпаннан','наурыздан','сәуірден','мамырдан','маусымнан','шілдеден','тамыздан','қыркүйектен','қазаннан','қарашадан','желтоқсаннан']
},
en: {
 'app.title': 'Annuity calculator',
 'tab.calc': 'Calculate', 'tab.hist': 'History', 'tab.set': 'Settings',
 'f.transfer': 'Transfer from another life insurer',
 'f.oldDate': 'Date of current contract', 'f.surr': 'Surrender value at signing date, ₸',
 'f.transferHint': 'At least 2 years must have passed since the current contract date. The surrender value is added to ENPF savings. No lump sum for transfers.',
 'f.name': 'Client (for history and PDF)', 'f.namePh': 'Client name',
 'f.dob': 'Date of birth', 'f.sign': 'Signing date', 'f.gender': 'Gender',
 'f.male': 'male', 'f.female': 'female',
 'f.oppv': 'OPPV (professional pension savings, 60 months)', 'f.yes': 'yes', 'f.no': 'no',
 'f.dis': 'Disability (permanent)', 'f.dis1': 'disability group 1', 'f.dis2': 'disability group 2', 'f.dis3': 'disability group 3',
 'f.enpf': 'ENPF savings, ₸', 'f.reserve': 'Amount left in ENPF (reserve for investment income swings)',
 'f.own': 'Own funds, ₸', 'f.lump': 'Lump sum', 'f.lump8': '8% (maximum)', 'f.lump6': '6%',
 'f.mode': 'What to calculate', 'f.modeMin': 'Minimum contract', 'f.modeMax': 'Contract for all savings', 'f.modeCustom': 'Custom contract amount',
 'f.contract': 'Contract amount, ₸', 'f.gp': 'Guaranteed period, years', 'f.go': 'Calculate', 'gp.none': 'none',
 'r.title': 'Result', 'r.copy': 'Copy text', 'r.share': 'Share text', 'r.pdf': 'PDF with schedule', 'r.save': 'Save to history',
 'r.pdfMonthly': 'Include full monthly schedule in PDF', 'r.yearly': 'Payments by year', 'r.monthly': 'Monthly schedule and surrender values', 'r.text': 'Calculation text',
 'h.search': 'Search by name', 'h.export': 'Export history', 'h.import': 'Import', 'h.empty': 'No saved calculations yet.', 'h.noname': 'No name', 'h.open': 'Open',
 'h.confirmDel': 'Delete this calculation?', 'h.imported': 'Imported', 'h.badfile': 'File not recognized', 'h.saved': 'Saved to history', 'h.enpf': 'ENPF',
 's.title': 'Settings', 's.gp': 'Default guaranteed period, years', 's.agent': 'Your name and phone for PDF', 's.agentPh': 'Askar, +7 ...',
 's.lm': 'Living minimum by year, ₸', 's.lmHint': 'Needed for the minimum contract amount (70% of the living minimum). Values in your file are set up to 2026. Enter 2027+ values once they are approved.',
 's.notset': 'not set', 's.save': 'Save settings', 's.saved': 'Settings saved',
 's.ver': 'Engine: port of the «Payment schedule» workbook (first/calc sheets). Rates: before 15.02.2026 — 8%/7%, after — 9%/8%.',
 'm.copied': 'Copied', 'm.saveFail': 'Could not save data on this phone', 'm.pdfFail': 'Could not create PDF: ',
 'e.needOld': 'Enter the date of the current contract with the other insurer',
 'e.twoYears': 'Transfer not possible: 2 years have not passed since the current contract date. A new contract cannot be signed before {0}.',
 'e.calc': 'Calculation error: ',
 'e.lmMissing': 'No living minimum is set for {0} (zeros in the file for 2027+). The minimum contract amount is taken as 0. Enter a value in Settings.',
 'e.need': ' (need {0} ₸)', 'e.maxLess': 'Savings are below the minimum contract amount ({0} ₸).',
 'st.ok': 'ok', 'st.low': 'savings are not sufficient', 'st.age': 'age does not qualify',
 'c.status': 'Status', 'c.perMonth': ' / month', 'c.type': 'Type', 'c.start': 'Payments start', 'c.ageSuffix': 'age {0}',
 'c.surrIn': 'Surrender value from other insurer into contract', 'c.enpfIn': 'ENPF savings into contract', 'c.left': 'Remains in ENPF', 'c.reserve': 'ENPF reserve',
 'c.lumpIn': 'From lump sum into contract', 'c.own': 'Own funds', 'c.contract': 'Contract amount', 'c.gp': 'Guaranteed period', 'c.until': ' (until {0})',
 'c.lumpAll': 'Lump sum total / to card', 'c.minSum': 'Minimum contract amount',
 'c.calc': 'Calculation', 'c.v1': 'With minimum top-up', 'c.v2': 'With family protection', 'c.var': 'Option {0}', 'c.varGp': 'Option: guaranteed period {0}',
 't.def': 'deferred annuity', 't.imm': 'pension annuity',
 'tb.period': 'Period', 'tb.month': 'Monthly', 'tb.year': 'Yearly', 'tb.date': 'Date', 'tb.pay': 'Payment', 'tb.death': 'Death guarantee', 'tb.surr': 'Surrender',
 'p.title': 'Pension annuity calculation', 'p.date': 'Calculation date: {0} · signing date: {1}', 'p.client': 'Client: {0}',
 'p.type': 'Type', 'p.ageSign': 'Age at signing date', 'p.startDate': 'Payments start date', 'p.minPay': 'Minimum periodic payment',
 'p.transfer': 'Transfer from another insurer', 'p.transferVal': 'contract dated {0}, surrender value {1}',
 'p.monthlyStart': 'Monthly payment at start', 'p.monthlyVal': '{0}, for life, indexation {1}% per year',
 'p.surrIn': 'Surrender value from other insurer into contract', 'p.enpfIn': 'ENPF savings into contract', 'p.lumpIn': 'From lump sum into contract',
 'p.own': 'Own funds', 'p.contract': 'Contract amount', 'p.left': 'Remains in ENPF after signing',
 'p.reserve': 'ENPF reserve for investment income swings', 'p.reserveVal': '{0}% of savings', 'p.gp': 'Guaranteed period',
 'p.lumpAll': 'Lump sum total ({0}%)', 'p.toCard': 'Lump sum to card',
 'p.yearlyTitle': 'Payment schedule by year', 'p.thPeriod': 'Payment period', 'p.thMonth': 'Monthly, ₸', 'p.thYear': 'Yearly, ₸',
 'p.monthlyTitle': 'Monthly schedule and surrender values · {0}', 'p.thDate': 'Payment date', 'p.thPay': 'Payment, ₸', 'p.thDeath': 'Guaranteed payment on death, ₸', 'p.thSurr': 'Surrender value, ₸',
 'p.disc': 'This calculation is preliminary and indicative and is not an offer.', 'p.page': 'page {0} / {1}', 'p.file': 'Annuity_calc',
 'q.title': '*Your calculation*',
 'q.sexM': 'man', 'q.sexF': 'woman', 'q.oppv': 'with OPPV', 'q.noOppv': 'without OPPV', 'q.savings': 'ENPF savings {0}',
 'q.transfer': ', transfer from another insurer (contract dated {0}, surrender value {1})',
 'q.deferred': 'Payments do not start right away. You sign the contract now and payments start from age {0}, that is in {1} (approximately from {2}).',
 'q.immediate': 'Payments start immediately, from {0}.',
 'q.impossible': 'Calculation not possible: {0}',
 'q.surrIn': 'Surrender value from the other insurer goes into the contract: {0}', 'q.enpfIn': 'ENPF savings go into the contract: {0}',
 'q.lumpIn': 'Counted into the contract from the lump sum: {0}', 'q.own': 'Your own money: {0}', 'q.contract': 'Contract amount: {0}',
 'q.left': 'Remains in ENPF after signing: {0}', 'q.reserve': 'ENPF reserve for investment income swings: {0}% of savings',
 'q.monthlyDef': 'Monthly payment: {0}, for life (at the payment start date, indexed {1}% per year)', 'q.monthly': 'Monthly payment: {0}, for life (indexed {1}% per year)',
 'q.gp': 'Guaranteed period: {0}', 'q.gpNone': 'no guaranteed period',
 'q.lumpAll': 'Lump sum total: {0} ({1}% of the contract amount)', 'q.toCard': 'Lump sum to card: {0}',
 'q.short': 'Savings are not enough for the contract: {0} is paid from your own funds.',
 'q.gpDiff': 'A guaranteed period of {0} costs about {1} {2}, with the same monthly payment.', 'q.more': 'more', 'q.less': 'less',
 'q.disc': 'This calculation is preliminary and indicative. The full payment schedule is in the attached PDF.',
 'mon': ['January','February','March','April','May','June','July','August','September','October','November','December']
}
};
let lang = 'ru';
const LOCALE = { ru: 'ru-RU', kk: 'kk-KZ', en: 'en-GB' };
function setLang(l) { lang = D[l] ? l : 'ru'; return lang; }
function getLang() { return lang; }
function t(key) { const a = arguments; let s = D[lang][key]; if (s === undefined) s = D.ru[key]; if (s === undefined) return key; if (typeof s !== 'string') return s; return s.replace(/\{(\d)\}/g, (m, i) => a[+i + 1] === undefined ? '' : a[+i + 1]); }
function years(n) {
  if (lang === 'kk') return n + ' жыл';
  if (lang === 'en') return n === 1 ? '1 year' : n + ' years';
  const a = n % 100, b = n % 10; if (a > 10 && a < 15) return n + ' лет'; if (b === 1) return n + ' год'; if (b >= 2 && b <= 4) return n + ' года'; return n + ' лет';
}
function ageWord(n) {
  if (lang === 'kk') return n + ' жас';
  if (lang === 'en') return n + ' years old';
  return years(n);
}
function monthFrom(m, y) {
  const mon = D[lang].mon[m];
  if (lang === 'kk') return y + ' жылғы ' + mon;
  return mon + ' ' + y;
}
// kk: «... бастап» добавляется к форме на «-дан»
function ageText(s) {   // "66 г., 6 м., 6 д." → на выбранном языке
  if (lang === 'ru') return s;
  const u = lang === 'kk' ? { г: 'ж.', м: 'ай', д: 'күн' } : { г: 'y', м: 'm', д: 'd' };
  return String(s).replace(/(\d+)\s*г\./, '$1 ' + u.г).replace(/(\d+)\s*м\./, '$1 ' + u.м).replace(/(\d+)\s*д\./, '$1 ' + u.д);
}
const STATUS = { 'ok': 'st.ok', 'накоплений не достаточно': 'st.low', 'возраст не соответствует': 'st.age' };
const statusText = s => STATUS[s] ? t(STATUS[s]) : s;
const DIS = { 'нет': 'f.no', 'инвалидность 1 группы': 'f.dis1', 'инвалидность 2 группы': 'f.dis2', 'инвалидность 3 группы': 'f.dis3' };
const disText = s => DIS[s] ? t(DIS[s]) : s;
const genderText = g => t(g === 'женский' ? 'f.female' : 'f.male');
const api = { t, setLang, getLang, years, ageWord, monthFrom, ageText, statusText, disText, genderText, locale: () => LOCALE[lang], langs: Object.keys(D) };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AnnuI18n = api;
})(typeof window !== 'undefined' ? window : globalThis);
