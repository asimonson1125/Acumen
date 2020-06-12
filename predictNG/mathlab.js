function baseDamage(fp, arm){
    return(Math.ceil(Math.sqrt(47.5 * (fp + 1)) + (Math.sqrt(47.5 * (arm + 20)) - 29.5)));
}

function damagemod(fp, bonus){
    return(fp * ((bonus / 100) + 1) * 4);
}

function mitigation(arm, bonus){
    return(arm * ((bonus / 100) + 1) * 4);
}

function hitResult(firerMan, targetMan){
    const baseRoll = Math.floor(Math.random() * 100) + 1;
    if (baseRoll <= 5){ return("MISS");}
    else if (baseRoll >= 95){ return ("CRIT");}
    else if (baseRoll >= 80){ return("HIT");}
    const modifier = firerMan * 10 - 50;
    const toBeat = targetMan * 10;
    const finalRoll = baseRoll + modifier;
    if (finalRoll > toBeat){ return("HIT");} else{ return("GRAZE");}
}

exports.attack = function(firer, target, targetAllies){
    if(firer.alive == false){ return;} //he dead bruh
    let targetBonus = 0;
    let man,fp,tArm,tMan;
    firer.typeBonuses.forEach(function(i){if(i[0] == target.type){targetBonus = i[1];}});
    let multiplier = (firer.bonuses + targetBonus);    
    
    if (firer.counters.includes(target.type)){
        fp = (1.25 * firer.firepower + 6);
        man = (1.25 * firer.maneuver + 3);
    }
    else{
        fp = firer.firepower;
        man = firer.maneuver;
    }
    target.typeBonuses.forEach(function(i){if(i[0] == target.type){ targetBonus = i[1];}});
    let tMultiplier = (target.bonuses + targetBonus);    
    if (target.counters.includes(firer.type)){
        tArm = (1.25 * target.armor + 3);
        tMan = (1.25 * target.maneuver + 3);
    }
    else{
        tArm = target.armor;
        tMan = target.maneuver;
    }
    let roll = hitResult(man * (multiplier/100 + 1), tMan * (tMultiplier/100 + 1));
    if (roll == "MISS"){ return;}
    let damage = Math.ceil(baseDamage(firer.firepower, firer.armor)) + Math.ceil(damagemod(fp, multiplier)) // 90% sure base doesn't include bonuses or counter stat
    damage -= mitigation(tArm, tMultiplier);
    if (roll == "CRIT"){ damage *= 1.5;}
    else if (roll == "GRAZE"){ damage *= .5;}
    let damageReduct = 0
    targetAllies.forEach(function(i){i.healing.forEach(function(type){if(type[0] == target.type){ damageReduct += type[1];}});});
    if(damageReduct > 30){ damageReduct = 30;} // 30% is max friendly damage reduction
    if (firer.type in target.counters){ healing = Math.round(damage * ((damageReduct + 50) / 100));}
    else{ healing = Math.round(damage * (damageReduct / 100));}
    damage = Math.ceil(damage - healing);
    // damage cannot be 0 or negative, so this is my compensation since we don't know how the real calculation works
    if(damage < 5){ damage = 5;}
    target.hp -= damage;
    if (target.hp <= 0){ target.alive = false;}
    return;
}

exports.initiativeRoll = function(friendlies, enemies){
    // roll random number then multiply by hp percentage (estimate).  Return array with objects in order
    let unitList = [];
    let allUnits = friendlies;
    enemies.forEach(function(x){ allUnits.push(x);});
    allUnits.forEach(function(unit){
        for(let i = 0; i < unit.jackhammerFactor; i++){ unitList.push([unit,0]);}
    });
    unitList.forEach(function(x){
        let iRoll = Math.floor(Math.random() * 100) + 1;
        x[1] = iRoll * Math.pow((x[0].hp / x[0].maxhp),2);  // hp factor squared for more dramatic effect
        if("Special Forces" in x[0].counters){ x[1] *= 3;}
    });
    // Now each unit is assigned an initiative roll.  Now to sort them.
    unitList.sort(function(a, b){return b[1]-a[1]});
    let ret = [];
    unitList.forEach(function(i){ret.push(i[0]);});
    return(ret);
}

exports.checkRetreat = function(friendlies, enemies){
    let friendlyPower = 0;
    let enemyPower = 0;
    friendlies.forEach(function(i){ friendlyPower += i.firepower*(i.hp/i.maxhp);});
    enemies.forEach(function(i){ enemyPower += i.firepower*(i.hp/i.maxhp)});
    if(friendlyPower * .1 > enemyPower && Math.random() <= .8){ return "friendlies";}
    else if (enemyPower * .1 > friendlyPower && Math.random() <= .8){ return "enemies";}
    return "unknown";
}