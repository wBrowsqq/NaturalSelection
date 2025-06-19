// Correções para o MonkeyReproducer

import { MonkeyRoamer } from "./MonkeyRoamer";

let CurrentArea : undefined | string = undefined
export function SetCurrentArea (Area: string) {
    CurrentArea = Area;
}

const candidates = new Map<Model, MonkeyRoamer>();
const activeReproductions = new Set<string>();

export function AddCandidate(monkey: MonkeyRoamer) {
    const model = monkey.monkey;
    
    if (candidates.has(model)) {
        return;
    }
    
    candidates.set(model, monkey);
    
}

export function RemoveCandidate(monkey: MonkeyRoamer) {
    const model = monkey.monkey;
    if (candidates.has(model)) {
        candidates.delete(model);

    }
}

function areMonkeysClose(monkey1: MonkeyRoamer, monkey2: MonkeyRoamer): boolean {
    const pos1 = monkey1.HumanoidRootPart as BasePart;
    const pos2 = monkey2.HumanoidRootPart as BasePart;
    
    if (!pos1 || !pos2) {
        return false;
    }
    
    const distance = pos1.Position.sub(pos2.Position).Magnitude;
    return distance <= 15;
}

function determineOffspringType(parent1: MonkeyRoamer, parent2: MonkeyRoamer):  "FastMonkey" | "SlowMonkey" | "NormalMonkey"  {
    const mutationChance = 0.1; // 10% chance de mutação
    
    if (math.random() < mutationChance) {
        // Mutação! Tipo completamente aleatório
        const types: Array<"FastMonkey" | "SlowMonkey" | "NormalMonkey"> = ["FastMonkey", "NormalMonkey", "SlowMonkey"];
        return types[math.random(1, 3) - 1];
    }
    
    // Sem mutação: herança baseada em saúde + aleatoriedade
    const health1 = parent1.humanoid.Health / parent1.humanoid.MaxHealth;
    const health2 = parent2.humanoid.Health / parent2.humanoid.MaxHealth;
    
    // Bias para o pai mais saudável, mas ainda com chance para o outro
    const bias = (health1 / (health1 + health2)) * 0.7 + 0.15; // Entre 15% e 85%
    
    return math.random() < bias ? parent1.monkeytype : parent2.monkeytype;
}

// CORREÇÃO 4: Melhorar o processo de reprodução
async function processReproduction(monkey1: MonkeyRoamer, monkey2: MonkeyRoamer, Area: string)  {
    const reproductionId = `${monkey1.monkey.Name}_${monkey2.monkey.Name}`;
    const reverseId = `${monkey2.monkey.Name}_${monkey1.monkey.Name}`;
    
    if (activeReproductions.has(reproductionId) || activeReproductions.has(reverseId)) {
        return;
    }
    
    // Verifica se ambos estão válidos e não estão reproduzindo
    if (!monkey1.HumanoidRootPart || !monkey2.HumanoidRootPart || 
        monkey1.reproducing || monkey2.reproducing) {
        return;
    }
    
    activeReproductions.add(reproductionId);

    
    // Remove imediatamente da lista de candidatos
    RemoveCandidate(monkey1);
    RemoveCandidate(monkey2);
    
    try {
        // Inicia a reprodução de ambos simultaneamente
        const reproduction1 = monkey1.Reproduce(monkey2.HumanoidRootPart as BasePart);
        const reproduction2 = monkey2.Reproduce(monkey1.HumanoidRootPart as BasePart);
        
        // Aguarda ambos terminarem
        await Promise.all([reproduction1, reproduction2]);
        
        // Verifica novamente se ainda existem
        if (!monkey1.HumanoidRootPart || !monkey2.HumanoidRootPart) {
            return;
        }
        
        // Calcula posição para o novo macaco
        const pos1 = monkey1.HumanoidRootPart.Position;
        const pos2 = monkey2.HumanoidRootPart.Position;
        const spawnPosition = new Vector3(
            (pos1.X + pos2.X) / 2,
            pos1.Y, // Usa a altura do primeiro macaco
            (pos1.Z + pos2.Z) / 2
        );
        
        // Determina o tipo do novo macaco
        const monkeyTypeChoosed = determineOffspringType(monkey1, monkey2);
        
        async function SpawnMonkey(monkeyTypeChoosed : "FastMonkey" | "SlowMonkey" | "NormalMonkey" ,spawnPosition: Vector3) {
            const { SpawnSpecificMonkey, MonkeyModels } = await import("./MonkeyBuilder");
            SpawnSpecificMonkey(MonkeyModels[monkeyTypeChoosed], 1, monkeyTypeChoosed, Area, spawnPosition);
        }
        SpawnMonkey(monkeyTypeChoosed, spawnPosition);
        

        
    } catch (error) {
        warn(`Erro durante reprodução: ${error}`);
    } finally {
        // Limpa sempre, independente do resultado
        activeReproductions.delete(reproductionId);
        
        // Aguarda antes de permitir nova reprodução
        task.wait(5);
        
        // Reabilita para reprodução apenas se ainda existirem
        if (monkey1.HumanoidRootPart && monkey1.monkey.Parent) {
            AddCandidate(monkey1);
        }
        if (monkey2.HumanoidRootPart && monkey2.monkey.Parent) {
            AddCandidate(monkey2);
        }
    }
}

// CORREÇÃO 5: Melhorar o loop principal
task.spawn(() => {
    while (true) {
        task.wait(2); // Reduz a frequência de verificação
        if (CurrentArea === undefined) {
            continue; // Aguarda até que a área esteja definida
        }
        try {
            // Limpa candidatos inválidos
            const invalidCandidates: Model[] = [];
            for (const [model, monkey] of candidates) {
                if (!monkey.HumanoidRootPart || !model.Parent || monkey.reproducing) {
                    invalidCandidates.push(model);
                }
            }
            
            for (const model of invalidCandidates) {
                candidates.delete(model);
            }
            
            // Converte para array
            const candidateList: MonkeyRoamer[] = [];
            for (const [_, monkey] of candidates) {
                candidateList.push(monkey);
            }
            
            // Verifica pares para reprodução
            for (let i = 0; i < candidateList.size(); i++) {
                for (let j = i + 1; j < candidateList.size(); j++) {
                    const monkey1 = candidateList[i];
                    const monkey2 = candidateList[j];
                    
                    if (!monkey1.HumanoidRootPart || !monkey2.HumanoidRootPart) {
                        continue;
                    }
                    
                    if (areMonkeysClose(monkey1, monkey2)) {
                        // Inicia reprodução em nova thread
                        task.spawn(() => processReproduction(monkey1, monkey2, CurrentArea as string));
                        break; // Para evitar múltiplas reproduções simultâneas
                    }
                }
            }
        } catch (error) {
            warn(`Erro no loop de reprodução: ${error}`);
        }
    }
});

export function GetCandidatesInfo(): string {
    let info = `Candidatos ativos: ${candidates.size()}\n`;
    info += `Reproduções ativas: ${activeReproductions.size()}\n`;
    for (const [model, monkey] of candidates) {
        const status = monkey.reproducing ? "(reproduzindo)" : "(disponível)";
        info += `- ${model.Name} ${status}\n`;
    }
    return info;
}