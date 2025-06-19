import { SpawnBananas, StopBananaSpawn } from "./BananaController/SpawnBanana";
import { GetSimulationInfo } from "./types/types";
import { SpawnMonkey } from "./MonkeyModules/MonkeyBuilder";
import { SetCurrentArea } from "./MonkeyModules/MonkeyReproducer";


const Bananas = game.WaitForChild("Workspace").FindFirstChild("Bananas") as Folder;
const EndSimulation = game
	.GetService("ReplicatedStorage")
	.WaitForChild("Remotes")
	.WaitForChild("RemoteEvents")
	.WaitForChild("EndSimulation") as RemoteEvent;
const StartSimulation = game
	.GetService("ReplicatedStorage")
	.WaitForChild("Remotes")
	.WaitForChild("BindableEvents")
	.WaitForChild("StartSimulation") as BindableEvent;

const Infos = game.GetService("ReplicatedStorage").WaitForChild("SimConfig") as Folder;
const MonkeysFolder = game.GetService("Workspace").WaitForChild("Macacos") as Folder;
async function StartTracking() {
	const FastValue = Infos.FindFirstChild("Fast") as IntValue;
	const NormalValue = Infos.FindFirstChild("Normal") as IntValue;
	const SlowValue = Infos.FindFirstChild("Slow") as IntValue;
	const TotalValue = Infos.FindFirstChild("Total") as IntValue;
	while (true) {
        task.wait(1); // Atualiza a cada segundo
		let TotalMonkeys = 0;
		let TotalFastMonkeys = 0;
		let TotalNormalMonkeys = 0;
		let TotalSlowMonkeys = 0;
		for (const monkey of MonkeysFolder.GetChildren()) {
			if (monkey.IsA("Model")) {
				TotalMonkeys++;
				if (monkey.Name === "FastMonkey") {
					TotalFastMonkeys++;
				} else if (monkey.Name === "NormalMonkey") {
					TotalNormalMonkeys++;
				} else if (monkey.Name === "SlowMonkey") {
					TotalSlowMonkeys++;
				}
			}

			FastValue.Value = TotalFastMonkeys;
			NormalValue.Value = TotalNormalMonkeys;
			SlowValue.Value = TotalSlowMonkeys;
			TotalValue.Value = TotalMonkeys;
		}
	}
}

function StartSimulationHandler(SimInfo: GetSimulationInfo): void {

	SpawnMonkey(SimInfo, SimInfo.Area);
	SpawnBananas(SimInfo.BananaGen, SimInfo.Area);
	SetCurrentArea(SimInfo.Area);
}

function StopSimulation(): void {
	for (const banana of Bananas.GetChildren()) {
        print(`Removing banana: ${banana.Name}`);
        banana.Destroy(); // Remove bananas from the game
    }
    for (const monkey of MonkeysFolder.GetChildren()) {
        monkey.Destroy(); // Remove monkeys from the game
    }
	StopBananaSpawn();
}
EndSimulation.OnServerEvent.Connect((player: Player) => {
	StopSimulation();
	print("Simulation stopped by player: " + player.Name);
});
StartSimulation.Event.Connect((SimInfo: GetSimulationInfo) => {
	StartSimulationHandler(SimInfo);
	print("Simulation started with info: ", SimInfo);
});
StartTracking();