const BananaTool = game.GetService("ServerStorage").FindFirstChild("BananaTool") as Tool;
import { AddCandidate } from "./MonkeyReproducer";

const TweenService = game.GetService("TweenService");


const MonkeyTypes = {
	// DOMINA EM ÁREAS GRANDES - Explorer/Scout
	["SlowMonkey"]: {
		roamingSpeed: 10,              // Mais lento
		ReproductionTime: 20,          // Reproduz mais devagar
		BananaDetectionRange: 50,      // MELHOR detecção - encontra bananas longe
		Health: 120,                   // Mais resistente
		EnergyConsumption: 0.8,        // Gasta menos energia
		Specialization: "Long-range foraging in open areas"
	},
	
	// DOMINA EM ÁREAS MÉDIAS - Balanced/Versatile  
	["NormalMonkey"]: {
		roamingSpeed: 20,              // Velocidade média
		ReproductionTime: 12,          // MELHOR reprodução - cria população rápido
		BananaDetectionRange: 35,      // Detecção média
		Health: 100,                   // Vida padrão
		EnergyConsumption: 1.0,        // Consumo padrão
		Specialization: "Rapid population growth in mixed terrain"
	},
	
	// DOMINA EM ÁREAS PEQUENAS - Rush/Aggressive
	["FastMonkey"]: {
		roamingSpeed: 35,              // MELHOR velocidade - chega primeiro
		ReproductionTime: 8,           // Reproduz rápido mas não o melhor
		BananaDetectionRange: 20,      // Menor detecção
		Health: 100,                    // Mais frágil
		EnergyConsumption: 1.2,        // Gasta mais energia
		Specialization: "Quick resource grabbing in dense areas"
	},
};
type MonkeyType = keyof typeof MonkeyTypes;

export class MonkeyRoamer {
	public monkey: Model;

	public readonly monkeytype: MonkeyType;
	private roamingSpeed: number = 10;
	private ReproductionTime: number = 20;
	private BananaDetectionRange: number = 20; // Range to detect bananas
	private LastReproductionTime: number = tick(); // Time when the monkey last reproduced
    private Baseplate: BasePart;

	public humanoid: Humanoid;
	public HumanoidRootPart: BasePart | undefined;

	private Walking: boolean = false;
	public reproducing: boolean = false; // Tornado público para verificação externa

	private EatAnimationTrack: AnimationTrack;

	// CORREÇÃO: Método Reproduce melhorado
	public async Reproduce(monkeyBasePart: BasePart): Promise<void> {
		if (this.reproducing) return; // Evita reprodução múltipla

		this.reproducing = true;
		this.LastReproductionTime = tick();

		// Move uma vez para a posição do parceiro
		this.humanoid.MoveTo(monkeyBasePart.Position);

		// Aguarda chegar próximo ou timeout
		const startTime = tick();
		while (tick() - startTime < 3) {
			if (!this.HumanoidRootPart) break;
			const distance = this.HumanoidRootPart.Position.sub(monkeyBasePart.Position).Magnitude;
			if (distance <= 5) break; // Chegou próximo o suficiente
			task.wait(0.1);
		}



		// Aguarda um tempo fixo para "reproduzir"
		task.wait(2);

		this.reproducing = false;
	}

	private GetRandomPositionOnBaseplate(): Vector3 {
		let Passed: boolean = false;
		let Counter = 0;
		let hitPosition: Vector3 | undefined = undefined;
		while (!Passed && Counter < 30) {
			Counter++;
			const monkeyPosition = this.HumanoidRootPart?.Position || new Vector3(0, 0, 0);
			const randomX = monkeyPosition.X + (math.random() - 0.5) * 50; // Adjust range as needed
			const randomZ = monkeyPosition.Z + (math.random() - 0.5) * 50; // Adjust range as needed
			const randomY = monkeyPosition.Y; // Keep the same height

			// Perform a raycast to check if the position is valid
			const raycastParams = new RaycastParams();
			raycastParams.FilterDescendantsInstances = [this.Baseplate];
			raycastParams.FilterType = Enum.RaycastFilterType.Include;
			const Raycast = game.Workspace.Raycast(
				new Vector3(randomX, randomY + 20, randomZ),
				new Vector3(0, -200, 0),
				raycastParams,
			);
			if (Raycast && Raycast.Instance) {
				hitPosition = Raycast.Position;
				Passed = true; // Found a valid position
			}
		}

		return hitPosition || new Vector3(0, 0, 0);
	}

	// CORREÇÃO: DetectBananas otimizado para retornar a banana diretamente
	private DetectBananas(): BasePart | undefined {
		const bananas = game.Workspace.WaitForChild("Bananas").GetChildren();
		const monkeyPosition = this.HumanoidRootPart?.Position || new Vector3(0, 0, 0);
		let ClosestBanana: BasePart | undefined = undefined;
		let closestDistance = math.huge;

		for (const banana of bananas) {
			if (banana.GetAttribute("Avaliable") !== true) {
				continue; // Skip bananas that are not available
			}
			const bananaPosition = (banana as BasePart).Position;
			const distance = bananaPosition.sub(monkeyPosition).Magnitude;
			if (distance <= this.BananaDetectionRange && distance < closestDistance) {
				closestDistance = distance;
				ClosestBanana = banana as BasePart;
			}
		}

		return ClosestBanana;
	}

	private EatBanana(Banana: BasePart): void {
		Banana.SetAttribute("Avaliable", false);
		Banana.Destroy();
		this.humanoid.Health = this.humanoid.Health + math.random(15, 25); // Heal the monkey by a random amount
		const bananaToolClone = BananaTool.Clone() as Tool;
		bananaToolClone.Parent = this.monkey;
		this.humanoid.EquipTool(bananaToolClone);
		this.EatAnimationTrack.Play();
		this.EatAnimationTrack.Stopped.Wait();
		bananaToolClone.Destroy(); // Remove the banana tool after eating
	}

	// CORREÇÃO: StartRoam com lógica simplificada e prioridades claras
	private StartRoam(): void {
		// Não faça nada se já estiver ocupado
		if (this.reproducing) {
            print(`Monkey ${this.monkey.Name} is reproducing, skipping roam.`);
			return;
		}

		const now: number = tick();
		const timeSinceLastReproduction = now - this.LastReproductionTime;
		const isReadyToReproduce = timeSinceLastReproduction >= this.ReproductionTime;

		// Prioridade 1: Reprodução
		if (isReadyToReproduce && this.humanoid.Health > this.humanoid.MaxHealth * 0.5) {
			AddCandidate(this);
		}

		// Prioridade 2: Procurar bananas se a saúde estiver baixa
		const needsFood = this.humanoid.Health < this.humanoid.MaxHealth * 0.7;
		if (needsFood) {
			const closestBanana = this.DetectBananas();
			if (closestBanana) {
				const distance = closestBanana.Position.sub(
					this.HumanoidRootPart?.Position || new Vector3(0, 0, 0),
				).Magnitude;
				if (distance <= 3) {
					this.EatBanana(closestBanana);
					return;
				} else {
					this.humanoid.MoveTo(closestBanana.Position);
					return;
				}
			}
		}

		// Prioridade 3: Vagar aleatoriamente
		if (!this.Walking) {
			task.spawn(() => {
				this.Walking = true;
				const randomPos = this.GetRandomPositionOnBaseplate();
				this.humanoid.MoveTo(randomPos);
				// Aguarda o movimento terminar com timeout
				const connection = this.humanoid.MoveToFinished.Connect(() => {
					this.Walking = false;
				});

				// Timeout de segurança
				task.spawn(() => {
					task.wait(3);
					if (this.Walking) {
						this.Walking = false;
						connection.Disconnect();
					}
				});
			});
		}
	}

	constructor(monkey: Model, monkeytype: MonkeyType, Area : string) {
		this.monkey = monkey;
		this.monkeytype = monkeytype;
		this.roamingSpeed = MonkeyTypes[monkeytype].roamingSpeed;
		this.ReproductionTime = MonkeyTypes[monkeytype].ReproductionTime;
		this.BananaDetectionRange = MonkeyTypes[monkeytype].BananaDetectionRange;
		this.humanoid = this.monkey.WaitForChild("Humanoid") as Humanoid;
		this.HumanoidRootPart = this.monkey.FindFirstChild("HumanoidRootPart") as BasePart;

        this.humanoid.MaxHealth = MonkeyTypes[monkeytype].Health; // Set maximum health
        

        this.Baseplate = game.Workspace.WaitForChild("Maps").FindFirstChild(Area)?.FindFirstChild("Baseplate") as BasePart;
		const EatAnimation = new Instance("Animation", monkey);
		EatAnimation.AnimationId = "rbxassetid://104912605576431";
		const EatAnimationTrack = this.humanoid.LoadAnimation(EatAnimation);
		this.EatAnimationTrack = EatAnimationTrack;

		this.humanoid.WalkSpeed = this.roamingSpeed;

		const Bar = this.monkey
			.FindFirstChild("Head")
			?.FindFirstChild("GuiBar")
			?.FindFirstChild("BarGroup")
			?.FindFirstChild("Bar") as Frame;
		const LifeLabel = Bar.Parent?.FindFirstChild("Life") as TextLabel;

        this.humanoid.BreakJointsOnDeath = false; // Evita que o macaco morra de forma normal
        this.humanoid.Died.Connect(() => { 
            task.wait(5); // Espera 5 segundos antes de remover o macaco
            const MonkeyParts = this.monkey.GetChildren().filter(child => child.IsA("BasePart"));
            for (const part of MonkeyParts) {
                const Track = TweenService.Create(part, new TweenInfo(1.5), { Transparency: 1 });
                Track.Play();
            }
            task.wait(1.5); // Espera o tween terminar
            this.monkey.Destroy(); // Remove o macaco do jogo
        })

		this.humanoid.GetPropertyChangedSignal("Health").Connect(() => {
			const healthPercent = this.humanoid.Health / this.humanoid.MaxHealth;

			// Tween para suavizar a mudança de tamanho da barra
			const tweenInfo = new TweenInfo(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);
			const goal = { Size: UDim2.fromScale(healthPercent, 1) };
			TweenService.Create(Bar, tweenInfo, goal).Play();

			// Atualizar o texto da vida
			LifeLabel.Text = `${math.floor(this.humanoid.Health)}%`;

			// Mudar cor da barra e label de acordo com a vida
			if (healthPercent > 0.6) {
				Bar.BackgroundColor3 = Color3.fromRGB(0, 255, 0); // Verde
				LifeLabel.TextColor3 = Color3.fromRGB(0, 54, 0);
			} else if (healthPercent > 0.3) {
				Bar.BackgroundColor3 = Color3.fromRGB(255, 255, 0); // Amarelo
				LifeLabel.TextColor3 = Color3.fromRGB(48, 48, 0);
			} else {
				Bar.BackgroundColor3 = Color3.fromRGB(255, 0, 0); // Vermelho
				LifeLabel.TextColor3 = Color3.fromRGB(51, 3, 3);
			}
		});

		// Loop principal do macaco (corrigido)
		task.spawn(() => {
			while (this.HumanoidRootPart && this.HumanoidRootPart.Parent && this.humanoid.Health > 0) {
				this.StartRoam();
				task.wait(); // Wait mínimo para permitir outros scripts rodarem
			}
		});
	}
}
