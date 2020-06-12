//import
const mathlab = require('./mathlab');
const unitClass = require('./Unit');
const hook = require('./getUnitsFromBattle');

// ______________________________________________________________________________
// make your units here:
// just drop the percent sign where necessary.
// syntax is unit(type, fp, arm, man, hp, continent+defense bonuses, type bonuses (like 10% damage against armor), counters, healing, shots per turn (as in jackhammer attacks))

// say I have a mortar infantry with 10% healing to friendly infantry, 20% defense bonus, and  10% damage increase against armor/air
exampleMortar = new unitClass.unit("Infantry", 3, 2, 2, 50, 20, [["Armor", 10],["Air", 10]], ["Infantry"], [["Infantry", 10]],2);
exampleInfantry = new unitClass.unit("Infantry", 3, 1, 2, 50, 0, [], [], [],1);
testHealer = new unitClass.unit("idkMan", 0,0,0,10,0,[],[],[["Infantry",30]],1);

// ______________________________________________________________________________

// instantBattle simulates the battle 'rounds' number of times and prints how many each side won with remaining units
// change pFriendlies and pEnemies to fit how many units you have in your battle and what you named them.
async function instantBattle(message, battleID, rounds){
    const gettery = await hook.getUnitObjects(battleID);
    if(gettery[0].length < 1 || gettery[1].length <1){ return([0,0,0,0,0]);}else{await message.edit("Simulating...");}
    const pFriendlies = gettery[0];
    const pEnemies = gettery[1];

    let friendlies = pFriendlies.slice();
    let enemies = pEnemies.slice();

    let enemyWins = 0;
    let friendliesretreated = 0;
    let friendlyWins = 0;
    let enemiesretreated = 0;
    let enemyremainder = 0;
    let friendlyremainder = 0;
    for(roundnum = 0; roundnum < rounds; roundnum++){
        let winner = "unknown";
        while (winner == "unknown"){
            let order = await mathlab.initiativeRoll(friendlies.slice(), enemies.slice());
            for(let i = 0; i < order.length; i++){
                if (friendlies.length > 0 && enemies.length > 0 && order[i].alive && winner == "unknown"){
                    if (friendlies.includes(order[i])){
                        let target = enemies[Math.floor(Math.random() * enemies.length)];
                        await mathlab.attack(order[i], target, pEnemies);
                        if (target.alive == false){
                            enemies.splice(enemies.indexOf(target), 1);
                            if (enemies.length == 0){ winner = "friendlies";}
                        }
                    }
                    else if (enemies.includes(order[i])){
                        let target = friendlies[Math.floor(Math.random() * friendlies.length)];
                        await mathlab.attack(order[i], target, pFriendlies);
                        if (target.alive == false){
                            friendlies.splice(friendlies.indexOf(target), 1);
                            if (friendlies.length == 0){ winner = "enemies";}
                        }
                    }
                    if(winner == "unknown"){ winner = mathlab.checkRetreat(friendlies, enemies);}
                }
            }
        }
        if (winner == "enemies"){
            enemyWins += 1;
            enemyremainder += enemies.length;
            friendliesretreated += friendlies.length;
        }
        if (winner == "friendlies"){
            friendlyWins += 1;
            friendlyremainder += friendlies.length;
            enemiesretreated += enemies.length;
        }
        friendlies = pFriendlies.slice();
        enemies = pEnemies.slice();
        pFriendlies.forEach(function(unit){
            unit.hp = unit.maxhp;
            unit.alive = true;
        });
        pEnemies.forEach(function(unit){
            unit.hp = unit.maxhp;
            unit.alive = true;
        });
    }
    if(friendlyWins > 1){ friendlyremainder /= friendlyWins; enemiesretreated /= friendlyWins;}
    if(enemyWins > 1){ enemyremainder /= enemyWins; friendliesretreated /= enemyWins;}
    return([friendlyWins, enemyWins, [Math.round(friendlyremainder*100)/100, Math.round(enemiesretreated*100)/100], [Math.round(enemyremainder*100)/100, Math.round(friendliesretreated*100)/100],1]);
}

exports.BattleSimulate = async function(message, id, numBattles){
    const results = await instantBattle(message, id, numBattles);
    if(results[4] == 0){
        return("Encountered an error fetching units from battle");
    }
    let responseStr = "**Tie**";
    if(results[0] > results[1]){
        responseStr = "**Defenders won!**";
    }
    else if (results[0] < results[1]){
        responseStr = "**Attackers won!**";
    }
    let resStr =  `After ${numBattles} simulations, I predict that the defenders have a ${Math.round(((results[0]/numBattles) + Number.EPSILON)*10000)/100.0}% chance of victory. (attackers have ${Math.round(((results[1]/numBattles) + Number.EPSILON)*10000)/100.0}% chance.)\n\nGiven the defenders win, they can expect to have ${results[2][0]} units left while the attackers can expect ${results[2][1]} to survive.\nGiven the attackers win, they can expect to have ${results[3][0]} units left while the defenders can expect ${results[3][1]} to survive.`
    resStr = "```\n" + resStr + "\n```";
    responseStr += resStr;
    return(responseStr);
}


//attack(attacker,defender,liveDefenders);
//attack(exampleMortar, exampleInfantry, [exampleInfantry, testHealer]);
