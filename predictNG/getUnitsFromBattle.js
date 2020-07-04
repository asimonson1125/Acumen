const unitClass = require('./Unit');
const fetch = require('node-fetch');

function generate(x, attacking, continent, defType, maxHP){
    let hpstat;
    if(maxHP){
        hpstat = x.unit_max_health;
    }
    else{
        hpstat = x.current_health;
        if(hpstat == 0){
            return false;
        }
    }
    let ret = "";
    let locationBonus = 0;
    let type = 0;
    let typeBonus = [];
    let counters = [];
    let heals = [];
    let healtype = "";
    let shots = 1;
    let continentStr = continent + " climates";
    if(x.type == 1){ type = "Infantry";}
    else if (x.type == 2){ type = "Armor";}
    else if (x.type == 3){ type = "Air";}
    else if (x.type == 4){ type = "Special Forces"}
    else if (x.type == 5){ type = "Static"}

    if(attacking == false){ //defending
        x.unit_stats.forEach(function(i){ 
            if(i.type == 1 && defType == 0){ locationBonus += i.value; } //defense bonus
        });
    }
    x.unit_stats.forEach(function(i){ 
        if(i.type == 3){ //unit type bonus
            let nstPlace = 18; //find where the nst in against is.
            //This is important in case the text length changes due to triple digit values.
            while(i.text.substring(nstPlace, nstPlace+3) != "nst"){
                nstPlace++;
            }
            let fullTypeStr = i.text.substring(nstPlace+4);
            let unitBonusType = fullTypeStr.substring(0,fullTypeStr.length-6);
            typeBonus.push([unitBonusType, i.value]);
        }
                
        else if(i.type == 4){ //continent bonus
            let ingPlace = 25; //find where the ing in fighting is.
            //This is important in case the text length changes due to triple digit values.
            while(i.text.substring(ingPlace, ingPlace+3) != "ing"){
                ingPlace++;
            }
            if(i.text.substring(ingPlace+7) == continentStr){
                locationBonus += i.value;
            }
        }
            
        else if(i.type == 6){ //damage reduction
            let space = 35;
            while(i.text[space] != " "){
                space++;
            }
            if(i.text.substring(32,space) == "Special"){healtype = "Special Forces";} //special forces is two words.. sad.
            else{healtype = i.text.substring(32,space);}
            heals.push([healtype, i.value]);
        }
            
        else if(i.type == 7){ shots = i.value;} //multiple attacks
        else if(i.type == 10){ 
            counters.push(i.value);
        }
    });
    return(new unitClass.unit(type,x.unit_off_str,x.unit_def_str,x.unit_speed,hpstat,locationBonus,typeBonus,counters,heals,shots));
}


exports.getUnitObjects = async function (battleID, assumeMaxHP){
    let a = await fetch(`https://api.nationsgame.net/game/getBattleData.php?battle=${battleID}`, {
      "headers": {
        "accept": "application/json",
          "accept-language": "en-US,en;q=0.9",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site"
      },
        "referrer": "https://app.nationsgame.net",
    "referrerPolicy": "no-referrer-when-downgrade",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    let b = await a.json();

    
    let continentNum = b.background[20];
    let continentType = "";
    if(continentNum == "1"){continentType = "Temperate";}
    else if (continentNum == "2"){continentType = "Tropical";}
    else if (continentNum == "3"){continentType = "Subtropical";}
    else if (continentNum == "4"){continentType = "Desert";}
    else if (continentNum == "5"){continentType = "Alpine";}

    let friendlies = [];
    let enemies = [];
    for(let i = 0; i < b.defenders.length; i++){
        b.defenders[i].groups[0].units.forEach(function(x){
            let uObject = generate(x,false,continentType, i, assumeMaxHP);
            if(uObject){
                friendlies.push(uObject);
            }
        });
    }
    for(let i = 0; i < b.attackers.length; i++){
        b.attackers[i].groups[0].units.forEach(function(x){
            let uObject = generate(x,true,continentType, i, assumeMaxHP);
            if(uObject){
                enemies.push(uObject);
            }
        });
    }
    return([friendlies,enemies]);
}