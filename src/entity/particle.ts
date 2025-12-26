class Particle {
    type;
    x;
    y;

    data: any;

    static list: Particle[] = [];

    constructor(type: string, x: number, y: number, data: any) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.data = data;

        Particle.list.push(this);
    }

    static removeAll() {
        Particle.list = [];
    }
    static addDamageParticle(x: number, y: number, value: number) {
        new Particle("damage", x, y, {
            value: value,
        });
    }
    static addCritDamageParticle(x: number, y: number, value: number) {
        new Particle("crit_damage", x, y, {
            value: value,
        });
    }
    static addExplosionParticle(x: number, y: number, radius: number, vectorX: number, vectorY: number) {
        new Particle("explosion", x, y, {
            radius: radius,
            vectorX: vectorX,
            vectorY: vectorY,
        });
    }
    static addFireworkParticle(x: number, y: number, radius: number, vectorX: number, vectorY: number) {
        new Particle("firework", x, y, {
            radius: radius,
            vectorX: vectorX,
            vectorY: vectorY,
            color: Math.random(),
        });
    }
}

export { Particle };