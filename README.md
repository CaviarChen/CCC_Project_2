# CCC_Project_2
[![All Contributors](https://img.shields.io/badge/all_contributors-5-orange.svg)](#contributors)
[![Github](https://img.shields.io/github/license/CaviarChen/CCC_Project_2.svg)](https://github.com/CaviarChen/CCC_Project_2/blob/master/LICENSE)

## Project Details
The focus of this project is to explore the Seven Deadly Sins through social media Twitter. We combined both early tweets (Jan 2016 - Apr 2018) provided by our lecturer - Prof Richard Sinnott and real-time tweets harvested from Twitter API (Apr 2018 - Now), and analysed with AURIN statistical data.

### Team 42
Minjian Chen 813534  
Shijie Liu 813277  
Weizhi Xu	752454  
Wenqing Xue 813044  
Zijun Chen 813190  

## Technical Details
### Folder Structure
```js
/
├── automation/         // 
├── common_script/      // 
├── frontend/           // Code for frontend
├── go_backend/         // 
├── harvester/          // 
├── importer/           // 
└── preprocessor/       // 
```

### Setup
#### Mapbox GL JS
1. Obtain your API Token [here](https://www.mapbox.com/account/access-tokens).
2. Add the key into `frontend/src/config.js` like [example](https://github.com/CaviarChen/CCC_Project_2/blob/master/frontend/src/config.example.js).
