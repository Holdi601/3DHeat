/**
 * IL-2 Sturmovik: Great Battles binary missions (`.msnbin`, the form the game
 * runs and ships its own missions in) read and written out as the mission
 * editor's text form (`.Mission`), so the text reader (`il2.ts`) and writer
 * (`il2Write.ts`) work on them unchanged.
 *
 * Worked out from the game's own missions and from what the game's mission
 * resaver (`bin\resaver\MissionResaver.exe`, which turns a text mission into
 * a binary one) makes of text missions written for the purpose; no game code
 * was read or disassembled. Little-endian throughout; a string is a `u32`
 * length and that many bytes; a list is a `u32` count and `u32` items.
 *
 * **Header.** `u32` version (28 or 30; the top bit set when the file carries
 * a check value, see below), `u32` MissionType, `u32` AqmId, `u32` day,
 * month, year, second, minute, hour. Then the options: HMap, Textures,
 * Forests, Layers, GuiMap, SeasonPrefix (strings), `u32` LCName, LCAuthor,
 * LCDesc, PlayerConfig (string), MultiplayerPlaneConfig (`u32` count and
 * strings), `u32` CloudLevel, CloudHeight, PrecLevel, PrecType, `f64`
 * Turbulence, TempPressLevel, Temperature, Pressure, (version 30:) `f64`
 * Haze and `u32` LayerFog, CloudConfig (string), `u32` SeaState, wind layers
 * (`u32` count of `f64` height, direction, speed), countries (`u32` count of
 * `u32` country, coalition).
 *
 * **Tables.** `u32` count (6) and three bytes, then the tables: names,
 * descriptions (32-byte entries), models, skins, scripts (128-byte entries),
 * each `u32` entry size, `u16` count, `u16` use counts, the entries (NUL
 * padded). The sixth holds damage states: `u32` 128, `u16` count, and when
 * there are any a `u32` count of free slots and their `u16` numbers, then per
 * slot a `u8` count and 128 pairs of `u8` part and `u8` damage (255 = 1).
 * With the top bit of the version set, a `u32` check value follows (and one
 * more ends the file); how it is made is not known, which is why `.msnbin` is
 * not written.
 *
 * **Records.** `u32` count of the top-level records, then each: `u32` type,
 * `u32` Index, `f64` XPos, YPos, ZPos, `u16` XOri, YOri, ZOri (60000 to a
 * turn), and the type's fields (`TYPES`): a name, description, model, skin or
 * script as an `i16` row of its table (-1 none). MCUs share name,
 * description, an `i32` (-1), `u8` Enabled, Targets and Objects. A Group
 * holds a `u32` count of the records after it that are in it, which nest.
 *
 * Checked on the game's 302 missions (all read to the last byte) and by the
 * resaver: each written out as text and made binary again gives the same
 * records, field for field (`il2Bin.local.test.ts`).
 */

// ---------------------------------------------------------------------------
// Reading

class Reader {
  private v: DataView;
  o = 0;
  constructor(readonly b: Uint8Array) {
    this.v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  }
  need(n: number) {
    if (this.o + n > this.b.length) throw new Error(`not an IL-2 binary mission: it ends early (at byte ${this.o})`);
  }
  u8() {
    this.need(1);
    return this.b[this.o++];
  }
  u16() {
    this.need(2);
    const v = this.v.getUint16(this.o, true);
    this.o += 2;
    return v;
  }
  i16() {
    this.need(2);
    const v = this.v.getInt16(this.o, true);
    this.o += 2;
    return v;
  }
  u32() {
    this.need(4);
    const v = this.v.getUint32(this.o, true);
    this.o += 4;
    return v;
  }
  i32() {
    this.need(4);
    const v = this.v.getInt32(this.o, true);
    this.o += 4;
    return v;
  }
  f32() {
    this.need(4);
    const v = this.v.getFloat32(this.o, true);
    this.o += 4;
    return v;
  }
  f64() {
    this.need(8);
    const v = this.v.getFloat64(this.o, true);
    this.o += 8;
    return v;
  }
  /** Bytes as characters one to one (the game's strings are plain ASCII). */
  chars(from: number, to: number) {
    let s = '';
    for (let i = from; i < to; i++) s += String.fromCharCode(this.b[i]);
    return s;
  }
  str() {
    const n = this.u32();
    this.need(n);
    const s = this.chars(this.o, this.o + n);
    this.o += n;
    return s;
  }
  list() {
    const n = this.u32();
    this.need(n * 4);
    const out: number[] = [];
    for (let i = 0; i < n; i++) out.push(this.u32());
    return out;
  }
  strs() {
    const n = this.u32();
    const out: string[] = [];
    for (let i = 0; i < n; i++) out.push(this.str());
    return out;
  }
}

/** How a field is stored. */
type Enc =
  | 'u8'
  | 'u16'
  | 'u32'
  | 'i32'
  | 'f32'
  | 'f64'
  | 'str'
  | 'list'
  | 'strs'
  /** A string only from version 30 on. */
  | 'tstr'
  /** A row of a table. */
  | 'name'
  | 'desc'
  | 'model'
  | 'skin'
  | 'script'
  | 'damaged'
  /** Durability / 500 in a byte. */
  | 'dur'
  /** Bit 0 DeleteAfterDeath, bit 1 DamageThreshold. */
  | 'flags'
  | 'events'
  | 'reports'
  | 'subtitle'
  | 'boundary'
  | 'chart'
  | 'planes'
  | 'date3'
  | 'time3'
  /** An Aerostat's later fields, which older files do not have. */
  | 'aerotail';

type Field = [string, Enc];

const OBJ: Field[] = [
  ['Name', 'name'],
  ['Desc', 'desc'],
  ['Model', 'model'],
  ['Skin', 'skin'],
  ['LinkTrId', 'u32'],
];
const STATIC: Field[] = [...OBJ, ['_flags', 'flags'], ['Country', 'u16'], ['DamageReport', 'u8'], ['Durability', 'dur'], ['Script', 'script'], ['Damaged', 'damaged']];
const UNIT: Field[] = [...OBJ, ['DamageThreshold', 'u8'], ['DamageReport', 'u32'], ['Script', 'str']];
const VEHICLE: Field[] = [
  ['Country', 'u32'],
  ['AILevel', 'u32'],
  ['NumberInFormation', 'u32'],
  ['Vulnerable', 'u8'],
  ['Engageable', 'u8'],
  ['LimitAmmo', 'u8'],
  ['Spotter', 'i32'],
  ['BeaconChannel', 'u32'],
  ['Callsign', 'u8'],
  ['DeleteAfterDeath', 'u8'],
  ['CoopStart', 'u8'],
  ['PayloadId', 'u32'],
  ['WMMask', 'u32'],
  ['Fuel', 'f32'],
  ['Callnum', 'u8'],
  ['RepairFriendlies', 'u8'],
  ['RehealFriendlies', 'u8'],
  ['RearmFriendlies', 'u8'],
  ['RefuelFriendlies', 'u8'],
  ['RepairTime', 'f32'],
  ['RehealTime', 'f32'],
  ['RearmTime', 'f32'],
  ['RefuelTime', 'f32'],
  ['MaintenanceRadius', 'u32'],
  ['TCode', 'tstr'],
  ['TCodeColor', 'tstr'],
];
const MCU: Field[] = [
  ['Name', 'name'],
  ['Desc', 'desc'],
  ['_x', 'i32'],
  ['Enabled', 'u8'],
  ['Targets', 'list'],
  ['Objects', 'list'],
];
const POS = 'XPos YPos ZPos XOri YOri ZOri';
const MCUT = `Index Name Desc Targets Objects ${POS}`;
const f = (s: string): Field[] => s.split(' ').map((x) => x.split(':') as Field);

interface TypeDef {
  cls: string;
  fields: Field[];
  /** The keys in the order the editor writes them. */
  text: string[];
}

const TYPES = new Map<number, TypeDef>();
const ty = (code: number, cls: string, fields: Field[], text: string) => TYPES.set(code, { cls, fields, text: text.split(' ') });

ty(1, 'Block', STATIC, `Name Index LinkTrId ${POS} Model Script Country Desc Durability DamageReport DamageThreshold DeleteAfterDeath Damaged`);
ty(5, 'Bridge', STATIC, `Name Index LinkTrId ${POS} Model Script Country Desc Durability DamageReport DamageThreshold DeleteAfterDeath Damaged`);
ty(7, 'Ground', [...OBJ, ...f('DamageThreshold:u8 DamageReport:u32')], `Name Index LinkTrId ${POS} Model Desc DamageReport DamageThreshold`);
ty(
  2,
  'Vehicle',
  [...UNIT, ...VEHICLE],
  `Name Index LinkTrId ${POS} Script Model Desc Country NumberInFormation Vulnerable Engageable LimitAmmo AILevel DamageReport DamageThreshold DeleteAfterDeath CoopStart Spotter BeaconChannel Callsign PayloadId WMMask Fuel Callnum Skin RepairFriendlies RehealFriendlies RearmFriendlies RefuelFriendlies RepairTime RehealTime RearmTime RefuelTime MaintenanceRadius TCode TCodeColor`,
);
ty(
  12,
  'Ship',
  [...UNIT, ...VEHICLE],
  `Name Index LinkTrId ${POS} Script Model Desc Country Vulnerable Engageable LimitAmmo AILevel DamageReport DamageThreshold DeleteAfterDeath Spotter BeaconChannel Callsign TCode TCodeColor`,
);
ty(
  8,
  'Train',
  [...UNIT, ...VEHICLE, ['Carriages', 'strs']],
  `Name Index LinkTrId ${POS} Script Model Desc Country Vulnerable Engageable LimitAmmo AILevel DamageReport DamageThreshold DeleteAfterDeath Spotter BeaconChannel Callsign Carriages`,
);
ty(
  3,
  'Plane',
  [
    ...UNIT,
    ...f(
      'Country:u32 AILevel:u32 CoopStart:u8 StartInAir:u8 Callsign:u8 Callnum:u8 NumberInFormation:u32 Time:u32 Vulnerable:u8 Engageable:u8 LimitAmmo:u8 Spotter:i32 PayloadId:u32 WMMask:u32 AiRTBDecision:u8 DeleteAfterDeath:u8 Fuel:f32 TCode:tstr TCodeColor:tstr',
    ),
  ],
  `Name Index LinkTrId ${POS} Script Model Country Desc Skin AILevel CoopStart NumberInFormation Vulnerable Engageable LimitAmmo StartInAir Callsign Callnum Time DamageReport DamageThreshold PayloadId WMMask AiRTBDecision DeleteAfterDeath Spotter Fuel TCode TCodeColor`,
);
ty(
  9,
  'Airfield',
  [
    ...STATIC,
    ...f(
      'ReturnPlanes:u8 Hydrodrome:u8 Callsign:u8 Callnum:u8 RepairFriendlies:u8 RehealFriendlies:u8 RearmFriendlies:u8 RefuelFriendlies:u8 RepairTime:f32 RehealTime:f32 RearmTime:f32 RefuelTime:f32 MaintenanceRadius:u32 Planes:planes Chart:chart',
    ),
  ],
  `Name Index LinkTrId ${POS} Model Script Country Desc Durability DamageReport DamageThreshold DeleteAfterDeath Callsign Callnum ReturnPlanes Hydrodrome RepairFriendlies RehealFriendlies RearmFriendlies RefuelFriendlies RepairTime RehealTime RearmTime RefuelTime MaintenanceRadius Damaged Planes Chart`,
);
ty(
  13,
  'Flag',
  [...OBJ, ...f('Country:u32 StartHeight:f32 SpeedFactor:f32 BlockThreshold:f32 Radius:f64 Type:u32 CountPlanes:u8 CountVehicles:u8 Script:str')],
  `Name Index LinkTrId ${POS} Model Desc Script Country StartHeight SpeedFactor BlockThreshold Radius Type CountPlanes CountVehicles`,
);
ty(10, 'Effect', [...OBJ, ['Script', 'str']], `Name Index LinkTrId ${POS} Script Model Desc`);
ty(
  11,
  'Aerostat',
  [
    ...OBJ,
    ...f(
      'Country:u32 Vulnerable:u8 Engageable:u8 LimitAmmo:u8 DeleteAfterDeath:u8 AILevel:u32 StartInAir:u8 DamageReport:u32 DamageThreshold:u8 _a1:f64 Fuel:f32 PayloadId:u32 Script:str _tail:aerotail',
    ),
  ],
  `Name Index LinkTrId ${POS} Script Model Desc Skin Country Vulnerable Engageable LimitAmmo DeleteAfterDeath AILevel StartInAir DamageReport DamageThreshold Fuel PayloadId Radius Callnum`,
);
ty(6, 'Group', f('Name:name Desc:desc _x:i32 _children:u32'), 'Name Index Desc');

ty(41, 'MCU_Timer', [...MCU, ...f('Time:f64 Random:u8')], `${MCUT} Time Random`);
ty(42, 'MCU_Waypoint', [...MCU, ...f('Area:f64 Speed:f64 Priority:u32')], `${MCUT} Area Speed Priority`);
ty(28, 'MCU_TR_MissionBegin', MCU, `${MCUT} Enabled`);
ty(29, 'MCU_TR_MissionEnd', [...MCU, ['Succeeded', 'u8']], `${MCUT} Enabled Succeeded`);
ty(44, 'MCU_Activate', MCU, MCUT);
ty(45, 'MCU_Deactivate', MCU, MCUT);
ty(50, 'MCU_Delete', MCU, MCUT);
ty(30, 'MCU_TR_Entity', [...MCU, ...f('OnEvents:events MisObjID:u32 OnReports:reports')], `${MCUT} Enabled MisObjID OnEvents OnReports`);
ty(19, 'MCU_CMD_Formation', [...MCU, ...f('FormationType:u32 FormationDensity:u32')], `${MCUT} FormationType FormationDensity`);
ty(16, 'MCU_CMD_Land', [...MCU, ['Priority', 'u32']], `${MCUT} Priority`);
ty(15, 'MCU_CMD_TakeOff', [...MCU, ['NoTaxiTakeoff', 'u32']], `${MCUT} NoTaxiTakeoff`);
ty(24, 'MCU_CMD_ForceComplete', [...MCU, ...f('Priority:u32 EmergencyOrdnanceDrop:u8')], `${MCUT} Priority EmergencyOrdnanceDrop`);
ty(18, 'MCU_CMD_Damage', [...MCU, ...f('Type:u32 Damage:u32')], `${MCUT} Damage Type`);
ty(
  20,
  'MCU_CMD_AttackArea',
  [...MCU, ...f('AttackArea:f64 AttackGround:u8 AttackAir:u8 AttackGTargets:u8 Time:u32 Priority:u32')],
  `${MCUT} AttackGround AttackAir AttackGTargets AttackArea Time Priority`,
);
ty(
  22,
  'MCU_CMD_Behaviour',
  [...MCU, ...f('Filter:u32 Vulnerable:u8 Engageable:u8 LimitAmmo:u8 RepairFriendlies:u8 RehealFriendlies:u8 RearmFriendlies:u8 RefuelFriendlies:u8 AILevel:u32 Country:u32 FloatParam:f32')],
  `${MCUT} Filter Vulnerable Engageable LimitAmmo RepairFriendlies RehealFriendlies RearmFriendlies RefuelFriendlies AILevel Country FloatParam`,
);
ty(46, 'MCU_CheckZone', [...MCU, ...f('Zone:f64 Cylinder:u8 Closer:u8 PlaneCoalitions:list VehicleCoalitions:list')], `${MCUT} Zone Cylinder Closer PlaneCoalitions VehicleCoalitions`);
ty(43, 'MCU_Counter', [...MCU, ...f('Counter:u32 Dropcount:u8')], `${MCUT} Counter Dropcount`);
ty(
  35,
  'MCU_Icon',
  [...MCU, ...f('IconId:u32 RColor:u32 GColor:u32 BColor:u32 LineType:u32 LCName:i32 LCDesc:i32 Coalitions:list')],
  `Index Targets Objects ${POS} Enabled LCName LCDesc IconId RColor GColor BColor LineType Coalitions`,
);
ty(
  36,
  'MCU_TR_MissionObjective',
  [...MCU, ...f('LCName:i32 LCDesc:i32 TaskType:u32 Coalition:u32 Success:u8 IconType:i32')],
  `Index Targets Objects ${POS} Enabled LCName LCDesc TaskType Coalition Success IconType`,
);
ty(33, 'MCU_TR_Subtitle', [...MCU, ...f('SubtitleInfo:subtitle Coalitions:list')], `${MCUT} Enabled SubtitleInfo Coalitions`);
ty(
  40,
  'MCU_TR_ComplexTrigger',
  [...MCU, ...f('OnEvents:events Cylinder:u8 Radius:f64 DamageReport:u32 DamageThreshold:u8 CheckVehicles:u8 CheckPlanes:u8 _events:u32 Country:list ObjectScript:strs ObjectName:strs')],
  `${MCUT} Enabled Enabled Cylinder Radius DamageThreshold DamageReport CheckVehicles CheckPlanes _events Country ObjectScript ObjectName OnEvents`,
);
ty(37, 'MCU_TR_InfluenceArea', [...MCU, ...f('Country:u32 Boundary:boundary')], `${MCUT} Enabled Country Boundary`);
ty(
  38,
  'MCU_TR_AI_Poi',
  [...MCU, ...f('Country:u32 AttractVehicles:u8 AttractPlanes:u8 AttackAir:u8 AttackGTargets:u8 AttackGround:u8 Priority:u32 Radius:f64 Type:u32')],
  `${MCUT} Enabled Enabled Country Priority AttractVehicles AttractPlanes AttackGround AttackAir AttackGTargets Radius Type`,
);
ty(
  31,
  'MCU_TR_CameraOperator',
  [...MCU, ...f('OnEvents:events Speed:f64 FOV:f64 FirstId:i32 SecondId:i32 LockView:u8 CameraType:u32 Config:str Coalitions:list')],
  `${MCUT} Enabled Speed FOV FirstId SecondId LockView CameraType Config Coalitions`,
);
ty(32, 'MCU_TR_AnimationOperator', [...MCU, ...f('OnEvents:events Speed:f64 ConfigIsFile:u8 Config:str SoundConfig:str')], `${MCUT} Enabled Speed ConfigIsFile Config SoundConfig`);
ty(21, 'MCU_CMD_PlayAnimation', [...MCU, ['AnimationName', 'str']], `${MCUT} AnimationName`);
ty(60, 'MCU_ModifierSetVal', [...MCU, ...f('ParamIndex:u32 Data0:f32 Data1:f32 Data2:f32 Data3:f32')], `${MCUT} ParamIndex Data0 Data1 Data2 Data3`);
ty(59, 'MCU_ModifierAddVal', [...MCU, ...f('ParamIndex:u32 Data0:f32 Data1:f32 Data2:f32 Data3:f32')], `${MCUT} ParamIndex Data0 Data1 Data2 Data3`);
ty(48, 'MCU_Spawner', [...MCU, ['SpawnAtMe', 'u8']], `${MCUT} SpawnAtMe`);
ty(26, 'MCU_CMD_Effect', [...MCU, ['ActionType', 'u32']], `${MCUT} ActionType`);
ty(27, 'MCU_CMD_Flare', [...MCU, ['Color', 'u32']], `${MCUT} Color`);
ty(14, 'MCU_CMD_AttackTarget', [...MCU, ...f('AttackGroup:u8 Priority:u32')], `${MCUT} AttackGroup Priority`);
ty(25, 'MCU_CMD_Cover', [...MCU, ...f('CoverGroup:u8 Priority:u32')], `${MCUT} CoverGroup Priority`);
ty(17, 'MCU_CMD_Move', MCU, MCUT);
ty(23, 'MCU_CMD_PlaySound', [...MCU, ...f('SoundName:str Volume:f32')], `${MCUT} SoundName Volume`);
ty(39, 'MCU_TR_NextMission', [...MCU, ['NextMissionName', 'str']], `${MCUT} NextMissionName`);
ty(58, 'MCU_TR_ServerInput', MCU, MCUT);
ty(47, 'MCU_CameraPoint', [...MCU, ...f('Speed:f64 FOV:f64')], `${MCUT} Speed FOV`);
ty(52, 'MCU_H_ReferencePoint', [...MCU, ...f('Forward:f64 Backward:f64 Left:f64 Right:f64')], `${MCUT} Forward Backward Left Right`);
ty(57, 'MCU_H_PresetDescription', [...MCU, ...f('PresetType:u32 LCText:i32')], `${MCUT} PresetType LCText`);
ty(56, 'MCU_H_Dynamic', [...MCU, ['Property', 'strs']], `${MCUT} Property`);
ty(55, 'MCU_H_Extended', [...MCU, ['Order', 'u32']], `${MCUT} Order`);
ty(53, 'MCU_H_Input', MCU, MCUT);
ty(54, 'MCU_H_Output', MCU, MCUT);
ty(51, 'MCU_DateTime', [...MCU, ...f('DateTimeType:u32 _date:date3 _time:time3 _dt:u32')], `${MCUT} Enabled DateTimeType Date Time`);
ty(49, 'MCU_Proximity', [...MCU, ...f('Distance:u32 Closer:u8 PlaneCoalitions:list VehicleCoalitions:list')], `${MCUT} Distance Closer PlaneCoalitions VehicleCoalitions`);
ty(
  34,
  'MCU_TR_Media',
  [...MCU, ...f('OnEvents:events TotalTime:f32 ExpandTime:f32 FadeTime:f32 Opacity:u32 RColor:u32 GColor:u32 BColor:u32 MediaType:u32 Config:str')],
  `${MCUT} Enabled MediaType TotalTime ExpandTime FadeTime Opacity RColor GColor BColor Config OnEvents`,
);

/** Which fields are kept as 32-bit floats (written with the fewest digits that give the same float). */
const F32 = new Set<string>();
for (const d of TYPES.values()) for (const [k, e] of d.fields) if (e === 'f32') F32.add(`${d.cls}.${k}`);

type Value = number | string | null | number[] | string[] | number[][] | Record<string, number | string> | Record<string, number | string>[];

export interface Il2BinRecord {
  cls: string;
  code: number;
  index: number;
  pos: [number, number, number];
  /** Degrees. */
  ori: [number, number, number];
  /** Nesting: 0 at the top, 1 in a group, ... */
  depth: number;
  fields: Record<string, Value>;
}

export interface Il2BinOptions {
  version: number;
  /** The file carries a check value (written by a newer resaver). */
  checked: boolean;
  values: Record<string, number | string | string[] | number[][]>;
}

export interface Il2BinMission {
  options: Il2BinOptions;
  records: Il2BinRecord[];
}

/** An `.msnbin` by its first bytes: a known version, and the map's height file named early on. */
export function isIl2Binary(bytes: Uint8Array): boolean {
  if (bytes.length < 48) return false;
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ver = v.getUint32(0, true) & 0x7fffffff;
  if (ver < 20 || ver > 60) return false;
  const n = v.getUint32(36, true);
  if (n < 4 || n > 400 || 40 + n > bytes.length) return false;
  let s = '';
  for (let i = 40; i < 40 + Math.min(n, 9); i++) s += String.fromCharCode(bytes[i]);
  return s.toLowerCase() === 'graphics\\'.slice(0, Math.min(n, 9));
}

function readOptions(r: Reader): Il2BinOptions {
  const h: number[] = [];
  for (let i = 0; i < 9; i++) h.push(r.u32());
  const version = h[0] & 0x7fffffff;
  if (version < 20 || version > 60) throw new Error(`not an IL-2 binary mission (version ${version})`);
  const o: Il2BinOptions['values'] = {
    MissionType: h[1],
    AqmId: h[2],
    Date: `${h[3]}.${h[4]}.${h[5]}`,
    Time: `${h[8]}:${h[7]}:${h[6]}`,
  };
  for (const k of ['HMap', 'Textures', 'Forests', 'Layers', 'GuiMap', 'SeasonPrefix']) o[k] = r.str();
  o.LCName = r.u32();
  o.LCAuthor = r.u32();
  o.LCDesc = r.u32();
  o.PlayerConfig = r.str();
  o.MultiplayerPlaneConfig = r.strs();
  for (const k of ['CloudLevel', 'CloudHeight', 'PrecLevel', 'PrecType']) o[k] = r.u32();
  for (const k of ['Turbulence', 'TempPressLevel', 'Temperature', 'Pressure']) o[k] = r.f64();
  if (version >= 30) {
    o.Haze = r.f64();
    o.LayerFog = r.u32();
  }
  o.CloudConfig = r.str();
  o.SeaState = r.u32();
  const wind: number[][] = [];
  for (let i = r.u32(); i > 0; i--) wind.push([r.f64(), r.f64(), r.f64()]);
  o.WindLayers = wind;
  const countries: number[][] = [];
  for (let i = r.u32(); i > 0; i--) countries.push([r.u32(), r.u32()]);
  o.Countries = countries;
  return { version, checked: h[0] >>> 31 === 1, values: o };
}

interface Tables {
  strings: string[][];
  damaged: [number, number][][];
}

function readTables(r: Reader): Tables {
  const count = r.u32();
  if (count !== 6) throw new Error(`not an IL-2 binary mission: ${count} tables`);
  r.o += 3;
  const strings: string[][] = [];
  const damaged: [number, number][][] = [];
  for (let t = 0; t < count; t++) {
    const size = r.u32();
    const n = r.u16();
    if (t === 5) {
      if (!n) continue;
      const free = r.u32();
      r.need(free * 2);
      r.o += free * 2;
      r.need(n * (1 + 2 * size));
      for (let i = 0; i < n; i++) {
        const k = r.u8();
        const pairs: [number, number][] = [];
        for (let j = 0; j < k && j < size; j++) pairs.push([r.b[r.o + 2 * j], r.b[r.o + 2 * j + 1]]);
        r.o += 2 * size;
        damaged.push(pairs);
      }
      continue;
    }
    if (size < 1 || size > 4096) throw new Error('not an IL-2 binary mission: a bad string table');
    r.need(2 * n + n * size);
    r.o += 2 * n;
    const rows: string[] = [];
    for (let i = 0; i < n; i++) {
      const a = r.o + i * size;
      let e = a;
      while (e < a + size && r.b[e] !== 0) e++;
      rows.push(r.chars(a, e));
    }
    r.o += n * size;
    strings.push(rows);
  }
  return { strings, damaged };
}

/** A record starts at `p` (type, index and three sane positions). */
function plausible(b: Uint8Array, p: number): boolean {
  if (p + 38 > b.length) return false;
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  if (!TYPES.has(v.getUint32(p, true)) || v.getUint32(p + 4, true) > 50_000_000) return false;
  for (let i = 0; i < 3; i++) {
    const x = v.getFloat64(p + 8 + 8 * i, true);
    if (!Number.isFinite(x) || Math.abs(x) > 1e8) return false;
  }
  return true;
}

const TABLE: Record<string, number> = {
  name: 0,
  desc: 1,
  model: 2,
  skin: 3,
  script: 4,
};

function readField(r: Reader, enc: Enc, t: Tables, version: number): Value {
  switch (enc) {
    case 'u8':
    case 'u16':
    case 'u32':
    case 'i32':
    case 'f32':
    case 'f64':
    case 'str':
    case 'list':
    case 'strs':
      return r[enc]();
    case 'tstr':
      return version >= 30 ? r.str() : null;
    case 'name':
    case 'desc':
    case 'model':
    case 'skin':
    case 'script': {
      const i = r.i16();
      if (i < 0) return null;
      const row = t.strings[TABLE[enc]]?.[i];
      if (row === undefined) throw new Error(`not an IL-2 binary mission: no ${enc} ${i}`);
      return row;
    }
    case 'damaged': {
      const i = r.i16();
      if (i < 0) return null;
      const d = t.damaged[i];
      if (!d) throw new Error(`not an IL-2 binary mission: no damage state ${i}`);
      return d;
    }
    case 'dur':
      return r.u8() * 500;
    case 'flags':
      return r.u8();
    case 'events': {
      const out: number[][] = [];
      for (let i = r.u32(); i > 0; i--) out.push([r.u32(), r.u32()]);
      return out;
    }
    case 'reports': {
      // Stored as type, target, command; written as Type, CmdId, TarId.
      const out: number[][] = [];
      for (let i = r.u32(); i > 0; i--) {
        const type = r.u32();
        const tar = r.u32();
        out.push([type, r.u32(), tar]);
      }
      return out;
    }
    case 'subtitle':
      return {
        Duration: r.f32(),
        FontSize: r.u16(),
        HAlign: r.u16(),
        VAlign: r.u16(),
        RColor: r.u8(),
        GColor: r.u8(),
        BColor: r.u8(),
        LCText: r.u32(),
      };
    case 'boundary': {
      const out: number[][] = [];
      for (let i = r.u32(); i > 0; i--) out.push([r.f64(), r.f64()]);
      return out;
    }
    case 'chart': {
      const out: number[][] = [];
      for (let i = r.u32(); i > 0; i--) out.push([r.u32(), r.f64(), r.f64()]);
      return out;
    }
    case 'planes': {
      const out: Record<string, number | string>[] = [];
      for (let i = r.u32(); i > 0; i--) {
        const p: Record<string, number | string> = {};
        for (const k of ['SetIndex', 'Number', 'AILevel', 'StartInAir']) p[k] = r.i32();
        for (const k of ['Callsign', 'Callnum', 'Engageable', 'Vulnerable', 'LimitAmmo', 'AIRTBDecision', 'Renewable']) p[k] = r.u8();
        p.PayloadId = r.u32();
        p.WMMask = r.u32();
        p.Fuel = r.f32();
        p.RouteTime = r.u32();
        p.RenewTime = r.u32();
        p.Altitude = r.f64();
        p.Spotter = r.i32();
        for (const k of ['Model', 'Script', 'Name', 'Skin', 'AvMods', 'AvSkins', 'AvPayloads']) p[k] = r.str();
        // Three numbers the editor's text of this version does not hold (3, 0, -1 in every file seen).
        r.i32();
        r.i32();
        r.i32();
        if (version >= 30) {
          p.TCode = r.str();
          p.TCodeColors = r.str();
        }
        out.push(p);
      }
      return out;
    }
    case 'date3':
    case 'time3':
      return [r.u32(), r.u32(), r.u32()];
    case 'aerotail':
      // Older files end the record with the script; newer ones go on with a radius and a call number.
      if (plausible(r.b, r.o) || r.o === r.b.length || r.o === r.b.length - 4) return null;
      {
        const radius = r.f64();
        r.u32();
        const callnum = r.u8();
        r.u8();
        r.u16();
        return { Radius: radius, Callnum: callnum };
      }
  }
}

/** Reads an `.msnbin` to its last byte; throws (saying where) on anything it does not know. */
export function readIl2Binary(bytes: Uint8Array): Il2BinMission {
  const r = new Reader(bytes);
  const options = readOptions(r);
  const tables = readTables(r);
  if (options.checked) r.u32();
  const records: Il2BinRecord[] = [];
  const record = (depth: number) => {
    const at = r.o;
    const code = r.u32();
    const def = TYPES.get(code);
    if (!def) throw new Error(`an IL-2 binary mission with an object of a kind not known here (type ${code} at byte ${at})`);
    const index = r.u32();
    const pos: [number, number, number] = [r.f64(), r.f64(), r.f64()];
    const ori: [number, number, number] = [r.u16() * 0.006, r.u16() * 0.006, r.u16() * 0.006];
    const fields: Record<string, Value> = {};
    for (const [k, enc] of def.fields) fields[k] = readField(r, enc, tables, options.version);
    if (typeof fields._flags === 'number') {
      fields.DeleteAfterDeath = fields._flags & 1;
      fields.DamageThreshold = (fields._flags >> 1) & 1;
    }
    records.push({ cls: def.cls, code, index, pos, ori, depth, fields });
    if (def.cls === 'Group') for (let i = fields._children as number; i > 0; i--) record(depth + 1);
  };
  for (let n = r.u32(); n > 0; n--) record(0);
  const rest = bytes.length - r.o;
  if (rest !== 0 && !(options.checked && rest === 4)) throw new Error(`an IL-2 binary mission with ${rest} bytes after its last object`);
  return { options, records };
}

// ---------------------------------------------------------------------------
// The text form

/** A double as short as gives it back. */
const f64s = (v: number) => (Number.isInteger(v) && Math.abs(v) < 1e15 ? String(v) : String(v));
/** A 32-bit float in the fewest digits that give the same float. */
function f32s(v: number): string {
  if (Number.isInteger(v) && Math.abs(v) < 1e9) return String(v);
  for (let p = 1; p <= 9; p++) {
    const s = String(Number(v.toPrecision(p)));
    if (Math.fround(Number(s)) === v) return s;
  }
  return String(v);
}
/** A tactical code as the editor writes it: anything but letters and digits as %XX. */
const tcode = (s: string) => s.replace(/[^A-Za-z0-9]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`);
/** A quoted string; the text form has no escapes, and the resaver does not load an "@". */
const q = (s: string) =>
  `"${s
    .replace(/@/g, 'at')
    .replace(/"/g, "'")
    .replace(/[\r\n]+/g, ' ')}"`;
const wm = (v: number) => (v ? v.toString(2) : '0');

const EVENTS = [
  'Spawned',
  'EnteredSimple',
  'EnteredAlive',
  'LeftSimple',
  'LeftAlive',
  'FinishedSimple',
  'FinishedAlive',
  'StationaryAndAlive',
  'FinishedStationaryAndAlive',
  'TookOff',
  'Damaged',
  'CriticallyDamaged',
  'Repaired',
  'Killed',
  'DropedBombs',
  'FiredRockets',
  'FiredFlare',
  'DroppedCargoContainers',
  'DeliveredCargo',
  'ParatrooperJumped',
  'ParatrooperLandedAlive',
];

const PLANE_KEYS = [
  'SetIndex',
  'Number',
  'AILevel',
  'StartInAir',
  'Engageable',
  'Vulnerable',
  'LimitAmmo',
  'AIRTBDecision',
  'Renewable',
  'PayloadId',
  'WMMask',
  'Fuel',
  'RouteTime',
  'RenewTime',
  'Altitude',
  'Spotter',
  'Model',
  'Script',
  'Name',
  'Skin',
  'AvMods',
  'AvSkins',
  'AvPayloads',
  'Callsign',
  'Callnum',
  'TCode',
  'TCodeColors',
];
const PLANE_STRINGS = new Set(['Model', 'Script', 'Name', 'Skin', 'AvMods', 'AvSkins', 'AvPayloads', 'TCodeColors']);
/** Lists the resaver does not load when they are empty. */
const OMIT_EMPTY = new Set(['PlaneCoalitions', 'VehicleCoalitions', 'Coalitions']);

function emitRecord(rec: Il2BinRecord, ind: string, out: string[]) {
  const def = TYPES.get(rec.code)!;
  const fl = rec.fields;
  const i2 = `${ind}  `;
  const kv = (k: string, v: string | number) => out.push(`${i2}${k} = ${v};`);
  const sub = (name: string, lines: string[]) => out.push(`${i2}${name}`, `${i2}{`, ...lines.map((l) => `${i2}  ${l}`), `${i2}}`);
  out.push(`${ind}${def.cls}`, `${ind}{`);
  for (const k of def.text) {
    if (k === 'Index') {
      kv(k, rec.index);
      continue;
    }
    const p = ['XPos', 'YPos', 'ZPos'].indexOf(k);
    if (p >= 0) {
      kv(k, f64s(rec.pos[p]));
      continue;
    }
    const o = ['XOri', 'YOri', 'ZOri'].indexOf(k);
    if (o >= 0) {
      kv(k, rec.ori[o].toFixed(3));
      continue;
    }
    if (def.cls === 'MCU_DateTime' && (k === 'Date' || k === 'Time')) {
      const d = fl[k === 'Date' ? '_date' : '_time'] as number[];
      kv(k, k === 'Date' ? `${d[0]}.${d[1]}.${d[2]}` : `${d[2]}:${d[1]}:${d[0]}`);
      continue;
    }
    if (def.cls === 'Aerostat' && (k === 'Radius' || k === 'Callnum')) {
      const tail = fl._tail as Record<string, number> | null;
      if (tail) kv(k, k === 'Radius' ? f64s(tail.Radius) : tail.Callnum);
      else if (k === 'Radius') kv(k, f64s(fl._a1 as number));
      continue;
    }
    if (!(k in fl)) continue;
    const v = fl[k];
    if (v === null) continue;
    switch (k) {
      case 'Damaged':
        sub(
          'Damaged',
          (v as number[][]).map(([part, d]) => `${part} = ${d === 0 || d === 255 ? d / 255 : f32s(Math.round((d / 255) * 1e6) / 1e6)};`),
        );
        continue;
      case 'TCode':
        kv(k, q(tcode(v as string)));
        continue;
      case 'WMMask':
        kv(k, wm(v as number));
        continue;
      case '_events':
        EVENTS.forEach((e, j) => kv(`EventsFilter${e}`, ((v as number) >>> j) & 1));
        continue;
      case 'ObjectScript':
      case 'ObjectName':
      case 'Property':
        for (const s of v as string[]) kv(k, q(s));
        continue;
      case 'Carriages':
        sub(
          k,
          (v as string[]).map((s) => `${q(s)};`),
        );
        continue;
      case 'OnEvents':
        if ((v as number[][]).length)
          sub(
            k,
            (v as number[][]).flatMap(([type, tar]) => ['OnEvent', '{', `  Type = ${type};`, `  TarId = ${tar};`, '}']),
          );
        continue;
      case 'OnReports':
        if ((v as number[][]).length)
          sub(
            k,
            (v as number[][]).flatMap(([type, cmd, tar]) => ['OnReport', '{', `  Type = ${type};`, `  CmdId = ${cmd};`, `  TarId = ${tar};`, '}']),
          );
        continue;
      case 'SubtitleInfo': {
        const s = v as Record<string, number>;
        sub(
          k,
          ['Duration', 'FontSize', 'HAlign', 'VAlign', 'RColor', 'GColor', 'BColor', 'LCText'].map((x) => `${x} = ${x === 'Duration' ? f32s(s[x]) : s[x]};`),
        );
        continue;
      }
      case 'Boundary':
        sub(
          k,
          (v as number[][]).map(([x, z]) => `${f64s(x)}, ${f64s(z)};`),
        );
        continue;
      case 'Chart':
        sub(
          k,
          (v as number[][]).flatMap(([type, x, y]) => ['Point', '{', `  Type = ${type};`, `  X = ${f64s(x)};`, `  Y = ${f64s(y)};`, '}']),
        );
        continue;
      case 'Planes':
        sub(
          k,
          (v as Record<string, number | string>[]).flatMap((pl) => [
            'Plane',
            '{',
            ...PLANE_KEYS.filter((x) => x in pl).map((x) => {
              const pv = pl[x];
              const s =
                x === 'TCode'
                  ? q(tcode(pv as string))
                  : PLANE_STRINGS.has(x)
                    ? q(pv as string)
                    : x === 'WMMask'
                      ? wm(pv as number)
                      : x === 'Fuel'
                        ? f32s(pv as number)
                        : x === 'Altitude'
                          ? f64s(pv as number)
                          : String(pv);
              return `  ${x} = ${s};`;
            }),
            '}',
          ]),
        );
        continue;
    }
    if (Array.isArray(v)) {
      if (k === 'Country') {
        for (const c of v as number[]) kv(k, c);
        continue;
      }
      if (!v.length && OMIT_EMPTY.has(k)) continue;
      kv(k, `[${(v as number[]).join(',')}]`);
      continue;
    }
    if (typeof v === 'string') kv(k, q(v));
    else if (typeof v === 'number') kv(k, F32.has(`${def.cls}.${k}`) ? f32s(v) : Number.isInteger(v) ? v : f64s(v));
  }
  out.push(`${ind}}`);
}

/** The mission in the editor's text form (CRLF lines, as the editor saves it). */
export function il2BinaryToText(m: Il2BinMission): string {
  const o = m.options.values;
  const out = ['# Mission File Version = 1.0;', '', 'Options', '{'];
  const kv = (k: string, v: string | number) => out.push(`  ${k} = ${v};`);
  kv('LCName', o.LCName as number);
  kv('LCDesc', o.LCDesc as number);
  kv('LCAuthor', o.LCAuthor as number);
  kv('PlayerConfig', q(o.PlayerConfig as string));
  for (const s of o.MultiplayerPlaneConfig as string[]) kv('MultiplayerPlaneConfig', q(s));
  kv('Time', o.Time as string);
  kv('Date', o.Date as string);
  for (const k of ['HMap', 'Textures', 'Forests', 'Layers', 'GuiMap', 'SeasonPrefix']) kv(k, q(o[k] as string));
  for (const k of ['MissionType', 'AqmId', 'CloudLevel', 'CloudHeight', 'PrecLevel', 'PrecType']) kv(k, o[k] as number);
  kv('CloudConfig', q(o.CloudConfig as string));
  kv('SeaState', o.SeaState as number);
  for (const k of ['Turbulence', 'TempPressLevel', 'Temperature', 'Pressure', 'Haze']) if (k in o) kv(k, f64s(o[k] as number));
  if ('LayerFog' in o) kv('LayerFog', o.LayerFog as number);
  out.push('  WindLayers', '  {', ...(o.WindLayers as number[][]).map(([h, d, s]) => `    ${f64s(h)} :     ${f64s(d)} :     ${f64s(s)};`), '  }');
  out.push('  Countries', '  {', ...(o.Countries as number[][]).map(([c, k]) => `    ${c} : ${k};`), '  }');
  out.push('}', '');
  const open: number[] = [];
  for (const rec of m.records) {
    while (open.length && open[open.length - 1] >= rec.depth) out.push(`${'  '.repeat(open.pop()!)}}`, '');
    const ind = '  '.repeat(rec.depth);
    if (rec.cls === 'Group') {
      out.push(
        `${ind}Group`,
        `${ind}{`,
        `${ind}  Name = ${q((rec.fields.Name as string | null) ?? '')};`,
        `${ind}  Index = ${rec.index};`,
        `${ind}  Desc = ${q((rec.fields.Desc as string | null) ?? '')};`,
      );
      open.push(rec.depth);
      continue;
    }
    emitRecord(rec, ind, out);
    out.push('');
  }
  while (open.length) out.push(`${'  '.repeat(open.pop()!)}}`);
  out.push('', '# end of file');
  return `${out.join('\r\n')}\r\n`;
}

/** An `.msnbin` as the editor's text: read whole, then written out. */
export function il2BinaryText(bytes: Uint8Array): string {
  return il2BinaryToText(readIl2Binary(bytes));
}

/** Why a plan is not written back as `.msnbin` (the text `.Mission` is, which the editor and resaver load). */
export const IL2_BINARY_REFUSAL =
  "not written as .msnbin: the newer files carry a check value whose making is not known, and the string tables keep use counts the game may check; saved as the editor's text .Mission, which the mission editor opens and the game's resaver makes binary";
