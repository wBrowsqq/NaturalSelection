import { SpawnBananas, StopBananaSpawn } from "./BananaController/SpawnBanana";
import { GetSimulationInfo } from "./types/types";
import { SpawnMonkey } from "./MonkeyModules/MonkeyBuilder";

const Bananas = game.WaitForChild("Workspace").FindFirstChild("Bananas") as Folder;
const EndSimulation = game.GetService("ReplicatedStorage").WaitForChild("Remotes").WaitForChild("RemoteEvents").WaitForChild("EndSimulation") as RemoteEvent;
const StartSimulation = game.GetService("ReplicatedStorage").WaitForChild("Remotes").WaitForChild("BindableEvents").WaitForChild("StartSimulation") as BindableEvent;



function StartSimulationHandler(SimInfo: GetSimulationInfo): void {
    SpawnMonkey(SimInfo);
    SpawnBananas(SimInfo.BananaGen);
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