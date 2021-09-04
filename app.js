const XIVAPI = require('@xivapi/js');
require('dotenv').config();

const csv = require('csvtojson');

const mappyCSVPath = './resources/xivapi_mappy_2021-09-02-09-36-27.csv'

var mappyData = {};
csv().fromFile(mappyCSVPath).then(response=>{
    mappyData = response;
});

const xiv = new XIVAPI({
private_key: process.env.PRIVATE_KEY
});

// xiv.search(process.argv[2].toString()).then(response =>{
//     console.log(response);
// }).catch(error=>{
//     throw(error);
// })

function groupBy(arr, property) {
    return arr.reduce(function(memo, x) {
      if (!memo[x[property]]) { memo[x[property]] = []; }
      memo[x[property]].push(x);
      return memo;
    }, {});
  };
  


mobLookup = async (mobName) =>{
    const mobData = await xiv.search(mobName.toString()).then( response =>{
        // console.log(response);
        return(response.Results.filter(o=>(o.UrlType==='BNpcName')))
    }).then(response =>{
        // console.log(response);
        return mappyData.filter(o=> (o.Type ==='BNPC')&&(o.BNpcNameID===response[0].ID.toString()));
    }).then(response=>{
        //TODO: group array into subarrays
        
        return groupBy(response,'MapID');

        // const firstMapID = response[0].MapID;


        // const filterCallback = (element)=>{
        //     return element.MapID === firstMapID;
        // }
        // const filteredResult = response.filter(filterCallback);
        // const lengthDiff = response.length - filteredResult.length;
        // console.log(response.length)
        // console.log(lengthDiff);
        // if (lengthDiff > 0) {
        //     throw(new Error('found mob appearing on multiple maps, idk what to do.'));
        // }
        // return filteredResult;
            
    }).then(response=>{
        var consolidatedMobdata = {};
        for (const mapID in response) {
            const currLength = response[mapID].length;
            consolidatedMobdata[mapID] = response[mapID].reduce((prev,curr)=>{
                prev.posx += Number.parseFloat(curr['PosX'])/currLength;
                prev.posy += Number.parseFloat(curr['PosY'])/currLength;
                return prev;
            },{posx:0,posy:0});


            //round to 1 decimal
            for(const param in consolidatedMobdata[mapID]) {
                consolidatedMobdata[mapID][param] = consolidatedMobdata[mapID][param].toString();
            }
        }
        return consolidatedMobdata;
    }).catch(error=>{
        throw(error);
    });

    console.log(mobData);
    const mapData = await xiv.data.list('Map',{ids:Object.keys(mobData).toString()});
    console.log(mapData);

    //assume for the time being that 

    // const mapName = await xiv.data.get('Map',mapIDs);
    // console.log(mapName);
}

mobLookup('Little Ladybug');

// xiv.data.get('BNpcName',632).then(response=>{
//     // console.log(response.ID);
//     mob = mappyData.filter(o=> (o.Type ==='BNPC')&&(o.BNpcNameID===response.ID.toString()));
//     console.log(mob);
    
// }).catch(error=>{
//     throw(error);
// })

