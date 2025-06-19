// Description: This module is responsible for spawning monkey models in the game.
import { Monkey, GetSimulationInfo } from "../types/types";
import { MonkeyRoamer } from "./MonkeyRoamer";


const Monkeys = game.GetService("ReplicatedStorage").WaitForChild("Mutations") as Folder;
const MacacosFolder = game.GetService("Workspace").WaitForChild("Macacos");

const MonkeyModels = {
	FastMonkey: Monkeys.WaitForChild("FastMonkey") as Model,
	NormalMonkey: Monkeys.WaitForChild("NormalMonkey") as Model,
	SlowMonkey: Monkeys.WaitForChild("SlowMonkey") as Model,
};

// Função para gerar posição aleatória no cilindro da baseplate
const GetRandomPositionOnBaseplate = (Baseplate : BasePart): Vector3 => {
	const baseplateSize = Baseplate.Size;
	const baseplatePosition = Baseplate.Position;

	// Gera posição aleatória dentro dos limites da baseplate
	const x = baseplatePosition.X + (math.random() - 0.5) * baseplateSize.X;
	const z = baseplatePosition.Z + (math.random() - 0.5) * baseplateSize.Z;

	// Altura: topo da baseplate + margem para spawnar em cima
	const y = baseplatePosition.Y + baseplateSize.Y / 2 + 5;

	return new Vector3(x, y, z);
};

// Função para spawnar um tipo específico de macaco
const SpawnSpecificMonkey = (
	monkeyModel: Model,
	count: number,
	monkeyType: "FastMonkey" | "NormalMonkey" | "SlowMonkey",
	Area : string,
	monkeyPosition?: Vector3,
	Health? : number
): void => {
	for (let i = 0; i < count; i++) {
		
		const SpawnPart = game.Workspace.WaitForChild("Maps").FindFirstChild(Area)?.FindFirstChild("SpawnPart") as BasePart;
		const Humanoid = monkeyModel.FindFirstChild("Humanoid") as Humanoid;
		const monkeyClone = monkeyModel.Clone();
		const Childs = monkeyClone.GetChildren().filter((child) => child.IsA("BasePart") || child.IsA("MeshPart"));
		
		Humanoid.Health = Health || 100; // Define a saúde do macaco, padrão é 100
		monkeyClone.Parent = MacacosFolder;
		// Inicia o roaming do macaco
		task.spawn(() => {
			new MonkeyRoamer(monkeyClone, monkeyType, Area);
		});
		// Posiciona o macaco em uma posição aleatória
		const randomPosition = monkeyPosition || GetRandomPositionOnBaseplate(SpawnPart);
		for (const child of Childs) {
			child.SetNetworkOwner(undefined); // Remove o dono da rede para evitar problemas de sincronização
		}
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

const SpawnMonkey = (SpecificMonkeys: GetSimulationInfo, Area : string): void => {
	// Spawna cada tipo de macaco
	SpawnSpecificMonkey(MonkeyModels.FastMonkey, SpecificMonkeys.FastMonkeys, "FastMonkey",Area);
	SpawnSpecificMonkey(MonkeyModels.NormalMonkey, SpecificMonkeys.NormalMonkeys, "NormalMonkey",Area);
	SpawnSpecificMonkey(MonkeyModels.SlowMonkey, SpecificMonkeys.SlowMonkeys, "SlowMonkey",Area);
};

// Exporta a função principal
export { SpawnMonkey , SpawnSpecificMonkey , MonkeyModels};
