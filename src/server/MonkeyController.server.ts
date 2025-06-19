import { SpawnBananas, StopBananaSpawn } from "./BananaController/SpawnBanana";
import { GetSimulationInfo } from "./types/types";
import { SpawnMonkey } from "./MonkeyModules/MonkeyBuilder";
import { SetCurrentArea } from "./MonkeyModules/MonkeyReproducer";

const Bananas = game.WaitForChild("Workspace").FindFirstChild("Bananas") as Folder;
const EndSimulation = game.GetService("ReplicatedStorage").WaitForChild("Remotes").WaitForChild("RemoteEvents").WaitForChild("EndSimulation") as RemoteEvent;
const StartSimulation = game.GetService("ReplicatedStorage").WaitForChild("Remotes").WaitForChild("BindableEvents").WaitForChild("StartSimulation") as BindableEvent;




function StartSimulationHandler(SimInfo: GetSimulationInfo): void {
    print(SimInfo);
    SpawnMonkey(SimInfo,SimInfo.Area);
    SpawnBananas(SimInfo.BananaGen,SimInfo.Area);
    SetCurrentArea(SimInfo.Area);
}



function StopSimulation(): void {
	Bananas.ClearAllChildren();
	StopBananaSpawn();

}
EndSimulation.OnServerEvent.Connect((player: Player) => {
    StopSimulation();
    print("Simulation stopped by player: " + player.Name);
})
StartSimulation.Event.Connect((SimInfo: GetSimulationInfo) => {
    StartSimulationHandler(SimInfo);
    print("Simulation started with info: ", SimInfo);
});