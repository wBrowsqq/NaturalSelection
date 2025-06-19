// Description: This module is responsible for spawning monkey models in the game.
import {Monkey, GetSimulationInfo} from "../types/types";

const Baseplate = game.GetService("Workspace").WaitForChild("Baseplate") as BasePart;
const Monkeys = game.GetService("ReplicatedStorage").WaitForChild("Monkeys");
const MacacosFolder = game.GetService("Workspace").WaitForChild("Macacos");

const MonkeyModels = {
	FastMonkeys: Monkeys.WaitForChild("FastMonkey") as Model,
	NormalMonkeys: Monkeys.WaitForChild("NormalMonkey") as Model,
	SlowMonkeys: Monkeys.WaitForChild("SlowMonkey") as Model
};

// Função para gerar posição aleatória no cilindro da baseplate
const GetRandomPositionOnCylinder = (): Vector3 => {
	const baseplateSize = Baseplate.Size;
	const radius = baseplateSize.X / 2; 
	
	
	const angle = math.random() * math.pi * 2;
	
	const distance = math.random() * radius;
	
	
	const x = math.cos(angle) * distance;
	const z = math.sin(angle) * distance;
	
	
	const y = Baseplate.Position.Y + (baseplateSize.Y / 2) + 5;
	
	return new Vector3(
		Baseplate.Position.X + x,
		y,
		Baseplate.Position.Z + z
	);
};

// Função para spawnar um tipo específico de macaco
const SpawnSpecificMonkey = (monkeyModel: Model, count: number): void => {
	for (let i = 0; i < count; i++) {
		const monkeyClone = monkeyModel.Clone();
		monkeyClone.Parent = MacacosFolder;
		
		// Posiciona o macaco em uma posição aleatória
		const randomPosition = GetRandomPositionOnCylinder();
		
		// Usa PivotTo se o modelo tem PrimaryPart, senão usa SetPrimaryPartCFrame
		if (monkeyClone.PrimaryPart) {
			monkeyClone.PivotTo(new CFrame(randomPosition));
		} else {
			// Fallback: move o primeiro BasePart encontrado
			const firstPart = monkeyClone.FindFirstChildOfClass("BasePart") as BasePart;
			if (firstPart) {
				firstPart.Position = randomPosition;
			}
		}
	}
};

const SpawnMonkey = (SpecificMonkeys: GetSimulationInfo): void => {
	// Spawna cada tipo de macaco
	SpawnSpecificMonkey(MonkeyModels.FastMonkeys, SpecificMonkeys.FastMonkeys);
	SpawnSpecificMonkey(MonkeyModels.NormalMonkeys, SpecificMonkeys.NormalMonkeys);
	SpawnSpecificMonkey(MonkeyModels.SlowMonkeys, SpecificMonkeys.SlowMonkeys);
	
};

// Exporta a função principal
export { SpawnMonkey };