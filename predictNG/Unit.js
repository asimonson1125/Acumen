exports.unit = class{
    constructor(type, fp, arm, man, hp, cumulativeBoosts, unitBoosts, counters, healing, shotsPerTurn){
        this.type = type;
        this.firepower = fp;
        this.armor = arm;
        this.maneuver = man;
        this.hp = hp;
        this.maxhp = hp;
        this.bonuses = cumulativeBoosts; //30% is input as just 30
        this.typeBonuses = unitBoosts;
        this.counters = counters;
        this.alive = true;
        this.healing = healing;
        this.jackhammerFactor = shotsPerTurn;
        this.timesVictorious = 0; //times returned victorious
        this.timesRetreated = 0; //times retreated (alive)
        this.totalDamageOut = 0;
        this.timesFired = 0;
    }
}