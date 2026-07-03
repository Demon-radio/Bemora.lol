const PROVIDER_INFO = {
  "weather": {
    "description": "Weather API provider",
    "requiresKey": true,
    "keyName": "BEMORA_WEATHER_KEY",
    "keyUrl": "https://openweathermap.org/api",
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
    "methods": {
      "fixtures": "Call football.fixtures method",
      "standings": "Call football.standings method",
      "teams": "Call football.teams method"
    }
  },
  "crypto": {
    "description": "Crypto API provider",
    "requiresKey": false,
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
    "methods": {
      "price": "Call gold.price method",
      "silver": "Call gold.silver method"
    }
  },
  "research": {
    "description": "Research API provider",
    "requiresKey": false,
    "methods": {
      "wikipedia": "Call research.wikipedia method",
      "article": "Call research.article method",
      "books": "Call research.books method"
    }
  },
  "location": {
    "description": "Location API provider",
    "requiresKey": false,
    "methods": {
      "geocode": "Call location.geocode method",
      "reverse": "Call location.reverse method",
      "distance": "Call location.distance method"
    }
  },
  "ip": {
    "description": "Ip API provider",
    "requiresKey": false,
    "methods": {
      "lookup": "Call ip.lookup method",
      "batchLookup": "Call ip.batchLookup method"
    }
  },
  "countries": {
    "description": "Countries API provider",
    "requiresKey": false,
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
    "methods": {
      "quote": "Call stocks.quote method",
      "search": "Call stocks.search method",
      "overview": "Call stocks.overview method"
    }
  },
  "music": {
    "description": "Music API provider",
    "requiresKey": false,
    "methods": {
      "artist": "Call music.artist method",
      "album": "Call music.album method",
      "itunes": "Call music.itunes method"
    }
  },
  "social": {
    "description": "Social API provider",
    "requiresKey": false,
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
    "methods": {
      "searchTracks": "Call spotify.searchTracks method",
      "getArtist": "Call spotify.getArtist method",
      "getArtistTopTracks": "Call spotify.getArtistTopTracks method"
    }
  },
  "stackexchange": {
    "description": "Stackexchange API provider",
    "requiresKey": false,
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
    "methods": {
      "getPlayerSummaries": "Call steam.getPlayerSummaries method",
      "getOwnedGames": "Call steam.getOwnedGames method",
      "searchApps": "Call steam.searchApps method"
    }
  },
  "animals": {
    "description": "Animals API provider",
    "requiresKey": false,
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
    "methods": {
      "search": "Call books.search method",
      "getById": "Call books.getById method",
      "random": "Call books.random method"
    }
  },
  "lyrics": {
    "description": "Lyrics API provider",
    "requiresKey": false,
    "methods": {
      "search": "Call lyrics.search method"
    }
  },
  "memes": {
    "description": "Memes API provider",
    "requiresKey": false,
    "methods": {
      "random": "Call memes.random method",
      "fromSubreddit": "Call memes.fromSubreddit method"
    }
  },
  "math": {
    "description": "Math API provider",
    "requiresKey": false,
    "methods": {
      "evaluate": "Call math.evaluate method",
      "randomFact": "Call math.randomFact method"
    }
  },
  "zodiac": {
    "description": "Zodiac API provider",
    "requiresKey": false,
    "methods": {
      "horoscope": "Call zodiac.horoscope method"
    }
  },
  "jobs": {
    "description": "Jobs API provider",
    "requiresKey": false,
    "methods": {
      "search": "Call jobs.search method"
    }
  },
  "science": {
    "description": "Science API provider",
    "requiresKey": false,
    "methods": {
      "nasaApod": "Call science.nasaApod method",
      "randomFact": "Call science.randomFact method"
    }
  },
  "basketball": {
    "description": "Basketball API provider",
    "requiresKey": false,
    "methods": {
      "nbaTeams": "Call basketball.nbaTeams method",
      "nbaGames": "Call basketball.nbaGames method",
      "nbaPlayer": "Call basketball.nbaPlayer method"
    }
  },
  "vehicles": {
    "description": "Vehicles API provider",
    "requiresKey": false,
    "methods": {
      "randomCar": "Call vehicles.randomCar method"
    }
  },
  "pets": {
    "description": "Pets API provider",
    "requiresKey": false,
    "methods": {
      "random": "Call pets.random method"
    }
  },
  "drinks": {
    "description": "Drinks API provider",
    "requiresKey": false,
    "methods": {
      "randomCocktail": "Call drinks.randomCocktail method",
      "searchCocktail": "Call drinks.searchCocktail method",
      "searchIngredient": "Call drinks.searchIngredient method"
    }
  },
  "geography": {
    "description": "Geography API provider",
    "requiresKey": false,
    "methods": {
      "countryInfo": "Call geography.countryInfo method",
      "allCountries": "Call geography.allCountries method",
      "capitalCity": "Call geography.capitalCity method"
    }
  },
  "comics": {
    "description": "Comics API provider",
    "requiresKey": false,
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
    "methods": {
      "search": "Call tv.search method",
      "details": "Call tv.details method",
      "trending": "Call tv.trending method"
    }
  },
  "baseball": {
    "description": "Baseball API provider",
    "requiresKey": false,
    "methods": {
      "mlbTeams": "Call baseball.mlbTeams method",
      "mlbSchedule": "Call baseball.mlbSchedule method"
    }
  },
  "hockey": {
    "description": "Hockey API provider",
    "requiresKey": false,
    "methods": {
      "nhlTeams": "Call hockey.nhlTeams method",
      "nhlPlayer": "Call hockey.nhlPlayer method"
    }
  },
  "finance": {
    "description": "Finance API provider",
    "requiresKey": false,
    "methods": {
      "stockQuote": "Call finance.stockQuote method",
      "cryptoPrice": "Call finance.cryptoPrice method"
    }
  },
  "literature": {
    "description": "Literature API provider",
    "requiresKey": false,
    "methods": {
      "randomQuote": "Call literature.randomQuote method",
      "searchQuotes": "Call literature.searchQuotes method"
    }
  },
  "wildlife": {
    "description": "Wildlife API provider",
    "requiresKey": false,
    "methods": {
      "randomFact": "Call wildlife.randomFact method"
    }
  },
  "politics": {
    "description": "Politics API provider",
    "requiresKey": false,
    "methods": {
      "presidents": "Call politics.presidents method"
    }
  },
  "language": {
    "description": "Language API provider",
    "requiresKey": false,
    "methods": {
      "detect": "Call language.detect method",
      "translate": "Call language.translate method"
    }
  },
  "law": {
    "description": "Law API provider",
    "requiresKey": false,
    "methods": {
      "search": "Call law.search method"
    }
  },
  "military": {
    "description": "Military API provider",
    "requiresKey": false,
    "methods": {
      "time": "Call military.time method"
    }
  },
  "advice": {
    "description": "Advice API provider",
    "requiresKey": false,
    "methods": {
      "random": "Call advice.random method",
      "search": "Call advice.search method"
    }
  },
  "dadjokes": {
    "description": "Dadjokes API provider",
    "requiresKey": false,
    "methods": {
      "random": "Call dadjokes.random method",
      "search": "Call dadjokes.search method"
    }
  },
  "kanye": {
    "description": "Kanye API provider",
    "requiresKey": false,
    "methods": {
      "random": "Call kanye.random method"
    }
  },
  "randomuser": {
    "description": "Randomuser API provider",
    "requiresKey": false,
    "methods": {
      "single": "Call randomuser.single method",
      "many": "Call randomuser.many method"
    }
  },
  "thesaurus": {
    "description": "Thesaurus API provider",
    "requiresKey": false,
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
    "methods": {
      "latest": "Call currencyHistory.latest method",
      "historical": "Call currencyHistory.historical method",
      "timeSeries": "Call currencyHistory.timeSeries method"
    }
  },
  "markdown": {
    "description": "Markdown API provider",
    "requiresKey": false,
    "methods": {
      "render": "Call markdown.render method",
      "renderGfm": "Call markdown.renderGfm method",
      "analyze": "Call markdown.analyze method"
    }
  },
  "techdb": {
    "description": "Techdb API provider",
    "requiresKey": false,
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
    "methods": {
      "status": "Call websites.status method",
      "detectTechStack": "Call websites.detectTechStack method",
      "getMeta": "Call websites.getMeta method"
    }
  },
  "fakedb": {
    "description": "Fakedb API provider",
    "requiresKey": false,
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
    "methods": {
      "randomVerse": "Call religion.randomVerse method",
      "getVerse": "Call religion.getVerse method"
    }
  },
  "islamic": {
    "description": "Islamic API provider",
    "requiresKey": false,
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
    "methods": {
      "apod": "Call spaceExtended.apod method",
      "marsPhotos": "Call spaceExtended.marsPhotos method",
      "nearEarthObjects": "Call spaceExtended.nearEarthObjects method",
      "issPosition": "Call spaceExtended.issPosition method"
    }
  },
  "pokemon": {
    "description": "Pokemon API provider",
    "requiresKey": false,
    "methods": {
      "get": "Call pokemon.get method",
      "ability": "Call pokemon.ability method",
      "species": "Call pokemon.species method",
      "random": "Call pokemon.random method"
    }
  },
  "rickmorty": {
    "description": "Rickmorty API provider",
    "requiresKey": false,
    "methods": {
      "character": "Call rickmorty.character method",
      "search": "Call rickmorty.search method",
      "location": "Call rickmorty.location method",
      "episode": "Call rickmorty.episode method",
      "random": "Call rickmorty.random method"
    }
  },
  "starwars": {
    "description": "Starwars API provider",
    "requiresKey": false,
    "methods": {
      "person": "Call starwars.person method",
      "people": "Call starwars.people method",
      "planet": "Call starwars.planet method",
      "starship": "Call starwars.starship method",
      "film": "Call starwars.film method"
    }
  },
  "harrypotter": {
    "description": "Harrypotter API provider",
    "requiresKey": false,
    "methods": {
      "characters": "Call harrypotter.characters method",
      "students": "Call harrypotter.students method",
      "staff": "Call harrypotter.staff method",
      "random": "Call harrypotter.random method"
    }
  },
  "covid": {
    "description": "Covid API provider",
    "requiresKey": false,
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
    "methods": {
      "recent": "Call earthquake.recent method",
      "byLocation": "Call earthquake.byLocation method",
      "biggestToday": "Call earthquake.biggestToday method"
    }
  },
  "airquality": {
    "description": "Airquality API provider",
    "requiresKey": false,
    "methods": {
      "current": "Call airquality.current method",
      "forecast": "Call airquality.forecast method",
      "classify": "Call airquality.classify method"
    }
  },
  "astronomy": {
    "description": "Astronomy API provider",
    "requiresKey": false,
    "methods": {
      "sunriseSunset": "Call astronomy.sunriseSunset method",
      "moonPhase": "Call astronomy.moonPhase method"
    }
  },
  "postal": {
    "description": "Postal API provider",
    "requiresKey": false,
    "methods": {
      "lookup": "Call postal.lookup method"
    }
  },
  "predict": {
    "description": "Predict API provider",
    "requiresKey": false,
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
    "methods": {
      "search": "Call brewery.search method",
      "random": "Call brewery.random method",
      "getById": "Call brewery.getById method"
    }
  },
  "chucknorris": {
    "description": "Chucknorris API provider",
    "requiresKey": false,
    "methods": {
      "random": "Call chucknorris.random method",
      "categories": "Call chucknorris.categories method",
      "search": "Call chucknorris.search method"
    }
  },
  "bored": {
    "description": "Bored API provider",
    "requiresKey": false,
    "methods": {
      "activity": "Call bored.activity method"
    }
  },
  "sportsdb": {
    "description": "Sportsdb API provider",
    "requiresKey": false,
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
    "methods": {
      "whois": "Call domain.whois method",
      "dnsRecords": "Call domain.dnsRecords method",
      "resolveIp": "Call domain.resolveIp method"
    }
  },
  "placeholder": {
    "description": "Placeholder API provider",
    "requiresKey": false,
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
    "methods": {
      "usAlerts": "Call weatheralerts.usAlerts method",
      "pointForecast": "Call weatheralerts.pointForecast method"
    }
  },
  "coinWizard": {
    "description": "CoinWizard API provider",
    "requiresKey": false,
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
    "methods": {
      "binance": "Call realtime.binance method",
      "kraken": "Call realtime.kraken method",
      "getPrice": "Call realtime.getPrice method"
    }
  },
  "smart": {
    "description": "Smart API provider",
    "requiresKey": false,
    "methods": {
      "weather": "Call smart.weather method",
      "news": "Call smart.news method",
      "crypto": "Call smart.crypto method",
      "currency": "Call smart.currency method",
      "weatherAggregate": "Call smart.weatherAggregate method"
    }
  },
  "prayer": {
    "description": "Prayer API provider",
    "requiresKey": false,
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
  "fun": {
    "description": "Fun API provider",
    "requiresKey": false,
    "methods": {
      "joke": "Call fun.joke method",
      "jokes": "Call fun.jokes method",
      "catFact": "Call fun.catFact method",
      "catFacts": "Call fun.catFacts method",
      "catImage": "Call fun.catImage method",
      "dogImage": "Call fun.dogImage method",
      "dogBreeds": "Call fun.dogBreeds method",
      "numberFact": "Call fun.numberFact method",
      "uselessFact": "Call fun.uselessFact method",
      "fakeUser": "Call fun.fakeUser method",
      "affirmation": "Call fun.affirmation method",
      "advice": "Call fun.advice method"
    }
  },
  "flights": {
    "description": "Flights API provider",
    "requiresKey": true,
    "keyName": "BEMORA_FLIGHTS_KEY",
    "keyUrl": "https://aviationstack.com/signup",
    "methods": {
      "live": "Call flights.live method",
      "airport": "Call flights.airport method",
      "airline": "Call flights.airline method"
    }
  },
  "art": {
    "description": "Art API provider",
    "requiresKey": false,
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
    "methods": {
      "search": "Call podcasts.search method",
      "episodes": "Call podcasts.episodes method",
      "index": "Call podcasts.index method"
    }
  },
  "medical": {
    "description": "Medical API provider",
    "requiresKey": false,
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
    "methods": {
      "weather": "Call enriched.weather method",
      "compareCities": "Call enriched.compareCities method"
    }
  },
  "combined": {
    "description": "Combined API provider",
    "requiresKey": false,
    "methods": {
      "marketSnapshot": "Call combined.marketSnapshot method",
      "newsDigest": "Call combined.newsDigest method"
    }
  }
};

export default PROVIDER_INFO;