// Description: This module is responsible for spawning monkey models in the game.
import {Monkey, GetSimulationInfo} from "../types/types";

const Baseplate = game.GetService("Workspace").WaitForChild("SpawnPart") as BasePart;
const Monkeys = game.GetService("ReplicatedStorage").WaitForChild("Mutations") as Folder
const MacacosFolder = game.GetService("Workspace").WaitForChild("Macacos");

const MonkeyModels = {
	FastMonkeys: Monkeys.WaitForChild("FastMonkey") as Model,
	NormalMonkeys: Monkeys.WaitForChild("NormalMonkey") as Model,
	SlowMonkeys: Monkeys.WaitForChild("SlowMonkey") as Model
};

// Função para gerar posição aleatória no cilindro da baseplate
const GetRandomPositionOnBaseplate = (): Vector3 => {
	const baseplateSize = Baseplate.Size;
	const baseplatePosition = Baseplate.Position;
	
	// Gera posição aleatória dentro dos limites da baseplate
	const x = baseplatePosition.X + (math.random() - 0.5) * baseplateSize.X;
	const z = baseplatePosition.Z + (math.random() - 0.5) * baseplateSize.Z;
	
	// Altura: topo da baseplate + margem para spawnar em cima
	const y = baseplatePosition.Y + (baseplateSize.Y / 2) + 5;
	
	return new Vector3(x, y, z);
};

// Função para spawnar um tipo específico de macaco
const SpawnSpecificMonkey = (monkeyModel: Model, count: number): void => {
	for (let i = 0; i < count; i++) {
		const monkeyClone = monkeyModel.Clone();
		monkeyClone.Parent = MacacosFolder;
		
		// Posiciona o macaco em uma posição aleatória
		const randomPosition = GetRandomPositionOnBaseplate();
		
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