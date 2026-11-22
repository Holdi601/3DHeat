
struct Params { k : u32, first : u32, a : u32, b : u32 };
@group(0) @binding(0) var<uniform> p : Params;
@group(0) @binding(1) var<storage, read> col : array<f32>;
@group(0) @binding(2) var<storage, read> table : array<u32>;
@group(0) @binding(3) var<storage, read_write> bits : array<u32>;

// Ids one filter's mask holds. Enough for the person filter, whose ids are
// people and can run to tens of thousands.
const FILTER_MASK_CAPACITY : u32 = 65536u;

fn passes(v : f32) -> bool {
  let at = 4u + p.k * 4u;
  let mode = table[at];
  if (mode == 1u) { return v >= bitcast<f32>(table[at + 1u]) && v <= bitcast<f32>(table[at + 2u]); }
  // An id past the mask was never allowed.
  if (!(v >= 0.0)) { return false; }
  let c = u32(v);
  if (c >= min(table[at + 2u], FILTER_MASK_CAPACITY)) { return false; }
  return ((table[table[at + 3u] + (c >> 5u)] >> (c & 31u)) & 1u) == 1u;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) g : vec3<u32>) {
  let w = g.x;
  if (w >= arrayLength(&bits)) { return; }
  let rows = arrayLength(&col);
  var acc = 0u;
  for (var b = 0u; b < 32u; b++) {
    let row = w * 32u + b;
    if (row >= rows) { break; }
    if (passes(col[row])) { acc = acc | (1u << b); }
  }
  if (p.first == 1u) { bits[w] = acc; } else { bits[w] = bits[w] & acc; }
}
