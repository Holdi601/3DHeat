/**
 * The last row seen of each person in each match.
 *
 * Rows are sorted by time across the whole load, and on data that counts its time
 * from each match's start, someone who played three matches has them interleaved:
 * sample of match A, sample of match B, sample of match C, sample of match A. One
 * "last row" per person then always holds the wrong match, and hardly any row finds
 * its predecessor. A walk over the rows has to ask for the track, not the person.
 *
 * An open-addressed table, not a Map: this runs once per row, on hundreds of millions
 * of rows, over at most a few million tracks.
 */
export class TrackTable {
  /** How many tracks have been seen. A track's id is below this and never changes. */
  count = 0;
  /** By track id: the row last stored, -1 for none. Reallocated as tracks arrive: read it after `track`. */
  last: Int32Array;

  private mask: number;
  /** By hash slot: track id + 1, 0 for empty. */
  private slots: Int32Array;
  private persons: Int32Array;
  private sessions: Int32Array;

  constructor(expected = 1024) {
    const size = Math.max(16, expected);
    this.last = new Int32Array(size).fill(-1);
    this.persons = new Int32Array(size);
    this.sessions = new Int32Array(size);
    let cap = 16;
    while (cap < size * 2) cap *= 2;
    this.slots = new Int32Array(cap);
    this.mask = cap - 1;
  }

  /** The id of this person's track in this match, made on first sight. */
  track(person: number, session: number): number {
    const { slots, persons, sessions, mask } = this;
    let at = (Math.imul(person, 0x9e3779b1) ^ Math.imul(session, 0x85ebca6b)) & mask;
    for (;;) {
      const id = slots[at] - 1;
      if (id < 0) break;
      if (persons[id] === person && sessions[id] === session) return id;
      at = (at + 1) & mask;
    }
    const id = this.count++;
    if (id >= this.last.length) this.grow();
    this.persons[id] = person;
    this.sessions[id] = session;
    if (this.count * 2 > this.slots.length) {
      this.rehash();
    } else {
      slots[at] = id + 1;
    }
    return id;
  }

  private grow(): void {
    const size = this.last.length * 2;
    const last = new Int32Array(size).fill(-1);
    last.set(this.last);
    this.last = last;
    const persons = new Int32Array(size);
    persons.set(this.persons);
    this.persons = persons;
    const sessions = new Int32Array(size);
    sessions.set(this.sessions);
    this.sessions = sessions;
  }

  private rehash(): void {
    const cap = this.slots.length * 2;
    const slots = new Int32Array(cap);
    const mask = cap - 1;
    for (let id = 0; id < this.count; id++) {
      let at = (Math.imul(this.persons[id], 0x9e3779b1) ^ Math.imul(this.sessions[id], 0x85ebca6b)) & mask;
      while (slots[at] !== 0) at = (at + 1) & mask;
      slots[at] = id + 1;
    }
    this.slots = slots;
    this.mask = mask;
  }
}
