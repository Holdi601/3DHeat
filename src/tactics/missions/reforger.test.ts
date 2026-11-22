import { describe, expect, it } from 'vitest';
import { enfChild, enfHead, enfItems, parseEnfusion } from './enfusionText';
import { readReforgerLayer, reforgerLayer } from './reforger';
import { newReforgerText, patchReforgerText, writeReforgerLayer } from './reforgerWrite';
import { missionToPlan } from './index';
import { planToMission } from './fromPlan';
import { routeOf } from '../plan';

/** A small layer as the Workbench saves one; every name, number and resource id made up. */
const LAYER = `SubScene {
 Parent "{AAAA000000000001}worlds/Arland/Arland.ent"
}
SCR_AIGroup Alpha : "{AAAA000000000002}Prefabs/Groups/BLUFOR/Group_US_FireTeam.et" {
 coords 1000 20 2000
 angleY 90
 m_aStaticWaypoints {
  "WP_A1" "WP_A2" "WP_A3"
 }
}
SCR_AIWaypoint WP_A1 : "{AAAA000000000003}Prefabs/AI/Waypoints/AIWaypoint_Move.et" {
 coords 1100 20 2000
}
SCR_SearchAndDestroyWaypoint WP_A2 : "{AAAA000000000004}Prefabs/AI/Waypoints/AIWaypoint_SearchAndDestroy.et" {
 coords 1200 20 2100
 CompletionRadius 30
}
AIWaypointCycle WP_A3 : "{AAAA000000000005}Prefabs/AI/Waypoints/AIWaypoint_Cycle.et" {
 coords 1000 20 2100
}
Vehicle : "{AAAA000000000006}Prefabs/Vehicles/Wheeled/UAZ469/UAZ469_FIA.et" {
 coords 1500 22.5 2500
 angles 0 180 0
}
GenericEntity Outpost : "{AAAA000000000007}Prefabs/Compositions/Test/Outpost.et" {
 coords 3000 30 4000
 angleY 90
 {
  SCR_ChimeraCharacter Guard : "{AAAA000000000008}Prefabs/Characters/Factions/OPFOR/USSR_Army/Character_USSR_Rifleman.et" {
   coords 10 0 0
   angleY 0
  }
 }
}
SCR_SpawnPoint Spawn_East : "{AAAA000000000009}Prefabs/MP/Spawning/SpawnPoint_USSR.et" {
 coords 3100 30 4100
 m_sFaction "USSR"
}
GenericEntity SlotAI1 : "{AAAA00000000000A}Prefabs/Systems/ScenarioFramework/Components/SlotAI.et" {
 components {
  SCR_ScenarioFrameworkSlotAI "{AAAA00000000000B}" {
   m_sObjectToSpawn "{AAAA00000000000C}Prefabs/Groups/INDFOR/Group_FIA_FireTeam.et"
   m_WaypointSet SCR_ScenarioFrameworkWaypointSet "{AAAA00000000000D}" {
    m_aLayerName {
     "PatrolWps"
    }
   }
  }
 }
 coords 500 10 500
}
GenericEntity PatrolWps : "{AAAA00000000000E}Prefabs/Systems/ScenarioFramework/Components/Layer.et" {
 coords 600 10 600
 {
  GenericEntity SW1 : "{AAAA00000000000F}Prefabs/Systems/ScenarioFramework/Components/SlotWaypoint.et" {
   components {
    SCR_ScenarioFrameworkSlotWaypoint "{AAAA000000000010}" {
     m_Waypoint SCR_ScenarioFrameworkWaypointPatrol "{AAAA000000000011}" {
     }
    }
   }
   coords 0 0 100
  }
 }
}
`;

const planOf = (text = LAYER) => missionToPlan(readReforgerLayer(text, 'test.layer'));

describe('Enfusion entity text', () => {
  it('reads heads, lines, lists, child entities and spans', () => {
    const root = parseEnfusion('A x : "{1}p.et" {\n coords 1 2 3\n m_a + {\n  "p" "q"\n }\n {\n  B {\n   coords 0 0 0\n  }\n }\n}\n');
    const a = root.nodes[0];
    expect(enfHead(a)).toEqual({ cls: 'A', name: 'x', prefab: '{1}p.et' });
    expect(enfItems(enfChild(a, 'm_a'))).toEqual(['p', 'q']);
    expect(a.nodes.filter((n) => !n.head.length)[0].nodes[0].head[0].raw).toBe('B');
    expect(() => parseEnfusion('A {\n coords 1 2 3\n')).toThrow(/line 1/);
  });
});

describe('Arma Reforger layers', () => {
  it('reads groups, waypoints, vehicles, child entities, spawn points, Scenario Framework slots and the world', () => {
    const m = readReforgerLayer(LAYER, 'test.layer');
    expect(m.map).toBe('Arma Reforger: Arland');
    expect(m.groups.map((g) => [g.name, g.side, g.category])).toEqual([
      ['Alpha', 'blufor', 'infantry'],
      ['UAZ469_FIA', 'indep', 'ground'],
      ['Guard', 'opfor', 'infantry'],
      ['SlotAI1', 'indep', 'infantry'],
    ]);
    const alpha = m.groups[0];
    // North is +z; facing east is a quarter turn.
    expect(alpha.units[0].at).toEqual({ x: 1000, y: 20, z: 2000 });
    expect(alpha.units[0].yaw).toBeCloseTo(Math.PI / 2);
    expect(alpha.route.map((w) => w.kind ?? '')).toEqual(['', 'Move', 'SearchAndDestroy', 'Cycle']);
    expect(alpha.route[2].tasks?.[0].kind).toBe('sweep');
    expect(alpha.route[3].tasks?.[0]).toMatchObject({ kind: 'patrol', pattern: 'loop' });
    expect(alpha.route[3].tasks?.[0].points).toHaveLength(3);
    // A child entity in its parent's frame: 10 m to the parent's right, the parent facing east, is 10 m south.
    expect(m.groups[2].units[0].at).toEqual({ x: 3000, y: 30, z: 3990 });
    expect(m.groups[3].route.map((w) => w.at)).toEqual([
      { x: 500, y: 10, z: 500 },
      { x: 600, y: 10, z: 700 },
    ]);
    expect(m.places).toEqual([{ name: 'Spawn_East', kind: 'marker', at: { x: 3100, y: 30, z: 4100 }, side: 'opfor' }]);
  });

  it('writes the layer back unchanged when the board is unchanged, CRLF too', () => {
    expect(patchReforgerText(LAYER, planToMission(planOf())).text).toBe(LAYER);
    const crlf = LAYER.replace(/\n/g, '\r\n');
    expect(patchReforgerText(crlf, planToMission(planOf(crlf))).text).toBe(crlf);
  });

  it('moves and turns units and waypoints, child entities in their parent frame', () => {
    const plan = planOf();
    const alpha = plan.figures.find((f) => f.label === 'Alpha')!;
    routeOf(plan, alpha.id, 0)!.points[2].x = 1250;
    const guard = plan.figures.find((f) => f.label === 'Guard')!;
    guard.keys[0] = { ...guard.keys[0], x: 3005, z: 3980, yaw: 0 };
    const uaz = plan.figures.find((f) => f.label === 'UAZ469_FIA')!;
    uaz.keys[0] = { ...uaz.keys[0], yaw: Math.PI / 2 };
    const r = patchReforgerText(LAYER, planToMission(plan));
    expect(r.summary.changed.sort()).toEqual(['Alpha', 'Guard', 'UAZ469_FIA']);
    const a = LAYER.split('\n');
    const b = r.text.split('\n');
    expect(a.length).toBe(b.length);
    expect(a.filter((l, i) => l !== b[i]).map((l) => l.trim().split(' ')[0])).toEqual(['coords', 'angles', 'coords', 'angleY']);
    const m = readReforgerLayer(r.text, 'x.layer');
    expect(m.groups[0].route[2].at.x).toBe(1250);
    expect(m.groups[2].units[0].at.x).toBeCloseTo(3005, 3);
    expect(m.groups[2].units[0].at.z).toBeCloseTo(3980, 3);
    expect(m.groups[2].units[0].yaw).toBeCloseTo(0);
    expect(m.groups[1].units[0].yaw).toBeCloseTo(Math.PI / 2);
  });

  it('adds and takes out waypoints, groups and vehicles', () => {
    const plan = planOf();
    const alpha = plan.figures.find((f) => f.label === 'Alpha')!;
    const route = routeOf(plan, alpha.id, 0)!;
    // The Search and Destroy waypoint taken out, one added at the end.
    route.points.splice(2, 1);
    route.points.push({ x: 1400, y: 20, z: 2400 });
    plan.tasks = plan.tasks.filter((t) => t.kind !== 'sweep');
    for (const t of plan.tasks) if (t.on && t.on.from === 3) t.on = { ...t.on, from: 2 };
    plan.figures = plan.figures.filter((f) => f.label !== 'UAZ469_FIA');
    const layer = plan.layers.find((l) => l.name === 'OPFOR')!.id;
    plan.figures.push({ id: 'n1', kind: 'soldier', team: 'opfor', label: 'New squad', keys: { 0: { x: 100, y: 5, z: 100, yaw: 0 } }, from: 0, layer });
    const edited = { ...plan, arrows: [...plan.arrows, { id: 'na', step: 0, team: 'opfor', style: 'move' as const, points: [{ x: 100, y: 5, z: 100 }, { x: 300, y: 5, z: 100 }], figure: 'n1', layer }] };
    const r = patchReforgerText(LAYER, planToMission(edited));
    expect(r.summary.removed).toEqual(['UAZ469_FIA']);
    expect(r.summary.added).toEqual(['New_squad']);
    expect(r.text).not.toContain('WP_A2');
    expect(r.text).toContain('Group_USSR_FireGroup.et');
    const m = readReforgerLayer(r.text, 'x.layer');
    expect(m.groups.map((g) => g.name)).toEqual(['Alpha', 'Guard', 'SlotAI1', 'New_squad']);
    expect(m.groups[0].route.map((w) => w.kind ?? '')).toEqual(['', 'Move', 'Cycle', 'Move']);
    expect(m.groups[0].route[3].at).toEqual({ x: 1400, y: 20, z: 2400 });
    expect(m.groups[3].side).toBe('opfor');
    expect(m.groups[3].route[1].at).toEqual({ x: 300, y: 5, z: 100 });
    // The Scenario Framework's own logic stays.
    expect(r.text).toContain('m_aLayerName {');
  });

  it('gives a retasked waypoint its task prefab', () => {
    const plan = planOf();
    const sweep = plan.tasks.find((t) => t.kind === 'sweep')!;
    sweep.kind = 'defend';
    const r = patchReforgerText(LAYER, planToMission(plan));
    expect(r.text).toContain('SCR_DefendWaypoint WP_A2 : "{93291E72AC23930F}Prefabs/AI/Waypoints/AIWaypoint_Defend.et" {\n coords 1200 20 2100\n CompletionRadius 30');
  });

  it('makes a new layer for a world, refuses the binary form', async () => {
    const plan = { ...planOf(), mission: undefined };
    const { text, summary } = newReforgerText('Eden', planToMission(plan));
    expect(summary).toMatchObject({ mode: 'new', map: 'Eden' });
    const m = readReforgerLayer(text, 'new.layer');
    expect(m.groups.map((g) => g.category)).toEqual(['infantry', 'ground', 'infantry', 'infantry']);
    expect(m.groups[0].route).toHaveLength(4);
    const out = writeReforgerLayer(planToMission(plan), null, 'Eden');
    expect(new TextDecoder().decode(out.bytes)).toBe(text);
    await expect(reforgerLayer.read(new Uint8Array([0x45, 0x42, 0x49, 0x4e, 0, 0]), 'w.ent')).rejects.toThrow(/binary/);
  });
});
