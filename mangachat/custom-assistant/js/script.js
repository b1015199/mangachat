var vm = new Vue({

  el: "#app",
  data: {
    summoner: {
      name: null,
      id: null,
      tier: null,
      division: null,
      lp: null
    },
    KEY: "RGAPI-84a91d70-567c-4243-9944-cfa0f659ec5b",
    URL: {
      SUMMONER: "https://jp1.api.riotgames.com/lol/summoner/v4/summoners/by-name/",
      RANK: "https://jp1.api.riotgames.com/lol/league/v4/positions/by-summoner/"
    },
    RequestHeaders: {
      "Origin": "https://developer.riotgames.com",
      "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Riot-Token": "RGAPI-84a91d70-567c-4243-9944-cfa0f659ec5b",
      "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36"
    }
  },

  methods: {
    // get a summoner profile with Summoner Name
    getSummoner: function(){
      'use strict';
      fetch(vm.URL.SUMMONER + "UuuEee", {
        method: 'GET',
        headers: new Headers({
          "Origin": "https://developer.riotgames.com",
          "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Riot-Token": "RGAPI-84a91d70-567c-4243-9944-cfa0f659ec5b",
          "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36",
          "Access-Control-Allow-Origin": "*"
        }),
        mode: "no-cors"
      }).then(function(response) {
        if (response.ok) {
          return response.json();
        }
        return response.json().then(function(json) {
          throw new Error(json.message);
        });
      }).then(function(json) {
        vm.summoner.name = json.name;
        vm.summoner.id = json.id;
      }).catch(function(err) {
        window.console.error(err.message);
      });
    },
    // get a summoner's rank with Summoner ID
    getRank: function(){
      'use strict';
      fetch(vm.URL.RANK + vm.summoner.id, {
        method: 'GET',
        headers: new Headers({
          "X-Riot-Token": vm.KEY,
          "Origin": "https://developer.riotgames.com"
        })
      }).then(function(response) {
        if (response.ok) {
          return response.json();
        }
        return response.json().then(function(json) {
          throw new Error(json.message);
        });
      }).then(function(json) {
        vm.summoner.tier = json.tier;
        vm.summoner.division = json.rank;
        vm.summoner.lp = json.leaguePoints;
      }).catch(function(err) {
        window.console.error(err.message);
      });
    }
  }
});
