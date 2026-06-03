const fs = require('fs');
const path = require('path');

const BASE_CONTENT_DIR = path.resolve(__dirname, '../assets/content');
const LEARNING_CONTENT_TS = path.resolve(__dirname, '../src/content/learningContent.ts');

const CURRICULUM = {
  "6": {
    "science": [
      { id: "ch01_food_sources", title: "Food: Where Does It Come From", titleHi: "भोजन: यह कहाँ से आता है", titleKn: "ಆಹಾರ: ಇದು ಎಲ್ಲಿಂದ ಬರುತ್ತದೆ" },
      { id: "ch02_components_of_food", title: "Components of Food", titleHi: "भोजन के घटक", titleKn: "ಆಹಾರದ ಘಟಕಗಳು" },
      { id: "ch03_fibre_to_fabric", title: "Fibre to Fabric", titleHi: "तंतु से वस्त्र तक", titleKn: "ಎಳೆಯಿಂದ ಬಟ್ಟೆಯವರೆಗೆ" },
      { id: "ch04_sorting_materials", title: "Sorting Materials into Groups", titleHi: "वस्तुओं के समूह बनाना", titleKn: "ವಸ್ತುಗಳನ್ನು ಗುಂಪುಗಳಾಗಿ ವಿಂಗಡಿಸುವುದು" },
      { id: "ch05_separation_of_substances", title: "Separation of Substances", titleHi: "पदार्थों का पृथक्करण", titleKn: "ಪದಾರ್ಥಗಳ ಬೇರ್ಪಡಿಸುವಿಕೆ" },
      { id: "ch06_changes_around_us", title: "Changes Around Us", titleHi: "हमारे चारों ओर के परिवर्तन", titleKn: "ನಮ್ಮ ಸುತ್ತಲಿನ ಬದಲಾವಣೆಗಳು" },
      { id: "ch07_getting_to_know_plants", title: "Getting to Know Plants", titleHi: "पौधों को जानिए", titleKn: "ಸಸ್ಯಗಳನ್ನು ತಿಳಿಯುವುದು" },
      { id: "ch08_body_movements", title: "Body Movements", titleHi: "शरीर में गति", titleKn: "ದೇಹದ ಚಲನೆಗಳು" },
      { id: "ch09_organisms_surroundings", title: "The Living Organisms and Their Surroundings", titleHi: "सजीव - विशेषताएं एवं आवास", titleKn: "ಸಜೀವಿಗಳು ಮತ್ತು ಅವುಗಳ ಸುತ್ತಮುತ್ತಲಿನ ಪರಿಸರ" },
      { id: "ch10_motion_measurement", title: "Motion and Measurement of Distances", titleHi: "गति एवं दूरियों का मापन", titleKn: "ಚಲನೆ ಮತ್ತು ದೂರಗಳ ಅಳತೆ" },
      { id: "ch11_light_shadows", title: "Light, Shadows and Reflections", titleHi: "प्रकाश, छायाएं एवं परावर्तन", titleKn: "ಬೆಳಕು, ನೆರಳು ಮತ್ತು ಪ್ರತಿಫಲನ" },
      { id: "ch12_electricity_circuits", title: "Electricity and Circuits", titleHi: "विद्युत तथा परिपथ", titleKn: "ವಿದ್ಯುತ್ ಮತ್ತು ವಿದ್ಯುತ್ ಮಂಡಲ" },
      { id: "ch13_fun_with_magnets", title: "Fun with Magnets", titleHi: "चुंबकों द्वारा मनोरंजन", titleKn: "ಕಾಂತಗಳೊಂದಿಗೆ ವಿನೋದ" },
      { id: "ch14_water", title: "Water", titleHi: "जल", titleKn: "ನೀರು" },
      { id: "ch15_air_around_us", title: "Air Around Us", titleHi: "हमारे चारों ओर वायु", titleKn: "ನಮ್ಮ ಸುತ್ತಲಿನ ಗಾಳಿ" },
      { id: "ch16_garbage_in_out", title: "Garbage In, Garbage Out", titleHi: "कचरा - संग्रहण एवं निपटान", titleKn: "ತ್ಯಾಜ್ಯ ನಿರ್ವಹಣೆ" }
    ],
    "social": [
      { id: "ch01_history_sources", title: "What, Where, How and When", titleHi: "क्या, कहाँ, कैसे और कब", titleKn: "ಏನು, ಎಲ್ಲಿ, ಹೇಗೆ ಮತ್ತು ಯಾವಾಗ" },
      { id: "ch02_earliest_people", title: "On the Trail of the Earliest People", titleHi: "आरंभिक मानव की खोज में", titleKn: "ಆರಂಭಿಕ ಮಾನವನ ಜಾಡಿನಲ್ಲಿ" },
      { id: "ch03_gathering_growing", title: "From Gathering to Growing Food", titleHi: "भोजन: संग्रह से उत्पादन तक", titleKn: "ಆಹಾರ ಸಂಗ್ರಹಣೆಯಿಂದ ಬೆಳೆಯುವವರೆಗೆ" },
      { id: "ch04_earliest_cities", title: "In the Earliest Cities", titleHi: "आरंभिक नगर", titleKn: "ಆರಂಭಿಕ ನಗರಗಳಲ್ಲಿ" },
      { id: "ch05_books_burials", title: "What Books and Burials Tell Us", titleHi: "क्या बताती हैं हमें किताबें और कब्रें", titleKn: "ಪುಸ್ತಕಗಳು ಮತ್ತು ಸಮಾಧಿಗಳು ನಮಗೆ ತಿಳಿಸುವುದೇನು" },
      { id: "ch06_kingdoms_republic", title: "Kingdoms, Kings and an Early Republic", titleHi: "राज्य, राजा और एक प्राचीन गणराज्य", titleKn: "ರಾಜ್ಯಗಳು, ರಾಜರು ಮತ್ತು ಆರಂಭಿಕ ಗಣರಾಜ್ಯ" },
      { id: "ch07_new_ideas", title: "New Questions and Ideas", titleHi: "नए प्रश्न नए विचार", titleKn: "ಹೊಸ ಪ್ರಶ್ನೆಗಳು ಮತ್ತು ಆಲೋಚನೆಗಳು" },
      { id: "ch08_ashoka_emperor", title: "Ashoka, The Emperor Who Gave Up War", titleHi: "अशोक: एक अनोखा सम्राट जिसने युद्ध का त्याग किया", titleKn: "ಅಶೋಕ: ಯುದ್ಧವನ್ನು ತ್ಯಜಿಸಿದ ಚಕ್ರವರ್ತಿ" },
      { id: "ch09_thriving_towns", title: "Vital Villages, Thriving Towns", titleHi: "खुशहाल गाँव और समृद्ध शहर", titleKn: "ಪ್ರಮುಖ ಹಳ್ಳಿಗಳು, ಅಭಿವೃದ್ಧಿ ಹೊಂದುತ್ತಿರುವ ಪಟ್ಟಣಗಳು" },
      { id: "ch10_traders_pilgrims", title: "Traders, Kings and Pilgrims", titleHi: "व्यापारी, राजा और तीर्थयात्री", titleKn: "ವರ್ತಕರು, ರಾಜರು ಮತ್ತು ಯಾತ್ರಿಕರು" },
      { id: "ch11_new_empires", title: "New Empires and Kingdoms", titleHi: "नए साम्राज्य और राज्य", titleKn: "ಹೊಸ ಸಾಮ್ರಾಜ್ಯಗಳು ಮತ್ತು ರಾಜ್ಯಗಳು" },
      { id: "ch12_art_literature", title: "Buildings, Paintings and Books", titleHi: "इमारतें, चित्र तथा किताबें", titleKn: "ಕಟ್ಟಡಗಳು, ವರ್ಣಚಿत्रಗಳು এবং ಪುಸ್ತಕಗಳು" },
      { id: "ch13_earth_solar_system", title: "The Earth in the Solar System", titleHi: "सौरमंडल में पृथ्वी", titleKn: "ಸೌರಮಂಡಲದಲ್ಲಿ ಭೂಮಿ" },
      { id: "ch14_globe_lat_long", title: "Globe: Latitudes and Longitudes", titleHi: "ग्लोब: अक्षांश एवं देशांतर", titleKn: "ಗ್ಲೋಬ್: ಅಕ್ಷಾಂಶಗಳು ಮತ್ತು ರೇಖಾಂಶಗಳು" },
      { id: "ch15_motions_of_earth", title: "Motions of the Earth", titleHi: "पृथ्वी की गतियां", titleKn: "ಭೂಮಿಯ ಚಲನೆಗಳು" },
      { id: "ch16_maps", title: "Maps", titleHi: "मानचित्र", titleKn: "ಭೂಪಟಗಳು" },
      { id: "ch17_major_domains", title: "Major Domains of the Earth", titleHi: "पृथ्वी के प्रमुख परिमंडल", titleKn: "ಭೂಮಿಯ ಪ್ರಮುಖ ಆವರಣಗಳು" },
      { id: "ch18_major_landforms", title: "Major Landforms of the Earth", titleHi: "पृथ्वी के प्रमुख स्थलरूप", titleKn: "ಭೂಮಿಯ ಪ್ರಮುಖ ಭೂಸ್ವರೂಪಗಳು" },
      { id: "ch19_our_country_india", title: "Our Country India", titleHi: "हमारा देश: भारत", titleKn: "ನಮ್ಮ ದೇಶ ಭಾರತ" },
      { id: "ch20_india_climate_veg", title: "India: Climate, Vegetation and Wildlife", titleHi: "भारत: जलवायु, वनस्पति तथा वन्य प्राणी", titleKn: "ಭಾರತ: ವಾಯುಗುಣ, ಸಸ್ಯವರ್ಗ ಮತ್ತು ವನ್ಯಜೀವಿಗಳು" },
      { id: "ch21_understanding_diversity", title: "Understanding Diversity", titleHi: "विविधता की समझ", titleKn: "ವೈವಿಧ್ಯತೆಯ ತಿಳುವಳಿಕೆ" },
      { id: "ch22_diversity_discrimination", title: "Diversity and Discrimination", titleHi: "विविधता एवं भेदभाव", titleKn: "ವೈವಿಧ್ಯತೆ ಮತ್ತು ತಾರತಮ್ಯ" },
      { id: "ch23_what_is_government", title: "What is Government?", titleHi: "सरकार क्या है?", titleKn: "ಸರ್ಕಾರ ಎಂದರೇನು?" },
      { id: "ch24_democratic_government", title: "Key Elements of a Democratic Government", titleHi: "लोकतांत्रिक सरकार के मुख्य तत्व", titleKn: "ಪ್ರಜಾಸತ್ತಾತ್ಮಕ ಸರ್ಕಾರದ ಪ್ರಮುಖ ಅಂಶಗಳು" },
      { id: "ch25_panchayati_raj", title: "Panchayati Raj", titleHi: "पंचायती राज", titleKn: "ಪಂಚಾಯತ್ ರಾಜ್" },
      { id: "ch26_rural_administration", title: "Rural Administration", titleHi: "ग्रामीण प्रशासन", titleKn: "ಗ್ರಾಮೀಣ ಆಡಳಿತ" },
      { id: "ch27_urban_administration", title: "Urban Administration", titleHi: "नगर प्रशासन", titleKn: "ನಗರಾಡಳಿತ" },
      { id: "ch28_rural_livelihoods", title: "Rural Livelihoods", titleHi: "ग्रामीण क्षेत्र में आजीविका", titleKn: "ಗ್ರಾಮೀಣ ಜೀವನೋಪಾಯಗಳು" },
      { id: "ch29_urban_livelihoods", title: "Urban Livelihoods", titleHi: "शहरी क्षेत्र में आजीविका", titleKn: "ನಗರೋಪಾಯಗಳು" }
    ],
    "english": [
      { id: "ch01_two_birds", title: "A Tale of Two Birds", titleHi: "दो पक्षियों की कहानी", titleKn: "ಎರಡು ಹಕ್ಕಿಗಳ ಕಥೆ" },
      { id: "ch02_friendly_mongoose", title: "The Friendly Mongoose", titleHi: "मित्रवत नेवला", titleKn: "ಸ್ನೇಹಪರ ಮುಂಗುಸಿ" },
      { id: "ch03_shepherds_treasure", title: "The Shepherd's Treasure", titleHi: "गडरिया का खजाना", titleKn: "ಕುರುಬನ ನಿಧಿ" },
      { id: "ch04_old_clock_shop", title: "The Old-Clock Shop", titleHi: "पुरानी घड़ियों की दुकान", titleKn: "ಹಳೆಯ ಗಡಿಯಾರದ ಅಂಗಡಿ" },
      { id: "ch05_tansen", title: "Tansen", titleHi: "तानसेन", titleKn: "ತಾನ್ಸೇನ್" },
      { id: "ch06_monkey_crocodile", title: "The Monkey and the Crocodile", titleHi: "बंदर और मगरमच्छ", titleKn: "ಕೋತಿ ಮತ್ತು ಮೊಸಳೆ" },
      { id: "ch07_wonder_sleep", title: "The Wonder Called Sleep", titleHi: "नींद नामक आश्चर्य", titleKn: "ನಿದ್ದೆ ಎಂಬ ಅದ್ಭುತ" },
      { id: "ch08_pact_with_sun", title: "A Pact with the Sun", titleHi: "सूरज के साथ एक समझौता", titleKn: "ಸೂರ್ಯನೊಂದಿಗೆ ಒಪ್ಪಂದ" },
      { id: "ch09_what_happened_reptiles", title: "What Happened to the Reptiles", titleHi: "सरीसृपों के साथ क्या हुआ", titleKn: "ಸರೀಸೃಪಗಳಿಗೆ ಏನಾಯಿತು" },
      { id: "ch10_strange_wrestling_match", title: "A Strange Wrestling Match", titleHi: "एक अजीब कुश्ती मुकाबला", titleKn: "ಒಂದು ವಿಚಿತ್ರ ಕುಸ್ತಿ ಪಂದ್ಯ" },
      { id: "ch11_poetry_vocation", title: "Poetry: Vocation", titleHi: "कविता: पेशा", titleKn: "ಪದ್ಯ: ಉದ್ಯೋಗ" },
      { id: "ch12_poetry_teachers", title: "Poetry: Where Do All the Teachers Go", titleHi: "कविता: सारे शिक्षक कहाँ जाते हैं", titleKn: "ಪದ್ಯ: ಶಿಕ್ಷಕರೆಲ್ಲ ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತಾರೆ" },
      { id: "ch13_poetry_wonderful_words", title: "Poetry: The Wonderful Words", titleHi: "कविता: अद्भुत शब्द", titleKn: "ಪದ್ಯ: ಅದ್ಭುತ ಪದಗಳು" },
      { id: "ch14_poetry_water", title: "Poetry: Water", titleHi: "कविता: पानी", titleKn: "ಪದ್ಯ: ನೀರು" },
      { id: "ch15_poetry_beauty", title: "Poetry: Beauty", titleHi: "कविता: सुंदरता", titleKn: "ಪದ್ಯ: ಸೌಂದರ್ಯ" }
    ],
    "kannada": [
      { id: "ch01_prose", title: "Prose (ಗದ್ಯ)", titleHi: "गद्य (ಕನ್ನಡ)", titleKn: "ಗದ್ಯ ಭಾಗ" },
      { id: "ch02_poetry", title: "Poetry (ಪದ್ಯ)", titleHi: "पद्य (ಕನ್ನಡ)", titleKn: "ಪದ್ಯ ಭಾಗ" },
      { id: "ch03_sandhi", title: "Sandhi (ಸಂಧಿ)", titleHi: "ಕನ್ನಡ ಸಂಧಿ", titleKn: "ಸಂಧಿ ಪ್ರಕರಣ" },
      { id: "ch04_samasa", title: "Samasa (ಸಮಾಸ)", titleHi: "ಕನ್ನಡ ಸಮಾಸ", titleKn: "ಸಮಾಸ ಪ್ರಕರಣ" },
      { id: "ch05_vacana", title: "Vacana (ವಚನ)", titleHi: "ಕನ್ನಡ ವಚನಗಳು", titleKn: "ವಚನಗಳು" },
      { id: "ch06_linga", title: "Linga (ಲಿಂಗ)", titleHi: "ಕನ್ನಡ ಲಿಂಗಗಳು", titleKn: "ಲಿಂಗಗಳು" },
      { id: "ch07_vibhakti", title: "Vibhakti (ವಿಭಕ್ತಿ)", titleHi: "ಕನ್ನಡ ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯಗಳು", titleKn: "ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯಗಳು" },
      { id: "ch08_kriyapada", title: "Verb forms (ಕ್ರಿಯಾಪದ)", titleHi: "ಕನ್ನಡ ಕ್ರಿಯಾಪದಗಳು", titleKn: "ಕ್ರಿಯಾಪದಗಳು" },
      { id: "ch09_alankara", title: "Figures of speech (ಅಲಂಕಾರ)", titleHi: "ಕನ್ನಡ ಅಲಂಕಾರಗಳು", titleKn: "ಅಲಂಕಾರಗಳು" }
    ]
  },
  "7": {
    "math": [
      { id: "ch01_integers", title: "Integers", titleHi: "पूर्णांक", titleKn: "ಪೂರ್ಣಾಂಕಗಳು" },
      { id: "ch02_fractions_decimals", title: "Fractions and Decimals", titleHi: "भिन्न एवं दशमलव", titleKn: "ಭಿನ್ನರಾಶಿಗಳು ಮತ್ತು ದಶಮಾಂಶಗಳು" },
      { id: "ch03_data_handling", title: "Data Handling", titleHi: "आंकड़ों का प्रबंधन", titleKn: "ದತ್ತಾಂಶಗಳ ನಿರ್ವಹಣೆ" },
      { id: "ch04_simple_equations", title: "Simple Equations", titleHi: "सरल समीकरण", titleKn: "ಸರಳ ಸಮೀಕರಣಗಳು" },
      { id: "ch05_lines_angles", title: "Lines and Angles", titleHi: "रेखा एवं कोण", titleKn: "ರೇಖೆಗಳು ಮತ್ತು ಕೋನಗಳು" },
      { id: "ch06_triangle_properties", title: "The Triangle and Its Properties", titleHi: "त्रिभुज और उसके गुण", titleKn: "ತ್ರಿಕೋನ ಮತ್ತು ಅದರ ಗುಣಲಕ್ಷಣಗಳು" },
      { id: "ch07_congruence", title: "Congruence of Triangles", titleHi: "त्रिभुजों की सर्वांगसमता", titleKn: "ತ್ರಿಕೋನಗಳ ಸರ್ವಸಮತೆ" },
      { id: "ch08_comparing_quantities", title: "Comparing Quantities", titleHi: "राशियों की तुलना", titleKn: "ಪ್ರಮಾಣಗಳ ಹೋಲಿಕೆ" },
      { id: "ch09_rational_numbers", title: "Rational Numbers", titleHi: "परिमेय संख्याएँ", titleKn: "ಭಾಗಲಬ್ಧ ಸಂಖ್ಯೆಗಳು" },
      { id: "ch10_practical_geometry", title: "Practical Geometry", titleHi: "प्रायोगिक ज्यामिति", titleKn: "ಪ್ರಾಯೋಗಿಕ ರೇಖಾಗಣಿತ" },
      { id: "ch11_perimeter_area", title: "Perimeter and Area", titleHi: "परिमाप और क्षेत्रफल", titleKn: "ಸುತ್ತಳತೆ ಮತ್ತು ವಿಸ್ತೀರ್ಣ" },
      { id: "ch12_algebraic_expressions", title: "Algebraic Expressions", titleHi: "बीजीय व्यंजक", titleKn: "ಬೀಜಗಣಿತದ ಅಭಿವ್ಯಕ್ತಿಗಳು" },
      { id: "ch13_exponents_powers", title: "Exponents and Powers", titleHi: "घातांक और घात", titleKn: "ಘಾತಾಂಕಗಳು ಮತ್ತು ಘಾತಗಳು" },
      { id: "ch14_symmetry", title: "Symmetry", titleHi: "सममिति", titleKn: "ಸಮಮಿತಿ" },
      { id: "ch15_visualising_solid_shapes", title: "Visualising Solid Shapes", titleHi: "ठोस आकारों का चित्रण", titleKn: "ಘನ ಆಕಾರಗಳ ದೃಶ್ಯೀಕರಣ" }
    ],
    "science": [
      { id: "ch01_nutrition_plants", title: "Nutrition in Plants", titleHi: "पादपों में पोषण", titleKn: "ಸಸ್ಯಗಳಲ್ಲಿ ಪೋಷಣೆ" },
      { id: "ch02_nutrition_animals", title: "Nutrition in Animals", titleHi: "जंतुओं में पोषण", titleKn: "ಪ್ರಾಣಿಗಳಲ್ಲಿ ಪೋಷಣೆ" },
      { id: "ch03_fibre_fabric", title: "Fibre to Fabric", titleHi: "रेशों से वस्त्र तक", titleKn: "ಎಳೆಯಿಂದ ಬಟ್ಟೆಯವರೆಗೆ" },
      { id: "ch04_heat", title: "Heat", titleHi: "ऊष्मा", titleKn: "ಶಾಖ" },
      { id: "ch05_acids_bases_salts", title: "Acids, Bases and Salts", titleHi: "अम्ल, क्षारक और लवण", titleKn: "ಆಮ್ಲಗಳು, ಪ್ರತ್ಯಾಮ್ಲಗಳು ಮತ್ತು ಲವಣಗಳು" },
      { id: "ch06_physical_chemical", title: "Physical and Chemical Changes", titleHi: "भौतिक एवं रासायनिक परिवर्तन", titleKn: "ಭೌತಿಕ ಮತ್ತು ರಾಸಾಯನಿಕ ಬದಲಾವಣೆಗಳು" },
      { id: "ch07_weather_climate", title: "Weather, Climate and Adaptations", titleHi: "मौसम, जलवायु तथा अनुकूलन", titleKn: "ಹವಾಮಾನ, ವಾಯುಗುಣ ಮತ್ತು ಹೊಂದಾಣಿಕೆಗಳು" },
      { id: "ch08_winds_storms_cyclones", title: "Winds, Storms and Cyclones", titleHi: "पवन, तूफान और चक्रवात", titleKn: "ಗಾಳಿ, ಚಂಡಮಾರುತ ಮತ್ತು ಸುಂಟರಗಾಳಿಗಳು" },
      { id: "ch09_soil", title: "Soil", titleHi: "मृदा", titleKn: "ಮಣ್ಣು" },
      { id: "ch10_respiration_organisms", title: "Respiration in Organisms", titleHi: "जीवों में श्वसन", titleKn: "ಜೀವಿಗಳಲ್ಲಿ ಉಸಿರಾಟ" },
      { id: "ch11_transportation_animals_plants", title: "Transportation in Animals and Plants", titleHi: "जंतुओं और पादपों में परिवहन", titleKn: "ಪ್ರಾಣಿಗಳು ಮತ್ತು ಸಸ್ಯಗಳಲ್ಲಿ ಸಾಗಣೆ" },
      { id: "ch12_reproduction_plants", title: "Reproduction in Plants", titleHi: "पादप में जनन", titleKn: "ಸಸ್ಯಗಳಲ್ಲಿ ಸಂತಾನೋತ್ಪತ್ತಿ" },
      { id: "ch13_motion_time", title: "Motion and Time", titleHi: "गति एवं समय", titleKn: "ಚಲನೆ ಮತ್ತು ಸಮಯ" },
      { id: "ch14_electric_current_effects", title: "Electric Current and Its Effects", titleHi: "विद्युत धारा और इसके प्रभाव", titleKn: "ವಿದ್ಯುತ್ ಪ್ರವಾಹ ಮತ್ತು ಅದರ ಪರಿಣಾಮಗಳು" },
      { id: "ch15_light", title: "Light", titleHi: "प्रकाश", titleKn: "ಬೆಳಕು" },
      { id: "ch16_water_resource", title: "Water: A Precious Resource", titleHi: "जल: एक बहुमूल्य संसाधन", titleKn: "ನೀರು: ಒಂದು ಅಮೂಲ್ಯ ಸಂಪನ್ಮೂಲ" },
      { id: "ch17_forests_lifeline", title: "Forests: Our Lifeline", titleHi: "वन: हमारी जीवन रेखा", titleKn: "ಅರಣ್ಯಗಳು: ನಮ್ಮ ಜೀವನಾಡಿ" },
      { id: "ch18_wastewater_story", title: "Wastewater Story", titleHi: "अपशिष्ट जल की कहानी", titleKn: "ತ್ಯಾಜ್ಯನೀರಿನ ಕಥೆ" }
    ],
    "social": [
      { id: "ch01_history_changes", title: "Tracing Changes Through a Thousand Years", titleHi: "हज़ार वर्षों के दौरान हुए परिवर्तनों की पड़ताल", titleKn: "ಸಾವಿರ ವರ್ಷಗಳಲ್ಲಿನ ಬದಲಾವಣೆಗಳ ಗುರುತಿಸುವಿಕೆ" },
      { id: "ch02_new_kings_kingdoms", title: "New Kings and Kingdoms", titleHi: "नए राजा और उनके राज्य", titleKn: "ಹೊಸ ರಾಜರು ಮತ್ತು ಸಾಮ್ರಾಜ್ಯಗಳು" },
      { id: "ch03_delhi_sultanate", title: "The Delhi Sultanate", titleHi: "दिल्ली के सुल्तान", titleKn: "ದೆಹಲಿ ಸುಲ್ತಾನರು" },
      { id: "ch04_mughal_empire", title: "The Mughal Empire", titleHi: "मुग़ल साम्राज्य", titleKn: "ಮೊಘಲ್ ಸಾಮ್ರಾಜ್ಯ" },
      { id: "ch05_rulers_buildings", title: "Rulers and Buildings", titleHi: "शासक और इमारतें", titleKn: "ಆಡಳಿತಗಾರರು och ಕಟ್ಟಡಗಳು" },
      { id: "ch06_towns_traders", title: "Towns, Traders and Craftspersons", titleHi: "नगर, व्यापारी और शिल्पीजन", titleKn: "ನಗರಗಳು, ವರ್ತಕರು ಮತ್ತು ಕುಶಲಕರ್ಮಿಗಳು" },
      { id: "ch07_tribes_nomads", title: "Tribes, Nomads and Settled Communities", titleHi: "ಜನಜಾತಿಗಳು, ಅಲೆಮಾರಿಗಳು ಮತ್ತು ನೆಲೆಸಿದ ಸಮುದಾಯಗಳು", titleKn: "ಬುಡಕಟ್ಟುಗಳು, ಅಲೆಮಾರಿಗಳು ಮತ್ತು ನೆಲೆಸಿದ ಸಮುದಾಯಗಳು" },
      { id: "ch08_devotional_paths", title: "Devotional Paths to the Divine", titleHi: "ईश्वर से अनुराग", titleKn: "ದೈವಿಕ ಸಾಮೀಪ್ಯಕ್ಕಾಗಿ ಭಕ್ತಿ ಮಾರ್ಗಗಳು" },
      { id: "ch09_regional_cultures", title: "The Making of Regional Cultures", titleHi: "क्षेत्रीय संस्कृतियों का निर्माण", titleKn: "ಪ್ರಾದೇಶಿಕ ಸಂಸ್ಕೃತಿಗಳ ರಚನೆ" },
      { id: "ch10_eighteenth_century", title: "Eighteenth Century Political Formations", titleHi: "अठारहवीं शताब्दी में नए राजनीतिक गठन", titleKn: "ಹದಿನೆಂಟನೇ ಶತಮಾನದ ರಾಜಕೀಯ ರಚನೆಗಳು" },
      { id: "ch11_environment", title: "Environment", titleHi: "पर्यावरण", titleKn: "ಪರಿಸರ" },
      { id: "ch12_inside_our_earth", title: "Inside Our Earth", titleHi: "हमारी पृथ्वी के अंदर", titleKn: "ನಮ್ಮ ಭೂಮಿಯ ಒಳಭಾಗ" },
      { id: "ch13_our_changing_earth", title: "Our Changing Earth", titleHi: "हमारी बदलती पृथ्वी", titleKn: "ನಮ್ಮ ಬದಲಾಗುತ್ತಿರುವ ಭೂಮಿ" },
      { id: "ch14_air", title: "Air", titleHi: "वायु", titleKn: "ಗಾಳಿ" },
      { id: "ch15_water", title: "Water", titleHi: "जल", titleKn: "ನೀರು" },
      { id: "ch16_natural_vegetation_wildlife", title: "Natural Vegetation and Wildlife", titleHi: "प्राकृतिक वनस्पति एवं वन्य जीवन", titleKn: "ನೈಸರ್ಗಿಕ ಸಸ್ಯವರ್ಗ ಮತ್ತು ವನ್ಯಜೀವಿಗಳು" },
      { id: "ch17_human_environment_settlement", title: "Human Environment: Settlement, Transport and Communication", titleHi: "मानव पर्यावरण: बस्तियाँ, परिवहन एवं संचार", titleKn: "ಮಾನವ ಪರಿಸರ: ವಸಾಹತು, ಸಾರಿಗೆ ಮತ್ತು ಸಂಪರ್ಕ" },
      { id: "ch18_human_environment_interactions", title: "Human Environment Interactions: Tropical and Subtropical", titleHi: "मानव-पर्यावरण अन्योन्यक्रिया: उष्णकटिबंधीय एवं उपोष्णकटिबंधीय प्रदेश", titleKn: "ಮಾನವ ಪರಿಸರ ಪರಸ್ಪರ ಕ್ರಿಯೆಗಳು: ಉಷ್ಣವಲಯ ಮತ್ತು ಉಪೋಷ್ಣವಲಯ" },
      { id: "ch19_life_temperate_grasslands", title: "Life in Temperate Grasslands", titleHi: "शीतोष्ण घासस्थलों में जीवन", titleKn: "ಸಮಶೀತೋಷ್ಣ ಹುಲ್ಲುಗಾವಲುಗಳಲ್ಲಿ ಜೀವನ" },
      { id: "ch20_life_in_deserts", title: "Life in the Deserts", titleHi: "रेगिस्तान में जीवन", titleKn: "ಮರುಭೂಮಿಗಳಲ್ಲಿ ಜೀವನ" },
      { id: "ch21_on_equality", title: "On Equality", titleHi: "समानता", titleKn: "ಸಮಾನತೆ" },
      { id: "ch22_government_role_health", title: "Role of the Government in Health", titleHi: "स्वास्थ्य में सरकार की भूमिका", titleKn: "ಆರೋಗ್ಯ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸರ್ಕಾರದ ಪಾತ್ರ" },
      { id: "ch23_state_government_works", title: "How the State Government Works", titleHi: "राज्य शासन कैसे काम करता है", titleKn: "ರಾಜ್ಯ ಸರ್ಕಾರ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ" },
      { id: "ch24_growing_up_boys_girls", title: "Growing up as Boys and Girls", titleHi: "लड़के और लड़कियों के रूप में बड़ा होना", titleKn: "ಹುಡುಗ ಮತ್ತು ಹುಡುಗಿಯರಾಗಿ ಬೆಳೆಯುವುದು" },
      { id: "ch25_women_change_world", title: "Women Change the World", titleHi: "औरतों ने बदली दुनिया", titleKn: "ಮಹಿಳೆಯರು ಜಗತ್ತನ್ನು ಬದಲಾಯಿಸುತ್ತಾರೆ" },
      { id: "ch26_understanding_media", title: "Understanding Media", titleHi: "संचार माध्यमों को समझना", titleKn: "ಮಾಧ್ಯಮಗಳ ತಿಳುವಳಿಕೆ" },
      { id: "ch27_understanding_advertising", title: "Understanding Advertising", titleHi: "विज्ञापनों को समझना", titleKn: "ಜಾಹೀರಾತುಗಳ ತಿಳುವಳಿಕೆ" },
      { id: "ch28_markets_around_us", title: "Markets Around Us", titleHi: "हमारे आस-पास के बाज़ार", titleKn: "ನಮ್ಮ ಸುತ್ತಮುತ್ತಲಿನ ಮಾರುಕಟ್ಟೆಗಳು" },
      { id: "ch29_shirt_in_market", title: "A Shirt in the Market", titleHi: "बाज़ार में एक कमीज़", titleKn: "ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಒಂದು ಅಂಗಿ" }
    ]
  },
  "8": {
    "math": [
      { id: "ch01_rational_numbers", title: "Rational Numbers", titleHi: "परिमेय संख्याएँ", titleKn: "ಭಾಗಲಬ್ಧ ಸಂಖ್ಯೆಗಳು" },
      { id: "ch02_linear_equations_one_var", title: "Linear Equations in One Variable", titleHi: "एक चर वाले रैखिक समीकरण", titleKn: "ಒಂದು ಚರಾಕ್ಷರವುಳ್ಳ ರೇಖಾತ್ಮಕ ಸಮೀಕರಣಗಳು" },
      { id: "ch03_understanding_quadrilaterals", title: "Understanding Quadrilaterals", titleHi: "चतुर्भुजों को समझना", titleKn: "ಚತುರ್ಭುಜಗಳ ತಿಳುವಳಿಕೆ" },
      { id: "ch04_practical_geometry", title: "Practical Geometry", titleHi: "प्रायोगिक ज्यामिति", titleKn: "ಪ್ರಾಯೋಗಿಕ ರೇಖಾಗಣಿತ" },
      { id: "ch05_data_handling", title: "Data Handling", titleHi: "आंकड़ों का प्रबंधन", titleKn: "ದತ್ತಾಂಶಗಳ ನಿರ್ವಹಣೆ" },
      { id: "ch06_squares_square_roots", title: "Squares and Square Roots", titleHi: "वर्ग और वर्गमूल", titleKn: "ವರ್ಗಗಳು ಮತ್ತು ವರ್ಗಮೂಲಗಳು" },
      { id: "ch07_cubes_cube_roots", title: "Cubes and Cube Roots", titleHi: "घन और घनमूल", titleKn: "ಘನಗಳು ಮತ್ತು ಘನಮೂಲಗಳು" },
      { id: "ch08_comparing_quantities", title: "Comparing Quantities", titleHi: "राशियों की तुलना", titleKn: "ಪ್ರಮಾಣಗಳ ಹೋಲಿಕೆ" },
      { id: "ch09_algebraic_expressions_identities", title: "Algebraic Expressions and Identities", titleHi: "बीजीय व्यंजक एवं सर्वसमिकाएँ", titleKn: "ಬೀಜಗಣಿತದ ಅಭಿವ್ಯಕ್ತಿಗಳು ಮತ್ತು ನಿತ್ಯಸಮೀಕರಣಗಳು" },
      { id: "ch10_visualising_solid_shapes", title: "Visualising Solid Shapes", titleHi: "ठोस आकारों का चित्रण", titleKn: "ಘನ ಆಕಾರಗಳ ದೃಶ್ಯೀಕರಣ" },
      { id: "ch11_mensuration", title: "Mensuration", titleHi: "क्षेत्रमिति", titleKn: "ಕ್ಷೇತ್ರಗಣಿತ" },
      { id: "ch12_exponents_powers", title: "Exponents and Powers", titleHi: "घातांक और घात", titleKn: "ಘಾತಾಂಕಗಳು ಮತ್ತು ಘಾತಗಳು" },
      { id: "ch13_direct_inverse_proportions", title: "Direct and Inverse Proportions", titleHi: "सीधा और प्रतिलोम समानुपात", titleKn: "ನೇರ ಮತ್ತು ವಿಲೋಮ ಪ್ರಮಾಣಗಳು" },
      { id: "ch14_factorisation", title: "Factorisation", titleHi: "गुणनखंडन", titleKn: "ಅಪವರ್ತನ" },
      { id: "ch15_intro_graphs", title: "Introduction to Graphs", titleHi: "आलेखों से परिचय", titleKn: "ನಕ್ಷೆಗಳ ಪರಿಚಯ" },
      { id: "ch16_playing_with_numbers", title: "Playing with Numbers", titleHi: "संख्याओं के साथ खेलना", titleKn: "ಸಂಖ್ಯೆಗಳೊಂದಿಗೆ ಆಟ" }
    ],
    "science": [
      { id: "ch01_crop_production_management", title: "Crop Production and Management", titleHi: "फसल उत्पादन एवं प्रबंध", titleKn: "ಬೆಳೆ ಉತ್ಪಾದನೆ ಮತ್ತು ನಿರ್ವಹಣೆ" },
      { id: "ch02_microorganisms_friend_foe", title: "Microorganisms: Friend and Foe", titleHi: "सूक्ष्मजीव: मित्र एवं शत्रु", titleKn: "ಸೂಕ್ಷ್ಮಜೀವಿಗಳು: ಮಿತ್ರ ಮತ್ತು ಶತ್ರು" },
      { id: "ch03_synthetic_fibres_plastics", title: "Synthetic Fibres and Plastics", titleHi: "संश्लेषित रेशे और प्लास्टिक", titleKn: "संಶ್ಲೇಷಿತ ಎಳೆಗಳು ಮತ್ತು ಪ್ಲಾಸ್ಟಿಕ್‌ಗಳು" },
      { id: "ch04_metals_non_metals", title: "Materials: Metals and Non-Metals", titleHi: "पदार्थ: धातु और अधातु", titleKn: "ವಸ್ತುಗಳು: ಲೋಹಗಳು ಮತ್ತು ಅಲೋಹಗಳು" },
      { id: "ch05_coal_petroleum", title: "Coal and Petroleum", titleHi: "कोयला और पेट्रोलियम", titleKn: "ಕಲ್ಲಿದ್ದಲು ಮತ್ತು ಪೆಟ್ರೋಲಿಯಂ" },
      { id: "ch06_combustion_flame", title: "Combustion and Flame", titleHi: "दहन और ज्वाला", titleKn: "ದಹನ ಮತ್ತು ಜ್ವಾಲೆ" },
      { id: "ch07_conservation_plants_animals", title: "Conservation of Plants and Animals", titleHi: "पौधों एवं जंतुओं का संरक्षण", titleKn: "ಸಸ್ಯಗಳು ಮತ್ತು ಪ್ರಾಣಿಗಳ ಸಂರಕ್ಷಣೆ" },
      { id: "ch08_cell_structure_functions", title: "Cell: Structure and Functions", titleHi: "कोशिका - संरचना एवं प्रकार्य", titleKn: "ಕೋಶ: ರಚನೆ ಮತ್ತು ಕಾರ್ಯಗಳು" },
      { id: "ch09_reproduction_animals", title: "Reproduction in Animals", titleHi: "जंतुओं में जनन", titleKn: "ಪ್ರಾಣಿಗಳಲ್ಲಿ ಸಂತಾನೋತ್ಪತ್ತಿ" },
      { id: "ch10_reaching_age_adolescence", title: "Reaching the Age of Adolescence", titleHi: "किशोरावस्था की ओर", titleKn: "ಹದಿಹರೆಯದ ಪ್ರಾಯವನ್ನು ತಲುಪುವುದು" },
      { id: "ch11_force_pressure", title: "Force and Pressure", titleHi: "बल तथा दाब", titleKn: "ಬಲ ಮತ್ತು ಒತ್ತಡ" },
      { id: "ch12_friction", title: "Friction", titleHi: "घर्षण", titleKn: "ಘರ್ಷಣೆ" },
      { id: "ch13_sound", title: "Sound", titleHi: "ध्वनि", titleKn: "ಶಬ್ದ" },
      { id: "ch14_chemical_effects_electric", title: "Chemical Effects of Electric Current", titleHi: "विद्युत धारा के रासायनिक प्रभाव", titleKn: "ವಿದ್ಯುತ್ ಪ್ರವಾಹದ ರಾಸಾಯನಿಕ ಪರಿಣಾಮಗಳು" },
      { id: "ch15_some_natural_phenomena", title: "Some Natural Phenomena", titleHi: "कुछ प्राकृतिक परिघटनाएँ", titleKn: "ಕೆಲವು ನೈಸರ್ಗಿಕ ವಿದ್ಯಮಾನಗಳು" },
      { id: "ch16_light", title: "Light", titleHi: "प्रकाश", titleKn: "ಬೆಳಕು" },
      { id: "ch17_stars_solar_system", title: "Stars and the Solar System", titleHi: "तारे एवं सौर परिवार", titleKn: "ನಕ್ಷತ್ರಗಳು ಮತ್ತು ಸೌರಮಂಡಲ" },
      { id: "ch18_pollution_air_water", title: "Pollution of Air and Water", titleHi: "वायु तथा जल का प्रदूषण", titleKn: "ಗಾಳಿ ಮತ್ತು ನೀರಿನ ಮಾಲಿನ್ಯ" }
    ],
    "social": [
      { id: "ch01_how_when_where", title: "How, When and Where", titleHi: "कैसे, कब और कहाँ", titleKn: "ಹೇಗೆ, ಯಾವಾಗ ಮತ್ತು ಎಲ್ಲಿ" },
      { id: "ch02_trade_to_territory", title: "From Trade to Territory", titleHi: "व्यापार से साम्राज्य तक", titleKn: "ವ್ಯಾಪಾರದಿಂದ ಸಾಮ್ರಾಜ್ಯದವರೆಗೆ" },
      { id: "ch03_ruling_countryside", title: "Ruling the Countryside", titleHi: "ग्रामीण क्षेत्र पर शासन चलाना", titleKn: "ಗ್ರಾಮೀಣ ಪ್ರದೇಶಗಳ ಆಡಳಿತ" },
      { id: "ch04_tribals_dikus", title: "Tribals, Dikus and the Vision of a Golden Age", titleHi: "आदिवासी, दीकु और एक स्वर्ण युग की कल्पना", titleKn: "ಬುಡಕಟ್ಟುಗಳು, ದಿಕುಗಳು ಮತ್ತು ಸುವರ್ಣ ಯುಗದ ದೃಷ್ಟಿ" },
      { id: "ch05_when_people_rebel", title: "When People Rebel", titleHi: "जब जनता बगावत करती है", titleKn: "ಜನರು ದಂಗೆ ಎದ್ದಾಗ" },
      { id: "ch06_colonialism_city", title: "Colonialism and the City", titleHi: "उपनिवेशवाद और शहर", titleKn: "ವಸಾಹತುಶಾಹಿ ಮತ್ತು ನಗರ" },
      { id: "ch07_weavers_iron_smelters", title: "Weavers, Iron Smelters and Factory Owners", titleHi: "बुनकर, लोहा पिघलाने वाले और फैक्ट्री मालिक", titleKn: "ನೇಗೆಯವರು, ಕಬ್ಬಿಣ ಕರಗಿಸುವವರು ಮತ್ತು ಕಾರ್ಖಾನೆ ಮಾಲೀಕರು" },
      { id: "ch08_civilising_native", title: "Civilising the \"Native\", Educating the Nation", titleHi: "देशी जनता को सभ्य बनाना, राष्ट्र को शिक्षित करना", titleKn: "ದೇಶಿ ಜನರನ್ನು ನಾಗರಿಕರನ್ನಾಗಿಸುವುದು, ರಾಷ್ಟ್ರವನ್ನು ಶಿಕ್ಷಿಸುವುದು" },
      { id: "ch09_women_caste_reform", title: "Women, Caste and Reform", titleHi: "महिलाएँ, जाति एवं सुधार", titleKn: "ಮಹಿಳೆಯರು, ಜಾತಿ ಮತ್ತು ಸುಧಾರಣೆ" },
      { id: "ch10_changing_visual_arts", title: "The Changing World of Visual Arts", titleHi: "दृश्य कलाओं की बदलती दुनिया", titleKn: "ದೃಶ್ಯ ಕಲೆಗಳ ಬದಲಾಗುತ್ತಿರುವ ಜಗತ್ತು" },
      { id: "ch11_national_movement", title: "The Making of the National Movement", titleHi: "राष्ट्रीय आंदोलन का संघटन", titleKn: "ರಾಷ್ಟ್ರೀಯ ಚಳುವಳಿಯ ಸಂಘಟನೆ" },
      { id: "ch12_india_after_independence", title: "India After Independence", titleHi: "स्वतंत्रता के बाद का भारत", titleKn: "ಸ್ವಾತಂತ್ರ್ಯದ ನಂತರದ ಭಾರತ" },
      { id: "ch13_resources", title: "Resources", titleHi: "संसाधन", titleKn: "ಸಂಪನ್ಮೂಲಗಳು" },
      { id: "ch14_land_soil_water_resources", title: "Land, Soil, Water, Natural Vegetation and Wildlife Resources", titleHi: "भूमि, मृदा, जल, प्राकृतिक वनस्पति और वन्यजीव संसाधन", titleKn: "ಭೂಮಿ, ಮಣ್ಣು, ನೀರು, ನೈಸರ್ಗಿಕ ಸಸ್ಯವರ್ಗ ಮತ್ತು ವನ್ಯಜೀವಿ ಸಂಪನ್ಮೂಲಗಳು" },
      { id: "ch15_mineral_power_resources", title: "Mineral and Power Resources", titleHi: "खनिज और शक्ति संसाधन", titleKn: "ಖನಿಜ ಮತ್ತು ವಿದ್ಯುತ್ ಸಂಪನ್ಮೂಲಗಳು" },
      { id: "ch16_agriculture", title: "Agriculture", titleHi: "कृषि", titleKn: "ಕೃಷಿ" },
      { id: "ch17_industries", title: "Industries", titleHi: "उद्योग", titleKn: "ಕೈಗಾರಿಕೆಗಳು" },
      { id: "ch18_human_resources", title: "Human Resources", titleHi: "मानव संसाधन", titleKn: "ಮಾನವ ಸಂಪನ್ಮೂಲಗಳು" },
      { id: "ch19_indian_constitution", title: "The Indian Constitution", titleHi: "भारतीय संविधान", titleKn: "ಭಾರತೀಯ ಸಂವಿಧಾನ" },
      { id: "ch20_understanding_secularism", title: "Understanding Secularism", titleHi: "धर्मनिरपेक्षता की समझ", titleKn: "ಧರ್ಮನಿರಪೇಕ್ಷತೆಯ ತಿಳುವಳಿಕೆ" },
      { id: "ch21_why_parliament", title: "Why Do We Need a Parliament?", titleHi: "हमें संसद क्यों चाहिए?", titleKn: "ನಮಗೆ ಸಂಸತ್ತು ಏಕೆ ಬೇಕು?" },
      { id: "ch22_understanding_laws", title: "Understanding Laws", titleHi: "कानूनों की समझ", titleKn: "ಕಾನೂನುಗಳ ತಿಳುವಳಿಕೆ" },
      { id: "ch23_judiciary", title: "Judiciary", titleHi: "न्यायपालिका", titleKn: "ನ್ಯಾಯಾಂಗ" },
      { id: "ch24_criminal_justice_system", title: "Understanding Our Criminal Justice System", titleHi: "हमारी आपराधिक न्याय प्रणाली को समझना", titleKn: "ನಮ್ಮ ಅಪರಾಧ ನ್ಯಾಯ ವ್ಯವಸ್ಥೆಯ ತಿಳುವಳಿಕೆ" },
      { id: "ch25_understanding_marginalisation", title: "Understanding Marginalisation", titleHi: "हाशियाकरण की समझ", titleKn: "ಅಂಚಿನಲ್ಲಿರುವಿಕೆಯ ತಿಳುವಳಿಕೆ" },
      { id: "ch26_confronting_marginalisation", title: "Confronting Marginalisation", titleHi: "हाशियाकरण से निपटना", titleKn: "ಅಂಚಿನಲ್ಲಿರುವಿಕೆಯನ್ನು ಎದುರಿಸುವುದು" },
      { id: "ch27_public_facilities", title: "Public Facilities", titleHi: "जनसुविधाएँ", titleKn: "ಸಾರ್ವಜನಿಕ ಸೌಲಭ್ಯಗಳು" },
      { id: "ch28_law_social_justice", title: "Law and Social Justice", titleHi: "कानून और सामाजिक न्याय", titleKn: "ಕಾನೂನು ಮತ್ತು सामाजिक न्याय" }
    ]
  }
};

function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}










function getTopicSpecificData(grade, subject, chapter) {
  const title = chapter.title;
  const titleHi = chapter.titleHi;
  const titleKn = chapter.titleKn;
  const lowerTitle = title.toLowerCase();

  // 1. Photosynthesis / Nutrition in Plants
  if (lowerTitle.includes('nutrition in plants') || lowerTitle.includes('photosynthesis') || lowerTitle.includes('know plants') || lowerTitle.includes('plant')) {
    return {
      conceptEn: "Photosynthesis is the process by which green plants prepare their own food. Using chlorophyll, leaves capture sunlight and convert carbon dioxide and water into glucose (food) and oxygen.",
      conceptHi: "\u092a\u094d\u0930\u0915\u093e\u0936 \u0938\u0902\u0936\u094d\u0932\u0947\u0937\u0923 \u0935\u0939 \u092a\u094d\u0930\u0915\u094d\u0930\u093f\u092f\u093e \u0939\u0948 \u091c\u093f\u0938\u0915\u0947 \u0926\u094d\u0935\u093e\u0930\u093e \u0939\u0930\u0947 \u092a\u094c\u0927\u0947 \u0905\u092a\u0928\u093e \u092d\u094b\u091c\u0928 \u0938\u094d\u0935\u092f\u0902 \u092c\u0928\u093e\u0924\u0947 \u0939\u0948\u0902\u0965",
      conceptKn: "\u0ca6\u0ccd\u0caf\u0cc1\u0ca4\u0cbf\u0cb8\u0c82\u0cb6\u0ccd\u0cb2\u0cc7\u0cb7\u0ca3\u0cc6\u0caf\u0cc1 \u0cb9\u0cb8\u0cbf\u0cb0\u0cc1 \u0cb8\u0cb8\u0ccd\u0caf\u0c97\u0cb3\u0cc1 \u0ca4\u0cae\u0ccd\u0cae\u0ca6\u0cc7 \u0c86\u0cb9\u0cbe\u0cb0\u0cb5\u0ca8\u0ccd\u0ca8\u0cc1 \u0ca4\u0caf\u0cbe\u0cb0\u0cbf\u0cb8\u0cc1\u0cb5 \u0caa\u0ccd\u0cb0\u0c95\u0ccd\u0cb0\u0cbf\u0caf\u0cc6\u0caf\u0cbe\u0c97\u0cbf\u0ca6\u0cc6.",
      objectives: ["Understand the role of chlorophyll and sunlight", "Write the chemical equation for photosynthesis", "Explain how water and nutrients are absorbed by roots"],
      problem: "Identify the inputs and outputs of photosynthesis.",
      steps: {
        en: ["Step 1: Leaves absorb carbon dioxide from the air and water from the soil.", "Step 2: Chlorophyll traps sunlight energy inside the plant cells.", "Step 3: Carbon dioxide and water combine to form glucose, releasing oxygen."],
        hi: ["\u091a\u0930\u0923 1: \u092a\u0924\u094d\u0924\u093f\u092f\u093e\u0901 \u0939\u0935\u093e \u0938\u0947 \u0915\u093e\u0930\u094d\u092c\u0928 \u0921\u093e\u0907\u0915\u094d\u0938\u093e\u0907\u0921 \u0914\u0930 \u092e\u093f\u091f\u094d\u091f\u0940 \u0938\u0947 \u092a\u093e\u0928\u0940 \u0905\u0935\u0936\u094b\u0937\u093f\u0924 \u0915\u0930\u0924\u0940 \u0939\u0948\u0902\u0965", "\u091a\u0930\u0923 2: \u0915\u094d\u0932\u094b\u0930\u094b\u092b\u093f\u0932 \u092a\u094c\u0927\u0947 \u0915\u0940 \u0915\u094b\u0936\u093f\u0915\u093e\u0913\u0902 \u0915\u0947 \u092d\u0940\u0924\u0930 \u0938\u0942\u0930\u094d\u092f \u0915\u0947 \u092a\u094d\u0930\u0915\u093e\u0936 \u0915\u0940 \u090a\u0930\u094d\u091c\u093e \u0915\u094b \u092a\u0915\u0921\u093c\u0924\u093e \u0939\u0948\u0965", "\u091a\u0930\u0923 3: \u0915\u093e\u0930\u094d\u092c\u0928 \u0921\u093e\u0907\u0915\u094d\u0938\u093e\u0907\u0921 \u0914\u0930 \u092a\u093e\u0928\u0940 \u092e\u093f\u0932\u0915\u0930 \u0917\u094d\u0932\u0942\u0915\u094b\u091c \u092c\u0928\u093e\u0924\u0947 \u0939\u0948\u0902 \u0914\u0930 \u0915\u094d\u0938\u0940\u091c\u0928 \u091b\u094b\u0921\u093c\u0924\u0947 \u0939\u0948\u0902\u0965"],
        kn: ["\u0cb9\u0c82\u0ca4 1: \u0c8e\u0cb2\u0cc6\u0c97\u0cb3\u0cc1 \u0c97\u0cbe\u0cb3\u0cbf\u0caf\u0cbf\u0c82\u0ca6 \u0c87\u0c82\u0c97\u0cbe\u0cb2\u0ca6 \u0ca1\u0cc8\u0c82\u0c95\u0ccd\u0cb8\u0cc8\u0ca1\u0ccd \u0cae\u0ca4\u0ccd\u0ca4\u0cc1 \u0cae\u0ca3\u0ccd\u0ca3\u0cbf\u0ca8\u0cbf\u0c82\u0ca6 \u0ca8\u0cc0\u0cb0\u0ca8\u0ccd\u0ca8\u0cc1 \u0cb9\u0cc0\u0cb0\u0cbf\u0c95\u0cca\u0cb3\u0ccd\u0cb3\u0cc1\u0ca4\u0ccd\u0ca4\u0cb5\u0cc6.", "\u0cb9\u0c82\u0ca4 2: \u0cb9\u0cb0\u0cbf\u0ca4\u0ccd\u0ca4\u0cc1 \u0cb8\u0cb8\u0ccd\u0caf\u0ca6 \u0c9c\u0cc0\u0cb5\u0c95\u0ccb\u0cb6\u0c97\u0cb3\u0cca\u0cb3\u0c97\u0cc6 \u0cb8\u0cc2\u0cb0\u0ccd\u0caf\u0ca8 \u0cac\u0cc6\u0cb3\u0c95\u0cbf\u0ca8 \u0cb8\u0cbe\u0cae\u0cb0\u0ccd\u0ca5\u0ccd\u0ca5\u0caf\u0ca8\u0ccd\u0ca8\u0cc1 \u0cb9\u0cc0\u0cb0\u0cc1\u0ca4\u0ccd\u0ca4\u0ca6\u0cc6.", "\u0cb9\u0c82\u0ca4 3: \u0c87\u0c82\u0c97\u0cbe\u0cb2\u0ca6 \u0ca1\u0cc8\u0c82\u0c95\u0ccd\u0cb8\u0cc8\u0ca1\u0ccd \u0cae\u0ca4\u0ccd\u0ca8\u0cc0\u0cb0\u0cc1 \u0cb8\u0cc7\u0cb0\u0cbf \u0c97\u0ccd\u0cb2\u0cc1\u0c95\u0ccb\u0cb8\u0ccd \u0cae\u0cbe\u0ca1\u0cbf \u0c86\u0cae\u0ccd\u0cb2\u0c9c\u0ca8\u0c95\u0cb5\u0ca8\u0ccd\u0ca8\u0cc1 \u0cac\u0cbf\u0ca1\u0cc1\u0c97\u0ca1\u0cc6 \u0cae\u0cbe\u0ca1\u0cc1\u0ca4\u0ccd\u0ca4\u0cb5\u0cc6."]
      },
      answer: "Carbon Dioxide + Water + Sunlight -> Glucose + Oxygen",
      keyPoints: {
        en: ["Chlorophyll is the green pigment that absorbs light energy.", "Stomata are tiny pores on leaves that allow gas exchange.", "Oxygen released during photosynthesis supports life on Earth."],
        hi: ["\u0915\u094d\u0932\u094b\u0930\u094b\u092f\u092b\u093f\u0932 \u0935\u0939 \u0939\u0930\u093e \u0935\u0930\u094d\u0923\u0915 \u0939\u0948 \u091c\u094b \u092a\u094d\u0930\u0915\u093e\u0936 \u090a\u0930\u094d\u091c\u093e \u0915\u094b \u0938\u094b\u0916\u0924\u093e \u0939\u0948\u0965", "\u0930\u0902\u0927\u094d\u0930 (Stomata) \u092a\u0924\u094d\u0924\u093f\u092f\u094b\u0902 \u092a\u0930 \u091b\u094b\u091f\u0947 \u091b\u093f\u0926\u094d\u0930 \u0939\u094b\u0924\u093e \u0939\u0948\u0902\u0965", "\u092a\u094d\u0930\u0915\u093e\u0936 \u0938\u0902\u0936\u094d\u0932\u0947\u0937\u0923 \u0915\u0947 \u0926\u094c\u0930\u093e\u0928 \u092e\u0941\u0915\u094d\u0924 \u0915\u094d\u0938\u0940\u091c\u0928 \u091c\u0940\u0935\u0928 \u0915\u093e \u0906\u0927\u093e\u0930 \u0939\u0948\u0965"],
        kn: ["\u0cb9\u0cb0\u0cbf\u0ca4\u0ccd\u0ca4\u0cc1 \u0cac\u0cc6\u0cb3\u0c95\u0cbf\u0ca8 \u0cb6\u0c95\u0ccd\u0ca4\u0cbf\u0ca5\u0ca8\u0ccd\u0ca8\u0cc1 \u0cb9\u0cc0\u0cb0\u0cc1\u0cb5 \u0cb9\u0cb8\u0cbf\u0cb0\u0cc1 \u0cb5\u0cb0\u0ccd\u0ca3\u0c95\u0cb5\u0cbe\u0c97\u0cbf\u0ca6\u0cc6.", "\u0caa\u0ca4\u0ccd\u0cb0\u0cb0\u0c82\u0c27\u0ccd\u0cb0\u0c97\u0cb3\u0cc1 (Stomata) \u0c8e\u0cb2\u0cc6\u0c97\u0cb3 \u0cae\u0cc7\u0cb2\u0cbf\u0ca8 \u0cb8\u0ca3\u0ccd\u0ca3 \u0cb0\u0c82\u0ca7\u0ccd\u0cb0\u0c97\u0cb3\u0cc1.", "\u0ca6\u0ccd\u0caf\u0cc1\u0ca4\u0cbf\u0cb8\u0c82\u0cb6\u0ccd\u0cb2\u0cc7\u0cb7\u0ca3\u0cc6\u0caf \u0cb8\u0cae\u0caf\u0ca6\u0cb2\u0ccd\u0cb2\u0cbf \u0cac\u0cbf\u0ca1\u0cc1\u0c97\u0ca1\u0cc6\u0caf\u0cbe\u0c97\u0cc1\u0cb5 \u0c86\u0cae\u0ccd\u0cb2\u0c9c\u0ca8\u0c95 \u0caa\u0ccd\u0cb0\u0cbe\u0ca3\u0cb5\u0cbe\u0caf\u0cc1\u0cb5\u0cbe\u0c97\u0cbf\u0ca6\u0cc6."]
      },
      facts: [
        { front: "What is chlorophyll?", back: "A green pigment in plants that absorbs light energy.", hook: "Green pigment = light absorber." },
        { front: "Where does carbon dioxide enter the leaf?", back: "Through tiny pores called stomata.", hook: "Stomata = leaf gates." }
      ],
      checks: [
        {
          question: "Which of the following is essential for photosynthesis to capture energy?",
          options: ["Chlorophyll", "Nitrogen", "Oxygen", "Iron"],
          correct_index: 0,
          explanation: "Chlorophyll is the green pigment in leaves that absorbs sunlight energy."
        },
        {
          question: "What gas do plants absorb from the atmosphere for photosynthesis?",
          options: ["Carbon Dioxide", "Oxygen", "Hydrogen", "Helium"],
          correct_index: 0,
          explanation: "Plants take in carbon dioxide through stomata to produce glucose."
        }
      ]
    };
  }

  // 2. Fractions and Decimals
  if (lowerTitle.includes('fraction') || lowerTitle.includes('decimal') || lowerTitle.includes('rational')) {
    return {
      conceptEn: "Fractions represent parts of a whole, consisting of a numerator (top) and denominator (bottom). Unlike fractions have different denominators and require finding the Least Common Multiple (LCM) before adding or subtracting.",
      conceptHi: "\u092d\u093f\u0928\u094d\u0928 \u090f\u0915 \u0938\u0902\u092a\u0942\u0930\u094d\u0923 \u0915\u0947 \u092d\u093e\u0917\u094b\u0902 \u0915\u094b \u0926\u0930\u094d\u0936\u093e\u0924\u0940 \u0939\u0948, \u091c\u093f\u0938\u092e\u0947\u0902 \u090f\u0915 \u0905\u0902\u0936 (\u090a\u092a\u0930) \u0914\u0930 \u0939\u0930 (\u0928\u0940\u091a\u0947) \u0939\u094b\u0924\u093e \u0939\u0948\u0965",
      conceptKn: "\u0cad\u0cbf\u0ca8\u0ccd\u0ca8\u0cb0\u0cbe\u0cb6\u0cbf\u0c97\u0cb3\u0cc1 \u0c92\u0c82\u0ca6\u0cc1 \u0caa\u0cc2\u0cb0\u0ccd\u0ca3 \u0cb5\u0cb8\u0ccd\u0ca4\u0cc1\u0cb5\u0cbf\u0ca8 \u0cad\u0cbe\u0c97\u0c97\u0cb3\u0ca8\u0ccd\u0ca8\u0cc1 \u0caa\u0ccd\u0cb0\u0ca4\u0cbf\u0ca8\u0cbf\u0ca7\u0cbf\u0cb8\u0cc1\u0ca4\u0ccd\u0ca4\u0cb5\u0cc6.",
      objectives: ["Identify numerators and denominators", "Convert unlike fractions to equivalent like fractions using LCM", "Add and subtract fractions and convert to decimals"],
      problem: "Calculate 1/3 + 2/5 = ?",
      steps: {
        en: ["Step 1: Find the LCM of denominators 3 and 5, which is 15.", "Step 2: Convert fractions: 1/3 becomes 5/15, and 2/5 becomes 6/15.", "Step 3: Add the numerators: 5/15 + 6/15 = 11/15."],
        hi: ["\u091a\u0930\u0923 1: \u0939\u0930\u094b\u0902 3 \u0914\u0930 5 \u0915\u093e LCM \u091c\u094d\u091e\u093e\u0924 \u0915\u0930\u0947\u0902, \u091c\u094b \u0915\u093f 15 \u0939\u0948\u0965", "\u091a\u0930\u0923 2: \u092d\u093f\u0928\u094d\u0928\u094b\u0902 \u0915\u094b \u092c\u0926\u0932\u0915\u0930 5/15 \u0939\u094b \u091c\u093e\u0924\u093e \u0939\u0948, \u0914\u0930 2/5 \u092c\u0926\u0932\u0915\u0930 6/15 \u0939\u094b \u091c\u093e\u0924\u093e \u0939\u0948\u0965", "\u091a\u0930\u0923 3: \u0905\u0902\u0936\u094b\u0902 \u0915\u094b \u091c\u094b\u0921\u093c\u0947\u0902: 5/15 + 6/15 = 11/15\u0965"],
        kn: ["\u0cb9\u0c82\u0ca4 1: \u0c9b\u0cc7\u0ca6\u0c97\u0cb3\u0cbe\u0ca6 3 \u0cae\u0ca4\u0ccd\u0ca4\u0cc1 5 \u0cb0 \u0cb2\u0cb8\u0cbe\u0c85 \u0c95\u0c82\u0ca1\u0cc1\u0cb9\u0cbf\u0ca1\u0cbf\u0caf\u0cbf\u0cb0\u0cbf, \u0c85\u0ca6\u0cc1 15 \u0c86\u0c97\u0cbf\u0ca6\u0cc6.", "\u0cb9\u0c82\u0ca4 2: \u0cad\u0cbf\u0ca8\u0ccd\u0ca8\u0cb0\u0cbe\u0cb6\u0cbf\u0c97\u0cb3\u0ca8\u0ccd\u0ca8\u0cc1 \u0caa\u0cb0\u0cbbf\u0cb5\u0cb0\u0ccd\u0ca4\u0cbf\u0cb8\u0cbf: 1/3 \u0c87\u0ca6\u0cc1 5/15 \u0c86\u0c97\u0cc1\u0ca4\u0ccd\u0ca4\u0ca6\u0cc6, \u0cae\u0ca4\u0ccd\u0ca4\u0cc1 2/5 \u0c87\u0ca6\u0cc1 6/15 \u0c86\u0c97\u0cc1\u0ca4\u0ccd\u0ca4\u0ca6\u0cc6.", "\u0cb9\u0c82\u0ca4 3: \u0c85\u0cb5\u0ca8\u0ccd\u0ca8\u0cc1 \u0c9b\u0cc7\u0ca6\u0ca6\u0cbf\u0c82\u0ca6 \u0cad\u0cbe\u0c97\u0cbf\u0cb8\u0cc1\u0cb5 \u0cae\u0cc1\u0cb2\u0c95 \u0cad\u0cbf\u0ca8\u0ccd\u0ca8\u0cb0\u0cbe\u0cb6\u0cbf\u0caf\u0ca8\u0ccd\u0ca8\u0cc1 \u0ca6\u0cb6\u0cae\u0cbe\u0c82\u0cb6\u0c95\u0ccd\u0c95\u0cc6 \u0caa\u0cb0\u0cbbf\u0cb5\u0cb0\u0ccd\u0ca4\u0cbf\u0cb8\u0cac\u0cb9\u0cc1\u0ca6\u0cc1."]
      },
      answer: "11/15",
      keyPoints: {
        en: ["Never add the denominators together.", "LCM is the smallest multiple shared by two numbers.", "Fractions can be converted to decimals by dividing numerator by denominator."],
        hi: ["\u0939\u0930\u094b\u0902 \u0915\u094b \u0915\u092d\u0940 \u092d\u0940 \u0906\u092a\u0938 \u092e\u0947\u0902 \u0928 \u091c\u094b\u0921\u093c\u0947\u0902\u0965", "LCM \u0926\u094b \u0938\u0902\u0916\u094d\u092f\u093e\u0913\u0902 \u0926\u094d\u0935\u093e\u0930\u093e \u0938\u093e\u091c\u094d\u0939\u093e \u0915\u093f\u092f\u093e \u0917\u092f\u093e \u0938\u092c\u0938\u0947 \u091b\u094b\u091f\u093e \u0917\u0941\u0923\u091c \u0939\u0948\u0965", "\u092d\u093f\u0928\u094d\u0928\u094b\u0902 \u0915\u094b \u0926\u0936\u092e\u0932\u0935 \u092e\u0947\u0902 \u092c\u0926\u0932\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0905\u0902\u0936 \u0915\u094b \u0939\u0930 \u0938\u0947 \u092d\u093e\u0917 \u0926\u093f\u092f\u093e \u091c\u093e\u0924\u093e \u0939\u0948\u0965"],
        kn: ["\u0c9b\u0cc7\u0ca6\u0c97\u0cb3\u0ca8\u0ccd\u0ca8\u0cc1 \u0c95\u0cc2\u0ca1\u0cac\u0cc7\u0ca1\u0cbf.", "\u0cb2\u0cb8\u0cbe\u0c85 \u0cae\u0cc2\u0cb2\u0c95 \u0cb9\u0ccb\u0cb2\u0cbf\u0cb8\u0cac\u0cb9\u0cc1\u0ca6\u0cc1.", "\u0cad\u0cbf\u0ca8\u0ccd\u0ca8\u0cb0\u0cbe\u0cb6\u0cbf\u0caf\u0ca8\u0ccd\u0ca8\u0cc1 \u0ca6\u0cb6\u0cae\u0cbe\u0c82\u0cae\u0ccd\u0c95\u0ccd\u0c95\u0cc6 \u0caa\u0cb0\u0cbbf\u0cb5\u0cb0\u0ccd\u0ca4\u0cbf\u0cb8\u0cac\u0cb9\u0cc1\u0ca6\u0cc1."]
      },
      facts: [
        { front: "What represents the bottom part of a fraction?", back: "The denominator, which shows the total equal parts.", hook: "Denominator = Down." },
        { front: "How do you add unlike fractions?", back: "Find the LCM, convert to like fractions, then add numerators.", hook: "LCM first, then add." }
      ],
      checks: [
        {
          question: "What is the Least Common Multiple (LCM) of 4 and 6?",
          options: ["12", "24", "10", "2"],
          correct_index: 0,
          explanation: "The multiples of 4 are 4, 8, 12... and of 6 are 6, 12... The smallest common multiple is 12."
        },
        {
          question: "Convert 3/4 to a decimal value.",
          options: ["0.75", "0.50", "0.25", "0.80"],
          correct_index: 0,
          explanation: "3 divided by 4 equals 0.75."
        }
      ]
    };
  }

  // 3. Force and Pressure / Physical properties
  if (lowerTitle.includes('force') || lowerTitle.includes('pressure') || lowerTitle.includes('motion') || lowerTitle.includes('friction') || lowerTitle.includes('light') || lowerTitle.includes('sound')) {
    return {
      conceptEn: "A force is a push or pull on an object resulting from its interaction with another object. Pressure is the force applied perpendicular to the surface of an object per unit area (Pressure = Force / Area).",
      conceptHi: "\u092c\u0932 \u0915\u093f\u0938\u0940 \u0935\u0938\u094d\u0924\u0941 \u092a\u0930 \u0932\u0917\u0928\u0947 \u0935\u093e\u0932\u093e \u0916\u093f\u0902\u091a\u093e\u0935 \u092f\u093e \u0927\u0915\u094d\u0915\u093e \u0939\u0948\u0965 \u0926\u093e\u092c \u092a\u094d\u0930\u0924\u093f \u0905\u0928\u0941\u092a\u094d\u0930\u0935\u094d\u0925 \u0915\u094d\u0937\u0947\u0924\u094d\u0930\u092b\u0932 \u092a\u0930 \u0932\u091e\u093e\u092f\u093e \u0917\u092f\u093e \u092c\u0932 \u0939\u0948 (\u0926\u093e\u092c = \u092c\u0932 / \u0915\u094d\u0937\u0947\u0924\u094d\u0930\u092b\u0932)\u0965",
      conceptKn: "\u0cac\u0cb2\u0cb5\u0cc1 \u0ca4\u0cb7\u0ccd\u0cb3\u0cc1\u0cb5\u0cbf\u0c95\u0cc6 \u0c85\u0ca5\u0cb5\u0cbe \u0c8e\u0cb3\u0cc6\u0caf\u0cc1\u0cb5\u0cbf\u0c95\u0cc6\u0caf\u0cbe\u0c97\u0cbf\u0ca6\u0cc6. \u0c92\u0ca4\u0ccd\u0ca4\u0ca1\u0cb5\u0cc1 \u0caa\u0ccd\u0cb0\u0ca4\u0cbf \u0c8f\u0cb0\u0cbf\u0caf\u0cbe \u0cae\u0cc7\u0cb2\u0cbf\u0ca8 \u0cac\u0cb2\u0cb5\u0cbe\u0c97\u0cbf\u0ca6\u0cc6 (\u0c92\u0ca4\u0ccd\u0ca4\u0ca1 = \u0cac\u0cb2 / \u0c8f\u0cb0\u0cbf\u0caf\u0cbe).",
      objectives: ["Define force as push or pull", "Calculate pressure given force and contact area", "Identify contact and non-contact forces"],
      problem: "Calculate the pressure when a force of 100 N is applied over an area of 2 square meters.",
      steps: {
        en: ["Step 1: Identify given values: Force (F) = 100 N, Area (A) = 2 m².", "Step 2: Recall the formula: Pressure (P) = Force / Area.", "Step 3: Substitute and solve: P = 100 / 2 = 50 N/m² (or Pascals)."],
        hi: ["\u091a\u0930\u0923 1: \u0926\u093f\u090f \u0917\u090f \u092c\u0932 (F) = 100 N \u0914\u0930 \u0915\u094d\u0937\u0947\u0924\u094d\u0930\u092b\u0932 (A) = 2 m\u00b2 \u0915\u094b \u092a\u0939\u091a\u093e\u0928\u0947\u0902\u0965", "\u091a\u0930\u0923 2: \u0938\u0942\u0924\u094d\u0930 \u0932\u093e\u0917\u0942 \u0915\u0930\u0947\u0902: \u0926\u093e\u092c = \u092c\u0932 / \u0915\u094d\u0937\u0947\u0924\u094d\u0930\u092b\u0932\u0965", "\u091a\u0930\u0923 3: \u092e\u093e\u0928 \u0930\u0916\u0915\u0930 \u0939\u0932 \u0915\u0930\u0947\u0902: P = 100/2 = 50 Pa\u0965"],
        kn: ["\u0cb9\u0c82\u0ca4 1: \u0cac\u0cb2 (F) = 100 N \u0cae\u0ca4\u0ccd\u0ca4\u0cc1 \u0c8f\u0cb0\u0cbf\u0caf\u0cbe (A) = 2 m\u00b2 \u0c97\u0cc1\u0cb0\u0cc1\u0ca4\u0cbf\u0cb8\u0cbf.", "\u0cb9\u0c82\u0ca4 2: \u0c92\u0ca4\u0ccd\u0ca4\u0ca1\u0ca6 \u0cb8\u0cc2\u0ca4\u0ccd\u0cb0: \u0c92\u0ca4\u0ccd\u0ca4\u0ca1 = \u0cac\u0cb2 / \u0c8f\u0cb0\u0cbf\u0caf\u0cbe.", "\u0cb9\u0c82\u0ca4 3: \u0cb2\u0cc6\u0c95\u0ccd\u0c95\u0cb5\u0ca8\u0ccd\u0ca8\u0cc1 \u0caa\u0cb0\u0cbbf\u0cb5\u0cb0\u0ccd\u0ca4\u0cbf\u0cb8\u0cbf: P = 100 / 2 = 50 Pa."]
      },
      answer: "50 Pascals",
      keyPoints: {
        en: ["Force can change the state of motion or shape of an object.", "SI unit of force is Newton (N), and pressure is Pascal (Pa).", "Friction is a contact force that opposes motion."],
        hi: ["\u092c\u0932 \u0915\u093f\u0938\u0940 \u0935\u0938\u094d\u0924\u0941 \u0915\u0940 \u0917\u0924\u093f \u092f\u093e \u0906\u0915\u093e\u0930 \u0915\u094b \u092c\u0926\u0932 \u0938\u0915\u0924\u093e \u0939\u0948\u0965", "\u092c\u0932 \u0915\u093e \u092e\u093e\u0924\u094d\u0930\u0915 \u0928\u094d\u092f\u0942\u091f\u0928 (N) \u0939\u0948 \u0914\u0930 \u0926\u093e\u092c \u0915\u093e \u092a\u093e\u0938\u094d\u0915\u0932 (Pa) \u0939\u0948\u0965", "\u091a\u093f\u092a\u0915\u094d\u0924\u093e \u092c\u0932 \u0917\u0924\u093f \u0915\u093e \u0935\u093f\u0930\u094b\u0927 \u0915\u0930\u0924\u093e \u0939\u0948\u0965"],
        kn: ["\u0cac\u0cb2\u0cb5\u0cc1 \u0cb5\u0cb8\u0ccd\u0ca4\u0cc1\u0cb5\u0cbf\u0ca8 \u0c9a\u0cb2\u0ca8\u0cc6\u0ca8\u0ccd\u0ca8\u0cc1 \u0c85\u0ca5\u0cb5\u0cbe \u0c86\u0c95\u0cbe\u0cb0\u0cb5\u0ca8\u0ccd\u0ca8\u0cc1 \u0cac\u0ca6\u0cb2\u0cbf\u0cb8\u0cac\u0cb9\u0cc1\u0ca6\u0cc1.", "\u0cac\u0cb2\u0ca6 \u0cae\u0cbe\u0ca8 \u0ca8\u0ccd\u0caf\u0cc2\u0c9f\u0ca8\u0ccd, \u0cae\u0ca4\u0ccd\u0ca4\u0cc1 \u0c92\u0ca4\u0ccd\u0ca4\u0ca1\u0ca6\u0cc1 \u0caa\u0ccd\u0cb0\u0ca4\u0ccd\u0caf\u0cc7\u0c95\u0cb5\u0cbe\u0c97\u0cbf \u0caa\u0ccd\u0caf\u0cbe\u0cb8\u0ccd\u0c95\u0cb2\u0ccd.", "\u0c98\u0cb0\u0ccd\u0cb7\u0ca3\u0cc6\u0caf\u0cc1 \u0c9a\u0cb2\u0ca8\u0cc6\u0ca8\u0ccd\u0ca8\u0cc1 \u0cb5\u0cbf\u0cb0\u0ccb\u0ca7\u0cbf\u0cb8\u0cc1\u0cb5 \u0cac\u0cb2\u0cbe\u0c97\u0cbf\u0ca6\u0cc6."]
      },
      facts: [
        { front: "What is the SI unit of force?", back: "The Newton (N).", hook: "Newton = Force scale." },
        { front: "What is the formula for pressure?", back: "Pressure = Force / Area.", hook: "Force divided by area." }
      ],
      checks: [
        {
          question: "Which of the following is a non-contact force?",
          options: ["Gravitational force", "Friction", "Tension", "Air resistance"],
          correct_index: 0,
          explanation: "Gravity acts over a distance without physical contact."
        },
        {
          question: "If area decreases while force stays constant, what happens to pressure?",
          options: ["It increases", "It decreases", "It stays the same", "It drops to zero"],
          correct_index: 0,
          explanation: "Since Pressure = Force/Area, decreasing the area increases the pressure."
        }
      ]
    };
  }

  // 4. Default Subject-specific templates
  let conceptEn = "In this chapter, we explore " + title + " in detail. This topic is essential for Grade " + grade + " academic standards. We study the core principles, terminology, and real-world relevance.";
  let conceptHi = "\u0907\u0938 \u0905\u0927\u094d\u092f\u094b\u092f \u092e\u0947\u0902 \u0939\u092e " + titleHi + " \u0915\u093e \u0935\u093f\u0938\u094d\u0924\u093e\u0930 \u0938\u0947 \u0905\u0927\u094d\u092f\u092f\u0928 \u0915\u0930\u0924\u0947 \u0939\u0948\u0902\u0965";
  let conceptKn = "\u0c88 \u0c85\u0ca7\u0ccd\u0caf\u0cbe\u0caf\u0ca6\u0cb2\u0ccd\u0cb2\u0cbf, \u0ca8\u0cbe\u0cb5\u0cc1 " + titleKn + " \u0ca6 \u0cac\u0c97\u0ccd\u0c97\u0cc6 \u0cb5\u0cbf\u0cb5\u0cb0\u0cb5\u0cbe\u0c97\u0cbf \u0c95\u0cb2\u0cbf\u0caf\u0cc1\u0ca4\u0ccd\u0ca7\u0cc7\u0cb5\u0cc6.";
  let objectives = ["Understand key concepts of " + title, "Solve exercises and apply rules related to " + title, "Analyze practical examples of " + title + " in daily life"];
  let problem = "Worked problem illustrating the main mechanics of " + title + ".";
  
  let steps = {
    en: ["Step 1: Identify key variables in " + title + ".", "Step 2: Apply the primary rules of this domain.", "Step 3: Resolve the values to calculate the final answer."],
    hi: ["\u091a\u0930\u0923 1: " + titleHi + " \u0915\u0947 \u092e\u0941\u0916\u094d\u092f \u091a\u0930\u094b\u0902 \u0915\u0940 \u092a\u0939\u091a\u093e\u0928 \u0915\u0930\u0947\u0902\u0965", "\u091a\u0930\u0923 2: \u0907\u0938 \u0915\u094d\u0937\u0947\u0924\u094d\u0930 \u0915\u0947 \u0928\u093f\u092f\u092e \u0932\u093e\u0917\u0942 \u0915\u0930\u0947\u0902\u0965", "\u091a\u0930\u0923 3: \u0905\u0902\u0924\u093f\u092e \u0909\u0924\u094d\u0924\u0930 \u0915\u0930\u0947\u0902\u0965"],
    kn: ["\u0cb9\u0c82\u0ca4 1: " + titleKn + " \u0ca8\u0cb2\u0ccd\u0ca8\u0cbf\u0ca8 \u0cae\u0cc1\u0c96\u0ccd\u0caf \u0c85\u0c82\u0cb6\u0c97\u0cb3\u0ca8\u0ccd\u0ca8\u0cc1 \u0c97\u0cc1\u0cb0\u0cc1\u0ca4\u0cbf\u0cb8\u0cbf.", "\u0cb9\u0c82\u0ca4 2: \u0c88 \u0cb5\u0cbf\u0cb7\u0caf\u0ca6 \u0cae\u0cc2\u0cb2 \u0ca8\u0cbf\u0caf\u0cae\u0c97\u0cb3\u0ca8\u0ccd\u0ca8\u0cc1 \u0c85\u0ca8\u0ccd\u0caf\u0cb5\u0cbf\u0cb8\u0cbf.", "\u0cb9\u0c82\u0ca4 3: \u0c85\u0ca8\u0ccd\u0ca4\u0cbf\u0cae \u0c89\u0ca4\u0ccd\u0ca4\u0cb0 \u0cb2\u0cc6\u0c95\u0ccd\u0c95 \u0cb9\u0cbe\u0c95\u0cbf."]
  };
  let answer = "Solved successfully";
  
  let keyPoints = {
    en: ["Mastering " + title + " builds foundational academic knowledge.", "Active problem solving helps retain concepts.", "Pay close attention to key definitions."],
    hi: [titleHi + " \u092e\u0947\u0902 \u092e\u0939\u093e\u0930\u0924 \u0939\u093e\u0938\u093f\u0932 \u0915\u0930\u0928\u0947 \u0938\u0947 \u0936\u0948\u0915\u094d\u0937\u0923\u093f\u0915 \u0915\u094c\u0936\u0932 \u092c\u0928\u0924\u093e \u0939\u0948\u0965", "\u0938\u0915\u094d\u0930\u093f\u092f \u0905\u092d\u094d\u092f\u093e\u0938 \u0938\u0947 \u0938\u092e\u091d \u092c\u0922\u093c\u0924\u0940 \u0939\u0948\u0965", "\u092e\u0941\u0916\u094d\u092f \u092a\u0930\u093f\u092d\u093e\u0937\u093e\u0913\u0902 \u092a\u0930 \u0927\u094d\u092f\u093e\u0928 \u0926\u0947\u0902\u0965"],
    kn: [titleKn + " \u0ca8\u0cb2\u0ccd\u0ca8\u0cbf \u0caa\u0cb0\u0cbf\u0ca3\u0ca4\u0cbf \u0caa\u0ca1\u0cc6\u0caf\u0cc1\u0cb5\u0cc1\u0ca6\u0cc1 \u0cb6\u0cc8\u0c95\u0ccd\u0cb7\u0ca3\u0cbf\u0c95 \u0c95\u0ccc\u0cb6\u0cb2\u0ccd\u0caf \u0cac\u0cc6\u0cb3\u0cc6\u0cb8\u0cc1\u0ca4\u0ccd\u0ca4\u0ca6\u0cc6.", "\u0ca8\u0cbf\u0cb0\u0c82\u0ca4\u0cb0 \u0c85\u0cad\u0ccd\u0caf\u0cbe\u0cb8\u0cb5\u0cc1 \u0ca8\u0cc6\u0ca8\u0caa\u0cbf\u0ca8 \u0cb6\u0c95\u0ccd\u0ca4\u0cbf \u0cb9\u0cc6\u0c9a\u0ccd\u0c9a\u0cbf\u0cb8\u0cc1\u0ca4\u0ccd\u0ca4\u0ca6\u0cc6.", "\u0cae\u0cc2\u0cb2 \u0cb5\u0ccd\u0caf\u0cbe\u0c96\u0ccd\u0caf\u0cbe\u0ca8\u0c97\u0cb3 \u0c97\u0cae\u0ca8 \u0cb9\u0cb0\u0cbf\u0cb8\u0cbf."]
  };

  let facts = [
    { front: "What is the core idea of " + title + "?", back: "The essential principles and definitions taught in this syllabus.", hook: "Focus on fundamentals." },
    { front: "Why is " + title + " important?", back: "It connects theoretical knowledge to practical everyday applications.", hook: "Theory meets practice." }
  ];

  let checks = [];

  // Generate related options based on subject
  if (subject === 'math') {
    checks = [
      {
        question: "Determine the primary value when resolving a standard " + title + " expression with coefficients 8 and 4.",
        options: ["12", "32", "4", "2"],
        correct_index: 0,
        explanation: "Adding the coefficients 8 and 4 gives the sum of 12."
      },
      {
        question: "Which mathematical property is most useful when working with " + title + "?",
        options: ["Distributive property", "Quadratic formula", "Pythagorean theorem", "Trigonometric ratio"],
        correct_index: 0,
        explanation: "The distributive property helps simplify operations on expressions."
      }
    ];
  } else if (subject === 'science') {
    checks = [
      {
        question: "Which scientific term describes the fundamental unit or phenomenon of " + title + "?",
        options: ["Matter and energy exchange", "Chemical solution", "Inertial frame", "Biological cell structure"],
        correct_index: 0,
        explanation: "Science chapters investigate matter, energy, and physical or biological properties."
      },
      {
        question: "What is the standard tool used to measure changes in a " + title + " experiment?",
        options: ["Calibrated sensor or thermometer", "Barometer", "Microscope", "Stethoscope"],
        correct_index: 0,
        explanation: "Calibrated instruments record temperature and reaction rates in scientific trials."
      }
    ];
  } else if (subject === 'social') {
    checks = [
      {
        question: "Which aspect is most directly studied when analyzing the historical or geographic impact of " + title + "?",
        options: ["Socio-economic developments", "Planetary orbits", "Algebraic factors", "Chemical structures"],
        correct_index: 0,
        explanation: "Social studies focuses on society, human history, resource distribution, and geography."
      },
      {
        question: "Who or what body regulates the civic issues related to " + title + " in a community?",
        options: ["Local government and administration", "Sports federation", "Science research institute", "Private bank"],
        correct_index: 0,
        explanation: "Civics deals with governance, public facilities, and societal regulations."
      }
    ];
  } else {
    checks = [
      {
        question: "What is the primary objective of studying " + title + "?",
        options: ["Improving comprehension and communication", "Solving equations", "Measuring gravity", "Trading goods"],
        correct_index: 0,
        explanation: "Language lessons enhance descriptive vocabulary and structural communication."
      },
      {
        question: "Identify the grammatical or descriptive role of " + title + " in a text.",
        options: ["Expressing ideas clearly", "Adding numbers", "Drawing diagrams", "Forming chemical bonds"],
        correct_index: 0,
        explanation: "Language lessons focus on contextual clarity, grammar, and expressions."
      }
    ];
  }

  return {
    conceptEn,
    conceptHi,
    conceptKn,
    objectives,
    problem,
    steps,
    answer,
    keyPoints,
    facts,
    checks
  };
}

function generateLessonJson(grade, subject, chapter) {
  const data = getTopicSpecificData(grade, subject, chapter);

  return {
    "version": "1.0",
    "grade": parseInt(grade, 10),
    "subject": subject,
    "chapter_id": chapter.id,
    "chapter_title": {
      "en": chapter.title,
      "hi": chapter.titleHi,
      "kn": chapter.titleKn
    },
    "topics": [
      {
        "topic_id": subject + "_grade" + grade + "_" + chapter.id + "_basics",
        "title": {
          "en": chapter.title + " - Fundamentals",
          "hi": chapter.titleHi + " - \u092c\u0941\u0928\u093f\u092f\u093e\u0926\u0940 \u092c\u093e\u0924\u0947\u0902",
          "kn": chapter.titleKn + " - \u0cae\u0cc2\u0cb2\u0ca4\u0caext\u0ccd\u0cb5\u0c97\u0cb3\u0cc1"
        },
        "learning_objectives": data.objectives,
        "estimated_minutes": 15,
        "base_story_template": {
          "en": "Welcome {{STUDENT_NAME}} to our learning session at the {{INTEREST_PLACE}}! Today we explore " + chapter.title + ". This lesson is key to mapping how inputs transform to outputs.",
          "hi": "{{INTEREST_PLACE}} \u092e\u0947\u0902 \u0906\u092a\u0915\u093e \u0938\u094d\u0935\u093e\u0917\u0924 \u0939\u0948 {{STUDENT_NAME}}! \u0906\u091c \u0939\u092e " + chapter.titleHi + " \u0915\u093e \u0905\u0927\u094d\u092f\u092f\u0928 \u0915\u0930\u0947\u0902\u0917\u0947\u0965",
          "kn": "{{INTEREST_PLACE}} \u0c97\u0cc6 \u0cb8\u0cc1\u0cb5\u0cbe\u0c97\u0ca4 {{STUDENT_NAME}}! \u0c87\u0ca2\u0cc1 \u0ca8\u0cbe\u0cb5\u0cc1 " + chapter.titleKn + " \u0ca6 \u0cac\u0c97\u0ccd\u0c97\u0cc6 \u0c95\u0cb2\u0cbf\u0caf\u0ccb\u0ca3."
        },
        "concept_explanation": {
          "en": data.conceptEn,
          "hi": data.conceptHi,
          "kn": data.conceptKn
        },
        "worked_example": {
          "problem": data.problem,
          "steps": [
            { "en": data.steps.en[0], "hi": data.steps.hi[0], "kn": data.steps.kn[0] },
            { "en": data.steps.en[1], "hi": data.steps.hi[1], "kn": data.steps.kn[1] },
            { "en": data.steps.en[2], "hi": data.steps.hi[2], "kn": data.steps.kn[2] }
          ],
          "answer": data.answer
        },
        "key_points": {
          "en": data.keyPoints.en,
          "hi": data.keyPoints.hi,
          "kn": data.keyPoints.kn
        },
        "interest_placeholders": {
          "INTEREST_PLACE": {
            "space":   { "en": "inside the control deck of a space shuttle", "hi": "\u0905\u0902\u0924\u0930\u093f\u0915\u094d\u0937 \u092f\u093e\u0928 \u0915\u0947 \u0928\u093f\u092f\u0902\u0924\u094d\u0930\u0923 \u0921\u0947\u0915 \u0915\u0947 \u092d\u0940\u0924\u0930", "kn": "\u0cac\u0cbe\u0cb9\u0ccd\u0caf\u0cbe\u0c95\u0cbe\u0cb6 \u0ca8\u0ccc\u0c96\u0cc6\u0caf \u0ca8\u0cbf\u0caf\u0c28\u0ccd\u0ca4\u0ccd\u0cb0\u0ca3 \u0ca1\u0cc6\u0c95\u0ccd \u0c92\u0cb3\u0c97\u0cc6" },
            "nature":  { "en": "at the forest wildlife sanctuary camp", "hi": "\u0935\u0928\u094d\u092f\u091c\u0940\u0935 \u0905\u092d\u094d\u092f\u093e\u0930\u0923\u094d\u092f \u0936\u093f\u0935\u093f\u0930 \u092e\u0947\u0902", "kn": "\u0cb5\u0ca8\u0ccd\u0caf\u0c9c\u0cc0\u0cb5\u0cbf \u0ca7\u0cbe\u0cae\u0ca6 \u0cb6\u0cbf\u0cb0\u0ca6\u0cb2\u0ccd\u0cb2\u0cbf" },
            "robots":  { "en": "next to the compiler terminal in a robot lab", "hi": "\u0930\u094b\u092c\u094b\u091f \u0932\u0948\u092c \u092e\u0947\u0902 \u0915\u0902\u092a\u093e\u0907\u0932\u0930 \u091f\u0930\u094d\u092e\u093f\u0928\u0932 \u0915\u0947 \u092a\u093e\u0938", "kn": "\u0cb0\u0ccb\u0cac\u0ccb\u0c9f\u0ccd \u0cb2\u0ccd\u0caf\u0cbe\u0cac\u0ccd \u0ca8\u0cb2\u0ccd\u0cb2\u0cbf\u0ca8 \u0c95\u0c82\u0caa\u0cc8\u0cb2\u0cb0\u0ccd \u0ca4\u0cc1\u0ca6\u0cbf\u0caf \u0cb9\u0ca4\u0ccd\u0ca4\u0cbf\u0cb0" },
            "sports":  { "en": "on the stadium practice field", "hi": "\u0916\u0947\u0932 \u0915\u0947 \u092e\u094d\u092f\u093e\u0928 \u092e\u0947\u0902", "kn": "\u0c95\u0ccd\u0cb0\u0cc0\u0ca1\u0cbe\u0c82\u0c97\u0ca3\u0ca6 \u0cae\u0cc8\u0ca6\u0cbe\u0ca8\u0ca6\u0cb2\u0ccd\u0cb2\u0cbf" },
            "stories": { "en": "near the ancient archives desk of the library", "hi": "\u092a\u0941\u0938\u094d\u0924\u0915\u093e\u0932\u092f \u0915\u0947 \u092a\u094d\u0930\u093e\u091a\u0940\u0928 \u0905\u092d\u093f\u0932\u0947\u0916\u093e\u0917\u093e\u0930 \u0915\u0947 \u092a\u093e\u0938", "kn": "\u0c97\u0ccd\u0cb0\u0c82\u0ca5\u0cbe\u0cb2\u0caf\u0ca6 \u0caa\u0cc1\u0cb0\u0cbe\u0ca4\u0ca8 \u0cb2\u0cc7\u0c96\u0ca8\u0c97\u0cb3 \u0cae\u0cc7\u0c9c\u0cbf\u0ca8 \u0cb9\u0ca4\u0ccd\u0ca4\u0cbf\u0cb0" },
            "history": { "en": "near the watchtower of Chitradurga Fort", "hi": "\u091a\u093f\u0924\u094d\u0930\u0926\u0941\u0930\u094d\u0917 \u0915\u093f\u0932\u0947 \u0915\u0947 \u0935\u0949\u091a\u091f\u093e\u0935\u0930 \u0915\u0947 \u092a\u093e\u0938", "kn": "\u0c9a\u0cbf\u0ca4\u0ccd\u0cb0\u0ca6\u0cc1\u0cb0\u0ccd\u0c97 \u0c95\u0ccb\u0c9f\u0cc6\u0caf \u0c95\u0cbe\u0cb5\u0cb2\u0cc1 \u0c97\u0ccb\u0caa\u0cc1\u0cb0\u0ca6 \u0cb9\u0ca4\u0ccd\u0ca4\u0cbf\u0cb0" },
            "default": { "en": "in the school study room", "hi": "\u0938\u094d\u0915\u0942\u0932 \u0915\u0947 \u0905\u0927\u094d\u092f\u092f\u0928 \u0915\u0915\u094d\u0937 \u092e\u0947\u0902", "kn": "\u0cb6\u0cbe\u0cb2\u0cc6\u0caf \u0c93\u0ca6\u0cc1\u0cb5 \u0c95\u0ccb\u0ca3\u0cc6\u0caf\u0cb2\u0ccd\u0cb2\u0cbf" }
          }
        }
      }
    ]
  };
}

function generateQuizBankJson(grade, subject, chapter) {
  const topicId = subject + "_grade" + grade + "_" + chapter.id + "_basics";
  const data = getTopicSpecificData(grade, subject, chapter);
  const questions = [];
  
  for (let idx = 1; idx <= 10; idx++) {
    const diff = idx <= 3 ? 'easy' : idx <= 7 ? 'medium' : 'hard';
    const baseQuestion = data.checks[(idx - 1) % data.checks.length];
    
    questions.push({
      "id": "q0" + idx,
      "difficulty": diff,
      "question": {
        "en": baseQuestion.question + " (Q" + idx + ")",
        "hi": baseQuestion.question + " (Q" + idx + ")",
        "kn": baseQuestion.question + " (Q" + idx + ")"
      },
      "options": {
        "en": baseQuestion.options,
        "hi": baseQuestion.options,
        "kn": baseQuestion.options
      },
      "correct_index": baseQuestion.correct_index,
      "explanation": {
        "en": baseQuestion.explanation,
        "hi": baseQuestion.explanation,
        "kn": baseQuestion.explanation
      },
      "diagram_ref": null
    });
  }

  return {
    "version": "1.0",
    "topic_id": topicId,
    "questions": questions
  };
}

function generateFlashcardsJson(grade, subject, chapter) {
  const topicId = subject + "_grade" + grade + "_" + chapter.id + "_basics";
  const data = getTopicSpecificData(grade, subject, chapter);
  const cards = [];

  for (let idx = 1; idx <= 5; idx++) {
    const baseFact = data.facts[(idx - 1) % data.facts.length];
    
    cards.push({
      "id": "fc0" + idx,
      "front": {
        "en": baseFact.front + " (FC" + idx + ")",
        "hi": baseFact.front + " (FC" + idx + ")",
        "kn": baseFact.front + " (FC" + idx + ")"
      },
      "back": {
        "en": baseFact.back,
        "hi": baseFact.back,
        "kn": baseFact.back
      },
      "memory_hook": {
        "en": baseFact.hook,
        "hi": baseFact.hook,
        "kn": baseFact.hook
      }
    });
  }

  return {
    "version": "1.0",
    "topic_id": topicId,
    "cards": cards
  };
}
// Generate learningContent.ts dynamic data
function buildLearningContentFile() {
  const topicsBySubject = {
    math: [],
    science: [],
    social: [],
    english: [],
    kannada: [],
    coding: [
      { id: 'coding-basics', title: { en: 'Coding Basics', hi: 'Coding Basics', kn: 'Coding Basics' }, desc: { en: 'Learn commands, sequences, and how programs follow instructions.', hi: 'Learn commands, sequences, and how programs follow instructions.', kn: 'Learn commands, sequences, and how programs follow instructions.' } },
      { id: 'logic-loops', title: { en: 'Logic & Loops', hi: 'Logic & Loops', kn: 'Logic & Loops' }, desc: { en: 'Use conditions and repeated steps to solve small problems.', hi: 'Use conditions and repeated steps to solve small problems.', kn: 'Use conditions and repeated steps to solve small problems.' } },
      { id: 'build-an-app', title: { en: 'Build a Mini App', hi: 'Build a Mini App', kn: 'Build a Mini App' }, desc: { en: 'Plan screens, buttons, and simple interactions for an app idea.', hi: 'Plan screens, buttons, and simple interactions for an app idea.', kn: 'Plan screens, buttons, and simple interactions for an app idea.' } }
    ]
  };

  const blueprints = {
    "coding-basics": {
      concept: 'Learn commands, sequences, and how programs follow instructions.',
      objectives: ['Define algorithm.', 'Sequence steps correctly.', 'Test simple code.'],
      example: 'Step-by-step coffee recipe.',
      steps: ['Boil water.', 'Add coffee powder.', 'Filter and serve.'],
      answer: 'Coffee ready',
      keyPoints: ['Sequence matters in coding.', 'Every instruction must be exact.', 'Test code to find errors.'],
      facts: [{ front: 'What is an algorithm?', back: 'A set of step-by-step instructions to solve a problem.', hook: 'Like a cooking recipe.' }],
      checks: [{ question: 'What is a sequence?', options: ['Ordered steps', 'Random choices', 'Colors only', 'None'], correct_index: 0, explanation: 'A sequence is the order in which steps are run.' }]
    },
    "logic-loops": {
      concept: 'Use conditions and repeated steps to solve small problems.',
      objectives: ['Write if-else logic.', 'Repeat actions with loops.', 'Solve logic challenges.'],
      example: 'If rainy, take umbrella.',
      steps: ['Check weather.', 'If rainy, get umbrella.', 'Else, go out normally.'],
      answer: 'Ready to go',
      keyPoints: ['Conditionals decide what code runs.', 'Loops repeat tasks.', 'Logic solves problems.'],
      facts: [{ front: 'What is a loop?', back: 'An instruction that repeats a block of code.', hook: 'Keep going until done.' }],
      checks: [{ question: 'What checks a condition?', options: ['If statement', 'Variable', 'Font size', 'Margin'], correct_index: 0, explanation: 'If statements make decisions based on conditions.' }]
    },
    "build-an-app": {
      concept: 'Plan screens, buttons, and simple interactions for an app idea.',
      objectives: ['Design screen layouts.', 'Wire up button events.', 'Build interactive prototypes.'],
      example: 'A button changes screen colors.',
      steps: ['Create screen layout.', 'Add button listener.', 'Change background on press.'],
      answer: 'Color changed',
      keyPoints: ['User flow describes the path.', 'Buttons trigger events.', 'Keep interfaces simple.'],
      facts: [{ front: 'What is an event?', back: 'An action like a click that triggers code.', hook: 'Button clicks trigger events.' }],
      checks: [{ question: 'What is user flow?', options: ['Steps a user follows', 'Water flow', 'Grammar rule', 'Color choice'], correct_index: 0, explanation: 'User flow is the path through a task.' }]
    }
  };

  // Add all topics and blueprints dynamically from curriculum
  for (const [grade, subjects] of Object.entries(CURRICULUM)) {
    for (const [subject, chapters] of Object.entries(subjects)) {
      for (const chapter of chapters) {
        const topicId = `${subject}_grade${grade}_${chapter.id}_basics`;
        
        // Push to topicsBySubject
        topicsBySubject[subject].push({
          id: topicId,
          title: {
            en: `${chapter.title} (G${grade})`,
            hi: `${chapter.titleHi} (G${grade})`,
            kn: `${chapter.titleKn} (G${grade})`
          },
          desc: {
            en: `Learn and master ${chapter.title} for Grade ${grade}.`,
            hi: `कक्षा ${grade} के लिए ${chapter.titleHi} में महारत हासिल करें।`,
            kn: `ತರಗತಿ ${grade} ಗಾಗಿ ${chapter.titleKn} ಅನ್ನು ಕರಗತ ಮಾಡಿಕೊಳ್ಳಿ.`
          }
        });

        // Add Blueprint
        blueprints[topicId] = {
          concept: `Learn and master the fundamentals of ${chapter.title} for Grade ${grade}.`,
          objectives: [
            `Understand key concepts of ${chapter.title}`,
            `Apply rules and solve related exercises`,
            `Analyze practical day-to-day applications`
          ],
          example: `Worked exercise for ${chapter.title}`,
          steps: [
            `Step 1: Identify the variables and targets.`,
            `Step 2: Apply the governing rule.`,
            `Step 3: Solve to obtain the final answer.`
          ],
          answer: `Solved successfully`,
          keyPoints: [
            `Understanding ${chapter.title} builds crucial basic skills.`,
            `Active practice improves retention.`,
            `Use context clues to evaluate your answers.`
          ],
          facts: [
            {
              front: `What is the core of ${chapter.title}?`,
              back: `The fundamental competencies taught in this chapter.`,
              hook: `Focus on basic definitions.`
            },
            {
              front: `Why do we study ${chapter.title}?`,
              back: `To understand the underlying patterns and solve real-world problems.`,
              hook: `Applications are all around us.`
            }
          ],
          checks: [
            {
              question: `Review question for ${chapter.title}. What is the fundamental concept?`,
              options: ['Primary Choice', 'Secondary Option', 'Alternative Option', 'Incorrect Selection'],
              correct_index: 0,
              explanation: `The correct option matches the fundamental rule taught in this lesson.`
            }
          ]
        };
      }
    }
  }

  // Generate code string for learningContent.ts
  const code = `// Automatically generated by seed_curriculum.js. Do not edit directly.
export type LocalizedText = { en: string; hi: string; kn: string };

export interface TopicItem {
  id: string;
  title: LocalizedText;
  desc: LocalizedText;
}

export interface Question {
  id: string;
  question: LocalizedText;
  options: { en: string[]; hi: string[]; kn: string[] };
  correct_index: number;
  explanation: LocalizedText;
}

export interface FlashcardItem {
  id: string;
  front: LocalizedText;
  back: LocalizedText;
  memory_hook: LocalizedText;
}

export interface LessonContent {
  topic_id: string;
  title: LocalizedText;
  learning_objectives: string[];
  estimated_minutes: number;
  base_story_template: LocalizedText;
  concept_explanation: LocalizedText;
  worked_example: {
    problem: string;
    steps: { en: string[]; hi: string[]; kn: string[] };
    answer: string;
  };
  key_points: { en: string[]; hi: string[]; kn: string[] };
  interest_placeholders: {
    INTEREST_PLACE: Record<string, LocalizedText>;
  };
  diagram: {
    source: string;
    caption: string;
    description: string;
  };
}

interface FactItem {
  front: string;
  back: string;
  hook: string;
}

interface CheckItem {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

interface TopicBlueprint {
  concept: string;
  objectives: string[];
  example: string;
  steps: string[];
  answer: string;
  keyPoints: string[];
  facts: FactItem[];
  checks: CheckItem[];
}

const text = (value: string): LocalizedText => ({ en: value, hi: value, kn: value });
const options = (values: string[]) => ({ en: values, hi: values, kn: values });

export const TOPICS_BY_SUBJECT: Record<string, TopicItem[]> = ${JSON.stringify(topicsBySubject, null, 2)};

const BLUEPRINTS: Record<string, TopicBlueprint> = ${JSON.stringify(blueprints, null, 2)};

const genericWrongOptions = ['A map symbol', 'Only a color', 'A random number'];

function getTopicTitle(topicId: string): string {
  for (const topics of Object.values(TOPICS_BY_SUBJECT)) {
    const found = topics.find((topic) => topic.id === topicId);
    if (found) return found.title.en;
  }
  return 'Fractions & Decimals';
}

function makeQuestion(topicId: string, index: number, check: CheckItem): Question {
  return {
    id: \`\${topicId}-q\${index}\`,
    question: text(check.question),
    options: options(check.options),
    correct_index: check.correct_index,
    explanation: text(check.explanation),
  };
}

function factQuestion(topicId: string, fact: FactItem, index: number): Question {
  const correct = fact.back;
  const wrong = genericWrongOptions.filter((item) => item !== correct).slice(0, 3);
  return {
    id: \`\${topicId}-fq\${index}\`,
    question: text(fact.front),
    options: options([correct, ...wrong]),
    correct_index: 0,
    explanation: text(fact.back),
  };
}

export function getQuizQuestions(topicId: string): Question[] {
  const blueprint = BLUEPRINTS[topicId] || BLUEPRINTS.fractions;
  const checks = blueprint.checks.map((check, index) => makeQuestion(topicId, index + 1, check));
  const factChecks = blueprint.facts.map((fact, index) => factQuestion(topicId, fact, index + 1));
  return [...checks, ...factChecks];
}

export function getFlashcards(topicId: string): FlashcardItem[] {
  const blueprint = BLUEPRINTS[topicId] || BLUEPRINTS.fractions;
  const factCards = blueprint.facts.map((fact, index) => ({
    id: \`\${topicId}-fc\${index + 1}\`,
    front: text(fact.front),
    back: text(fact.back),
    memory_hook: text(fact.hook),
  }));
  const quizCards = blueprint.checks.map((check, index) => ({
    id: \`\${topicId}-qfc\${index + 1}\`,
    front: text(check.question),
    back: text(check.explanation),
    memory_hook: text(\`Answer: \${check.options[check.correct_index]}\`),
  }));
  return [...factCards, ...quizCards];
}

export function getLessonContent(topicId: string): LessonContent {
  const blueprint = BLUEPRINTS[topicId] || BLUEPRINTS.fractions;
  const title = getTopicTitle(topicId);
  return {
    topic_id: topicId,
    title: text(title),
    learning_objectives: blueprint.objectives,
    estimated_minutes: 10,
    base_story_template: text("{{STUDENT_NAME}} is learning at the {{INTEREST_PLACE}}. Today's goal is " + title + ": " + blueprint.concept),
    concept_explanation: text(blueprint.concept),
    worked_example: {
      problem: blueprint.example,
      steps: {
        en: blueprint.steps,
        hi: blueprint.steps,
        kn: blueprint.steps,
      },
      answer: blueprint.answer,
    },
    key_points: {
      en: blueprint.keyPoints,
      hi: blueprint.keyPoints,
      kn: blueprint.keyPoints,
    },
    interest_placeholders: {
      INTEREST_PLACE: {
        space: text('space shuttle study desk'),
        nature: text('green forest camp'),
        robots: text('robotics lab table'),
        history: text('museum learning corner'),
        sports: text('cricket practice ground'),
        stories: text('storytelling room'),
        default: text('school classroom'),
      },
    },
    diagram: {
      source: \`https://picsum.photos/seed/\${topicId}/360/240\`,
      caption: \`Visual guide for \${title}\`,
      description: blueprint.concept,
    },
  };
}

export const QUIZ_BANK: Record<string, Question[]> = Object.fromEntries(
  Object.values(TOPICS_BY_SUBJECT)
    .flat()
    .map((topic) => [topic.id, getQuizQuestions(topic.id)])
);

export const FLASHCARD_BANK: Record<string, FlashcardItem[]> = Object.fromEntries(
  Object.values(TOPICS_BY_SUBJECT)
    .flat()
    .map((topic) => [topic.id, getFlashcards(topic.id)])
);

export function getTopicSubject(topicId: string): string {
  for (const [subjectId, topics] of Object.entries(TOPICS_BY_SUBJECT)) {
    if (topics.some((topic) => topic.id === topicId)) {
      return subjectId;
    }
  }
  return 'math';
}
`;

  fs.writeFileSync(LEARNING_CONTENT_TS, code, 'utf-8');
}

// Loop through each Grade, Subject and Chapter to write files
let createdCount = 0;
for (const [grade, subjects] of Object.entries(CURRICULUM)) {
  for (const [subject, chapters] of Object.entries(subjects)) {
    for (const chapter of chapters) {
      const targetDir = path.join(BASE_CONTENT_DIR, `grade_${grade}`, subject, chapter.id);
      createDirectory(targetDir);

      const lessonPath = path.join(targetDir, 'lesson.json');
      const quizPath = path.join(targetDir, 'quiz_bank.json');
      const flashcardPath = path.join(targetDir, 'flashcards.json');

      fs.writeFileSync(lessonPath, JSON.stringify(generateLessonJson(grade, subject, chapter), null, 2), 'utf-8');
      fs.writeFileSync(quizPath, JSON.stringify(generateQuizBankJson(grade, subject, chapter), null, 2), 'utf-8');
      fs.writeFileSync(flashcardPath, JSON.stringify(generateFlashcardsJson(grade, subject, chapter), null, 2), 'utf-8');

      createdCount++;
    }
  }
}

// Re-write learningContent.ts with complete data
buildLearningContentFile();

console.log(`[Seeder] Successfully seeded ${createdCount} chapters under ${BASE_CONTENT_DIR}`);
console.log(`[Seeder] Successfully updated learningContent.ts at ${LEARNING_CONTENT_TS}`);
