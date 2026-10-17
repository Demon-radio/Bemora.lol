const PROVIDER_INFO = {
  "weather": {
    "description": "Weather API provider",
    "requiresKey": true,
    "keyName": "BEMORA_WEATHER_KEY",
    "keyUrl": "https://openweathermap.org/api",
    "category": "weather",
    "methods": {
      "current": "Call weather.current method",
      "forecast": "Call weather.forecast method"
    }
  },
  "currency": {
    "description": "Currency API provider",
    "requiresKey": true,
    "keyName": "BEMORA_CURRENCY_KEY",
    "keyUrl": "https://www.exchangerate-api.com",
    "category": "finance",
    "methods": {
      "rates": "Call currency.rates method",
      "convert": "Call currency.convert method"
    }
  },
  "news": {
    "description": "News API provider",
    "requiresKey": true,
    "keyName": "BEMORA_NEWS_KEY",
    "keyUrl": "https://newsapi.org/register",
    "category": "news",
    "methods": {
      "headlines": "Call news.headlines method",
      "search": "Call news.search method"
    }
  },
  "images": {
    "description": "Images API provider",
    "requiresKey": true,
    "keyName": "BEMORA_UNSPLASH_KEY or BEMORA_PEXELS_KEY",
    "keyUrl": "https://unsplash.com/developers",
    "category": "media",
    "methods": {
      "search": "Call images.search method",
      "random": "Call images.random method",
      "pexels": "Call images.pexels method"
    }
  },
  "football": {
    "description": "Football API provider",
    "requiresKey": true,
    "keyName": "BEMORA_FOOTBALL_KEY",
    "keyUrl": "https://dashboard.api-football.com/register",
    "category": "sports",
    "methods": {
      "fixtures": "Call football.fixtures method",
      "standings": "Call football.standings method",
      "teams": "Call football.teams method"
    }
  },
  "crypto": {
    "description": "Crypto API provider",
    "requiresKey": false,
    "category": "finance",
    "methods": {
      "price": "Call crypto.price method",
      "trending": "Call crypto.trending method",
      "top": "Call crypto.top method"
    }
  },
  "gold": {
    "description": "Gold API provider",
    "requiresKey": true,
    "keyName": "BEMORA_GOLD_KEY",
    "keyUrl": "https://goldapi.io",
    "category": "finance",
    "methods": {
      "price": "Call gold.price method",
      "silver": "Call gold.silver method"
    }
  },
  "research": {
    "description": "Research API provider",
    "requiresKey": false,
    "category": "research",
    "methods": {
      "wikipedia": "Call research.wikipedia method",
      "article": "Call research.article method",
      "books": "Call research.books method"
    }
  },
  "location": {
    "description": "Location API provider",
    "requiresKey": false,
    "category": "geo",
    "methods": {
      "geocode": "Call location.geocode method",
      "reverse": "Call location.reverse method",
      "distance": "Call location.distance method"
    }
  },
  "ip": {
    "description": "Ip API provider",
    "requiresKey": false,
    "category": "geo",
    "methods": {
      "lookup": "Call ip.lookup method",
      "batchLookup": "Call ip.batchLookup method",
      "myIp": "Call ip.myIp method"
    }
  },
  "countries": {
    "description": "Countries API provider",
    "requiresKey": false,
    "category": "geo",
    "methods": {
      "byName": "Call countries.byName method",
      "byCode": "Call countries.byCode method",
      "byRegion": "Call countries.byRegion method",
      "all": "Call countries.all method"
    }
  },
  "translate": {
    "description": "Translate API provider",
    "requiresKey": false,
    "category": "language",
    "methods": {
      "text": "Call translate.text method",
      "many": "Call translate.many method",
      "detect": "Call translate.detect method"
    }
  },
  "movies": {
    "description": "Movies API provider",
    "requiresKey": true,
    "keyName": "BEMORA_MOVIES_KEY",
    "keyUrl": "https://www.themoviedb.org/settings/api",
    "category": "entertainment",
    "methods": {
      "search": "Call movies.search method",
      "details": "Call movies.details method",
      "trending": "Call movies.trending method",
      "tv": "Call movies.tv method"
    }
  },
  "food": {
    "description": "Food API provider",
    "requiresKey": false,
    "category": "food",
    "methods": {
      "searchMeals": "Call food.searchMeals method",
      "getRandomMeal": "Call food.getRandomMeal method",
      "random": "Call food.random method",
      "getMeal": "Call food.getMeal method",
      "byCategory": "Call food.byCategory method",
      "categories": "Call food.categories method",
      "searchSpoonacular": "Call food.searchSpoonacular method",
      "getSpoonacularRecipe": "Call food.getSpoonacularRecipe method",
      "searchEdamam": "Call food.searchEdamam method",
      "analyzeEdamam": "Call food.analyzeEdamam method"
    }
  },
  "space": {
    "description": "Space API provider",
    "requiresKey": true,
    "keyName": "BEMORA_NASA_KEY",
    "keyUrl": "https://api.nasa.gov",
    "category": "science",
    "methods": {
      "apod": "Call space.apod method",
      "mars": "Call space.mars method",
      "asteroids": "Call space.asteroids method",
      "issPosition": "Call space.issPosition method"
    }
  },
  "search": {
    "description": "Search API provider",
    "requiresKey": false,
    "category": "search",
    "methods": {
      "instant": "Call search.instant method",
      "web": "Call search.web method"
    }
  },
  "stocks": {
    "description": "Stocks API provider",
    "requiresKey": true,
    "keyName": "BEMORA_STOCKS_KEY",
    "keyUrl": "https://www.alphavantage.co/support/#api-key",
    "category": "finance",
    "methods": {
      "quote": "Call stocks.quote method",
      "search": "Call stocks.search method",
      "overview": "Call stocks.overview method"
    }
  },
  "music": {
    "description": "Music API provider",
    "requiresKey": false,
    "category": "entertainment",
    "methods": {
      "artist": "Call music.artist method",
      "album": "Call music.album method",
      "itunes": "Call music.itunes method"
    }
  },
  "social": {
    "description": "Social API provider",
    "requiresKey": false,
    "category": "social",
    "methods": {
      "githubUser": "Call social.githubUser method",
      "githubRepo": "Call social.githubRepo method",
      "githubTrending": "Call social.githubTrending method",
      "hackerNews": "Call social.hackerNews method",
      "productHunt": "Call social.productHunt method"
    }
  },
  "ai": {
    "description": "Ai API provider",
    "requiresKey": true,
    "keyName": "BEMORA_GROQ_KEY or BEMORA_OPENAI_KEY",
    "keyUrl": "https://console.groq.com",
    "category": "ai",
    "methods": {
      "openaiChat": "Call ai.openaiChat method",
      "openai": "Call ai.openai method",
      "groqChat": "Call ai.groqChat method",
      "groq": "Call ai.groq method",
      "anthropicChat": "Call ai.anthropicChat method",
      "geminiChat": "Call ai.geminiChat method",
      "smartChat": "Call ai.smartChat method",
      "chat": "Call ai.chat method",
      "generateImage": "Call ai.generateImage method",
      "imagine": "Call ai.imagine method",
      "embed": "Call ai.embed method"
    }
  },
  "utils": {
    "description": "Utils API provider",
    "requiresKey": false,
    "category": "utility",
    "methods": {
      "qr": "Call utils.qr method",
      "uuid": "Call utils.uuid method",
      "passwordStrength": "Call utils.passwordStrength method",
      "hash": "Call utils.hash method",
      "base64Encode": "Call utils.base64Encode method",
      "base64Decode": "Call utils.base64Decode method",
      "loremIpsum": "Call utils.loremIpsum method",
      "emojiSearch": "Call utils.emojiSearch method",
      "randomEmoji": "Call utils.randomEmoji method",
      "hexToRgb": "Call utils.hexToRgb method",
      "rgbToHex": "Call utils.rgbToHex method",
      "httpStatus": "Call utils.httpStatus method",
      "shorten": "Call utils.shorten method",
      "time": "Call utils.time method",
      "timezones": "Call utils.timezones method",
      "holidays": "Call utils.holidays method",
      "quote": "Call utils.quote method",
      "quotes": "Call utils.quotes method",
      "define": "Call utils.define method",
      "trivia": "Call utils.trivia method",
      "color": "Call utils.color method",
      "randomNumber": "Call utils.randomNumber method",
      "formatDate": "Call utils.formatDate method",
      "validateJSON": "Call utils.validateJSON method",
      "parseURL": "Call utils.parseURL method",
      "slugify": "Call utils.slugify method"
    }
  },
  "fandom": {
    "description": "Fandom API provider",
    "requiresKey": false,
    "category": "entertainment",
    "methods": {
      "search": "Call fandom.search method",
      "getPage": "Call fandom.getPage method",
      "recentActivity": "Call fandom.recentActivity method"
    }
  },
  "spotify": {
    "description": "Spotify API provider",
    "requiresKey": true,
    "keyName": "BEMORA_SPOTIFY_CLIENT_ID and BEMORA_SPOTIFY_CLIENT_SECRET",
    "keyUrl": "https://developer.spotify.com/",
    "category": "entertainment",
    "methods": {
      "searchTracks": "Call spotify.searchTracks method",
      "getArtist": "Call spotify.getArtist method",
      "getArtistTopTracks": "Call spotify.getArtistTopTracks method"
    }
  },
  "stackexchange": {
    "description": "Stackexchange API provider",
    "requiresKey": false,
    "category": "developer",
    "methods": {
      "searchQuestions": "Call stackexchange.searchQuestions method",
      "getQuestion": "Call stackexchange.getQuestion method",
      "getTopUsers": "Call stackexchange.getTopUsers method"
    }
  },
  "steam": {
    "description": "Steam API provider",
    "requiresKey": true,
    "keyName": "BEMORA_STEAM_KEY",
    "keyUrl": "https://steamcommunity.com/dev/apikey",
    "category": "entertainment",
    "methods": {
      "getPlayerSummaries": "Call steam.getPlayerSummaries method",
      "getOwnedGames": "Call steam.getOwnedGames method",
      "searchApps": "Call steam.searchApps method"
    }
  },
  "animals": {
    "description": "Animals API provider",
    "requiresKey": false,
    "category": "nature",
    "methods": {
      "randomDog": "Call animals.randomDog method",
      "randomCat": "Call animals.randomCat method",
      "randomFox": "Call animals.randomFox method",
      "randomDuck": "Call animals.randomDuck method",
      "randomPanda": "Call animals.randomPanda method",
      "randomBird": "Call animals.randomBird method"
    }
  },
  "books": {
    "description": "Books API provider",
    "requiresKey": false,
    "category": "research",
    "methods": {
      "search": "Call books.search method",
      "getById": "Call books.getById method",
      "random": "Call books.random method"
    }
  },
  "lyrics": {
    "description": "Lyrics API provider",
    "requiresKey": false,
    "category": "entertainment",
    "methods": {
      "search": "Call lyrics.search method"
    }
  },
  "math": {
    "description": "Math API provider",
    "requiresKey": false,
    "category": "utility",
    "methods": {
      "evaluate": "Call math.evaluate method",
      "randomFact": "Call math.randomFact method"
    }
  },
  "jobs": {
    "description": "Jobs API provider",
    "requiresKey": false,
    "category": "business",
    "methods": {
      "search": "Call jobs.search method"
    }
  },
  "science": {
    "description": "Science API provider",
    "requiresKey": false,
    "category": "science",
    "methods": {
      "nasaApod": "Call science.nasaApod method",
      "randomFact": "Call science.randomFact method"
    }
  },
  "basketball": {
    "description": "Basketball API provider",
    "requiresKey": false,
    "category": "sports",
    "methods": {
      "nbaTeams": "Call basketball.nbaTeams method",
      "nbaGames": "Call basketball.nbaGames method",
      "nbaPlayer": "Call basketball.nbaPlayer method"
    }
  },
  "vehicles": {
    "description": "Vehicles API provider",
    "requiresKey": false,
    "category": "utility",
    "methods": {
      "randomCar": "Call vehicles.randomCar method",
      "vinDecode": "Call vehicles.vinDecode method",
      "recalls": "Call vehicles.recalls method",
      "makes": "Call vehicles.makes method",
      "models": "Call vehicles.models method"
    }
  },
  "pets": {
    "description": "Pets API provider",
    "requiresKey": false,
    "category": "nature",
    "methods": {
      "random": "Call pets.random method"
    }
  },
  "drinks": {
    "description": "Drinks API provider",
    "requiresKey": false,
    "category": "food",
    "methods": {
      "randomCocktail": "Call drinks.randomCocktail method",
      "searchCocktail": "Call drinks.searchCocktail method",
      "searchIngredient": "Call drinks.searchIngredient method"
    }
  },
  "geography": {
    "description": "Geography API provider",
    "requiresKey": false,
    "category": "geo",
    "methods": {
      "countryInfo": "Call geography.countryInfo method",
      "allCountries": "Call geography.allCountries method",
      "capitalCity": "Call geography.capitalCity method"
    }
  },
  "comics": {
    "description": "Comics API provider",
    "requiresKey": false,
    "category": "entertainment",
    "methods": {
      "randomXKCD": "Call comics.randomXKCD method",
      "getXKCD": "Call comics.getXKCD method"
    }
  },
  "tv": {
    "description": "Tv API provider",
    "requiresKey": true,
    "keyName": "BEMORA_MOVIES_KEY",
    "keyUrl": "https://www.themoviedb.org/settings/api",
    "category": "entertainment",
    "methods": {
      "search": "Call tv.search method",
      "details": "Call tv.details method",
      "trending": "Call tv.trending method"
    }
  },
  "baseball": {
    "description": "Baseball API provider",
    "requiresKey": false,
    "category": "sports",
    "methods": {
      "mlbTeams": "Call baseball.mlbTeams method",
      "mlbSchedule": "Call baseball.mlbSchedule method"
    }
  },
  "hockey": {
    "description": "Hockey API provider",
    "requiresKey": false,
    "category": "sports",
    "methods": {
      "nhlTeams": "Call hockey.nhlTeams method",
      "nhlPlayer": "Call hockey.nhlPlayer method"
    }
  },
  "finance": {
    "description": "Finance API provider",
    "requiresKey": false,
    "category": "finance",
    "methods": {
      "stockQuote": "Call finance.stockQuote method",
      "cryptoPrice": "Call finance.cryptoPrice method"
    }
  },
  "literature": {
    "description": "Literature API provider",
    "requiresKey": false,
    "category": "research",
    "methods": {
      "randomQuote": "Call literature.randomQuote method",
      "searchQuotes": "Call literature.searchQuotes method"
    }
  },
  "wildlife": {
    "description": "Wildlife API provider",
    "requiresKey": false,
    "category": "nature",
    "methods": {
      "randomFact": "Call wildlife.randomFact method"
    }
  },
  "politics": {
    "description": "Politics API provider",
    "requiresKey": false,
    "category": "news",
    "methods": {
      "presidents": "Call politics.presidents method"
    }
  },
  "language": {
    "description": "Language API provider",
    "requiresKey": false,
    "category": "language",
    "methods": {
      "detect": "Call language.detect method",
      "translate": "Call language.translate method"
    }
  },
  "law": {
    "description": "Law API provider",
    "requiresKey": false,
    "category": "research",
    "methods": {
      "search": "Call law.search method"
    }
  },
  "military": {
    "description": "Military API provider",
    "requiresKey": false,
    "category": "geo",
    "methods": {
      "time": "Call military.time method"
    }
  },
  "thesaurus": {
    "description": "Thesaurus API provider",
    "requiresKey": false,
    "category": "language",
    "methods": {
      "synonyms": "Call thesaurus.synonyms method",
      "antonyms": "Call thesaurus.antonyms method",
      "rhymes": "Call thesaurus.rhymes method",
      "suggest": "Call thesaurus.suggest method"
    }
  },
  "currencyHistory": {
    "description": "CurrencyHistory API provider",
    "requiresKey": false,
    "category": "finance",
    "methods": {
      "latest": "Call currencyHistory.latest method",
      "historical": "Call currencyHistory.historical method",
      "timeSeries": "Call currencyHistory.timeSeries method"
    }
  },
  "markdown": {
    "description": "Markdown API provider",
    "requiresKey": false,
    "category": "developer",
    "methods": {
      "render": "Call markdown.render method",
      "renderGfm": "Call markdown.renderGfm method",
      "analyze": "Call markdown.analyze method"
    }
  },
  "techdb": {
    "description": "Techdb API provider",
    "requiresKey": false,
    "category": "developer",
    "methods": {
      "listDevices": "Call techdb.listDevices method",
      "getDevice": "Call techdb.getDevice method",
      "searchDevices": "Call techdb.searchDevices method",
      "compareDevices": "Call techdb.compareDevices method"
    }
  },
  "websites": {
    "description": "Websites API provider",
    "requiresKey": false,
    "category": "developer",
    "methods": {
      "status": "Call websites.status method",
      "detectTechStack": "Call websites.detectTechStack method",
      "getMeta": "Call websites.getMeta method"
    }
  },
  "fakedb": {
    "description": "Fakedb API provider",
    "requiresKey": false,
    "category": "developer",
    "methods": {
      "getPosts": "Call fakedb.getPosts method",
      "getComments": "Call fakedb.getComments method",
      "getUser": "Call fakedb.getUser method",
      "getUsers": "Call fakedb.getUsers method",
      "getTodos": "Call fakedb.getTodos method",
      "getAlbums": "Call fakedb.getAlbums method",
      "getPhotos": "Call fakedb.getPhotos method",
      "create": "Call fakedb.create method"
    }
  },
  "religion": {
    "description": "Religion API provider",
    "requiresKey": false,
    "category": "religion",
    "methods": {
      "randomVerse": "Call religion.randomVerse method",
      "getVerse": "Call religion.getVerse method"
    }
  },
  "islamic": {
    "description": "Islamic API provider",
    "requiresKey": false,
    "category": "religion",
    "methods": {
      "quranChapters": "Call islamic.quranChapters method",
      "quranChapter": "Call islamic.quranChapter method",
      "randomVerse": "Call islamic.randomVerse method",
      "azkar": "Call islamic.azkar method",
      "prayerTimes": "Call islamic.prayerTimes method"
    }
  },
  "gaming": {
    "description": "Gaming API provider",
    "requiresKey": false,
    "category": "entertainment",
    "methods": {
      "freeFirePlayer": "Call gaming.freeFirePlayer method",
      "pubgPlayer": "Call gaming.pubgPlayer method",
      "crossfireNews": "Call gaming.crossfireNews method",
      "freeFireNews": "Call gaming.freeFireNews method",
      "pubgPatchNotes": "Call gaming.pubgPatchNotes method",
      "crossfireWeapons": "Call gaming.crossfireWeapons method",
      "crossfireWeapon": "Call gaming.crossfireWeapon method",
      "crossfireMaps": "Call gaming.crossfireMaps method",
      "crossfireCharacters": "Call gaming.crossfireCharacters method",
      "crossfireGameModes": "Call gaming.crossfireGameModes method",
      "crossfireEvents": "Call gaming.crossfireEvents method",
      "crossfireSearch": "Call gaming.crossfireSearch method",
      "fortniteCosmetic": "Call gaming.fortniteCosmetic method",
      "fortniteShop": "Call gaming.fortniteShop method",
      "lolChampions": "Call gaming.lolChampions method",
      "lolChampion": "Call gaming.lolChampion method",
      "minecraftPlayer": "Call gaming.minecraftPlayer method",
      "minecraftServerStatus": "Call gaming.minecraftServerStatus method",
      "chessPlayer": "Call gaming.chessPlayer method",
      "chessDailyPuzzle": "Call gaming.chessDailyPuzzle method",
      "searchGameWiki": "Call gaming.searchGameWiki method"
    }
  },
  "spaceExtended": {
    "description": "SpaceExtended API provider",
    "requiresKey": false,
    "category": "science",
    "methods": {
      "apod": "Call spaceExtended.apod method",
      "marsPhotos": "Call spaceExtended.marsPhotos method",
      "nearEarthObjects": "Call spaceExtended.nearEarthObjects method",
      "issPosition": "Call spaceExtended.issPosition method"
    }
  },
  "covid": {
    "description": "Covid API provider",
    "requiresKey": false,
    "category": "health",
    "methods": {
      "global": "Call covid.global method",
      "country": "Call covid.country method",
      "historical": "Call covid.historical method",
      "topCountries": "Call covid.topCountries method"
    }
  },
  "earthquake": {
    "description": "Earthquake API provider",
    "requiresKey": false,
    "category": "science",
    "methods": {
      "recent": "Call earthquake.recent method",
      "byLocation": "Call earthquake.byLocation method",
      "biggestToday": "Call earthquake.biggestToday method"
    }
  },
  "airquality": {
    "description": "Airquality API provider",
    "requiresKey": false,
    "category": "science",
    "methods": {
      "current": "Call airquality.current method",
      "forecast": "Call airquality.forecast method",
      "classify": "Call airquality.classify method"
    }
  },
  "astronomy": {
    "description": "Astronomy API provider",
    "requiresKey": false,
    "category": "science",
    "methods": {
      "sunriseSunset": "Call astronomy.sunriseSunset method",
      "moonPhase": "Call astronomy.moonPhase method"
    }
  },
  "postal": {
    "description": "Postal API provider",
    "requiresKey": false,
    "category": "geo",
    "methods": {
      "lookup": "Call postal.lookup method"
    }
  },
  "predict": {
    "description": "Predict API provider",
    "requiresKey": false,
    "category": "ai",
    "methods": {
      "nationality": "Call predict.nationality method",
      "gender": "Call predict.gender method",
      "age": "Call predict.age method",
      "all": "Call predict.all method"
    }
  },
  "brewery": {
    "description": "Brewery API provider",
    "requiresKey": false,
    "category": "food",
    "methods": {
      "search": "Call brewery.search method",
      "random": "Call brewery.random method",
      "getById": "Call brewery.getById method"
    }
  },
  "sportsdb": {
    "description": "Sportsdb API provider",
    "requiresKey": false,
    "category": "sports",
    "methods": {
      "searchTeam": "Call sportsdb.searchTeam method",
      "searchPlayer": "Call sportsdb.searchPlayer method",
      "leagueEvents": "Call sportsdb.leagueEvents method",
      "leagues": "Call sportsdb.leagues method"
    }
  },
  "domain": {
    "description": "Domain API provider",
    "requiresKey": false,
    "category": "developer",
    "methods": {
      "whois": "Call domain.whois method",
      "dnsRecords": "Call domain.dnsRecords method",
      "resolveIp": "Call domain.resolveIp method"
    }
  },
  "placeholder": {
    "description": "Placeholder API provider",
    "requiresKey": false,
    "category": "utility",
    "methods": {
      "image": "Call placeholder.image method",
      "picsum": "Call placeholder.picsum method",
      "avatar": "Call placeholder.avatar method",
      "dicebear": "Call placeholder.dicebear method"
    }
  },
  "weatheralerts": {
    "description": "Weatheralerts API provider",
    "requiresKey": false,
    "category": "weather",
    "methods": {
      "usAlerts": "Call weatheralerts.usAlerts method",
      "pointForecast": "Call weatheralerts.pointForecast method"
    }
  },
  "coinWizard": {
    "description": "CoinWizard API provider",
    "requiresKey": false,
    "category": "finance",
    "methods": {
      "info": "Call coinWizard.info method",
      "chart": "Call coinWizard.chart method",
      "ohlc": "Call coinWizard.ohlc method",
      "global": "Call coinWizard.global method",
      "exchanges": "Call coinWizard.exchanges method",
      "categories": "Call coinWizard.categories method",
      "gainersLosers": "Call coinWizard.gainersLosers method",
      "search": "Call coinWizard.search method",
      "convert": "Call coinWizard.convert method",
      "list": "Call coinWizard.list method"
    }
  },
  "free": {
    "description": "Free API provider",
    "requiresKey": false,
    "category": "meta",
    "methods": {
      "weather": "Call free.weather method",
      "wttr": "Call free.wttr method",
      "exchangeRates": "Call free.exchangeRates method",
      "binanceTicker": "Call free.binanceTicker method",
      "binanceTickers": "Call free.binanceTickers method",
      "football": "Call free.football method"
    }
  },
  "rss": {
    "description": "Rss API provider",
    "requiresKey": false,
    "category": "news",
    "methods": {
      "fetch": "Call rss.fetch method",
      "custom": "Call rss.custom method",
      "aggregate": "Call rss.aggregate method",
      "sources": "Call rss.sources method"
    }
  },
  "realtime": {
    "description": "Realtime API provider",
    "requiresKey": false,
    "category": "finance",
    "methods": {
      "binance": "Call realtime.binance method",
      "kraken": "Call realtime.kraken method",
      "getPrice": "Call realtime.getPrice method"
    }
  },
  "prayer": {
    "description": "Prayer API provider",
    "requiresKey": false,
    "category": "religion",
    "methods": {
      "today": "Call prayer.today method",
      "byCoords": "Call prayer.byCoords method",
      "monthly": "Call prayer.monthly method",
      "methods": "Call prayer.methods method"
    }
  },
  "anime": {
    "description": "Anime API provider",
    "requiresKey": false,
    "category": "entertainment",
    "methods": {
      "search": "Call anime.search method",
      "details": "Call anime.details method",
      "top": "Call anime.top method",
      "nowAiring": "Call anime.nowAiring method",
      "random": "Call anime.random method",
      "manga": "Call anime.manga method",
      "mangaDetails": "Call anime.mangaDetails method",
      "episodes": "Call anime.episodes method",
      "episode": "Call anime.episode method",
      "characters": "Call anime.characters method",
      "character": "Call anime.character method",
      "videos": "Call anime.videos method",
      "pictures": "Call anime.pictures method",
      "recommendations": "Call anime.recommendations method",
      "news": "Call anime.news method",
      "quote": "Call anime.quote method",
      "quotesByCharacter": "Call anime.quotesByCharacter method"
    }
  },
  "flights": {
    "description": "Flights API provider",
    "requiresKey": true,
    "keyName": "BEMORA_FLIGHTS_KEY",
    "keyUrl": "https://aviationstack.com/signup",
    "category": "travel",
    "methods": {
      "live": "Call flights.live method",
      "airport": "Call flights.airport method",
      "airline": "Call flights.airline method"
    }
  },
  "art": {
    "description": "Art API provider",
    "requiresKey": false,
    "category": "entertainment",
    "methods": {
      "search": "Call art.search method",
      "details": "Call art.details method",
      "searchMet": "Call art.searchMet method",
      "metDetails": "Call art.metDetails method"
    }
  },
  "dev": {
    "description": "Dev API provider",
    "requiresKey": false,
    "category": "developer",
    "methods": {
      "npmPackage": "Call dev.npmPackage method",
      "npmDownloads": "Call dev.npmDownloads method",
      "githubRepos": "Call dev.githubRepos method",
      "githubReleases": "Call dev.githubReleases method",
      "validateEmail": "Call dev.validateEmail method",
      "dnsLookup": "Call dev.dnsLookup method",
      "loremIpsum": "Call dev.loremIpsum method",
      "httpStatus": "Call dev.httpStatus method"
    }
  },
  "podcasts": {
    "description": "Podcasts API provider",
    "requiresKey": false,
    "category": "entertainment",
    "methods": {
      "search": "Call podcasts.search method",
      "episodes": "Call podcasts.episodes method",
      "index": "Call podcasts.index method"
    }
  },
  "medical": {
    "description": "Medical API provider",
    "requiresKey": false,
    "category": "health",
    "methods": {
      "drug": "Call medical.drug method",
      "disease": "Call medical.disease method",
      "exercises": "Call medical.exercises method",
      "nutrition": "Call medical.nutrition method",
      "bmi": "Call medical.bmi method"
    }
  },
  "enriched": {
    "description": "Enriched API provider",
    "requiresKey": false,
    "category": "weather",
    "methods": {
      "weather": "Call enriched.weather method",
      "compareCities": "Call enriched.compareCities method"
    }
  },
  "combined": {
    "description": "Combined API provider",
    "requiresKey": false,
    "category": "finance",
    "methods": {
      "marketSnapshot": "Call combined.marketSnapshot method",
      "newsDigest": "Call combined.newsDigest method"
    }
  },
  "university": {
    "description": "University lookup (Hipolabs) — no key",
    "requiresKey": false,
    "category": "research",
    "methods": {
      "search": "Call university.search method",
      "byCountry": "Call university.byCountry method"
    }
  },
  "nutrition": {
    "description": "Food & nutrition data (Open Food Facts) — no key",
    "requiresKey": false,
    "category": "health",
    "methods": {
      "byBarcode": "Call nutrition.byBarcode method",
      "search": "Call nutrition.search method"
    }
  },
  "disasters": {
    "description": "Natural disaster & Earth event tracking (NASA EONET) — no key",
    "requiresKey": false,
    "category": "science",
    "methods": {
      "activeEvents": "Call disasters.activeEvents method",
      "categories": "Call disasters.categories method"
    }
  },
  "blockchain": {
    "description": "Blockchain stats (Bitcoin, Ethereum gas) — no key",
    "requiresKey": false,
    "category": "finance",
    "methods": {
      "bitcoinStats": "Call blockchain.bitcoinStats method",
      "bitcoinAddress": "Call blockchain.bitcoinAddress method",
      "ethGasPrice": "Call blockchain.ethGasPrice method"
    }
  },
  "webtools": {
    "description": "Favicon, screenshot, and link-preview metadata tools — no key",
    "requiresKey": false,
    "category": "developer",
    "methods": {
      "favicon": "Call webtools.favicon method",
      "screenshot": "Call webtools.screenshot method",
      "metadata": "Call webtools.metadata method"
    }
  },
  "worldbank": {
    "description": "World Bank economic indicators (GDP, population, etc.) — no key",
    "requiresKey": false,
    "category": "finance",
    "methods": {
      "indicator": "Call worldbank.indicator method",
      "population": "Call worldbank.population method",
      "gdp": "Call worldbank.gdp method"
    }
  },
  "smart": {
    "description": "Bemora's signature cross-provider auto-failover layer — never goes down because every category races multiple independent free providers with automatic fallback to stale cache",
    "requiresKey": false,
    "category": "meta",
    "methods": {
      "weather": "Call smart.weather({ city, units? }) — auto-failover: OpenWeatherMap (if keyed) -> wttr.in -> Open-Meteo -> stale cache",
      "news": "Call smart.news({ topic?, limit? }) — auto-failover: NewsAPI (if keyed) -> BBC/Al Jazeera/Google News RSS -> stale cache",
      "currency": "Call smart.currency({ base?, symbols? }) — auto-failover: frankfurter.app -> ExchangeRate-API (if keyed) -> stale cache",
      "cryptoPrice": "Call smart.cryptoPrice({ id, symbol?, currency? }) — auto-failover: CoinGecko -> Binance ticker -> stale cache",
      "ip": "Call smart.ip({ ip? }) — IP geolocation lookup with stale-cache safety net",
      "translate": "Call smart.translate({ text, from?, to }) — text translation with stale-cache safety net",
      "holidays": "Call smart.holidays({ country, year? }) — public holidays with stale-cache safety net",
      "weatherAggregate": "Call smart.weatherAggregate({ city }) — cross-checks temperature across every reachable provider and returns the average"
    }
  },
  "govspending": {
    "description": "US federal government spending data (USAspending.gov) — no key",
    "requiresKey": false,
    "category": "government",
    "methods": {
      "searchAwards": "Call govspending.searchAwards({ keyword?, startDate?, endDate?, limit? }) — search federal contract/grant awards",
      "agencySpending": "Call govspending.agencySpending({ fiscalYear? }) — top-level agency spending totals"
    }
  },
  "wikidata": {
    "description": "Wikidata structured knowledge graph — no key",
    "requiresKey": false,
    "category": "research",
    "methods": {
      "search": "Call wikidata.search({ query, language?, limit? }) — search entities by label",
      "getEntity": "Call wikidata.getEntity({ id, language? }) — fetch an entity's core facts by Q-id"
    }
  },
  "arxiv": {
    "description": "Academic paper search (arXiv) — no key",
    "requiresKey": false,
    "category": "research",
    "methods": {
      "search": "Call arxiv.search({ query, maxResults? }) — search papers, returns title/authors/summary/pdf link"
    }
  },
  "biodiversity": {
    "description": "Species and occurrence data (GBIF) — no key",
    "requiresKey": false,
    "category": "science",
    "methods": {
      "searchSpecies": "Call biodiversity.searchSpecies({ query, limit? }) — search the GBIF taxonomic backbone",
      "occurrences": "Call biodiversity.occurrences({ species, country?, limit? }) — recent sighting records"
    }
  },
  "scholarly": {
    "description": "Scholarly works and citations (OpenAlex + Crossref) — no key",
    "requiresKey": false,
    "category": "research",
    "methods": {
      "searchWorks": "Call scholarly.searchWorks({ query, limit? }) — search 250M+ works with citations",
      "getWork": "Call scholarly.getWork({ id }) — one work by OpenAlex ID or DOI",
      "crossrefSearch": "Call scholarly.crossrefSearch({ query, limit? }) — DOI metadata search",
      "doiMetadata": "Call scholarly.doiMetadata({ doi }) — metadata for one DOI"
    }
  },
  "registry": {
    "description": "Package registries and vulnerability intel (PyPI, npm, OSV.dev) — no key",
    "requiresKey": false,
    "category": "developer",
    "methods": {
      "pypiInfo": "Call registry.pypiInfo({ package }) — versions, deps, license for a PyPI package",
      "npmInfo": "Call registry.npmInfo({ package }) — version, deps, license for an npm package",
      "osvQuery": "Call registry.osvQuery({ ecosystem, package, version }) — known CVEs affecting a pinned version"
    }
  },
  "dns": {
    "description": "DNS-over-HTTPS lookups via Cloudflare + Google — no key",
    "requiresKey": false,
    "category": "developer",
    "methods": {
      "resolve": "Call dns.resolve({ name, type? }) — raw DoH record for any type",
      "a": "Call dns.a({ name }) — A records",
      "aaaa": "Call dns.aaaa({ name }) — AAAA (IPv6) records",
      "cname": "Call dns.cname({ name }) — CNAME records",
      "mx": "Call dns.mx({ name }) — mail exchange records",
      "txt": "Call dns.txt({ name }) — TXT records",
      "ns": "Call dns.ns({ name }) — nameserver records",
      "srv": "Call dns.srv({ name }) — SRV service records"
    }
  },
  "geocoding": {
    "description": "Place/name geocoding (Open-Meteo) — no key",
    "requiresKey": false,
    "category": "geo",
    "methods": {
      "search": "Call geocoding.search({ name, count?, language? }) — place name to coordinates"
    }
  },
  "earth": {
    "description": "Terrain, marine, flood, climate and historical weather (Open-Meteo) — no key",
    "requiresKey": false,
    "category": "science",
    "methods": {
      "elevation": "Call earth.elevation({ lat, lon }) — terrain elevation in metres",
      "marine": "Call earth.marine({ lat, lon }) — wave height/period and sea surface temperature",
      "flood": "Call earth.flood({ lat, lon, days? }) — river discharge forecast",
      "climate": "Call earth.climate({ lat, lon, startDate, endDate }) — climate model projections",
      "historical": "Call earth.historical({ lat, lon, startDate, endDate }) — historical weather observations"
    }
  },
  "metno": {
    "description": "MET Norway location forecast — no key",
    "requiresKey": false,
    "category": "weather",
    "methods": {
      "forecast": "Call metno.forecast({ lat, lon }) — compact 24h timeseries forecast"
    }
  },
  "nws": {
    "description": "US National Weather Service forecasts and alerts — no key",
    "requiresKey": false,
    "category": "weather",
    "methods": {
      "forecast": "Call nws.forecast({ lat, lon }) — NWS point forecast periods",
      "alerts": "Call nws.alerts({ area }) — active alerts for a state/area code"
    }
  },
  "water": {
    "description": "USGS real-time streamflow and water data — no key",
    "requiresKey": false,
    "category": "science",
    "methods": {
      "usgs": "Call water.usgs({ site, parameter?, period? }) — instantaneous USGS site values"
    }
  },
  "opensky": {
    "description": "OpenSky Network live aircraft state vectors — no key",
    "requiresKey": false,
    "category": "travel",
    "methods": {
      "states": "Call opensky.states({ bbox? }) — live aircraft positions worldwide or in a bounding box"
    }
  },
  "adsb": {
    "description": "Aircraft and flight-route lookup (ADSBDB) — no key",
    "requiresKey": false,
    "category": "travel",
    "methods": {
      "aircraft": "Call adsb.aircraft({ icao }) — aircraft details by ICAO 24-bit address",
      "callsign": "Call adsb.callsign({ callsign }) — flight route by callsign"
    }
  },
  "launches": {
    "description": "Rocket launch schedule (TheSpaceDevs Launch Library 2) — no key",
    "requiresKey": false,
    "category": "science",
    "methods": {
      "upcoming": "Call launches.upcoming({ limit? }) — upcoming launches",
      "previous": "Call launches.previous({ limit? }) — past launches",
      "byId": "Call launches.byId({ id }) — detailed launch by id"
    }
  },
  "eonet": {
    "description": "NASA EONET natural events (fires, volcanoes, storms) — no key",
    "requiresKey": false,
    "category": "science",
    "methods": {
      "events": "Call eonet.events({ limit? }) — latest natural events",
      "category": "Call eonet.category({ category, limit? }) — events in a category",
      "wildfires": "Call eonet.wildfires({ limit? }) — active wildfires",
      "volcanoes": "Call eonet.volcanoes({ limit? }) — active volcanoes",
      "storms": "Call eonet.storms({ limit? }) — severe storms"
    }
  },
  "biomed": {
    "description": "Biomedical literature and trials (PubMed, Europe PMC, ClinicalTrials.gov) — no key",
    "requiresKey": false,
    "category": "health",
    "methods": {
      "pubmedSearch": "Call biomed.pubmedSearch({ query, limit? }) — search PubMed via NCBI eutils",
      "pubmedSummary": "Call biomed.pubmedSummary({ ids }) — summaries for one or more PMIDs",
      "clinicalTrials": "Call biomed.clinicalTrials({ query, limit? }) — ClinicalTrials.gov v2 study search",
      "europePmc": "Call biomed.europePmc({ query, limit? }) — Europe PMC article search"
    }
  },
  "fda": {
    "description": "openFDA adverse events and recalls — no key",
    "requiresKey": false,
    "category": "health",
    "methods": {
      "drugEvents": "Call fda.drugEvents({ search?, limit? }) — drug adverse event reports",
      "foodRecalls": "Call fda.foodRecalls({ search?, limit? }) — food enforcement/recall reports",
      "deviceEvents": "Call fda.deviceEvents({ search?, limit? }) — medical device event (MDR) reports"
    }
  },
  "grammar": {
    "description": "LanguageTool grammar/spelling/style checking — no key",
    "requiresKey": false,
    "category": "language",
    "methods": {
      "check": "Call grammar.check({ text, language? }) — spelling, grammar and style matches for a text"
    }
  },
  "devto": {
    "description": "Dev.to developer articles and tags — no key",
    "requiresKey": false,
    "category": "developer",
    "methods": {
      "articles": "Call devto.articles({ tag?, page?, perPage? }) — developer articles",
      "byTag": "Call devto.byTag({ tag, perPage? }) — articles for a specific tag",
      "tags": "Call devto.tags({ perPage? }) — trending tags"
    }
  },
  "bluesky": {
    "description": "Bluesky public AppView (profiles, actors, feeds) — no key",
    "requiresKey": false,
    "category": "social",
    "methods": {
      "searchActors": "Call bluesky.searchActors({ query, limit? }) — search Bluesky actors",
      "profile": "Call bluesky.profile({ actor }) — a Bluesky profile by handle or DID",
      "authorFeed": "Call bluesky.authorFeed({ actor, limit? }) — recent posts for an actor"
    }
  },
  "lobsters": {
    "description": "Lobsters tech link aggregator — no key",
    "requiresKey": false,
    "category": "news",
    "methods": {
      "hottest": "Call lobsters.hottest() — hottest stories",
      "newest": "Call lobsters.newest() — newest stories",
      "active": "Call lobsters.active() — most active stories",
      "byTag": "Call lobsters.byTag({ tag }) — stories for a tag"
    }
  },
  "spacenews": {
    "description": "Spaceflight News API (articles, blogs, reports) — no key",
    "requiresKey": false,
    "category": "news",
    "methods": {
      "articles": "Call spacenews.articles({ limit?, search? }) — spaceflight news articles",
      "blogs": "Call spacenews.blogs({ limit? }) — spaceflight blog posts",
      "reports": "Call spacenews.reports({ limit? }) — spaceflight reports"
    }
  },
  "treasury": {
    "description": "US Treasury Fiscal Data (rates, debt, exchanges) — no key",
    "requiresKey": false,
    "category": "government",
    "methods": {
      "averageInterestRates": "Call treasury.averageInterestRates({ limit? }) — average interest rates on Treasury securities",
      "debtToPenny": "Call treasury.debtToPenny({ limit? }) — US national debt to the penny",
      "exchangeRates": "Call treasury.exchangeRates({ limit? }) — Treasury rates of exchange"
    }
  },
  "coinbase": {
    "description": "Coinbase spot prices and exchange rates — no key",
    "requiresKey": false,
    "category": "finance",
    "methods": {
      "spot": "Call coinbase.spot({ pair? }) — spot price for a trading pair",
      "exchangeRates": "Call coinbase.exchangeRates({ currency? }) — exchange rates for a base currency"
    }
  },
  "demographics": {
    "description": "Name-based gender, age and nationality prediction (Genderize/Agify/Nationalize) — no key",
    "requiresKey": false,
    "category": "ai",
    "methods": {
      "gender": "Call demographics.gender({ name }) — likely gender for a name",
      "age": "Call demographics.age({ name }) — likely age for a name",
      "nationality": "Call demographics.nationality({ name }) — likely nationality for a name"
    }
  },
  "poetry": {
    "description": "PoetryDB public-domain poetry — no key",
    "requiresKey": false,
    "category": "research",
    "methods": {
      "random": "Call poetry.random({ limit? }) — random poem(s)",
      "byAuthor": "Call poetry.byAuthor({ author, limit? }) — poems by author",
      "byTitle": "Call poetry.byTitle({ title }) — poems by title",
      "search": "Call poetry.search({ query, limit? }) — poems matching a line"
    }
  },
  "coinpaprika": {
    "description": "Coinpaprika crypto market data — no key",
    "requiresKey": false,
    "category": "finance",
    "methods": {
      "tickers": "Call coinpaprika.tickers({ limit? }) — top coins by market cap",
      "ticker": "Call coinpaprika.ticker({ id }) — single coin details",
      "global": "Call coinpaprika.global() — global crypto market stats",
      "search": "Call coinpaprika.search({ query }) — search coins",
      "exchanges": "Call coinpaprika.exchanges({ limit? }) — exchanges"
    }
  },
  "coinlore": {
    "description": "CoinLore crypto tickers and global stats — no key",
    "requiresKey": false,
    "category": "finance",
    "methods": {
      "tickers": "Call coinlore.tickers({ start?, limit? }) — coin tickers",
      "global": "Call coinlore.global() — global market stats",
      "coin": "Call coinlore.coin({ id }) — single coin"
    }
  },
  "kraken": {
    "description": "Kraken exchange public market data — no key",
    "requiresKey": false,
    "category": "finance",
    "methods": {
      "ticker": "Call kraken.ticker({ pair? }) — ticker for a pair",
      "ohlc": "Call kraken.ohlc({ pair?, interval? }) — OHLC candles",
      "trades": "Call kraken.trades({ pair?, count? }) — recent trades"
    }
  },
  "defillama": {
    "description": "DefiLlama DeFi TVL and token prices — no key",
    "requiresKey": false,
    "category": "finance",
    "methods": {
      "protocols": "Call defillama.protocols({ limit? }) — DeFi protocols by TVL",
      "protocol": "Call defillama.protocol({ slug }) — protocol details",
      "chains": "Call defillama.chains() — chain TVL list",
      "tvl": "Call defillama.tvl({ protocol }) — current TVL for a protocol",
      "prices": "Call defillama.prices({ coins }) — current token prices"
    }
  },
  "mempool": {
    "description": "mempool.space Bitcoin network data — no key",
    "requiresKey": false,
    "category": "finance",
    "methods": {
      "fees": "Call mempool.fees() — recommended fee rates",
      "blockHeight": "Call mempool.blockHeight() — current block height",
      "blocks": "Call mempool.blocks({ limit? }) — recent blocks",
      "difficultyAdjustment": "Call mempool.difficultyAdjustment() — difficulty retarget info",
      "mempool": "Call mempool.mempool() — mempool statistics"
    }
  },
  "blockchair": {
    "description": "Blockchair multi-chain block explorer — no key",
    "requiresKey": false,
    "category": "finance",
    "methods": {
      "stats": "Call blockchair.stats({ chain? }) — chain statistics",
      "address": "Call blockchair.address({ chain?, address }) — address summary",
      "transaction": "Call blockchair.transaction({ chain?, hash }) — transaction summary"
    }
  },
  "exchangerate": {
    "description": "ExchangeRate-API open endpoint — no key",
    "requiresKey": false,
    "category": "finance",
    "methods": {
      "latest": "Call exchangerate.latest({ base? }) — latest FX rates"
    }
  },
  "nbp": {
    "description": "National Bank of Poland exchange rates — no key",
    "requiresKey": false,
    "category": "finance",
    "methods": {
      "table": "Call nbp.table({ table? }) — exchange rate table",
      "rate": "Call nbp.rate({ code?, table? }) — rate for a currency",
      "gold": "Call nbp.gold() — NBP gold price"
    }
  },
  "imf": {
    "description": "IMF DataMapper macroeconomic data — no key",
    "requiresKey": false,
    "category": "finance",
    "methods": {
      "data": "Call imf.data({ indicator }) — all values for an indicator",
      "country": "Call imf.country({ indicator, country }) — indicator for a country",
      "indicators": "Call imf.indicators() — available indicators"
    }
  },
  "eurostat": {
    "description": "Eurostat European statistics — no key",
    "requiresKey": false,
    "category": "finance",
    "methods": {
      "dataset": "Call eurostat.dataset({ dataset, geo?, time? }) — dataset values",
      "gdp": "Call eurostat.gdp({ geo?, time? }) — GDP dataset"
    }
  },
  "aviationwx": {
    "description": "Aviation Weather Center METAR/TAF — no key",
    "requiresKey": false,
    "category": "weather",
    "methods": {
      "metar": "Call aviationwx.metar({ station? }) — current METAR",
      "taf": "Call aviationwx.taf({ station? }) — TAF forecast"
    }
  },
  "tides": {
    "description": "NOAA tides and currents — no key",
    "requiresKey": false,
    "category": "weather",
    "methods": {
      "waterLevel": "Call tides.waterLevel({ station?, units? }) — latest water level",
      "predictions": "Call tides.predictions({ station?, units?, date? }) — tide predictions",
      "stations": "Call tides.stations() — tide station list"
    }
  },
  "carbon": {
    "description": "UK Carbon Intensity energy mix — no key",
    "requiresKey": false,
    "category": "science",
    "methods": {
      "current": "Call carbon.current() — current carbon intensity",
      "forecast": "Call carbon.forecast() — 24h intensity forecast",
      "regional": "Call carbon.regional() — regional intensity",
      "generationMix": "Call carbon.generationMix() — current generation mix"
    }
  },
  "spaceweather": {
    "description": "NOAA SWPC space weather — no key",
    "requiresKey": false,
    "category": "science",
    "methods": {
      "kp": "Call spaceweather.kp() — planetary K-index",
      "solarWind": "Call spaceweather.solarWind() — solar wind plasma",
      "aurora": "Call spaceweather.aurora() — aurora forecast",
      "alerts": "Call spaceweather.alerts() — active space weather alerts"
    }
  },
  "citybikes": {
    "description": "CityBikes bike-share networks — no key",
    "requiresKey": false,
    "category": "travel",
    "methods": {
      "networks": "Call citybikes.networks({ limit? }) — bike-share networks",
      "network": "Call citybikes.network({ id }) — network stations"
    }
  },
  "transit": {
    "description": "VBB public transit (Berlin) — no key",
    "requiresKey": false,
    "category": "travel",
    "methods": {
      "locations": "Call transit.locations({ query, results? }) — search stops",
      "departures": "Call transit.departures({ stop, duration? }) — station departures",
      "journeys": "Call transit.journeys({ from, to }) — plan a journey"
    }
  },
  "tvmaze": {
    "description": "TVmaze TV show data — no key",
    "requiresKey": false,
    "category": "entertainment",
    "methods": {
      "search": "Call tvmaze.search({ query }) — search shows",
      "show": "Call tvmaze.show({ id }) — show details",
      "episodes": "Call tvmaze.episodes({ id }) — show episodes",
      "schedule": "Call tvmaze.schedule({ country?, date? }) — TV schedule",
      "people": "Call tvmaze.people({ query }) — search people"
    }
  },
  "deezer": {
    "description": "Deezer music catalog — no key",
    "requiresKey": false,
    "category": "entertainment",
    "methods": {
      "search": "Call deezer.search({ query, limit? }) — search tracks",
      "track": "Call deezer.track({ id }) — track details",
      "album": "Call deezer.album({ id }) — album details",
      "artist": "Call deezer.artist({ id }) — artist details",
      "chart": "Call deezer.chart() — top chart tracks"
    }
  },
  "anilist": {
    "description": "AniList anime and manga GraphQL — no key",
    "requiresKey": false,
    "category": "entertainment",
    "methods": {
      "search": "Call anilist.search({ query, perPage? }) — search anime",
      "anime": "Call anilist.anime({ id }) — anime details",
      "manga": "Call anilist.manga({ query, perPage? }) — search manga",
      "character": "Call anilist.character({ query, perPage? }) — search characters"
    }
  },
  "kitsu": {
    "description": "Kitsu anime catalog — no key",
    "requiresKey": false,
    "category": "entertainment",
    "methods": {
      "search": "Call kitsu.search({ query, limit? }) — search anime",
      "anime": "Call kitsu.anime({ id }) — anime details"
    }
  },
  "ghibli": {
    "description": "Studio Ghibli films — no key",
    "requiresKey": false,
    "category": "entertainment",
    "methods": {
      "films": "Call ghibli.films() — all films",
      "film": "Call ghibli.film({ id }) — film details",
      "people": "Call ghibli.people() — people"
    }
  },
  "pollinations": {
    "description": "Pollinations keyless AI text and image generation — no key",
    "requiresKey": false,
    "category": "ai",
    "methods": {
      "text": "Call pollinations.text({ prompt }) — generate text",
      "image": "Call pollinations.image({ prompt, width?, height? }) — image URL"
    }
  },
  "quickchart": {
    "description": "QuickChart chart image generator — no key",
    "requiresKey": false,
    "category": "utility",
    "methods": {
      "render": "Call quickchart.render({ chart, width?, height?, backgroundColor? }) — chart URL",
      "bar": "Call quickchart.bar({ labels, data, title? }) — bar chart URL",
      "line": "Call quickchart.line({ labels, data, title? }) — line chart URL",
      "pie": "Call quickchart.pie({ labels, data, title? }) — pie chart URL"
    }
  },
  "speech": {
    "description": "Google Translate text-to-speech — no key",
    "requiresKey": false,
    "category": "utility",
    "methods": {
      "tts": "Call speech.tts({ text, lang? }) — TTS audio URL",
      "voices": "Call speech.voices() — supported languages"
    }
  },
  "pubchem": {
    "description": "PubChem chemistry database — no key",
    "requiresKey": false,
    "category": "science",
    "methods": {
      "compound": "Call pubchem.compound({ name }) — compound by name",
      "compoundByCid": "Call pubchem.compoundByCid({ cid }) — compound by CID",
      "synonyms": "Call pubchem.synonyms({ name }) — compound synonyms"
    }
  },
  "rxnav": {
    "description": "NLM RxNav drug information — no key",
    "requiresKey": false,
    "category": "health",
    "methods": {
      "drugs": "Call rxnav.drugs({ name }) — drug concepts",
      "interactions": "Call rxnav.interactions({ rxcui }) — drug interactions"
    }
  },
  "uniprot": {
    "description": "UniProt protein database — no key",
    "requiresKey": false,
    "category": "science",
    "methods": {
      "search": "Call uniprot.search({ query, size? }) — search proteins",
      "entry": "Call uniprot.entry({ accession }) — protein entry"
    }
  },
  "ensembl": {
    "description": "Ensembl genome database — no key",
    "requiresKey": false,
    "category": "science",
    "methods": {
      "lookupSymbol": "Call ensembl.lookupSymbol({ symbol, species? }) — gene by symbol",
      "sequence": "Call ensembl.sequence({ id }) — nucleotide sequence",
      "xrefs": "Call ensembl.xrefs({ symbol, species? }) — external references"
    }
  },
  "gho": {
    "description": "WHO Global Health Observatory — no key",
    "requiresKey": false,
    "category": "health",
    "methods": {
      "indicators": "Call gho.indicators() — health indicators",
      "data": "Call gho.data({ indicator }) — indicator data",
      "country": "Call gho.country({ indicator, country }) — data for a country"
    }
  },
  "icd10": {
    "description": "NLM Clinical Tables ICD-10 lookup — no key",
    "requiresKey": false,
    "category": "health",
    "methods": {
      "search": "Call icd10.search({ terms, max? }) — search ICD-10 codes",
      "lookup": "Call icd10.lookup({ code }) — lookup an ICD-10 code"
    }
  },
  "exoplanet": {
    "description": "NASA Exoplanet Archive TAP — no key",
    "requiresKey": false,
    "category": "science",
    "methods": {
      "planets": "Call exoplanet.planets({ limit? }) — exoplanets",
      "planet": "Call exoplanet.planet({ name }) — exoplanet by name",
      "query": "Call exoplanet.query({ adql }) — raw ADQL query"
    }
  },
  "packages": {
    "description": "Language package registries — no key",
    "requiresKey": false,
    "category": "developer",
    "methods": {
      "crates": "Call packages.crates({ name }) — Rust crate",
      "packagist": "Call packages.packagist({ package }) — PHP package",
      "rubygems": "Call packages.rubygems({ name }) — Ruby gem",
      "maven": "Call packages.maven({ groupId, artifactId }) — Maven artifact",
      "nuget": "Call packages.nuget({ id }) — NuGet package",
      "dockerhub": "Call packages.dockerhub({ name? }) — Docker Hub repository",
      "homebrew": "Call packages.homebrew({ name }) — Homebrew formula",
      "goproxy": "Call packages.goproxy({ module }) — Go module versions"
    }
  },
  "certs": {
    "description": "crt.sh certificate transparency search — no key",
    "requiresKey": false,
    "category": "developer",
    "methods": {
      "search": "Call certs.search({ domain, limit? }) — TLS certificates for a domain"
    }
  },
  "httptool": {
    "description": "httpbin request inspection — no key",
    "requiresKey": false,
    "category": "developer",
    "methods": {
      "get": "Call httptool.get() — echo GET request",
      "headers": "Call httptool.headers() — echo headers",
      "ip": "Call httptool.ip() — caller IP",
      "uuid": "Call httptool.uuid() — random UUID"
    }
  },
  "photon": {
    "description": "Photon (Komoot) OpenStreetMap geocoding — no key",
    "requiresKey": false,
    "category": "geo",
    "methods": {
      "search": "Call photon.search({ query, limit? }) — geocode a place",
      "reverse": "Call photon.reverse({ lat, lon }) — reverse geocode"
    }
  },
  "postcodes": {
    "description": "UK Postcodes.io — no key",
    "requiresKey": false,
    "category": "geo",
    "methods": {
      "lookup": "Call postcodes.lookup({ postcode }) — UK postcode lookup",
      "reverse": "Call postcodes.reverse({ lat, lon }) — nearest postcode",
      "validate": "Call postcodes.validate({ postcode }) — validate a postcode",
      "random": "Call postcodes.random() — random postcode"
    }
  },
  "census": {
    "description": "US Census geocoder — no key",
    "requiresKey": false,
    "category": "geo",
    "methods": {
      "geocode": "Call census.geocode({ address }) — geocode a US address",
      "reverse": "Call census.reverse({ lat, lon }) — reverse geocode US coordinates"
    }
  },
  "archiveorg": {
    "description": "Internet Archive search and metadata — no key",
    "requiresKey": false,
    "category": "research",
    "methods": {
      "search": "Call archiveorg.search({ query, rows? }) — search archive.org",
      "metadata": "Call archiveorg.metadata({ identifier }) — item metadata"
    }
  },
  "gdacs": {
    "description": "GDACS global disaster alerts — no key",
    "requiresKey": false,
    "category": "news",
    "methods": {
      "events": "Call gdacs.events({ limit?, type? }) — active disaster alerts"
    }
  },
  "reader": {
    "description": "Readability and RSS readers — no key",
    "requiresKey": false,
    "category": "utility",
    "methods": {
      "article": "Call reader.article({ url }) — extract readable article text",
      "rssToJson": "Call reader.rssToJson({ url }) — convert an RSS feed to JSON"
    }
  },
  "statuspage": {
    "description": "Statuspage.io service status — no key",
    "requiresKey": false,
    "category": "developer",
    "methods": {
      "service": "Call statuspage.service({ service }) — current service status",
      "incidents": "Call statuspage.incidents({ service }) — recent incidents",
      "components": "Call statuspage.components({ service }) — component status"
    }
  },
  "macaddress": {
    "description": "MAC address vendor lookup — no key",
    "requiresKey": false,
    "category": "developer",
    "methods": {
      "lookup": "Call macaddress.lookup({ mac }) — vendor for a MAC address"
    }
  }
};

export default PROVIDER_INFO;