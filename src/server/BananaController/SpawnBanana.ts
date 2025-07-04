// Obtém referências dos objetos principais
const monkey = game.GetService("ReplicatedStorage").WaitForChild("Mutations");
const BANANA = game.GetService("ServerStorage").WaitForChild("Models").WaitForChild("Banana");
const spawnrate = 45;
const ts = game.GetService("TweenService");

const macacos = game.Workspace.WaitForChild("Macacos");
let CurrentThread : thread | undefined = undefined;

const spawnbanana = (Area : string): void => {
    const newBanana = BANANA.Clone() as BasePart;

    const tree = game.Workspace.WaitForChild("Maps").FindFirstChild(Area)?.FindFirstChild("Trees") as Folder;
    const childs = tree.GetChildren();
    const randomtree = childs[math.random(1, childs.size()) - 1]; 
    
    const leafs = randomtree.FindFirstChild("Leafs");
    if (!leafs) return;
    
    const leafsChildren = leafs.GetChildren();
    const randomattachment = leafsChildren[math.random(1, leafsChildren.size()) - 1] as Attachment;
    
    if (randomattachment.GetAttribute("On") === false) {
        randomattachment.SetAttribute("On", true);
        const OGsize = newBanana.Size;
        newBanana.Position = randomattachment.WorldPosition;
        newBanana.Parent = game.Workspace.WaitForChild("Bananas");
        newBanana.Anchored = true;
        newBanana.CanCollide = true;
        newBanana.CanTouch = true;
        newBanana.CanQuery = true;
        
        newBanana.Size = OGsize.mul(new Vector3(0.3, 0.3, 0.3));
        
        task.spawn(() => {
            const tween = ts.Create(newBanana, new TweenInfo(15), { Size: OGsize });
            tween.Play();
            tween.Completed.Wait();
            randomattachment.SetAttribute("On", false);
            newBanana.SetAttribute("Avaliable", true);
            newBanana.Anchored = false;
        });
    }
};

// Loop principal
const SpawnBananas = (BananaGen: number, Area : string): void => {

    CurrentThread = task.spawn(() => {
        while (true) {
            task.wait(BananaGen);
           print(`Spawning bananas in area: ${Area}`);
            spawnbanana(Area);
            
            // Damage all monkeys
            const macacosChildren = macacos.GetChildren();
            for (const monkey of macacosChildren) {
                const humanoid = monkey.FindFirstChild("Humanoid") as Humanoid;
                if (monkey.Name === "FastMonkey") {
                    humanoid.Health -= 1.5*1.2; 
                } else if (monkey.Name === "NormalMonkey") {
                    humanoid.Health -= 1.5*1;
                } else if (monkey.Name === "SlowMonkey") {
                    humanoid.Health -= 1.5*0.8; 
                }
            }
            
            const allmacacos = game.Workspace.WaitForChild("Macacos").GetChildren();
           
        }
    });
};

const StopBananaSpawn = (): void => {
    if (CurrentThread) {
        task.cancel(CurrentThread);
        CurrentThread = undefined;
    }
}; 

export {SpawnBananas,StopBananaSpawn};