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
    Area : string
}

interface MonkeyRoamerType {
	monkey: Model;
	readonly monkeytype: "SlowMonkey" | "NormalMonkey" | "FastMonkey";
	HumanoidRootPart: BasePart | undefined;
	reproducing: boolean;
    humanoid : Humanoid;
    Reproduce : (monkeyBasePart: BasePart) => void;
    constructor: (monkey: Model, monkeytype: "SlowMonkey" | "NormalMonkey" | "FastMonkey") => void;
}



export { Monkey, SpecificSpawn , GetSimulationInfo, MonkeyRoamerType };