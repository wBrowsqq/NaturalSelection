// Obtém referências dos objetos principais
const monkey = game.GetService("ReplicatedStorage").WaitForChild("Macaco");
const BANANA = game.GetService("ServerStorage").WaitForChild("Models").WaitForChild("Banana");
const spawnrate = 45;
const ts = game.GetService("TweenService");
const tree = game.Workspace.WaitForChild("Trees").GetChildren();
const macacos = game.Workspace.WaitForChild("Macacos");
let CurrentThread : thread | undefined = undefined;

const spawnbanana = (): void => {
    const newBanana = BANANA.Clone() as BasePart;
    const randomtree = tree[math.random(1, tree.size()) - 1]; 
    
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
const SpawnBananas = (BananaGen: number): void => {
    if (BananaGen === 0) {
        BananaGen = 1;
    }

    task.spawn(() => {
        while (true) {
            task.wait(BananaGen);
            print("Spawn Banana");
            spawnbanana();
            
            // Damage all monkeys
            const macacosChildren = macacos.GetChildren();
            for (const monkey of macacosChildren) {
                const humanoid = monkey.FindFirstChild("Humanoid") as Humanoid;
                if (humanoid) {
                    humanoid.TakeDamage(math.random(120, 220) / 100);
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