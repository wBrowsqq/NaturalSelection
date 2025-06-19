type Monkey = {
    Velocity: number;
    Health: number;
    ReproductionTime: number;
}

type SpecificSpawn = {
    SlowMonkeys: number;
    FastMonkeys: number;
    NormalMonkeys: number;
}

type GetSimulationInfo = {
    SlowMonkeys: number;
    FastMonkeys: number;
    NormalMonkeys: number;
    BananaGen: number
}
export { Monkey, SpecificSpawn , GetSimulationInfo };