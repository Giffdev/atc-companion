export interface AirportReference {
  icao: string;
  faa: string;
  iata?: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  aliases?: string[];
  runways?: string[];
}

export const AIRPORT_REFERENCES: AirportReference[] = [
  { icao: "38W", faa: "38W", name: "Lynden Airport", city: "Lynden", state: "WA", latitude: 48.9554, longitude: -122.4538 },
  { icao: "K67L", faa: "67L", iata: "MFH", name: "Mesquite Airport", city: "Mesquite", state: "NV", latitude: 36.833105, longitude: -114.055928 },
  { icao: "K76F", faa: "76F", name: "Van Zandt County Regional Airport", city: "Wills Point", state: "TX", latitude: 32.681499, longitude: -95.9841 },
  { icao: "K79J", faa: "79J", name: "South Alabama Regional At Bill Benton Field Airport", city: "Andalusia/Opp", state: "AL", latitude: 31.3088, longitude: -86.393799 },
  { icao: "KABE", faa: "ABE", iata: "ABE", name: "Lehigh Valley International Airport", city: "Allentown/Bethlehem", state: "PA", latitude: 40.651773, longitude: -75.442797 },
  { icao: "KABI", faa: "ABI", iata: "ABI", name: "Abilene Regional Airport", city: "Abilene", state: "TX", latitude: 32.411301, longitude: -99.6819 },
  { icao: "KABQ", faa: "ABQ", iata: "ABQ", name: "Albuquerque International Sunport", city: "Albuquerque", state: "NM", latitude: 35.039976, longitude: -106.608925 },
  { icao: "KABR", faa: "ABR", iata: "ABR", name: "Aberdeen Regional Airport", city: "Aberdeen", state: "SD", latitude: 45.4491, longitude: -98.421799 },
  { icao: "KABY", faa: "ABY", iata: "ABY", name: "Southwest Georgia Regional Airport", city: "Albany", state: "GA", latitude: 31.532946, longitude: -84.196215 },
  { icao: "KACK", faa: "ACK", iata: "ACK", name: "Nantucket Memorial Airport", city: "Nantucket", state: "MA", latitude: 41.253101, longitude: -70.060204 },
  { icao: "KACT", faa: "ACT", iata: "ACT", name: "Waco Regional Airport", city: "Waco", state: "TX", latitude: 31.6113, longitude: -97.230499 },
  { icao: "KACV", faa: "ACV", iata: "ACV", name: "California Redwood Coast-Humboldt County Airport", city: "Arcata/Eureka", state: "CA", latitude: 40.978101, longitude: -124.109 },
  { icao: "KACY", faa: "ACY", iata: "ACY", name: "Atlantic City International Airport", city: "Atlantic City", state: "NJ", latitude: 39.456201, longitude: -74.577511 },
  { icao: "KADH", faa: "ADH", iata: "ADT", name: "Ada Regional Airport", city: "Ada", state: "OK", latitude: 34.805214, longitude: -96.671988 },
  { icao: "KADS", faa: "ADS", iata: "ADS", name: "Addison Airport", city: "Addison", state: "TX", latitude: 32.9686, longitude: -96.8364 },
  { icao: "KADW", faa: "ADW", iata: "ADW", name: "Joint Base Andrews", city: "Camp Springs", state: "MD", latitude: 38.810799, longitude: -76.866997 },
  { icao: "KAEG", faa: "AEG", name: "Double Eagle II Airport", city: "Albuquerque", state: "NM", latitude: 35.145199, longitude: -106.794998 },
  { icao: "KAEX", faa: "AEX", iata: "AEX", name: "Alexandria International Airport", city: "Alexandria", state: "LA", latitude: 31.325828, longitude: -92.546702 },
  { icao: "KAFW", faa: "AFW", iata: "AFW", name: "Perot Field/Fort Worth Alliance Airport", city: "Fort Worth", state: "TX", latitude: 32.99044, longitude: -97.31947 },
  { icao: "KAGC", faa: "AGC", iata: "AGC", name: "Allegheny County Airport", city: "Pittsburgh", state: "PA", latitude: 40.354401, longitude: -79.930199 },
  { icao: "KAGS", faa: "AGS", iata: "AGS", name: "Augusta Regional At Bush Field", city: "Augusta", state: "GA", latitude: 33.3699, longitude: -81.9645 },
  { icao: "KAHN", faa: "AHN", iata: "AHN", name: "Athens Ben Epps Airport", city: "Athens", state: "GA", latitude: 33.948842, longitude: -83.325634 },
  { icao: "KAIA", faa: "AIA", iata: "AIA", name: "Alliance Municipal Airport", city: "Alliance", state: "NE", latitude: 42.052543, longitude: -102.803965 },
  { icao: "KAKH", faa: "AKH", name: "Gastonia Municipal Airport", city: "Gastonia", state: "NC", latitude: 35.2027, longitude: -81.15 },
  { icao: "KAKR", faa: "AKR", iata: "AKC", name: "Akron Fulton International Airport", city: "Akron", state: "OH", latitude: 41.037355, longitude: -81.46784 },
  { icao: "KALB", faa: "ALB", iata: "ALB", name: "Albany International Airport", city: "Albany", state: "NY", latitude: 42.748299, longitude: -73.801697 },
  { icao: "KALI", faa: "ALI", iata: "ALI", name: "Alice International Airport", city: "Alice", state: "TX", latitude: 27.7409, longitude: -98.026901 },
  { icao: "KALM", faa: "ALM", iata: "ALM", name: "Alamogordo White Sands Regional Airport", city: "Alamogordo", state: "NM", latitude: 32.837818, longitude: -105.993149 },
  { icao: "KALN", faa: "ALN", iata: "ALN", name: "St Louis Regional Airport", city: "Alton/St Louis", state: "IL", latitude: 38.890301, longitude: -90.045998 },
  { icao: "KALO", faa: "ALO", iata: "ALO", name: "Waterloo Regional Airport", city: "Waterloo", state: "IA", latitude: 42.557098, longitude: -92.400299 },
  { icao: "KALS", faa: "ALS", iata: "ALS", name: "San Luis Valley Regional Airport/Bergman Field", city: "Alamosa", state: "CO", latitude: 37.434898, longitude: -105.866997 },
  { icao: "KALW", faa: "ALW", iata: "ALW", name: "Walla Walla Regional Airport", city: "Walla Walla", state: "WA", latitude: 46.094898, longitude: -118.288002 },
  { icao: "KAMA", faa: "AMA", iata: "AMA", name: "Rick Husband Amarillo International Airport", city: "Amarillo", state: "TX", latitude: 35.217857, longitude: -101.706444 },
  { icao: "KANB", faa: "ANB", iata: "ANB", name: "Anniston Regional Airport", city: "Anniston", state: "AL", latitude: 33.5882, longitude: -85.8581 },
  { icao: "KAND", faa: "AND", iata: "AND", name: "Anderson Regional Airport", city: "Anderson", state: "SC", latitude: 34.494598, longitude: -82.709396 },
  { icao: "KANE", faa: "ANE", iata: "ANE", name: "Anoka County-Blaine Airport", city: "Blaine", state: "MN", latitude: 45.145, longitude: -93.2114 },
  { icao: "KANP", faa: "ANP", name: "Lee Airport", city: "Annapolis", state: "MD", latitude: 38.9428, longitude: -76.5684 },
  { icao: "KAOO", faa: "AOO", iata: "AOO", name: "Altoona Blair County Airport", city: "Altoona", state: "PA", latitude: 40.296398, longitude: -78.32 },
  { icao: "KAPA", faa: "APA", iata: "APA", name: "Centennial Airport", city: "Denver", state: "CO", latitude: 39.570099, longitude: -104.848999 },
  { icao: "KAPF", faa: "APF", iata: "APF", name: "Naples Municipal Airport", city: "Naples", state: "FL", latitude: 26.152599, longitude: -81.775299 },
  { icao: "KAPG", faa: "APG", iata: "APG", name: "Phillips Army Air Field", city: "Aberdeen", state: "MD", latitude: 39.466202, longitude: -76.1688 },
  { icao: "KAPN", faa: "APN", iata: "APN", name: "Alpena County Regional Airport", city: "Alpena", state: "MI", latitude: 45.078098, longitude: -83.560303 },
  { icao: "KARA", faa: "ARA", iata: "ARA", name: "Acadiana Regional Airport", city: "New Iberia", state: "LA", latitude: 30.0378, longitude: -91.883904 },
  { icao: "KARR", faa: "ARR", name: "Aurora Municipal Airport", city: "Aurora", state: "IL", latitude: 41.7719, longitude: -88.4757 },
  { icao: "KART", faa: "ART", iata: "ART", name: "Watertown International Airport", city: "Watertown", state: "NY", latitude: 43.991901, longitude: -76.021698 },
  { icao: "KASE", faa: "ASE", iata: "ASE", name: "Aspen-Pitkin County Airport (Sardy Field)", city: "Aspen", state: "CO", latitude: 39.223202, longitude: -106.869003 },
  { icao: "KAST", faa: "AST", iata: "AST", name: "Astoria Regional Airport", city: "Astoria", state: "OR", latitude: 46.158001, longitude: -123.878998 },
  { icao: "KATL", faa: "ATL", iata: "ATL", name: "Hartsfield-Jackson Atlanta Intl", city: "Atlanta", state: "GA", latitude: 33.6367, longitude: -84.428101, aliases: ["Atlanta Approach", "A80"] },
  { icao: "KATW", faa: "ATW", iata: "ATW", name: "Appleton International Airport", city: "Appleton", state: "WI", latitude: 44.258515, longitude: -88.519 },
  { icao: "KATY", faa: "ATY", iata: "ATY", name: "Watertown Regional Airport", city: "Watertown", state: "SD", latitude: 44.914001, longitude: -97.154701 },
  { icao: "KAUG", faa: "AUG", iata: "AUG", name: "Augusta State Airport", city: "Augusta", state: "ME", latitude: 44.320599, longitude: -69.797302 },
  { icao: "KAUS", faa: "AUS", iata: "AUS", name: "Austin Bergstrom International Airport", city: "Austin", state: "TX", latitude: 30.197535, longitude: -97.662015 },
  { icao: "KAUW", faa: "AUW", iata: "AUW", name: "Wausau Downtown Airport", city: "Wausau", state: "WI", latitude: 44.926201, longitude: -89.626602 },
  { icao: "KAVL", faa: "AVL", iata: "AVL", name: "Asheville Regional Airport", city: "Asheville", state: "NC", latitude: 35.435488, longitude: -82.541853 },
  { icao: "KAVP", faa: "AVP", iata: "AVP", name: "Wilkes-Barre/Scranton International Airport", city: "Wilkes-Barre/Scranton", state: "PA", latitude: 41.337064, longitude: -75.724232 },
  { icao: "KAWO", faa: "AWO", name: "Arlington Municipal Airport", city: "Arlington", state: "WA", latitude: 48.161448, longitude: -122.158442 },
  { icao: "KAXN", faa: "AXN", iata: "AXN", name: "Chandler Field", city: "Alexandria", state: "MN", latitude: 45.866299, longitude: -95.394699 },
  { icao: "KAZO", faa: "AZO", iata: "AZO", name: "Kalamazoo/Battle Creek International Airport", city: "Kalamazoo", state: "MI", latitude: 42.232105, longitude: -85.549637 },
  { icao: "KBAB", faa: "BAB", iata: "BAB", name: "Beale Air Force Base", city: "Beale Air Force Base", state: "CA", latitude: 39.136101, longitude: -121.436996 },
  { icao: "KBAD", faa: "BAD", iata: "BAD", name: "Barksdale Air Force Base", city: "Bossier City", state: "LA", latitude: 32.501801, longitude: -93.662697 },
  { icao: "KBAF", faa: "BAF", iata: "BAF", name: "Westfield-Barnes Regional Airport", city: "Westfield", state: "MA", latitude: 42.157799, longitude: -72.715599 },
  { icao: "KBAK", faa: "BAK", iata: "CLU", name: "Columbus Municipal Airport", city: "Columbus", state: "IN", latitude: 39.262386, longitude: -85.895576 },
  { icao: "KBAZ", faa: "BAZ", name: "New Braunfels National Airport", city: "New Braunfels", state: "TX", latitude: 29.7045, longitude: -98.042198 },
  { icao: "KBBD", faa: "BBD", iata: "BBD", name: "Curtis Field", city: "Brady", state: "TX", latitude: 31.178931, longitude: -99.324732 },
  { icao: "KBBG", faa: "BBG", iata: "BKG", name: "Branson Airport", city: "Branson", state: "MO", latitude: 36.532082, longitude: -93.200544 },
  { icao: "KBCE", faa: "BCE", iata: "BCE", name: "Bryce Canyon Airport", city: "Bryce Canyon", state: "UT", latitude: 37.706402, longitude: -112.144997 },
  { icao: "KBCT", faa: "BCT", iata: "BCT", name: "Boca Raton Airport", city: "Boca Raton", state: "FL", latitude: 26.3785, longitude: -80.107697 },
  { icao: "KBDE", faa: "BDE", iata: "BDE", name: "Baudette International Airport", city: "Baudette", state: "MN", latitude: 48.728401, longitude: -94.612198 },
  { icao: "KBDL", faa: "BDL", iata: "BDL", name: "Bradley International Airport", city: "Hartford", state: "CT", latitude: 41.938555, longitude: -72.688016 },
  { icao: "KBDR", faa: "BDR", iata: "BDR", name: "Igor I Sikorsky Memorial Airport", city: "Bridgeport", state: "CT", latitude: 41.163502, longitude: -73.126198 },
  { icao: "KBED", faa: "BED", iata: "BED", name: "Laurence G Hanscom Field", city: "Bedford", state: "MA", latitude: 42.470001, longitude: -71.289001 },
  { icao: "KBFD", faa: "BFD", iata: "BFD", name: "Bradford Regional Airport", city: "Bradford", state: "PA", latitude: 41.803101, longitude: -78.640099 },
  { icao: "KBFF", faa: "BFF", iata: "BFF", name: "Western Neb. Rgnl/William B. Heilig Airport", city: "Scottsbluff", state: "NE", latitude: 41.874001, longitude: -103.596001 },
  { icao: "KBFI", faa: "BFI", iata: "BFI", name: "Boeing Field/King County Intl", city: "Seattle", state: "WA", latitude: 47.527042, longitude: -122.29995, aliases: ["Boeing Field", "King County International", "King County International Airport"], runways: ["14L", "14R", "32L", "32R"] },
  { icao: "KBFL", faa: "BFL", iata: "BFL", name: "Meadows Field", city: "Bakersfield", state: "CA", latitude: 35.433601, longitude: -119.056999 },
  { icao: "KBFM", faa: "BFM", iata: "BFM", name: "Mobile Downtown Airport", city: "Mobile", state: "AL", latitude: 30.626801, longitude: -88.0681 },
  { icao: "KBGM", faa: "BGM", iata: "BGM", name: "Greater Binghamton/Edwin A Link field", city: "Binghamton", state: "NY", latitude: 42.208698, longitude: -75.979797 },
  { icao: "KBGR", faa: "BGR", iata: "BGR", name: "Bangor International Airport", city: "Bangor", state: "ME", latitude: 44.806364, longitude: -68.826668 },
  { icao: "KBHB", faa: "BHB", iata: "BHB", name: "Hancock County-Bar Harbor Airport", city: "Bar Harbor", state: "ME", latitude: 44.450001, longitude: -68.361504 },
  { icao: "KBHM", faa: "BHM", iata: "BHM", name: "Birmingham-Shuttlesworth International Airport", city: "Birmingham", state: "AL", latitude: 33.562877, longitude: -86.750712 },
  { icao: "KBIF", faa: "BIF", iata: "BIF", name: "Biggs Army Air Field (Fort Bliss)", city: "Fort Bliss/El Paso", state: "TX", latitude: 31.849501, longitude: -106.379997 },
  { icao: "KBIH", faa: "BIH", iata: "BIH", name: "Eastern Sierra Regional Airport", city: "Bishop", state: "CA", latitude: 37.3731, longitude: -118.363998 },
  { icao: "KBIL", faa: "BIL", iata: "BIL", name: "Billings Logan International Airport", city: "Billings", state: "MT", latitude: 45.808932, longitude: -108.541242 },
  { icao: "KBIS", faa: "BIS", iata: "BIS", name: "Bismarck Municipal Airport", city: "Bismarck", state: "ND", latitude: 46.772734, longitude: -100.746874 },
  { icao: "KBIX", faa: "BIX", iata: "BIX", name: "Keesler Air Force Base", city: "Biloxi", state: "MS", latitude: 30.4104, longitude: -88.9244 },
  { icao: "KBJC", faa: "BJC", iata: "BJC", name: "Rocky Mountain Metropolitan Airport", city: "Denver", state: "CO", latitude: 39.908798, longitude: -105.116997 },
  { icao: "KBJI", faa: "BJI", iata: "BJI", name: "Bemidji Regional Airport", city: "Bemidji", state: "MN", latitude: 47.509399, longitude: -94.933701 },
  { icao: "KBKE", faa: "BKE", iata: "BKE", name: "Baker City Municipal Airport", city: "Baker City", state: "OR", latitude: 44.837299, longitude: -117.808998 },
  { icao: "KBKF", faa: "BKF", iata: "BFK", name: "Buckley Space Force Base", city: "Aurora", state: "CO", latitude: 39.701698, longitude: -104.751999 },
  { icao: "KBKL", faa: "BKL", iata: "BKL", name: "Burke Lakefront Airport", city: "Cleveland", state: "OH", latitude: 41.517502, longitude: -81.683296 },
  { icao: "KBKW", faa: "BKW", iata: "BKW", name: "Raleigh County Memorial Airport", city: "Beaver", state: "WV", latitude: 37.7873, longitude: -81.124199 },
  { icao: "KBLF", faa: "BLF", iata: "BLF", name: "Mercer County Airport", city: "Bluefield", state: "WV", latitude: 37.295799, longitude: -81.207703 },
  { icao: "KBLH", faa: "BLH", iata: "BLH", name: "Blythe Airport", city: "Blythe", state: "CA", latitude: 33.619202, longitude: -114.717003 },
  { icao: "KBLI", faa: "BLI", iata: "BLI", name: "Bellingham International Airport", city: "Bellingham", state: "WA", latitude: 48.792801, longitude: -122.538002 },
  { icao: "KBLV", faa: "BLV", iata: "BLV", name: "Scott AFB/Midamerica Airport", city: "Belleville", state: "IL", latitude: 38.5452, longitude: -89.835197 },
  { icao: "KBMG", faa: "BMG", iata: "BMG", name: "Monroe County Airport", city: "Bloomington", state: "IN", latitude: 39.146, longitude: -86.616699 },
  { icao: "KBMI", faa: "BMI", iata: "BMI", name: "Central Illinois Regional Airport at Bloomington-Normal", city: "Bloomington/Normal", state: "IL", latitude: 40.4771, longitude: -88.915901 },
  { icao: "KBNA", faa: "BNA", iata: "BNA", name: "Nashville International Airport", city: "Nashville", state: "TN", latitude: 36.1245, longitude: -86.6782 },
  { icao: "KBNO", faa: "BNO", iata: "BNO", name: "Burns Municipal Airport", city: "Burns", state: "OR", latitude: 43.590463, longitude: -118.955154 },
  { icao: "KBOI", faa: "BOI", iata: "BOI", name: "Boise Air Terminal/Gowen Field", city: "Boise", state: "ID", latitude: 43.5644, longitude: -116.223 },
  { icao: "KBOS", faa: "BOS", iata: "BOS", name: "Boston Logan Intl", city: "Boston", state: "MA", latitude: 42.36197, longitude: -71.0079, aliases: ["Boston Approach", "A90"] },
  { icao: "KBPI", faa: "BPI", iata: "BPI", name: "Miley Memorial Field", city: "Big Piney", state: "WY", latitude: 42.585098, longitude: -110.111 },
  { icao: "KBPK", faa: "BPK", iata: "WMH", name: "Ozark Regional Airport", city: "Mountain Home", state: "AR", latitude: 36.3689, longitude: -92.470497 },
  { icao: "KBPT", faa: "BPT", iata: "BPT", name: "Jack Brooks Regional Airport", city: "Beaumont/Port Arthur", state: "TX", latitude: 29.9508, longitude: -94.020699 },
  { icao: "KBQK", faa: "BQK", iata: "BQK", name: "Brunswick Golden Isles Airport", city: "Brunswick", state: "GA", latitude: 31.258801, longitude: -81.466499 },
  { icao: "KBRD", faa: "BRD", iata: "BRD", name: "Brainerd Lakes Regional Airport", city: "Brainerd", state: "MN", latitude: 46.402861, longitude: -94.129727 },
  { icao: "KBRL", faa: "BRL", iata: "BRL", name: "Southeast Iowa Regional Airport", city: "Burlington", state: "IA", latitude: 40.783199, longitude: -91.125504 },
  { icao: "KBRO", faa: "BRO", iata: "BRO", name: "Brownsville South Padre Island International Airport", city: "Brownsville", state: "TX", latitude: 25.907238, longitude: -97.425235 },
  { icao: "KBTL", faa: "BTL", iata: "BTL", name: "Battle Creek Executive Airport at Kellogg Field", city: "Battle Creek", state: "MI", latitude: 42.307301, longitude: -85.251503 },
  { icao: "KBTM", faa: "BTM", iata: "BTM", name: "Bert Mooney Airport", city: "Butte", state: "MT", latitude: 45.9548, longitude: -112.497002 },
  { icao: "KBTP", faa: "BTP", name: "Pittsburgh-Butler Regional Airport", city: "Butler", state: "PA", latitude: 40.7769, longitude: -79.9497 },
  { icao: "KBTR", faa: "BTR", iata: "BTR", name: "Baton Rouge Metropolitan Airport", city: "Baton Rouge", state: "LA", latitude: 30.533199, longitude: -91.149597 },
  { icao: "KBTV", faa: "BTV", iata: "BTV", name: "Patrick Leahy Burlington International Airport", city: "Burlington", state: "VT", latitude: 44.471901, longitude: -73.153297 },
  { icao: "KBUF", faa: "BUF", iata: "BUF", name: "Buffalo Niagara International Airport", city: "Buffalo", state: "NY", latitude: 42.940498, longitude: -78.732201 },
  { icao: "KBUR", faa: "BUR", iata: "BUR", name: "Hollywood Burbank/Bob Hope Airport", city: "Burbank", state: "CA", latitude: 34.202834, longitude: -118.35805 },
  { icao: "KBUY", faa: "BUY", name: "Burlington-Alamance Regional Airport", city: "Burlington", state: "NC", latitude: 36.0486, longitude: -79.4749 },
  { icao: "KBVI", faa: "BVI", iata: "BFP", name: "Beaver County Airport", city: "Beaver Falls", state: "PA", latitude: 40.772499, longitude: -80.391403 },
  { icao: "KBVU", faa: "BVU", iata: "BLD", name: "Boulder City Municipal Airport", city: "Boulder City", state: "NV", latitude: 35.947161, longitude: -114.858799 },
  { icao: "KBVY", faa: "BVY", iata: "BVY", name: "Beverly Regional Airport", city: "Beverly / Danvers", state: "MA", latitude: 42.584202, longitude: -70.916496 },
  { icao: "KBWG", faa: "BWG", iata: "BWG", name: "Bowling Green Warren County Regional Airport", city: "Bowling Green", state: "KY", latitude: 36.9645, longitude: -86.419701 },
  { icao: "KBWI", faa: "BWI", iata: "BWI", name: "Baltimore/Washington International Thurgood Marshall Airport", city: "Baltimore", state: "MD", latitude: 39.1754, longitude: -76.668297 },
  { icao: "KBXM", faa: "BXM", iata: "NHZ", name: "Brunswick Executive Airport", city: "Brunswick", state: "ME", latitude: 43.8922, longitude: -69.938599 },
  { icao: "KBYH", faa: "BYH", iata: "BYH", name: "Arkansas International Airport", city: "Blytheville", state: "AR", latitude: 35.964298, longitude: -89.944 },
  { icao: "KBYI", faa: "BYI", iata: "BYI", name: "Burley Municipal Airport", city: "Burley", state: "ID", latitude: 42.542599, longitude: -113.772003 },
  { icao: "KBYS", faa: "BYS", iata: "BYS", name: "Bicycle Lake Army Air Field", city: "Fort Irwin/Barstow", state: "CA", latitude: 35.280499, longitude: -116.629997 },
  { icao: "KBZN", faa: "BZN", iata: "BZN", name: "Bozeman Yellowstone International Airport", city: "Bozeman", state: "MT", latitude: 45.778853, longitude: -111.153711 },
  { icao: "KCAE", faa: "CAE", iata: "CAE", name: "Columbia Metropolitan Airport", city: "Columbia", state: "SC", latitude: 33.938172, longitude: -81.123022 },
  { icao: "KCAK", faa: "CAK", iata: "CAK", name: "Akron Canton Regional Airport", city: "Akron", state: "OH", latitude: 40.9161, longitude: -81.4422 },
  { icao: "KCAR", faa: "CAR", iata: "CAR", name: "Caribou Municipal Airport", city: "Caribou", state: "ME", latitude: 46.871498, longitude: -68.017899 },
  { icao: "KCBM", faa: "CBM", iata: "CBM", name: "Columbus Air Force Base", city: "Columbus", state: "MS", latitude: 33.643799, longitude: -88.443802 },
  { icao: "KCCR", faa: "CCR", iata: "CCR", name: "Buchanan Field", city: "Concord", state: "CA", latitude: 37.9897, longitude: -122.056999 },
  { icao: "KCCY", faa: "CCY", iata: "CCY", name: "Northeast Iowa Regional Airport", city: "Charles City", state: "IA", latitude: 43.072601, longitude: -92.610802 },
  { icao: "KCDC", faa: "CDC", iata: "CDC", name: "Cedar City Regional Airport", city: "Cedar City", state: "UT", latitude: 37.701, longitude: -113.098999 },
  { icao: "KCDR", faa: "CDR", iata: "CDR", name: "Chadron Municipal Airport", city: "Chadron", state: "NE", latitude: 42.837601, longitude: -103.095001 },
  { icao: "KCDS", faa: "CDS", iata: "CDS", name: "Childress Municipal Airport", city: "Childress", state: "TX", latitude: 34.4338, longitude: -100.288002 },
  { icao: "KCEC", faa: "CEC", iata: "CEC", name: "Jack Mc Namara Field Airport", city: "Crescent City", state: "CA", latitude: 41.778929, longitude: -124.236403 },
  { icao: "KCEF", faa: "CEF", iata: "CEF", name: "Westover Metropolitan Airport / Westover Air Reserve Base", city: "Chicopee", state: "MA", latitude: 42.194, longitude: -72.534798 },
  { icao: "KCEW", faa: "CEW", iata: "CEW", name: "Bob Sikes Airport", city: "Crestview", state: "FL", latitude: 30.778799, longitude: -86.522102 },
  { icao: "KCEZ", faa: "CEZ", iata: "CEZ", name: "Cortez Municipal Airport", city: "Cortez", state: "CO", latitude: 37.303001, longitude: -108.627998 },
  { icao: "KCGF", faa: "CGF", iata: "CGF", name: "Cuyahoga County Airport", city: "Cleveland", state: "OH", latitude: 41.565102, longitude: -81.486397 },
  { icao: "KCGI", faa: "CGI", iata: "CGI", name: "Cape Girardeau Regional Airport", city: "Cape Girardeau", state: "MO", latitude: 37.2253, longitude: -89.570801 },
  { icao: "KCHA", faa: "CHA", iata: "CHA", name: "Chattanooga Metropolitan Airport (Lovell Field)", city: "Chattanooga", state: "TN", latitude: 35.035301, longitude: -85.203796 },
  { icao: "KCHO", faa: "CHO", iata: "CHO", name: "Charlottesville Albemarle Airport", city: "Charlottesville", state: "VA", latitude: 38.138599, longitude: -78.452904 },
  { icao: "KCHS", faa: "CHS", iata: "CHS", name: "Charleston International Airport", city: "Charleston", state: "SC", latitude: 32.896159, longitude: -80.038151 },
  { icao: "KCID", faa: "CID", iata: "CID", name: "The Eastern Iowa Airport", city: "Cedar Rapids", state: "IA", latitude: 41.884701, longitude: -91.7108 },
  { icao: "KCIU", faa: "CIU", iata: "CIU", name: "Chippewa County International Airport", city: "Kincheloe", state: "MI", latitude: 46.242038, longitude: -84.462082 },
  { icao: "KCKB", faa: "CKB", iata: "CKB", name: "North Central West Virginia Airport", city: "Bridgeport", state: "WV", latitude: 39.2966, longitude: -80.228104 },
  { icao: "KCLE", faa: "CLE", iata: "CLE", name: "Cleveland Hopkins International Airport", city: "Cleveland", state: "OH", latitude: 41.411701, longitude: -81.8498 },
  { icao: "KCLL", faa: "CLL", iata: "CLL", name: "Easterwood Field", city: "College Station", state: "TX", latitude: 30.5886, longitude: -96.3638 },
  { icao: "KCLM", faa: "CLM", iata: "CLM", name: "William R Fairchild International Airport", city: "Port Angeles", state: "WA", latitude: 48.120201, longitude: -123.5 },
  { icao: "KCLT", faa: "CLT", iata: "CLT", name: "Charlotte Douglas International Airport", city: "Charlotte", state: "NC", latitude: 35.214001, longitude: -80.9431 },
  { icao: "KCMA", faa: "CMA", name: "Camarillo International Airport", city: "Camarillo", state: "CA", latitude: 34.213699, longitude: -119.094002 },
  { icao: "KCMH", faa: "CMH", iata: "CMH", name: "John Glenn Columbus International Airport", city: "Columbus", state: "OH", latitude: 39.998001, longitude: -82.891899 },
  { icao: "KCMI", faa: "CMI", iata: "CMI", name: "University of Illinois Willard Airport", city: "Savoy", state: "IL", latitude: 40.039819, longitude: -88.276249 },
  { icao: "KCMX", faa: "CMX", iata: "CMX", name: "Houghton County Memorial Airport", city: "Hancock", state: "MI", latitude: 47.1684, longitude: -88.489098 },
  { icao: "KCNM", faa: "CNM", iata: "CNM", name: "Cavern City Air Terminal", city: "Carlsbad", state: "NM", latitude: 32.337502, longitude: -104.263 },
  { icao: "KCNU", faa: "CNU", iata: "CNU", name: "Chanute Martin Johnson Airport", city: "Chanute", state: "KS", latitude: 37.668173, longitude: -95.486727 },
  { icao: "KCNY", faa: "CNY", iata: "CNY", name: "Canyonlands Regional Airport", city: "Moab", state: "UT", latitude: 38.755001, longitude: -109.754997 },
  { icao: "KCOD", faa: "COD", iata: "COD", name: "Yellowstone Regional Airport", city: "Cody", state: "WY", latitude: 44.520199, longitude: -109.024002 },
  { icao: "KCOE", faa: "COE", iata: "COE", name: "Coeur D'Alene Airport - Pappy Boyington Field", city: "Coeur d'Alene", state: "ID", latitude: 47.7743, longitude: -116.82 },
  { icao: "KCOF", faa: "COF", iata: "COF", name: "Patrick Space Force Base", city: "Cocoa Beach", state: "FL", latitude: 28.2349, longitude: -80.6101 },
  { icao: "KCON", faa: "CON", iata: "CON", name: "Concord Municipal Airport", city: "Concord", state: "NH", latitude: 43.202702, longitude: -71.502296 },
  { icao: "KCOS", faa: "COS", iata: "COS", name: "City of Colorado Springs Municipal Airport", city: "Colorado Springs", state: "CO", latitude: 38.805801, longitude: -104.700996 },
  { icao: "KCOU", faa: "COU", iata: "COU", name: "Columbia Regional Airport", city: "Columbia", state: "MO", latitude: 38.8181, longitude: -92.219597 },
  { icao: "KCPR", faa: "CPR", iata: "CPR", name: "Casper-Natrona County International Airport", city: "Casper", state: "WY", latitude: 42.907381, longitude: -106.461609 },
  { icao: "KCPS", faa: "CPS", iata: "CPS", name: "St. Louis Downtown Airport", city: "Cahokia", state: "IL", latitude: 38.5707, longitude: -90.1562 },
  { icao: "KCRE", faa: "CRE", iata: "CRE", name: "Grand Strand Airport", city: "North Myrtle Beach", state: "SC", latitude: 33.811699, longitude: -78.7239 },
  { icao: "KCRG", faa: "CRG", iata: "CRG", name: "Jacksonville Executive at Craig Airport", city: "Jacksonville", state: "FL", latitude: 30.3363, longitude: -81.514397 },
  { icao: "KCRP", faa: "CRP", iata: "CRP", name: "Corpus Christi International Airport", city: "Corpus Christi", state: "TX", latitude: 27.770399, longitude: -97.501198 },
  { icao: "KCRQ", faa: "CRQ", iata: "CLD", name: "McClellan-Palomar Airport", city: "Carlsbad", state: "CA", latitude: 33.1283, longitude: -117.279999 },
  { icao: "KCRW", faa: "CRW", iata: "CRW", name: "Yeager Airport", city: "Charleston", state: "WV", latitude: 38.3731, longitude: -81.593201 },
  { icao: "KCSG", faa: "CSG", iata: "CSG", name: "Columbus Airport", city: "Columbus", state: "GA", latitude: 32.516415, longitude: -84.939602 },
  { icao: "KCSV", faa: "CSV", iata: "CSV", name: "Crossville Memorial Airport Whitson Field", city: "Crossville", state: "TN", latitude: 35.95131, longitude: -85.08499 },
  { icao: "KCTB", faa: "CTB", iata: "CTB", name: "Cut Bank International Airport", city: "Cut Bank", state: "MT", latitude: 48.608657, longitude: -112.378183 },
  { icao: "KCUB", faa: "CUB", iata: "CUB", name: "Jim Hamilton L.B. Owens Airport", city: "Columbia", state: "SC", latitude: 33.970501, longitude: -80.995201 },
  { icao: "KCVG", faa: "CVG", iata: "CVG", name: "Cincinnati Northern Kentucky International Airport", city: "Cincinnati / Covington", state: "KY", latitude: 39.048801, longitude: -84.667801 },
  { icao: "KCVN", faa: "CVN", iata: "CVN", name: "Clovis Municipal Airport", city: "Clovis", state: "NM", latitude: 34.426594, longitude: -103.078794 },
  { icao: "KCVO", faa: "CVO", iata: "CVO", name: "Corvallis Municipal Airport", city: "Corvallis", state: "OR", latitude: 44.4972, longitude: -123.290001 },
  { icao: "KCVS", faa: "CVS", iata: "CVS", name: "Cannon Air Force Base", city: "Clovis", state: "NM", latitude: 34.382801, longitude: -103.321999 },
  { icao: "KCWA", faa: "CWA", iata: "CWA", name: "Central Wisconsin Airport", city: "Mosinee", state: "WI", latitude: 44.777448, longitude: -89.670238 },
  { icao: "KCXO", faa: "CXO", iata: "CXO", name: "Conroe-North Houston Regional Airport", city: "Houston", state: "TX", latitude: 30.351801, longitude: -95.414497 },
  { icao: "KCXP", faa: "CXP", iata: "CSN", name: "Carson Airport", city: "Carson City", state: "NV", latitude: 39.194331, longitude: -119.734312 },
  { icao: "KCYS", faa: "CYS", iata: "CYS", name: "Cheyenne Regional Jerry Olson Field", city: "Cheyenne", state: "WY", latitude: 41.155701, longitude: -104.811997 },
  { icao: "KDAA", faa: "DAA", iata: "DAA", name: "Davison Army Air Field", city: "Fort Belvoir", state: "VA", latitude: 38.715, longitude: -77.181 },
  { icao: "KDAB", faa: "DAB", iata: "DAB", name: "Daytona Beach International Airport", city: "Daytona Beach", state: "FL", latitude: 29.18255, longitude: -81.059464 },
  { icao: "KDAG", faa: "DAG", iata: "DAG", name: "Barstow Daggett Airport", city: "Daggett", state: "CA", latitude: 34.853699, longitude: -116.787003 },
  { icao: "KDAL", faa: "DAL", iata: "DAL", name: "Dallas Love Field", city: "Dallas", state: "TX", latitude: 32.844776, longitude: -96.847653 },
  { icao: "KDAN", faa: "DAN", iata: "DAN", name: "Danville Regional Airport", city: "Danville", state: "VA", latitude: 36.572899, longitude: -79.336098 },
  { icao: "KDAY", faa: "DAY", iata: "DAY", name: "James M. Cox Dayton International Airport", city: "Dayton", state: "OH", latitude: 39.902401, longitude: -84.219398 },
  { icao: "KDBQ", faa: "DBQ", iata: "DBQ", name: "Dubuque Regional Airport", city: "Dubuque", state: "IA", latitude: 42.402, longitude: -90.709503 },
  { icao: "KDCA", faa: "DCA", iata: "DCA", name: "Ronald Reagan Washington National", city: "Washington", state: "DC", latitude: 38.8521, longitude: -77.037697, aliases: ["Potomac Approach", "Potomac"] },
  { icao: "KDDC", faa: "DDC", iata: "DDC", name: "Dodge City Regional Airport", city: "Dodge City", state: "KS", latitude: 37.763401, longitude: -99.965599 },
  { icao: "KDEC", faa: "DEC", iata: "DEC", name: "Decatur Airport", city: "Decatur", state: "IL", latitude: 39.834599, longitude: -88.8657 },
  { icao: "KDEN", faa: "DEN", iata: "DEN", name: "Denver Intl", city: "Denver", state: "CO", latitude: 39.860027, longitude: -104.673792, aliases: ["Denver Approach", "Denver International", "Denver International Airport", "D01"] },
  { icao: "KDET", faa: "DET", iata: "DET", name: "Coleman A. Young Municipal Airport", city: "Detroit", state: "MI", latitude: 42.409199, longitude: -83.009903 },
  { icao: "KDEW", faa: "DEW", name: "Deer Park Airport", city: "Deer Park", state: "WA", latitude: 47.9686, longitude: -117.4267 },
  { icao: "KDFW", faa: "DFW", iata: "DFW", name: "Dallas/Fort Worth Intl", city: "Dallas-Fort Worth", state: "TX", latitude: 32.896801, longitude: -97.038002, aliases: ["Dallas Approach", "D10"] },
  { icao: "KDHN", faa: "DHN", iata: "DHN", name: "Dothan Regional Airport", city: "Dothan", state: "AL", latitude: 31.321301, longitude: -85.4496 },
  { icao: "KDHT", faa: "DHT", iata: "DHT", name: "Dalhart Municipal Airport", city: "Dalhart", state: "TX", latitude: 36.022598, longitude: -102.546997 },
  { icao: "KDIK", faa: "DIK", iata: "DIK", name: "Dickinson Theodore Roosevelt Regional Airport", city: "Dickinson", state: "ND", latitude: 46.797533, longitude: -102.801905 },
  { icao: "KDLF", faa: "DLF", iata: "DLF", name: "Laughlin Air Force Base", city: "Del Rio", state: "TX", latitude: 29.359501, longitude: -100.778002 },
  { icao: "KDLH", faa: "DLH", iata: "DLH", name: "Duluth International Airport", city: "Duluth", state: "MN", latitude: 46.841873, longitude: -92.198746 },
  { icao: "KDLS", faa: "DLS", iata: "DLS", name: "Columbia Gorge Regional Airport", city: "Dallesport / The Dalles", state: "OR", latitude: 45.620979, longitude: -121.170777 },
  { icao: "KDMA", faa: "DMA", iata: "DMA", name: "Davis Monthan Air Force Base", city: "Tucson", state: "AZ", latitude: 32.1665, longitude: -110.883003 },
  { icao: "KDMN", faa: "DMN", iata: "DMN", name: "Deming Municipal Airport", city: "Deming", state: "NM", latitude: 32.262299, longitude: -107.721001 },
  { icao: "KDNL", faa: "DNL", iata: "DNL", name: "Daniel Field", city: "Augusta", state: "GA", latitude: 33.466499, longitude: -82.039398 },
  { icao: "KDOV", faa: "DOV", iata: "DOV", name: "Dover Civil Air Terminal/Dover Air Force Base", city: "Dover", state: "DE", latitude: 39.129501, longitude: -75.466003 },
  { icao: "KDPA", faa: "DPA", iata: "DPA", name: "Dupage Airport", city: "Chicago/West Chicago", state: "IL", latitude: 41.907799, longitude: -88.248596 },
  { icao: "KDRA", faa: "NV65", iata: "DRA", name: "Desert Rock Airport", city: "Mercury", state: "NV", latitude: 36.6194, longitude: -116.032997 },
  { icao: "KDRI", faa: "DRI", iata: "DRI", name: "Beauregard Regional Airport", city: "DeRidder", state: "LA", latitude: 30.831699, longitude: -93.339897 },
  { icao: "KDRO", faa: "DRO", iata: "DRO", name: "Durango La Plata County Airport", city: "Durango", state: "CO", latitude: 37.151501, longitude: -107.753998 },
  { icao: "KDRT", faa: "DRT", iata: "DRT", name: "Del Rio International Airport", city: "Del Rio", state: "TX", latitude: 29.374201, longitude: -100.927002 },
  { icao: "KDSM", faa: "DSM", iata: "DSM", name: "Des Moines International Airport", city: "Des Moines", state: "IA", latitude: 41.534027, longitude: -93.656719 },
  { icao: "KDTS", faa: "DTS", iata: "DSI", name: "Destin Executive Airport", city: "Destin", state: "FL", latitude: 30.400101, longitude: -86.471497 },
  { icao: "KDTW", faa: "DTW", iata: "DTW", name: "Detroit Metropolitan Wayne County Airport", city: "Detroit", state: "MI", latitude: 42.21377, longitude: -83.353786 },
  { icao: "KDUA", faa: "DUA", iata: "DUA", name: "Durant Regional Airport - Eaker Field", city: "Durant", state: "OK", latitude: 33.939675, longitude: -96.395072 },
  { icao: "KDUG", faa: "DUG", iata: "DUG", name: "Bisbee Douglas International Airport", city: "Douglas Bisbee", state: "AZ", latitude: 31.464139, longitude: -109.60456 },
  { icao: "KDUJ", faa: "DUJ", iata: "DUJ", name: "DuBois Regional Airport", city: "Dubois", state: "PA", latitude: 41.178299, longitude: -78.898697 },
  { icao: "KDVL", faa: "DVL", iata: "DVL", name: "Devils Lake Regional Airport", city: "Devils Lake", state: "ND", latitude: 48.115454, longitude: -98.908796 },
  { icao: "KDVT", faa: "DVT", iata: "DVT", name: "Phoenix Deer Valley Airport", city: "Phoenix", state: "AZ", latitude: 33.6883, longitude: -112.0825 },
  { icao: "KDWH", faa: "DWH", name: "David Wayne Hooks Memorial Airport", city: "Spring", state: "TX", latitude: 30.0618, longitude: -95.5528 },
  { icao: "KDXR", faa: "DXR", iata: "DXR", name: "Danbury Municipal Airport", city: "Danbury", state: "CT", latitude: 41.371656, longitude: -73.482227 },
  { icao: "KDYS", faa: "DYS", iata: "DYS", name: "Dyess Air Force Base", city: "Abilene", state: "TX", latitude: 32.420799, longitude: -99.854599 },
  { icao: "KEAR", faa: "EAR", iata: "EAR", name: "Kearney Regional Airport", city: "Kearney", state: "NE", latitude: 40.727001, longitude: -99.006798 },
  { icao: "KEAT", faa: "EAT", iata: "EAT", name: "Pangborn Memorial Airport", city: "Wenatchee", state: "WA", latitude: 47.398899, longitude: -120.207001 },
  { icao: "KEAU", faa: "EAU", iata: "EAU", name: "Chippewa Valley Regional Airport", city: "Eau Claire", state: "WI", latitude: 44.865799, longitude: -91.484299 },
  { icao: "KECG", faa: "ECG", iata: "ECG", name: "Elizabeth City Regional Airport & Coast Guard Air Station", city: "Elizabeth City", state: "NC", latitude: 36.260601, longitude: -76.174599 },
  { icao: "KECP", faa: "ECP", iata: "ECP", name: "Northwest Florida Beaches International Airport", city: "Panama City Beach", state: "FL", latitude: 30.357106, longitude: -85.795414 },
  { icao: "KEDC", faa: "EDC", name: "Austin Executive Airport", city: "Pflugerville", state: "TX", latitude: 30.398049, longitude: -97.566909 },
  { icao: "KEDW", faa: "EDW", iata: "EDW", name: "Edwards Air Force Base", city: "Edwards", state: "CA", latitude: 34.910781, longitude: -117.886391 },
  { icao: "KEED", faa: "EED", iata: "EED", name: "Needles Airport", city: "Needles", state: "CA", latitude: 34.7663, longitude: -114.623001 },
  { icao: "KEEN", faa: "EEN", iata: "EEN", name: "Dillant Hopkins Airport", city: "Keene", state: "NH", latitude: 42.898399, longitude: -72.270798 },
  { icao: "KEET", faa: "EET", name: "Shelby County Airport", city: "Alabaster", state: "AL", latitude: 33.176998, longitude: -86.782799 },
  { icao: "KEFD", faa: "EFD", iata: "EFD", name: "Ellington Airport", city: "Houston", state: "TX", latitude: 29.6073, longitude: -95.158798 },
  { icao: "KEGE", faa: "EGE", iata: "EGE", name: "Eagle County Regional Airport", city: "Eagle", state: "CO", latitude: 39.642601, longitude: -106.917999 },
  { icao: "KEGI", faa: "EGI", iata: "EGI", name: "Duke Field", city: "Crestview", state: "FL", latitude: 30.6504, longitude: -86.522903 },
  { icao: "KEIK", faa: "EIK", name: "Erie Municipal Airport", city: "Erie", state: "CO", latitude: 40.0102, longitude: -105.0478 },
  { icao: "KEKA", faa: "EKA", iata: "EKA", name: "Murray Field", city: "Eureka", state: "CA", latitude: 40.803398, longitude: -124.112999 },
  { icao: "KEKN", faa: "EKN", iata: "EKN", name: "Elkins-Randolph County Regional Airport", city: "Elkins", state: "WV", latitude: 38.889759, longitude: -79.857651 },
  { icao: "KEKO", faa: "EKO", iata: "EKO", name: "Elko Regional Airport", city: "Elko", state: "NV", latitude: 40.824902, longitude: -115.792 },
  { icao: "KELD", faa: "ELD", iata: "ELD", name: "South Arkansas Regional Airport at Goodwin Field", city: "El Dorado", state: "AR", latitude: 33.221001, longitude: -92.813301 },
  { icao: "KELM", faa: "ELM", iata: "ELM", name: "Elmira Corning Regional Airport", city: "Elmira/Corning", state: "NY", latitude: 42.159901, longitude: -76.891602 },
  { icao: "KELO", faa: "ELO", iata: "LYU", name: "Ely Municipal Airport", city: "Ely", state: "MN", latitude: 47.824501, longitude: -91.830704 },
  { icao: "KELP", faa: "ELP", iata: "ELP", name: "El Paso International Airport", city: "El Paso", state: "TX", latitude: 31.809908, longitude: -106.375607 },
  { icao: "KELY", faa: "ELY", iata: "ELY", name: "Ely Airport Yelland Field", city: "Ely", state: "NV", latitude: 39.299702, longitude: -114.842003 },
  { icao: "KEND", faa: "END", iata: "END", name: "Vance Air Force Base", city: "Enid", state: "OK", latitude: 36.339199, longitude: -97.916496 },
  { icao: "KENV", faa: "ENV", iata: "ENV", name: "Wendover Airport", city: "Wendover", state: "UT", latitude: 40.7187, longitude: -114.030998 },
  { icao: "KENW", faa: "ENW", iata: "ENW", name: "Kenosha Regional Airport", city: "Kenosha", state: "WI", latitude: 42.595699, longitude: -87.927803 },
  { icao: "KERI", faa: "ERI", iata: "ERI", name: "Erie International Tom Ridge Field", city: "Erie", state: "PA", latitude: 42.083127, longitude: -80.173867 },
  { icao: "KESC", faa: "ESC", iata: "ESC", name: "Delta County Airport", city: "Escanaba", state: "MI", latitude: 45.723199, longitude: -87.088623 },
  { icao: "KESF", faa: "ESF", iata: "ESF", name: "Esler Army Airfield / Esler Regional Airport", city: "Alexandria", state: "LA", latitude: 31.394266, longitude: -92.294082 },
  { icao: "KEUG", faa: "EUG", iata: "EUG", name: "Eugene Airport", city: "Eugene", state: "OR", latitude: 44.124599, longitude: -123.211998 },
  { icao: "KEUL", faa: "EUL", name: "Caldwell Industrial Airport", city: "Caldwell", state: "ID", latitude: 43.6427, longitude: -116.6363 },
  { icao: "KEVV", faa: "EVV", iata: "EVV", name: "Evansville Regional Airport", city: "Evansville", state: "IN", latitude: 38.036999, longitude: -87.532402 },
  { icao: "KEVW", faa: "EVW", iata: "EVW", name: "Evanston-Uinta County Airport-Burns Field", city: "Evanston", state: "WY", latitude: 41.274799, longitude: -111.035004 },
  { icao: "KEWB", faa: "EWB", iata: "EWB", name: "New Bedford Regional Airport", city: "New Bedford", state: "MA", latitude: 41.676102, longitude: -70.956902 },
  { icao: "KEWN", faa: "EWN", iata: "EWN", name: "Coastal Carolina Regional Airport", city: "New Bern", state: "NC", latitude: 35.073002, longitude: -77.0429 },
  { icao: "KEWR", faa: "EWR", iata: "EWR", name: "Newark Liberty Intl", city: "Newark", state: "NJ", latitude: 40.6894, longitude: -74.170545 },
  { icao: "KEXX", faa: "EXX", name: "Davidson County Airport", city: "Lexington", state: "NC", latitude: 35.7811, longitude: -80.3039 },
  { icao: "KEYE", faa: "EYE", iata: "EYE", name: "Eagle Creek Airpark", city: "Indianapolis", state: "IN", latitude: 39.8308, longitude: -86.2944 },
  { icao: "KEYW", faa: "EYW", iata: "EYW", name: "Key West International Airport", city: "Key West", state: "FL", latitude: 24.556119, longitude: -81.759579 },
  { icao: "KFAF", faa: "FAF", iata: "FAF", name: "Felker Army Air Field", city: "Newport News (Fort Eustis)", state: "VA", latitude: 37.1325, longitude: -76.608803 },
  { icao: "KFAR", faa: "FAR", iata: "FAR", name: "Hector International Airport", city: "Fargo", state: "ND", latitude: 46.9207, longitude: -96.815804 },
  { icao: "KFAT", faa: "FAT", iata: "FAT", name: "Fresno Yosemite International Airport", city: "Fresno", state: "CA", latitude: 36.775767, longitude: -119.718018 },
  { icao: "KFAY", faa: "FAY", iata: "FAY", name: "Fayetteville Regional Airport - Grannis Field", city: "Fayetteville", state: "NC", latitude: 34.991199, longitude: -78.880302 },
  { icao: "KFBG", faa: "FBG", iata: "FBG", name: "Simmons Army Air Field", city: "Fort Bragg", state: "NC", latitude: 35.131802, longitude: -78.936699 },
  { icao: "KFCM", faa: "FCM", iata: "FCM", name: "Flying Cloud Airport", city: "Eden Prairie", state: "MN", latitude: 44.8272, longitude: -93.4571 },
  { icao: "KFCS", faa: "FCS", iata: "FCS", name: "Butts AAF (Fort Carson) Air Field", city: "Fort Carson", state: "CO", latitude: 38.678398, longitude: -104.757004 },
  { icao: "KFDY", faa: "FDY", iata: "FDY", name: "Findlay Airport", city: "Findlay", state: "OH", latitude: 41.0135, longitude: -83.668701 },
  { icao: "KFFO", faa: "FFO", iata: "FFO", name: "Wright-Patterson Air Force Base", city: "Dayton", state: "OH", latitude: 39.826099, longitude: -84.048302 },
  { icao: "KFFZ", faa: "FFZ", name: "Falcon Field", city: "Mesa", state: "AZ", latitude: 33.4608, longitude: -111.7281 },
  { icao: "KFHR", faa: "FHR", iata: "FRD", name: "Friday Harbor Airport", city: "Friday Harbor", state: "WA", latitude: 48.523654, longitude: -123.024645 },
  { icao: "W39", faa: "W39", name: "Roche Harbor Airport", city: "Roche Harbor", state: "WA", latitude: 48.6128, longitude: -123.1582, aliases: ["Roche Harbor"] },
  { icao: "KFHU", faa: "FHU", iata: "FHU", name: "Sierra Vista Municipal Airport / Libby Army Air Field", city: "Fort Huachuca / Sierra Vista", state: "AZ", latitude: 31.587383, longitude: -110.348225 },
  { icao: "KFKL", faa: "FKL", iata: "FKL", name: "Venango Regional Airport", city: "Franklin", state: "PA", latitude: 41.377899, longitude: -79.860397 },
  { icao: "KFLG", faa: "FLG", iata: "FLG", name: "Flagstaff Pulliam Airport", city: "Flagstaff", state: "AZ", latitude: 35.139757, longitude: -111.669826 },
  { icao: "KFLL", faa: "FLL", iata: "FLL", name: "Fort Lauderdale Hollywood International Airport", city: "Fort Lauderdale", state: "FL", latitude: 26.072599, longitude: -80.152702 },
  { icao: "KFLO", faa: "FLO", iata: "FLO", name: "Florence Regional Airport", city: "Florence", state: "SC", latitude: 34.185398, longitude: -79.7239 },
  { icao: "KFME", faa: "FME", iata: "FME", name: "Fort Meade Executive Airport", city: "Fort Meade(Odenton)", state: "MD", latitude: 39.0854, longitude: -76.759399 },
  { icao: "KFMN", faa: "FMN", iata: "FMN", name: "Four Corners Regional Airport", city: "Farmington", state: "NM", latitude: 36.741199, longitude: -108.230003 },
  { icao: "KFMY", faa: "FMY", iata: "FMY", name: "Page Field", city: "Fort Myers", state: "FL", latitude: 26.586599, longitude: -81.863297 },
  { icao: "KFNL", faa: "FNL", iata: "FNL", name: "Northern Colorado Regional Airport", city: "Loveland", state: "CO", latitude: 40.44969, longitude: -105.011272 },
  { icao: "KFNT", faa: "FNT", iata: "FNT", name: "Bishop International Airport", city: "Flint", state: "MI", latitude: 42.969294, longitude: -83.743355 },
  { icao: "KFOD", faa: "FOD", iata: "FOD", name: "Fort Dodge Regional Airport", city: "Fort Dodge", state: "IA", latitude: 42.552624, longitude: -94.191237 },
  { icao: "KFOE", faa: "FOE", iata: "FOE", name: "Topeka Regional Airport", city: "Topeka", state: "KS", latitude: 38.950901, longitude: -95.663597 },
  { icao: "KFPR", faa: "FPR", iata: "FPR", name: "Treasure Coast International Airport", city: "Fort Pierce", state: "FL", latitude: 27.4951, longitude: -80.368301 },
  { icao: "KFRG", faa: "FRG", iata: "FRG", name: "Republic Airport", city: "East Farmingdale", state: "NY", latitude: 40.728576, longitude: -73.414267 },
  { icao: "KFRI", faa: "FRI", iata: "FRI", name: "Marshall Army Air Field", city: "Fort Riley (Junction City)", state: "KS", latitude: 39.053021, longitude: -96.764202 },
  { icao: "KFSD", faa: "FSD", iata: "FSD", name: "Sioux Falls Regional Airport", city: "Sioux Falls", state: "SD", latitude: 43.585463, longitude: -96.741152 },
  { icao: "KFSI", faa: "FSI", iata: "FSI", name: "Henry Post Army Air Field", city: "Fort Sill", state: "OK", latitude: 34.649799, longitude: -98.402199 },
  { icao: "KFSM", faa: "FSM", iata: "FSM", name: "Fort Smith Regional Airport", city: "Fort Smith", state: "AR", latitude: 35.336601, longitude: -94.367401 },
  { icao: "KFST", faa: "FST", iata: "FST", name: "Fort Stockton Pecos County Airport", city: "Fort Stockton", state: "TX", latitude: 30.915701, longitude: -102.916 },
  { icao: "KFTK", faa: "FTK", iata: "FTK", name: "Godman Army Air Field", city: "Fort Knox", state: "KY", latitude: 37.907101, longitude: -85.972099 },
  { icao: "KFTW", faa: "FTW", iata: "FTW", name: "Fort Worth Meacham International Airport", city: "Fort Worth", state: "TX", latitude: 32.819919, longitude: -97.360818 },
  { icao: "KFTY", faa: "FTY", iata: "FTY", name: "Fulton County Airport Brown Field", city: "Atlanta", state: "GA", latitude: 33.779099, longitude: -84.5214 },
  { icao: "KFUL", faa: "FUL", iata: "FUL", name: "Fullerton Municipal Airport", city: "Fullerton", state: "CA", latitude: 33.872, longitude: -117.9798 },
  { icao: "KFWA", faa: "FWA", iata: "FWA", name: "Fort Wayne International Airport", city: "Fort Wayne", state: "IN", latitude: 40.978896, longitude: -85.194465 },
  { icao: "KFXE", faa: "FXE", iata: "FXE", name: "Fort Lauderdale Executive Airport", city: "Fort Lauderdale", state: "FL", latitude: 26.1973, longitude: -80.1707 },
  { icao: "KFYV", faa: "FYV", iata: "FYV", name: "Drake Field", city: "Fayetteville", state: "AR", latitude: 36.0051, longitude: -94.170097 },
  { icao: "KGAI", faa: "GAI", name: "Montgomery County Airpark", city: "Gaithersburg", state: "MD", latitude: 39.1683, longitude: -77.166 },
  { icao: "KGCC", faa: "GCC", iata: "GCC", name: "Northeast Wyoming Regional Airport", city: "Gillette", state: "WY", latitude: 44.3489, longitude: -105.539001 },
  { icao: "KGCK", faa: "GCK", iata: "GCK", name: "Garden City Regional Airport", city: "Garden City", state: "KS", latitude: 37.927502, longitude: -100.723999 },
  { icao: "KGCN", faa: "GCN", iata: "GCN", name: "Grand Canyon National Park Airport", city: "Grand Canyon - Tusayan", state: "AZ", latitude: 35.9524, longitude: -112.147003 },
  { icao: "KGDV", faa: "GDV", iata: "GDV", name: "Dawson Community Airport", city: "Glendive", state: "MT", latitude: 47.137658, longitude: -104.80691 },
  { icao: "KGEG", faa: "GEG", iata: "GEG", name: "Spokane International Airport", city: "Spokane", state: "WA", latitude: 47.6199, longitude: -117.533997 },
  { icao: "KGFK", faa: "GFK", iata: "GFK", name: "Grand Forks International Airport", city: "Grand Forks", state: "ND", latitude: 47.949299, longitude: -97.176102 },
  { icao: "KGFL", faa: "GFL", iata: "GFL", name: "Floyd Bennett Memorial Airport", city: "Glens Falls", state: "NY", latitude: 43.341202, longitude: -73.610298 },
  { icao: "KGGG", faa: "GGG", iata: "GGG", name: "East Texas Regional Airport", city: "Longview", state: "TX", latitude: 32.383999, longitude: -94.711502 },
  { icao: "KGGW", faa: "GGW", iata: "GGW", name: "Glasgow Valley County Airport Wokal Field", city: "Glasgow", state: "MT", latitude: 48.212502, longitude: -106.614998 },
  { icao: "KGJT", faa: "GJT", iata: "GJT", name: "Grand Junction Regional Airport", city: "Grand Junction", state: "CO", latitude: 39.126663, longitude: -108.529387 },
  { icao: "KGKY", faa: "GKY", name: "Arlington Municipal Airport", city: "Arlington", state: "TX", latitude: 32.6639, longitude: -97.0943 },
  { icao: "KGLD", faa: "GLD", iata: "GLD", name: "Goodland Municipal Airport", city: "Goodland", state: "KS", latitude: 39.370701, longitude: -101.699753 },
  { icao: "KGLH", faa: "GLH", iata: "GLH", name: "Mid Delta Regional Airport", city: "Greenville", state: "MS", latitude: 33.482899, longitude: -90.985603 },
  { icao: "KGLS", faa: "GLS", iata: "GLS", name: "Scholes International At Galveston Airport", city: "Galveston", state: "TX", latitude: 29.265301, longitude: -94.860397 },
  { icao: "KGMU", faa: "GMU", iata: "GMU", name: "Greenville Downtown Airport", city: "Greenville", state: "SC", latitude: 34.847903, longitude: -82.350217 },
  { icao: "KGNV", faa: "GNV", iata: "GNV", name: "Gainesville Regional Airport", city: "Gainesville", state: "FL", latitude: 29.6901, longitude: -82.271797 },
  { icao: "KGON", faa: "GON", iata: "GON", name: "Groton New London Airport", city: "Groton", state: "CT", latitude: 41.330101, longitude: -72.045097 },
  { icao: "KGPI", faa: "GPI", iata: "FCA", name: "Glacier Park International Airport", city: "Kalispell", state: "MT", latitude: 48.310501, longitude: -114.255997 },
  { icao: "KGPT", faa: "GPT", iata: "GPT", name: "Gulfport Biloxi International Airport", city: "Gulfport", state: "MS", latitude: 30.405582, longitude: -89.069836 },
  { icao: "KGRB", faa: "GRB", iata: "GRB", name: "Austin Straubel International Airport", city: "Green Bay", state: "WI", latitude: 44.483459, longitude: -88.130805 },
  { icao: "KGRF", faa: "GRF", iata: "GRF", name: "Gray Army Air Field", city: "Fort Lewis/Tacoma", state: "WA", latitude: 47.079201, longitude: -122.581001 },
  { icao: "KGRI", faa: "GRI", iata: "GRI", name: "Central Nebraska Regional Airport", city: "Grand Island", state: "NE", latitude: 40.967499, longitude: -98.309601 },
  { icao: "KGRK", faa: "GRK", iata: "GRK", name: "Killeen Regional Airport / Robert Gray Army Airfield", city: "Fort Cavazos", state: "TX", latitude: 31.0672, longitude: -97.828903 },
  { icao: "KGRR", faa: "GRR", iata: "GRR", name: "Gerald R. Ford International Airport", city: "Grand Rapids", state: "MI", latitude: 42.880798, longitude: -85.522797 },
  { icao: "KGSB", faa: "GSB", iata: "GSB", name: "Seymour Johnson Air Force Base", city: "Goldsboro", state: "NC", latitude: 35.339401, longitude: -77.960602 },
  { icao: "KGSO", faa: "GSO", iata: "GSO", name: "Piedmont Triad International Airport", city: "Greensboro", state: "NC", latitude: 36.09937, longitude: -79.937262 },
  { icao: "KGSP", faa: "GSP", iata: "GSP", name: "Greenville-Spartanburg International Airport", city: "Greenville/Greer/Spartanburg", state: "SC", latitude: 34.895699, longitude: -82.218903 },
  { icao: "KGTB", faa: "GTB", name: "Wheeler Sack Army Air Field", city: "Fort Drum", state: "NY", latitude: 44.055599, longitude: -75.719498 },
  { icao: "KGTF", faa: "GTF", iata: "GTF", name: "Great Falls International Airport", city: "Great Falls", state: "MT", latitude: 47.481998, longitude: -111.371002 },
  { icao: "KGTR", faa: "GTR", iata: "GTR", name: "Golden Triangle Regional Airport", city: "Columbus/W Point/Starkville", state: "MS", latitude: 33.450298, longitude: -88.5914 },
  { icao: "KGTU", faa: "GTU", name: "Georgetown Municipal Airport", city: "Georgetown", state: "TX", latitude: 30.6788, longitude: -97.6794 },
  { icao: "KGUC", faa: "GUC", iata: "GUC", name: "Gunnison Crested Butte Regional Airport", city: "Gunnison", state: "CO", latitude: 38.534672, longitude: -106.934566 },
  { icao: "KGUP", faa: "GUP", iata: "GUP", name: "Gallup Municipal Airport", city: "Gallup", state: "NM", latitude: 35.511653, longitude: -108.788166 },
  { icao: "KGUS", faa: "GUS", iata: "GUS", name: "Grissom Air Reserve Base", city: "Peru", state: "IN", latitude: 40.648102, longitude: -86.1521 },
  { icao: "KGUY", faa: "GUY", iata: "GUY", name: "Guymon Municipal Airport", city: "Guymon", state: "OK", latitude: 36.685101, longitude: -101.508003 },
  { icao: "KGWO", faa: "GWO", iata: "GWO", name: "Greenwood–Leflore Airport", city: "Greenwood", state: "MS", latitude: 33.495025, longitude: -90.088204 },
  { icao: "KGYI", faa: "GYI", iata: "PNX", name: "North Texas Regional Airport Perrin Field", city: "Denison", state: "TX", latitude: 33.7141, longitude: -96.673698 },
  { icao: "KGYR", faa: "GYR", name: "Phoenix Goodyear Airport", city: "Goodyear", state: "AZ", latitude: 33.4225, longitude: -112.3761 },
  { icao: "KGYY", faa: "GYY", iata: "GYY", name: "Gary/Chicago International Airport", city: "Gary", state: "IN", latitude: 41.617087, longitude: -87.413206 },
  { icao: "KHAO", faa: "HAO", name: "Butler County Regional Airport", city: "Hamilton", state: "OH", latitude: 39.3639, longitude: -84.5222 },
  { icao: "KHBG", faa: "HBG", iata: "HBG", name: "Hattiesburg Bobby L Chain Municipal Airport", city: "Hattiesburg", state: "MS", latitude: 31.264799, longitude: -89.2528 },
  { icao: "KHBR", faa: "HBR", iata: "HBR", name: "Hobart Regional Airport", city: "Hobart", state: "OK", latitude: 34.991317, longitude: -99.051313 },
  { icao: "KHDN", faa: "HDN", iata: "HDN", name: "Yampa Valley Airport", city: "Hayden", state: "CO", latitude: 40.481201, longitude: -107.218002 },
  { icao: "KHEF", faa: "HEF", iata: "MNZ", name: "Washington Manassas Harry P. Davis Field", city: "Manassas", state: "VA", latitude: 38.723021, longitude: -77.515422 },
  { icao: "KHFD", faa: "HFD", iata: "HFD", name: "Hartford Brainard Airport", city: "Hartford", state: "CT", latitude: 41.736698, longitude: -72.649399 },
  { icao: "KHGR", faa: "HGR", iata: "HGR", name: "Hagerstown Regional Richard A Henson Field", city: "Hagerstown", state: "MD", latitude: 39.708771, longitude: -77.728014 },
  { icao: "KHHR", faa: "HHR", iata: "HHR", name: "Jack Northrop Field Hawthorne Municipal Airport", city: "Hawthorne", state: "CA", latitude: 33.922798, longitude: -118.334999 },
  { icao: "KHIB", faa: "HIB", iata: "HIB", name: "Range Regional Airport", city: "Hibbing", state: "MN", latitude: 47.384831, longitude: -92.836905 },
  { icao: "KHIF", faa: "HIF", iata: "HIF", name: "Hill Air Force Base", city: "Ogden", state: "UT", latitude: 41.12403, longitude: -111.973086 },
  { icao: "KHII", faa: "HII", iata: "HII", name: "Lake Havasu City Airport", city: "Lake Havasu City", state: "AZ", latitude: 34.570506, longitude: -114.357745 },
  { icao: "KHIO", faa: "HIO", iata: "HIO", name: "Portland Hillsboro Airport", city: "Portland", state: "OR", latitude: 45.540401, longitude: -122.949997 },
  { icao: "KHKY", faa: "HKY", iata: "HKY", name: "Hickory Regional Airport", city: "Hickory", state: "NC", latitude: 35.7411, longitude: -81.389503 },
  { icao: "KHLG", faa: "HLG", iata: "HLG", name: "Wheeling Ohio County Airport", city: "Wheeling", state: "WV", latitude: 40.174999, longitude: -80.646301 },
  { icao: "KHLN", faa: "HLN", iata: "HLN", name: "Helena Regional Airport", city: "Helena", state: "MT", latitude: 46.6068, longitude: -111.983002 },
  { icao: "KHMN", faa: "HMN", iata: "HMN", name: "Holloman Air Force Base", city: "Alamogordo", state: "NM", latitude: 32.852501, longitude: -106.107002 },
  { icao: "KHND", faa: "HND", name: "Henderson Executive Airport", city: "Henderson", state: "NV", latitude: 35.9728, longitude: -115.1344 },
  { icao: "KHOB", faa: "HOB", iata: "HOB", name: "Lea County Regional Airport", city: "Hobbs", state: "NM", latitude: 32.6875, longitude: -103.217003 },
  { icao: "KHON", faa: "HON", iata: "HON", name: "Huron Regional Airport", city: "Huron", state: "SD", latitude: 44.385201, longitude: -98.2285 },
  { icao: "KHOP", faa: "HOP", iata: "HOP", name: "Campbell Army Airfield (Fort Campbell)", city: "Fort Campbell", state: "KY", latitude: 36.674154, longitude: -87.48974 },
  { icao: "KHOT", faa: "HOT", iata: "HOT", name: "Memorial Field Airport", city: "Hot Springs", state: "AR", latitude: 34.4788, longitude: -93.096262 },
  { icao: "KHOU", faa: "HOU", iata: "HOU", name: "William P. Hobby Airport", city: "Houston", state: "TX", latitude: 29.645336, longitude: -95.276812 },
  { icao: "KHPN", faa: "HPN", iata: "HPN", name: "Westchester County Airport", city: "White Plains", state: "NY", latitude: 41.067001, longitude: -73.707603 },
  { icao: "KHQM", faa: "HQM", iata: "HQM", name: "Bowerman Airport", city: "Hoquiam", state: "WA", latitude: 46.971199, longitude: -123.936996 },
  { icao: "KHRL", faa: "HRL", iata: "HRL", name: "Valley International Airport", city: "Harlingen", state: "TX", latitude: 26.2285, longitude: -97.654404 },
  { icao: "KHRO", faa: "HRO", iata: "HRO", name: "Boone County Airport", city: "Harrison", state: "AR", latitude: 36.261501, longitude: -93.154701 },
  { icao: "KHRT", faa: "HRT", name: "Hurlburt Field", city: "Mary Esther", state: "FL", latitude: 30.427799, longitude: -86.689301 },
  { icao: "KHST", faa: "HST", iata: "HST", name: "Homestead Air Reserve Base", city: "Homestead", state: "FL", latitude: 25.4886, longitude: -80.383598 },
  { icao: "KHSV", faa: "HSV", iata: "HSV", name: "Huntsville International Airport", city: "Huntsville", state: "AL", latitude: 34.636244, longitude: -86.774378 },
  { icao: "KHTS", faa: "HTS", iata: "HTS", name: "Tri-State Airport / Milton J. Ferguson Field", city: "Huntington", state: "WV", latitude: 38.366699, longitude: -82.557999 },
  { icao: "KHUA", faa: "HUA", iata: "HUA", name: "Redstone Army Air Field", city: "Redstone Arsnl Huntsville", state: "AL", latitude: 34.678699, longitude: -86.684799 },
  { icao: "KHUF", faa: "HUF", iata: "HUF", name: "Terre Haute Regional Airport, Hulman Field", city: "Terre Haute", state: "IN", latitude: 39.4515, longitude: -87.307602 },
  { icao: "KHUL", faa: "HUL", iata: "HUL", name: "Houlton International Airport", city: "Houlton", state: "ME", latitude: 46.1231, longitude: -67.792099 },
  { icao: "KHUT", faa: "HUT", iata: "HUT", name: "Hutchinson Municipal Airport", city: "Hutchinson", state: "KS", latitude: 38.065498, longitude: -97.860603 },
  { icao: "KHVN", faa: "HVN", iata: "HVN", name: "Tweed New Haven Airport", city: "New Haven", state: "CT", latitude: 41.262869, longitude: -72.887694 },
  { icao: "KHVR", faa: "HVR", iata: "HVR", name: "Havre City County Airport", city: "Havre", state: "MT", latitude: 48.541387, longitude: -109.762859 },
  { icao: "KHWD", faa: "HWD", iata: "HWD", name: "Hayward Executive Airport", city: "Hayward", state: "CA", latitude: 37.6592, longitude: -122.1217 },
  { icao: "KHWO", faa: "HWO", iata: "HWO", name: "North Perry Airport", city: "Hollywood", state: "FL", latitude: 26.0012, longitude: -80.2407 },
  { icao: "KHXD", faa: "HXD", iata: "HHH", name: "Hilton Head Airport", city: "Hilton Head Island", state: "SC", latitude: 32.2244, longitude: -80.697502 },
  { icao: "KHYA", faa: "HYA", iata: "HYA", name: "Cape Cod Gateway Airport", city: "Hyannis", state: "MA", latitude: 41.6693, longitude: -70.280403 },
  { icao: "KHYI", faa: "HYI", name: "San Marcos Regional Airport", city: "San Marcos", state: "TX", latitude: 29.8927, longitude: -97.862999 },
  { icao: "KHYR", faa: "HYR", iata: "HYR", name: "Sawyer County Airport", city: "Hayward", state: "WI", latitude: 46.0252, longitude: -91.444298 },
  { icao: "KHYS", faa: "HYS", iata: "HYS", name: "Hays Regional Airport", city: "Hays", state: "KS", latitude: 38.844521, longitude: -99.273148 },
  { icao: "KHZY", faa: "HZY", iata: "JFN", name: "Northeast Ohio Regional Airport", city: "Ashtabula", state: "OH", latitude: 41.778, longitude: -80.695503 },
  { icao: "KIAB", faa: "IAB", iata: "IAB", name: "McConnell Air Force Base", city: "Wichita", state: "KS", latitude: 37.621899, longitude: -97.268204 },
  { icao: "KIAD", faa: "IAD", iata: "IAD", name: "Washington Dulles Intl", city: "Washington", state: "VA", latitude: 38.9445, longitude: -77.455803, aliases: ["Potomac Approach"] },
  { icao: "KIAG", faa: "IAG", iata: "IAG", name: "Niagara Falls International Airport", city: "Niagara Falls", state: "NY", latitude: 43.1073, longitude: -78.946198 },
  { icao: "KIAH", faa: "IAH", iata: "IAH", name: "George Bush Intercontinental Airport", city: "Houston", state: "TX", latitude: 29.9844, longitude: -95.3414 },
  { icao: "KICT", faa: "ICT", iata: "ICT", name: "Wichita Dwight D. Eisenhower National Airport", city: "Wichita", state: "KS", latitude: 37.650314, longitude: -97.428583 },
  { icao: "KIDA", faa: "IDA", iata: "IDA", name: "Idaho Falls Regional Airport", city: "Idaho Falls", state: "ID", latitude: 43.514599, longitude: -112.070999 },
  { icao: "KIFP", faa: "IFP", iata: "IFP", name: "Laughlin Bullhead International Airport", city: "Bullhead City", state: "AZ", latitude: 35.154726, longitude: -114.559322 },
  { icao: "KIGM", faa: "IGM", iata: "IGM", name: "Kingman Airport", city: "Kingman", state: "AZ", latitude: 35.259499, longitude: -113.938004 },
  { icao: "KIKK", faa: "IKK", iata: "IKK", name: "Greater Kankakee Airport", city: "Kankakee", state: "IL", latitude: 41.0714, longitude: -87.846298 },
  { icao: "KILG", faa: "ILG", iata: "ILG", name: "Wilmington Airport", city: "Wilmington", state: "DE", latitude: 39.678699, longitude: -75.606499 },
  { icao: "KILM", faa: "ILM", iata: "ILM", name: "Wilmington International Airport", city: "Wilmington", state: "NC", latitude: 34.272345, longitude: -77.905117 },
  { icao: "KILN", faa: "ILN", iata: "ILN", name: "Wilmington Airpark", city: "Wilmington", state: "OH", latitude: 39.427898, longitude: -83.792099 },
  { icao: "KIMT", faa: "IMT", iata: "IMT", name: "Ford Airport", city: "Kingsford", state: "MI", latitude: 45.81911, longitude: -88.114557 },
  { icao: "KIND", faa: "IND", iata: "IND", name: "Indianapolis International Airport", city: "Indianapolis", state: "IN", latitude: 39.7173, longitude: -86.294403 },
  { icao: "KINK", faa: "INK", iata: "INK", name: "Winkler County Airport", city: "Wink", state: "TX", latitude: 31.7796, longitude: -103.200996 },
  { icao: "KINL", faa: "INL", iata: "INL", name: "Falls International Airport", city: "International Falls", state: "MN", latitude: 48.5662, longitude: -93.403099 },
  { icao: "KINT", faa: "INT", iata: "INT", name: "Smith Reynolds Airport", city: "Winston Salem", state: "NC", latitude: 36.133701, longitude: -80.222 },
  { icao: "KINW", faa: "INW", iata: "INW", name: "Winslow Lindbergh Regional Airport", city: "Winslow", state: "AZ", latitude: 35.0219, longitude: -110.723 },
  { icao: "KIPJ", faa: "IPJ", name: "Lincolnton-Lincoln County Regional Airport", city: "Lincolnton", state: "NC", latitude: 35.4833, longitude: -81.1613 },
  { icao: "KIPL", faa: "IPL", iata: "IPL", name: "Imperial County Airport", city: "Imperial", state: "CA", latitude: 32.83539, longitude: -115.574026 },
  { icao: "KIPT", faa: "IPT", iata: "IPT", name: "Williamsport Regional Airport", city: "Williamsport", state: "PA", latitude: 41.242126, longitude: -76.92245 },
  { icao: "KIRK", faa: "IRK", iata: "IRK", name: "Kirksville Regional Airport", city: "Kirksville", state: "MO", latitude: 40.093498, longitude: -92.544899 },
  { icao: "KISM", faa: "ISM", iata: "ISM", name: "Kissimmee Gateway Airport", city: "Orlando", state: "FL", latitude: 28.289801, longitude: -81.437103 },
  { icao: "KISO", faa: "ISO", iata: "ISO", name: "Kinston Regional Jetport At Stallings Field", city: "Kinston", state: "NC", latitude: 35.331402, longitude: -77.608803 },
  { icao: "KISP", faa: "ISP", iata: "ISP", name: "Long Island MacArthur Airport", city: "Islip", state: "NY", latitude: 40.796324, longitude: -73.101703 },
  { icao: "KITH", faa: "ITH", iata: "ITH", name: "Ithaca Tompkins Regional Airport", city: "Ithaca", state: "NY", latitude: 42.491001, longitude: -76.458397 },
  { icao: "KIWA", faa: "IWA", iata: "AZA", name: "Mesa Gateway Airport", city: "Mesa", state: "AZ", latitude: 33.3078, longitude: -111.654999 },
  { icao: "KIXD", faa: "IXD", name: "New Century AirCenter", city: "Gardner", state: "KS", latitude: 38.8309, longitude: -94.8903 },
  { icao: "KJAC", faa: "JAC", iata: "JAC", name: "Jackson Hole Airport", city: "Jackson", state: "WY", latitude: 43.6073, longitude: -110.737999 },
  { icao: "KJAN", faa: "JAN", iata: "JAN", name: "Jackson-Medgar Wiley Evers International Airport", city: "Jackson", state: "MS", latitude: 32.311199, longitude: -90.075897 },
  { icao: "KJAX", faa: "JAX", iata: "JAX", name: "Jacksonville International Airport", city: "Jacksonville", state: "FL", latitude: 30.492469, longitude: -81.687813 },
  { icao: "KJBR", faa: "JBR", iata: "JBR", name: "Jonesboro Municipal Airport", city: "Jonesboro", state: "AR", latitude: 35.831699, longitude: -90.6464 },
  { icao: "KJCT", faa: "JCT", iata: "JCT", name: "Kimble County Airport", city: "Junction", state: "TX", latitude: 30.511299, longitude: -99.763496 },
  { icao: "KJFK", faa: "JFK", iata: "JFK", name: "John F. Kennedy Intl", city: "New York", state: "NY", latitude: 40.639447, longitude: -73.779317, aliases: ["New York Approach", "N90"] },
  { icao: "KJHW", faa: "JHW", iata: "JHW", name: "Chautauqua County-Jamestown Airport", city: "Jamestown", state: "NY", latitude: 42.15425, longitude: -79.254008 },
  { icao: "KJKL", faa: "JKL", name: "Julian Carroll Airport", city: "Jackson", state: "KY", latitude: 37.593899, longitude: -83.317299 },
  { icao: "KJLN", faa: "JLN", iata: "JLN", name: "Joplin Regional Airport", city: "Joplin", state: "MO", latitude: 37.151798, longitude: -94.498299 },
  { icao: "KJMS", faa: "JMS", iata: "JMS", name: "Jamestown Regional Airport", city: "Jamestown", state: "ND", latitude: 46.929699, longitude: -98.6782 },
  { icao: "KJNX", faa: "JNX", name: "Johnston Regional Airport", city: "Smithfield", state: "NC", latitude: 35.540901, longitude: -78.390297 },
  { icao: "KJQF", faa: "JQF", iata: "USA", name: "Concord-Padgett Regional Airport", city: "Concord", state: "NC", latitude: 35.387798, longitude: -80.709099 },
  { icao: "KJST", faa: "JST", iata: "JST", name: "John Murtha Johnstown Cambria County Airport", city: "Johnstown", state: "PA", latitude: 40.316101, longitude: -78.8339 },
  { icao: "KJWN", faa: "JWN", name: "John C. Tune Airport", city: "Nashville", state: "TN", latitude: 36.1824, longitude: -86.8867 },
  { icao: "KJWY", faa: "JWY", name: "Mid-Way Regional Airport", city: "Midlothian/Waxahachie", state: "TX", latitude: 32.4587, longitude: -96.912399 },
  { icao: "KJXN", faa: "JXN", iata: "JXN", name: "Jackson County Airport/Reynolds Field", city: "Jackson", state: "MI", latitude: 42.260509, longitude: -84.463019 },
  { icao: "KJYO", faa: "JYO", name: "Leesburg Executive Airport", city: "Leesburg", state: "VA", latitude: 39.078, longitude: -77.5575 },
  { icao: "KKLS", faa: "KLS", iata: "KLS", name: "Southwest Washington Regional Airport", city: "Kelso", state: "WA", latitude: 46.118, longitude: -122.898003 },
  { icao: "KL45", faa: "L45", name: "Bakersfield International Airport", city: "Bakersfield", state: "CA", latitude: 35.324799, longitude: -118.996002 },
  { icao: "KL71", faa: "L71", name: "California City Municipal Airport", city: "California City", state: "CA", latitude: 35.151377, longitude: -118.016059 },
  { icao: "KLAA", faa: "LAA", iata: "LAA", name: "Southeast Colorado Regional Airport", city: "Lamar", state: "CO", latitude: 38.066407, longitude: -102.691373 },
  { icao: "KLAF", faa: "LAF", iata: "LAF", name: "Purdue University Airport", city: "West Lafayette", state: "IN", latitude: 40.412875, longitude: -86.939363 },
  { icao: "KLAL", faa: "LAL", iata: "LAL", name: "Lakeland Linder International Airport", city: "Lakeland", state: "FL", latitude: 27.989267, longitude: -82.020715 },
  { icao: "KLAN", faa: "LAN", iata: "LAN", name: "Capital Region International Airport", city: "Lansing", state: "MI", latitude: 42.777582, longitude: -84.585721 },
  { icao: "KLAR", faa: "LAR", iata: "LAR", name: "Laramie Regional Airport", city: "Laramie", state: "WY", latitude: 41.312099, longitude: -105.675003 },
  { icao: "KLAS", faa: "LAS", iata: "LAS", name: "Harry Reid International Airport", city: "Las Vegas", state: "NV", latitude: 36.083361, longitude: -115.151817, aliases: ["Las Vegas Approach", "L30"] },
  { icao: "KLAW", faa: "LAW", iata: "LAW", name: "Lawton Fort Sill Regional Airport", city: "Lawton", state: "OK", latitude: 34.567699, longitude: -98.416603 },
  { icao: "KLAX", faa: "LAX", iata: "LAX", name: "Los Angeles Intl", city: "Los Angeles", state: "CA", latitude: 33.942501, longitude: -118.407997, aliases: ["SoCal Approach", "SoCal"] },
  { icao: "KLBB", faa: "LBB", iata: "LBB", name: "Lubbock Preston Smith International Airport", city: "Lubbock", state: "TX", latitude: 33.663601, longitude: -101.822998 },
  { icao: "KLBE", faa: "LBE", iata: "LBE", name: "Arnold Palmer Regional Airport", city: "Latrobe", state: "PA", latitude: 40.275902, longitude: -79.4048 },
  { icao: "KLBF", faa: "LBF", iata: "LBF", name: "North Platte Regional Airport Lee Bird Field", city: "North Platte", state: "NE", latitude: 41.126202, longitude: -100.683998 },
  { icao: "KLBL", faa: "LBL", iata: "LBL", name: "Liberal Mid-America Regional Airport", city: "Liberal", state: "KS", latitude: 37.044201, longitude: -100.959999 },
  { icao: "KLBT", faa: "LBT", iata: "LBT", name: "Lumberton Regional Airport", city: "Lumberton", state: "NC", latitude: 34.610773, longitude: -79.05943 },
  { icao: "KLBX", faa: "LBX", iata: "LJN", name: "Texas Gulf Coast Regional Airport", city: "Angleton", state: "TX", latitude: 29.108601, longitude: -95.462097 },
  { icao: "KLCH", faa: "LCH", iata: "LCH", name: "Lake Charles Regional Airport", city: "Lake Charles", state: "LA", latitude: 30.126101, longitude: -93.223297 },
  { icao: "KLCK", faa: "LCK", iata: "LCK", name: "Rickenbacker International Airport", city: "Columbus", state: "OH", latitude: 39.813801, longitude: -82.927803 },
  { icao: "KLEB", faa: "LEB", iata: "LEB", name: "Lebanon Municipal Airport", city: "Lebanon", state: "NH", latitude: 43.626099, longitude: -72.304199 },
  { icao: "KLEE", faa: "LEE", iata: "LEE", name: "Leesburg International Airport", city: "Leesburg", state: "FL", latitude: 28.823099, longitude: -81.808701 },
  { icao: "KLEX", faa: "LEX", iata: "LEX", name: "Blue Grass Airport", city: "Lexington", state: "KY", latitude: 38.035066, longitude: -84.606738 },
  { icao: "KLFI", faa: "LFI", iata: "LFI", name: "Langley Air Force Base", city: "Hampton", state: "VA", latitude: 37.082901, longitude: -76.360497 },
  { icao: "KLFK", faa: "LFK", iata: "LFK", name: "Angelina County Airport", city: "Lufkin", state: "TX", latitude: 31.233999, longitude: -94.75 },
  { icao: "KLFT", faa: "LFT", iata: "LFT", name: "Lafayette Regional Airport", city: "Lafayette", state: "LA", latitude: 30.205299, longitude: -91.987602 },
  { icao: "KLGA", faa: "LGA", iata: "LGA", name: "LaGuardia", city: "New York", state: "NY", latitude: 40.777199, longitude: -73.872597 },
  { icao: "KLGB", faa: "LGB", iata: "LGB", name: "Long Beach International Airport", city: "Long Beach", state: "CA", latitude: 33.816523, longitude: -118.149891 },
  { icao: "KLGU", faa: "LGU", iata: "LGU", name: "Logan-Cache Airport", city: "Logan", state: "UT", latitude: 41.791199, longitude: -111.851997 },
  { icao: "KLHZ", faa: "LHZ", name: "Triangle North Executive Airport", city: "Louisburg", state: "NC", latitude: 36.0232, longitude: -78.3303 },
  { icao: "KLIT", faa: "LIT", iata: "LIT", name: "Bill & Hillary Clinton National Airport/Adams Field", city: "Little Rock", state: "AR", latitude: 34.729222, longitude: -92.223591 },
  { icao: "KLLQ", faa: "LLQ", name: "Monticello Municipal Ellis Field", city: "Monticello", state: "AR", latitude: 33.638599, longitude: -91.750999 },
  { icao: "KLMT", faa: "LMT", iata: "LMT", name: "Crater Lake-Klamath Regional Airport", city: "Klamath Falls", state: "OR", latitude: 42.156101, longitude: -121.733002 },
  { icao: "KLND", faa: "LND", iata: "LND", name: "Hunt Field", city: "Lander", state: "WY", latitude: 42.815201, longitude: -108.730003 },
  { icao: "KLNK", faa: "LNK", iata: "LNK", name: "Lincoln Airport", city: "Lincoln", state: "NE", latitude: 40.844882, longitude: -96.76178 },
  { icao: "KLNS", faa: "LNS", iata: "LNS", name: "Lancaster Airport", city: "Lancaster", state: "PA", latitude: 40.1217, longitude: -76.296097 },
  { icao: "KLOL", faa: "LOL", iata: "LOL", name: "Derby Field", city: "Lovelock", state: "NV", latitude: 40.066399, longitude: -118.565002 },
  { icao: "KLOU", faa: "LOU", iata: "LOU", name: "Bowman Field", city: "Louisville", state: "KY", latitude: 38.228001, longitude: -85.663696 },
  { icao: "KLOZ", faa: "LOZ", iata: "LOZ", name: "London-Corbin Airport/Magee Field", city: "London", state: "KY", latitude: 37.082199, longitude: -84.0849 },
  { icao: "KLPR", faa: "LPR", name: "Lorain County Regional Airport", city: "Lorain", state: "OH", latitude: 41.3443, longitude: -82.1776 },
  { icao: "KLRD", faa: "LRD", iata: "LRD", name: "Laredo International Airport", city: "Laredo", state: "TX", latitude: 27.5438, longitude: -99.461601 },
  { icao: "KLRF", faa: "LRF", iata: "LRF", name: "Little Rock Air Force Base", city: "Jacksonville", state: "AR", latitude: 34.916901, longitude: -92.149696 },
  { icao: "KLRU", faa: "LRU", iata: "LRU", name: "Las Cruces International Airport", city: "Las Cruces", state: "NM", latitude: 32.289398, longitude: -106.921997 },
  { icao: "KLSE", faa: "LSE", iata: "LSE", name: "La Crosse Regional Airport", city: "La Crosse", state: "WI", latitude: 43.879002, longitude: -91.256699 },
  { icao: "KLSF", faa: "LSF", iata: "LSF", name: "Lawson Army Air Field", city: "Fort Benning", state: "GA", latitude: 32.332546, longitude: -84.988003 },
  { icao: "KLSV", faa: "LSV", iata: "LSV", name: "Nellis Air Force Base", city: "Las Vegas", state: "NV", latitude: 36.236198, longitude: -115.033997 },
  { icao: "KLTS", faa: "LTS", iata: "LTS", name: "Altus Air Force Base", city: "Altus", state: "OK", latitude: 34.667099, longitude: -99.266701 },
  { icao: "KLUF", faa: "LUF", iata: "LUF", name: "Luke Air Force Base", city: "Glendale", state: "AZ", latitude: 33.535, longitude: -112.383003 },
  { icao: "KLUK", faa: "LUK", iata: "LUK", name: "Cincinnati Municipal Airport Lunken Field", city: "Cincinnati", state: "OH", latitude: 39.102357, longitude: -84.418945 },
  { icao: "KLVK", faa: "LVK", name: "Livermore Municipal Airport", city: "Livermore", state: "CA", latitude: 37.6934, longitude: -121.8204 },
  { icao: "KLVM", faa: "LVM", iata: "LVM", name: "Mission Field", city: "Livingston", state: "MT", latitude: 45.699402, longitude: -110.447998 },
  { icao: "KLVS", faa: "LVS", iata: "LVS", name: "Las Vegas Municipal Airport", city: "Las Vegas", state: "NM", latitude: 35.654202, longitude: -105.141998 },
  { icao: "KLWB", faa: "LWB", iata: "LWB", name: "Greenbrier Valley Airport", city: "Lewisburg", state: "WV", latitude: 37.857914, longitude: -80.400438 },
  { icao: "KLWM", faa: "LWM", iata: "LWM", name: "Lawrence Municipal Airport", city: "Lawrence", state: "MA", latitude: 42.717201, longitude: -71.123398 },
  { icao: "KLWS", faa: "LWS", iata: "LWS", name: "Lewiston Nez Perce County Airport", city: "Lewiston", state: "ID", latitude: 46.3745, longitude: -117.014999 },
  { icao: "KLWT", faa: "LWT", iata: "LWT", name: "Lewistown Municipal Airport", city: "Lewistown", state: "MT", latitude: 47.048429, longitude: -109.466143 },
  { icao: "KLYH", faa: "LYH", iata: "LYH", name: "Lynchburg Regional Airport - Preston Glenn Field", city: "Lynchburg", state: "VA", latitude: 37.326698, longitude: -79.200401 },
  { icao: "KMAF", faa: "MAF", iata: "MAF", name: "Midland International Air and Space Port", city: "Midland", state: "TX", latitude: 31.942499, longitude: -102.202003 },
  { icao: "KMAN", faa: "MAN", name: "Nampa Municipal Airport", city: "Nampa", state: "ID", latitude: 43.5827, longitude: -116.5268 },
  { icao: "KMBG", faa: "MBG", iata: "MBG", name: "Mobridge Municipal Airport", city: "Mobridge", state: "SD", latitude: 45.546501, longitude: -100.407997 },
  { icao: "KMBS", faa: "MBS", iata: "MBS", name: "MBS International Airport", city: "Freeland", state: "MI", latitude: 43.533181, longitude: -84.083104 },
  { icao: "KMCB", faa: "MCB", iata: "MCB", name: "McComb-Pike County Airport / John E Lewis Field", city: "McComb", state: "MS", latitude: 31.178499, longitude: -90.471901 },
  { icao: "KMCC", faa: "MCC", iata: "MCC", name: "McClellan Airfield", city: "Sacramento", state: "CA", latitude: 38.667599, longitude: -121.401001 },
  { icao: "KMCE", faa: "MCE", iata: "MCE", name: "Merced Regional Macready Field", city: "Merced", state: "CA", latitude: 37.284698, longitude: -120.514 },
  { icao: "KMCF", faa: "MCF", iata: "MCF", name: "MacDill Air Force Base", city: "Tampa", state: "FL", latitude: 27.8493, longitude: -82.521202 },
  { icao: "KMCI", faa: "MCI", iata: "MCI", name: "Kansas City International Airport", city: "Kansas City", state: "MO", latitude: 39.301699, longitude: -94.713893 },
  { icao: "KMCK", faa: "MCK", iata: "MCK", name: "McCook Ben Nelson Regional Airport", city: "McCook", state: "NE", latitude: 40.207787, longitude: -100.592794 },
  { icao: "KMCN", faa: "MCN", iata: "MCN", name: "Middle Georgia Regional Airport", city: "Macon", state: "GA", latitude: 32.692799, longitude: -83.6492 },
  { icao: "KMCO", faa: "MCO", iata: "MCO", name: "Orlando International Airport", city: "Orlando", state: "FL", latitude: 28.429399, longitude: -81.308998 },
  { icao: "KMCW", faa: "MCW", iata: "MCW", name: "Mason City Municipal Airport", city: "Mason City", state: "IA", latitude: 43.159801, longitude: -93.329716 },
  { icao: "KMDH", faa: "MDH", iata: "MDH", name: "Southern Illinois Airport", city: "Murphysboro", state: "IL", latitude: 37.778099, longitude: -89.251999 },
  { icao: "KMDT", faa: "MDT", iata: "MDT", name: "Harrisburg International Airport", city: "Harrisburg", state: "PA", latitude: 40.192838, longitude: -76.762333 },
  { icao: "KMDW", faa: "MDW", iata: "MDW", name: "Chicago Midway International Airport", city: "Chicago", state: "IL", latitude: 41.785999, longitude: -87.752403 },
  { icao: "KMEI", faa: "MEI", iata: "MEI", name: "Key Field / Meridian Regional Airport", city: "Meridian", state: "MS", latitude: 32.3326, longitude: -88.7519 },
  { icao: "KMEM", faa: "MEM", iata: "MEM", name: "Memphis International Airport", city: "Memphis", state: "TN", latitude: 35.043845, longitude: -89.97634 },
  { icao: "KMER", faa: "MER", iata: "MER", name: "Castle Airport", city: "Merced", state: "CA", latitude: 37.380501, longitude: -120.568001 },
  { icao: "KMFD", faa: "MFD", iata: "MFD", name: "Mansfield Lahm Regional Airport", city: "Mansfield", state: "OH", latitude: 40.8214, longitude: -82.516602 },
  { icao: "KMFE", faa: "MFE", iata: "MFE", name: "McAllen Miller International Airport", city: "McAllen", state: "TX", latitude: 26.176141, longitude: -98.237965 },
  { icao: "KMFR", faa: "MFR", iata: "MFR", name: "Rogue Valley International-Medford Airport", city: "Medford", state: "OR", latitude: 42.374199, longitude: -122.873001 },
  { icao: "KMGC", faa: "MGC", iata: "MGC", name: "Michigan City Municipal Airport", city: "Michigan City", state: "IN", latitude: 41.7033, longitude: -86.821198 },
  { icao: "KMGE", faa: "MGE", iata: "MGE", name: "Dobbins Air Reserve Base", city: "Marietta", state: "GA", latitude: 33.915401, longitude: -84.516296 },
  { icao: "KMGM", faa: "MGM", iata: "MGM", name: "Montgomery Regional (Dannelly Field) Airport", city: "Montgomery", state: "AL", latitude: 32.300598, longitude: -86.393997 },
  { icao: "KMGW", faa: "MGW", iata: "MGW", name: "Morgantown Municipal Airport Walter L. (Bill) Hart Field", city: "Morgantown", state: "WV", latitude: 39.643305, longitude: -79.917598 },
  { icao: "KMHK", faa: "MHK", iata: "MHK", name: "Manhattan Regional Airport", city: "Manhattan", state: "KS", latitude: 39.140999, longitude: -96.670799 },
  { icao: "KMHR", faa: "MHR", iata: "MHR", name: "Sacramento Mather Airport", city: "Sacramento", state: "CA", latitude: 38.554744, longitude: -121.297989 },
  { icao: "KMHT", faa: "MHT", iata: "MHT", name: "Manchester-Boston Regional Airport", city: "Manchester", state: "NH", latitude: 42.932598, longitude: -71.435699 },
  { icao: "KMHV", faa: "MHV", iata: "MHV", name: "Mojave Air & Space Port", city: "Mojave", state: "CA", latitude: 35.056391, longitude: -118.145342 },
  { icao: "KMIA", faa: "MIA", iata: "MIA", name: "Miami International Airport", city: "Miami", state: "FL", latitude: 25.796011, longitude: -80.289751 },
  { icao: "KMIB", faa: "MIB", iata: "MIB", name: "Minot Air Force Base", city: "Minot", state: "ND", latitude: 48.4156, longitude: -101.358002 },
  { icao: "KMIC", faa: "MIC", name: "Crystal Airport", city: "Crystal", state: "MN", latitude: 45.062, longitude: -93.3539 },
  { icao: "KMIE", faa: "MIE", iata: "MIE", name: "Delaware County Johnson Field", city: "Muncie", state: "IN", latitude: 40.242298, longitude: -85.395897 },
  { icao: "KMIV", faa: "MIV", iata: "MIV", name: "Millville Municipal Airport", city: "Millville", state: "NJ", latitude: 39.367802, longitude: -75.072197 },
  { icao: "KMKC", faa: "MKC", iata: "MKC", name: "Charles B. Wheeler Downtown Airport", city: "Kansas City", state: "MO", latitude: 39.123199, longitude: -94.592796 },
  { icao: "KMKE", faa: "MKE", iata: "MKE", name: "General Mitchell International Airport", city: "Milwaukee", state: "WI", latitude: 42.947201, longitude: -87.896599 },
  { icao: "KMKG", faa: "MKG", iata: "MKG", name: "Muskegon County Airport", city: "Muskegon", state: "MI", latitude: 43.169498, longitude: -86.238197 },
  { icao: "KMKL", faa: "MKL", iata: "MKL", name: "McKellar-Sipes Regional Airport", city: "Jackson", state: "TN", latitude: 35.599899, longitude: -88.915604 },
  { icao: "KMLB", faa: "MLB", iata: "MLB", name: "Melbourne Orlando International Airport", city: "Melbourne", state: "FL", latitude: 28.102009, longitude: -80.641088 },
  { icao: "KMLC", faa: "MLC", iata: "MLC", name: "Mc Alester Regional Airport", city: "Mc Alester", state: "OK", latitude: 34.882401, longitude: -95.783501 },
  { icao: "KMLI", faa: "MLI", iata: "MLI", name: "Quad City International Airport", city: "Moline", state: "IL", latitude: 41.448502, longitude: -90.5075 },
  { icao: "KMLS", faa: "MLS", iata: "MLS", name: "Miles City Airport - Frank Wiley Field", city: "Miles City", state: "MT", latitude: 46.427268, longitude: -105.885372 },
  { icao: "KMLU", faa: "MLU", iata: "MLU", name: "Monroe Regional Airport", city: "Monroe", state: "LA", latitude: 32.510899, longitude: -92.037697 },
  { icao: "KMMH", faa: "MMH", iata: "MMH", name: "Mammoth Yosemite Airport", city: "Mammoth Lakes", state: "CA", latitude: 37.625381, longitude: -118.84306 },
  { icao: "KMMT", faa: "MMT", iata: "MMT", name: "Mc Entire Joint National Guard Base", city: "Eastover", state: "SC", latitude: 33.920799, longitude: -80.8013 },
  { icao: "KMMU", faa: "MMU", iata: "MMU", name: "Morristown Municipal Airport", city: "Morristown", state: "NJ", latitude: 40.799062, longitude: -74.414949 },
  { icao: "KMMV", faa: "MMV", name: "McMinnville Municipal Airport", city: "McMinnville", state: "OR", latitude: 45.194401, longitude: -123.136002 },
  { icao: "KMOB", faa: "MOB", iata: "MOB", name: "Mobile Regional Airport", city: "Mobile", state: "AL", latitude: 30.6912, longitude: -88.242798 },
  { icao: "KMOD", faa: "MOD", iata: "MOD", name: "Modesto City Co-Harry Sham Field", city: "Modesto", state: "CA", latitude: 37.625801, longitude: -120.954002 },
  { icao: "KMOT", faa: "MOT", iata: "MOT", name: "Minot International Airport", city: "Minot", state: "ND", latitude: 48.25801, longitude: -101.279123 },
  { icao: "KMPV", faa: "MPV", iata: "MPV", name: "Edward F Knapp State Airport", city: "Barre/Montpelier", state: "VT", latitude: 44.203499, longitude: -72.562302 },
  { icao: "KMQJ", faa: "MQJ", name: "Indianapolis Regional Airport", city: "Greenfield", state: "IN", latitude: 39.8486, longitude: -85.8979 },
  { icao: "KMQY", faa: "MQY", iata: "MQY", name: "Smyrna Airport", city: "Smyrna", state: "TN", latitude: 36.008999, longitude: -86.520103 },
  { icao: "KMRB", faa: "MRB", iata: "MRB", name: "Eastern WV Regional Airport/Shepherd Field", city: "Martinsburg", state: "WV", latitude: 39.401901, longitude: -77.984596 },
  { icao: "KMRY", faa: "MRY", iata: "MRY", name: "Monterey Regional Airport", city: "Monterey", state: "CA", latitude: 36.586777, longitude: -121.844183 },
  { icao: "KMSL", faa: "MSL", iata: "MSL", name: "Northwest Alabama Regional Airport", city: "Muscle Shoals", state: "AL", latitude: 34.745123, longitude: -87.612981 },
  { icao: "KMSN", faa: "MSN", iata: "MSN", name: "Dane County Regional Truax Field", city: "Madison", state: "WI", latitude: 43.1399, longitude: -89.337502 },
  { icao: "KMSO", faa: "MSO", iata: "MSO", name: "Missoula Montana Airport", city: "Missoula", state: "MT", latitude: 46.915816, longitude: -114.091107 },
  { icao: "KMSP", faa: "MSP", iata: "MSP", name: "Minneapolis–Saint Paul International Airport / Wold–Chamberlain Field", city: "Minneapolis", state: "MN", latitude: 44.880081, longitude: -93.221741 },
  { icao: "KMSS", faa: "MSS", iata: "MSS", name: "Massena International Airport Richards Field", city: "Massena", state: "NY", latitude: 44.936157, longitude: -74.844304 },
  { icao: "KMSY", faa: "MSY", iata: "MSY", name: "Louis Armstrong New Orleans International Airport", city: "New Orleans", state: "LA", latitude: 29.993401, longitude: -90.264673 },
  { icao: "KMTC", faa: "MTC", iata: "MTC", name: "Selfridge Air National Guard Base Airport", city: "Mount Clemens", state: "MI", latitude: 42.613463, longitude: -82.836919 },
  { icao: "KMTH", faa: "MTH", iata: "MTH", name: "Florida Keys Marathon International Airport", city: "Marathon", state: "FL", latitude: 24.726006, longitude: -81.05138 },
  { icao: "KMTJ", faa: "MTJ", iata: "MTJ", name: "Montrose Regional Airport", city: "Montrose", state: "CO", latitude: 38.5098, longitude: -107.893997 },
  { icao: "KMTN", faa: "MTN", iata: "MTN", name: "Martin State Airport", city: "Baltimore", state: "MD", latitude: 39.325699, longitude: -76.413803 },
  { icao: "KMUI", faa: "MUI", iata: "MUI", name: "Muir Army Air Field (Fort Indiantown Gap) Airport", city: "Fort Indiantown Gap(Annville)", state: "PA", latitude: 40.435214, longitude: -76.568661 },
  { icao: "KMUO", faa: "MUO", iata: "MUO", name: "Mountain Home Air Force Base", city: "Mountain Home", state: "ID", latitude: 43.043598, longitude: -115.872002 },
  { icao: "KMWA", faa: "MWA", iata: "MWA", name: "Veterans Airport of Southern Illinois", city: "Marion", state: "IL", latitude: 37.751208, longitude: -89.016568 },
  { icao: "KMWC", faa: "MWC", name: "Lawrence J. Timmerman Airport", city: "Milwaukee", state: "WI", latitude: 43.1104, longitude: -88.0344 },
  { icao: "KMWH", faa: "MWH", iata: "MWH", name: "Grant County International Airport", city: "Moses Lake", state: "WA", latitude: 47.207699, longitude: -119.32 },
  { icao: "KMWL", faa: "MWL", iata: "MWL", name: "Mineral Wells Regional Airport", city: "Mineral Wells", state: "TX", latitude: 32.781601, longitude: -98.060204 },
  { icao: "KMXF", faa: "MXF", iata: "MXF", name: "Maxwell Air Force Base", city: "Montgomery", state: "AL", latitude: 32.3829, longitude: -86.365799 },
  { icao: "KMYF", faa: "MYF", iata: "MYF", name: "Montgomery-Gibbs Executive Airport", city: "San Diego", state: "CA", latitude: 32.8157, longitude: -117.1399 },
  { icao: "KMYL", faa: "MYL", iata: "MYL", name: "McCall Municipal Airport", city: "McCall", state: "ID", latitude: 44.888837, longitude: -116.101112 },
  { icao: "KMYR", faa: "MYR", iata: "MYR", name: "Myrtle Beach International Airport", city: "Myrtle Beach", state: "SC", latitude: 33.679699, longitude: -78.928299 },
  { icao: "KMYV", faa: "MYV", iata: "MYV", name: "Yuba County Airport", city: "Marysville", state: "CA", latitude: 39.097801, longitude: -121.57 },
  { icao: "KNBC", faa: "NBC", name: "Beaufort MCAS - Merritt Field", city: "Beaufort", state: "SC", latitude: 32.477402, longitude: -80.723198 },
  { icao: "KNBG", faa: "NBG", iata: "NBG", name: "New Orleans NAS JRB/Alvin Callender Field", city: "New Orleans", state: "LA", latitude: 29.8253, longitude: -90.035004 },
  { icao: "KNCA", faa: "NCA", name: "MCAS New River / McCutcheon Field", city: "Jacksonville", state: "NC", latitude: 34.708401, longitude: -77.439697 },
  { icao: "KNDZ", faa: "NDZ", name: "Whiting Field Naval Air Station South Airport", city: "Milton", state: "FL", latitude: 30.704399, longitude: -87.023003 },
  { icao: "KNEL", faa: "NEL", iata: "NEL", name: "Lakehurst Maxfield Field Airport", city: "Lakehurst", state: "NJ", latitude: 40.033298, longitude: -74.353302 },
  { icao: "KNEW", faa: "NEW", iata: "NEW", name: "Lakefront Airport", city: "New Orleans", state: "LA", latitude: 30.0424, longitude: -90.028297 },
  { icao: "KNFG", faa: "NFG", name: "Camp Pendleton MCAS (Munn Field) Airport", city: "Oceanside", state: "CA", latitude: 33.3013, longitude: -117.355003 },
  { icao: "KNFL", faa: "NFL", iata: "NFL", name: "Fallon Naval Air Station", city: "Fallon", state: "NV", latitude: 39.416599, longitude: -118.700996 },
  { icao: "KNFW", faa: "NFW", iata: "FWH", name: "NAS Fort Worth JRB / Carswell Field", city: "Fort Worth", state: "TX", latitude: 32.769199, longitude: -97.441498 },
  { icao: "KNGP", faa: "NGP", iata: "NGP", name: "Naval Air Station Corpus Christi Truax Field", city: "Corpus Christi", state: "TX", latitude: 27.6926, longitude: -97.2911 },
  { icao: "KNGU", faa: "NGU", iata: "NGU", name: "Norfolk Naval Station (Chambers Field)", city: "Norfolk", state: "VA", latitude: 36.937599, longitude: -76.289299 },
  { icao: "KNHK", faa: "NHK", iata: "NHK", name: "Patuxent River Naval Air Station (Trapnell Field)", city: "Patuxent River", state: "MD", latitude: 38.285999, longitude: -76.411797 },
  { icao: "KNID", faa: "NID", name: "China Lake Naws (Armitage Field) Airport", city: "China Lake", state: "CA", latitude: 35.685398, longitude: -117.692001 },
  { icao: "KNIP", faa: "NIP", iata: "NIP", name: "Jacksonville Naval Air Station (Towers Field)", city: "Jacksonville", state: "FL", latitude: 30.2358, longitude: -81.680603 },
  { icao: "KNJK", faa: "NJK", iata: "NJK", name: "El Centro NAF Airport (Vraciu Field)", city: "El Centro", state: "CA", latitude: 32.829201, longitude: -115.671996 },
  { icao: "KNKT", faa: "NKT", name: "Cherry Point MCAS / Cunningham Field/", city: "Cherry Point", state: "NC", latitude: 34.900902, longitude: -76.880699 },
  { icao: "KNKX", faa: "NKX", iata: "NKX", name: "Miramar Marine Corps Air Station - Mitscher Field", city: "San Diego", state: "CA", latitude: 32.868401, longitude: -117.142998 },
  { icao: "KNLC", faa: "NLC", iata: "NLC", name: "Lemoore Naval Air Station (Reeves Field) Airport", city: "Lemoore", state: "CA", latitude: 36.333, longitude: -119.952004 },
  { icao: "KNMM", faa: "NMM", name: "Naval Air Station Meridian / McCain Field", city: "Lauderdale", state: "MS", latitude: 32.5531, longitude: -88.55406 },
  { icao: "KNPA", faa: "NPA", iata: "NPA", name: "Naval Air Station Pensacola Forrest Sherman Field", city: "Pensacola", state: "FL", latitude: 30.352699, longitude: -87.318604 },
  { icao: "KNQA", faa: "NQA", iata: "NQA", name: "Millington-Memphis Airport", city: "Millington", state: "TN", latitude: 35.356701, longitude: -89.8703 },
  { icao: "KNQI", faa: "NQI", iata: "NQI", name: "Kingsville Naval Air Station", city: "Kingsville", state: "TX", latitude: 27.5072, longitude: -97.8097 },
  { icao: "KNQX", faa: "NQX", iata: "NQX", name: "Naval Air Station Key West/Boca Chica Field", city: "Key West", state: "FL", latitude: 24.5758, longitude: -81.688904 },
  { icao: "KNRB", faa: "NRB", iata: "NRB", name: "Naval Station Mayport / Admiral David L McDonald Field", city: "Jacksonville", state: "FL", latitude: 30.3911, longitude: -81.424698 },
  { icao: "KNSE", faa: "NSE", iata: "NSE", name: "Whiting Field Naval Air Station - North", city: "Milton", state: "FL", latitude: 30.724199, longitude: -87.021896 },
  { icao: "KNTD", faa: "NTD", iata: "NTD", name: "Point Mugu Naval Air Station (Naval Base Ventura Co)", city: "Point Mugu", state: "CA", latitude: 34.1203, longitude: -119.121002 },
  { icao: "KNTU", faa: "NTU", iata: "NTU", name: "Oceana Naval Air Station", city: "Virginia Beach", state: "VA", latitude: 36.820702, longitude: -76.033501 },
  { icao: "KNUQ", faa: "NUQ", iata: "NUQ", name: "Moffett Federal Airfield", city: "Mountain View", state: "CA", latitude: 37.4161, longitude: -122.049004 },
  { icao: "KNUW", faa: "NUW", iata: "NUW", name: "Naval Air Station Whidbey Island", city: "Oak Harbor", state: "WA", latitude: 48.351799, longitude: -122.655998, aliases: ["Whidbey", "Whidbey Approach", "Whidbey Island"] },
  { icao: "KNXP", faa: "NXP", name: "Twentynine Palms Strategic Expeditionary Landing Field", city: "Twentynine Palms", state: "CA", latitude: 34.2962, longitude: -116.162003 },
  { icao: "KNYG", faa: "NYG", iata: "NYG", name: "Quantico Marine Corps Airfield / Turner Field", city: "Quantico", state: "VA", latitude: 38.501701, longitude: -77.305298 },
  { icao: "KNYL", faa: "NYL", iata: "YUM", name: "Yuma International Airport / Marine Corps Air Station Yuma", city: "Yuma", state: "AZ", latitude: 32.650938, longitude: -114.609375 },
  { icao: "KNZY", faa: "NZY", iata: "NZY", name: "North Island Naval Air Station-Halsey Field", city: "San Diego", state: "CA", latitude: 32.6992, longitude: -117.214996 },
  { icao: "KOAJ", faa: "OAJ", iata: "OAJ", name: "Albert J Ellis Airport", city: "Richlands", state: "NC", latitude: 34.829201, longitude: -77.612099 },
  { icao: "KOAK", faa: "OAK", iata: "OAK", name: "Oakland San Francisco Bay Airport", city: "Oakland", state: "CA", latitude: 37.720085, longitude: -122.221184 },
  { icao: "KOFF", faa: "OFF", iata: "OFF", name: "Offutt Air Force Base", city: "Omaha", state: "NE", latitude: 41.119307, longitude: -95.90851 },
  { icao: "KOFK", faa: "OFK", iata: "OFK", name: "Karl Stefan Memorial Airport", city: "Norfolk", state: "NE", latitude: 41.9855, longitude: -97.435097 },
  { icao: "KOGB", faa: "OGB", iata: "OGB", name: "Orangeburg Municipal Airport", city: "Orangeburg", state: "SC", latitude: 33.456799, longitude: -80.859497 },
  { icao: "KOGD", faa: "OGD", iata: "OGD", name: "Ogden Hinckley Airport", city: "Ogden", state: "UT", latitude: 41.1959, longitude: -112.012001 },
  { icao: "KOGS", faa: "OGS", iata: "OGS", name: "Ogdensburg International Airport", city: "Ogdensburg", state: "NY", latitude: 44.6819, longitude: -75.4655 },
  { icao: "KOJC", faa: "OJC", name: "Johnson County Executive Airport", city: "Olathe", state: "KS", latitude: 38.8476, longitude: -94.7376 },
  { icao: "KOKB", faa: "OKB", iata: "OCN", name: "Oceanside Municipal Airport", city: "Oceanside", state: "CA", latitude: 33.217947, longitude: -117.351683 },
  { icao: "KOKC", faa: "OKC", iata: "OKC", name: "OKC Will Rogers World Airport", city: "Oklahoma City", state: "OK", latitude: 35.393388, longitude: -97.598248 },
  { icao: "KOLF", faa: "OLF", iata: "OLF", name: "L M Clayton Airport", city: "Wolf Point", state: "MT", latitude: 48.094501, longitude: -105.574997 },
  { icao: "KOLM", faa: "OLM", iata: "OLM", name: "Olympia Regional Airport", city: "Olympia", state: "WA", latitude: 46.969399, longitude: -122.903 },
  { icao: "KOLS", faa: "OLS", iata: "OLS", name: "Nogales International Airport", city: "Nogales", state: "AZ", latitude: 31.4177, longitude: -110.848 },
  { icao: "KOLU", faa: "OLU", iata: "OLU", name: "Columbus Municipal Airport", city: "Columbus", state: "NE", latitude: 41.448145, longitude: -97.340174 },
  { icao: "KOLV", faa: "OLV", name: "Olive Branch Airport", city: "Olive Branch", state: "MS", latitude: 34.9787, longitude: -89.787 },
  { icao: "KOMA", faa: "OMA", iata: "OMA", name: "Eppley Airfield", city: "Omaha", state: "NE", latitude: 41.3032, longitude: -95.894096 },
  { icao: "KONO", faa: "ONO", iata: "ONO", name: "Ontario Municipal Airport", city: "Oregon", state: "OR", latitude: 44.0198, longitude: -117.013289 },
  { icao: "KONP", faa: "ONP", iata: "ONP", name: "Newport Municipal Airport", city: "Newport", state: "OR", latitude: 44.580399, longitude: -124.057999 },
  { icao: "KONT", faa: "ONT", iata: "ONT", name: "Ontario International Airport", city: "Ontario", state: "CA", latitude: 34.056, longitude: -117.600998 },
  { icao: "KOPF", faa: "OPF", iata: "OPF", name: "Miami-Opa Locka Executive Airport", city: "Miami", state: "FL", latitude: 25.907, longitude: -80.278397 },
  { icao: "KOQU", faa: "OQU", iata: "NCO", name: "Quonset State Airport", city: "North Kingstown", state: "RI", latitude: 41.597099, longitude: -71.412102 },
  { icao: "KORD", faa: "ORD", iata: "ORD", name: "Chicago O'Hare Intl", city: "Chicago", state: "IL", latitude: 41.9786, longitude: -87.9048, aliases: ["Chicago Approach", "C90"] },
  { icao: "KORF", faa: "ORF", iata: "ORF", name: "Norfolk International Airport", city: "Norfolk", state: "VA", latitude: 36.895341, longitude: -76.201 },
  { icao: "KORH", faa: "ORH", iata: "ORH", name: "Worcester Regional Airport", city: "Worcester", state: "MA", latitude: 42.2673, longitude: -71.875702 },
  { icao: "KORL", faa: "ORL", iata: "ORL", name: "Orlando Executive Airport", city: "Orlando", state: "FL", latitude: 28.5455, longitude: -81.332901 },
  { icao: "KORS", faa: "ORS", iata: "ESD", name: "Orcas Island Airport", city: "Eastsound", state: "WA", latitude: 48.708199, longitude: -122.910004 },
  { icao: "KOSH", faa: "OSH", iata: "OSH", name: "Wittman Regional Airport", city: "Oshkosh", state: "WI", latitude: 43.984402, longitude: -88.556999 },
  { icao: "KOSU", faa: "OSU", iata: "OSU", name: "The Ohio State University Airport - Don Scott Field", city: "Columbus", state: "OH", latitude: 40.0798, longitude: -83.072998 },
  { icao: "KOTH", faa: "OTH", iata: "OTH", name: "Southwest Oregon Regional Airport", city: "North Bend", state: "OR", latitude: 43.417099, longitude: -124.246002 },
  { icao: "KOTM", faa: "OTM", iata: "OTM", name: "Ottumwa Regional Airport", city: "Ottumwa", state: "IA", latitude: 41.106368, longitude: -92.449837 },
  { icao: "KOWB", faa: "OWB", iata: "OWB", name: "Owensboro Daviess County Airport", city: "Owensboro", state: "KY", latitude: 37.740101, longitude: -87.166801 },
  { icao: "KOWD", faa: "OWD", iata: "OWD", name: "Norwood Memorial Airport", city: "Norwood", state: "MA", latitude: 42.190498, longitude: -71.172897 },
  { icao: "KOXB", faa: "OXB", iata: "OCE", name: "Ocean City Municipal Airport", city: "Ocean City", state: "MD", latitude: 38.310398, longitude: -75.124001 },
  { icao: "KOXR", faa: "OXR", iata: "OXR", name: "Oxnard Airport", city: "Oxnard", state: "CA", latitude: 34.200802, longitude: -119.207001 },
  { icao: "KOZR", faa: "OZR", iata: "OZR", name: "Cairns AAF (Fort Rucker) Air Field", city: "Fort Rucker/Ozark", state: "AL", latitude: 31.2757, longitude: -85.713402 },
  { icao: "KPAE", faa: "PAE", iata: "PAE", name: "Seattle Paine Field International Airport", city: "Everett", state: "WA", latitude: 47.9063, longitude: -122.281998, runways: ["16L", "16R", "34L", "34R"] },
  { icao: "KPAH", faa: "PAH", iata: "PAH", name: "Barkley Regional Airport", city: "Paducah", state: "KY", latitude: 37.060799, longitude: -88.773804 },
  { icao: "KPAM", faa: "PAM", iata: "PAM", name: "Tyndall Air Force Base", city: "Panama City", state: "FL", latitude: 30.069599, longitude: -85.575401 },
  { icao: "KPAO", faa: "PAO", iata: "PAO", name: "Palo Alto Airport", city: "Palo Alto", state: "CA", latitude: 37.461102, longitude: -122.114998 },
  { icao: "KPBF", faa: "PBF", iata: "PBF", name: "Pine Bluff Regional Airport, Grider Field", city: "Pine Bluff", state: "AR", latitude: 34.174121, longitude: -91.935643 },
  { icao: "KPBG", faa: "PBG", iata: "PBG", name: "Plattsburgh International Airport", city: "Plattsburgh", state: "NY", latitude: 44.650902, longitude: -73.468102 },
  { icao: "KPBI", faa: "PBI", iata: "PBI", name: "Palm Beach International Airport", city: "West Palm Beach", state: "FL", latitude: 26.683201, longitude: -80.095596 },
  { icao: "KPCW", faa: "PCW", name: "Erie-Ottawa International Airport", city: "Port Clinton", state: "OH", latitude: 41.515647, longitude: -82.868328 },
  { icao: "KPDK", faa: "PDK", iata: "PDK", name: "DeKalb Peachtree Airport", city: "Atlanta", state: "GA", latitude: 33.87633, longitude: -84.30213 },
  { icao: "KPDT", faa: "PDT", iata: "PDT", name: "Eastern Oregon Regional Airport at Pendleton", city: "Pendleton", state: "OR", latitude: 45.695099, longitude: -118.841003 },
  { icao: "KPDX", faa: "PDX", iata: "PDX", name: "Portland Intl", city: "Portland", state: "OR", latitude: 45.588699, longitude: -122.598, aliases: ["Portland Approach"] },
  { icao: "KPGA", faa: "PGA", iata: "PGA", name: "Page Municipal Airport", city: "Page", state: "AZ", latitude: 36.924234, longitude: -111.447716 },
  { icao: "KPGD", faa: "PGD", iata: "PGD", name: "Punta Gorda Airport", city: "Punta Gorda", state: "FL", latitude: 26.9202, longitude: -81.990501 },
  { icao: "KPGV", faa: "PGV", iata: "PGV", name: "Pitt-Greenville Airport", city: "Greenville", state: "NC", latitude: 35.635535, longitude: -77.384262 },
  { icao: "KPHF", faa: "PHF", iata: "PHF", name: "Newport News Williamsburg International Airport", city: "Newport News", state: "VA", latitude: 37.131901, longitude: -76.492996 },
  { icao: "KPHL", faa: "PHL", iata: "PHL", name: "Philadelphia International Airport", city: "Philadelphia", state: "PA", latitude: 39.871899, longitude: -75.241096 },
  { icao: "KPHX", faa: "PHX", iata: "PHX", name: "Phoenix Sky Harbor International Airport", city: "Phoenix", state: "AZ", latitude: 33.435302, longitude: -112.005905, aliases: ["Phoenix Approach", "P50"] },
  { icao: "KPIA", faa: "PIA", iata: "PIA", name: "General Wayne A. Downing Peoria International Airport", city: "Peoria", state: "IL", latitude: 40.663841, longitude: -89.692631 },
  { icao: "KPIB", faa: "PIB", iata: "PIB", name: "Hattiesburg Laurel Regional Airport", city: "Moselle", state: "MS", latitude: 31.4671, longitude: -89.337097 },
  { icao: "KPIE", faa: "PIE", iata: "PIE", name: "St. Petersburg Clearwater International Airport", city: "Pinellas Park", state: "FL", latitude: 27.9102, longitude: -82.687401 },
  { icao: "KPIH", faa: "PIH", iata: "PIH", name: "Pocatello Regional Airport", city: "Pocatello", state: "ID", latitude: 42.909801, longitude: -112.596001 },
  { icao: "KPIR", faa: "PIR", iata: "PIR", name: "Pierre Regional Airport", city: "Pierre", state: "SD", latitude: 44.382702, longitude: -100.286003 },
  { icao: "KPIT", faa: "PIT", iata: "PIT", name: "Pittsburgh International Airport", city: "Pittsburgh", state: "PA", latitude: 40.491501, longitude: -80.232903 },
  { icao: "KPKB", faa: "PKB", iata: "PKB", name: "Mid Ohio Valley Regional Airport", city: "Parkersburg (Williamstown)", state: "WV", latitude: 39.3451, longitude: -81.439201 },
  { icao: "KPLN", faa: "PLN", iata: "PLN", name: "Pellston Regional Airport of Emmet County Airport", city: "Pellston", state: "MI", latitude: 45.5709, longitude: -84.7967 },
  { icao: "KPLU", faa: "PLU", iata: "PLU", name: "Pierce County-Thun Field", city: "Puyallup", state: "WA", latitude: 47.1039, longitude: -122.2872 },
  { icao: "KPMD", faa: "PMD", iata: "PMD", name: "Palmdale Regional Airport / USAF Plant 42 Airport", city: "Palmdale", state: "CA", latitude: 34.629398, longitude: -118.084999 },
  { icao: "KPNA", faa: "PNA", iata: "PWY", name: "Ralph Wenz Field", city: "Pinedale", state: "WY", latitude: 42.795502, longitude: -109.806999 },
  { icao: "KPNC", faa: "PNC", iata: "PNC", name: "Ponca City Regional Airport", city: "Ponca City", state: "OK", latitude: 36.731998, longitude: -97.0998 },
  { icao: "KPNE", faa: "PNE", iata: "PNE", name: "Northeast Philadelphia Airport", city: "Philadelphia", state: "PA", latitude: 40.082406, longitude: -75.010614 },
  { icao: "KPNS", faa: "PNS", iata: "PNS", name: "Pensacola International Airport", city: "Pensacola", state: "FL", latitude: 30.472718, longitude: -87.186639 },
  { icao: "KPOB", faa: "POB", iata: "POB", name: "Pope Field", city: "Fort Bragg", state: "NC", latitude: 35.170898, longitude: -79.014503 },
  { icao: "KPOC", faa: "POC", name: "Brackett Field", city: "La Verne", state: "CA", latitude: 34.0916, longitude: -117.7817 },
  { icao: "KPOE", faa: "POE", iata: "POE", name: "Polk Army Air Field", city: "Fort Polk", state: "LA", latitude: 31.0448, longitude: -93.191704 },
  { icao: "KPOU", faa: "POU", iata: "POU", name: "Dutchess County Airport", city: "Poughkeepsie", state: "NY", latitude: 41.626598, longitude: -73.884201 },
  { icao: "KPQI", faa: "PQI", iata: "PQI", name: "Presque Isle International Airport", city: "Presque Isle", state: "ME", latitude: 46.688999, longitude: -68.0448 },
  { icao: "KPRB", faa: "PRB", iata: "PRB", name: "Paso Robles Municipal Airport", city: "Paso Robles", state: "CA", latitude: 35.672901, longitude: -120.626999 },
  { icao: "KPRC", faa: "PRC", iata: "PRC", name: "Prescott Regional Airport - Ernest A. Love Field", city: "Prescott", state: "AZ", latitude: 34.653502, longitude: -112.419883 },
  { icao: "KPRX", faa: "PRX", iata: "PRX", name: "Cox Field", city: "Paris", state: "TX", latitude: 33.6366, longitude: -95.450798 },
  { icao: "KPSC", faa: "PSC", iata: "PSC", name: "Tri Cities Airport", city: "Pasco", state: "WA", latitude: 46.264702, longitude: -119.119003 },
  { icao: "KPSM", faa: "PSM", iata: "PSM", name: "Portsmouth International Airport at Pease", city: "Portsmouth", state: "NH", latitude: 43.0779, longitude: -70.823303 },
  { icao: "KPSP", faa: "PSP", iata: "PSP", name: "Palm Springs International Airport", city: "Palm Springs", state: "CA", latitude: 33.8297, longitude: -116.507004 },
  { icao: "KPTK", faa: "PTK", iata: "PTK", name: "Oakland County International Airport", city: "Pontiac", state: "MI", latitude: 42.665501, longitude: -83.420097 },
  { icao: "KPUB", faa: "PUB", iata: "PUB", name: "Pueblo Memorial Airport", city: "Pueblo", state: "CO", latitude: 38.289101, longitude: -104.497002 },
  { icao: "KPUW", faa: "PUW", iata: "PUW", name: "Pullman-Moscow Regional Airport", city: "Pullman", state: "WA", latitude: 46.741601, longitude: -117.11163 },
  { icao: "KPVD", faa: "PVD", iata: "PVD", name: "Rhode Island T. F. Green International Airport", city: "Providence/Warwick", state: "RI", latitude: 41.725038, longitude: -71.425668 },
  { icao: "KPVU", faa: "PVU", iata: "PVU", name: "Provo Municipal Airport", city: "Provo", state: "UT", latitude: 40.218894, longitude: -111.722445 },
  { icao: "KPWK", faa: "PWK", iata: "PWK", name: "Chicago Executive", city: "Wheeling", state: "IL", latitude: 42.114222, longitude: -87.901494, aliases: ["Chicago Executive", "Palwaukee", "KPWK Airport"] },
  { icao: "KPWM", faa: "PWM", iata: "PWM", name: "Portland International Jetport", city: "Portland", state: "ME", latitude: 43.646198, longitude: -70.309303 },
  { icao: "KPWT", faa: "PWT", iata: "PWT", name: "Bremerton National", city: "Bremerton", state: "WA", latitude: 47.4902, longitude: -122.764999, aliases: ["Bremerton", "Bremerton National", "Bremerton International Airport", "Bremerton Airport", "Seattle Approach"], runways: ["02", "20"] },
  { icao: "KRAC", faa: "RAC", name: "John H. Batten Airport", city: "Racine", state: "WI", latitude: 42.761, longitude: -87.8143 },
  { icao: "KRAL", faa: "RAL", iata: "RAL", name: "Riverside Municipal Airport", city: "Riverside", state: "CA", latitude: 33.9519, longitude: -117.445 },
  { icao: "KRAP", faa: "RAP", iata: "RAP", name: "Rapid City Regional Airport", city: "Rapid City", state: "SD", latitude: 44.0453, longitude: -103.056999 },
  { icao: "KRBD", faa: "RBD", name: "Dallas Executive Airport", city: "Dallas", state: "TX", latitude: 32.6809, longitude: -96.8683 },
  { icao: "KRBL", faa: "RBL", iata: "RBL", name: "Red Bluff Municipal Airport", city: "Red Bluff", state: "CA", latitude: 40.1507, longitude: -122.251999 },
  { icao: "KRCA", faa: "RCA", iata: "RCA", name: "Ellsworth Air Force Base", city: "Rapid City", state: "SD", latitude: 44.145, longitude: -103.103996 },
  { icao: "KRDD", faa: "RDD", iata: "RDD", name: "Redding Municipal Airport", city: "Redding", state: "CA", latitude: 40.508999, longitude: -122.292999 },
  { icao: "KRDG", faa: "RDG", iata: "RDG", name: "Reading Regional Airport (Carl A Spaatz Field)", city: "Reading", state: "PA", latitude: 40.378502, longitude: -75.965202 },
  { icao: "KRDM", faa: "RDM", iata: "RDM", name: "Roberts Field", city: "Redmond", state: "OR", latitude: 44.254101, longitude: -121.150002 },
  { icao: "KRDR", faa: "RDR", iata: "RDR", name: "Grand Forks Air Force Base", city: "Grand Forks", state: "ND", latitude: 47.961102, longitude: -97.401199 },
  { icao: "KRDU", faa: "RDU", iata: "RDU", name: "Raleigh-Durham International Airport", city: "Raleigh/Durham", state: "NC", latitude: 35.878659, longitude: -78.7873 },
  { icao: "KRFD", faa: "RFD", iata: "RFD", name: "Chicago Rockford International Airport", city: "Chicago/Rockford", state: "IL", latitude: 42.1954, longitude: -89.097198 },
  { icao: "KRGA", faa: "RGA", name: "Central Kentucky Regional Airport", city: "Richmond", state: "KY", latitude: 37.630798, longitude: -84.332298 },
  { icao: "KRHI", faa: "RHI", iata: "RHI", name: "Rhinelander Oneida County Airport", city: "Rhinelander", state: "WI", latitude: 45.631199, longitude: -89.467499 },
  { icao: "KRHP", faa: "RHP", name: "Western Carolina Regional Airport", city: "Andrews", state: "NC", latitude: 35.195202, longitude: -83.862999 },
  { icao: "KRIC", faa: "RIC", iata: "RIC", name: "Richmond International Airport", city: "Richmond", state: "VA", latitude: 37.505199, longitude: -77.319702 },
  { icao: "KRIL", faa: "RIL", iata: "RIL", name: "Garfield County Regional Airport", city: "Rifle", state: "CO", latitude: 39.526299, longitude: -107.726997 },
  { icao: "KRIV", faa: "RIV", iata: "RIV", name: "March Air Reserve Base", city: "Riverside", state: "CA", latitude: 33.880699, longitude: -117.259003 },
  { icao: "KRIW", faa: "RIW", iata: "RIW", name: "Central Wyoming Regional Airport", city: "Riverton", state: "WY", latitude: 43.064201, longitude: -108.459999 },
  { icao: "KRKD", faa: "RKD", iata: "RKD", name: "Knox County Regional Airport", city: "Rockland", state: "ME", latitude: 44.060101, longitude: -69.099197 },
  { icao: "KRKS", faa: "RKS", iata: "RKS", name: "Southwest Wyoming Regional Airport", city: "Rock Springs", state: "WY", latitude: 41.5942, longitude: -109.065001 },
  { icao: "KRME", faa: "RME", iata: "RME", name: "Griffiss International Airport", city: "Rome", state: "NY", latitude: 43.233799, longitude: -75.406998 },
  { icao: "KRMG", faa: "RMG", iata: "RMG", name: "Richard B Russell Airport", city: "Rome", state: "GA", latitude: 34.350601, longitude: -85.157997 },
  { icao: "KRND", faa: "RND", iata: "RND", name: "Randolph Air Force Base", city: "Universal City", state: "TX", latitude: 29.529699, longitude: -98.2789 },
  { icao: "KRNH", faa: "RNH", iata: "RNH", name: "New Richmond Regional Airport", city: "New Richmond", state: "WI", latitude: 45.1483, longitude: -92.538101 },
  { icao: "KRNM", faa: "RNM", name: "Ramona Airport", city: "Ramona", state: "CA", latitude: 33.0392, longitude: -116.9153 },
  { icao: "KRNO", faa: "RNO", iata: "RNO", name: "Reno Tahoe International Airport", city: "Reno", state: "NV", latitude: 39.4991, longitude: -119.767998 },
  { icao: "KRNT", faa: "RNT", iata: "RNT", name: "Renton Municipal Airport", city: "Renton", state: "WA", latitude: 47.493099, longitude: -122.216003 },
  { icao: "KROA", faa: "ROA", iata: "ROA", name: "Roanoke–Blacksburg Regional Airport", city: "Roanoke", state: "VA", latitude: 37.3255, longitude: -79.975403 },
  { icao: "KROC", faa: "ROC", iata: "ROC", name: "Frederick Douglass Greater Rochester International Airport", city: "Rochester", state: "NY", latitude: 43.1189, longitude: -77.672401 },
  { icao: "KROW", faa: "ROW", iata: "ROW", name: "Roswell Air Center Airport", city: "Roswell", state: "NM", latitude: 33.301601, longitude: -104.530998 },
  { icao: "KRSL", faa: "RSL", iata: "RSL", name: "Russell Municipal Airport", city: "Russell", state: "KS", latitude: 38.872101, longitude: -98.811798 },
  { icao: "KRST", faa: "RST", iata: "RST", name: "Rochester International Airport", city: "Rochester", state: "MN", latitude: 43.908298, longitude: -92.5 },
  { icao: "KRSW", faa: "RSW", iata: "RSW", name: "Southwest Florida International Airport", city: "Fort Myers", state: "FL", latitude: 26.534685, longitude: -81.752816 },
  { icao: "KRUQ", faa: "RUQ", name: "Rowan County Airport", city: "Salisbury", state: "NC", latitude: 35.6464, longitude: -80.5204 },
  { icao: "KRUT", faa: "RUT", iata: "RUT", name: "Rutland - Southern Vermont Regional Airport", city: "Rutland", state: "VT", latitude: 43.5294, longitude: -72.9496 },
  { icao: "KRVS", faa: "RVS", iata: "RVS", name: "Tulsa Riverside Airport", city: "Tulsa", state: "OK", latitude: 36.0396, longitude: -95.984596 },
  { icao: "KRWF", faa: "RWF", iata: "RWF", name: "Redwood Falls Municipal Airport", city: "Redwood Falls", state: "MN", latitude: 44.547199, longitude: -95.082298 },
  { icao: "KRWI", faa: "RWI", iata: "RWI", name: "Rocky Mount Wilson Regional Airport", city: "Rocky Mount", state: "NC", latitude: 35.8563, longitude: -77.891899 },
  { icao: "KRWL", faa: "RWL", iata: "RWL", name: "Rawlins Municipal Airport/Harvey Field", city: "Rawlins", state: "WY", latitude: 41.805599, longitude: -107.199997 },
  { icao: "KRYY", faa: "RYY", name: "Cobb County International Airport-McCollum Field", city: "Atlanta", state: "GA", latitude: 34.01316, longitude: -84.59721 },
  { icao: "KSAC", faa: "SAC", iata: "SAC", name: "Sacramento Executive Airport", city: "Sacramento", state: "CA", latitude: 38.512501, longitude: -121.492996 },
  { icao: "KSAF", faa: "SAF", iata: "SAF", name: "Santa Fe Municipal Airport", city: "Santa Fe", state: "NM", latitude: 35.6171, longitude: -106.088997 },
  { icao: "KSAN", faa: "SAN", iata: "SAN", name: "San Diego International Airport", city: "San Diego", state: "CA", latitude: 32.733601, longitude: -117.190002 },
  { icao: "KSAT", faa: "SAT", iata: "SAT", name: "San Antonio International Airport", city: "San Antonio", state: "TX", latitude: 29.533701, longitude: -98.469803 },
  { icao: "KSAV", faa: "SAV", iata: "SAV", name: "Savannah Hilton Head International Airport", city: "Savannah", state: "GA", latitude: 32.126591, longitude: -81.19998 },
  { icao: "KSAW", faa: "SAW", iata: "MQT", name: "Marquette/Sawyer International Airport", city: "Gwinn", state: "MI", latitude: 46.351498, longitude: -87.395884 },
  { icao: "KSBA", faa: "SBA", iata: "SBA", name: "Santa Barbara Municipal Airport", city: "Santa Barbara", state: "CA", latitude: 34.426201, longitude: -119.839996 },
  { icao: "KSBD", faa: "SBD", iata: "SBD", name: "San Bernardino International Airport", city: "San Bernardino", state: "CA", latitude: 34.096717, longitude: -117.236596 },
  { icao: "KSBN", faa: "SBN", iata: "SBN", name: "South Bend International Airport", city: "South Bend", state: "IN", latitude: 41.708304, longitude: -86.316922 },
  { icao: "KSBP", faa: "SBP", iata: "SBP", name: "San Luis County Regional Airport", city: "San Luis Obispo", state: "CA", latitude: 35.236801, longitude: -120.641998 },
  { icao: "KSBY", faa: "SBY", iata: "SBY", name: "Salisbury Ocean City Wicomico Regional Airport", city: "Salisbury", state: "MD", latitude: 38.3405, longitude: -75.5103 },
  { icao: "KSCH", faa: "SCH", iata: "SCH", name: "Schenectady County Airport", city: "Schenectady", state: "NY", latitude: 42.852501, longitude: -73.928902 },
  { icao: "KSCK", faa: "SCK", iata: "SCK", name: "Stockton Metropolitan Airport", city: "Stockton", state: "CA", latitude: 37.893279, longitude: -121.238079 },
  { icao: "KSDF", faa: "SDF", iata: "SDF", name: "Louisville Muhammad Ali International Airport", city: "Louisville", state: "KY", latitude: 38.1706, longitude: -85.735076 },
  { icao: "KSDL", faa: "SDL", name: "Scottsdale Airport", city: "Scottsdale", state: "AZ", latitude: 33.6229, longitude: -111.9106 },
  { icao: "KSDM", faa: "SDM", iata: "SDM", name: "Brown Field Municipal Airport", city: "San Diego", state: "CA", latitude: 32.572639, longitude: -116.980019 },
  { icao: "KSDY", faa: "SDY", iata: "SDY", name: "Sidney - Richland Regional Airport", city: "Sidney", state: "MT", latitude: 47.705141, longitude: -104.194422 },
  { icao: "KSEA", faa: "SEA", iata: "SEA", name: "Seattle-Tacoma Intl", city: "Seattle", state: "WA", latitude: 47.447943, longitude: -122.310276, aliases: ["Seattle Approach", "Seattle Tacoma International", "Seattle Tacoma International Airport", "SeaTac", "Sea Tac", "Sea-Tac"], runways: ["16L", "16C", "16R", "34L", "34C", "34R"] },
  { icao: "KSEE", faa: "SEE", iata: "SEE", name: "Gillespie Field", city: "El Cajon", state: "CA", latitude: 32.8262, longitude: -116.9724 },
  { icao: "KSET", faa: "SET", name: "St. Charles County Smartt Airport", city: "St. Charles", state: "MO", latitude: 38.9297, longitude: -90.43 },
  { icao: "KSFB", faa: "SFB", iata: "SFB", name: "Orlando Sanford International Airport", city: "Orlando", state: "FL", latitude: 28.774277, longitude: -81.234626 },
  { icao: "KSFF", faa: "SFF", iata: "SFF", name: "Felts Field", city: "Spokane", state: "WA", latitude: 47.682899, longitude: -117.321925 },
  { icao: "KSFO", faa: "SFO", iata: "SFO", name: "San Francisco Intl", city: "San Francisco", state: "CA", latitude: 37.619806, longitude: -122.374821, aliases: ["NorCal Approach", "NorCal"] },
  { icao: "KSGF", faa: "SGF", iata: "SGF", name: "Springfield Branson National Airport", city: "Springfield", state: "MO", latitude: 37.245047, longitude: -93.388596 },
  { icao: "KSGH", faa: "SGH", iata: "SGH", name: "Springfield-Beckley Municipal Airport", city: "Springfield", state: "OH", latitude: 39.840302, longitude: -83.840202 },
  { icao: "KSGJ", faa: "SGJ", iata: "UST", name: "Northeast Florida Regional Airport", city: "St Augustine", state: "FL", latitude: 29.9592, longitude: -81.339798 },
  { icao: "KSGR", faa: "SGR", iata: "SGR", name: "Sugar Land Regional Airport", city: "Houston", state: "TX", latitude: 29.622299, longitude: -95.656502 },
  { icao: "KSGU", faa: "SGU", iata: "SGU", name: "St George Regional Airport", city: "St George", state: "UT", latitude: 37.036389, longitude: -113.510306 },
  { icao: "KSHD", faa: "SHD", iata: "SHD", name: "Shenandoah Valley Regional Airport", city: "Weyers Cave", state: "VA", latitude: 38.263802, longitude: -78.8964 },
  { icao: "KSHR", faa: "SHR", iata: "SHR", name: "Sheridan County Airport", city: "Sheridan", state: "WY", latitude: 44.769199, longitude: -106.980003 },
  { icao: "KSHV", faa: "SHV", iata: "SHV", name: "Shreveport Regional Airport", city: "Shreveport", state: "LA", latitude: 32.446602, longitude: -93.8256 },
  { icao: "KSJC", faa: "SJC", iata: "SJC", name: "Norman Y. Mineta San Jose International Airport", city: "San Jose", state: "CA", latitude: 37.362452, longitude: -121.929188 },
  { icao: "KSJT", faa: "SJT", iata: "SJT", name: "San Angelo Regional Mathis Field", city: "San Angelo", state: "TX", latitude: 31.3577, longitude: -100.496002 },
  { icao: "KSKA", faa: "SKA", iata: "SKA", name: "Fairchild Air Force Base", city: "Spokane", state: "WA", latitude: 47.615101, longitude: -117.655998 },
  { icao: "KSKF", faa: "SKF", iata: "SKF", name: "Lackland Air Force Base", city: "San Antonio", state: "TX", latitude: 29.384199, longitude: -98.5811 },
  { icao: "KSKX", faa: "SKX", iata: "TSM", name: "Taos Regional Airport", city: "Taos", state: "NM", latitude: 36.452494, longitude: -105.67749 },
  { icao: "KSLC", faa: "SLC", iata: "SLC", name: "Salt Lake City International Airport", city: "Salt Lake City", state: "UT", latitude: 40.78886, longitude: -111.979866 },
  { icao: "KSLE", faa: "SLE", iata: "SLE", name: "Salem-Willamette Valley Airport/McNary Field", city: "Salem", state: "OR", latitude: 44.9095, longitude: -123.002998 },
  { icao: "KSLI", faa: "SLI", name: "Los Alamitos Army Air Field", city: "Los Alamitos", state: "CA", latitude: 33.790864, longitude: -118.050342 },
  { icao: "KSLK", faa: "SLK", iata: "SLK", name: "Adirondack Regional Airport", city: "Saranac Lake", state: "NY", latitude: 44.38691, longitude: -74.204629 },
  { icao: "KSLN", faa: "SLN", iata: "SLN", name: "Salina Municipal Airport", city: "Salina", state: "KS", latitude: 38.791, longitude: -97.652199 },
  { icao: "KSME", faa: "SME", iata: "SME", name: "Lake Cumberland Regional Airport", city: "Somerset", state: "KY", latitude: 37.053398, longitude: -84.615898 },
  { icao: "KSMF", faa: "SMF", iata: "SMF", name: "Sacramento International Airport", city: "Sacramento", state: "CA", latitude: 38.6954, longitude: -121.591003 },
  { icao: "KSMN", faa: "SMN", iata: "SMN", name: "Lemhi County Airport", city: "Salmon", state: "ID", latitude: 45.122233, longitude: -113.88196 },
  { icao: "KSMO", faa: "SMO", iata: "SMO", name: "Santa Monica Municipal Airport", city: "Santa Monica", state: "CA", latitude: 34.0158, longitude: -118.450996 },
  { icao: "KSMX", faa: "SMX", iata: "SMX", name: "Santa Maria Public Airport Captain G Allan Hancock Field", city: "Santa Maria", state: "CA", latitude: 34.898899, longitude: -120.457001 },
  { icao: "KSNA", faa: "SNA", iata: "SNA", name: "John Wayne Orange County International Airport", city: "Santa Ana", state: "CA", latitude: 33.675063, longitude: -117.869281 },
  { icao: "KSNS", faa: "SNS", iata: "SNS", name: "Salinas Municipal Airport", city: "Salinas", state: "CA", latitude: 36.6628, longitude: -121.606003 },
  { icao: "KSNY", faa: "SNY", iata: "SNY", name: "Sidney Municipal Airport Lloyd W Carr Field", city: "Sidney", state: "NE", latitude: 41.101299, longitude: -102.985001 },
  { icao: "KSOA", faa: "SOA", name: "Sonora Municipal Airport", city: "Sonora", state: "TX", latitude: 30.585699, longitude: -100.649002 },
  { icao: "KSOP", faa: "SOP", name: "Moore County Airport", city: "Pinehurst", state: "NC", latitude: 35.2374, longitude: -79.3912 },
  { icao: "KSOW", faa: "SOW", iata: "SOW", name: "Show Low Regional Airport", city: "Show Low", state: "AZ", latitude: 34.264062, longitude: -110.007091 },
  { icao: "KSPB", faa: "SPB", name: "Scappoose Industrial Airpark", city: "Scappoose", state: "OR", latitude: 45.771, longitude: -122.8624 },
  { icao: "KSPI", faa: "SPI", iata: "SPI", name: "Abraham Lincoln Capital Airport", city: "Springfield", state: "IL", latitude: 39.844101, longitude: -89.677902 },
  { icao: "KSPS", faa: "SPS", iata: "SPS", name: "Wichita Falls Municipal Airport / Sheppard Air Force Base", city: "Wichita Falls", state: "TX", latitude: 33.9888, longitude: -98.491898 },
  { icao: "KSQL", faa: "SQL", iata: "SQL", name: "San Carlos Airport", city: "San Carlos", state: "CA", latitude: 37.51313, longitude: -122.250838 },
  { icao: "KSRQ", faa: "SRQ", iata: "SRQ", name: "Sarasota Bradenton International Airport", city: "Sarasota/Bradenton", state: "FL", latitude: 27.394631, longitude: -82.554359 },
  { icao: "KSRR", faa: "SRR", iata: "RUI", name: "Sierra Blanca Regional Airport", city: "Alto", state: "NM", latitude: 33.462799, longitude: -105.535004 },
  { icao: "KSSC", faa: "SSC", iata: "SSC", name: "Shaw Air Force Base", city: "Sumter", state: "SC", latitude: 33.972698, longitude: -80.470596 },
  { icao: "KSSF", faa: "SSF", iata: "SSF", name: "Stinson Municipal Airport", city: "San Antonio", state: "TX", latitude: 29.337, longitude: -98.4711 },
  { icao: "KSSI", faa: "SSI", iata: "SSI", name: "St Simons Island Airport", city: "St Simons Island", state: "GA", latitude: 31.1518, longitude: -81.391296 },
  { icao: "KSTC", faa: "STC", iata: "STC", name: "Saint Cloud Regional Airport", city: "Saint Cloud", state: "MN", latitude: 45.5466, longitude: -94.059898 },
  { icao: "KSTJ", faa: "STJ", iata: "STJ", name: "Rosecrans Memorial Airport", city: "St Joseph", state: "MO", latitude: 39.7719, longitude: -94.909698 },
  { icao: "KSTL", faa: "STL", iata: "STL", name: "St. Louis Lambert International Airport", city: "St Louis", state: "MO", latitude: 38.748697, longitude: -90.370003 },
  { icao: "KSTP", faa: "STP", iata: "STP", name: "Saint Paul Downtown Holman Field", city: "Saint Paul", state: "MN", latitude: 44.93479, longitude: -93.060036 },
  { icao: "KSTS", faa: "STS", iata: "STS", name: "Charles M. Schulz Sonoma County Airport", city: "Santa Rosa", state: "CA", latitude: 38.508999, longitude: -122.813003 },
  { icao: "KSUN", faa: "SUN", iata: "SUN", name: "Friedman Memorial Airport", city: "Hailey", state: "ID", latitude: 43.504398, longitude: -114.295998 },
  { icao: "KSUS", faa: "SUS", iata: "SUS", name: "Spirit of St Louis Airport", city: "St Louis", state: "MO", latitude: 38.662102, longitude: -90.652 },
  { icao: "KSUU", faa: "SUU", iata: "SUU", name: "Travis Air Force Base", city: "Fairfield", state: "CA", latitude: 38.262699, longitude: -121.927002 },
  { icao: "KSUX", faa: "SUX", iata: "SUX", name: "Sioux Gateway Airport / Brigadier General Bud Day Field", city: "Sioux City", state: "IA", latitude: 42.397605, longitude: -96.382237 },
  { icao: "KSUZ", faa: "SUZ", name: "Saline County Regional Airport", city: "Bryant", state: "AR", latitude: 34.590599, longitude: -92.479401 },
  { icao: "KSVC", faa: "SVC", iata: "SVC", name: "Grant County Airport", city: "Silver City", state: "NM", latitude: 32.636701, longitude: -108.154736 },
  { icao: "KSVN", faa: "SVN", iata: "SVN", name: "Hunter Army Air Field", city: "Savannah", state: "GA", latitude: 32.009998, longitude: -81.145699 },
  { icao: "KSVR", faa: "SVR", name: "South Valley Regional Airport", city: "Salt Lake City", state: "UT", latitude: 40.619499, longitude: -111.992996 },
  { icao: "KSWF", faa: "SWF", iata: "SWF", name: "New York Stewart International Airport", city: "Newburgh", state: "NY", latitude: 41.50421, longitude: -74.108901 },
  { icao: "KSWO", faa: "SWO", iata: "SWO", name: "Stillwater Regional Airport", city: "Stillwater", state: "OK", latitude: 36.162132, longitude: -97.085581 },
  { icao: "KSYR", faa: "SYR", iata: "SYR", name: "Syracuse Hancock International Airport", city: "Syracuse", state: "NY", latitude: 43.111198, longitude: -76.1063 },
  { icao: "KSZL", faa: "SZL", iata: "SZL", name: "Whiteman Air Force Base", city: "Knob Noster", state: "MO", latitude: 38.730301, longitude: -93.547897 },
  { icao: "KTBN", faa: "TBN", iata: "TBN", name: "Waynesville-St. Robert Regional Airport-Forney Field", city: "Fort Leonard Wood", state: "MO", latitude: 37.7416, longitude: -92.140701 },
  { icao: "KTCC", faa: "TCC", iata: "TCC", name: "Tucumcari Municipal Airport", city: "Tucumcari", state: "NM", latitude: 35.1828, longitude: -103.602997 },
  { icao: "KTCL", faa: "TCL", iata: "TCL", name: "Tuscaloosa National Airport", city: "Tuscaloosa", state: "AL", latitude: 33.2206, longitude: -87.611397 },
  { icao: "KTCM", faa: "TCM", iata: "TCM", name: "McChord Air Force Base", city: "Tacoma", state: "WA", latitude: 47.137699, longitude: -122.475998 },
  { icao: "KTCS", faa: "TCS", iata: "TCS", name: "Truth or Consequences Municipal Airport", city: "Truth or Consequences", state: "NM", latitude: 33.2369, longitude: -107.272003 },
  { icao: "KTEB", faa: "TEB", iata: "TEB", name: "Teterboro Airport", city: "Teterboro", state: "NJ", latitude: 40.850101, longitude: -74.060799 },
  { icao: "KTEX", faa: "TEX", iata: "TEX", name: "Telluride Regional Airport", city: "Telluride", state: "CO", latitude: 37.9538, longitude: -107.907997 },
  { icao: "KTIK", faa: "TIK", iata: "TIK", name: "Tinker Air Force Base", city: "Oklahoma City", state: "OK", latitude: 35.4147, longitude: -97.386597 },
  { icao: "KTIW", faa: "TIW", iata: "TIW", name: "Tacoma Narrows Airport", city: "Tacoma", state: "WA", latitude: 47.267407, longitude: -122.577295 },
  { icao: "KTIX", faa: "TIX", iata: "TIX", name: "Space Coast Regional Airport", city: "Titusville", state: "FL", latitude: 28.514799, longitude: -80.799202 },
  { icao: "KTLH", faa: "TLH", iata: "TLH", name: "Tallahassee International Airport", city: "Tallahassee", state: "FL", latitude: 30.401209, longitude: -84.35433 },
  { icao: "KTMB", faa: "TMB", iata: "TMB", name: "Miami Executive Airport", city: "Miami", state: "FL", latitude: 25.6479, longitude: -80.4328 },
  { icao: "KTOA", faa: "TOA", iata: "TOA", name: "Zamperini Field", city: "Torrance", state: "CA", latitude: 33.8034, longitude: -118.3396 },
  { icao: "KTOI", faa: "TOI", iata: "TOI", name: "Troy Municipal Airport at N Kenneth Campbell Field", city: "Troy", state: "AL", latitude: 31.860399, longitude: -86.012101 },
  { icao: "KTOL", faa: "TOL", iata: "TOL", name: "Eugene F. Kranz Toledo Express Airport", city: "Toledo", state: "OH", latitude: 41.5868, longitude: -83.8078 },
  { icao: "KTOP", faa: "TOP", iata: "TOP", name: "Philip Billard Municipal Airport", city: "Topeka", state: "KS", latitude: 39.069899, longitude: -95.622606 },
  { icao: "KTPA", faa: "TPA", iata: "TPA", name: "Tampa International Airport", city: "Tampa", state: "FL", latitude: 27.9755, longitude: -82.533203 },
  { icao: "KTPH", faa: "TPH", iata: "TPH", name: "Tonopah Airport", city: "Tonopah", state: "NV", latitude: 38.0602, longitude: -117.086998 },
  { icao: "KTPL", faa: "TPL", iata: "TPL", name: "Draughon Miller Central Texas Regional Airport", city: "Temple", state: "TX", latitude: 31.1525, longitude: -97.407799 },
  { icao: "KTRI", faa: "TRI", iata: "TRI", name: "Tri-Cities Regional TN/VA Airport", city: "Blountville", state: "TN", latitude: 36.475201, longitude: -82.407401 },
  { icao: "KTRK", faa: "TRK", iata: "TKF", name: "Truckee Tahoe Airport", city: "Truckee", state: "CA", latitude: 39.318628, longitude: -120.140562 },
  { icao: "KTRM", faa: "TRM", iata: "TRM", name: "Jacqueline Cochran Regional Airport", city: "Palm Springs", state: "CA", latitude: 33.626701, longitude: -116.160004 },
  { icao: "KTTD", faa: "TTD", iata: "TTD", name: "Portland Troutdale Airport", city: "Portland", state: "OR", latitude: 45.5494, longitude: -122.401001 },
  { icao: "KTTN", faa: "TTN", iata: "TTN", name: "Trenton Mercer Airport", city: "Ewing Township", state: "NJ", latitude: 40.276699, longitude: -74.813499 },
  { icao: "KTTS", faa: "TTS", name: "Space Florida Launch and Landing Facility", city: "Titusville", state: "FL", latitude: 28.615, longitude: -80.694504 },
  { icao: "KTUL", faa: "TUL", iata: "TUL", name: "Tulsa International Airport", city: "Tulsa", state: "OK", latitude: 36.197084, longitude: -95.886225 },
  { icao: "KTUP", faa: "TUP", iata: "TUP", name: "Tupelo Regional Airport", city: "Tupelo", state: "MS", latitude: 34.268101, longitude: -88.769897 },
  { icao: "KTUS", faa: "TUS", iata: "TUS", name: "Tucson International Airport", city: "Tucson", state: "AZ", latitude: 32.115004, longitude: -110.938053 },
  { icao: "KTVC", faa: "TVC", iata: "TVC", name: "Cherry Capital Airport", city: "Traverse City", state: "MI", latitude: 44.741402, longitude: -85.582199 },
  { icao: "KTVF", faa: "TVF", iata: "TVF", name: "Thief River Falls Regional Airport", city: "Thief River Falls", state: "MN", latitude: 48.065701, longitude: -96.184998 },
  { icao: "KTVL", faa: "TVL", iata: "TVL", name: "Lake Tahoe Airport", city: "South Lake Tahoe", state: "CA", latitude: 38.893902, longitude: -119.995003 },
  { icao: "KTWF", faa: "TWF", iata: "TWF", name: "Joslin Field Magic Valley Regional Airport", city: "Twin Falls", state: "ID", latitude: 42.4818, longitude: -114.487999 },
  { icao: "KTXK", faa: "TXK", iata: "TXK", name: "Texarkana Regional Airport (Webb Field)", city: "Texarkana", state: "AR", latitude: 33.453701, longitude: -93.990997 },
  { icao: "KTYR", faa: "TYR", iata: "TYR", name: "Tyler Pounds Regional Airport", city: "Tyler", state: "TX", latitude: 32.354099, longitude: -95.402397 },
  { icao: "KTYS", faa: "TYS", iata: "TYS", name: "McGhee Tyson Airport", city: "Knoxville/Maryville", state: "TN", latitude: 35.811001, longitude: -83.994003 },
  { icao: "KUAO", faa: "UAO", name: "Aurora State Airport", city: "Aurora", state: "OR", latitude: 45.247101, longitude: -122.769997 },
  { icao: "KUES", faa: "UES", name: "Waukesha County Airport", city: "Waukesha", state: "WI", latitude: 43.041, longitude: -88.2371 },
  { icao: "KUGN", faa: "UGN", iata: "UGN", name: "Waukegan National Airport", city: "Waukegan", state: "IL", latitude: 42.4222, longitude: -87.8679 },
  { icao: "KUIN", faa: "UIN", iata: "UIN", name: "Quincy Regional Airport Baldwin Field", city: "Quincy", state: "IL", latitude: 39.942699, longitude: -91.194603 },
  { icao: "KUKI", faa: "UKI", iata: "UKI", name: "Ukiah Municipal Airport", city: "Ukiah", state: "CA", latitude: 39.125999, longitude: -123.200996 },
  { icao: "KUNV", faa: "UNV", iata: "SCE", name: "State College Regional Airport", city: "State College", state: "PA", latitude: 40.849374, longitude: -77.84852 },
  { icao: "KUOX", faa: "UOX", iata: "UOX", name: "University Oxford Airport", city: "Oxford", state: "MS", latitude: 34.3843, longitude: -89.536797 },
  { icao: "KUTS", faa: "UTS", iata: "HTV", name: "Huntsville Regional Airport", city: "Huntsville", state: "TX", latitude: 30.746901, longitude: -95.587196 },
  { icao: "KUUU", faa: "UUU", iata: "NPT", name: "Newport State Airport", city: "Newport", state: "RI", latitude: 41.532207, longitude: -71.281039 },
  { icao: "KVAD", faa: "VAD", iata: "VAD", name: "Moody Air Force Base", city: "Valdosta", state: "GA", latitude: 30.9678, longitude: -83.193001 },
  { icao: "KVBG", faa: "VBG", iata: "VBG", name: "Vandenberg Space Force Base", city: "Lompoc", state: "CA", latitude: 34.737301, longitude: -120.584 },
  { icao: "KVCT", faa: "VCT", iata: "VCT", name: "Victoria Regional Airport", city: "Victoria", state: "TX", latitude: 28.8526, longitude: -96.918503 },
  { icao: "KVDF", faa: "VDF", name: "Tampa Executive Airport", city: "Tampa", state: "FL", latitude: 28.0141, longitude: -82.3453 },
  { icao: "KVEL", faa: "VEL", iata: "VEL", name: "Vernal Regional Airport", city: "Vernal", state: "UT", latitude: 40.436214, longitude: -109.511661 },
  { icao: "KVGT", faa: "VGT", iata: "VGT", name: "North Las Vegas Airport", city: "Las Vegas", state: "NV", latitude: 36.209074, longitude: -115.193982 },
  { icao: "KVIS", faa: "VIS", iata: "VIS", name: "Visalia Municipal Airport", city: "Visalia", state: "CA", latitude: 36.318699, longitude: -119.392998 },
  { icao: "KVLD", faa: "VLD", iata: "VLD", name: "Valdosta Regional Airport", city: "Valdosta", state: "GA", latitude: 30.782499, longitude: -83.276703 },
  { icao: "KVNY", faa: "VNY", iata: "VNY", name: "Van Nuys Airport", city: "Van Nuys", state: "CA", latitude: 34.209801, longitude: -118.489998 },
  { icao: "KVOK", faa: "VOK", iata: "VOK", name: "Volk Field", city: "Camp Douglas", state: "WI", latitude: 43.938999, longitude: -90.253403 },
  { icao: "KVPS", faa: "VPS", iata: "VPS", name: "Destin-Fort Walton Beach Airport", city: "Valparaiso", state: "FL", latitude: 30.481315, longitude: -86.515839 },
  { icao: "KVPZ", faa: "VPZ", iata: "VPZ", name: "Porter County Municipal Airport", city: "Valparaiso", state: "IN", latitude: 41.453999, longitude: -87.007103 },
  { icao: "KVQQ", faa: "VQQ", iata: "VQQ", name: "Cecil Airport", city: "Jacksonville", state: "FL", latitude: 30.2187, longitude: -81.876701 },
  { icao: "KVRB", faa: "VRB", iata: "VRB", name: "Vero Beach Regional Airport", city: "Vero Beach", state: "FL", latitude: 27.6556, longitude: -80.417901 },
  { icao: "KVTN", faa: "VTN", iata: "VTN", name: "Miller Field", city: "Valentine", state: "NE", latitude: 42.856211, longitude: -100.549192 },
  { icao: "KVUO", faa: "VUO", name: "Pearson Field", city: "Vancouver", state: "WA", latitude: 45.6205, longitude: -122.6565 },
  { icao: "KW63", faa: "W63", name: "Lake Country Regional Airport", city: "Clarksville", state: "VA", latitude: 36.595798, longitude: -78.560097 },
  { icao: "KWJF", faa: "WJF", iata: "WJF", name: "General William J Fox Airfield", city: "Lancaster", state: "CA", latitude: 34.7411, longitude: -118.219002 },
  { icao: "KWMC", faa: "WMC", iata: "WMC", name: "Winnemucca Municipal Airport", city: "Winnemucca", state: "NV", latitude: 40.896599, longitude: -117.806 },
  { icao: "KWRB", faa: "WRB", iata: "WRB", name: "Robins Air Force Base", city: "Warner Robins", state: "GA", latitude: 32.640099, longitude: -83.591904 },
  { icao: "KWRI", faa: "WRI", iata: "WRI", name: "Mc Guire Air Force Base", city: "Wrightstown", state: "NJ", latitude: 40.015598, longitude: -74.591698 },
  { icao: "KWRL", faa: "WRL", iata: "WRL", name: "Worland Municipal Airport", city: "Worland", state: "WY", latitude: 43.965698, longitude: -107.950996 },
  { icao: "KWST", faa: "WST", iata: "WST", name: "Westerly State Airport", city: "Westerly", state: "RI", latitude: 41.349602, longitude: -71.803398 },
  { icao: "KWWD", faa: "WWD", iata: "WWD", name: "Cape May County Airport", city: "Wildwood", state: "NJ", latitude: 39.008499, longitude: -74.908302 },
  { icao: "KWWR", faa: "WWR", iata: "WWR", name: "West Woodward Airport", city: "Woodward", state: "OK", latitude: 36.438, longitude: -99.522667 },
  { icao: "KWYS", faa: "WYS", iata: "WYS", name: "Yellowstone Airport", city: "West Yellowstone", state: "MT", latitude: 44.6884, longitude: -111.117996 },
  { icao: "KX51", faa: "X51", name: "Miami Homestead General Aviation Airport", city: "Homestead", state: "FL", latitude: 25.499201, longitude: -80.554296 },
  { icao: "KXMR", faa: "XMR", name: "Cape Canaveral SFS Skid Strip", city: "Cocoa Beach", state: "FL", latitude: 28.4676, longitude: -80.566597 },
  { icao: "KXNA", faa: "XNA", iata: "XNA", name: "Northwest Arkansas National Airport", city: "Fayetteville/Springdale/Rogers", state: "AR", latitude: 36.281898, longitude: -94.306801 },
  { icao: "KXTA", faa: "XTA", name: "Homey (Area 51) Airport", city: "Groom Lake", state: "NV", latitude: 37.235001, longitude: -115.810997 },
  { icao: "KXWA", faa: "XWA", iata: "XWA", name: "Williston Basin International Airport", city: "Williston", state: "ND", latitude: 48.260863, longitude: -103.75116 },
  { icao: "KYIP", faa: "YIP", iata: "YIP", name: "Willow Run Airport", city: "Detroit", state: "MI", latitude: 42.2379, longitude: -83.530403 },
  { icao: "KYKM", faa: "YKM", iata: "YKM", name: "Yakima Air Terminal McAllister Field", city: "Yakima", state: "WA", latitude: 46.568199, longitude: -120.543999 },
  { icao: "KYKN", faa: "YKN", iata: "YKN", name: "Chan Gurney Municipal Airport", city: "Yankton", state: "SD", latitude: 42.916698, longitude: -97.385902 },
  { icao: "KYNG", faa: "YNG", iata: "YNG", name: "Youngstown Warren Regional Airport", city: "Youngstown/Warren", state: "OH", latitude: 41.2607, longitude: -80.6791 },
  { icao: "KZPH", faa: "ZPH", name: "Zephyrhills Municipal Airport", city: "Zephyrhills", state: "FL", latitude: 28.2283, longitude: -82.1559 },
  { icao: "KZZV", faa: "ZZV", iata: "ZZV", name: "Zanesville Municipal Airport", city: "Zanesville", state: "OH", latitude: 39.944401, longitude: -81.892097 },
  { icao: "PAAQ", faa: "PAQ", iata: "PAQ", name: "Warren \"Bud\" Woods Palmer Municipal Airport", city: "Palmer", state: "AK", latitude: 61.594898, longitude: -149.08901 },
  { icao: "PABA", faa: "BTI", iata: "BTI", name: "Barter Island Long Range Radar Station Airport", city: "Barter Island", state: "AK", latitude: 70.134003, longitude: -143.582001 },
  { icao: "PABE", faa: "BET", iata: "BET", name: "Bethel Airport", city: "Bethel", state: "AK", latitude: 60.7798, longitude: -161.837997 },
  { icao: "PABI", faa: "BIG", iata: "BIG", name: "Allen Army Airfield", city: "Delta Junction Ft Greely", state: "AK", latitude: 63.994499, longitude: -145.722 },
  { icao: "PABR", faa: "BRW", iata: "BRW", name: "Wiley Post Will Rogers Memorial Airport", city: "Utqiaġvik", state: "AK", latitude: 71.285402, longitude: -156.766008 },
  { icao: "PABV", faa: "BCV", name: "Birchwood Airport", city: "Birchwood", state: "AK", latitude: 61.4165, longitude: -149.507004 },
  { icao: "PACD", faa: "CDB", iata: "CDB", name: "Cold Bay Airport", city: "Cold Bay", state: "AK", latitude: 55.207871, longitude: -162.725029 },
  { icao: "PACL", faa: "Z84", name: "Clear Airport", city: "Clear", state: "AK", latitude: 64.299738, longitude: -149.117432 },
  { icao: "PACV", faa: "CDV", iata: "CDV", name: "Merle K (Mudhole) Smith Airport", city: "Cordova", state: "AK", latitude: 60.491798, longitude: -145.477997 },
  { icao: "PACZ", faa: "CZF", iata: "CZF", name: "Cape Romanzof LRRS Airport", city: "Cape Romanzof", state: "AK", latitude: 61.7803, longitude: -166.039002 },
  { icao: "PADE", faa: "DEE", iata: "DRG", name: "Deering Airport", city: "Deering", state: "AK", latitude: 66.068901, longitude: -162.766914 },
  { icao: "PADK", faa: "ADK", iata: "ADK", name: "Adak Airport", city: "Adak", state: "AK", latitude: 51.883564, longitude: -176.642783 },
  { icao: "PADL", faa: "DLG", iata: "DLG", name: "Dillingham Airport", city: "Dillingham", state: "AK", latitude: 59.044701, longitude: -158.505005 },
  { icao: "PADQ", faa: "ADQ", iata: "ADQ", name: "Kodiak Airport", city: "Kodiak", state: "AK", latitude: 57.75, longitude: -152.494003 },
  { icao: "PADU", faa: "DUT", iata: "DUT", name: "Tom Madsen (Dutch Harbor) Airport", city: "Unalaska", state: "AK", latitude: 53.89881, longitude: -166.544996 },
  { icao: "PAED", faa: "EDF", iata: "EDF", name: "Elmendorf Air Force Base", city: "Anchorage", state: "AK", latitude: 61.251709, longitude: -149.807097 },
  { icao: "PAEH", faa: "EHM", iata: "EHM", name: "Cape Newenham LRRS Airport", city: "Cape Newenham", state: "AK", latitude: 58.6464, longitude: -162.063004 },
  { icao: "PAEI", faa: "EIL", iata: "EIL", name: "Eielson Air Force Base", city: "Fairbanks", state: "AK", latitude: 64.665703, longitude: -147.102005 },
  { icao: "PAEM", faa: "ENM", iata: "EMK", name: "Emmonak Airport", city: "Emmonak", state: "AK", latitude: 62.786098, longitude: -164.490997 },
  { icao: "PAEN", faa: "ENA", iata: "ENA", name: "Kenai Municipal Airport", city: "Kenai", state: "AK", latitude: 60.570946, longitude: -151.245174 },
  { icao: "PAFA", faa: "FAI", iata: "FAI", name: "Fairbanks International Airport", city: "Fairbanks", state: "AK", latitude: 64.815102, longitude: -147.856003 },
  { icao: "PAFB", faa: "FBK", iata: "FBK", name: "Ladd Army Airfield", city: "Fairbanks", state: "AK", latitude: 64.837502, longitude: -147.613998 },
  { icao: "PAFE", faa: "AFE", name: "Kake Airport", city: "Kake", state: "AK", latitude: 56.961312, longitude: -133.910202 },
  { icao: "PAFM", faa: "AFM", iata: "ABL", name: "Ambler Airport", city: "Ambler", state: "AK", latitude: 67.105529, longitude: -157.855339 },
  { icao: "PAGA", faa: "GAL", iata: "GAL", name: "Edward G. Pitka Sr Airport", city: "Galena", state: "AK", latitude: 64.736198, longitude: -156.936997 },
  { icao: "PAGK", faa: "GKN", iata: "GKN", name: "Gulkana Airport", city: "Gulkana", state: "AK", latitude: 62.155859, longitude: -145.454662 },
  { icao: "PAGM", faa: "GAM", iata: "GAM", name: "Gambell Airport", city: "Gambell", state: "AK", latitude: 63.767694, longitude: -171.733303 },
  { icao: "PAGS", faa: "GST", iata: "GST", name: "Gustavus Airport", city: "Gustavus", state: "AK", latitude: 58.425301, longitude: -135.707001 },
  { icao: "PAHC", faa: "HCA", iata: "HCR", name: "Holy Cross Airport", city: "Holy Cross", state: "AK", latitude: 62.188301, longitude: -159.774994 },
  { icao: "PAHL", faa: "HLA", iata: "HSL", name: "Huslia Airport", city: "Huslia", state: "AK", latitude: 65.697899, longitude: -156.350998 },
  { icao: "PAHN", faa: "HNS", iata: "HNS", name: "Haines Airport", city: "Haines", state: "AK", latitude: 59.243921, longitude: -135.523925 },
  { icao: "PAHO", faa: "HOM", iata: "HOM", name: "Homer Airport", city: "Homer", state: "AK", latitude: 59.644456, longitude: -151.479235 },
  { icao: "PAII", faa: "EII", iata: "EGX", name: "Egegik Airport", city: "Egegik", state: "AK", latitude: 58.184386, longitude: -157.374873 },
  { icao: "PAIK", faa: "IAN", iata: "IAN", name: "Bob Baker Memorial Airport", city: "Kiana", state: "AK", latitude: 66.976128, longitude: -160.439014 },
  { icao: "PAIL", faa: "ILI", iata: "ILI", name: "Iliamna Airport", city: "Iliamna", state: "AK", latitude: 59.754398, longitude: -154.910996 },
  { icao: "PAIM", faa: "UTO", iata: "UTO", name: "Indian Mountain LRRS Airport", city: "Utopia Creek", state: "AK", latitude: 65.992798, longitude: -153.703995 },
  { icao: "PAJN", faa: "JNU", iata: "JNU", name: "Juneau International Airport", city: "Juneau", state: "AK", latitude: 58.354935, longitude: -134.574416 },
  { icao: "PAKN", faa: "AKN", iata: "AKN", name: "King Salmon Airport", city: "King Salmon", state: "AK", latitude: 58.677845, longitude: -156.651965 },
  { icao: "PAKP", faa: "AKP", iata: "AKP", name: "Anaktuvuk Pass Airport", city: "Anaktuvuk Pass", state: "AK", latitude: 68.133598, longitude: -151.742996 },
  { icao: "PAKT", faa: "KTN", iata: "KTN", name: "Ketchikan International Airport", city: "Ketchikan", state: "AK", latitude: 55.355598, longitude: -131.714004 },
  { icao: "PAKW", faa: "AKW", iata: "KLW", name: "Klawock Airport", city: "Klawock", state: "AK", latitude: 55.579201, longitude: -133.076004 },
  { icao: "PALU", faa: "LUR", iata: "LUR", name: "Cape Lisburne LRRS Airport", city: "Cape Lisburne", state: "AK", latitude: 68.875099, longitude: -166.110001 },
  { icao: "PAMC", faa: "MCG", iata: "MCG", name: "McGrath Airport", city: "McGrath", state: "AK", latitude: 62.9529, longitude: -155.606003 },
  { icao: "PAMR", faa: "MRI", iata: "MRI", name: "Merrill Field", city: "Anchorage", state: "AK", latitude: 61.212792, longitude: -149.843988 },
  { icao: "PAMY", faa: "MYU", iata: "MYU", name: "Mekoryuk Airport", city: "Mekoryuk", state: "AK", latitude: 60.372338, longitude: -166.269751 },
  { icao: "PANC", faa: "ANC", iata: "ANC", name: "Ted Stevens Anchorage International Airport", city: "Anchorage", state: "AK", latitude: 61.179004, longitude: -149.992561 },
  { icao: "PANI", faa: "ANI", iata: "ANI", name: "Aniak Airport", city: "Aniak", state: "AK", latitude: 61.5816, longitude: -159.542999 },
  { icao: "PANN", faa: "ENN", iata: "ENN", name: "Nenana Municipal Airport", city: "Nenana", state: "AK", latitude: 64.548772, longitude: -149.074516 },
  { icao: "PANT", faa: "ANN", iata: "ANN", name: "Annette Island Airport", city: "Metlakatla", state: "AK", latitude: 55.037663, longitude: -131.572609 },
  { icao: "PANV", faa: "ANV", iata: "ANV", name: "Anvik Airport", city: "Anvik", state: "AK", latitude: 62.646702, longitude: -160.190994 },
  { icao: "PAOM", faa: "OME", iata: "OME", name: "Nome Airport", city: "Nome", state: "AK", latitude: 64.512199, longitude: -165.445007 },
  { icao: "PAOR", faa: "ORT", iata: "ORT", name: "Northway Airport", city: "Northway", state: "AK", latitude: 62.9613, longitude: -141.929001 },
  { icao: "PAOT", faa: "OTZ", iata: "OTZ", name: "Ralph Wien Memorial Airport", city: "Kotzebue", state: "AK", latitude: 66.884697, longitude: -162.598999 },
  { icao: "PAPB", faa: "PBV", iata: "STG", name: "St George Airport", city: "St George", state: "AK", latitude: 56.577345, longitude: -169.663823 },
  { icao: "PAPC", faa: "KPC", iata: "KPC", name: "Port Clarence Coast Guard Station", city: "Port Clarence", state: "AK", latitude: 65.2537, longitude: -166.858994 },
  { icao: "PAPG", faa: "PSG", iata: "PSG", name: "Petersburg James A Johnson Airport", city: "Petersburg", state: "AK", latitude: 56.801701, longitude: -132.945007 },
  { icao: "PAPH", faa: "PTH", iata: "PTH", name: "Port Heiden Airport", city: "Port Heiden", state: "AK", latitude: 56.957893, longitude: -158.630219 },
  { icao: "PAPM", faa: "PTU", iata: "PTU", name: "Platinum Airport", city: "Platinum", state: "AK", latitude: 59.017675, longitude: -161.827927 },
  { icao: "PAQT", faa: "AQT", iata: "NUI", name: "Nuiqsut Airport", city: "Nuiqsut", state: "AK", latitude: 70.209999, longitude: -151.005998 },
  { icao: "PARC", faa: "ARC", iata: "ARC", name: "Arctic Village Airport", city: "Arctic Village", state: "AK", latitude: 68.1147, longitude: -145.578995 },
  { icao: "PARY", faa: "RBY", iata: "RBY", name: "Ruby Airport", city: "Ruby", state: "AK", latitude: 64.727203, longitude: -155.470001 },
  { icao: "PASA", faa: "SVA", iata: "SVA", name: "Savoonga Airport", city: "Savoonga", state: "AK", latitude: 63.686401, longitude: -170.492996 },
  { icao: "PASC", faa: "SCC", iata: "SCC", name: "Deadhorse Airport", city: "Deadhorse", state: "AK", latitude: 70.194702, longitude: -148.464996 },
  { icao: "PASD", faa: "SDP", iata: "SDP", name: "Sand Point Airport", city: "Sand Point", state: "AK", latitude: 55.313908, longitude: -160.522099 },
  { icao: "PASI", faa: "SIT", iata: "SIT", name: "Sitka Rocky Gutierrez Airport", city: "Sitka", state: "AK", latitude: 57.0471, longitude: -135.362 },
  { icao: "PASN", faa: "SNP", iata: "SNP", name: "St Paul Island Airport", city: "St Paul Island", state: "AK", latitude: 57.166311, longitude: -170.222555 },
  { icao: "PASV", faa: "SVW", iata: "SVW", name: "Sparrevohn LRRS Airport", city: "Sparrevohn", state: "AK", latitude: 61.097401, longitude: -155.574005 },
  { icao: "PASX", faa: "SXQ", iata: "SXQ", name: "Soldotna Airport", city: "Soldotna", state: "AK", latitude: 60.474935, longitude: -151.038471 },
  { icao: "PASY", faa: "SYA", iata: "SYA", name: "Eareckson Air Station", city: "Shemya", state: "AK", latitude: 52.712299, longitude: 174.113998 },
  { icao: "PATK", faa: "TKA", iata: "TKA", name: "Talkeetna Airport", city: "Talkeetna", state: "AK", latitude: 62.320499, longitude: -150.093994 },
  { icao: "PATL", faa: "TLJ", iata: "TLJ", name: "Tatalina LRRS Airport", city: "Takotna", state: "AK", latitude: 62.894402, longitude: -155.977005 },
  { icao: "PATQ", faa: "ATK", iata: "ATK", name: "Atqasuk Edward Burnell Sr Memorial Airport", city: "Atqasuk", state: "AK", latitude: 70.46704, longitude: -157.436013 },
  { icao: "PAUN", faa: "UNK", iata: "UNK", name: "Unalakleet Airport", city: "Unalakleet", state: "AK", latitude: 63.888401, longitude: -160.798996 },
  { icao: "PAVD", faa: "VDZ", iata: "VDZ", name: "Valdez Pioneer Field", city: "Valdez", state: "AK", latitude: 61.132712, longitude: -146.246567 },
  { icao: "PAWD", faa: "SWD", iata: "SWD", name: "Seward Airport", city: "Seward", state: "AK", latitude: 60.130478, longitude: -149.418612 },
  { icao: "PAWG", faa: "WRG", iata: "WRG", name: "Wrangell Airport", city: "Wrangell", state: "AK", latitude: 56.484299, longitude: -132.369995 },
  { icao: "PAWI", faa: "AWI", iata: "AIN", name: "Wainwright Airport", city: "Wainwright", state: "AK", latitude: 70.638, longitude: -159.994995 },
  { icao: "PAWS", faa: "IYS", iata: "WWA", name: "Wasilla Airport", city: "Wasilla", state: "AK", latitude: 61.571701, longitude: -149.539993 },
  { icao: "PAYA", faa: "YAK", iata: "YAK", name: "Yakutat Airport", city: "Yakutat", state: "AK", latitude: 59.508717, longitude: -139.660435 },
  { icao: "PFYU", faa: "FYU", iata: "FYU", name: "Fort Yukon Airport", city: "Fort Yukon", state: "AK", latitude: 66.571651, longitude: -145.249987 },
  { icao: "PHBK", faa: "BKH", iata: "BKH", name: "Barking Sands Airport", city: "Kekaha", state: "HI", latitude: 22.0228, longitude: -159.785004 },
  { icao: "PHHI", faa: "HHI", name: "Wheeler Army Airfield", city: "Wahiawa", state: "HI", latitude: 21.4835, longitude: -158.0397 },
  { icao: "PHHN", faa: "HNM", iata: "HNM", name: "Hana Airport", city: "Hana", state: "HI", latitude: 20.795601, longitude: -156.014008 },
  { icao: "PHIK", faa: "HIK", name: "Hickam Air Force Base", city: "Honolulu", state: "HI", latitude: 21.335278, longitude: -157.948333 },
  { icao: "PHJH", faa: "JHM", iata: "JHM", name: "Kapalua Airport", city: "Lahaina", state: "HI", latitude: 20.9629, longitude: -156.673004 },
  { icao: "PHJR", faa: "JRF", iata: "JRF", name: "Kalaeloa Airport", city: "Kapolei", state: "HI", latitude: 21.3074, longitude: -158.070009 },
  { icao: "PHKO", faa: "KOA", iata: "KOA", name: "Ellison Onizuka Kona International Airport at Keāhole", city: "Kailua-Kona", state: "HI", latitude: 19.738783, longitude: -156.045603 },
  { icao: "PHLI", faa: "LIH", iata: "LIH", name: "Lihue Airport", city: "Lihue, Kauai", state: "HI", latitude: 21.974393, longitude: -159.337146 },
  { icao: "PHMK", faa: "MKK", iata: "MKK", name: "Molokai Airport", city: "Kaunakakai", state: "HI", latitude: 21.152901, longitude: -157.095993 },
  { icao: "PHMU", faa: "MUE", iata: "MUE", name: "Waimea Kohala Airport", city: "Waimea (Kamuela)", state: "HI", latitude: 20.001301, longitude: -155.667999 },
  { icao: "PHNG", faa: "NGF", iata: "NGF", name: "Kaneohe Bay MCAS (Marion E. Carl Field) Airport", city: "Kaneohe", state: "HI", latitude: 21.4505, longitude: -157.768005 },
  { icao: "PHNL", faa: "HNL", iata: "HNL", name: "Daniel K. Inouye International Airport", city: "Honolulu, Oahu", state: "HI", latitude: 21.318387, longitude: -157.92567 },
  { icao: "PHNY", faa: "LNY", iata: "LNY", name: "Lanai Airport", city: "Lanai City", state: "HI", latitude: 20.785675, longitude: -156.951324 },
  { icao: "PHOG", faa: "OGG", iata: "OGG", name: "Kahului International Airport", city: "Kahului", state: "HI", latitude: 20.896263, longitude: -156.431837 },
  { icao: "PHTO", faa: "ITO", iata: "ITO", name: "Hilo International Airport", city: "Hilo", state: "HI", latitude: 19.72135, longitude: -155.045428 },
  { icao: "PPIZ", faa: "PIZ", iata: "PIZ", name: "Point Lay LRRS Airport", city: "Point Lay", state: "AK", latitude: 69.732903, longitude: -163.005005 }
];

const AIRPORT_INDEX = new Map<string, AirportReference>();
const normalizeAirportLookupKey = (value: string): string =>
  value
    .trim()
    .toUpperCase()
    .replace(/[^\w\s/]/g, " ")
    .replace(/\s+/g, " ");
const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const AIRPORT_SUFFIX_PATTERNS = [
  /\bINTERNATIONAL AIRPORT\b/g,
  /\bREGIONAL AIRPORT\b/g,
  /\bMUNICIPAL AIRPORT\b/g,
  /\bAIRPORT\b/g,
  /\bINTL\b/g,
  /\bFIELD\b/g
] as const;

const stripAirportSuffixes = (value: string): string => {
  let stripped = normalizeAirportLookupKey(value);

  for (const pattern of AIRPORT_SUFFIX_PATTERNS) {
    stripped = stripped.replace(pattern, " ").replace(/\s+/g, " ").trim();
  }

  return stripped;
};

const appendKey = (keys: Array<{ key: string; partial: boolean }>, key: string, partial: boolean): void => {
  const normalized = normalizeAirportLookupKey(key);

  if (!normalized) {
    return;
  }

  if (partial && normalized.length < 5) {
    return;
  }

  if (keys.some((entry) => entry.key === normalized && entry.partial === partial)) {
    return;
  }

  keys.push({ key: normalized, partial });
};

const createAirportSearchKeys = (airport: AirportReference): Array<{ key: string; partial: boolean }> => {
  const keys: Array<{ key: string; partial: boolean }> = [];
  const names = [airport.name, ...(airport.aliases ?? [])].filter((value): value is string => Boolean(value));

  for (const name of names) {
    appendKey(keys, name, false);

    const stripped = stripAirportSuffixes(name);
    if (stripped !== normalizeAirportLookupKey(name)) {
      appendKey(keys, stripped, true);
    }

    // Generate significant sub-phrases (2+ words, at least 2 content words) from the name
    const words = normalizeAirportLookupKey(name).split(" ").filter(Boolean);
    for (let i = 0; i < words.length; i++) {
      for (let j = i + 2; j <= Math.min(i + 3, words.length); j++) {
        const subPhrase = words.slice(i, j).join(" ");
        if (subPhrase.length >= 8 && !AIRPORT_STOPWORD_KEYS.has(subPhrase)) {
          appendKey(keys, subPhrase, true);
        }
      }
    }

    // Single distinctive words (≥6 chars, not a generic stopword) as partial keys
    for (const word of words) {
      if (word.length >= 6 && !AIRPORT_STOPWORD_KEYS.has(word)) {
        appendKey(keys, word, true);
      }
    }
  }

  appendKey(keys, airport.city, true);
  const strippedCity = stripAirportSuffixes(airport.city);
  if (strippedCity !== normalizeAirportLookupKey(airport.city)) {
    appendKey(keys, strippedCity, true);
  }

  return keys;
};

// Common words that shouldn't be used as standalone airport keys
const AIRPORT_STOPWORD_KEYS = new Set([
  "INTERNATIONAL", "REGIONAL", "MUNICIPAL", "AIRPORT", "FIELD",
  "COUNTY", "NATIONAL", "MEMORIAL", "GENERAL", "AVIATION",
  "APPROACH", "CENTER", "TOWER", "CONTROL", "EXECUTIVE",
  "FACILITY", "LANDING", "LAUNCH", "SERVICE", "SERVICES",
  "FLIGHT", "AIRWAYS", "HELIPORT", "HELIPAD", "AIRPARK",
  "STRIP", "AIRFIELD", "AIRBASE", "DETAILS", "OVERVIEW",
  "WEATHER", "TRAFFIC", "FREQUENCY", "FREQUENCIES", "RUNWAY",
  "RUNWAYS", "DEPARTURE", "ARRIVAL", "PLATES", "INSTRUMENT",
  "INTERNATIONAL AIRPORT", "REGIONAL AIRPORT", "MUNICIPAL AIRPORT"
]);

const findAirportKeyPosition = (input: string, key: string): number => {
  // Match key at word boundary within the input
  const match = new RegExp(`(?:^| )${escapeRegExp(key)}(?= |$)`).exec(input);
  if (match) {
    return match.index;
  }

  // Relaxed: allow key without end boundary for longer keys (≥8 chars)
  if (key.length >= 8) {
    const relaxed = new RegExp(`(?:^| )${escapeRegExp(key)}`).exec(input);
    if (relaxed) {
      return relaxed.index;
    }
  }

  return -1;
};

for (const airport of AIRPORT_REFERENCES) {
  AIRPORT_INDEX.set(airport.icao, airport);
  AIRPORT_INDEX.set(airport.faa, airport);
  AIRPORT_INDEX.set(normalizeAirportLookupKey(airport.name), airport);
  AIRPORT_INDEX.set(normalizeAirportLookupKey(airport.city), airport);

  if (airport.iata) {
    AIRPORT_INDEX.set(airport.iata, airport);
  }

  for (const { key } of createAirportSearchKeys(airport)) {
    AIRPORT_INDEX.set(key, airport);
  }
}

export const findAirportReference = (code: string): AirportReference | null =>
  AIRPORT_INDEX.get(code.trim().toUpperCase()) ?? AIRPORT_INDEX.get(normalizeAirportLookupKey(code)) ?? null;

const NFDC_AIRPORT_URL = "https://nfdc.faa.gov/nfdcApps/services/ajv5/airportDisplay.jsp";

const parseDms = (dms: string): number | null => {
  const m = dms.match(/([\d.]+)-([\d.]+)-([\d.]+)\s*([NSEW])/i);
  if (!m) return null;
  const deg = parseFloat(m[1]) + parseFloat(m[2]) / 60 + parseFloat(m[3]) / 3600;
  return /[SW]/i.test(m[4]) ? -deg : deg;
};

/**
 * Dynamically fetch airport info from FAA NFDC when not in static database.
 * Caches into AIRPORT_INDEX for future lookups within the same server lifetime.
 */
export const fetchAirportFromNfdc = async (code: string): Promise<AirportReference | null> => {
  const normalized = code.trim().toUpperCase();
  const existing = findAirportReference(normalized);
  if (existing) return existing;

  const faaCode = normalized.replace(/^K/, "");
  try {
    const res = await fetch(`${NFDC_AIRPORT_URL}?airportId=${encodeURIComponent(faaCode)}`, {
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Parse airport name from header
    const nameMatch = html.match(/font-weight:\s*bold[^>]*>\s*([^<]+)/i);
    const name = nameMatch?.[1]?.replace(/&nbsp;/g, " ").trim() ?? `Airport ${faaCode}`;

    // Parse city/state from header line (after name)
    const cityMatch = html.match(new RegExp(escapeRegExp(name) + "\\s*<\\/span>\\s*<br[^>]*>\\s*([^,<]+)\\s*,\\s*([A-Z]{2})", "i"));
    const city = cityMatch?.[1]?.trim() ?? "";
    const state = cityMatch?.[2]?.trim() ?? "";

    // Parse lat/lon
    const coordMatch = html.match(/Latitude\/Longitude<\/td>\s*<td[^>]*>\s*([\s\S]*?)<\/td>/i);
    if (!coordMatch) return null;
    const coordText = coordMatch[1].replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    const parts = coordText.split("/").map(s => s.trim());
    if (parts.length < 2) return null;
    const latitude = parseDms(parts[0]);
    const longitude = parseDms(parts[1]);
    if (latitude === null || longitude === null) return null;

    const icao = /^\d/.test(faaCode) ? faaCode : `K${faaCode}`;
    const airport: AirportReference = { icao, faa: faaCode, name, city, state, latitude, longitude };

    // Cache for future lookups
    AIRPORT_INDEX.set(icao, airport);
    AIRPORT_INDEX.set(faaCode, airport);
    if (name) AIRPORT_INDEX.set(normalizeAirportLookupKey(name), airport);

    return airport;
  } catch {
    return null;
  }
};

/** Common city abbreviations/nicknames used in ATC context */
const CITY_ABBREVIATIONS: Record<string, string[]> = {
  "KC": ["KANSAS CITY"],
  "LA": ["LOS ANGELES"],
  "SF": ["SAN FRANCISCO"],
  "NYC": ["NEW YORK"],
  "DC": ["WASHINGTON"],
  "DFW": ["DALLAS", "FORT WORTH"],
  "MSP": ["MINNEAPOLIS", "SAINT PAUL"],
  "ATL": ["ATLANTA"],
  "CHI": ["CHICAGO"],
  "PHX": ["PHOENIX"],
  "PDX": ["PORTLAND"],
  "SEA": ["SEATTLE"],
  "STL": ["SAINT LOUIS", "ST LOUIS"],
  "NOLA": ["NEW ORLEANS"],
  "VEGAS": ["LAS VEGAS"],
  "PHILLY": ["PHILADELPHIA"],
  "JVILLE": ["JACKSONVILLE"],
};

/** Full US state names → abbreviations for disambiguation */
const STATE_NAME_TO_ABBREV: Record<string, string> = {
  "ALABAMA": "AL", "ALASKA": "AK", "ARIZONA": "AZ", "ARKANSAS": "AR",
  "CALIFORNIA": "CA", "COLORADO": "CO", "CONNECTICUT": "CT", "DELAWARE": "DE",
  "FLORIDA": "FL", "GEORGIA": "GA", "HAWAII": "HI", "IDAHO": "ID",
  "ILLINOIS": "IL", "INDIANA": "IN", "IOWA": "IA", "KANSAS": "KS",
  "KENTUCKY": "KY", "LOUISIANA": "LA", "MAINE": "ME", "MARYLAND": "MD",
  "MASSACHUSETTS": "MA", "MICHIGAN": "MI", "MINNESOTA": "MN", "MISSISSIPPI": "MS",
  "MISSOURI": "MO", "MONTANA": "MT", "NEBRASKA": "NE", "NEVADA": "NV",
  "NEW HAMPSHIRE": "NH", "NEW JERSEY": "NJ", "NEW MEXICO": "NM", "NEW YORK": "NY",
  "NORTH CAROLINA": "NC", "NORTH DAKOTA": "ND", "OHIO": "OH", "OKLAHOMA": "OK",
  "OREGON": "OR", "PENNSYLVANIA": "PA", "RHODE ISLAND": "RI", "SOUTH CAROLINA": "SC",
  "SOUTH DAKOTA": "SD", "TENNESSEE": "TN", "TEXAS": "TX", "UTAH": "UT",
  "VERMONT": "VT", "VIRGINIA": "VA", "WASHINGTON": "WA", "WEST VIRGINIA": "WV",
  "WISCONSIN": "WI", "WYOMING": "WY",
};

/** Check if the input text contains a city reference matching the airport */
const hasCityContextMatch = (normalizedInput: string, airport: AirportReference): boolean => {
  const city = normalizeAirportLookupKey(airport.city);
  if (!city) return false;

  // Detect if the user specified a state context
  let inputStateAbbrev: string | null = null;
  const stateAbbrMatch = normalizedInput.match(/\bIN\s+([A-Z]{2})\b/);
  if (stateAbbrMatch) {
    inputStateAbbrev = stateAbbrMatch[1];
  } else {
    for (const [stateName, abbrev] of Object.entries(STATE_NAME_TO_ABBREV)) {
      if (normalizedInput.includes(stateName)) {
        inputStateAbbrev = abbrev;
        break;
      }
    }
  }

  // If a state was specified and this airport is NOT in that state, reject it
  if (inputStateAbbrev && airport.state !== inputStateAbbrev) return false;

  // If a state was specified and this airport IS in that state, it's a match
  if (inputStateAbbrev && airport.state === inputStateAbbrev) return true;

  // Direct city name match
  if (normalizedInput.includes(city)) return true;

  // Check if any word in the input is a known abbreviation for this airport's city
  const inputWords = normalizedInput.split(" ");
  for (const word of inputWords) {
    const expansions = CITY_ABBREVIATIONS[word];
    if (expansions) {
      for (const expansion of expansions) {
        if (city.includes(expansion) || expansion.includes(city)) return true;
      }
    }
  }

  return false;
};

export const findAirportReferencesInText = (input: string): AirportReference[] => {
  const normalizedInput = normalizeAirportLookupKey(input);
  const matches = AIRPORT_REFERENCES.map((airport) => {
    const keyMatches = createAirportSearchKeys(airport)
      .map(({ key, partial }) => ({
        key,
        partial,
        position: findAirportKeyPosition(normalizedInput, key)
      }))
      .filter((match) => match.position >= 0);

    if (!keyMatches.length) {
      return null;
    }

    const bestMatch = keyMatches.sort((left, right) => {
      if (left.position !== right.position) {
        return left.position - right.position;
      }

      if (left.partial !== right.partial) {
        return Number(left.partial) - Number(right.partial);
      }

      return right.key.length - left.key.length;
    })[0];

    return {
      airport,
      position: bestMatch.position,
      keyLength: bestMatch.key.length,
      partial: bestMatch.partial
    };
  })
    .filter((value): value is { airport: AirportReference; position: number; keyLength: number; partial: boolean } => value !== null)
    .sort((left, right) => {
      if (left.position !== right.position) {
        return left.position - right.position;
      }

      if (left.partial !== right.partial) {
        return Number(left.partial) - Number(right.partial);
      }

      // State/city context match is a strong signal — prioritize over key length
      const leftCityMatch = hasCityContextMatch(normalizedInput, left.airport);
      const rightCityMatch = hasCityContextMatch(normalizedInput, right.airport);
      if (leftCityMatch !== rightCityMatch) {
        return leftCityMatch ? -1 : 1;
      }

      if (left.keyLength !== right.keyLength) {
        return right.keyLength - left.keyLength;
      }

      return 0;
    });

  const seen = new Set<string>();
  return matches
    .map(({ airport }) => airport)
    .filter((airport) => {
      if (seen.has(airport.icao)) {
        return false;
      }

      seen.add(airport.icao);
      return true;
    });
};

/**
 * Detect if the top airport match is ambiguous — i.e., multiple airports share
 * the same name-derived matching key without city context to disambiguate.
 * Only triggers for name-word matches, not city matches.
 * Returns the ambiguous candidates if detected, or null if the match is clear.
 */
export const detectAirportAmbiguity = (input: string): { primary: AirportReference; candidates: AirportReference[] } | null => {
  const normalizedInput = normalizeAirportLookupKey(input);

  // Build per-airport match info including which keys matched
  const scored = AIRPORT_REFERENCES.map((airport) => {
    const allKeys = createAirportSearchKeys(airport);
    const nameKeys = new Set(allKeys.filter((_, i) => {
      // Keys from name/aliases are first; city keys are appended at end (line 1068-1072)
      // A key is city-derived if it matches the airport's normalized city
      const normalizedCity = normalizeAirportLookupKey(airport.city);
      return !normalizedCity || allKeys[i].key !== normalizedCity;
    }).map((k) => k.key));

    const keyMatches = allKeys
      .map(({ key, partial }) => ({
        key,
        partial,
        position: findAirportKeyPosition(normalizedInput, key),
        isNameKey: nameKeys.has(key)
      }))
      .filter((match) => match.position >= 0);

    if (!keyMatches.length) return null;

    const bestMatch = keyMatches.sort((left, right) => {
      if (left.position !== right.position) return left.position - right.position;
      if (left.partial !== right.partial) return Number(left.partial) - Number(right.partial);
      return right.key.length - left.key.length;
    })[0];

    return {
      airport,
      position: bestMatch.position,
      keyLength: bestMatch.key.length,
      partial: bestMatch.partial,
      key: bestMatch.key,
      isNameKey: bestMatch.isNameKey,
      cityMatch: hasCityContextMatch(normalizedInput, airport)
    };
  }).filter((v): v is NonNullable<typeof v> => v !== null);

  if (scored.length < 2) return null;

  scored.sort((left, right) => {
    if (left.position !== right.position) return left.position - right.position;
    if (left.partial !== right.partial) return Number(left.partial) - Number(right.partial);
    return right.keyLength - left.keyLength;
  });

  const top = scored[0];

  // Only detect ambiguity for name-based matches (not city)
  // If the top match is via city key, the user is looking for an airport in that city — not ambiguous
  if (!top.isNameKey) return null;

  // Find other airports matching on the SAME name-derived key
  const ambiguous = scored.filter(
    (s) => s.position === top.position && s.partial === top.partial && s.key === top.key
      && s.isNameKey && s.airport.icao !== top.airport.icao
  );

  if (ambiguous.length === 0) return null;

  // If city context already disambiguates, no ambiguity
  const allCandidates = [top, ...ambiguous];
  const withCity = allCandidates.filter((c) => c.cityMatch);
  if (withCity.length === 1) return null;

  return {
    primary: top.airport,
    candidates: allCandidates.map((c) => c.airport)
  };
};

export const toIcaoCode = (code: string): string => findAirportReference(code)?.icao ?? code.trim().toUpperCase();

export const toFaaCode = (code: string): string => findAirportReference(code)?.faa ?? code.trim().toUpperCase().replace(/^K/, "");

export const hasRunwayAtAirport = (airport: string, runway: string): boolean => {
  const reference = findAirportReference(airport);
  return Boolean(reference?.runways?.includes(runway.trim().toUpperCase()));
};

export const toBoundingBox = (
  latitude: number,
  longitude: number,
  radiusNm = 35
): { minLat: number; minLon: number; maxLat: number; maxLon: number } => {
  const latOffset = radiusNm / 60;
  const lonOffset = radiusNm / (60 * Math.max(Math.cos((latitude * Math.PI) / 180), 0.2));

  return {
    minLat: latitude - latOffset,
    minLon: longitude - lonOffset,
    maxLat: latitude + latOffset,
    maxLon: longitude + lonOffset
  };
};

const distanceNm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 3440.065 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const isLikelyWeatherStation = (airport: AirportReference): boolean =>
  /^K[A-Z]{3}$/.test(airport.icao) || /^PH[A-Z]{2}$/.test(airport.icao) || /^PA[A-Z]{2}$/.test(airport.icao);

export const findNearestWeatherStations = (code: string, maxResults = 3): { icao: string; name: string; distanceNm: number }[] => {
  const ref = findAirportReference(code);
  if (!ref) return [];

  if (isLikelyWeatherStation(ref)) {
    return [{ icao: ref.icao, name: ref.name, distanceNm: 0 }];
  }

  return AIRPORT_REFERENCES
    .filter((a) => isLikelyWeatherStation(a) && a.icao !== ref.icao)
    .map((a) => ({ icao: a.icao, name: a.name, distanceNm: distanceNm(ref.latitude, ref.longitude, a.latitude, a.longitude) }))
    .sort((a, b) => a.distanceNm - b.distanceNm)
    .slice(0, maxResults);
};
