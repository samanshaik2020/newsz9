# Short Telugu article slugs — 31 October 2026

New articles now generate readable Latin transliterations from Telugu headlines, capped at 60 characters and five title words. Long titles include a short deterministic suffix derived from the full headline so titles with identical opening words can have different slugs. For example, `స్థానిక వార్త` becomes `sthaanika-vaarta`. Copied links no longer expand into long percent-encoded Telugu strings. The editor and server use the same generator; custom slugs remain editable before publication.

Published URLs remain unchanged and the published slug field is read-only. Edits preserve the original publication date. Category/tag slugs are unaffected. This follows [Google's URL structure guidance](https://developers.google.com/search/docs/crawling-indexing/url-structure) on descriptive URLs and audience-language words, including transliterations.

Validation: 40 tests, lint for changed code, production build/type check, mocked publishing/URL-preservation checks, and the home-page freshness regression checks pass. No live articles or URLs were rewritten.

# Home-page freshness repair — 31 October 2026

Published-article lists now read the database on every request instead of using the separate two-minute Redis/process cache. This covers the home page, latest-news page, public articles API, and RSS source. New posts, edits, and withdrawals are visible on the next request even when another server instance or CMS makes the change. The home page refreshes its server-rendered content every minute while visible and checks again when a reader returns to a stale tab. Hidden tabs do not refresh.

The public articles API sends `Cache-Control: no-store`. Database failures return a non-cacheable 503 instead of a successful empty feed; server-rendered pages also surface failures rather than presenting an empty publication. Publication status, Telugu-language filtering, future-date exclusion, stable article URLs, and original publication dates are preserved. Articles remain in the initial HTML for crawlers; this repair does not rewrite dates to make older reporting appear new.

Validation: 35 existing tests, the production build/type check, lint for changed code, mocked publishing checks, the new `npm run test:freshness` regression checks, and production smoke checks pass. The freshness regression reproduces the prior failure by publishing a simulated story after the first list request without clearing local caches. The local production home page leads with the latest database article; its canonical URL, article dates/NewsArticle metadata, RSS entry, and sitemap entry were checked together. A browser test with simulated posts also confirmed that the open home page updates automatically after one minute. No live articles were created or edited for these checks. Deploy the updated application to apply this repair to the public site.

Google references: [publication dates](https://developers.google.com/search/docs/appearance/publication-dates), [article structured data](https://developers.google.com/search/docs/appearance/structured-data/article), and [Google News policies](https://support.google.com/news/publisher-center/answer/6204050). The earlier publisher/content review items below still apply; this targeted repair is not a full compliance audit or a guarantee of indexing or AdSense approval.

# Article save repair — applied 30 October 2026

The save failure was traced to the connected `articles` table missing all ten optional editorial/image metadata columns. Blank defaults were compatible with the legacy schema, but supplied image descriptions, image credits, review/disclosure flags, and article types could not be stored.

Applied `supabase/migrations/20261030_article_metadata_storage.sql` through the Supabase SQL Editor to the live `newsz9` project (`qxlltybknuviixexruax`). It adds the ten missing article columns and author credentials/expertise fields, then reloads the PostgREST schema cache. Existing article content, publication rules, and table policies were preserved.

Also applied `supabase/migrations/20261030120000_editorial_review_queue.sql` to restore the missing admin audit view. The view uses the caller's table permissions and is readable by `service_role`; anonymous and ordinary authenticated clients have no view access. No stories, author profiles, or category labels were rewritten.

Live verification passed: the production article API created a private draft with all ten metadata fields, updated it to clear those fields, and the exact generated test draft was removed. Public article queries and the reviewer relationship resolve successfully. The editorial audit query returned 225 published articles, the production audit page loaded without its migration warning, and public access to the audit view was denied. The article count remained 225 after cleanup.

The older `20261027_editorial_standards.sql` and `20261029_optional_editorial_fields.sql` migrations were not applied during this repair. The dated deployment guidance below describes earlier work; the two migrations above are the current live storage/audit repair.

Article save failures now return distinct statuses for missing columns, invalid references, permissions, duplicate records, and unexpected server errors. Internal database diagnostics are not returned to the editor. Local tests cover both title/content-only publishing and preserving supplied optional metadata.

# Article form update — 29 October 2026

Only Title and Full Article are required to publish. Summary, images, image details, category, author, article type, tags, and review/disclosure checkboxes are optional. Slugs are generated automatically. There is no minimum word count or required subheading count. The requested source/research/reviewer/correction fields and checklist panel are removed, and comma-separated keywords become tags.

Empty optional metadata is omitted from new writes so articles with only the main fields can also be saved against the legacy database. Apply `supabase/migrations/20261029_optional_editorial_fields.sql` when enabling storage of additional image/editorial metadata. It adds the missing columns and aligns the publication trigger with the optional fields. Existing articles and their metadata are preserved. If the earlier editorial migration is also applied, run this updated migration afterwards.

At the 29 October check, the connected database was missing `articles.cover_alt`. The missing metadata storage was repaired on 30 October as recorded above.

# అమలు, మిగిలిన పనులు

ఈ పత్రం డేటాబేస్, ప్రచురణకు అవసరమైన అమలు దశలను వివరిస్తుంది. గిట్‌కు కోడ్ పంపడం ద్వారా డేటాబేస్ మైగ్రేషన్ స్వయంచాలకంగా అమలు కాదు.

ప్రస్తుత ప్రదర్శన: అసలు NEWSZ9 లోగో పునరుద్ధరించబడింది. ఫుటర్‌లో ఈమెయిల్, ఫోన్, ప్రచురణకర్త ప్రాంత వివరాలు తొలగించబడ్డాయి. ఎనిమిది ముఖ్యమైన సమాచారం/విధాన పేజీలు, సంప్రదింపు ఫారం ఆంగ్లంలో ఉన్నాయి; వార్తా విభాగాలు తెలుగులో కొనసాగుతాయి. సంప్రదింపు వివరాలు Contact Us పేజీలో అందుబాటులో ఉంటాయి.

1. Supabase SQL Editorలో `supabase/migrations/20261027_editorial_standards.sql` అమలు చేయాలి. తరువాత అనువర్తనాన్ని మళ్లీ డిప్లాయ్ చేయాలి. మైగ్రేషన్ పాత కథనాలు, తేదీలు, వైద్య సమీక్షకుడి పరిచయాన్ని తొలగించదు. గోల్డీ అజిత్ పేరును తెలుగులోకి మార్చి, నిర్ధారణ కాని అనుభవ వాదనలను సాధారణ పరిచయంతో భర్తీ చేస్తుంది. పాత కథనాలకు కొత్త రచయితను స్వయంచాలకంగా కేటాయించదు.
2. కొత్త ఫీల్డులు లేకపోయినా పాత పాఠకుల పేజీలు చదవడానికి వెనుకకు అనుకూలమైన మార్గం ఉంది. కొత్త సంపాదకీయ ఫీల్డులతో భద్రపరచడానికి మైగ్రేషన్ తప్పనిసరి. వైద్య సమీక్షకుడి ప్రస్తుత పరిచయం వినియోగదారి సూచన మేరకు అలాగే ఉంటుంది; ఫోటో అప్‌లోడ్ సదుపాయం జోడించబడింది.
3. `NEXT_PUBLIC_SITE_URL`లో ఒకే ప్రధాన డొమైన్‌ను ఉంచాలి. హోస్టింగ్‌లో ఇతర డొమైన్ రూపాన్ని దానికి శాశ్వతంగా మళ్లించాలి. `public/ads.txt`లో పాత సైట్ కోడ్‌లో ఉన్న పబ్లిషర్ సంఖ్యనే నిలిపాం; యాడ్‌సెన్స్ ఖాతాలో దాని యాజమాన్యాన్ని నిర్ధారించాలి. కల్పిత పబ్లిషర్ సంఖ్య వాడలేదు.
4. ప్రకటనలు, గూగుల్ ట్యాగ్ మేనేజర్, ఖాళీ ప్రకటన పెట్టెలు నిలిపివేయబడ్డాయి. మళ్లీ ప్రారంభించే ముందు గోప్యతా వివరాలు, వర్తించే ప్రాంతాల సమ్మతి అవసరాలు, అవసరమైన ధ్రువీకృత సమ్మతి వ్యవస్థ పూర్తి చేయాలి. ప్రస్తుతం ప్రకటనల సమ్మతి వ్యవస్థ ఉందని ప్రకటించలేదు.
5. సైట్ పటాన్ని Search Consoleలో సమర్పించాలి. యాడ్‌సెన్స్ ఆమోదం, సూచికలో చేర్పు, శోధన స్థానం, మొబైల్ వేగం స్కోరు ఈ కోడ్ మార్పులతో హామీ ఇవ్వబడవు. వార్తలకు వర్తించని Indexing API అనుసంధానాన్ని నిలిపాం.
6. మైగ్రేషన్‌లో సాధారణ Supabase ఖాతాకు ఉన్న విస్తృత సంపాదకీయ రాత అనుమతులు తొలగించబడతాయి. సైట్ ఇప్పటికే ఉపయోగించే రక్షిత నిర్వాహక సేవల ద్వారా భద్రపరచడం కొనసాగుతుంది. ప్రైవేట్ రచయిత ఈమెయిల్ ఫీల్డుకు ప్రజా పఠన అనుమతి తొలగించబడుతుంది; బహిరంగ పరిచయాలు, ఫోటోలు అందుబాటులో ఉంటాయి.

## ప్రత్యక్ష డేటాబేస్ పరిశీలన — 27 అక్టోబర్ 2026

- 224 ప్రచురిత కథనాలు; ఆరు కథనాలు ఆంగ్ల భాషగా గుర్తించబడ్డాయి. పాఠకుల పేజీలు తెలుగు ప్రచురిత కథనాలకు పరిమితం చేయబడ్డాయి.
- భవిష్యత్ ప్రచురణ తేదీలు లేవు. పాత ఆడిట్‌లోని సెప్టెంబర్ తేదీలను తప్పుగా నేటి తేదీతో మార్చలేదు.
- 224 కథనాల్లో `source_url` ఖాళీగా ఉంది; 16 కథనాల లోపల వెబ్ లింకులు ఉన్నాయి. ఈ లింకులు వాదనలకు సరైన ఆధారాలా ఒక్కొక్కటిగా తనిఖీ చేయాలి. మూలాలను ఊహించి నింపలేదు.
- 182 కథనాలకు రచయిత కేటాయింపు లేదు. నిజంగా బాధ్యత వహించిన వ్యక్తిని నిర్ధారించి జోడించాలి; కల్పిత బైలైన్‌లు సృష్టించలేదు.
- ఖచ్చితంగా ఒకే కథన పాఠ్యం ఉన్న కాపీలు ఈ పరిమిత తనిఖీలో కనిపించలేదు. ముఖపుటలో విభాగాల మధ్య ఒకే కథనం పునరావృతమయ్యే అమరికను సరిచేశాం. సైట్ వెలుపల కాపీరైట్ లేదా సారూప్యతపై సంపూర్ణ తనిఖీ జరగలేదు.
- 22 ఆరోగ్య కథనాలకు ఆధారాలు, సమీక్ష నమోదు అవసరం. ఆడిట్‌లో ప్రత్యేకంగా పేర్కొన్న మూడు కథనాలకు మూలాలతో కొత్త ముసాయిదాలు సిద్ధం చేశాం. వాటిని మానవ సమీక్ష లేకుండా ప్రచురించలేదు.
- కొన్ని ప్రధాన చిత్రాలు ఇతర వార్తా సంస్థల డొమైన్‌లను సూచిస్తున్నాయి. అనుమతుల రికార్డులను నిర్ధారించాలి లేదా సొంత అనుమతిగల చిత్రాలతో భర్తీ చేయాలి. అనుమతించని చిత్ర హోస్ట్‌ల వల్ల పేజీ విఫలం కాకుండా తెలుగు ప్రత్యామ్నాయ ప్రదర్శన ఉంది.

## ప్రచురణకర్త పూర్తి చేయాల్సిన వాస్తవ, కార్యాచరణ అంశాలు

పూర్తి పోస్టల్ చిరునామా ఇంకా అందలేదు; నెల్లూరు ప్రాంతాన్ని మాత్రమే ప్రచురించాం. చట్టబద్ధ ఫిర్యాదు అధికారి నియామకం, వర్తించే డిజిటల్ వార్తా ప్రచురణకర్త నమోదు/సమాచార సమర్పణ, స్వీయ నియంత్రణ సంస్థ సంబంధం, ఫిర్యాదు రికార్డులు వంటి సంస్థాగత బాధ్యతలను ప్రచురణకర్త వర్తించే నియమాల ప్రకారం నిర్ధారించాలి. సంప్రదింపు పేజీ లేదా విధాన పాఠ్యం ఈ నియామకాలు జరిగినట్టు ధ్రువీకరణ కాదు. గోప్యతా విధానాన్ని నిజమైన నిర్వహణ, నిల్వ కాలాలు, సేవా సంస్థల ఒప్పందాలకు అనుగుణంగా అమలు చేయాలి.

## పరిశీలించిన అధికారిక మార్గదర్శకాలు

- [గూగుల్: ఉపయోగకరమైన, విశ్వసనీయ రచన](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [గూగుల్ వార్తల పారదర్శకత, కంటెంట్ విధానాలు](https://support.google.com/news/publisher-center/answer/6204050)
- [యాడ్‌సెన్స్ అర్హతలు](https://support.google.com/adsense/answer/9724)
- [యాడ్‌సెన్స్ సమ్మతి వ్యవస్థ అవసరాలు](https://support.google.com/adsense/answer/13554116)
- [వార్తా కథనాల నిర్మిత సమాచారం](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Indexing API పరిమితులు](https://developers.google.com/search/apis/indexing-api/v3/using-api)
- [భారత సమాచార ప్రసార మంత్రిత్వ శాఖ: డిజిటల్ మీడియా నియమాలు](https://www.mib.gov.in/sites/default/files/2026-05/it-rules-2021-2.pdf)
- [భారత ప్రభుత్వం: వ్యక్తిగత డేటా రక్షణ నియమాల ప్రకటన](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2190655&lang=2&reg=48)

## ధృవీకరణ ఫలితాలు

స్థానిక ఉత్పత్తి నిర్మాణం, రకాల తనిఖీ, 22 స్వయంచాలక పరీక్షలు విజయవంతమయ్యాయి. ప్రధాన పేజీ, ఎనిమిది విధాన/సంప్రదింపు పేజీలు, శాశ్వత దారి మళ్లింపులు, ఫీడ్, సైట్ పటం, క్రాలర్ ఫైల్, ప్రకటన విక్రేతల ఫైల్, అసంపూర్ణ ప్రచురణ తిరస్కరణను స్థానిక సర్వర్‌పై తనిఖీ చేశాం. ఆరోగ్య కథనంలోని నిర్వాహక సూచనలు ప్రజా ప్రదర్శనలో తొలగించబడ్డాయి; సమీక్ష పూర్తికాని ఆ కథనానికి సూచికలో చేర్చవద్దనే గుర్తింపు ఉంది.

డేటాబేస్ మైగ్రేషన్‌ను లైవ్‌లో అమలు చేయలేదు; దాని అమలు పరీక్ష జరగలేదు. అసలు ఫోటో ఇవ్వనందున కొత్త ఫోటోను లైవ్ నిల్వలో అప్‌లోడ్ చేయలేదు. లైవ్ డిప్లాయ్, Search Console సమర్పణ, యాడ్‌సెన్స్ ఆమోదం లేదా మొబైల్ వేగం ప్రమాణ పరీక్ష జరగలేదు.
